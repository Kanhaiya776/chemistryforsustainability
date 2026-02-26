<?php

namespace Drupal\ggcp_message_customs\Plugin\WebformHandler;

use Drupal\webform\Plugin\WebformHandlerBase;
use Drupal\webform\WebformSubmissionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\simplenews\Entity\Subscriber;
use Drupal\simplenews\Entity\Newsletter;
use Drupal\user\Entity\User;

/**
 * Webform handler to manage Simplenews subscriptions and privacy preferences.
 *
 * @WebformHandler(
 *   id = "simplenews_handler",
 *   label = @Translation("Simplenews handler"),
 *   category = @Translation("Email"),
 *   description = @Translation("Manages newsletter subscriptions and user notification preferences.")
 * )
 */
class SimplenewsSubscribeHandler extends WebformHandlerBase {

  public function submitForm(
    array &$form,
    FormStateInterface $form_state,
    WebformSubmissionInterface $webform_submission
  ) {

    $data = $webform_submission->getData();

    $email = $data['email_contact'] ?? NULL;
    $newsletter_entity_ids = $data['email_subscriptions'] ?? [];
    $privacy_preferences = $data['privacy_preferences'] ?? [];

    if (!$email) {
      return;
    }

    $opt_out = (
      in_array('do_not_email', $privacy_preferences, TRUE) ||
      in_array('is_opt_out', $privacy_preferences, TRUE)
    );

    $current_user = \Drupal::currentUser();
    if ($current_user->isAuthenticated()) {
      $user = User::load($current_user->id());
      if ($user) {

        if ($user->hasField('field_do_not_email')) {
          $user->set('field_do_not_email',
            in_array('do_not_email', $privacy_preferences, TRUE) ? 1 : 0
          );
        }

        if ($user->hasField('field_no_marketing_emails')) {
          $user->set('field_no_marketing_emails',
            in_array('is_opt_out', $privacy_preferences, TRUE) ? 1 : 0
          );
        }

        if ($user->hasField('field_allow_direct_messaging')) {
          $user->set('field_allow_direct_messaging',
            !empty($data['allow_direct_messaging']) ? 1 : 0
          );
        }

        $this->setBooleanField($user, 'field_content_moderation_notifi', $data['my_submitted_content'] ?? NULL);
        $this->setBooleanField($user, 'field_forum_notifications', $data['forum_activity'] ?? NULL);
        $this->setBooleanField($user, 'field_group_content_notification', $data['group_content_added'] ?? NULL);
        $this->setBooleanField($user, 'field_comment_notifications', $data['comments'] ?? NULL);

        // if ($user->hasField('field_email_digest') && isset($data['email_digest'])) {
        //   $digest_value = is_array($data['email_digest']) ? reset($data['email_digest']) : $data['email_digest'];

        //   $digest_mapping = [
        //     'No digest' => '0',
        //     'Daily' => '1',
        //   ];

        //   $user->set('field_email_digest',
        //     $digest_mapping[$digest_value] ?? '0'
        //   );
        // }
        if ($user->hasField('field_email_digest')) {

          // If user selected Do Not Email, force N/A
          if (in_array('do_not_email', $privacy_preferences, TRUE)) {
            $user->set('field_email_digest', '_none'); // N/A
          }
          else {
            if (isset($data['email_digest'])) {

              $digest_value = is_array($data['email_digest'])
                ? reset($data['email_digest'])
                : $data['email_digest'];

              $digest_mapping = [
                'No digest' => '0',
                'Daily' => '1',
                'N/A' => '_none',
              ];

              $user->set('field_email_digest',
                $digest_mapping[$digest_value] ?? '0'
              );
            }
          }
        }


        $user->save();
      }
    }

    $subscriber = Subscriber::loadByMail($email);

    if (!$subscriber) {
      $subscriber = Subscriber::create([
        'mail' => $email,
        'status' => 1,
      ]);
    }

    if ($opt_out) {
      $subscriber->set('subscriptions', []);
      $subscriber->set('status', 0);
      $subscriber->save();
      return;
    }

    $current_subscriptions = [];
    foreach ($subscriber->get('subscriptions')->getValue() as $s) {
      $current_subscriptions[] = $s['target_id'];
    }

    $to_unsubscribe = array_diff($current_subscriptions, $newsletter_entity_ids);
    foreach ($to_unsubscribe as $nid) {
      $subscriber->unsubscribe($nid);
    }

    $to_subscribe = array_diff($newsletter_entity_ids, $current_subscriptions);
    $newsletters = Newsletter::loadMultiple($to_subscribe);

    foreach ($newsletters as $newsletter) {
      $subscriber->subscribe($newsletter->id());
    }

    $subscriber->set('status', !empty($newsletter_entity_ids) ? 1 : 0);
    $subscriber->save();
  }

  protected function setBooleanField($user, $field_name, $value) {
    if ($user->hasField($field_name)) {
      $user->set(
        $field_name,
        strtolower((string) $value) === 'enabled' ? 1 : 0
      );
    }
  }

  public function alterForm(
    array &$form,
    FormStateInterface $form_state,
    WebformSubmissionInterface $webform_submission
  ) {

    $current_user = \Drupal::currentUser();
    if (!$current_user->isAuthenticated()) {
      return;
    }

    $email = $current_user->getEmail();
    $subscriber = Subscriber::loadByMail($email);

    $subscriptions = [];

    if ($subscriber && $subscriber->isActive()) {
      foreach ($subscriber->get('subscriptions')->getValue() as $s) {
        $subscriptions[] = $s['target_id'];
      }
    }

    // ** 1. Force value in form array (for rendering) **
    $this->setFormElementValue($form, 'email_subscriptions', $subscriptions);

    // ** 2. Force value in webform submission (for existing submission) **
    $webform_submission->setData(array_merge($webform_submission->getData(), [
      'email_subscriptions' => $subscriptions,
    ]));

    // ** 3. Force value in form state **
    $form_state->setValue('email_subscriptions', $subscriptions);
  }

  /**
   * Find and set value for nested form elements.
   */
  protected function setFormElementValue(array &$form, $key, $value) {
    if (isset($form[$key])) {
      $form[$key]['#default_value'] = $value;
      return;
    }

    foreach ($form as &$element) {
      if (is_array($element)) {
        $this->setFormElementValue($element, $key, $value);
      }
    }
  }

  public function prePopulateData(WebformSubmissionInterface $webform_submission) {
    // Keep your old logic here if you want
  }

}

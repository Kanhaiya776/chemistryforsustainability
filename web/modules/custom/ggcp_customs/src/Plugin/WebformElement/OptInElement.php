<?php

namespace Drupal\ggcp_customs\Plugin\WebformElement;

use Drupal\user\Entity\User;
use Drupal\webform\Plugin\WebformElementBase;
use Drupal\webform\WebformSubmissionInterface;

/**
 * Provides a 'contact_enabled_element' Webform element.
 *
 * @WebformElement(
 *   id = "opt_in_element",
 *   label = @Translation("Contact Enabled Element"),
 *   description = @Translation("Provides a contact enabled element."),
 *   category = @Translation("Custom elements"),
 * )
 */
class OptInElement extends WebformElementBase {

  private const DEFAULT_DESCRIPTION = 'Allow other users to contact you via a personal contact form which keeps your email address hidden. Note that some privileged users such as site administrators are still able to contact you even if you choose to disable this feature.';

  /**
   * {@inheritdoc}
   */
  protected function defineDefaultProperties() {
    return [
      'default_value' => '',
    ] + parent::defineDefaultProperties();
  }

  /**
   * {@inheritdoc}
   */
  public function prepare(array &$element, ?WebformSubmissionInterface $webform_submission = NULL) {
    parent::prepare($element, $webform_submission);

    $account = \Drupal::currentUser();
    $account_data = \Drupal::service('user.data')->get('contact', $account->id(), 'enabled');

    $element['#type'] = 'checkbox';
    $element['#default_value'] = $account_data ?? \Drupal::config('contact.settings')->get('user_default_enabled');
    if (empty($element['#description']['#markup'])) {
      $element['#description'] = self::DEFAULT_DESCRIPTION;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function postSave(array &$element, WebformSubmissionInterface $webform_submission, $update = TRUE) {
    $account = \Drupal::currentUser();
    $webformData = $webform_submission->getData();
    if ($account->id() && isset($webformData[$element['#webform_key']])) {
      \Drupal::service('user.data')->set('contact', $account->id(), 'enabled', (int) $webformData[$element['#webform_key']]);
    }

    parent::postSave($element, $webform_submission, $update);
  }

  /**
   * {@inheritdoc}
   */
  public function postLoad(array &$element, WebformSubmissionInterface $webform_submission) {
    $account = \Drupal::currentUser();
    $webformData = $webform_submission->getData();
    if ($account->id() && isset($webformData[$element['#webform_key']])) {
      \Drupal::service('user.data')->set('contact', $account->id(), 'enabled', (int) $webformData[$element['#webform_key']]);
    }
    else {
      $email = $webformData['civicrm_1_contact_1_email_email'];

      $entityTypeManager = \Drupal::entityTypeManager();
      $userStorage = $entityTypeManager->getStorage('user');

      $userIds = $userStorage->getQuery()
        ->condition('mail', $email)
        ->accessCheck(FALSE)
        ->execute();

      if (!empty($userIds) && isset($webformData[$element['#webform_key']])) {
        $userId = reset($userIds);
        $user = User::load($userId);
        \Drupal::service('user.data')->set('contact', $user->id(), 'enabled', (int) $webformData[$element['#webform_key']]);
      }
    }

    parent::postLoad($element, $webform_submission);
  }

}

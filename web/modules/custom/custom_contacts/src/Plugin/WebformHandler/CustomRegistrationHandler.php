<?php

namespace Drupal\custom_contacts\Plugin\WebformHandler;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\webform\Plugin\WebformHandlerBase;
use Drupal\webform\WebformSubmissionInterface;
use Drupal\node\Entity\Node;

/**
 * Custom webform handler for user registration.
 *
 * @WebformHandler(
 *   id = "custom_registration_handler",
 *   label = @Translation("Custom Registration Handler"),
 *   category = @Translation("Registration"),
 *   description = @Translation("Handles user registration with organization creation."),
 *   cardinality = \Drupal\webform\Plugin\WebformHandlerInterface::CARDINALITY_SINGLE,
 *   results = \Drupal\webform\Plugin\WebformHandlerInterface::RESULTS_PROCESSED,
 *   submission = \Drupal\webform\Plugin\WebformHandlerInterface::SUBMISSION_REQUIRED,
 * )
 */
class CustomRegistrationHandler extends WebformHandlerBase {

  /**
   * {@inheritdoc}
   */
  public function postSave(WebformSubmissionInterface $webform_submission, $update = TRUE) {
    // Only run for new submissions.
    if ($update) {
      return;
    }

    $data = $webform_submission->getData();
    $user = $webform_submission->getOwner();

    if (!$user) {
      return;
    }

    \Drupal::logger('custom_contacts')->notice('Custom handler executed for user: @email', ['@email' => $data['email']]);

    // Handle organization creation and assignment.
    $organization_id = NULL;

    if (empty($data['no_organization'])) {
      if (!empty($data['create_new_org_checkbox']) && !empty($data['organization_name'])) {
        // Create new organization.
        if (!empty($data['academia_sub_sector'])) {
          $academia = $data['academia_sub_sector'];
        }
        elseif (!empty($data['government_sub_sector'])) {
          $government = $data['government_sub_sector'];
        }
        elseif (!empty($data['industry_sub_sector'])) {
          $industry = $data['industry_sub_sector'];
        }

        // Create new organization.
        $node = Node::create([
          'type' => 'organization',
          'title' => $data['organization_name'],
          'field_organization_acronym' => $data['organization_acronym'] ?? '',
          'field_state' => $data['organization_country'] ?? '',
          'field_sector_custom_select' => $data['sector'] ?? '',
          'academia_sub_sector' => $academia,
          'government_sub_sector' => $government,
          'industry_sub_sector' => $industry,
          'field_street_address'        => $data['street_address'],
          'field_street_address_line_2' => $data['street_address_line_2'],
          'field_city'                  => $data['city'],
          'field_state_province'        => $data['state_province'],
          'field_postal_code'           => $data['postal_code'],
          'field_organization_description' => $data['organization_description'],
          'field_organization_website'  => $data['organization_website'],
          'field_linkedin_profile'      => $data['linkedin_profile'],
          'field_facebook_profile'      => $data['facebook_profile'],
          'field_instagram_profile'     => $data['instagram_profile'],
          'field_wechat_profile'        => $data['wechat_profile'],
          'status' => 1,
        ]);
        $node->setOwnerId($user->id());
        $node->set('field_creator_user', ['target_id' => $user->id()]);
        $node->save();
        $organization_id = $node->id();

        \Drupal::logger('custom_contacts')->notice('Created new organization: @org', ['@org' => $data['organization_name']]);

        // Track as created_by relationship
        // $this->trackRelationship($user->id(), $organization_id, 'created_by');.
      }
      elseif (!empty($data['existing_organization'])) {
        $organization_id = $data['existing_organization'];
        // Track as affiliate_of relationship
        // $this->trackRelationship($user->id(), $organization_id, 'affiliate_of');.
      }

      // Assign organization to user.
      if ($organization_id) {
        $user->set('name', $data['first_name'] . " " . $data['last_name']);
        $user->set('field_organization', ['target_id' => $organization_id]);
        $user->save();
        \Drupal::logger('custom_contacts')->notice('Assigned organization @org_id to user @user', [
          '@org_id' => $organization_id,
          '@user' => $user->id(),
        ]);
      }
    }
  }

  /**
   * Track user-organization relationships.
   */
  private function trackRelationship($user_id, $organization_id, $relationship_type) {
    \Drupal::database()->insert('custom_contacts_relationships')
      ->fields([
        'user_id' => $user_id,
        'organization_id' => $organization_id,
        'relationship_type' => $relationship_type,
        'created' => \Drupal::time()->getRequestTime(),
      ])
      ->execute();
  }

}

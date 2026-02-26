<?php

namespace Drupal\custom_organization\Plugin\WebformHandler;

use Drupal\webform\Plugin\WebformHandlerBase;
use Drupal\webform\WebformSubmissionInterface;

/**
 * Sync webform "organization" data with Organization nodes.
 *
 * @WebformHandler(
 *   id = "organization_content_handler",
 *   label = @Translation("Organization Content Handler"),
 *   category = @Translation("Content"),
 *   description = @Translation("Creates or updates Organization nodes from the organization webform."),
 *   cardinality = \Drupal\webform\Plugin\WebformHandlerInterface::CARDINALITY_SINGLE,
 *   results = "processed",
 *   submission = "required",
 *   summary = FALSE
 * )
 */
class OrganizationContentHandler extends WebformHandlerBase {

  /**
   * {@inheritdoc}
   */
  public function postSave(WebformSubmissionInterface $submission, $update = TRUE) {
    $data = $submission->getData();

    // --- Webform values (adjust keys if needed) ---
    $title = $data['organization_name'] ?? 'Untitled';
    $acronym = $data['organization_acronym'] ?? '';
    $city = $data['city'] ?? '';
    $street_address = $data['street_address'] ?? '';
    $street_address_line_2 = $data['street_address_line_2'] ?? '';
    $postal_code = $data['custom_postal_code'] ?? '';
    $sector = $data['sector'] ?? '';

    // Advanced address element.
    $geo = $data['country_admin'] ?? [];
    // Try both possible keys for country code.
    $country_code = $geo['country_code'] ?? ($geo['country'] ?? '');
    $state_admin = $geo['administrative_area'] ?? '';
    $locality = $geo['locality'] ?? '';

    // Taxonomy term selects (tids).
    $academia_sub_sector = $data['field_academia_sub_sector'] ?? NULL;
    $academia_sub_sector = $academia_sub_sector !== '' ? (int) $academia_sub_sector : NULL;

    $government_sub_sector = $data['field_government_sub_sector'] ?? NULL;
    $government_sub_sector = $government_sub_sector !== '' ? (int) $government_sub_sector : NULL;

    $industry_sub_sector = $data['field_industry_sub_sector'] ?? NULL;
    $industry_sub_sector = $industry_sub_sector !== '' ? (int) $industry_sub_sector : NULL;

    // Startup boolean (radios).
    $startup_raw = $data['if_industry_is_the_company_a_startup'] ?? NULL;
    $is_startup = 0;
    if ($startup_raw !== NULL) {
      $val = is_string($startup_raw) ? strtolower($startup_raw) : $startup_raw;
      $is_startup = in_array($val, ['1', 1, 'yes', 'true'], TRUE) ? 1 : 0;
    }

    // Links from webform text fields.
    $website = $data['organization_website'] ?? '';
    $linkedin = $data['linkedin_profile'] ?? '';
    $facebook = $data['facebook_profile'] ?? '';
    $instagram = $data['instagram_profile'] ?? '';
    $wechat = $data['wechat_profile'] ?? '';

    $description = $data['organization_description'] ?? '';

    // For syncing submission ID.
    $webform_sync = $submission->id();

    $request = \Drupal::request();
    $source_id = $request->query->get('source_entity_id');
    $node_storage = \Drupal::entityTypeManager()->getStorage('node');

    // Update existing organization node.
    if ($source_id) {
      $node = $node_storage->load($source_id);

      if ($node && $node->bundle() === 'organization') {
        $node->setTitle($title);
        $node->set('field_organization_acronym', $acronym);
        $node->set('field_city', $city);
        $node->set('field_street_address', $street_address);
        $node->set('field_street_address_line_2', $street_address_line_2);
        $node->set('field_postal_code', $postal_code);
        $node->set('field_sector_custom_select', $sector);

        if ($country_code) {
          $node->set('field_state', $country_code);
        }

        // Optional: fill address field_state from advanced address.
        $node->set('field_state', [
          [
            'country_code' => $country_code ?: NULL,
            'administrative_area' => $state_admin ?: NULL,
            'locality' => $locality ?: NULL,
            'postal_code' => $postal_code ?: NULL,
            'address_line1' => $street_address ?: NULL,
            'address_line2' => $street_address_line_2 ?: NULL,
          ],
        ]);

        $logo_fid = $data['add_update_organization_logo'] ?? NULL;

        if (!empty($logo_fid)) {
          // Convert single value to array if needed.
          $logo_fid = is_array($logo_fid) ? reset($logo_fid) : $logo_fid;

          if ($file = \Drupal\file\Entity\File::load($logo_fid)) {
            $file->setPermanent();
            $file->save();
            $node->set('field_add_update_org_logo', [
              'target_id' => $file->id(),
            ]);
          }
        }

        // Taxonomy references.
        $node->set('field_academia_sub_sector', $academia_sub_sector);
        $node->set('field_government_sub_sector', $government_sub_sector);
        $node->set('field_industry_sub_sector', $industry_sub_sector);

        // Startup boolean.
        $node->set('field_startup_company', $is_startup);

        // Links.
        if (!empty($website)) {
          $node->set('field_organization_website', ['uri' => $website]);
        }
        if (!empty($linkedin)) {
          $node->set('field_linkedin_profile', ['uri' => $linkedin]);
        }
        if (!empty($facebook)) {
          $node->set('field_facebook_profile', ['uri' => $facebook]);
        }
        if (!empty($instagram)) {
          $node->set('field_instagram_profile', ['uri' => $instagram]);
        }
        if (!empty($wechat)) {
          $node->set('field_wechat_profile', ['uri' => $wechat]);
        }

        // Description.
        $node->set('field_organization_description', $description);

        // Webform sync.
        $node->set('field_webform_sync', $webform_sync);
        $node->setNewRevision(TRUE);
        $node->setRevisionTranslationAffected(TRUE);
        $node->setRevisionLogMessage('Updated via organization webform');
        $node->setRevisionCreationTime(\Drupal::time()->getRequestTime());
        $node->setRevisionUserId(\Drupal::currentUser()->id());
        $node->save();
      }
      return;
    }
    // New organization node.
    $values = [
      'type' => 'organization',
      'title' => $title,
      'field_organization_acronym' => $acronym,
      'field_city' => $city,
      'field_street_address' => $street_address,
      'field_street_address_line_2' => $street_address_line_2,
      'field_postal_code' => $postal_code,
      'field_sector_custom_select' => $sector,
      'status' => 1,
      'field_webform_sync' => $webform_sync,
    ];

    if ($country_code) {
      $values['field_state'] = $country_code;
    }

    $values['field_state'] = [
      [
        'country_code' => $country_code ?: NULL,
        'administrative_area' => $state_admin ?: NULL,
        'locality' => $locality ?: NULL,
        'postal_code' => $postal_code ?: NULL,
        'address_line1' => $street_address ?: NULL,
        'address_line2' => $street_address_line_2 ?: NULL,
      ],
    ];

    // Taxonomy term references.
    $values['field_academia_sub_sector'] = $academia_sub_sector;
    $values['field_government_sub_sector'] = $government_sub_sector;
    $values['field_industry_sub_sector'] = $industry_sub_sector;

    // Startup boolean.
    $values['field_startup_company'] = $is_startup;

    // Links.
    if (!empty($website)) {
      $values['field_organization_website'] = ['uri' => $website];
    }
    if (!empty($linkedin)) {
      $values['field_linkedin_profile'] = ['uri' => $linkedin];
    }
    if (!empty($facebook)) {
      $values['field_facebook_profile'] = ['uri' => $facebook];
    }
    if (!empty($instagram)) {
      $values['field_instagram_profile'] = ['uri' => $instagram];
    }
    if (!empty($wechat)) {
      $values['field_wechat_profile'] = ['uri' => $wechat];
    }

    $values['field_organization_description'] = $description;

    $node = $node_storage->create($values);
    $node->save();
    // Optional: if you want to store created nid in submission data.
    $submission->setData(['organization_nid' => $node->id()] + $data);
  }

  /**
   * {@inheritdoc}
   */
  public function validateSubmission(
    WebformSubmissionInterface $submission,
    array &$errors,
  ) {
    $data = $submission->getData();
    $name = trim($data['organization_name'] ?? '');

    if ($name === '') {
      return;
    }

    $query = \Drupal::entityQuery('node')
      ->accessCheck(FALSE)
      ->condition('type', 'organization')
      ->condition('organization_name', $name);

    $existing_nid = $submission->getData()['source_entity_id'] ?? NULL;
    if ($existing_nid) {
      $query->condition('nid', (int) $existing_nid, '!=');
    }

    if ($query->range(0, 1)->execute()) {

      $errors['organization_name'] = $this->t(
        'Organization already exists.'
      );
    }
  }

}

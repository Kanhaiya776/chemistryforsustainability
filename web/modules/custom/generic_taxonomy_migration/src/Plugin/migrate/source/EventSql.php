<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * @MigrateSource(
 *   id = "event_sql"
 * )
 */
class EventSql extends SqlBase {

  public function query() {
    $query = $this->select('node_field_data', 'n')
      ->fields('n', ['nid', 'title', 'created', 'changed', 'uid'])
      ->condition('n.type', 'event');

    // Body.
    $query->leftJoin('node__body', 'b', 'b.entity_id = n.nid');
    $query->addField('b', 'body_value', 'body');

    // Event date range.
    $query->leftJoin('node__field_event_date_s_2', 'ed', 'ed.entity_id = n.nid');
    $query->addField('ed', 'field_event_date_s_2_value', 'event_start_date');
    $query->addField('ed', 'field_event_date_s_2_end_value', 'event_end_date');

    // Event time range.
    $query->leftJoin('node__field_event_time', 'et', 'et.entity_id = n.nid');
    $query->addField('et', 'field_event_time_from', 'event_start_time');
    $query->addField('et', 'field_event_time_to', 'event_end_time');

    // Timezone.
    $query->leftJoin('node__field_timezone', 'tz', 'tz.entity_id = n.nid');
    $query->addField('tz', 'field_timezone_value', 'timezone');

    // Location (address).
    $query->leftJoin('node__field_location', 'loc', 'loc.entity_id = n.nid');
    $query->addField('loc', 'field_location_country_code', 'country');
    $query->addField('loc', 'field_location_administrative_area', 'state');
    $query->addField('loc', 'field_location_locality', 'city');
    $query->addField('loc', 'field_location_postal_code', 'postal_code');
    $query->addField('loc', 'field_location_address_line1', 'address_line1');
    $query->addField('loc', 'field_location_address_line2', 'address_line2');
    $query->addField('loc', 'field_location_organization', 'venue');

    // Link.
    $query->leftJoin('node__field_link', 'l', 'l.entity_id = n.nid');
    $query->addField('l', 'field_link_uri', 'link');

    // Image.
    $query->leftJoin('node__field_image', 'img', 'img.entity_id = n.nid');
    $query->addField('img', 'field_image_target_id', 'image_fid');

    // Organization.
    $query->leftJoin('node__field_organization', 'org', 'org.entity_id = n.nid');
    $query->addField('org', 'field_organization_target_id', 'organization_nid');

    // Taxonomies.
    $query->leftJoin('node__field_estimated_capacity', 'cap', 'cap.entity_id = n.nid');
    $query->addField('cap', 'field_estimated_capacity_target_id', 'estimated_capacity');

    $query->leftJoin('node__field_event_format', 'ef', 'ef.entity_id = n.nid');
    $query->addField('ef', 'field_event_format_target_id', 'event_format');

    $query->leftJoin('node__field_event_type', 'etp', 'etp.entity_id = n.nid');
    $query->addField('etp', 'field_event_type_target_id', 'event_type');

    $query->leftJoin('node__field_keywords', 'k', 'k.entity_id = n.nid');
    $query->addExpression(
      'GROUP_CONCAT(DISTINCT k.field_keywords_target_id)',
      'keywords'
    );
    $query->leftJoin(
      'cherity.content_moderation_state_field_data',
      'cms',
      "cms.content_entity_id = n.nid AND cms.content_entity_type_id = ('node')");

    $query->addField('cms', 'moderation_state', 'moderation_state');

    $query->groupBy('n.nid');
    $query->groupBy('n.title');
    $query->groupBy('n.created');
    $query->groupBy('n.changed');
    $query->groupBy('n.uid');
    $query->groupBy('b.body_value');
    $query->groupBy('ed.field_event_date_s_2_value');
    $query->groupBy('ed.field_event_date_s_2_end_value');
    $query->groupBy('et.field_event_time_from');
    $query->groupBy('et.field_event_time_to');
    $query->groupBy('tz.field_timezone_value');
    $query->groupBy('loc.field_location_country_code');
    $query->groupBy('loc.field_location_administrative_area');
    $query->groupBy('loc.field_location_locality');
    $query->groupBy('loc.field_location_postal_code');
    $query->groupBy('loc.field_location_address_line1');
    $query->groupBy('loc.field_location_address_line2');
    $query->groupBy('loc.field_location_organization');
    $query->groupBy('l.field_link_uri');
    $query->groupBy('img.field_image_target_id');
    $query->groupBy('org.field_organization_target_id');
    $query->groupBy('cap.field_estimated_capacity_target_id');
    $query->groupBy('ef.field_event_format_target_id');
    $query->groupBy('etp.field_event_type_target_id');
    $query->groupBy('cms.moderation_state');

    return $query;
  }

  public function fields() {
    return [
      'nid' => $this->t('Node ID'),
      'title' => $this->t('Title'),
      'body' => $this->t('Body'),
      'event_start_date' => $this->t('Event start date'),
      'event_end_date' => $this->t('Event end date'),
      'event_start_time' => $this->t('Event start time'),
      'event_end_time' => $this->t('Event end time'),
      'timezone' => $this->t('Timezone'),
      'country' => $this->t('Country'),
      'link' => $this->t('Link'),
      'image_fid' => $this->t('Image'),
      'organization_civicrm_id' => $this->t('Organization'),
      'estimated_capacity' => $this->t('Estimated capacity'),
      'event_format' => $this->t('Event format'),
      'event_type' => $this->t('Event type'),
      'keywords' => $this->t('Keywords'),
      'created' => $this->t('Created'),
      'changed' => $this->t('Changed'),
      'uid' => $this->t('User ids'),
      'moderation_state' => $this->t('Moderation state'),
    ];
  }

  public function getIds() {
    return [
      'nid' => [
        'type' => 'integer',
        'alias' => 'n',
      ],
    ];
  }
}

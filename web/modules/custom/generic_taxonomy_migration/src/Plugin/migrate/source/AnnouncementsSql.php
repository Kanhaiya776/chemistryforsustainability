<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * @MigrateSource(
 *   id = "announcements_sql"
 * )
 */
class AnnouncementsSql extends SqlBase {

  public function query() {
    $query = $this->select('node_field_data', 'n')
      ->fields('n', ['nid', 'title', 'created', 'changed', 'uid'])
      ->condition('n.type', 'announcements');

    // Description.
    $query->leftJoin('node__field_description', 'd', 'd.entity_id = n.nid');
    $query->addField('d', 'field_description_value', 'description');

    // Other interest.
    $query->leftJoin('node__field_specify_other_interest3', 'oi', 'oi.entity_id = n.nid');
    $query->addField('oi', 'field_specify_other_interest3_value', 'other_interest');

    // Link.
    $query->leftJoin('node__field_link', 'l', 'l.entity_id = n.nid');
    $query->addField('l', 'field_link_uri', 'link');

    // Featured image (file ID).
    $query->leftJoin('node__field_image', 'img', 'img.entity_id = n.nid');
    $query->addField('img', 'field_image_target_id', 'image_fid');

    // Organization reference.
    $query->leftJoin('node__field_organization', 'org', 'org.entity_id = n.nid');
    $query->addField('org', 'field_organization_target_id', 'organization_nid');

    // Taxonomies.
    $query->leftJoin('node__field_type_of_announcement', 'toa', 'toa.entity_id = n.nid');
    $query->addField('toa', 'field_type_of_announcement_target_id', 'type_of_announcement');

    // $query->leftJoin('node__field_keywords', 'k', 'k.entity_id = n.nid');
    // $query->addField('k', 'field_keywords_target_id', 'keywords');

    // $query->leftJoin('node__field_field_of_interest', 'foi', 'foi.entity_id = n.nid');
    // $query->addField('foi', 'field_field_of_interest_target_id', 'field_of_interest');
     $query->leftJoin(
      'cherity.content_moderation_state_field_data',
      'cms',
      "cms.content_entity_id = n.nid AND cms.content_entity_type_id = ('node')");

    $query->addField('cms', 'moderation_state', 'moderation_state');

    // Keywords — multi value → CSV
    $query->leftJoin('node__field_keywords', 'k', 'k.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(k.field_keywords_target_id)', 'keywords');

    // Field of interest — multi value → CSV
    $query->leftJoin('node__field_field_of_interest', 'foi', 'foi.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(foi.field_field_of_interest_target_id)', 'field_of_interest');

    $query->groupBy('n.nid');
    $query->groupBy('n.title');
    $query->groupBy('n.created');
    $query->groupBy('n.changed');
    $query->groupBy('n.uid');
    $query->groupBy('d.field_description_value');
    $query->groupBy('oi.field_specify_other_interest3_value');
    $query->groupBy('l.field_link_uri');
    $query->groupBy('img.field_image_target_id');
    $query->groupBy('org.field_organization_target_id');
    $query->groupBy('toa.field_type_of_announcement_target_id');
    $query->groupBy('cms.moderation_state');

    return $query;
  }

  public function fields() {
    return [
      'nid' => $this->t('Node ID'),
      'title' => $this->t('Title'),
      'description' => $this->t('Description'),
      'other_interest' => $this->t('Other interest'),
      'link' => $this->t('Link'),
      'image_fid' => $this->t('Image file ID'),
      'organization_nid' => $this->t('Organization'),
      'type_of_announcement' => $this->t('Type of Announcement'),
      'keywords' => $this->t('Keywords'),
      'field_of_interest' => $this->t('Field of Interest'),
      'created' => $this->t('Created'),
      'changed' => $this->t('Changed'),
      'uid' => $this->t('Author user ID'),
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

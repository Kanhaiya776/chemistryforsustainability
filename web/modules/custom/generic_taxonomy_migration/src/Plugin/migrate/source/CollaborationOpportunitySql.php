<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * @MigrateSource(
 *   id = "collaboration_opportunity_sql"
 * )
 */
class CollaborationOpportunitySql extends SqlBase {

  public function query() {
    $query = $this->select('node_field_data', 'n')
      ->fields('n', ['nid', 'title', 'created', 'changed'])
      ->condition('n.type', 'collaboration_opportunity');

    // Body.
    $query->leftJoin('node__body', 'b', 'b.entity_id = n.nid');
    $query->addField('b', 'body_value', 'body');

    // Dates.
    $query->leftJoin('node__field_deadline_collab', 'dl', 'dl.entity_id = n.nid');
    $query->addField('dl', 'field_deadline_collab_value', 'deadline');

    $query->leftJoin('node__field_start_date', 'sd', 'sd.entity_id = n.nid');
    $query->addField('sd', 'field_start_date_value', 'start_date');

    $query->leftJoin('node__field_end_date', 'ed', 'ed.entity_id = n.nid');
    $query->addField('ed', 'field_end_date_value', 'end_date');

    // Reference publication.
    $query->leftJoin('node__field_reference_for_relevant_pub', 'rp', 'rp.entity_id = n.nid');
    $query->addField('rp', 'field_reference_for_relevant_pub_value', 'reference_pub');

    // Link.
    $query->leftJoin('node__field_link', 'l', 'l.entity_id = n.nid');
    $query->addField('l', 'field_link_uri', 'link');

    // Supporting document.
    $query->leftJoin('node__field_supporting_documents', 'doc', 'doc.entity_id = n.nid');
    $query->addField('doc', 'field_supporting_documents_target_id', 'doc_fid');

    // Organization.
    $query->leftJoin('node__field_organization', 'org', 'org.entity_id = n.nid');
    $query->addField('org', 'field_organization_target_id', 'organization_nid');

    // Taxonomies.
    $query->leftJoin('node__field_academia_sub_sector', 'a', 'a.entity_id = n.nid');
    $query->addField('a', 'field_academia_sub_sector_target_id', 'academia_sub_sector');

    $query->leftJoin('node__field_government_sub_sector', 'g', 'g.entity_id = n.nid');
    $query->addField('g', 'field_government_sub_sector_target_id', 'government_sub_sector');

    $query->leftJoin('node__field_industry_sub_sector', 'i', 'i.entity_id = n.nid');
    $query->addField('i', 'field_industry_sub_sector_target_id', 'industry_sub_sector');

    $query->leftJoin('node__field_organizational_sector', 'os', 'os.entity_id = n.nid');
    $query->addField('os', 'field_organizational_sector_target_id', 'organizational_sector');

    $query->leftJoin('node__field_keywords', 'k', 'k.entity_id = n.nid');
    $query->addField('k', 'field_keywords_target_id', 'keywords');
    $query->leftJoin(
      'cherity.content_moderation_state_field_data',
      'cms',
      "cms.content_entity_id = n.nid AND cms.content_entity_type_id = ('node')");

    $query->addField('cms', 'moderation_state', 'moderation_state');

    return $query;
  }

  public function fields() {
    return [
      'nid' => $this->t('Node ID'),
      'title' => $this->t('Title'),
      'body' => $this->t('Body'),
      'deadline' => $this->t('Deadline'),
      'start_date' => $this->t('Start date'),
      'end_date' => $this->t('End date'),
      'reference_pub' => $this->t('Reference publication'),
      'link' => $this->t('Link'),
      'doc_fid' => $this->t('Supporting document'),
      'organization_civicrm_id' => $this->t('Organization'),
      'academia_sub_sector' => $this->t('Academia sub-sector'),
      'government_sub_sector' => $this->t('Government sub-sector'),
      'industry_sub_sector' => $this->t('Industry sub-sector'),
      'organizational_sector' => $this->t('Organizational sector'),
      'keywords' => $this->t('Keywords'),
      'created' => $this->t('Created'),
      'changed' => $this->t('Changed'),
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

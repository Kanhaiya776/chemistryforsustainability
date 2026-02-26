<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * @MigrateSource(
 *   id = "case_study_sql"
 * )
 */
class CaseStudySql extends SqlBase {

  public function query() {
    $query = $this->select('node_field_data', 'n');
    $query->fields('n', ['nid', 'title', 'uid']);

    // Body.
    $query->leftJoin('node__body', 'b', 'b.entity_id = n.nid');
    $query->addField('b', 'body_value', 'body');
    $query->addField('b', 'body_format', 'body_format');

    // Attachments.
    $query->leftJoin('node__field_attachments', 'fa', 'fa.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT fa.field_attachments_target_id)', 'attachment_fids');

    // Category taxonomy.
    $query->leftJoin('node__field_category', 'cat', 'cat.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT cat.field_category_target_id)', 'category_tids');

    // Country (CiviCRM).
    $query->leftJoin('node__field_country_s_where_implemente', 'cty', 'cty.entity_id = n.nid');
    $query->leftJoin('civicrm.civicrm_country', 'cc', 'cc.id = cty.field_country_s_where_implemente_target_id');
    $query->addExpression('GROUP_CONCAT(DISTINCT cc.iso_code)', 'countries');

    // Human health benefits.
    $query->leftJoin('node__field_human_health_and_environme', 'hh', 'hh.entity_id = n.nid');
    $query->addField('hh', 'field_human_health_and_environme_value', 'human_health');

    // Images.
    $query->leftJoin('node__field_images', 'img', 'img.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT img.field_images_target_id)', 'image_fids');

    // Organization (CiviCRM).
    $query->leftJoin('node__field_organization', 'org', 'org.entity_id = n.nid');
    $query->addField('org', 'field_organization_target_id', 'organization_nid');

    // Other organization text.
    $query->leftJoin('node__field_inventor_owner_manufacture', 'ot', 'ot.entity_id = n.nid');
    $query->addField('ot', 'field_inventor_owner_manufacture_value', 'other_org');

    // Keywords.
    $query->leftJoin('node__field_keywords', 'kw', 'kw.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT kw.field_keywords_target_id)', 'keyword_tids');

    // Link.
    $query->leftJoin('node__field_link', 'l', 'l.entity_id = n.nid');
    $query->addField('l', 'field_link_uri', 'link');

    // References.
    $query->leftJoin('node__field_references', 'r', 'r.entity_id = n.nid');
    $query->addField('r', 'field_references_value', 'references');

    // Stage of development.
    $query->leftJoin('node__field_stage_of_development', 'sd', 'sd.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT sd.field_stage_of_development_target_id)', 'stage_tids');

    $query->leftJoin(
      'cherity.content_moderation_state_field_data',
      'cms',
      "cms.content_entity_id = n.nid AND cms.content_entity_type_id = ('node')");

    $query->addField('cms', 'moderation_state', 'moderation_state');

    $query->condition('n.type', 'case_study');
    // FULL groupBy (MySQL 8 safe)
    $query->groupBy('n.nid');
    $query->groupBy('n.title');
    $query->groupBy('n.uid');
    $query->groupBy('b.body_value');
    $query->groupBy('b.body_format');
    $query->groupBy('hh.field_human_health_and_environme_value');
    $query->groupBy('org.field_organization_target_id');
    $query->groupBy('ot.field_inventor_owner_manufacture_value');
    $query->groupBy('l.field_link_uri');
    $query->groupBy('r.field_references_value');
    $query->groupBy('cms.moderation_state');

    return $query;
  }

  public function fields() {
    return [
      'nid' => $this->t('Node ID'),
      'title' => $this->t('Title'),
      'uid' => $this->t('User IDs'),
      'body' => $this->t('Body'),
      'body_format' => $this->t('Body format'),
      'attachment_fids' => $this->t('Attachments'),
      'category_tids' => $this->t('Category'),
      'countries' => $this->t('Countries'),
      'human_health' => $this->t('Human health benefits'),
      'image_fids' => $this->t('Images'),
      'organization_nid' => $this->t('Organization'),
      'other_org' => $this->t('Other organization'),
      'keyword_tids' => $this->t('Keywords'),
      'link' => $this->t('Link'),
      'references' => $this->t('References'),
      'stage_tids' => $this->t('Stage of development'),
      'moderation_state' => $this->t('Moderation state'),
    ];
  }

  public function getIds() {
    return [
      'nid' => ['type' => 'integer'],
    ];
  }
}

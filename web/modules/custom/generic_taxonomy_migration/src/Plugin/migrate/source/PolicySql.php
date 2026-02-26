<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * Policy source.
 *
 * @MigrateSource(
 *   id = "policy_sql"
 * )
 */
class PolicySql extends SqlBase {

  public function query() {

    $query = $this->select('cherity.node_field_data', 'n');
    $query->fields('n', ['nid', 'title', 'uid']);

    // Body.
    $query->leftJoin('cherity.node__body', 'b', 'b.entity_id = n.nid');
    $query->addField('b', 'body_value', 'body');

    // Policy number.
    $query->leftJoin('cherity.node__field_policy_number', 'pn', 'pn.entity_id = n.nid');
    $query->addField('pn', 'field_policy_number_value', 'policy_number');

    // International.
    $query->leftJoin('cherity.node__field_international', 'intl', 'intl.entity_id = n.nid');
    $query->addField('intl', 'field_international_value', 'international');

    // Other specify.
    $query->leftJoin('cherity.node__field_other_please_specify', 'ops', 'ops.entity_id = n.nid');
    $query->addField('ops', 'field_other_please_specify_value', 'other_specify');

    // Responsible entity.
    $query->leftJoin('cherity.node__field_authoritative_body', 'ab', 'ab.entity_id = n.nid');
    $query->addField('ab', 'field_authoritative_body_value', 'responsible_entity');

    // Dates.
    $query->leftJoin('cherity.node__field_effective_date', 'ed', 'ed.entity_id = n.nid');
    $query->addField('ed', 'field_effective_date_value', 'effective_date');

    $query->leftJoin('cherity.node__field_approved_date2', 'ad', 'ad.entity_id = n.nid');
    $query->addField('ad', 'field_approved_date2_value', 'approved_date');

    // Links.
    $query->leftJoin('cherity.node__field_full_text_of_the_policy2', 'link1', 'link1.entity_id = n.nid');
    $query->addField('link1', 'field_full_text_of_the_policy2_uri', 'english_link');

    $query->leftJoin('cherity.node__field_full_text_of_the_policy3', 'link2', 'link2.entity_id = n.nid');
    $query->addField('link2', 'field_full_text_of_the_policy3_uri', 'original_link');

    // Country ISO codes.
    $query->leftJoin('cherity.node__field_country', 'c', 'c.entity_id = n.nid');
    $query->leftJoin('civicrm.civicrm_country', 'cc', 'cc.id = c.field_country_target_id');
    $query->addExpression('GROUP_CONCAT(DISTINCT cc.iso_code)', 'countries');

    // State IDs.
    $query->leftJoin('cherity.node__field_state', 's', 's.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT s.field_state_target_id)', 'states');

    $query->leftJoin(
      'cherity.content_moderation_state_field_data',
      'cms',
      "cms.content_entity_id = n.nid AND cms.content_entity_type_id = ('node')");

    $query->addField('cms', 'moderation_state', 'moderation_state');

    // File.
    $query->leftJoin('cherity.node__field_full_text_of_the_policy_in', 'f', 'f.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT f.field_full_text_of_the_policy_in_target_id)', 'file_fids');

    $query->condition('n.type', 'policy');

    $query->groupBy('n.nid');
    $query->groupBy('n.title');
    $query->groupBy('n.uid');
    $query->groupBy('b.body_value');
    $query->groupBy('pn.field_policy_number_value');
    $query->groupBy('intl.field_international_value');
    $query->groupBy('ops.field_other_please_specify_value');
    $query->groupBy('ab.field_authoritative_body_value');
    $query->groupBy('ed.field_effective_date_value');
    $query->groupBy('ad.field_approved_date2_value');
    $query->groupBy('link1.field_full_text_of_the_policy2_uri');
    $query->groupBy('link2.field_full_text_of_the_policy3_uri');
    $query->groupBy('cms.moderation_state');


    return $query;
  }

  public function fields() {
    return [
      'nid' => 'Node ID',
      'title' => 'Title',
      'uid' => 'User',
      'body' => 'Body',
      'policy_number' => 'Policy Number',
      'international' => 'International',
      'other_specify' => 'Other specify',
      'responsible_entity' => 'Responsible entity',
      'effective_date' => 'Effective date',
      'approved_date' => 'Approved date',
      'english_link' => 'English link',
      'original_link' => 'Original link',
      'countries' => 'Country ISO CSV',
      'states' => 'State CSV',
      'file_fids' => 'Files CSV',
      'moderation_state' => $this->t('Moderation state'),
    ];
  }

  public function getIds() {
    return [
      'nid' => ['type' => 'integer'],
    ];
  }

}
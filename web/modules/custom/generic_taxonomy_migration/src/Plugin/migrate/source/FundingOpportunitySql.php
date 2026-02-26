<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * Funding Opportunity source.
 *
 * @MigrateSource(
 *   id = "funding_opportunity_sql"
 * )
 */
class FundingOpportunitySql extends SqlBase {

  /**
   * {@inheritdoc}
   */
  public function query() {
    $query = $this->select('cherity.node_field_data', 'n');
    $query->fields('n', ['nid', 'title', 'uid']);

    $query->leftJoin('cherity.node__body', 'b', 'b.entity_id = n.nid');
    $query->addField('b', 'body_value', 'body');
    $query->addField('b', 'body_format', 'body_format');

    // Organization.
    $query->leftJoin('cherity.node__field_organization', 'org', 'org.entity_id = n.nid');
    $query->addField('org', 'field_organization_target_id', 'organization_nid');

    $query->leftJoin('cherity.node__field_proposal_deadline', 'd', 'd.entity_id = n.nid');
    $query->addField('d', 'field_proposal_deadline_value', 'deadline');

    $query->leftJoin('cherity.node__field_link', 'l', 'l.entity_id = n.nid');
    $query->addField('l', 'field_link_uri', 'link');
    $query->addField('l', 'field_link_title', 'link_title');

    // Featured Image.
    $query->leftJoin('cherity.node__field_featured_image', 'fi', 'fi.entity_id = n.nid');
    $query->addField('fi', 'field_featured_image_target_id', 'image_fid');
    $query->addField('fi', 'field_featured_image_alt', 'image_alt');

    // Other interest (text field).
    $query->leftJoin('cherity.node__field_specify_other_interest2', 'oi', 'oi.entity_id = n.nid');
    $query->addField('oi', 'field_specify_other_interest2_value', 'other_interest');

    // Application Deadline Type.
    $query->leftJoin('cherity.node__field_application_deadline2', 'adt', 'adt.entity_id = n.nid');
    $query->addField('adt', 'field_application_deadline2_value', 'application_deadline_type');

    $query->leftJoin('cherity.node__field_field_of_interest', 'foi', 'foi.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT foi.field_field_of_interest_target_id)', 'interest_tids');

    $query->leftJoin('cherity.node__field_keywords', 'kw', 'kw.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT kw.field_keywords_target_id)', 'keyword_tids');

    $query->leftJoin('cherity.node__field_tests', 'er', 'er.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT er.field_tests_value)', 'eligible_recipients');

    $query->leftJoin('cherity.node__field_testa', 'ft', 'ft.entity_id = n.nid');
    $query->leftJoin('civicrm.civicrm_country', 'cc', 'cc.id = ft.field_testa_target_id');
    $query->addExpression('GROUP_CONCAT(DISTINCT cc.iso_code)', 'countries');

    $query->leftJoin(
      'cherity.content_moderation_state_field_data',
      'cms',
      "cms.content_entity_id = n.nid AND cms.content_entity_type_id = ('node')");

    $query->addField('cms', 'moderation_state', 'moderation_state');

    // Attachment file field.
    $query->leftJoin('cherity.node__field_attachment', 'fa', 'fa.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT fa.field_attachment_target_id)', 'attachment_fids');

    $query->condition('n.type', 'funding_opportunity');
    // $query->condition('n.nid', 1102);

    // Required for ONLY_FULL_GROUP_BY.
    $query->groupBy('n.nid');
    $query->groupBy('n.title');
    $query->groupBy('n.uid');
    $query->groupBy('b.body_value');
    $query->groupBy('b.body_format');
    $query->groupBy('org.field_organization_target_id');
    $query->groupBy('d.field_proposal_deadline_value');
    $query->groupBy('l.field_link_uri');
    $query->groupBy('l.field_link_title');
    $query->groupBy('adt.field_application_deadline2_value');
    $query->groupBy('fi.field_featured_image_target_id');
    $query->groupBy('fi.field_featured_image_alt');
    $query->groupBy('oi.field_specify_other_interest2_value');
    $query->groupBy('cms.moderation_state');

    return $query;
  }

  /**
   * {@inheritdoc}
   */
  public function fields() {
    return [
      'nid' => $this->t('Node ID'),
      'title' => $this->t('Title'),
      'uid' => $this->t('user id'),
      'body' => $this->t('Body value'),
      'body_format' => $this->t('Body format'),
      'deadline' => $this->t('Proposal deadline'),
      'organization_nid' => $this->t('Organization'),
      'link' => $this->t('External link'),
      'attachment_fids' => $this->t('Attachment file IDs (CSV)'),
      'application_deadline_type' => $this->t('Application Deadline Type'),
      'link_title' => $this->t('Link title'),
      'interest_tids' => $this->t('Field of interest term IDs (CSV)'),
      'keyword_tids' => $this->t('Keyword term IDs (CSV)'),
      'eligible_recipients' => $this->t('Eligible recipients (CSV)'),
      'countries' => $this->t('Country ISO codes (CSV)'),
      'image_fid' => $this->t('Featured image file ID'),
      'image_alt' => $this->t('Featured image alt text'),
      'other_interest' => $this->t('Other interest (text)'),
      'moderation_state' => $this->t('Moderation state'),

    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getIds() {
    return [
      'nid' => [
        'type' => 'integer',
        'alias' => 'n',
      ],
    ];
  }

}

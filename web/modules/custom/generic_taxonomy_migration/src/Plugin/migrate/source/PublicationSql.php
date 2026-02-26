<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * @MigrateSource(
 *   id = "publication_sql"
 * )
 */
class PublicationSql extends SqlBase {

  /**
   * {@inheritdoc}
   */
  public function query() {
    $query = $this->select('node_field_data', 'n')
      ->fields('n', ['nid', 'title', 'created', 'changed', 'uid'])
      ->condition('n.type', 'publication');

    // Body.
    $query->leftJoin('node__body', 'b', 'b.entity_id = n.nid');
    $query->addField('b', 'body_value', 'body');
    $query->addField('b', 'body_format', 'body_format');

    // Source.
    $query->leftJoin('node__field_source', 'ai', 'ai.entity_id = n.nid');
    $query->addField('ai', 'field_source_value', 'source');

    // DOI / link.
    $query->leftJoin('node__field_doi', 'l', 'l.entity_id = n.nid');
    $query->addField('l', 'field_doi_uri', 'link');

    $query->leftJoin('node__field_pu', 'd', 'd.entity_id = n.nid');
    $query->addField('d', 'field_pu_value', 'publication_date');

    // Attachment (multi-value).
    $query->leftJoin('node__field_attachment2', 'fa', 'fa.entity_id = n.nid');
    $query->addField('fa', 'field_attachment2_target_id', 'attachment_fid');

    // Featured image.
    $query->leftJoin('node__field_featured_image_pub', 'fi', 'fi.entity_id = n.nid');
    $query->addField('fi', 'field_featured_image_pub_target_id', 'image_fid');
    $query->addField('fi', 'field_featured_image_pub_alt', 'image_alt');

    // Field of interest (multi-value).
    $query->leftJoin('node__field_field_of_interest', 'foi', 'foi.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(foi.field_field_of_interest_target_id)', 'field_of_interest');

    // Other interest.
    $query->leftJoin('node__field_specify_other_interest', 'oi', 'oi.entity_id = n.nid');
    $query->addField('oi', 'field_specify_other_interest_value', 'other_interest');

    // Keywords (multi-value).
    $query->leftJoin('node__field_keywords', 'k', 'k.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(k.field_keywords_target_id)', 'keywords');

    $query->leftJoin(
    'node__field_publication_authors',
    'pa',
    'pa.entity_id = n.nid'
    );

    $query->addExpression(
    "GROUP_CONCAT(DISTINCT CONCAT(pa.field_publication_authors_target_id, ':', pa.field_publication_authors_target_revision_id))",
    'author_paragraph_ids'
    );

    // Moderation state.
    $query->leftJoin(
    'content_moderation_state_field_data',
    'cms',
    "cms.content_entity_id = n.nid AND cms.content_entity_type_id = 'node'"
     );

    $query->addField('cms', 'moderation_state', 'moderation_state');

    // Group by all selected fields (required for GROUP_CONCAT).
    $query->groupBy('n.nid');
    $query->groupBy('n.title');
    $query->groupBy('n.created');
    $query->groupBy('n.changed');
    $query->groupBy('n.uid');
    $query->groupBy('b.body_value');
    $query->groupBy('b.body_format');
    $query->groupBy('ai.field_source_value');
    $query->groupBy('l.field_doi_uri');
    $query->groupBy('d.field_pu_value');
    $query->groupBy('fi.field_featured_image_pub_target_id');
    $query->groupBy('fi.field_featured_image_pub_alt');
    $query->groupBy('oi.field_specify_other_interest_value');
    $query->groupBy('fa.field_attachment2_target_id');
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
      'body' => $this->t('Body value'),
      'body_format' => $this->t('Body format'),
      'other_interest' => $this->t('Other interest'),
      'link' => $this->t('Link'),
      'image_fid' => $this->t('Image file ID'),
      'image_alt' => $this->t('Image alt text'),
      'keywords' => $this->t('Keywords'),
      'field_of_interest' => $this->t('Field of Interest'),
      'created' => $this->t('Created'),
      'changed' => $this->t('Changed'),
      'uid' => $this->t('Author user ID'),
      'publication_date' => $this->t('date'),
      'moderation_state' => $this->t('Moderation state'),
      'source' => $this->t('Source'),
      'attachment_fid' => $this->t('Attachment file IDs'),
      'author_paragraph_ids' => $this->t('Paragraph IDs'),
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
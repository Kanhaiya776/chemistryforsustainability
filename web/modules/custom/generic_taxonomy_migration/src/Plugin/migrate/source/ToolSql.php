<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * @MigrateSource(
 *   id = "tool_sql"
 * )
 */
class ToolSql extends SqlBase {

  public function query() {
    $query = $this->select('node_field_data', 'n')
      ->fields('n', ['nid', 'title', 'created', 'changed', 'uid'])
      ->condition('n.type', 'tool');

    // Body.
    $query->leftJoin('node__body', 'b', 'b.entity_id = n.nid');
    $query->addField('b', 'body_value', 'body');

    // Link.
    $query->leftJoin('node__field_link', 'l', 'l.entity_id = n.nid');
    $query->addField('l', 'field_link_uri', 'link');

    // Featured image.
    $query->leftJoin('node__field_image', 'img', 'img.entity_id = n.nid');
    $query->addField('img', 'field_image_target_id', 'image_fid');

    // Supporting document.
    $query->leftJoin('node__field_supporting_documents2', 'doc', 'doc.entity_id = n.nid');
    $query->addField('doc', 'field_supporting_documents2_target_id', 'doc_fid');

    // Organization.
    $query->leftJoin('node__field_organization', 'org', 'org.entity_id = n.nid');
    $query->addField('org', 'field_organization_target_id', 'organization_nid');

    // Keywords taxonomy.
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
    $query->groupBy('l.field_link_uri');
    $query->groupBy('img.field_image_target_id');
    $query->groupBy('doc.field_supporting_documents2_target_id');
    $query->groupBy('org.field_organization_target_id');
    $query->groupBy('cms.moderation_state');

    return $query;
  }

  public function fields() {
    return [
      'nid' => $this->t('Node ID'),
      'title' => $this->t('Title'),
      'body' => $this->t('Body'),
      'link' => $this->t('Link'),
      'image_fid' => $this->t('Image file'),
      'doc_fid' => $this->t('Supporting document'),
      'organization_nid' => $this->t('Organization'),
      'keywords' => $this->t('Keywords'),
      'created' => $this->t('Created'),
      'changed' => $this->t('Changed'),
      'uid' => $this->t('User id'),
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

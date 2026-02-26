<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * @MigrateSource(
 *   id = "publication_authors_sql"
 * )
 */
class PublicationAuthorsSql extends SqlBase {

  public function query() {
    $query = $this->select('paragraphs_item_field_data', 'p')
      ->fields('p', ['id', 'revision_id']);

    $query->condition('p.type', 'author');

    // Author name.
    $query->leftJoin('paragraph__field_author_name', 'n', 'n.entity_id = p.id');
    $query->addField('n', 'field_author_name_value', 'author_name');

    // Organization.
    $query->leftJoin('paragraph__field_author_organization', 'o', 'o.entity_id = p.id');
    $query->addField('o', 'field_author_organization_value', 'author_org');

    return $query;
  }

  public function fields() {
    return [
      'id' => $this->t('Paragraph ID'),
      'revision_id' => $this->t('Revision ID'),
      'author_name' => $this->t('Author name'),
      'author_org' => $this->t('Author organization'),
    ];
  }

  public function getIds() {
    return [
      'id' => [
        'type' => 'integer',
        'alias' => 'p',
      ],
      'revision_id' => [
        'type' => 'integer',
        'alias' => 'p',
      ],
    ];
  }
}
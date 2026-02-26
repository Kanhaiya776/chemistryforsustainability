<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * @MigrateSource(
 *   id = "taxonomy_sql"
 * )
 */
class TaxonomySql extends SqlBase {

  public function query() {
    $query = $this->select('taxonomy_term_field_data', 't')
      ->fields('t', ['tid', 'name', 'vid', 'description__value', 'weight'])
      ->condition('t.vid', $this->configuration['vocabulary']);

    // Join parent table.
    $query->leftJoin('taxonomy_term__parent', 'p', 'p.entity_id = t.tid');
    $query->addField('p', 'parent_target_id', 'parent');

    return $query;
  }

  public function fields() {
    return [
      'tid' => $this->t('Term ID'),
      'name' => $this->t('Name'),
      'vid' => $this->t('Vocabulary'),
      'description__value' => $this->t('Description'),
      'weight' => $this->t('Weight'),
      'parent' => $this->t('Parent term ID'),
    ];
  }

  public function getIds() {
    return [
      'tid' => ['type' => 'integer'],
    ];
  }

}

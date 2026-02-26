<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\Core\Database\Connection;
use Drupal\Core\Database\Database;
use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * Source plugin for CiviCRM countries.
 *
 * @MigrateSource(
 *   id = "civicrm_country_sql"
 * )
 */
class CivicrmCountrySql extends SqlBase {

  /**
   * Use the CiviCRM database connection.
   */
  public function getDatabase(): Connection {
    return Database::getConnection('default', 'civicrm');
  }

  /**
   * {@inheritdoc}
   */
  public function query() {
    return $this->select('civicrm_country', 'c')
      ->fields('c', [
        'id',
        'name',
        'iso_code',
      ])
      ->condition('c.is_active', 1)
      ->orderBy('c.name', 'ASC');
  }

  /**
   * {@inheritdoc}
   */
  public function fields() {
    return [
      'id' => $this->t('CiviCRM country ID'),
      'name' => $this->t('Country name'),
      'iso_code' => $this->t('ISO-2 country code'),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getIds() {
    return [
      'id' => [
        'type' => 'integer',
      ],
    ];
  }

}

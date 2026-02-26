<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * Converts CSV country codes into array for country_multi field.
 *
 * @MigrateProcessPlugin(
 *   id = "country_multi_process"
 * )
 */
class CountryMulti extends ProcessPluginBase {

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {

    if (empty($value)) {
      return NULL;
    }

    // Convert CSV to array.
    $countries = explode(',', $value);

    // Normalize values.
    $countries = array_map('trim', $countries);
    $countries = array_map('strtoupper', $countries);

    // Remove empty values.
    $countries = array_filter($countries);

    // Return JSON STRING because field type expects string.
    return [
      'value' => json_encode(array_values($countries)),
    ];
  }

}

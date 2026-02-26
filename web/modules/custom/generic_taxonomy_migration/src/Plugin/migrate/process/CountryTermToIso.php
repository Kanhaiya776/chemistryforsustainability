<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * @MigrateProcessPlugin(
 *   id = "country_term_to_iso"
 * )
 */
class CountryTermToIso extends ProcessPluginBase {

  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    if (empty($value)) {
      return NULL;
    }

    $term = \Drupal::entityTypeManager()
      ->getStorage('taxonomy_term')
      ->load($value);

    if (!$term || !$term->hasField('field_iso_code')) {
      return NULL;
    }

    $iso = strtoupper($term->get('field_iso_code')->value);

    return $iso ?: NULL;
  }

}

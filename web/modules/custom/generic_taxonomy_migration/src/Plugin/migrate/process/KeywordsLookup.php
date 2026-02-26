<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;
use Drupal\migrate\Plugin\migrate\process\MigrationLookup;

/**
 * Custom keyword lookup that handles CSV source IDs.
 *
 * @MigrateProcessPlugin(
 *   id = "keywords_lookup"
 * )
 */
class KeywordsLookup extends MigrationLookup {

  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {

    if (empty($value)) {
      return NULL;
    }

    $ids = explode(',', $value);

    $results = [];

    foreach ($ids as $id) {
      $id = trim($id);
      if ($id === '') {
        continue;
      }

      $dest = parent::transform($id, $migrate_executable, $row, $destination_property);

      if ($dest) {
        $results[] = $dest;
      }
    }

    // ✅ remove duplicates
    $results = array_values(array_unique($results));

    return $results;
  }

}

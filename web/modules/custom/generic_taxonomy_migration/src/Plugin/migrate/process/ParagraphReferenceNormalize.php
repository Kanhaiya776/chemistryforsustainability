<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;

/**
 * Normalize paragraph reference values for ERR fields.
 *
 * @MigrateProcessPlugin(
 *   id = "paragraph_reference_normalize"
 * )
 */
class ParagraphReferenceNormalize extends ProcessPluginBase {

  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {

    if (empty($value)) {
      return NULL;
    }

    // Convert CSV string to array.
    $items = explode(',', $value);

    $result = [];

    foreach ($items as $item) {
      // Split "id:revision".
      [$id, $revision] = explode(':', $item);

      $result[] = [
        'target_id' => (int) $id,
        'target_revision_id' => (int) $revision,
      ];
    }

    return $result;
  }

}
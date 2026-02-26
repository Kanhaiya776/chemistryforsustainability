<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * @MigrateProcessPlugin(
 *   id = "state_multi_process"
 * )
 */
class StateMulti extends ProcessPluginBase {

  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {

    if (!$value) {
      return NULL;
    }

    $states = explode(',', $value);
    $states = array_map('trim', $states);
    $states = array_filter($states);

    return [
      'value' => json_encode(array_values($states)),
    ];
  }

}
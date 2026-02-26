<?php

namespace Drupal\civicrm_user_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;

/**
 * Explodes CiviCRM multi-value fields safely.
 *
 * @MigrateProcessPlugin(
 *   id = "civi_explode"
 * )
 */
class CiviExplode extends ProcessPluginBase {

  public function transform($value, MigrateExecutableInterface $executable, Row $row, $destination_property) {

    // Safety guard — never trust input type.
    if (!is_string($value) || $value === '') {
      return [];
    }

    // Remove leading/trailing Civi delimiter.
    $value = trim($value, "\x01");

    if ($value === '') {
      return [];
    }

    $parts = explode("\x01", $value);

    // Trim + remove empties.
    $parts = array_values(array_filter(array_map('trim', $parts)));

    return $parts;
  }

}

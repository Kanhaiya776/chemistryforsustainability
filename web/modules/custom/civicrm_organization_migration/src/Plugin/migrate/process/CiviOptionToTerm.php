<?php

namespace Drupal\civicrm_organization_migration\Plugin\migrate\process;

use Drupal\Core\Database\Database;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;

/**
 * Resolves CiviCRM option values to taxonomy terms.
 *
 * @MigrateProcessPlugin(
 *   id = "civi_option_to_term"
 * )
 */
class CiviOptionToTerm extends ProcessPluginBase {

  protected static array $cache = [];

  public function transform($value, MigrateExecutableInterface $executable, Row $row, $destination_property) {
    if (!$value) {
      return NULL;
    }

    $custom_field_id = (int) $this->configuration['custom_field_id'];
    $vocabulary = $this->configuration['vocabulary'];

    $values = array_filter(explode("\x01", trim($value, "\x01")));
    $result = [];

    foreach ($values as $raw) {
      if ($tid = $this->resolve($custom_field_id, $vocabulary, trim($raw))) {
        $result[] = ['target_id' => $tid];
      }
    }

    return $result ?: NULL;
  }

  protected function resolve(int $custom_field_id, string $vocabulary, string $value): ?int {
    if (!isset(self::$cache[$custom_field_id])) {
      self::$cache[$custom_field_id] = $this->loadOptions($custom_field_id);
    }

    $label =
      self::$cache[$custom_field_id]['by_value'][$value]
      ?? self::$cache[$custom_field_id]['by_label'][strtolower($value)]
      ?? NULL;

    if (!$label) {
      return NULL;
    }

    $terms = \Drupal::entityTypeManager()
      ->getStorage('taxonomy_term')
      ->loadByProperties([
        'vid' => $vocabulary,
        'name' => $label,
      ]);

    return $terms ? (int) reset($terms)->id() : NULL;
  }

  protected function loadOptions(int $custom_field_id): array {
    $map = ['by_value' => [], 'by_label' => []];

    $civi = Database::getConnection('default', 'civicrm');

    $option_group_id = $civi->select('civicrm_custom_field', 'cf')
      ->fields('cf', ['option_group_id'])
      ->condition('cf.id', $custom_field_id)
      ->execute()
      ->fetchField();

    if (!$option_group_id) {
      return $map;
    }

    $query = $civi->select('civicrm_option_value', 'ov')
      ->fields('ov', ['value', 'label'])
      ->condition('ov.option_group_id', $option_group_id);

    foreach ($query->execute() as $row) {
      $map['by_value'][(string) $row->value] = $row->label;
      $map['by_label'][strtolower(trim($row->label))] = $row->label;
    }

    return $map;
  }

}

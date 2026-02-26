<?php

namespace Drupal\civicrm_organization_migration\Plugin\migrate\process;

use Drupal\Core\Database\Database;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\Row;

/**
 * Collects multiple CiviCRM FOI fields into one taxonomy reference field.
 *
 * @MigrateProcessPlugin(
 *   id = "civi_multi_field_of_interest"
 * )
 */
class CiviMultiFieldOfInterest extends ProcessPluginBase {

  protected static array $optionCache = [];

  public function transform($value, MigrateExecutableInterface $executable, Row $row, $destination_property) {
    $sources = $this->configuration['sources'] ?? [];
    $custom_field_map = $this->configuration['custom_field_map'] ?? [];

    if (!$sources || !$custom_field_map) {
      return NULL;
    }

    $tids = [];

    foreach ($sources as $source_key) {
      $raw = $row->getSourceProperty($source_key);
      if (empty($raw) || empty($custom_field_map[$source_key])) {
        continue;
      }

      $custom_field_id = (int) $custom_field_map[$source_key];
      $option_ids = array_filter(explode("\x01", trim($raw, "\x01")));

      foreach ($option_ids as $option_id) {
        if ($label = $this->resolveOptionLabel($custom_field_id, $option_id)) {

          // IMPORTANT: Do NOT restrict by vocabulary
          $terms = \Drupal::entityTypeManager()
            ->getStorage('taxonomy_term')
            ->loadByProperties(['name' => $label]);

          if ($terms) {
            $tid = (int) reset($terms)->id();
            $tids[$tid] = $tid;
          }
        }
      }
    }

    return $tids ? array_values($tids) : NULL;
  }

  protected function resolveOptionLabel(int $custom_field_id, string $option_value): ?string {
    if (!isset(self::$optionCache[$custom_field_id])) {
      self::$optionCache[$custom_field_id] = $this->loadOptions($custom_field_id);
    }

    return self::$optionCache[$custom_field_id][$option_value] ?? NULL;
  }

  protected function loadOptions(int $custom_field_id): array {
    $map = [];
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
      $map[(string) $row->value] = trim($row->label);
    }

    return $map;
  }

}

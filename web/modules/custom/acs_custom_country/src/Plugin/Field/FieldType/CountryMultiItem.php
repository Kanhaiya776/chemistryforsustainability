<?php

namespace Drupal\acs_custom_country\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the 'country_multi'.
 *
 * @FieldType(
 *   id = "country_multi",
 *   label = @Translation("Multi Country (JSON)"),
 *   description = @Translation("Stores multiple countries as JSON array."),
 *   category = @Translation("Custom"),
 *   default_widget = "country_multi_widget",
 *   default_formatter = "country_multi_formatter"
 * )
 */
class CountryMultiItem extends FieldItemBase {

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    $properties['value'] = DataDefinition::create('string')
      ->setLabel(t('Countries JSON'));
    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    return [
      'columns' => [
        'value' => [
          'type' => 'text',
          'size' => 'big',
          'not null' => FALSE,
        ],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function isEmpty() {
    if (empty($this->value)) {
      return TRUE;
    }

    $decoded = json_decode($this->value, TRUE);
    return empty($decoded);
  }

}

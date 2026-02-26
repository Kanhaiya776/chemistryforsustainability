<?php

namespace Drupal\acs_custom_country\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the 'state_multi'.
 *
 * @FieldType(
 *   id = "state_multi",
 *   label = @Translation("Multi State (JSON)"),
 *   description = @Translation("Stores multiple states as JSON array."),
 *   category = @Translation("Custom"), 
 *   default_widget = "state_multi_widget",
 *   default_formatter = "state_multi_formatter"
 * )
 */
class StateMultiItem extends FieldItemBase {

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

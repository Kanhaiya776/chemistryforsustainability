<?php

namespace Drupal\acs_custom_country\Plugin\Field\FieldWidget;

use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * State Widget to hold state values.
 *
 * @FieldWidget(
 *   id = "state_multi_widget",
 *   label = @Translation("Multi State Select"),
 *   field_types = {
 *     "state_multi"
 *   }
 * )
 */
class StateMultiWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

    $stored = [];

    if (!$items->isEmpty() && !empty($items[0]->value)) {
      $decoded = json_decode($items[0]->value, TRUE);
      if (is_array($decoded)) {
        $stored = $decoded;
      }
    }

    // AJAX will populate this.
    $element['value'] = [
      '#type' => 'select2',
      '#title' => $this->fieldDefinition->getLabel(),
      '#options' => [],
      '#default_value' => $stored,
      '#multiple' => TRUE,
      '#validated' => TRUE,
      '#attributes' => [
        'class' => ['acs-state-select'],
        'data-saved-values' => json_encode($stored),
      ],
    ];

    $element['value']['#attached']['library'][] = 'acs_custom_country/state_dynamic';

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {

    // Ensure structure always exists.
    if (!isset($values[0]['value']) || !is_array($values[0]['value'])) {
      $values[0]['value'] = [];
    }

    // Clean numeric indexes.
    $clean = array_values($values[0]['value']);

    // Save JSON.
    $values[0]['value'] = json_encode($clean);

    return $values;
  }

}

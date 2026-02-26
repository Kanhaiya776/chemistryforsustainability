<?php

namespace Drupal\acs_custom_country\Plugin\Field\FieldWidget;

use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Multi Country Widget to save data in array.
 *
 * @FieldWidget(
 *   id = "country_multi_widget",
 *   label = @Translation("Multi Country Select"),
 *   field_types = {
 *     "country_multi"
 *   }
 * )
 */
class CountryMultiWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

    // Always use delta 0 (single field storage)
    $delta = 0;

    $countries = \Drupal::service('address.country_repository')->getList();

    // Decode stored JSON safely.
    $stored = [];
    if (!$items->isEmpty() && !empty($items[0]->value)) {
      $decoded = json_decode($items[0]->value, TRUE);
      if (is_array($decoded)) {
        $stored = $decoded;
      }
    }

    $element['value'] = [
      '#type' => 'select2',
      '#title' => $this->fieldDefinition->getLabel(),
      '#options' => $countries,
      '#default_value' => $stored,
      '#multiple' => TRUE,
      '#required' => $this->fieldDefinition->isRequired(),
      '#attributes' => [
        'class' => ['acs-country-select']
      ],
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {
    // The important part: normalize structure.
    if (!isset($values[0]['value']) || !is_array($values[0]['value'])) {
      $values[0]['value'] = [];
    }

    $selected = array_values($values[0]['value']);

    // Save as JSON string.
    $values[0]['value'] = json_encode($selected);

    return $values;
  }

}

<?php

namespace Drupal\ggcp_customs\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'timezone_select' widget.
 *
 * @FieldWidget(
 *   id = "timezone_select",
 *   label = @Translation("Timezone Select"),
 *   field_types = {
 *     "string"
 *   }
 * )
 */
class TimezoneSelectWidget extends WidgetBase {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $timezones = $this->getTimezones();

    $element['value'] = $element + [
      '#type' => 'select',
      '#options' => $timezones,
      '#default_value' => $items[$delta]->value ?? NULL,
      '#empty_option' => $this->t('- Select a timezone -'),
      '#required' => $element['#required'],
    ];

    return $element;
  }

  /**
   * Create a timezone options with GMT.
   */
  protected function getTimezones() {
    $timezones = \DateTimeZone::listIdentifiers();
    $now = new \DateTime();
    $options = [];

    foreach ($timezones as $timezone) {
      try {
        $tz = new \DateTimeZone($timezone);
        $offset = $now->setTimezone($tz)->format('P');
        $abbr = $now->format('T');
        $display_name = str_replace(['_', '/'], [' ', ' / '], $timezone);
        [$continent] = explode('/', $timezone, 2);
        if (!isset($options[$continent])) {
          $options[$continent] = [];
        }
        $value_with_abbr = $timezone . '|' . $abbr;
        $options[$continent][$value_with_abbr] = $this->t('@name (GMT@offset @abbr)', [
          '@name' => $display_name,
          '@offset' => $offset,
          '@abbr' => $abbr,
        ]);
      }
      catch (\Exception $e) {
        continue;
      }
    }

    ksort($options);
    foreach ($options as &$continent) {
      asort($continent);
    }

    return $options;
  }

}

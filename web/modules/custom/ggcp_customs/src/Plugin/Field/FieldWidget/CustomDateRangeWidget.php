<?php

namespace Drupal\ggcp_customs\Plugin\Field\FieldWidget;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\datetime_range\Plugin\Field\FieldWidget\DateRangeWidgetBase;

/**
 * Custom widget to override date range validation message.
 *
 * @FieldWidget(
 *   id = "custom_date_range_widget",
 *   label = @Translation("Custom Date Range Widget"),
 *   field_types = {
 *     "daterange"
 *   }
 * )
 */
class CustomDateRangeWidget extends DateRangeWidgetBase {

  /**
   * Custom date time range validation.
   */
  public function validateStartEnd(array &$element, FormStateInterface $form_state, array &$complete_form) {
    $start_date = $element['value']['#value']['object'];
    $end_date = $element['end_value']['#value']['object'];

    if ($start_date instanceof DrupalDateTime && $end_date instanceof DrupalDateTime) {
      if ($start_date->getTimestamp() !== $end_date->getTimestamp()) {
        $interval = $start_date->diff($end_date);
        if ($interval->invert === 1) {
          $form_state->setError($element, $this->t('The end date time must be after the start date time for @title.', ['@title' => $element['#title']]));
        }
      }
    }
  }

}

<?php

namespace Drupal\ggcp_customs;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Datetime\Element\DateElementBase as ElementDateElementBase;

/**
 * {@inheritdoc}
 */
class CustomDatetimeValidator extends ElementDateElementBase {

  /**
   * {@inheritdoc}
   */
  public function getInfo() {

  }

  /**
   * {@inheritdoc}
   */
  public static function validateDatetime(&$element, FormStateInterface $form_state, &$complete_form) {
    $training_format = $form_state->getValue('field_training_format') ?? NULL;
    $training_date = $form_state->getValue('field_time_of_training') ?? NULL;
    $input_exists = FALSE;
    $input = NestedArray::getValue($form_state->getValues(), $element['#parents'], $input_exists);
    if ($input_exists) {
      $title = static::getElementTitle($element, $complete_form);

      if (empty($input['date']) && empty($input['time']) && !$element['#required']) {
        $form_state->setValueForElement($element, NULL);
      }
      elseif (empty($input['date']) && empty($input['time']) && $element['#required']) {
        $form_state->setError($element, t('The %field date is required.', ['%field' => $title]));
      }
      else {
        $date = $input['object'];
        if ($date instanceof DrupalDateTime && !$date->hasErrors()) {
          $form_state->setValueForElement($element, $date);
        }
        else {
          if (!empty($training_format) && in_array($training_format[0]['target_id'], [1950, 1951]) && !empty($training_date)) {
            $form_state->setErrorByName('field_time_of_training',
              'Both date and time must be specified for the training period.'
            );
          }
          else {
            $updatedDate = new DrupalDateTime($input["date"] . '00:01:00');
            $input['object'] = $updatedDate;
            $date = $input['object'];
            if ($date instanceof DrupalDateTime && !$date->hasErrors()) {
              $form_state->setValueForElement($element, $date);
            }
            else {
              $form_state->setError($element, t('The %field date is invalid. Enter a date in the correct format.', ['%field' => $title]));
            }
          }
        }
      }
    }
  }

}

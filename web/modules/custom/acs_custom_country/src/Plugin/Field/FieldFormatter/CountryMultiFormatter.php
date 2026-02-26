<?php

namespace Drupal\acs_custom_country\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Link;
use Drupal\Core\Url;

/**
 * Plugin implementation of the 'country_multi_formatter'.
 *
 * @FieldFormatter(
 *   id = "country_multi_formatter",
 *   label = @Translation("Country Names (JSON)"),
 *   field_types = {
 *     "country_multi"
 *   }
 * )
 */
class CountryMultiFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'link_to_country' => FALSE,
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $elements['link_to_country'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Link to country page'),
      '#default_value' => $this->getSetting('link_to_country'),
    ];

    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];

    $summary[] = $this->getSetting('link_to_country')
      ? $this->t('Countries are linked')
      : $this->t('Countries are not linked');

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {

    $elements = [];
    $countries = \Drupal::service('address.country_repository')->getList();
    $link_enabled = $this->getSetting('link_to_country');

    foreach ($items as $delta => $item) {

      $values = json_decode($item->value, TRUE);
      if (!is_array($values)) {
        $values = [];
      }

      $labels = [];

      foreach ($values as $code) {
        if (isset($countries[$code])) {
          if ($link_enabled) {

            $url = Url::fromUserInput('/country/' . $code);
            $labels[] = Link::fromTextAndUrl($countries[$code], $url)->toRenderable();
          }
          else{
            $labels[] = [
              '#markup' => $countries[$code],
            ];
          }
        }
      }

      $elements[$delta] = [
        '#type' => 'container',
      ];

      foreach ($labels as $index => $link) {
        $elements[$delta][$index] = $link;

        // Add comma except last item.
        if ($index < count($labels) - 1) {
          $elements[$delta]['comma_' . $index] = [
            '#markup' => ', ',
          ];
        }
      }
    }

    return $elements;
  }

}

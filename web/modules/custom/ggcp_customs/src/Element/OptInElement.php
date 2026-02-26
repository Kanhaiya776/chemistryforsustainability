<?php

namespace Drupal\ggcp_customs\Element;

use Drupal\Core\Render\Element\FormElementBase;

/**
 * Provides a 'contact_enabled_element' Webform element.
 *
 * @FormElementBase("opt_in_element")
 */
class OptInElement extends FormElementBase {

  /**
   * {@inheritdoc}
   */
  public function getInfo() {
    $class = get_class($this);
    return [
      '#input' => TRUE,
      '#pre_render' => [
        [$class, 'preRenderContactEnabledElement'],
      ],
      '#theme' => 'input',
      '#theme_wrappers' => ['form_element'],
    ];
  }

  /**
   * Pre-render callback for the 'contact_enabled_element' element.
   */
  public static function preRenderContactEnabledElement(array $element) {
    $element['#attributes']['type'] = 'checkbox';
    return $element;
  }

}

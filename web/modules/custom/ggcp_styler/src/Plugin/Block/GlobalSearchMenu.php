<?php

namespace Drupal\ggcp_styler\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'GlobalSearchMenu' block.
 *
 * @Block(
 *   id = "global_search_menu",
 *   admin_label = @Translation("Globale search for menu"),
 *   category = @Translation("Custom")
 * )
 */
class GlobalSearchMenu extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $form = \Drupal::formBuilder()->getForm('\Drupal\ggcp_styler\Form\GlobalSearchMenuForm');
    return $form;
  }

}

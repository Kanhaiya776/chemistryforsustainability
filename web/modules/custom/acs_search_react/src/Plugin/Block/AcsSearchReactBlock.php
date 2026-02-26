<?php

namespace Drupal\acs_search_react\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a custom block to render a React app.
 *
 * @Block(
 *   id = "acs_search_react_block",
 *   admin_label = @Translation("ACS Search React Block"),
 *   category = @Translation("Custom")
 * )
 */
class AcsSearchReactBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#theme' => 'acs_search_react_block',
      '#attached' => [
        'library' => ['acs_search_react/acs_search_react.bundle'],
      ],
    ];
  }

}

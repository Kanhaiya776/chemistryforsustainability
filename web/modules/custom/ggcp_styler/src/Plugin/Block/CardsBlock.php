<?php

namespace Drupal\ggcp_styler\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\CacheBackendInterface;

/**
 * Provides a 'Powered By' Block.
 *
 * @Block(
 *   id = "cards_block",
 *   admin_label = @Translation("Cards Block"),
 *   category = @Translation("Skvare"),
 * )
 */
class CardsBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#theme' => 'cards_block',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return CacheBackendInterface::CACHE_PERMANENT;
  }

}

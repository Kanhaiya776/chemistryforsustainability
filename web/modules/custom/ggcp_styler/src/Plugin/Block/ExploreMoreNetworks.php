<?php

namespace Drupal\ggcp_styler\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\CacheBackendInterface;

/**
 * Provides a 'Explore More Netwrosk' Block.
 *
 * @Block(
 *   id = "explore_more_networks",
 *   admin_label = @Translation("Explore More Networks"),
 *   category = @Translation("Skvare"),
 * )
 */
class ExploreMoreNetworks extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#theme' => 'explore_more_networks',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return CacheBackendInterface::CACHE_PERMANENT;
  }

}

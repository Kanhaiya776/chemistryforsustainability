<?php

namespace Drupal\ggcp_styler\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\CacheBackendInterface;

/**
 * Provides a 'Powered By' Block.
 *
 * @Block(
 *   id = "banner_wrapper",
 *   admin_label = @Translation("Banner Wrapper"),
 *   category = @Translation("Skvare"),
 * )
 */
class BannerWrapper extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {

    $blockManager = \Drupal::service('plugin.manager.block');
    $cardsBlock = $blockManager->createInstance('cards_block')->build();

    return [
      '#theme' => 'banner_wrapper',
      '#cards_block' => $cardsBlock,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return CacheBackendInterface::CACHE_PERMANENT;
  }

}

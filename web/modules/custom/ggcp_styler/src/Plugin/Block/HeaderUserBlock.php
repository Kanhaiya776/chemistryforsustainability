<?php

namespace Drupal\ggcp_styler\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Url;

/**
 * Provides a 'Powered By' Block.
 *
 * @Block(
 *   id = "header_user_block",
 *   admin_label = @Translation("User block."),
 *   category = @Translation("Skvare"),
 * )
 */
class HeaderUserBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $currentPath = Url::fromRoute('<current>')->toString();

    return [
      '#theme' => 'header_user_block',
      '#redirectUrl' => $currentPath,
      '#cache' => [
        'tags' => Cache::mergeTags(parent::getCacheTags(), ['url.path.alias:' . $currentPath]),
        'contexts' => Cache::mergeContexts(parent::getCacheContexts(), ['url.path']),
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return CacheBackendInterface::CACHE_PERMANENT;
  }

}

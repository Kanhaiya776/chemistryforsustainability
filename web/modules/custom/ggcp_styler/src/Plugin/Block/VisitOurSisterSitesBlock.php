<?php

namespace Drupal\ggcp_styler\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\CacheBackendInterface;

/**
 * Provides a 'Powered By' Block.
 *
 * @Block(
 *   id = "visit_our_sister_sites_block",
 *   admin_label = @Translation("Visit Our Sister Sites Block"),
 *   category = @Translation("Skvare"),
 * )
 */
class VisitOurSisterSitesBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#theme' => 'visit_our_sister_sites_block',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return CacheBackendInterface::CACHE_PERMANENT;
  }

}

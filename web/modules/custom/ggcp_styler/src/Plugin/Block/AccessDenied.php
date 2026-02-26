<?php

namespace Drupal\ggcp_styler\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Powered By' Block.
 *
 * @Block(
 *   id = "access_denied",
 *   admin_label = @Translation("Access denied"),
 *   category = @Translation("Skvare"),
 * )
 */
class AccessDenied extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $request = \Drupal::request();
    $redirectPath = $request->query->get('redirect');
    $destination = $request->query->get('destination');

    return [
      '#theme' => 'access_denied',
      '#redirectPath' => $redirectPath,
      '#destination' => $destination,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return 0;
  }

}

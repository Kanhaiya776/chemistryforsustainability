<?php

namespace Drupal\ggcp_styler\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Powered By' Block.
 *
 * @Block(
 *   id = "search_bar_block",
 *   admin_label = @Translation("Search Bar"),
 *   category = @Translation("Skvare"),
 * )
 */
class SearchBarBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['extra_class'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Extra CSS class'),
      '#default_value' => $this->configuration['extra_class'] ?? '',
      '#description' => $this->t('Enter an extra CSS class to apply to this block.'),
    ];

    $form['display_background_image'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Display Background Image'),
      '#default_value' => $this->configuration['display_background_image'] ?? FALSE,
      '#description' => $this->t('Check this box to display the background image.'),
    ];

    return parent::buildConfigurationForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    $this->configuration['extra_class'] = $form_state->getValue('extra_class');
    $this->configuration['display_background_image'] = $form_state->getValue('display_background_image');
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#theme' => 'search_bar_block',
      '#extra_class' => $this->configuration['extra_class'] ?? '',
      '#display_background_image' => $this->configuration['display_background_image'] ?? FALSE,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return CacheBackendInterface::CACHE_PERMANENT;
  }

}

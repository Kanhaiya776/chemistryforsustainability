<?php

namespace Drupal\ggcp_styler\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Powered By' Block.
 *
 * @Block(
 *   id = "powered_by_block",
 *   admin_label = @Translation("Powered by"),
 *   category = @Translation("Skvare"),
 * )
 */
class PoweredByBlock extends BlockBase {

  /**
   * ACS address.
   *
   * @var string
   */
  private $acsAddress = 'American Chemical Society,</br> 1155 Sixteenth Street, NW, Washington, DC</br> 20036 USA';

  /**
   * GGCP address.
   *
   * @var string
   */
  private $ggcpAddress = 'Center for Green Chemistry & Green Engineering at Yale,</br> 370 Prospect Street,</br> New Haven, CT 06511 USA';

  /**
   * GCTLC address.
   *
   * @var string
   */
  private $beyondBenignAddress = 'Beyond Benign,</br> 18 Church Street, P.O. Box 1016,</br> Wilmington, MA 01887 USA';

  /**
   * {@inheritdoc}
   */
  public function build() {
    // Retrieve the configured values.
    $config = $this->getConfiguration();

    // Fetch values or use defaults.
    $acsAddress = !empty($config['acs_address']) ? $config['acs_address'] : $this->acsAddress;
    $beyongBenignAddress = !empty($config['beyongbenign_address']) ? $config['beyongbenign_address'] : $this->beyondBenignAddress;
    $ggcpAddress = !empty($config['ggcp_address']) ? $config['ggcp_address'] : $this->ggcpAddress;

    return [
      '#theme' => 'powered_by_block',
      '#acs_address' => [
        '#type' => 'processed_text',
        '#text' => $this->acsAddress,
        '#format' => 'full_html',
      ],
      '#beyongbenign_address' => [
        '#type' => 'processed_text',
        '#text' => $this->beyondBenignAddress,
        '#format' => 'full_html',
      ],
      '#ggcp_address' => [
        '#type' => 'processed_text',
        '#text' => $this->ggcpAddress,
        '#format' => 'full_html',
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form = parent::blockForm($form, $form_state);

    $config = $this->getConfiguration();

    $form['acs_address'] = [
      '#type' => 'textfield',
      '#title' => $this->t('American Chemical Society Address'),
      '#default_value' => $config['acs_address'] ?? $this->acsAddress,
    ];

    $form['beyongbenign_address'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Beyong Benign Address'),
      '#default_value' => $config['beyongbenign_address'] ?? $this->beyondBenignAddress,
    ];

    $form['ggcp_address'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Center for Green Chemistry & Green Engineering at Yale Adress'),
      '#default_value' => $config['ggcp_address'] ?? $this->ggcpAddress,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    // Save the form values to block configuration.
    $this->configuration['acs_address'] = $form_state->getValue('acs_address');
    $this->configuration['beyongbenign_address'] = $form_state->getValue('beyongbenign_address');
    $this->configuration['ggcp_address'] = $form_state->getValue('ggcp_address');
  }

  /**
   * {@inheritdoc}
   */
  public function getDefaultConfiguration() {
    return [
      'acs_address' => $this->acsAddress,
      'beyongbenign_address' => $this->beyondBenignAddress,
      'ggcp_address' => $this->ggcpAddress,
    ] + parent::getDefaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return CacheBackendInterface::CACHE_PERMANENT;
  }

}

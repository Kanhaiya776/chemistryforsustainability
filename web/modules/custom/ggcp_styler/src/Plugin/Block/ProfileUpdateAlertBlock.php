<?php

namespace Drupal\ggcp_styler\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;
use Drupal\user\Entity\User;

/**
 * Provides a Profile Update Alert block.
 *
 * @Block(
 *   id = "profile_update_alert_block",
 *   admin_label = @Translation("Profile update alert"),
 * )
 */
class ProfileUpdateAlertBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    \Drupal::messenger()->addWarning(
      $this->t('Please update your profile below to help other users find and connect with you. If you prefer to start browsing the site right away, you can do so using the navigation menu above.')
    );

    return [
      '#markup' => '',
      '#cache' => [
        'contexts' => ['user'],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    // Only for logged-in users.
    if ($account->isAnonymous()) {
      return AccessResult::forbidden();
    }

    /** @var \Drupal\user\Entity\User $user */
    $user = User::load($account->id());

    // Check if field exists and is empty.
    if ($user && $user->hasField('field_profile_updated')) {
      $value = $user->get('field_profile_updated')->value;

      if (empty($value)) {
        return AccessResult::allowed();
      }
    }

    return AccessResult::forbidden();
  }

}

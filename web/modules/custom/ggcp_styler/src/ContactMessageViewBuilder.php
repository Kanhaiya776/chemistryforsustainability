<?php

namespace Drupal\ggcp_styler;

use Drupal\contact\MessageViewBuilder;
use Drupal\Core\Entity\EntityInterface;

/**
 * Customized contact message view that does not do HTML to plain conversion.
 */
class ContactMessageViewBuilder extends MessageViewBuilder {

  /**
   * {@inheritdoc}
   */
  public function view(EntityInterface $entity, $view_mode = 'full', $langcode = NULL) {
    $build = parent::view($entity, $view_mode, $langcode);
    unset($build['#post_render']);
    return $build;
  }

}

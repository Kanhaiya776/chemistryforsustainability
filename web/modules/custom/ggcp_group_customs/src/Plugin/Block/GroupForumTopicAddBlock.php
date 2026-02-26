<?php

namespace Drupal\ggcp_group_customs\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'GroupForumTopicAddBlock' block.
 *
 * @Block(
 *  id = "ggcp_group_customs_group_forum_topic_add_block",
 *  admin_label = @Translation("Group Forum Topic Add"),
 * )
 */
class GroupForumTopicAddBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManager
   */
  private $entityTypeManager;

  /**
   * The current request.
   *
   * @var \Symfony\Component\HttpFoundation\Request
   */
  protected $currentRequest;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $instance = new static($configuration, $plugin_id, $plugin_definition);
    $instance->entityTypeManager = $container->get('entity_type.manager');
    $instance->currentRequest = $container->get('request_stack')->getCurrentRequest();
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#markup' => 'Hi',
      '#cache' => ['max-age' => 0],
    ];
    $url_params = $this->currentRequest->query->all();
    $current_uri = $this->currentRequest->getRequestUri();
    if (strpos($current_uri, '/forum/') === 0) {
      $url_comps = explode('/', $current_uri);
      $user = \Drupal::currentUser();
      if (!empty($url_comps[2]) && $user->hasPermission('create forum content')) {
        $tid = $url_comps[2];
        $results = $this->entityTypeManager->getStorage('group_relationship')->loadByProperties([
          'plugin_id' => 'group_term:forums',
          'entity_id' => $tid,
        ]);
        if (!empty($results)) {
          $result = reset($results);
          $group = $result->getGroup();
          $group_id = $group->id();
          $group_link = 'group/' . $group->id() . '/content/create/group_node%3Aforum';
          $link = '<a href="/' . $group_link . '?forum_id=' . $tid . '" class="btn btn-secondary" data-drupal-link-query="{&quot;forum_id&quot;:&quot;789&quot;}" data-drupal-link-system-path="' . $group_link . '">Add new Forum topic</a>';
        }
        else {
          $link = '<a href="/node/add/forum?forum_id=' . $tid . '" class="btn btn-secondary" data-drupal-link-query="{&quot;forum_id&quot;:&quot;789&quot;}" data-drupal-link-system-path="node/add/forum">Add new Forum topic</a>';
        }
      }
    }
    $build['#attached']['library'][] = 'ggcp_group_customs/forum_topic_add';
    if (!empty($link)) {
      $build['#markup'] = $style . $link;
    }
    return $build;
  }

}

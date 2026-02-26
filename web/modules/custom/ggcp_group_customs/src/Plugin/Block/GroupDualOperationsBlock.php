<?php

namespace Drupal\ggcp_group_customs\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Menu\LocalTaskManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\CurrentRouteMatch;
use Drupal\Core\Session\AccountProxy;
use Drupal\Core\Url;
use Drupal\group\Entity\GroupInterface;
use Drupal\group\Plugin\Group\Relation\GroupRelationInterface;
use Drupal\group\Plugin\Group\Relation\GroupRelationTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a block with operations the user can perform on a group.
 *
 * @Block(
 *   id = "group_dual_operations",
 *   admin_label = @Translation("Group Dual operations"),
 *   context_definitions = {
 *     "group" = @ContextDefinition("entity:group")
 *   }
 * )
 */
class GroupDualOperationsBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The group relation type manager.
   *
   * @var \Drupal\group\Plugin\Group\Relation\GroupRelationTypeManagerInterface
   */
  protected $pluginManager;

  /**
   * The current user object.
   *
   * @var \Drupal\Core\Session\AccountProxy
   */
  protected $currentUser;

  /**
   * The current route match service.
   *
   * @var \Drupal\Core\Routing\CurrentRouteMatch
   */
  protected $currentRouteMatch;

  /**
   * The menu local tasks manager.
   *
   * @var \Drupal\Core\Menu\LocalTaskManagerInterface
   */
  protected $localTaskManager;

  /**
   * Creates a GroupOperationsBlock instance.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\group\Plugin\Group\Relation\GroupRelationTypeManagerInterface $plugin_manager
   *   The group relation type manager.
   * @param \Drupal\Core\Session\AccountProxy $current_user
   *   The current user.
   * @param \Drupal\Core\Menu\LocalTaskManagerInterface $local_task_manager
   *   The local menu task manager.
   * @param \Drupal\Core\Routing\CurrentRouteMatch $current_route_match
   *   The current route match service.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, GroupRelationTypeManagerInterface $plugin_manager, AccountProxy $current_user, LocalTaskManagerInterface $local_task_manager, CurrentRouteMatch $current_route_match) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->pluginManager = $plugin_manager;
    $this->currentUser = $current_user;
    $this->localTaskManager = $local_task_manager;
    $this->currentRouteMatch = $current_route_match;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('group_relation_type.manager'),
      $container->get('current_user'),
      $container->get('plugin.manager.menu.local_task'),
      $container->get('current_route_match')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [];

    // The operations available in this block vary per the current user's group
    // permissions. It obviously also varies per group, but we cannot know for
    // sure how we got that group as it is up to the context provider to
    // implement that. This block will then inherit the appropriate cacheable
    // metadata from the context, as set by the context provider.
    $cacheable_metadata = new CacheableMetadata();
    $cacheable_metadata->setCacheContexts(['user.group_permissions']);

    // The Group context is required, but the value could have no ID yet. We
    // need to make sure we do not try to build links with a new Group entity.
    $group = $this->getContextValue('group');
    if ($group->id()) {
      assert($group instanceof GroupInterface);
      $links = [];
      $group_route_parameters = ['group' => $group->id()];

      // Retrieve the operations and cacheable metadata from the plugins.
      foreach ($group->getGroupType()->getInstalledPlugins() as $plugin) {
        assert($plugin instanceof GroupRelationInterface);
        $operation_provider = $this->pluginManager->getOperationProvider($plugin->getRelationTypeId());
        $operations = $operation_provider->getGroupOperations($group);
        $cacheable_metadata = $cacheable_metadata->merge(CacheableMetadata::createFromRenderArray($operations));
        unset($operations['#cache']);
        $links += $operations;
      }

      // $tasks = $this->localTaskManager->getLocalTasks($this->currentRouteMatch->getRouteName());
      $tab_links = [];
      if (!empty($tasks['tabs'])) {
        if (isset($tasks['tabs']['views_view:view.group_forums_tab.page_1'])) {
          $tasks['tabs']['views_view:view.group_forums_tab.page_1']['#weight'] = 20;
        }
        uasort($tasks['tabs'], [$this, "tabsSort"]);
        $exclude_routes = [
          'entity.version_history:group.version_history',
          'group.version_history',
          'layout_builder_ui:layout_builder.overrides.group.view',
          'devel.entities:group.devel_tab',
          'group.delete_form',
          'content_moderation.workflows:group.latest_version_tab',
        ];
        foreach ($tasks['tabs'] as $tab_route => $tab) {
          if (!in_array($tab_route, $exclude_routes)) {
            if ($tab['#link']['url']->access($this->currentUser)) {
              $tab_links[$tab_route] = $tab['#link'];
            }
          }
        }
      }
      else {
        $tab_links['entity.group.canonical'] = [
          'title' => t('View Group'),
          'url' => Url::fromRoute('entity.group.canonical', $group_route_parameters),
        ];
      }
      if (!empty($tab_links)) {
        $build['tabs'] = [
          '#theme' => 'links',
          '#links' => $tab_links,
        ];
      }

      if ($links) {
        // Sort the operations by weight.
        uasort($links, '\Drupal\Component\Utility\SortArray::sortByWeightElement');

        foreach ($links as $link_key => $link) {
          if (strpos($link_key, 'group_node-create') === 0) {
            $content_links[$link_key] = $link;
            unset($links[$link_key]);
          }
        }
        if (isset($content_links['group_node-create-forum'])) {
          unset($content_links['group_node-create-forum']);
        }

        // Determine if user has permission to View route.
        $build['menu_operations'] = [
          '#theme' => 'links',
          '#links' => $links,
          '#heading' => [
            'text' => t('Actions'),
            'level' => 'h2',
          ],
        ];
        $build['menu_content'] = [
          '#theme' => 'links',
          '#links' => $content_links,
          '#heading' => [
            'text' => t('Content'),
            'level' => 'h2',
          ],
        ];
      }
    }

    // Set the cacheable metadata on the build.
    $cacheable_metadata->applyTo($build);

    return $build;
  }

  /**
   * Sorts tabs by weight.
   *
   * @param array $a
   *   One element.
   * @param array $b
   *   Another element.
   *
   * @return int
   *   The sort value.
   */
  private function tabsSort($a, $b) {
    return ($a['#weight'] < $b['#weight']) ? -1 : 1;
  }

}

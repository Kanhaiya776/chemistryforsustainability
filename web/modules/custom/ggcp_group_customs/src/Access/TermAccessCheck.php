<?php

namespace Drupal\ggcp_group_customs\Access;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Entity\EntityTypeManager;
use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\Core\Routing\CurrentRouteMatch;
use Drupal\Core\Session\AccountInterface;

/**
 * Check group_term access for a taxonomy term.
 */
class TermAccessCheck implements AccessInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManager
   */
  private $entityTypeManager;

  /**
   * The current route match service.
   *
   * @var \Drupal\Core\Routing\CurrentRouteMatch
   */
  protected $currentRouteMatch;

  /**
   * CustomAccessCheck constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManager $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Routing\CurrentRouteMatch $current_route_match
   *   The current route match service.
   */
  public function __construct(EntityTypeManager $entity_type_manager, CurrentRouteMatch $current_route_match) {
    $this->entityTypeManager = $entity_type_manager;
    $this->currentRouteMatch = $current_route_match;
  }

  /**
   * A custom access check.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   Run access checks for this account.
   *
   * @return \Drupal\Core\Access\AccessResultInterface
   *   The access result.
   */
  public function access(AccountInterface $account) {
    // Check permissions and combine with any custom access checking needed.
    // Pass forward parameters from the route and/or request as needed.
    $parameters = $this->currentRouteMatch->getParameters();
    if ($parameters->has('taxonomy_term')) {
      $term = $parameters->get('taxonomy_term');
      $access = $term->access('view', $account);
      return ($access) ? AccessResult::allowed() : AccessResult::forbidden();
    }
    return AccessResult::allowed();
  }

}

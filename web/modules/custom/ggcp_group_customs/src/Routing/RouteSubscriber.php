<?php

namespace Drupal\ggcp_group_customs\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Listens to the dynamic route events.
 */
class RouteSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection) {
    // Define custom access for '/form/{term}'.
    if ($route = $collection->get('forum.page')) {
      $route->setRequirement('_term_access_check', 'ggcp_group_customs.term_access_checker::access');
    }
  }

}

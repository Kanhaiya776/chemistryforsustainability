<?php

namespace Drupal\ggcp_customs\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Check for the forums event.
 */
class ForumRedirectSubscriber implements EventSubscriberInterface {

  /**
   * Get subscribed events.
   */
  public static function getSubscribedEvents() {
    return [
      KernelEvents::REQUEST => ['checkForumPath', 30],
    ];
  }

  /**
   * Check the path and redirect.
   */
  public function checkForumPath(RequestEvent $event) {
    $request = $event->getRequest();

    // Check if the path is exactly /forum.
    if ($request->getPathInfo() === '/forum') {
      // Redirect to your desired path.
      $redirect_response = new RedirectResponse('/user', 301);
      $event->setResponse($redirect_response);
    }
  }

}

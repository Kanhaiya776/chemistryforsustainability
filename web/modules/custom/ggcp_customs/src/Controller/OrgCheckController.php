<?php

namespace Drupal\ggcp_customs\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Handles AJAX requests for checking duplicate organization titles.
 *
 * This controller is used by Webform client-side validation to
 * determine whether an Organization node with the same title
 * already exists.
 *
 * It is safe for anonymous access and does not perform access checks
 * on entities because it is used only for validation.
 */
class OrgCheckController extends ControllerBase {

  /**
   * Checks whether an organization title already exists.
   */
  public function check(Request $request): JsonResponse {
    $data = json_decode($request->getContent(), TRUE) ?? [];
    $name = trim($data['search'] ?? '');

    if (strlen($name) < 3) {
      return new JsonResponse(['exists' => FALSE]);
    }

    $query = \Drupal::entityQuery('node')
      ->accessCheck(FALSE)
      ->condition('type', 'organization')
      ->condition('title', $name)
      ->range(0, 1);

    // Ignore current node during edit.
    if (!empty($data['nid'])) {
      $query->condition('nid', (int) $data['nid'], '!=');
    }

    return new JsonResponse(['exists' => (bool) $query->execute()]);
  }

}

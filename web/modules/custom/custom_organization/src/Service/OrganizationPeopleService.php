<?php

namespace Drupal\custom_organization\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\node\NodeInterface;
use Drupal\user\UserInterface;

class OrganizationPeopleService {

  protected EntityTypeManagerInterface $entityTypeManager;
  protected OrganizationCreatorService $creatorService;

  public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
    OrganizationCreatorService $creatorService
  ) {
    $this->entityTypeManager = $entityTypeManager;
    $this->creatorService = $creatorService;
  }

  /**
   * Get related people for an organization (reverse user reference).
   *
   * @param \Drupal\node\NodeInterface $organization
   *   Organization node.
   *
   * @return array[]
   *   User details arrays.
   */
  public function getRelatedPeople(NodeInterface $organization): array {
    $people = [];

    $org_nid = (int) $organization->id();
    if ($org_nid <= 0) {
      return $people;
    }

    // 1. Find users referencing this organization.
    $uids = $this->entityTypeManager
      ->getStorage('user')
      ->getQuery()
      ->accessCheck(TRUE)
      ->condition('field_organization', $org_nid)
      ->condition('status', 1)
      ->sort('uid', 'ASC')
      ->execute();

    if (empty($uids)) {
      return $people;
    }

    // 2. Hydrate user details via existing service.
    foreach ($uids as $uid) {
      $user = $this->creatorService->getCreatorByUid((int) $uid);
      if ($user) {
        $user['is_creator'] = FALSE;
        $people[$uid] = $user;
      }
    }

    return array_values($people);
  }

}

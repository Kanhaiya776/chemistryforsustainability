<?php

namespace Drupal\acs_reports;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * ACS Report Class.
 */
class AcsReportsCounter {

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * The entity type manager.
   *
   * @var Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a new AcsReportsCounter.
   */
  public function __construct(Connection $database, EntityTypeManagerInterface $entity_type_manager) {
    $this->database = $database;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * Get all organizations with active user counts.
   */
  public function getOrganizationsWithUserCounts() {
    // Load all published 'organization' node IDs.
    $org_ids = $this->entityTypeManager
      ->getStorage('node')
      ->getQuery()
      ->accessCheck(FALSE)
      ->condition('type', 'organization')
      ->condition('status', 1)
      ->execute();

    if (empty($org_ids)) {
      return [];
    }

    // Query: Join users with their field_organization data.
    $query = $this->database->select('users_field_data', 'u');
    $query->leftJoin('user__field_organization', 'fo', 'u.uid = fo.entity_id');
    $query->addField('fo', 'field_organization_target_id', 'org_id');
    $query->addExpression('COUNT(*)', 'user_count');
    $query->condition('u.status', 1);
    $query->condition('fo.field_organization_target_id', $org_ids, 'IN');
    $query->groupBy('fo.field_organization_target_id');

    $results = $query->execute()->fetchAllKeyed();

    // Load organization entities.
    $organizations = $this->entityTypeManager->getStorage('node')->loadMultiple($org_ids);

    $output = [];
    foreach ($org_ids as $nid) {
      if (!isset($organizations[$nid])) {
        continue;
      }
      $org = $organizations[$nid];
      $count = $results[$nid] ?? 0;
      $output[] = [
        'id' => $nid,
        'title' => $org->getTitle(),
        'user_count' => (int) $count,
      ];
    }

    return $output;
  }

}

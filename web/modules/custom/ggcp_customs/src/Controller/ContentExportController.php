<?php

namespace Drupal\ggcp_customs\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Response;
use Drupal\node\Entity\Node;
use Drupal\Core\Url;

/**
 * Export content to excel file.
 */
class ContentExportController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function exportContent($selected_nids = '') {
    if ($selected_nids) {
      // Convert comma-separated string to array.
      $nids = explode(',', $selected_nids);

      // Decode base64 values and extract node IDs.
      $node_ids = [];
      foreach ($nids as $encoded) {
        $decoded = base64_decode($encoded);
        if (preg_match('/"(\d+)"/', $decoded, $matches)) {
          $node_ids[] = $matches[1];
        }
      }

      $nodes = Node::loadMultiple($node_ids);
    }
    else {
      // Get all nodes if none selected.
      $query = \Drupal::entityQuery('node')
        ->accessCheck(TRUE)
        ->sort('created', 'DESC');
      $node_ids = $query->execute();
      $nodes = Node::loadMultiple($node_ids);
    }

    // Prepare CSV content.
    $csv = $this->generateCsvContent($nodes);

    // Create response.
    $response = new Response($csv);
    $response->headers->set('Content-Type', 'text/csv');
    $response->headers->set('Content-Disposition', 'attachment; filename="content_export_' . date('Ymd_His') . '.csv"');

    return $response;
  }

  /**
   * Add columns and create a csv.
   */
  private function generateCsvContent($nodes) {
    $rows = [];
    // Add header row.
    $rows[] = [
      'ID', 'Title', 'Content Type', 'Author', 'Created Date',
      'Published', 'URL',
    ];

    // Add content rows.
    foreach ($nodes as $node) {
      $rows[] = [
        $node->id(),
        '"' . str_replace('"', '""', $node->getTitle()) . '"',
        $node->bundle(),
        $node->getOwner()->getDisplayName(),
        date('Y-m-d H:i', $node->getCreatedTime()),
        $node->isPublished() ? "Published" : "Unpublished",
        Url::fromRoute('entity.node.canonical', ['node' => $node->id()], ['absolute' => TRUE])->toString(),
      ];
    }

    // Convert to CSV string.
    $csv = '';
    foreach ($rows as $row) {
      $csv .= implode(',', $row) . "\r\n";
    }

    return $csv;
  }

}

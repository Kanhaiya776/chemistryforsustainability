<?php

namespace Drupal\acs_reports\Controller;

use Symfony\Component\HttpFoundation\Response;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\acs_reports\AcsReportsCounter;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Organization report controller.
 */
class OrganizationReportController extends ControllerBase {

  /**
   * ACS reports counter variable.
   *
   * @var \Drupal\acs_reports\AcsReportsCounter
   */
  protected AcsReportsCounter $counter;

  public function __construct(AcsReportsCounter $counter) {
    $this->counter = $counter;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('acs_reports.counter')
    );
  }

  /**
   * Downloads a CSV of organizations and their active user counts.
   */
  public function downloadUsersCsv() {
    if (!$this->currentUser()->hasPermission('administer users')) {
      throw new AccessDeniedHttpException();
    }

    $filename = 'users_by_organization_' . date('Y-m-d_H-i-s') . '.csv';

    // Use StreamedResponse to avoid loading everything in memory.
    $response = new StreamedResponse();
    $response->setCallback(function () {
      $output = fopen('php://output', 'w');

      // Force Excel compatibility.
      fprintf($output, "\xEF\xBB\xBF");

      // Create Column.
      fputcsv($output, ['Organization ID', 'Organization Name', 'Total Users']);

      // Fetch and write data in one pass.
      $data = $this->counter->getOrganizationsWithUserCounts();
      foreach ($data as $row) {
        fputcsv($output, [
          $row['id'],
          $row['title'],
          $row['user_count'],
        ]);
      }

      fclose($output);
    });

    $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
    $response->headers->set('Content-Disposition', 'attachment; filename="' . $filename . '"');
    $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
    $response->headers->set('Pragma', 'no-cache');
    $response->headers->set('Expires', '0');

    return $response;
  }

}

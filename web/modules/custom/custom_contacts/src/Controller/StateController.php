<?php

namespace Drupal\custom_contacts\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Custom States helper function based on country.
 */
class StateController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  public function getStates($country) {

    try {
      $country = strtoupper($country);
      $subdivision_repository = \Drupal::service('address.subdivision_repository');
      \Drupal::logger('custom_contacts')->info($country);
      // Get all administrative areas (states/provinces)
      $subdivisions = $subdivision_repository->getAll([$country]);

      $options = [];
      foreach ($subdivisions as $code => $subdivision) {
        // $codes = $country . "-" . $code;
        $options[$code] = $subdivision->getName();
      }
    }
    catch (\Exception $e) {
      \Drupal::logger('custom_contacts')->error($e->getMessage());
      $options = [];
    }

    return new JsonResponse($options);
  }

}

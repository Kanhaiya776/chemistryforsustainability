<?php

namespace Drupal\acs_custom_country\Controller;

use CommerceGuys\Addressing\Subdivision\SubdivisionRepositoryInterface as SubdivisionSubdivisionRepositoryInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Get all the states based on country selected.
 */
class StateAjaxController extends ControllerBase {

  /**
   * Variable.
   *
   * @var \CommerceGuys\Addressing\Subdivision\SubdivisionRepositoryInterface
   */
  protected $subdivisionRepository;

  public function __construct(SubdivisionSubdivisionRepositoryInterface $subdivision_repository) {
    $this->subdivisionRepository = $subdivision_repository;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('address.subdivision_repository')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getStates(Request $request) {

    $countries = $request->query->all('countries');
    $options = [];

    if (!empty($countries)) {
      foreach ($countries as $country_code) {

        $subdivisions = $this->subdivisionRepository->getList([$country_code]);

        foreach ($subdivisions as $code => $label) {
          $options[$code] = $label . ' (' . $country_code . ')';
        }
      }
    }

    return new JsonResponse($options);
  }

}

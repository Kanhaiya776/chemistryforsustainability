<?php

namespace Drupal\acs_custom_country\Plugin\Field\FieldFormatter;

use CommerceGuys\Addressing\Subdivision\SubdivisionRepositoryInterface as SubdivisionSubdivisionRepositoryInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * State Formatter.
 *
 * @FieldFormatter(
 *   id = "state_multi_formatter",
 *   label = @Translation("State Names"),
 *   field_types = {
 *     "state_multi"
 *   }
 * )
 */
class StateMultiFormatter extends FormatterBase {

  /**
   * Variable.
   *
   * @var \CommerceGuys\Addressing\Subdivision\SubdivisionRepositoryInterface
   */
  protected $subdivisionRepository;

  public function __construct($plugin_id, $plugin_definition, $field_definition, $settings, $label, $view_mode, $third_party_settings, SubdivisionSubdivisionRepositoryInterface $subdivision_repository) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $label, $view_mode, $third_party_settings);
    $this->subdivisionRepository = $subdivision_repository;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['label'],
      $configuration['view_mode'],
      $configuration['third_party_settings'],
      $container->get('address.subdivision_repository')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];

    // Get the entity.
    $entity = $items->getEntity();
    $countries_in_items = [];

    if ($entity) {
      // Loop through all fields of the entity.
      foreach ($entity->getFieldDefinitions() as $field_name => $field_definition) {
        // Check if the field type is 'country_multi'.
        if ($field_definition->getType() === 'country_multi' && $entity->hasField($field_name) && !$entity->get($field_name)->isEmpty()) {
          $country_val = $entity->get($field_name)->value;
          $countries_in_items = json_decode($country_val, TRUE);
        }
      }
    }

    $all_subdivisions = [];
    if (count($countries_in_items) > 0) {
      $countries_in_items = array_unique($countries_in_items);
      $subdivision_repository = \Drupal::service('address.subdivision_repository');
      // Load only subdivisions for selected countries.
      foreach ($countries_in_items as $countryCode) {
        $subdivisions_data = $subdivision_repository->getList([$countryCode]);
        if (is_array($all_subdivisions)) {
          $all_subdivisions += $subdivisions_data;
        }
      }
    }

    // Iterate over the state items.
    foreach ($items as $delta => $item) {
      $values = json_decode($item->value, TRUE) ?: [];

      $labels = [];

      foreach ($values as $code) {
        if (isset($all_subdivisions[$code])) {
          $labels[] = $all_subdivisions[$code];
        }
        else {
          $labels[] = $code;
        }
      }

      $elements[$delta] = [
        '#markup' => implode(', ', $labels),
      ];
    }

    return $elements;
  }

}

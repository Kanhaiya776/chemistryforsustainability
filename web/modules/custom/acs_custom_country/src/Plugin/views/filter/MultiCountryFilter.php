<?php

namespace Drupal\acs_custom_country\Plugin\views\filter;

use Drupal\views\Plugin\views\filter\FilterPluginBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\views\Annotation\ViewsFilter;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use CommerceGuys\Addressing\Country\CountryRepositoryInterface;

/**
 * Filter multi-country JSON field.
 *
 * @ViewsFilter("multi_country_json_filter")
 */
class MultiCountryFilter extends FilterPluginBase implements ContainerFactoryPluginInterface {

  /**
   * Country repository service.
   *
   * @var \CommerceGuys\Addressing\Country\CountryRepositoryInterface
   */
  protected $countryRepository;

  /**
   * Constructor.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, CountryRepositoryInterface $country_repository) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->countryRepository = $country_repository;
  }

  /**
   * Dependency injection.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('address.country_repository')
    );
  }
  /**
   * {@inheritdoc}
   */
  public function query() {
    $this->ensureMyTable();

    if (empty($this->value)) {
      return;
    }

    $value = $this->value;
    if (is_array($value)) {
      $value = reset($value);
    }


    if (empty($value)) {
      return;
    }
    $search_value = $value;

    // 2. Construct the Search Pattern
    // The DB contains: ["AU", "IN"]
    // We search for the code inside that string using wildcards.
    $pattern = '%' . $search_value . '%';

    // 3. Add the Condition using addWhereExpression with proper table alias
    // @var \Drupal\views\Plugin\views\query\Sql $this->query
    $this->query->addWhereExpression(
      $this->options['group'],
      "$this->tableAlias.field_country_value LIKE :country_pattern",
      [':country_pattern' => $pattern]
    );
  }

  /**
   * {@inheritdoc}
   */
  public function canExpose() {
    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  protected function valueForm(&$form, FormStateInterface $form_state) {
    $countries = $this->countryRepository->getList();

    $form['value'] = [
      '#type' => 'select2',
      '#title' => $this->t('Country'),
      '#options' => $countries,
      '#empty_option' => $this->t('- Select Country -'),
    ];
  }

  /**
   * Convert country name to code.
   *
   * @param string $name
   *   Country name typed by user.
   *
   * @return string|false
   *   Country code if found, FALSE otherwise.
   */
  protected function getCountryCodeByName(string $name) {
    $countries = $this->countryRepository->getList();
    foreach ($countries as $code => $label) {
      if (strcasecmp($label, $name) === 0) {
        return $code;
      }
    }
    return FALSE;
  }

}

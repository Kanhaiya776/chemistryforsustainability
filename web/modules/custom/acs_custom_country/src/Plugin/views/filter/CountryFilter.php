<?php

namespace Drupal\custom_country_filter\Plugin\views\filter;

use Drupal\views\Annotation\ViewsFilter;
use Drupal\views\Plugin\views\filter\StringFilter;
use Drupal\Core\Form\FormStateInterface;

/**
 * Filters by Country field.
 *
 * @ViewsFilter("custom_country_filter")
 */
class CountryFilter extends StringFilter {

  /**
   * {@inheritdoc}
   */
  public function query() {
    $this->ensureMyTable();

    if (!empty($this->value)) {
      $this->query->addWhere(
        $this->options['group'],
        "$this->tableAlias.$this->realField",
        $this->value,
        '='
      );
    }
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
    parent::valueForm($form, $form_state);

    $form['value']['#title'] = $this->t('Country');
  }

}

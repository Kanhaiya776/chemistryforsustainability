<?php

namespace Drupal\ggcp_styler\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

/**
 * Provides a form with a textbox for the navigation menu.
 */
class GlobalSearchMenuForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'global_search_menu';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $form['global_search_text'] = [
      '#type' => 'textfield',
      '#placeholder' => $this->t('Search...'),
      '#size' => 20,
      '#attributes' => ['class' => ['form-control border-right-0 border global_search_box_input']],
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => "",
    ];
    $form['#theme'] = 'global_search_menu';

    return $form;

  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $search_query = $form_state->getValue('global_search_text');
    $form_state->setRedirectUrl(Url::fromUserInput('/search', [
      'query' => ['q' => $search_query],
    ]));
    // $form_state->setRedirect('entity.node.canonical', ['node' => 141], ['query' => ['q' => $search_query]]);
  }

}

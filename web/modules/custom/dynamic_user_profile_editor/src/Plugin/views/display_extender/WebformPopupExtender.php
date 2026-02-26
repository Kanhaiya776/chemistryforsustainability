<?php

namespace Drupal\dynamic_user_profile_editor\Plugin\views\display_extender;

use Drupal\Core\Form\FormStateInterface;
use Drupal\views\Plugin\views\display_extender\DisplayExtenderPluginBase;

/**
 * Display extender plugin to control JSON:API exposure.
 *
 * @ingroup views_display_extender_plugins
 *
 * @ViewsDisplayExtender(
 *   id = "webform_popup_extender",
 *   title = @Translation("Webform Popup"),
 *   help = @Translation("Enables a Webform Popup with edit button and modal trigger URL."),
 *   no_ui = FALSE,
 * )
 */
class WebformPopupExtender extends DisplayExtenderPluginBase {

  /**
   * {@inheritdoc}
   */
  public function defineOptions() {
    return [
      'enable_edit_button' => ['default' => FALSE],
    ] + parent::defineOptions();
  }

  /**
   * {@inheritdoc}
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state) {
    if ($form_state->get('section') == 'webform_popup_extender') {
      $form['enable_edit_button'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Enable Edit Button'),
        '#default_value' => $this->options['enable_edit_button'],
      ];

      $form['modal_trigger_url'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Modal Trigger URL'),
        '#default_value' => $this->options['modal_trigger_url'],
        '#required' => TRUE,
      ];
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitOptionsForm(&$form, FormStateInterface $form_state) {
    if ($form_state->get('section') == 'webform_popup_extender') {
      $this->options['enable_edit_button'] = (bool) $form_state->getValue('enable_edit_button');
      $this->options['modal_trigger_url'] = $form_state->getValue('modal_trigger_url');
    }
  }

  /**
   * {@inheritdoc}
   */
  public function optionsSummary(&$categories, &$options) {
    $categories['webform_popup_extender'] = [
      'title' => $this->t('Webform Popup'),
      'column' => 'second',
    ];

    $options['webform_popup_extender'] = [
      'category' => 'webform_popup_extender',
      'title' => $this->t('Enable Edit Button'),
      'value' => $this->options['enable_edit_button'] ? $this->t('Yes') : $this->t('No'),
    ];
  }

}

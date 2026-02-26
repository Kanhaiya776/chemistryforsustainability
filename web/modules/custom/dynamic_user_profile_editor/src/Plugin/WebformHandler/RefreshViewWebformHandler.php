<?php

namespace Drupal\dynamic_user_profile_editor\Plugin\WebformHandler;

use Drupal\Core\Ajax\InvokeCommand;
use Drupal\Core\Form\FormStateInterface;
use Drupal\views\Views;
use Drupal\webform\Plugin\WebformHandlerBase;
use Drupal\webform\WebformSubmissionInterface;

/**
 * Provides a Webform handler for refreshing a Drupal view.
 *
 * This handler allows you to refresh a Drupal view upon webform submission.
 *
 * @WebformHandler(
 *   id = "refresh_view_webform_handler",
 *   label = @Translation("Refresh View"),
 *   category = @Translation("View"),
 *   description = @Translation("Handles webform submissions to refresh a Drupal view."),
 *   cardinality = \Drupal\webform\Plugin\WebformHandlerInterface::CARDINALITY_SINGLE,
 *   results = \Drupal\webform\Plugin\WebformHandlerInterface::RESULTS_PROCESSED,
 *   submission = \Drupal\webform\Plugin\WebformHandlerInterface::SUBMISSION_REQUIRED,
 * )
 */
class RefreshViewWebformHandler extends WebformHandlerBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'view' => [
        'view_id' => '',
        'display_id' => '',
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['view'] = [
      '#type' => 'details',
      '#title' => $this->t('View Settings'),
    ];

    $options = $this->getEnabledViewsOptions();

    $form['view']['view_id'] = [
      '#type' => 'select',
      '#title' => $this->t('Select a View'),
      '#description' => $this->t('Choose the Drupal view to refresh.'),
      '#options' => $options,
      '#default_value' => $this->configuration['view']['view_id'],
      '#ajax' => [
        'callback' => [$this, 'updateDisplaySelect'],
        'wrapper' => 'edit-output',
      ],
    ];

    $display_options = $this->getDisplayOptions();

    $form['view']['display_id'] = [
      '#type' => 'select',
      '#title' => $this->t('Select a Display'),
      '#description' => $this->t('Choose the display within the selected view.'),
      '#options' => $display_options,
      '#prefix' => '<div id="edit-output">',
      '#suffix' => '</div>',
      '#default_value' => $this->configuration['view']['display_id'],
    ];

    return parent::buildConfigurationForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function alterForm(array &$form, FormStateInterface $form_state, WebformSubmissionInterface $webform_submission) {
    $form['actions']['submit']['#ajax'] = [
      'callback' => [$this, 'viewRefreshAjaxSubmissionCallback'],
    ];
    parent::alterForm($form, $form_state, $webform_submission);
  }

  /**
   * A callback.
   */
  public function viewRefreshAjaxSubmissionCallback(&$form, FormStateInterface $form_state) {
    $form_object = $form_state->getFormObject();
    if ($form_state->hasAnyErrors()) {
      $response = $form_object->submitAjaxForm($form, $form_state);
    }
    else {
      $viewId = $this->configuration['view']['view_id'];
      $displayId = $this->configuration['view']['display_id'];
      $response = $form_object->submitAjaxForm($form, $form_state);
      if (!empty($viewId) && !empty($displayId)) {
        $response->addCommand(new InvokeCommand(NULL, 'refreshViewCallback', [$viewId, $displayId]));
      }
    }
    return $response;
  }

  /**
   * Updates the display select.
   */
  public function updateDisplaySelect(array &$form, FormStateInterface $form_state) {
    $view_id = $form_state->getValue(['settings', 'view', 'view_id']);
    $build = $this->getDisplaySelectRenderArray($view_id);
    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    parent::submitConfigurationForm($form, $form_state);
    $this->applyFormStateToConfiguration($form_state);
  }

  /**
   * Gets enabled views.
   */
  private function getEnabledViewsOptions(): array {
    $views = \Drupal::entityTypeManager()->getStorage('view')->loadMultiple();
    $options = [];
    foreach ($views as $view) {
      $options[$view->id()] = $view->label();
    }
    return $options;
  }

  /**
   * Gets display options.
   */
  private function getDisplayOptions(): array {
    $viewId = $this->configuration['view']['view_id'];
    $display_options = [];
    if (!empty($viewId)) {
      $view = Views::getView($viewId);
      if ($view) {
        $displays = $view->storage->load($viewId)->get('display');
        foreach ($displays as $display_id => $display) {
          $display_options[$display_id] = $display['display_title'];
        }
      }
    }
    return $display_options;
  }

  /**
   * Gets render array.
   */
  private function getDisplaySelectRenderArray($view_id): array {
    $view = Views::getView($view_id);
    $build = [];
    if ($view) {
      $displays = $view->storage->load($view_id)->get('display');
      $display_options = [];
      foreach ($displays as $display_id => $display) {
        $display_options[$display_id] = $display['display_title'];
      }
      $build['view']['display_id'] = [
        '#type' => 'select',
        '#title' => $this->t('Select a Display'),
        '#description' => $this->t('Choose the display within the selected view.'),
        '#options' => $display_options,
        '#prefix' => '<div id="edit-output">',
        '#suffix' => '</div>',
        '#default_value' => $this->configuration['view']['display_id'],
      ];
    }
    return $build;
  }

}

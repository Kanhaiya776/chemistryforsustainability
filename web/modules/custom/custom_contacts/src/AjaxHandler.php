<?php

namespace Drupal\custom_contacts;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\RedirectCommand;
use Drupal\Core\Ajax\ReplaceCommand;

/**
 * Custom Ajax handler for redirection to homepage after registration.
 */
class AjaxHandler {

  /**
   * AJAX callback to redirect user after form submission.
   */
  public static function ajaxRedirectCallback(array &$form, FormStateInterface $form_state) {
    $response = new AjaxResponse();
    if ($form_state->hasAnyErrors()) {
      // Render messages explicitly.
      $messenger = \Drupal::messenger();
      $messages = ['#type' => 'status_messages'];

      // Wrap form and messages together.
      $rendered = [
        '#type' => 'container',
        '#attributes' => ['id' => 'user-registration-wrapper'],
        'messages' => $messages,
        'form' => $form,
      ];

      $response->addCommand(new ReplaceCommand('#user-registration-wrapper', $rendered));
      return $response;
    }

    $url = '/';
    $response->addCommand(new RedirectCommand($url));
    return $response;
  }

}

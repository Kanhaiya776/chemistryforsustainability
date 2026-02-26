<?php

namespace Drupal\ggcp_customs;

use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\InvokeCommand;
use Drupal\Core\Ajax\RedirectCommand;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Markup;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\ggcp_customs\Ajax\UserProfileCloseCommand;

/**
 * Custom Ajax handler for redirection to homepage after registration.
 */
class NewOrganizationAjaxHandler {

  /**
   * AJAX callback to redirect user after form submission.
   */
  public static function ajaxCallback(array &$form, FormStateInterface $form_state) {
    $response = new AjaxResponse();
    $request = \Drupal::request();
    $destination = $request->query->get('destination');
    $redirect = $request->query->get('redirect');
    $orgId = $request->query->get('source_entity_id');

    try {
      if ($form_state->hasAnyErrors()) {
        $form['#attached']['library'][] = 'ggcp_customs/ajax_error_scroll';
        \Drupal::messenger();
        $messages = ['#type' => 'status_messages'];
        $rendered = [
          '#type' => 'container',
          '#attributes' => ['id' => 'add-new-organization-wrapper'],
          'messages' => $messages,
          'form' => $form,
        ];

        $response->addCommand(new ReplaceCommand('#add-new-organization-wrapper', $rendered));
        return $response;
      }
      if ($orgId) {
        $messageData = 'Thank you for submitting an update to this organization page';
        $changes = self::getOrganizationChanges($orgId);

        // Send mail ONLY if something actually changed.
        if (!empty($changes)) {
          self::sendAdminEditNotificationMessage($orgId, $changes);
          \Drupal::logger('ggcp_customs')->notice('Sending mail');
          \Drupal::messenger()->addStatus(Markup::create($messageData));
        }

        $url = Url::fromUserInput("/organization/$orgId")->toString();
        $response->addCommand(new RedirectCommand($url));
        return $response;
      }
      else {
        $messageData = 'Thank you for submitting a new organization';
        if ($destination === '/organizations' && $redirect === '/form/new-organization') {
          \Drupal::messenger()->addStatus(Markup::create($messageData));
          $url = Url::fromUserInput('/organizations')->toString();
          $response->addCommand(new RedirectCommand($url));
          return $response;
        }
        elseif (!empty($redirect)) {
          \Drupal::messenger()->addStatus(Markup::create($messageData));
          $url = $redirect;
          $response->addCommand(new RedirectCommand($url));
          return $response;
        }
        else {
          $customData = [
            'type' => 'userProfile',
          ];
          \Drupal::messenger()->addStatus(Markup::create($messageData));
          $response = new AjaxResponse();
          $response->addCommand(new UserProfileCloseCommand());
          return $response;
        }
      }
    }
    catch (\Exception $e) {
      $errorData = '<div class="alert alert-danger" role="alert">';
      $errorData .= 'Something went wrong please try again after sometime';
      $errorData .= '</div>';
      \Drupal::messenger()->addStatus(Markup::create($errorData));
      return $response;
    }

  }

  /**
   * AJAX callback for update organization.
   */
  public static function ajaxOrganizationUpdateCallback(array &$form, FormStateInterface $form_state) {
    $response = new AjaxResponse();
    $orgId = \Drupal::request()->query->get('cid2');

    try {
      $messageData = 'Thank you for submitting an update to this organization page';
      if ($form_state->hasAnyErrors()) {
        \Drupal::messenger();
        $messages = ['#type' => 'status_messages'];
        $rendered = [
          '#type' => 'container',
          '#attributes' => ['id' => 'update-organization-wrapper'],
          'messages' => $messages,
          'form' => $form,
        ];

        $response->addCommand(new ReplaceCommand('#update-organization-wrapper', $rendered));
        return $response;
      }
      else {
        \Drupal::logger('ggcp_customs')->notice('Sending mail');
        // Send email if any changes were detected.
        self::sendAdminEditNotificationMessages($orgId);
        \Drupal::messenger()->addStatus(Markup::create($messageData));
        $url = Url::fromUserInput("/organization/$orgId")->toString();
        $response->addCommand(new RedirectCommand($url));
        return $response;
      }
    }
    catch (\Exception $e) {
      $errorData = '<div class="alert alert-danger" role="alert">';
      $errorData .= 'Something went wrong please try again after sometime';
      $errorData .= '</div>';
      \Drupal::messenger()->addStatus(Markup::create($errorData));
      return $response;
    }
  }

  /**
   * Sends an email to the site administrator about the updated organization.
   */
  private static function sendAdminEditNotificationMessage(int $orgId, array $changes): void {
    if (empty($changes)) {
      return;
    }

    $entityTypeManager = \Drupal::entityTypeManager();
    $logger = \Drupal::logger('ggcp_customs');
    $admin_email = \Drupal::config('system.site')->get('mail');

    $table  = '<table border="1" cellpadding="6" cellspacing="0" width="100%">';
    $table .= '<thead>
      <tr style="background:#f5f5f5;">
        <th>Field</th>
        <th>Before</th>
        <th>After</th>
      </tr>
    </thead><tbody>';

    foreach ($changes as $change) {
      $table .= '<tr>
        <td>' . htmlspecialchars($change['label']) . '</td>
        <td>' . htmlspecialchars($change['before']) . '</td>
        <td>' . htmlspecialchars($change['after']) . '</td>
      </tr>';
    }

    $table .= '</tbody></table>';

    // Mail body (HTML).
    $body  = '<p>Hello,</p>';
    $body .= '<p>A user has submitted updates to an organization profile.</p>';
    $body .= '<p><strong>Organization ID:</strong> ' . $orgId . '</p>';
    $body .= '<p><strong>Changed fields:</strong></p>';
    $body .= $table;

    $logger->notice(
      'Organization update mail body (Org ID: @id): @body',
      [
        '@id' => $orgId,
        '@body' => $body,
      ]
    );

    try {
      /** @var \Drupal\message\MessageInterface $message */
      $message = $entityTypeManager->getStorage('message')->create([
        'template' => 'organization_update_notification',
        'field_body' => [
          'value' => $body,
          'format' => 'full_html',
        ],
      ]);

      $message->save();

      \Drupal::service('message_notify.sender')->send(
        $message,
        [
          'mail' => $admin_email,
          'save on success' => FALSE,
        ],
        'email'
      );
    }
    catch (\Exception $e) {
      $logger->error(
        'Failed to send organization update notification: @error',
        ['@error' => $e->getMessage()]
      );
    }

  }

  /**
   * Detect changed fields.
   */
  private static function getOrganizationChanges(int $orgId): array {
    $storage = \Drupal::entityTypeManager()->getStorage('node');

    /** @var \Drupal\node\NodeInterface $current */
    $current = $storage->load($orgId);
    /** @var \Drupal\node\NodeInterface|null $previous */
    $previous = self::loadPreviousRevision($orgId);

    // No previous revision → no comparison possible.
    if (!$current || !$previous) {
      return [];
    }

    $tracked_fields = [
      'title' => 'Organization Name',
      'field_organization_acronym' => 'Organization Acronym',
      'field_organization_description' => 'Description',
      'field_sector_custom_select' => 'Sector',
      'field_organization_website' => 'Website',
      'field_add_update_org_logo' => 'Logo',
      'field_city' => 'City',
      'field_street_address' => 'Street Address',
      'field_street_address_line_2' => 'Street Address Line 2',
      'field_postal_code' => 'Postal Code',
      'field_state' => 'Country / State',
      'field_academia_sub_sector' => 'Academia Sub Sector',
      'field_government_sub_sector' => 'Government Sub Sector',
      'field_industry_sub_sector' => 'Industry Sub Sector',
      'field_startup_company' => 'Startup Company',
      'field_linkedin_profile' => 'LinkedIn',
      'field_facebook_profile' => 'Facebook',
      'field_instagram_profile' => 'Instagram',
      'field_wechat_profile' => 'WeChat',
    ];

    $changes = [];

    foreach ($tracked_fields as $field => $label) {
      if (!$current->hasField($field) || !$previous->hasField($field)) {
        continue;
      }

      $old = $previous->get($field)->getValue();
      $new = $current->get($field)->getValue();

      if (serialize($old) !== serialize($new)) {
        $changes[] = [
          'label' => $label,
          'before' => self::formatFieldValue($previous, $field),
          'after' => self::formatFieldValue($current, $field),
        ];
      }
    }

    if ($current->hasField('field_state') && $previous->hasField('field_state')) {

      $old_address = $previous->get('field_state')->first();
      $new_address = $current->get('field_state')->first();

      if ($old_address && $new_address) {

        $map = [
          'country_code' => 'Country',
          'administrative_area' => 'State',
          'locality' => 'City',
          'postal_code' => 'Postal Code',
          'address_line1' => 'Address Line 1',
          'address_line2' => 'Address Line 2',
        ];

        foreach ($map as $key => $label) {
          $old = $old_address->{$key} ?? '';
          $new = $new_address->{$key} ?? '';

          if ($old !== $new) {
            $changes[] = [
              'label' => $label,
              'before' => $old ?: '—',
              'after' => $new ?: '—',
            ];
          }
        }
      }
    }
    return $changes;
  }

  /**
   * Format values for email.
   */
  private static function loadPreviousRevision(int $nid): ?NodeInterface {
    $storage = \Drupal::entityTypeManager()->getStorage('node');

    /** @var \Drupal\node\NodeInterface $current */
    $current = $storage->load($nid);
    if (!$current) {
      return NULL;
    }

    $vids = $storage->revisionIds($current);

    // Need at least 2 revisions to compare.
    if (count($vids) < 2) {
      return NULL;
    }

    // Second last revision = previous.
    $previous_vid = $vids[count($vids) - 2];

    return $storage->loadRevision($previous_vid);
  }

  /**
   * Format values for email.
   */
  private static function formatFieldValue(Node $node, string $field): string {
    if ($node->get($field)->isEmpty()) {
      return '—';
    }

    $item = $node->get($field);
    $type = $item->getFieldDefinition()->getType();

    switch ($type) {
      case 'string':
      case 'string_long':
        return (string) $item->value;

      case 'list_string':
        $allowed = $item->getSetting('allowed_values');
        return $allowed[$item->value] ?? $item->value;

      case 'entity_reference':
        return $item->entity ? $item->entity->label() : '—';

      case 'link':
        return $item->uri;

      case 'file':
      case 'image':
        return $item->entity ? $item->entity->getFilename() : '—';

      case 'address':
        $value = $item->first();
        if (!$value) {
          return '—';
        }
        return trim(sprintf(
          '%s %s, %s, %s %s',
          $value->address_line1 ?? '',
          $value->address_line2 ?? '',
          $value->locality ?? '',
          $value->administrative_area ?? '',
          $value->postal_code ?? ''
        ));

      default:
        return json_encode($item->getValue());
    }
  }

}

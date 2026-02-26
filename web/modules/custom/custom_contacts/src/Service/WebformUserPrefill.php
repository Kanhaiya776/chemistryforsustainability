<?php

namespace Drupal\custom_contacts\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\user\Entity\User;

/**
 * Prefill the webforms values by targeting the fields based on its mapping.
 */
class WebformUserPrefill {

  /**
   * Get entities.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Get entities.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  public function __construct(EntityTypeManagerInterface $entityTypeManager, AccountProxyInterface $currentUser) {
    $this->entityTypeManager = $entityTypeManager;
    $this->currentUser = $currentUser;
  }

  /**
   * Prefill a webform element tree with user field values.
   */
  public function prefillForm(array &$elements, User $user, array $mapping) {
    foreach ($mapping as $webform_key => $user_field) {
      $target = &$this->findElement($elements, explode('.', $webform_key));
      if ($target === NULL) {
        continue;
      }

      $value = $this->getUserFieldValue($user, $user_field);

      // Skip empty values.
      if ($value === NULL || $value === '') {
        continue;
      }

      // webform_address handling.
      if (isset($target['#type']) && $target['#type'] === 'address') {
        $target['#default_value'] = [
          'country_code' => $value,
          'address_1' => '',
          'address_2' => '',
          'locality' => '',
          'administrative_area' => $this->getUserFieldValue($user, 'field_state_province') ?: '',
          'postal_code' => '',
        ];

        continue;
      }

      // Entity autocomplete.
      if (isset($target['#type']) && $target['#type'] === 'entity_autocomplete') {
        if (is_array($value)) {
          // Take the first entity for single-value autocomplete.
          $value = reset($value);
        }

        $storage = $this->entityTypeManager->getStorage($target['#target_type']);
        $entity = $storage->load($value);

        if ($entity) {
          $target['#default_value'] = $entity;
        }

        continue;
      }

      // Multi-value select.
      if ((isset($target['#multiple']) && $target['#multiple']) && !is_array($value)) {
        $value = [$value];
      }

      // Set the default normally for all other fields.
      $target['#default_value'] = $value;
    }
  }

  /**
   * Extract a user field value safely.
   */
  private function getUserFieldValue(User $user, string $field) {
    if (!$user->hasField($field)) {
      return NULL;
    }

    $field_obj = $user->get($field);

    // Typed data: entity reference single.
    if ($field_obj->getFieldDefinition()->getType() === 'entity_reference') {
      if ($field_obj->count() === 1) {
        return $field_obj->target_id;
      }
      return array_column($field_obj->getValue(), 'target_id');
    }

    // Multiple values.
    if ($field_obj->count() > 1) {
      return array_column($field_obj->getValue(), 'value');
    }

    return $field_obj->value ?? NULL;
  }

  /**
   * Recursive search for a form element using dot notation.
   */
  private function &findElement(array &$elements, array $keys, $level = 0) {
    $null = NULL;
    $key = $keys[$level];

    if (!isset($elements[$key])) {
      return $null;
    }

    // Last key: return this element.
    if ($level === count($keys) - 1) {
      return $elements[$key];
    }

    // Continue deeper.
    return $this->findElement($elements[$key], $keys, $level + 1);
  }

}

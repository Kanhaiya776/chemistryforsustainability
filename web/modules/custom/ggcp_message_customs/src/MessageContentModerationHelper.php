<?php

namespace Drupal\ggcp_message_customs;

use Drupal\content_moderation\ModerationInformationInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\RevisionableStorageInterface;

/**
 * Service for notification related questions about the moderated entity.
 */
class MessageContentModerationHelper {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * General service for moderation-related questions about Entity API.
   *
   * @var \Drupal\content_moderation\ModerationInformation
   */
  protected $moderationInformation;

  /**
   * Creates a new MessageContentModerationHelper instance.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\content_moderation\ModerationInformationInterface $moderation_information
   *   The bundle information service.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, ModerationInformationInterface $moderation_information) {
    $this->entityTypeManager = $entity_type_manager;
    $this->moderationInformation = $moderation_information;
  }

  /**
   * Determine if the entity is moderated.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity object.
   */
  public function isModeratedEntity(EntityInterface $entity) {
    return $this->moderationInformation->isModeratedEntity($entity);
  }

  /**
   * Get the previous state.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The entity object.
   */
  public function getPreviousState(ContentEntityInterface $entity) {
    $previous_state = FALSE;
    $workflow = $this->getWorkflow($entity);
    if (isset($entity->last_revision)) {
      $previous_state = $workflow->getTypePlugin()->getState($entity->last_revision->moderation_state->value);

    }

    if (!$previous_state) {
      $previous_state = $workflow->getTypePlugin()->getInitialState($entity);
    }

    return $previous_state;
  }

  /**
   * Get the workflow.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The entity object.
   */
  public function getWorkflow(ContentEntityInterface $entity) {
    return $this->isModeratedEntity($entity) ? $this->moderationInformation
      ->getWorkflowForEntity($entity) : FALSE;
  }

  /**
   * Get the transistion.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The entity object.
   */
  public function getTransition(ContentEntityInterface $entity) {
    $transition = FALSE;
    if (($workflow = $this->getWorkflow($entity))) {
      $current_state = $entity->moderation_state->value;
      $previous_state = $this->getPreviousState($entity)->id();
      if ($current_state != $previous_state) {
        try {
          $transition = $workflow->getTypePlugin()->getTransitionFromStateToState($previous_state, $current_state);
        }
        catch (\InvalidArgumentException $e) {
          // There is no available transition. Fall through to return FALSE.
        }
      }
    }
    return $transition;
  }

  /**
   * Get notifications.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity object.
   * @param bool $is_new
   *   Flag for whether the entity is new.
   */
  public function getNotifications(EntityInterface $entity, $is_new) {
    $notifications = [];
    if ($this->isModeratedEntity($entity)) {
      $workflow = $this->getWorkflow($entity);
      $current_state = $entity->moderation_state->value;
      if ($is_new && $current_state == 'submitted') {
        // Send to moderators.
        $notifications[] = 'moderator_new_node_submitted';
      }
      if ($transition = $this->getTransition($entity)) {
        $transition_id = $transition->id();
        // Send email to moderators when state changes.
        if (!in_array('moderator_new_node_submitted', $notifications)) {
          $notifications[] = 'moderation_state_change';
        }
        $transistions_to_notify_user = [
          'publish',
          'moderation_rejected',
          'reject',
        ];
        if (in_array($transition_id, $transistions_to_notify_user)) {
          // End email to node owner.
          $notifications[] = 'submitted_node_state_change';
        }
      }
    }
    return $notifications;
  }

  /**
   * Get the latest revision.
   *
   * @param string $entity_type_id
   *   The entity type.
   * @param int $entity_id
   *   The entity id.
   */
  public function getLatestRevision($entity_type_id, $entity_id) {
    $storage = $this->entityTypeManager->getStorage($entity_type_id);
    if ($storage instanceof RevisionableStorageInterface
      && $revision_id = $storage->getLatestRevisionId($entity_id)) {
      return $storage->loadRevision($revision_id);
    }
  }

}

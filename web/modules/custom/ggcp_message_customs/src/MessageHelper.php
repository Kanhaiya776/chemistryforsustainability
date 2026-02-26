<?php

namespace Drupal\ggcp_message_customs;

use Drupal\comment\Entity\Comment;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\message\Entity\Message;
use Drupal\message_notify\MessageNotifier;
use Drupal\node\NodeInterface;
use Drupal\user\UserInterface;

/**
 * Service to handle message creation and notification logic.
 */
class MessageHelper {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * The entity type manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The content moderation helper service.
   *
   * @var \Drupal\ggcp_message_customs\MessageContentModerationHelper
   */
  protected $messageContentModerationHelper;

  /**
   * The message notifier.
   *
   * @var \Drupal\message_notify\MessageNotifier
   */
  protected $messageNotifier;

  /**
   * Constructs a new MessageHelper object.
   *
   * @param \Drupal\Core\Session\AccountInterface $current_user
   *   The current user.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\ggcp_message_customs\MessageContentModerationHelper $message_content_moderation_helper
   *   The moderation helper.
   * @param \Drupal\message_notify\MessageNotifier $message_notifier
   *   The message notifier.
   */
  public function __construct(
    AccountInterface $current_user,
    EntityTypeManagerInterface $entity_type_manager,
    MessageContentModerationHelper $message_content_moderation_helper,
    MessageNotifier $message_notifier
  ) {
    $this->currentUser = $current_user;
    $this->entityTypeManager = $entity_type_manager;
    $this->messageContentModerationHelper = $message_content_moderation_helper;
    $this->messageNotifier = $message_notifier;
  }

  /**
   * Create messages when a new comment is added.
   *
   * @param \Drupal\comment\Entity\Comment $comment
   *   The comment entity.
   */
  public function createMessagesForNewComment(Comment $comment) {
    $parent_entity = $comment->getCommentedEntity();
    // Handle reply to another comment.
    if ($comment->hasParentComment()) {
      $parent_comment = $comment->getParentComment();
      $parent_comment_author = $parent_comment->getOwner();

      if ($parent_comment_author instanceof UserInterface && $parent_comment_author->id() > 0) {
        $message_template = $this->getMessageTemplateForCommentReply($parent_entity);
        $message = Message::create([
          'template' => $message_template,
          'uid' => $parent_comment_author->id(),
        ]);
        $message->set('field_comment_reference', $comment);
        $message->set('field_parent_comment', $parent_comment);
        $message->save();

        $this->sendNotificationIfNeeded($message, $message_template, $parent_comment_author->id());
      }
    }

    // Notify node author (if parent is a node).
    if ($parent_entity instanceof NodeInterface) {
      $node_author = $parent_entity->getOwner();
      if ($node_author instanceof UserInterface && $node_author->id() > 0) {
        $message_template = $parent_entity->getType() === 'forum'
          ? 'forum_post_replied_to'
          : 'comment_posted_to_node';

        $message = Message::create([
          'template' => $message_template,
          'uid' => $node_author->id(),
        ]);
        $message->set('field_comment_reference', $comment);
        $message->set('field_node_reference', $parent_entity);
        $message->save();

        $this->sendNotificationIfNeeded($message, $message_template, $node_author->id());
      }
    }
  }

  /**
   * Determines the message template for a comment reply.
   *
   * @param \Drupal\Core\Entity\EntityInterface|null $parent_entity
   *   The commented entity.
   *
   * @return string
   *   Message template ID.
   */
  protected function getMessageTemplateForCommentReply(?EntityInterface $parent_entity): string {
    if ($parent_entity instanceof NodeInterface && $parent_entity->getType() === 'forum') {
      return 'forum_comment_reply';
    }
    return 'comment_reply_to_comment';
  }

  /**
   * Process entity for moderation notifications.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity.
   * @param bool $is_new
   *   Whether the entity is new.
   */
  public function processEntityForModeration(EntityInterface $entity, $is_new = FALSE) {
    $notifications = $this->messageContentModerationHelper->getNotifications($entity, $is_new);
    if (empty($notifications)) {
      return;
    }

    foreach ($notifications as $notification) {
      switch ($notification) {
        case 'submitted_node_state_change':
          $owner = $entity->getOwner();
          if ($owner instanceof UserInterface && $owner->id() > 0) {
            $message = Message::create([
              'template' => $notification,
              'uid' => $owner->id(),
            ]);
            $message->set('field_node_reference', $entity);
            $message->save();
            $this->sendNotificationIfNeeded($message, $notification, $owner->id());
          }
          break;

        case 'moderator_new_node_submitted':
        case 'moderation_state_change':
          $moderator_uids = $this->getAllModerators();
          foreach ($moderator_uids as $uid) {
            $message = Message::create([
              'template' => $notification,
              'uid' => $uid,
            ]);
            $message->set('field_node_reference', $entity);
            $message->save();
            $this->sendNotificationIfNeeded($message, $notification, $uid);
          }
          break;
      }
    }
  }

  /**
   * Process group content creation notifications.
   *
   * @param \Drupal\Core\Entity\EntityInterface $group_relationship
   *   The group content entity (e.g., GroupContent).
   */
  public function processGroupContent($group_relationship) {
    // Skip group membership itself (e.g., user joining group).
    if ($group_relationship->getPluginId() === 'group_membership') {
      return;
    }

    $group = $group_relationship->getGroup();
    $memberships = $group->getMembers();
    $entity = $group_relationship->getEntity();

    foreach ($memberships as $membership) {
      $member_user = $membership->getUser();
      if (!$member_user || $member_user->id() <= 0) {
        continue;
      }

      $message = Message::create([
        'template' => 'group_content_created',
        'uid' => $member_user->id(),
      ]);
      $message->set('field_group_reference', $group);
      if ($entity instanceof NodeInterface) {
        $message->set('field_node_reference', $entity);
      }
      $message->save();

      $this->sendNotificationIfNeeded($message, 'group_content_created', $member_user->id());
    }
  }

  /**
   * Determines if a user should receive an email (and how).
   *
   * @param string $message_template
   *   The message template ID.
   * @param int $uid
   *   The user ID.
   *
   * @return string|bool
   *   - 'enabled': send immediately
   *   - 'daily_digest': send via digest
   *   - FALSE: do not send
   */
  public function shouldUserGetEmail(string $message_template, int $uid) {
    /** @var \Drupal\user\UserInterface|null $user */
    $user_storage = $this->entityTypeManager->getStorage('user');
    $user = $user_storage->load($uid);

    if (!$user instanceof UserInterface) {
      return FALSE;
    }

    // Respect global opt-out.
    if ($user->get('field_do_not_email')->value) {
      return FALSE;
    }

    // Map message templates to user field names.
    $field_map = [
      'comment_reply_to_comment' => 'field_comment_notifications',
      'comment_posted_to_node' => 'field_comment_notifications',
      'forum_comment_reply' => 'field_forum_notifications',
      'forum_post_replied_to' => 'field_forum_notifications',
      'submitted_node_state_change' => 'field_content_moderation_notifi',
      'moderator_new_node_submitted' => 'field_content_moderation_notifi',
      'moderation_state_change' => 'field_content_moderation_notifi',
      'group_content_created' => 'field_group_content_notification',
    ];

    $field_name = $field_map[$message_template] ?? NULL;
    if (!$field_name || !$user->hasField($field_name) || !$user->hasField('field_email_digest')) {
      \Drupal::logger('ggcp_message_customs')->warning('Missing notification field @field for user @uid', [
        '@field' => $field_name,
        '@uid' => $uid,
      ]);
      return FALSE;
    }

    // Check if notification type is enabled.
    if (empty($user->get($field_name)->value)) {
      return FALSE;
    }

    // Check digest preference.
    $digest_value = $user->get('field_email_digest')->value;
    return $digest_value == '1' ? 'daily_digest' : 'enabled';
  }

  /**
   * Sends the message notification if user preferences allow.
   *
   * @param \Drupal\message\Entity\Message $message
   *   The message entity.
   * @param string $message_template
   *   The template name.
   * @param int $uid
   *   The recipient user ID.
   */
  protected function sendNotificationIfNeeded(Message $message, string $message_template, int $uid): void {
    $action = $this->shouldUserGetEmail($message_template, $uid);
    if ($action === 'daily_digest') {
      $this->messageNotifier->send($message, [], 'message_digest:daily');
    }
    elseif ($action === 'enabled') {
      $this->messageNotifier->send($message);
    }
  }

  /**
   * Get all active moderators (user IDs).
   *
   * @return int[]
   *   Array of user IDs.
   */
  public function getAllModerators(): array {
    $query = $this->entityTypeManager
      ->getStorage('user')
      ->getQuery()
      ->condition('status', 1)
      ->condition('roles', 'moderator')
      ->accessCheck(FALSE);
    return $query->execute();
  }

}

<?php

namespace Drupal\custom_organization\Service;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Locale\CountryManagerInterface;
use Drupal\user\UserInterface;

/**
 * Provides organization creator user details.
 */
class OrganizationCreatorService {

  protected EntityTypeManagerInterface $entityTypeManager;
  protected FileUrlGeneratorInterface $fileUrlGenerator;
  protected CountryManagerInterface $countryManager;

  public function __construct(
    EntityTypeManagerInterface $entityTypeManager,
    FileUrlGeneratorInterface $fileUrlGenerator,
    CountryManagerInterface $countryManager
  ) {
    $this->entityTypeManager = $entityTypeManager;
    $this->fileUrlGenerator = $fileUrlGenerator;
    $this->countryManager = $countryManager;
  }

  /**
   * Get creator user details by UID.
   *
   * @param int $uid
   *   User ID.
   *
   * @return array|null
   *   Creator details or NULL if invalid.
   */
  public function getCreatorByUid(int $uid): ?array {
    if ($uid <= 0) {
      return NULL;
    }

    /** @var \Drupal\user\UserInterface|null $user */
    $user = $this->entityTypeManager
      ->getStorage('user')
      ->load($uid);

    if (!$user instanceof UserInterface) {
      return NULL;
    }

    return [
      'uid' => $user->id(),
      'name' => $user->getDisplayName(),
      'picture' => $this->getUserPicture($user),
      'country' => $this->getUserCountry($user),
    ];
  }

  /**
   * Get user picture URL with fallback.
   */
  protected function getUserPicture(UserInterface $user): string {
    if (
      $user->hasField('user_picture') &&
      !$user->get('user_picture')->isEmpty()
    ) {
      $file = $user->get('user_picture')->entity;
      if ($file) {
        return $this->fileUrlGenerator->generateAbsoluteString(
          $file->getFileUri()
        );
      }
    }

    // Fallback avatar.
    return '/themes/custom/acs_gcs/images/background/avatar.png';
  }

  /**
   * Get user country label (full country name).
   */
  protected function getUserCountry(UserInterface $user): ?string {
    $country_code = NULL;

    // Case 1: Address field.
    if (
        $user->hasField('field_address') &&
        !$user->get('field_address')->isEmpty()
    ) {
      $country_code = $user->get('field_address')->country_code;
    }

    // Case 2: Simple country field storing code.
    elseif (
        $user->hasField('field_country') &&
        !$user->get('field_country')->isEmpty()
    ) {
      $country_code = $user->get('field_country')->value;
    }

    if (!$country_code) {
      return NULL;
    }

    // Convert country code → full country name.
    $countries = $this->countryManager->getList();

    return $countries[$country_code] ?? $country_code;
  }

}

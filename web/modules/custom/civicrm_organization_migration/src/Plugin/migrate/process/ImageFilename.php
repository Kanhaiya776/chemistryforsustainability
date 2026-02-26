<?php

namespace Drupal\civicrm_organization_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;
use Drupal\migrate\ProcessPluginBase;

/**
 * Extracts filename from CiviCRM image URL and prepends local path.
 *
 * Example:
 *   Input:  https://example.org/civicrm/contact/imagefile?photo=lupac_logo_blocks_stack_rgb.jpeg
 *   Output: public://organization-logos/lupac_logo_blocks_stack_rgb.jpeg.
 *
 * @MigrateProcessPlugin(
 *   id = "image_filename"
 * )
 */
class ImageFilename extends ProcessPluginBase {

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {
    if (empty($value)) {
      return NULL;
    }

    // Parse query string to get "photo" parameter.
    $parts = parse_url($value);
    $filename = $value;
    if (!empty($parts['query'])) {
      parse_str($parts['query'], $query);
      if (!empty($query['photo'])) {
        $filename = $query['photo'];
      }
    }

    // Fallback: if no query param, just take basename.
    if (!$filename) {
      $filename = basename($value);
    }

    //Prepend your local folder path.

     \Drupal::logger('img_debug')->notice(
          'value @val for file @fn',
          ['@val' => $value, '@fn' => $filename]
        );

    return 'public://webform/images/' . $filename;
    //return 'public://webform/images/' . $value;
  }

}

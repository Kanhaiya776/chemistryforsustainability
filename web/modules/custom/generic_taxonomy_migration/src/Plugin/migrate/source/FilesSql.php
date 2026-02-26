<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * @MigrateSource(
 *   id = "files_sql"
 * )
 */
class FilesSql extends SqlBase {

  public function query() {
    return $this->select('file_managed', 'f')
      ->fields('f', ['fid', 'filename', 'uri', 'filemime', 'filesize', 'created', 'changed'])
      ->condition('status', 1);
  }

  public function fields() {
    return [
      'fid' => $this->t('File ID'),
      'filename' => $this->t('Filename'),
      'uri' => $this->t('File URI'),
      'filemime' => $this->t('File mime type'),
      'filesize' => $this->t('File size'),
      'created' => $this->t('Created'),
      'changed' => $this->t('Changed'),
    ];
  }

  public function getIds() {
    return [
      'fid' => ['type' => 'integer'],
    ];
  }
}

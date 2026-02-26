<?php

namespace Drupal\generic_taxonomy_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * @MigrateSource(
 *   id = "professional_development_sql"
 * )
 */
class ProfessionalDevelopmentSql extends SqlBase {

  public function query() {
    $query = $this->select('node_field_data', 'n');
    $query->fields('n', ['nid', 'title', 'uid']);

    // Body.
    $query->leftJoin('node__body', 'b', 'b.entity_id = n.nid');
    $query->addField('b', 'body_value', 'body');
    $query->addField('b', 'body_format', 'body_format');

    // Attachment (multi).
    $query->leftJoin('node__field_attachments', 'fa', 'fa.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT fa.field_attachments_target_id)', 'attachment_fids');

    // Attachment name.
    $query->leftJoin('node__field_attachment_name', 'fan', 'fan.entity_id = n.nid');
    $query->addField('fan', 'field_attachment_name_value', 'attachment_name');

    // Length of training.
    $query->leftJoin('node__field_length_time_of_training', 'lt', 'lt.entity_id = n.nid');
    $query->addField('lt', 'field_length_time_of_training_value', 'length_time');

    // Location.
    $query->leftJoin('node__field_location_address', 'la', 'la.entity_id = n.nid');
    $query->addField('la', 'field_location_address_value', 'location_address');

    $query->leftJoin('node__field_location_country', 'lc', 'lc.entity_id = n.nid');
    $query->addField('lc', 'field_location_country_value', 'location_country');

    $query->leftJoin('node__field_location_name', 'ln', 'ln.entity_id = n.nid');
    $query->addField('ln', 'field_location_name_value', 'location_name');

    // Organization.
    $query->leftJoin('node__field_organization', 'org', 'org.entity_id = n.nid');
    $query->addField('org', 'field_organization_target_id', 'organization_nid');

    // Featured image.
    $query->leftJoin('node__field_image', 'img', 'img.entity_id = n.nid');
    $query->addField('img', 'field_image_target_id', 'image_fid');
    $query->addField('img', 'field_image_alt', 'image_alt');

    // Taxonomies (multi).
    $query->leftJoin('node__field_keywords', 'kw', 'kw.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT kw.field_keywords_target_id)', 'keyword_tids');

    $query->leftJoin('node__field_level_of_training', 'lvl', 'lvl.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT lvl.field_level_of_training_target_id)', 'level_tids');

    $query->leftJoin('node__field_training_format', 'tf', 'tf.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT tf.field_training_format_target_id)', 'format_tids');

    $query->leftJoin('node__field_target_audience', 'ta', 'ta.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT ta.field_target_audience_target_id)', 'audience_tids');

    $query->leftJoin('node__field_field_of_interest', 'foi', 'foi.entity_id = n.nid');
    $query->addExpression('GROUP_CONCAT(DISTINCT foi.field_field_of_interest_target_id)', 'interest_tids');

    $query->leftJoin('node__field_related_technology_compend', 'rtc', 'rtc.entity_id = n.nid');
    $query->addField(
      'rtc',
      'field_related_technology_compend_target_id',
      'related_node'
    );

    $query->leftJoin('node__field_registrations_date_time', 'rdt', 'rdt.entity_id = n.nid');
    $query->addField('rdt', 'field_registrations_date_time_value', 'reg_start');
    $query->addField('rdt', 'field_registrations_date_time_end_value', 'reg_end');

    $query->leftJoin('node__field_time_of_training', 'tot', 'tot.entity_id = n.nid');
    $query->addField('tot', 'field_time_of_training_value', 'train_start');
    $query->addField('tot', 'field_time_of_training_end_value', 'train_end');

    $query->leftJoin('node__field_professional_dev_timezone', 'ptz', 'ptz.entity_id = n.nid');
    $query->addField('ptz', 'field_professional_dev_timezone_value', 'prof_timezone');

    $query->leftJoin('node__field_registrations_time_zone', 'rtz', 'rtz.entity_id = n.nid');
    $query->addField('rtz', 'field_registrations_time_zone_value', 'reg_timezone');


    // Other interest.
    $query->leftJoin('node__field_specify_other_interest4', 'oi', 'oi.entity_id = n.nid');
    $query->addField('oi', 'field_specify_other_interest4_value', 'other_interest');

    // Links.
    $query->leftJoin('node__field_training_registration_link', 'trl', 'trl.entity_id = n.nid');
    $query->addField('trl', 'field_training_registration_link_uri', 'registration_link');

    $query->leftJoin('node__field_link', 'wl', 'wl.entity_id = n.nid');
    $query->addField('wl', 'field_link_uri', 'website_link');

    // Prerequisites.
    $query->leftJoin('node__field_prerequisites', 'pr', 'pr.entity_id = n.nid');
    $query->addField('pr', 'field_prerequisites_value', 'prerequisites');

    // Accept terms.
    $query->leftJoin('node__field_pf_accept_terms', 'pt', 'pt.entity_id = n.nid');
    $query->addField('pt', 'field_pf_accept_terms_value', 'accept_terms');

    $query->leftJoin(
      'cherity.content_moderation_state_field_data',
      'cms',
      "cms.content_entity_id = n.nid AND cms.content_entity_type_id = ('node')");

    $query->addField('cms', 'moderation_state', 'moderation_state');

    $query->condition('n.type', 'professional_development');

    $query->groupBy('n.nid');
    $query->groupBy('n.title');
    $query->groupBy('n.uid');
    $query->groupBy('b.body_value');
    $query->groupBy('b.body_format');
    $query->groupBy('fan.field_attachment_name_value');
    $query->groupBy('lt.field_length_time_of_training_value');
    $query->groupBy('la.field_location_address_value');
    $query->groupBy('lc.field_location_country_value');
    $query->groupBy('ln.field_location_name_value');
    $query->groupBy('org.field_organization_target_id');
    $query->groupBy('img.field_image_target_id');
    $query->groupBy('img.field_image_alt');
    $query->groupBy('oi.field_specify_other_interest4_value');
    $query->groupBy('trl.field_training_registration_link_uri');
    $query->groupBy('wl.field_link_uri');
    $query->groupBy('pr.field_prerequisites_value');
    $query->groupBy('pt.field_pf_accept_terms_value');
    $query->groupBy('rtc.field_related_technology_compend_target_id');
    $query->groupBy('rdt.field_registrations_date_time_value');
    $query->groupBy('rdt.field_registrations_date_time_end_value');
    $query->groupBy('tot.field_time_of_training_value');
    $query->groupBy('tot.field_time_of_training_end_value');
    $query->groupBy('ptz.field_professional_dev_timezone_value');
    $query->groupBy('rtz.field_registrations_time_zone_value');
    $query->groupBy('cms.moderation_state');

    return $query;
  }

  public function fields() {
    return [
      'nid' => $this->t('Node ID'),
      'title' => $this->t('Title'),
      'uid' => $this->t('User id'),
      'body' => $this->t('Body'),
      'body_format' => $this->t('Body format'),
      'attachment_fids' => $this->t('Attachment FIDs'),
      'attachment_name' => $this->t('Attachment name'),
      'length_time' => $this->t('Length time'),
      'location_address' => $this->t('Location address'),
      'location_country' => $this->t('Location country'),
      'location_name' => $this->t('Location name'),
      'organization_nid' => $this->t('Organization'),
      'image_fid' => $this->t('Image'),
      'image_alt' => $this->t('Image alt'),
      'keyword_tids' => $this->t('Keywords'),
      'level_tids' => $this->t('Level of training'),
      'format_tids' => $this->t('Training format'),
      'audience_tids' => $this->t('Target audience'),
      'interest_tids' => $this->t('Field of interest'),
      'other_interest' => $this->t('Other interest'),
      'registration_link' => $this->t('Registration link'),
      'website_link' => $this->t('Website link'),
      'prerequisites' => $this->t('Prerequisites'),
      'accept_terms' => $this->t('Accept terms'),
      'related_node' => $this->t('Related safer alternative node'),
      'reg_start' => $this->t('Registration start'),
      'reg_end' => $this->t('Registration end'),
      'train_start' => $this->t('Training start'),
      'train_end' => $this->t('Training end'),
      'prof_timezone' => $this->t('Professional dev timezone'),
      'reg_timezone' => $this->t('Registration timezone'),
      'moderation_state' => $this->t('Moderation state'),

    ];
  }

  public function getIds() {
    return [
      'nid' => ['type' => 'integer'],
    ];
  }
}

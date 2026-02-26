<?php

namespace Drupal\civicrm_user_migration\Plugin\migrate\source;

use Drupal\migrate\Plugin\migrate\source\SqlBase;
use Drupal\Core\Database\Database;
use Drupal\Core\Database\Connection;
use Drupal\migrate\Row;
use Drupal\file\Entity\File;
use Drupal\Core\File\FileSystemInterface;

/**
 * Drupal civicrm migration.
 *
 * @MigrateSource(
 *   id = "civicrm_user_migration"
 * )
 */
class CivicrmUserMigration extends SqlBase {

  /**
   * {@inheritdoc}
   */
  public function getDatabase(): Connection {
    return Database::getConnection('default', 'cherity');
  }

  // SELECT u.uid, u.name, u.pass, u.mail, u.status, c.id AS civicrm_contact_id, c.first_name, c.last_name FROM skvare10_ggcp.users_field_data u LEFT JOIN skvare10_ggcp_civicrm.civicrm_uf_match uf ON uf.uf_id = u.uid LEFT JOIN skvare10_ggcp_civicrm.civicrm_contact c ON c.id = uf.contact_id ORDER BY u.uid ASC LIMIT 5;

  /**
   * {@inheritdoc}
   */
  public function query() {
    // SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

    $query = $this->select('users_field_data', 'u')
      ->fields('u', ['uid', 'name', 'pass', 'mail', 'status', 'created', 'changed', 'init'])
      ->orderBy('u.uid');

    // Roles join.
    // $query->leftJoin('user__roles', 'ur', 'ur.entity_id = u.uid');

    // Civicrm UF Match.
    $query->leftJoin('civicrm.civicrm_uf_match', 'uf', 'uf.uf_id = u.uid');

    // Civicrm contact.
    $query->leftJoin('civicrm.civicrm_contact', 'c', 'c.id = uf.contact_id');

    // Add condition after joining 'c'.
    $query->condition('c.contact_type', 'Individual');
    // $query->condition('c.id', 2919);

    // Mentor.
    $query->leftJoin('civicrm.civicrm_value_mentor_16', 'mentor', 'mentor.entity_id = c.id');

    // Demographic.
    $query->leftJoin('civicrm.civicrm_value_demographics__11', 'demo', 'demo.entity_id = c.id');

    // Biography.
    $query->leftJoin('civicrm.civicrm_value_contact_infor_6', 'info', 'info.entity_id = c.id');

    // Address.
    $query->leftJoin('civicrm.civicrm_address', 'address', 'address.contact_id = c.id AND address.is_primary = 1');

    // Country.
    $query->leftJoin('civicrm.civicrm_country', 'country', 'country.id = address.country_id');
    // State.
    $query->leftJoin('civicrm.civicrm_state_province', 'state', 'state.id = address.state_province_id');

    // Join Academic Info custom group (replace with actual table name)
    $query->leftJoin('civicrm.civicrm_value_education_12', 'academic', 'academic.entity_id = c.id');
    // Group Option for language.
    // $query->leftJoin('civicrm.civicrm_option_value', 'option_value', 'option_value.option_group_id = 84');

    // Websites.
    $query->leftJoin('civicrm.civicrm_website', 'w', 'w.contact_id = c.id');

    // Notifications.
    $query->leftJoin('civicrm.civicrm_value_email_notific_18', 'notifi', 'notifi.entity_id = c.id');

    // FOI.
    $query->leftJoin('civicrm.civicrm_value_fields_of_int_19', 'foi', 'foi.entity_id = c.id');

    // Profile Updated.
    $query->leftJoin('civicrm.civicrm_value_visibility_se_10', 'pf_updated', 'pf_updated.entity_id = c.id');

    // Organization Relationship.
    $query->leftJoin('civicrm.civicrm_relationship', 'rel', 'rel.contact_id_a = c.id AND rel.is_active = 1 AND rel.relationship_type_id = 12');

    $query->addField('c', 'id', 'civicrm_contact_id');
    $query->addField('c', 'first_name');
    $query->addField('c', 'last_name');
    $query->addField('u', 'status');
    $query->addField('c', 'do_not_email');
    $query->addField('c', 'is_opt_out');
    $query->addField('c', 'gender_id');
    $query->addField('c', 'job_title');
    $query->addField('info', 'biography_19');
    $query->addField('info', 'roles_132');
    $query->addField('demo', 'what_are_your_preferred_pronouns_57');
    $query->addField('demo', 'other_languages_check_all_that_a_58'); // check.
    $query->addField('mentor', 'willing_to_be_a_mentor__90');
    $query->addField('mentor', 'description_96');
    $query->addField('academic', 'highest_level_of_education_degre_62');
    $query->addField('academic', 'academic_field_of_study_133');
    $query->addField('academic', 'academic_institutions_134');

    $query->addField('notifi', 'content_moderation_notifications_125');
    $query->addField('notifi', 'comment_notifications_126');
    $query->addField('notifi', 'forum_notifications_127');
    $query->addField('notifi', 'group_content_notifications_128');
    $query->addField('notifi', 'email_digest_129');
    $query->addField('foi', 'other_field_of_interest_131');
    $query->addField('foi', 'other_fields_of_expertise_140');
    $query->addField('foi', 'field_of_interest_130', 'field_of_interest');
    $query->addField('foi', 'fields_of_expertise_139', 'fields_of_expertise');
    $query->addField('pf_updated', 'profile_updated_124');
    $query->addExpression("MAX(state.abbreviation)", 'state');
    $query->addExpression("MAX(country.iso_code)", 'country_code');

    $query->addExpression(
      "(SELECT GROUP_CONCAT(r.roles_target_id SEPARATOR ',')
        FROM cherity.user__roles r
        WHERE r.entity_id = u.uid)",
      'roles'
    );
    // Links.
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 17 THEN w.url END)", 'website');
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 13 THEN w.url END)", 'google_scholar');
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 5 THEN w.url END)", 'instagram');
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 6 THEN w.url END)", 'linkedin');
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 14 THEN w.url END)", 'orchid_link');
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 18 THEN w.url END)", 'wechat');

    // Image filename.
    $query->addExpression(
      "NULLIF(SUBSTRING_INDEX(c.image_URL, 'photo=', -1), '')",
      'image_url'
    );

    $query->addExpression("MAX(rel.contact_id_b)", "organization_id");

    $query->groupBy('u.uid');
    $query->groupBy('u.name');
    $query->groupBy('u.pass');
    $query->groupBy('u.mail');
    $query->groupBy('u.status');
    $query->groupBy('u.created');
    $query->groupBy('u.changed');
    $query->groupBy('u.init');
    $query->groupBy('c.id');
    $query->groupBy('c.first_name');
    $query->groupBy('c.last_name');
    $query->groupBy('c.job_title');
    $query->groupBy('c.do_not_email');
    $query->groupBy('c.is_opt_out');
    $query->groupBy('info.biography_19');
    $query->groupBy('info.roles_132');
    $query->groupBy('demo.what_are_your_preferred_pronouns_57');
    $query->groupBy('demo.other_languages_check_all_that_a_58');
    $query->groupBy('mentor.willing_to_be_a_mentor__90');
    $query->groupBy('mentor.description_96');
    $query->groupBy('academic.highest_level_of_education_degre_62');
    $query->groupBy('academic.academic_field_of_study_133');
    $query->groupBy('academic.academic_institutions_134');
    $query->groupBy('notifi.content_moderation_notifications_125');
    $query->groupBy('notifi.comment_notifications_126');
    $query->groupBy('notifi.forum_notifications_127');
    $query->groupBy('notifi.group_content_notifications_128');
    $query->groupBy('notifi.email_digest_129');
    $query->groupBy('foi.other_field_of_interest_131');
    $query->groupBy('foi.other_fields_of_expertise_140');
    $query->groupBy('foi.field_of_interest_130');
    $query->groupBy('foi.fields_of_expertise_139');
    $query->groupBy('pf_updated.profile_updated_124');
    $query->groupBy('pf_updated.profile_updated_124');
    $query->groupBy('rel.contact_id_b');

    return $query;
  }

  /**
   * {@inheritdoc}
   */
  public function fields() {
    return [
      'uid' => $this->t('User ID'),
      'name' => $this->t('Username'),
      'pass' => $this->t('Password'),
      'mail' => $this->t('Email'),
      'status' => $this->t('Status'),
      'roles' => $this->t('User roles'),
      'created' => $this->t('Created timestamp'),
      'changed' => $this->t('Updated timestamp'),
      'civicrm_contact_id' => $this->t('CiviCRM Contact ID'),
      'first_name' => $this->t('First name'),
      'last_name' => $this->t('Last name'),
      'image_url' => $this->t('Profile URL'),
      'job_title' => $this->t('Job Title'),
      'do_not_email' => $this->t('Do not Email'),
      'is_opt_out' => $this->t('No Marketing Email'),
      'biography_19' => $this->t('Professional Summary'),
      'roles_132' => $this->t('User Job Roles'),
      'what_are_your_preferred_pronouns_57' => $this->t('what are your preferred pronouns'),
      'other_languages_check_all_that_a_58' => $this->t('Spoken Language'),
      'willing_to_be_a_mentor__90' => $this->t('Willing to be amentor'),
      'description_96' => $this->t('Mentor Topics'),
      'country_code' => $this->t('Country code'),
      'state' => $this->t('State'),
      'highest_level_of_education_degre_62' => $this->t('Degree'),
      'academic_field_of_study_133' => $this->t('Academic Field of Study'),
      'academic_institutions_134' => $this->t('Academic Instituation'),
      'website' => $this->t('Website'),
      'google_scholar' => $this->t('Google Scholar profile'),
      'instagram' => $this->t('Instagram profile'),
      'linkedin' => $this->t('LinkedIn profile'),
      'orchid_link'  => $this->t('Orchid ID'),
      'wechat' => $this->t('WeChat profile'),
      'notifi.content_moderation_notifications_125' => $this->t('content moderation notifications'),
      'notifi.comment_notifications_126' => $this->t('comment notifications'),
      'notifi.forum_notifications_127' => $this->t('forum notifications'),
      'notifi.group_content_notifications_128' => $this->t('group content notifications'),
      'notifi.email_digest_129' => $this->t('email digest'),
      'other_field_of_interest_131' => $this->t('other field of interest'),
      'other_fields_of_expertise_140' => $this->t('other field of expertise'),
      'field_of_interest' => $this->t('field of interest'),
      'fields_of_expertise' => $this->t('field of expertise'),
      'profile_updated_124' => $this->t('Profile Updated'),
      'organization_id' => $this->t("Organization ID"),
    ];
  }

  protected function getLanguageLabelsFromIds($raw) {
    if (empty($raw)) {
      return NULL;
    }

    $ids = array_filter(explode("\x01", trim($raw, "\x01")));
    if (!$ids) {
      return NULL;
    }

    $connection = Database::getConnection('default', 'cherity');

    $labels = $connection->select('civicrm.civicrm_option_value', 'ov')
      ->fields('ov', ['label'])
      ->condition('ov.option_group_id', 122)
      ->condition('ov.value', $ids, 'IN')
      ->execute()
      ->fetchCol();

    if (!$labels) {
      return NULL;
      }

    // 🔧 Normalize labels to match your Drupal allowed values exactly
    $normalize = [
      'Catalan; Valencian' => 'Catalan',
      'Chinese' => 'Chinese, Simplified',
      'Norwegian Bokmal' => 'Norwegian Bokmål',
      'Persian (Iran)' => 'Persian, Farsi',
    ];

    foreach ($labels as &$label) {
      if (isset($normalize[$label])) {
        $label = $normalize[$label];
      }
    }

    return $labels;
  }

  /**
   * {@inheritdoc}
   */
  public function getIds() {
    return [
      'uid' => [
        'type' => 'integer',
      ],
    ];
  }

  public function prepareRow(Row $row) {

    $raw = $row->getSourceProperty('other_languages_check_all_that_a_58');

    if ($raw) {
      $labels = $this->getLanguageLabelsFromIds($raw);
      if ($labels) {
        $row->setSourceProperty('spoken_language_labels', $labels);
      }
    }
    // -------- User picture ----------
    $image = $row->getSourceProperty('image_url');

    if ($image) {
      $source_uri = 'private://webform/new_organization/2025-12/' . $image;
      $dest_uri   = 'public://webform/images/' . $image;

      if (file_exists(\Drupal::service('file_system')->realpath($source_uri))) {

        // Copy file.
        \Drupal::service('file_system')->copy(
        $source_uri,
        $dest_uri,
        FileSystemInterface::EXISTS_REPLACE
        );
        // Create file entity.
        $file = File::create([
          'uri' => $dest_uri,
          'status' => 1,
        ]);
        $file->save();

        $row->setSourceProperty('user_picture_fid', $file->id());

        \Drupal::logger('img_debug')->notice(
          'Created file fid @fid for uid @uid',
          ['@fid' => $file->id(), '@uid' => $row->getSourceProperty('uid')]
        );
      }
    }

    return parent::prepareRow($row);
  }

}

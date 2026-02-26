<?php

namespace Drupal\civicrm_organization_migration\Plugin\migrate\source;

use Drupal\Core\Database\Connection;
use Drupal\Core\Database\Database;
use Drupal\migrate\Plugin\migrate\source\SqlBase;

/**
 * Source plugin for CiviCRM organizations.
 *
 * @MigrateSource(
 *   id = "civicrm_organization"
 * )
 */
class CiviOrganization extends SqlBase {

  /**
   * {@inheritdoc}
   */
  public function getDatabase(): Connection {
    // IMPORTANT: use the civicrm DB connection.
    return Database::getConnection('default', 'civicrm');
  }

  /**
   * {@inheritdoc}
   */
  public function query() {
    $query = $this->select('civicrm_contact', 'c');

    // Base fields.
    $query->fields('c', ['id', 'display_name']);
    $query->condition('c.contact_type', 'Organization');
    $query->condition('c.is_deleted', 0);

    // Joins.
    $query->leftJoin('civicrm_value_organization__8', 'o', 'o.entity_id = c.id');
    $query->leftJoin('civicrm_value_sector_15', 's', 's.entity_id = c.id');
    $query->leftJoin('civicrm_website', 'w', 'w.contact_id = c.id');
    $query->leftJoin('civicrm_address', 'a', 'a.contact_id = c.id AND a.is_primary = 1');
    $query->leftJoin('civicrm_state_province', 'sp', 'sp.id = a.state_province_id');
    $query->leftJoin('civicrm_country', 'co', 'co.id = a.country_id');
    $query->leftJoin('civicrm_value_field_of_rese_13', 'foi', 'foi.entity_id = c.id');
    // Creator relationship.
    $query->leftJoin('civicrm_relationship', 'rc',
      'rc.contact_id_b = c.id AND rc.relationship_type_id = 13 AND rc.is_active = 1'
    );
    // Map creator contact → Drupal user.
    $query->leftJoin('civicrm_uf_match', 'rcm',
      'rcm.contact_id = rc.contact_id_a'
    );

    // Affiliate relationships (employee + affiliate).
    // $query->leftJoin('civicrm_relationship', 'ra',
    //  'ra.contact_id_b = c.id AND ra.relationship_type_id IN (5,12) AND ra.is_active = 1'
    // );
    $query->leftJoin('civicrm_relationship', 'ra',
      'ra.contact_id_b = c.id
      AND ra.relationship_type_id IN (5,12)
      AND ra.is_active = 1'
    );

    $query->leftJoin('civicrm_uf_match', 'ram',
      'ram.contact_id = ra.contact_id_a'
    );
    // // Creator relationships — priority pool.
    // $query->leftJoin('civicrm_relationship', 'rc',
    //   'rc.contact_id_b = c.id
    //   AND rc.relationship_type_id IN (5,12,13)
    //   AND rc.is_active = 1'
    // );
    // $query->leftJoin('civicrm_relationship', 'ra',
    //   'ra.contact_id_b = c.id
    //   AND ra.relationship_type_id = 12
    //   AND ra.is_active = 1'
    // );

    // Simple fields.
    $query->addExpression('o.organization_acronym_141', 'acronym');
    $query->addExpression('o.organization_description_103', 'description');
    $query->addExpression('CAST(s.if_industry_is_the_company_a_sta_102 AS UNSIGNED)', 'is_startup');

    // Sector normalization.
    $query->addExpression(
      "NULLIF(SUBSTRING_INDEX(TRIM(BOTH CHAR(1) FROM s.sector_87), CHAR(1), 1), '')",
      'sector'
    );
    // Image filename extracted from CiviCRM image_URL.
    $query->addExpression(
      "NULLIF(SUBSTRING_INDEX(c.image_URL, 'photo=', -1), '')",
      'image_url'
    );

    // Sub-sectors.
    $query->addExpression('s.industry_sub_sector_106', 'industry_sub_sector');
    $query->addExpression('s.government_sub_sector_107', 'government_sub_sector');
    $query->addExpression('s.academia_sub_sector_108', 'academia_sub_sector');

    // Websites & social.
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 2 THEN w.url END)", 'website');
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 3 THEN w.url END)", 'facebook');
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 5 THEN w.url END)", 'instagram');
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 6 THEN w.url END)", 'linkedin');
    $query->addExpression("MAX(CASE WHEN w.website_type_id = 18 THEN w.url END)", 'wechat');

    // Address.
    $query->addExpression("MAX(a.street_address)", 'street_address');
    $query->addExpression("MAX(a.supplemental_address_1)", 'street_address_2');
    $query->addExpression("MAX(a.city)", 'city');
    $query->addExpression("MAX(a.postal_code)", 'postal_code');
    $query->addExpression("MAX(sp.abbreviation)", 'state');
    $query->addExpression("MAX(co.iso_code)", 'country_code');

    $query->addField('foi', 'field_of_research_72', 'field_of_research');
    $query->addField('foi', 'other_field_of_research_73', 'other_field_of_research');
    $query->addField('foi', 'agricultural_and_food_sciences_74', 'agricultural_and_food_sciences');
    $query->addField('foi', 'biological_sciences_75', 'biological_sciences');
    $query->addField('foi', 'chemical_sciences_76', 'chemical_sciences');
    $query->addField('foi', 'earth_sciences_77', 'earth_sciences');
    $query->addField('foi', 'economics_78', 'economics');
    $query->addField('foi', 'engineering_79', 'engineering');
    $query->addField('foi', 'environmental_sciences_80', 'environmental_sciences');
    $query->addField('foi', 'health_sciences_81', 'health_sciences');
    $query->addField('foi', 'information_and_computing_scienc_82', 'information_and_computing_sciences');
    $query->addField('foi', 'mathematical_sciences_83', 'mathematical_sciences');
    $query->addField('foi', 'physical_sciences_84', 'physical_sciences');
    $query->addField('foi', 'social_sciences_85', 'social_sciences');

    // Add fields.
    // First creator by earliest relationship created_date.
    $query->addExpression(
      "SUBSTRING_INDEX(
        GROUP_CONCAT(DISTINCT rc.contact_id_a ORDER BY rc.created_date ASC),
        ',', 1
      )",
      'creator_contact_id'
    );

    $query->addExpression(
      "SUBSTRING_INDEX(
        GROUP_CONCAT(DISTINCT rcm.uf_id ORDER BY rc.created_date ASC),
        ',', 1
      )",
      'creator_uid'
    );

    $query->addExpression(
    "CONCAT('https://chemistryforsustainability.org/civicrm/contact/imagefile?photo=', c.image_URL)",
    'org_logo_url'
    );
    // $query->addExpression('GROUP_CONCAT(DISTINCT ra.contact_id_a)', 'affiliate_contact_ids');
    // $query->addExpression('GROUP_CONCAT(DISTINCT ram.uf_id)', 'affiliate_uids');
    $query->addExpression("
      (
        SELECT GROUP_CONCAT(DISTINCT ra2.contact_id_a)
        FROM civicrm_relationship ra2
        WHERE ra2.contact_id_b = c.id
        AND ra2.is_active = 1
        AND ra2.relationship_type_id IN (5,12,13)
        AND ra2.contact_id_a != (
            SELECT rc2.contact_id_a
            FROM civicrm_relationship rc2
            WHERE rc2.contact_id_b = c.id
            AND rc2.relationship_type_id = 13
            AND rc2.is_active = 1
            ORDER BY rc2.created_date ASC
            LIMIT 1
        )
      )
      ", 'affiliate_contact_ids');

    $query->addExpression("
      (
        SELECT GROUP_CONCAT(DISTINCT ram2.uf_id)
        FROM civicrm_relationship ra2
        JOIN civicrm_uf_match ram2 ON ram2.contact_id = ra2.contact_id_a
        WHERE ra2.contact_id_b = c.id
        AND ra2.is_active = 1
        AND ra2.relationship_type_id IN (5,12,13)
        AND ra2.contact_id_a != (
            SELECT rc2.contact_id_a
            FROM civicrm_relationship rc2
            WHERE rc2.contact_id_b = c.id
            AND rc2.relationship_type_id = 13
            AND rc2.is_active = 1
            ORDER BY rc2.created_date ASC
            LIMIT 1
        )
      )
      ", 'affiliate_uids');

    $query->groupBy('c.id');
    $query->orderBy('c.id', 'ASC');

    if (!empty($this->configuration['limit'])) {
      $query->range(0, (int) $this->configuration['limit']);
    }
    \Drupal::logger('civicrm_org_debug')->notice($query->__toString());
    return $query;
  }

  /**
   * {@inheritdoc}
   */
  public function fields() {
    return [
      'id' => $this->t('CiviCRM Contact ID'),
      'display_name' => $this->t('Organization name'),
      'acronym' => $this->t('Organization acronym'),
      'image_url' => $this->t('Organization image URL'),
      'description' => $this->t('Organization description'),
      'sector' => $this->t('Sector (normalized)'),
      'industry_sub_sector' => $this->t('Industry sub sector'),
      'government_sub_sector' => $this->t('Government sub sector'),
      'academia_sub_sector' => $this->t('Academia sub sector'),
      'website' => $this->t('Organization website'),
      'facebook' => $this->t('Facebook profile'),
      'instagram' => $this->t('Instagram profile'),
      'linkedin' => $this->t('LinkedIn profile'),
      'wechat' => $this->t('WeChat profile'),
      'street_address' => $this->t('Street address'),
      'street_address_2' => $this->t('Street address line 2'),
      'city' => $this->t('City'),
      'postal_code' => $this->t('Postal code'),
      'state' => $this->t('State'),
      'country_code' => $this->t('Country code'),
      'field_of_research' => $this->t('Field of Interest'),
      'other_field_of_research' => $this->t('Other Field of Interest'),
      'agricultural_and_food_sciences' => $this->t('Agricultural & Food Sciences'),
      'biological_sciences' => $this->t('Biological Sciences'),
      'chemical_sciences' => $this->t('Chemical Sciences'),
      'earth_sciences' => $this->t('Earth Sciences'),
      'economics' => $this->t('Economics'),
      'engineering' => $this->t('Engineering'),
      'environmental_sciences' => $this->t('Environmental Sciences'),
      'health_sciences' => $this->t('Health Sciences'),
      'information_and_computing_sciences' => $this->t('Information & Computing Sciences'),
      'mathematical_sciences' => $this->t('Mathematical Sciences'),
      'physical_sciences' => $this->t('Physical Sciences'),
      'social_sciences' => $this->t('Social Sciences'),
      'creator_uid' => $this->t('CRM creator user'),
      'affiliate_uids' => $this->t('CRM affiliated users'),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getIds() {
    return [
      'id' => [
        'type' => 'integer',
        'alias' => 'c',
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function supportsCount() {
    return FALSE;
  }

}

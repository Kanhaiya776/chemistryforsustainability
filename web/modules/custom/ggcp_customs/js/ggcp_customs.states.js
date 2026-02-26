/**
 * @file
 * ggcp_customs.states.js
 */

(function ($, Drupal) {

  /**
   * Sets states depending on the chosen country.
   *
   * @type {Drupal~behavior}
   *
   * @prop {Drupal~behaviorAttach} attach
   */
  Drupal.behaviors.ggcpCustomsStates = {
    attach(context, settings) {
      $(once('loadEligibleStates', 'form.node-form [data-drupal-selector="edit-' + drupalSettings.ggcp_customs.country_field + '"]', context)).on('change', function() {
        var countries = $(this).val();
        var $stateElement = $('[data-drupal-selector="edit-' + drupalSettings.ggcp_customs.state_field + '"]', $(this).parents('form'));
        // $stateElement.find('option').not(':first').remove();

        $stateElement.children().remove();
        if (countries != Drupal.t('_none')) {
          countries = Array.isArray(countries) ? countries : [countries];
          countries.forEach((v) => {
            $stateElement.append(settings.ggcp_customs.states[v]);
          });
        }
      }).trigger('change');
    },
  };

})(jQuery, Drupal, drupalSettings);

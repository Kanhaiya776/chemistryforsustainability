(function ($, Drupal, once) {

  Drupal.behaviors.acsStateDynamic = {
    attach: function (context) {

      $(once('acsStateDynamic', context)).each(function () {

        const $country = $('.acs-country-select', context);
        const $state   = $('.acs-state-select', context);

        if (!$country.length || !$state.length) {
          return;
        }

        function populateStates(countries) {

          if (!countries.length) {
            $state.empty();
            return;
          }

          $.ajax({
          url: Drupal.url('acs-custom-country/states'),
          type: 'GET',
          data: { countries: countries },
          success: function(data) {

            // Clear old options
            $state.empty();

            // Add new options
            $.each(data, function(value, label) {
              $state.append(
                $('<option></option>').val(String(value)).text(label)
              );
            });

            // Apply saved values from data attribute
            const savedValues = JSON.parse($state.attr('data-saved-values') || '[]');

            $state.val(savedValues);

            // Update Select2 UI
            if ($state.hasClass('select2-hidden-accessible')) {
              $state.trigger('change.select2');
            } else {
              $state.trigger('change');
            }
          }
        });
        }

        // Initial load (important for edit form)
        populateStates($country.val() || []);

        // On country change
        $country.on('change', function () {
          populateStates($(this).val() || []);
        });

      });

    }
  };

})(jQuery, Drupal, once);

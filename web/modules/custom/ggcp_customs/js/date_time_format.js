(function ($, Drupal, once) {
    'use strict';

    Drupal.behaviors.dateTimeFormat = {
        attach: function (context, settings) {
            // $(once('add-empty-option','select[name*="field_location_country"][name*="[value]"]', context)).each(function() {
            //     if ($(this).find('option[value=""]').length === 0) {
            //         $(this).prepend($('<option value="">Select country</option>'));
            //         $(this).val('');
            //     }
            // });
            $('.js-form-item-field-location-country-0-value label').addClass('js-form-required form-required');
            const trainingLabels = {
                '#edit-field-time-of-training-0-value-date': 'Start Date',
                '#edit-field-time-of-training-0-value-time': 'Start Time',
                '#edit-field-time-of-training-0-end-value-date': 'End Date',
                '#edit-field-time-of-training-0-end-value-time': 'End Time'
            };

            // Loop through and show labels
            $.each(trainingLabels, function(inputId, labelText) {
                const $label = $(inputId).closest('.js-form-item').find('label.visually-hidden');
                $label.removeClass('visually-hidden').text(labelText);
            });
            
            const registrationLabels = {
                '#edit-field-registrations-date-time-0-value-date': 'Registration Opens',
                '#edit-field-registrations-date-time-0-value-time': 'Start Time',
                '#edit-field-registrations-date-time-0-end-value-date': 'Registration Ends',
                '#edit-field-registrations-date-time-0-end-value-time': 'End Time'
            };

            // Loop through and show labels
            $.each(registrationLabels, function(inputId, labelText) {
                const $label = $(inputId).closest('.js-form-item').find('label.visually-hidden');
                $label.removeClass('visually-hidden').text(labelText).css("text-wrap-mode","nowrap");
            });
        }
    }
})(jQuery, Drupal, once);
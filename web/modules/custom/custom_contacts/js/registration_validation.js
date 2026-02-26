(function ($, Drupal) {
  Drupal.behaviors.custom_contacts = {
    attach: function (context) {
      $('.webform-required').addClass("container mt-4")
      const orgInput = $('[name="organization_name"]', context);

      orgInput.off('input.orgCheck').on('input.orgCheck', function (e) {
        const orgName = $(this).val();
        const customField = $('[name="organization_acronym"]');
        const match = orgName.match(/\(([^)]+)\)/);
        
        if (match) {
          customField.val(match[1]);
        }
      });

      $('[name="organization_acronym"]').on('change keydown', function (e) {
        let orgNameField = $('[name="organization_name"]');
        let newValueField = $(this);
        let orgName = orgNameField.val();
        let newValue = newValueField.val();
        let values = orgName.split(/\s*\(\s*(.*?)\s*\)\s*/);
        if (e.type === 'change') {
          if (!orgName.includes(newValue)) {
            orgNameField.val(values[0].trim() + " (" + newValue.toUpperCase() + ")");
          }

        } else if (e.key === "Backspace") {
          if (values.length >= 1) {
            orgNameField.val(values[0].trim());
          }
          newValueField.val('');
        }
      }).trigger("change");

      $('[name="field_of_interest[]"]').change(function () {
        var selectedOptions = $(this).val();
        if (selectedOptions && selectedOptions.includes('254')) {
          $('.form-item-other-interest').show();
        } else {
          $('[name="other_interest"]').val("");
          $('.form-item-other-interest').hide();
        }
      }).trigger('change');

      $('[name="fields_of_expertise[]"]').change(function () {
        var selectedOptions = $(this).val();
        if (selectedOptions && selectedOptions.includes('254')) {
          $('.form-item-other-expertise').show();
        } else {
          $('[name="other_expertise"]').val("");
          $('.form-item-other-expertise').hide();
        }
      }).trigger('change');
      
      $(document).ajaxComplete(function (event, xhr, settings) {
        let spokenLang = $('[name="spoken_language_s_select_all_that_apply[]"]').val();
        let interestField = $('[name="field_of_interest[]"]').val();
        let expertiseField = $('[name="fields_of_expertise[]"]').val();
        
        if (!spokenLang ||
          (Array.isArray(spokenLang) && spokenLang.length === 0) ||
          (typeof spokenLang === 'string' && spokenLang.trim().length === 0)) {
          $(".form-item-spoken-language-s-select-all-that-apply").addClass("error")
        } else {
          $(".form-item-spoken-language-s-select-all-that-apply").removeClass("error")
        }

        if (!interestField || (Array.isArray(interestField) && interestField.length === 0)) {
          $(".form-item-field-of-interest").addClass("error")
        } else {
          $(".form-item-field-of-interest").removeClass("error")
        }

        if (!expertiseField || (Array.isArray(expertiseField) && expertiseField.length === 0)) {
          $(".form-item-fields-of-expertise").addClass("error")
        } else {
          $(".form-item-fields-of-expertise").removeClass("error")
        }
        
      })
    }
  };

})(jQuery, Drupal);

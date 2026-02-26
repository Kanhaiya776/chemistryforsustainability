(function ($, Drupal) {
  Drupal.behaviors.ggcp_customs = {
    attach: function (context, settings) {
      $('.webform-required').addClass("container mt-4")

      const inputRules = [
        {
          "name": "first_name",
          "pattern": "^[a-zA-Z\\s' -]*$"
        },
        {
          "name": "last_name",
          "pattern": "^[a-zA-Z\\s' -]*$"
        },
        {
          "name": "job_title",
          "pattern": "^[a-zA-Z0-9, &-]*$"
        },
        {
          "name": "academic_institution_s",
          "pattern": "^[a-zA-Z0-9, &-]*$"
        },
        {
          "name": "academic_field_s_of_study",
          "pattern": "^[a-zA-Z0-9, &-]*$"
        },
        {
          "name": "identify_topics_in_which_you_wish_to_mentor",
          "pattern": "^[a-zA-Z0-9 .(),\\r\\n]{0,2500}$"
        },
        {
          "name": "linkedin_profile_url",
          "pattern": "^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$"
        },
        {
          "name": "website",
          "pattern": "^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$"
        },
        {
          "name": "orcid_id_link",
          "pattern": "^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$"
        },
        {
          "name": "google_scholar_link",
          "pattern": "^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$"
        },
        {
          "name": "instagram_profile",
          "pattern": "^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$"
        },
        {
          "name": "wechat_link",
          "pattern": "^(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*$"
        },
        {
          "name": "spoken_languages",
          "pattern": "/^(?=.*\S).+$/"
        }
      ];

      function setupInputValidation(rules) {
        rules.forEach(rule => {
          const input = document.querySelector(`[name="${rule.name}"]`);
          if (!input) return;

          const isRequired = input.hasAttribute('required') || false;
          const isMultipleSelect = input.tagName.toLowerCase() === 'select' && input.multiple;
          const pattern = rule.pattern ? new RegExp(rule.pattern) : null;

          function validate() {
            let isValid = true;

            if (isMultipleSelect) {
              const selectedOptions = Array.from(input.selectedOptions).length;
              isValid = selectedOptions >= 1;
            } else {
              const value = input.value.trim();

              if (isRequired && value === '') {
                isValid = false;
              } else if (pattern && value !== '' && !pattern.test(value)) {
                isValid = false;
              }
            }

            if (!isValid) {
              input.classList.add('error');
              $(".form-item-spoken-languages").removeClass("error")
            } else {
              input.classList.remove('error');
              $(".form-item-spoken-languages").removeClass("error")
            }
          }

          input.addEventListener('change', validate);
          input.addEventListener('input', validate); 

          validate();
        });
      }

      setupInputValidation(inputRules);

      $('[name="field_of_interest[]"]').change(function () {
        var selectedOptions = $(this).val();
        if (selectedOptions && selectedOptions.includes('254')) {
          $('.form-item-specify-other-fields-of-interest').show();
        } else {
          $('[name="specify_other_fields_of_interest"]').val("");
          $('.form-item-specify-other-fields-of-interest').hide();
        }
      }).trigger('change');

      $('[name="fields_of_expertise[]"]').change(function () {
        var selectedOptions = $(this).val();
        if (selectedOptions && selectedOptions.includes('254')) {
          $('.form-item-other-fields-of-expertise').show();
        } else {
          $('[name="other_fields_of_expertise"]').val("");
          $('.form-item-other-fields-of-expertise').hide();
        }
      }).trigger('change');

      $('[name="spoken_languages[]"]').change(function () {
        var spokenLang = $(this).val();
        if (!spokenLang ||
          (Array.isArray(spokenLang) && spokenLang.length === 0) ||
          (typeof spokenLang === 'string' && spokenLang.trim().length === 0)) {
          $(".form-item-spoken-languages").addClass("error")
        } else {
          $(".form-item-spoken-languages").removeClass("error")
        }
      }).trigger('change');


      var focusInvalidFields = function (context) {
        const $invalidFields = $('.is-invalid, .error', context);
        if ($invalidFields.length > 0) {
          const $element = $invalidFields.first().find('input, select, textarea').addBack('input, select, textarea').first();
          const fieldName = $element.attr('name');
          if ($('.token-input-highlighted-token').length > 0 || $('.token-input-input-token input').is(':focus') || fieldName == "civicrm_2_contact_1_contact_existing") {
            return
          }
          if ($element.length) {
            $element.trigger('focus');
            $('html, body').animate({
              scrollTop: $element.offset().top - 100
            }, 1);
          }
        }
      };

      $(document).ajaxComplete(function () {
        focusInvalidFields(document);
      });
    }
  };
})(jQuery, Drupal);

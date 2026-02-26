// Debounce utility
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Variable to hold the ongoing AJAX request
let xhrRequest = null;

(function ($, Drupal) {
  Drupal.behaviors.ggcp_customs = {
    attach: function (context, settings) {
      const orgInput = $('[data-civicrm-field-key="civicrm_2_contact_1_contact_organization_name"]', context);
      const customField = $('[data-civicrm-field-key="civicrm_2_contact_1_cg8_custom_141"]', context);

      // Common function to trigger API call
      function checkOrganization(orgName) {
        $('.error-message', orgInput.parent()).remove();

        if (xhrRequest !== null) {
          xhrRequest.abort();
          xhrRequest = null;
        }

        if (orgName.length > 2) {
          const csrfToken = '{{ drupal_token("custom_ajax_tkn") }}';

          xhrRequest = $.ajax({
            url: '/check-org',
            type: 'POST',
            headers: {
              'X-CSRF-Token': csrfToken
            },
            data: JSON.stringify({ search_org: orgName }),
            dataType: 'json',
            success: function (response) {
              if (response.exists) {
                orgInput.after('<span class="error-message error text-danger">Organization name already exists</span>');
              }
            },
            error: function (xhr, textStatus, errorThrown) {
              if (textStatus !== 'abort') {
                console.error("Failed to retrieve organization:", errorThrown);
              }
            }
          });
        }
      }

      // Org name input listener
      orgInput.off('input.orgCheck').on('input.orgCheck', debounce(function (e) {
        const orgName = $(this).val();
        const match = orgName.match(/\(([^)]+)\)/);

        checkOrganization(orgName);

        if (match) {
          customField.val(match[1]);
        }
      }, 1000));

      // Custom field change triggers revalidation and updates org field
      customField.off('input change keydown').on('input change keydown', function (e) {
        let newValue = $(this).val().toUpperCase();
        $(this).val(newValue);

        const orgNameField = orgInput;
        let orgName = orgNameField.val();
        let values = orgName.split(/\s*\(\s*(.*?)\s*\)\s*/);

        if (e.type === 'change' || e.type === 'input') {
          if (!orgName.includes(newValue)) {
            orgNameField.val(values[0].trim() + " (" + newValue + ")");
          }
        } else if (e.key === "Backspace") {
          if (values.length >= 1) {
            orgNameField.val(values[0].trim());
          }
          $(this).val('');
        }

        // Trigger API call on change
        checkOrganization(orgInput.val());
      }).trigger("change");
    

      $(document).ajaxComplete(function (event, xhr, settings) {
        const country = $('[data-civicrm-field-key="civicrm_2_contact_1_address_country_id"]').val();
        
        if(xhr?.responseJSON.length > 1){
          if(country.length === 0){
            $('.form-item-civicrm-2-contact-1-address-country-id').addClass("error");
          }else{
            $('.form-item-civicrm-2-contact-1-address-country-id').removeClass("error");
          }
        }
      })
    }
  };
})(jQuery, Drupal);

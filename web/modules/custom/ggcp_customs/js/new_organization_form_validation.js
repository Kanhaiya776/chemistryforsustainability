(function ($, Drupal, once) {
  Drupal.behaviors.organizationNameCheck = {
    attach(context) {

      const orgInput = $(once(
        'org-name',
        '[data-drupal-selector="edit-organization-name"]',
        context
      ));

      const acronymInput = $(once(
        'org-acronym',
        '[data-drupal-selector="edit-organization-acronym"]',
        context
      ));

      if (!orgInput.length || !acronymInput.length) {
        return;
      }

      let xhr = null;
      let orgExists = false;

      function debounce(fn, delay) {
        let t;
        return function (...args) {
          clearTimeout(t);
          t = setTimeout(() => fn.apply(this, args), delay);
        };
      }

      function showError() {
        orgInput.siblings('.error-message').remove();
        orgInput.after(
          '<div class="error-message text-danger">Organization already exists</div>'
        );
      }

      function clearError() {
        orgInput.siblings('.error-message').remove();
      }

      function checkOrganization(name) {
        clearError();
        orgExists = false;

        if (xhr) {
          xhr.abort();
          xhr = null;
        }

        if (name.length < 3) {
          return;
        }

        xhr = $.ajax({
          url: '/check-org',
          type: 'POST',
          contentType: 'application/json',
          dataType: 'json',
          data: JSON.stringify({ search: name }),
          success(res) {
            orgExists = !!res.exists;
            if (orgExists) {
              showError();
            }
          }
        });
      }

      // Org name typing
      orgInput.on(
        'input',
        debounce(function () {
          const val = $(this).val();
          const match = val.match(/\(([^)]+)\)/);

          checkOrganization(val);

          if (match) {
            acronymInput.val(match[1]);
          }
        }, 800)
      );

      // Acronym sync
      acronymInput.on('input keydown change', function (e) {
        let value = $(this).val().toUpperCase();
        $(this).val(value);

        let base = orgInput.val()
          .split(/\s*\(\s*(.*?)\s*\)\s*/)[0]
          .trim();

        if (e.key === 'Backspace' && !value) {
          orgInput.val(base);
          checkOrganization(base);
          return;
        }

        if (value) {
          orgInput.val(`${base} (${value})`);
        }

        checkOrganization(orgInput.val());
      });

      const form = orgInput.closest('form');

      form.on('submit', function (e) {
        if (orgExists) {
          e.preventDefault();
          e.stopImmediatePropagation();
          showError();
          orgInput.trigger('focus');
        }
      });
    }
  };
})(jQuery, Drupal, once);

(function (Drupal) {
  Drupal.AjaxCommands.prototype.userProfileClose = function () {
    setTimeout(() => {
        window.close();
    }, 3000);
  };
})(Drupal);

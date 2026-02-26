(function ($) {
  const originalAjax = $.ajax;
  $.ajax = function (options) {
    if (
      options.url &&
      options.url.includes('civicrm_2_contact_1_contact_existing')
    ) {
      const originalSuccess = options.success;
      options.success = function (data) {
        if (Array.isArray(data)) {
          let found = false;
          data = data.filter(function (item) {
            if (
              !found &&
              item.name &&
              item.name.trim() === 'ACS Green Chemistry Institute'
            ) {
              found = true;
              return false;
            }
            return true;
          });
        }
        if (originalSuccess) {
          originalSuccess(data);
        }
      };
    }
    return originalAjax.call(this, options);
  };
})(jQuery);

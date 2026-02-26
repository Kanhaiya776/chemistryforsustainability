(function ($, Drupal, once) {
  'use strict';
  Drupal.behaviors.pfSubmitSort = {
    attach: function (context, settings) {
      once('auto-submit-sort', '#edit-sort-by--2', context).forEach(function (element) {
        $(element).on('change', function () {
          $(this).closest('form').submit();
        });
      });
    }
  };
})(jQuery, Drupal, once);
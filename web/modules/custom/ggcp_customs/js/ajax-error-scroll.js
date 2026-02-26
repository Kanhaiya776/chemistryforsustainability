(function ($, Drupal, once) {
  Drupal.behaviors.ggcpAjaxErrorScroll = {
    attach: function (context) {

      const firstError = once(
        'ggcp-ajax-error',
        $('[aria-invalid="true"]', context)
      ).shift();

      if (!firstError) {
        return;
      }

      const $error = $(firstError);

      // Detect modal container (Drupal dialogs, Bootstrap modals, custom modals)
      const $modalContainer = $error.closest(
        '.ui-dialog-content, .modal-body, .dialog-content'
      );

      if ($modalContainer.length) {
        //Scroll INSIDE modal
        const currentScroll = $modalContainer.scrollTop();
        const offsetTop = $error.position().top;

        $modalContainer.animate({
          scrollTop: currentScroll + offsetTop - 80
        }, 300);
      }
      else {
        //Normal page scroll
        $('html, body').animate({
          scrollTop: $error.offset().top - 120
        }, 300);
      }

      // Focus after scroll
      setTimeout(() => {
        $error.trigger('focus');
      }, 350);
    }
  };
})(jQuery, Drupal, once);

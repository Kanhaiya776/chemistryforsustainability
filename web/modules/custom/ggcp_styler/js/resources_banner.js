(function ($, Drupal, drupalSettings, once) {
  Drupal.behaviors.resources_banner = {
    attach(context, settings) {
      const $resourcesContext = once('resources-context', '#block-acs-gcs-resourcesbanner', context);

      if (!($resourcesContext.length)) {
        return;
      }

      const $rightColumn = $('.right-column', $resourcesContext).first();
      const $links = $('.links .field__item', $rightColumn);

      const linkToBlockMap = {
        'Chemical Policies': 'resources-education',
        'Tools & Metrics': 'resources-tools',
        'Publications & Reports': 'resources-publications',
        'Safer Alternatives': 'resources-case',
        'Funding': 'resources-funding',
        'Global Greenchem Accelerator': 'resources-accelerator'
      };

      // Hover event handler for links
      $links.each(function() {
        const $linkText = $(this).find('a'); // Get the child <a> element
        const linkText = $(this).text().trim();
        const blockIdToShow = linkToBlockMap[linkText];

        if (!blockIdToShow) {
          return;
        }

        $linkText.on('mouseenter', function() {
          const topPosition = $(this).offset().top - $rightColumn.offset().top;

          $('#resources-main').removeClass('show').addClass('hidden');
          $(`#${blockIdToShow}`).removeClass('hidden').addClass('show');
          $(`#${blockIdToShow}`).find('.triangle-right').css('top', topPosition + 'px');
        });

        $linkText.on('mouseleave', function() {

          $('#resources-main').removeClass('hidden').addClass('show');
          $(`#${blockIdToShow}`).removeClass('show').addClass('hidden');
        });
      });
    }
  };
})(jQuery, Drupal, drupalSettings, once);

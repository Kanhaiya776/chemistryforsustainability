(function ($, Drupal) {
  Drupal.behaviors.ggcp_customs = {
    attach: function (context, settings) {
      Drupal.behaviors.ggcp_customs.recallChangeEvent(context);
    },

    /**
     * Recall change event for dependee field.
     *
     * @param context
     */
    recallChangeEvent: function (context) {
      $('.conditional_field_custom_event', context).each(function(index, element) {
        var selectorId = $(element).attr('id').replace('-wrapper', '');
        $(`#${selectorId}`).trigger('change');
      });
    },
  };
})(jQuery, Drupal);

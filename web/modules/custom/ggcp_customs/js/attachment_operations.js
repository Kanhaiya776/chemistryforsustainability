(function ($, Drupal) {
  'use strict';

  Drupal.behaviors.attachmentNameToggle = {
    attach: function (context) {
        //Usign mutation observer
      const $fileWidget = $(context).find('[data-drupal-selector="edit-field-attachments-wrapper"]');
      const $checkFileAttachmentDesc =  $('.form-item-field-attachments-0-description');
      const $removeBtn = $(document).find('[data-drupal-selector="edit-field-attachments-0-remove-button"]');
      $('.js-form-item-field-attachment-name-0-value label').addClass('js-form-required form-required');
      $('.js-form-item-field-attachments-0-description label').addClass('js-form-required form-required');
      if (!$fileWidget.length) return;

      // Elements to show/hide (use IDs or classes you control)
      const $nameFieldWrapper = $('#edit-field-attachment-name-wrapper');
      const $nameTextLabel = $('.field-attachment-name-text');

      if (!$nameFieldWrapper.length || !$nameTextLabel.length) return;

      // Toggle visibility based on whether a file is attached
      const toggleNameField = () => {
        const hasFile = $('input[name="field_attachments[0][fids]"]').val() !== '';
        $nameFieldWrapper.toggle(hasFile);
        $nameTextLabel.toggle(hasFile);
        
      };

      // Run once on initial attach
      toggleNameField();

      // Observe DOM changes inside the file widget container
      const observer = new MutationObserver(() => {
        // Small delay ensures Drupal finished updating hidden fids field
        // const $desc = $('.form-item-field-attachments-0-description');
        // $nameFieldWrapper.insertBefore($desc)
        // $nameTextLabel.insertAfter($nameFieldWrapper);
        setTimeout(() => {
            toggleNameField()
        }, 10);
      });

      // Start observing
      observer.observe($fileWidget[0], {
        childList: true,
        subtree: true,
      });

      // Clean up observer when leaving (rarely needed in Drupal)
      if (typeof Drupal.behaviors.attachmentNameToggle.detach === 'undefined') {
        Drupal.behaviors.attachmentNameToggle.detach = function () {
          observer.disconnect();
        };
      }
    }
  };
})(jQuery, Drupal);
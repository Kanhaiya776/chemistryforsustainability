(function ($, Drupal, drupalSettings, once) {
  const getPencilIcon = (context) => context.find('.pencil-square-icon').first();

  const getElementsWithClass = (context, classNames) => {
    const elements = [];
    classNames.forEach(className => {
      const $element = context.find(`.${className}`);
      if ($element.length) {
        elements.push($element);
      }
    });
    return elements;
  };

  const handleMouseEffects = ($element, $targets, event) => {
    $element.on(event, () => {
      if ($targets instanceof $) {
        $targets.addClass('highlighted-text');
      } else if ($targets instanceof Array) {
        $targets.forEach($target => {
          $target.addClass('highlighted-text');
        });
      }
    });

    $element.on('mouseleave', () => {
      if ($targets instanceof $) {
        $targets.removeClass('highlighted-text');
      } else if ($targets instanceof Array) {
        $targets.forEach($target => {
          $target.removeClass('highlighted-text');
        });
      }
    });
  };

  function adjustPosition() {
    var profileLocationPos = $('.position-element').position();
    var additionalViews = $('.additional-views');

    additionalViews.css({
      'position': 'absolute',
      'top': profileLocationPos.top + 80 + $('.position-element').outerHeight() + 'px',
      'left': profileLocationPos.left + 80 + 'px',
      // Other styles as needed
    });
  }

  const processWordsToSpans = ($elements) => {
    $elements.each(function () {
      const text = $(this).text();
      const words = text.split(/\s*,\s*/);
      let newHTML = '';
      words.forEach(word => {
        newHTML += `<span class="word">${word}</span>`;
      });
      $(this).html(newHTML);
    });
  };

  const positionElement = ($element, $referenceElement, offsetX, offsetY) => {
    const position = $referenceElement.position();
    const iconLeft = position.left + $referenceElement.outerWidth() + offsetX;
    const iconTop = position.top + offsetY;
    $element.css({
      position: 'absolute',
      top: `${iconTop}px`,
      left: `${iconLeft}px`
    });
  };

  Drupal.behaviors.edit_icon = {
    attach(context, settings) {

    }
  };
})(jQuery, Drupal, drupalSettings, once);

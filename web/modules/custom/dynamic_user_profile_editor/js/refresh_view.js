(function($, Drupal, drupalSettings, once) {
  const onViewRefresh = () => {
    const $profileContext = $('#user-profile-container');
    const context = $profileContext;
    adjustPosition();
    const $basicProfile = $('.basic-profile', $profileContext);
    const $fieldsOfResearchElement = $('.fields-of-research .views-row .fields-of-research-wrapper-label, .fields-of-research h2', $profileContext);
    const $profileLanguage = $('.profile-language', $profileContext);
    const $profileEmail = $('.profile-email', $profileContext);
    const $profileAffiliation = $('.affiliation', $profileContext);
    const $profileLinks = $('.profile-links', $profileContext);
    const $profileEducation = $('.block-views-blockeditable-user-profile-education-and-interests-block', $profileContext);
    const $profileMentor    = $('.block-views-blockeditable-user-profile-mentor-profile-block', $profileContext);

    const $basicProfilePencilIcon = getPencilIcon($basicProfile);
    const $profileLanguagePencilIcon = getPencilIcon($profileLanguage);
    const $profileEmailPencilIcon = getPencilIcon($profileEmail);
    const $profileAffiliationPencilIcon = getPencilIcon($profileAffiliation);
    const $profileLinksPencilIcon = getPencilIcon($profileLinks);
    const $profileEducationPencilIcon = getPencilIcon($profileEducation);
    const $profileMentorPencilIcon = getPencilIcon($profileMentor);

    const $basicProfileElements = getElementsWithClass($basicProfile, ['profile-name', 'profile-pronouns', 'profile-location', 'profile-biography']);
    const $profileLanguageElements = $('.views-row', $profileLanguage);
    const $profileEmailElements = $('.views-row', $profileEmail);
    const $profileAffiliationElements = $('.views-row', $profileAffiliation);
    const $profileLinksElements = $('.views-row', $profileLinks);
    const $profileEducationElements = $('.views-row', $profileEducation);
    const $profileMentorElements    = $('.views-row', $profileMentor);

    handleMouseEffects($basicProfilePencilIcon, $basicProfileElements.concat($fieldsOfResearchElement), 'mouseenter');
    handleMouseEffects($profileLanguagePencilIcon, $profileLanguageElements, 'mouseenter');
    handleMouseEffects($profileEmailPencilIcon, $profileEmailElements, 'mouseenter');
    handleMouseEffects($profileAffiliationPencilIcon, $profileAffiliationElements, 'mouseenter');
    handleMouseEffects($profileLinksPencilIcon, $profileLinksElements, 'mouseenter');
    handleMouseEffects($profileEducationPencilIcon, $profileEducationElements, 'mouseenter');
    handleMouseEffects($profileMentorPencilIcon, $profileMentorElements, 'mouseenter');

    processWordsToSpans($('.fields-of-research-wrapper-body', $profileContext));

    const $profileName = $('.profile-name ', $basicProfile);
    positionElement($basicProfilePencilIcon, $profileName, 10, 4);
    const $languageName = $('.block-views-blockeditable-user-profile-language-profile-block .views-row .language-profile', $basicProfile).first();
    positionElement($profileLanguagePencilIcon, $languageName, 10, 0);
    const $emailName = $('.block-views-blockeditable-user-profile-email-profile-block .views-row .email-profile', $basicProfile).first();
    positionElement($profileEmailPencilIcon, $emailName, 10, 0);
    const $affiliationName = $('.block-views-blockeditable-user-profile-affilation-profile-block h2', $profileAffiliation).first();
    positionElement($profileAffiliationPencilIcon, $affiliationName, 10, 4);
    const $linksName = $('.block-views-blockeditable-user-profile-profile-links-block h2', $profileLinks).first();
    positionElement($profileLinksPencilIcon, $linksName, 10, 4);
    const $educationName = $('h2', $profileEducation).first();
    positionElement($profileEducationPencilIcon, $educationName, 10, 4);
    const $mentorName = $('h2', $profileMentor).first();
    positionElement($profileMentorPencilIcon, $mentorName, 10, 4);
  }
  const refreshViewAdjustElements = ($profileContext, context) => {
    if (!$profileContext.length) {
      return;
    }

    adjustPosition();
    $(window).on('resize', function() {
      adjustPosition();
    });

    const $basicProfile = $('.basic-profile', $profileContext);
    const $fieldsOfResearchElement = $('.fields-of-research .views-row .fields-of-research-wrapper-label, .fields-of-research h2', $profileContext);
    const $profileLanguage = $('.profile-language', $profileContext);
    const $profileEmail = $('.profile-email', $profileContext);
    const $profileAffiliation = $('.affiliation', $profileContext);
    const $profileLinks = $('.profile-links', $profileContext);
    const $profileEducation = $('.block-views-blockeditable-user-profile-education-and-interests-block', $profileContext);
    const $profileMentor    = $('.block-views-blockeditable-user-profile-mentor-profile-block', $profileContext);

    const $basicProfilePencilIcon = getPencilIcon($basicProfile);
    const $profileLanguagePencilIcon = getPencilIcon($profileLanguage);
    const $profileEmailPencilIcon = getPencilIcon($profileEmail);
    const $profileAffiliationPencilIcon = getPencilIcon($profileAffiliation);
    const $profileLinksPencilIcon = getPencilIcon($profileLinks);
    const $profileEducationPencilIcon = getPencilIcon($profileEducation);
    const $profileMentorPencilIcon = getPencilIcon($profileMentor);

    const $basicProfileElements = getElementsWithClass($basicProfile, ['profile-name', 'profile-pronouns', 'profile-location', 'profile-biography']);
    const $profileLanguageElements = $('.views-row', $profileLanguage);
    const $profileEmailElements = $('.views-row', $profileEmail);
    const $profileAffiliationElements = $('.views-row', $profileAffiliation);
    const $profileLinksElements = $('.views-row', $profileLinks);
    const $profileEducationElements = $('.views-row', $profileEducation);
    const $profileMentorElements = $('.views-row', $profileMentor);

    handleMouseEffects($basicProfilePencilIcon, $basicProfileElements.concat($fieldsOfResearchElement), 'mouseenter');
    handleMouseEffects($profileLanguagePencilIcon, $profileLanguageElements, 'mouseenter');
    handleMouseEffects($profileEmailPencilIcon, $profileEmailElements, 'mouseenter');
    handleMouseEffects($profileAffiliationPencilIcon, $profileAffiliationElements, 'mouseenter');
    handleMouseEffects($profileLinksPencilIcon, $profileLinksElements, 'mouseenter');
    handleMouseEffects($profileEducationPencilIcon, $profileEducationElements, 'mouseenter');
    handleMouseEffects($profileMentorPencilIcon, $profileMentorElements, 'mouseenter');

    processWordsToSpans($('.fields-of-research-wrapper-body', $profileContext));

    const $profileName = $('.profile-name ', $basicProfile);
    positionElement($basicProfilePencilIcon, $profileName, 10, 4);
    $(window).on('resize', function() {
      positionElement($basicProfilePencilIcon, $profileName, 10, 4);
    });
    const $languageName = $('.block-views-blockeditable-user-profile-language-profile-block .views-row .language-profile', $basicProfile).first();
    positionElement($profileLanguagePencilIcon, $languageName, 10, 0);
    const $emailName = $('.block-views-blockeditable-user-profile-email-profile-block .views-row .email-profile', $basicProfile).first();
    positionElement($profileEmailPencilIcon, $emailName, 10, 0);
    const $affiliationName = $('.block-views-blockeditable-user-profile-affilation-profile-block h2', $profileAffiliation).first();
    positionElement($profileAffiliationPencilIcon, $affiliationName, 10, 4);
    const $linksName = $('.block-views-blockeditable-user-profile-profile-links-block h2', $profileLinks).first();
    positionElement($profileLinksPencilIcon, $linksName, 10, 4);
    const $educationName = $('h2', $profileEducation).first();
    positionElement($profileEducationPencilIcon, $educationName, 10, 4);
    const $mentorName = $('h2', $profileMentor).first();
    positionElement($profileMentorPencilIcon, $mentorName, 10, 4);
  }

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
    if (!($elements.length)) {
      return;
    }
    $elements.each(function () {
      const text = $(this).text();
      const words = text.split(/\s*,\s*/);
      let newHTML = '';
      words.forEach(word => {
        // Clean the word by removing non-alphanumeric characters and trimming whitespace
        const cleanedWord = word.replace(/[^\w\s]/gi, '').trim();
        if (cleanedWord) { // Check if the cleaned word is not empty
          newHTML += `<span class="word">${cleanedWord}<span class="hide">,</span></span>`;
        }
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

  Drupal.behaviors.my_custom_behavior = {
    attach(context, settings) {
      var currentUserId = drupalSettings.currentUserId;
      var routeUserId   = drupalSettings.routeUserId;
      var ismentor      = drupalSettings.willingToBeMentorValue;
      if(ismentor == 0 && currentUserId != routeUserId) {
        $('.block-views-blockeditable-user-profile-mentor-profile-block h2').hide();
      }

      const $profileContext = $(once('profile-context', '#user-profile-container', context));
      refreshViewAdjustElements($profileContext, context);
      $.fn.refreshViewCallback = function(viewId, displayId) {
        const instances = Drupal.views.instances;
        let viewsToRefresh = [];

        $.each( instances , function getInstance( index, element){
          if (viewId === element.settings.view_name && displayId === element.settings.view_display_id) {
            viewsToRefresh.push(once('refresh-view-elements', '.js-view-dom-id-' + element.settings.view_dom_id));
          }
        });

        if (displayId === 'basic_profile_block') {
          $.each( instances , function getInstance( index, element){
            if (viewId === element.settings.view_name && 'fields_of_research_block' === element.settings.view_display_id) {
              viewsToRefresh.push(once('refresh-view-elements', '.js-view-dom-id-' + element.settings.view_dom_id));
            }
          });
        }

        viewsToRefresh.forEach((viewName) => {
          if (typeof $(viewName) === 'undefined') {
            return;
          }

          if ($(viewName)) {
            $(viewName).trigger('RefreshView');
          }
        })

        $(document).ajaxComplete(function(event, xhr, settings){
          onViewRefresh(context, context);
        });

      };
    }
  };
})(jQuery, Drupal, drupalSettings, once);

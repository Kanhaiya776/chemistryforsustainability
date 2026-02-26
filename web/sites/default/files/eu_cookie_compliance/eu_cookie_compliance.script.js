  window.euCookieComplianceLoadScripts = function(category) {
    const unverifiedScripts = drupalSettings.eu_cookie_compliance.unverified_scripts;
    const scriptList = [{"src":"/modules/contrib/google_tag/js/gtag.js","loadByBehavior":false,"attachName":null},{"src":"/modules/contrib/google_tag/js/gtm.js","loadByBehavior":false,"attachName":null},{"src":"/modules/contrib/google_tag/js/gtag.ajax.js","loadByBehavior":false,"attachName":null}];

    scriptList.forEach(({src, loadByBehavior, attachName}) => {
      if (!unverifiedScripts.includes(src)) {
        const tag = document.createElement("script");
        tag.src = decodeURI(src);
        if (loadByBehavior && attachName) {
          const intervalId = setInterval(() => {
            if (Drupal.behaviors[attachName]) {
              Drupal.behaviors[attachName].attach(document, drupalSettings);
              clearInterval(intervalId);
            }
          }, 100);
        }
        document.body.appendChild(tag);
      }
    });
  }
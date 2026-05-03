/**
 * Google Consent Mode v2 – cookie consent banner
 * Stores user choice in localStorage under key 'cookie_consent'
 * Values: 'granted' | 'denied'
 */

(function () {
  'use strict';

  var STORAGE_KEY = 'cookie_consent';

  function grantConsent() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  }

  function denyConsent() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  }

  function hideBanner(banner) {
    banner.setAttribute('aria-hidden', 'true');
    banner.classList.remove('consent-banner--visible');
    setTimeout(function () {
      banner.style.display = 'none';
    }, 300);
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'consent-banner';
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', 'Ustawienia plików cookie');

    banner.innerHTML =
      '<div class="consent-banner__inner">' +
        '<div class="consent-banner__text">' +
          '<strong>Ta strona używa plików cookie</strong>' +
          '<p>Używamy plików cookie Google Analytics, aby analizować ruch na stronie i ulepszać jej działanie. ' +
          'Twoje dane są anonimowe. Więcej informacji: ' +
          '<a href="polityka-prywatnosci.html">Polityka prywatności</a>.</p>' +
        '</div>' +
        '<div class="consent-banner__actions">' +
          '<button id="consent-deny" class="consent-btn consent-btn--secondary" type="button">Tylko niezbędne</button>' +
          '<button id="consent-accept" class="consent-btn consent-btn--primary" type="button">Akceptuj</button>' +
        '</div>' +
      '</div>';

    return banner;
  }

  function init() {
    var stored = localStorage.getItem(STORAGE_KEY);

    if (stored === 'granted') {
      grantConsent();
      return;
    }

    if (stored === 'denied') {
      denyConsent();
      return;
    }

    // No stored choice – show the banner
    var banner = buildBanner();
    document.body.appendChild(banner);

    // Trigger CSS transition
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('consent-banner--visible');
      });
    });

    document.getElementById('consent-accept').addEventListener('click', function () {
      localStorage.setItem(STORAGE_KEY, 'granted');
      grantConsent();
      hideBanner(banner);
    });

    document.getElementById('consent-deny').addEventListener('click', function () {
      localStorage.setItem(STORAGE_KEY, 'denied');
      denyConsent();
      hideBanner(banner);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

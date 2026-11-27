/* Valexirion — çerez ve harici içerik tercihleri */
(function () {
  'use strict';

  var ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'; // AdSense etkinleştirildiğinde yayıncı kimliğini değiştirin.
  var ADS_KEY = 'valexirion-consent';
  var MEDIA_KEY = 'valexirion-external-media-consent';
  var VERSION = 1;
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000;
  var adsChoice = null;
  var mediaChoice = null;
  var adsLoaded = false;
  var externalMediaLoaded = false;
  var box;

  window.valexirionExternalMediaAllowed = false;
  window.valexirionExternalImagesAllowed = true;

  function readChoice(key) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || 'null');
      if (!value || value.v !== VERSION ||
          (value.choice !== 'accept' && value.choice !== 'reject') ||
          typeof value.t !== 'number' || value.t > Date.now() ||
          Date.now() - value.t >= MAX_AGE) return null;
      return value.choice;
    } catch (error) {
      console.warn('[Valexirion] Consent preference could not be read:', error);
      return null;
    }
  }

  function writeChoice(key, choice) {
    try {
      localStorage.setItem(key, JSON.stringify({ v: VERSION, choice: choice, t: Date.now() }));
      return true;
    } catch (error) {
      console.warn('[Valexirion] Consent preference could not be saved:', error);
      return false;
    }
  }

  function clearAdCookies() {
    var names = ['__gads', '__gpi'];
    var host = location.hostname;
    var parts = host.split('.');
    var domains = [''];
    domains.push(host);
    for (var i = 0; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    names.forEach(function (name) {
      domains.forEach(function (domain) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' +
          (domain ? '; domain=' + domain : '');
      });
    });
  }

  function loadAds() {
    if (adsLoaded || /XXXXXXXX/.test(ADSENSE_CLIENT)) return;
    adsLoaded = true;
    var script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
    document.head.appendChild(script);
  }

  var css = '' +
    '.vx-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;justify-content:center;' +
    'padding:0 max(.75rem,env(safe-area-inset-right)) max(.75rem,env(safe-area-inset-bottom)) max(.75rem,env(safe-area-inset-left));' +
    'pointer-events:none;transform:translateY(120%);opacity:0;visibility:hidden;' +
    'transition:transform .45s ease,opacity .35s ease,visibility 0s linear .45s}' +
    '.vx-consent.show{transform:none;opacity:1;visibility:visible;transition-delay:0s}' +
    '.vx-consent-card{pointer-events:auto;box-sizing:border-box;width:100%;max-width:760px;padding:1rem 1.15rem;' +
    'background:var(--bg-2,#f0ede4);color:var(--text,#1c1c1e);border:1px solid var(--border-2,rgba(0,0,0,.18));' +
    'border-radius:var(--radius,12px);box-shadow:var(--shadow-hover,0 8px 40px rgba(0,0,0,.2));' +
    'font-family:Inter,sans-serif}' +
    '.vx-consent-title{font-weight:600;font-size:.98rem;margin:0 0 .35rem}' +
    '.vx-consent-desc{font-size:.84rem;line-height:1.55;color:var(--text-2,#4a4a4c);margin:0 0 .7rem}' +
    '.vx-consent-desc a{color:var(--accent,#2563eb);text-decoration:underline;text-underline-offset:2px}' +
    '.vx-consent-options{display:flex;flex-wrap:wrap;gap:.45rem 1.25rem;margin:.5rem 0 .85rem}' +
    '.vx-consent-option{display:flex;align-items:flex-start;gap:.5rem;font-size:.83rem;line-height:1.4;cursor:pointer}' +
    '.vx-consent-option input{margin:.12rem 0 0;accent-color:var(--accent,#2563eb)}' +
    '.vx-consent-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:.5rem}' +
    '.vx-consent-btn{font:600 .83rem Inter,sans-serif;padding:.6rem .9rem;border-radius:var(--radius-sm,8px);cursor:pointer;' +
    'border:1px solid var(--accent,#2563eb);background:transparent;color:var(--text,#1c1c1e);white-space:nowrap;min-height:42px}' +
    '.vx-consent-btn:hover{background:var(--bg-3,#e8e4da)}' +
    '.vx-consent-btn.primary{background:var(--accent,#2563eb);border-color:var(--accent,#2563eb);color:#fff}' +
    '.vx-consent-btn:focus-visible{outline:2px solid var(--accent,#2563eb);outline-offset:2px}' +
    '.vx-consent-reopen-floating{position:fixed;right:.75rem;bottom:.75rem;z-index:9998;padding:.5rem .75rem;' +
    'border:1px solid var(--border-2,rgba(0,0,0,.25));border-radius:999px;background:var(--bg-2,#f0ede4);' +
    'color:var(--text,#1c1c1e);font:500 .75rem Inter,sans-serif;text-decoration:none}' +
    '.article-hero-img--video{position:relative}' +
    '.vx-video-preview{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;' +
    'overflow:hidden;background:#111;color:#fff;text-decoration:none;font:600 .9rem Inter,sans-serif}' +
    '.vx-video-preview img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}' +
    '.vx-video-preview:before{content:"";position:absolute;inset:0;background:rgba(0,0,0,.22)}' +
    '.vx-video-preview-label{position:relative;display:inline-flex;align-items:center;gap:.65rem;padding:.7rem 1rem;' +
    'border-radius:999px;background:rgba(0,0,0,.78);box-shadow:0 2px 12px rgba(0,0,0,.3)}' +
    '.vx-video-preview-play{display:grid;place-items:center;width:2rem;height:2rem;border-radius:50%;background:#fff;color:#111}' +
    '.vx-video-preview-play:after{content:"";margin-left:.15rem;border-top:.38rem solid transparent;' +
    'border-bottom:.38rem solid transparent;border-left:.58rem solid currentColor}' +
    '.vx-video-preview:focus-visible{outline:3px solid #fff;outline-offset:-5px}' +
    '.vx-video-preview:hover .vx-video-preview-label{background:rgba(0,0,0,.92)}' +
    '@media(max-width:600px){.vx-consent-card{padding:.8rem}.vx-consent-desc{font-size:.77rem}' +
    '.vx-consent-actions{display:grid;grid-template-columns:1fr 1fr}.vx-consent-btn{padding:.6rem .4rem;white-space:normal}' +
    '.vx-consent-btn.primary{grid-column:1/-1}}' +
    '@media(prefers-reduced-motion:reduce){.vx-consent{transition:none}}';

  function injectStyle() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function syncControls() {
    if (!box) return;
    var ads = box.querySelector('#vx-ads-consent');
    var media = box.querySelector('#vx-media-consent');
    if (ads) ads.checked = adsChoice === 'accept';
    if (media) media.checked = mediaChoice === 'accept';
  }

  function build() {
    box = document.createElement('div');
    box.className = 'vx-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-hidden', 'true');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Gizlilik tercihleri');
    box.innerHTML =
      '<div class="vx-consent-card">' +
        '<p class="vx-consent-title">Gizlilik tercihleri</p>' +
        '<p class="vx-consent-desc">Harici yazı tipleri izniniz olmadan yüklenmez. Sayfadaki harici görseller ve videolar, sayfa açıldığında kaynaklarından yüklenir; ' +
        'bu kaynaklar IP adresinizi ve tarayıcı bağlantı bilgilerinizi alabilir. Tercihinizi istediğiniz zaman değiştirebilirsiniz; ' +
        'seçiminiz 12 ay saklanır. <a href="cerez-politikasi.html">Çerez Politikası</a> · ' +
        '<a href="gizlilik-politikasi.html">Gizlilik Politikası</a></p>' +
        '<div class="vx-consent-options">' +
          '<label class="vx-consent-option"><input id="vx-ads-consent" type="checkbox"> Google AdSense reklam çerezlerine izin ver</label>' +
          '<label class="vx-consent-option"><input id="vx-media-consent" type="checkbox"> Harici yazı tiplerini yükle</label>' +
        '</div>' +
        '<div class="vx-consent-actions">' +
          '<button type="button" class="vx-consent-btn" data-c="reject">Tümünü reddet</button>' +
          '<button type="button" class="vx-consent-btn" data-c="save">Seçimleri kaydet</button>' +
          '<button type="button" class="vx-consent-btn primary" data-c="accept">Tümünü kabul et</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-c]');
      if (!button) return;
      decide(button.getAttribute('data-c'));
    });
    syncControls();
  }

  function show() {
    if (!box) build();
    syncControls();
    box.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () { box.classList.add('show'); });
  }

  function hide() {
    if (box) {
      box.classList.remove('show');
      box.setAttribute('aria-hidden', 'true');
    }
  }

  function dispatchMediaConsent(allowed) {
    window.valexirionExternalMediaAllowed = allowed;
    window.dispatchEvent(new CustomEvent('valexirion:media-consent', {
      detail: { allowed: allowed }
    }));
  }

  function loadExternalMedia() {
    externalMediaLoaded = true;
    document.querySelectorAll('[data-external-href]').forEach(function (element) {
      element.setAttribute('href', element.getAttribute('data-external-href'));
    });
    var deferred = document.querySelectorAll(
      '[data-external-src], [data-external-srcset], [data-external-poster]'
    );
    deferred.forEach(function (element) {
      ['src', 'srcset', 'poster'].forEach(function (attribute) {
        var source = element.getAttribute('data-external-' + attribute);
          if (source && element.getAttribute(attribute) !== source) element.setAttribute(attribute, source);
        });
    });
    dispatchMediaConsent(true);
  }

  function loadExternalImages() {
    document.querySelectorAll('img[data-external-src], img[data-external-srcset]').forEach(function (image) {
      ['src', 'srcset'].forEach(function (attribute) {
        var source = image.getAttribute('data-external-' + attribute);
        if (source) image.setAttribute(attribute, source);
      });
    });
  }

  function loadExternalVideos() {
    document.querySelectorAll('iframe[data-external-src]').forEach(function (iframe) {
      var source = iframe.getAttribute('data-external-src');
      if (source && iframe.getAttribute('src') !== source) iframe.setAttribute('src', source);
      iframe.hidden = false;
      var videoId = source && source.match(/(?:youtube-nocookie\.com|youtube\.com)\/embed\/([A-Za-z0-9_-]{11})/);
      var container = iframe.parentNode;
      if (!videoId || !container || container.querySelector('.vx-video-preview')) return;

      var preview = document.createElement('a');
      preview.className = 'vx-video-preview';
      preview.href = 'https://www.youtube.com/watch?v=' + videoId[1];
      preview.target = '_blank';
      preview.rel = 'noopener noreferrer';
      preview.setAttribute('aria-label', 'Fragmanı YouTube’da izle: ' + (iframe.title || 'video'));

      var image = document.createElement('img');
      image.src = 'https://i.ytimg.com/vi/' + videoId[1] + '/hqdefault.jpg';
      image.alt = '';
      image.loading = 'lazy';

      var label = document.createElement('span');
      label.className = 'vx-video-preview-label';
      var play = document.createElement('span');
      play.className = 'vx-video-preview-play';
      play.setAttribute('aria-hidden', 'true');
      var text = document.createElement('span');
      text.textContent = 'Fragmanı YouTube’da izle';
      label.appendChild(play);
      label.appendChild(text);
      preview.appendChild(image);
      preview.appendChild(label);
      container.appendChild(preview);
    });
  }

  function decide(action) {
    var oldAdsChoice = adsChoice;
    var oldMediaChoice = mediaChoice;
    var adsInput = box.querySelector('#vx-ads-consent');
    var mediaInput = box.querySelector('#vx-media-consent');
    if (action === 'accept') {
      adsChoice = 'accept';
      mediaChoice = 'accept';
    } else if (action === 'reject') {
      adsChoice = 'reject';
      mediaChoice = 'reject';
    } else {
      adsChoice = adsInput && adsInput.checked ? 'accept' : 'reject';
      mediaChoice = mediaInput && mediaInput.checked ? 'accept' : 'reject';
    }

    writeChoice(ADS_KEY, adsChoice);
    writeChoice(MEDIA_KEY, mediaChoice);
    hide();

    var revokeLoadedChoice =
      (oldAdsChoice === 'accept' && adsChoice === 'reject' && adsLoaded) ||
      (oldMediaChoice === 'accept' && mediaChoice === 'reject' && externalMediaLoaded);
    if (revokeLoadedChoice) {
      dispatchMediaConsent(false);
      location.reload();
      return;
    }

    if (adsChoice === 'accept') loadAds();
    else clearAdCookies();
    if (mediaChoice === 'accept') loadExternalMedia();
    else dispatchMediaConsent(false);
  }

  function openPreferences(event) {
    if (event) event.preventDefault();
    show();
    setTimeout(function () {
      var control = box && box.querySelector('#vx-media-consent');
      if (control) control.focus();
    }, 60);
  }

  function addPreferencesLink() {
    var bottom = document.querySelector('.footer-bottom');
    var parent = bottom
      ? (bottom.querySelector('.footer-legal') || bottom)
      : document.body;
    if (parent.querySelector('.vx-consent-reopen')) return;
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'footer-link vx-consent-reopen' + (bottom ? '' : ' vx-consent-reopen-floating');
    link.textContent = 'Gizlilik Tercihleri';
    link.addEventListener('click', openPreferences);
    parent.appendChild(link);
  }

  function init() {
    injectStyle();
    addPreferencesLink();
    loadExternalImages();
    loadExternalVideos();
    adsChoice = readChoice(ADS_KEY);
    mediaChoice = readChoice(MEDIA_KEY);

    if (adsChoice === 'accept') loadAds();
    else if (adsChoice === 'reject') clearAdCookies();

    if (mediaChoice === 'accept') loadExternalMedia();
    else dispatchMediaConsent(false);

    if (adsChoice === null || mediaChoice === null) show();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

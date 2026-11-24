/* Valexirion — Çerez / Reklam Onayı
   - Kullanıcı onay vermeden AdSense betiği YÜKLENMEZ.
   - Tercih yalnızca kullanıcının tarayıcısında (localStorage) saklanır.
   - AdSense yayıncı kimliğini aşağıda değiştir. */
(function () {
  'use strict';

  var ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'; // <-- kendi kimliğinle değiştir
  var KEY = 'valexirion-consent';
  var VERSION = 1;
  var MAX_AGE = 365 * 24 * 60 * 60 * 1000; // tercih 12 ay sonra yeniden sorulur

  function read() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      return (v && v.v === VERSION && (Date.now() - (v.t || 0)) < MAX_AGE) ? v.choice : null;
    } catch (e) { return null; }
  }
  function write(choice) {
    try { localStorage.setItem(KEY, JSON.stringify({ v: VERSION, choice: choice, t: Date.now() })); } catch (e) {}
  }

  /* Ret / geri çekme: alan adımızda tanımlanan Google reklam çerezlerini sil.
     (Google'ın kendi alan adlarındaki çerezler tarayıcı ayarlarından silinir.) */
  function clearAdCookies() {
    var names = ['__gads', '__gpi'];
    var host = location.hostname, parts = host.split('.'), domains = [''];
    domains.push(host);
    for (var i = 0; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    names.forEach(function (n) {
      domains.forEach(function (d) {
        document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  var adsLoaded = false;
  function loadAds() {
    if (adsLoaded || /XXXXXXXX/.test(ADSENSE_CLIENT)) return;
    adsLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
    document.head.appendChild(s);
  }

  /* ---------- Stil ---------- */
  var css = '' +
  '.vx-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;justify-content:center;' +
  'padding:0 max(.75rem,env(safe-area-inset-right)) max(.75rem,env(safe-area-inset-bottom)) max(.75rem,env(safe-area-inset-left));' +
  'pointer-events:none;transform:translateY(120%);opacity:0;transition:transform .45s ease,opacity .35s ease}' +
  '.vx-consent.show{transform:none;opacity:1}' +
  '.vx-consent-card{pointer-events:auto;box-sizing:border-box;width:100%;max-width:720px;padding:1.1rem 1.25rem;' +
  'background:var(--bg-2,#f0ede4);color:var(--text,#1c1c1e);border:1px solid var(--border-2,rgba(0,0,0,.18));' +
  'border-radius:var(--radius,12px);box-shadow:var(--shadow-hover,0 8px 40px rgba(0,0,0,.2));' +
  'display:flex;gap:1rem;align-items:center;font-family:Inter,sans-serif}' +
  '.vx-consent-text{flex:1;min-width:0}' +
  '.vx-consent-title{font-weight:600;font-size:.95rem;margin:0 0 .25rem}' +
  '.vx-consent-desc{font-size:.84rem;line-height:1.55;color:var(--text-2,#4a4a4c);margin:0}' +
  '.vx-consent-desc a{color:var(--accent,#2563eb);text-decoration:underline;text-underline-offset:2px}' +
  '.vx-consent-actions{display:flex;gap:.5rem;flex-shrink:0}' +
  '.vx-consent-btn{font:600 .85rem Inter,sans-serif;padding:.65rem 1.1rem;border-radius:var(--radius-sm,8px);cursor:pointer;' +
  'border:1px solid var(--accent,#2563eb);background:transparent;color:var(--text,#1c1c1e);white-space:nowrap;' +
  'transition:background .2s,opacity .2s;min-height:44px}' +
  '.vx-consent-btn:hover{background:var(--bg-3,#e8e4da)}' +
  '.vx-consent-btn.primary{background:var(--accent,#2563eb);border-color:var(--accent,#2563eb);color:#fff}' +
  '.vx-consent-btn.primary:hover{background:var(--accent-hover,#1d4ed8)}' +
  '.vx-consent-btn:focus-visible{outline:2px solid var(--accent,#2563eb);outline-offset:2px}' +
  '.vx-consent-desc-compact{display:none}' +
  '@media(max-width:600px){.vx-consent-card{flex-direction:column;align-items:stretch;gap:.55rem;padding:.8rem}' +
  '.vx-consent-title{font-size:.88rem;margin-bottom:.15rem}' +
  '.vx-consent-desc{font-size:.76rem;line-height:1.4}' +
  '.vx-consent-desc-full{display:none}.vx-consent-desc-compact{display:inline}' +
  '.vx-consent-actions{width:100%}.vx-consent-btn{flex:1;padding:.7rem .5rem}}' +
  '@media(prefers-reduced-motion:reduce){.vx-consent{transition:none}}';

  function injectStyle() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---------- Banner ---------- */
  var box;
  function build() {
    box = document.createElement('div');
    box.className = 'vx-consent';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', 'Çerez tercihleri');
    box.innerHTML =
      '<div class="vx-consent-card">' +
        '<div class="vx-consent-text">' +
          '<p class="vx-consent-title">Çerez ve reklam tercihleri</p>' +
          '<p class="vx-consent-desc"><span class="vx-consent-desc-full">Sitede Google AdSense reklamları gösterilir. <strong>Kabul Et</strong> dersen Google reklam sunmak ve kişiselleştirmek için çerez kullanabilir ve verilerin Türkiye dışına (ör. ABD) aktarılabilir. ' +
          '<strong>Reddet</strong> dersen reklam çerezleri yüklenmez. Tercihini istediğin zaman değiştirebilirsin; seçimin 12 ay saklanır.</span>' +
          '<span class="vx-consent-desc-compact"><strong>Kabul Et</strong> dersen Google kişiselleştirilmiş reklamlar için çerez kullanabilir ve verileri Türkiye dışına aktarabilir. <strong>Reddet</strong> dersen reklam çerezleri yüklenmez. Tercihin 12 ay saklanır.</span> ' +
          '<a href="cerez-politikasi.html">Çerez Politikası</a> · <a href="gizlilik-politikasi.html">Gizlilik Politikası</a></p>' +
        '</div>' +
        '<div class="vx-consent-actions">' +
          '<button type="button" class="vx-consent-btn" data-c="reject">Reddet</button>' +
          '<button type="button" class="vx-consent-btn" data-c="accept">Kabul Et</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(box);
    box.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (!b) return;
      decide(b.getAttribute('data-c'));
    });
  }

  function show() {
    if (!box) build();
    requestAnimationFrame(function () { box.classList.add('show'); });
  }
  function hide() {
    if (box) box.classList.remove('show');
  }

  function decide(choice) {
    write(choice);
    hide();
    if (choice === 'accept') loadAds();
    else {
      clearAdCookies();
      if (adsLoaded) location.reload(); // onay geri çekildi: yüklenmiş betiği temizle
    }
  }

  /* ---------- Footer: tercihleri yeniden aç ---------- */
  function addFooterLink() {
    var bottom = document.querySelector('.footer-bottom');
    if (!bottom || bottom.querySelector('.vx-consent-reopen')) return;
    var a = document.createElement('a');
    a.href = '#';
    a.className = 'footer-link vx-consent-reopen';
    a.textContent = 'Çerez Tercihleri';
    a.addEventListener('click', function (e) {
      e.preventDefault(); show();
      setTimeout(function () { var b = box && box.querySelector('button'); if (b) b.focus(); }, 60);
    });
    var legal = bottom.querySelector('.footer-legal') || bottom;
    legal.appendChild(a);
  }

  function init() {
    injectStyle();
    addFooterLink();
    var c = read();
    if (c === 'accept') loadAds();
    else if (c === null) show();
    else clearAdCookies();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

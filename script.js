// ============================================
// GENEL YARDIMCI FONKSİYONLAR
// ============================================

function qs(selector, parent) {
  return (parent || document).querySelector(selector);
}

function qsAll(selector, parent) {
  return Array.from((parent || document).querySelectorAll(selector));
}

function escapeAttribute(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function backgroundImageAttributes(imageUrl, additionalStyle) {
  var style = additionalStyle || '';
  if (/^https?:\/\//i.test(imageUrl || '')) {
    return ' data-external-bg="' + escapeAttribute(imageUrl) + '" style="' + style +
      "background-image:url('img/external-media-placeholder.svg');\"";
  }
  return ' style="' + style + "background-image:url('" + escapeAttribute(imageUrl) + "');\"";
}

function escapeHTML(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function imageCreditMarkup(item) {
  if (!item || !item.imageCredit || !item.imageCreditUrl) return '';
  return '<p class="card-image-credit">Görsel: ' + escapeHTML(item.imageCredit) + '</p>';
}

function applyExternalBackgrounds() {
  if (!window.valexirionExternalImagesAllowed) return;
  qsAll('[data-external-bg]').forEach(function (element) {
    var imageUrl = element.getAttribute('data-external-bg');
    if (imageUrl) element.style.backgroundImage = 'url("' + imageUrl.replace(/"/g, '\\"') + '")';
  });
}

function setConsentAwareImageSource(image, imageUrl) {
  if (/^https?:\/\//i.test(imageUrl || '')) {
    image.setAttribute('data-external-src', imageUrl);
    image.src = imageUrl;
    return;
  }
  image.src = imageUrl;
}

window.addEventListener('valexirion:media-consent', function (event) {
  if (event.detail && event.detail.allowed) applyExternalBackgrounds();
});

document.addEventListener('DOMContentLoaded', function () {
  var tools = qs('.navbar-tools');
  if (!tools) {
    var navbarInner = qs('.navbar-inner');
    if (!navbarInner) return;
    tools = document.createElement('div');
    tools.className = 'navbar-tools';
    navbarInner.appendChild(tools);
  }

  if (!qs('#search-trigger')) {
    var trigger = document.createElement('button');
    trigger.id = 'search-trigger';
    trigger.type = 'button';
    trigger.className = 'search-trigger-btn';
    trigger.setAttribute('aria-label', 'Ara (Ctrl+K)');
    trigger.setAttribute('aria-keyshortcuts', 'Control+K Meta+K');
    trigger.innerHTML =
      '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>' +
      '</svg>';
    tools.insertBefore(trigger, tools.firstChild);
  }

  if (!qs('#search-overlay')) {
    var overlay = document.createElement('div');
    overlay.id = 'search-overlay';
    overlay.className = 'search-overlay hidden';
    overlay.innerHTML =
      '<div id="search-backdrop" class="search-backdrop"></div>' +
      '<section class="search-modal" role="dialog" aria-modal="true" aria-label="Yazı ara">' +
        '<div class="search-input-wrap">' +
          '<svg class="search-input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>' +
          '</svg>' +
          '<input id="search-input" class="search-input" type="search" aria-label="Yazı, konu veya kategori ara" placeholder="Yazı, konu veya kategori ara..." autocomplete="off"/>' +
          '<button id="search-close" class="search-close-btn" type="button" aria-label="Aramayı kapat">' +
            '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>' +
          '</button>' +
        '</div>' +
        '<div id="search-results" class="search-results" role="listbox" aria-label="Arama sonuçları"></div>' +
      '</section>';
    document.body.appendChild(overlay);
  }
});

// ============================================
// BÖLÜM 1 — DARK/LIGHT MOD
// ============================================

(function initTheme() {
  const saved = localStorage.getItem('valexirion-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved === 'dark' : prefersDark);
})();

function applyTheme(isDark) {
  var html = document.documentElement;
  var sun  = qs('#icon-sun');
  var moon = qs('#icon-moon');
  html.classList.toggle('dark',  isDark);
  html.classList.toggle('light', !isDark);
  if (sun)  sun.classList.toggle('hidden',  isDark);
  if (moon) moon.classList.toggle('hidden', !isDark);
}

document.addEventListener('DOMContentLoaded', function () {
  var btn = qs('#theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var isDark = document.documentElement.classList.contains('dark');
    applyTheme(!isDark);
    localStorage.setItem('valexirion-theme', isDark ? 'light' : 'dark');
  });
});

// ============================================
// BÖLÜM 2 — HAMBURGER MENÜ
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  var hamburgerBtn = qs('#hamburger-btn');
  var mobileMenu   = qs('#mobile-menu');
  var hamburgerIco = qs('#hamburger-icon');
  var closeIco     = qs('#close-icon');
  if (!hamburgerBtn || !mobileMenu) return;

  function setMenuOpen(isOpen) {
    mobileMenu.classList.toggle('hidden', !isOpen);
    if (hamburgerIco) hamburgerIco.classList.toggle('hidden', isOpen);
    if (closeIco) closeIco.classList.toggle('hidden', !isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  hamburgerBtn.addEventListener('click', function () {
    var isOpen = !mobileMenu.classList.contains('hidden');
    setMenuOpen(!isOpen);
  });

  document.addEventListener('click', function (e) {
    var navbar = qs('#navbar');
    if (navbar && !navbar.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  mobileMenu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenuOpen(false);
  });

  window.addEventListener('resize', function () {
    if (window.matchMedia('(min-width: 1024px)').matches) setMenuOpen(false);
  });
});

// ============================================
// BÖLÜM 3 — DROPDOWN MENÜLER
// ============================================

document.addEventListener('DOMContentLoaded', function () {
  function closeAllDropdowns() {
    qsAll('.dropdown-menu.open').forEach(function (m) { m.classList.remove('open'); });
    qsAll('.dropdown-wrapper.open').forEach(function (w) { w.classList.remove('open'); });
    qsAll('.dropdown-trigger[aria-expanded="true"]').forEach(function (t) {
      t.setAttribute('aria-expanded', 'false');
    });
  }

  qsAll('.dropdown-trigger').forEach(function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var id      = trigger.getAttribute('data-dropdown');
      var menu    = qs('#dropdown-' + id);
      var wrapper = trigger.closest('.dropdown-wrapper');
      if (!menu || !wrapper) return;
      var wasOpen = menu.classList.contains('open');
      closeAllDropdowns();
      if (!wasOpen) {
        menu.classList.add('open');
        wrapper.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAllDropdowns();
  });
});

// ARTICLE IMAGE CREDITS
// ============================================

function addArticleImageCredit(data, pageKey) {
  if (!data || !Array.isArray(data.articles)) return;
  var article = data.articles.find(function (item) { return item && item.href === pageKey; });
  if (!article || !article.imageCredit) return;

  var hero = qs('.article-hero-img');
  var target;
  if (/^https?:\/\//i.test(article.img || '')) {
    target = qsAll('img').find(function (image) {
      return image.getAttribute('data-external-src') === article.img || image.getAttribute('src') === article.img;
    });
    if (!target) return;
  } else {
    target = hero
      ? (hero.querySelector('img') || hero)
      : (qs('.article-content img') || qs('article img') || qs('main img'));
  }
  if (!target) return;

  if (target.tagName && target.tagName.toLowerCase() === 'img') {
    target = target.closest('figure') || target.parentElement;
  } else if (!hero && target.parentElement) {
    target = target.closest('figure') || target.parentElement;
  }
  if (!target) return;
  var existingCaption = target.querySelector('figcaption, .article-image-caption');
  if (existingCaption && existingCaption.textContent.indexOf(article.imageCredit) !== -1) return;

  var caption = document.createElement('p');
  caption.className = 'article-image-caption';
  caption.appendChild(document.createTextNode('G\u00f6rsel kayna\u011f\u0131: '));
  if (article.imageCreditUrl) {
    var creditLink = document.createElement('a');
    creditLink.href = article.imageCreditUrl;
    creditLink.target = '_blank';
    creditLink.rel = 'noopener noreferrer';
    creditLink.textContent = article.imageCredit;
    caption.appendChild(creditLink);
    if (article.imageLicenseUrl && article.imageLicenseUrl !== article.imageCreditUrl) {
      caption.appendChild(document.createTextNode(' · '));
      var licenseLink = document.createElement('a');
      licenseLink.href = article.imageLicenseUrl;
      licenseLink.target = '_blank';
      licenseLink.rel = 'noopener noreferrer';
      licenseLink.textContent = 'Lisans';
      caption.appendChild(licenseLink);
    }
  } else {
    caption.appendChild(document.createTextNode(article.imageCredit));
  }
  target.insertAdjacentElement('afterend', caption);
}

var CONCEPT_GUIDE_REFERENCES = {
  'sosyal-medya-algoritmalari.html': [{ id: 'algorithm', label: 'Algoritma' }],
  'atina-demokrasisi.html': [{ id: 'athenian-democracy', label: 'Atina Demokrasisi' }],
  'biyofili.html': [{ id: 'biophilia', label: 'Biyofili' }],
  'kara-delikler.html': [
    { id: 'hawking-radiation', label: 'Hawking Işıması' },
    { id: 'black-hole', label: 'Kara Delik' },
    { id: 'event-horizon', label: 'Olay Ufku' }
  ],
  'hipertimezi.html': [{ id: 'hyperthymesia', label: 'Hipertimezi' }],
  'ilk-filozoflar-iyonya.html': [{ id: 'ionia', label: 'İyonya' }],
  'kuantum-bilgisayarlar.html': [{ id: 'quantum-computer', label: 'Kuantum Bilgisayar' }],
  'mevsimler.html': [{ id: 'seasons', label: 'Mevsimler' }],
  'mezopotamya-tarih.html': [{ id: 'mesopotamia', label: 'Mezopotamya' }],
  'bagirsaklarinizda-sakli-sirlar.html': [{ id: 'microbiome', label: 'Mikrobiyom' }],
  'progressive-house.html': [{ id: 'progressive-house', label: 'Progressive House' }],
  'matrix.html': [{ id: 'simulation-hypothesis', label: 'Simülasyon Hipotezi' }],
  'stoacilik.html': [{ id: 'stoicism', label: 'Stoacılık' }],
  'transhumanizm-insan-robot-gelecegi.html': [{ id: 'transhumanism', label: 'Transhümanizm' }],
  'yapay-zeka.html': [{ id: 'yapay-zeka', label: 'Yapay Zekâ' }],
  'sumerler-uygarligi.html': [{ id: 'ziggurat', label: 'Ziggurat' }]
};

function addConceptGuideReferences(pageKey) {
  var concepts = CONCEPT_GUIDE_REFERENCES[pageKey];
  if (!concepts) return;

  var subtitle = qs('.article-subtitle');
  var article = qs('.article-content-wrap');
  if (!subtitle && !article) return;

  var reference = document.createElement('p');
  reference.className = 'concept-guide-reference';
  reference.appendChild(document.createTextNode('Bu yazıdaki kavramlar: '));

  concepts.forEach(function (concept, index) {
    if (index > 0) reference.appendChild(document.createTextNode(' · '));
    var link = document.createElement('a');
    link.href = 'kavram-rehberi.html#concept-' + concept.id;
    link.textContent = concept.label;
    reference.appendChild(link);
  });

  if (subtitle) {
    subtitle.insertAdjacentElement('afterend', reference);
  } else {
    article.insertBefore(reference, article.firstChild);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  try {
    localStorage.removeItem('valexirion-reading-stats');
  } catch (error) {
    console.warn('[Valexirion] Could not clear old reading data:', error);
  }

  var pageKey = location.pathname.split('/').pop() || 'index.html';
  addConceptGuideReferences(pageKey);
  if (!qs('.article-hero-img') && !qs('.article-content img') && !qs('article img') && !qs('main img')) return;

  fetch('data.json')
    .then(function (response) {
      if (!response.ok) throw new Error('data.json request failed (' + response.status + ')');
      return response.json();
    })
    .then(function (data) { addArticleImageCredit(data, pageKey); })
    .catch(function (error) {
      console.error('[Valexirion] Could not load image credit data:', error);
    });
});

// ============================================
// BÖLÜM 5 — DATA-DRIVEN RENDER SİSTEMİ
// ============================================
//
//  MİMARİ:
//  ┌─────────────────────────────────────────────────────────┐
//  │  data.json                                              │
//  │  ├── hero_content  → renderHero()  → #hero-content     │  BLOK A
//  │  │   (Editörün Seçimi — articles[]'dan BAĞIMSIZ)       │
//  │  ├── featured      ┐                                    │
//  │  ├── articles[]    ├─→ renderList() → #cards-container  │  BLOK B
//  │  ├── learningPaths[]→              → #learning-paths    │
//  │  └── recentArticles[]→             → #recent-strip      │
//  └─────────────────────────────────────────────────────────┘
//
//  YENİ YAZI EKLEMEK: Yalnızca data.json → articles[] güncelle.
//  HERO GÜNCELLEMEK : Yalnızca data.json → hero_content güncelle.
// ============================================

document.addEventListener('DOMContentLoaded', function () {

  // ─────────────────────────────────────────
  // BLOK A — renderHero()
  // Kaynak : data.json → daily_heroes[] veya hero_content
  // Günlük seçim: daily_heroes varsa bugünün indeksine göre
  // Hedef  : #hero-section (section.hero)
  // ─────────────────────────────────────────
  function pickDailyHero(data) {
    // Önce daily_heroes[] dizisini kontrol et
    if (data.daily_heroes && data.daily_heroes.length > 0) {
      var today = new Date();
      // Bugünün tarihine göre deterministik seçim
      // Aynı gün her yenilemede aynı içerik gösterilir
      var dayKey = today.getFullYear() * 10000
                 + (today.getMonth() + 1) * 100
                 + today.getDate();
      var idx = dayKey % data.daily_heroes.length;
      return data.daily_heroes[idx];
    }
    // Geriye dönük uyumluluk: eski hero_content objesini kullan
    return data.hero_content || null;
  }

  function renderHero(h) {
    var section = qs('#hero-section');
    if (!h || !section) return;

    var badge      = h.badge      || '';
    var titleLine1 = h.titleLine1 || '';
    var titleEm    = h.titleEm    || '';
    var desc       = h.desc       || '';
    var img        = h.img        || '';
    var author     = h.author     || '';
    var date       = h.date       || '';
    var readTime   = h.readTime   || '';
    var href       = h.href       || '#';

    var titleHtml = titleEm
      ? titleLine1 + ' <em>' + titleEm + '</em>'
      : titleLine1;

    var metaHtml = (author || date || readTime) ? (
      '<div class="hero-meta">' +
        (author   ? '<strong>' + author + '</strong>' : '') +
        (author && date ? '<span class="dot">·</span>' : '') +
        (date     ? '<span>' + date + '</span>' : '') +
        (date && readTime ? '<span class="dot">·</span>' : '') +
        (readTime ? '<span>' + readTime + '</span>' : '') +
      '</div>'
    ) : '';

    section.innerHTML =
      '<div class="hero-content" id="hero-content">' +
        (badge ? '<span class="hero-badge">' + badge + '</span>' : '') +
        '<h2 class="hero-title">' + titleHtml + '</h2>' +
        '<div class="hero-divider"></div>' +
        '<p class="hero-desc">' + desc + '</p>' +
        metaHtml +
        (href !== '#' ? '<a class="hero-read-btn" href="' + href + '">Oku</a>' : '') +
      '</div>' +
      '<div class="hero-bg"' + backgroundImageAttributes(img) + '></div>' +
      '<div class="hero-overlay"></div>';
  }

  // ─────────────────────────────────────────
  // BLOK B — renderList()
  // Kaynak : data.json → featured, articles[],
  //          learningPaths[], recentArticles[]
  // hero_content ile SIFIR ilişkisi var.
  // ─────────────────────────────────────────

  function buildFeaturedCard(f) {
    if (!f) return '';
    // Eksik alanlar için güvenli varsayılanlar
    f.badge         = f.badge         || '';
    f.category      = f.category      || '';
    f.subcategory   = f.subcategory   || '';
    f.href          = f.href          || '#';
    f.img           = f.img           || '';
    f.isNew         = f.isNew         || false;
    f.newLabel      = f.newLabel      || 'Yeni';
    f.date          = f.date          || '';
    f.title         = f.title         || '';
    f.titleEm       = f.titleEm       || '';
    f.excerpt       = f.excerpt       || '';
    f.authorInitials= f.authorInitials|| '?';
    f.authorName    = f.authorName    || '';
    f.readTime      = f.readTime      || '';
    var tagsHtml = (f.tags || []).map(function (t) {
      return '<span class="ftag">' + t + '</span>';
    }).join('');

    return (
      '<article class="card card-featured" data-category="' + f.category + '" data-subcategory="' + (f.subcategory || '') + '">' +
        '<a href="' + f.href + '" class="card-link card-featured-link">' +
          '<div class="featured-img-wrap">' +
            '<div class="featured-img"' + backgroundImageAttributes(f.img, 'background-size:cover;background-position:center;') + '></div>' +
            '<span class="card-badge featured-cat-badge">' + f.badge + '</span>' +
          '</div>' +
          '<div class="featured-body">' +
            imageCreditMarkup(f) +
            '<div class="featured-tag-row">' +
              (f.isNew ? '<span class="featured-new-badge">' + (f.newLabel || 'Yeni') + '</span>' : '') +
              '<span class="featured-date">' + f.date + '</span>' +
            '</div>' +
            '<h2 class="featured-title">' + f.title + '<br><em>' + f.titleEm + '</em></h2>' +
            '<p class="featured-excerpt">' + f.excerpt + '</p>' +
            '<div class="featured-tags">' + tagsHtml + '</div>' +
            '<div class="featured-footer">' +
              '<div class="author-info" style="gap:10px">' +
                '<div class="author-avatar" style="width:36px;height:36px;font-size:0.7rem">' + f.authorInitials + '</div>' +
                '<div>' +
                  '<p class="author-name" style="font-size:0.82rem">' + f.authorName + '</p>' +
                  '<p class="article-date">' + f.readTime + '</p>' +
                '</div>' +
              '</div>' +
              '<span class="featured-read-btn">Oku ' +
                '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">' +
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>' +
                '</svg>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</a>' +
      '</article>'
    );
  }

  function buildArticleCard(a) {
    if (!a) return '';
    a.category    = a.category    || '';
    a.subcategory = a.subcategory || '';
    a.href        = a.href        || '#';
    a.img         = a.img         || '';
    a.badge       = a.badge       || '';
    a.title       = a.title       || '';
    a.excerpt     = a.excerpt     || '';
    a.author      = a.author      || '';
    a.date        = a.date        || '';
    a.readTime    = a.readTime    || '';
    // Boş alanları ("undefined" / yetim "·") yazma
    var metaParts = [a.author, a.date, a.readTime].filter(Boolean).map(function (t) {
      return '<span>' + t + '</span>';
    });
    var metaHtml = metaParts.length
      ? '<div class="card-meta">' + metaParts.join('<span class="meta-sep">·</span>') + '</div>'
      : '';
    var documentaryRatingHtml = a.category === 'belgesel'
      ? '<p class="card-rating">' + (a.year || '') +
        (a.imdbRating ? ' · IMDb: ' + a.imdbRating.replace('.', ',') + '/10' : ' · IMDb puanı henüz listelenmiyor') +
        '</p>'
      : '';
    return (
      '<article class="card" data-category="' + a.category + '" data-subcategory="' + (a.subcategory || '') + '">' +
        '<a href="' + a.href + '" class="card-link">' +
          '<div class="card-img-wrap">' +
            '<div class="card-img"' + backgroundImageAttributes(a.img, 'background-size:cover;background-position:center;') + '></div>' +
            '<span class="card-badge">' + a.badge + '</span>' +
          '</div>' +
          '<div class="card-body">' +
            imageCreditMarkup(a) +
            '<h2 class="card-title">' + a.title + '</h2>' +
            '<p class="card-excerpt">' + a.excerpt + '</p>' +
            documentaryRatingHtml +
            metaHtml +
          '</div>' +
        '</a>' +
      '</article>'
    );
  }

  function buildPathCard(p) {
    if (!p) return '';
    p.href    = p.href    || '#';
    p.img     = p.img     || '';
    p.eyebrow = p.eyebrow || '';
    p.title   = p.title   || '';
    p.desc    = p.desc    || '';
    return (
      '<a href="' + p.href + '" class="path-card">' +
        '<div class="path-card-img"' + backgroundImageAttributes(p.img, 'background-position:' + (p.imgPosition || 'center') + ';') + '></div>' +
        '<div class="path-card-overlay"></div>' +
        '<div class="path-card-body">' +
          '<span class="path-card-eyebrow">' + p.eyebrow + '</span>' +
          '<h3 class="path-card-title">' + p.title + '</h3>' +
          '<p class="path-card-desc">' + p.desc + '</p>' +
        '</div>' +
      '</a>'
    );
  }

  function buildRecentCard(r) {
    if (!r) return '';
    r.href     = r.href     || '#';
    r.img      = r.img      || '';
    r.category = r.category || '';
    r.title    = r.title    || '';
    return (
      '<a href="' + r.href + '" class="recent-card">' +
        '<div class="recent-card-img"' + backgroundImageAttributes(r.img) + '></div>' +
        '<div class="recent-card-body">' +
          imageCreditMarkup(r) +
          '<span class="recent-card-cat">' + r.category + '</span>' +
          '<h3 class="recent-card-title">' + r.title + '</h3>' +
          (r.meta ? '<span class="recent-card-meta">' + r.meta + '</span>' : '') +
        '</div>' +
      '</a>'
    );
  }

  // ─────────────────────────────────────────
  // ANA RENDER — fetch sonrası çağrılır
  // ─────────────────────────────────────────
  var SEARCH_INDEX = [];

  function renderPage(data) {

    // ── BLOK A: Hero — TAMAMEN BAĞIMSIZ ───
    // daily_heroes[] varsa günün indeksine göre seçilir.
    // Yoksa geriye dönük uyumluluk için hero_content kullanılır.
    renderHero(pickDailyHero(data));

    // ── BLOK B: Kart listesi ───────────────
    var cardsEl  = qs('#cards-container');
    var pathsEl  = qs('#learning-paths-container');
    var recentEl = qs('#recent-strip');

    // Arama indeksi articles[]'dan otomatik üretilir
    SEARCH_INDEX = (data.articles || []).map(function (a) {
      return { title: a.title || '', excerpt: a.excerpt || '', category: a.category || '',
               badge: a.badge || '', href: a.href || '#', img: a.img || '' };
    });

    if (cardsEl) {
      var html = '';
      // featured artık yok — hero_content tamamen bağımsız
      // Tüm yazılar articles[]'dan gelir
      (data.articles || []).forEach(function (a) { html += buildArticleCard(a); });
      cardsEl.innerHTML = html;
    }
    if (pathsEl)  pathsEl.innerHTML  = (data.learningPaths  || []).map(buildPathCard).join('');
    if (recentEl) recentEl.innerHTML = (data.recentArticles || []).map(buildRecentCard).join('');

    // Render bitti → filtre + arama başlat
    initFilterSystem(SEARCH_INDEX);
    applyExternalBackgrounds();
  }

  // ─────────────────────────────────────────
  // FETCH — data.json'u çek, renderPage'i tetikle
  // ─────────────────────────────────────────
  fetch('data.json')
    .then(function (res) {
      if (!res.ok) throw new Error('data.json yüklenemedi (' + res.status + ')');
      return res.json();
    })
    .then(renderPage)
    .catch(function (err) {
      console.error('[Valexirion] Veri yükleme hatası:', err);
      var errorEl = qs('#home-data-error');
      if (errorEl) {
        errorEl.classList.remove('hidden');
        var heroWrapper = qs('.hero-wrapper');
        var curated = qs('#homepage-curated');
        if (heroWrapper) heroWrapper.classList.add('hidden');
        if (curated) curated.classList.add('hidden');
      }
    });


  // ============================================
  // BÖLÜM 6 — KATEGORİ FİLTRE SİSTEMİ
  // renderPage() tamamlandıktan sonra çağrılır
  // ============================================

  function initFilterSystem(searchIndex) {
    var cards     = qsAll('.card');
    var hasHomeGrid = !!qs('#cards-container');
    var noResults = qs('#no-results');
    var heroSec   = qs('#hero-section');   // section.hero
    var curated   = qs('#homepage-curated');
    var navLinks  = qsAll('.nav-cat-link, .mobile-link, .footer-cat-link');
    var documentaryFilters = qs('#documentary-category-filters');
    var documentaryFilterButtons = documentaryFilters
      ? qsAll('[data-documentary-filter]', documentaryFilters)
      : [];

    function applyFilter(filter, inDocumentaryCategory) {
      // Kategori seçilince hero ve kürasyon bölümleri gizlenir
      if (heroSec) heroSec.style.display = 'none';
      if (curated) curated.style.display = 'none';
      if (documentaryFilters) {
        documentaryFilters.classList.toggle('hidden', !inDocumentaryCategory && filter !== 'belgesel');
      }
      var visible = 0;
      cards.forEach(function (card) {
        var cat    = card.getAttribute('data-category');
        var subcat = card.getAttribute('data-subcategory');
        var match  = filter === 'all' || cat === filter || subcat === filter;
        if (match) {
          card.classList.remove('hidden', 'fade-in');
          void card.offsetWidth; // reflow → animasyonu yeniden başlat
          card.classList.add('fade-in');
          visible++;
        } else {
          card.classList.add('hidden');
          card.classList.remove('fade-in');
        }
      });

      if (noResults) noResults.classList.toggle('hidden', visible > 0);
    }

    documentaryFilterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-documentary-filter');
        if (!filter) return;
        applyFilter(filter, true);
        history.replaceState(null, '', '#' + filter);
        documentaryFilterButtons.forEach(function (item) { item.classList.remove('active'); });
        button.classList.add('active');
      });
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (!hasHomeGrid) return;
        var href = link.getAttribute('href') || '';
        var idx  = href.indexOf('#');
        if (idx === -1) return;
        var cat = href.slice(idx + 1);
        e.preventDefault();
        applyFilter(cat, false);
        history.replaceState(null, '', '#' + cat);
        navLinks.forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
        var grid = qs('#articles-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var mm = qs('#mobile-menu');
        if (mm) {
          mm.classList.add('hidden');
          var hamburgerBtn = qs('#hamburger-btn');
          var hamburgerIco = qs('#hamburger-icon');
          var closeIco = qs('#close-icon');
          if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
          if (hamburgerIco) hamburgerIco.classList.remove('hidden');
          if (closeIco) closeIco.classList.add('hidden');
        }
        var footerCategory = link.closest('.footer-category');
        if (footerCategory) footerCategory.open = false;
      });
    });

    // Sayfa #hash ile açıldıysa filtreyi otomatik uygula
    var initHash = window.location.hash.replace('#', '');
    if (initHash && hasHomeGrid) {
      var isDocumentarySubcategory = documentaryFilterButtons.some(function (button) {
        return button.getAttribute('data-documentary-filter') === initHash;
      });
      applyFilter(initHash, isDocumentarySubcategory);
      navLinks.forEach(function (l) {
        var h = (l.getAttribute('href') || '').split('#')[1];
        if (h === initHash) l.classList.add('active');
      });
      documentaryFilterButtons.forEach(function (button) {
        button.classList.toggle('active', button.getAttribute('data-documentary-filter') === initHash);
      });
    }

    // ──────────────────────────────────────
    // BÖLÜM 7 — ARAMA (Ctrl+K / Cmd+K)
    // SEARCH_INDEX renderPage'den geliyor
    // ──────────────────────────────────────
    var CATEGORY_LABELS = {
      bilim:'Bilim', tarih:'Tarih', sinema:'Sinema', muzik:'Müzik',
      felsefe:'Felsefe', belgesel:'Belgesel', doga:'Doğa', teknoloji:'Teknoloji',
    };

    var trigger   = qs('#search-trigger');
    var overlay   = qs('#search-overlay');
    var backdrop  = qs('#search-backdrop');
    var input     = qs('#search-input');
    var closeBtn  = qs('#search-close');
    var resultsEl = qs('#search-results');
    if (!trigger || !overlay || !input || !resultsEl) return;

    var currentResults = [];
    var activeIndex    = -1;

    function escHtml(str) {
      var d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    function buildResultsHTML(list) {
      return list.map(function (item) {
        var label = CATEGORY_LABELS[item.category] || item.badge;
        return (
          '<div class="search-result-item" data-href="' + item.href + '">' +
            '<div class="search-result-thumb"' + backgroundImageAttributes(item.img) + '></div>' +
            '<div class="search-result-body">' +
              '<div class="search-result-title">'   + escHtml(item.title)   + '</div>' +
              '<div class="search-result-excerpt">' + escHtml(item.excerpt) + '</div>' +
            '</div>' +
            '<span class="search-result-badge">' + escHtml(label) + '</span>' +
          '</div>'
        );
      }).join('');
    }

    function renderResults(query) {
      var q = query.trim().toLocaleLowerCase('tr');
      var list, prefix = '';
      if (q === '') {
        list   = searchIndex.slice(0, 6);
        prefix = '<p class="search-section-label">Önerilen Yazılar</p>';
      } else {
        list = searchIndex.filter(function (item) {
          var hay = (item.title + ' ' + item.excerpt + ' ' + item.badge + ' ' +
                    (CATEGORY_LABELS[item.category] || '')).toLocaleLowerCase('tr');
          return hay.indexOf(q) !== -1;
        });
      }
      currentResults = list;
      activeIndex    = -1;
      if (q && list.length === 0) {
        resultsEl.innerHTML = '<p class="search-no-results">&ldquo;' + escHtml(query) + '&rdquo; için sonuç bulunamadı.</p>';
        return;
      }
      resultsEl.innerHTML = prefix + buildResultsHTML(list);
    }

    function openSearch() {
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      input.value = '';
      renderResults('');
      setTimeout(function () { input.focus(); }, 30);
    }
    function closeSearch() {
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
      activeIndex = -1;
    }
    function isSearchOpen() { return !overlay.classList.contains('hidden'); }

    function updateHighlight() {
      var items = qsAll('.search-result-item', resultsEl);
      items.forEach(function (el, i) { el.classList.toggle('active', i === activeIndex); });
      if (items[activeIndex]) items[activeIndex].scrollIntoView({ block: 'nearest' });
    }

    trigger.addEventListener('click', openSearch);
    if (closeBtn) closeBtn.addEventListener('click', closeSearch);
    if (backdrop) backdrop.addEventListener('click', closeSearch);
    input.addEventListener('input', function () { renderResults(input.value); });
    resultsEl.addEventListener('click', function (e) {
      var item = e.target.closest('.search-result-item');
      if (item) window.location.href = item.getAttribute('data-href');
    });
    document.addEventListener('keydown', function (e) {
      var isCtrlK = (e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K');
      if (isCtrlK) { e.preventDefault(); isSearchOpen() ? closeSearch() : openSearch(); return; }
      if (!isSearchOpen()) return;
      if (e.key === 'Escape') { closeSearch(); }
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, currentResults.length - 1);
        updateHighlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        updateHighlight();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var chosen = activeIndex >= 0 ? currentResults[activeIndex] : currentResults[0];
        if (chosen) window.location.href = chosen.href;
      }
    });
  } // initFilterSystem sonu

}); // DOMContentLoaded sonu


// ============================================
// BÖLÜM 8 — SCROLL PROGRESS BAR
// ============================================

(function () {
  var bar = document.querySelector('#scroll-progress');
  if (!bar) return;
  function update() {
    if (document.body.getAttribute('data-vx-bar')) return;
    var st  = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max <= 0 ? 100 : Math.min((st / max) * 100, 100)) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

// ============================================
// BÖLÜM 9 — NAVBAR SCROLL EFEKTİ
// ============================================

(function () {
  var navbar = document.querySelector('#navbar');
  if (!navbar) return;
  window.addEventListener('scroll', function () {
    navbar.style.boxShadow = window.scrollY > 60
      ? '0 2px 20px rgba(0,0,0,0.10)' : 'none';
  }, { passive: true });
})();

// ============================================
// BÖLÜM 10 — SAYFA GEZİNME KONTROLLERİ
// ============================================

(function initPageNavigationControls() {
  function mount() {
    if (!document.body || document.querySelector('.page-nav-controls')) return;

    var controls = document.createElement('div');
    controls.className = 'page-nav-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Sayfa gezinme');
    controls.innerHTML =
      '<button class="page-nav-button" type="button" data-page-nav="top" ' +
        'aria-label="Sayfanın başına git" title="Yukarı çık">' +
        '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m-7 7 7-7 7 7"/>' +
        '</svg>' +
      '</button>';
    document.body.appendChild(controls);

    controls.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-page-nav="top"]');
      if (!button) return;
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();

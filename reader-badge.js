(function () {
  'use strict';

  var CFG = {
    requireOptIn: true
  };
  var STORAGE_KEY = 'valexirion-reader-badge';
  var STYLE_ID = 'vx-rb-style';
  var CATEGORIES = [
    { key: 'bilim', label: 'Bilim', hue: 198, icon: 'science' },
    { key: 'tarih', label: 'Tarih', hue: 31, icon: 'history' },
    { key: 'sinema', label: 'Sinema', hue: 350, icon: 'film' },
    { key: 'muzik', label: 'Müzik', hue: 278, icon: 'music' },
    { key: 'felsefe', label: 'Felsefe', hue: 48, icon: 'philosophy' },
    { key: 'belgesel', label: 'Belgesel', hue: 164, icon: 'camera' },
    { key: 'doga', label: 'Doğa', hue: 112, icon: 'nature' },
    { key: 'teknoloji', label: 'Teknoloji', hue: 226, icon: 'technology' }
  ];
  var LEVELS = [
    { name: 'Yeni Gelen', threshold: 0, hue: 205 },
    { name: 'Meraklı', threshold: 1, hue: 184 },
    { name: 'Gezgin', threshold: 5, hue: 145 },
    { name: 'Kâşif', threshold: 12, hue: 91 },
    { name: 'Araştırmacı', threshold: 25, hue: 47 },
    { name: 'Bilge', threshold: 50, hue: 24 },
    { name: 'Kozmos Okuru', threshold: 100, hue: 284 }
  ];
  var BADGE_STEPS = ['Çırak', 'Okur', 'Uzman', 'Usta'];
  var FALLBACK_THRESHOLDS = [1, 3, 6, 10];
  var state = emptyState();
  var categoryThresholds = {};
  var articleMap = {};
  var dataReady = false;
  var storageUnavailable = false;
  var trigger;
  var panel;
  var panelMain;
  var startArea;
  var dataArea;
  var storageNote;
  var toast;
  var toastTimer;
  var resetArmed = false;
  var trackingTimer;
  var trackingFinished = false;
  var lastActivity = 0;
  var activeSeconds = 0;
  var trackedContent;
  var trackedArticle;

  function emptyState() {
    return { v: 1, on: !CFG.requireOptIn, r: {}, e: {}, l: 0 };
  }

  function addStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '.vx-rb-trigger{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:36px;min-height:36px;padding:4px 9px;border:1px solid var(--border);border-radius:999px;background:var(--bg-2);color:var(--text);font:600 .75rem "Space Grotesk",sans-serif;cursor:pointer;white-space:nowrap;transition:background .18s ease,border-color .18s ease}' +
      '.vx-rb-trigger:hover{background:var(--bg-3);border-color:var(--accent)}' +
      '.vx-rb-trigger-label{font:600 .74rem Inter,sans-serif}' +
      '.vx-rb-mini{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:hsl(var(--rb-h) 62% 44%);color:#fff;font:700 .65rem "Space Grotesk",sans-serif}' +
      '.vx-rb-panel{box-sizing:border-box;position:fixed;z-index:990;width:min(440px,calc(100vw - 24px));max-height:min(78vh,720px);overflow:auto;overscroll-behavior:contain;padding:18px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--bg);color:var(--text);box-shadow:var(--shadow-hover);font:400 .88rem Inter,sans-serif}' +
      '.vx-rb-panel[hidden]{display:none}' +
      '.vx-rb-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}' +
      '.vx-rb-heading{margin:0;color:var(--text);font:700 1.2rem "Playfair Display",serif}' +
      '.vx-rb-close,.vx-rb-action{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-2);color:var(--text);font:600 .8rem Inter,sans-serif;cursor:pointer}' +
      '.vx-rb-close{width:38px;padding:0;font-size:1.15rem}' +
      '.vx-rb-action:hover,.vx-rb-close:hover{background:var(--bg-3);border-color:var(--accent)}' +
      '.vx-rb-action-primary{border-color:var(--accent);background:var(--accent);color:#fff}' +
      '.vx-rb-action-primary:hover{background:var(--accent-hover)}' +
      '.vx-rb-panel button:focus-visible,.vx-rb-panel input:focus-visible,.vx-rb-trigger:focus-visible,.vx-rb-panel summary:focus-visible{outline:3px solid var(--accent);outline-offset:3px}' +
      '.vx-rb-intro{margin:0 0 14px;color:var(--text-2);line-height:1.6}' +
      '.vx-rb-note{margin:10px 0 0;color:var(--text-2);font-size:.77rem;line-height:1.5}' +
      '.vx-rb-level{display:grid;grid-template-columns:92px minmax(0,1fr);align-items:center;gap:14px;padding:12px;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-2)}' +
      '.vx-rb-orbit{display:block;width:88px;height:88px;color:hsl(var(--rb-h) 62% 44%)}' +
      '.vx-rb-level-name{margin:0;color:var(--text);font:700 1.25rem "Playfair Display",serif}' +
      '.vx-rb-read-count{margin:4px 0 10px;color:var(--text-2);font-size:.83rem}' +
      '.vx-rb-progress{height:8px;overflow:hidden;border-radius:999px;background:var(--bg-3)}' +
      '.vx-rb-progress-fill{height:100%;border-radius:inherit;background:var(--accent);transition:width .25s ease}' +
      '.vx-rb-next{margin:6px 0 0;color:var(--text-2);font-size:.74rem;line-height:1.45}' +
      '.vx-rb-section-title{margin:18px 0 10px;color:var(--text);font:700 .96rem "Playfair Display",serif}' +
      '.vx-rb-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}' +
      '.vx-rb-card{min-width:0;padding:8px 4px 9px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-2);text-align:center;color:hsl(var(--rb-h) 62% 44%)}' +
      '.vx-rb-category-icon{display:block;width:54px;height:66px;margin:0 auto 2px;color:inherit}' +
      '.vx-rb-card-name{display:block;min-height:1.9em;color:var(--text);font-size:.68rem;font-weight:700;line-height:1.15;overflow-wrap:anywhere}' +
      '.vx-rb-card-rank{display:block;min-height:2em;margin-top:3px;color:var(--text-2);font-size:.62rem;line-height:1.2}' +
      '.vx-rb-mini-progress{height:4px;margin:5px 3px 0;overflow:hidden;border-radius:999px;background:var(--bg-3)}' +
      '.vx-rb-mini-progress span{display:block;height:100%;border-radius:inherit;background:currentColor}' +
      '.vx-rb-tools{margin-top:16px;border-top:1px solid var(--border);padding-top:12px}' +
      '.vx-rb-tools summary{min-height:36px;color:var(--text);font-size:.82rem;font-weight:600;cursor:pointer}' +
      '.vx-rb-tool-group{display:grid;gap:8px;margin-top:10px}' +
      '.vx-rb-input{box-sizing:border-box;width:100%;min-height:38px;padding:8px 9px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-2);color:var(--text);font: .78rem "Space Grotesk",sans-serif}' +
      '.vx-rb-tool-status{min-height:1.4em;margin:0;color:var(--text-2);font-size:.74rem;line-height:1.4}' +
      '.vx-rb-toast{box-sizing:border-box;position:fixed;z-index:990;left:50%;bottom:22px;display:grid;gap:3px;width:min(380px,calc(100vw - 28px));padding:14px 16px;transform:translateX(-50%);border:1px solid var(--border);border-radius:var(--radius);background:var(--bg);color:var(--text);box-shadow:var(--shadow-hover);font: .86rem Inter,sans-serif}' +
      '.vx-rb-toast[hidden]{display:none}' +
      '.vx-rb-toast-title{font-weight:700}' +
      '.vx-rb-toast-detail{color:var(--text-2);font-size:.78rem}' +
      '.dark .vx-rb-mini{background:hsl(var(--rb-h) 70% 64%);color:#101318}' +
      '.dark .vx-rb-orbit,.dark .vx-rb-card{color:hsl(var(--rb-h) 70% 68%)}' +
      '.dark .vx-rb-action-primary{background:var(--accent);color:var(--bg)}' +
      '@media(max-width:480px){.vx-rb-panel{padding:14px}.vx-rb-level{grid-template-columns:76px minmax(0,1fr);gap:10px}.vx-rb-orbit{width:72px;height:72px}.vx-rb-grid{gap:5px}.vx-rb-card{padding:7px 2px}.vx-rb-category-icon{width:48px;height:60px}.vx-rb-card-name{font-size:.64rem}}' +
      '@media(prefers-reduced-motion:reduce){.vx-rb-trigger,.vx-rb-progress-fill{transition:none!important;scroll-behavior:auto!important}}';
    document.head.appendChild(style);
  }

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function makeSvgElement(tag, attrs) {
    var element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    var key;
    for (key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        element.setAttribute(key, attrs[key]);
      }
    }
    return element;
  }

  function setHue(element, hue) {
    element.style.setProperty('--rb-h', String(hue));
  }

  function createOrbit(levelIndex, large) {
    var svg = makeSvgElement('svg', {
      'class': 'vx-rb-orbit',
      viewBox: '0 0 100 100',
      role: 'img',
      'aria-label': 'Seviye rozeti'
    });
    var orbitCount = Math.max(1, Math.min(7, levelIndex + 1));
    var index;
    setHue(svg, LEVELS[levelIndex].hue);
    for (index = 0; index < orbitCount; index += 1) {
      svg.appendChild(makeSvgElement('ellipse', {
        cx: '50',
        cy: '50',
        rx: large ? '37' : '34',
        ry: large ? '13' : '12',
        transform: 'rotate(' + (index * (180 / orbitCount)) + ' 50 50)',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '2'
      }));
    }
    svg.appendChild(makeSvgElement('circle', {
      cx: '50',
      cy: '50',
      r: '5',
      fill: 'currentColor'
    }));
    return svg;
  }

  function appendBranchArtwork(svg, icon) {
    var shapes = {
      science: [
        ['path', 'M42 25h16M46 25v20L32 72q-3 6 4 8h28q7-2 4-8L54 45V25M38 66h24']
      ],
      history: [
        ['path', 'M23 36h54L50 22 23 36ZM27 75h46M23 81h54M29 40v31M43 40v31M57 40v31M71 40v31']
      ],
      film: [
        ['rect', '30 23 40 56', ''],
        ['path', 'M30 35h40M30 66h40M39 23v12M52 23v12M64 23v12M39 66v13M52 66v13M64 66v13']
      ],
      music: [
        ['path', 'M42 67V31l29-6v37M42 39l29-6M42 67c0 6-7 10-13 8-7-2-5-9 2-12 5-2 11-1 11 4ZM71 62c0 6-7 10-13 8-7-2-5-9 2-12 5-2 11-1 11 4Z']
      ],
      philosophy: [
        ['path', 'M50 23c-14 0-23 10-23 22 0 8 4 13 10 18 4 3 5 7 5 10h16c0-3 1-7 5-10 6-5 10-10 10-18 0-12-9-22-23-22ZM42 79h16M44 85h12M50 34v18M43 43h14']
      ],
      camera: [
        ['path', 'M25 39h13l5-8h16l5 8h11q5 0 5 5v27q0 5-5 5H25q-5 0-5-5V44q0-5 5-5ZM65 49l14-8v29l-14-8']
      ],
      nature: [
        ['path', 'M73 25C47 27 28 35 25 54c-2 14 9 23 21 18 20-8 26-31 27-47ZM28 76c10-15 22-27 39-41M44 58c-1-8-4-13-10-17M49 54c8 0 14 2 18 7']
      ],
      technology: [
        ['path', 'M35 32h30v36H35zM42 40h16v20H42zM40 23v9M50 23v9M60 23v9M40 68v9M50 68v9M60 68v9M26 39h9M26 50h9M26 61h9M65 39h9M65 50h9M65 61h9']
      ]
    };
    var shapesForIcon = shapes[icon] || shapes.science;
    var index;
    for (index = 0; index < shapesForIcon.length; index += 1) {
      if (shapesForIcon[index][0] === 'rect') {
        svg.appendChild(makeSvgElement('rect', {
          x: '30',
          y: '23',
          width: '40',
          height: '56',
          rx: '2',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2.5'
        }));
      } else {
        svg.appendChild(makeSvgElement(shapesForIcon[index][0], {
          d: shapesForIcon[index][1],
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '2.5',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        }));
      }
    }
  }

  function createBranchIcon(category, tier) {
    var svg = makeSvgElement('svg', {
      'class': 'vx-rb-category-icon',
      viewBox: '0 0 100 126',
      role: 'img',
      'aria-label': category.label + ' rozeti'
    });
    var polygon = '50,7 84,27 84,67 50,87 16,67 16,27';
    var index;
    setHue(svg, category.hue);
    svg.appendChild(makeSvgElement('polygon', {
      points: polygon,
      fill: 'currentColor',
      'fill-opacity': tier ? String(0.06 + tier * 0.07) : '0',
      stroke: 'currentColor',
      'stroke-width': tier ? '3' : '2',
      'stroke-dasharray': tier ? 'none' : '5 5',
      'stroke-opacity': tier ? '1' : '.38'
    }));
    if (tier >= 4) {
      svg.appendChild(makeSvgElement('polygon', {
        points: '50,14 78,31 78,63 50,80 22,63 22,31',
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.5'
      }));
    }
    appendBranchArtwork(svg, category.icon);
    for (index = 0; index < 4; index += 1) {
      svg.appendChild(makeSvgElement('circle', {
        cx: String(35 + index * 10),
        cy: '108',
        r: '3.5',
        fill: index < tier ? 'currentColor' : 'none',
        stroke: 'currentColor',
        'stroke-width': '1.5',
        'stroke-opacity': index < tier ? '1' : '.5'
      }));
    }
    return svg;
  }

  function categoryIndex(key) {
    var index;
    for (index = 0; index < CATEGORIES.length; index += 1) {
      if (CATEGORIES[index].key === key) return index;
    }
    return -1;
  }

  function normalizeHref(href) {
    var value = String(href || '').split('#')[0].split('?')[0];
    var parts;
    try {
      value = decodeURIComponent(value);
    } catch (error) {
      return '';
    }
    value = value.replace(/\\/g, '/').replace(/\/+$/, '');
    parts = value.split('/');
    value = parts[parts.length - 1] || '';
    if (value && !/\.html$/i.test(value)) value += '.html';
    return value.toLowerCase();
  }

  function normalizeSlug(slug) {
    return /^[a-z0-9-]+$/i.test(slug) ? slug.toLowerCase() : '';
  }

  function parseReadTime(readTime) {
    var match = String(readTime || '').match(/\d+(?:[.,]\d+)?/);
    return match ? parseFloat(match[0].replace(',', '.')) : 5;
  }

  function normalizeState(raw) {
    var normalized = emptyState();
    var key;
    var record;
    var tier;
    if (!raw || typeof raw !== 'object') return normalized;
    normalized.on = raw.on === true;
    normalized.l = typeof raw.l === 'number' && isFinite(raw.l)
      ? Math.max(0, Math.min(LEVELS.length - 1, Math.floor(raw.l))) : 0;
    if (raw.r && typeof raw.r === 'object') {
      for (key in raw.r) {
        if (!Object.prototype.hasOwnProperty.call(raw.r, key)) continue;
        record = raw.r[key];
        if (!normalizeSlug(key.replace(/\.html$/i, '')) || !/\.html$/i.test(key) ||
            !record || categoryIndex(record.c) < 0) continue;
        normalized.r[key.toLowerCase()] = {
          c: record.c,
          t: typeof record.t === 'number' && isFinite(record.t) ? record.t : 0
        };
      }
    }
    if (raw.e && typeof raw.e === 'object') {
      for (key in raw.e) {
        if (!Object.prototype.hasOwnProperty.call(raw.e, key) || categoryIndex(key) < 0) continue;
        tier = raw.e[key];
        if (typeof tier === 'number' && isFinite(tier)) {
          normalized.e[key] = Math.max(0, Math.min(BADGE_STEPS.length, Math.floor(tier)));
        }
      }
    }
    return normalized;
  }

  function readStoredState() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw === null) return emptyState();
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      storageUnavailable = true;
      return emptyState();
    }
  }

  function mergeStates(first, second) {
    var result = normalizeState(first);
    var incoming = normalizeState(second);
    var key;
    result.on = result.on || incoming.on;
    result.l = Math.max(result.l, incoming.l);
    for (key in incoming.r) {
      if (Object.prototype.hasOwnProperty.call(incoming.r, key) && !result.r[key]) {
        result.r[key] = incoming.r[key];
      }
    }
    for (key in incoming.e) {
      if (Object.prototype.hasOwnProperty.call(incoming.e, key)) {
        result.e[key] = Math.max(result.e[key] || 0, incoming.e[key]);
      }
    }
    return result;
  }

  function persistState(candidate) {
    var latest = readStoredState();
    var merged = mergeStates(mergeStates(state, candidate), latest);
    if (!merged.on) {
      state = merged;
      render();
      return false;
    }
    state = merged;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageUnavailable = false;
      render();
      return true;
    } catch (error) {
      storageUnavailable = true;
      render();
      return false;
    }
  }

  function categoryCounts() {
    var counts = {};
    var key;
    for (key in state.r) {
      if (Object.prototype.hasOwnProperty.call(state.r, key) && categoryIndex(state.r[key].c) >= 0) {
        counts[state.r[key].c] = (counts[state.r[key].c] || 0) + 1;
      }
    }
    return counts;
  }

  function makeThresholds(total) {
    var result = [];
    var previous = 0;
    var rawValues = [
      1,
      Math.max(2, Math.ceil(total * 0.25)),
      Math.max(3, Math.ceil(total * 0.55)),
      Math.max(4, Math.ceil(total * 0.85))
    ];
    var index;
    for (index = 0; index < rawValues.length; index += 1) {
      previous = Math.max(previous + 1, rawValues[index]);
      result.push(previous);
    }
    return result;
  }

  function branchTier(count, thresholds) {
    var tier = 0;
    var index;
    for (index = 0; index < thresholds.length; index += 1) {
      if (count >= thresholds[index]) tier = index + 1;
    }
    return tier;
  }

  function levelForCount(count) {
    var index;
    var level = 0;
    for (index = 0; index < LEVELS.length; index += 1) {
      if (count >= LEVELS[index].threshold) level = index;
    }
    return level;
  }

  function awardCurrentProgress() {
    var counts = categoryCounts();
    var total = Object.keys(state.r).length;
    var changed = false;
    var level = levelForCount(total);
    var index;
    var category;
    var currentTier;
    for (index = 0; index < CATEGORIES.length; index += 1) {
      category = CATEGORIES[index];
      currentTier = branchTier(counts[category.key] || 0,
        categoryThresholds[category.key] || FALLBACK_THRESHOLDS);
      if (currentTier > (state.e[category.key] || 0)) {
        state.e[category.key] = currentTier;
        changed = true;
      }
    }
    if (level > state.l) {
      state.l = level;
      changed = true;
    }
    return changed;
  }

  function getCurrentLevel() {
    return Math.max(state.l, levelForCount(Object.keys(state.r).length));
  }

  function makeButton(text, className, type) {
    var button = createElement('button', className || 'vx-rb-action', text);
    button.type = type || 'button';
    return button;
  }

  function createInterface() {
    var tools = document.querySelector('.navbar-tools');
    var search;
    var head;
    var closeButton;
    var intro;
    var startButton;
    var toolsDetails;
    var summary;
    var exportLabel;
    var copyButton;
    var importLabel;
    var importButton;
    var deleteButton;
    var output;
    var input;
    var toolStatus;

    if (!tools) return false;
    search = tools.querySelector('#search-trigger');
    trigger = makeButton('', 'vx-rb-trigger');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'vx-rb-dialog');
    trigger.setAttribute('aria-label', 'Okur rozeti panelini aç');
    if (search) tools.insertBefore(trigger, search);
    else tools.insertBefore(trigger, tools.firstChild);

    panel = createElement('section', 'vx-rb-panel');
    panel.id = 'vx-rb-dialog';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'vx-rb-title');
    head = createElement('div', 'vx-rb-head');
    head.appendChild(createElement('h2', 'vx-rb-heading', 'Okur rozeti'));
    head.lastChild.id = 'vx-rb-title';
    closeButton = makeButton('×', 'vx-rb-close');
    closeButton.setAttribute('aria-label', 'Rozet panelini kapat');
    head.appendChild(closeButton);
    panel.appendChild(head);

    startArea = createElement('div', 'vx-rb-start');
    intro = createElement('p', 'vx-rb-intro',
      'Okuduğun her yazı rozete eklenir. İlerlemen bu tarayıcıda saklanır, sunucuya hiçbir şey gönderilmez.');
    startArea.appendChild(intro);
    startButton = makeButton('Rozetimi başlat', 'vx-rb-action vx-rb-action-primary');
    startArea.appendChild(startButton);
    storageNote = createElement('p', 'vx-rb-note',
      'Depolama kullanılamıyor; ilerleme bu oturumla sınırlı kalır.');
    storageNote.hidden = true;
    panel.appendChild(startArea);

    dataArea = createElement('div', 'vx-rb-data');
    panelMain = createElement('div', 'vx-rb-main');
    dataArea.appendChild(panelMain);
    panel.appendChild(dataArea);
    panel.appendChild(storageNote);

    toolsDetails = createElement('details', 'vx-rb-tools');
    summary = createElement('summary', '', 'Yedekle, taşı veya sil');
    toolsDetails.appendChild(summary);
    output = createElement('input', 'vx-rb-input');
    output.type = 'text';
    output.readOnly = true;
    output.setAttribute('aria-label', 'Yedek kodu');
    output.value = '';
    exportLabel = createElement('label', '', 'Yedek kodu');
    exportLabel.appendChild(output);
    toolsDetails.appendChild(exportLabel);
    copyButton = makeButton('Kodu kopyala');
    toolsDetails.appendChild(copyButton);
    input = createElement('input', 'vx-rb-input');
    input.type = 'text';
    input.autocomplete = 'off';
    input.setAttribute('aria-label', 'Geri yüklenecek yedek kodu');
    importLabel = createElement('label', '', 'Yedek kodunu buraya yapıştır');
    importLabel.appendChild(input);
    toolsDetails.appendChild(importLabel);
    importButton = makeButton('Geri yükle');
    toolsDetails.appendChild(importButton);
    deleteButton = makeButton('Tüm ilerlememi sil');
    toolsDetails.appendChild(deleteButton);
    toolStatus = createElement('p', 'vx-rb-tool-status', '');
    toolStatus.setAttribute('role', 'status');
    toolStatus.setAttribute('aria-live', 'polite');
    toolsDetails.appendChild(toolStatus);
    panel.appendChild(toolsDetails);
    document.body.appendChild(panel);

    toast = createElement('div', 'vx-rb-toast');
    toast.hidden = true;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.appendChild(createElement('strong', 'vx-rb-toast-title', ''));
    toast.appendChild(createElement('span', 'vx-rb-toast-detail', ''));
    document.body.appendChild(toast);

    trigger.addEventListener('click', function () {
      if (panel.hidden) openPanel();
      else closePanel(false);
    });
    closeButton.addEventListener('click', function () { closePanel(false); });
    startButton.addEventListener('click', function () {
      var latest = readStoredState();
      state = mergeStates(state, latest);
      state.on = true;
      persistState(state);
      try {
        if (navigator.storage && typeof navigator.storage.persist === 'function') {
          var persistenceRequest = navigator.storage.persist();
          if (persistenceRequest && typeof persistenceRequest.catch === 'function') {
            persistenceRequest.catch(function () {});
          }
        }
      } catch (error) {}
      render();
      if (dataReady) {
        var currentHref = normalizeHref(window.location.pathname);
        if (articleMap[currentHref]) startReadingTracker(articleMap[currentHref]);
      }
    });
    copyButton.addEventListener('click', function () {
      var code;
      try {
        code = encodeBackup();
      } catch (error) {
        toolStatus.textContent = 'Yedek kodu oluşturulamadı.';
        return;
      }
      output.value = code;
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          navigator.clipboard.writeText(code).then(function () {
            toolStatus.textContent = 'Yedek kodu kopyalandı.';
          }).catch(function () {
            output.focus();
            output.select();
            toolStatus.textContent = 'Kod alanı seçildi. Kopyalamak için Ctrl+C kullan.';
          });
        } catch (error) {
          output.focus();
          output.select();
          toolStatus.textContent = 'Kod alanı seçildi. Kopyalamak için Ctrl+C kullan.';
        }
      } else {
        output.focus();
        output.select();
        toolStatus.textContent = 'Kod alanı seçildi. Kopyalamak için Ctrl+C kullan.';
      }
    });
    importButton.addEventListener('click', function () {
      var imported = decodeBackup(input.value);
      var added = 0;
      var index;
      var entry;
      var file;
      if (!imported.valid) {
        toolStatus.textContent = 'Kod geçersiz.';
        return;
      }
      state = mergeStates(state, readStoredState());
      state.on = true;
      for (index = 0; index < imported.entries.length; index += 1) {
        entry = imported.entries[index];
        file = entry.slug + '.html';
        if (!state.r[file]) {
          state.r[file] = { c: CATEGORIES[entry.category].key, t: Date.now() };
          added += 1;
        }
      }
      awardCurrentProgress();
      persistState(state);
      toolStatus.textContent = added + ' yazı eklendi. Mevcut ilerlemen korundu.';
      render();
    });
    deleteButton.addEventListener('click', function () {
      if (!resetArmed) {
        resetArmed = true;
        deleteButton.textContent = 'Emin misin? Geri alınamaz…';
        toolStatus.textContent = '';
        return;
      }
      resetArmed = false;
      deleteButton.textContent = 'Tüm ilerlememi sil';
      readStoredState();
      state = { v: 1, on: state.on, r: {}, e: {}, l: 0 };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        storageUnavailable = false;
      } catch (error) {
        storageUnavailable = true;
      }
      output.value = '';
      input.value = '';
      toolStatus.textContent = 'İlerlemen silindi.';
      render();
    });

    return true;
  }

  function openPanel() {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-label', 'Okur rozeti panelini kapat');
    positionPanel();
    panel.querySelector('.vx-rb-close').focus();
  }

  function closePanel(returnFocus) {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-label', 'Okur rozeti panelini aç');
    if (returnFocus) trigger.focus();
  }

  function positionPanel() {
    var rect;
    var width;
    var top;
    if (!panel || panel.hidden || !trigger) return;
    rect = trigger.getBoundingClientRect();
    width = Math.min(440, window.innerWidth - 24);
    top = Math.min(rect.bottom + 8, window.innerHeight - panel.offsetHeight - 12);
    panel.style.top = Math.max(12, top) + 'px';
    panel.style.left = Math.max(12, Math.min(rect.right - width, window.innerWidth - width - 12)) + 'px';
  }

  function appendProgress(parent, ratio, mini) {
    var track = createElement('div', mini ? 'vx-rb-mini-progress' : 'vx-rb-progress');
    var fill = createElement('div', mini ? '' : 'vx-rb-progress-fill');
    fill.style.width = Math.max(0, Math.min(1, ratio)) * 100 + '%';
    if (mini) {
      var inner = createElement('span', '');
      inner.style.width = Math.max(0, Math.min(1, ratio)) * 100 + '%';
      track.appendChild(inner);
    } else {
      track.appendChild(fill);
    }
    parent.appendChild(track);
    return track;
  }

  function getLevelProgress(count, levelIndex) {
    var nextIndex = Math.min(levelIndex + 1, LEVELS.length - 1);
    var start = LEVELS[levelIndex].threshold;
    var end = LEVELS[nextIndex].threshold;
    if (levelIndex >= LEVELS.length - 1) return { ratio: 1, left: 0, next: null };
    return {
      ratio: end <= start ? 1 : (count - start) / (end - start),
      left: Math.max(0, end - count),
      next: LEVELS[nextIndex]
    };
  }

  function renderMain() {
    var count = Object.keys(state.r).length;
    var levelIndex = getCurrentLevel();
    var level = LEVELS[levelIndex];
    var progress = getLevelProgress(count, levelIndex);
    var card;
    var levelInfo;
    var sectionTitle;
    var grid;
    var counts = categoryCounts();
    var index;
    var category;
    var thresholds;
    var earned;
    var tier;
    var cardNode;
    var icon;
    var rankName;
    var ratio;
    var nextText;
    var detail;

    while (panelMain.firstChild) panelMain.removeChild(panelMain.firstChild);
    card = createElement('div', 'vx-rb-level');
    card.appendChild(createOrbit(levelIndex, true));
    levelInfo = createElement('div', 'vx-rb-level-info');
    setHue(levelInfo, level.hue);
    levelInfo.appendChild(createElement('h3', 'vx-rb-level-name', level.name));
    levelInfo.appendChild(createElement('p', 'vx-rb-read-count', count + ' yazı okudun'));
    appendProgress(levelInfo, progress.ratio, false);
    if (progress.next) {
      nextText = 'Sonraki seviye: ' + progress.next.name + ', ' + progress.left + ' yazı kaldı';
    } else {
      nextText = 'En yüksek seviyeye ulaştın.';
    }
    levelInfo.appendChild(createElement('p', 'vx-rb-next', nextText));
    card.appendChild(levelInfo);
    panelMain.appendChild(card);
    panelMain.appendChild(createElement('h3', 'vx-rb-section-title', 'Branş rozetleri'));
    grid = createElement('div', 'vx-rb-grid');
    for (index = 0; index < CATEGORIES.length; index += 1) {
      category = CATEGORIES[index];
      thresholds = categoryThresholds[category.key] || FALLBACK_THRESHOLDS;
      earned = branchTier(counts[category.key] || 0, thresholds);
      tier = Math.max(earned, state.e[category.key] || 0);
      cardNode = createElement('div', 'vx-rb-card');
      setHue(cardNode, category.hue);
      icon = createBranchIcon(category, tier);
      cardNode.appendChild(icon);
      cardNode.appendChild(createElement('span', 'vx-rb-card-name', category.label));
      rankName = tier ? BADGE_STEPS[tier - 1] : (counts[category.key] ? 'Yolda' : 'Başlamadı');
      cardNode.appendChild(createElement('span', 'vx-rb-card-rank', rankName));
      if (tier < BADGE_STEPS.length) {
        ratio = (counts[category.key] || 0) / thresholds[tier];
      } else {
        ratio = 1;
      }
      appendProgress(cardNode, ratio, true);
      detail = category.label + ' rozeti: ' + rankName + '. ' +
        (counts[category.key] || 0) + ' yazı okundu.';
      if (tier < BADGE_STEPS.length) {
        detail += ' Sonraki kademe için ' +
          Math.max(0, thresholds[tier] - (counts[category.key] || 0)) + ' yazı kaldı.';
      } else {
        detail += ' En yüksek kademe kazanıldı.';
      }
      cardNode.title = detail;
      grid.appendChild(cardNode);
    }
    panelMain.appendChild(grid);
  }

  function render() {
    var count = Object.keys(state.r).length;
    var levelIndex = getCurrentLevel();
    var mini;
    var label;
    if (!trigger) return;
    while (trigger.firstChild) trigger.removeChild(trigger.firstChild);
    if (state.on) {
      mini = createOrbit(levelIndex, false);
      mini.className.baseVal = 'vx-rb-mini';
      mini.setAttribute('viewBox', '0 0 100 100');
      mini.style.width = '22px';
      mini.style.height = '22px';
      trigger.appendChild(mini);
      label = createElement('span', 'vx-rb-trigger-label', String(count));
      trigger.appendChild(label);
      startArea.hidden = true;
      dataArea.hidden = false;
      panel.querySelector('.vx-rb-tools').hidden = false;
      renderMain();
    } else {
      trigger.appendChild(createElement('span', 'vx-rb-trigger-label', 'Rozet'));
      startArea.hidden = false;
      dataArea.hidden = true;
      panel.querySelector('.vx-rb-tools').hidden = true;
    }
    storageNote.hidden = !storageUnavailable;
    if (panel && !panel.hidden) positionPanel();
  }

  function showToast(title, detail) {
    if (!toast) return;
    toast.querySelector('.vx-rb-toast-title').textContent = title;
    toast.querySelector('.vx-rb-toast-detail').textContent = detail || '';
    toast.hidden = false;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.hidden = true; }, 6500);
  }

  function encodeBackup() {
    var pairs = [];
    var key;
    var slug;
    var index;
    for (key in state.r) {
      if (!Object.prototype.hasOwnProperty.call(state.r, key)) continue;
      slug = key.replace(/\.html$/i, '');
      index = categoryIndex(state.r[key].c);
      if (normalizeSlug(slug) && index >= 0) pairs.push(slug.toLowerCase() + ':' + index);
    }
    pairs.sort();
    return 'VX1.' + window.btoa(pairs.join(';'))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }

  function decodeBackup(code) {
    var match = /^VX1\.([A-Za-z0-9_-]*)$/.exec(String(code || '').trim());
    var decoded;
    var chunks;
    var entries = [];
    var seen = {};
    var index;
    var pair;
    var category;
    if (!match) return { valid: false, entries: [] };
    try {
      decoded = window.atob(match[1].replace(/-/g, '+').replace(/_/g, '/') +
        new Array((4 - match[1].length % 4) % 4 + 1).join('='));
    } catch (error) {
      return { valid: false, entries: [] };
    }
    if (!decoded) return { valid: true, entries: [] };
    chunks = decoded.split(';');
    for (index = 0; index < chunks.length; index += 1) {
      pair = /^([a-z0-9-]+):(\d+)$/i.exec(chunks[index]);
      if (!pair) return { valid: false, entries: [] };
      category = parseInt(pair[2], 10);
      if (!isFinite(category) || category < 0 || category >= CATEGORIES.length) {
        return { valid: false, entries: [] };
      }
      if (!seen[pair[1].toLowerCase()]) {
        entries.push({ slug: pair[1].toLowerCase(), category: category });
        seen[pair[1].toLowerCase()] = true;
      }
    }
    return { valid: true, entries: entries };
  }

  function handleStorageEvent(event) {
    var incoming;
    if (event.key !== STORAGE_KEY) return;
    if (!event.newValue) {
      state = emptyState();
    } else {
      try {
        incoming = normalizeState(JSON.parse(event.newValue));
      } catch (error) {
        return;
      }
      if (incoming.on && !Object.keys(incoming.r).length &&
          !Object.keys(incoming.e).length && incoming.l === 0) {
        state = incoming;
      } else {
        state = mergeStates(state, incoming);
      }
    }
    render();
    if (state.on && dataReady) {
      var currentHref = normalizeHref(window.location.pathname);
      if (articleMap[currentHref]) startReadingTracker(articleMap[currentHref]);
    }
  }

  function onOutsidePointer(event) {
    if (!panel || panel.hidden) return;
    if (!panel.contains(event.target) && !trigger.contains(event.target)) closePanel(false);
  }

  function onKeydown(event) {
    var focusable = [];
    var candidates;
    var first;
    var last;
    var index;
    if (!panel || panel.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel(true);
      return;
    }
    if (event.key !== 'Tab') return;
    candidates = panel.querySelectorAll('button:not([disabled]),input:not([disabled]),summary');
    for (index = 0; index < candidates.length; index += 1) {
      if (candidates[index].offsetParent !== null) focusable.push(candidates[index]);
    }
    if (!focusable.length) return;
    first = focusable[0];
    last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function getDepth() {
    var rect;
    var depth;
    if (!trackedContent) return 0;
    rect = trackedContent.getBoundingClientRect();
    if (!rect.height || rect.height < 0) return 0;
    depth = (window.innerHeight - rect.top) / rect.height;
    return Math.max(0, Math.min(1, depth));
  }

  function completeArticle() {
    var beforeLevel;
    var beforeTier;
    var latest;
    var file = trackedArticle.href;
    var total;
    var tier;
    var category;
    if (trackingFinished) return;
    trackingFinished = true;
    if (trackingTimer) window.clearInterval(trackingTimer);
    latest = mergeStates(state, readStoredState());
    if (latest.r[file]) {
      state = latest;
      render();
      return;
    }
    state = latest;
    beforeLevel = getCurrentLevel();
    category = trackedArticle.category;
    beforeTier = Math.max(state.e[category] || 0,
      branchTier(categoryCounts()[category] || 0,
        categoryThresholds[category] || FALLBACK_THRESHOLDS));
    state.r[file] = { c: category, t: Date.now() };
    awardCurrentProgress();
    persistState(state);
    total = Object.keys(state.r).length;
    tier = Math.max(state.e[category] || 0,
      branchTier(categoryCounts()[category] || 0,
        categoryThresholds[category] || FALLBACK_THRESHOLDS));
    if (state.l > beforeLevel) {
      showToast('Yeni seviye: ' + LEVELS[state.l].name,
        tier > beforeTier ? CATEGORIES[categoryIndex(category)].label + ' rozeti: ' + BADGE_STEPS[tier - 1] : total + ' yazı okundu.');
    } else if (tier > beforeTier) {
      showToast(CATEGORIES[categoryIndex(category)].label + ' rozeti: ' + BADGE_STEPS[tier - 1],
        total + ' yazı okundu.');
    } else {
      showToast('Yazı rozetine eklendi', 'Toplam ' + total + ' yazı.');
    }
  }

  function startReadingTracker(article) {
    var minutes;
    var thresholdSeconds;
    var activityEvents = ['scroll', 'pointermove', 'keydown', 'touchstart'];
    var index;
    if (!state.on || !article || trackingTimer || trackingFinished) return;
    state = mergeStates(state, readStoredState());
    if (state.r[article.href]) {
      render();
      return;
    }
    trackedContent = document.querySelector('.article-content-wrap') || document.querySelector('article');
    if (!trackedContent) return;
    trackedArticle = article;
    minutes = parseReadTime(article.readTime);
    thresholdSeconds = Math.max(20, Math.min(90, minutes * 60 * 0.15));
    for (index = 0; index < activityEvents.length; index += 1) {
      document.addEventListener(activityEvents[index], function () {
        lastActivity = Date.now();
      }, { passive: true });
    }
    trackingTimer = window.setInterval(function () {
      if (document.visibilityState === 'visible' && Date.now() - lastActivity <= 15000) {
        activeSeconds += 1;
        if (activeSeconds >= thresholdSeconds && getDepth() >= 0.8) completeArticle();
      }
    }, 1000);
  }

  function loadArticleData() {
    var requestUrl = new URL('data.json', window.location.href).href;
    window.fetch(requestUrl).then(function (response) {
      if (!response.ok) throw new Error('data.json request failed (' + response.status + ')');
      return response.json();
    }).then(function (data) {
      var articles = data && Array.isArray(data.articles) ? data.articles : [];
      var counts = {};
      var index;
      var article;
      var href;
      var category;
      for (index = 0; index < articles.length; index += 1) {
        article = articles[index];
        href = normalizeHref(article.href);
        category = categoryIndex(article.category);
        if (!href || category < 0) continue;
        articleMap[href] = {
          href: href,
          category: article.category,
          readTime: article.readTime
        };
        counts[article.category] = (counts[article.category] || 0) + 1;
      }
      for (index = 0; index < CATEGORIES.length; index += 1) {
        category = CATEGORIES[index].key;
        categoryThresholds[category] = makeThresholds(counts[category] || 0);
      }
      dataReady = true;
      if (state.on && awardCurrentProgress()) persistState(state);
      render();
      if (!state.on) return;
      href = normalizeHref(window.location.pathname);
      if (articleMap[href]) startReadingTracker(articleMap[href]);
    }).catch(function () {
      var index;
      for (index = 0; index < CATEGORIES.length; index += 1) {
        categoryThresholds[CATEGORIES[index].key] = FALLBACK_THRESHOLDS.slice();
      }
      dataReady = false;
      render();
    });
  }

  function initialize() {
    if (document.getElementById(STYLE_ID)) return;
    addStyle();
    state = readStoredState();
    if (!CFG.requireOptIn) state.on = true;
    if (!createInterface()) return;
    render();
    window.addEventListener('storage', handleStorageEvent);
    document.addEventListener('pointerdown', onOutsidePointer);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);
    loadArticleData();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
}());

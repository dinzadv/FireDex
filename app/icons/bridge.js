const CDN = 'https://cdn.jsdelivr.net/npm/pixelarticons@2.4.1/svg/';
const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';

const FB = {
  home: '<path d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9"/>',
  commands: '<path d="M4 5h16v14H4zM7 9l3 3-3 3M12 15h5"/>',
  manifest: '<path d="M6 3h9l4 4v14H6zM9 12h7M9 16h7"/>',
  guide: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 1 4 18.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 0 2.5-2.5z"/>',
  back: '<path d="m15 6-6 6 6 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  download: '<path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/>',
  upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
  cookie: '<path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5Z"/><path d="M8.5 10h.01M12 15h.01M15.5 13h.01"/>',
  trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  cube: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3ZM4 7.5 12 12l8-4.5M12 12v9"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.01"/>'
};

const FILE = {
  home: 'home', commands: 'terminal', manifest: 'clipboard', guide: 'book-open', back: 'arrow-left', close: 'close', play: 'play', pause: 'pause',
  film: 'movie', download: 'download', upload: 'upload', settings: 'sliders', cookie: 'cookie', trash: 'trash', cube: 'cube', info: 'info-box'
};

const LEGACY = {
  folderClosed: 'folder', file: 'file', image: 'image', chevron: 'chevron-right', chevronDown: 'chevron-down', plus: 'plus', folderPlus: 'folder-plus',
  filePlus: 'file-plus', trash: 'trash', edit: 'edit', download: 'download', save: 'save', play: 'play', menu: 'menu', back: 'arrow-left', fwd: 'arrow-right',
  undo: 'undo', redo: 'redo', find: 'search', more: 'more-horizontal', close: 'close', home: 'home', gear: 'sliders', err: 'close-box', warnTri: 'warning-box',
  warn: 'warning-box', infoC: 'info-box', info: 'info-box', check: 'check', copy: 'copy', eye: 'eye', globe: 'globe', term: 'terminal', camera: 'camera',
  arrowL: 'arrow-left', clock: 'clock', checkCircle: 'check', dots: 'more-horizontal', upload: 'upload', pause: 'pause', restart: 'reload', regen: 'reload',
  manifest: 'clipboard', syntaxIcon: 'code', brackets: 'code', snippet: 'code', toolbox: 'briefcase', gradCap: 'book-open', package: 'archive', tagIcon: 'label'
};

const TOOLS = { models: 'cube', uuid: 'label', jsonfmt: 'code', snippets: 'code', manifest: 'clipboard', imgjson: 'movie', versions: 'reload', images: 'image', recipe: 'list-box', loot: 'gift', hud: 'monitor', structures: 'buildings', textures: 'paint-bucket' };

const memo = {};
const read = (k) => { try { return localStorage.getItem('fd_px_' + k); } catch (e) { return null; } };
const write = (k, v) => { try { localStorage.setItem('fd_px_' + k, v); } catch (e) { } };

function fetchPaths(file) {
  if (memo[file]) return memo[file];
  const cached = read(file);
  if (cached) return (memo[file] = Promise.resolve(cached === '-' ? null : cached));
  memo[file] = fetch(CDN + file + '.svg')
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((t) => {
      const m = t.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
      const inner = m ? m[1].trim() : '';
      if (!/<path/.test(inner)) throw 0;
      write(file, inner);
      return inner;
    })
    .catch(() => { delete memo[file]; return null; });
  return memo[file];
}

function upgrade(el) {
  const file = el.getAttribute('data-px');
  if (!file || el.hasAttribute('data-px-done')) return;
  el.setAttribute('data-px-done', '1');
  fetchPaths(file).then((inner) => {
    if (!inner || !el.isConnected) return;
    el.setAttribute('viewBox', '0 0 24 24');
    ['stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'].forEach((a) => el.removeAttribute(a));
    el.setAttribute('fill', 'currentColor');
    el.style.stroke = 'none';
    el.style.shapeRendering = 'crispEdges';
    el.innerHTML = inner.replace(/fill="[^"]*"/g, '').replace(/<path /g, '<path fill="currentColor" ');
  });
}

function scan(root) {
  if (root.nodeType !== 1) return;
  if (root.matches && root.matches('svg[data-px]')) upgrade(root);
  root.querySelectorAll && root.querySelectorAll('svg[data-px]:not([data-px-done])').forEach(upgrade);
}

const tag = (html, file) => (typeof html === 'string' && file ? html.replace(/^<svg /, '<svg data-px="' + file + '" ') : html);

function svg(name, o) {
  const size = (o && o.size) || 20;
  return '<svg data-px="' + (FILE[name] || '') + '" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" ' + STROKE + ' aria-hidden="true">' + (FB[name] || '') + '</svg>';
}

function tagLegacy(obj) {
  Object.keys(obj).forEach((k) => { if (LEGACY[k]) obj[k] = tag(obj[k], LEGACY[k]); });
  return obj;
}

function tagTools(list) {
  list.forEach((t) => { if (TOOLS[t.id]) t.icon = tag(t.icon, TOOLS[t.id]); });
}

function start() {
  scan(document.body);
  new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach(scan))).observe(document.body, { childList: true, subtree: true });
}
if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

window.FD_ICONS = { svg, tag, tagLegacy, tagTools, scan, files: FILE, fallback: FB };

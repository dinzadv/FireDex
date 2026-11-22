import { FB, FILE } from './data.js';
const CDN = 'https://cdn.jsdelivr.net/npm/pixelarticons@2.4.1/svg/';
const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';

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

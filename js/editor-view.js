/* FireDex · Vista del editor: edición, historial, sugerencias, problemas, teclas móviles.
 * Requiere co.js (datos/árbol) + editor-core.js (lenguajes y diagnósticos). */
'use strict';
const HL_LIMIT = 400000;
let ta, hl, nums, marks, scrollEl, wrapEl, curLineEl, gutterEl, docEl, codeView, otherView;
let curNode = null, curMeta = null, lang = 'text';
let toks = [], toksFor = null, diags = [], lineStarts = [0], lastValue = '', lastLines = 0;
let lh = 22, cw = 8.4, padT = 10, padL = 12, gw = 48;
let hist = null, dirty = false, saveT = null, lintT = null, paintQ = false, acT = null, cursorQ = false;
const views = new Map();
const nav = { back: [], fwd: [] };
let snip = null, selectMode = false, selAnchor = 0, stickyCol = -1, problemsOpen = false;
let findOpen = false, matches = [], matchIdx = -1; const fOpts = { cs: false, re: false };
const ac = { items: [], idx: 0, res: null, open: false };
const isNarrow = () => window.matchMedia('(max-width: 860px)').matches;
const isTouch = () => window.matchMedia('(pointer: coarse)').matches || isNarrow();
const indentUnit = () => ' '.repeat(editorSettings.tabSize || 2);

/* ===================== DOM ===================== */
function ensureDom() {
  if (ta) return;
  const host = $('#editorEl');
  host.innerHTML =
    '<div class="ed-code" id="codeView" hidden><div class="ed-scroll" id="scrollEl"><div class="ed-doc" id="docEl">' +
    '<div class="ed-gutter" id="gutterEl"><pre class="ed-nums" id="numsEl"></pre><div class="ed-marks" id="marksEl"></div></div>' +
    '<div class="ed-wrap" id="wrapEl"><div class="ed-curline" id="curLine"></div><pre class="ed-hl" id="hlEl" aria-hidden="true"></pre>' +
    '<textarea id="codeArea" class="ed-ta" wrap="off" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" enterkeyhint="enter" aria-label="Editor de código"></textarea></div>' +
    '</div></div></div><div class="ed-other" id="otherView" hidden></div>';
  codeView = $('#codeView'); otherView = $('#otherView'); scrollEl = $('#scrollEl'); docEl = $('#docEl'); gutterEl = $('#gutterEl'); nums = $('#numsEl'); marks = $('#marksEl');
  wrapEl = $('#wrapEl'); curLineEl = $('#curLine'); hl = $('#hlEl'); ta = $('#codeArea');
  bindEditor(); buildTopbar(); buildKeys(); applySettings(true);
}

/* ===================== Medición / layout ===================== */
function measure() {
  if (!ta) return; const cs = getComputedStyle(ta); const c = document.createElement('canvas').getContext('2d'); c.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
  const w = c.measureText('M'.repeat(100)).width / 100; if (w > 3) cw = w; const l = parseFloat(cs.lineHeight); if (l > 8) lh = l;
  padT = parseFloat(cs.paddingTop) || 10; padL = parseFloat(cs.paddingLeft) || 12; updateGutterWidth();
}
function updateGutterWidth() { const digits = Math.max(2, String(lastLines || 1).length); gw = editorSettings.lineNumbers ? Math.ceil(digits * cw + 34) : 12; docEl && docEl.style.setProperty('--gw', gw + 'px'); }
function layoutEditor() {
  const app = $('#app'), vv = window.visualViewport; const h = vv ? vv.height : window.innerHeight;
  app.style.setProperty('--vvh', h + 'px'); app.style.top = (vv ? vv.offsetTop : 0) + 'px';
  const keys = $('#keysEl'), st = $('#statusEl'); app.style.setProperty('--dock-b', ((keys.hidden ? 0 : keys.offsetHeight) + st.offsetHeight) + 'px');
  if (ta) { measure(); positionAc(); }
}
function applySettings(first) {
  const app = $('#app'); app.style.setProperty('--fs', editorSettings.fontSize + 'px'); app.style.setProperty('--lh', Math.round(editorSettings.fontSize * 1.6) + 'px'); app.style.setProperty('--tab', editorSettings.tabSize);
  app.classList.toggle('no-nums', !editorSettings.lineNumbers);
  if (!first && ta) { measure(); paint(); runLint(); updateCursor(); }
}

/* ===================== Barra superior ===================== */
function buildTopbar() {
  const set = (id, ic) => { const e = $(id); if (e) e.innerHTML = ICONS[ic]; };
  set('#backBtn', 'back'); set('#fwdBtn', 'fwd'); set('#undoBtn', 'undo'); set('#redoBtn', 'redo'); set('#findBtn', 'find'); set('#saveBtn', 'save'); set('#moreBtn', 'more');
  set('#findPrev', 'up'); set('#findNext', 'down'); set('#findClose', 'close');
  $('#undoBtn').addEventListener('click', () => { undo(); ta && ta.focus({ preventScroll: true }); }); $('#redoBtn').addEventListener('click', () => { redo(); ta && ta.focus({ preventScroll: true }); });
  $('#backBtn').addEventListener('click', () => navGo(-1)); $('#fwdBtn').addEventListener('click', () => navGo(1));
  $('#findBtn').addEventListener('click', toggleFind); $('#saveBtn').addEventListener('click', () => { commit(true); });
  $('#moreBtn').addEventListener('click', (e) => { e.stopPropagation(); openMenu(e.currentTarget, moreItems()); });
  $('#findClose').addEventListener('click', closeFind); $('#findNext').addEventListener('click', () => findStep(1)); $('#findPrev').addEventListener('click', () => findStep(-1));
  $('#findInput').addEventListener('input', () => runFind(true)); $('#findInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); findStep(e.shiftKey ? -1 : 1); } else if (e.key === 'Escape') closeFind(); });
  $('#replaceOne').addEventListener('click', replaceOne); $('#replaceAll').addEventListener('click', replaceAll);
  $('#replaceInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); replaceOne(); } });
  const fr = $('#findBar .ed-find-row'); if (!$('#fCase')) { const b1 = document.createElement('button'); b1.id = 'fCase'; b1.className = 'ed-chip tog'; b1.textContent = 'Aa'; b1.title = 'Distinguir mayúsculas'; const b2 = document.createElement('button'); b2.id = 'fRe'; b2.className = 'ed-chip tog'; b2.textContent = '.*'; b2.title = 'Expresión regular'; fr.insertBefore(b2, $('#findCount')); fr.insertBefore(b1, b2);
    b1.onclick = () => { fOpts.cs = !fOpts.cs; b1.classList.toggle('on', fOpts.cs); runFind(true); }; b2.onclick = () => { fOpts.re = !fOpts.re; b2.classList.toggle('on', fOpts.re); runFind(true); }; }
}
function moreItems() {
  const items = [
    { label: 'Buscar y reemplazar', icon: ICONS.find, onClick: () => openFind() },
    { label: 'Ir a la línea…', icon: ICONS.line, onClick: gotoLinePrompt },
    { label: 'Formatear documento', icon: ICONS.wand, onClick: formatDocument },
    { label: 'Comentar / descomentar', icon: ICONS.edit, onClick: toggleComment },
    { sep: true },
    { label: 'Posición anterior', icon: ICONS.back, onClick: () => navGo(-1) },
    { label: 'Posición siguiente', icon: ICONS.fwd, onClick: () => navGo(1) }
  ];
  if (curMeta && curMeta.isModel) items.unshift({ label: 'Abrir en visor 3D', icon: ICONS.cube, onClick: openModelViewer });
  items.push({ sep: true }, { label: 'Descargar archivo', icon: ICONS.download, onClick: () => activeFileId && downloadFile(activeFileId) }, { label: 'Cerrar otras pestañas', icon: ICONS.close, onClick: () => { flushEditor(); openTabs = openTabs.filter((i) => i === activeFileId); saveTabs(); render(); } }, { label: 'Ajustes del editor', icon: ICONS.gear, onClick: showSettingsModal });
  return items;
}
function openModelViewer() { if (!curNode) return; flushEditor(); saveState().then(() => { location.href = '/model/?id=' + encodeURIComponent(state.id) + '&file=' + encodeURIComponent(curNode.id) + '&name=' + encodeURIComponent(state.name || ''); }); }

/* ===================== Pestañas / título / estado ===================== */
function renderChrome() {
  const tabs = $('#tabsEl'); if (!tabs) return;
  const nodes = openTabs.map((id) => findNode(id)).filter(Boolean); const counts = {}; nodes.forEach((n) => counts[n.name] = (counts[n.name] || 0) + 1);
  tabs.hidden = !nodes.length;
  tabs.innerHTML = nodes.map((n) => { const par = findParent(n.id); const dup = counts[n.name] > 1 && par && par.id !== 'root' ? '<small>' + escapeHtml(par.name) + '</small>' : ''; const act = n.id === activeFileId;
    return '<div class="ed-tab' + (act ? ' on' : '') + '" data-id="' + n.id + '" role="tab" aria-selected="' + act + '">' + fileIconHtml(n, 'sm') + '<span class="nm">' + escapeHtml(n.name) + dup + '</span>' + (act && dirty ? '<i class="dirty" title="Sin guardar"></i>' : '') + '<button class="x" data-x type="button" aria-label="Cerrar pestaña">' + ICONS.close + '</button></div>'; }).join('');
  const on = tabs.querySelector('.on'); if (on) { const l = on.offsetLeft, r = l + on.offsetWidth; if (l < tabs.scrollLeft) tabs.scrollLeft = l - 8; else if (r > tabs.scrollLeft + tabs.clientWidth) tabs.scrollLeft = r - tabs.clientWidth + 8; }
  const t = $('#titleEl'); const n = activeFileId ? findNode(activeFileId) : null;
  if (n) { const m = fileMeta(n); t.innerHTML = fileIconHtml(n) + '<div class="ed-title-txt"><b>' + escapeHtml(n.name) + '</b><small>' + escapeHtml(m.kind) + '</small></div>' + (m.isModel ? '<button class="ed-chip acc" id="modelChip">Ver 3D</button>' : ''); const mc = $('#modelChip'); if (mc) mc.onclick = openModelViewer; }
  else t.innerHTML = '<div class="ed-title-txt"><b>' + escapeHtml(state ? state.name : 'FireDex') + '</b><small>Sin archivo abierto</small></div>';
  const code = !!(curNode && ta && !codeView.hidden);
  ['#undoBtn', '#redoBtn', '#findBtn', '#saveBtn'].forEach((s) => { const b = $(s); if (b) b.disabled = !code; });
  updateUndoUi(); renderStatus();
}
function updateUndoUi() {
  const u = $('#undoBtn'), r = $('#redoBtn'); if (u && hist) { u.disabled = !(curNode && hist.idx > 0); r.disabled = !(curNode && hist.idx < hist.stack.length - 1); }
  const b = $('#backBtn'), f = $('#fwdBtn'); if (b) { b.disabled = !nav.back.length; f.disabled = !nav.fwd.length; }
  const s = $('#saveBtn'); if (s) s.classList.toggle('pending', !!dirty);
}
function counts() { const c = { error: 0, warn: 0, info: 0 }; diags.forEach((d) => { if (c[d.sev] != null) c[d.sev]++; }); return c; }
function renderStatus() {
  const st = $('#statusEl'); if (!st) return; const c = counts(); const code = !!(curNode && !codeView.hidden);
  if (!code) { st.innerHTML = '<span class="st-msg dim">FireDex · Editor</span>'; renderProblems(); return; }
  st.innerHTML = '<button class="st-probs' + (problemsOpen ? ' on' : '') + '" id="probBtn" type="button" aria-label="Problemas">' +
    '<span class="c-e' + (c.error ? ' has' : '') + '">' + ICONS.err + c.error + '</span><span class="c-w' + (c.warn ? ' has' : '') + '">' + ICONS.warnTri + c.warn + '</span><span class="c-i' + (c.info ? ' has' : '') + '">' + ICONS.infoC + c.info + '</span></button>' +
    '<button class="st-msg" id="stMsg" type="button"></button>' +
    '<span class="st-r"><span id="stPos">Ln 1, Col 1</span><span class="st-lang"><i style="background:' + EC.LANGS[lang].color + '"></i>' + escapeHtml(curMeta ? curMeta.kind : EC.LANGS[lang].name) + '</span><span id="stSave" class="st-save' + (dirty ? ' pend' : '') + '">' + (dirty ? 'Sin guardar' : 'Guardado') + '</span></span>';
  $('#probBtn').onclick = () => { problemsOpen = !problemsOpen; renderStatus(); renderProblems(); layoutEditor(); };
  $('#stMsg').onclick = (e) => { const d = diagAtCaret(); if (d) showDiagPopover(e.currentTarget, [d]); };
  updateCursor(); renderProblems();
}
function renderProblems() {
  const p = $('#problemsEl'); if (!p) return; const show = problemsOpen && curNode && !codeView.hidden; p.hidden = !show; if (!show) return;
  if (!diags.length) { p.innerHTML = '<div class="pr-empty">' + ICONS.check + ' Sin problemas en este archivo</div>'; return; }
  p.innerHTML = '<div class="pr-list">' + diags.slice(0, 120).map((d, i) => '<div class="pr-it sev-' + d.sev + '" data-i="' + i + '"><span class="pr-ic">' + (d.sev === 'error' ? ICONS.err : d.sev === 'warn' ? ICONS.warnTri : ICONS.infoC) + '</span><div class="pr-tx"><div>' + escapeHtml(d.msg) + '</div><small>Línea ' + lineIndexOf(d.from) + '</small></div>' + (d.fix ? '<button class="ed-chip acc" data-fix="' + i + '">' + escapeHtml(d.fix.label.length > 22 ? 'Corregir' : d.fix.label) + '</button>' : '') + '</div>').join('') + '</div>';
  p.onclick = (e) => { const fx = e.target.closest('[data-fix]'); if (fx) { e.stopPropagation(); applyFix(diags[+fx.dataset.fix]); return; } const it = e.target.closest('.pr-it'); if (it) { const d = diags[+it.dataset.i]; goTo(d.from, d.to); if (isNarrow()) { problemsOpen = false; renderStatus(); layoutEditor(); } } };
}

/* ===================== Cargar archivo en el editor ===================== */
function showOther(html) { codeView.hidden = true; otherView.hidden = false; otherView.innerHTML = html; }
function humanSize(n) { return n < 1024 ? n + ' B' : n < 1048576 ? (n / 1024).toFixed(1) + ' KB' : (n / 1048576).toFixed(1) + ' MB'; }
function renderEditor() {
  ensureDom(); closeAc(); closeDiagPopover(); saveView();
  const n = activeFileId ? findNode(activeFileId) : null;
  if (!n || n.type !== 'file') {
    curNode = null; hist = null;
    showOther('<div class="ed-empty">' + ICONS.emptyDoc + '<h3>Ningún archivo abierto</h3><p>Elige un archivo de la lista o crea uno nuevo.</p><div class="ed-empty-btns"><button class="ed-chip acc" id="emOpen">' + ICONS.menu + ' Ver archivos</button><button class="ed-chip" id="emNew">' + ICONS.filePlus + ' Nuevo archivo</button></div></div>');
    $('#emOpen').onclick = () => { isNarrow() ? openSide() : $('#app').classList.remove('side-hidden'); }; $('#emNew').onclick = () => newFilePrompt('root'); renderChrome(); return;
  }
  const m = fileMeta(n); curMeta = m;
  if (m.isImage) { curNode = null; hist = null; const has = n.content && n.content.startsWith('data:'); showOther('<div class="ed-img-view"><div class="ed-img-box">' + (has ? '<img src="' + n.content + '" alt="' + escapeHtml(n.name) + '">' : '<div class="ed-empty">' + ICONS.image + '<p>Imagen vacía</p></div>') + '</div><div class="ed-img-bar"><b>' + escapeHtml(n.name) + '</b><span>' + m.kind + (has ? ' · ' + humanSize(Math.round(n.content.length * 0.75)) : '') + '</span><button class="ed-chip acc" id="dlImg">' + ICONS.download + ' Descargar</button></div></div>'); $('#dlImg').onclick = () => downloadFile(n.id); const im = otherView.querySelector('img'); if (im) im.onload = () => { const s = otherView.querySelector('.ed-img-bar span'); if (s) s.textContent += ' · ' + im.naturalWidth + '×' + im.naturalHeight + ' px'; }; renderChrome(); return; }
  if (m.isBinary) { curNode = null; hist = null; showOther('<div class="ed-empty">' + fileIconHtml(n, 'xl') + '<h3>' + escapeHtml(n.name) + '</h3><p>Archivo binario (' + escapeHtml(m.kind) + ') · no se puede editar como texto.</p><div class="ed-empty-btns"><button class="ed-chip acc" id="dlBin">' + ICONS.download + ' Descargar</button></div></div>'); $('#dlBin').onclick = () => downloadFile(n.id); renderChrome(); return; }
  // código
  otherView.hidden = true; codeView.hidden = false; curNode = n; lang = m.lang || 'text'; closeSnip();
  ta.value = n.content || ''; lastValue = ta.value; diags = []; toks = []; toksFor = null; dirty = false; lastLines = 0;
  const v = views.get(n.id); if (v && v.hist && v.hist.stack[0] && v.hist.stack[v.hist.idx].v === ta.value) hist = v.hist; else hist = { stack: [{ v: ta.value, s: 0, e: 0 }], idx: 0, kind: null, t: 0 };
  measure(); paint(); runLint();
  requestAnimationFrame(() => { scrollEl.scrollTop = v ? v.st : 0; scrollEl.scrollLeft = v ? v.sl : 0; try { ta.setSelectionRange(v ? v.s : 0, v ? v.e : 0); } catch (e) { } updateCursor(); });
  renderChrome(); if (findOpen) runFind(); saveTabs();
}
function saveView() { if (curNode && ta) views.set(curNode.id, { st: scrollEl.scrollTop, sl: scrollEl.scrollLeft, s: ta.selectionStart, e: ta.selectionEnd, hist }); }
function openFile(id) {
  const n = findNode(id); if (!n || n.type !== 'file') return;
  if (id === activeFileId && curNode) { ta && ta.focus(); return; }
  navPush(); flushEditor(); saveView(); activeFileId = id; if (!openTabs.includes(id)) openTabs.push(id);
  render(); renderEditor(); if (!isTouch() && ta && curNode) ta.focus({ preventScroll: true });
}
function closeTab(id) {
  flushEditor(); const i = openTabs.indexOf(id); if (i < 0) return; openTabs.splice(i, 1); views.delete(id);
  if (activeFileId === id) { activeFileId = openTabs[Math.min(i, openTabs.length - 1)] || null; } saveTabs(); render(); renderEditor();
}

/* ===================== Pintado / diagnósticos ===================== */
function allDiags() { if (!matches.length) return diags; const f = matches.map((m, i) => ({ from: m[0], to: m[1], sev: i === matchIdx ? 'findc' : 'find' })); return diags.concat(f); }
function ensureToks() { const v = ta.value; if (toksFor !== v) { toks = v.length > HL_LIMIT ? [] : EC.tokenize(v, lang); toksFor = v; } }
function computeLineStarts(v) { const a = [0]; let i = -1; while ((i = v.indexOf('\n', i + 1)) >= 0) a.push(i + 1); return a; }
function lineIndexOf(pos) { let lo = 0, hi = lineStarts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= pos) lo = mid; else hi = mid - 1; } return lo + 1; }
function paint() {
  const v = ta.value; lineStarts = computeLineStarts(v); ensureToks();
  if (v.length > HL_LIMIT) hl.textContent = v + '\n'; else hl.innerHTML = EC.render(v, toks, allDiags());
  const n = lineStarts.length; if (n !== lastLines) { lastLines = n; let s = ''; for (let i = 1; i <= n; i++) s += i + '\n'; nums.textContent = s; updateGutterWidth(); }
  renderMarks();
}
function renderMarks() {
  const byLine = {}; diags.forEach((d) => { const l = lineIndexOf(d.from); const cur = byLine[l]; if (!cur || EC.SEV_RANK[d.sev] > EC.SEV_RANK[cur]) byLine[l] = d.sev; });
  marks.innerHTML = Object.keys(byLine).map((l) => { const s = byLine[l]; return '<button class="mk mk-' + s + '" style="top:' + (padT + (l - 1) * lh) + 'px" data-line="' + l + '" aria-label="Problema en la línea ' + l + '">' + (s === 'error' ? ICONS.err : s === 'warn' ? ICONS.warnTri : ICONS.infoC) + '</button>'; }).join('');
}
function scheduleRender() { if (paintQ) return; paintQ = true; requestAnimationFrame(() => { paintQ = false; if (ta) { paint(); updateCursor(); } }); }
function scheduleLint() { clearTimeout(lintT); lintT = setTimeout(runLint, 320); }
function runLint() {
  if (!ta || !curNode) return; ensureToks();
  try { diags = editorSettings.lint ? EC.lint(ta.value, lang, { acorn: window.acorn, toks, name: curNode.name }) : []; } catch (e) { diags = []; }
  paint(); renderStatus(); updateCursor();
}
function diffRange(a, b) { let p = 0; const m = Math.min(a.length, b.length); while (p < m && a.charCodeAt(p) === b.charCodeAt(p)) p++; let sa = a.length, sb = b.length; while (sa > p && sb > p && a.charCodeAt(sa - 1) === b.charCodeAt(sb - 1)) { sa--; sb--; } return { p, oldEnd: sa, delta: b.length - a.length }; }
function adjustForEdit() {
  const v = ta.value; if (v === lastValue) return; const r = diffRange(lastValue, v); lastValue = v;
  const sh = (x) => (x <= r.p ? x : (x >= r.oldEnd ? x + r.delta : r.p));
  diags = diags.filter((d) => !(d.from < r.oldEnd && d.to > r.p)).map((d) => Object.assign({}, d, { from: sh(d.from), to: sh(d.to), fix: null }));
  if (snip) { snip.stops = snip.stops.map((s) => ({ n: s.n, s: sh(s.s), e: sh(s.e) })); }
  if (matches.length) { matches = []; matchIdx = -1; }
}

/* ===================== Cambios y guardado ===================== */
function changed(kind) {
  adjustForEdit(); if (kind !== 'nohist') histPush(kind); markDirty(); scheduleRender(); scheduleLint(); updateUndoUi(); if (findOpen) scheduleFind();
}
function markDirty() { if (!dirty) { dirty = true; const t = $('#tabsEl .ed-tab.on'); if (t && !t.querySelector('.dirty')) t.querySelector('.nm').insertAdjacentHTML('afterend', '<i class="dirty" title="Sin guardar"></i>'); const s = $('#stSave'); if (s) { s.textContent = 'Sin guardar'; s.classList.add('pend'); } const b = $('#saveBtn'); b && b.classList.add('pending'); }
  clearTimeout(saveT); if (editorSettings.autoSave) saveT = setTimeout(() => commit(false), 700); }
async function commit(manual) {
  if (!curNode || !ta) return; clearTimeout(saveT); curNode.content = ta.value;
  try { await saveState(); } catch (e) { toast('No se pudo guardar: ' + (e && e.message || e)); return; }
  if (curNode && curNode.content === ta.value) { dirty = false; const t = $('#tabsEl .ed-tab .dirty'); t && t.remove(); const s = $('#stSave'); if (s) { s.textContent = 'Guardado'; s.classList.remove('pend'); } const b = $('#saveBtn'); b && b.classList.remove('pending'); }
  if (manual) toast('Guardado');
}
function flushEditor() { if (curNode && ta && !codeView.hidden && (dirty || curNode.content !== ta.value)) { curNode.content = ta.value; saveState(); dirty = false; } }
window.addEventListener('pagehide', flushEditor); document.addEventListener('visibilitychange', () => { if (document.hidden) flushEditor(); });

/* ===================== Historial ===================== */
function histPush(kind) {
  if (!hist) return; const cur = { v: ta.value, s: ta.selectionStart, e: ta.selectionEnd }; const now = Date.now();
  if (hist.idx < hist.stack.length - 1) hist.stack.length = hist.idx + 1;
  const top = hist.stack[hist.idx]; if (top.v === cur.v) { top.s = cur.s; top.e = cur.e; return; }
  if ((kind === 'type' || kind === 'del') && hist.kind === kind && now - hist.t < 900 && hist.idx > 0) hist.stack[hist.idx] = cur; else { hist.stack.push(cur); hist.idx++; }
  hist.kind = kind; hist.t = now; let size = 0; for (const s of hist.stack) size += s.v.length; while ((hist.stack.length > 300 || size > 24e6) && hist.idx > 1) { size -= hist.stack[0].v.length; hist.stack.shift(); hist.idx--; }
}
function restoreHist(e) { ta.value = e.v; try { ta.setSelectionRange(e.s, e.e); } catch (x) { } hist.kind = null; closeAc(); closeSnip(); changed('nohist'); updateCursor(); ensureCaretVisible(); }
function undo() { if (hist && hist.idx > 0) { hist.idx--; restoreHist(hist.stack[hist.idx]); } }
function redo() { if (hist && hist.idx < hist.stack.length - 1) { hist.idx++; restoreHist(hist.stack[hist.idx]); } }

/* ===================== Edición ===================== */
function replace(from, to, text, selS, selE) { ta.setRangeText(text, from, to, 'end'); if (selS != null) ta.setSelectionRange(selS, selE == null ? selS : selE); changed(text.length <= 2 && from === to ? 'type' : 'edit'); updateCursor(); ensureCaretVisible(); }
function setCaret(p, e) { ta.setSelectionRange(p, e == null ? p : e); updateCursor(); ensureCaretVisible(); }
const PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const pairingOn = () => editorSettings.autoClose && !['md', 'text', 'lang'].includes(lang);
function typeChar(ch) {
  if (!pairingOn()) return false; const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd, prev = v[s - 1], next = v[e]; const quote = ch === '"' || ch === "'" || ch === '`';
  if (quote && ((lang === 'json' || lang === 'mcfunction') && ch !== '"')) return false;
  if (PAIRS[ch]) {
    if (s !== e) { const sel = v.slice(s, e); replace(s, e, ch + sel + PAIRS[ch], s + 1, e + 1); return true; }
    if (quote) { if (next === ch) { setCaret(s + 1); return true; } if (/[\w$]/.test(prev || '') || /[\w$]/.test(next || '')) return false; }
    else if (next && /[\w$]/.test(next)) return false;
    replace(s, e, ch + PAIRS[ch], s + 1); return true;
  }
  if ((ch === ')' || ch === ']' || ch === '}') && s === e) {
    if (next === ch) { setCaret(s + 1); return true; }
    const ls = v.lastIndexOf('\n', s - 1) + 1, before = v.slice(ls, s), u = indentUnit();
    if (before.length && /^[ \t]+$/.test(before) && before.endsWith(u) && ch !== ')') { replace(s - u.length, s, ch, s - u.length + 1); return true; }
  }
  return false;
}
function handleEnter() {
  const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd; const ls = v.lastIndexOf('\n', s - 1) + 1; const line = v.slice(ls, s); const indent = /^[ \t]*/.exec(line)[0]; const prev = v[s - 1], next = v[e]; const u = indentUnit(); const OP = { '{': '}', '[': ']', '(': ')' };
  if (OP[prev] && next === OP[prev]) { replace(s, e, '\n' + indent + u + '\n' + indent, s + 1 + indent.length + u.length); return true; }
  if (lang === 'html' && prev === '>' && v.slice(e, e + 2) === '</') { replace(s, e, '\n' + indent + u + '\n' + indent, s + 1 + indent.length + u.length); return true; }
  let extra = ''; if (OP[prev] || (lang === 'py' && /:\s*$/.test(line)) || (lang === 'html' && /<(div|ul|ol|section|main|body|head|html|nav|header|footer|table|tr|form)[^>]*>$/i.test(line))) extra = u;
  if (!indent && !extra) return false; replace(s, e, '\n' + indent + extra, s + 1 + indent.length + extra.length); return true;
}
function handleBackspace() {
  const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd; if (s !== e || s === 0) return false; const prev = v[s - 1], next = v[s];
  if (pairingOn() && PAIRS[prev] && PAIRS[prev] === next) { replace(s - 1, s + 1, '', s - 1); return true; }
  const ls = v.lastIndexOf('\n', s - 1) + 1, before = v.slice(ls, s), u = indentUnit();
  if (before.length > 0 && /^ +$/.test(before) && u.length > 1) { const k = (before.length % u.length) || u.length; replace(s - k, s, '', s - k); return true; }
  return false;
}
function indentSel(outdent) {
  const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd, u = indentUnit();
  if (s === e && !outdent) { if (snipNext()) return; replace(s, e, u, s + u.length); return; }
  const ls = v.lastIndexOf('\n', s - 1) + 1; let le = v.indexOf('\n', e > s && v[e - 1] === '\n' ? e - 1 : e); if (le < 0) le = v.length;
  const block = v.slice(ls, le).split('\n'); const re = new RegExp('^(?:\\t| {1,' + u.length + '})'); const out = block.map((l) => (outdent ? l.replace(re, '') : (l.trim() ? u + l : l)));
  const text = out.join('\n'); const d0 = out[0].length - block[0].length; const total = text.length - (le - ls);
  ta.setRangeText(text, ls, le, 'preserve'); ta.setSelectionRange(Math.max(ls, s + d0), Math.max(ls, e + total)); changed('edit'); updateCursor();
}
function lineRangeOfSel() { const v = ta.value, s = ta.selectionStart, e = ta.selectionEnd; const ls = v.lastIndexOf('\n', s - 1) + 1; let le = v.indexOf('\n', e > s && v[e - 1] === '\n' ? e - 1 : e); if (le < 0) le = v.length; return [ls, le]; }
function toggleComment() {
  if (!curNode) return; const L = EC.LANGS[lang]; const v = ta.value; const [ls, le] = lineRangeOfSel(); const lines = v.slice(ls, le).split('\n');
  let pre = L.comment, post = ''; if (lang === 'css') { pre = '/*'; post = '*/'; } else if (lang === 'html' || lang === 'md') { pre = '<!--'; post = '-->'; } else if (!pre) { toast('Este tipo de archivo no admite comentarios'); return; }
  const body = lines.filter((l) => l.trim()); if (!body.length) return; const all = body.every((l) => l.trim().startsWith(pre));
  const minInd = Math.min.apply(null, body.map((l) => /^[ \t]*/.exec(l)[0].length));
  const out = lines.map((l) => { if (!l.trim()) return l; if (all) { let t = l.replace(pre + ' ', '').replace(pre, ''); if (post) t = t.replace(new RegExp('\\s?' + post.replace(/[*]/g, '\\*') + '\\s*$'), ''); return t; } return l.slice(0, minInd) + pre + ' ' + l.slice(minInd) + (post ? ' ' + post : ''); });
  const s = ta.selectionStart, e = ta.selectionEnd; const text = out.join('\n'); ta.setRangeText(text, ls, le, 'preserve'); ta.setSelectionRange(Math.max(ls, s + (out[0].length - lines[0].length)), e + text.length - (le - ls)); changed('edit'); updateCursor();
}
function moveLines(dir) {
  const v = ta.value; const [ls, le] = lineRangeOfSel(); if (dir < 0 && ls === 0) return; if (dir > 0 && le >= v.length) return;
  const block = v.slice(ls, le); let nv, off;
  if (dir < 0) { const ps = v.lastIndexOf('\n', ls - 2) + 1; const prevLine = v.slice(ps, ls - 1); nv = v.slice(0, ps) + block + '\n' + prevLine + v.slice(le); off = -(prevLine.length + 1); }
  else { const ne = v.indexOf('\n', le + 1); const end = ne < 0 ? v.length : ne; const nextLine = v.slice(le + 1, end); nv = v.slice(0, ls) + nextLine + '\n' + block + v.slice(end); off = nextLine.length + 1; }
  const s = ta.selectionStart, e = ta.selectionEnd; ta.value = nv; ta.setSelectionRange(s + off, e + off); changed('edit'); updateCursor(); ensureCaretVisible();
}
function duplicateLines() { const v = ta.value; const [ls, le] = lineRangeOfSel(); const block = v.slice(ls, le); const s = ta.selectionStart, e = ta.selectionEnd; ta.setRangeText('\n' + block, le, le, 'preserve'); ta.setSelectionRange(s + block.length + 1, e + block.length + 1); changed('edit'); updateCursor(); }
function formatDocument() {
  if (!curNode) return; const v = ta.value; let out = null;
  if (lang === 'json') { const r = EC.parseJSON(v); if (r.ok && r.ast && !r.diags.some((d) => d.sev === 'info')) { try { out = JSON.stringify(JSON.parse(v), null, indentUnit().length) + '\n'; } catch (e) { } } if (out == null && r.ok) out = EC.reindent(v, 'json', indentUnit()); if (!r.ok) { toast('Corrige los errores de JSON antes de formatear'); return; } }
  else if (['js', 'ts', 'css'].includes(lang)) out = EC.reindent(v, lang, indentUnit());
  else { toast('Formatear no está disponible para ' + EC.LANGS[lang].name); return; }
  if (out === v) { toast('El documento ya está formateado'); return; }
  const pos = Math.min(ta.selectionStart, out.length); ta.value = out; ta.setSelectionRange(pos, pos); changed('edit'); toast('Documento formateado', 'Deshacer', undo);
}
function gotoLinePrompt() { promptModal('Ir a la línea', '1 – ' + lineStarts.length, '', (v) => { const n = parseInt(v, 10); if (n >= 1) goToLine(Math.min(n, lineStarts.length)); }); }
function goToLine(n) { navPush(); const p = lineStarts[n - 1] || 0; goTo(p, p, true); }

/* ===================== Selección, cursor, scroll ===================== */
function colOf(pos) { const ls = ta.value.lastIndexOf('\n', pos - 1) + 1; const t = ta.value.slice(ls, pos); let col = 0; const tab = editorSettings.tabSize; for (const ch of t) col += ch === '\t' ? tab - (col % tab) : 1; return col; }
function caretXY(pos) { const line = lineIndexOf(pos) - 1; return { x: padL + colOf(pos) * cw, y: padT + line * lh, line: line + 1 }; }
function ensureCaretVisible(pos) {
  if (!scrollEl || codeView.hidden) return; const p = caretXY(pos == null ? ta.selectionStart : pos); const h = scrollEl.clientHeight, w = scrollEl.clientWidth; const m = lh * 1.2;
  if (p.y - m < scrollEl.scrollTop) scrollEl.scrollTop = Math.max(0, p.y - m); else if (p.y + lh + m > scrollEl.scrollTop + h) scrollEl.scrollTop = p.y + lh + m - h;
  const dx = gw + p.x; if (dx < scrollEl.scrollLeft + gw + 20) scrollEl.scrollLeft = Math.max(0, dx - gw - 20); else if (dx > scrollEl.scrollLeft + w - 30) scrollEl.scrollLeft = dx - w + 30;
}
function goTo(from, to, focus) { if (!ta || codeView.hidden) return; ta.focus({ preventScroll: true }); ta.setSelectionRange(from, Math.max(from, to == null ? from : to)); ensureCaretVisible(from); updateCursor(); }
function updateCursor() {
  if (!ta || codeView.hidden) return; const pos = ta.selectionStart; const li = lineIndexOf(pos); const col = colOf(pos) + 1;
  curLineEl.style.top = (padT + (li - 1) * lh) + 'px'; curLineEl.style.height = lh + 'px';
  const sp = $('#stPos'); if (sp) { const sel = ta.selectionEnd - ta.selectionStart; sp.textContent = 'Ln ' + li + ', Col ' + col + (sel ? ' (' + sel + ')' : ''); }
  const d = diagAtCaret(); const m = $('#stMsg'); if (m) { m.className = 'st-msg' + (d ? ' sev-' + d.sev : ''); m.innerHTML = d ? '<span class="st-ic">' + (d.sev === 'error' ? ICONS.err : d.sev === 'warn' ? ICONS.warnTri : ICONS.infoC) + '</span><span class="st-tx">' + escapeHtml(d.msg) + '</span>' : ''; }
}
function diagAtCaret() { if (!diags.length || !ta) return null; const p = ta.selectionStart; let best = null; for (const d of diags) { if (p >= d.from && p <= Math.max(d.to, d.from + 1)) { if (!best || EC.SEV_RANK[d.sev] > EC.SEV_RANK[best.sev]) best = d; } } if (best) return best; const li = lineIndexOf(p); for (const d of diags) { if (lineIndexOf(d.from) === li && (!best || EC.SEV_RANK[d.sev] > EC.SEV_RANK[best.sev])) best = d; } return best; }
function scheduleCursor() { if (cursorQ) return; cursorQ = true; requestAnimationFrame(() => { cursorQ = false; updateCursor(); }); }

/* ===================== Navegación (atrás / adelante) ===================== */
function navHere() { return { id: activeFileId, pos: ta && curNode ? ta.selectionStart : 0 }; }
function navPush() { const h = navHere(); if (!h.id) return; const t = nav.back[nav.back.length - 1]; if (t && t.id === h.id && Math.abs(t.pos - h.pos) < 3) return; nav.back.push(h); if (nav.back.length > 60) nav.back.shift(); nav.fwd = []; updateUndoUi(); }
function navGo(dir) {
  const from = dir < 0 ? nav.back : nav.fwd, to = dir < 0 ? nav.fwd : nav.back; if (!from.length) { toast(dir < 0 ? 'No hay posición anterior' : 'No hay posición siguiente'); return; }
  to.push(navHere()); const t = from.pop(); if (!findNode(t.id)) { updateUndoUi(); return navGo(dir); }
  if (t.id !== activeFileId) { flushEditor(); saveView(); activeFileId = t.id; if (!openTabs.includes(t.id)) openTabs.push(t.id); render(); renderEditor(); }
  requestAnimationFrame(() => goTo(Math.min(t.pos, ta.value.length))); updateUndoUi();
}

/* ===================== Popover de diagnósticos / correcciones ===================== */
function closeDiagPopover() { const p = $('#diagPop'); if (p) p.remove(); }
function showDiagPopover(anchor, list) {
  closeDiagPopover(); const el = document.createElement('div'); el.id = 'diagPop'; el.className = 'diag-pop';
  el.innerHTML = list.map((d, i) => '<div class="dp-it sev-' + d.sev + '"><span class="dp-ic">' + (d.sev === 'error' ? ICONS.err : d.sev === 'warn' ? ICONS.warnTri : ICONS.infoC) + '</span><div class="dp-tx">' + escapeHtml(d.msg) + (d.fix ? '<button class="ed-chip acc" data-fix="' + i + '">' + ICONS.wand + ' ' + escapeHtml(d.fix.label) + '</button>' : '') + '</div></div>').join('');
  document.body.appendChild(el); const r = anchor.getBoundingClientRect(); const w = el.offsetWidth, h = el.offsetHeight; let x = Math.min(window.innerWidth - w - 8, Math.max(8, r.left)); let y = r.bottom + 6; if (y + h > window.innerHeight - 8) y = Math.max(8, r.top - h - 6); el.style.left = x + 'px'; el.style.top = y + 'px';
  el.addEventListener('click', (e) => { const b = e.target.closest('[data-fix]'); if (b) { const d = list[+b.dataset.fix]; closeDiagPopover(); applyFix(d); } });
  setTimeout(() => document.addEventListener('pointerdown', function h(ev) { if (!el.contains(ev.target)) { closeDiagPopover(); document.removeEventListener('pointerdown', h); } }), 0);
}
function applyFix(d) {
  if (!d || !d.fix || !ta) return; const v = ta.value; const edits = d.fix.edits.slice().sort((a, b) => b.from - a.from); let nv = v; edits.forEach((e) => { nv = nv.slice(0, e.from) + e.text + nv.slice(e.to); });
  const first = d.fix.edits[0]; const caret = first.from + first.text.length; ta.value = nv; ta.setSelectionRange(caret, caret); changed('edit'); runLint(); toast('Corregido: ' + d.fix.label, 'Deshacer', undo); ensureCaretVisible();
}

/* ===================== Sugerencias (autocompletado) ===================== */
const KIND_INFO = { m: ['ƒ', 'k-m', 'método'], p: ['P', 'k-p', 'propiedad'], e: ['⚡', 'k-e', 'evento'], c: ['C', 'k-c', 'clase'], k: ['K', 'k-k', 'constante'], s: ['S', 'k-s', 'fragmento'], v: ['V', 'k-v', 'variable'], w: ['W', 'k-w', 'palabra clave'], f: ['/', 'k-f', 'comando'] };
function closeAc() { ac.open = false; ac.items = []; const e = $('#acEl'); if (e) e.hidden = true; }
function maybeSuggest(force) { clearTimeout(acT); if (!editorSettings.autocomplete && !force) return; acT = setTimeout(() => doSuggest(force), force ? 0 : 35); }
function doSuggest(force) {
  if (!ta || !curNode || ta.selectionStart !== ta.selectionEnd) { closeAc(); return; } const src = ta.value, caret = ta.selectionStart; if (src.length > HL_LIMIT) return; ensureToks();
  let res = null; try { res = EC.suggest(src, caret, lang, { toks }); } catch (e) { res = null; }
  if (!res || !res.items.length) { closeAc(); return; }
  if (!force && res.items.length === 1 && res.items[0].label === src.slice(res.from, res.to) && !res.items[0].snippet) { closeAc(); return; }
  ac.res = res; ac.items = res.items; ac.idx = 0; ac.open = true; renderAc(); positionAc();
}
function renderAc() {
  const el = $('#acEl'); const pre = ac.res ? ta.value.slice(ac.res.from, ac.res.to) : '';
  const hi = (s) => { const i = pre ? s.toLowerCase().indexOf(pre.toLowerCase()) : -1; return i < 0 ? escapeHtml(s) : escapeHtml(s.slice(0, i)) + '<b>' + escapeHtml(s.slice(i, i + pre.length)) + '</b>' + escapeHtml(s.slice(i + pre.length)); };
  el.innerHTML = '<div class="ac-list">' + ac.items.map((it, i) => { const k = KIND_INFO[it.kind] || KIND_INFO.v; return '<div class="ac-it' + (i === ac.idx ? ' on' : '') + '" data-i="' + i + '"><span class="ac-k ' + k[1] + '" title="' + k[2] + '">' + k[0] + '</span><span class="ac-l">' + hi(it.label) + '</span><span class="ac-d">' + escapeHtml(it.detail || '') + '</span></div>'; }).join('') + '</div><div class="ac-doc" id="acDoc"></div>';
  el.hidden = false; updateAcDoc(); const on = el.querySelector('.on'); on && on.scrollIntoView({ block: 'nearest' });
}
function updateAcDoc() { const d = $('#acDoc'); if (!d) return; const it = ac.items[ac.idx]; if (!it) { d.textContent = ''; return; } const k = KIND_INFO[it.kind] || KIND_INFO.v; d.innerHTML = '<span class="ac-kn">' + k[2] + '</span>' + (it.doc ? escapeHtml(it.doc) : '') + (it.autoImport ? ' <em>· se importará de ' + escapeHtml(it.autoImport.module) + '</em>' : ''); }
function positionAc() {
  const el = $('#acEl'); if (!el || el.hidden || !ac.open) return; const main = $('.ed-main'); const mr = main.getBoundingClientRect();
  if (isTouch()) { el.classList.add('dock'); el.style.left = el.style.top = ''; el.style.bottom = getComputedStyle($('#app')).getPropertyValue('--dock-b') || '0px'; return; }
  el.classList.remove('dock'); el.style.bottom = ''; const wr = wrapEl.getBoundingClientRect(); const p = caretXY(ac.res ? ac.res.from : ta.selectionStart);
  let x = wr.left + p.x - mr.left, y = wr.top + p.y + lh - mr.top + 2; const w = el.offsetWidth, h = el.offsetHeight; if (x + w > mr.width - 8) x = Math.max(8, mr.width - w - 8); if (y + h > mr.height - 8) y = Math.max(8, wr.top + p.y - mr.top - h - 2);
  el.style.left = x + 'px'; el.style.top = y + 'px';
}
function moveAc(d) { ac.idx = (ac.idx + d + ac.items.length) % ac.items.length; const el = $('#acEl'); el.querySelectorAll('.ac-it').forEach((e, i) => e.classList.toggle('on', i === ac.idx)); const on = el.querySelector('.on'); on && on.scrollIntoView({ block: 'nearest' }); updateAcDoc(); }
function applyAc(i) { const it = ac.items[i], r = ac.res; closeAc(); if (it && r) insertCompletion(it, r.from, r.to); }
function isDeclared(v, name) { return new RegExp('\\bimport\\b[^;]*\\b' + name + '\\b').test(v) || new RegExp('\\b(?:const|let|var|function|class)\\s+' + name + '\\b').test(v); }
function insertCompletion(it, from, to) {
  let v = ta.value; let text = it.insert; let stops = null; const ls = v.lastIndexOf('\n', from - 1) + 1; const indent = /^[ \t]*/.exec(v.slice(ls, from))[0];
  if (it.snippet) { const ex = EC.expandSnippet(text, it.full ? indent : ''); text = ex.text; stops = ex.stops.map((s) => ({ n: s.n, s: from + s.s, e: from + s.e })); }
  v = v.slice(0, from) + text + v.slice(to); let cs = stops && stops.length ? stops[0].s : from + text.length, ce = stops && stops.length ? stops[0].e : cs;
  if (it.autoImport && (lang === 'js' || lang === 'ts') && !isDeclared(v, it.autoImport.name)) {
    const ed = EC.addImportEdit(v, EC.tokenize(v, lang), it.autoImport.name, it.autoImport.module).edits[0]; const d = ed.text.length - (ed.to - ed.from);
    v = v.slice(0, ed.from) + ed.text + v.slice(ed.to); if (ed.from <= from) { cs += d; ce += d; if (stops) stops.forEach((s) => { s.s += d; s.e += d; }); }
  }
  ta.value = v; ta.setSelectionRange(cs, ce); snip = stops && stops.length > 1 ? { stops: stops.slice(1) } : null; changed('edit'); updateCursor(); ensureCaretVisible();
  if (it.kind === 'm' || it.kind === 'p' || it.kind === 'e') { /* permite encadenar: world.afterEvents. */ }
}
function snipNext() { if (!snip || !snip.stops.length) return false; const s = snip.stops.shift(); ta.setSelectionRange(s.s, s.e); if (!snip.stops.length) snip = null; updateCursor(); ensureCaretVisible(); return true; }
function closeSnip() { snip = null; }

/* ===================== Buscar / reemplazar ===================== */
function toggleFind() { findOpen ? closeFind() : openFind(); }
function openFind() { if (!curNode) return; findOpen = true; $('#findBar').hidden = false; const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd); const fi = $('#findInput'); if (sel && !sel.includes('\n')) fi.value = sel; fi.focus(); fi.select(); runFind(true); layoutEditor(); }
function closeFind() { findOpen = false; $('#findBar').hidden = true; matches = []; matchIdx = -1; if (ta) { paint(); ta.focus({ preventScroll: true }); } layoutEditor(); }
let findT = null; function scheduleFind() { clearTimeout(findT); findT = setTimeout(() => runFind(false), 250); }
function findRegex() { const q = $('#findInput').value; if (!q) return null; try { return new RegExp(fOpts.re ? q : q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g' + (fOpts.cs ? '' : 'i') + 'm'); } catch (e) { return false; } }
function runFind(jump) {
  if (!ta) return; const re = findRegex(); matches = []; matchIdx = -1; const cnt = $('#findCount');
  if (re === false) { cnt.textContent = 'regex ✕'; paint(); return; } if (!re) { cnt.textContent = '0/0'; paint(); return; }
  const v = ta.value; let m, guard = 0; while ((m = re.exec(v)) && guard++ < 3000) { if (m[0].length === 0) { re.lastIndex++; continue; } matches.push([m.index, m.index + m[0].length]); }
  if (matches.length) { const c = ta.selectionStart; matchIdx = matches.findIndex((x) => x[0] >= c); if (matchIdx < 0) matchIdx = 0; }
  cnt.textContent = matches.length ? (matchIdx + 1) + '/' + matches.length : '0/0'; paint(); if (jump && matches.length) revealMatch();
}
function revealMatch() { const m = matches[matchIdx]; if (!m) return; ta.setSelectionRange(m[0], m[1]); ensureCaretVisible(m[0]); $('#findCount').textContent = (matchIdx + 1) + '/' + matches.length; paint(); updateCursor(); }
function findStep(d) { if (!matches.length) { runFind(true); return; } matchIdx = (matchIdx + d + matches.length) % matches.length; revealMatch(); }
function replaceOne() { if (!matches.length) return; const m = matches[matchIdx]; const re = findRegex(); const rep = $('#replaceInput').value; let text = rep; if (re && fOpts.re) { const mm = new RegExp(re.source, re.flags.replace('g', '')).exec(ta.value.slice(m[0], m[1])); if (mm) text = ta.value.slice(m[0], m[1]).replace(new RegExp(re.source, re.flags.replace('g', '')), rep); } ta.setRangeText(text, m[0], m[1], 'end'); changed('edit'); runFind(true); }
function replaceAll() { const re = findRegex(); if (!re || !matches.length) return; const n = matches.length; const v = ta.value.replace(re, $('#replaceInput').value); ta.value = v; changed('edit'); runFind(false); toast(n + (n === 1 ? ' reemplazo' : ' reemplazos'), 'Deshacer', undo); }

/* ===================== Eventos del editor ===================== */
function bindEditor() {
  ta.addEventListener('beforeinput', (e) => {
    if (e.isComposing) return; const t = e.inputType;
    if (t === 'historyUndo') { e.preventDefault(); undo(); return; } if (t === 'historyRedo') { e.preventDefault(); redo(); return; }
    if (t === 'insertText' && e.data && e.data.length === 1) { if (typeChar(e.data)) { e.preventDefault(); maybeSuggest(); } }
    else if (t === 'insertLineBreak' || t === 'insertParagraph') { if (ac.open && !isTouch()) { e.preventDefault(); applyAc(ac.idx); return; } if (handleEnter()) e.preventDefault(); closeAc(); }
    else if (t === 'deleteContentBackward') { if (handleBackspace()) { e.preventDefault(); if (ac.open) maybeSuggest(); } }
  });
  ta.addEventListener('input', (e) => {
    const t = e.inputType || ''; const kind = /^delete/.test(t) ? 'del' : (t === 'insertText' || t === 'insertCompositionText') ? 'type' : 'edit'; changed(kind); ensureCaretVisible();
    if (t === 'insertText' || t === 'insertCompositionText' || (t === 'deleteContentBackward' && ac.open)) maybeSuggest(); else closeAc();
  });
  ta.addEventListener('keydown', onKeyDown);
  ta.addEventListener('keyup', (e) => { if (e.key.startsWith('Arrow') || e.key === 'Home' || e.key === 'End') { scheduleCursor(); if (hist) hist.kind = null; } });
  ta.addEventListener('pointerdown', () => { closeAc(); closeSnip(); if (hist) hist.kind = null; stickyCol = -1; });
  ta.addEventListener('pointerup', () => setTimeout(scheduleCursor, 0)); ta.addEventListener('focus', () => { showKeys(true); layoutEditor(); }); ta.addEventListener('blur', () => { setTimeout(() => { if (document.activeElement !== ta && !(document.activeElement && document.activeElement.closest('#keysEl'))) { showKeys(false); closeAc(); } }, 160); });
  document.addEventListener('selectionchange', () => { if (document.activeElement === ta) scheduleCursor(); });
  scrollEl.addEventListener('scroll', () => { if (ac.open && !isTouch()) positionAc(); closeDiagPopover(); }, { passive: true });
  marks.addEventListener('click', (e) => { const b = e.target.closest('.mk'); if (!b) return; const l = +b.dataset.line; showDiagPopover(b, diags.filter((d) => lineIndexOf(d.from) === l)); });
  $('#acEl').addEventListener('pointerdown', (e) => { e.preventDefault(); const it = e.target.closest('.ac-it'); if (it) applyAc(+it.dataset.i); });
  window.addEventListener('resize', layoutEditor); if (window.visualViewport) { window.visualViewport.addEventListener('resize', () => { layoutEditor(); setTimeout(() => ensureCaretVisible(), 60); }); window.visualViewport.addEventListener('scroll', layoutEditor); }
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (curNode) commit(true); } });
}
function onKeyDown(e) {
  const mod = e.ctrlKey || e.metaKey, k = e.key;
  if (ac.open) {
    if (k === 'ArrowDown') { e.preventDefault(); moveAc(1); return; } if (k === 'ArrowUp') { e.preventDefault(); moveAc(-1); return; }
    if (k === 'Enter' || k === 'Tab') { e.preventDefault(); applyAc(ac.idx); return; } if (k === 'Escape') { e.preventDefault(); closeAc(); return; }
  }
  if (mod && !e.altKey) {
    const lk = k.toLowerCase();
    if (lk === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; } if (lk === 'y') { e.preventDefault(); redo(); return; }
    if (lk === 'f') { e.preventDefault(); openFind(); return; } if (k === '/') { e.preventDefault(); toggleComment(); return; }
    if (k === ' ') { e.preventDefault(); doSuggest(true); return; } if (lk === 'd' && e.shiftKey) { e.preventDefault(); duplicateLines(); return; } if (lk === 'g') { e.preventDefault(); gotoLinePrompt(); return; }
    if (k === '[') { e.preventDefault(); indentSel(true); return; } if (k === ']') { e.preventDefault(); indentSel(false); return; }
  }
  if (e.altKey && (k === 'ArrowUp' || k === 'ArrowDown')) { e.preventDefault(); e.shiftKey ? duplicateLines() : moveLines(k === 'ArrowUp' ? -1 : 1); return; }
  if (k === 'Tab' && !mod) { e.preventDefault(); indentSel(e.shiftKey); return; }
  if (k === 'Escape') { if (findOpen) closeFind(); closeSnip(); }
}

/* ===================== Barra de teclas móvil ===================== */
const SYMS = ['{', '}', '(', ')', '[', ']', ';', ':', '"', "'", '`', '=', '=>', '.', ',', '<', '>', '+', '-', '*', '/', '\\', '|', '&', '!', '?', '_', '$', '#', '%', '@', '~', '^', '${}'];
function buildKeys() {
  const k = $('#keysEl'); const b = (id, ic, t, cls) => '<button type="button" class="kb ' + (cls || '') + '" data-k="' + id + '" aria-label="' + t + '" title="' + t + '">' + ic + '</button>';
  k.innerHTML = '<div class="kb-fixed">' + b('tab', '<span>⇥</span>', 'Tab') + b('left', ICONS.arrowL, 'Izquierda', 'rep') + b('right', ICONS.arrowR, 'Derecha', 'rep') + b('up', ICONS.arrowU, 'Arriba', 'rep') + b('down', ICONS.arrowD, 'Abajo', 'rep') + '</div>' +
    '<div class="kb-scroll">' + b('sel', 'SEL', 'Modo selección (las flechas seleccionan)', 'tog txt') + b('home', 'Inicio', 'Inicio de línea', 'txt') + b('end', 'Fin', 'Fin de línea', 'txt') + b('word', 'Aa', 'Sugerencias', 'txt') + SYMS.map((s) => '<button type="button" class="kb sym" data-s="' + escapeHtml(s) + '">' + escapeHtml(s) + '</button>').join('') + '</div>' + b('hide', ICONS.down, 'Ocultar teclado');
  let timer = null, rep = null;
  const stop = () => { clearTimeout(timer); clearInterval(rep); timer = rep = null; };
  const act = (btn) => { const id = btn.dataset.k; if (btn.dataset.s != null) return typeSym(btn.dataset.s); switch (id) { case 'tab': indentSel(false); break; case 'left': moveCaretBy(-1, 0); break; case 'right': moveCaretBy(1, 0); break; case 'up': moveCaretBy(0, -1); break; case 'down': moveCaretBy(0, 1); break; case 'home': lineEdge(false); break; case 'end': lineEdge(true); break; case 'sel': selectMode = !selectMode; btn.classList.toggle('on', selectMode); selAnchor = ta.selectionStart; break; case 'word': doSuggest(true); break; case 'hide': ta.blur(); break; } };
  k.addEventListener('pointerdown', (e) => { const btn = e.target.closest('.kb'); if (!btn) return; e.preventDefault(); act(btn); if (btn.classList.contains('rep')) { stop(); timer = setTimeout(() => { rep = setInterval(() => act(btn), 55); }, 380); } });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => k.addEventListener(ev, stop)); ['mousedown', 'touchstart'].forEach((ev) => k.addEventListener(ev, (e) => { if (e.target.closest('.kb')) e.preventDefault(); }, { passive: false }));
}
function showKeys(on) { const k = $('#keysEl'); if (!k) return; k.hidden = !(on && isTouch()); layoutEditor(); }
function typeSym(s) {
  if (!ta) return; ta.focus({ preventScroll: true }); const a = ta.selectionStart, e = ta.selectionEnd;
  if (s.length === 1) { if (!typeChar(s)) replace(a, e, s, a + 1); } else if (s === '${}') replace(a, e, '${}', a + 2); else replace(a, e, s, a + s.length); maybeSuggest();
}
function lineEdge(end) { const v = ta.value, p = selectMode ? (ta.selectionDirection === 'backward' ? ta.selectionStart : ta.selectionEnd) : ta.selectionStart; const ls = v.lastIndexOf('\n', p - 1) + 1; let le = v.indexOf('\n', p); if (le < 0) le = v.length; const t = end ? le : ls; if (selectMode) { const a = selAnchor; ta.setSelectionRange(Math.min(a, t), Math.max(a, t), t < a ? 'backward' : 'forward'); updateCursor(); ensureCaretVisible(t); } else setCaret(t); stickyCol = -1; }
function moveCaretBy(dx, dy) {
  const v = ta.value; const s = ta.selectionStart, e = ta.selectionEnd; let head = selectMode ? (ta.selectionDirection === 'backward' ? s : e) : (s !== e ? (dx < 0 || dy < 0 ? s : e) : s);
  if (!selectMode && s !== e && dy === 0) { setCaret(dx < 0 ? s : e); stickyCol = -1; return; }
  let t = head;
  if (dx) { t = Math.max(0, Math.min(v.length, head + dx)); stickyCol = -1; }
  else { const ls = v.lastIndexOf('\n', head - 1) + 1; if (stickyCol < 0) stickyCol = head - ls; if (dy < 0) { if (ls === 0) t = 0; else { const ps = v.lastIndexOf('\n', ls - 2) + 1; t = Math.min(ps + stickyCol, ls - 1); } } else { let le = v.indexOf('\n', head); if (le < 0) t = v.length; else { let ne = v.indexOf('\n', le + 1); if (ne < 0) ne = v.length; t = Math.min(le + 1 + stickyCol, ne); } } }
  if (selectMode) { const a = selAnchor; ta.setSelectionRange(Math.min(a, t), Math.max(a, t), t < a ? 'backward' : 'forward'); updateCursor(); ensureCaretVisible(t); } else setCaret(t);
}

/* ===================== Ajustes ===================== */
function showSettingsModal() {
  const tg = (id, label, desc, key) => '<div class="toggle-line"><div><span>' + label + '</span><small>' + desc + '</small></div><div class="pill-switch' + (editorSettings[key] ? ' on' : '') + '" id="' + id + '" data-key="' + key + '" role="switch" tabindex="0"></div></div>';
  showModal('<div class="modal set-modal"><h3>Ajustes del editor</h3><p>Se guardan en este dispositivo.</p>' +
    tg('tgAc', 'Sugerencias de código', 'API de Minecraft, JS/TS y fragmentos', 'autocomplete') + tg('tgPair', 'Cerrar paréntesis y comillas', 'Autocompleta (), [], {}, "" y ``', 'autoClose') + tg('tgLint', 'Advertencias y errores', 'Rojo = error, amarillo = posible problema', 'lint') + tg('tgNum', 'Números de línea', '', 'lineNumbers') + tg('tgSave', 'Guardado automático', 'Guarda 0,7 s después de escribir', 'autoSave') +
    '<div class="toggle-line"><div><span>Tamaño de letra</span></div><div class="stepper"><button type="button" id="fsMinus">−</button><b id="fsVal">' + editorSettings.fontSize + '</b><button type="button" id="fsPlus">+</button></div></div>' +
    '<div class="toggle-line"><div><span>Sangría</span></div><div class="seg"><button type="button" data-tab="2" class="' + (editorSettings.tabSize === 2 ? 'on' : '') + '">2</button><button type="button" data-tab="4" class="' + (editorSettings.tabSize === 4 ? 'on' : '') + '">4</button></div></div>' +
    '<div class="modal-actions"><button class="btn btn-primary" id="settingsClose">Listo</button></div></div>', (m) => {
    m.querySelectorAll('.pill-switch').forEach((p) => p.addEventListener('click', () => { const key = p.dataset.key; editorSettings[key] = !editorSettings[key]; p.classList.toggle('on', editorSettings[key]); saveEditorSettings(); applySettings(); if (key === 'lint') runLint(); }));
    const fs = (d) => { editorSettings.fontSize = Math.max(11, Math.min(22, editorSettings.fontSize + d)); $('#fsVal', m).textContent = editorSettings.fontSize; saveEditorSettings(); applySettings(); }; $('#fsMinus', m).onclick = () => fs(-1); $('#fsPlus', m).onclick = () => fs(1);
    m.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { editorSettings.tabSize = +b.dataset.tab; m.querySelectorAll('[data-tab]').forEach((x) => x.classList.toggle('on', x === b)); saveEditorSettings(); applySettings(); });
    $('#settingsClose', m).onclick = closeModal; });
}

/* ===================== Arranque ===================== */
document.addEventListener('click', (e) => { if (!e.target.closest('.diag-pop') && !e.target.closest('.mk') && !e.target.closest('#stMsg')) closeDiagPopover(); });
$('#tabsEl').addEventListener('click', (e) => { const t = e.target.closest('.ed-tab'); if (!t) return; if (e.target.closest('[data-x]')) { closeTab(t.dataset.id); return; } if (t.dataset.id !== activeFileId) openFile(t.dataset.id); });
$('#tabsEl').addEventListener('auxclick', (e) => { const t = e.target.closest('.ed-tab'); if (t && e.button === 1) closeTab(t.dataset.id); });
initApp().catch((err) => { console.error(err); const h = $('#editorEl'); if (h) h.innerHTML = '<div class="ed-empty"><h3>No se pudo iniciar el editor</h3><p>' + escapeHtml(String(err && err.message || err)) + '</p><button class="ed-chip acc" onclick="location.reload()">Reintentar</button></div>'; });

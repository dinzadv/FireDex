/* FireDex · Animaciones Bedrock (*.animation.json): línea de tiempo, claves y pose en vivo */
(function () {
'use strict';
const FD = window.FD; if (!FD) return;
const { S, $, $$, ic, toast, modal, esc, round, clamp, num, M } = FD;
const A = { node: null, root: { format_version: '1.8.0', animations: {} }, name: '', time: 0, playing: false, selKey: null, pps: 110, last: 0, raf: 0 };
FD.A = A;
const CH = [['position', 'Posición', [0, 0, 0], '#3b82f6'], ['rotation', 'Rotación', [0, 0, 0], '#ef4444'], ['scale', 'Escala', [1, 1, 1], '#fbbf24']];
const ROW = 24, RULER = 26;
const cur = () => (A.root.animations && A.root.animations[A.name]) || null;
const slug = () => (FD.geoName(FD.G()) || 'modelo').replace(/^geometry\./, '').replace(/[^a-z0-9_]/gi, '_').toLowerCase();

/* ---------- datos de claves ---------- */
function parseChan(v) {
  // devuelve [{t, v:[x,y,z]|null, raw}]
  if (v == null) return [];
  const asVec = (x) => (Array.isArray(x) && x.length === 3 && x.every((n) => typeof n === 'number')) ? x.slice() : (typeof x === 'number' ? [x, x, x] : null);
  if (Array.isArray(v) || typeof v === 'number') return [{ t: 0, v: asVec(v), raw: v }];
  if (typeof v !== 'object') return [];
  const out = [];
  Object.keys(v).forEach((k) => {
    const t = parseFloat(k); if (!isFinite(t)) return; const raw = v[k]; let vec = asVec(raw);
    if (!vec && raw && typeof raw === 'object' && !Array.isArray(raw)) vec = asVec(raw.post !== undefined ? raw.post : raw.pre);
    out.push({ t, v: vec, raw });
  });
  return out.sort((a, b) => a.t - b.t);
}
function fmtT(t) { const s = (+t.toFixed(4)).toString(); return s.indexOf('.') < 0 ? s + '.0' : s; }
function writeChan(anim, bone, ch, keys) {
  anim.bones = anim.bones || {}; const b = anim.bones[bone] = anim.bones[bone] || {};
  if (!keys.length) { delete b[ch]; if (!Object.keys(b).length) delete anim.bones[bone]; if (!Object.keys(anim.bones).length) delete anim.bones; return; }
  const o = {}; keys.sort((a, c) => a.t - c.t).forEach((k) => { let val; if (k.raw && typeof k.raw === 'object' && !Array.isArray(k.raw) && k.v) { val = Object.assign({}, k.raw); if (val.post !== undefined) val.post = k.v.slice(); else val.pre = k.v.slice(); } else val = k.v ? k.v.map((n) => round(n, 4)) : k.raw; o[fmtT(k.t)] = val; });
  b[ch] = o;
}
function getKeys(bone, ch) { const a = cur(); return a && a.bones && a.bones[bone] ? parseChan(a.bones[bone][ch]) : []; }
function evalChan(bone, ch, t) {
  const def = CH.find((c) => c[0] === ch)[2], ks = getKeys(bone, ch).filter((k) => k.v);
  if (!ks.length) return def.slice(); if (t <= ks[0].t) return ks[0].v.slice(); const L = ks[ks.length - 1]; if (t >= L.t) return L.v.slice();
  for (let i = 0; i < ks.length - 1; i++) { const a = ks[i], b = ks[i + 1]; if (t >= a.t && t <= b.t) { const f = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t); return a.v.map((x, k) => x + (b.v[k] - x) * f); } }
  return def.slice();
}
function hasData(bone) { const a = cur(); return !!(a && a.bones && a.bones[bone]); }
FD.pose = function (b) {
  if (S.mode !== 'anim' && !A.playing) return null; if (!cur() || !hasData(b.name)) return null;
  return { pos: evalChan(b.name, 'position', A.time), rot: evalChan(b.name, 'rotation', A.time), scale: evalChan(b.name, 'scale', A.time) };
};
function keyAt(bone, ch, t) { return getKeys(bone, ch).find((k) => Math.abs(k.t - t) < 0.001) || null; }
function setKey(bone, ch, vec, t) {
  const a = cur(); if (!a) return; t = t == null ? A.time : t; const ks = getKeys(bone, ch); const ex = ks.find((k) => Math.abs(k.t - t) < 0.001);
  if (ex) { ex.v = vec.slice(); } else ks.push({ t, v: vec.slice(), raw: null });
  writeChan(a, bone, ch, ks);
}
function delKey(bone, ch, t) { const a = cur(); if (!a) return; writeChan(a, bone, ch, getKeys(bone, ch).filter((k) => Math.abs(k.t - t) >= 0.001)); }
const animLen = () => { const a = cur(); return a ? Math.max(0.05, num(a.animation_length, 1) || 1) : 1; };

/* ---------- archivo ---------- */
function animFiles() { return S.project ? FD.allFiles(S.project.root).filter((f) => /\.json$/i.test(f.node.name)) : []; }
function looksAnim(txt) { try { const j = JSON.parse(txt.replace(/^﻿/, '')); return j && j.animations && typeof j.animations === 'object' && !Array.isArray(j.animations); } catch (e) { return false; } }
function autoFind() {
  if (!S.project) return null; const all = animFiles().filter((f) => /\.animation\.json$/i.test(f.node.name) || (/animations?\//i.test(f.path) && looksAnim(f.node.content || '')));
  if (!all.length) return null; const sl = slug(); const g = FD.geoName(FD.G()).replace(/^geometry\./, '');
  return (all.find((f) => f.node.content && f.node.content.indexOf('animation.' + g) >= 0) || all.find((f) => f.node.name.toLowerCase().indexOf(sl) >= 0) || all[0]).node;
}
function useNode(n) {
  A.node = n; try { const j = JSON.parse((n.content || '').replace(/^﻿/, '') || '{}'); if (!j.animations) j.animations = {}; if (!j.format_version) j.format_version = '1.8.0'; A.root = j; } catch (e) { toast('El archivo de animaciones tiene errores de JSON'); A.root = { format_version: '1.8.0', animations: {} }; }
  const ks = Object.keys(A.root.animations); A.name = ks[0] || ''; A.time = 0; A.selKey = null; refreshUI();
}
function findAnimFolder() {
  const root = S.project.root; let hit = null; (function walk(n) { for (const c of (n.children || [])) { if (c.type === 'folder') { if (c.name.toLowerCase() === 'animations' && !hit) hit = c; walk(c); } } })(root);
  if (hit) return hit; const f = { id: FD.uid(), type: 'folder', name: 'animations', open: true, children: [] }; const par = FD.findParent(S.node.id, root); // junto a 'models'
  let top = root; if (par && par !== root) { top = par; while (FD.findParent(top.id, root) && FD.findParent(top.id, root) !== root) top = FD.findParent(top.id, root); const gp = FD.findParent(top.id, root); top = gp || root; }
  top.children.push(f); return f;
}
function createFile() {
  if (!S.project) return toast('Abre un proyecto para crear archivos');
  const dir = findAnimFolder(); let name = slug() + '.animation.json', k = 1; while (dir.children.some((c) => c.name === name)) name = slug() + '_' + (k++) + '.animation.json';
  const n = { id: FD.uid(), type: 'file', name, content: JSON.stringify({ format_version: '1.8.0', animations: {} }, null, 2) }; dir.children.push(n); useNode(n); FD.markDirty(); toast('Archivo creado: ' + name); return n;
}
function chooseFile() {
  const files = animFiles(); const rows = files.map((f, i) => '<label class="hrow"><input type="radio" name="af" value="' + i + '"' + (A.node && A.node.id === f.node.id ? ' checked' : '') + '><span>' + esc(f.path) + '</span><small>' + (looksAnim(f.node.content || '') ? 'animaciones' : 'json') + '</small></label>').join('');
  modal('Archivo de animaciones', '<div class="sub">Elige dónde están (o estarán) las animaciones de este modelo. Normalmente <b>animations/nombre.animation.json</b> dentro del resource pack.</div>' + (rows || '<div class="empty">No hay archivos .json en el proyecto.</div>'),
    [{ label: 'Crear archivo nuevo', fn: () => { createFile(); } }, { label: 'Importar desde mi equipo…', fn: () => { $('#animFileIn').click(); } }, { label: 'Usar el elegido', cls: 'primary', fn: (api) => { const r = api.el.querySelector('input:checked'); if (!r) return false; useNode(files[+r.value].node); FD.markDirty(); } }, { label: 'Cancelar', fn: () => { } }]);
}
const fi = document.createElement('input'); fi.type = 'file'; fi.id = 'animFileIn'; fi.accept = '.json,application/json'; fi.hidden = true; document.body.appendChild(fi);
fi.onchange = async () => { const f = fi.files[0]; fi.value = ''; if (!f) return; try { const j = JSON.parse((await f.text()).replace(/^﻿/, '').replace(/\/\/.*$/gm, '')); if (!j.animations) throw 0; if (!A.node) createFile(); A.root = j; A.name = Object.keys(j.animations)[0] || ''; A.time = 0; FD.commit('Importar animaciones'); refreshUI(); toast('Animaciones importadas: ' + Object.keys(j.animations).length); } catch (e) { toast('Ese JSON no tiene animaciones'); } };

/* ---------- interfaz ---------- */
function refreshUI() {
  const sel = $('#animSel'); const ks = Object.keys(A.root.animations || {});
  sel.innerHTML = ks.length ? ks.map((k) => '<option value="' + esc(k) + '"' + (k === A.name ? ' selected' : '') + '>' + esc(k.replace(/^animation\./, '')) + '</option>').join('') : '<option value="">— sin animaciones —</option>';
  const a = cur(); $('#tLen').value = a ? round(animLen(), 3) : 1; $('#tLoop').value = a ? String(a.loop === undefined ? false : a.loop) : 'true'; $('#tTime').value = round(A.time, 3);
  const tf = $('#tFile'); tf.textContent = A.node ? A.node.name : 'Sin archivo (pulsa para elegir)'; tf.title = 'Archivo de animaciones: ' + (A.node ? A.node.name : 'ninguno') + ' — clic para cambiar'; tf.style.cursor = 'pointer';
  $('#tPlay').innerHTML = ic(A.playing ? 'pause' : 'play'); FD.hydrateIcons($('#tl')); layout(); if (S.mode === 'anim') FD.refreshProps();
}
function rowsList() {
  const a = cur(); if (!a) return []; const rows = []; const names = Object.keys(a.bones || {}); const selB = S.sel ? S.sel.bone.name : null;
  if (selB && names.indexOf(selB) < 0) names.push(selB);
  names.forEach((n) => { rows.push({ type: 'bone', bone: n }); if (n === selB) CH.forEach((c) => rows.push({ type: 'ch', bone: n, ch: c[0], label: c[1], color: c[3] })); });
  return rows;
}
let rows = [];
function layout() {
  const track = $('#tlTrack'), cv = $('#tlCv'); if (!cv || S.mode !== 'anim') return; rows = rowsList(); const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(track.clientWidth, Math.ceil(16 + (animLen() + 0.4) * A.pps)), h = Math.max(track.clientHeight, RULER + rows.length * ROW + 6);
  cv.style.width = w + 'px'; cv.style.height = h + 'px'; if (cv.width !== w * dpr || cv.height !== h * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
  $('#tlNames').innerHTML = rows.map((r, i) => '<div class="tn' + (r.type === 'ch' ? ' ch' : '') + ((S.sel && S.sel.bone.name === r.bone) ? ' sel' : '') + '" data-i="' + i + '" title="' + esc(r.bone) + '">' + (r.type === 'ch' ? '<span style="width:8px;height:8px;border-radius:2px;background:' + r.color + '"></span>' + r.label : ic('bone') + esc(r.bone)) + '</div>').join('') || '<div class="tn">Sin claves aún</div>'; FD.hydrateIcons($('#tlNames'));
  paintTL();
}
const X = (t) => 8 + t * A.pps, TX = (x) => (x - 8) / A.pps;
function paintTL() {
  const cv = $('#tlCv'); if (!cv || S.mode !== 'anim') return; const c = cv.getContext('2d'), dpr = cv.width / parseFloat(cv.style.width || cv.width), W = parseFloat(cv.style.width), H = parseFloat(cv.style.height);
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H); const css = getComputedStyle(document.documentElement); const line = '#2c2e40', mut = '#8b8ea6';
  c.fillStyle = '#16171f'; c.fillRect(0, 0, W, RULER); const len = animLen();
  c.fillStyle = '#1f2030'; c.fillRect(X(len), RULER, W - X(len), H - RULER);
  const step = A.pps > 200 ? 0.1 : A.pps > 80 ? 0.25 : 0.5; c.font = '10px system-ui'; c.textBaseline = 'middle';
  for (let t = 0; t <= len + 0.4; t += step) { const x = X(t), major = Math.abs(t - Math.round(t)) < 1e-6; c.strokeStyle = major ? '#3a3c52' : '#262839'; c.beginPath(); c.moveTo(x, major ? 6 : 14); c.lineTo(x, H); c.stroke(); if (major || A.pps > 140) { c.fillStyle = mut; c.fillText(round(t, 2) + 's', x + 3, 10); } }
  rows.forEach((r, i) => { const y = RULER + i * ROW; c.strokeStyle = line; c.beginPath(); c.moveTo(0, y + ROW); c.lineTo(W, y + ROW); c.stroke(); if (S.sel && S.sel.bone.name === r.bone && r.type === 'bone') { c.fillStyle = '#8577f81a'; c.fillRect(0, y, W, ROW); }
    const chs = r.type === 'ch' ? [CH.find((q) => q[0] === r.ch)] : CH;
    chs.forEach((q) => getKeys(r.bone, q[0]).forEach((k) => { const sel = A.selKey && A.selKey.bone === r.bone && A.selKey.ch === q[0] && Math.abs(A.selKey.t - k.t) < 0.001; diamond(c, X(k.t), y + ROW / 2, r.type === 'ch' ? 6 : 5, r.type === 'ch' ? q[3] : q[3] + 'cc', sel, !k.v); })); });
  c.strokeStyle = '#8577f8'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(A.time), 0); c.lineTo(X(A.time), H); c.stroke(); c.lineWidth = 1; c.fillStyle = '#8577f8'; c.beginPath(); c.moveTo(X(A.time) - 6, 0); c.lineTo(X(A.time) + 6, 0); c.lineTo(X(A.time), 10); c.fill();
}
function diamond(c, x, y, r, col, sel, mol) { c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); c.fillStyle = col; c.fill(); c.lineWidth = sel ? 2 : 1; c.strokeStyle = sel ? '#fff' : (mol ? '#fbbf24' : '#0008'); c.stroke(); c.lineWidth = 1; }
function setTime(t, noSeek) { A.time = clamp(round(t, 3), 0, animLen()); $('#tTime').value = A.time; FD.rebuild(); FD.requestDraw(); paintTL(); if (S.mode === 'anim' && !A.playing) FD.refreshProps(); }

/* ---------- interacción de la línea de tiempo ---------- */
const trk = $('#tlTrack'); let tdrag = null;
function trackXY(e) { const cv = $('#tlCv').getBoundingClientRect(); return [e.clientX - cv.left, e.clientY - cv.top]; }
function hitKey(x, y) {
  const i = Math.floor((y - RULER) / ROW); const r = rows[i]; if (!r) return null; const chs = r.type === 'ch' ? [CH.find((q) => q[0] === r.ch)] : CH;
  for (const q of chs) for (const k of getKeys(r.bone, q[0])) if (Math.abs(X(k.t) - x) < 8) return { bone: r.bone, ch: q[0], t: k.t, row: r };
  return null;
}
trk.addEventListener('pointerdown', (e) => {
  const [x, y] = trackXY(e); trk.setPointerCapture(e.pointerId);
  if (y < RULER) { tdrag = { type: 'scrub' }; setTime(TX(x)); return; }
  const k = hitKey(x, y); const i = Math.floor((y - RULER) / ROW), r = rows[i];
  if (r) { const b = FD.boneByName(r.bone); if (b && (!S.sel || S.sel.bone !== b)) FD.select(b, null); }
  if (k) { A.selKey = { bone: k.bone, ch: k.ch, t: k.t }; tdrag = { type: 'key', k: Object.assign({}, k), moved: false }; setTime(k.t); paintTL(); return; }
  A.selKey = null; tdrag = { type: 'scrub' }; setTime(TX(x));
});
trk.addEventListener('pointermove', (e) => {
  if (!tdrag) return; const [x] = trackXY(e);
  if (tdrag.type === 'scrub') setTime(Math.round(TX(x) / 0.05) * 0.05);
  else if (tdrag.type === 'key') { const nt = clamp(Math.round(TX(x) / 0.05) * 0.05, 0, animLen()); if (Math.abs(nt - A.selKey.t) < 0.001) return; const ks = getKeys(tdrag.k.bone, tdrag.k.ch); const kk = ks.find((q) => Math.abs(q.t - A.selKey.t) < 0.001); if (!kk || ks.some((q) => q !== kk && Math.abs(q.t - nt) < 0.001)) return; kk.t = nt; writeChan(cur(), tdrag.k.bone, tdrag.k.ch, ks); A.selKey.t = nt; tdrag.moved = true; A.time = nt; $('#tTime').value = round(nt, 3); FD.rebuild(); FD.requestDraw(); paintTL(); }
});
function tup() { if (tdrag && tdrag.moved) { FD.pushHist('Mover clave'); FD.markDirty(); FD.refreshProps(); } tdrag = null; }
trk.addEventListener('pointerup', tup); trk.addEventListener('pointercancel', tup);
trk.addEventListener('wheel', (e) => { if (e.ctrlKey || e.shiftKey) { e.preventDefault(); A.pps = clamp(A.pps * (e.deltaY < 0 ? 1.15 : 0.87), 30, 480); layout(); } }, { passive: false });
trk.addEventListener('scroll', () => { $('#tlNames').scrollTop = trk.scrollTop; });
$('#tlNames').addEventListener('click', (e) => { const r = e.target.closest('.tn'); if (!r || r.dataset.i == null) return; const row = rows[+r.dataset.i]; const b = FD.boneByName(row.bone); if (b) FD.select(b, null); });
new ResizeObserver(() => layout()).observe(trk);

/* ---------- barra ---------- */
$('#animSel').onchange = (e) => { A.name = e.target.value; A.time = 0; A.selKey = null; refreshUI(); FD.rebuild(); FD.requestDraw(); };
$('#animNew').onclick = () => {
  if (!A.node) { if (!S.project) return toast('Abre un proyecto para crear animaciones'); createFile(); }
  const nm = (prompt('Nombre de la animación (ej. idle, walk, attack)', 'idle') || '').trim().replace(/[^a-z0-9_.]/gi, '_').toLowerCase(); if (!nm) return;
  const id = nm.indexOf('animation.') === 0 ? nm : 'animation.' + slug() + '.' + nm; if (A.root.animations[id]) return toast('Ya existe esa animación');
  A.root.animations[id] = { loop: true, animation_length: 1, bones: {} }; A.name = id; A.time = 0; FD.commit('Nueva animación'); refreshUI();
};
$('#animDel').onclick = () => { if (!cur()) return; if (!confirm('¿Eliminar la animación «' + A.name + '»? Puedes deshacerlo con el historial.')) return; delete A.root.animations[A.name]; A.name = Object.keys(A.root.animations)[0] || ''; FD.commit('Eliminar animación'); refreshUI(); };
(function extraBtns() {
  const mk = (id, icon, title, fn) => { const b = document.createElement('button'); b.className = 'ib sm'; b.id = id; b.title = title; b.innerHTML = ic(icon); b.onclick = fn; $('#animDel').after(b); };
  mk('animDup', 'copy', 'Duplicar animación', () => { if (!cur()) return; const id = A.name + '_copia'; A.root.animations[id] = JSON.parse(JSON.stringify(cur())); A.name = id; FD.commit('Duplicar animación'); refreshUI(); });
  mk('animRen', 'pencil', 'Renombrar animación', () => { if (!cur()) return; const nn = (prompt('Nuevo identificador', A.name) || '').trim(); if (!nn || nn === A.name || A.root.animations[nn]) return; const out = {}; Object.keys(A.root.animations).forEach((k) => { out[k === A.name ? nn : k] = A.root.animations[k]; }); A.root.animations = out; A.name = nn; FD.commit('Renombrar animación'); refreshUI(); });
})();
$('#tFile').onclick = chooseFile;
$('#tTime').onchange = (e) => setTime(+e.target.value || 0);
$('#tLen').onchange = (e) => { const a = cur(); if (!a) return; a.animation_length = Math.max(0.05, +e.target.value || 1); FD.commit('Duración'); layout(); };
$('#tLoop').onchange = (e) => { const a = cur(); if (!a) return; const v = e.target.value; a.loop = v === 'true' ? true : v === 'false' ? false : 'hold_on_last_frame'; FD.commit('Repetición'); };
function play(on) {
  if (on === undefined) on = !A.playing; if (on && !cur()) { toast('Crea o elige una animación primero'); return; }
  A.playing = on; $('#tPlay').innerHTML = ic(on ? 'pause' : 'play'); FD.hydrateIcons($('#tPlay')); cancelAnimationFrame(A.raf);
  if (on) { A.last = performance.now(); if (A.time >= animLen() - 1e-3) A.time = 0; const loop = (now) => { if (!A.playing) return; const dt = (now - A.last) / 1000; A.last = now; const L = animLen(), a = cur(); A.time += dt; if (A.time >= L) { if (a.loop === true) A.time = A.time % L; else { A.time = a.loop === 'hold_on_last_frame' ? L : 0; A.playing = false; $('#tPlay').innerHTML = ic('play'); FD.hydrateIcons($('#tPlay')); } } $('#tTime').value = round(A.time, 2); FD.rebuild(); FD.requestDraw(); paintTL(); A.raf = requestAnimationFrame(loop); }; A.raf = requestAnimationFrame(loop); }
  else { FD.rebuild(); FD.requestDraw(); }
}
$('#tPlay').onclick = () => play(); $('#tStop').onclick = () => { play(false); setTime(0); };

/* ---------- claves y pose ---------- */
function curBone() { return S.sel ? S.sel.bone : null; }
function chanForTool() { return S.tool === 'move' ? 'position' : S.tool === 'scale' ? 'scale' : 'rotation'; }
function addKey(ch) {
  const b = curBone(); if (!b) return toast('Elige un hueso'); if (!cur()) return toast('Crea o elige una animación');
  ch = ch || chanForTool(); setKey(b.name, ch, evalChan(b.name, ch, A.time)); A.selKey = { bone: b.name, ch, t: A.time }; FD.commit('Clave de ' + ch); layout();
}
$('#keyAdd').onclick = () => addKey();
$('#keyReset').onclick = () => { const b = curBone(); if (!b || !cur()) return; CH.forEach((c) => delKey(b.name, c[0], A.time)); A.selKey = null; FD.commit('Quitar claves'); layout(); };
FD.animDrag = function (tool, i, proj, ppu) {
  const b = curBone(); if (!b || !cur()) { toast('Crea o elige una animación para animar'); return; }
  if (tool === 'select') return; const ch = tool === 'move' ? 'position' : tool === 'scale' ? 'scale' : 'rotation'; const v = evalChan(b.name, ch, A.time);
  v[i] = round(v[i] + (ch === 'rotation' ? proj * 0.7 : ch === 'scale' ? proj / ppu * 0.08 : proj / ppu), 3); setKey(b.name, ch, v); A.selKey = { bone: b.name, ch, t: A.time };
  FD.rebuild(); FD.refreshProps(); FD.requestDraw(); layout();
};
FD.animProps = function (box, title) {
  const b = curBone(); title.textContent = 'Pose · ' + (b ? b.name : '');
  if (!cur()) { box.innerHTML = '<div class="empty">Aún no hay animaciones.<br><br><button class="btn primary" id="apNew">Crear animación</button></div>'; $('#apNew').onclick = () => $('#animNew').click(); return; }
  let h = '<div class="sub">Animación <b>' + esc(A.name.replace(/^animation\./, '')) + '</b> · tiempo <b>' + round(A.time, 2) + ' s</b>. Al cambiar un valor se crea o actualiza una clave en este instante.</div>';
  CH.forEach((c) => {
    const k = keyAt(b.name, c[0], A.time), v = evalChan(b.name, c[0], A.time), mol = k && !k.v;
    h += '<div class="grp"><h4 style="display:flex;align-items:center;gap:6px"><span style="width:9px;height:9px;border-radius:2px;background:' + c[3] + '"></span>' + c[1] + '<span class="grow"></span><button class="btn ' + (k ? 'primary' : '') + '" data-key="' + c[0] + '" style="padding:3px 8px;font-size:11px">' + (k ? 'Quitar clave' : '+ Clave') + '</button></h4>' + (mol ? '<div class="sub warnc">Esta clave usa Molang; edítala en el JSON.</div>' : '') +
      '<div class="f3" data-ch="' + c[0] + '">' + ['x', 'y', 'z'].map((l, i) => '<label class="fld"><span class="' + l + '">' + l.toUpperCase() + '</span><input type="number" step="any" inputmode="decimal" data-k="' + i + '" value="' + round(v[i], 3) + '"' + (mol ? ' disabled' : '') + '></label>').join('') + '</div></div>';
  });
  h += '<div class="btnrow"><button class="btn" id="apPrev">◀ Clave anterior</button><button class="btn" id="apNext">Clave siguiente ▶</button></div>';
  box.innerHTML = h;
  $$('[data-ch]', box).forEach((g) => { $$('input', g).forEach((inp) => { inp.onchange = () => { const ch = g.dataset.ch, v = evalChan(b.name, ch, A.time); v[+inp.dataset.k] = +inp.value || 0; setKey(b.name, ch, v); A.selKey = { bone: b.name, ch, t: A.time }; FD.commit('Editar pose'); layout(); }; }); });
  $$('[data-key]', box).forEach((btn) => { btn.onclick = () => { const ch = btn.dataset.key; if (keyAt(b.name, ch, A.time)) { delKey(b.name, ch, A.time); FD.commit('Quitar clave'); } else addKey(ch); layout(); }; });
  const jump = (dir) => { const ts = []; CH.forEach((c) => getKeys(b.name, c[0]).forEach((k) => ts.push(k.t))); ts.sort((a, c) => a - c); const t = dir > 0 ? ts.find((x) => x > A.time + 1e-3) : ts.reverse().find((x) => x < A.time - 1e-3); if (t != null) setTime(t); };
  $('#apPrev').onclick = () => jump(-1); $('#apNext').onclick = () => jump(1);
};
document.addEventListener('keydown', (e) => {
  if (S.mode !== 'anim') return; const tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
  if (e.key === ' ') { e.preventDefault(); play(); } else if (e.key.toLowerCase() === 'k' && !e.ctrlKey) { addKey(); }
  else if ((e.key === 'Delete' || e.key === 'Backspace') && A.selKey) { e.preventDefault(); delKey(A.selKey.bone, A.selKey.ch, A.selKey.t); A.selKey = null; FD.commit('Quitar clave'); layout(); }
  else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); setTime(A.time + (e.key === 'ArrowRight' ? 0.05 : -0.05)); }
});

/* ---------- ganchos con el núcleo ---------- */
FD.hooks.snap.push((h) => { h.x.anim = JSON.stringify(A.root); h.x.aname = A.name; h.x.afile = A.node ? A.node.id : null; });
FD.hooks.restore.push((h) => { if (h.x.anim) { A.root = JSON.parse(h.x.anim); A.name = h.x.aname; if (!A.root.animations[A.name]) A.name = Object.keys(A.root.animations)[0] || ''; refreshUI(); } });
FD.hooks.save.push((d, draft) => {
  if (draft) { d.x.anim = JSON.stringify(A.root); d.x.aname = A.name; return; }
  if (!A.node && S.project && Object.keys(A.root.animations || {}).length) createFile();
  if (A.node) A.node.content = JSON.stringify(A.root, null, 2);
});
FD.hooks.init.push(() => {
  let n = FD.pendingAnimNode || autoFind(); if (n) useNode(n); else refreshUI();
  if (FD.draftData && FD.draftData.x && FD.draftData.x.anim) { try { A.root = JSON.parse(FD.draftData.x.anim); A.name = FD.draftData.x.aname || Object.keys(A.root.animations)[0] || ''; refreshUI(); } catch (e) { /* nada */ } }
});
FD.hooks.refresh.push((w) => { if (w === 'mode') { if (S.mode !== 'anim') play(false); FD.rebuild(); layout(); } else if (w === 'all' && S.mode === 'anim') layout(); });
FD.renameBone = (o, nn) => { Object.keys(A.root.animations || {}).forEach((k) => { const a = A.root.animations[k]; if (a.bones && a.bones[o]) { a.bones[nn] = a.bones[o]; delete a.bones[o]; } }); layout(); };
FD.hooks.draw.push(() => { });
const prevSelect = FD.select; // el esquema redibuja la línea al cambiar la selección
const _ra = FD.refreshAll; FD.afterSelect = () => { if (S.mode === 'anim') layout(); };
})();

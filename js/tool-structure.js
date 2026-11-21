/* ============================================================
   Structures — simulated-Minecraft voxel editor that exports a real
   Bedrock .mcstructure (little-endian NBT) into the addon's BP.
   ============================================================ */
(function () {
  'use strict';
  const U = window.FD_UTIL, V = window.FD_VERSIONS || { server: '2.0.0' }, VAN = window.FD_VANILLA;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const T = (s) => (window.FD_I18N ? FD_I18N.t(s) : s);

  if (window.FD_I18N) FD_I18N.add([
    ['Structures', 'Estructuras'], ['Build a structure block by block and add it to your addon as a .mcstructure file.', 'Construye una estructura bloque a bloque y añádela a tu addon como archivo .mcstructure.'],
    ['Name', 'Nombre'], ['Size', 'Tamaño'], ['Resize', 'Redimensionar'], ['Layer', 'Capa'], ['Pencil', 'Lápiz'], ['Eraser', 'Borrador'], ['Fill', 'Rellenar'], ['Rectangle', 'Rectángulo'],
    ['Picker', 'Selector'], ['Mirror X', 'Espejo X'], ['Mirror Z', 'Espejo Z'], ['Undo', 'Deshacer'], ['Redo', 'Rehacer'], ['Clear layer', 'Limpiar capa'], ['Rotate view', 'Girar vista'],
    ['Blocks', 'Bloques'], ['Search blocks…', 'Buscar bloques…'], ['Custom block id', 'ID de bloque personalizado'], ['Add', 'Añadir'], ['Hotbar', 'Barra rápida'],
    ['Save to folder', 'Guardar en carpeta'], ['Also generate script (/scriptevent fd:structure)', 'Generar también script (/scriptevent fd:structure)'], ['Create structure', 'Crear estructura'],
    ['Preview', 'Vista previa'], ['Done ✔', 'Listo ✔'], ['Files', 'Archivos'], ['Place it in the world', 'Colócala en el mundo'], ['Add more', 'Añadir más'], ['Close', 'Cerrar'], ['Copy', 'Copiar'], ['Copied', 'Copiado'],
    ['Build something first (the structure is empty).', 'Construye algo primero (la estructura está vacía).'], ['Invalid structure name.', 'Nombre de estructura no válido.'],
    ['Structure saved: {0}', 'Estructura guardada: {0}'], ['Layer {0} / {1}', 'Capa {0} / {1}'], ['{0} blocks', '{0} bloques'],
    ['Block states are optional: minecraft:oak_stairs["weirdo_direction"=1]. Both the editor and the game fall back to default states.', 'Los estados son opcionales: minecraft:oak_stairs["weirdo_direction"=1]. Si faltan, se usan los de por defecto.'],
    ['Make sure the BP is active in the world. Structures live in the BP at structures/<name>.mcstructure and are loaded as mystructure:<name>.', 'Asegúrate de que el BP esté activo en el mundo. Las estructuras están en el BP en structures/<nombre>.mcstructure y se cargan como mystructure:<nombre>.']
  ]);

  /* ---------- Block catalogue: id, label, vanilla texture, fallback colour ---------- */
  const B = (id, tex, col) => ({ id: 'minecraft:' + id, tex, col, label: id.replace(/_/g, ' ') });
  const CATALOG = [
    B('stone', 'stone', '#7d7d7d'), B('cobblestone', 'cobblestone', '#6b6b6b'), B('stone_bricks', 'stonebrick', '#777777'), B('dirt', 'dirt', '#866043'),
    B('grass_block', 'grass_top', '#5b8c3a'), B('sand', 'sand', '#dbcf9b'), B('gravel', 'gravel', '#837f7e'), B('sandstone', 'sandstone_normal', '#d9cd9a'),
    B('oak_planks', 'planks_oak', '#a2824f'), B('spruce_planks', 'planks_spruce', '#6e5230'), B('birch_planks', 'planks_birch', '#c4b57a'), B('jungle_planks', 'planks_jungle', '#a0714f'),
    B('acacia_planks', 'planks_acacia', '#a85a32'), B('dark_oak_planks', 'planks_big_oak', '#3e2912'), B('oak_log', 'log_oak', '#6b5232'), B('spruce_log', 'log_spruce', '#3a2813'),
    B('birch_log', 'log_birch', '#d5d0c0'), B('oak_leaves', 'leaves_oak', '#3f7a2a'), B('glass', 'glass', '#c8e6f0'), B('bookshelf', 'bookshelf', '#7a5b36'),
    B('bricks', 'brick', '#966453'), B('obsidian', 'obsidian', '#150f22'), B('bedrock', 'bedrock', '#3a3a3a'), B('iron_block', 'iron_block', '#d8d8d8'),
    B('gold_block', 'gold_block', '#f6d03c'), B('diamond_block', 'diamond_block', '#62dfd5'), B('emerald_block', 'emerald_block', '#2bc65a'), B('lapis_block', 'lapis_block', '#1f438a'),
    B('redstone_block', 'redstone_block', '#a91509'), B('coal_block', 'coal_block', '#191919'), B('glowstone', 'glowstone', '#d9b26a'), B('sea_lantern', 'sea_lantern', '#b6d9d0'),
    B('netherrack', 'netherrack', '#6f3636'), B('nether_bricks', 'nether_brick', '#2d171b'), B('end_stone', 'end_stone', '#dfdd9f'), B('soul_sand', 'soul_sand', '#52402f'),
    B('white_wool', 'wool_colored_white', '#e9ecec'), B('red_wool', 'wool_colored_red', '#a12722'), B('blue_wool', 'wool_colored_blue', '#35399d'), B('green_wool', 'wool_colored_green', '#546d1b'),
    B('yellow_wool', 'wool_colored_yellow', '#f1af15'), B('black_wool', 'wool_colored_black', '#141519'), B('snow', 'snow', '#f4fbfb'), B('ice', 'ice', '#91b8ff'),
    B('clay', 'clay', '#9aa3b3'), B('tnt', 'tnt_side', '#b8431f'), B('crafting_table', 'crafting_table_top', '#9c7440'), B('furnace', 'furnace_front_off', '#707070'),
    B('pumpkin', 'pumpkin_top', '#c07615'), B('melon_block', 'melon_side', '#6f9a1e'), B('hay_block', 'hay_block_side', '#c6a110'), B('quartz_block', 'quartz_block_side', '#ebe5de'),
    B('prismarine', 'prismarine_rough', '#5b9a8e'), B('terracotta', 'hardened_clay', '#985d43'), B('white_concrete', 'concrete_white', '#cfd5d6'), B('black_concrete', 'concrete_black', '#080a0f'),
    B('water', 'water_still', '#2f43f4'), B('lava', 'lava_still', '#d96514'), B('torch', 'torch_on', '#ffd24a')
  ];
  const byId = new Map(CATALOG.map((b) => [b.id, b]));
  function hashCol(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return 'hsl(' + (Math.abs(h) % 360) + ',45%,48%)'; }
  function info(id) {
    const base = id.replace(/\[.*$/, '');
    return byId.get(base) || { id: base, label: base.replace(/^minecraft:/, '').replace(/_/g, ' '), tex: base.replace(/^[^:]*:/, ''), col: hashCol(base) };
  }

  /* ---------- Texture cache ---------- */
  const texCache = {};
  function tex(name, cb) {
    if (!VAN || !name) return null;
    const c = texCache[name];
    if (c) return c.img || null;
    texCache[name] = { img: null };
    Promise.resolve(VAN.image(name)).then((img) => { texCache[name].img = img; cb && cb(); }).catch(() => { texCache[name].img = null; });
    return null;
  }

  /* ---------- Little-endian NBT writer ---------- */
  class NBT {
    constructor() { this.b = []; }
    u8(v) { this.b.push(v & 255); }
    i16(v) { this.b.push(v & 255, (v >> 8) & 255); }
    i32(v) { this.b.push(v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >> 24) & 255); }
    str(s) { const e = new TextEncoder().encode(s); this.i16(e.length); for (const x of e) this.b.push(x); }
    head(type, name) { this.u8(type); this.str(name); }
    bytes() { return new Uint8Array(this.b); }
  }
  function buildMcstructure(sx, sy, sz, grid, pal) {
    // compact palette (only used entries); air -> index of 'minecraft:air'
    const used = new Map(), list = [];
    const idx = (p) => { const s = pal[p]; if (!used.has(s)) { used.set(s, list.length); list.push(s); } return used.get(s); };
    const total = sx * sy * sz, ind = new Array(total);
    // grid index layout (x*sy + y)*sz + z — same as file order
    for (let i = 0; i < total; i++) ind[i] = idx(grid[i]);
    const w = new NBT();
    w.head(10, ''); // root
    w.head(3, 'format_version'); w.i32(1);
    w.head(9, 'size'); w.u8(3); w.i32(3); w.i32(sx); w.i32(sy); w.i32(sz);
    w.head(9, 'structure_world_origin'); w.u8(3); w.i32(3); w.i32(0); w.i32(0); w.i32(0);
    w.head(10, 'structure');
    w.head(9, 'block_indices'); w.u8(9); w.i32(2);
    w.u8(3); w.i32(total); for (let i = 0; i < total; i++) w.i32(ind[i]);
    w.u8(3); w.i32(total); for (let i = 0; i < total; i++) w.i32(-1);
    w.head(9, 'entities'); w.u8(10); w.i32(0);
    w.head(10, 'palette'); w.head(10, 'default');
    w.head(9, 'block_palette'); w.u8(10); w.i32(list.length);
    for (const s of list) {
      const m = /^([^\[]+)(?:\[(.*)\])?$/.exec(s), name = m[1].trim(), states = m[2] ? parseStates(m[2]) : [];
      w.head(8, 'name'); w.str(name);
      w.head(10, 'states');
      for (const [k, v] of states) {
        if (typeof v === 'boolean') { w.head(1, k); w.u8(v ? 1 : 0); }
        else if (typeof v === 'number') { w.head(3, k); w.i32(v); }
        else { w.head(8, k); w.str(v); }
      }
      w.u8(0); // end states
      w.head(3, 'version'); w.i32(18168865);
      w.u8(0); // end palette entry
    }
    w.head(10, 'block_position_data'); w.u8(0);
    w.u8(0); // end default
    w.u8(0); // end palette
    w.u8(0); // end structure
    w.u8(0); // end root
    return w.bytes();
  }
  function parseStates(s) {
    const out = [];
    s.split(',').forEach((p) => {
      const kv = p.split('='); if (kv.length < 2) return;
      const k = kv[0].trim().replace(/^"|"$/g, ''); let v = kv.slice(1).join('=').trim().replace(/^"|"$/g, '');
      if (v === 'true') v = true; else if (v === 'false') v = false; else if (/^-?\d+$/.test(v)) v = parseInt(v, 10);
      if (k) out.push([k, v]);
    });
    return out;
  }
  function b64(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }

  /* ---------- Editor state ---------- */
  let S = null;
  function newState() {
    return { name: 'my_structure', sx: 9, sy: 6, sz: 9, grid: null, pal: ['minecraft:air'], layer: 0, tool: 'pencil', cur: 'minecraft:stone', mx: false, mz: false,
      hot: ['minecraft:stone', 'minecraft:oak_planks', 'minecraft:cobblestone', 'minecraft:glass', 'minecraft:oak_log', 'minecraft:bricks', 'minecraft:white_wool', 'minecraft:glowstone', 'minecraft:dirt'],
      undo: [], redo: [], rot: 0, folder: '', script: true, filter: '', cell: 24 };
  }
  const gi = (x, y, z) => (x * S.sy + y) * S.sz + z;
  const palIdx = (id) => { let i = S.pal.indexOf(id); if (i < 0) { i = S.pal.length; S.pal.push(id); } return i; };
  function snap() { S.undo.push({ grid: S.grid.slice(), pal: S.pal.slice(), sx: S.sx, sy: S.sy, sz: S.sz }); if (S.undo.length > 60) S.undo.shift(); S.redo = []; }
  function restore(o) { S.grid = o.grid; S.pal = o.pal; S.sx = o.sx; S.sy = o.sy; S.sz = o.sz; S.layer = clamp(S.layer, 0, S.sy - 1); }
  function doUndo() { if (!S.undo.length) return; S.redo.push({ grid: S.grid.slice(), pal: S.pal.slice(), sx: S.sx, sy: S.sy, sz: S.sz }); restore(S.undo.pop()); syncInputs(); redraw(); }
  function doRedo() { if (!S.redo.length) return; S.undo.push({ grid: S.grid.slice(), pal: S.pal.slice(), sx: S.sx, sy: S.sy, sz: S.sz }); restore(S.redo.pop()); syncInputs(); redraw(); }
  function resize(nx, ny, nz) {
    nx = clamp(nx | 0, 1, 64); ny = clamp(ny | 0, 1, 64); nz = clamp(nz | 0, 1, 64);
    const g = new Uint16Array(nx * ny * nz);
    for (let x = 0; x < Math.min(nx, S.sx); x++) for (let y = 0; y < Math.min(ny, S.sy); y++) for (let z = 0; z < Math.min(nz, S.sz); z++) g[(x * ny + y) * nz + z] = S.grid[gi(x, y, z)];
    S.grid = g; S.sx = nx; S.sy = ny; S.sz = nz; S.layer = clamp(S.layer, 0, ny - 1);
  }
  function setCell(x, z, v) {
    const put = (a, b) => { if (a >= 0 && b >= 0 && a < S.sx && b < S.sz) S.grid[gi(a, S.layer, b)] = v; };
    put(x, z); if (S.mx) put(S.sx - 1 - x, z); if (S.mz) put(x, S.sz - 1 - z); if (S.mx && S.mz) put(S.sx - 1 - x, S.sz - 1 - z);
  }
  function flood(x, z, v) {
    const t = S.grid[gi(x, S.layer, z)]; if (t === v) return;
    const st = [[x, z]];
    while (st.length) {
      const [a, b] = st.pop(); if (a < 0 || b < 0 || a >= S.sx || b >= S.sz || S.grid[gi(a, S.layer, b)] !== t) continue;
      S.grid[gi(a, S.layer, b)] = v; st.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
    }
  }
  const countBlocks = () => { let n = 0; for (let i = 0; i < S.grid.length; i++) if (S.pal[S.grid[i]] !== 'minecraft:air') n++; return n; };

  /* ---------- UI ---------- */
  let root = null, cv = null, pv = null, drag = null, last = null;
  const TOOLS = [['pencil', 'Pencil', '✎'], ['eraser', 'Eraser', '⌫'], ['fill', 'Fill', '▦'], ['rect', 'Rectangle', '▭'], ['pick', 'Picker', '✚']];

  function open() {
    S = newState(); S.grid = new Uint16Array(S.sx * S.sy * S.sz);
    const bp = U.findPacks().bp; S.folder = (bp ? bp.folder.name : 'BP') + '/structures';
    showModal('<div class="modal tbx-modal st-modal" id="stRoot"></div>', (el) => { root = el.querySelector('#stRoot'); build(); });
  }

  function build() {
    const folders = U.folderPaths();
    root.innerHTML = `
<div class="tbx-tool-head"><button class="tbx-back" id="stBack">${UI_ICONS.back}</button><h3>${T('Structures')}</h3></div>
<p class="ij-lead">${T('Build a structure block by block and add it to your addon as a .mcstructure file.')}</p>
<div class="st-top">
  <label class="st-f">${T('Name')}<input type="text" id="stName" value="${esc(S.name)}"></label>
  <div class="st-size"><span>${T('Size')}</span>
    <input type="number" id="stX" min="1" max="64" value="${S.sx}" aria-label="X"><b>×</b><input type="number" id="stY" min="1" max="64" value="${S.sy}" aria-label="Y"><b>×</b><input type="number" id="stZ" min="1" max="64" value="${S.sz}" aria-label="Z">
    <button class="btn btn-ghost btn-sm" id="stResize">${T('Resize')}</button></div>
</div>
<div class="st-tools" id="stTools">${TOOLS.map((t) => `<button class="st-tool" data-tool="${t[0]}" title="${T(t[1])}"><span>${t[2]}</span><em>${T(t[1])}</em></button>`).join('')}
  <label class="st-chk"><input type="checkbox" id="stMX"> ${T('Mirror X')}</label><label class="st-chk"><input type="checkbox" id="stMZ"> ${T('Mirror Z')}</label>
  <button class="st-tool" id="stUndo" title="${T('Undo')}"><span>↶</span><em>${T('Undo')}</em></button><button class="st-tool" id="stRedo" title="${T('Redo')}"><span>↷</span><em>${T('Redo')}</em></button>
  <button class="st-tool" id="stClr" title="${T('Clear layer')}"><span>✕</span><em>${T('Clear layer')}</em></button></div>
<div class="st-main">
  <div class="st-pane st-edit">
    <div class="st-layerbar"><button class="btn btn-ghost btn-sm" id="stLD">◀</button><b id="stLayerLbl"></b><button class="btn btn-ghost btn-sm" id="stLU">▶</button><span class="st-count" id="stCount"></span></div>
    <div class="st-canvaswrap"><canvas id="stCv"></canvas></div>
  </div>
  <div class="st-pane st-side">
    <div class="st-inv"><div class="st-invhead">${T('Blocks')}<input type="search" id="stSearch" placeholder="${T('Search blocks…')}"></div>
      <div class="st-grid" id="stInv"></div>
      <div class="st-custom"><input type="text" id="stCustom" placeholder="${T('Custom block id')}" list="stCustomList"><button class="btn btn-ghost btn-sm" id="stAdd">${T('Add')}</button></div>
      <p class="imgjson-meta-info">${T('Block states are optional: minecraft:oak_stairs["weirdo_direction"=1]. Both the editor and the game fall back to default states.')}</p></div>
    <div class="st-prevwrap"><div class="st-invhead">${T('Preview')} <button class="btn btn-ghost btn-sm" id="stRot">${T('Rotate view')}</button></div><canvas id="stPv" width="320" height="220"></canvas></div>
  </div>
</div>
<div class="st-hotbar-wrap"><span>${T('Hotbar')}</span><div class="st-hotbar" id="stHot"></div></div>
<div class="st-foot">
  <label class="st-f">${T('Save to folder')}<input type="text" id="stFolder" list="stFolders" value="${esc(S.folder)}"><datalist id="stFolders">${folders.map((f) => `<option value="${esc(f)}">`).join('')}</datalist></label>
  <label class="ij-check"><input type="checkbox" id="stScript" checked> ${T('Also generate script (/scriptevent fd:structure)')}</label>
</div>
<div class="modal-actions"><button class="btn btn-ghost" id="stCancel">${T('Close')}</button><button class="btn btn-primary" id="stGo">${T('Create structure')}</button></div>`;
    cv = root.querySelector('#stCv'); pv = root.querySelector('#stPv');
    wire(); renderInv(); renderHot(); redraw();
  }

  function syncInputs() { if (!root) return; ['X', 'Y', 'Z'].forEach((a, i) => { root.querySelector('#st' + a).value = [S.sx, S.sy, S.sz][i]; }); }

  function swatch(id) {
    const i = info(id), d = document.createElement('i'); d.style.background = i.col;
    const img = tex(i.tex, () => { d.style.backgroundImage = `url(${VAN.url(i.tex)})`; });
    if (img) d.style.backgroundImage = `url(${VAN.url(i.tex)})`;
    return d;
  }
  function slot(id, cls) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'st-slot' + (cls ? ' ' + cls : ''); b.title = info(id).label + ' — ' + id;
    b.appendChild(swatch(id)); if (id === S.cur) b.classList.add('sel'); b.dataset.id = id; return b;
  }
  function renderInv() {
    const g = root.querySelector('#stInv'), q = S.filter.toLowerCase(); g.innerHTML = '';
    const all = CATALOG.map((b) => b.id).concat(S.pal.slice(1).filter((p) => !byId.has(p.replace(/\[.*$/, ''))));
    all.filter((id) => !q || id.toLowerCase().includes(q) || info(id).label.includes(q)).forEach((id) => g.appendChild(slot(id)));
  }
  function renderHot() {
    const h = root.querySelector('#stHot'); h.innerHTML = '';
    S.hot.forEach((id, i) => { const s = slot(id, 'hot'); const n = document.createElement('u'); n.textContent = i + 1; s.appendChild(n); h.appendChild(s); });
  }
  function selectBlock(id, fromInv) {
    S.cur = id; if (S.tool === 'eraser') S.tool = 'pencil';
    if (fromInv && !S.hot.includes(id)) { S.hot.unshift(id); S.hot.length = 9; }
    root.querySelectorAll('.st-slot').forEach((s) => s.classList.toggle('sel', s.dataset.id === id));
    if (fromInv) renderHot(); paintTools();
  }
  function paintTools() { root.querySelectorAll('[data-tool]').forEach((b) => b.classList.toggle('on', b.dataset.tool === S.tool)); }

  /* ---------- Drawing ---------- */
  function redraw() {
    if (!root) return;
    const maxW = Math.min(640, (root.querySelector('.st-canvaswrap').clientWidth || 560) - 4);
    S.cell = clamp(Math.floor(maxW / Math.max(S.sx, S.sz)), 8, 32);
    cv.width = S.sx * S.cell; cv.height = S.sz * S.cell;
    const g = cv.getContext('2d'), c = S.cell; g.imageSmoothingEnabled = false;
    g.fillStyle = '#1b1c22'; g.fillRect(0, 0, cv.width, cv.height);
    const drawBlock = (id, x, z, alpha) => {
      const i = info(id), im = tex(i.tex, redraw); g.globalAlpha = alpha;
      if (im) g.drawImage(im, 0, 0, im.naturalWidth, im.naturalWidth, x * c, z * c, c, c); else { g.fillStyle = i.col; g.fillRect(x * c, z * c, c, c); }
      g.globalAlpha = 1;
    };
    for (let x = 0; x < S.sx; x++) for (let z = 0; z < S.sz; z++) {
      const here = S.pal[S.grid[gi(x, S.layer, z)]];
      if (here !== 'minecraft:air') drawBlock(here, x, z, 1);
      else if (S.layer > 0) { const below = S.pal[S.grid[gi(x, S.layer - 1, z)]]; if (below !== 'minecraft:air') drawBlock(below, x, z, 0.28); }
    }
    g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 1; g.beginPath();
    for (let x = 0; x <= S.sx; x++) { g.moveTo(x * c + .5, 0); g.lineTo(x * c + .5, cv.height); }
    for (let z = 0; z <= S.sz; z++) { g.moveTo(0, z * c + .5); g.lineTo(cv.width, z * c + .5); }
    g.stroke();
    if (drag && drag.rect) { g.strokeStyle = '#8577f8'; g.lineWidth = 2; const a = drag.rect; g.strokeRect(Math.min(a.x0, a.x1) * c, Math.min(a.z0, a.z1) * c, (Math.abs(a.x1 - a.x0) + 1) * c, (Math.abs(a.z1 - a.z0) + 1) * c); }
    root.querySelector('#stLayerLbl').textContent = T('Layer {0} / {1}').replace('{0}', S.layer + 1).replace('{1}', S.sy);
    root.querySelector('#stCount').textContent = T('{0} blocks').replace('{0}', countBlocks());
    drawIso();
  }

  function drawIso() {
    const g = pv.getContext('2d'); g.clearRect(0, 0, pv.width, pv.height);
    const W = Math.max(S.sx, S.sz), w = clamp(Math.floor(300 / (W + S.sy * 0.6)), 3, 16), h = w / 2;
    const ox = pv.width / 2, oy = pv.height - 22 - (S.sx + S.sz) * h / 2 * 0 ;
    const rot = S.rot, tx = (x, z) => rot === 0 ? [x, z] : rot === 1 ? [S.sz - 1 - z, x] : rot === 2 ? [S.sx - 1 - x, S.sz - 1 - z] : [z, S.sx - 1 - x];
    const dimx = rot % 2 ? S.sz : S.sx, dimz = rot % 2 ? S.sx : S.sz;
    const air = (x, y, z) => y < 0 || y >= S.sy || x < 0 || z < 0 || x >= S.sx || z >= S.sz || S.pal[S.grid[gi(x, y, z)]] === 'minecraft:air';
    // inverse transform: view coords (vx,vz) -> grid coords
    const inv = (vx, vz) => rot === 0 ? [vx, vz] : rot === 1 ? [vz, S.sz - 1 - vx] : rot === 2 ? [S.sx - 1 - vx, S.sz - 1 - vz] : [S.sx - 1 - vz, vx];
    const shade = (hex, f) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex); if (m) { const n = parseInt(m[1], 16); return `rgb(${(n >> 16 & 255) * f | 0},${(n >> 8 & 255) * f | 0},${(n & 255) * f | 0})`; } return hex; };
    const cache = {};
    const col = (id) => { if (cache[id]) return cache[id]; const c = info(id).col; if (c[0] === '#') return cache[id] = c; const t = document.createElement('canvas'); t.width = t.height = 1; const x = t.getContext('2d'); x.fillStyle = c; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; return cache[id] = '#' + ((1 << 24) + (d[0] << 16) + (d[1] << 8) + d[2]).toString(16).slice(1); };
    const baseY = pv.height - 14 - (dimx + dimz) * h / 2;
    for (let y = 0; y < S.sy; y++) for (let vx = 0; vx < dimx; vx++) for (let vz = 0; vz < dimz; vz++) {
      const [x, z] = inv(vx, vz), id = S.pal[S.grid[gi(x, y, z)]]; if (id === 'minecraft:air') continue;
      const [nx, nz] = [vx + 1, vz + 1], a = inv(nx, vz), b = inv(vx, nz), cUp = air(x, y + 1, z);
      const hid = !cUp ? false : false; void hid;
      const hasX = (() => { if (nx >= dimx) return true; const q = inv(nx, vz); return air(q[0], y, q[1]); })(), hasZ = (() => { if (nz >= dimz) return true; const q = inv(vx, nz); return air(q[0], y, q[1]); })();
      if (!cUp && !hasX && !hasZ) continue; void a; void b;
      const px = ox + (vx - vz) * w / 2, py = baseY + (vx + vz) * h / 2 - y * h, c0 = col(id);
      if (cUp) { g.fillStyle = shade(c0, 1.0); g.beginPath(); g.moveTo(px, py - h / 2); g.lineTo(px + w / 2, py); g.lineTo(px, py + h / 2); g.lineTo(px - w / 2, py); g.closePath(); g.fill(); }
      if (hasZ) { g.fillStyle = shade(c0, 0.72); g.beginPath(); g.moveTo(px - w / 2, py); g.lineTo(px, py + h / 2); g.lineTo(px, py + h * 1.5); g.lineTo(px - w / 2, py + h); g.closePath(); g.fill(); }
      if (hasX) { g.fillStyle = shade(c0, 0.5); g.beginPath(); g.moveTo(px + w / 2, py); g.lineTo(px, py + h / 2); g.lineTo(px, py + h * 1.5); g.lineTo(px + w / 2, py + h); g.closePath(); g.fill(); }
    }
  }

  /* ---------- Interaction ---------- */
  function cellAt(e) {
    const r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * S.sx), z = Math.floor((e.clientY - r.top) / r.height * S.sz);
    return (x < 0 || z < 0 || x >= S.sx || z >= S.sz) ? null : [x, z];
  }
  function line(a, b, fn) { let [x0, z0] = a; const [x1, z1] = b, dx = Math.abs(x1 - x0), dz = Math.abs(z1 - z0), sx = x0 < x1 ? 1 : -1, sz = z0 < z1 ? 1 : -1; let e = dx - dz; for (; ;) { fn(x0, z0); if (x0 === x1 && z0 === z1) break; const e2 = 2 * e; if (e2 > -dz) { e -= dz; x0 += sx; } if (e2 < dx) { e += dx; z0 += sz; } } }
  function down(e) {
    const c = cellAt(e); if (!c) return; e.preventDefault(); cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
    const t = S.tool, air = palIdx('minecraft:air');
    if (t === 'pick') { const id = S.pal[S.grid[gi(c[0], S.layer, c[1])]]; if (id !== 'minecraft:air') { S.tool = 'pencil'; selectBlock(id, true); } else { S.tool = 'pencil'; paintTools(); } return; }
    snap();
    if (t === 'fill') { flood(c[0], c[1], palIdx(S.cur)); redraw(); return; }
    if (t === 'rect') { drag = { rect: { x0: c[0], z0: c[1], x1: c[0], z1: c[1] } }; redraw(); return; }
    drag = { v: t === 'eraser' ? air : palIdx(S.cur) }; last = c; setCell(c[0], c[1], drag.v); redraw();
  }
  function move(e) {
    if (!drag) return; const c = cellAt(e); if (!c) return;
    if (drag.rect) { drag.rect.x1 = c[0]; drag.rect.z1 = c[1]; redraw(); return; }
    if (last && (c[0] !== last[0] || c[1] !== last[1])) { line(last, c, (x, z) => setCell(x, z, drag.v)); last = c; redraw(); }
  }
  function up() {
    if (drag && drag.rect) { const a = drag.rect, v = palIdx(S.cur); for (let x = Math.min(a.x0, a.x1); x <= Math.max(a.x0, a.x1); x++) for (let z = Math.min(a.z0, a.z1); z <= Math.max(a.z0, a.z1); z++) setCell(x, z, v); }
    drag = null; last = null; redraw();
  }

  function wire() {
    root.querySelector('#stBack').onclick = () => { closeModal(); showToolboxModal(); };
    root.querySelector('#stCancel').onclick = closeModal;
    root.querySelector('#stName').oninput = (e) => { S.name = e.target.value; };
    root.querySelector('#stFolder').oninput = (e) => { S.folder = e.target.value; };
    root.querySelector('#stScript').onchange = (e) => { S.script = e.target.checked; };
    root.querySelector('#stResize').onclick = () => { snap(); resize(+root.querySelector('#stX').value, +root.querySelector('#stY').value, +root.querySelector('#stZ').value); syncInputs(); redraw(); };
    root.querySelectorAll('[data-tool]').forEach((b) => b.onclick = () => { S.tool = b.dataset.tool; paintTools(); });
    root.querySelector('#stMX').onchange = (e) => { S.mx = e.target.checked; }; root.querySelector('#stMZ').onchange = (e) => { S.mz = e.target.checked; };
    root.querySelector('#stUndo').onclick = doUndo; root.querySelector('#stRedo').onclick = doRedo;
    root.querySelector('#stClr').onclick = () => { snap(); for (let x = 0; x < S.sx; x++) for (let z = 0; z < S.sz; z++) S.grid[gi(x, S.layer, z)] = 0; redraw(); };
    root.querySelector('#stLD').onclick = () => { S.layer = Math.max(0, S.layer - 1); redraw(); };
    root.querySelector('#stLU').onclick = () => { S.layer = Math.min(S.sy - 1, S.layer + 1); redraw(); };
    root.querySelector('#stRot').onclick = () => { S.rot = (S.rot + 1) % 4; drawIso(); };
    root.querySelector('#stSearch').oninput = (e) => { S.filter = e.target.value; renderInv(); };
    const add = () => { const i = root.querySelector('#stCustom'), v = i.value.trim(); if (!v) return; const id = /^[^:\[]+:/.test(v) ? v : 'minecraft:' + v; palIdx(id); selectBlock(id, true); i.value = ''; renderInv(); };
    root.querySelector('#stAdd').onclick = add; root.querySelector('#stCustom').onkeydown = (e) => { if (e.key === 'Enter') add(); };
    root.querySelector('#stInv').onclick = (e) => { const s = e.target.closest('.st-slot'); if (s) selectBlock(s.dataset.id, true); };
    root.querySelector('#stHot').onclick = (e) => { const s = e.target.closest('.st-slot'); if (s) selectBlock(s.dataset.id, false); };
    cv.addEventListener('pointerdown', down); cv.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    root.onkeydown = (e) => { if (/INPUT|TEXTAREA/.test(e.target.tagName)) return; if (/^[1-9]$/.test(e.key)) selectBlock(S.hot[+e.key - 1], false); if (e.ctrlKey && e.key === 'z') { e.preventDefault(); doUndo(); } if (e.ctrlKey && e.key === 'y') { e.preventDefault(); doRedo(); } };
    root.tabIndex = 0;
    root.querySelector('#stGo').onclick = create;
    paintTools();
    window.addEventListener('resize', redraw);
  }

  /* ---------- Create files ---------- */
  function wireScript(bp, report, names) {
    const m = bp.json; m.modules = m.modules || []; m.dependencies = m.dependencies || [];
    let sm = m.modules.find((x) => x.type === 'script');
    if (!sm) { sm = { type: 'script', language: 'javascript', uuid: U.uuid(), entry: 'scripts/main.js', version: [1, 0, 0] }; m.modules.push(sm); }
    if (!m.dependencies.some((d) => d.module_name === '@minecraft/server')) m.dependencies.push({ module_name: '@minecraft/server', version: V.server });
    bp.manifest.content = U.J(m);
    const parts = sm.entry.split('/'), main = parts.pop(), dir = parts.join('/'), sp = (dir ? dir + '/' : '') + 'fd_structures.js';
    const f = U.getFile(sp, bp.folder);
    let prev = []; if (!f.created) { const mm = /const FD_STRUCTURES = (\[[^\]]*\]);/.exec(f.node.content || ''); if (mm) { try { prev = JSON.parse(mm[1]); } catch (e) { } } }
    const all = Array.from(new Set(prev.concat(names)));
    f.node.content = scriptSource(all);
    report.push((f.created ? '+ ' : '~ ') + bp.folder.name + '/' + sp);
    const en = U.getFile(sm.entry, bp.folder), imp = 'import "./fd_structures.js";';
    if (en.created) { en.node.content = '// Behavior Pack entry point\n' + imp + '\n'; report.push('+ ' + bp.folder.name + '/' + sm.entry); }
    else if (!/fd_structures\.js/.test(en.node.content || '')) { en.node.content = imp + '\n' + (en.node.content || ''); report.push('~ ' + bp.folder.name + '/' + sm.entry); }
    report.push('~ ' + bp.folder.name + '/manifest.json');
  }
  function scriptSource(names) {
    return `import { world, system } from "@minecraft/server";

// Generated by FireDex · Structures. The FD_STRUCTURES line is updated automatically.
const FD_STRUCTURES = ${JSON.stringify(names)};

system.afterEvents.scriptEventReceive.subscribe((ev) => {
  if (ev.id !== "fd:structure") return;
  const player = ev.sourceEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  const name = ev.message.trim().split(/\\s+/)[0];
  if (!FD_STRUCTURES.includes(name)) {
    player.sendMessage("§eUsage: /scriptevent fd:structure <" + FD_STRUCTURES.join("|") + ">");
    return;
  }
  const loc = { x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z) };
  try {
    world.structureManager.place("mystructure:" + name, player.dimension, loc);
    player.sendMessage("§aStructure '" + name + "' placed.");
  } catch (e) {
    player.sendMessage("§cCould not place '" + name + "': " + e);
  }
}, { namespaces: ["fd"] });
`;
  }

  function create() {
    const name = U.slug(S.name);
    if (!name) return showToast(T('Invalid structure name.'));
    if (!countBlocks()) return showToast(T('Build something first (the structure is empty).'));
    const bytes = buildMcstructure(S.sx, S.sy, S.sz, S.grid, S.pal);
    const folderPath = (S.folder || 'BP/structures').replace(/^\/+|\/+$/g, '');
    const folder = U.folderByPath(folderPath), f = U.getFile(name + '.mcstructure', folder);
    f.node.content = 'data:application/octet-stream;base64,' + b64(bytes);
    const report = [(f.created ? '+ ' : '~ ') + folderPath + '/' + name + '.mcstructure'], names = [name];
    if (S.script) { const bp = U.ensurePack('bp'); wireScript(bp, report, names); }
    render(); saveState(); showToast(T('Structure saved: {0}').replace('{0}', name + '.mcstructure'));
    done(name, report, f.node);
  }

  function done(name, report, node) {
    const cmd = (t) => `<div class="ij-cmd"><code>${esc(t)}</code><button class="btn btn-ghost btn-sm" data-copy="${esc(t)}">${T('Copy')}</button></div>`;
    root.innerHTML = `<div class="tbx-tool-head"><button class="tbx-back" id="stBack2">${UI_ICONS.back}</button><h3>${T('Done ✔')}</h3></div>
<div class="ij-done"><div><h4>${T('Files')}</h4><ul class="ij-files">${report.map((r) => `<li class="${r[0] === '+' ? 'new' : ''}">${esc(r)}</li>`).join('')}</ul></div>
<div><h4>${T('Place it in the world')}</h4>${cmd('/structure load mystructure:' + name + ' ~ ~ ~')}${S.script ? cmd('/scriptevent fd:structure ' + name) : ''}
<p class="imgjson-meta-info">${T('Make sure the BP is active in the world. Structures live in the BP at structures/<name>.mcstructure and are loaded as mystructure:<name>.')}</p></div></div>
<div class="modal-actions"><button class="btn btn-ghost" id="stMore">${T('Add more')}</button><button class="btn btn-primary" id="stClose">${T('Close')}</button></div>`;
    root.querySelector('#stBack2').onclick = () => { S.name = name + '_2'; build(); };
    root.querySelector('#stMore').onclick = () => { const f = S.folder; S = newState(); S.grid = new Uint16Array(S.sx * S.sy * S.sz); S.folder = f; build(); };
    root.querySelector('#stClose').onclick = closeModal;
    root.querySelectorAll('[data-copy]').forEach((b) => b.onclick = () => { copyToClipboard(b.dataset.copy); showToast(T('Copied')); });
  }

  window.FD_STRUCT = { buildMcstructure };   // exposed for tests
  TOOLBOX_TOOLS.push({
    id: 'structures', name: 'Structures', desc: 'Build structures in a voxel editor and add them to your addon as .mcstructure.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 10 12 5l9 5-9 5-9-5Z"/><path d="M3 10v6l9 5 9-5v-6M12 15v6"/></svg>',
    onOpen: open
  });
  if (window.FD_I18N) FD_I18N.add([['Build structures in a voxel editor and add them to your addon as .mcstructure.', 'Construye estructuras en un editor de vóxeles y añádelas a tu addon como .mcstructure.']]);
})();

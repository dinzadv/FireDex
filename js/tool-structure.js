/* ============================================================
   Structures — editor de estructuras para Bedrock.
   · Hasta 512 bloques por eje (colosal): vista 2D con zoom/pan, deshacer por diferencias,
     exportación automática en piezas (tiles) + función/script que las coloca juntas.
   · Todos los bloques de Bedrock con sus estados (puertas, escaleras, losas…).
   · Contenedores con ítems fijos o loot aleatorio (loot tables generadas en el BP).
   · Exporta .mcstructure real (NBT little-endian) dentro del addon.
   ============================================================ */
(function () {
  'use strict';
  const U = window.FD_UTIL, V = window.FD_VERSIONS || { server: '2.0.0' }, VAN = window.FD_VANILLA, D = window.FD_STRUCT_DATA;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const T = (s) => (window.FD_I18N ? FD_I18N.t(s) : s);
  const MAXAXIS = 512, MAXVOL = 1 << 24, ITEM_RAW = 'https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/items/';

  /* ---------- i18n ---------- */
  if (window.FD_I18N) FD_I18N.add([
    ['Structures', 'Estructuras'], ['Build structures of any size and add them to your addon as .mcstructure files, with chests, loot and every Minecraft block.', 'Construye estructuras de cualquier tamaño y añádelas a tu addon como .mcstructure, con cofres, loot y todos los bloques de Minecraft.'],
    ['Structure name', 'Nombre de la estructura'], ['Size', 'Tamaño'], ['Resize structure', 'Redimensionar estructura'], ['Apply', 'Aplicar'], ['Cancel', 'Cancelar'], ['Layer', 'Capa'], ['Layer {0} / {1}', 'Capa {0} / {1}'],
    ['Pencil', 'Lápiz'], ['Eraser', 'Borrador'], ['Fill', 'Rellenar'], ['Line', 'Línea'], ['Rectangle', 'Rectángulo'], ['Ellipse', 'Elipse'], ['Sphere', 'Esfera'], ['Select', 'Seleccionar'], ['Picker', 'Cuentagotas'], ['Pan', 'Mover vista'], ['Container', 'Contenedor'], ['Paste', 'Pegar'],
    ['Undo', 'Deshacer'], ['Redo', 'Rehacer'], ['Brush', 'Pincel'], ['Height', 'Altura'], ['Hollow', 'Hueco'], ['Mirror X', 'Espejo X'], ['Mirror Z', 'Espejo Z'], ['Fit', 'Ajustar'], ['Zoom in', 'Acercar'], ['Zoom out', 'Alejar'],
    ['Blocks', 'Bloques'], ['Loot', 'Loot'], ['3D', '3D'], ['Export', 'Exportar'], ['Search blocks…', 'Buscar bloques…'], ['All', 'Todos'], ['Wood', 'Madera'], ['Stone', 'Piedra'], ['Colored', 'Colores'], ['Copper', 'Cobre'], ['Nature', 'Naturaleza'], ['Ores', 'Minerales'], ['Redstone', 'Redstone'], ['Functional', 'Funcionales'], ['Decoration', 'Decoración'], ['Nether & End', 'Nether y End'], ['Project', 'Proyecto'],
    ['Block properties', 'Propiedades del bloque'], ['Custom block id', 'ID de bloque personalizado'], ['Use', 'Usar'], ['No extra properties for this block.', 'Este bloque no tiene propiedades extra.'], ['Hotbar', 'Barra rápida'], ['Show more', 'Mostrar más'],
    ['Upside down', 'Invertido'], ['Hinge right', 'Bisagra a la derecha'], ['Open', 'Abierto'], ['Top half', 'Mitad superior'], ['In wall', 'En muro'], ['Persistent (no decay)', 'Persistente (no se pudre)'], ['Hanging', 'Colgando'], ['On', 'Encendido'], ['Lit', 'Encendido'],
    ['East', 'Este'], ['West', 'Oeste'], ['South', 'Sur'], ['North', 'Norte'], ['Up', 'Arriba'], ['Down', 'Abajo'], ['Bottom', 'Abajo'], ['Top', 'Arriba'], ['Up/Down (Y)', 'Arriba/Abajo (Y)'], ['East/West (X)', 'Este/Oeste (X)'], ['North/South (Z)', 'Norte/Sur (Z)'], ['On floor', 'En el suelo'], ['Off', 'Apagado'], ['Pressed', 'Pulsado'], ['Full', 'Completo'],
    ['Structure', 'Estructura'], ['Mirror structure X', 'Reflejar estructura en X'], ['Mirror structure Z', 'Reflejar estructura en Z'], ['Rotate 90°', 'Girar 90°'], ['Replace block…', 'Reemplazar bloque…'], ['Trim to content', 'Recortar al contenido'], ['Clear everything', 'Borrar todo'], ['Resize…', 'Redimensionar…'], ['Replace', 'Reemplazar'], ['Find', 'Buscar'], ['With', 'Por'],
    ['Copy', 'Copiar'], ['Cut', 'Cortar'], ['Delete', 'Eliminar'], ['Fill selection', 'Rellenar selección'], ['Flip X', 'Voltear X'], ['Flip Z', 'Voltear Z'], ['Rotate', 'Girar'], ['Include air', 'Incluir aire'], ['Selection: {0}×{1}×{2}', 'Selección: {0}×{1}×{2}'], ['Clipboard: {0}×{1}×{2}', 'Portapapeles: {0}×{1}×{2}'], ['Nothing selected', 'Nada seleccionado'],
    ['{0} blocks', '{0} bloques'], ['{0} containers', '{0} contenedores'], ['Draft restored', 'Borrador restaurado'], ['Size must be between 1 and {0} per axis.', 'El tamaño debe estar entre 1 y {0} por eje.'], ['That is too large (max {0} million blocks in total).', 'Es demasiado grande (máx. {0} millones de bloques en total).'],
    ['Small (16)', 'Pequeña (16)'], ['Medium (64)', 'Mediana (64)'], ['Large (128)', 'Grande (128)'], ['Colossal (256×128×256)', 'Colosal (256×128×256)'], ['Memory estimate: ~{0} MB', 'Memoria estimada: ~{0} MB'], ['Huge structures are exported in pieces automatically.', 'Las estructuras enormes se exportan en piezas automáticamente.'],
    ['Containers', 'Contenedores'], ['No containers yet. Place a chest, barrel, shulker box, dispenser, dropper or hopper and it appears here.', 'Aún no hay contenedores. Coloca un cofre, barril, shulker, dispensador, soltador o tolva y aparecerá aquí.'], ['Container at {0}, {1}, {2}', 'Contenedor en {0}, {1}, {2}'],
    ['Custom name (optional)', 'Nombre personalizado (opcional)'], ['Empty', 'Vacío'], ['Fixed items', 'Ítems fijos'], ['Random loot', 'Loot aleatorio'], ['Loot set', 'Conjunto de loot'], ['Loot sets', 'Conjuntos de loot'], ['New loot set', 'Nuevo conjunto'], ['Duplicate', 'Duplicar'], ['Rename', 'Renombrar'], ['Preset…', 'Plantilla…'],
    ['Pool', 'Pool'], ['Add pool', 'Añadir pool'], ['Add item', 'Añadir ítem'], ['Rolls', 'Tiradas'], ['Min', 'Mín'], ['Max', 'Máx'], ['Weight', 'Peso'], ['Nothing (weight)', 'Nada (peso)'], ['Item', 'Ítem'], ['Count', 'Cantidad'], ['Slot {0}', 'Ranura {0}'], ['Clear slot', 'Vaciar ranura'], ['Select an item…', 'Elige un ítem…'],
    ['Every time a player opens the chest for the first time the game rolls the pools again, so each chest gets different loot.', 'Cada vez que un jugador abre el cofre por primera vez el juego vuelve a tirar los pools, así cada cofre tiene un loot distinto.'],
    ['Pick an item', 'Elige un ítem'], ['Vanilla', 'Vanilla'], ['Your addon', 'Tu addon'], ['Search items…', 'Buscar ítems…'], ['No items found in your addon yet (BP/items and BP/blocks).', 'Aún no hay ítems en tu addon (BP/items y BP/blocks).'], ['Custom id (namespace:name)', 'ID personalizado (namespace:nombre)'],
    ['Dungeon', 'Mazmorra'], ['Treasure', 'Tesoro'], ['Farm & village', 'Granja y aldea'], ['Weapons & armor', 'Armas y armadura'], ['Redstone & tools', 'Redstone y herramientas'], ['Food', 'Comida'],
    ['Save to folder', 'Guardar en carpeta'], ['Also generate script (/scriptevent fd:structure)', 'Generar también script (/scriptevent fd:structure)'], ['Split into pieces', 'Dividir en piezas'], ['Piece size', 'Tamaño de pieza'], ['Create structure', 'Crear estructura'],
    ['Auto-connect walls', 'Conectar muros automáticamente'], ['This structure will be saved as {0} piece(s).', 'Esta estructura se guardará en {0} pieza(s).'], ['Loot tables are written to {0}', 'Las loot tables se escriben en {0}'],
    ['Done ✔', 'Listo ✔'], ['Files', 'Archivos'], ['Place it in the world', 'Colócala en el mundo'], ['Add more', 'Añadir más'], ['Close', 'Cerrar'], ['Copied', 'Copiado'], ['Back to tools', 'Volver a herramientas'],
    ['Build something first (the structure is empty).', 'Construye algo primero (la estructura está vacía).'], ['Invalid structure name.', 'Nombre de estructura no válido.'], ['Structure saved: {0}', 'Estructura guardada: {0}'],
    ['Make sure the BP is active in the world. Structures live in the BP at structures/<name>.mcstructure and are loaded as mystructure:<name>.', 'Asegúrate de que el BP esté activo en el mundo. Las estructuras están en el BP en structures/<nombre>.mcstructure y se cargan como mystructure:<nombre>.'],
    ['Big structures: load the area first (/tickingarea add ~ ~ ~ ~{0} ~{1} ~{2}) or the pieces far away will not place.', 'Estructuras grandes: carga primero el área (/tickingarea add ~ ~ ~ ~{0} ~{1} ~{2}) o las piezas lejanas no se colocarán.'],
    ['Run the function to place every piece at once:', 'Ejecuta la función para colocar todas las piezas a la vez:'], ['Shortcuts: B pencil · E eraser · G fill · L line · R rect · O ellipse · C sphere · M select · I picker · Space pan · 1-9 hotbar · PgUp/PgDn layer', 'Atajos: B lápiz · E borrador · G rellenar · L línea · R rect. · O elipse · C esfera · M seleccionar · I cuentagotas · Espacio mover · 1-9 barra · RePág/AvPág capa'],
    ['Preview shows a simplified view for very big structures.', 'La vista previa se simplifica en estructuras muy grandes.'], ['Cut at current layer', 'Cortar en la capa actual'], ['Rotate view', 'Girar vista'], ['Delete this loot set?', '¿Eliminar este conjunto de loot?'],
    ['Open the Loot tab to configure this container.', 'Abre la pestaña Loot para configurar este contenedor.'], ['No container here.', 'Aquí no hay contenedor.'], ['Replaced {0} blocks', 'Reemplazados {0} bloques'], ['Draft kept. Reopen Structures to continue.', 'Borrador guardado. Abre Estructuras para continuar.']
  ]);

  /* ---------- Helpers de bloques ---------- */
  const full = (n) => (n.indexOf(':') < 0 ? 'minecraft:' + n : n);
  const baseOf = (s) => s.replace(/\[.*$/, '');
  const shortName = (s) => baseOf(s).replace(/^[^:]*:/, '');
  const labelOf = (s) => shortName(s).replace(/_/g, ' ');
  function splitId(s) { const m = /^([^\[]+)(?:\[(.*)\])?$/.exec(s) || [s, s, '']; const st = {}; (m[2] ? parseStates(m[2]) : []).forEach(([k, v]) => { st[k] = v; }); return { base: m[1].trim(), st }; }
  function fmt(base, st) { const k = Object.keys(st); return k.length ? base + '[' + k.map((x) => x + '=' + st[x]).join(',') + ']' : base; }
  function defaultStates(base) { const st = {}; (D.schemaFor(base) || []).forEach((s) => { st[s.k] = s.d; }); if (D.isTall(base)) st.upper_block_bit = false; return st; }
  const defaultId = (base) => fmt(full(base), defaultStates(base));
  function withState(s, k, v) { const p = splitId(s); p.st[k] = v; return fmt(p.base, p.st); }
  const isTallStr = (s) => D.isTall(s) && /upper_block_bit=/.test(s);
  const isUpper = (s) => /upper_block_bit=true/.test(s);
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

  /* ---------- Texturas (vanilla desde GitHub, con color de reserva) ---------- */
  let nameSet = null, listP = null, redrawHook = null;
  function ensureList() { if (!listP) listP = (VAN ? VAN.list() : Promise.resolve([])).then((l) => (nameSet = new Set(l))).catch(() => (nameSet = new Set())); return listP; }
  const TX = new Map();
  function avgColor(img) {
    try { const c = document.createElement('canvas'); c.width = c.height = 1; const g = c.getContext('2d'); const w = Math.min(img.naturalWidth, img.naturalHeight); g.drawImage(img, 0, 0, w, w, 0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; } catch (e) { return null; }
  }
  function tx(base) {
    let e = TX.get(base); if (e) return e;
    e = { img: null, name: null, avg: null, p: null }; TX.set(base, e);
    e.p = !VAN ? Promise.resolve(e) : ensureList().then((set) => {
      const n = D.texNames(base).find((x) => set.has(x)); if (!n) return e;
      return VAN.image(n).then((img) => { e.img = img; e.name = n; e.avg = avgColor(img); redrawHook && redrawHook(); return e; });
    }).catch(() => e);
    return e;
  }
  const IX = new Map();
  function ix(name) {
    let e = IX.get(name); if (e) return e;
    e = { url: null, p: null }; IX.set(name, e);
    e.p = new Promise((res) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => { e.url = ITEM_RAW + name + '.png'; res(e); }; i.onerror = () => res(e); i.src = ITEM_RAW + name + '.png'; });
    return e;
  }
  const rgbCache = {};
  function rgbOf(base) {
    const e = TX.get(base); if (e && e.avg) return e.avg;
    if (rgbCache[base]) return rgbCache[base];
    const c = D.colorFor(base);
    const t = document.createElement('canvas'); t.width = t.height = 1; const x = t.getContext('2d'); x.fillStyle = c; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data;
    return (rgbCache[base] = [d[0], d[1], d[2]]);
  }
  function paintBlock(el, s) {
    const base = baseOf(s); el.style.background = D.colorFor(base);
    const e = tx(base); const apply = () => { if (e.name) { el.style.backgroundImage = 'url(' + VAN.url(e.name) + ')'; el.style.backgroundSize = '100% 100%'; } };
    if (e.name) apply(); else e.p.then(apply);
  }
  function paintItem(el, id) {
    const n = shortName(id), custom = id.indexOf(':') > 0 && !/^minecraft:/.test(id);
    el.style.background = D.colorFor(id); el.textContent = '';
    if (custom) { el.textContent = n.charAt(0).toUpperCase(); el.classList.add('letter'); return; }
    const blockish = D.BLOCK_CAT[n] !== undefined;
    const tryBlock = () => { const b = tx(n); const a = () => { if (b.name) { el.style.backgroundImage = 'url(' + VAN.url(b.name) + ')'; el.style.backgroundSize = '100% 100%'; } else { el.textContent = n.charAt(0).toUpperCase(); el.classList.add('letter'); } }; b.name ? a() : b.p.then(a); };
    if (blockish) tryBlock(); else { const e = ix(n); const a = () => { if (e.url) { el.style.backgroundImage = 'url(' + e.url + ')'; el.style.backgroundSize = '100% 100%'; } else tryBlock(); }; e.url ? a() : e.p.then(a); }
  }

  /* ---------- NBT little-endian (buffer creciente) ---------- */
  const enc = new TextEncoder();
  class NB {
    constructor() { this.a = new Uint8Array(1 << 16); this.n = 0; this.dv = new DataView(this.a.buffer); }
    need(k) { if (this.n + k > this.a.length) { let L = this.a.length * 2; while (L < this.n + k) L *= 2; const b = new Uint8Array(L); b.set(this.a); this.a = b; this.dv = new DataView(b.buffer); } }
    u8(v) { this.need(1); this.a[this.n++] = v & 255; }
    i16(v) { this.need(2); this.dv.setInt16(this.n, v, true); this.n += 2; }
    i32(v) { this.need(4); this.dv.setInt32(this.n, v, true); this.n += 4; }
    str(s) { const e = enc.encode(s); this.i16(e.length); this.need(e.length); this.a.set(e, this.n); this.n += e.length; }
    head(t, name) { this.u8(t); this.str(name); }
    out() { return this.a.slice(0, this.n); }
  }
  function writeStates(w, s) {
    const m = splitId(s); w.head(8, 'name'); w.str(m.base); w.head(10, 'states');
    Object.keys(m.st).forEach((k) => { const v = m.st[k]; if (typeof v === 'boolean') { w.head(1, k); w.u8(v ? 1 : 0); } else if (typeof v === 'number') { w.head(3, k); w.i32(v); } else { w.head(8, k); w.str(String(v)); } });
    w.u8(0); w.head(3, 'version'); w.i32(18168865); w.u8(0);
  }
  function writeBlockEntity(w, kind, c, pos, lootRef) {
    w.head(10, 'block_entity_data');
    if (c.name) { w.head(8, 'CustomName'); w.str(c.name); }
    if (c.mode === 'loot' && lootRef) { w.head(8, 'LootTable'); w.str(lootRef); }
    else {
      const items = c.mode === 'items' ? Object.keys(c.items).map((k) => [+k, c.items[k]]).filter((p) => p[1] && p[1].id) : [];
      w.head(9, 'Items'); w.u8(10); w.i32(items.length);
      items.forEach(([slot, it]) => { w.head(1, 'Count'); w.u8(clamp(it.n | 0 || 1, 1, 64)); w.head(2, 'Damage'); w.i16(0); w.head(8, 'Name'); w.str(full(it.id)); w.head(1, 'Slot'); w.u8(slot); w.head(1, 'WasPickedUp'); w.u8(0); w.u8(0); });
    }
    w.head(1, 'findable'); w.u8(0); w.head(8, 'id'); w.str(kind.ent); w.head(1, 'isMovable'); w.u8(1);
    w.head(3, 'x'); w.i32(pos[0]); w.head(3, 'y'); w.i32(pos[1]); w.head(3, 'z'); w.i32(pos[2]);
    w.u8(0);
  }
  /* pieza: sub-volumen [ox,oy,oz] + [px,py,pz] del grid completo */
  function buildPiece(g, pal, dims, off, size, chests, lootRefOf) {
    const [sx, sy, sz] = dims, [ox, oy, oz] = off, [px, py, pz] = size, total = px * py * pz;
    const remap = new Int32Array(pal.length).fill(-1), list = [], w = new NB();
    w.head(10, ''); w.head(3, 'format_version'); w.i32(1);
    w.head(9, 'size'); w.u8(3); w.i32(3); w.i32(px); w.i32(py); w.i32(pz);
    w.head(9, 'structure_world_origin'); w.u8(3); w.i32(3); w.i32(0); w.i32(0); w.i32(0);
    w.head(10, 'structure');
    w.head(9, 'block_indices'); w.u8(9); w.i32(2);
    w.u8(3); w.i32(total); w.need(total * 4);
    for (let x = 0; x < px; x++) for (let y = 0; y < py; y++) { let gi = ((ox + x) * sy + (oy + y)) * sz + oz; for (let z = 0; z < pz; z++, gi++) { const p = g[gi]; let r = remap[p]; if (r < 0) { r = remap[p] = list.length; list.push(p); } w.dv.setInt32(w.n, r, true); w.n += 4; } }
    w.u8(3); w.i32(total); w.need(total * 4); for (let i = 0; i < total; i++) { w.dv.setInt32(w.n, -1, true); w.n += 4; }
    w.head(9, 'entities'); w.u8(10); w.i32(0);
    w.head(10, 'palette'); w.head(10, 'default');
    w.head(9, 'block_palette'); w.u8(10); w.i32(list.length); list.forEach((p) => writeStates(w, pal[p]));
    w.head(10, 'block_position_data');
    chests.forEach((c, key) => {
      const [cx, cy, cz] = key.split(',').map(Number), lx = cx - ox, ly = cy - oy, lz = cz - oz;
      if (lx < 0 || ly < 0 || lz < 0 || lx >= px || ly >= py || lz >= pz) return;
      const kind = D.containerOf(pal[g[(cx * sy + cy) * sz + cz]]); if (!kind || c.mode === 'empty' && !c.name) return;
      w.head(10, String((lx * py + ly) * pz + lz)); writeBlockEntity(w, kind, c, [lx, ly, lz], c.mode === 'loot' ? lootRefOf(c) : null); w.u8(0);
    });
    w.u8(0); w.u8(0); w.u8(0); w.u8(0); w.u8(0);
    return w.out();
  }
  function b64(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }

  /* ---------- Estado ---------- */
  let S = null, DRAFT = null, root = null, cv = null, pvc = null, ctx = null;
  const HOT0 = ['stone', 'oak_planks', 'cobblestone', 'glass', 'oak_log', 'brick_block', 'white_wool', 'glowstone', 'chest'];
  function newState() {
    const s = { name: 'my_structure', sx: 16, sy: 12, sz: 16, grid: null, pal: ['minecraft:air'], pmap: new Map([['minecraft:air', 0]]), layer: 0, tool: 'pencil', mx: false, mz: false, hollow: false, height: 1, brush: 1,
      hot: HOT0.map(defaultId), hi: 0, cur: '', undo: [], redo: [], rot: 0, cut: false, folder: '', script: true, split: true, tile: 64, walls: true, chests: new Map(), loots: [], selChest: null,
      sel: null, clip: null, pasteAir: false, view: { z: 20, ox: 20, oy: 20 }, tab: 'blocks', cat: 'all', q: '', count: 0, loot_n: 1 };
    s.cur = s.hot[0]; s.grid = new Uint16Array(s.sx * s.sy * s.sz); return s;
  }
  const gi = (x, y, z) => (x * S.sy + y) * S.sz + z;
  const inb = (x, y, z) => x >= 0 && y >= 0 && z >= 0 && x < S.sx && y < S.sy && z < S.sz;
  function palIdx(str) { let i = S.pmap.get(str); if (i === undefined) { i = S.pal.length; S.pal.push(str); S.pmap.set(str, i); } return i; }
  const contOf = (str) => D.containerOf(str);
  const newChest = () => ({ mode: 'empty', items: {}, loot: null, name: '' });

  /* ---- deshacer por diferencias ---- */
  let op = null;
  function beginOp() { op = { idx: [], old: [], chests: new Map(S.chests) }; }
  function endOp() {
    if (!op) return; const o = op; op = null;
    if (!o.idx.length && o.chests.size === S.chests.size && Array.from(o.chests.keys()).every((k) => S.chests.get(k) === o.chests.get(k))) return;
    S.undo.push(o); if (S.undo.length > 80) S.undo.shift(); S.redo = []; changed();
  }
  function putRaw(i, v) { const o = S.grid[i]; if (o === v) return; if (op) { op.idx.push(i); op.old.push(o); } S.grid[i] = v; }
  function setB(x, y, z, v) {
    if (!inb(x, y, z)) return; const i = gi(x, y, z), old = S.pal[S.grid[i]];
    if (S.grid[i] === v) return;
    if (isTallStr(old) && !(v && isTallStr(S.pal[v]) && S.pal[v].replace(/upper_block_bit=\w+/, '') === old.replace(/upper_block_bit=\w+/, ''))) { const py = isUpper(old) ? y - 1 : y + 1; if (inb(x, py, z) && isTallStr(S.pal[S.grid[gi(x, py, z)]])) putRaw(gi(x, py, z), 0); }
    putRaw(i, v);
    const k = x + ',' + y + ',' + z, ns = S.pal[v];
    if (S.chests.has(k) && !contOf(ns)) S.chests.delete(k);
    else if (v && contOf(ns) && !S.chests.has(k)) { S.chests.set(k, newChest()); S.selChest = k; S.newChest = true; }
  }
  function place(x, y, z, v) {
    setB(x, y, z, v); const s = S.pal[v];
    if (v && isTallStr(s) && !isUpper(s)) setB(x, y + 1, z, palIdx(withState(s, 'upper_block_bit', true)));
  }
  function applyUndo(from, to) {
    const o = from.pop(); if (!o) return;
    if (o.full) { const cur = { full: true, grid: S.grid, sx: S.sx, sy: S.sy, sz: S.sz, chests: S.chests }; S.grid = o.grid; S.sx = o.sx; S.sy = o.sy; S.sz = o.sz; S.chests = o.chests; S.layer = clamp(S.layer, 0, S.sy - 1); to.push(cur); }
    else { const r = { idx: [], old: [], chests: S.chests }; for (let k = o.idx.length - 1; k >= 0; k--) { const i = o.idx[k]; r.idx.push(i); r.old.push(S.grid[i]); S.grid[i] = o.old[k]; } S.chests = o.chests; to.push(r); }
    if (S.selChest && !S.chests.has(S.selChest)) S.selChest = null;
    changed(true);
  }
  const doUndo = () => applyUndo(S.undo, S.redo), doRedo = () => applyUndo(S.redo, S.undo);
  function fullOp(fn) { const o = { full: true, grid: S.grid, sx: S.sx, sy: S.sy, sz: S.sz, chests: new Map(S.chests) }; fn(); S.undo.push(o); if (S.undo.length > 6) { const f = S.undo.findIndex((u) => u.full); if (S.undo.filter((u) => u.full).length > 3 && f >= 0) S.undo.splice(f, 1); } S.redo = []; changed(true); }
  function countBlocks() { let n = 0; const g = S.grid; for (let i = 0; i < g.length; i++) if (g[i]) n++; return n; }

  /* ---- transformaciones (estructura y portapapeles) ---- */
  const CARD = ['north', 'east', 'south', 'west'];
  function xfState(str, o) {
    const p = splitId(str), sc = D.schemaFor(p.base); let ch = false;
    if (!sc) return str;
    sc.forEach((s) => {
      if (s.k === 'pillar_axis') { if (o === 'rot' && p.st.pillar_axis !== 'y') { p.st.pillar_axis = p.st.pillar_axis === 'x' ? 'z' : 'x'; ch = true; } return; }
      if (!s.dir) return;
      const v = p.st[s.k]; const name = typeof v === 'number' ? s.dir[v] : v; if (CARD.indexOf(name) < 0) return;
      let n = name;
      if (o === 'rot') n = CARD[(CARD.indexOf(name) + 1) % 4]; else if (o === 'mx') n = name === 'east' ? 'west' : name === 'west' ? 'east' : name; else if (o === 'mz') n = name === 'north' ? 'south' : name === 'south' ? 'north' : name;
      if (n !== name) { p.st[s.k] = typeof v === 'number' ? s.dir.indexOf(n) : n; ch = true; }
    });
    if ((o === 'mx' || o === 'mz') && 'door_hinge_bit' in p.st) { p.st.door_hinge_bit = !p.st.door_hinge_bit; ch = true; }
    return ch ? fmt(p.base, p.st) : str;
  }
  function xfArray(src, w, h, d, o) {
    const pm = S.pal.map((s) => palIdx(xfState(s, o)));
    const w2 = o === 'rot' ? d : w, d2 = o === 'rot' ? w : d, dst = new Uint16Array(w2 * h * d2);
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) {
      const v = src[(x * h + y) * d + z]; if (!v && o !== 'none') continue;
      let nx = x, nz = z; if (o === 'rot') { nx = d - 1 - z; nz = x; } else if (o === 'mx') nx = w - 1 - x; else if (o === 'mz') nz = d - 1 - z;
      dst[(nx * h + y) * d2 + nz] = pm[v];
    }
    return { dst, w: w2, h, d: d2, map: (cx, cy, cz) => { let nx = cx, nz = cz; if (o === 'rot') { nx = d - 1 - cz; nz = cx; } else if (o === 'mx') nx = w - 1 - cx; else if (o === 'mz') nz = d - 1 - cz; return [nx, cy, nz]; } };
  }
  function transformAll(o) {
    fullOp(() => { const r = xfArray(S.grid, S.sx, S.sy, S.sz, o), nc = new Map(); S.chests.forEach((c, k) => { const [x, y, z] = k.split(',').map(Number); nc.set(r.map(x, y, z).join(','), c); }); S.grid = r.dst; S.sx = r.w; S.sz = r.d; S.chests = nc; S.selChest = null; });
    fitView(); syncSize();
  }
  function resizeTo(nx, ny, nz) {
    fullOp(() => {
      const g = new Uint16Array(nx * ny * nz), mx = Math.min(nx, S.sx), my = Math.min(ny, S.sy), mz = Math.min(nz, S.sz);
      for (let x = 0; x < mx; x++) for (let y = 0; y < my; y++) { const a = (x * S.sy + y) * S.sz, b = (x * ny + y) * nz; g.set(S.grid.subarray(a, a + mz), b); }
      const nc = new Map(); S.chests.forEach((c, k) => { const [x, y, z] = k.split(',').map(Number); if (x < nx && y < ny && z < nz) nc.set(k, c); });
      S.grid = g; S.sx = nx; S.sy = ny; S.sz = nz; S.chests = nc; S.layer = clamp(S.layer, 0, ny - 1);
    }); fitView(); syncSize();
  }
  function bbox() { let x0 = 1e9, y0 = 1e9, z0 = 1e9, x1 = -1, y1 = -1, z1 = -1; const g = S.grid, sy = S.sy, sz = S.sz; for (let x = 0; x < S.sx; x++) for (let y = 0; y < sy; y++) { let i = (x * sy + y) * sz; for (let z = 0; z < sz; z++, i++) if (g[i]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (z < z0) z0 = z; if (z > z1) z1 = z; } } return x1 < 0 ? null : { x0, y0, z0, x1, y1, z1 }; }
  function trim() {
    const b = bbox(); if (!b) return; const nx = b.x1 - b.x0 + 1, ny = b.y1 - b.y0 + 1, nz = b.z1 - b.z0 + 1;
    fullOp(() => { const g = new Uint16Array(nx * ny * nz), nc = new Map(); for (let x = 0; x < nx; x++) for (let y = 0; y < ny; y++) { const a = ((x + b.x0) * S.sy + y + b.y0) * S.sz + b.z0; g.set(S.grid.subarray(a, a + nz), (x * ny + y) * nz); } S.chests.forEach((c, k) => { const [x, y, z] = k.split(',').map(Number); nc.set((x - b.x0) + ',' + (y - b.y0) + ',' + (z - b.z0), c); }); S.grid = g; S.sx = nx; S.sy = ny; S.sz = nz; S.chests = nc; S.layer = 0; });
    fitView(); syncSize();
  }

  /* ---------- Bloques del proyecto (addon) ---------- */
  function walkFiles(folder, cb) { (folder.children || []).forEach((c) => { if (c.type === 'folder') walkFiles(c, cb); else cb(c); }); }
  function projectIds() {
    const out = { blocks: [], items: [] };
    try {
      const bp = U.findPacks().bp; if (!bp) return out;
      walkFiles(bp.folder, (f) => {
        if (!/\.json$/i.test(f.name)) return; const j = U.parseJson(f.content || ''); if (!j) return;
        const b = j['minecraft:block'], i = j['minecraft:item'];
        if (b && b.description && b.description.identifier) out.blocks.push(b.description.identifier);
        if (i && i.description && i.description.identifier) out.items.push(i.description.identifier);
      });
    } catch (e) { }
    return out;
  }
  let PROJ = { blocks: [], items: [] };

  /* ---------- Plantillas de loot ---------- */
  const PRESETS = {
    'Dungeon': [{ min: 2, max: 4, nothing: 6, e: [['bread', 8, 1, 2], ['bone', 10, 1, 4], ['string', 10, 1, 3], ['gunpowder', 8, 1, 3], ['iron_ingot', 5, 1, 3], ['saddle', 2, 1, 1], ['golden_apple', 1, 1, 1], ['name_tag', 2, 1, 1], ['music_disc_13', 1, 1, 1]] }],
    'Treasure': [{ min: 2, max: 3, nothing: 3, e: [['diamond', 4, 1, 3], ['emerald', 6, 2, 5], ['gold_ingot', 10, 2, 6], ['iron_ingot', 12, 3, 8], ['enchanted_golden_apple', 1, 1, 1], ['netherite_scrap', 2, 1, 2], ['experience_bottle', 6, 2, 6]] }, { min: 0, max: 1, nothing: 8, e: [['totem_of_undying', 1, 1, 1], ['elytra', 1, 1, 1], ['trident', 1, 1, 1]] }],
    'Farm & village': [{ min: 3, max: 6, nothing: 0, e: [['wheat', 12, 4, 8], ['bread', 10, 1, 4], ['carrot', 8, 2, 5], ['potato', 8, 2, 5], ['beetroot', 6, 2, 4], ['hay_block', 3, 1, 3], ['emerald', 2, 1, 2], ['pumpkin_seeds', 4, 1, 3]] }],
    'Weapons & armor': [{ min: 1, max: 3, nothing: 4, e: [['iron_sword', 4, 1, 1], ['iron_chestplate', 3, 1, 1], ['iron_helmet', 3, 1, 1], ['bow', 4, 1, 1], ['arrow', 10, 8, 24], ['shield', 3, 1, 1], ['diamond_sword', 1, 1, 1], ['golden_boots', 3, 1, 1]] }],
    'Redstone & tools': [{ min: 3, max: 6, nothing: 2, e: [['redstone', 12, 4, 12], ['repeater', 4, 1, 2], ['piston', 4, 1, 2], ['observer', 3, 1, 1], ['iron_pickaxe', 3, 1, 1], ['iron_axe', 3, 1, 1], ['torch', 8, 4, 16], ['hopper', 2, 1, 1]] }],
    'Food': [{ min: 3, max: 6, nothing: 1, e: [['cooked_beef', 8, 1, 4], ['cooked_porkchop', 8, 1, 4], ['bread', 10, 2, 5], ['apple', 8, 1, 4], ['golden_carrot', 3, 1, 2], ['cookie', 6, 2, 8], ['pumpkin_pie', 3, 1, 2], ['cake', 1, 1, 1]] }]
  };
  function presetToSet(name) { return { id: 'loot_' + (S.loot_n++), name: name, pools: PRESETS[name].map((p) => ({ min: p.min, max: p.max, nothing: p.nothing, entries: p.e.map((e) => ({ id: 'minecraft:' + e[0], w: e[1], min: e[2], max: e[3] })) })) }; }
  const emptySet = () => ({ id: 'loot_' + (S.loot_n++), name: 'Loot ' + (S.loots.length + 1), pools: [{ min: 1, max: 3, nothing: 0, entries: [] }] });

  /* ---------- Interfaz ---------- */
  const IC = {
    pencil: '<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 0l0 0a2 2 0 0 1 0 3L8 19l-4 1z"/>', eraser: '<path d="M4 15l8-9 7 6-5 6H8z"/><path d="M9 20h11"/>', fill: '<path d="M6 11l5.5-5.5 7 7L13 18z"/><path d="M19 16c1.2 1.8 1.2 3 0 4"/><path d="M4 20h6"/>',
    line: '<path d="M5 19L19 5"/><circle cx="5" cy="19" r="1.4"/><circle cx="19" cy="5" r="1.4"/>', rect: '<rect x="5" y="6" width="14" height="12" rx="1"/>', ellipse: '<ellipse cx="12" cy="12" rx="8" ry="5.5"/>', sphere: '<circle cx="12" cy="12" r="7.5"/><ellipse cx="12" cy="12" rx="7.5" ry="3"/>',
    select: '<rect x="5" y="5" width="14" height="14" rx="1" stroke-dasharray="3 2.6"/>', pick: '<path d="M14 5l5 5-3 3-5-5z"/><path d="M11 8L4.5 14.5V19.5H9.5L16 13"/>', pan: '<path d="M12 3v18M3 12h18M8.5 6.5L12 3l3.5 3.5M8.5 17.5L12 21l3.5-3.5M6.5 8.5L3 12l3.5 3.5M17.5 8.5L21 12l-3.5 3.5"/>',
    container: '<rect x="4" y="9" width="16" height="10" rx="1.2"/><path d="M4 13h16M10.5 12v3.5h3V12M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>', paste: '<rect x="6" y="5" width="12" height="15" rx="1.5"/><path d="M9 5V4h6v1M9 11h6M9 15h4"/>',
    undo: '<path d="M9 8L4.5 12.5 9 17"/><path d="M5 12.5h8a5.5 5.5 0 0 1 0 11" transform="translate(0 -5.5)"/>', redo: '<path d="M15 8l4.5 4.5L15 17"/><path d="M19 12.5h-8a5.5 5.5 0 0 0 0 11" transform="translate(0 -5.5)"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', fit: '<path d="M4 9V5h4M20 9V5h-4M4 15v4h4M20 15v4h-4"/>', x: '<path d="m6 6 12 12M18 6 6 18"/>', rot: '<path d="M20 11A8 8 0 1 0 18.6 16"/><path d="M20 5v6h-6"/>'
  };
  const ico = (k, w) => `<svg viewBox="0 0 24 24" width="${w || 18}" height="${w || 18}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>`;
  const TOOLS = [['pencil', 'Pencil', 'B'], ['eraser', 'Eraser', 'E'], ['fill', 'Fill', 'G'], ['line', 'Line', 'L'], ['rect', 'Rectangle', 'R'], ['ellipse', 'Ellipse', 'O'], ['sphere', 'Sphere', 'C'], ['select', 'Select', 'M'], ['pick', 'Picker', 'I'], ['container', 'Container', 'K'], ['pan', 'Pan', 'H']];
  const $ = (s) => root.querySelector(s);
  const toast = (m) => showToast(m);

  function open() {
    if (DRAFT) { S = DRAFT; toast(T('Draft restored')); } else { S = newState(); const bp = U.findPacks().bp; S.folder = (bp ? bp.folder.name : 'BP') + '/structures'; }
    PROJ = projectIds();
    showModal('<div class="modal st-app" id="stRoot"></div>', (el) => { root = el.querySelector('#stRoot'); build(); });
  }
  function closeTool(back) { DRAFT = countBlocks() ? S : null; unbind(); closeModal(); if (back) showToolboxModal(); }

  function build() {
    const folders = U.folderPaths();
    root.innerHTML = `
<header class="st-bar">
  <button class="st-ib" id="stBack" title="${T('Back to tools')}">${UI_ICONS.back}</button>
  <div class="st-brand">${T('Structures')}</div>
  <input class="st-name" id="stName" value="${esc(S.name)}" placeholder="${T('Structure name')}" aria-label="${T('Structure name')}" spellcheck="false">
  <button class="st-chip" id="stSize" title="${T('Resize structure')}"><b id="stSizeTxt"></b></button>
  <span class="st-stat" id="stStat"></span>
  <span class="st-sp"></span>
  <button class="st-ib" id="stUndo" title="${T('Undo')} (Ctrl+Z)">${ico('undo')}</button><button class="st-ib" id="stRedo" title="${T('Redo')} (Ctrl+Y)">${ico('redo')}</button>
  <div class="st-menuwrap"><button class="st-btn" id="stMenu">${ico('menu', 16)}<span>${T('Structure')}</span></button><div class="st-menu" id="stMenuList" hidden>
    <button data-m="resize">${T('Resize…')}</button><button data-m="mx">${T('Mirror structure X')}</button><button data-m="mz">${T('Mirror structure Z')}</button><button data-m="rot">${T('Rotate 90°')}</button>
    <button data-m="replace">${T('Replace block…')}</button><button data-m="trim">${T('Trim to content')}</button><button data-m="clear" class="danger">${T('Clear everything')}</button></div></div>
  <button class="st-btn primary" id="stGo">${T('Create structure')}</button>
</header>
<div class="st-body">
  <nav class="st-tools" id="stTools">${TOOLS.map((t) => `<button class="st-tl" data-tool="${t[0]}" title="${T(t[1])} (${t[2]})">${ico(t[0], 20)}<span>${T(t[1])}</span></button>`).join('')}</nav>
  <section class="st-stage">
    <div class="st-opts" id="stOpts"></div>
    <div class="st-view" id="stView"><canvas id="stCv"></canvas>
      <div class="st-hud"><span id="stCoord">—</span></div>
      <div class="st-zoom"><button class="st-ib" id="stZi" title="${T('Zoom in')}">${ico('plus', 16)}</button><button class="st-ib" id="stZo" title="${T('Zoom out')}">${ico('minus', 16)}</button><button class="st-ib" id="stFit" title="${T('Fit')}">${ico('fit', 16)}</button></div>
    </div>
    <div class="st-layerbar"><button class="st-ib" id="stLD">◀</button><input type="range" id="stLayer" min="0" max="${S.sy - 1}" value="${S.layer}"><button class="st-ib" id="stLU">▶</button><b id="stLayerLbl"></b></div>
    <div class="st-hotwrap"><div class="st-hotbar" id="stHot"></div><span class="st-keys">${T('Shortcuts: B pencil · E eraser · G fill · L line · R rect · O ellipse · C sphere · M select · I picker · Space pan · 1-9 hotbar · PgUp/PgDn layer')}</span></div>
  </section>
  <aside class="st-side" id="stSide" data-tab="${S.tab}">
    <div class="st-prev"><div class="st-prevbar"><b>${T('3D')}</b><label class="st-sw"><input type="checkbox" id="stCut"><span>${T('Cut at current layer')}</span></label><button class="st-ib sm" id="stRot" title="${T('Rotate view')}">${ico('rot', 16)}</button></div><canvas id="stPv" width="360" height="220"></canvas></div>
    <div class="st-tabs" id="stTabs"><button data-tab="blocks">${T('Blocks')}</button><button data-tab="loot">${T('Loot')}<i id="stLootN"></i></button><button data-tab="prev" class="mob">${T('3D')}</button><button data-tab="export">${T('Export')}</button></div>
    <div class="st-pan" data-pan="blocks" id="stPanBlocks"></div>
    <div class="st-pan" data-pan="loot" id="stPanLoot"></div>
    <div class="st-pan" data-pan="export" id="stPanExport"></div>
  </aside>
</div>
<div class="st-pop" id="stPop" hidden></div>`;
    cv = $('#stCv'); pvc = $('#stPv'); ctx = cv.getContext('2d');
    redrawHook = () => reqDraw(); wire(); renderBlocks(); renderHot(); renderOpts(); renderLoot(); renderExport(); setTab(S.tab); syncSize(); updateTools(); fitView(); changed(true);
  }

  /* ---- paneles ---- */
  function setTab(t) { S.tab = t; $('#stSide').dataset.tab = t; root.querySelectorAll('#stTabs button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t)); if (t === 'prev') drawIso(); }
  function syncSize() { const t = $('#stSizeTxt'); if (t) t.textContent = S.sx + ' × ' + S.sy + ' × ' + S.sz; const L = $('#stLayer'); if (L) { L.max = S.sy - 1; L.value = S.layer; } }
  function updateTools() { root.querySelectorAll('[data-tool]').forEach((b) => b.classList.toggle('on', b.dataset.tool === S.tool)); root.querySelector('#stView').dataset.tool = S.tool; renderOpts(); }

  function renderOpts() {
    const o = $('#stOpts'); if (!o) return; const t = S.tool; let h = '';
    const num = (id, label, v, mn, mx) => `<label class="st-o"><span>${T(label)}</span><input type="number" id="${id}" min="${mn}" max="${mx}" value="${v}"></label>`;
    const chk = (id, label, v) => `<label class="st-o chk"><input type="checkbox" id="${id}" ${v ? 'checked' : ''}><span>${T(label)}</span></label>`;
    if (t === 'pencil' || t === 'eraser') h += num('stBrush', 'Brush', S.brush, 1, 9);
    if (/^(pencil|eraser|rect|ellipse|line|sphere|select)$/.test(t)) h += num('stHeight', 'Height', S.height, 1, S.sy);
    if (/^(rect|ellipse|sphere)$/.test(t)) h += chk('stHollow', 'Hollow', S.hollow);
    h += chk('stMX', 'Mirror X', S.mx) + chk('stMZ', 'Mirror Z', S.mz);
    if (t === 'select') {
      const s = S.sel;
      h += `<span class="st-o info">${s ? T('Selection: {0}×{1}×{2}').replace('{0}', Math.abs(s.x1 - s.x0) + 1).replace('{1}', s.y1 - s.y0 + 1).replace('{2}', Math.abs(s.z1 - s.z0) + 1) : T('Nothing selected')}</span>
      <button class="st-btn sm" data-a="copy" ${s ? '' : 'disabled'}>${T('Copy')}</button><button class="st-btn sm" data-a="cut" ${s ? '' : 'disabled'}>${T('Cut')}</button><button class="st-btn sm" data-a="fillsel" ${s ? '' : 'disabled'}>${T('Fill selection')}</button><button class="st-btn sm danger" data-a="del" ${s ? '' : 'disabled'}>${T('Delete')}</button>`;
    }
    if (S.clip && t === 'select') h += `<button class="st-btn sm" data-a="paste">${ico('paste', 14)} ${T('Paste')}</button>`;
    if (t === 'paste') {
      h += `<span class="st-o info">${T('Clipboard: {0}×{1}×{2}').replace('{0}', S.clip.w).replace('{1}', S.clip.h).replace('{2}', S.clip.d)}</span><button class="st-btn sm" data-a="cflipx">${T('Flip X')}</button><button class="st-btn sm" data-a="cflipz">${T('Flip Z')}</button><button class="st-btn sm" data-a="crot">${T('Rotate')}</button>${chk('stPAir', 'Include air', S.pasteAir)}<button class="st-btn sm" data-a="pdone">${T('Close')}</button>`;
    }
    o.innerHTML = h;
  }

  /* ---- bloques ---- */
  let showN = 150;
  function blockList() {
    const q = S.q.trim().toLowerCase(); let l;
    if (S.cat === 'all') l = D.BLOCKS.slice(); else if (S.cat === 'custom') l = PROJ.blocks.slice(); else l = (D.CATS[S.cat] || []).slice();
    if (S.cat === 'all') l = l.concat(PROJ.blocks);
    if (q) l = l.filter((id) => id.toLowerCase().indexOf(q.replace(/ /g, '_')) >= 0);
    return l;
  }
  function slotEl(str, cls) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'st-slot' + (cls ? ' ' + cls : ''); b.title = labelOf(str) + ' — ' + baseOf(str); b.dataset.id = str;
    const i = document.createElement('i'); paintBlock(i, str); b.appendChild(i); return b;
  }
  function renderBlocks() {
    const p = $('#stPanBlocks'), cats = ['all'].concat(D.catOrder.filter((c) => c !== 'custom')).concat(PROJ.blocks.length ? ['custom'] : []);
    p.innerHTML = `<div class="st-search"><input type="search" id="stQ" placeholder="${T('Search blocks…')}" value="${esc(S.q)}"></div>
<div class="st-cats" id="stCats">${cats.map((c) => `<button data-cat="${c}" class="${S.cat === c ? 'on' : ''}">${c === 'all' ? T('All') : T(D.catLabel[c])}</button>`).join('')}</div>
<div class="st-grid" id="stInv"></div>
<div class="st-props" id="stProps"></div>`;
    fillGrid(); renderProps();
  }
  function fillGrid() {
    const g = $('#stInv'); g.innerHTML = ''; const l = blockList(), n = Math.min(showN, l.length), f = document.createDocumentFragment();
    for (let i = 0; i < n; i++) { const id = full(l[i]); const el = slotEl(defaultId(id)); el.dataset.pick = id; if (baseOf(S.cur) === id) el.classList.add('sel'); f.appendChild(el); }
    g.appendChild(f);
    if (l.length > n) { const m = document.createElement('button'); m.className = 'st-more'; m.textContent = T('Show more') + ' (' + (l.length - n) + ')'; m.onclick = () => { showN += 200; fillGrid(); }; g.appendChild(m); }
  }
  function renderProps() {
    const p = $('#stProps'); if (!p) return; const cur = splitId(S.cur), sc = D.schemaFor(cur.base);
    let h = `<div class="st-curhead"><div class="st-cursw"><i id="stCurI"></i></div><div><b>${esc(labelOf(S.cur))}</b><small>${esc(cur.base)}</small></div></div>`;
    if (sc) {
      h += `<div class="st-ph">${T('Block properties')}</div>`;
      sc.forEach((s) => {
        if (s.t === 'bool') h += `<label class="st-pr chk"><input type="checkbox" data-k="${s.k}" ${cur.st[s.k] === true ? 'checked' : ''}><span>${T(s.l)}</span></label>`;
        else h += `<label class="st-pr"><span>${esc(s.k.replace(/^minecraft:/, '').replace(/_/g, ' '))}</span><select data-k="${s.k}" data-t="${s.t}">${s.o.map((v, i) => `<option value="${v}" ${String(cur.st[s.k]) === String(v) ? 'selected' : ''}>${T(s.l[i])}</option>`).join('')}</select></label>`;
      });
    } else h += `<p class="st-muted">${T('No extra properties for this block.')}</p>`;
    h += `<div class="st-custom"><input type="text" id="stCustom" placeholder="${T('Custom block id')}" spellcheck="false"><button class="st-btn sm" id="stCustomGo">${T('Use')}</button></div>`;
    p.innerHTML = h; paintBlock(p.querySelector('#stCurI'), S.cur);
  }
  function setCur(str, push) {
    S.cur = str; S.hot[S.hi] = str; if (S.tool === 'eraser' || S.tool === 'pick' || S.tool === 'container' || S.tool === 'pan') { S.tool = 'pencil'; updateTools(); }
    renderHot(); renderProps(); root.querySelectorAll('#stInv .st-slot').forEach((s) => s.classList.toggle('sel', s.dataset.pick === baseOf(str)));
  }
  function renderHot() {
    const h = $('#stHot'); h.innerHTML = '';
    S.hot.forEach((s, i) => { const b = slotEl(s, 'hot'); b.dataset.hi = i; if (i === S.hi) b.classList.add('sel'); const n = document.createElement('u'); n.textContent = i + 1; b.appendChild(n); h.appendChild(b); });
  }

  /* ---- vistas: 2D ---- */
  let drawQ = 0, statQ = 0;
  function reqDraw() { if (!drawQ) drawQ = requestAnimationFrame(() => { drawQ = 0; draw(); }); }
  function changed(imm) {
    reqDraw(); clearTimeout(statQ); statQ = setTimeout(() => { if (!root) return; S.count = countBlocks(); const st = $('#stStat'); if (st) st.textContent = T('{0} blocks').replace('{0}', S.count.toLocaleString()) + (S.chests.size ? ' · ' + T('{0} containers').replace('{0}', S.chests.size) : ''); const ln = $('#stLootN'); if (ln) ln.textContent = S.chests.size ? S.chests.size : ''; if (S.tab === 'prev' || true) drawIso(); renderLootIfNeeded(); }, imm ? 0 : 160);
    const u = $('#stUndo'), r = $('#stRedo'); if (u) { u.disabled = !S.undo.length; r.disabled = !S.redo.length; }
    syncSize();
  }
  function fitView() {
    const w = cv.clientWidth || 600, h = cv.clientHeight || 400, z = clamp(Math.floor(Math.min((w - 40) / S.sx, (h - 40) / S.sz) * 4) / 4, 0.5, 64);
    S.view = { z, ox: Math.round((w - S.sx * z) / 2), oy: Math.round((h - S.sz * z) / 2) }; reqDraw();
  }
  function zoomAt(f, px, py) { const v = S.view, nz = clamp(v.z * f, 0.5, 96), r = nz / v.z; v.ox = px - (px - v.ox) * r; v.oy = py - (py - v.oy) * r; v.z = nz; reqDraw(); }
  function resizeCanvas() { const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } return dpr; }
  let prevCells = null, hover = null;
  function draw() {
    if (!root || !cv) return; const dpr = resizeCanvas(), g = ctx, w = cv.clientWidth, h = cv.clientHeight, v = S.view, z = v.z;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false; g.fillStyle = '#0d0e12'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#181a21'; g.fillRect(v.ox, v.oy, S.sx * z, S.sz * z);
    const x0 = Math.max(0, Math.floor(-v.ox / z)), x1 = Math.min(S.sx - 1, Math.ceil((w - v.ox) / z)), z0 = Math.max(0, Math.floor(-v.oy / z)), z1 = Math.min(S.sz - 1, Math.ceil((h - v.oy) / z));
    const L = S.layer, tex = z >= 7, pal = S.pal, grid = S.grid, sy = S.sy, sz = S.sz, ceil = Math.ceil;
    const colr = (s) => { const b = baseOf(s); const c = rgbOf(b); return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; };
    for (let x = x0; x <= x1; x++) for (let k = z0; k <= z1; k++) {
      const idx = grid[(x * sy + L) * sz + k], px = v.ox + x * z, py = v.oy + k * z; let s = null, a = 1;
      if (idx) s = pal[idx]; else if (L > 0) { const b = grid[(x * sy + L - 1) * sz + k]; if (b) { s = pal[b]; a = 0.26; } }
      if (!s) continue; const e = tex ? tx(baseOf(s)) : null; g.globalAlpha = a;
      if (e && e.img) g.drawImage(e.img, 0, 0, e.img.naturalWidth, e.img.naturalWidth, px, py, ceil(z), ceil(z)); else { g.fillStyle = colr(s); g.fillRect(px, py, ceil(z), ceil(z)); }
      if (a === 1 && z >= 12) { const sc = D.schemaFor(baseOf(s)); if (sc && sc.length) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(px + 1, py + 1, 5, 5); } }
      g.globalAlpha = 1;
    }
    // contenedores
    S.chests.forEach((c, key) => { const p = key.split(',').map(Number); if (p[1] !== L) return; const px = v.ox + p[0] * z, py = v.oy + p[2] * z; if (px < -z || py < -z || px > w || py > h) return; g.strokeStyle = key === S.selChest ? '#ffd24a' : 'rgba(255,210,74,.55)'; g.lineWidth = key === S.selChest ? 2.5 : 1.5; g.strokeRect(px + 1.5, py + 1.5, z - 3, z - 3); if (z >= 14) { g.fillStyle = '#ffd24a'; g.fillRect(px + z - 7, py + z - 7, 5, 5); } });
    // rejilla
    if (z >= 10) { g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1; g.beginPath(); for (let x = x0; x <= x1 + 1; x++) { g.moveTo(Math.round(v.ox + x * z) + .5, Math.max(0, v.oy)); g.lineTo(Math.round(v.ox + x * z) + .5, Math.min(h, v.oy + S.sz * z)); } for (let k = z0; k <= z1 + 1; k++) { g.moveTo(Math.max(0, v.ox), Math.round(v.oy + k * z) + .5); g.lineTo(Math.min(w, v.ox + S.sx * z), Math.round(v.oy + k * z) + .5); } g.stroke(); }
    if (z >= 2.5) { g.strokeStyle = 'rgba(133,119,248,.28)'; g.lineWidth = 1; g.beginPath(); for (let x = Math.ceil(x0 / 16) * 16; x <= x1 + 1; x += 16) { g.moveTo(Math.round(v.ox + x * z) + .5, Math.max(0, v.oy)); g.lineTo(Math.round(v.ox + x * z) + .5, Math.min(h, v.oy + S.sz * z)); } for (let k = Math.ceil(z0 / 16) * 16; k <= z1 + 1; k += 16) { g.moveTo(Math.max(0, v.ox), Math.round(v.oy + k * z) + .5); g.lineTo(Math.min(w, v.ox + S.sx * z), Math.round(v.oy + k * z) + .5); } g.stroke(); }
    g.strokeStyle = '#8577f8'; g.lineWidth = 2; g.strokeRect(v.ox - 1, v.oy - 1, S.sx * z + 2, S.sz * z + 2);
    // vista previa de herramienta
    if (prevCells) { g.fillStyle = 'rgba(133,119,248,.45)'; if (prevCells.length > 160000) { g.strokeStyle = '#b3a9ff'; g.strokeRect(v.ox + prevCells.bx0 * z, v.oy + prevCells.bz0 * z, (prevCells.bx1 - prevCells.bx0 + 1) * z, (prevCells.bz1 - prevCells.bz0 + 1) * z); } else for (let i = 0; i < prevCells.length; i++) { const c = prevCells[i]; g.fillRect(v.ox + c[0] * z, v.oy + c[1] * z, Math.ceil(z), Math.ceil(z)); } }
    if (S.sel) { const s = S.sel; g.setLineDash([6, 4]); g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.fillStyle = 'rgba(255,255,255,.1)'; const rx = v.ox + Math.min(s.x0, s.x1) * z, ry = v.oy + Math.min(s.z0, s.z1) * z, rw = (Math.abs(s.x1 - s.x0) + 1) * z, rh = (Math.abs(s.z1 - s.z0) + 1) * z; g.fillRect(rx, ry, rw, rh); g.strokeRect(rx, ry, rw, rh); g.setLineDash([]); }
    if (S.tool === 'paste' && S.clip && hover) { const c = S.clip; g.globalAlpha = 0.6; for (let x = 0; x < c.w; x++) for (let k = 0; k < c.d; k++) { let s = 0; for (let y = 0; y < c.h; y++) { const q = c.cells[(x * c.h + y) * c.d + k]; if (q) s = q; } if (!s) continue; g.fillStyle = colr(S.pal[s]); g.fillRect(v.ox + (hover[0] + x) * z, v.oy + (hover[1] + k) * z, Math.ceil(z), Math.ceil(z)); } g.globalAlpha = 1; g.strokeStyle = '#8577f8'; g.strokeRect(v.ox + hover[0] * z, v.oy + hover[1] * z, c.w * z, c.d * z); }
    else if (hover && /^(pencil|eraser)$/.test(S.tool)) { const b = S.brush, hx = hover[0] - ((b - 1) >> 1), hz = hover[1] - ((b - 1) >> 1); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.5; g.strokeRect(v.ox + hx * z, v.oy + hz * z, b * z, b * z); }
    else if (hover && S.tool !== 'pan') { g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 1.5; g.strokeRect(v.ox + hover[0] * z, v.oy + hover[1] * z, z, z); }
    $('#stLayerLbl').textContent = T('Layer {0} / {1}').replace('{0}', L + 1).replace('{1}', S.sy);
  }

  /* ---- vista 3D isométrica ---- */
  function drawIso() {
    if (!pvc || !root) return; const g = pvc.getContext('2d'); const W = pvc.clientWidth || 360, H = pvc.clientHeight || 220, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (pvc.width !== Math.round(W * dpr)) { pvc.width = Math.round(W * dpr); pvc.height = Math.round(H * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const b = bbox(); if (!b) return; const top = S.cut ? Math.min(S.layer, b.y1) : b.y1;
    let st = 1; const vol = (b.x1 - b.x0 + 1) * (top - b.y0 + 1) * (b.z1 - b.z0 + 1); while (vol / (st * st * st) > 350000) st++;
    const nx = Math.ceil((b.x1 - b.x0 + 1) / st), ny = Math.ceil((top - b.y0 + 1) / st), nz = Math.ceil((b.z1 - b.z0 + 1) / st), rot = S.rot;
    const dx = rot % 2 ? nz : nx, dz = rot % 2 ? nx : nz;
    const inv = (vx, vz) => rot === 0 ? [vx, vz] : rot === 1 ? [vz, nz - 1 - vx] : rot === 2 ? [nx - 1 - vx, nz - 1 - vz] : [nx - 1 - vz, vx];
    const cell = (x, y, z) => { if (x < 0 || y < 0 || z < 0 || x >= nx || y >= ny || z >= nz) return 0; const sx = b.x0 + x * st + (st >> 1), sy = b.y0 + y * st + (st >> 1), sz = b.z0 + z * st + (st >> 1); return (sx <= b.x1 && sy <= top && sz <= b.z1) ? S.grid[gi(sx, sy, sz)] : 0; };
    const span = dx + dz, wBlk = Math.min((W - 16) / span * 2, (H - 16) / (span / 2 + ny)), w = Math.max(1.2, wBlk), h = w / 2;
    const ox = W / 2, baseY = H - 8 - (ny * h) - span * h / 2 + span * h / 2 - (dx + dz) * h / 2 + (dx + dz) * h / 2;
    const oy = (H - ((dx + dz) * h / 2 + ny * h)) / 2 + ny * h;
    const shade = (c, f) => 'rgb(' + (c[0] * f | 0) + ',' + (c[1] * f | 0) + ',' + (c[2] * f | 0) + ')';
    const solid = (x, y, z) => !!cell(x, y, z);
    for (let y = 0; y < ny; y++) for (let vx = 0; vx < dx; vx++) for (let vz = 0; vz < dz; vz++) {
      const [x, z] = inv(vx, vz), id = cell(x, y, z); if (!id) continue;
      const q1 = inv(vx + 1, vz), q2 = inv(vx, vz + 1);
      const up = !solid(x, y + 1, z), fx = vx + 1 >= dx || !solid(q1[0], y, q1[1]), fz = vz + 1 >= dz || !solid(q2[0], y, q2[1]);
      if (!up && !fx && !fz) continue;
      const c = rgbOf(baseOf(S.pal[id])), px = ox + (vx - vz) * w / 2, py = oy + (vx + vz) * h / 2 - y * h - h / 2 + 0;
      if (up) { g.fillStyle = shade(c, 1); g.beginPath(); g.moveTo(px, py - h / 2); g.lineTo(px + w / 2, py); g.lineTo(px, py + h / 2); g.lineTo(px - w / 2, py); g.fill(); }
      if (fz) { g.fillStyle = shade(c, .7); g.beginPath(); g.moveTo(px - w / 2, py); g.lineTo(px, py + h / 2); g.lineTo(px, py + h * 1.5); g.lineTo(px - w / 2, py + h); g.fill(); }
      if (fx) { g.fillStyle = shade(c, .5); g.beginPath(); g.moveTo(px + w / 2, py); g.lineTo(px, py + h / 2); g.lineTo(px, py + h * 1.5); g.lineTo(px + w / 2, py + h); g.fill(); }
    }
    void baseY;
  }

  /* ---------- Formas ---------- */
  function shape(t, a, b, fn) {
    const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), z0 = Math.min(a[1], b[1]), z1 = Math.max(a[1], b[1]);
    if (t === 'line') { let [x, z] = a; const dx = Math.abs(b[0] - x), dz = Math.abs(b[1] - z), sx = x < b[0] ? 1 : -1, sz = z < b[1] ? 1 : -1; let e = dx - dz; for (; ;) { fn(x, z); if (x === b[0] && z === b[1]) break; const e2 = 2 * e; if (e2 > -dz) { e -= dz; x += sx; } if (e2 < dx) { e += dx; z += sz; } } return; }
    if (t === 'rect') { for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) { if (S.hollow && x > x0 && x < x1 && z > z0 && z < z1) continue; fn(x, z); } return; }
    if (t === 'ellipse') { const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, rx = (x1 - x0 + 1) / 2, rz = (z1 - z0 + 1) / 2; const inside = (x, z) => ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2 <= 1; for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) { if (!inside(x, z)) continue; if (S.hollow && inside(x - 1, z) && inside(x + 1, z) && inside(x, z - 1) && inside(x, z + 1)) continue; fn(x, z); } }
  }
  function commitShape(t, a, b, v) {
    const cells = []; shape(t, a, b, (x, z) => cells.push([x, z]));
    cells.forEach(([x, z]) => stamp(x, z, v));
  }
  function stamp(x, z, v) {
    const pts = [[x, z]]; if (S.mx) pts.push([S.sx - 1 - x, z]); if (S.mz) pts.push([x, S.sz - 1 - z]); if (S.mx && S.mz) pts.push([S.sx - 1 - x, S.sz - 1 - z]);
    const tall = v && D.isTall(S.pal[v]), hh = tall ? 1 : S.height;
    pts.forEach(([a, b]) => { for (let k = 0; k < hh; k++) place(a, S.layer + k, b, v); });
  }
  function brushAt(x, z, v) { const r = S.brush, o = (r - 1) >> 1; for (let i = 0; i < r; i++) for (let j = 0; j < r; j++) stamp(x - o + i, z - o + j, v); }
  function sphere(c, edge, v) {
    const r = Math.max(0.5, Math.hypot(edge[0] - c[0], edge[1] - c[1])), R = Math.ceil(r);
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) for (let dz = -R; dz <= R; dz++) {
      const d = Math.hypot(dx, dy, dz); if (d > r + 0.35) continue; if (S.hollow && d < r - 0.65) continue;
      const x = c[0] + dx, y = S.layer + dy, z = c[1] + dz; place(x, y, z, v);
      if (S.mx) place(S.sx - 1 - x, y, z, v); if (S.mz) place(x, y, S.sz - 1 - z, v); if (S.mx && S.mz) place(S.sx - 1 - x, y, S.sz - 1 - z, v);
    }
  }
  function flood(x, z, v) {
    const t = S.grid[gi(x, S.layer, z)]; if (t === v) return; const st = [[x, z]]; let n = 0;
    while (st.length && n < 4e6) { const [a, b] = st.pop(); if (a < 0 || b < 0 || a >= S.sx || b >= S.sz || S.grid[gi(a, S.layer, b)] !== t) continue; place(a, S.layer, b, v); n++; st.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]); }
  }

  /* ---------- Portapapeles / selección ---------- */
  function selBox() { const s = S.sel; return { x0: Math.min(s.x0, s.x1), x1: Math.max(s.x0, s.x1), z0: Math.min(s.z0, s.z1), z1: Math.max(s.z0, s.z1), y0: s.y0, y1: Math.min(S.sy - 1, s.y1) }; }
  function copySel() {
    const b = selBox(), w = b.x1 - b.x0 + 1, h = b.y1 - b.y0 + 1, d = b.z1 - b.z0 + 1, cells = new Uint16Array(w * h * d), ch = new Map();
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) { cells[(x * h + y) * d + z] = S.grid[gi(b.x0 + x, b.y0 + y, b.z0 + z)]; const k = (b.x0 + x) + ',' + (b.y0 + y) + ',' + (b.z0 + z); if (S.chests.has(k)) ch.set(x + ',' + y + ',' + z, JSON.parse(JSON.stringify(S.chests.get(k)))); }
    S.clip = { w, h, d, cells, chests: ch };
  }
  function eachSel(fn) { const b = selBox(); beginOp(); for (let x = b.x0; x <= b.x1; x++) for (let y = b.y0; y <= b.y1; y++) for (let z = b.z0; z <= b.z1; z++) fn(x, y, z); endOp(); }
  function pasteAt(px, pz) {
    const c = S.clip; beginOp();
    for (let x = 0; x < c.w; x++) for (let y = 0; y < c.h; y++) for (let z = 0; z < c.d; z++) {
      const v = c.cells[(x * c.h + y) * c.d + z]; if (!v && !S.pasteAir) continue; const X = px + x, Y = S.layer + y, Z = pz + z; if (!inb(X, Y, Z)) continue;
      setB(X, Y, Z, v); const cc = c.chests.get(x + ',' + y + ',' + z); if (cc && S.chests.has(X + ',' + Y + ',' + Z)) S.chests.set(X + ',' + Y + ',' + Z, JSON.parse(JSON.stringify(cc)));
    }
    endOp();
  }
  function xfClip(o) {
    const c = S.clip, r = xfArray(c.cells, c.w, c.h, c.d, o), nc = new Map(); c.chests.forEach((v, k) => { const [x, y, z] = k.split(',').map(Number); nc.set(r.map(x, y, z).join(','), v); });
    S.clip = { w: r.w, h: r.h, d: r.d, cells: r.dst, chests: nc };
  }

  /* ---------- Interacción del canvas ---------- */
  let drag = null; const ptrs = new Map(); let spaceDown = false;
  function cellAt(e) { const r = cv.getBoundingClientRect(), v = S.view; const x = Math.floor((e.clientX - r.left - v.ox) / v.z), z = Math.floor((e.clientY - r.top - v.oy) / v.z); return [x, z]; }
  const inCell = (c) => c[0] >= 0 && c[1] >= 0 && c[0] < S.sx && c[1] < S.sz;
  function onDown(e) {
    if (e.button === 2) return; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 2) { drag = { type: 'pinch' }; const [a, b] = Array.from(ptrs.values()); drag.d = Math.hypot(a.x - b.x, a.y - b.y); drag.cx = (a.x + b.x) / 2; drag.cy = (a.y + b.y) / 2; if (op) { endOp(); } return; }
    e.preventDefault(); const c = cellAt(e), t = S.tool;
    if (e.button === 1 || spaceDown || t === 'pan') { drag = { type: 'pan', x: e.clientX, y: e.clientY, ox: S.view.ox, oy: S.view.oy }; return; }
    const v = t === 'eraser' ? 0 : palIdx(S.cur);
    if (t === 'pick') { if (inCell(c)) { const id = S.grid[gi(c[0], S.layer, c[1])]; if (id) { setCur(S.pal[id]); S.tool = 'pencil'; updateTools(); } } return; }
    if (t === 'container') { const k = c[0] + ',' + S.layer + ',' + c[1]; if (S.chests.has(k)) { S.selChest = k; setTab('loot'); renderLoot(); reqDraw(); } else toast(T('No container here.')); return; }
    if (t === 'paste') { if (S.clip) { pasteAt(c[0], c[1]); } return; }
    if (!inCell(c) && t !== 'select') return;
    if (t === 'select') { S.sel = { x0: c[0], z0: c[1], x1: c[0], z1: c[1], y0: S.layer, y1: S.layer + S.height - 1 }; drag = { type: 'sel' }; reqDraw(); return; }
    beginOp();
    if (t === 'fill') { flood(c[0], c[1], palIdx(S.cur)); endOp(); afterEdit(); return; }
    if (t === 'pencil' || t === 'eraser') { drag = { type: 'free', v, last: c }; brushAt(c[0], c[1], v); reqDraw(); return; }
    drag = { type: 'shape', a: c, b: c, v };
  }
  function onMove(e) {
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const c = cellAt(e), co = $('#stCoord'); if (co) co.textContent = inCell(c) ? 'x ' + c[0] + '  y ' + S.layer + '  z ' + c[1] : '—';
    hover = inCell(c) ? c : null;
    if (!drag) { reqDraw(); return; }
    if (drag.type === 'pinch') { if (ptrs.size < 2) return; const [a, b] = Array.from(ptrs.values()), d = Math.hypot(a.x - b.x, a.y - b.y), r = cv.getBoundingClientRect(), cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2; S.view.ox += cx - drag.cx; S.view.oy += cy - drag.cy; zoomAt(d / drag.d, cx - r.left, cy - r.top); drag.d = d; drag.cx = cx; drag.cy = cy; return; }
    if (drag.type === 'pan') { S.view.ox = drag.ox + e.clientX - drag.x; S.view.oy = drag.oy + e.clientY - drag.y; reqDraw(); return; }
    if (drag.type === 'sel') { S.sel.x1 = clamp(c[0], 0, S.sx - 1); S.sel.z1 = clamp(c[1], 0, S.sz - 1); reqDraw(); return; }
    if (drag.type === 'free') { shape('line', drag.last, c, (x, z) => { if (x >= 0 && z >= 0 && x < S.sx && z < S.sz) brushAt(x, z, drag.v); }); drag.last = c; reqDraw(); return; }
    if (drag.type === 'shape') {
      drag.b = c; const t = S.tool; if (t === 'sphere') { prevCells = null; reqDraw(); return; }
      const cells = []; let bx0 = 1e9, bx1 = -1, bz0 = 1e9, bz1 = -1; shape(t, drag.a, c, (x, z) => { if (cells.length < 200000) cells.push([x, z]); else cells.length = 200001; }); if (t === 'rect' || t === 'ellipse') { bx0 = Math.min(drag.a[0], c[0]); bx1 = Math.max(drag.a[0], c[0]); bz0 = Math.min(drag.a[1], c[1]); bz1 = Math.max(drag.a[1], c[1]); }
      prevCells = cells; prevCells.bx0 = bx0; prevCells.bx1 = bx1; prevCells.bz0 = bz0; prevCells.bz1 = bz1; reqDraw();
    }
  }
  function onUp(e) {
    ptrs.delete(e.pointerId); if (!drag) return;
    if (drag.type === 'pinch') { if (ptrs.size < 2) drag = null; return; }
    const d = drag; drag = null;
    if (d.type === 'shape') { const t = S.tool; if (t === 'sphere') sphere(d.a, d.b, d.v); else commitShape(t, d.a, d.b, d.v); prevCells = null; endOp(); afterEdit(); }
    else if (d.type === 'free') { endOp(); afterEdit(); }
    else if (d.type === 'sel') { renderOpts(); reqDraw(); }
  }
  function afterEdit() { reqDraw(); if (S.newChest) { S.newChest = false; setTab('loot'); renderLoot(); } }

  /* ---------- Loot (UI) ---------- */
  let lootSetSel = null;
  function renderLootIfNeeded() { if (S.tab === 'loot') renderLoot(); else { const p = $('#stPanLoot'); if (p) p.dataset.stale = '1'; } }
  const slotsOf = (key) => { const k = D.containerOf(S.pal[S.grid[gi(...key.split(',').map(Number))]] || ''); return k ? k.slots : 27; };
  function itemSlot(id, n, cls) { const b = document.createElement('i'); b.className = 'st-ic ' + (cls || ''); paintItem(b, id); if (n > 1) { const u = document.createElement('u'); u.textContent = n; b.appendChild(u); } return b.outerHTML; }
  function renderLoot() {
    const p = $('#stPanLoot'); if (!p) return; p.dataset.stale = '';
    const keys = Array.from(S.chests.keys()); let h = '';
    if (S.selChest && !S.chests.has(S.selChest)) S.selChest = null;
    if (!S.selChest && keys.length) S.selChest = keys[0];
    h += `<div class="st-sec"><div class="st-sech">${T('Containers')} <span class="st-badge">${keys.length}</span></div>`;
    if (!keys.length) h += `<p class="st-muted">${T('No containers yet. Place a chest, barrel, shulker box, dispenser, dropper or hopper and it appears here.')}</p>`;
    else {
      h += `<div class="st-clist">${keys.map((k) => { const [x, y, z] = k.split(','), c = S.chests.get(k), id = S.pal[S.grid[gi(+x, +y, +z)]] || ''; return `<button class="st-crow ${k === S.selChest ? 'on' : ''}" data-ck="${k}"><i class="st-ic" data-pid="${esc(baseOf(id))}"></i><span><b>${esc(labelOf(id))}</b><small>${x}, ${y}, ${z}</small></span><em>${c.mode === 'items' ? T('Fixed items') : c.mode === 'loot' ? T('Random loot') : T('Empty')}</em></button>`; }).join('')}</div>`;
      const k = S.selChest, c = S.chests.get(k), [x, y, z] = k.split(','), n = slotsOf(k);
      h += `<div class="st-ced"><div class="st-ceh">${T('Container at {0}, {1}, {2}').replace('{0}', x).replace('{1}', y).replace('{2}', z)}</div>
      <input type="text" id="stCName" placeholder="${T('Custom name (optional)')}" value="${esc(c.name || '')}">
      <div class="st-seg" id="stMode"><button data-mode="empty" class="${c.mode === 'empty' ? 'on' : ''}">${T('Empty')}</button><button data-mode="items" class="${c.mode === 'items' ? 'on' : ''}">${T('Fixed items')}</button><button data-mode="loot" class="${c.mode === 'loot' ? 'on' : ''}">${T('Random loot')}</button></div>`;
      if (c.mode === 'items') {
        const cols = n === 5 ? 5 : 9; h += `<div class="st-islots" style="--c:${cols}">`; for (let i = 0; i < n; i++) { const it = c.items[i]; h += `<button class="st-is ${S.slotSel === i ? 'on' : ''}" data-slot="${i}" title="${T('Slot {0}').replace('{0}', i + 1)}">${it && it.id ? itemSlot(it.id, it.n) : ''}</button>`; } h += '</div>';
        const sit = c.items[S.slotSel]; if (S.slotSel != null && S.slotSel < n) h += `<div class="st-islot-ed"><b>${T('Slot {0}').replace('{0}', S.slotSel + 1)}</b>${sit && sit.id ? `<span class="st-iname">${esc(labelOf(sit.id))}</span><label>${T('Count')}<input type="number" id="stICount" min="1" max="64" value="${sit.n || 1}"></label>` : ''}<button class="st-btn sm" id="stIPick">${T('Select an item…')}</button>${sit && sit.id ? `<button class="st-btn sm danger" id="stIClear">${T('Clear slot')}</button>` : ''}</div>`;
      }
      if (c.mode === 'loot') {
        h += `<label class="st-pr"><span>${T('Loot set')}</span><select id="stCLoot"><option value="">—</option>${S.loots.map((l) => `<option value="${l.id}" ${c.loot === l.id ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</select></label><p class="st-muted">${T('Every time a player opens the chest for the first time the game rolls the pools again, so each chest gets different loot.')}</p>`;
      }
      h += '</div>';
    }
    h += '</div>';
    // conjuntos
    if (S.loots.length && !S.loots.find((l) => l.id === lootSetSel)) lootSetSel = S.loots[0].id;
    h += `<div class="st-sec"><div class="st-sech">${T('Loot sets')} <span class="st-badge">${S.loots.length}</span><span class="st-sp"></span><button class="st-btn sm" id="stLNew">${ico('plus', 14)} ${T('New loot set')}</button>
      <select id="stLPre" class="st-mini"><option value="">${T('Preset…')}</option>${Object.keys(PRESETS).map((k) => `<option value="${k}">${T(k)}</option>`).join('')}</select></div>`;
    if (S.loots.length) {
      h += `<div class="st-ltabs">${S.loots.map((l) => `<button data-ls="${l.id}" class="${l.id === lootSetSel ? 'on' : ''}">${esc(l.name)}</button>`).join('')}</div>`;
      const L = S.loots.find((l) => l.id === lootSetSel);
      h += `<div class="st-lset"><div class="st-lhead"><input type="text" id="stLName" value="${esc(L.name)}"><button class="st-btn sm" id="stLDup">${T('Duplicate')}</button><button class="st-btn sm danger" id="stLDel">${T('Delete')}</button></div>`;
      L.pools.forEach((pl, pi) => {
        h += `<div class="st-pool"><div class="st-poolh"><b>${T('Pool')} ${pi + 1}</b><label>${T('Rolls')}<input type="number" min="0" max="64" data-pf="min" data-pi="${pi}" value="${pl.min}"></label><span>–</span><input type="number" min="0" max="64" data-pf="max" data-pi="${pi}" value="${pl.max}"><label>${T('Nothing (weight)')}<input type="number" min="0" max="999" data-pf="nothing" data-pi="${pi}" value="${pl.nothing}"></label><button class="st-ib sm" data-pdel="${pi}" title="${T('Delete')}">${ico('x', 14)}</button></div>`;
        h += `<div class="st-ents">${pl.entries.map((en, ei) => `<div class="st-ent"><button class="st-ic big" data-epick="${pi}:${ei}" data-pid="${esc(en.id)}" title="${esc(en.id)}"></button><span class="st-ename">${esc(labelOf(en.id))}</span><label>${T('Weight')}<input type="number" min="1" max="999" data-ef="w" data-pe="${pi}:${ei}" value="${en.w}"></label><label>${T('Min')}<input type="number" min="1" max="64" data-ef="min" data-pe="${pi}:${ei}" value="${en.min}"></label><label>${T('Max')}<input type="number" min="1" max="64" data-ef="max" data-pe="${pi}:${ei}" value="${en.max}"></label><button class="st-ib sm" data-edel="${pi}:${ei}">${ico('x', 14)}</button></div>`).join('')}</div><button class="st-btn sm" data-eadd="${pi}">${ico('plus', 14)} ${T('Add item')}</button></div>`;
      });
      h += `<button class="st-btn sm" id="stPAdd">${ico('plus', 14)} ${T('Add pool')}</button></div>`;
    }
    h += '</div>';
    p.innerHTML = h;
    p.querySelectorAll('[data-pid]').forEach((el) => paintItem(el, el.dataset.pid));
  }
  function lootEvents(e) {
    const t = e.target, c = S.selChest && S.chests.get(S.selChest);
    const cr = t.closest('[data-ck]'); if (cr) { S.selChest = cr.dataset.ck; const p = S.selChest.split(',').map(Number); S.layer = clamp(p[1], 0, S.sy - 1); $('#stLayer').value = S.layer; S.slotSel = null; renderLoot(); reqDraw(); return; }
    const mode = t.closest('[data-mode]'); if (mode && c) { c.mode = mode.dataset.mode; if (c.mode === 'loot' && !c.loot) { if (!S.loots.length) { S.loots.push(presetToSet('Dungeon')); lootSetSel = S.loots[0].id; } c.loot = S.loots[0].id; } renderLoot(); return; }
    const sl = t.closest('[data-slot]'); if (sl && c) { S.slotSel = +sl.dataset.slot; renderLoot(); if (!c.items[S.slotSel]) pickItem((id) => { c.items[S.slotSel] = { id, n: 1 }; renderLoot(); }); return; }
    if (t.closest('#stIPick') && c) { pickItem((id) => { const o = c.items[S.slotSel]; c.items[S.slotSel] = { id, n: o ? o.n : 1 }; renderLoot(); }); return; }
    if (t.closest('#stIClear') && c) { delete c.items[S.slotSel]; renderLoot(); return; }
    const ls = t.closest('[data-ls]'); if (ls) { lootSetSel = ls.dataset.ls; renderLoot(); return; }
    const L = S.loots.find((l) => l.id === lootSetSel);
    if (t.closest('#stLNew')) { const n = emptySet(); S.loots.push(n); lootSetSel = n.id; renderLoot(); return; }
    if (t.closest('#stLDup') && L) { const n = JSON.parse(JSON.stringify(L)); n.id = 'loot_' + (S.loot_n++); n.name += ' 2'; S.loots.push(n); lootSetSel = n.id; renderLoot(); return; }
    if (t.closest('#stLDel') && L) { if (!confirm(T('Delete this loot set?'))) return; S.loots = S.loots.filter((l) => l !== L); S.chests.forEach((cc) => { if (cc.loot === L.id) cc.loot = S.loots[0] ? S.loots[0].id : null; }); renderLoot(); return; }
    if (t.closest('#stPAdd') && L) { L.pools.push({ min: 1, max: 2, nothing: 0, entries: [] }); renderLoot(); return; }
    const pd = t.closest('[data-pdel]'); if (pd && L) { L.pools.splice(+pd.dataset.pdel, 1); renderLoot(); return; }
    const ea = t.closest('[data-eadd]'); if (ea && L) { const pi = +ea.dataset.eadd; pickItem((id) => { L.pools[pi].entries.push({ id, w: 5, min: 1, max: 1 }); renderLoot(); }); return; }
    const ed = t.closest('[data-edel]'); if (ed && L) { const [pi, ei] = ed.dataset.edel.split(':').map(Number); L.pools[pi].entries.splice(ei, 1); renderLoot(); return; }
    const ep = t.closest('[data-epick]'); if (ep && L) { const [pi, ei] = ep.dataset.epick.split(':').map(Number); pickItem((id) => { L.pools[pi].entries[ei].id = id; renderLoot(); }); return; }
  }
  function lootInput(e) {
    const t = e.target, c = S.selChest && S.chests.get(S.selChest), L = S.loots.find((l) => l.id === lootSetSel);
    if (t.id === 'stCName' && c) c.name = t.value;
    else if (t.id === 'stICount' && c) { const it = c.items[S.slotSel]; if (it) { it.n = clamp(+t.value || 1, 1, 64); } }
    else if (t.id === 'stCLoot' && c) c.loot = t.value || null;
    else if (t.id === 'stLName' && L) { L.name = t.value; const b = root.querySelector('[data-ls="' + L.id + '"]'); if (b) b.textContent = t.value; }
    else if (t.id === 'stLPre') { if (t.value) { const n = presetToSet(t.value); S.loots.push(n); lootSetSel = n.id; renderLoot(); } }
    else if (t.dataset.pf && L) { L.pools[+t.dataset.pi][t.dataset.pf] = Math.max(0, +t.value || 0); }
    else if (t.dataset.ef && L) { const [pi, ei] = t.dataset.pe.split(':').map(Number); L.pools[pi].entries[ei][t.dataset.ef] = Math.max(1, +t.value || 1); }
  }
  function pickItem(cb) {
    const pop = $('#stPop'); let src = 'vanilla', q = '', n = 160; pop.hidden = false;
    const draw = () => {
      const base = src === 'vanilla' ? D.ITEMS : PROJ.items.concat(PROJ.blocks), ql = q.trim().toLowerCase().replace(/ /g, '_');
      const l = base.filter((id) => !ql || id.toLowerCase().indexOf(ql) >= 0);
      pop.querySelector('.st-ig').innerHTML = l.slice(0, n).map((id) => `<button class="st-is" data-id="${esc(full(id))}" title="${esc(id)}"><i class="st-ic" data-pid="${esc(full(id))}"></i></button>`).join('') + (l.length > n ? `<button class="st-more" id="stIMore">${T('Show more')} (${l.length - n})</button>` : '') + (!l.length ? `<p class="st-muted">${src === 'addon' ? T('No items found in your addon yet (BP/items and BP/blocks).') : ''}</p>` : '');
      pop.querySelectorAll('.st-ig [data-pid]').forEach((el) => paintItem(el, el.dataset.pid));
      pop.querySelectorAll('[data-src]').forEach((b) => b.classList.toggle('on', b.dataset.src === src));
    };
    pop.innerHTML = `<div class="st-dlg wide"><div class="st-dh"><b>${T('Pick an item')}</b><button class="st-ib" id="stIX">${ico('x', 16)}</button></div>
      <div class="st-seg"><button data-src="vanilla">${T('Vanilla')} (${D.ITEMS.length})</button><button data-src="addon">${T('Your addon')} (${PROJ.items.length + PROJ.blocks.length})</button></div>
      <input type="search" id="stIQ" placeholder="${T('Search items…')}" autofocus><div class="st-ig"></div>
      <div class="st-custom"><input type="text" id="stICustom" placeholder="${T('Custom id (namespace:name)')}" spellcheck="false"><button class="st-btn sm" id="stICGo">${T('Use')}</button></div></div>`;
    const done = (id) => { pop.hidden = true; pop.innerHTML = ''; id && cb(id); };
    pop.onclick = (e) => { const b = e.target.closest('.st-is'); if (b && b.dataset.id) return done(b.dataset.id); if (e.target.closest('#stIX') || e.target === pop) return done(); if (e.target.closest('#stIMore')) { n += 200; draw(); return; } const s = e.target.closest('[data-src]'); if (s) { src = s.dataset.src; n = 160; draw(); } if (e.target.closest('#stICGo')) { const v = pop.querySelector('#stICustom').value.trim(); if (v) done(full(v)); } };
    pop.querySelector('#stIQ').oninput = (e) => { q = e.target.value; n = 160; draw(); };
    draw(); setTimeout(() => { const i = pop.querySelector('#stIQ'); i && i.focus(); }, 30);
  }

  /* ---------- Exportar ---------- */
  function pieceGrid() {
    const t = S.split ? S.tile : 1e9;
    return [Math.ceil(S.sx / t), Math.ceil(S.sy / t), Math.ceil(S.sz / t), Math.min(t, 1e9)];
  }
  function renderExport() {
    const p = $('#stPanExport'), folders = U.folderPaths(), pg = pieceGrid(), n = pg[0] * pg[1] * pg[2], vol = S.sx * S.sy * S.sz;
    p.innerHTML = `<div class="st-sec"><label class="st-f">${T('Save to folder')}<input type="text" id="stFolder" list="stFolders" value="${esc(S.folder)}" spellcheck="false"><datalist id="stFolders">${folders.map((f) => `<option value="${esc(f)}">`).join('')}</datalist></label>
    <label class="st-o chk"><input type="checkbox" id="stScript" ${S.script ? 'checked' : ''}><span>${T('Also generate script (/scriptevent fd:structure)')}</span></label>
    <label class="st-o chk"><input type="checkbox" id="stWalls" ${S.walls ? 'checked' : ''}><span>${T('Auto-connect walls')}</span></label>
    <label class="st-o chk"><input type="checkbox" id="stSplit" ${S.split ? 'checked' : ''}><span>${T('Split into pieces')}</span></label>
    <label class="st-pr"><span>${T('Piece size')}</span><select id="stTile">${[32, 48, 64, 96, 128].map((v) => `<option value="${v}" ${S.tile === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    <p class="st-muted">${T('This structure will be saved as {0} piece(s).').replace('{0}', S.split ? n : 1)} ${vol > 262144 ? T('Huge structures are exported in pieces automatically.') : ''}</p>
    <p class="st-muted">${T('Loot tables are written to {0}').replace('{0}', 'BP/loot_tables/structures/' + (U.slug(S.name) || 'name') + '/')}</p>
    <p class="st-muted">${T('Preview shows a simplified view for very big structures.')}</p></div>`;
  }
  const slugName = () => U.slug(S.name);
  function prepareExport() {
    // conecta muros: devuelve {grid,pal} (copia sólo si hay muros)
    if (!S.walls || !S.pal.some((s) => D.isWall(s))) return { grid: S.grid, pal: S.pal };
    const pal = S.pal.slice(), pm = new Map(pal.map((s, i) => [s, i])), g = S.grid.slice();
    const pi = (s) => { let i = pm.get(s); if (i === undefined) { i = pal.length; pal.push(s); pm.set(s, i); } return i; };
    const SOLID_NO = /(stairs|slab|door|trapdoor|fence|pane|bars|torch|lantern|ladder|button|plate|carpet|rail|sapling|flower|grass|fern|vine|lever|banner|head|skull|candle|bed$|chain|water|lava|leaves|web|petals|rod|campfire|cauldron|hopper|anvil|chest|bell|lectern|scaffolding|pot|frame|bush|coral|kelp|seagrass|mushroom|roots|tulip|orchid|allium|bluet|daisy|cornflower|lily|poppy|dandelion|rose|peony|lilac|sunflower|cake|air)/;
    const conn = (s) => !!s && (D.isWall(s) || !SOLID_NO.test(shortName(s)));
    const wallSet = new Set(); S.pal.forEach((s, i) => { if (D.isWall(s)) wallSet.add(i); });
    const dirs = [['east', 1, 0], ['west', -1, 0], ['south', 0, 1], ['north', 0, -1]];
    for (let x = 0; x < S.sx; x++) for (let y = 0; y < S.sy; y++) for (let z = 0; z < S.sz; z++) {
      const v = S.grid[gi(x, y, z)]; if (!v || !wallSet.has(v)) continue; const st = {}; let e = false, w = false, s = false, n = false;
      dirs.forEach(([nm, dx, dz]) => { const X = x + dx, Z = z + dz; const nb = inb(X, y, Z) ? S.pal[S.grid[gi(X, y, Z)]] : null; const on = conn(nb); st['wall_connection_type_' + nm] = on ? 'short' : 'none'; if (nm === 'east') e = on; else if (nm === 'west') w = on; else if (nm === 'south') s = on; else n = on; });
      const up = inb(x, y + 1, z) && S.grid[gi(x, y + 1, z)] !== 0;
      st.wall_post_bit = !((e && w && !s && !n) || (s && n && !e && !w)) || up;
      const b = baseOf(S.pal[v]); g[gi(x, y, z)] = pi(fmt(b, st));
    }
    return { grid: g, pal };
  }
  function lootJson(L) {
    return { pools: L.pools.map((p) => { const entries = p.entries.map((e) => { const o = { type: 'item', name: full(e.id), weight: e.w }; const a = Math.min(e.min, e.max), b = Math.max(e.min, e.max); if (a !== 1 || b !== 1) o.functions = [{ function: 'set_count', count: a === b ? a : { min: a, max: b } }]; return o; }); if (p.nothing > 0) entries.push({ type: 'empty', weight: p.nothing }); return { rolls: Math.min(p.min, p.max) === Math.max(p.min, p.max) ? p.min : { min: Math.min(p.min, p.max), max: Math.max(p.min, p.max) }, entries }; }) };
  }

  function create() {
    const name = slugName(); if (!name) return toast(T('Invalid structure name.'));
    if (!countBlocks()) return toast(T('Build something first (the structure is empty).'));
    const { grid, pal } = prepareExport(), folderPath = (S.folder || 'BP/structures').replace(/^\/+|\/+$/g, ''), folder = U.folderByPath(folderPath), report = [];
    const bp = U.ensurePack('bp');
    // loot tables usadas
    const used = new Map(); S.chests.forEach((c) => { if (c.mode === 'loot' && c.loot) { const L = S.loots.find((l) => l.id === c.loot); if (L && !used.has(L.id)) used.set(L.id, L); } });
    const lootRel = (c) => { const L = S.loots.find((l) => l.id === c.loot); return L ? 'loot_tables/structures/' + name + '/' + (U.slug(L.name) || L.id) + '.json' : null; };
    used.forEach((L) => { const rel = 'loot_tables/structures/' + name + '/' + (U.slug(L.name) || L.id) + '.json', f = U.getFile(rel, bp.folder); f.node.content = U.J(lootJson(L)); report.push((f.created ? '+ ' : '~ ') + bp.folder.name + '/' + rel); });
    const t = S.split ? S.tile : 1e9, pcs = []; const nx = Math.ceil(S.sx / t), ny = Math.ceil(S.sy / t), nz = Math.ceil(S.sz / t), multi = nx * ny * nz > 1;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) {
      const off = [i * t, j * t, k * t], size = [Math.min(t, S.sx - off[0]), Math.min(t, S.sy - off[1]), Math.min(t, S.sz - off[2])];
      let empty = true, has = false; S.chests.forEach((c, key) => { const p = key.split(',').map(Number); if (p[0] >= off[0] && p[0] < off[0] + size[0] && p[1] >= off[1] && p[1] < off[1] + size[1] && p[2] >= off[2] && p[2] < off[2] + size[2]) has = true; });
      scan: for (let x = 0; x < size[0]; x++) for (let y = 0; y < size[1]; y++) { let q = ((off[0] + x) * S.sy + off[1] + y) * S.sz + off[2]; for (let z = 0; z < size[2]; z++, q++) if (grid[q]) { empty = false; break scan; } }
      if (empty && !has) continue;
      const pn = multi ? name + '_' + i + '_' + j + '_' + k : name, bytes = buildPiece(grid, pal, [S.sx, S.sy, S.sz], off, size, S.chests, lootRel);
      const f = U.getFile(pn + '.mcstructure', folder); f.node.content = 'data:application/octet-stream;base64,' + b64(bytes); pcs.push([pn, off[0], off[1], off[2]]);
      report.push((f.created ? '+ ' : '~ ') + folderPath + '/' + pn + '.mcstructure');
    }
    if (multi) { const lines = pcs.map((p) => `structure load mystructure:${p[0]} ~${p[1]} ~${p[2]} ~${p[3]}`).join('\n') + '\n', f = U.getFile('functions/fd_structures/' + name + '.mcfunction', bp.folder); f.node.content = '# Generated by FireDex · Structures\n' + lines; report.push((f.created ? '+ ' : '~ ') + bp.folder.name + '/functions/fd_structures/' + name + '.mcfunction'); }
    if (S.script) wireScript(bp, report, name, pcs);
    render(); saveState(); toast(T('Structure saved: {0}').replace('{0}', name));
    done(name, report, multi);
  }
  function wireScript(bp, report, name, pcs) {
    const m = bp.json; m.modules = m.modules || []; m.dependencies = m.dependencies || [];
    let sm = m.modules.find((x) => x.type === 'script');
    if (!sm) { sm = { type: 'script', language: 'javascript', uuid: U.uuid(), entry: 'scripts/main.js', version: [1, 0, 0] }; m.modules.push(sm); }
    if (!m.dependencies.some((d) => d.module_name === '@minecraft/server')) m.dependencies.push({ module_name: '@minecraft/server', version: V.server });
    bp.manifest.content = U.J(m);
    const parts = sm.entry.split('/'); parts.pop(); const dir = parts.join('/'), sp = (dir ? dir + '/' : '') + 'fd_structures.js', f = U.getFile(sp, bp.folder);
    let prev = {}; if (!f.created) { const mm = /const FD_STRUCTURES = (.*);\s*$/m.exec(f.node.content || ''); if (mm) { try { const o = JSON.parse(mm[1]); if (Array.isArray(o)) o.forEach((n) => { prev[n] = [[n, 0, 0, 0]]; }); else prev = o; } catch (e) { } } }
    prev[name] = pcs; f.node.content = scriptSource(prev); report.push((f.created ? '+ ' : '~ ') + bp.folder.name + '/' + sp);
    const en = U.getFile(sm.entry, bp.folder), imp = 'import "./fd_structures.js";';
    if (en.created) { en.node.content = '// Behavior Pack entry point\n' + imp + '\n'; report.push('+ ' + bp.folder.name + '/' + sm.entry); }
    else if (!/fd_structures\.js/.test(en.node.content || '')) { en.node.content = imp + '\n' + (en.node.content || ''); report.push('~ ' + bp.folder.name + '/' + sm.entry); }
    report.push('~ ' + bp.folder.name + '/manifest.json');
  }
  function scriptSource(map) {
    return `import { world, system } from "@minecraft/server";

// Generated by FireDex · Structures. The FD_STRUCTURES line is updated automatically.
// name -> [[piece, dx, dy, dz], ...]  (big structures are split into pieces)
const FD_STRUCTURES = ${JSON.stringify(map)};

system.afterEvents.scriptEventReceive.subscribe((ev) => {
  if (ev.id !== "fd:structure") return;
  const player = ev.sourceEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  const name = ev.message.trim().split(/\\s+/)[0];
  const pieces = FD_STRUCTURES[name];
  if (!pieces) {
    player.sendMessage("§eUsage: /scriptevent fd:structure <" + Object.keys(FD_STRUCTURES).join("|") + ">");
    return;
  }
  const o = { x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z) };
  const dim = player.dimension;
  let i = 0, failed = 0;
  // one piece per tick so huge structures do not freeze the server
  const id = system.runInterval(() => {
    const p = pieces[i++];
    if (!p) {
      system.clearRun(id);
      player.sendMessage(failed ? "§e'" + name + "' placed with " + failed + " piece(s) missing (area not loaded: use /tickingarea)." : "§aStructure '" + name + "' placed.");
      return;
    }
    try { world.structureManager.place("mystructure:" + p[0], dim, { x: o.x + p[1], y: o.y + p[2], z: o.z + p[3] }); }
    catch (e) { failed++; }
  }, 1);
}, { namespaces: ["fd"] });
`;
  }
  function done(name, report, multi) {
    const cmd = (t) => `<div class="st-cmd"><code>${esc(t)}</code><button class="st-btn sm" data-copy="${esc(t)}">${T('Copy')}</button></div>`;
    const tick = '/tickingarea add ~ ~ ~ ~' + Math.min(S.sx, 400) + ' ~' + Math.min(S.sy, 320) + ' ~' + Math.min(S.sz, 400);
    $('#stPop').hidden = false;
    $('#stPop').innerHTML = `<div class="st-dlg"><div class="st-dh"><b>${T('Done ✔')}</b></div><div class="st-done"><h4>${T('Files')}</h4><ul class="st-files">${report.map((r) => `<li class="${r[0] === '+' ? 'new' : ''}">${esc(r)}</li>`).join('')}</ul>
      <h4>${T('Place it in the world')}</h4>${multi ? `<p class="st-muted">${T('Run the function to place every piece at once:')}</p>${cmd('/function fd_structures/' + name)}` : cmd('/structure load mystructure:' + name + ' ~ ~ ~')}${S.script ? cmd('/scriptevent fd:structure ' + name) : ''}
      ${multi ? `<p class="st-muted">${T('Big structures: load the area first (/tickingarea add ~ ~ ~ ~{0} ~{1} ~{2}) or the pieces far away will not place.').replace('{0}', Math.min(S.sx, 400)).replace('{1}', Math.min(S.sy, 320)).replace('{2}', Math.min(S.sz, 400))}</p>${cmd(tick)}` : ''}
      <p class="st-muted">${T('Make sure the BP is active in the world. Structures live in the BP at structures/<name>.mcstructure and are loaded as mystructure:<name>.')}</p></div>
      <div class="st-dact"><button class="st-btn" id="stMore">${T('Add more')}</button><button class="st-btn primary" id="stFin">${T('Close')}</button></div></div>`;
    $('#stPop').onclick = (e) => {
      const c = e.target.closest('[data-copy]'); if (c) { copyToClipboard(c.dataset.copy); toast(T('Copied')); return; }
      if (e.target.closest('#stMore')) { const f = S.folder; DRAFT = null; S = newState(); S.folder = f; PROJ = projectIds(); build(); return; }
      if (e.target.closest('#stFin')) { DRAFT = null; unbind(); closeModal(); }
    };
  }

  /* ---------- Diálogos (tamaño / reemplazar) ---------- */
  function popDialog(html, onOk) {
    const pop = $('#stPop'); pop.hidden = false; pop.innerHTML = `<div class="st-dlg">${html}</div>`;
    const close = () => { pop.hidden = true; pop.innerHTML = ''; pop.onclick = null; };
    pop.onclick = (e) => { if (e.target === pop || e.target.closest('[data-x]')) close(); else if (e.target.closest('[data-ok]')) { if (onOk(pop) !== false) close(); } };
    return pop;
  }
  function resizeDialog() {
    const pop = popDialog(`<div class="st-dh"><b>${T('Resize structure')}</b></div><div class="st-rs"><label>X<input type="number" id="rX" min="1" max="${MAXAXIS}" value="${S.sx}"></label><label>Y<input type="number" id="rY" min="1" max="${MAXAXIS}" value="${S.sy}"></label><label>Z<input type="number" id="rZ" min="1" max="${MAXAXIS}" value="${S.sz}"></label></div>
      <div class="st-presets"><button data-p="16,16,16">${T('Small (16)')}</button><button data-p="64,48,64">${T('Medium (64)')}</button><button data-p="128,96,128">${T('Large (128)')}</button><button data-p="256,128,256">${T('Colossal (256×128×256)')}</button></div>
      <p class="st-muted" id="rEst"></p><div class="st-dact"><button class="st-btn" data-x>${T('Cancel')}</button><button class="st-btn primary" data-ok>${T('Apply')}</button></div>`, () => {
      const a = [+$('#rX').value, +$('#rY').value, +$('#rZ').value].map((v) => v | 0);
      if (a.some((v) => v < 1 || v > MAXAXIS)) { toast(T('Size must be between 1 and {0} per axis.').replace('{0}', MAXAXIS)); return false; }
      if (a[0] * a[1] * a[2] > MAXVOL) { toast(T('That is too large (max {0} million blocks in total).').replace('{0}', (MAXVOL / 1e6).toFixed(1))); return false; }
      if (a[0] !== S.sx || a[1] !== S.sy || a[2] !== S.sz) resizeTo(a[0], a[1], a[2]);
    });
    const est = () => { if (!pop.querySelector('#rX')) return; const v = (+pop.querySelector('#rX').value || 0) * (+pop.querySelector('#rY').value || 0) * (+pop.querySelector('#rZ').value || 0); pop.querySelector('#rEst').textContent = T('Memory estimate: ~{0} MB').replace('{0}', (v * 2 * 2 / 1048576).toFixed(1)) + ' · ' + v.toLocaleString() + ' ' + T('Blocks').toLowerCase(); };
    pop.addEventListener('input', est); pop.addEventListener('click', (e) => { const p = e.target.closest('[data-p]'); if (p && pop.querySelector('#rX')) { const [x, y, z] = p.dataset.p.split(','); pop.querySelector('#rX').value = x; pop.querySelector('#rY').value = y; pop.querySelector('#rZ').value = z; est(); } }); est();
  }
  function replaceDialog() {
    let from = baseOf(S.cur), to = 'minecraft:air';
    const pop = popDialog(`<div class="st-dh"><b>${T('Replace block…')}</b></div><div class="st-rep"><label>${T('Find')}<input id="rFrom" list="rList" value="${esc(from)}" spellcheck="false"></label><label>${T('With')}<input id="rTo" list="rList" value="${esc(to)}" spellcheck="false"></label><datalist id="rList">${S.pal.map((s) => `<option value="${esc(baseOf(s))}">`).join('')}<option value="minecraft:air"></datalist></div>
      <div class="st-dact"><button class="st-btn" data-x>${T('Cancel')}</button><button class="st-btn primary" data-ok>${T('Replace')}</button></div>`, () => {
      const f = full($('#rFrom').value.trim()), t = full($('#rTo').value.trim()); if (!f || !t) return false;
      const ti = palIdx(t === 'minecraft:air' ? 'minecraft:air' : defaultId(t)); let n = 0; const ids = new Set(); S.pal.forEach((s, i) => { if (baseOf(s) === f) ids.add(i); });
      beginOp(); for (let x = 0; x < S.sx; x++) for (let y = 0; y < S.sy; y++) for (let z = 0; z < S.sz; z++) if (ids.has(S.grid[gi(x, y, z)])) { setB(x, y, z, ti); n++; } endOp(); toast(T('Replaced {0} blocks').replace('{0}', n));
    });
    void pop;
  }

  /* ---------- Eventos globales ---------- */
  let keyH = null, resH = null, upH = null;
  function unbind() { if (keyH) document.removeEventListener('keydown', keyH, true); if (keyH) document.removeEventListener('keyup', keyH, true); window.removeEventListener('resize', resH); window.removeEventListener('pointerup', upH); keyH = null; root = null; cv = null; }
  function wire() {
    $('#stBack').onclick = () => closeTool(true);
    $('#stName').oninput = (e) => { S.name = e.target.value; const p = $('#stPanExport .st-muted:nth-of-type(2)'); void p; };
    $('#stName').onchange = renderExport;
    $('#stGo').onclick = create; $('#stSize').onclick = resizeDialog; $('#stUndo').onclick = doUndo; $('#stRedo').onclick = doRedo;
    $('#stZi').onclick = () => zoomAt(1.4, cv.clientWidth / 2, cv.clientHeight / 2); $('#stZo').onclick = () => zoomAt(1 / 1.4, cv.clientWidth / 2, cv.clientHeight / 2); $('#stFit').onclick = fitView;
    const setLayer = (v) => { S.layer = clamp(v, 0, S.sy - 1); $('#stLayer').value = S.layer; reqDraw(); if (S.cut) drawIso(); };
    $('#stLayer').oninput = (e) => setLayer(+e.target.value); $('#stLD').onclick = () => setLayer(S.layer - 1); $('#stLU').onclick = () => setLayer(S.layer + 1);
    $('#stCut').onchange = (e) => { S.cut = e.target.checked; drawIso(); }; $('#stRot').onclick = () => { S.rot = (S.rot + 1) % 4; drawIso(); };
    const ml = $('#stMenuList'); $('#stMenu').onclick = (e) => { e.stopPropagation(); ml.hidden = !ml.hidden; };
    root.addEventListener('click', (e) => { if (!e.target.closest('.st-menuwrap')) ml.hidden = true; });
    ml.onclick = (e) => { const b = e.target.closest('[data-m]'); if (!b) return; ml.hidden = true; const m = b.dataset.m; if (m === 'resize') resizeDialog(); else if (m === 'replace') replaceDialog(); else if (m === 'trim') trim(); else if (m === 'clear') { if (confirm(T('Clear everything') + '?')) fullOp(() => { S.grid = new Uint16Array(S.sx * S.sy * S.sz); S.chests = new Map(); S.selChest = null; }); } else transformAll(m); };
    $('#stTools').onclick = (e) => { const b = e.target.closest('[data-tool]'); if (b) { S.tool = b.dataset.tool; prevCells = null; updateTools(); reqDraw(); } };
    $('#stOpts').onchange = (e) => { const t = e.target; if (t.id === 'stBrush') S.brush = clamp(+t.value || 1, 1, 9); else if (t.id === 'stHeight') { S.height = clamp(+t.value || 1, 1, S.sy); if (S.sel) { S.sel.y1 = S.sel.y0 + S.height - 1; renderOpts(); } } else if (t.id === 'stHollow') S.hollow = t.checked; else if (t.id === 'stMX') S.mx = t.checked; else if (t.id === 'stMZ') S.mz = t.checked; else if (t.id === 'stPAir') S.pasteAir = t.checked; };
    $('#stOpts').onclick = (e) => {
      const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.a;
      if (k === 'copy' && S.sel) { copySel(); toast(T('Copy')); S.tool = 'paste'; updateTools(); }
      else if (k === 'cut' && S.sel) { copySel(); eachSel((x, y, z) => setB(x, y, z, 0)); S.tool = 'paste'; updateTools(); changed(); }
      else if (k === 'del' && S.sel) { eachSel((x, y, z) => setB(x, y, z, 0)); changed(); }
      else if (k === 'fillsel' && S.sel) { const v = palIdx(S.cur); if (!D.isTall(S.cur)) eachSel((x, y, z) => setB(x, y, z, v)); changed(); }
      else if (k === 'paste') { S.tool = 'paste'; updateTools(); }
      else if (k === 'cflipx') xfClip('mx'); else if (k === 'cflipz') xfClip('mz'); else if (k === 'crot') xfClip('rot');
      else if (k === 'pdone') { S.tool = 'pencil'; updateTools(); }
      if (/^c(flip|rot)/.test(k)) { renderOpts(); reqDraw(); }
      reqDraw();
    };
    $('#stTabs').onclick = (e) => { const b = e.target.closest('[data-tab]'); if (b) { setTab(b.dataset.tab); if (b.dataset.tab === 'loot') renderLoot(); } };
    // bloques
    const pb = $('#stPanBlocks');
    pb.oninput = (e) => { if (e.target.id === 'stQ') { S.q = e.target.value; showN = 150; fillGrid(); } };
    pb.onclick = (e) => {
      const c = e.target.closest('[data-cat]'); if (c) { S.cat = c.dataset.cat; showN = 150; root.querySelectorAll('#stCats button').forEach((b) => b.classList.toggle('on', b === c)); fillGrid(); return; }
      const s = e.target.closest('.st-slot[data-pick]'); if (s) { setCur(s.dataset.id); return; }
      if (e.target.closest('#stCustomGo')) { const v = $('#stCustom').value.trim(); if (v) setCur(defaultId(full(v))); }
    };
    pb.onchange = (e) => { const t = e.target; if (!t.dataset.k) return; const cur = splitId(S.cur); cur.st[t.dataset.k] = t.type === 'checkbox' ? t.checked : (t.dataset.t === 'int' ? parseInt(t.value, 10) : t.value); setCur(fmt(cur.base, cur.st)); };
    pb.onkeydown = (e) => { if (e.key === 'Enter' && e.target.id === 'stCustom') $('#stCustomGo').click(); };
    $('#stHot').onclick = (e) => { const s = e.target.closest('.st-slot'); if (s) { S.hi = +s.dataset.hi; S.cur = S.hot[S.hi]; if (/^(eraser|pick|container|pan)$/.test(S.tool)) { S.tool = 'pencil'; updateTools(); } renderHot(); renderProps(); } };
    const pl = $('#stPanLoot'); pl.onclick = lootEvents; pl.oninput = lootInput; pl.onchange = (e) => { if (e.target.tagName === 'SELECT' || e.target.type === 'number') { if (e.target.dataset.ef || e.target.dataset.pf || e.target.id === 'stCLoot') { if (e.target.id !== 'stCLoot') renderLoot(); } } };
    const pe = $('#stPanExport');
    pe.oninput = (e) => { const t = e.target; if (t.id === 'stFolder') S.folder = t.value; };
    pe.onchange = (e) => { const t = e.target; if (t.id === 'stScript') S.script = t.checked; else if (t.id === 'stWalls') S.walls = t.checked; else if (t.id === 'stSplit') { S.split = t.checked; renderExport(); } else if (t.id === 'stTile') { S.tile = +t.value; renderExport(); } };
    // canvas
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerleave', () => { hover = null; reqDraw(); }); upH = onUp; window.addEventListener('pointerup', onUp); cv.addEventListener('pointercancel', onUp);
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    cv.addEventListener('wheel', (e) => { e.preventDefault(); const r = cv.getBoundingClientRect(); if (e.shiftKey) { setLayer(S.layer + (e.deltaY > 0 ? -1 : 1)); return; } zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
    resH = () => { reqDraw(); drawIso(); }; window.addEventListener('resize', resH);
    if (window.ResizeObserver) new ResizeObserver(() => { reqDraw(); }).observe($('#stView'));
    keyH = (e) => {
      if (!root || !document.body.contains(root)) return;
      if (e.type === 'keyup') { if (e.code === 'Space') spaceDown = false; return; }
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) && !(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (e.code === 'Space') { spaceDown = true; e.preventDefault(); return; }
      if (e.ctrlKey || e.metaKey) { if (k === 'z') { e.preventDefault(); e.shiftKey ? doRedo() : doUndo(); } else if (k === 'y') { e.preventDefault(); doRedo(); } else if (k === 'c' && S.sel) { copySel(); } else if (k === 'x' && S.sel) { copySel(); eachSel((x, y, z) => setB(x, y, z, 0)); changed(); } else if (k === 'v' && S.clip) { S.tool = 'paste'; updateTools(); } return; }
      if (/^[1-9]$/.test(k)) { S.hi = +k - 1; S.cur = S.hot[S.hi]; renderHot(); renderProps(); return; }
      const map = { b: 'pencil', e: 'eraser', g: 'fill', l: 'line', r: 'rect', o: 'ellipse', c: 'sphere', m: 'select', i: 'pick', k: 'container', h: 'pan' };
      if (map[k]) { S.tool = map[k]; prevCells = null; updateTools(); reqDraw(); }
      else if (e.key === 'PageUp') { setLayer(S.layer + 1); e.preventDefault(); } else if (e.key === 'PageDown') { setLayer(S.layer - 1); e.preventDefault(); }
      else if (e.key === 'Delete' && S.sel) { eachSel((x, y, z) => setB(x, y, z, 0)); changed(); } else if (e.key === 'Escape') { if (!$('#stPop').hidden) { $('#stPop').hidden = true; $('#stPop').innerHTML = ''; } else { S.sel = null; if (S.tool === 'paste') S.tool = 'pencil'; updateTools(); reqDraw(); } }
    };
    document.addEventListener('keydown', keyH, true); document.addEventListener('keyup', keyH, true);
  }

  window.FD_STRUCT = { buildPiece, NB, D: () => D, get state() { return S; }, _test: { palIdx: (s) => palIdx(s), xfState } };
  TOOLBOX_TOOLS.push({
    id: 'structures', name: 'Structures', desc: 'Build structures of any size and add them to your addon as .mcstructure files, with chests, loot and every Minecraft block.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 10 12 5l9 5-9 5-9-5Z"/><path d="M3 10v6l9 5 9-5v-6M12 15v6"/></svg>',
    onOpen: open
  });
})();

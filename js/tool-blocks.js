/* ============================================================
   Custom blocks — creator for Bedrock custom blocks
   Writes: BP blocks/<name>.json · RP textures/blocks/<key>.png ·
           RP textures/terrain_texture.json (merged) · RP texts/en_US.lang (merged)
   Uses: FD_UTIL, FD_VANILLA, FD_VERSIONS, FD_I18N (all optional except FD_UTIL).
   ============================================================ */
(function () {
  'use strict';
  const U = window.FD_UTIL, V = window.FD_VANILLA, VER = window.FD_VERSIONS || { formats: { block: '1.21.50' } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = (x, d) => { const n = parseFloat(x); return isFinite(n) ? n : d; };
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const T = (s) => (window.FD_I18N ? window.FD_I18N.t(s) : s);

  const ES = [
    ['Custom blocks', 'Bloques personalizados'],
    ['Create custom blocks with textures, light, hardness and more. Adds every file to your addon.', 'Crea bloques personalizados con texturas, luz, dureza y más. Añade todos los archivos a tu addon.'],
    ['Identifier', 'Identificador'], ['Namespace', 'Espacio de nombres'], ['Block name (id)', 'Nombre del bloque (id)'],
    ['Display name', 'Nombre visible'], ['Creative menu tab', 'Pestaña del menú creativo'],
    ['Construction', 'Construcción'], ['Nature', 'Naturaleza'], ['Equipment', 'Equipamiento'], ['Items', 'Objetos'], ['Hidden', 'Oculto'],
    ['Textures', 'Texturas'], ['Same on all faces', 'Igual en todas las caras'], ['Top, bottom and sides', 'Arriba, abajo y lados'],
    ['All faces', 'Todas las caras'], ['Top', 'Arriba'], ['Bottom', 'Abajo'], ['Sides', 'Lados'],
    ['Vanilla…', 'Vanilla…'], ['Upload PNG', 'Subir PNG'], ['Clear', 'Quitar'], ['No texture', 'Sin textura'],
    ['Pick a vanilla block texture', 'Elige una textura de bloque de Minecraft'], ['Search…', 'Buscar…'], ['Back', 'Volver'],
    ['Textures come from the official repo github.com/Mojang/bedrock-samples.', 'Las texturas vienen del repositorio oficial github.com/Mojang/bedrock-samples.'],
    ['Could not load the texture (offline?).', 'No se pudo cargar la textura (¿sin conexión?).'],
    ['Rendering', 'Renderizado'], ['Opaque', 'Opaco'], ['Alpha test (cut-out)', 'Alpha test (recortado)'], ['Blend (translucent)', 'Mezcla (translúcido)'],
    ['Properties', 'Propiedades'], ['Light emission (0–15)', 'Emisión de luz (0–15)'], ['Light dampening (0–15)', 'Atenuación de luz (0–15)'],
    ['Seconds to destroy', 'Segundos para romper'], ['Explosion resistance', 'Resistencia a explosiones'], ['Friction (0–0.9)', 'Fricción (0–0.9)'],
    ['Map color', 'Color en el mapa'], ['Use map color', 'Usar color en el mapa'], ['Flammable', 'Inflamable'],
    ['Catch chance', 'Prob. de prenderse'], ['Destroy chance', 'Prob. de quemarse'],
    ['Loot table (optional)', 'Loot table (opcional)'], ['e.g. loot_tables/blocks/my_block.json', 'p. ej. loot_tables/blocks/mi_bloque.json'],
    ['Destination', 'Destino'], ['Behavior pack folder', 'Carpeta del Behavior pack'], ['Resource pack folder', 'Carpeta del Resource pack'],
    ['Create block', 'Crear bloque'], ['Cancel', 'Cancelar'], ['Preview (drag to rotate)', 'Vista previa (arrastra para girar)'],
    ['Done ✔', 'Listo ✔'], ['Files', 'Archivos'], ['Get it in game', 'Consíguelo en el juego'], ['Copy', 'Copiar'], ['Copied', 'Copiado'],
    ['Create another', 'Crear otro'], ['Close', 'Cerrar'],
    ['Activate both packs in the world. The block also appears in the creative inventory.', 'Activa ambos packs en el mundo. El bloque también aparece en el inventario creativo.'],
    ['Pick at least one texture.', 'Elige al menos una textura.'], ['Pick the top, bottom and side textures.', 'Elige las texturas de arriba, abajo y lados.'],
    ['Invalid identifier. Use lowercase letters, numbers and _ (namespace:name).', 'Identificador inválido. Usa minúsculas, números y _ (espacio:nombre).'],
    ['Could not read {0} (invalid JSON). Add the entry by hand.', 'No pude leer {0} (JSON inválido). Añade la entrada a mano.'],
    ['Block {0} created', 'Bloque {0} creado']
  ];
  if (window.FD_I18N) window.FD_I18N.add(ES);

  /* ---------------- estado ---------------- */
  const FRESH = () => ({
    ns: 'fd', name: 'my_block', display: 'My Block', cat: 'construction', mode: 'all',
    tex: { all: null, up: null, down: null, side: null },
    render: 'opaque', light: 0, damp: 15, destroy: 1.5, resist: 3, friction: 0.4,
    useMap: false, map: '#7a7a8c', flam: false, catchCh: 5, destroyCh: 20, loot: '',
    bp: null, rp: null, view: 'form', pickSlot: null, report: null
  });
  let S = FRESH();
  let cube = null;

  function pathOf(node, base = U && window.state && window.state.root, pre = '') {
    if (!base || !base.children) return null;
    for (const c of base.children) {
      if (c.type !== 'folder') continue;
      const p = pre ? pre + '/' + c.name : c.name;
      if (c === node) return p;
      const r = pathOf(node, c, p); if (r) return r;
    }
    return null;
  }
  function defaults() {
    let bp = 'BP', rp = 'RP';
    try { const f = U.findPacks(); if (f.bp) bp = pathOf(f.bp.folder) || bp; if (f.rp) rp = pathOf(f.rp.folder) || rp; } catch (e) { }
    S.bpDef = bp; S.rpDef = rp; if (S.bp == null) S.bp = bp; if (S.rp == null) S.rp = rp;
  }

  /* ---------------- helpers de textura ---------------- */
  const texSrc = (t) => (t ? t.src : '');
  function slotsForMode() { return S.mode === 'all' ? [['all', 'All faces']] : [['up', 'Top'], ['down', 'Bottom'], ['side', 'Sides']]; }
  function setTex(slot, t) { S.tex[slot] = t; }

  function readFile(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(new Error('read')); fr.readAsDataURL(file);
    });
  }
  async function texDataUrl(t) {
    if (t.kind === 'upload') return t.src;
    const c = await V.canvas(t.name); return c.toDataURL('image/png');
  }

  /* ---------------- vista previa del cubo ---------------- */
  function faceImg(face) {
    if (S.mode === 'all') return texSrc(S.tex.all);
    if (face === 'u') return texSrc(S.tex.up);
    if (face === 'd') return texSrc(S.tex.down);
    return texSrc(S.tex.side);
  }
  function paintCube(root) {
    const el = root.querySelector('.fd-cube'); if (!el) return;
    el.querySelectorAll('i').forEach((f) => {
      const src = faceImg(f.dataset.f);
      f.style.backgroundImage = src ? `url("${src}")` : 'none';
    });
    const glow = root.querySelector('.fd-blk-stage');
    if (glow) glow.style.setProperty('--glow', (S.light / 15 * 60).toFixed(0) + 'px');
    const bm = S.render === 'opaque' ? '' : '.82';
    el.style.opacity = S.render === 'blend' ? '.8' : bm || '1';
  }
  function wireCubeDrag(root) {
    const st = root.querySelector('.fd-blk-stage'), el = root.querySelector('.fd-cube'); if (!st || !el) return;
    let rx = -28, ry = 38, drag = null;
    const apply = () => { el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };
    apply();
    st.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; st.setPointerCapture(e.pointerId); });
    st.addEventListener('pointermove', (e) => { if (!drag) return; ry += (e.clientX - drag.x) * 0.6; rx = clamp(rx - (e.clientY - drag.y) * 0.6, -80, 80); drag = { x: e.clientX, y: e.clientY }; apply(); });
    ['pointerup', 'pointercancel'].forEach((ev) => st.addEventListener(ev, () => { drag = null; }));
  }

  /* ---------------- UI ---------------- */
  const CATS = [['construction', 'Construction'], ['nature', 'Nature'], ['equipment', 'Equipment'], ['items', 'Items'], ['none', 'Hidden']];
  const header = (t) => `<div class="tbx-tool-head"><button class="tbx-back" id="fbBack" title="Back">${UI_ICONS.back}</button><h3>${t}</h3></div>`;

  function slotRow(slot, label) {
    const t = S.tex[slot], src = texSrc(t);
    return `<div class="fd-blk-slot" data-slot="${slot}">
  <div class="fd-blk-sw" style="${src ? `background-image:url('${esc(src)}')` : ''}">${src ? '' : '<span>?</span>'}</div>
  <div class="fd-blk-slot-info"><b>${label}</b><small>${t ? esc(t.kind === 'vanilla' ? t.name : 'PNG') : 'No texture'}</small></div>
  <div class="fd-blk-slot-btns">
    <button class="btn btn-ghost btn-sm" data-pick="${slot}">Vanilla…</button>
    <label class="btn btn-ghost btn-sm">Upload PNG<input type="file" accept="image/png,image/*" data-up="${slot}" hidden></label>
    ${t ? `<button class="btn btn-ghost btn-sm" data-clr="${slot}">Clear</button>` : ''}
  </div></div>`;
  }
  const fld = (label, inner, cls) => `<div class="fd-blk-f ${cls || ''}"><label>${label}</label>${inner}</div>`;
  const numIn = (k, min, max, step, v) => `<input type="number" data-k="${k}" min="${min}" max="${max}" step="${step}" value="${v}">`;

  function formHtml() {
    return `${header('Custom blocks')}
<div class="fd-blk-grid">
 <div class="fd-blk-col">
  <div class="fd-blk-row2">${fld('Namespace', `<input type="text" data-k="ns" value="${esc(S.ns)}" maxlength="24">`)}${fld('Block name (id)', `<input type="text" data-k="name" value="${esc(S.name)}" maxlength="40">`)}</div>
  <div class="fd-blk-id">${esc(S.ns)}:${esc(S.name)}</div>
  <div class="fd-blk-row2">${fld('Display name', `<input type="text" data-k="display" value="${esc(S.display)}">`)}
   ${fld('Creative menu tab', `<select data-k="cat">${CATS.map((c) => `<option value="${c[0]}"${S.cat === c[0] ? ' selected' : ''}>${c[1]}</option>`).join('')}</select>`)}</div>

  <h4 class="fd-blk-h">Textures</h4>
  <div class="fd-blk-seg"><button data-mode="all" class="${S.mode === 'all' ? 'on' : ''}">Same on all faces</button><button data-mode="sides" class="${S.mode === 'sides' ? 'on' : ''}">Top, bottom and sides</button></div>
  ${slotsForMode().map((s) => slotRow(s[0], s[1])).join('')}

  <h4 class="fd-blk-h">Rendering</h4>
  <div class="fd-blk-seg three">${[['opaque', 'Opaque'], ['alpha_test', 'Alpha test (cut-out)'], ['blend', 'Blend (translucent)']].map((r) => `<button data-render="${r[0]}" class="${S.render === r[0] ? 'on' : ''}">${r[1]}</button>`).join('')}</div>

  <h4 class="fd-blk-h">Properties</h4>
  <div class="fd-blk-row2">${fld('Light emission (0–15)', numIn('light', 0, 15, 1, S.light))}${fld('Light dampening (0–15)', numIn('damp', 0, 15, 1, S.damp))}</div>
  <div class="fd-blk-row2">${fld('Seconds to destroy', numIn('destroy', 0, 1000, 0.1, S.destroy))}${fld('Explosion resistance', numIn('resist', 0, 3600000, 1, S.resist))}</div>
  <div class="fd-blk-row2">${fld('Friction (0–0.9)', numIn('friction', 0, 0.9, 0.05, S.friction))}
   ${fld('Map color', `<div class="fd-blk-mc"><label class="fd-blk-chk"><input type="checkbox" data-k="useMap"${S.useMap ? ' checked' : ''}> Use map color</label><input type="color" data-k="map" value="${S.map}"${S.useMap ? '' : ' disabled'}></div>`)}</div>
  <label class="fd-blk-chk"><input type="checkbox" data-k="flam"${S.flam ? ' checked' : ''}> Flammable</label>
  ${S.flam ? `<div class="fd-blk-row2">${fld('Catch chance', numIn('catchCh', 0, 100, 1, S.catchCh))}${fld('Destroy chance', numIn('destroyCh', 0, 100, 1, S.destroyCh))}</div>` : ''}
  ${fld('Loot table (optional)', `<input type="text" data-k="loot" value="${esc(S.loot)}" placeholder="e.g. loot_tables/blocks/my_block.json">`)}

  <h4 class="fd-blk-h">Destination</h4>
  <div class="fd-blk-row2">${fld('Behavior pack folder', `<input type="text" data-k="bp" list="fbDl" value="${esc(S.bp)}">`)}${fld('Resource pack folder', `<input type="text" data-k="rp" list="fbDl" value="${esc(S.rp)}">`)}</div>
  <datalist id="fbDl">${(U.folderPaths() || []).map((p) => `<option value="${esc(p)}">`).join('')}</datalist>
 </div>
 <div class="fd-blk-col fd-blk-side">
  <div class="fd-blk-stage" title="Preview (drag to rotate)"><div class="fd-cube">${['n', 's', 'e', 'w', 'u', 'd'].map((f) => `<i class="f-${f}" data-f="${f}"></i>`).join('')}</div></div>
  <p class="fd-blk-hint">Preview (drag to rotate)</p>
 </div>
</div>
<div class="modal-actions"><button class="btn btn-ghost" id="fbCancel">Cancel</button><button class="btn btn-primary" id="fbGo">Create block</button></div>`;
  }

  function pickerHtml() {
    return `${header('Pick a vanilla block texture')}
<input type="text" id="fbQ" class="fd-blk-q" placeholder="Search…" autocomplete="off">
<div class="fd-blk-picker" id="fbGrid"><div class="fd-blk-hint">…</div></div>
<p class="fd-blk-hint">Textures come from the official repo github.com/Mojang/bedrock-samples.</p>
<div class="modal-actions"><button class="btn btn-ghost" id="fbPickBack">Back</button></div>`;
  }

  function doneHtml() {
    const r = S.report, id = `${S.ns}:${S.name}`;
    const cmd = (t) => `<div class="ij-cmd"><code>${esc(t)}</code><button class="btn btn-ghost btn-sm" data-copy="${esc(t)}">Copy</button></div>`;
    return `${header('Done ✔')}
<div class="ij-done"><div><h4>Files</h4><ul class="ij-files">${r.created.map((f) => `<li class="new">+ ${esc(f)}</li>`).join('')}${r.updated.map((f) => `<li>~ ${esc(f)}</li>`).join('')}</ul>
${r.warnings.map((w) => `<div class="manifest-check bad">${esc(w)}</div>`).join('')}</div>
<div><h4>Get it in game</h4>${cmd('/give @s ' + id)}${cmd('/setblock ~ ~ ~ ' + id)}<p class="fd-blk-hint">Activate both packs in the world. The block also appears in the creative inventory.</p></div></div>
<div class="modal-actions"><button class="btn btn-ghost" id="fbMore">Create another</button><button class="btn btn-primary" id="fbClose">Close</button></div>`;
  }

  let modalEl = null;
  function open() {
    S = FRESH(); defaults();
    showModal('<div class="modal tbx-modal fd-blk-modal" id="fbRoot"></div>', (el) => { modalEl = el; refresh(); });
  }
  function refresh() {
    const root = document.getElementById('fbRoot'); if (!root) return;
    root.innerHTML = S.view === 'pick' ? pickerHtml() : S.view === 'done' ? doneHtml() : formHtml();
    root.querySelector('#fbBack').onclick = () => { closeModal(); showToolboxModal(); };
    if (S.view === 'pick') wirePicker(root); else if (S.view === 'done') wireDone(root); else wireForm(root);
    if (window.FD_I18N) window.FD_I18N.set(window.FD_I18N.get());   // re-aplica el idioma al contenido nuevo
  }

  function wireForm(root) {
    paintCube(root); wireCubeDrag(root);
    root.querySelector('#fbCancel').onclick = closeModal;
    root.querySelector('#fbGo').onclick = () => create(root);
    root.querySelectorAll('[data-mode]').forEach((b) => b.onclick = () => { S.mode = b.dataset.mode; refresh(); });
    root.querySelectorAll('[data-render]').forEach((b) => b.onclick = () => { S.render = b.dataset.render; refresh(); });
    root.querySelectorAll('[data-pick]').forEach((b) => b.onclick = () => { S.pickSlot = b.dataset.pick; S.view = 'pick'; refresh(); });
    root.querySelectorAll('[data-clr]').forEach((b) => b.onclick = () => { setTex(b.dataset.clr, null); refresh(); });
    root.querySelectorAll('[data-up]').forEach((inp) => inp.onchange = async () => {
      const f = inp.files[0]; if (!f) return;
      try { setTex(inp.dataset.up, { kind: 'upload', src: await readFile(f) }); } catch (e) { showToast(T('Could not load the texture (offline?).')); }
      refresh();
    });
    root.querySelectorAll('[data-k]').forEach((inp) => {
      const k = inp.dataset.k, isNum = inp.type === 'number';
      const read = () => {
        if (inp.type === 'checkbox') S[k] = inp.checked;
        else if (isNum) S[k] = num(inp.value, S[k]);
        else if (k === 'ns') S[k] = U.slug(inp.value).replace(/^img_/, '') || 'fd';
        else if (k === 'name') S[k] = U.slug(inp.value);
        else S[k] = inp.value;
      };
      inp.oninput = () => {
        if (inp.type === 'checkbox') return;
        read(); if (k === 'ns' || k === 'name') { const idEl = root.querySelector('.fd-blk-id'); if (idEl) idEl.textContent = S.ns + ':' + S.name; }
        if (k === 'light') paintCube(root);
      };
      inp.onchange = () => {
        read();
        if (k === 'ns' || k === 'name') inp.value = S[k];
        if (k === 'flam' || k === 'useMap') refresh(); else paintCube(root);
      };
    });
  }

  function wirePicker(root) {
    const grid = root.querySelector('#fbGrid'), q = root.querySelector('#fbQ');
    root.querySelector('#fbPickBack').onclick = () => { S.view = 'form'; refresh(); };
    root.querySelector('#fbBack').onclick = () => { S.view = 'form'; refresh(); };
    let all = [];
    const draw = () => {
      const term = q.value.trim().toLowerCase().replace(/\s+/g, '_');
      const list = all.filter((n) => !term || n.includes(term)).slice(0, 240);
      grid.innerHTML = list.length ? list.map((n) => `<button class="fd-blk-tile" data-n="${esc(n)}" title="${esc(n)}"><img loading="lazy" src="${esc(V.url(n))}" alt=""><span>${esc(n)}</span></button>`).join('') : '<div class="fd-blk-hint">—</div>';
      grid.querySelectorAll('img').forEach((im) => { im.onerror = () => { im.style.visibility = 'hidden'; }; });
      grid.querySelectorAll('.fd-blk-tile').forEach((b) => b.onclick = () => {
        const n = b.dataset.n; setTex(S.pickSlot, { kind: 'vanilla', name: n, src: V.url(n) }); S.view = 'form'; refresh();
      });
    };
    if (!V) { grid.innerHTML = '<div class="fd-blk-hint">Could not load the texture (offline?).</div>'; return; }
    V.list().then((l) => { all = l; draw(); }).catch(() => { grid.innerHTML = '<div class="fd-blk-hint">Could not load the texture (offline?).</div>'; });
    q.oninput = draw; q.focus();
  }

  function wireDone(root) {
    root.querySelector('#fbMore').onclick = () => { const keep = { ns: S.ns, bp: S.bp, rp: S.rp }; S = Object.assign(FRESH(), keep); defaults(); refresh(); };
    root.querySelector('#fbClose').onclick = closeModal;
    root.querySelectorAll('[data-copy]').forEach((b) => b.onclick = () => { copyToClipboard(b.dataset.copy); showToast(T('Copied')); });
  }

  /* ---------------- generación ---------------- */
  function buildBlock(keys) {
    const rm = S.render, comp = {};
    comp['minecraft:geometry'] = 'minecraft:geometry.full_block';
    const mi = {};
    if (S.mode === 'all') mi['*'] = { texture: keys.all, render_method: rm };
    else { mi['*'] = { texture: keys.side, render_method: rm }; mi.up = { texture: keys.up, render_method: rm }; mi.down = { texture: keys.down, render_method: rm }; }
    comp['minecraft:material_instances'] = mi;
    comp['minecraft:destructible_by_mining'] = { seconds_to_destroy: clamp(num(S.destroy, 1.5), 0, 1000) };
    comp['minecraft:destructible_by_explosion'] = { explosion_resistance: Math.max(0, num(S.resist, 3)) };
    const light = Math.round(clamp(num(S.light, 0), 0, 15)); if (light > 0) comp['minecraft:light_emission'] = light;
    const damp = Math.round(clamp(num(S.damp, 15), 0, 15)); if (damp !== 15) comp['minecraft:light_dampening'] = damp;
    const fr = clamp(num(S.friction, 0.4), 0, 0.9); if (Math.abs(fr - 0.4) > 1e-6) comp['minecraft:friction'] = Math.round(fr * 100) / 100;
    if (S.useMap) comp['minecraft:map_color'] = S.map;
    if (S.flam) comp['minecraft:flammable'] = { catch_chance_modifier: Math.round(clamp(num(S.catchCh, 5), 0, 100)), destroy_chance_modifier: Math.round(clamp(num(S.destroyCh, 20), 0, 100)) };
    if (S.loot.trim()) comp['minecraft:loot'] = S.loot.trim();
    const desc = { identifier: `${S.ns}:${S.name}` };
    if (S.cat !== 'none') desc.menu_category = { category: S.cat };
    else desc.menu_category = { category: 'none' };
    return { format_version: VER.formats.block, 'minecraft:block': { description: desc, components: comp } };
  }

  function folderFor(kind, found) {
    const val = (kind === 'bp' ? S.bp : S.rp).trim().replace(/^\/+|\/+$/g, '');
    const def = kind === 'bp' ? S.bpDef : S.rpDef;
    if (!val || val === def) return found[kind] || (found[kind] = U.ensurePack(kind));
    return { folder: U.folderByPath(val), custom: true };
  }

  async function create(root) {
    const id = `${S.ns}:${S.name}`;
    if (!/^[a-z0-9_]+:[a-z0-9_]+$/.test(id)) return showToast(T('Invalid identifier. Use lowercase letters, numbers and _ (namespace:name).'));
    const slots = slotsForMode().map((s) => s[0]);
    if (S.mode === 'all' && !S.tex.all) return showToast(T('Pick at least one texture.'));
    if (S.mode !== 'all' && slots.some((s) => !S.tex[s])) return showToast(T('Pick the top, bottom and side textures.'));

    const key = `${S.ns}_${S.name}`, keys = S.mode === 'all' ? { all: key } : { up: key + '_top', down: key + '_bottom', side: key + '_side' };
    const report = { created: [], updated: [], warnings: [] };
    const found = {};
    let imgs;
    try {
      imgs = {}; for (const s of slots) imgs[s] = await texDataUrl(S.tex[s]);
    } catch (e) { return showToast(T('Could not load the texture (offline?).')); }

    const rp = folderFor('rp', found), bp = folderFor('bp', found);
    const rpN = pathOf(rp.folder) || S.rp, bpN = pathOf(bp.folder) || S.bp;
    const note = (r, pre, path) => (r.created ? report.created : report.updated).push(pre + '/' + path);

    /* texturas */
    for (const s of slots) { const p = `textures/blocks/${keys[s]}.png`, r = U.getFile(p, rp.folder); r.node.content = imgs[s]; note(r, rpN, p); }

    /* terrain_texture.json (merge) */
    {
      const p = 'textures/terrain_texture.json', r = U.getFile(p, rp.folder);
      let data = r.created ? null : U.parseJson(r.node.content || '');
      if (!r.created && data === null) report.warnings.push(T('Could not read {0} (invalid JSON). Add the entry by hand.').replace('{0}', p));
      else {
        data = data || { resource_pack_name: S.ns, texture_name: 'atlas.terrain', padding: 8, num_mip_levels: 4, texture_data: {} };
        data.texture_data = data.texture_data || {};
        Object.values(keys).forEach((k) => { data.texture_data[k] = { textures: `textures/blocks/${k}` }; });
        r.node.content = U.J(data); note(r, rpN, p);
      }
    }

    /* lang (merge) */
    {
      const p = 'texts/en_US.lang', r = U.getFile(p, rp.folder), line = `tile.${id}.name=${S.display.trim() || S.name}`;
      const have = r.created ? [] : (r.node.content || '').split(/\r?\n/).filter(Boolean), pre = `tile.${id}.name=`, i = have.findIndex((l) => l.startsWith(pre));
      if (i >= 0) have[i] = line; else have.push(line);
      r.node.content = have.join('\n') + '\n'; note(r, rpN, p);
    }

    /* bloque (BP) */
    { const p = `blocks/${S.name}.json`, r = U.getFile(p, bp.folder); r.node.content = U.J(buildBlock(keys)); note(r, bpN, p); }

    /* enlazar BP → RP (solo si ambos son los packs por defecto del proyecto) */
    try {
      if (found.bp && found.rp && found.bp.json && found.rp.json && !found.bp.custom && !found.rp.custom) {
        const m = found.bp.json, rid = found.rp.json.header.uuid; m.dependencies = m.dependencies || [];
        if (!m.dependencies.some((d) => d.uuid === rid)) {
          m.dependencies.push({ uuid: rid, version: found.rp.json.header.version.slice() });
          found.bp.manifest.content = U.J(m); report.updated.push(bpN + '/manifest.json');
        }
      }
    } catch (e) { }

    render(); saveState(); showToast(T('Block {0} created').replace('{0}', id));
    S.report = report; S.view = 'done'; refresh();
  }

  TOOLBOX_TOOLS.push({
    id: 'blocks', name: 'Custom blocks',
    desc: 'Create custom blocks with textures, light, hardness and more. Adds every file to your addon.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/></svg>',
    onOpen: open
  });
})();

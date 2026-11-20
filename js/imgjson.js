/* ============================================================
   Img.Json — imágenes y animaciones dentro de Minecraft Bedrock
   Dos modos (ambos generan TODOS los archivos de RP y BP):
     · Póster  → entidad plana con la imagen/animación. Se invoca con
                 /scriptevent fd:img <nombre>  o  /summon fd:img_<nombre>
     · Bloque  → bloque con textura animada (flipbook_textures.json)
   Depende de co-ui.js / co.js (state, findNode, ensureFolderPath, showModal…)
   ============================================================ */
(function () {
  const V = window.FD_VERSIONS;
  const NS = 'fd';
  const MAX_POSTER_FRAMES = 64;
  let items = [], activeId = null, timer = null, step = 'edit', lastReport = null;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const slug = (s) => {
    let r = String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
    if (!r || /^[0-9]/.test(r)) r = 'img_' + r;
    return r.replace(/_$/, '') || 'img';
  };
  const natural = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const num = (x, d) => { const n = parseFloat(x); return isFinite(n) ? n : d; };
  const r4 = (n) => Math.round(n * 10000) / 10000;

  /* ---------- Carga de archivos ---------- */
  function loadBitmap(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => { const c = mkCanvas(img.naturalWidth, img.naturalHeight); c.getContext('2d').drawImage(img, 0, 0); URL.revokeObjectURL(url); res(c); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('No se pudo leer ' + file.name)); };
      img.src = url;
    });
  }

  async function decodeGif(file) {
    if (!('ImageDecoder' in window)) throw new Error('Este navegador no puede leer GIF animados (usa Chrome/Edge) — sube un spritesheet o los fotogramas por separado.');
    const dec = new ImageDecoder({ data: await file.arrayBuffer(), type: 'image/gif' });
    await dec.tracks.ready;
    const total = dec.tracks.selectedTrack.frameCount;
    const n = Math.min(total, 128), frames = []; let dur = 0;
    for (let i = 0; i < n; i++) {
      const { image } = await dec.decode({ frameIndex: i });
      const c = mkCanvas(image.displayWidth, image.displayHeight);
      c.getContext('2d').drawImage(image, 0, 0);
      dur += (image.duration || 100000);
      image.close(); frames.push(c);
    }
    dec.close();
    const fps = clamp(Math.round(1e6 / (dur / n)), 1, 30);
    return { frames, fps, truncated: total > n };
  }

  async function addFiles(fileList, joinAll) {
    const files = Array.from(fileList).filter((f) => /^image\//.test(f.type) || /\.(png|jpe?g|gif|webp|bmp)$/i.test(f.name)).sort(natural);
    if (!files.length) return showToast('Elige imágenes (PNG, JPG, GIF, WebP).');
    const errs = [];
    const used = new Set(items.map((i) => i.name));
    const uniq = (base) => { let n = slug(base), k = 2, o = n; while (used.has(n)) n = o + '_' + k++; used.add(n); return n; };
    const push = (o) => { o.id = 'i' + Math.random().toString(36).slice(2, 9); items.push(o); activeId = o.id; };
    const still = files.filter((f) => !/gif$/i.test(f.type) && !/\.gif$/i.test(f.name));
    if (joinAll && still.length > 1) {
      try {
        const frames = []; for (const f of still) frames.push(await loadBitmap(f));
        push(newItem(uniq(still[0].name.replace(/[\d_\- ]+(\.\w+)?$/, '')), { frames, fps: 8 }));
      } catch (e) { errs.push(e.message); }
    } else {
      for (const f of still) {
        try { push(newItem(uniq(f.name), { raw: await loadBitmap(f), cols: 1, rows: 1, count: 1, fps: 8 })); } catch (e) { errs.push(e.message); }
      }
    }
    for (const f of files.filter((f) => !still.includes(f))) {
      try { const g = await decodeGif(f); push(newItem(uniq(f.name), { frames: g.frames, fps: g.fps })); if (g.truncated) errs.push('GIF recortado a 128 fotogramas.'); }
      catch (e) { errs.push(e.message); }
    }
    if (errs.length) showToast(errs[0]);
    refresh();
  }

  function newItem(name, o) {
    return Object.assign({ name, mode: 'poster', widthBlocks: 3, fps: 8, loop: true, maxSide: 256, pixel: true, transparent: true, size: 16, title: '' }, o);
  }

  /* Fotogramas de origen de un elemento (sprite sheet → recortados) */
  function srcFrames(it) {
    if (it.frames) return it.frames;
    const cw = Math.floor(it.raw.width / it.cols), ch = Math.floor(it.raw.height / it.rows), out = [];
    for (let i = 0; i < it.count && i < it.cols * it.rows; i++) {
      const c = mkCanvas(cw, ch);
      c.getContext('2d').drawImage(it.raw, (i % it.cols) * cw, Math.floor(i / it.cols) * ch, cw, ch, 0, 0, cw, ch);
      out.push(c);
    }
    return out.length ? out : [it.raw];
  }

  /* ---------- Construcción de la hoja de fotogramas ---------- */
  function buildSheet(it) {
    let frames = srcFrames(it);
    if (it.mode === 'block') {
      const S = it.size, maxN = Math.max(1, Math.floor(4096 / S));
      if (frames.length > maxN) frames = frames.filter((_, i) => i % Math.ceil(frames.length / maxN) === 0).slice(0, maxN);
      const sheet = mkCanvas(S, S * frames.length), g = sheet.getContext('2d');
      g.imageSmoothingEnabled = !it.pixel;
      frames.forEach((f, i) => g.drawImage(f, 0, i * S, S, S));
      return { canvas: sheet, cols: 1, rows: frames.length, fw: S, fh: S, n: frames.length, frames };
    }
    if (frames.length > MAX_POSTER_FRAMES) frames = frames.filter((_, i) => i % Math.ceil(frames.length / MAX_POSTER_FRAMES) === 0).slice(0, MAX_POSTER_FRAMES);
    const f0 = frames[0], sc = Math.min(1, it.maxSide / Math.max(f0.width, f0.height));
    let fw = Math.max(1, Math.round(f0.width * sc)), fh = Math.max(1, Math.round(f0.height * sc));
    const n = frames.length; let cols = Math.ceil(Math.sqrt(n));
    while (cols > 1 && cols * fw > 4096) cols--;
    let rows = Math.ceil(n / cols);
    while (rows * fh > 4096 && fw > 8) { fw = Math.floor(fw / 2); fh = Math.floor(fh / 2); rows = Math.ceil(n / cols); }
    const sheet = mkCanvas(cols * fw, rows * fh), g = sheet.getContext('2d');
    g.imageSmoothingEnabled = !it.pixel;
    frames.forEach((f, i) => g.drawImage(f, (i % cols) * fw, Math.floor(i / cols) * fh, fw, fh));
    return { canvas: sheet, cols, rows, fw, fh, n, frames };
  }

  /* ---------- Generadores de archivos ---------- */
  const J = (o) => JSON.stringify(o, null, 2).replace(/\[\s*(-?[\d.]+(?:,\s*-?[\d.]+)*)\s*\]/g, (m, a) => '[' + a.replace(/\s+/g, ' ') + ']') + '\n';
  const title = (it) => it.title || it.name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  function posterFiles(it, sh) {
    const id = `${NS}:img_${it.name}`, geo = `geometry.${NS}_img_${it.name}`;
    const W = Math.max(0.25, num(it.widthBlocks, 3)), H = r4(W * sh.fh / sh.fw);
    const px = W * 16, py = H * 16;
    const vb = Math.ceil(Math.max(W, H) * 1.5);
    const face = { uv: [0, 0], uv_size: [sh.fw, sh.fh] };
    const geometry = {
      format_version: V.formats.geometry,
      'minecraft:geometry': [{
        description: { identifier: geo, texture_width: sh.fw, texture_height: sh.fh, visible_bounds_width: vb, visible_bounds_height: vb, visible_bounds_offset: [0, r4(H / 2), 0] },
        bones: [{ name: 'img', pivot: [0, 0, 0], cubes: [{ origin: [r4(-px / 2), 0, 0], size: [r4(px), r4(py), 0], uv: { north: face, south: face } }] }]
      }]
    };
    const anim = sh.n > 1;
    const frameExpr = it.loop
      ? `math.mod(math.floor(q.life_time * ${it.fps}), ${sh.n})`
      : `math.min(math.floor(q.life_time * ${it.fps}), ${sh.n - 1})`;
    const desc = {
      identifier: id,
      materials: { default: 'entity_alphatest' },
      textures: { default: `textures/${NS}_img/${it.name}` },
      geometry: { default: geo },
      render_controllers: [`controller.render.${NS}_img_${it.name}`],
      spawn_egg: { base_color: '#ff7a1a', overlay_color: '#222222' }
    };
    if (anim) desc.scripts = { pre_animation: [`v.fd_frame = ${frameExpr};`] };
    const rc = { geometry: 'Geometry.default', materials: [{ '*': 'Material.default' }], textures: ['Texture.default'] };
    if (anim) rc.uv_anim = {
      offset: [`math.mod(v.fd_frame, ${sh.cols}) / ${sh.cols}`, `math.floor(v.fd_frame / ${sh.cols}) / ${sh.rows}`],
      scale: [r4(1 / sh.cols), r4(1 / sh.rows)]
    };
    const bp = {
      format_version: V.formats.entityBP,
      'minecraft:entity': {
        description: { identifier: id, is_spawnable: true, is_summonable: true, is_experimental: false },
        components: {
          'minecraft:type_family': { family: ['fd_img'] },
          'minecraft:collision_box': { width: r4(Math.min(W, 4)), height: r4(Math.min(H, 4)) },
          'minecraft:physics': { has_gravity: false, has_collision: false },
          'minecraft:pushable': { is_pushable: false, is_pushable_by_piston: false },
          'minecraft:persistent': {},
          'minecraft:damage_sensor': { triggers: { cause: 'all', deals_damage: 'no' } }
        }
      }
    };
    return {
      W, H, id,
      files: [
        { pack: 'rp', path: `textures/${NS}_img/${it.name}.png`, image: sh.canvas },
        { pack: 'rp', path: `models/entity/${NS}_img_${it.name}.geo.json`, text: J(geometry) },
        { pack: 'rp', path: `entity/${NS}_img_${it.name}.entity.json`, text: J({ format_version: V.formats.clientEntity, 'minecraft:client_entity': { description: desc } }) },
        { pack: 'rp', path: `render_controllers/${NS}_img_${it.name}.render_controllers.json`, text: J({ format_version: V.formats.renderController, render_controllers: { [`controller.render.${NS}_img_${it.name}`]: rc } }) },
        { pack: 'bp', path: `entities/${NS}_img_${it.name}.entity.json`, text: J(bp) },
        { pack: 'rp', path: 'texts/en_US.lang', lang: [`entity.${id}.name=Póster ${title(it)}`, `item.spawn_egg.entity.${id}.name=Póster ${title(it)}`] }
      ]
    };
  }

  function blockFiles(it, sh) {
    const id = `${NS}:${it.name}`, tex = `${NS}_${it.name}`;
    const block = {
      format_version: V.formats.block,
      'minecraft:block': {
        description: { identifier: id, menu_category: { category: 'construction' } },
        components: {
          'minecraft:geometry': 'minecraft:geometry.full_block',
          'minecraft:material_instances': { '*': { texture: tex, render_method: it.transparent ? 'alpha_test' : 'opaque' } }
        }
      }
    };
    const frames = []; for (let i = 0; i < sh.n; i++) frames.push(i);
    return {
      id,
      files: [
        { pack: 'rp', path: `textures/blocks/${tex}.png`, image: sh.canvas },
        { pack: 'rp', path: 'textures/flipbook_textures.json', mergeFlipbook: { flipbook_texture: `textures/blocks/${tex}`, atlas_tile: tex, ticks_per_frame: Math.max(1, Math.round(20 / it.fps)), frames, blend_frames: false } },
        { pack: 'rp', path: 'textures/terrain_texture.json', mergeTerrain: { key: tex, value: { textures: `textures/blocks/${tex}` } } },
        { pack: 'bp', path: `blocks/${it.name}.json`, text: J(block) },
        { pack: 'rp', path: 'texts/en_US.lang', lang: [`tile.${id}.name=${title(it)}`] }
      ]
    };
  }

  function scriptSource(names) {
    return `import { world, system } from "@minecraft/server";

// Archivo generado por FireDex · Img.Json (puedes editarlo; la línea FD_IMAGES se actualiza sola).
const FD_IMAGES = ${JSON.stringify(names)};
const TAG = "fd_img";
const DISTANCE = 3; // bloques frente al jugador

function ayuda(player) {
  player.sendMessage("§e/scriptevent fd:img <nombre> §7— coloca un póster frente a ti");
  player.sendMessage("§e/scriptevent fd:img_clear [radio] §7— borra los pósters cercanos (16 por defecto)");
  player.sendMessage("§7Pósters disponibles: §f" + FD_IMAGES.join(", "));
}

system.afterEvents.scriptEventReceive.subscribe((ev) => {
  const player = ev.sourceEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  const args = ev.message.trim().split(/\\s+/).filter(Boolean);

  if (ev.id === "fd:img") {
    const name = args[0];
    if (!name || !FD_IMAGES.includes(name)) return ayuda(player);
    const view = player.getViewDirection();
    const len = Math.hypot(view.x, view.z) || 1;
    const pos = {
      x: player.location.x + (view.x / len) * DISTANCE,
      y: player.location.y,
      z: player.location.z + (view.z / len) * DISTANCE
    };
    const poster = player.dimension.spawnEntity("${NS}:img_" + name, pos);
    poster.addTag(TAG);
    poster.teleport(pos, { rotation: { x: 0, y: player.getRotation().y } });
    player.sendMessage("§aPóster '" + name + "' colocado.");
  } else if (ev.id === "fd:img_clear") {
    const radius = Number(args[0]) || 16;
    const found = player.dimension.getEntities({ tags: [TAG], location: player.location, maxDistance: radius });
    for (const e of found) e.remove();
    player.sendMessage("§aPósters eliminados: " + found.length);
  }
}, { namespaces: ["fd"] });
`;
  }

  /* ---------- Escritura en el proyecto ---------- */
  function parentOf(node, root = state.root) {
    if (!root.children) return null;
    for (const c of root.children) { if (c === node) return root; const r = parentOf(node, c); if (r) return r; }
    return null;
  }
  function stripJsonc(t) { return t.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/,(\s*[}\]])/g, '$1'); }
  function parseJson(t) { try { return JSON.parse(t); } catch (e) { try { return JSON.parse(stripJsonc(t)); } catch (e2) { return null; } } }

  function getFolder(parts, base) {
    let cur = base;
    for (const p of parts) {
      let f = cur.children.find((c) => c.type === 'folder' && c.name === p);
      if (!f) { f = { id: uid(), type: 'folder', name: p, open: true, children: [] }; cur.children.push(f); }
      cur = f;
    }
    return cur;
  }
  function getFile(path, base) {
    const parts = path.split('/'), name = parts.pop(), dir = getFolder(parts, base);
    let f = dir.children.find((c) => c.type === 'file' && c.name === name), created = false;
    if (!f) { f = { id: uid(), type: 'file', name, content: '' }; dir.children.push(f); created = true; }
    return { node: f, created, dir };
  }

  function findPacks() {
    const out = { bp: null, rp: null };
    for (const m of collectManifests()) {
      const j = parseJson(m.node.content || ''); if (!j || !j.modules) continue;
      const types = j.modules.map((x) => x.type), folder = parentOf(m.node);
      if (!folder) continue;
      if (types.includes('resources') && !out.rp) out.rp = { folder, manifest: m.node, json: j };
      else if ((types.includes('data') || types.includes('script')) && !out.bp) out.bp = { folder, manifest: m.node, json: j };
    }
    return out;
  }
  function makePack(kind) {
    const root = findNode('root');
    const folder = getFolder([kind === 'rp' ? 'RP' : 'BP'], root);
    const json = {
      format_version: 2,
      header: { name: kind === 'rp' ? 'FireDex RP' : 'FireDex BP', description: 'Generado con FireDex Img.Json', uuid: uuidv4(), version: [1, 0, 0], min_engine_version: V.minEngine.slice() },
      modules: [{ type: kind === 'rp' ? 'resources' : 'data', uuid: uuidv4(), version: [1, 0, 0] }]
    };
    const manifest = { id: uid(), type: 'file', name: 'manifest.json', content: '' };
    folder.children.push(manifest);
    return { folder, manifest, json, fresh: true };
  }

  function apply(plan, includesScript) {
    const report = { created: [], updated: [], warnings: [], names: [] };
    const found = findPacks();
    const needBP = plan.some((p) => p.pack === 'bp'), needRP = plan.some((p) => p.pack === 'rp');
    const rp = needRP ? (found.rp || makePack('rp')) : found.rp;
    const bp = needBP ? (found.bp || makePack('bp')) : found.bp;
    if (rp && rp.fresh) report.created.push(rp.folder.name + '/manifest.json');
    if (bp && bp.fresh) report.created.push(bp.folder.name + '/manifest.json');
    const base = { rp: rp && rp.folder, bp: bp && bp.folder };
    const pname = { rp: rp ? rp.folder.name : 'RP', bp: bp ? bp.folder.name : 'BP' };
    const note = (res, pack, path) => (res.created ? report.created : report.updated).push(pname[pack] + '/' + path);

    for (const f of plan) {
      const { node, created } = getFile(f.path, base[f.pack]);
      if (f.image) node.content = f.image.toDataURL('image/png');
      else if (f.text != null) node.content = f.text;
      else if (f.lang) {
        const have = created ? [] : (node.content || '').split(/\r?\n/).filter(Boolean);
        for (const line of f.lang) { const k = line.split('=')[0], i = have.findIndex((l) => l.startsWith(k + '=')); if (i >= 0) have[i] = line; else have.push(line); }
        node.content = have.join('\n') + '\n';
      } else if (f.mergeFlipbook || f.mergeTerrain) {
        let data = created ? null : parseJson(node.content || '');
        if (!created && data === null) { report.warnings.push(`No pude leer ${f.path} (JSON inválido); revísalo y añade la entrada a mano.`); continue; }
        if (f.mergeFlipbook) {
          data = Array.isArray(data) ? data : [];
          const i = data.findIndex((x) => x.atlas_tile === f.mergeFlipbook.atlas_tile);
          if (i >= 0) data[i] = f.mergeFlipbook; else data.push(f.mergeFlipbook);
        } else {
          data = data || { resource_pack_name: 'fd', texture_name: 'atlas.terrain', padding: 8, num_mip_levels: 4, texture_data: {} };
          data.texture_data = data.texture_data || {};
          data.texture_data[f.mergeTerrain.key] = f.mergeTerrain.value;
        }
        node.content = J(data);
      }
      note({ created }, f.pack, f.path);
    }

    /* Manifests */
    if (bp) {
      const m = bp.json; m.modules = m.modules || []; m.dependencies = m.dependencies || [];
      if (!m.modules.some((x) => x.type === 'data')) m.modules.unshift({ type: 'data', uuid: uuidv4(), version: [1, 0, 0] });
      if (rp && !m.dependencies.some((d) => d.uuid === rp.json.header.uuid)) m.dependencies.push({ uuid: rp.json.header.uuid, version: rp.json.header.version.slice() });
      if (includesScript) {
        let sm = m.modules.find((x) => x.type === 'script');
        if (!sm) { sm = { type: 'script', language: 'javascript', uuid: uuidv4(), entry: 'scripts/main.js', version: [1, 0, 0] }; m.modules.push(sm); }
        if (!m.dependencies.some((d) => d.module_name === '@minecraft/server')) m.dependencies.push({ module_name: '@minecraft/server', version: V.server });
        report.entry = sm.entry;
      }
      bp.manifest.content = J(m);
      if (!bp.fresh) report.updated.push(pname.bp + '/manifest.json');
    }
    if (rp) {
      const h = rp.json.header;
      if (!h.min_engine_version) h.min_engine_version = V.minEngine.slice();
      rp.manifest.content = J(rp.json);
      if (!rp.fresh) report.updated.push(pname.rp + '/manifest.json');
    }
    report.bpFolder = bp && bp.folder;
    return report;
  }

  function wireScript(report, names) {
    const bp = report.bpFolder; if (!bp) return;
    const entry = report.entry || 'scripts/main.js', parts = entry.split('/'), mainName = parts.pop();
    const dirParts = parts;
    const scriptPath = (dirParts.length ? dirParts.join('/') + '/' : '') + 'fd_img.js';
    const existing = getFile(scriptPath, bp);
    let prev = [];
    if (!existing.created) { const m = /const FD_IMAGES = (\[[^\]]*\]);/.exec(existing.node.content || ''); if (m) { try { prev = JSON.parse(m[1]); } catch (e) { } } }
    const all = Array.from(new Set(prev.concat(names)));
    existing.node.content = scriptSource(all);
    (existing.created ? report.created : report.updated).push(bp.name + '/' + scriptPath);
    const main = getFile(entry, bp), imp = 'import "./fd_img.js";';
    if (main.created) { main.node.content = '// Punto de entrada del Behavior Pack\n' + imp + '\n'; report.created.push(bp.name + '/' + entry); }
    else if (!/fd_img\.js/.test(main.node.content || '')) { main.node.content = imp + '\n' + (main.node.content || ''); report.updated.push(bp.name + '/' + entry); }
    report.scriptNode = existing.node;
  }

  function generate() {
    if (!items.length) return showToast('Añade al menos una imagen.');
    const plan = [], posters = [], blocks = [], info = [];
    for (const it of items) {
      it.name = slug(it.name);
      const sh = buildSheet(it);
      if (it.mode === 'block') { const b = blockFiles(it, sh); plan.push(...b.files); blocks.push({ it, id: b.id, n: sh.n }); }
      else { const p = posterFiles(it, sh); plan.push(...p.files); posters.push({ it, id: p.id, W: p.W, H: p.H, n: sh.n }); }
    }
    const report = apply(plan, posters.length > 0);
    if (posters.length) wireScript(report, posters.map((p) => p.it.name));
    report.posters = posters; report.blocks = blocks;
    render(); saveState();
    const open = report.scriptNode || null;
    if (open) { activeFileId = open.id; renderEditor(); }
    lastReport = report; step = 'done'; clearInterval(timer); refresh();
  }

  /* ---------- Interfaz ---------- */
  function active() { return items.find((i) => i.id === activeId) || null; }

  function open() {
    items = []; activeId = null; step = 'edit'; lastReport = null;
    showModal(`<div class="modal tbx-modal imgjson-modal" id="ijRoot"></div>`, () => refresh());
  }

  function refresh() {
    const root = document.getElementById('ijRoot'); if (!root) return;
    clearInterval(timer);
    root.innerHTML = step === 'done' ? doneHtml() : editHtml();
    step === 'done' ? wireDone(root) : wireEdit(root);
  }

  function editHtml() {
    const it = active();
    return `<div class="tbx-tool-head"><button class="tbx-back" id="ijBack">${UI_ICONS.back}</button><h3>Img.Json <span class="tbx-beta">NUEVO</span></h3></div>
<p class="ij-lead">Convierte imágenes, GIF o spritesheets en archivos listos para Minecraft Bedrock: textura, modelo, entidad, render controller, script y manifest.</p>
<div class="imgjson-layout">
  <div class="imgjson-col">
    <label class="imgjson-upload" id="ijDrop">${UI_ICONS.upload || ''}<span>Soltar o elegir imágenes<br><small>PNG · JPG · GIF · WebP</small></span>
      <input type="file" id="ijFile" accept="image/*" multiple hidden></label>
    <label class="ij-check"><input type="checkbox" id="ijJoin"> Varias imágenes = fotogramas de UNA animación</label>
    <div class="imgjson-list" id="ijList">${items.length ? items.map((x) => `<div class="imgjson-item${x.id === activeId ? ' active' : ''}" data-id="${x.id}">
      <img src="${x.thumb || thumbOf(x)}" alt=""><div class="imgjson-item-info"><div class="imgjson-item-name">${esc(x.name)}</div><div class="imgjson-item-dim">${x.mode === 'block' ? 'Bloque' : 'Póster'} · ${srcFrames(x).length} fot.</div></div>
      <button class="imgjson-item-remove" data-rm="${x.id}" title="Quitar">${UI_ICONS.close || '×'}</button></div>`).join('') : '<div class="imgjson-empty">Aún no hay imágenes.</div>'}</div>
  </div>
  <div class="imgjson-col">${it ? paramsHtml(it) : '<div class="imgjson-empty" style="padding:40px">Sube una imagen, un GIF o un spritesheet para empezar.</div>'}</div>
</div>
<div class="modal-actions"><button class="btn btn-ghost" id="ijCancel">Cancelar</button><button class="btn btn-primary" id="ijGen"${items.length ? '' : ' disabled'}>Generar archivos en el proyecto</button></div>`;
  }

  function thumbOf(it) { const f = srcFrames(it)[0]; it.thumb = f.toDataURL('image/png'); return it.thumb; }

  function paramsHtml(it) {
    const sh = buildSheet(it), isSheet = !!it.raw;
    const field = (l, inner) => `<div class="imgjson-field"><label>${l}</label>${inner}</div>`;
    return `<div class="imgjson-params">
  ${field('Nombre (ID: ' + NS + ':' + (it.mode === 'block' ? '' : 'img_') + esc(slug(it.name)) + ')', `<input type="text" data-k="name" value="${esc(it.name)}">`)}
  <div class="ij-seg" role="tablist"><button data-mode="poster" class="${it.mode === 'poster' ? 'on' : ''}">Póster en el mundo</button><button data-mode="block" class="${it.mode === 'block' ? 'on' : ''}">Bloque animado</button></div>
  <p class="imgjson-meta-info">${it.mode === 'poster' ? 'Entidad plana (ancho y alto en bloques) que se coloca con un comando. Cuadros de cualquier proporción.' : 'Bloque con textura animada (flipbook). Los fotogramas se ajustan a un cuadrado.'}</p>
  ${isSheet ? `<div class="imgjson-field-row">${field('Columnas', `<input type="number" min="1" max="64" data-k="cols" value="${it.cols}">`)}${field('Filas', `<input type="number" min="1" max="64" data-k="rows" value="${it.rows}">`)}</div>
  ${field('Fotogramas a usar', `<input type="number" min="1" max="${it.cols * it.rows}" data-k="count" value="${it.count}">`)}` : ''}
  <div class="imgjson-field-row">
    ${field('Velocidad (fps)', `<input type="number" min="1" max="30" step="1" data-k="fps" value="${it.fps}">`)}
    ${it.mode === 'poster' ? field('Ancho (bloques)', `<input type="number" min="0.5" max="32" step="0.5" data-k="widthBlocks" value="${it.widthBlocks}">`) : field('Tamaño (px)', `<select data-k="size">${[16, 32, 64, 128].map((s) => `<option${s === it.size ? ' selected' : ''}>${s}</option>`).join('')}</select>`)}
  </div>
  ${it.mode === 'poster' ? `<div class="imgjson-field-row">${field('Resolución máx. (px)', `<select data-k="maxSide">${[64, 128, 256, 512, 1024].map((s) => `<option${s === it.maxSide ? ' selected' : ''}>${s}</option>`).join('')}</select>`)}
    <div class="imgjson-field imgjson-field-checkbox"><label><input type="checkbox" data-k="loop"${it.loop ? ' checked' : ''}> Repetir en bucle</label></div></div>` :
        `<div class="imgjson-field imgjson-field-checkbox"><label><input type="checkbox" data-k="transparent"${it.transparent ? ' checked' : ''}> Respetar transparencia</label></div>`}
  <div class="imgjson-field imgjson-field-checkbox"><label><input type="checkbox" data-k="pixel"${it.pixel ? ' checked' : ''}> Pixel art (sin suavizado)</label></div>
  <div class="imgjson-meta-info">${sh.n} fotograma(s) · hoja ${sh.canvas.width}×${sh.canvas.height}px · ${sh.cols}×${sh.rows}${it.mode === 'poster' ? ' · póster ' + Math.max(0.25, num(it.widthBlocks, 3)) + '×' + r4(Math.max(0.25, num(it.widthBlocks, 3)) * sh.fh / sh.fw) + ' bloques' : ''}</div>
</div>
<div class="imgjson-preview-wrap"><canvas id="ijCanvas"></canvas><div class="imgjson-preview-controls"><button class="btn btn-ghost btn-sm" id="ijPlay">Pausa</button><span class="imgjson-frame-count" id="ijFrameNo"></span></div></div>`;
  }

  function startPreview() {
    const it = active(), cv = document.getElementById('ijCanvas'); if (!it || !cv) return;
    const sh = buildSheet(it); let i = 0, playing = true;
    cv.width = sh.fw; cv.height = sh.fh; cv.style.imageRendering = it.pixel ? 'pixelated' : 'auto';
    const g = cv.getContext('2d'), no = document.getElementById('ijFrameNo'), btn = document.getElementById('ijPlay');
    const draw = () => {
      g.clearRect(0, 0, cv.width, cv.height);
      g.drawImage(sh.canvas, (i % sh.cols) * sh.fw, Math.floor(i / sh.cols) * sh.fh, sh.fw, sh.fh, 0, 0, sh.fw, sh.fh);
      if (no) no.textContent = (i + 1) + ' / ' + sh.n;
    };
    draw();
    if (sh.n > 1) timer = setInterval(() => { if (!playing) return; i = (i + 1) % sh.n; draw(); }, 1000 / clamp(num(it.fps, 8), 1, 30));
    if (btn) btn.onclick = () => { playing = !playing; btn.textContent = playing ? 'Pausa' : 'Reproducir'; };
  }

  function wireEdit(root) {
    root.querySelector('#ijBack').onclick = () => { closeModal(); showToolboxModal(); };
    root.querySelector('#ijCancel').onclick = closeModal;
    const fileEl = root.querySelector('#ijFile'), drop = root.querySelector('#ijDrop'), joinEl = root.querySelector('#ijJoin');
    fileEl.onchange = () => { addFiles(fileEl.files, joinEl.checked); };
    ['dragover', 'dragenter'].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((e) => drop.addEventListener(e, (ev) => { ev.preventDefault(); drop.classList.remove('drag'); }));
    drop.addEventListener('drop', (ev) => addFiles(ev.dataTransfer.files, joinEl.checked));
    root.querySelectorAll('.imgjson-item').forEach((el) => el.onclick = (ev) => {
      const rm = ev.target.closest('[data-rm]');
      if (rm) { items = items.filter((x) => x.id !== rm.dataset.rm); if (activeId === rm.dataset.rm) activeId = items[0] ? items[0].id : null; }
      else activeId = el.dataset.id;
      refresh();
    });
    root.querySelectorAll('[data-mode]').forEach((b) => b.onclick = () => { active().mode = b.dataset.mode; refresh(); });
    root.querySelectorAll('[data-k]').forEach((inp) => inp.onchange = () => {
      const it = active(), k = inp.dataset.k;
      if (inp.type === 'checkbox') it[k] = inp.checked;
      else if (k === 'name') it[k] = slug(inp.value);
      else if (inp.tagName === 'SELECT' || inp.type === 'number') it[k] = num(inp.value, it[k]);
      if (k === 'cols' || k === 'rows') { it.cols = clamp(Math.round(it.cols), 1, 64); it.rows = clamp(Math.round(it.rows), 1, 64); it.count = it.cols * it.rows; }
      if (k === 'count') it.count = clamp(Math.round(it.count), 1, it.cols * it.rows);
      if (k === 'fps') it.fps = clamp(Math.round(it.fps), 1, 30);
      it.thumb = null; refresh();
    });
    root.querySelector('#ijGen').onclick = generate;
    startPreview();
  }

  function doneHtml() {
    const r = lastReport, cmd = (t) => `<div class="ij-cmd"><code>${esc(t)}</code><button class="btn btn-ghost btn-sm" data-copy="${esc(t)}">Copiar</button></div>`;
    let how = '';
    if (r.posters.length) {
      how += `<h4>Pósters</h4><p>En el mundo, con ambos packs activos:</p>` +
        r.posters.map((p) => cmd(`/scriptevent fd:img ${p.it.name}`)).join('') +
        cmd('/scriptevent fd:img_clear') +
        `<p class="imgjson-meta-info">Sin scripts también sirve: <code>/summon ${r.posters[0].id}</code> (o el huevo de generación en creativo). Cada póster mide ${r.posters.map((p) => p.W + '×' + p.H).join(' · ')} bloques.</p>`;
    }
    if (r.blocks.length) how += `<h4>Bloques</h4><p>Dalos con:</p>` + r.blocks.map((b) => cmd(`/give @s ${b.id}`)).join('') + `<p class="imgjson-meta-info">También aparecen en el inventario creativo, pestaña Construcción.</p>`;
    return `<div class="tbx-tool-head"><button class="tbx-back" id="ijBack2">${UI_ICONS.back}</button><h3>Listo ✔</h3></div>
<div class="ij-done"><div><h4>Archivos</h4><ul class="ij-files">${r.created.map((f) => `<li class="new">+ ${esc(f)}</li>`).join('')}${r.updated.map((f) => `<li>~ ${esc(f)}</li>`).join('')}</ul>
${r.warnings.map((w) => `<div class="manifest-check bad">${esc(w)}</div>`).join('')}</div>
<div>${how}<h4>Antes de probar</h4><ol class="ij-steps"><li>Exporta/copia el BP y el RP a <code>development_behavior_packs</code> y <code>development_resource_packs</code>.</li><li>Activa <b>ambos</b> packs en el mundo.</li><li>Los scripts solo corren con el BP activo y <code>@minecraft/server ${esc(V.server)}</code> soportado por tu versión del juego.</li></ol></div></div>
<div class="modal-actions"><button class="btn btn-ghost" id="ijMore">Añadir más</button><button class="btn btn-primary" id="ijClose">Cerrar</button></div>`;
  }
  function wireDone(root) {
    root.querySelector('#ijBack2').onclick = () => { step = 'edit'; refresh(); };
    root.querySelector('#ijMore').onclick = () => { items = []; activeId = null; step = 'edit'; refresh(); };
    root.querySelector('#ijClose').onclick = closeModal;
    root.querySelectorAll('[data-copy]').forEach((b) => b.onclick = () => { copyToClipboard(b.dataset.copy); showToast('Copiado'); });
  }

  function ensurePack(kind) {
    const f = findPacks()[kind]; if (f) return f;
    const m = makePack(kind); m.manifest.content = J(m.json); return m;
  }
  window.FD_UTIL = { ensurePack, getFile, J, slug, esc, parseJson };
  window.openImgJsonTool = open;
})();

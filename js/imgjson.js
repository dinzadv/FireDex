(function() {
  const V = window.FD_VERSIONS;
  const NS = "fd";
  const MAX_POSTER_FRAMES = 64;
  let items = [], activeId = null, timer = null, step = "edit", lastReport = null;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const slug = (s) => {
    let r = String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
    if (!r || /^[0-9]/.test(r)) r = "img_" + r;
    return r.replace(/_$/, "") || "img";
  };
  const natural = (a, b) => a.name.localeCompare(b.name, void 0, { numeric: true, sensitivity: "base" });
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const mkCanvas = (w, h) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  const num = (x, d) => {
    const n = parseFloat(x);
    return isFinite(n) ? n : d;
  };
  const r4 = (n) => Math.round(n * 1e4) / 1e4;
  function loadBitmap(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const c = mkCanvas(img.naturalWidth, img.naturalHeight);
        c.getContext("2d").drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        res(c);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        rej(new Error("No se pudo leer " + file.name));
      };
      img.src = url;
    });
  }
  async function decodeGif(file) {
    if (!("ImageDecoder" in window)) throw new Error("Este navegador no puede leer GIF animados (usa Chrome/Edge) \u2014 sube un spritesheet o los fotogramas por separado.");
    const dec = new ImageDecoder({ data: await file.arrayBuffer(), type: "image/gif" });
    await dec.tracks.ready;
    const total = dec.tracks.selectedTrack.frameCount;
    const n = Math.min(total, 128), frames = [];
    let dur = 0;
    for (let i = 0; i < n; i++) {
      const { image } = await dec.decode({ frameIndex: i });
      const c = mkCanvas(image.displayWidth, image.displayHeight);
      c.getContext("2d").drawImage(image, 0, 0);
      dur += image.duration || 1e5;
      image.close();
      frames.push(c);
    }
    dec.close();
    const fps = clamp(Math.round(1e6 / (dur / n)), 1, 30);
    return { frames, fps, truncated: total > n };
  }
  async function addFiles(fileList, joinAll) {
    const files = Array.from(fileList).filter((f) => /^image\//.test(f.type) || /\.(png|jpe?g|gif|webp|bmp)$/i.test(f.name)).sort(natural);
    if (!files.length) return showToast("Elige im\xE1genes (PNG, JPG, GIF, WebP).");
    const errs = [];
    const used = new Set(items.map((i) => i.name));
    const uniq = (base) => {
      let n = slug(base), k = 2, o = n;
      while (used.has(n)) n = o + "_" + k++;
      used.add(n);
      return n;
    };
    const push = (o) => {
      o.id = "i" + Math.random().toString(36).slice(2, 9);
      items.push(o);
      activeId = o.id;
    };
    const still = files.filter((f) => !/gif$/i.test(f.type) && !/\.gif$/i.test(f.name));
    if (joinAll && still.length > 1) {
      try {
        const frames = [];
        for (const f of still) frames.push(await loadBitmap(f));
        push(newItem(uniq(still[0].name.replace(/[\d_\- ]+(\.\w+)?$/, "")), { frames, fps: 8 }));
      } catch (e) {
        errs.push(e.message);
      }
    } else {
      for (const f of still) {
        try {
          push(newItem(uniq(f.name), { raw: await loadBitmap(f), cols: 1, rows: 1, count: 1, fps: 8 }));
        } catch (e) {
          errs.push(e.message);
        }
      }
    }
    for (const f of files.filter((f2) => !still.includes(f2))) {
      try {
        const g = await decodeGif(f);
        push(newItem(uniq(f.name), { frames: g.frames, fps: g.fps }));
        if (g.truncated) errs.push("GIF recortado a 128 fotogramas.");
      } catch (e) {
        errs.push(e.message);
      }
    }
    if (errs.length) showToast(errs[0]);
    refresh();
  }
  function newItem(name, o) {
    return Object.assign({ name, mode: "screen", fit: "contain", opacity: 100, seconds: 4, dim: 45, widthBlocks: 3, fps: 8, loop: true, maxSide: 256, pixel: true, transparent: true, size: 16, title: "" }, o);
  }
  const EFFECTS = [["none", "No effect (static)"], ["fade", "Fade in / out"], ["pulse", "Pulse (zoom)"], ["bounce", "Bounce"], ["shake", "Shake"], ["spin", "Spin (turn around)"], ["scroll", "Scroll (loop)"], ["flash", "Flash"]];
  function effectFrames(src, kind, n) {
    const w = src.width, h = src.height, out = [];
    for (let i = 0; i < n; i++) {
      const t = i / n, c = mkCanvas(w, h), g = c.getContext("2d");
      g.imageSmoothingEnabled = false;
      const a = Math.PI * 2 * t;
      if (kind === "fade") {
        g.globalAlpha = 0.15 + 0.85 * (0.5 + 0.5 * Math.cos(a));
        g.drawImage(src, 0, 0);
      } else if (kind === "pulse") {
        const k = 0.9 + 0.1 * Math.sin(a);
        g.drawImage(src, w * (1 - k) / 2, h * (1 - k) / 2, w * k, h * k);
      } else if (kind === "bounce") {
        const k = 0.85, dy = -Math.abs(Math.sin(a / 2)) * h * 0.15;
        g.drawImage(src, w * (1 - k) / 2, h * (1 - k) + h * 0.075 + dy + h * 0.15, w * k, h * k);
      } else if (kind === "shake") {
        const dx = Math.sin(a * 3) * w * 0.04, k = 0.94;
        g.drawImage(src, w * (1 - k) / 2 + dx, h * (1 - k) / 2, w * k, h * k);
      } else if (kind === "spin") {
        const k = Math.max(0.04, Math.abs(Math.cos(a / 2)));
        g.drawImage(src, w * (1 - k) / 2, 0, w * k, h);
      } else if (kind === "scroll") {
        const o = Math.round(t * w);
        g.drawImage(src, -o, 0);
        g.drawImage(src, w - o, 0);
      } else if (kind === "flash") {
        g.drawImage(src, 0, 0);
        g.globalCompositeOperation = "source-atop";
        g.globalAlpha = Math.max(0, Math.sin(a)) * 0.8;
        g.fillStyle = "#fff";
        g.fillRect(0, 0, w, h);
      } else g.drawImage(src, 0, 0);
      out.push(c);
    }
    return out;
  }
  function srcFrames(it) {
    const b = baseFrames(it);
    if (b.length === 1 && it.effect && it.effect !== "none") return effectFrames(b[0], it.effect, clamp(it.efN || 12, 4, 48));
    return b;
  }
  function baseFrames(it) {
    if (it.frames) return it.frames;
    const cw = Math.floor(it.raw.width / it.cols), ch = Math.floor(it.raw.height / it.rows), out = [];
    for (let i = 0; i < it.count && i < it.cols * it.rows; i++) {
      const c = mkCanvas(cw, ch);
      c.getContext("2d").drawImage(it.raw, i % it.cols * cw, Math.floor(i / it.cols) * ch, cw, ch, 0, 0, cw, ch);
      out.push(c);
    }
    return out.length ? out : [it.raw];
  }
  function buildSheet(it) {
    let frames = srcFrames(it);
    if (it.mode === "block") {
      const S = it.size, maxN = Math.max(1, Math.floor(4096 / S));
      if (frames.length > maxN) frames = frames.filter((_, i) => i % Math.ceil(frames.length / maxN) === 0).slice(0, maxN);
      const sheet2 = mkCanvas(S, S * frames.length), g2 = sheet2.getContext("2d");
      g2.imageSmoothingEnabled = !it.pixel;
      frames.forEach((f, i) => g2.drawImage(f, 0, i * S, S, S));
      return { canvas: sheet2, cols: 1, rows: frames.length, fw: S, fh: S, n: frames.length, frames };
    }
    if (frames.length > MAX_POSTER_FRAMES) frames = frames.filter((_, i) => i % Math.ceil(frames.length / MAX_POSTER_FRAMES) === 0).slice(0, MAX_POSTER_FRAMES);
    const f0 = frames[0], sc = Math.min(1, it.maxSide / Math.max(f0.width, f0.height));
    let fw = Math.max(1, Math.round(f0.width * sc)), fh = Math.max(1, Math.round(f0.height * sc));
    const n = frames.length;
    let cols = Math.ceil(Math.sqrt(n));
    while (cols > 1 && cols * fw > 4096) cols--;
    let rows = Math.ceil(n / cols);
    while (rows * fh > 4096 && fw > 8) {
      fw = Math.floor(fw / 2);
      fh = Math.floor(fh / 2);
      rows = Math.ceil(n / cols);
    }
    const sheet = mkCanvas(cols * fw, rows * fh), g = sheet.getContext("2d");
    g.imageSmoothingEnabled = !it.pixel;
    frames.forEach((f, i) => g.drawImage(f, i % cols * fw, Math.floor(i / cols) * fh, fw, fh));
    return { canvas: sheet, cols, rows, fw, fh, n, frames };
  }
  const J = (o) => JSON.stringify(o, null, 2).replace(/\[\s*(-?[\d.]+(?:,\s*-?[\d.]+)*)\s*\]/g, (m, a) => "[" + a.replace(/\s+/g, " ") + "]") + "\n";
  const title = (it) => it.title || it.name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  function posterFiles(it, sh) {
    const id = `${NS}:img_${it.name}`, geo = `geometry.${NS}_img_${it.name}`;
    const W = Math.max(0.25, num(it.widthBlocks, 3)), H = r4(W * sh.fh / sh.fw);
    const px2 = W * 16, py = H * 16;
    const vb = Math.ceil(Math.max(W, H) * 1.5);
    const face = { uv: [0, 0], uv_size: [sh.fw, sh.fh] };
    const geometry = {
      format_version: V.formats.geometry,
      "minecraft:geometry": [{
        description: { identifier: geo, texture_width: sh.fw, texture_height: sh.fh, visible_bounds_width: vb, visible_bounds_height: vb, visible_bounds_offset: [0, r4(H / 2), 0] },
        bones: [{ name: "img", pivot: [0, 0, 0], cubes: [{ origin: [r4(-px2 / 2), 0, 0], size: [r4(px2), r4(py), 0], uv: { north: face, south: face } }] }]
      }]
    };
    const anim = sh.n > 1;
    const frameExpr = it.loop ? `math.mod(math.floor(q.life_time * ${it.fps}), ${sh.n})` : `math.min(math.floor(q.life_time * ${it.fps}), ${sh.n - 1})`;
    const desc = {
      identifier: id,
      materials: { default: "entity_alphatest" },
      textures: { default: `textures/${NS}_img/${it.name}` },
      geometry: { default: geo },
      render_controllers: [`controller.render.${NS}_img_${it.name}`],
      spawn_egg: { base_color: "#ff7a1a", overlay_color: "#222222" }
    };
    if (anim) desc.scripts = { pre_animation: [`v.fd_frame = ${frameExpr};`] };
    const rc = { geometry: "Geometry.default", materials: [{ "*": "Material.default" }], textures: ["Texture.default"] };
    if (anim) rc.uv_anim = {
      offset: [`math.mod(v.fd_frame, ${sh.cols}) / ${sh.cols}`, `math.floor(v.fd_frame / ${sh.cols}) / ${sh.rows}`],
      scale: [r4(1 / sh.cols), r4(1 / sh.rows)]
    };
    const bp = {
      format_version: V.formats.entityBP,
      "minecraft:entity": {
        description: { identifier: id, is_spawnable: true, is_summonable: true, is_experimental: false },
        components: {
          "minecraft:type_family": { family: ["fd_img"] },
          "minecraft:collision_box": { width: r4(Math.min(W, 4)), height: r4(Math.min(H, 4)) },
          "minecraft:physics": { has_gravity: false, has_collision: false },
          "minecraft:pushable": { is_pushable: false, is_pushable_by_piston: false },
          "minecraft:persistent": {},
          "minecraft:damage_sensor": { triggers: { cause: "all", deals_damage: "no" } }
        }
      }
    };
    return {
      W,
      H,
      id,
      files: [
        { pack: "rp", path: `textures/${NS}_img/${it.name}.png`, image: sh.canvas },
        { pack: "rp", path: `models/entity/${NS}_img_${it.name}.geo.json`, text: J(geometry) },
        { pack: "rp", path: `entity/${NS}_img_${it.name}.entity.json`, text: J({ format_version: V.formats.clientEntity, "minecraft:client_entity": { description: desc } }) },
        { pack: "rp", path: `render_controllers/${NS}_img_${it.name}.render_controllers.json`, text: J({ format_version: V.formats.renderController, render_controllers: { [`controller.render.${NS}_img_${it.name}`]: rc } }) },
        { pack: "bp", path: `entities/${NS}_img_${it.name}.entity.json`, text: J(bp) },
        { pack: "rp", path: "texts/en_US.lang", lang: [`entity.${id}.name=P\xF3ster ${title(it)}`, `item.spawn_egg.entity.${id}.name=P\xF3ster ${title(it)}`] }
      ]
    };
  }
  function blockFiles(it, sh) {
    const id = `${NS}:${it.name}`, tex = `${NS}_${it.name}`;
    const block = {
      format_version: V.formats.block,
      "minecraft:block": {
        description: { identifier: id, menu_category: { category: "construction" } },
        components: {
          "minecraft:geometry": "minecraft:geometry.full_block",
          "minecraft:material_instances": { "*": { texture: tex, render_method: it.transparent ? "alpha_test" : "opaque" } }
        }
      }
    };
    const frames = [];
    for (let i = 0; i < sh.n; i++) frames.push(i);
    return {
      id,
      files: [
        { pack: "rp", path: `textures/blocks/${tex}.png`, image: sh.canvas },
        { pack: "rp", path: "textures/flipbook_textures.json", mergeFlipbook: { flipbook_texture: `textures/blocks/${tex}`, atlas_tile: tex, ticks_per_frame: Math.max(1, Math.round(20 / it.fps)), frames, blend_frames: false } },
        { pack: "rp", path: "textures/terrain_texture.json", mergeTerrain: { key: tex, value: { textures: `textures/blocks/${tex}` } } },
        { pack: "bp", path: `blocks/${it.name}.json`, text: J(block) },
        { pack: "rp", path: "texts/en_US.lang", lang: [`tile.${id}.name=${title(it)}`] }
      ]
    };
  }
  function scriptSource(names) {
    return `import { world, system } from "@minecraft/server";

const FD_IMAGES = ${JSON.stringify(names)};
const TAG = "fd_img";
const DISTANCE = 3; // bloques frente al jugador

function ayuda(player) {
  player.sendMessage("\xA7e/scriptevent fd:img <nombre> \xA77\u2014 coloca un p\xF3ster frente a ti");
  player.sendMessage("\xA7e/scriptevent fd:img_clear [radio] \xA77\u2014 borra los p\xF3sters cercanos (16 por defecto)");
  player.sendMessage("\xA77P\xF3sters disponibles: \xA7f" + FD_IMAGES.join(", "));
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
    player.sendMessage("\xA7aP\xF3ster '" + name + "' colocado.");
  } else if (ev.id === "fd:img_clear") {
    const radius = Number(args[0]) || 16;
    const found = player.dimension.getEntities({ tags: [TAG], location: player.location, maxDistance: radius });
    for (const e of found) e.remove();
    player.sendMessage("\xA7aP\xF3sters eliminados: " + found.length);
  }
}, { namespaces: ["fd"] });
`;
  }
  function parentOf(node, root = state.root) {
    if (!root.children) return null;
    for (const c of root.children) {
      if (c === node) return root;
      const r = parentOf(node, c);
      if (r) return r;
    }
    return null;
  }
  function stripJsonc(t) {
    return t.replace(/^\s*\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/,(\s*[}\]])/g, "$1");
  }
  function parseJson(t) {
    try {
      return JSON.parse(t);
    } catch (e) {
      try {
        return JSON.parse(stripJsonc(t));
      } catch (e2) {
        return null;
      }
    }
  }
  function getFolder(parts, base) {
    let cur = base;
    for (const p of parts) {
      let f = cur.children.find((c) => c.type === "folder" && c.name === p);
      if (!f) {
        f = { id: uid(), type: "folder", name: p, open: true, children: [] };
        cur.children.push(f);
      }
      cur = f;
    }
    return cur;
  }
  function getFile(path, base) {
    const parts = path.split("/"), name = parts.pop(), dir = getFolder(parts, base);
    let f = dir.children.find((c) => c.type === "file" && c.name === name), created = false;
    if (!f) {
      f = { id: uid(), type: "file", name, content: "" };
      dir.children.push(f);
      created = true;
    }
    return { node: f, created, dir };
  }
  function findPacks() {
    const out = { bp: null, rp: null };
    for (const m of collectManifests()) {
      const j = parseJson(m.node.content || "");
      if (!j || !j.modules) continue;
      const types = j.modules.map((x) => x.type), folder = parentOf(m.node);
      if (!folder) continue;
      if (types.includes("resources") && !out.rp) out.rp = { folder, manifest: m.node, json: j };
      else if ((types.includes("data") || types.includes("script")) && !out.bp) out.bp = { folder, manifest: m.node, json: j };
    }
    return out;
  }
  function makePack(kind) {
    const root = findNode("root");
    const folder = getFolder([kind === "rp" ? "RP" : "BP"], root);
    const json = {
      format_version: 2,
      header: { name: kind === "rp" ? "FireDex RP" : "FireDex BP", description: "Generado con FireDex Img.Json", uuid: uuidv4(), version: [1, 0, 0], min_engine_version: V.minEngine.slice() },
      modules: [{ type: kind === "rp" ? "resources" : "data", uuid: uuidv4(), version: [1, 0, 0] }]
    };
    const manifest = { id: uid(), type: "file", name: "manifest.json", content: "" };
    folder.children.push(manifest);
    return { folder, manifest, json, fresh: true };
  }
  function apply(plan, includesScript) {
    const report = { created: [], updated: [], warnings: [], names: [] };
    const found = findPacks();
    const needBP = plan.some((p) => p.pack === "bp"), needRP = plan.some((p) => p.pack === "rp");
    const rp = needRP ? found.rp || makePack("rp") : found.rp;
    const bp = needBP ? found.bp || makePack("bp") : found.bp;
    if (rp && rp.fresh) report.created.push(rp.folder.name + "/manifest.json");
    if (bp && bp.fresh) report.created.push(bp.folder.name + "/manifest.json");
    const base = { rp: rp && rp.folder, bp: bp && bp.folder };
    const pname = { rp: rp ? rp.folder.name : "RP", bp: bp ? bp.folder.name : "BP" };
    const note = (res, pack, path) => (res.created ? report.created : report.updated).push(pname[pack] + "/" + path);
    for (const f of plan) {
      const { node, created } = getFile(f.path, base[f.pack]);
      if (f.image) node.content = f.image.toDataURL("image/png");
      else if (f.text != null) node.content = f.text;
      else if (f.lang) {
        const have = created ? [] : (node.content || "").split(/\r?\n/).filter(Boolean);
        for (const line of f.lang) {
          const k = line.split("=")[0], i = have.findIndex((l) => l.startsWith(k + "="));
          if (i >= 0) have[i] = line;
          else have.push(line);
        }
        node.content = have.join("\n") + "\n";
      } else if (f.mergeUiDefs) {
        let data = created ? null : parseJson(node.content || "");
        data = data && typeof data === "object" ? data : { ui_defs: [] };
        data.ui_defs = Array.isArray(data.ui_defs) ? data.ui_defs : [];
        if (!data.ui_defs.includes(f.mergeUiDefs)) data.ui_defs.push(f.mergeUiDefs);
        node.content = J(data);
      } else if (f.mergeHud) {
        let data = created ? null : parseJson(node.content || "");
        data = data && typeof data === "object" ? data : {};
        data.root_panel = data.root_panel || {};
        data.root_panel.modifications = Array.isArray(data.root_panel.modifications) ? data.root_panel.modifications : [];
        const dup = data.root_panel.modifications.some((m) => JSON.stringify(m.value || "").includes(f.mergeHud));
        if (!dup) data.root_panel.modifications.push({ array_name: "controls", operation: "insert_back", value: [{ [f.mergeHud]: {} }] });
        node.content = J(data);
      } else if (f.mergeFlipbook || f.mergeTerrain) {
        let data = created ? null : parseJson(node.content || "");
        if (!created && data === null) {
          report.warnings.push(`No pude leer ${f.path} (JSON inv\xE1lido); rev\xEDsalo y a\xF1ade la entrada a mano.`);
          continue;
        }
        if (f.mergeFlipbook) {
          data = Array.isArray(data) ? data : [];
          const i = data.findIndex((x) => x.atlas_tile === f.mergeFlipbook.atlas_tile);
          if (i >= 0) data[i] = f.mergeFlipbook;
          else data.push(f.mergeFlipbook);
        } else {
          data = data || { resource_pack_name: "fd", texture_name: "atlas.terrain", padding: 8, num_mip_levels: 4, texture_data: {} };
          data.texture_data = data.texture_data || {};
          data.texture_data[f.mergeTerrain.key] = f.mergeTerrain.value;
        }
        node.content = J(data);
      }
      note({ created }, f.pack, f.path);
    }
    if (bp) {
      const m = bp.json;
      m.modules = m.modules || [];
      m.dependencies = m.dependencies || [];
      if (!m.modules.some((x) => x.type === "data")) m.modules.unshift({ type: "data", uuid: uuidv4(), version: [1, 0, 0] });
      if (rp && !m.dependencies.some((d) => d.uuid === rp.json.header.uuid)) m.dependencies.push({ uuid: rp.json.header.uuid, version: rp.json.header.version.slice() });
      if (includesScript) {
        let sm = m.modules.find((x) => x.type === "script");
        if (!sm) {
          sm = { type: "script", language: "javascript", uuid: uuidv4(), entry: "scripts/main.js", version: [1, 0, 0] };
          m.modules.push(sm);
        }
        if (!m.dependencies.some((d) => d.module_name === "@minecraft/server")) m.dependencies.push({ module_name: "@minecraft/server", version: V.server });
        report.entry = sm.entry;
      }
      bp.manifest.content = J(m);
      if (!bp.fresh) report.updated.push(pname.bp + "/manifest.json");
    }
    if (rp) {
      const h = rp.json.header;
      if (!h.min_engine_version) h.min_engine_version = V.minEngine.slice();
      rp.manifest.content = J(rp.json);
      if (!rp.fresh) report.updated.push(pname.rp + "/manifest.json");
    }
    report.bpFolder = bp && bp.folder;
    return report;
  }
  function wireScript(report, names) {
    const bp = report.bpFolder;
    if (!bp) return;
    const entry = report.entry || "scripts/main.js", parts = entry.split("/"), mainName = parts.pop();
    const dirParts = parts;
    const scriptPath = (dirParts.length ? dirParts.join("/") + "/" : "") + "fd_img.js";
    const existing = getFile(scriptPath, bp);
    let prev = [];
    if (!existing.created) {
      const m = /const FD_IMAGES = (\[[^\]]*\]);/.exec(existing.node.content || "");
      if (m) {
        try {
          prev = JSON.parse(m[1]);
        } catch (e) {
        }
      }
    }
    const all = Array.from(new Set(prev.concat(names)));
    existing.node.content = scriptSource(all);
    (existing.created ? report.created : report.updated).push(bp.name + "/" + scriptPath);
    const main = getFile(entry, bp), imp = 'import "./fd_img.js";';
    if (main.created) {
      main.node.content = "// Punto de entrada del Behavior Pack\n" + imp + "\n";
      report.created.push(bp.name + "/" + entry);
    } else if (!/fd_img\.js/.test(main.node.content || "")) {
      main.node.content = imp + "\n" + (main.node.content || "");
      report.updated.push(bp.name + "/" + entry);
    }
    report.scriptNode = existing.node;
  }
  function generate() {
    if (!items.length) return showToast("A\xF1ade al menos una imagen.");
    const plan = [], posters = [], blocks = [], screens = [];
    for (const it of items) {
      it.name = slug(it.name);
      if (it.mode === "screen") {
        const sc = screenFiles(it);
        plan.push(...sc.files);
        screens.push({ it, id: sc.id });
        continue;
      }
      const sh = buildSheet(it);
      if (it.mode === "block") {
        const b = blockFiles(it, sh);
        plan.push(...b.files);
        blocks.push({ it, id: b.id, n: sh.n });
      } else {
        const p = posterFiles(it, sh);
        plan.push(...p.files);
        posters.push({ it, id: p.id, W: p.W, H: p.H, n: sh.n });
      }
    }
    const report = apply(plan, posters.length > 0 || screens.length > 0);
    if (posters.length) wireScript(report, posters.map((p) => p.it.name));
    if (screens.length) {
      const mp = {};
      screens.forEach((x) => {
        mp[x.it.name] = num(x.it.seconds, 4);
      });
      wireAnimScript(report, mp);
    }
    report.posters = posters;
    report.blocks = blocks;
    report.screens = screens;
    render();
    saveState();
    const open2 = report.scriptNode || null;
    if (open2) {
      activeFileId = open2.id;
      renderEditor();
    }
    lastReport = report;
    step = "done";
    showDone();
  }
  const FITS = [["contain", "Fit (keep ratio)"], ["cover", "Fill screen (crop)"], ["stretch", "Stretch"], ["fixed", "Fixed size"]];
  const MODES = [["screen", "Screen"], ["poster", "World poster"], ["block", "Animated block"]];
  let playing = true, curFrame = 0, raf = 0, bgCv = null, startT = 0;
  function active() {
    return items.find((i) => i.id === activeId) || null;
  }
  function sheetOf(it) {
    if (!it._sh) it._sh = buildSheet(it);
    return it._sh;
  }
  function dirty(it) {
    if (it) {
      it._sh = null;
      it.thumb = null;
    }
  }
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = s * 1664525 + 1013904223 >>> 0;
      return s / 4294967296;
    };
  }
  function survivalBg() {
    const W = 320, H = 180, c = mkCanvas(W, H), g = c.getContext("2d"), r = rng(7);
    const sky = g.createLinearGradient(0, 0, 0, H * 0.7);
    sky.addColorStop(0, "#6aa8f5");
    sky.addColorStop(1, "#bfe3ff");
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#fff6b0";
    g.fillRect(238, 22, 16, 16);
    g.fillStyle = "#fffbd6";
    g.fillRect(241, 25, 10, 10);
    g.fillStyle = "rgba(255,255,255,.92)";
    [[30, 28, 46, 7], [44, 22, 24, 6], [150, 40, 52, 7], [164, 34, 26, 6], [262, 58, 40, 6], [-6, 56, 34, 6]].forEach((b) => g.fillRect(b[0], b[1], b[2], b[3]));
    const far = [];
    for (let x = 0; x < W; x++) far[x] = Math.round(104 + Math.sin(x / 23) * 9 + Math.sin(x / 9) * 3);
    for (let x = 0; x < W; x++) {
      g.fillStyle = "#4e7d4a";
      g.fillRect(x, far[x], 1, H - far[x]);
    }
    const hgt = [];
    for (let x = 0; x < W; x++) hgt[x] = Math.round(122 + Math.sin(x / 31 + 1) * 8 + Math.sin(x / 11) * 3);
    for (let x = 0; x < W; x++) {
      const t = hgt[x];
      for (let y = t; y < H; y++) {
        const d = y - t;
        let col;
        if (d < 3) col = ["#5fa23a", "#58983a", "#67ad40"][r() * 3 | 0];
        else if (d < 24) col = ["#866043", "#7a563b", "#926a4a", "#6f4e36"][r() * 4 | 0];
        else col = ["#7d7d7d", "#737373", "#878787", "#6a6a6a"][r() * 4 | 0];
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    }
    const tree = (x) => {
      const y = hgt[x];
      g.fillStyle = "#6b5233";
      g.fillRect(x, y - 30, 4, 30);
      g.fillStyle = "#7a5e3c";
      g.fillRect(x + 1, y - 30, 1, 30);
      for (let i = 0; i < 90; i++) {
        g.fillStyle = ["#2f7d32", "#3a8d3a", "#276b2b"][r() * 3 | 0];
        const lx = x - 12 + i % 10 * 3, ly = y - 52 + Math.floor(i / 10) * 3;
        if (Math.abs(lx - x - 2) + Math.abs(ly - (y - 40)) < 30) g.fillRect(lx, ly, 3, 3);
      }
    };
    [44, 118, 268, 304].forEach(tree);
    return c;
  }
  function hudOverlay(g, W, H, sc) {
    const s = sc, cx = W / 2, hb = H - 22 * s, slot = 20 * s;
    g.fillStyle = "rgba(20,20,20,.75)";
    g.fillRect(cx - slot * 4.5 - 2 * s, hb - 2 * s, slot * 9 + 4 * s, slot + 4 * s);
    for (let i = 0; i < 9; i++) {
      g.fillStyle = i === 2 ? "#e6e6e6" : "#3a3a3a";
      g.fillRect(cx - slot * 4.5 + i * slot, hb, slot - s, slot - s);
      g.fillStyle = "#8b8b8b";
      g.fillRect(cx - slot * 4.5 + i * slot + 2 * s, hb + 2 * s, slot - 5 * s, slot - 5 * s);
    }
    g.fillStyle = "#e03c3c";
    for (let i = 0; i < 10; i++) g.fillRect(cx - slot * 4.5 + i * 8 * s, hb - 11 * s, 7 * s, 7 * s);
    g.fillStyle = "#c28a3a";
    for (let i = 0; i < 10; i++) g.fillRect(cx + slot * 4.5 - (i + 1) * 8 * s, hb - 11 * s, 7 * s, 7 * s);
    g.fillStyle = "#2a2a2a";
    g.fillRect(cx - slot * 4.5, hb - 17 * s, slot * 9, 3 * s);
    g.fillStyle = "#7fe03a";
    g.fillRect(cx - slot * 4.5, hb - 17 * s, slot * 5.2, 3 * s);
    g.fillStyle = "#fff";
    g.fillRect(cx - s, H / 2 - 5 * s, 2 * s, 10 * s);
    g.fillRect(cx - 5 * s, H / 2 - s, 10 * s, 2 * s);
  }
  function stageDraw(ts) {
    raf = requestAnimationFrame(stageDraw);
    const cv = document.getElementById("anCv");
    if (!cv) return;
    const wrap = cv.parentElement, w = wrap.clientWidth, h = wrap.clientHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const g = cv.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.imageSmoothingEnabled = false;
    if (!bgCv) bgCv = survivalBg();
    const k = Math.max(w / bgCv.width, h / bgCv.height);
    g.drawImage(bgCv, (w - bgCv.width * k) / 2, (h - bgCv.height * k) / 2, bgCv.width * k, bgCv.height * k);
    const it = active(), dim = it ? clamp(num(it.dim, 45), 0, 85) : 45;
    g.fillStyle = "rgba(0,0,0," + dim / 100 + ")";
    g.fillRect(0, 0, w, h);
    hudOverlay(g, w, h, Math.max(1, Math.round(h / 180)));
    if (!it) {
      g.fillStyle = "rgba(255,255,255,.7)";
      g.font = "700 16px system-ui";
      g.textAlign = "center";
      g.fillText(FD_T("Drop images, a GIF or a sprite sheet to start"), w / 2, h / 2);
      return;
    }
    const sh = sheetOf(it);
    if (playing && sh.n > 1) curFrame = Math.floor((ts - startT) / 1e3 * clamp(num(it.fps, 8), 1, 30)) % sh.n;
    curFrame = clamp(curFrame, 0, sh.n - 1);
    const sx = curFrame % sh.cols * sh.fw, sy = Math.floor(curFrame / sh.cols) * sh.fh;
    g.imageSmoothingEnabled = !it.pixel;
    if (it.mode === "screen") {
      const fit = it.fit || "contain", a = sh.fw / sh.fh;
      let dw = w, dh = h;
      if (fit === "contain") {
        dw = Math.min(w, h * a);
        dh = dw / a;
      } else if (fit === "cover") {
        dw = Math.max(w, h * a);
        dh = dw / a;
      } else if (fit === "fixed") {
        dw = num(it.fixedW, 256) * (h / 240);
        dh = dw / a;
      }
      g.globalAlpha = clamp(num(it.opacity, 100), 5, 100) / 100;
      g.drawImage(sh.canvas, sx, sy, sh.fw, sh.fh, (w - dw) / 2, (h - dh) / 2, dw, dh);
      g.globalAlpha = 1;
    } else if (it.mode === "poster") {
      const dw = Math.min(w * 0.62, h * 0.8 * sh.fw / sh.fh), dh = dw * sh.fh / sh.fw;
      g.fillStyle = "rgba(0,0,0,.35)";
      g.fillRect((w - dw) / 2 + 8, (h - dh) / 2 + 10, dw, dh);
      g.drawImage(sh.canvas, sx, sy, sh.fw, sh.fh, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      const bs = Math.min(w, h) * 0.2;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) g.drawImage(sh.canvas, 0, curFrame * sh.fh, sh.fw, sh.fh, w / 2 + i * bs - bs / 2, h / 2 + j * bs - bs / 2, bs, bs);
    }
    const no = document.getElementById("anFrameNo");
    if (no) no.textContent = curFrame + 1 + " / " + sh.n;
    const sc = document.getElementById("anScrub");
    if (sc && document.activeElement !== sc) {
      sc.max = sh.n - 1;
      sc.value = curFrame;
    }
    document.querySelectorAll(".an-fr").forEach((el, i) => el.classList.toggle("on", i === curFrame));
  }
  function mountApp() {
    unmountApp();
    const r = document.createElement("div");
    r.className = "an-app";
    r.id = "anRoot";
    document.body.appendChild(r);
    document.body.classList.add("an-open");
    shellHtml(r);
    refreshPanels();
    startT = performance.now();
    raf = requestAnimationFrame(stageDraw);
    document.addEventListener("keydown", onKey, true);
  }
  function unmountApp() {
    cancelAnimationFrame(raf);
    const r = document.getElementById("anRoot");
    if (r) r.remove();
    document.body.classList.remove("an-open");
    document.removeEventListener("keydown", onKey, true);
  }
  function closeApp(back) {
    unmountApp();
    if (back) showToolboxModal();
  }
  function onKey(e) {
    if (!document.getElementById("anRoot")) return;
    if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.code === "Space") {
      e.preventDefault();
      playing = !playing;
      const b = document.getElementById("anPlay");
      if (b) b.innerHTML = playing ? PX.pause : PX.play;
    } else if (e.key === "Escape") closeApp(true);
  }
  const PX = {};
  const FD_T = (s) => window.FD_I18N ? window.FD_I18N.t(s) : s;
  const px = (n, s) => window.FD_ICONS ? window.FD_ICONS.svg(n, { size: s || 18 }) : "";
  function shellHtml(r) {
    PX.play = px("play", 18);
    PX.pause = px("pause", 18);
    r.innerHTML = `
<header class="an-top">
  <button class="an-ib" id="anBack" title="${FD_T("Back to tools")}">${px("back", 18)}</button>
  <span class="an-logo">${px("film", 22)}</span><b class="an-title">Animator</b>
  <div class="an-seg" id="anModes">${MODES.map((m) => `<button data-mode="${m[0]}">${FD_T(m[1])}</button>`).join("")}</div>
  <span class="an-sp"></span>
  <button class="an-btn primary" id="anGen">${px("download", 16)}<span>${FD_T("Generate files in the project")}</span></button>
  <button class="an-ib" id="anClose" title="${FD_T("Close")}">${px("close", 16)}</button>
</header>
<div class="an-body">
  <aside class="an-left">
    <label class="an-drop" id="anDrop">${px("upload", 28)}<span>${FD_T("Drop or choose frames")}<small>PNG \xB7 JPG \xB7 GIF \xB7 WebP</small></span><input type="file" id="anFile" accept="image/*" multiple hidden></label>
    <label class="an-chk"><input type="checkbox" id="anJoin" checked><span>${FD_T("Several images = frames of ONE animation (sorted by name)")}</span></label>
    <div class="an-list" id="anList"></div>
  </aside>
  <section class="an-stage"><canvas id="anCv"></canvas><div class="an-done" id="anDone" hidden></div></section>
  <aside class="an-right" id="anParams"></aside>
</div>
<footer class="an-time">
  <button class="an-ib" id="anPlay">${PX.pause}</button>
  <input type="range" id="anScrub" min="0" max="0" value="0">
  <b id="anFrameNo">0 / 0</b>
  <div class="an-frames" id="anFrames"></div>
</footer>`;
    wireShell(r);
  }
  function wireShell(r) {
    r.querySelector("#anBack").onclick = () => closeApp(true);
    r.querySelector("#anClose").onclick = () => closeApp(false);
    r.querySelector("#anGen").onclick = generate;
    r.querySelector("#anPlay").onclick = () => {
      playing = !playing;
      r.querySelector("#anPlay").innerHTML = playing ? PX.pause : PX.play;
      if (playing) startT = performance.now() - curFrame / clamp(num((active() || {}).fps, 8), 1, 30) * 1e3;
    };
    r.querySelector("#anScrub").oninput = (e) => {
      playing = false;
      r.querySelector("#anPlay").innerHTML = PX.play;
      curFrame = +e.target.value;
    };
    const fileEl = r.querySelector("#anFile"), drop = r.querySelector("#anDrop"), joinEl = r.querySelector("#anJoin");
    fileEl.onchange = () => {
      addFiles(fileEl.files, joinEl.checked);
      fileEl.value = "";
    };
    ["dragover", "dragenter"].forEach((e) => drop.addEventListener(e, (ev) => {
      ev.preventDefault();
      drop.classList.add("drag");
    }));
    ["dragleave", "drop"].forEach((e) => drop.addEventListener(e, (ev) => {
      ev.preventDefault();
      drop.classList.remove("drag");
    }));
    drop.addEventListener("drop", (ev) => addFiles(ev.dataTransfer.files, joinEl.checked));
    r.querySelector("#anStage, .an-stage").addEventListener("dragover", (e) => e.preventDefault());
    r.querySelector(".an-stage").addEventListener("drop", (e) => {
      e.preventDefault();
      addFiles(e.dataTransfer.files, joinEl.checked);
    });
    r.querySelector("#anModes").onclick = (e) => {
      const b = e.target.closest("[data-mode]");
      const it = active();
      if (b && it) {
        it.mode = b.dataset.mode;
        dirty(it);
        refreshPanels();
      }
    };
    r.querySelector("#anList").onclick = (e) => {
      const el = e.target.closest(".an-item");
      if (!el) return;
      const rm = e.target.closest("[data-rm]");
      if (rm) {
        items = items.filter((x) => x.id !== rm.dataset.rm);
        if (activeId === rm.dataset.rm) activeId = items[0] ? items[0].id : null;
      } else activeId = el.dataset.id;
      curFrame = 0;
      refreshPanels();
    };
    r.querySelector("#anFrames").onclick = (e) => {
      const f = e.target.closest(".an-fr");
      if (f) {
        playing = false;
        r.querySelector("#anPlay").innerHTML = PX.play;
        curFrame = +f.dataset.i;
      }
    };
    r.querySelector("#anParams").addEventListener("change", onParam);
    r.querySelector("#anParams").addEventListener("input", (e) => {
      if (e.target.type === "range") onParam(e, true);
    });
  }
  function onParam(e, live) {
    const inp = e.target, k = inp.dataset.k, it = active();
    if (!it || !k) return;
    if (inp.type === "checkbox") it[k] = inp.checked;
    else if (k === "name") it[k] = slug(inp.value);
    else if (k === "title" || k === "fit" || k === "effect") it[k] = inp.value;
    else it[k] = num(inp.value, it[k]);
    if (k === "cols" || k === "rows") {
      it.cols = clamp(Math.round(it.cols), 1, 64);
      it.rows = clamp(Math.round(it.rows), 1, 64);
      it.count = it.cols * it.rows;
    }
    if (k === "count") it.count = clamp(Math.round(it.count), 1, it.cols * it.rows);
    if (k === "fps") it.fps = clamp(Math.round(it.fps), 1, 30);
    if (k === "efN") it.efN = clamp(Math.round(it.efN), 4, 48);
    if (k === "seconds") it.seconds = clamp(num(it.seconds, 3), 0.5, 600);
    if (!/^(dim|opacity|fit|fixedW|seconds|loop)$/.test(k)) dirty(it);
    if (live) {
      const o = document.getElementById("anV_" + k);
      if (o) o.textContent = inp.value + "%";
      return;
    }
    refreshPanels();
  }
  function paramsHtml(it) {
    const sh = sheetOf(it), isSheet = !!it.raw;
    const f = (l, inner) => `<div class="an-f"><label>${FD_T(l)}</label>${inner}</div>`;
    const num_ = (k, min, max, step2) => `<input type="number" data-k="${k}" min="${min}" max="${max}" step="${step2 || 1}" value="${it[k]}">`;
    const chk = (k, l) => `<label class="an-chk"><input type="checkbox" data-k="${k}" ${it[k] ? "checked" : ""}><span>${FD_T(l)}</span></label>`;
    const rng_ = (k, def) => `<input type="range" data-k="${k}" min="0" max="${k === "dim" ? 85 : 100}" value="${it[k] == null ? def : it[k]}"><em id="anV_${k}">${it[k] == null ? def : it[k]}%</em>`;
    let h = `<h4>${FD_T("Animation")}</h4>` + f("Name", `<input type="text" data-k="name" value="${esc(it.name)}">`);
    h += `<p class="an-hint">${it.mode === "screen" ? FD_T("Plays over the whole game screen (JSON UI). Trigger: /title @s title fd_anim:") + esc(slug(it.name)) : it.mode === "poster" ? FD_T("Flat entity that you place in the world with a command.") : FD_T("A block with an animated (flipbook) texture.")}</p>`;
    if (isSheet) h += `<div class="an-row">${f("Columns", num_("cols", 1, 64))}${f("Rows", num_("rows", 1, 64))}</div>${f("Frames to use", num_("count", 1, it.cols * it.rows))}`;
    if (baseFrames(it).length === 1) h += `<div class="an-row">${f("Effect (one image)", `<select data-k="effect">${EFFECTS.map((e) => `<option value="${e[0]}" ${(it.effect || "none") === e[0] ? "selected" : ""}>${FD_T(e[1])}</option>`).join("")}</select>`)}${it.effect && it.effect !== "none" ? f("Effect frames", num_("efN", 4, 48)) : ""}</div>`;
    h += `<div class="an-row">${f("Speed (fps)", num_("fps", 1, 30))}${chk("loop", "Loop")}</div>`;
    h += `<h4>${FD_T("Display")}</h4>`;
    if (it.mode === "screen") {
      h += f("Fit", `<select data-k="fit">${FITS.map((x) => `<option value="${x[0]}" ${(it.fit || "contain") === x[0] ? "selected" : ""}>${FD_T(x[1])}</option>`).join("")}</select>`);
      if ((it.fit || "contain") === "fixed") h += f("Width (UI px)", num_("fixedW", 16, 1024, 8));
      h += f("Opacity", rng_("opacity", 100)) + f("Duration (seconds)", num_("seconds", 0.5, 600, 0.5));
    } else if (it.mode === "poster") h += `<div class="an-row">${f("Width (blocks)", num_("widthBlocks", 0.5, 32, 0.5))}${f("Max resolution (px)", `<select data-k="maxSide">${[64, 128, 256, 512, 1024].map((s) => `<option ${s === it.maxSide ? "selected" : ""}>${s}</option>`).join("")}</select>`)}</div>`;
    else h += `<div class="an-row">${f("Size (px)", `<select data-k="size">${[16, 32, 64, 128].map((s) => `<option ${s === it.size ? "selected" : ""}>${s}</option>`).join("")}</select>`)}${chk("transparent", "Keep transparency")}</div>`;
    h += chk("pixel", "Pixel art (no smoothing)");
    h += `<h4>${FD_T("Preview background")}</h4>` + f("Darkness", rng_("dim", 45));
    h += `<p class="an-meta">${sh.n} ${FD_T("frame(s)")} \xB7 ${sh.canvas.width}\xD7${sh.canvas.height}px</p>`;
    return h;
  }
  function refreshPanels() {
    const r = document.getElementById("anRoot");
    if (!r) return;
    const it = active();
    r.querySelectorAll("#anModes [data-mode]").forEach((b) => {
      b.classList.toggle("on", !!it && b.dataset.mode === it.mode);
      b.disabled = !it;
    });
    r.querySelector("#anGen").disabled = !items.length;
    r.querySelector("#anList").innerHTML = items.length ? items.map((x) => `<div class="an-item${x.id === activeId ? " on" : ""}" data-id="${x.id}"><img src="${x.thumb || thumbOf(x)}" alt=""><div><b>${esc(x.name)}</b><small>${FD_T((MODES.find((m) => m[0] === x.mode) || MODES[0])[1])} \xB7 ${srcFrames(x).length} ${FD_T("fr.")}</small></div><button data-rm="${x.id}" title="${FD_T("Remove")}">${px("close", 12)}</button></div>`).join("") : `<div class="an-empty">${FD_T("No images yet.")}</div>`;
    r.querySelector("#anParams").innerHTML = it ? paramsHtml(it) : `<div class="an-empty">${FD_T("Drop an image, a GIF or a sprite sheet to start.")}</div>`;
    const fr = r.querySelector("#anFrames");
    if (it) {
      const sh = sheetOf(it);
      fr.innerHTML = sh.frames.slice(0, 96).map((f, i) => `<canvas class="an-fr" data-i="${i}" width="40" height="40"></canvas>`).join("");
      fr.querySelectorAll("canvas").forEach((c, i) => {
        const g = c.getContext("2d"), f = sh.frames[i], k = Math.min(40 / f.width, 40 / f.height);
        g.imageSmoothingEnabled = false;
        g.drawImage(f, (40 - f.width * k) / 2, (40 - f.height * k) / 2, f.width * k, f.height * k);
      });
    } else fr.innerHTML = "";
  }
  function refresh() {
    refreshPanels();
  }
  function thumbOf(it) {
    const f = srcFrames(it)[0];
    it.thumb = f.toDataURL("image/png");
    return it.thumb;
  }
  function open() {
    items = [];
    activeId = null;
    step = "edit";
    lastReport = null;
    playing = true;
    curFrame = 0;
    if (typeof closeModal === "function") closeModal();
    mountApp();
  }
  function stripOf(it) {
    let frames = srcFrames(it);
    const f0 = frames[0], sc = Math.min(1, it.maxSide / Math.max(f0.width, f0.height));
    let fw = Math.max(1, Math.round(f0.width * sc)), fh = Math.max(1, Math.round(f0.height * sc));
    const maxN = Math.max(1, Math.floor(4096 / fw));
    if (frames.length > maxN) frames = frames.filter((_, i) => i % Math.ceil(frames.length / maxN) === 0).slice(0, maxN);
    const c = mkCanvas(fw * frames.length, fh), g = c.getContext("2d");
    g.imageSmoothingEnabled = !it.pixel;
    frames.forEach((f, i) => g.drawImage(f, i * fw, 0, fw, fh));
    return { canvas: c, fw, fh, n: frames.length };
  }
  function screenFiles(it) {
    const st = stripOf(it), ns = NS + "_anim", key = it.name, trig = `${NS}_anim:${it.name}`;
    const anim = { anim_type: "flip_book", initial_uv: [0, 0], frame_count: st.n, frame_step: st.fw, fps: it.fps, reversible: false, easing: "linear", playing: true };
    const fit = it.fit || "contain";
    const img = { type: "image", texture: `textures/ui/${NS}_anim/${it.name}`, uv: `@${ns}.anim_${key}`, uv_size: [st.fw, st.fh], texture_file_width: st.fw * st.n, texture_file_height: st.fh, layer: 200, alpha: r4(clamp(num(it.opacity, 100), 5, 100) / 100) };
    if (fit === "fixed") {
      img.size = [Math.round(num(it.fixedW, 256)), Math.round(num(it.fixedW, 256) * st.fh / st.fw)];
      img.keep_ratio = true;
    } else if (fit === "stretch") img.size = ["100%", "100%"];
    else {
      img.size = fit === "cover" ? ["100%", "100%"] : ["100%", "100%"];
      img.keep_ratio = true;
      if (fit === "cover") img.fill = true;
    }
    const main = { type: "panel", size: ["100%", "100%"], layer: 200, controls: [{ img }], bindings: [{ binding_name: "#hud_title_text_string" }, { binding_type: "view", source_property_name: `(not ((#hud_title_text_string - '${trig}') = #hud_title_text_string))`, target_property_name: "#visible" }] };
    const ref = `${ns}_${key}@${ns}.${key}`;
    return {
      id: trig,
      files: [
        { pack: "rp", path: `textures/ui/${NS}_anim/${it.name}.png`, image: st.canvas },
        { pack: "rp", path: `ui/${ns}_${key}.json`, text: J({ namespace: ns, ["anim_" + key]: anim, [key]: main }) },
        { pack: "rp", path: "ui/_ui_defs.json", mergeUiDefs: `ui/${ns}_${key}.json` },
        { pack: "rp", path: "ui/hud_screen.json", mergeHud: ref }
      ]
    };
  }
  function animScriptSource(map) {
    return `import { world, system } from "@minecraft/server";

const FD_ANIMS = ${JSON.stringify(map)};

function help(player) {
  player.sendMessage("\xA7e/scriptevent fd:anim <name> \xA77- plays an animation on your screen");
  player.sendMessage("\xA7e/scriptevent fd:anim_stop \xA77- stops it");
  player.sendMessage("\xA77Available: \xA7f" + Object.keys(FD_ANIMS).join(", "));
}

system.afterEvents.scriptEventReceive.subscribe((ev) => {
  const player = ev.sourceEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  const name = ev.message.trim().split(/\\s+/)[0];
  if (ev.id === "fd:anim") {
    if (!name || !FD_ANIMS[name]) return help(player);
    const ticks = Math.round(FD_ANIMS[name] * 20);
    player.runCommand("title @s times 0 " + ticks + " 0");
    player.onScreenDisplay.setTitle("${NS}_anim:" + name);
  } else if (ev.id === "fd:anim_stop") {
    player.runCommand("title @s clear");
  }
}, { namespaces: ["fd"] });
`;
  }
  function wireAnimScript(report, anims) {
    const bp = report.bpFolder;
    if (!bp) return;
    const entry = report.entry || "scripts/main.js", parts = entry.split("/");
    parts.pop();
    const scriptPath = (parts.length ? parts.join("/") + "/" : "") + "fd_anim.js";
    const existing = getFile(scriptPath, bp);
    let prev = {};
    if (!existing.created) {
      const m = /const FD_ANIMS = (\{.*\});/.exec(existing.node.content || "");
      if (m) {
        try {
          prev = JSON.parse(m[1]);
        } catch (e) {
        }
      }
    }
    Object.assign(prev, anims);
    existing.node.content = animScriptSource(prev);
    (existing.created ? report.created : report.updated).push(bp.name + "/" + scriptPath);
    const main = getFile(entry, bp), imp = 'import "./fd_anim.js";';
    if (main.created) {
      main.node.content = imp + "\n";
      report.created.push(bp.name + "/" + entry);
    } else if (!/fd_anim\.js/.test(main.node.content || "")) {
      main.node.content = imp + "\n" + (main.node.content || "");
      report.updated.push(bp.name + "/" + entry);
    }
    report.scriptNode = report.scriptNode || existing.node;
  }
  function doneHtml() {
    const r = lastReport, cmd = (t) => `<div class="an-cmd"><code>${esc(t)}</code><button class="an-btn sm" data-copy="${esc(t)}">${FD_T("Copy")}</button></div>`;
    let how = "";
    if (r.screens.length) how += `<h4>${FD_T("Screen animations")}</h4>` + r.screens.map((s) => cmd(`/scriptevent fd:anim ${s.it.name}`) + cmd(`/title @s title ${s.id}`)).join("") + cmd("/scriptevent fd:anim_stop") + `<p class="an-hint">${FD_T("With /title the animation shows for the title duration; use /title @s times 0 60 0 first.")}</p>`;
    if (r.posters.length) how += `<h4>${FD_T("Posters")}</h4>` + r.posters.map((p) => cmd(`/scriptevent fd:img ${p.it.name}`)).join("") + cmd("/scriptevent fd:img_clear");
    if (r.blocks.length) how += `<h4>${FD_T("Blocks")}</h4>` + r.blocks.map((b) => cmd(`/give @s ${b.id}`)).join("");
    return `<div class="an-card"><div class="an-cardh"><b>${FD_T("Done \u2714")}</b><button class="an-ib" id="anDoneX">${px("close", 14)}</button></div>
<div class="an-cols"><div><h4>${FD_T("Files")}</h4><ul class="an-files">${r.created.map((f) => `<li class="new">+ ${esc(f)}</li>`).join("")}${r.updated.map((f) => `<li>~ ${esc(f)}</li>`).join("")}</ul>${r.warnings.map((w) => `<div class="an-warn">${esc(w)}</div>`).join("")}</div>
<div>${how}<h4>${FD_T("Before testing")}</h4><ol class="an-steps"><li>${FD_T("Copy the BP and RP to development_behavior_packs and development_resource_packs.")}</li><li>${FD_T("Activate both packs in the world.")}</li><li>${FD_T("Screen animations use JSON UI written from known patterns: test them in game (unverified).")}</li></ol></div></div>
<div class="an-cardf"><button class="an-btn" id="anMore">${FD_T("Add more")}</button><button class="an-btn primary" id="anFin">${FD_T("Close")}</button></div></div>`;
  }
  function showDone() {
    const d = document.getElementById("anDone");
    d.hidden = false;
    d.innerHTML = doneHtml();
    d.onclick = (e) => {
      const c = e.target.closest("[data-copy]");
      if (c) {
        copyToClipboard(c.dataset.copy);
        showToast(FD_T("Copied"));
        return;
      }
      if (e.target.closest("#anDoneX")) d.hidden = true;
      else if (e.target.closest("#anMore")) {
        items = [];
        activeId = null;
        d.hidden = true;
        refreshPanels();
      } else if (e.target.closest("#anFin")) closeApp(false);
    };
  }
  function ensurePack(kind) {
    const f = findPacks()[kind];
    if (f) return f;
    const m = makePack(kind);
    m.manifest.content = J(m.json);
    return m;
  }
  function folderPaths(node = state.root, pre = "", out = []) {
    (node.children || []).forEach((c) => {
      if (c.type === "folder") {
        const p = pre ? pre + "/" + c.name : c.name;
        out.push(p);
        folderPaths(c, p, out);
      }
    });
    return out;
  }
  function folderByPath(path) {
    return getFolder(String(path || "").split("/").map((x) => x.trim()).filter(Boolean), state.root);
  }
  function writeProjectFile(path, content) {
    const r = getFile(path, state.root);
    r.node.content = content;
    return r;
  }
  window.FD_UTIL = { ensurePack, getFile, getFolder, folderPaths, folderByPath, writeProjectFile, findPacks, J, slug, esc, parseJson, uuid: () => uuidv4() };
  window.openImgJsonTool = open;
})();

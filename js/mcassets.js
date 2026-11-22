/* FireDex · assets de Minecraft para el creador de estructuras.
 *
 * Orden de búsqueda de cada archivo:
 *   1) /mc/…  → repositorio propio dentro de la web (lo genera tools/sync-mc-assets.mjs)
 *   2) jsDelivr  → Mojang/bedrock-samples (sin límite de API, con CORS)
 *   3) raw.githubusercontent.com → último recurso
 * Si /mc/manifest.json no existe, el manifest se construye al vuelo con blocks.json +
 * terrain_texture.json del resource pack oficial, así que funciona incluso sin repositorio local.
 */
(function () {
  "use strict";
  const R = window.FD_MCRESOLVE;
  const LOCAL = "/mc/";
  const CDN = [
    "https://cdn.jsdelivr.net/gh/Mojang/bedrock-samples@main/resource_pack/",
    "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/"
  ];
  const F6 = ["up", "down", "north", "south", "east", "west"];
  const SHADE_DIR = { up: 1, down: 0.5, east: 0.78, west: 0.78, south: 0.64, north: 0.64 };
  const short = (s) => String(s || "").replace(/\[.*$/, "").replace(/^[^:]*:/, "");
  const isCustom = (s) => /^[^:\[]+:/.test(String(s)) && !/^minecraft:/.test(String(s));

  let M = { v: 1, blocks: {}, terrain: {}, tints: {}, items: {}, files: null };
  let fileSet = null, localOk = false, origin = "none";
  const hooks = [];
  let raf = 0;
  function fire() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      hooks.forEach((f) => {
        try { f(); } catch (e) { /* un hook roto no debe romper el resto */ }
      });
    });
  }

  // ---------- red ----------
  const getText = (u) => fetch(u).then((r) => {
    if (!r.ok) throw new Error(u + " " + r.status);
    return r.text();
  });
  const firstText = (urls) => urls.reduce((p, u) => p.catch(() => getText(u)), Promise.reject(new Error("x")));

  const ready = (async function () {
    try {
      const m = R.parseLoose(await getText(LOCAL + "manifest.json"));
      if (m && m.v === 1 && m.blocks) {
        M = m;
        localOk = true;
        origin = "local";
      }
    } catch (e) { /* sin repositorio local */ }
    if (!localOk) {
      try {
        const rel = ["blocks.json", "textures/terrain_texture.json", "textures/item_texture.json"];
        const t = await Promise.all(rel.map((r) => firstText(CDN.map((c) => c + r)).catch(() => null)));
        if (t[0] && t[1]) {
          M = R.buildManifest({ blocks: t[0], terrain: t[1], items: t[2] });
          origin = "cdn";
        }
      } catch (e) { /* se usará la lista antigua de nombres */ }
    }
    if (M.files) fileSet = new Set(M.files);
    fire();
  })();

  // ---------- imágenes ----------
  const IMG = new Map();
  function tryImg(u) {
    return new Promise((res) => {
      const i = new Image();
      i.crossOrigin = "anonymous";
      i.onload = () => {
        i.__url = u;
        res(i);
      };
      i.onerror = () => res(null);
      i.src = u;
    });
  }
  // path sin extensión, p. ej. "textures/blocks/stone". guess=true → nombre adivinado (se omite si el repo lo lista y no existe)
  function loadImg(path, guess) {
    if (!path) return Promise.resolve(null);
    if (guess && fileSet && !fileSet.has(path)) return Promise.resolve(null);
    let p = IMG.get(path);
    if (p) return p;
    const urls = (localOk ? [LOCAL + path + ".png"] : []).concat(CDN.map((c) => c + path + ".png"));
    p = urls.reduce((acc, u) => acc.then((r) => r || tryImg(u)), Promise.resolve(null)).then((i) => {
      fire();
      return i;
    });
    IMG.set(path, p);
    return p;
  }

  // ---------- tiles (cuadrado) y tintes ----------
  const mkCanvas = (w, h) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  const dimOf = (i) => Math.min(i.naturalWidth || i.width, i.naturalHeight || i.height);
  const TL = new WeakMap();
  function hex(c) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c || "");
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [255, 255, 255];
  }
  // Devuelve un canvas/imagen cuadrado listo para dibujar (recorta tiras animadas y aplica tinte)
  function tileOf(img, tint, mode) {
    if (!img) return null;
    const key = tint ? tint + "|" + mode : "";
    let m = TL.get(img);
    if (!m) TL.set(img, (m = new Map()));
    if (m.has(key)) return m.get(key);
    const w = dimOf(img), square = (img.naturalWidth || img.width) === w && (img.naturalHeight || img.height) === w;
    let out = img;
    if (!square || tint) {
      const c = mkCanvas(w, w), g = c.getContext("2d");
      g.drawImage(img, 0, 0, w, w, 0, 0, w, w);
      out = c;
      if (tint) {
        try {
          const d = g.getImageData(0, 0, w, w), a = d.data, t = hex(tint);
          for (let i = 0; i < a.length; i += 4) {
            const r = a[i], gg = a[i + 1], b = a[i + 2];
            if (mode === "overlay" && !(Math.abs(r - gg) < 14 && Math.abs(gg - b) < 14)) continue;
            a[i] = (r * t[0]) / 255;
            a[i + 1] = (gg * t[1]) / 255;
            a[i + 2] = (b * t[2]) / 255;
          }
          g.putImageData(d, 0, 0);
        } catch (e) {
          out = square ? img : c; // canvas contaminado: sin tinte
        }
      }
    }
    m.set(key, out);
    return out;
  }
  const LEAF = { spruce_leaves: "#619961", birch_leaves: "#80a755" };
  function tintSpec(id, face, path) {
    const t = M.tints && M.tints[path];
    if (t) return t;
    if (id === "grass_block" || id === "grass") return face === "up" ? ["#79c05a", "full"] : face === "down" ? null : ["#79c05a", "overlay"];
    if (/^(tallgrass|short_grass|fern|large_fern|grass_path_unused)$/.test(id)) return ["#79c05a", "full"];
    if (/leaves$/.test(id) && !/azalea|cherry|pale/.test(id)) return [LEAF[id] || "#48b518", "full"];
    if (/^(vine|waterlily|lily_pad)$/.test(id)) return ["#5a9a3c", "full"];
    return null;
  }
  function avgOf(t) {
    try {
      const w = t.width || t.naturalWidth, c = mkCanvas(w, w), g = c.getContext("2d");
      g.drawImage(t, 0, 0);
      const a = g.getImageData(0, 0, w, w).data;
      let r = 0, gg = 0, b = 0, n = 0;
      for (let i = 0; i < a.length; i += 4) {
        if (a[i + 3] < 40) continue;
        r += a[i];
        gg += a[i + 1];
        b += a[i + 2];
        n++;
      }
      return n ? [(r / n) | 0, (gg / n) | 0, (b / n) | 0] : null;
    } catch (e) {
      return null;
    }
  }

  // ---------- resolución de bloques ----------
  const dd = () => window.FD_STRUCT_DATA;
  // nombres que en blocks.json aparecen con la clave antigua
  const ALIAS = { grass_block: ["grass"], mycelium: ["mycelium"], dirt_path: ["grass_path"], oak_planks: ["planks"], stone_bricks: ["stonebrick"], brick_block: ["brick_block"] };
  function candidates(id) {
    const out = [], seen = new Set();
    const add = (f, guess) => {
      if (!f || !f.up) return;
      const k = F6.map((x) => f[x]).join("|");
      if (seen.has(k)) return;
      seen.add(k);
      out.push({ f, guess });
    };
    add(R.expand(M.blocks[id]), false);
    (ALIAS[id] || []).forEach((n) => add(R.expand(M.blocks[n]), false));
    const names = dd() && dd().texNames ? dd().texNames(id) : [id];
    names.forEach((n) => {
      add(R.expand(M.blocks[n]), false);
      add(R.expand(M.terrain[n]), false);
      add(R.expand("textures/blocks/" + n), true);
    });
    return out;
  }

  const ENT = new Map(), RAW = new Map();
  function entry(base) {
    let q = RAW.get(base);
    if (q) return q;
    q = entry0(base);
    RAW.set(base, q);
    return q;
  }
  function entry0(base) {
    const key = isCustom(base) ? String(base) : "minecraft:" + short(base);
    let e = ENT.get(key);
    if (e) return e;
    e = { id: short(base), custom: isCustom(base), img: null, tile: null, side: null, avg: null, avgSide: null, faces: null, name: null, url: null, done: false };
    ENT.set(key, e);
    e.p = e.custom ? Promise.resolve(e) : ready.then(() => resolve(e)).catch(() => e);
    e.p = e.p.then(() => {
      e.done = true;
      fire();
      return e;
    });
    return e;
  }
  async function resolve(e) {
    const cands = candidates(e.id);
    let ch = null, up = null, nz = null;
    for (const c of cands) {
      up = await loadImg(c.f.up, c.guess);
      nz = c.f.north === c.f.up ? up : await loadImg(c.f.north, c.guess);
      if (up || nz) {
        ch = c;
        break;
      }
    }
    if (!ch) return;
    const imgs = {};
    await Promise.all(F6.map(async (k) => {
      imgs[k] = k === "up" ? up : k === "north" ? nz : await loadImg(ch.f[k], ch.guess);
    }));
    const any = imgs.north || imgs.up;
    const faces = {};
    F6.forEach((k) => {
      const img = imgs[k] || (k === "down" ? imgs.up : any), path = ch.f[k];
      const ts = tintSpec(e.id, k, path);
      faces[k] = { img, path, tile: tileOf(img, ts && ts[0], ts && ts[1]) };
    });
    e.faces = faces;
    e.img = faces.up.tile;
    e.tile = faces.up.tile;
    e.side = faces.north.tile;
    e.avg = avgOf(faces.up.tile);
    e.avgSide = avgOf(faces.north.tile) || e.avg;
    e.name = ch.f.up;
    e.url = faces.up.img && faces.up.img.__url;
  }

  // ---------- formas ----------
  const CROSS = /^(sapling|.*_sapling|.*_tulip|dandelion|poppy|blue_orchid|allium|azure_bluet|oxeye_daisy|cornflower|lily_of_the_valley|wither_rose|torchflower|red_flower|yellow_flower|tallgrass|short_grass|fern|deadbush|dead_bush|torch|redstone_torch|soul_torch|brown_mushroom|red_mushroom|sweet_berry_bush|reeds|sugar_cane|bush|firefly_bush|crimson_roots|warped_roots|hanging_roots|nether_sprouts|crimson_fungus|warped_fungus)$/;
  function shapeOf(id) {
    if (/^(chest|trapped_chest|ender_chest)$/.test(id)) return "chest";
    if (/_slab$/.test(id) && !/double/.test(id)) return "slab";
    if (/_stairs$/.test(id)) return "stairs";
    if (/(^|_)carpet$/.test(id)) return "carpet";
    if (id === "snow_layer") return "snow";
    if (CROSS.test(id)) return "cross";
    return "cube";
  }
  function stateOf(str) {
    const o = {}, m = /\[(.*)\]\s*$/.exec(String(str || ""));
    if (!m) return o;
    m[1].split(",").forEach((p) => {
      const kv = p.split("=");
      if (kv.length < 2) return;
      o[kv[0].trim().replace(/^"|"$/g, "").replace(/^minecraft:/, "")] = kv.slice(1).join("=").trim().replace(/^"|"$/g, "");
    });
    return o;
  }
  // rota k·90° en horizontal alrededor del centro del bloque (este→sur→oeste→norte)
  const rotP = (p, k) => {
    let x = p[0] - 0.5, z = p[2] - 0.5;
    for (let i = 0; i < k; i++) {
      const t = x;
      x = -z;
      z = t;
    }
    return [x + 0.5, p[1], z + 0.5];
  };
  const rotV = (v, k) => {
    let x = v[0], z = v[2];
    for (let i = 0; i < k; i++) {
      const t = x;
      x = -z;
      z = t;
    }
    return [x, v[1], z];
  };
  const rotBox = (b, k) => {
    const a = rotP(b[0], k), c = rotP(b[1], k);
    return [[Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.min(a[2], c[2])], [Math.max(a[0], c[0]), Math.max(a[1], c[1]), Math.max(a[2], c[2])]];
  };
  const DIRK = { east: 0, south: 1, west: 2, north: 3 };
  const FACEK = { north: 0, east: 1, south: 2, west: 3 };

  // Marcos de cara de un cubo completo (misma convención que el visor 3D)
  const CUBE = {
    up: { n: [0, 1, 0], o: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1] },
    down: { n: [0, -1, 0], o: [0, 0, 0], u: [1, 0, 0], v: [0, 0, 1] },
    east: { n: [1, 0, 0], o: [1, 1, 1], u: [0, 0, -1], v: [0, -1, 0] },
    west: { n: [-1, 0, 0], o: [0, 1, 0], u: [0, 0, 1], v: [0, -1, 0] },
    south: { n: [0, 0, 1], o: [0, 1, 1], u: [1, 0, 0], v: [0, -1, 0] },
    north: { n: [0, 0, -1], o: [1, 1, 0], u: [-1, 0, 0], v: [0, -1, 0] }
  };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const axisOf = (n) => (n[0] ? 0 : n[1] ? 1 : 2);
  const shadeOf = (n) => (n[1] > 0 ? 1 : n[1] < 0 ? 0.5 : n[0] ? 0.78 : 0.64);

  function edgeOf(o, n) {
    const a = axisOf(n);
    return n[a] > 0 ? o[a] >= 0.999 : o[a] <= 0.001;
  }

  // Caras de una caja con textura de bloque (se recorta como en el juego)
  function blockFaces(box, faces) {
    const out = [];
    F6.forEach((dir) => {
      const f = faces[dir], t = f && f.tile;
      if (!t) return;
      const C = CUBE[dir], a = axisOf(C.n), s = t.width || t.naturalWidth;
      const plane = C.n[a] > 0 ? box.to[a] : box.from[a];
      const c1 = [box.from[0], box.from[1], box.from[2]], c2 = [box.to[0], box.to[1], box.to[2]];
      c1[a] = c2[a] = plane;
      const fu = [dot([c1[0] - C.o[0], c1[1] - C.o[1], c1[2] - C.o[2]], C.u), dot([c2[0] - C.o[0], c2[1] - C.o[1], c2[2] - C.o[2]], C.u)];
      const fv = [dot([c1[0] - C.o[0], c1[1] - C.o[1], c1[2] - C.o[2]], C.v), dot([c2[0] - C.o[0], c2[1] - C.o[1], c2[2] - C.o[2]], C.v)];
      const u0 = Math.min(fu[0], fu[1]), u1 = Math.max(fu[0], fu[1]), v0 = Math.min(fv[0], fv[1]), v1 = Math.max(fv[0], fv[1]);
      if (u1 - u0 < 1e-6 || v1 - v0 < 1e-6) return;
      const o = [C.o[0] + C.u[0] * u0 + C.v[0] * v0, C.o[1] + C.u[1] * u0 + C.v[1] * v0, C.o[2] + C.u[2] * u0 + C.v[2] * v0];
      o[a] = plane;
      out.push({ n: C.n, o, u: [C.u[0] * (u1 - u0), C.u[1] * (u1 - u0), C.u[2] * (u1 - u0)], v: [C.v[0] * (v1 - v0), C.v[1] * (v1 - v0), C.v[2] * (v1 - v0)], img: t, rect: [u0 * s, v0 * s, (u1 - u0) * s, (v1 - v0) * s], shade: SHADE_DIR[dir], edge: edgeOf(o, C.n) });
    });
    return out;
  }

  // Caras de una caja de modelo de entidad (despliegue estándar de Minecraft; frente = norte)
  function entFaces(box, img, k) {
    const sc = (img.naturalWidth || img.width) / 64;
    const [u0, v0, W, H, D] = box.uv;
    const x0 = box.from[0], y0 = box.from[1], z0 = box.from[2], x1 = box.to[0], y1 = box.to[1], z1 = box.to[2];
    const w = x1 - x0, h = y1 - y0, d = z1 - z0;
    const defs = [
      { n: [0, 0, -1], o: [x1, y1, z0], u: [-w, 0, 0], v: [0, -h, 0], r: [u0 + D, v0 + D, W, H] },
      { n: [0, 0, 1], o: [x0, y1, z1], u: [w, 0, 0], v: [0, -h, 0], r: [u0 + 2 * D + W, v0 + D, W, H] },
      { n: [1, 0, 0], o: [x1, y1, z1], u: [0, 0, -d], v: [0, -h, 0], r: [u0, v0 + D, D, H] },
      { n: [-1, 0, 0], o: [x0, y1, z0], u: [0, 0, d], v: [0, -h, 0], r: [u0 + D + W, v0 + D, D, H] },
      { n: [0, 1, 0], o: [x1, y1, z1], u: [-w, 0, 0], v: [0, 0, -d], r: [u0 + D, v0, W, D] },
      { n: [0, -1, 0], o: [x1, y0, z0], u: [-w, 0, 0], v: [0, 0, d], r: [u0 + D + W, v0, W, D] }
    ];
    return defs.map((f) => {
      const n = rotV(f.n, k), o = rotP(f.o, k);
      return { n, o, u: rotV(f.u, k), v: rotV(f.v, k), img, rect: [f.r[0] * sc, f.r[1] * sc, f.r[2] * sc, f.r[3] * sc], shade: shadeOf(n), edge: edgeOf(o, n) };
    });
  }

  const ENTIMG = new Map();
  function entImg(path) {
    let e = ENTIMG.get(path);
    if (e) return e;
    e = { img: null };
    ENTIMG.set(path, e);
    e.p = ready.then(() => loadImg(path, false)).then((i) => {
      e.img = i;
      fire();
      return e;
    });
    return e;
  }

  // Devuelve { faces:[…], quads:[…] } o null si es un cubo normal o aún no hay textura.
  const MC = new Map();
  const chestPath = (id) => "textures/entity/chest/" + (id === "trapped_chest" ? "trapped" : id === "ender_chest" ? "ender" : "normal");
  function model(base, st) {
    const e = entry(base), id = e.id, shape = shapeOf(id);
    if (shape === "cube" || e.custom) return null;
    const tok = shape === "chest" ? entImg(chestPath(id)).img : e.faces;
    if (!tok) return null;
    const key = id + "|" + (st || "");
    const c = MC.get(key);
    if (c && c.tok === tok) return c.m;
    const m = buildModel(e, id, shape, st);
    MC.set(key, { tok, m });
    return m;
  }
  function buildModel(e, id, shape, st) {
    const S = stateOf(st);
    if (shape === "chest") {
      const ei = entImg(chestPath(id));
      const k = FACEK[S.cardinal_direction] || 0;
      const P = (a, b, uv) => ({ from: a.map((x) => x / 16), to: b.map((x) => x / 16), uv });
      const boxes = [P([1, 0, 1], [15, 10, 15], [0, 19, 14, 10, 14]), P([1, 9, 1], [15, 14, 15], [0, 0, 14, 5, 14]), P([7, 8, 0], [9, 12, 1], [0, 0, 2, 4, 1])];
      let faces = [];
      boxes.forEach((b) => {
        faces = faces.concat(entFaces(b, ei.img, k));
      });
      return { faces, quads: null };
    }
    if (shape === "cross") {
      const t = e.faces.north.tile || e.faces.up.tile;
      if (!t) return null;
      const s = t.width || t.naturalWidth, r = [0, 0, s, s];
      return { faces: [], quads: [{ o: [0, 1, 0], u: [1, 0, 1], v: [0, -1, 0], img: t, rect: r }, { o: [1, 1, 0], u: [-1, 0, 1], v: [0, -1, 0], img: t, rect: r }] };
    }
    let boxes;
    if (shape === "slab") {
      const top = (S.vertical_half || (S.top_slot_bit === "true" ? "top" : "bottom")) === "top";
      boxes = [{ from: [0, top ? 0.5 : 0, 0], to: [1, top ? 1 : 0.5, 1] }];
    } else if (shape === "stairs") {
      const k = DIRK[["east", "west", "south", "north"][parseInt(S.weirdo_direction, 10) || 0]] || 0, up = S.upside_down_bit === "true" || S.upside_down_bit === "1";
      const a = up ? [[0, 0.5, 0], [1, 1, 1]] : [[0, 0, 0], [1, 0.5, 1]], b = up ? [[0.5, 0, 0], [1, 0.5, 1]] : [[0.5, 0.5, 0], [1, 1, 1]];
      boxes = [a, b].map((q) => {
        const r = rotBox(q, k);
        return { from: r[0], to: r[1] };
      });
    } else if (shape === "carpet") boxes = [{ from: [0, 0, 0], to: [1, 1 / 16, 1] }];
    else boxes = [{ from: [0, 0, 0], to: [1, ((parseInt(S.height, 10) || 0) + 1) / 8, 1] }];
    let faces = [];
    boxes.forEach((b) => {
      faces = faces.concat(blockFaces(b, e.faces));
    });
    return { faces, quads: null };
  }

  // ---------- iconos isométricos para la paleta ----------
  const ICON = new Map();
  function icon(base, st) {
    const e = entry(base), id = e.id, shape = shapeOf(id);
    const key = e.id + "|" + (shape === "stairs" || shape === "slab" ? shape : st && shape === "chest" ? "chest" : "");
    let r = ICON.get(key);
    if (r) return r;
    r = { url: null, canvas: null, p: null, shape };
    ICON.set(key, r);
    r.p = e.p.then(async () => {
      if (e.custom) return r;
      if (shape === "chest") await entImg(chestPath(id)).p;
      if (!e.faces && shape !== "chest") return r;
      const S = 64, c = mkCanvas(S, S), g = c.getContext("2d");
      g.imageSmoothingEnabled = false;
      const m = shape === "cube" ? null : model(base, shape === "chest" ? "[minecraft:cardinal_direction=south]" : shape === "stairs" ? "[weirdo_direction=0]" : "");
      if (shape === "cross" && m && m.quads) {
        const t = m.quads[0].img;
        g.drawImage(t, 0, 0, t.width || t.naturalWidth, t.height || t.naturalHeight, 6, 6, S - 12, S - 12);
      } else {
        const k = S / 48, iso = (p) => [(24 + 20 * p[0] - 20 * p[2]) * k, (4 + 10 * p[0] + 10 * p[2] + 22 * (1 - p[1])) * k];
        let faces = m ? m.faces : blockFaces({ from: [0, 0, 0], to: [1, 1, 1] }, e.faces);
        faces = faces.filter((f) => f.n[1] > 0 || f.n[2] > 0 || f.n[0] > 0);
        faces.forEach((f) => {
          const P0 = iso(f.o), P1 = iso([f.o[0] + f.u[0], f.o[1] + f.u[1], f.o[2] + f.u[2]]), P3 = iso([f.o[0] + f.v[0], f.o[1] + f.v[1], f.o[2] + f.v[2]]);
          g.setTransform(P1[0] - P0[0], P1[1] - P0[1], P3[0] - P0[0], P3[1] - P0[1], P0[0], P0[1]);
          g.drawImage(f.img, f.rect[0], f.rect[1], f.rect[2], f.rect[3], -0.01, -0.01, 1.02, 1.02);
          const sh = f.shade === 1 ? 1 : f.n[2] ? 0.82 : 0.64;
          if (sh < 1) {
            g.fillStyle = "rgba(0,0,0," + (1 - sh).toFixed(2) + ")";
            g.fillRect(-0.01, -0.01, 1.02, 1.02);
          }
        });
        g.setTransform(1, 0, 0, 1, 0, 0);
      }
      r.canvas = c;
      try {
        r.url = c.toDataURL("image/png");
      } catch (err) { /* canvas contaminado */ }
      fire();
      return r;
    }).catch(() => r);
    return r;
  }

  // ---------- items ----------
  const ITM = new Map();
  function item(name) {
    let r = ITM.get(name);
    if (r) return r;
    r = { url: null, img: null };
    ITM.set(name, r);
    r.p = ready.then(() => loadImg(M.items[name] || "textures/items/" + name, !M.items[name])).then((i) => {
      if (i) {
        r.img = i;
        r.url = i.__url;
      }
      return r;
    });
    return r;
  }

  // ---------- diagnóstico: FD_MC.coverage() en la consola ----------
  async function coverage(list) {
    await ready;
    const ids = (list || (dd() ? dd().BLOCKS : [])).map(short);
    const miss = [];
    const BATCH = 24;
    for (let i = 0; i < ids.length; i += BATCH) {
      await Promise.all(ids.slice(i, i + BATCH).map((id) => entry("minecraft:" + id).p));
    }
    ids.forEach((id) => {
      const e = entry("minecraft:" + id);
      if (!e.faces) miss.push(id);
    });
    const res = { origin, total: ids.length, ok: ids.length - miss.length, missing: miss };
    console.log("[FD_MC] origen:", origin, "· con textura:", res.ok + "/" + res.total, "· sin textura:", miss);
    return res;
  }

  window.FD_MC = {
    ready,
    entry,
    model,
    icon,
    item,
    tileOf,
    shapeOf,
    coverage,
    onUpdate: (f) => hooks.push(f),
    get origin() {
      return origin;
    },
    get manifest() {
      return M;
    }
  };
})();

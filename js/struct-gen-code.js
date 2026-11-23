/* FireDex · generador de código para "Generación de estructura".
 * bake()        → estructura "_gen" procesada (4 rotaciones si hace falta) + datos de base/entradas
 * nativeFiles() → features/ + feature_rules/ (Bedrock)
 * scriptSource()→ scripts/fd_structgen.js (motor adaptativo) */
(function () {
  "use strict";
  const C = () => window.FD_STRUCT_GEN_CORE;

  const structId = (folderPath, base) => {
    const m = /(?:^|\/)structures(?:\/(.*))?$/.exec(folderPath.replace(/\/+$/, ""));
    const rest = m && m[1] ? m[1].split("/").filter(Boolean) : [];
    if (!rest.length) return "mystructure:" + base;
    return rest[0] + ":" + rest.slice(1).concat(base).join("/");
  };

  function rotate90(g, pal, w, h, d, xf) {
    const map = new Map(), pal2 = [];
    const pm = pal.map((s) => {
      const n = xf(s, "rot");
      let k = map.get(n);
      if (k === void 0) {
        k = pal2.length;
        pal2.push(n);
        map.set(n, k);
      }
      return k;
    });
    const w2 = d, d2 = w, dst = new Uint16Array(w2 * h * d2);
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) {
      const v = g[(x * h + y) * d + z];
      if (v) dst[((d - 1 - z) * h + y) * d2 + x] = pm[v];
    }
    return { g: dst, pal: pal2, w: w2, h, d: d2, map: (x, y, z) => [d - 1 - z, y, x] };
  }

  // Devuelve [{ id, file, bytes, size, fp, ent }]
  function bake(o) {
    const K = C(), A = o.A, S = o.S, rots = o.rotations ? 4 : 1, out = [];
    let cur = { g: S.grid, pal: S.pal.slice(), w: S.sx, h: S.sy, d: S.sz, chests: new Map(S.chests) };
    for (let r = 0; r < rots; r++) {
      if (r > 0) {
        const t = rotate90(cur.g, cur.pal, cur.w, cur.h, cur.d, A.xfState), nc = new Map();
        cur.chests.forEach((c, k) => {
          const [x, y, z] = k.split(",").map(Number);
          nc.set(t.map(x, y, z).join(","), c);
        });
        cur = { g: t.g, pal: t.pal, w: t.w, h: t.h, d: t.d, chests: nc };
      }
      const pe = A.prepareExport(cur.g, cur.pal, [cur.w, cur.h, cur.d]);
      let x0 = 1e9, y0 = 1e9, z0 = 1e9, x1 = -1, y1 = -1, z1 = -1;
      for (let x = 0; x < cur.w; x++) for (let y = 0; y < cur.h; y++) {
        let i = (x * cur.h + y) * cur.d;
        for (let z = 0; z < cur.d; z++, i++) if (pe.grid[i]) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
          if (z < z0) z0 = z;
          if (z > z1) z1 = z;
        }
      }
      if (x1 < 0) throw new Error("empty");
      const b = { x0, y0, z0, x1, y1, z1 }, t = K.trimGrid(pe.grid, cur.w, cur.h, cur.d, b), { g, w, h, d } = t;
      const pal = pe.pal.slice(), ch = new Map();
      cur.chests.forEach((c, k) => {
        const p = k.split(",").map(Number);
        ch.set((p[0] - x0) + "," + (p[1] - y0) + "," + (p[2] - z0), c);
      });
      const vol = w * h * d, ext = vol <= 9e6 ? K.exteriorAir(g, w, h, d) : null;
      // base y entradas (antes de convertir el aire exterior)
      const fp = [], ent = [];
      for (let x = 0; x < w; x++) {
        let row = "";
        for (let z = 0; z < d; z++) row += g[(x * h) * d + z] ? "1" : "0";
        fp.push(row);
      }
      const outside = (x, y, z) => x < 0 || y < 0 || z < 0 || x >= w || y >= h || z >= d || (ext ? ext[(x * h + y) * d + z] === 1 : false);
      for (let x = 0; x < w; x++) for (let y = 0; y < Math.min(h, 3); y++) for (let z = 0; z < d; z++) {
        const v = g[(x * h + y) * d + z];
        if (!v || !K.isLowerDoor(pal[v])) continue;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([fx, fz]) => {
          if (outside(x + fx, y, z + fz) && outside(x + fx, y + 1, z + fz)) {
            ent.push([x, y, z, fx, fz]);
            return true;
          }
          return false;
        });
      }
      if (ext) {
        let vi = pal.indexOf("minecraft:structure_void");
        if (vi < 0) {
          vi = pal.length;
          pal.push("minecraft:structure_void");
        }
        for (let i = 0; i < vol; i++) if (ext[i]) g[i] = vi;
      }
      const bytes = o.buildPiece(g, pal, [w, h, d], [0, 0, 0], [w, h, d], ch, o.lootRel);
      out.push({ rot: r, size: [w, h, d], fp, ent, bytes });
    }
    return out;
  }

  // ---------- motor nativo ----------
  function nativeFiles(o) {
    const K = C(), g = o.gen, ns = g.ns || "fd_gen", name = o.name;
    const sel = g.biomes.map((k) => K.allBiomes().find((b) => b.k === k)).filter(Boolean);
    const dimTag = { overworld: "overworld", nether: "nether", the_end: "the_end" }[g.dim];
    const filt = [{ test: "has_biome_tag", operator: "==", value: dimTag }];
    if (sel.length) {
      const tags = Array.from(new Set(sel.map((b) => b.tag)));
      filt.push(tags.length === 1 ? { test: "has_biome_tag", operator: "==", value: tags[0] } : { any_of: tags.map((t) => ({ test: "has_biome_tag", operator: "==", value: t })) });
    }
    const cons = {};
    if (o.place === "surface") {
      cons.grounded = {};
      cons.unburied = {};
    } else if (o.place === "ocean") cons.grounded = {};
    const feature = {
      format_version: "1.13.0",
      "minecraft:structure_template_feature": {
        description: { identifier: ns + ":" + name + "_feature" },
        structure_name: o.structId,
        adjustment_radius: o.place === "surface" || o.place === "ocean" ? 4 : 0,
        facing_direction: g.rotate ? "random" : "north",
        constraints: cons
      }
    };
    let y, pass = "surface_pass", order = "xzy";
    if (o.place === "surface") y = "q.heightmap(v.worldx, v.worldz)";
    else if (o.place === "sky") y = "q.heightmap(v.worldx, v.worldz) + 24";
    else if (o.place === "ocean") y = "q.above_top_solid(v.worldx, v.worldz)";
    else {
      pass = "underground_pass";
      order = "xyz";
      y = { distribution: "uniform", extent: [g.minY, Math.max(g.minY + 1, g.maxY - o.size[1])] };
    }
    if (g.dim !== "overworld" && o.place !== "underground") {
      pass = "underground_pass";
      order = "xyz";
      y = { distribution: "uniform", extent: g.dim === "nether" ? [34, 100] : [40, 90] };
    }
    const rule = {
      format_version: "1.13.0",
      "minecraft:feature_rules": {
        description: { identifier: ns + ":" + name + "_rule", places_feature: ns + ":" + name + "_feature" },
        conditions: { placement_pass: pass, "minecraft:biome_filter": filt },
        distribution: {
          iterations: g.dim !== "overworld" || o.place === "underground" ? 4 : 1,
          scatter_chance: { numerator: 1, denominator: Math.max(1, g.every * (g.dim !== "overworld" || o.place === "underground" ? 4 : 1)) },
          coordinate_eval_order: order,
          x: { distribution: "uniform", extent: [0, 16] },
          y,
          z: { distribution: "uniform", extent: [0, 16] }
        }
      }
    };
    return { feature, rule };
  }

  // ---------- motor adaptativo (script) ----------
  const RUNTIME = String.raw`import { world, system } from "@minecraft/server";

// Generated by FireDex · Structure Generation. The FD_GEN line is rewritten every time you export from the editor.
const FD_GEN = __CONFIG__;
const BIOME_RX = __BIOMES__;

const DIMS = { overworld: "minecraft:overworld", nether: "minecraft:nether", the_end: "minecraft:the_end" };
const SCAN_CHUNKS = 5;   // chunks around each player that are checked
const SCAN_TICKS = 80;   // ticks between checks
const MAX_TRIES = 4;     // nearby spots tried when the first one is not suitable
const DONE_KEY = "fdgen:done";
const MAX_DONE = 2000;

const PASS_RX = /(^|_)(leaves|log|wood|stem|hyphae|sapling|petals|flower|flowers|tulip|orchid|allium|bluet|cornflower|daisy|poppy|dandelion|lilac|peony|sunflower|rose|vine|vines|kelp|seagrass|bamboo|cactus|pumpkin|melon|mushroom|fungus|roots|lichen|fern|bush|azalea|candle|torch|web|reeds|cane|carpet|litter|propagule|lily|pad|berries|beehive|bee_nest|cocoa|sprouts)$|^(short_grass|tall_grass|grass|tallgrass|deadbush|short_dry_grass|tall_dry_grass|snow_layer|double_plant|yellow_flower|red_flower|waterlily|firefly_bush|torchflower|pitcher_plant|spore_blossom|hanging_roots|big_dripleaf|small_dripleaf_block|sea_pickle|moss_carpet|pale_moss_carpet|pale_hanging_moss)$/;

const state = { done: new Set(), loaded: false, busy: false, dirty: false, warned: false, queue: [] };
const rxCache = {};
const rx = (k) => rxCache[k] || (rxCache[k] = new RegExp(BIOME_RX[k]));

function h32(a, b, c) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const airLike = (id) => id === "minecraft:air" || id === "minecraft:cave_air" || id === "minecraft:void_air";
const isWater = (id) => id === "minecraft:water" || id === "minecraft:flowing_water";
const isLava = (id) => id === "minecraft:lava" || id === "minecraft:flowing_lava";

function loadDone() {
  if (state.loaded) return;
  state.loaded = true;
  try {
    const s = world.getDynamicProperty(DONE_KEY);
    if (typeof s === "string" && s) s.split(";").forEach((k) => state.done.add(k));
  } catch (e) {}
}
function saveDone() {
  if (!state.dirty) return;
  state.dirty = false;
  try {
    world.setDynamicProperty(DONE_KEY, Array.from(state.done).slice(-MAX_DONE).join(";"));
  } catch (e) {}
}

// Highest solid ground at x,z (ignores leaves, logs, plants). Returns {y,id,water,lava} | null | "unloaded"
function ground(dim, x, z, cfg, need) {
  try {
    if (cfg.dim === "nether") {
      let run = 0;
      for (let y = 110; y >= 33; y--) {
        const b = dim.getBlock({ x, y, z });
        if (!b) return "unloaded";
        const id = b.typeId;
        if (airLike(id)) { run++; continue; }
        if (isLava(id)) { run = 0; continue; }
        if (run >= need) return { y, id, water: false };
        run = 0;
      }
      return null;
    }
    const t = dim.getTopmostBlock({ x, z });
    if (!t) return "unloaded";
    let water = false;
    for (let y = t.y, lo = Math.max(t.y - 150, -64); y >= lo; y--) {
      const b = dim.getBlock({ x, y, z });
      if (!b) return "unloaded";
      const id = b.typeId;
      if (airLike(id)) continue;
      if (isWater(id)) { water = true; continue; }
      if (isLava(id)) return { y, id, water, lava: true };
      if (PASS_RX.test(id.replace("minecraft:", ""))) continue;
      return { y, id, water };
    }
    return null;
  } catch (e) {
    return "unloaded";
  }
}
function steps(o, len) {
  const a = [];
  for (let i = 0; i < len; i += 8) a.push(o + i);
  if ((len - 1) % 8) a.push(o + len - 1);
  return a;
}
function biomeOk(dim, cfg, x, y, z) {
  if (!cfg.biomes.length) return true;
  if (typeof dim.getBiome !== "function") {
    if (!state.warned) { state.warned = true; console.warn("[FireDex] dimension.getBiome is not available in this game version: structures with a biome filter are skipped. Use the native engine instead."); }
    return false;
  }
  try {
    const b = dim.getBiome({ x, y, z });
    const id = (b && (b.id || b.typeId) || "").replace("minecraft:", "");
    return cfg.biomes.some((k) => BIOME_RX[k] && rx(k).test(id));
  } catch (e) {
    return "unloaded";
  }
}
function run(dim, cmd) {
  try { dim.runCommand(cmd); } catch (e) {}
}
function fill(dim, x1, y1, z1, x2, y2, z2, block) {
  run(dim, "fill " + x1 + " " + y1 + " " + z1 + " " + x2 + " " + y2 + " " + z2 + " " + block);
}

// Chooses where the structure goes. Returns {y, by} | null (not suitable) | "unloaded"
function decide(dim, cfg, v, x0, z0, seedY) {
  const w = v.size[0], h = v.size[1], d = v.size[2], a = cfg.adapt;
  if (cfg.place === "underground") {
    const span = Math.max(1, cfg.maxY - cfg.minY - h);
    const y = cfg.minY + Math.floor(seedY * span);
    let solid = 0, n = 0;
    for (const fx of [0.1, 0.5, 0.9]) for (const fy of [0.15, 0.5, 0.85]) for (const fz of [0.1, 0.5, 0.9]) {
      let b;
      try { b = dim.getBlock({ x: Math.floor(x0 + fx * (w - 1)), y: Math.floor(y + fy * (h - 1)), z: Math.floor(z0 + fz * (d - 1)) }); } catch (e) { return "unloaded"; }
      if (!b) return "unloaded";
      n++;
      if (isLava(b.typeId)) return null;
      if (!airLike(b.typeId) && !isWater(b.typeId)) solid++;
    }
    if (solid / n < 0.55) return null;
    return { y, by: y + (h >> 1) };
  }
  const hs = [];
  let water = 0, bad = 0, n = 0;
  for (const x of steps(x0, w)) for (const z of steps(z0, d)) {
    const g = ground(dim, x, z, cfg, h + 2);
    if (g === "unloaded") return "unloaded";
    n++;
    if (!g || g.lava) { bad++; continue; }
    hs.push(g.y);
    if (g.water) water++;
  }
  if (!hs.length || bad > n * 0.2) return null;
  const sorted = hs.slice().sort((p, q) => p - q), lo = sorted[0], hi = sorted[sorted.length - 1], med = sorted[sorted.length >> 1];
  if (cfg.place === "surface") {
    if (!a.water && water > 0) return null;
    if (a.on && hi - lo > a.level) return null;
    if (!a.on && hi - lo > 6) return null;
    const base = a.base === "min" ? lo : a.base === "max" ? hi : med;
    return { y: base - (a.sink || 0), by: base + 1 };
  }
  if (cfg.place === "ocean") {
    if (water < n * 0.9) return null;
    return { y: med, by: med + 1 };
  }
  const y = Math.min(Math.max(hi + cfg.skyGap, cfg.skyMin), cfg.skyMax);
  return { y, by: med + 1 };
}

function* build(dim, cfg, v, x0, z0, dec) {
  const w = v.size[0], h = v.size[1], d = v.size[2], y = dec.y, a = cfg.adapt;
  const surf = cfg.place === "surface" && a.on;
  if (surf && a.clear) {
    const step = Math.max(1, Math.floor(30000 / ((w + 2) * (d + 2))));
    for (let yy = y + 1; yy <= y + h + 1; yy += step) {
      fill(dim, x0 - 1, yy, z0 - 1, x0 + w, Math.min(yy + step - 1, y + h + 1), z0 + d, "minecraft:air");
      yield;
    }
  }
  if (surf && a.foundation) {
    for (let i = 0; i < w; i++) {
      for (let k = 0; k < d; k++) {
        if (v.fp[i][k] !== "1") continue;
        const g = ground(dim, x0 + i, z0 + k, cfg, 0);
        if (!g || g === "unloaded") continue;
        if (g.y < y - 1) fill(dim, x0 + i, Math.max(g.y + 1, y - a.maxFound), z0 + k, x0 + i, y - 1, z0 + k, a.foundBlock);
      }
      if (i % 3 === 2) yield;
    }
  }
  world.structureManager.place(v.id, dim, { x: x0, y, z: z0 }, { includeEntities: false });
  yield;
  if (surf && a.entrance) {
    for (const e of v.ent) {
      for (let s = 1; s <= 3; s++) {
        const cx = x0 + e[0] + e[3] * s, cz = z0 + e[2] + e[4] * s, g = ground(dim, cx, cz, cfg, 0);
        const gy = g && g !== "unloaded" ? g.y : y - 1;
        if (gy < y) fill(dim, cx, gy + 1, cz, cx, y, cz, a.foundBlock);
        fill(dim, cx, y + 1, cz, cx, Math.max(y + 2, gy + 2), cz, "minecraft:air");
      }
      yield;
    }
  }
}

function pickVariant(cfg, rx0, rz0) {
  const n = cfg.variants.length;
  return cfg.variants[n > 1 ? Math.floor(h32(rx0, rz0, cfg.salt + 3) * n) : 0];
}

// returns "done" | "fail" | "retry"
function* attempt(dim, cfg, v, x0, z0, seed, force) {
  for (let t = 0; t < MAX_TRIES; t++) {
    const ox = t ? Math.floor((h32(seed, t, cfg.salt + 7) - 0.5) * 48) : 0;
    const oz = t ? Math.floor((h32(seed, t, cfg.salt + 8) - 0.5) * 48) : 0;
    const dec = decide(dim, cfg, v, x0 + ox, z0 + oz, h32(seed, t, cfg.salt + 9));
    if (dec === "unloaded") return "retry";
    if (!dec) { yield; continue; }
    const bx = Math.floor(x0 + ox + v.size[0] / 2), bz = Math.floor(z0 + oz + v.size[2] / 2);
    const bo = force ? true : biomeOk(dim, cfg, bx, dec.by, bz);
    if (bo === "unloaded") return "retry";
    if (!bo) continue;
    if (dec.y < -63 || dec.y + v.size[1] > 318) continue;
    try {
      yield* build(dim, cfg, v, x0 + ox, z0 + oz, dec);
    } catch (e) {
      return "retry";
    }
    return "done:" + (x0 + ox) + "," + dec.y + "," + (z0 + oz);
  }
  return "fail";
}

function* job(item) {
  state.busy = true;
  try {
    const cfg = FD_GEN[item.ci];
    const res = yield* attempt(item.dim, cfg, item.v, item.x0, item.z0, item.rx * 7919 + item.rz, false);
    if (res !== "retry") {
      state.done.add(item.key);
      state.dirty = true;
      if (res.indexOf("done") === 0) console.warn("[FireDex] " + cfg.name + " generated at " + res.slice(5));
    }
  } finally {
    state.busy = false;
    saveDone();
  }
}

function scan() {
  if (state.busy) return;
  loadDone();
  for (const p of world.getAllPlayers()) {
    const dimId = p.dimension.id;
    for (let ci = 0; ci < FD_GEN.length; ci++) {
      const cfg = FD_GEN[ci];
      if (DIMS[cfg.dim] !== dimId) continue;
      const span = cfg.cell * 16, r = SCAN_CHUNKS * 16;
      const px = Math.floor(p.location.x), pz = Math.floor(p.location.z);
      for (let rx0 = Math.floor((px - r) / span); rx0 <= Math.floor((px + r) / span); rx0++) {
        for (let rz0 = Math.floor((pz - r) / span); rz0 <= Math.floor((pz + r) / span); rz0++) {
          const key = ci + ":" + rx0 + ":" + rz0;
          if (state.done.has(key)) continue;
          if (h32(rx0, rz0, cfg.salt) >= cfg.p) { state.done.add(key); state.dirty = true; continue; }
          const v = pickVariant(cfg, rx0, rz0);
          const ox = Math.floor(h32(rx0, rz0, cfg.salt + 1) * Math.max(1, span - v.size[0]));
          const oz = Math.floor(h32(rx0, rz0, cfg.salt + 2) * Math.max(1, span - v.size[2]));
          system.runJob(job({ ci, key, dim: p.dimension, v, rx: rx0, rz: rz0, x0: rx0 * span + ox, z0: rz0 * span + oz }));
          saveDone();
          return;
        }
      }
    }
  }
  saveDone();
}
system.runInterval(scan, SCAN_TICKS);

// /scriptevent fd:structgen <name>   → forces one copy where you stand
// /scriptevent fd:structgen reset    → forgets every generated spot
system.afterEvents.scriptEventReceive.subscribe((ev) => {
  if (ev.id !== "fd:structgen") return;
  const p = ev.sourceEntity;
  if (!p || p.typeId !== "minecraft:player") return;
  const arg = ev.message.trim().split(/\s+/)[0];
  if (arg === "reset") {
    state.done.clear();
    state.dirty = true;
    saveDone();
    p.sendMessage("\u00a7aFireDex: generation memory cleared.");
    return;
  }
  const ci = FD_GEN.findIndex((c) => c.name === arg);
  if (ci < 0) { p.sendMessage("\u00a7eUsage: /scriptevent fd:structgen <" + FD_GEN.map((c) => c.name).join("|") + "|reset>"); return; }
  const cfg = FD_GEN[ci], v = cfg.variants[0], dim = p.dimension;
  system.runJob((function* () {
    const res = yield* attempt(dim, cfg, v, Math.floor(p.location.x) + 4, Math.floor(p.location.z) + 4, 1234, true);
    p.sendMessage(res.indexOf("done") === 0 ? "\u00a7a'" + arg + "' placed at " + res.slice(5) : res === "retry" ? "\u00a7eArea not loaded yet, try again." : "\u00a7eTerrain not suitable here (slope, water or no ground). Move and retry.");
  })());
});
`;

  function scriptSource(configs, biomeRx) {
    return RUNTIME.replace("__CONFIG__", () => JSON.stringify(configs)).replace("__BIOMES__", () => JSON.stringify(biomeRx));
  }
  const parsePrev = (src) => {
    const m = /const FD_GEN = (.*);\s*$/m.exec(src || "");
    if (!m) return [];
    try {
      const a = JSON.parse(m[1]);
      return Array.isArray(a) ? a : [];
    } catch (e) {
      return [];
    }
  };

  window.FD_STRUCT_GEN_CODE = { structId, bake, nativeFiles, scriptSource, parsePrev, rotate90 };
})();

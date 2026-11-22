(function() {
  "use strict";
  const IC = {
    back: '<path d="M15 5l-7 7 7 7"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
    brush: '<path d="M18 3l3 3-9 9-3-3 9-9z"/><path d="M9 12c-3 0-4 2-4 4 0 2-1 3-2 4 3 1 7 0 8-3 .5-1.5 0-2.500-2-5z"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/>',
    save: '<path d="M5 3h11l4 4v14H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    more: '<circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/>',
    cursor: '<path d="M5 3l14 8-6 2-2 6L5 3z"/>',
    move: '<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',
    rotate: '<path d="M20 12a8 8 0 11-3-6.200"/><path d="M20 4v5h-5"/>',
    scale: '<path d="M4 20V10M4 20h10M4 20L20 4M20 4h-6M20 4v6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    bone: '<path d="M7 7a2.500 2.500 0 10-3-3 2.500 2.500 0 003 3zM20 20a2.500 2.500 0 10-3-3 2.500 2.500 0 003 3z"/><path d="M6.500 6.500l11 11"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/>',
    eraser: '<path d="M8 20h12M5 15l8-9 6 6-6 6H8l-3-3z"/>',
    bucket: '<path d="M5 11l7-7 7 7-7 7-7-7z"/><path d="M20 15c1 1.500 1.500 2.500 1.500 3.500a1.500 1.500 0 01-3 0c0-1 .5-2 1.500-3.500z"/>',
    picker: '<path d="M15 4l5 5-3 1-7 7-4 1 1-4 7-7 1-3z"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10 6.200A9 9 0 0112 5c6 0 10 7 10 7a17 17 0 01-3 3.700M6.500 7.500A17 17 0 002 12s4 7 10 7c1.600 0 3-.4 4.300-1"/>',
    key: '<path d="M12 3l7 9-7 9-7-9 7-9z"/>',
    play: '<path d="M7 4l13 8-13 8V4z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
    hist: '<path d="M3 12a9 9 0 109-9 9 9 0 00-6.500 2.800L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    link: '<path d="M10 14a4 4 0 005.700 0l3-3a4 4 0 00-5.700-5.700l-1 1M14 10a4 4 0 00-5.700 0l-3 3a4 4 0 005.700 5.700l1-1"/>',
    uv: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 12h16M12 4v16"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    wand: '<path d="M5 19L17 7M15 5l1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1zM5 9l.7-1.300L7 7l-1.300-.7L5 5l-.7 1.300L3 7l1.300.7L5 9z"/>',
    mirror: '<path d="M12 3v18M8 7L3 12l5 5V7zM16 7l5 5-5 5V7z"/>',
    group: '<rect x="3" y="3" width="18" height="18" rx="3" stroke-dasharray="3 3"/><rect x="8" y="8" width="8" height="8" rx="1"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
    ground: '<path d="M12 3v12M8 11l4 4 4-4M4 20h16"/>',
    ruler: '<path d="M3 17L17 3l4 4L7 21l-4-4zM8 12l2 2M11 9l2 2M14 6l2 2"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.500 9a2.500 2.500 0 115 .5c0 1.500-2.500 2-2.500 3.500M12 17v.01"/>',
    box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    chevd: '<path d="M6 9l6 6 6-6"/>',
    folder: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>'
  };
  const PXMAP = { back: 'arrow-left', cube: 'cube', brush: 'paint-bucket', film: 'movie', hist: 'clock', undo: 'undo', redo: 'redo', save: 'save', link: 'link', more: 'more-horizontal', trash: 'trash', copy: 'copy', plus: 'plus', minus: 'minus', play: 'play', stop: 'close-box', pencil: 'edit', wand: 'zap', layers: 'layout', key: 'key' };
const pxSvg = (n) => '<svg' + (PXMAP[n] ? ' data-px="' + PXMAP[n] + '"' : '') + ' viewBox="0 0 24 24">' + (IC[n] || '') + '</svg>';
const ic = (n) => '<i data-i="' + n + '">' + pxSvg(n) + "</i>";
  function hydrateIcons(root) {
    (root || document).querySelectorAll("i[data-i]:not(:has(svg))").forEach((e) => {
      e.innerHTML = pxSvg(e.dataset.i);
    });
  }
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const num = (v, d) => typeof v === "number" && isFinite(v) ? v : d || 0;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const round = (v, p) => {
    const k = Math.pow(10, p == null ? 3 : p);
    return Math.round(v * k) / k;
  };
  const isTouch = () => matchMedia("(pointer:coarse)").matches;
  let toastT = 0;
  function toast(msg, ms) {
    const t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => {
      t.hidden = true;
    }, ms || 2200);
  }
  const M = {
    id() {
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    },
    mul(a, b) {
      const o = new Array(16);
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
        o[c * 4 + r] = s;
      }
      return o;
    },
    tr(x, y, z) {
      const m = M.id();
      m[12] = x;
      m[13] = y;
      m[14] = z;
      return m;
    },
    rx(d) {
      const a = d * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), m = M.id();
      m[5] = c;
      m[6] = s;
      m[9] = -s;
      m[10] = c;
      return m;
    },
    ry(d) {
      const a = d * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), m = M.id();
      m[0] = c;
      m[2] = -s;
      m[8] = s;
      m[10] = c;
      return m;
    },
    rz(d) {
      const a = d * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), m = M.id();
      m[0] = c;
      m[1] = s;
      m[4] = -s;
      m[5] = c;
      return m;
    },
    persp(fov, asp, n, f) {
      const t = 1 / Math.tan(fov / 2), m = new Array(16).fill(0);
      m[0] = t / asp;
      m[5] = t;
      m[10] = (f + n) / (n - f);
      m[11] = -1;
      m[14] = 2 * f * n / (n - f);
      return m;
    },
    ortho(h, asp, n, f) {
      const w = h * asp, m = M.id();
      m[0] = 1 / w;
      m[5] = 1 / h;
      m[10] = -2 / (f - n);
      m[14] = -(f + n) / (f - n);
      return m;
    },
    look(e, t, u) {
      let zx = e[0] - t[0], zy = e[1] - t[1], zz = e[2] - t[2];
      const zl = Math.hypot(zx, zy, zz) || 1;
      zx /= zl;
      zy /= zl;
      zz /= zl;
      let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx;
      const xl = Math.hypot(xx, xy, xz) || 1;
      xx /= xl;
      xy /= xl;
      xz /= xl;
      const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1];
    },
    pt(m, p) {
      return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
    },
    dir(m, p) {
      return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2], m[1] * p[0] + m[5] * p[1] + m[9] * p[2], m[2] * p[0] + m[6] * p[1] + m[10] * p[2]];
    },
    sc(x, y, z) {
      const m = M.id();
      m[0] = x;
      m[5] = y;
      m[10] = z;
      return m;
    },
    about2(p, k) {
      return M.mul(M.tr(p[0], p[1], p[2]), M.mul(M.sc(k[0], k[1], k[2]), M.tr(-p[0], -p[1], -p[2])));
    },
    rot(r) {
      return M.mul(M.rz(r[2]), M.mul(M.ry(r[1]), M.rx(r[0])));
    },
    about(p, r) {
      return M.mul(M.tr(p[0], p[1], p[2]), M.mul(M.rot(r), M.tr(-p[0], -p[1], -p[2])));
    }
  };
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };
  const DB_NAME = "devstudio_db", STORE_INDEX = "projects_index", STORE_DATA = "projects_data";
  let dbP = null;
  function openDB() {
    return dbP || (dbP = new Promise((ok, ko) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_INDEX)) d.createObjectStore(STORE_INDEX, { keyPath: "id" });
        if (!d.objectStoreNames.contains(STORE_DATA)) d.createObjectStore(STORE_DATA, { keyPath: "id" });
      };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ko(r.error);
    }));
  }
  const idb = {
    get: (s, k) => openDB().then((d) => new Promise((ok, ko) => {
      const q = d.transaction(s).objectStore(s).get(k);
      q.onsuccess = () => ok(q.result || null);
      q.onerror = () => ko(q.error);
    })),
    put: (s, v) => openDB().then((d) => new Promise((ok, ko) => {
      const t = d.transaction(s, "readwrite");
      t.objectStore(s).put(v);
      t.oncomplete = ok;
      t.onerror = () => ko(t.error);
    }))
  };
  const uid = () => "n" + Math.random().toString(36).slice(2, 10);
  function findNode(id, n) {
    if (n.id === id) return n;
    for (const c of n.children || []) {
      const r = findNode(id, c);
      if (r) return r;
    }
    return null;
  }
  function findParent(id, n) {
    for (const c of n.children || []) {
      if (c.id === id) return n;
      const r = c.children && findParent(id, c);
      if (r) return r;
    }
    return null;
  }
  function allFiles(n, path, out) {
    out = out || [];
    path = path || "";
    for (const c of n.children || []) {
      if (c.type === "folder") allFiles(c, path + c.name + "/", out);
      else out.push({ node: c, path: path + c.name });
    }
    return out;
  }
  const qs = new URLSearchParams(location.search);
  const FD = { hooks: { snap: [], restore: [], save: [], init: [], draw: [], refresh: [] }, lazy: {} };
  const S = {
    meta: { colors: {} },
    colorMode: "auto",
    shade: true,
    sheetTab: "",
    projId: qs.get("id") || localStorage.getItem("devstudio_active_project"),
    fileId: qs.get("file"),
    project: null,
    node: null,
    root: null,
    geos: [],
    gi: 0,

    sel: null,

    hidden:  new WeakSet(),
    collapsed:  new WeakSet(),
    tool: "select",
    ptool: "pencil",
    mode: "edit",
    snap: 1,
    ortho: false,
    wire: false,
    grid: true,
    texW: 64,
    texH: 64,
    texNode: null,
    texDirty: false,
    dirty: false,
    saving: 0,
    cam: { yaw: 35, pitch: 22, dist: 70, tx: 0, ty: 12, tz: 0 },
    color: "#7c6cf5",
    brush: 1
  };
  const tex = document.createElement("canvas");
  tex.width = 64;
  tex.height = 64;
  const tctx = tex.getContext("2d", { willReadFrequently: true });
  function parseGeos(root) {
    const list = [];
    if (Array.isArray(root["minecraft:geometry"])) {
      root["minecraft:geometry"].forEach((g) => {
        g.description = g.description || { identifier: "geometry.unknown" };
        g.bones = g.bones || [];
        list.push({ obj: g, legacy: false });
      });
    }
    Object.keys(root).forEach((k) => {
      if (k.indexOf("geometry.") === 0 && root[k] && typeof root[k] === "object") {
        root[k].bones = root[k].bones || [];
        list.push({ obj: root[k], legacy: true, key: k });
      }
    });
    return list;
  }
  const G = () => S.geos[S.gi];
  const bones = () => G().obj.bones;
  const geoName = (g) => g.legacy ? g.key : g.obj.description.identifier || "geometry.unknown";
  function readDims() {
    const g = G();
    if (!g) return;
    if (g.legacy) {
      S.texW = num(g.obj.texturewidth, 64) || 64;
      S.texH = num(g.obj.textureheight, 64) || 64;
    } else {
      S.texW = num(g.obj.description.texture_width, 64) || 64;
      S.texH = num(g.obj.description.texture_height, 64) || 64;
    }
  }
  function writeDims() {
    const g = G();
    if (g.legacy) {
      g.obj.texturewidth = S.texW;
      g.obj.textureheight = S.texH;
    } else {
      g.obj.description.texture_width = S.texW;
      g.obj.description.texture_height = S.texH;
    }
  }
  function emptyRoot(name) {
    return { format_version: "1.12.0", "minecraft:geometry": [{ description: { identifier: name || "geometry.modelo", texture_width: 64, texture_height: 64, visible_bounds_width: 2, visible_bounds_height: 3, visible_bounds_offset: [0, 1.5, 0] }, bones: [{ name: "root", pivot: [0, 0, 0] }, { name: "body", parent: "root", pivot: [0, 12, 0], cubes: [{ origin: [-4, 12, -2], size: [8, 12, 4], uv: [16, 16] }] }] }] };
  }
  const boneByName = (n) => bones().find((b) => b.name === n);
  const parentOf = (b) => b.parent ? boneByName(b.parent) : null;
  const childrenOf = (b) => bones().filter((x) => x.parent === b.name);
  function descendants(b, out) {
    out = out || [];
    childrenOf(b).forEach((c) => {
      out.push(c);
      descendants(c, out);
    });
    return out;
  }
  function ensureCubes(b) {
    if (!b.cubes) b.cubes = [];
    return b.cubes;
  }
  let hist = [], hpos = -1, texSnap = null, histLock = false;
  function selPath() {
    if (!S.sel) return null;
    const bi = bones().indexOf(S.sel.bone);
    return { bi, ci: S.sel.cube ? S.sel.bone.cubes.indexOf(S.sel.cube) : -1 };
  }
  function snapshot(label) {
    const h = { label: label || "Cambio", t: Date.now(), root: JSON.stringify(S.root), gi: S.gi, sel: selPath(), tex: texSnap, tw: S.texW, th: S.texH, colors: (syncColors(), JSON.stringify(S.meta.colors)), x: {} };
    FD.hooks.snap.forEach((f) => f(h));
    return h;
  }
  function pushHist(label) {
    if (histLock) return;
    hist = hist.slice(0, hpos + 1);
    hist.push(snapshot(label));
    if (hist.length > 120) hist.shift();
    hpos = hist.length - 1;
    updUndo();
  }
  function restore(h) {
    histLock = true;
    S.root = JSON.parse(h.root);
    S.meta.colors = JSON.parse(h.colors || "{}");
    S.geos = parseGeos(S.root);
    S.gi = Math.min(h.gi, S.geos.length - 1);
    readDims();
    applyColors();
    FD.hooks.restore.forEach((f) => f(h));
    const p = h.sel;
    S.sel = null;
    if (p && p.bi >= 0 && bones()[p.bi]) {
      const b = bones()[p.bi];
      S.sel = { bone: b, cube: p.ci >= 0 ? (b.cubes || [])[p.ci] || null : null };
    }
    if (h.tex && h.tex !== texSnap) {
      texSnap = h.tex;
      if (tex.width !== h.tex.width || tex.height !== h.tex.height) {
        tex.width = h.tex.width;
        tex.height = h.tex.height;
      }
      tctx.putImageData(h.tex, 0, 0);
      S.texDirty = true;
    }
    histLock = false;
    rebuild();
    uploadTex();
    refreshAll();
    markDirty();
  }
  function undo() {
    if (hpos > 0) {
      hpos--;
      restore(hist[hpos]);
    }
    updUndo();
  }
  function redo() {
    if (hpos < hist.length - 1) {
      hpos++;
      restore(hist[hpos]);
    }
    updUndo();
  }
  function updUndo() {
    $("#undoBtn").classList.toggle("off", hpos <= 0);
    $("#redoBtn").classList.toggle("off", hpos >= hist.length - 1);
  }
  function commit(label) {
    pushHist(label);
    rebuild();
    refreshAll();
    markDirty();
  }
  let saveT = 0;
  function markDirty() {
    S.dirty = true;
    const s = $("#saveState");
    s.textContent = "Cambios sin guardar";
    s.className = "dirty";
    $("#saveBtn").classList.add("pending");
    clearTimeout(saveT);
    saveT = setTimeout(saveDraft, 1500);
  }
  const draftKey = () => "fd_draft_" + (S.project ? S.project.id : "demo") + "_" + (S.node ? S.node.id || S.node.name : "");
  function saveDraft() {
    try {
      writeDims();
      const d = { t: Date.now(), geo: JSON.stringify(S.root), x: {} };
      FD.hooks.save.forEach((f) => f(d, true));
      localStorage.setItem(draftKey(), JSON.stringify(d));
    } catch (e) {
    }
  }
  function clearDraft() {
    try {
      localStorage.removeItem(draftKey());
    } catch (e) {
    }
  }
  async function save() {
    clearTimeout(saveT);
    if (!S.project || !S.node) return;
    try {
      writeDims();
      S.node.content = JSON.stringify(S.root, null, 2);
      S.project.meta = S.project.meta || {};
      syncColors();
      S.project.meta[S.node.id] = { colors: S.meta.colors };
      FD.hooks.save.forEach((f) => f({}, false));
      if (S.texDirty && !S.texNode && !pixelsBlank()) await ensureTexNode();
      if (S.texNode && S.texDirty) {
        S.texNode.content = tex.toDataURL("image/png");
        S.texDirty = false;
      }
      await idb.put(STORE_DATA, Object.assign({}, S.project, { id: S.project.id, name: S.project.name, root: S.project.root }));
      const idx = await idb.get(STORE_INDEX, S.project.id);
      if (idx) {
        idx.updatedAt = Date.now();
        await idb.put(STORE_INDEX, idx);
      }
      S.dirty = false;
      clearDraft();
      $("#saveBtn").classList.remove("pending");
      const s = $("#saveState");
      s.textContent = "Guardado";
      s.className = "";
    } catch (e) {
      const s = $("#saveState");
      s.textContent = "Error al guardar";
      s.className = "dirty";
      console.error(e);
    }
  }
  function newBlankTex(w, h) {
    tex.width = w;
    tex.height = h;
    tctx.clearRect(0, 0, w, h);
    texSnap = tctx.getImageData(0, 0, w, h);
  }
  function loadTexFromData(src) {
    return new Promise((ok) => {
      const im = new Image();
      im.onload = () => {
        tex.width = im.width;
        tex.height = im.height;
        tctx.clearRect(0, 0, im.width, im.height);
        tctx.drawImage(im, 0, 0);
        texSnap = tctx.getImageData(0, 0, im.width, im.height);
        uploadTex();
        drawUV();
        ok(true);
      };
      im.onerror = () => ok(false);
      im.src = src;
    });
  }
  function texCandidates() {
    return S.project ? allFiles(S.project.root).filter((f) => /\.(png|jpg|jpeg|webp|tga)$/i.test(f.node.name) && /^data:image/.test(f.node.content || "")) : [];
  }
  function guessTexture() {
    const c = texCandidates();
    if (!c.length) return null;
    const base = S.node.name.replace(/\.(geo|model)?\.?json$/i, "").toLowerCase();
    return c.find((f) => f.node.name.toLowerCase().replace(/\.\w+$/, "") === base) || c.find((f) => f.node.name.toLowerCase().indexOf(base) >= 0) || null;
  }
  async function useTexNode(n) {
    S.texNode = n;
    if (n && n.content) await loadTexFromData(n.content);
    S.texDirty = false;
    fillTexSel();
  }
  function fillTexSel() {
    const sel = $("#texSel");
    const c = texCandidates();
    sel.innerHTML = '<option value="">\u2014 sin archivo (solo memoria) \u2014</option>' + c.map((f) => '<option value="' + f.node.id + '"' + (S.texNode && S.texNode.id === f.node.id ? " selected" : "") + ">" + esc(f.path) + "</option>").join("");
  }
  async function ensureTexNode() {
    if (S.texNode) return S.texNode;
    const par = findParent(S.node.id, S.project.root) || S.project.root;
    const base = S.node.name.replace(/\.(geo|model)?\.?json$/i, "") || "textura";
    let name = base + ".png", k = 1;
    while ((par.children || []).some((c) => c.name === name)) name = base + "_" + k++ + ".png";
    const n = { id: uid(), type: "file", name, content: tex.toDataURL("image/png") };
    par.children.push(n);
    S.texNode = n;
    S.texDirty = false;
    fillTexSel();
    return n;
  }
  function pixelsBlank() {
    const d = tctx.getImageData(0, 0, tex.width, tex.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i]) return false;
    return true;
  }
  let faces = [], cubeInfo = [], boneWorld =  new Map();
  const COLORS = ["#ef4444", "#f97316", "#fbbf24", "#a3e635", "#22c55e", "#14b8a6", "#38bdf8", "#3b82f6", "#8577f8", "#d946ef", "#ec4899", "#a8a29e"];
  const cubeColors =  new WeakMap();
  const userColor =  new WeakMap();
  function cubeKey(b, c) {
    return b.name + "/" + (b.cubes || []).indexOf(c);
  }
  function cubeColor(b, c) {
    if (userColor.has(c)) return userColor.get(c);
    return COLORS[(bones().indexOf(b) * 3 + (b.cubes || []).indexOf(c)) % COLORS.length];
  }
  function syncColors() {
    const m = {};
    if (G()) bones().forEach((b) => (b.cubes || []).forEach((c) => {
      if (userColor.has(c)) m[cubeKey(b, c)] = userColor.get(c);
    }));
    S.meta.colors = m;
  }
  function applyColors() {
    if (!G()) return;
    bones().forEach((b) => (b.cubes || []).forEach((c) => {
      const k = S.meta.colors[cubeKey(b, c)];
      if (k) userColor.set(c, k);
    }));
  }
  function setCubeColor(c, h) {
    userColor.set(c, h);
  }
  function hexF(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  const FACE_NAMES = ["north", "south", "east", "west", "up", "down"];
  function boneMatrix(b, guard) {
    if (boneWorld.has(b)) return boneWorld.get(b);
    guard = guard ||  new Set();
    if (guard.has(b)) return M.id();
    guard.add(b);
    const p = parentOf(b);
    const pm = p ? boneMatrix(p, guard) : M.id();
    const pose = FD.pose ? FD.pose(b) : null;
    const pv = b.pivot || [0, 0, 0];
    let rot = b.rotation || [0, 0, 0], loc;
    if (pose) {
      rot = [rot[0] + pose.rot[0], rot[1] + pose.rot[1], rot[2] + pose.rot[2]];
      loc = M.mul(M.tr(pose.pos[0], pose.pos[1], pose.pos[2]), M.mul(M.about(pv, rot), M.about2(pv, pose.scale)));
    } else loc = M.about(pv, rot);
    const m = M.mul(pm, loc);
    boneWorld.set(b, m);
    return m;
  }
  function faceUVs(c) {
    const out = {};
    const s = c.size || [1, 1, 1], w = s[0], h = s[1], d = s[2];
    if (Array.isArray(c.uv)) {
      const u = c.uv[0], v = c.uv[1];
      out.east = [u, v + d, u + d, v + d + h];
      out.north = [u + d, v + d, u + d + w, v + d + h];
      out.west = [u + d + w, v + d, u + d + w + d, v + d + h];
      out.south = [u + 2 * d + w, v + d, u + 2 * d + 2 * w, v + d + h];
      out.up = [u + d, v, u + d + w, v + d];
      out.down = [u + d + w, v + d, u + d + 2 * w, v];
      if (c.mirror) {
        const e = out.east;
        out.east = out.west;
        out.west = e;
        Object.keys(out).forEach((k) => {
          const r = out[k];
          out[k] = [r[2], r[1], r[0], r[3]];
        });
      }
    } else if (c.uv && typeof c.uv === "object") {
      FACE_NAMES.forEach((k) => {
        const f = c.uv[k];
        if (f && Array.isArray(f.uv)) {
          const sz = f.uv_size || [0, 0];
          out[k] = [f.uv[0], f.uv[1], f.uv[0] + sz[0], f.uv[1] + sz[1]];
        }
      });
    }
    return out;
  }
  function rebuild() {
    faces = [];
    cubeInfo = [];
    boneWorld =  new Map();
    const g = G();
    if (!g) return;
    const verts = [];
    g.obj.bones.forEach((b) => {
      const bm = boneMatrix(b);
      const hid = S.hidden.has(b);
      (b.cubes || []).forEach((c) => {
        if (hid || S.hidden.has(c)) {
          cubeInfo.push({ b, c, bm, m: bm, hidden: true });
          return;
        }
        const o = c.origin || [0, 0, 0], s = c.size || [1, 1, 1], inf = num(c.inflate, 0);
        const x0 = o[0] - inf, y0 = o[1] - inf, z0 = o[2] - inf, x1 = o[0] + s[0] + inf, y1 = o[1] + s[1] + inf, z1 = o[2] + s[2] + inf;
        const cm = c.rotation && (c.rotation[0] || c.rotation[1] || c.rotation[2]) ? M.mul(bm, M.about(c.pivot || [0, 0, 0], c.rotation)) : bm;
        cubeInfo.push({ b, c, bm, m: cm, hidden: false, bb: [x0, y0, z0, x1, y1, z1] });
        const uvs = faceUVs(c);
        const Q = {
          north: [[x1, y1, z0], [x0, y1, z0], [x0, y0, z0], [x1, y0, z0]],
          south: [[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1]],
          east: [[x1, y1, z1], [x1, y1, z0], [x1, y0, z0], [x1, y0, z1]],
          west: [[x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [x0, y0, z0]],
          up: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]],
          down: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]]
        };
        FACE_NAMES.forEach((fn) => {
          const r = uvs[fn];
          if (!r) return;
          const P = Q[fn].map((p) => M.pt(cm, p));
          const n = norm(cross(sub(P[1], P[0]), sub(P[3], P[0])));
          const shade = 0.62 + 0.38 * clamp(dot(n, norm([0.35, 0.8, -0.5])) * 0.5 + 0.5, 0, 1);
          const U = [[r[0] / S.texW, r[1] / S.texH], [r[2] / S.texW, r[1] / S.texH], [r[2] / S.texW, r[3] / S.texH], [r[0] / S.texW, r[3] / S.texH]];
          faces.push({ b, c, fn, P, U, n, shade });
          const cc = hexF(cubeColor(b, c)), sh = S.shade ? shade : 1;
          [0, 1, 2, 0, 2, 3].forEach((i) => verts.push(P[i][0], P[i][1], P[i][2], U[i][0], U[i][1], sh, cc[0], cc[1], cc[2]));
        });
      });
    });
    vertData = new Float32Array(verts);
    glDirty = true;
    drawUV();
  }
  let vertData = new Float32Array(0), glDirty = true;
  const cv = $("#gl"), ov = $("#ov"), octx = ov.getContext("2d");
  let gl = null, progTex = null, progLine = null, bufTex = null, bufLine = null, glTex = null, texDirtyGL = true;
  function initGL() {
    gl = cv.getContext("webgl", { antialias: true, alpha: false, preserveDrawingBuffer: true }) || cv.getContext("experimental-webgl");
    if (!gl) {
      $("#noGl").hidden = false;
      return false;
    }
    const mk = (vs, fs) => {
      const p = gl.createProgram();
      [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(([t, src]) => {
        const s = gl.createShader(t);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        gl.attachShader(p, s);
      });
      gl.linkProgram(p);
      return p;
    };
    progTex = mk(
      "attribute vec3 p;attribute vec2 u;attribute float s;attribute vec3 k;uniform mat4 m;varying vec2 vu;varying float vs;varying vec3 vk;void main(){vu=u;vs=s;vk=k;gl_Position=m*vec4(p,1.);}",
      "precision mediump float;uniform sampler2D t;uniform float mode;varying vec2 vu;varying float vs;varying vec3 vk;void main(){vec4 c=texture2D(t,vu);vec3 base=vec3(.62,.64,.72);vec3 tx=mix(base,c.rgb,c.a);vec3 col=mode<.5?tx:(mode<1.5?vk:mix(tx,vk,.35));gl_FragColor=vec4(col*vs,1.);}"
    );
    progLine = mk("attribute vec3 p;attribute vec4 c;uniform mat4 m;varying vec4 vc;void main(){vc=c;gl_Position=m*vec4(p,1.);}", "precision mediump float;varying vec4 vc;void main(){gl_FragColor=vc;}");
    bufTex = gl.createBuffer();
    bufLine = gl.createBuffer();
    glTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return true;
  }
  let texBlank = true;
  function uploadTex() {
    texDirtyGL = true;
    try {
      texBlank = pixelsBlank();
    } catch (e) {
      texBlank = false;
    }
    requestDraw();
  }
  let drawQ = 0;
  function requestDraw() {
    if (!drawQ) drawQ = requestAnimationFrame(() => {
      drawQ = 0;
      draw();
    });
  }
  let VP = M.id(), CW = 1, CH = 1, eye = [0, 0, 0];
  function camSetup() {
    const c = S.cam, yaw = c.yaw * Math.PI / 180, pit = c.pitch * Math.PI / 180;
    const t = [c.tx, c.ty, c.tz];
    eye = [t[0] + c.dist * Math.cos(pit) * Math.sin(yaw), t[1] + c.dist * Math.sin(pit), t[2] - c.dist * Math.cos(pit) * Math.cos(yaw)];
    const asp = CW / CH;
    const V = M.look(eye, t, [0, 1, 0]);
    const P = S.ortho ? M.ortho(c.dist * 0.45, asp, -2e3, 2e3) : M.persp(45 * Math.PI / 180, asp, 0.5, 4e3);
    VP = M.mul(P, V);
  }
  function project(p) {
    const x = VP[0] * p[0] + VP[4] * p[1] + VP[8] * p[2] + VP[12], y = VP[1] * p[0] + VP[5] * p[1] + VP[9] * p[2] + VP[13], w = VP[3] * p[0] + VP[7] * p[1] + VP[11] * p[2] + VP[15];
    if (w < 1e-4 && !S.ortho) return null;
    return [(x / w * 0.5 + 0.5) * CW, (1 - (y / w * 0.5 + 0.5)) * CH, w];
  }
  function rayAt(px, py) {
    const inv = invert(VP);
    if (!inv) return null;
    const nx = px / CW * 2 - 1, ny = 1 - py / CH * 2;
    const a = unproj(inv, nx, ny, -1), b = unproj(inv, nx, ny, 1);
    return { o: a, d: norm(sub(b, a)) };
  }
  function unproj(inv, x, y, z) {
    const v = [x, y, z, 1];
    const o = [0, 0, 0, 0];
    for (let r = 0; r < 4; r++) o[r] = inv[r] * v[0] + inv[4 + r] * v[1] + inv[8 + r] * v[2] + inv[12 + r] * v[3];
    return [o[0] / o[3], o[1] / o[3], o[2] / o[3]];
  }
  function invert(m) {
    const a = m, o = new Array(16), b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4], b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6], b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12], b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
    let d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!d) return null;
    d = 1 / d;
    o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * d;
    o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * d;
    o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * d;
    o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * d;
    o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * d;
    o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * d;
    o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * d;
    o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * d;
    o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * d;
    o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * d;
    o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * d;
    o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * d;
    o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * d;
    o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * d;
    o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * d;
    o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * d;
    return o;
  }
  function gridLines() {
    const L = [];
    const a = 0.16, ab = 0.32;
    const push = (p, q, c) => L.push(p[0], p[1], p[2], c[0], c[1], c[2], c[3], q[0], q[1], q[2], c[0], c[1], c[2], c[3]);
    if (S.grid) {
      for (let i = -32; i <= 32; i += 1) {
        const major = i % 16 === 0, mid = i % 4 === 0;
        const c = major ? [0.55, 0.55, 0.75, ab + 0.15] : mid ? [0.5, 0.5, 0.7, ab * 0.7] : [0.5, 0.5, 0.7, a * 0.6];
        if (!mid && S.cam.dist > 140) continue;
        push([i, 0, -32], [i, 0, 32], c);
        push([-32, 0, i], [32, 0, i], c);
      }
    }
    push([0, 0, 0], [16, 0, 0], [0.94, 0.27, 0.27, 1]);
    push([0, 0, 0], [0, 16, 0], [0.13, 0.77, 0.37, 1]);
    push([0, 0, 0], [0, 0, 16], [0.23, 0.51, 0.96, 1]);
    return new Float32Array(L);
  }
  function draw() {
    if (!gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect();
    CW = Math.max(1, r.width);
    CH = Math.max(1, r.height);
    const w = Math.round(CW * dpr), h = Math.round(CH * dpr);
    if (cv.width !== w || cv.height !== h) {
      cv.width = w;
      cv.height = h;
      ov.width = w;
      ov.height = h;
    }
    camSetup();
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.063, 0.067, 0.094, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.CULL_FACE);
    if (texDirtyGL) {
      gl.bindTexture(gl.TEXTURE_2D, glTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex);
      texDirtyGL = false;
    }
    gl.useProgram(progLine);
    gl.uniformMatrix4fv(gl.getUniformLocation(progLine, "m"), false, new Float32Array(VP));
    const gl_ = gridLines();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufLine);
    gl.bufferData(gl.ARRAY_BUFFER, gl_, gl.DYNAMIC_DRAW);
    let pl = gl.getAttribLocation(progLine, "p"), cl = gl.getAttribLocation(progLine, "c");
    gl.enableVertexAttribArray(pl);
    gl.enableVertexAttribArray(cl);
    gl.vertexAttribPointer(pl, 3, gl.FLOAT, false, 28, 0);
    gl.vertexAttribPointer(cl, 4, gl.FLOAT, false, 28, 12);
    gl.drawArrays(gl.LINES, 0, gl_.length / 7);
    if (vertData.length) {
      gl.useProgram(progTex);
      gl.uniformMatrix4fv(gl.getUniformLocation(progTex, "m"), false, new Float32Array(VP));
      gl.uniform1i(gl.getUniformLocation(progTex, "t"), 0);
      gl.uniform1f(gl.getUniformLocation(progTex, "mode"), S.colorMode === "tex" ? 0 : S.colorMode === "color" ? 1 : S.colorMode === "both" ? 2 : texBlank ? 1 : 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, glTex);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufTex);
      gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.DYNAMIC_DRAW);
      const a = [["p", 3, 0], ["u", 2, 12], ["s", 1, 20], ["k", 3, 24]];
      a.forEach(([n, sz, off]) => {
        const l = gl.getAttribLocation(progTex, n);
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, sz, gl.FLOAT, false, 36, off);
      });
      gl.drawArrays(gl.TRIANGLES, 0, vertData.length / 9);
    }
    drawOverlay(dpr);
  }
  let gizmo = null;
  function selMatrixInfo() {
    if (!S.sel) return null;
    const b = S.sel.bone;
    if (S.sel.cube) {
      const ci = cubeInfo.find((x) => x.c === S.sel.cube);
      if (!ci || ci.hidden) return null;
      const bb = ci.bb;
      const ctr = M.pt(ci.m, [(bb[0] + bb[3]) / 2, (bb[1] + bb[4]) / 2, (bb[2] + bb[5]) / 2]);
      return { center: ctr, axM: ci.bm, ci };
    }
    const p = parentOf(b);
    const pm = p ? boneMatrix(p) : M.id();
    return { center: M.pt(boneMatrix(b), b.pivot || [0, 0, 0]), axM: pm };
  }
  function drawOverlay(dpr) {
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    octx.clearRect(0, 0, CW, CH);
    gizmo = null;
    const lw = 1.6;
    if (S.wire) {
      octx.strokeStyle = "rgba(255,255,255,.18)";
      octx.lineWidth = 1;
      faces.forEach((f) => polyPath(f.P));
      octx.stroke();
      octx.beginPath();
    }
    if (S.mode !== "edit" && !S.sel) return;
    const outlineCubes = [];
    if (S.sel) {
      if (S.sel.cube) outlineCubes.push(S.sel.cube);
      else (S.sel.bone.cubes || []).forEach((c) => outlineCubes.push(c));
    }
    outlineCubes.forEach((c) => {
      const ci = cubeInfo.find((x) => x.c === c);
      if (!ci || ci.hidden) return;
      boxEdges(ci, S.sel.cube ? "#a99bff" : "#fbbf24");
    });
    if (!S.sel || S.mode !== "edit" && S.mode !== "anim") return;
    const info = selMatrixInfo();
    if (!info) return;
    const ctr = project(info.center);
    if (!ctr) return;
    const pv = S.sel.cube ? S.sel.cube.pivot ? M.pt(info.axM, S.sel.cube.pivot) : null : info.center;
    if (pv) {
      const q = project(pv);
      if (q) {
        octx.strokeStyle = "#fbbf24";
        octx.lineWidth = 1.5;
        octx.beginPath();
        octx.arc(q[0], q[1], 5, 0, 7);
        octx.moveTo(q[0] - 9, q[1]);
        octx.lineTo(q[0] + 9, q[1]);
        octx.moveTo(q[0], q[1] - 9);
        octx.lineTo(q[0], q[1] + 9);
        octx.stroke();
      }
    }
    if (S.tool === "select") return;
    const cols = ["#ef4444", "#22c55e", "#3b82f6"], axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const unit = Math.max(8, S.cam.dist * 0.16);
    const hs = [];
    axes.forEach((a, i) => {
      const d = norm(M.dir(info.axM, a));
      const tip = [info.center[0] + d[0] * unit, info.center[1] + d[1] * unit, info.center[2] + d[2] * unit];
      const q = project(tip);
      if (!q) return;
      const dx = q[0] - ctr[0], dy = q[1] - ctr[1], len = Math.hypot(dx, dy);
      if (len < 6) return;
      octx.strokeStyle = cols[i];
      octx.fillStyle = cols[i];
      octx.lineWidth = lw + 1;
      octx.beginPath();
      octx.moveTo(ctr[0], ctr[1]);
      octx.lineTo(q[0], q[1]);
      octx.stroke();
      const R = isTouch() ? 13 : 8;
      octx.beginPath();
      if (S.tool === "scale") octx.rect(q[0] - R * 0.7, q[1] - R * 0.7, R * 1.4, R * 1.4);
      else if (S.tool === "rotate") {
        octx.arc(q[0], q[1], R, 0, 7);
      } else {
        const ux = dx / len, uy = dy / len;
        octx.moveTo(q[0] + ux * R * 1.4, q[1] + uy * R * 1.4);
        octx.lineTo(q[0] - uy * R * 0.8, q[1] + ux * R * 0.8);
        octx.lineTo(q[0] + uy * R * 0.8, q[1] - ux * R * 0.8);
        octx.closePath();
      }
      octx.fill();
      hs.push({ i, q, ctr, len, dirScreen: [dx / len, dy / len], unit, R, axisWorld: d });
    });
    gizmo = { hs, center: ctr, info };
    octx.fillStyle = "#fff";
    octx.beginPath();
    octx.arc(ctr[0], ctr[1], 3.5, 0, 7);
    octx.fill();
  }
  function polyPath(P) {
    const a = P.map(project);
    if (a.some((x) => !x)) return;
    octx.moveTo(a[0][0], a[0][1]);
    for (let i = 1; i < 4; i++) octx.lineTo(a[i][0], a[i][1]);
    octx.closePath();
  }
  function boxEdges(ci, col) {
    const bb = ci.bb, c = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]].map((k) => project(M.pt(ci.m, [k[0] ? bb[3] : bb[0], k[1] ? bb[4] : bb[1], k[2] ? bb[5] : bb[2]])));
    if (c.some((x) => !x)) return;
    octx.strokeStyle = col;
    octx.lineWidth = 1.8;
    octx.beginPath();
    [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => {
      octx.moveTo(c[a][0], c[a][1]);
      octx.lineTo(c[b][0], c[b][1]);
    });
    octx.stroke();
  }
  function rayTri(o, d, a, b, c) {
    const e1 = sub(b, a), e2 = sub(c, a), p = cross(d, e2), det = dot(e1, p);
    if (Math.abs(det) < 1e-9) return null;
    const inv = 1 / det, t0 = sub(o, a), u = dot(t0, p) * inv;
    if (u < 0 || u > 1) return null;
    const q = cross(t0, e1), v = dot(d, q) * inv;
    if (v < 0 || u + v > 1) return null;
    const t = dot(e2, q) * inv;
    return t > 0 ? { t, u, v } : null;
  }
  function pick(px, py) {
    const ray = rayAt(px, py);
    if (!ray) return null;
    let best = null;
    const boxes = [];
    cubeInfo.forEach((ci) => {
      if (!ci.hidden) boxes.push(ci);
    });
    faces.forEach((f) => {
      [[0, 1, 2], [0, 2, 3]].forEach((tri, k) => {
        const h = rayTri(ray.o, ray.d, f.P[tri[0]], f.P[tri[1]], f.P[tri[2]]);
        if (h && (!best || h.t < best.t)) {
          const w0 = 1 - h.u - h.v;
          const ia = tri[0], ib = tri[1], ic2 = tri[2];
          const uu = f.U[ia][0] * w0 + f.U[ib][0] * h.u + f.U[ic2][0] * h.v, vv = f.U[ia][1] * w0 + f.U[ib][1] * h.u + f.U[ic2][1] * h.v;
          best = { t: h.t, f, u: uu, v: vv };
        }
      });
    });
    return best;
  }
  function hexRGB(h) {
    const n = parseInt(h.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function stamp(x, y, erase) {
    const b = S.brush, x0 = Math.round(x - b / 2 + (b % 2 ? 0.5 : 0)), y0 = Math.round(y - b / 2 + (b % 2 ? 0.5 : 0));
    if (erase) tctx.clearRect(x0, y0, b, b);
    else {
      tctx.fillStyle = S.color;
      tctx.fillRect(x0, y0, b, b);
    }
  }
  function strokeLine(a, b, erase) {
    const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1);
    for (let i = 0; i <= n; i++) stamp(Math.floor(a[0] + (b[0] - a[0]) * i / n), Math.floor(a[1] + (b[1] - a[1]) * i / n), erase);
  }
  function flood(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    const w = tex.width, h = tex.height;
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const img = tctx.getImageData(0, 0, w, h), d = img.data, i0 = (y * w + x) * 4, tg = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]], c = hexRGB(S.color);
    if (tg[0] === c[0] && tg[1] === c[1] && tg[2] === c[2] && tg[3] === 255) return;
    const same = (i) => d[i] === tg[0] && d[i + 1] === tg[1] && d[i + 2] === tg[2] && d[i + 3] === tg[3];
    const st = [[x, y]];
    while (st.length) {
      const [px, py] = st.pop();
      if (px < 0 || py < 0 || px >= w || py >= h) continue;
      const i = (py * w + px) * 4;
      if (!same(i)) continue;
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
      d[i + 3] = 255;
      st.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
    }
    tctx.putImageData(img, 0, 0);
  }
  function pickColor(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= tex.width || y >= tex.height) return;
    const d = tctx.getImageData(x, y, 1, 1).data;
    if (!d[3]) {
      toast("P\xEDxel transparente");
      return;
    }
    const h = "#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("");
    setColor(h);
  }
  let paintLast = null, painted = false;
  function paintAt(tx, ty, first) {
    const px = tx * tex.width, py = ty * tex.height, p = [Math.floor(px), Math.floor(py)];
    if (S.ptool === "picker") {
      if (first) pickColor(px, py);
      return;
    }
    if (S.ptool === "bucket") {
      if (first) {
        flood(px, py);
        painted = true;
        texChanged();
      }
      return;
    }
    if (paintLast) strokeLine(paintLast, p, S.ptool === "eraser");
    else stamp(p[0], p[1], S.ptool === "eraser");
    paintLast = p;
    painted = true;
    texChanged();
  }
  function texChanged() {
    S.texDirty = true;
    uploadTex();
    drawUV();
  }
  function endStroke() {
    paintLast = null;
    if (painted) {
      painted = false;
      texSnap = tctx.getImageData(0, 0, tex.width, tex.height);
      pushHist("Pintar");
      markDirty();
    }
  }
  const PAL = ["#ffffff", "#c0c0c8", "#6b6e7e", "#1c1d26", "#ef4444", "#f97316", "#fbbf24", "#a3e635", "#22c55e", "#14b8a6", "#38bdf8", "#3b82f6", "#8577f8", "#d946ef", "#ec4899", "#8a5a3c"];
  function setColor(h) {
    S.color = h;
    $("#colorIn").value = h;
  }
  const uvCv = $("#uvCv"), uctx = uvCv.getContext("2d");
  let uvZoom = 4;
  function drawUV() {
    if (S.mode !== "paint" && S.mode !== "uv") return;
    const w = tex.width, h = tex.height;
    uvCv.width = w;
    uvCv.height = h;
    uvCv.style.width = w * uvZoom + "px";
    uvCv.style.height = h * uvZoom + "px";
    uctx.clearRect(0, 0, w, h);
    uctx.drawImage(tex, 0, 0);
    const sx = w / S.texW, sy = h / S.texH;
    uctx.lineWidth = 1 / uvZoom * 1.2;
    faces.forEach((f) => {
      const u = f.U;
      const sel = S.sel && (S.sel.cube === f.c || !S.sel.cube && S.sel.bone === f.b);
      uctx.strokeStyle = sel ? "rgba(251,191,36,.95)" : "rgba(255,255,255,.22)";
      uctx.strokeRect(u[0][0] * S.texW * sx, u[0][1] * S.texH * sy, (u[1][0] - u[0][0]) * S.texW * sx, (u[2][1] - u[0][1]) * S.texH * sy);
    });
  }
  function snapV(v) {
    return S.snap ? Math.round(v / S.snap) * S.snap : round(v, 3);
  }
  function newBoneName(base) {
    let n = base || "hueso", k = 1;
    while (boneByName(n)) n = (base || "hueso") + "_" + k++;
    return n;
  }
  function select(bone, cube) {
    S.sel = bone ? { bone, cube: cube || null } : null;
    refreshAll(true);
  }
  function addBone() {
    const par = S.sel ? S.sel.bone : null;
    const b = { name: newBoneName("hueso"), pivot: par ? (par.pivot || [0, 0, 0]).slice() : [0, 0, 0] };
    if (par) b.parent = par.name;
    bones().push(b);
    S.sel = { bone: b, cube: null };
    commit("A\xF1adir hueso");
    toast("Hueso a\xF1adido");
  }
  function addCube() {
    let b = S.sel ? S.sel.bone : bones()[bones().length - 1];
    if (!b) {
      b = { name: "root", pivot: [0, 0, 0] };
      bones().push(b);
    }
    const base = S.sel && S.sel.cube ? S.sel.cube : null;
    const o = base ? base.origin.slice() : [-4, 0, -4];
    const c = { origin: o, size: [8, 8, 8], uv: [0, 0] };
    ensureCubes(b).push(c);
    S.sel = { bone: b, cube: c };
    autoUV(c);
    commit("A\xF1adir cubo");
  }
  function autoUV(c) {
    const s = c.size, w = 2 * (s[0] + s[2]), h = s[1] + s[2];
    const used = [];
    bones().forEach((b) => (b.cubes || []).forEach((o) => {
      if (o !== c && Array.isArray(o.uv)) used.push([o.uv[0], o.uv[1], 2 * (o.size[0] + o.size[2]), o.size[1] + o.size[2]]);
    }));
    for (let v = 0; v + h <= S.texH; v++) for (let u = 0; u + w <= S.texW; u++) {
      if (!used.some((r) => u < r[0] + r[2] && u + w > r[0] && v < r[1] + r[3] && v + h > r[1])) {
        c.uv = [u, v];
        return;
      }
    }
    c.uv = [0, 0];
  }
  function dup() {
    if (!S.sel) return;
    if (S.sel.cube) {
      const c = JSON.parse(JSON.stringify(S.sel.cube));
      c.origin[0] += 2;
      S.sel.bone.cubes.push(c);
      S.sel = { bone: S.sel.bone, cube: c };
    } else {
      const src = S.sel.bone, map = {};
      const all = [src].concat(descendants(src));
      all.forEach((b) => {
        map[b.name] = newBoneName(b.name);
      });
      const copies = all.map((b) => {
        const n = JSON.parse(JSON.stringify(b));
        n.name = map[b.name];
        if (b.parent && map[b.parent]) n.parent = map[b.parent];
        return n;
      });
      copies.forEach((n) => bones().push(n));
      S.sel = { bone: copies[0], cube: null };
    }
    commit();
  }
  function del() {
    if (!S.sel) return;
    if (S.sel.cube) {
      const a = S.sel.bone.cubes;
      a.splice(a.indexOf(S.sel.cube), 1);
      S.sel = { bone: S.sel.bone, cube: null };
    } else {
      const b = S.sel.bone, rm = [b].concat(descendants(b));
      const par = parentOf(b);
      G().obj.bones = bones().filter((x) => rm.indexOf(x) < 0);
      S.sel = par ? { bone: par, cube: null } : null;
    }
    commit();
  }
  function moveBone(b, d) {
    [b].concat(descendants(b)).forEach((x) => {
      x.pivot = (x.pivot || [0, 0, 0]).map((v, i) => round(v + d[i]));
      (x.cubes || []).forEach((c) => {
        c.origin = c.origin.map((v, i) => round(v + d[i]));
        if (c.pivot) c.pivot = c.pivot.map((v, i) => round(v + d[i]));
      });
    });
  }
  const view = $("#view");
  const ptrs =  new Map();
  let drag = null;
  function pos(e) {
    const r = view.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  function hitGizmo(p) {
    if (!gizmo || S.mode !== "edit" && S.mode !== "anim") return null;
    let best = null, bd = isTouch() ? 28 : 16;
    gizmo.hs.forEach((h) => {
      const d = Math.hypot(h.q[0] - p[0], h.q[1] - p[1]);
      if (d < bd) {
        bd = d;
        best = h;
      }
    });
    return best;
  }
  view.addEventListener("contextmenu", (e) => e.preventDefault());
  view.addEventListener("pointerdown", (e) => {
    view.setPointerCapture(e.pointerId);
    const p = pos(e);
    ptrs.set(e.pointerId, p);
    if (ptrs.size === 2) {
      const [a, b] = Array.from(ptrs.values());
      drag = { type: "multi", d0: Math.hypot(a[0] - b[0], a[1] - b[1]), dist0: S.cam.dist, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], cam: Object.assign({}, S.cam) };
      if (painted || paintLast) {
        endStroke();
      }
      return;
    }
    if (ptrs.size > 2) return;
    const right = e.button === 2, mid = e.button === 1;
    if (right || mid || e.altKey) {
      drag = { type: right || e.altKey ? "orbit" : "pan", p0: p, cam: Object.assign({}, S.cam) };
      if (mid) drag.type = "pan";
      if (right && e.shiftKey) drag.type = "pan";
      return;
    }
    if (S.mode === "paint") {
      const h = pick(p[0], p[1]);
      if (h) {
        drag = { type: "paint", first: true };
        paintAt(h.u, h.v, true);
        drag.first = false;
      } else drag = { type: "orbit", p0: p, cam: Object.assign({}, S.cam) };
      return;
    }
    const g = hitGizmo(p);
    if (g) {
      drag = { type: "gizmo", h: g, p0: p, last: p, acc: 0, tool: S.tool, base: JSON.stringify(S.root), moved: false };
      return;
    }
    drag = { type: "tap", p0: p, cam: Object.assign({}, S.cam), moved: false };
  });
  view.addEventListener("pointermove", (e) => {
    const p = pos(e);
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, p);
    if (!drag) {
      updateCursor(p);
      return;
    }
    if (drag.type === "multi" && ptrs.size >= 2) {
      const [a, b] = Array.from(ptrs.values());
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      S.cam.dist = clamp(drag.dist0 * drag.d0 / Math.max(d, 1), 4, 600);
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (S.mode === "paint") orbitBy(drag, mid);
      else panBy(drag, mid);
      requestDraw();
      return;
    }
    if (drag.type === "orbit") {
      orbitBy(drag, p);
      requestDraw();
    } else if (drag.type === "pan") {
      panBy(drag, p);
      requestDraw();
    } else if (drag.type === "tap") {
      if (Math.hypot(p[0] - drag.p0[0], p[1] - drag.p0[1]) > 5) {
        drag.moved = true;
        drag.type = "orbit";
      }
    } else if (drag.type === "paint") {
      const h = pick(p[0], p[1]);
      if (h) paintAt(h.u, h.v, false);
      else paintLast = null;
    } else if (drag.type === "gizmo") gizmoDrag(p);
  });
  function orbitBy(d, p) {
    const dx = p[0] - d.p0[0], dy = p[1] - d.p0[1];
    S.cam.yaw = d.cam.yaw - dx * 0.4;
    S.cam.pitch = clamp(d.cam.pitch + dy * 0.4, -89, 89);
    if (d.mid) {
      S.cam.yaw = d.cam.yaw - (p[0] - d.mid[0]) * 0.4;
      S.cam.pitch = clamp(d.cam.pitch + (p[1] - d.mid[1]) * 0.4, -89, 89);
    }
  }
  function panBy(d, p) {
    const o = d.p0 || d.mid, dx = p[0] - o[0], dy = p[1] - o[1], yaw = d.cam.yaw * Math.PI / 180, pit = d.cam.pitch * Math.PI / 180, k = d.cam.dist * 0.9 / CH * (S.ortho ? 0.5 : 1);
    const rx = [-Math.cos(yaw), 0, -Math.sin(yaw)], ux = [-Math.sin(pit) * Math.sin(yaw), Math.cos(pit), Math.sin(pit) * Math.cos(yaw)];
    S.cam.tx = d.cam.tx - (rx[0] * dx - ux[0] * dy) * k * -1;
    S.cam.ty = d.cam.ty + ux[1] * dy * k * -1 * -1;
    S.cam.tz = d.cam.tz - (rx[2] * dx - ux[2] * dy) * k * -1;
  }
  function updateCursor(p) {
    if (S.mode === "paint") {
      view.style.cursor = "crosshair";
      return;
    }
    const g = hitGizmo(p);
    view.style.cursor = g ? "grab" : "default";
  }
  function gizmoDrag(p) {
    const d = drag, h = d.h;
    d.moved = true;
    const dx = p[0] - d.last[0], dy = p[1] - d.last[1];
    d.last = p;
    const proj = dx * h.dirScreen[0] + dy * h.dirScreen[1];
    const ppu = h.len / h.unit;
    const sel = S.sel;
    if (!sel) return;
    const i = h.i;
    if (S.mode === "anim") {
      if (FD.animDrag) FD.animDrag(d.tool, i, proj, ppu);
      return;
    }
    if (d.tool === "move") {
      d.acc += proj / ppu;
      const step = S.snap || 0.01;
      const n = S.snap ? Math.trunc(d.acc / step) : 0;
      const amt = S.snap ? n * step : d.acc;
      if (!amt) return;
      d.acc -= amt;
      const v = [0, 0, 0];
      v[i] = amt;
      if (sel.cube) {
        sel.cube.origin = sel.cube.origin.map((x, k) => round(x + v[k]));
        if (sel.cube.pivot) sel.cube.pivot = sel.cube.pivot.map((x, k) => round(x + v[k]));
      } else moveBone(sel.bone, v);
    } else if (d.tool === "rotate") {
      d.acc += proj * 0.7;
      const step = S.snap ? 5 : 0.5;
      const n = Math.trunc(d.acc / step);
      if (!n) return;
      d.acc -= n * step;
      const t = sel.cube || sel.bone;
      const r = (t.rotation || [0, 0, 0]).slice();
      r[i] = round(r[i] + n * step, 2);
      t.rotation = r;
      if (sel.cube && !sel.cube.pivot) sel.cube.pivot = sel.cube.origin.map((o, k) => o + sel.cube.size[k] / 2);
    } else if (d.tool === "scale") {
      if (!sel.cube) return;
      d.acc += proj / ppu;
      const step = S.snap || 0.1;
      const n = Math.trunc(d.acc / step);
      if (!n) return;
      d.acc -= n * step;
      const s = sel.cube.size.slice();
      s[i] = Math.max(0, round(s[i] + n * step));
      sel.cube.size = s;
    }
    rebuild();
    refreshProps();
    requestDraw();
  }
  view.addEventListener("pointerup", (e) => finish(e));
  view.addEventListener("pointercancel", (e) => finish(e));
  function finish(e) {
    const p = pos(e);
    ptrs.delete(e.pointerId);
    const d = drag;
    if (ptrs.size === 0) drag = null;
    else if (ptrs.size === 1 && d && d.type === "multi") drag = null;
    if (!d) return;
    if (d.type === "paint") endStroke();
    else if (d.type === "gizmo") {
      if (d.moved) {
        hist = hist.slice(0, hpos + 1);
        pushHist(S.mode === "anim" ? "Pose" : "Transformar");
        markDirty();
        refreshAll();
      }
    } else if (d.type === "tap" && !d.moved && ptrs.size === 0) {
      const h = pick(p[0], p[1]);
      if (h) select(h.f.b, h.f.c);
      else if (S.mode === "edit") select(null);
    }
  }
  view.addEventListener("wheel", (e) => {
    e.preventDefault();
    S.cam.dist = clamp(S.cam.dist * Math.pow(1.0015, e.deltaY), 4, 600);
    requestDraw();
  }, { passive: false });
  function refreshAll(selChange) {
    renderOutliner();
    refreshProps();
    updToolsState();
    drawUV();
    status();
    requestDraw();
    FD.hooks.refresh.forEach((f) => f("all"));
  }
  function status() {
    const g = G();
    if (!g) return;
    let nb = bones().length, nc = 0;
    bones().forEach((b) => {
      nc += (b.cubes || []).length;
    });
    $("#status").innerHTML = "<span>" + esc(geoName(g)) + "</span><span>" + nb + " huesos \xB7 " + nc + " cubos</span><span>Textura " + S.texW + "\xD7" + S.texH + "</span><span>" + (S.sel ? (S.sel.cube ? "Cubo en " : "Hueso ") + esc(S.sel.bone.name) : "Nada seleccionado") + "</span>";
    $("#outCount").textContent = nb + " / " + nc;
  }
  function updToolsState() {
    const has = !!S.sel;
    ["dupBtn", "delBtn"].forEach((id) => {
      $("#" + id).style.opacity = has ? 1 : 0.4;
    });
    const gm = $('.tool[data-tool="scale"]');
  }
  function renderOutliner() {
    const box = $("#outliner");
    const all = bones();
    if (!all.length) {
      box.innerHTML = '<div class="empty">Modelo vac\xEDo.<br>Pulsa \xABHueso\xBB o \xABCubo\xBB para empezar.</div>';
      return;
    }
    const out = [];
    const seen =  new Set();
    function row(b, depth) {
      seen.add(b);
      const kids = childrenOf(b), cubes = b.cubes || [], col = S.collapsed.has(b), hid = S.hidden.has(b);
      const selB = S.sel && S.sel.bone === b && !S.sel.cube;
      out.push('<div class="row bone' + (selB ? " sel" : "") + (hid ? " hid" : "") + '" data-b="' + all.indexOf(b) + '" style="padding-left:' + (6 + depth * 14) + 'px"><span class="car" data-car>' + (kids.length || cubes.length ? ic(col ? "chev" : "chevd") : "") + '</span><span class="ico">' + ic("bone") + '</span><span class="nm">' + esc(b.name) + '</span><span class="eye" data-eye>' + ic(hid ? "eyeoff" : "eye") + "</span></div>");
      if (!col) {
        cubes.forEach((c, ci) => {
          const sc = S.sel && S.sel.cube === c, ch = S.hidden.has(c);
          out.push('<div class="row cube' + (sc ? " sel" : "") + (ch ? " hid" : "") + '" data-b="' + all.indexOf(b) + '" data-c="' + ci + '" style="padding-left:' + (24 + (depth + 1) * 14) + 'px"><span class="dot" style="background:' + cubeColor(b, c) + '"></span><span class="ico">' + ic("cube") + '</span><span class="nm">Cubo ' + (ci + 1) + ' <small style="color:var(--mut)">' + (c.size || []).join("\xD7") + '</small></span><span class="eye" data-eye>' + ic(ch ? "eyeoff" : "eye") + "</span></div>");
        });
        kids.forEach((k) => row(k, depth + 1));
      }
    }
    all.filter((b) => !b.parent || !boneByName(b.parent)).forEach((b) => row(b, 0));
    all.forEach((b) => {
      if (!seen.has(b)) row(b, 0);
    });
    box.innerHTML = out.join("");
    hydrateIcons(box);
    const s = box.querySelector(".sel");
    if (s && s.scrollIntoViewIfNeeded) s.scrollIntoViewIfNeeded(false);
  }
  $("#outliner").addEventListener("click", (e) => {
    const r = e.target.closest(".row");
    if (!r) return;
    const b = bones()[+r.dataset.b];
    const c = r.dataset.c != null ? b.cubes[+r.dataset.c] : null;
    if (e.target.closest("[data-eye]")) {
      const t = c || b;
      if (S.hidden.has(t)) S.hidden.delete(t);
      else S.hidden.add(t);
      rebuild();
      renderOutliner();
      requestDraw();
      return;
    }
    if (e.target.closest("[data-car]")) {
      if (S.collapsed.has(b)) S.collapsed.delete(b);
      else S.collapsed.add(b);
      renderOutliner();
      return;
    }
    select(b, c);
  });
  function fld(label, cls, val, attrs) {
    return '<label class="fld"><span class="' + cls + '">' + label + '</span><input type="number" inputmode="decimal" step="any" value="' + (val == null ? "" : round(val, 3)) + '" ' + (attrs || "") + "></label>";
  }
  function vec3(title, key, arr, step) {
    arr = arr || [0, 0, 0];
    return '<div class="grp"><h4>' + title + '</h4><div class="f3" data-vec="' + key + '">' + fld("X", "x", arr[0], 'data-k="0"') + fld("Y", "y", arr[1], 'data-k="1"') + fld("Z", "z", arr[2], 'data-k="2"') + "</div></div>";
  }
  function refreshProps() {
    const box = $("#props"), t = $("#propsTitle");
    const g = G();
    if (S.mode === "anim" && S.sel && FD.animProps) {
      FD.animProps(box, t);
      return;
    }
    if (!S.sel) {
      t.textContent = "Modelo";
      box.innerHTML = '<div class="grp"><h4>Geometr\xEDa</h4>' + (S.geos.length > 1 ? '<select id="geoSel">' + S.geos.map((x, i) => '<option value="' + i + '"' + (i === S.gi ? " selected" : "") + ">" + esc(geoName(x)) + "</option>").join("") + '</select><div style="height:6px"></div>' : "") + (g.legacy ? '<div class="sub">Formato antiguo (1.8)</div>' : '<input class="txt" id="geoId" value="' + esc(geoName(g)) + '">') + '</div><div class="grp"><h4>Tama\xF1o de textura</h4><div class="f2">' + fld("W", "n", S.texW, 'id="texW"') + fld("H", "n", S.texH, 'id="texH"') + '</div></div><div class="sub">Toca un cubo o un hueso para editarlo.</div>';
      const gs = $("#geoSel");
      if (gs) gs.onchange = () => {
        S.gi = +gs.value;
        S.sel = null;
        readDims();
        rebuild();
        refreshAll();
      };
      const gi = $("#geoId");
      if (gi) gi.onchange = () => {
        g.obj.description.identifier = gi.value.trim() || "geometry.modelo";
        commit();
      };
      ["texW", "texH"].forEach((id) => {
        const el = $("#" + id);
        el.onchange = () => {
          const v = clamp(Math.round(+el.value) || 64, 1, 4096);
          if (id === "texW") S.texW = v;
          else S.texH = v;
          writeDims();
          commit();
        };
      });
      return;
    }
    const b = S.sel.bone, c = S.sel.cube;
    let h = "";
    const parentOpts = (cur, excl) => '<option value="">\u2014 ninguno \u2014</option>' + bones().filter((x) => excl.indexOf(x) < 0).map((x) => '<option value="' + esc(x.name) + '"' + (x.name === cur ? " selected" : "") + ">" + esc(x.name) + "</option>").join("");
    if (c) {
      t.textContent = "Cubo";
      h += '<div class="grp"><h4>Hueso</h4><select id="cubeBone">' + bones().map((x) => '<option value="' + esc(x.name) + '"' + (x === b ? " selected" : "") + ">" + esc(x.name) + "</option>").join("") + "</select></div>";
      h += '<div class="grp"><h4>Color</h4><div class="swc" id="cswatch">' + COLORS.map((k) => '<button class="sw" data-c="' + k + '" style="background:' + k + (cubeColor(b, c) === k ? ";outline:2px solid #fff" : "") + '"></button>').join("") + '<input type="color" id="ccustom" value="' + cubeColor(b, c) + '" style="width:26px;height:26px;padding:0;border:0;background:none"></div></div>';
      h += vec3("Origen", "origin", c.origin) + vec3("Tama\xF1o", "size", c.size) + vec3("Pivote", "pivot", c.pivot || c.origin.map((o, i) => o + c.size[i] / 2)) + vec3("Rotaci\xF3n", "rotation", c.rotation);
      h += '<div class="grp"><h4>Extras</h4><div class="f2">' + fld("+", "n", c.inflate || 0, 'id="inflate" title="Expansi\xF3n"') + '<label class="chk"><input type="checkbox" id="mirror"' + (c.mirror ? " checked" : "") + ">Espejo UV</label></div></div>";
      if (Array.isArray(c.uv)) h += '<div class="grp"><h4>UV (caja)</h4><div class="f2" data-vec="uv">' + fld("U", "n", c.uv[0], 'data-k="0"') + fld("V", "n", c.uv[1], 'data-k="1"') + '</div><div class="btnrow" style="margin-top:6px"><button class="btn" id="uvAuto">Auto-colocar</button><button class="btn" id="uvFaces">Pasar a caras</button></div></div>';
      else h += '<div class="grp"><h4>UV por caras</h4>' + FACE_NAMES.map((fn) => {
        const f = c.uv && c.uv[fn] || { uv: [0, 0], uv_size: [0, 0] };
        return '<div class="sub">' + fn + '</div><div class="uvf" data-face="' + fn + '" style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px">' + [f.uv[0], f.uv[1], (f.uv_size || [0, 0])[0], (f.uv_size || [0, 0])[1]].map((v, k) => '<label class="fld"><input type="number" step="any" data-k="' + k + '" value="' + v + '"></label>').join("") + "</div>";
      }).join("") + "</div>";
    } else {
      t.textContent = "Hueso";
      const ex = [b].concat(descendants(b));
      h += '<div class="grp"><h4>Nombre</h4><input class="txt" id="boneName" value="' + esc(b.name) + '"></div><div class="grp"><h4>Padre</h4><select id="boneParent">' + parentOpts(b.parent, ex) + "</select></div>";
      h += vec3("Pivote", "pivot", b.pivot) + vec3("Rotaci\xF3n", "rotation", b.rotation);
      h += '<div class="grp"><h4>Mover todo el hueso</h4><div class="sub">Usa la herramienta Mover para trasladar el hueso con sus cubos e hijos.</div></div>';
    }
    box.innerHTML = h;
    bindProps(b, c);
  }
  function bindProps(b, c) {
    const box = $("#props");
    $$("[data-vec]", box).forEach((grp) => {
      const key = grp.dataset.vec;
      $$("input", grp).forEach((inp) => {
        inp.onchange = () => {
          const k = +inp.dataset.k, v = +inp.value || 0, tgt = c || b;
          if (key === "uv") {
            c.uv[k] = Math.round(v);
          } else if (key === "origin" && !c.pivot) {
            c.origin[k] = v;
          } else if (key === "origin") {
            const d = v - c.origin[k];
            c.origin[k] = v;
            c.pivot[k] = round(c.pivot[k] + d);
          } else if (key === "pivot" && !c) {
            const d = v - (b.pivot || [0, 0, 0])[k];
            const dv = [0, 0, 0];
            dv[k] = d;
            moveBone(b, dv);
          } else {
            tgt[key] = (tgt[key] || (key === "rotation" ? [0, 0, 0] : [0, 0, 0])).slice();
            tgt[key][k] = v;
            if (key === "size") {
              tgt[key][k] = Math.max(0, v);
            }
          }
          if (c && key === "rotation" && !c.pivot) c.pivot = c.origin.map((o, i) => o + c.size[i] / 2);
          commit();
        };
      });
    });
    const bn = $("#boneName");
    if (bn) bn.onchange = () => {
      const nn = bn.value.trim();
      if (!nn || boneByName(nn) && boneByName(nn) !== b) {
        toast("Nombre vac\xEDo o repetido");
        bn.value = b.name;
        return;
      }
      bones().forEach((x) => {
        if (x.parent === b.name) x.parent = nn;
      });
      if (FD.renameBone) FD.renameBone(b.name, nn);
      b.name = nn;
      commit("Renombrar hueso");
    };
    const bp = $("#boneParent");
    if (bp) bp.onchange = () => {
      if (bp.value) b.parent = bp.value;
      else delete b.parent;
      commit();
    };
    const cb = $("#cubeBone");
    if (cb) cb.onchange = () => {
      const nb = boneByName(cb.value);
      if (!nb || nb === b) return;
      b.cubes.splice(b.cubes.indexOf(c), 1);
      ensureCubes(nb).push(c);
      S.sel = { bone: nb, cube: c };
      commit();
    };
    $$("#cswatch .sw").forEach((x) => {
      x.onclick = () => {
        setCubeColor(c, x.dataset.c);
        commit("Color de cubo");
      };
    });
    const cc = $("#ccustom");
    if (cc) cc.onchange = () => {
      setCubeColor(c, cc.value);
      commit("Color de cubo");
    };
    const inf = $("#inflate");
    if (inf) inf.onchange = () => {
      c.inflate = +inf.value || 0;
      if (!c.inflate) delete c.inflate;
      commit();
    };
    const mi = $("#mirror");
    if (mi) mi.onchange = () => {
      c.mirror = mi.checked;
      if (!c.mirror) delete c.mirror;
      commit();
    };
    const ua = $("#uvAuto");
    if (ua) ua.onclick = () => {
      autoUV(c);
      commit();
    };
    const uf = $("#uvFaces");
    if (uf) uf.onclick = () => {
      const r = faceUVs(c), o = {};
      FACE_NAMES.forEach((fn) => {
        const q = r[fn];
        o[fn] = { uv: [q[0], q[1]], uv_size: [q[2] - q[0], q[3] - q[1]] };
      });
      c.uv = o;
      delete c.mirror;
      commit();
    };
    $$(".uvf", box).forEach((row) => {
      $$("input", row).forEach((inp) => {
        inp.onchange = () => {
          const fn = row.dataset.face;
          const vals = $$("input", row).map((x) => +x.value || 0);
          if (!c.uv || Array.isArray(c.uv)) c.uv = {};
          c.uv[fn] = { uv: [vals[0], vals[1]], uv_size: [vals[2], vals[3]] };
          commit();
        };
      });
    });
  }
  function setMode(m) {
    S.mode = m;
    const a = $("#app");
    a.dataset.mode = m;
    $$(".mode").forEach((x) => x.classList.toggle("on", x.dataset.mode === m));
    if (m === "paint" || m === "uv") {
      fillTexSel();
      $("#pPaintTitle").textContent = m === "uv" ? "Mapa UV (arrastra las caras)" : "Pintura";
    }
    if (isMobile()) {
      const want = m === "edit" ? $("#app").dataset.sheet === "paint" || $("#app").dataset.sheet === "anim" ? "outliner" : $("#app").dataset.sheet : m === "anim" ? "anim" : "paint";
      a.setAttribute("data-sheet", want || "");
      $$("#bnav button").forEach((x) => x.classList.toggle("on", x.dataset.sheet === want));
    }
    FD.hooks.refresh.forEach((f) => f("mode"));
    help();
    refreshAll();
    setTimeout(requestDraw, 30);
  }
  const isMobile = () => matchMedia("(max-width:860px)").matches;
  function setSheet(s) {
    const a = $("#app");
    a.dataset.sheet = a.dataset.sheet === s ? "" : s;
    if (a.dataset.sheet === "") a.removeAttribute("data-sheet"), a.setAttribute("data-sheet", "");
    $$("#bnav button").forEach((b) => b.classList.toggle("on", b.dataset.sheet === a.dataset.sheet));
    if (a.dataset.sheet === "paint") drawUV();
    setTimeout(requestDraw, 30);
  }
  function help() {
    $("#vhelp").textContent = S.mode === "paint" ? "Clic: pintar \xB7 Bot\xF3n derecho: girar \xB7 Rueda: zoom" : S.mode === "anim" ? "Elige un hueso \xB7 usa Mover/Rotar/Escala para posar \xB7 K: clave \xB7 Espacio: reproducir" : "Clic: seleccionar \xB7 Arrastrar: girar \xB7 Bot\xF3n derecho: mover vista \xB7 Rueda: zoom";
  }
  function setTool(t) {
    S.tool = t;
    $$("[data-tool]").forEach((b) => b.classList.toggle("on", b.dataset.tool === t));
    requestDraw();
  }
  $$("[data-tool]").forEach((b) => b.addEventListener("click", () => setTool(b.dataset.tool)));
  $$("[data-ptool]").forEach((b) => b.addEventListener("click", () => {
    S.ptool = b.dataset.ptool;
    $$("[data-ptool]").forEach((x) => x.classList.toggle("on", x === b));
  }));
  $$(".mode").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $$("#bnav button").forEach((b) => b.addEventListener("click", () => setSheet(b.dataset.sheet)));
  $("#addCube").onclick = addCube;
  $("#addBone").onclick = addBone;
  $("#dupBtn").onclick = dup;
  $("#delBtn").onclick = del;
  $("#undoBtn").onclick = undo;
  $("#redoBtn").onclick = redo;
  $("#saveBtn").onclick = async () => {
    await save();
    toast("Guardado en el proyecto");
  };
  $("#snapBtn").onclick = () => {
    const o = [1, 0.5, 0.25, 0];
    S.snap = o[(o.indexOf(S.snap) + 1) % o.length];
    $("#snapBtn").textContent = S.snap ? "Ajuste " + S.snap : "Sin ajuste";
  };
  $("#viewBtn").onclick = () => {
    S.ortho = !S.ortho;
    $("#viewBtn").textContent = S.ortho ? "Ortogonal" : "Perspectiva";
    requestDraw();
  };
  $$("#menu [data-lang]").forEach((b) => {
    b.classList.toggle("on", window.FD_I18N && FD_I18N.get() === b.dataset.lang);
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      FD_I18N.set(b.dataset.lang);
      $$("#menu [data-lang]").forEach((x) => x.classList.toggle("on", x === b));
    });
  });
  $("#menuBtn").onclick = (e) => {
    e.stopPropagation();
    $("#menu").hidden = !$("#menu").hidden;
  };
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#menu") && !e.target.closest("#menuBtn")) $("#menu").hidden = true;
  });
  $("#uvIn").onclick = () => {
    uvZoom = Math.min(24, uvZoom * 1.5);
    drawUV();
  };
  $("#uvOut").onclick = () => {
    uvZoom = Math.max(1, uvZoom / 1.5);
    drawUV();
  };
  $("#colorIn").oninput = (e) => {
    S.color = e.target.value;
  };
  $("#brushIn").oninput = (e) => {
    S.brush = +e.target.value;
    $("#brushVal").textContent = S.brush;
  };
  $("#swatches").innerHTML = PAL.map((c) => '<button class="sw" style="background:' + c + '" data-c="' + c + '" aria-label="' + c + '"></button>').join("");
  $("#swatches").onclick = (e) => {
    const b = e.target.closest(".sw");
    if (b) setColor(b.dataset.c);
  };
  $("#texSel").onchange = async (e) => {
    const n = e.target.value ? findNode(e.target.value, S.project.root) : null;
    if (n) {
      await useTexNode(n);
      histLock = false;
      pushHist();
      drawUV();
    } else {
      S.texNode = null;
      fillTexSel();
    }
  };
  let uvDown = false;
  function uvXY(e) {
    const r = uvCv.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  }
  let uvDrag = null;
  uvCv.addEventListener("pointerdown", (e) => {
    uvCv.setPointerCapture(e.pointerId);
    const p = uvXY(e);
    if (S.mode === "uv") {
      const x = p[0] * S.texW, y = p[1] * S.texH;
      let hit = null;
      for (let i = faces.length - 1; i >= 0; i--) {
        const f = faces[i], u = f.U;
        const x0 = Math.min(u[0][0], u[1][0]) * S.texW, x1 = Math.max(u[0][0], u[1][0]) * S.texW, y0 = Math.min(u[0][1], u[2][1]) * S.texH, y1 = Math.max(u[0][1], u[2][1]) * S.texH;
        if (x >= x0 && x <= x1 && y >= y0 && y <= y1 && (!hit || S.sel && S.sel.cube === f.c)) {
          hit = f;
          if (S.sel && S.sel.cube === f.c) break;
        }
      }
      if (!hit) return;
      if (!S.sel || S.sel.cube !== hit.c) select(hit.b, hit.c);
      const c = hit.c;
      uvDrag = { c, fn: hit.fn, x, y, orig: JSON.stringify(c.uv), moved: false };
      return;
    }
    uvDown = true;
    paintAt(p[0], p[1], true);
  });
  uvCv.addEventListener("pointermove", (e) => {
    const p = uvXY(e);
    if (uvDrag) {
      const dx = Math.round(p[0] * S.texW - uvDrag.x), dy = Math.round(p[1] * S.texH - uvDrag.y);
      const o = JSON.parse(uvDrag.orig), c = uvDrag.c;
      if (Array.isArray(o)) c.uv = [Math.max(0, o[0] + dx), Math.max(0, o[1] + dy)];
      else {
        const n = JSON.parse(uvDrag.orig);
        const f = n[uvDrag.fn];
        if (f) {
          f.uv = [Math.max(0, f.uv[0] + dx), Math.max(0, f.uv[1] + dy)];
          c.uv = n;
        }
      }
      uvDrag.moved = true;
      rebuild();
      requestDraw();
      return;
    }
    if (uvDown) paintAt(p[0], p[1], false);
  });
  function uvEnd() {
    if (uvDrag) {
      const m = uvDrag.moved;
      uvDrag = null;
      if (m) {
        pushHist("Mover UV");
        markDirty();
        refreshProps();
      }
    }
    uvDown = false;
    endStroke();
  }
  uvCv.addEventListener("pointerup", uvEnd);
  uvCv.addEventListener("pointercancel", uvEnd);
  function download(name, data, type) {
    const a = document.createElement("a");
    a.href = typeof data === "string" && data.indexOf("data:") === 0 ? data : URL.createObjectURL(new Blob([data], { type }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  $("#menu").addEventListener("click", async (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $("#menu").hidden = true;
    const a = b.dataset.act;
    if (a === "newgeo") {
      if (!confirm("\xBFReemplazar el modelo actual por uno vac\xEDo? Puedes deshacerlo.")) return;
      S.root = emptyRoot();
      S.geos = parseGeos(S.root);
      S.gi = 0;
      S.sel = null;
      readDims();
      commit();
    } else if (a === "import") $("#fileIn").click();
    else if (a === "export") {
      writeDims();
      download((S.node.name || "modelo.geo.json").replace(/\.json$/i, "") + ".json", JSON.stringify(S.root, null, 2), "application/json");
    } else if (a === "loadtex") $("#texIn").click();
    else if (a === "savetex") {
      await ensureTexNode();
      S.texNode.content = tex.toDataURL("image/png");
      S.texDirty = false;
      await save();
      toast("Textura guardada: " + S.texNode.name);
    } else if (a === "dltex") download(S.texNode ? S.texNode.name : "textura.png", tex.toDataURL("image/png"));
    else if (a === "newtex") {
      const w = +prompt("Ancho de la textura", S.texW) || S.texW, h = +prompt("Alto de la textura", S.texH) || S.texH;
      newBlankTex(w, h);
      S.texW = w;
      S.texH = h;
      writeDims();
      S.texDirty = true;
      uploadTex();
      commit();
    } else if (a === "wire") {
      S.wire = !S.wire;
      requestDraw();
    } else if (a === "grid") {
      S.grid = !S.grid;
      requestDraw();
    } else if (a === "reset") {
      frameModel();
    } else if (a === "shade") {
      S.shade = !S.shade;
      rebuild();
    } else if (a === "cmode") {
      const o = ["auto", "tex", "color", "both"];
      S.colorMode = o[(o.indexOf(S.colorMode) + 1) % o.length];
      toast("Vista: " + { auto: "autom\xE1tica", tex: "textura", color: "colores", both: "textura + color" }[S.colorMode]);
      requestDraw();
    }
  });
  $("#fileIn").onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    try {
      const r = JSON.parse((await f.text()).replace(/^﻿/, "").replace(/\/\/.*$/gm, ""));
      const geos = parseGeos(r);
      if (!geos.length) {
        toast("Ese archivo no tiene geometr\xEDas");
        return;
      }
      S.root = r;
      S.geos = geos;
      S.gi = 0;
      S.sel = null;
      readDims();
      commit();
      frameModel();
      toast("Modelo importado");
    } catch (err) {
      toast("JSON no v\xE1lido");
    }
  };
  $("#texIn").onchange = async (e) => {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const fr = new FileReader();
    fr.onload = async () => {
      await loadTexFromData(fr.result);
      S.texDirty = true;
      pushHist();
      markDirty();
      toast("Textura cargada: " + tex.width + "\xD7" + tex.height);
    };
    fr.readAsDataURL(f);
  };
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    const typing = tag === "input" || tag === "select" || tag === "textarea";
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      save();
      toast("Guardado");
      return;
    }
    if (mod && e.key.toLowerCase() === "z") {
      if (typing && tag !== "select" && e.target.type !== "number") return;
      e.preventDefault();
      e.shiftKey ? redo() : undo();
      return;
    }
    if (mod && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
      return;
    }
    if (typing) return;
    if (mod && e.key.toLowerCase() === "d") {
      e.preventDefault();
      dup();
      return;
    }
    const k = e.key.toLowerCase();
    if ((k === "delete" || k === "backspace") && S.mode !== "anim") {
      e.preventDefault();
      del();
    } else if (S.mode === "edit" || S.mode === "anim") {
      if (k === "v") setTool("select");
      else if (k === "g") setTool("move");
      else if (k === "r") setTool("rotate");
      else if (k === "s") setTool("scale");
    } else if (S.mode === "paint") {
      const m = { b: "pencil", e: "eraser", f: "bucket", i: "picker" }[k];
      if (m) {
        S.ptool = m;
        $$("[data-ptool]").forEach((x) => x.classList.toggle("on", x.dataset.ptool === m));
      }
    }
    if (k === "tab") {
      e.preventDefault();
      setMode(S.mode === "edit" ? "paint" : "edit");
    }
    if (k === "f" && S.mode === "edit") frameModel();
  });
  window.addEventListener("beforeunload", (e) => {
    if (S.dirty) {
      saveDraft();
      e.preventDefault();
      e.returnValue = "";
    }
  });
  window.addEventListener("pagehide", () => {
    if (S.dirty) saveDraft();
  });
  new ResizeObserver(() => requestDraw()).observe(view);
  window.addEventListener("resize", requestDraw);
  function frameModel() {
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    faces.forEach((f) => f.P.forEach((p) => {
      for (let i = 0; i < 3; i++) {
        mn[i] = Math.min(mn[i], p[i]);
        mx[i] = Math.max(mx[i], p[i]);
      }
    }));
    if (mn[0] > mx[0]) {
      S.cam = { yaw: 35, pitch: 22, dist: 70, tx: 0, ty: 12, tz: 0 };
    } else {
      const sz = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2], 8);
      S.cam.tx = (mn[0] + mx[0]) / 2;
      S.cam.ty = (mn[1] + mx[1]) / 2;
      S.cam.tz = (mn[2] + mx[2]) / 2;
      S.cam.dist = clamp(sz * 2.4, 20, 400);
    }
    requestDraw();
  }
  function modal(title, body, buttons, bind) {
    const bg = document.createElement("div");
    bg.className = "modal-bg";
    bg.innerHTML = '<div class="modal-box"><h3>' + title + '</h3><div class="mb">' + body + '</div><div class="mf"></div></div>';
    const mf = bg.querySelector(".mf");
    const api = { el: bg, close: () => bg.remove() };
    (buttons || [{ label: "Cerrar" }]).forEach((b) => {
      const x = document.createElement("button");
      x.className = "btn " + (b.cls || "");
      x.textContent = b.label;
      x.onclick = () => {
        if (!b.fn || b.fn(api) !== false) api.close();
      };
      mf.appendChild(x);
    });
    bg.addEventListener("mousedown", (e) => {
      if (e.target === bg) api.close();
    });
    document.body.appendChild(bg);
    hydrateIcons(bg);
    if (bind) bind(bg, api);
    return api;
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const m = document.querySelector(".modal-bg");
      if (m) m.remove();
      $("#morePop").hidden = true;
      $("#menu").hidden = true;
    }
  });
  function openHistory() {
    const rows = hist.map((h, i) => '<div class="hrow' + (i === hpos ? " cur" : "") + '" data-i="' + i + '">' + ic(i === hpos ? "check" : "hist") + "<span>" + esc(h.label) + "</span><small>" + new Date(h.t).toLocaleTimeString() + "</small></div>").reverse().join("");
    modal("Historial de cambios", '<div class="sub">Pulsa un paso para volver (o avanzar) a ese estado. Los pasos posteriores se conservan hasta que hagas un cambio nuevo.</div>' + rows, [{ label: "Cerrar" }], (el, api) => {
      el.addEventListener("click", (e) => {
        const r = e.target.closest(".hrow");
        if (!r) return;
        hpos = +r.dataset.i;
        restore(hist[hpos]);
        updUndo();
        api.close();
      });
    });
  }
  const cubesOf = (b) => [b].concat(descendants(b)).reduce((a, x) => a.concat(x.cubes || []), []);
  function cubeCenter(c) {
    return c.origin.map((o, i) => o + c.size[i] / 2);
  }
  function moveSel(d, label) {
    if (!S.sel) return;
    const sel = S.sel;
    if (sel.cube) {
      sel.cube.origin = sel.cube.origin.map((x, k) => round(x + d[k]));
      if (sel.cube.pivot) sel.cube.pivot = sel.cube.pivot.map((x, k) => round(x + d[k]));
    } else moveBone(sel.bone, d);
    commit(label || "Mover");
  }
  function mirrorCube(c) {
    const n = JSON.parse(JSON.stringify(c));
    n.origin[0] = round(-(c.origin[0] + c.size[0]));
    if (c.pivot) n.pivot[0] = round(-c.pivot[0]);
    if (c.rotation) n.rotation = [c.rotation[0], -c.rotation[1], -c.rotation[2]];
    if (Array.isArray(n.uv)) n.mirror = !c.mirror;
    if (!n.mirror) delete n.mirror;
    return n;
  }
  function T_mirror() {
    if (!S.sel) return toast("Selecciona un cubo o un hueso");
    if (S.sel.cube) {
      const n = mirrorCube(S.sel.cube);
      S.sel.bone.cubes.push(n);
      S.sel = { bone: S.sel.bone, cube: n };
      return commit("Espejo de cubo");
    }
    const src = S.sel.bone, all = [src].concat(descendants(src)), map = {};
    all.forEach((b) => {
      map[b.name] = newBoneName(b.name + "_esp");
    });
    const cp = all.map((b) => {
      const n = JSON.parse(JSON.stringify(b));
      n.name = map[b.name];
      if (b.parent && map[b.parent]) n.parent = map[b.parent];
      if (n.pivot) n.pivot[0] = round(-n.pivot[0]);
      if (n.rotation) n.rotation = [n.rotation[0], -n.rotation[1], -n.rotation[2]];
      if (n.cubes) n.cubes = b.cubes.map(mirrorCube);
      return n;
    });
    cp.forEach((n) => bones().push(n));
    S.sel = { bone: cp[0], cube: null };
    commit("Espejo de hueso");
  }
  function T_center() {
    if (!S.sel) return toast("Selecciona algo");
    if (S.sel.cube) {
      S.sel.cube.pivot = cubeCenter(S.sel.cube);
      return commit("Centrar pivote");
    }
    const cs = cubesOf(S.sel.bone);
    if (!cs.length) return toast("El hueso no tiene cubos");
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    cs.forEach((c) => {
      for (let i = 0; i < 3; i++) {
        mn[i] = Math.min(mn[i], c.origin[i]);
        mx[i] = Math.max(mx[i], c.origin[i] + c.size[i]);
      }
    });
    S.sel.bone.pivot = mn.map((v, i) => round((v + mx[i]) / 2));
    commit("Centrar pivote");
  }
  function T_group() {
    if (!S.sel || !S.sel.cube) return toast("Selecciona un cubo para agrupar");
    const b = S.sel.bone, c = S.sel.cube, nb = { name: newBoneName(b.name + "_grupo"), parent: b.name, pivot: cubeCenter(c).map((v) => round(v)), cubes: [c] };
    b.cubes.splice(b.cubes.indexOf(c), 1);
    bones().push(nb);
    S.sel = { bone: nb, cube: c };
    commit("Agrupar en hueso");
  }
  function allCubes() {
    return bones().reduce((a, b) => a.concat(b.cubes || []), []);
  }
  function T_ground() {
    const cs = allCubes();
    if (!cs.length) return;
    const mn = Math.min.apply(null, cs.map((c) => c.origin[1] - num(c.inflate, 0)));
    if (!mn) return toast("Ya est\xE1 sobre el suelo");
    bones().filter((b) => !parentOf(b)).forEach((b) => moveBone(b, [0, -mn, 0]));
    commit("Alinear al suelo");
  }
  function T_centerXZ() {
    const cs = allCubes();
    if (!cs.length) return;
    let a = 1e9, b = -1e9, c2 = 1e9, d = -1e9;
    cs.forEach((c) => {
      a = Math.min(a, c.origin[0]);
      b = Math.max(b, c.origin[0] + c.size[0]);
      c2 = Math.min(c2, c.origin[2]);
      d = Math.max(d, c.origin[2] + c.size[2]);
    });
    const dx = -round((a + b) / 2), dz = -round((c2 + d) / 2);
    bones().filter((x) => !parentOf(x)).forEach((x) => moveBone(x, [dx, 0, dz]));
    commit("Centrar modelo");
  }
  function T_ints() {
    if (!S.sel) return toast("Selecciona algo");
    const cs = S.sel.cube ? [S.sel.cube] : cubesOf(S.sel.bone);
    cs.forEach((c) => {
      c.origin = c.origin.map(Math.round);
      c.size = c.size.map((v) => Math.max(0, Math.round(v)));
      if (c.pivot) c.pivot = c.pivot.map(Math.round);
    });
    commit("Ajustar a enteros");
  }
  function T_scale() {
    const k = parseFloat(prompt("Factor de escala del modelo completo (ej. 0.5 o 2)", "1"));
    if (!k || k <= 0 || k === 1) return;
    bones().forEach((b) => {
      if (b.pivot) b.pivot = b.pivot.map((v) => round(v * k));
      (b.cubes || []).forEach((c) => {
        c.origin = c.origin.map((v) => round(v * k));
        c.size = c.size.map((v) => round(v * k));
        if (c.pivot) c.pivot = c.pivot.map((v) => round(v * k));
        if (c.inflate) c.inflate = round(c.inflate * k);
      });
    });
    commit("Escalar modelo");
    frameModel();
  }
  function T_split(ax) {
    if (!S.sel || !S.sel.cube) return toast("Selecciona un cubo");
    const c = S.sel.cube, i = ax, sz = c.size[i];
    if (sz < 2) return toast("Es demasiado peque\xF1o para dividir");
    const h1 = Math.floor(sz / 2), h2 = sz - h1, n = JSON.parse(JSON.stringify(c));
    c.size[i] = h1;
    n.size[i] = h2;
    n.origin[i] = round(c.origin[i] + h1);
    if (Array.isArray(n.uv)) {
      n.uv = null;
    }
    S.sel.bone.cubes.push(n);
    if (Array.isArray(c.uv)) autoUV(c);
    if (n.uv === null) autoUV(n);
    commit("Dividir cubo");
  }
  function T_rot90(ax) {
    if (!S.sel || !S.sel.cube) return toast("Selecciona un cubo");
    const c = S.sel.cube, ctr = cubeCenter(c), a = ax === "y" ? [0, 2] : ax === "x" ? [1, 2] : [0, 1];
    const s2 = c.size.slice();
    s2[a[0]] = c.size[a[1]];
    s2[a[1]] = c.size[a[0]];
    c.size = s2;
    c.origin = ctr.map((v, i) => round(v - s2[i] / 2));
    commit("Rotar 90\xB0");
  }
  function T_vis(show) {
    bones().forEach((b) => {
      if (show) {
        S.hidden.delete(b);
        (b.cubes || []).forEach((c) => S.hidden.delete(c));
      } else {
        S.hidden.add(b);
      }
    });
    rebuild();
    renderOutliner();
    requestDraw();
  }
  function toFaces(c) {
    const r = faceUVs(c), o = {};
    FACE_NAMES.forEach((fn) => {
      const q = r[fn];
      o[fn] = { uv: [q[0], q[1]], uv_size: [q[2] - q[0], q[3] - q[1]] };
    });
    c.uv = o;
    delete c.mirror;
  }
  const MORE = [
    ["Edici\xF3n", null],
    ["mirror", "Espejo en X (copia)", T_mirror, "Crea una copia reflejada"],
    ["target", "Centrar pivote", T_center, ""],
    ["group", "Agrupar en hueso nuevo", T_group, ""],
    ["cube", "Rotar cubo 90\xB0 (Y)", () => T_rot90("y"), ""],
    ["cube", "Rotar cubo 90\xB0 (X)", () => T_rot90("x"), ""],
    ["cube", "Rotar cubo 90\xB0 (Z)", () => T_rot90("z"), ""],
    ["cube", "Dividir cubo en X", () => T_split(0), ""],
    ["cube", "Dividir cubo en Y", () => T_split(1), ""],
    ["cube", "Dividir cubo en Z", () => T_split(2), ""],
    ["Modelo", null],
    ["ground", "Alinear al suelo", T_ground, ""],
    ["target", "Centrar modelo (X/Z)", T_centerXZ, ""],
    ["ruler", "Ajustar a enteros", T_ints, "Selecci\xF3n"],
    ["scale", "Escalar modelo\u2026", T_scale, ""],
    ["eye", "Mostrar todo", () => T_vis(true), ""],
    ["eyeoff", "Ocultar todo", () => T_vis(false), ""]
  ];
  function openMore(anchor) {
    const pop = $("#morePop");
    if (!pop.hidden) {
      pop.hidden = true;
      return;
    }
    pop.innerHTML = MORE.map((m, i) => m[1] === null ? "<h5>" + m[0] + "</h5>" : '<button data-i="' + i + '">' + ic(m[0]) + "<span>" + m[1] + "</span><small>" + (m[3] || "") + "</small></button>").join("");
    hydrateIcons(pop);
    pop.hidden = false;
    const r = anchor.getBoundingClientRect(), a = $("#app").getBoundingClientRect();
    pop.style.left = isMobile() ? "8px" : r.right - a.left + 6 + "px";
    pop.style.top = isMobile() ? r.bottom - a.top + 6 + "px" : Math.max(50, r.top - a.top - 40) + "px";
  }
  $("#morePop").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $("#morePop").hidden = true;
    MORE[+b.dataset.i][2]();
  });
  $("#moreToolsBtn").onclick = (e) => {
    e.stopPropagation();
    openMore(e.currentTarget);
  };
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#morePop") && !e.target.closest("#moreToolsBtn")) $("#morePop").hidden = true;
  });
  $("#histBtn").onclick = openHistory;
  $("#intBtn").onclick = () => {
    if (FD.openIntegration) FD.openIntegration();
  };
  $("#uvAutoAll").onclick = () => {
    allCubes().forEach((c) => {
      if (Array.isArray(c.uv)) c.uv = null;
    });
    allCubes().forEach((c) => {
      if (c.uv === null) autoUV(c);
    });
    commit("Auto UV");
  };
  $("#uvSnapBtn").onclick = () => {
    allCubes().forEach((c) => {
      if (Array.isArray(c.uv)) c.uv = c.uv.map(Math.round);
      else if (c.uv) FACE_NAMES.forEach((f) => {
        const q = c.uv[f];
        if (q) {
          q.uv = q.uv.map(Math.round);
          q.uv_size = q.uv_size.map(Math.round);
        }
      });
    });
    commit("UV a p\xEDxeles");
  };
  $("#uvFacesBtn").onclick = () => {
    if (!S.sel || !S.sel.cube) return toast("Selecciona un cubo");
    if (!Array.isArray(S.sel.cube.uv)) return toast("Ya usa UV por caras");
    toFaces(S.sel.cube);
    commit("UV por caras");
  };
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea" || e.ctrlKey || e.metaKey) return;
    if (/^[1-4]$/.test(e.key)) {
      setMode(["edit", "uv", "paint", "anim"][+e.key - 1]);
      return;
    }
    if (S.mode === "edit" && S.sel) {
      const st = S.snap || 1, m = { ArrowRight: [st, 0, 0], ArrowLeft: [-st, 0, 0], ArrowUp: [0, 0, -st], ArrowDown: [0, 0, st], PageUp: [0, st, 0], PageDown: [0, -st, 0] }[e.key];
      if (m) {
        e.preventDefault();
        moveSel(m, "Mover con teclas");
      }
    }
  });
  function fdFirstGeo(n) {
    for (const c of n.children || []) {
      if (c.type === "folder") {
        const r = fdFirstGeo(c);
        if (r) return r;
      } else if (/\.geo\.json$/i.test(c.name)) return c;
    }
    return null;
  }
  async function init() {
    hydrateIcons();
    help();
    updUndo();
    initGL();
    try {
      S.project = S.projId ? await idb.get(STORE_DATA, S.projId) : null;
    } catch (e) {
      S.project = null;
    }
    let node = S.project && S.fileId ? findNode(S.fileId, S.project.root) : null;
    if (S.project) {
      try {
        localStorage.setItem("devstudio_active_project", S.project.id);
      } catch (e) {
      }
    }
    if (node && /\.animation\.json$/i.test(node.name)) {
      FD.pendingAnimNode = node;
      node = fdFirstGeo(S.project.root);
    }
    if (!node && S.project) node = fdFirstGeo(S.project.root);
    S.node = node;
    if (!S.node) {
      S.project = null;
      S.node = { name: "ejemplo.geo.json", content: "" };
      $("#saveState").textContent = "Demostraci\xF3n (no se guarda)";
    }
    S.standalone = !!(S.project && S.project.root && S.project.root.kind === "model");
    if (S.standalone) {
      const bk = $("#backBtn");
      bk.href = "/";
      bk.title = "Volver al inicio";
    }
    $("#fileName").textContent = S.node.name;
    S.meta.colors = (S.project && S.project.meta && S.project.meta[S.node.id] || {}).colors || {};
    let root = null;
    const raw = (S.node.content || "").trim();
    if (raw) {
      try {
        root = JSON.parse(raw.replace(/^﻿/, "").replace(/\/\/.*$/gm, ""));
      } catch (e) {
        toast("El JSON del archivo tiene errores; se abri\xF3 un modelo vac\xEDo (no se sobrescribe hasta que guardes).", 4e3);
      }
    }
    if (!root || !parseGeos(root).length) root = emptyRoot("geometry." + S.node.name.replace(/\.(geo\.)?json$/i, "").replace(/[^a-z0-9_]/gi, "_").toLowerCase());
    let recovered = false;
    try {
      const dr = JSON.parse(localStorage.getItem(draftKey()) || "null");
      if (dr && dr.geo) {
        if (dr.geo !== JSON.stringify(root) || dr.x && dr.x.anim) {
          if (confirm("Hay un borrador sin guardar de tu \xFAltima sesi\xF3n (" + new Date(dr.t).toLocaleString() + ").\n\n\xBFRecuperarlo?")) {
            root = JSON.parse(dr.geo);
            FD.draftData = dr;
            recovered = true;
          } else clearDraft();
        }
      }
    } catch (e) {
    }
    S.root = root;
    S.geos = parseGeos(root);
    S.gi = 0;
    readDims();
    applyColors();
    newBlankTex(S.texW, S.texH);
    if (S.project) {
      const g = guessTexture();
      if (g) await useTexNode(g.node);
      else fillTexSel();
    }
    FD.hooks.init.forEach((f) => f());
    rebuild();
    frameModel();
    pushHist("Abrir");
    refreshAll();
    uploadTex();
    if (isMobile()) {
      $("#app").setAttribute("data-sheet", "");
    }
    S.dirty = false;
    if (S.project) {
      $("#saveState").textContent = "Listo";
      $("#saveState").className = "";
    }
    if (recovered) markDirty();
    window.__MODEL = { S, bones, faces: () => faces, project, pick };
  }
  Object.assign(FD, { writeDims, S, M, $, $$, ic, hydrateIcons, toast, modal, esc, round, clamp, num, idb, STORE_DATA, STORE_INDEX, findNode, findParent, allFiles, uid, bones, boneByName, parentOf, childrenOf, descendants, rebuild, requestDraw, refreshAll, refreshProps, commit, pushHist, markDirty, select, boneMatrix, project, pick, setTool, setMode, tex, save, download, FACE_NAMES, G, geoName, renderOutliner, frameModel, uploadTex, loadTexFromData, ensureTexNode, useTexNode, texCandidates, saveDraft, clearDraft, newBoneName, isMobile, allCubes, snapV, fdFirstGeo, getHistLock: () => histLock });
  window.FD = FD;
  window.addEventListener("load", init);
})();

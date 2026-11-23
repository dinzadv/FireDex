(function () {
  const hooks = (window.FD_STRUCT_HOOKS = window.FD_STRUCT_HOOKS || []);
  const T = (s) => (window.FD_I18N ? FD_I18N.t(s) : s);
  const CAP = 120000;
  const TRANS = /glass|leaves|ice$|water|lava|barrier|bars|flower|torch|grass$|fern|vine|sapling|rose|tulip|dandelion|web|rail|ladder|sign|door|fence|pane|portal|candle|button|lever|banner|carpet|slab|stairs|bed$|chest|barrel|skull|head|pot$|lantern|chain|bell|wall|plate|gate|rod|lever|anvil|cauldron|hopper|snow_layer|mushroom|roots|fungus|reeds|bush|orchid|allium|azure|cornflower|daisy|dead|sugar_cane/;
    const FACES = [
    { n: [0, 1, 0], o: [0, 1, 0], u: [1, 0, 0], v: [0, 0, 1], sh: 1 },
    { n: [0, -1, 0], o: [0, 0, 0], u: [1, 0, 0], v: [0, 0, 1], sh: 0.5 },
    { n: [1, 0, 0], o: [1, 1, 1], u: [0, 0, -1], v: [0, -1, 0], sh: 0.78 },
    { n: [-1, 0, 0], o: [0, 1, 0], u: [0, 0, 1], v: [0, -1, 0], sh: 0.78 },
    { n: [0, 0, 1], o: [0, 1, 1], u: [1, 0, 0], v: [0, -1, 0], sh: 0.64 },
    { n: [0, 0, -1], o: [1, 1, 0], u: [-1, 0, 0], v: [0, -1, 0], sh: 0.64 }
  ];
  const cam = { yaw: 0.78, pitch: 0.62, zoom: 1, px: 0, py: 0, mode: "place" };
  const fpts = new Float32Array(CAP * 8), fcell = new Int32Array(CAP * 6);
  let A = null, root = null, cv = null, bar = null, hint = null, nF = 0, raf = 0, on = false, hover = null, note = "";
  const ptrs = new Map();
  let drag = null, pinch = null, M = null;

  const ICO = {
    place: '<path d="M12 5v14M5 12h14"/>',
    remove: '<path d="M5 12h14"/>',
    pick: '<path d="m4 20 4-1 10-10-3-3L5 16l-1 4ZM14 6l3 3"/>',
    cut: '<path d="M4 6h16M4 12h16M4 18h8"/>',
    rot: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
    reset: '<path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/>'
  };
  const ic = (k) => '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' + ICO[k] + "</svg>";

  function matrix() {
    const S = A.S, W = cv.clientWidth || 600, H = cv.clientHeight || 400;
    const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
    const R = 0.5 * Math.sqrt(S.sx * S.sx + S.sy * S.sy + S.sz * S.sz) || 8;
    const s = (Math.min(W, H) / (2 * R)) * 0.92 * cam.zoom;
    M = { W, H, cy, sy, cp, sp, s, cx: S.sx / 2, cyy: S.sy / 2, cz: S.sz / 2, ox: W / 2 + cam.px, oy: H / 2 + cam.py };
    return M;
  }
  function proj(x, y, z, out, o) {
    const dx = x - M.cx, dy = y - M.cyy, dz = z - M.cz;
    const u = dx * M.cy - dz * M.sy, w = dx * M.sy + dz * M.cy;
    out[o] = M.ox + u * M.s;
    out[o + 1] = M.oy - (dy * M.cp + w * M.sp) * M.s;
  }
  const tmp = new Float32Array(2);
  function pt(x, y, z) {
    proj(x, y, z, tmp, 0);
    return [tmp[0], tmp[1]];
  }

  function entryFor(str) {
    const base = A.baseOf(str), e = A.tx(base);
    return { base, e };
  }
  // Textura de una cara concreta (up/down/north/south/east/west) con su tinte ya aplicado
  const DIRN = [[0, 1, 0, "up"], [0, -1, 0, "down"], [1, 0, 0, "east"], [-1, 0, 0, "west"], [0, 0, 1, "south"], [0, 0, -1, "north"]];
  function faceTile(e, fi) {
    if (!e || !e.faces) return e && (e.tile || e.img) || null;
    const f = e.faces[DIRN[fi][3]];
    return f && f.tile || null;
  }
  // Dibuja un paralelogramo texturizado: origen (ox,oy,oz) + u + v en coordenadas de mundo
  function texQuad(g, dpr, o, u, v, img, rect, shade) {
    proj(o[0], o[1], o[2], P2, 0);
    proj(o[0] + u[0], o[1] + u[1], o[2] + u[2], P2, 2);
    proj(o[0] + v[0], o[1] + v[1], o[2] + v[2], P2, 4);
    const ax = P2[2] - P2[0], ay = P2[3] - P2[1], bx = P2[4] - P2[0], by = P2[5] - P2[1];
    g.setTransform(dpr * ax, dpr * ay, dpr * bx, dpr * by, dpr * P2[0], dpr * P2[1]);
    g.drawImage(img, rect[0], rect[1], rect[2], rect[3], -0.012, -0.012, 1.024, 1.024);
    if (shade < 1) {
      g.fillStyle = "rgba(0,0,0," + (1 - shade).toFixed(2) + ")";
      g.fillRect(-0.012, -0.012, 1.024, 1.024);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  const P2 = new Float32Array(8);

  function draw() {
    raf = 0;
    if (!on || !cv || !A || !A.S) return;
    const S = A.S, dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
    }
    const g = cv.getContext("2d");
    matrix();
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#1b2233");
    bg.addColorStop(1, "#10131c");
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    const planeY = S.cut ? S.layer : 0;
    const quad = (pts) => {
      g.beginPath();
      g.moveTo(pts[0], pts[1]);
      for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i], pts[i + 1]);
      g.closePath();
    };
    const gq = [].concat(pt(0, planeY, 0), pt(S.sx, planeY, 0), pt(S.sx, planeY, S.sz), pt(0, planeY, S.sz));
    quad(gq);
    g.fillStyle = "rgba(120,140,200,.10)";
    g.fill();

    const y1 = S.cut ? Math.min(S.layer, S.sy - 1) : S.sy - 1;
    let y0 = 0;
    const b = A.bbox();
    note = "";
    if (b) {
      const vol = (b.x1 - b.x0 + 1) * (b.z1 - b.z0 + 1) * (Math.min(y1, b.y1) - Math.max(0, b.y0) + 1);
      if (vol > 2500000) {
        y0 = Math.max(0, y1 - 5);
        note = T("Big structure: showing a few layers. Move the layer slider.");
      }
    }
    const x0 = b ? b.x0 : 0, x1 = b ? b.x1 : S.sx - 1, z0 = b ? b.z0 : 0, z1 = b ? b.z1 : S.sz - 1;
    if (b) y0 = Math.max(y0, b.y0);
    const gridA = S.grid, sy = S.sy, sz = S.sz;
    const opq = new Uint8Array(S.pal.length), col = [], colS = [], info = [], mods = [], ctxN = [];
    S.pal.forEach((str, i) => {
      if (!i) return;
      const base = A.baseOf(str);
      opq[i] = TRANS.test(base) ? 0 : 1;
      const en = entryFor(str);
      info[i] = en;
      col[i] = A.rgbOf(base);
      colS[i] = A.rgbSide ? A.rgbSide(base) : col[i];
      mods[i] = window.FD_MC ? FD_MC.model(base, str) : null;
      ctxN[i] = window.FD_MC && FD_MC.needsCtx ? FD_MC.needsCtx(base) : false;
    });
    const gx = M.sy * M.cp, gy = -M.sp, gz = M.cy * M.cp;
    const xs = [], ys = [], zs = [];
    for (let x = x0; x <= x1; x++) xs.push(x);
    for (let y = y0; y <= Math.min(y1, b ? b.y1 : y1); y++) ys.push(y);
    for (let z = z0; z <= z1; z++) zs.push(z);
    if (gx > 0) xs.reverse();
    if (gy > 0) ys.reverse();
    if (gz > 0) zs.reverse();
    const vis = FACES.map((f) => f.n[0] * gx + f.n[1] * gy + f.n[2] * gz < 0);
    const s = M.s, flat = s < 3.2, margin = s * 2;
    nF = 0;
    g.imageSmoothingEnabled = false;
    const cell = (x, y, z) => (x < 0 || y < 0 || z < 0 || x >= S.sx || y >= sy || z >= sz ? 0 : gridA[(x * sy + y) * sz + z]);
    const P = new Float32Array(16);
    for (let ix = 0; ix < xs.length; ix++) {
      const x = xs[ix];
      for (let iy = 0; iy < ys.length; iy++) {
        const y = ys[iy];
        for (let iz = 0; iz < zs.length; iz++) {
          const z = zs[iz], id = gridA[(x * sy + y) * sz + z];
          if (!id) continue;
          proj(x + 0.5, y + 0.5, z + 0.5, tmp, 0);
          if (tmp[0] < -margin || tmp[0] > W + margin || tmp[1] < -margin || tmp[1] > H + margin) continue;
          const en = info[id];
          let mod = !flat ? mods[id] : null;
          if (!flat && ctxN[id]) {
            const nbf = (dx, dy, dz) => {
              const c2 = cell(x + dx, y + dy, z + dz);
              return c2 ? S.pal[c2] : "";
            };
            mod = FD_MC.model(A.baseOf(S.pal[id]), S.pal[id], nbf);
          }
          const c = col[id] || [128, 128, 128], cs = colS[id] || c;
          if (mod) {
            const ob = [x, y, z];
            if (mod.quads) mod.quads.forEach((q) => texQuad(g, dpr, [x + q.o[0], y + q.o[1], z + q.o[2]], q.u, q.v, q.img, q.rect, 1));
            mod.faces.forEach((f) => {
              if (f.n[0] * gx + f.n[1] * gy + f.n[2] * gz >= 0) return;
              if (f.edge && opq[cell(x + f.n[0], y + f.n[1], z + f.n[2])]) return;
              texQuad(g, dpr, [x + f.o[0], y + f.o[1], z + f.o[2]], f.u, f.v, f.img, f.rect, f.shade);
            });
            void ob;
          }
          for (let fi = 0; fi < 6; fi++) {
            if (!vis[fi]) continue;
            const f = FACES[fi], nx = x + f.n[0], ny = y + f.n[1], nz = z + f.n[2];
            const nb = ny > y1 ? 0 : cell(nx, ny, nz);
            if (nb && opq[nb]) continue;
            if (nb === id && !opq[id]) continue;
            const ox = x + f.o[0], oy = y + f.o[1], oz = z + f.o[2];
            proj(ox, oy, oz, P, 0);
            proj(ox + f.u[0], oy + f.u[1], oz + f.u[2], P, 2);
            proj(ox + f.u[0] + f.v[0], oy + f.u[1] + f.v[1], oz + f.u[2] + f.v[2], P, 4);
            proj(ox + f.v[0], oy + f.v[1], oz + f.v[2], P, 6);
            if (nF < CAP) {
              const k = nF * 8;
              for (let q = 0; q < 8; q++) fpts[k + q] = P[q];
              const m = nF * 6;
              fcell[m] = x;
              fcell[m + 1] = y;
              fcell[m + 2] = z;
              fcell[m + 3] = f.n[0];
              fcell[m + 4] = f.n[1];
              fcell[m + 5] = f.n[2];
              nF++;
            }
            if (mod) continue;
            const tile = !flat && en ? faceTile(en.e, fi) : null;
            if (tile) {
              const ax = P[2] - P[0], ay = P[3] - P[1], bx = P[6] - P[0], by = P[7] - P[1];
              g.setTransform(dpr * ax, dpr * ay, dpr * bx, dpr * by, dpr * P[0], dpr * P[1]);
              const tw = tile.width || Math.min(tile.naturalWidth, tile.naturalHeight);
              g.drawImage(tile, 0, 0, tw, tw, -0.012, -0.012, 1.024, 1.024);
              if (f.sh < 1) {
                g.fillStyle = "rgba(0,0,0," + (1 - f.sh).toFixed(2) + ")";
                g.fillRect(-0.012, -0.012, 1.024, 1.024);
              }
              g.setTransform(dpr, 0, 0, dpr, 0, 0);
            } else {
              const cc = fi < 2 ? c : cs;
              g.fillStyle = "rgb(" + ((cc[0] * f.sh) | 0) + "," + ((cc[1] * f.sh) | 0) + "," + ((cc[2] * f.sh) | 0) + ")";
              g.beginPath();
              g.moveTo(P[0], P[1]);
              g.lineTo(P[2], P[3]);
              g.lineTo(P[4], P[5]);
              g.lineTo(P[6], P[7]);
              g.closePath();
              g.fill();
              if (s > 6) {
                g.strokeStyle = "rgba(0,0,0,.25)";
                g.lineWidth = 1;
                g.stroke();
              }
            }
          }
        }
      }
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.strokeStyle = "rgba(160,180,255,.22)";
    g.lineWidth = 1;
    const step = Math.max(1, Math.ceil(10 / Math.max(s, 0.01)));
    g.beginPath();
    for (let i = 0; i <= S.sx; i += step) {
      const a = pt(i, planeY, 0), c2 = pt(i, planeY, S.sz);
      g.moveTo(a[0], a[1]);
      g.lineTo(c2[0], c2[1]);
    }
    for (let i = 0; i <= S.sz; i += step) {
      const a = pt(0, planeY, i), c2 = pt(S.sx, planeY, i);
      g.moveTo(a[0], a[1]);
      g.lineTo(c2[0], c2[1]);
    }
    g.stroke();
    quad(gq);
    g.strokeStyle = "rgba(133,119,248,.9)";
    g.lineWidth = 1.5;
    g.stroke();
    if (hover) {
      g.strokeStyle = "#fff";
      g.lineWidth = 2;
      if (hover.face !== void 0) {
        const k = hover.face * 8;
        g.beginPath();
        g.moveTo(fpts[k], fpts[k + 1]);
        g.lineTo(fpts[k + 2], fpts[k + 3]);
        g.lineTo(fpts[k + 4], fpts[k + 5]);
        g.lineTo(fpts[k + 6], fpts[k + 7]);
        g.closePath();
        g.stroke();
      } else if (hover.ground) {
        const hq = [].concat(pt(hover.x, planeY, hover.z), pt(hover.x + 1, planeY, hover.z), pt(hover.x + 1, planeY, hover.z + 1), pt(hover.x, planeY, hover.z + 1));
        quad(hq);
        g.stroke();
      }
    }
    {
      const P = (x, y, z) => {
        const r = pt(x, y, z);
        return [r[0], r[1]];
      };
      const edges = (x0, y0, z0, x1, y1, z1, col, dash) => {
        const c = [];
        for (let i = 0; i < 8; i++) c.push(P(i & 1 ? x1 + 1 : x0, i & 2 ? y1 + 1 : y0, i & 4 ? z1 + 1 : z0));
        g.save();
        g.strokeStyle = col;
        g.lineWidth = 2;
        g.setLineDash(dash || []);
        g.beginPath();
        [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([p, q]) => {
          g.moveTo(c[p][0], c[p][1]);
          g.lineTo(c[q][0], c[q][1]);
        });
        g.stroke();
        g.restore();
      };
      if (S.sel && edit()) {
        const b = A.selBox();
        edges(b.x0, b.y0, b.z0, b.x1, b.y1, b.z1, "#ffd54a");
      }
      if (cam.mode === "paste" && S.clip && hover) {
        const t = target(hover);
        edges(t[0], t[1], t[2], t[0] + S.clip.w - 1, t[1] + S.clip.h - 1, t[2] + S.clip.d - 1, "#4dd0ff", [6, 4]);
      }
      if (cam.mode === "select") note = T("Tap two corners to select a box");
      else if (cam.mode === "paste") note = T("Tap where to paste");
    }
    if (hint) hint.textContent = note;
  }
  function redraw() {
    if (!on || raf) return;
    raf = requestAnimationFrame(draw);
  }

  function inQuad(px, py, k) {
    let sg = 0;
    for (let i = 0; i < 4; i++) {
      const ax = fpts[k + i * 2], ay = fpts[k + i * 2 + 1], bx = fpts[k + ((i + 1) % 4) * 2], by = fpts[k + ((i + 1) % 4) * 2 + 1];
      const cr = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
      if (cr === 0) continue;
      const s = cr > 0 ? 1 : -1;
      if (sg && s !== sg) return false;
      sg = s;
    }
    return true;
  }
  function pick(px, py) {
    for (let i = nF - 1; i >= 0; i--) if (inQuad(px, py, i * 8)) return { face: i, x: fcell[i * 6], y: fcell[i * 6 + 1], z: fcell[i * 6 + 2], n: [fcell[i * 6 + 3], fcell[i * 6 + 4], fcell[i * 6 + 5]] };
    const S = A.S;
    if (M.sp < 0.06) return null;
    const planeY = S.cut ? S.layer : 0, u = (px - M.ox) / M.s, dy = planeY - M.cyy;
    const w = (-(py - M.oy) / M.s - dy * M.cp) / M.sp;
    const dx = u * M.cy + w * M.sy, dz = -u * M.sy + w * M.cy;
    const x = Math.floor(dx + M.cx), z = Math.floor(dz + M.cz);
    if (x < 0 || z < 0 || x >= S.sx || z >= S.sz) return null;
    return { ground: true, x, y: planeY, z };
  }
  let selAnchor = null;
  const edit = () => window.FD_STRUCT_EDIT;
  function target(h) {
    let x = h.x, y = h.y, z = h.z;
    if (!h.ground) {
      x += h.n[0];
      y += h.n[1];
      z += h.n[2];
    }
    return [x, y, z];
  }
  function act(h) {
    const S = A.S;
    if (!h) return;
    if (cam.mode === "pick") {
      if (h.ground) return;
      const v = S.grid[A.gi(h.x, h.y, h.z)];
      if (v) A.setCur(S.pal[v]);
      return;
    }
    if (cam.mode === "remove") {
      if (h.ground) return;
      A.beginOp();
      A.setB(h.x, h.y, h.z, 0);
      A.endOp();
      A.afterEdit();
      return;
    }
    if (cam.mode === "select") {
      const c = h.ground ? [h.x, h.y, h.z] : [h.x, h.y, h.z];
      if (!selAnchor || !S.sel) {
        selAnchor = c;
        edit().setSel({ x0: c[0], x1: c[0], y0: c[1], y1: c[1], z0: c[2], z1: c[2] });
      } else {
        const a = selAnchor;
        selAnchor = null;
        edit().setSel({ x0: Math.min(a[0], c[0]), x1: Math.max(a[0], c[0]), y0: Math.min(a[1], c[1]), y1: Math.max(a[1], c[1]), z0: Math.min(a[2], c[2]), z1: Math.max(a[2], c[2]) });
      }
      return;
    }
    let [x, y, z] = target(h);
    if (cam.mode === "paste") {
      if (!S.clip) {
        A.toast(T("Nothing copied yet"));
        return;
      }
      A.pasteAt(x, z, y);
      A.afterEdit();
      return;
    }
    if (!A.inb(x, y, z)) {
      S.expShift = [0, 0, 0];
      if (!A.expandFor(x, y, z)) {
        A.toast(T("Outside the structure size"));
        return;
      }
      const sh = S.expShift || [0, 0, 0];
      x += sh[0];
      y += sh[1];
      z += sh[2];
    }
    if (S.grid[A.gi(x, y, z)]) return;
    S.placeCtx = { n: h.ground ? [0, 1, 0] : h.n, yaw: cam.yaw };
    A.beginOp();
    A.place(x, y, z, A.palIdx(S.cur));
    A.endOp();
    S.placeCtx = null;
    A.afterEdit();
  }

  function local(e) {
    const r = cv.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  function bind() {
    cv.addEventListener("contextmenu", (e) => e.preventDefault());
    cv.addEventListener("pointerdown", (e) => {
      cv.setPointerCapture(e.pointerId);
      const [x, y] = local(e);
      ptrs.set(e.pointerId, { x, y });
      if (ptrs.size === 1) drag = { x0: x, y0: y, moved: false, t: Date.now(), pan: e.button === 2 || e.shiftKey || e.button === 1, type: e.pointerType };
      if (ptrs.size === 2) {
        const p = Array.from(ptrs.values());
        pinch = { d: Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y), mx: (p[0].x + p[1].x) / 2, my: (p[0].y + p[1].y) / 2 };
        if (drag) drag.moved = true;
      }
    });
    cv.addEventListener("pointermove", (e) => {
      const [x, y] = local(e), p = ptrs.get(e.pointerId);
      if (!p) {
        if (e.pointerType === "mouse") {
          matrix();
          const h = pick(x, y);
          const key = h ? (h.ground ? "g" + h.x + "," + h.z : "f" + h.face) : "";
          if (key !== (hover && hover.key)) {
            hover = h ? Object.assign({ key }, h) : null;
            redraw();
          }
        }
        return;
      }
      const dx = x - p.x, dy = y - p.y;
      p.x = x;
      p.y = y;
      if (ptrs.size === 2 && pinch) {
        const a = Array.from(ptrs.values()), d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
        cam.zoom = Math.max(0.15, Math.min(60, cam.zoom * (d / (pinch.d || d))));
        cam.px += mx - pinch.mx;
        cam.py += my - pinch.my;
        pinch = { d, mx, my };
        hover = null;
        redraw();
        return;
      }
      if (!drag) return;
      if (!drag.moved && Math.hypot(x - drag.x0, y - drag.y0) > 6) drag.moved = true;
      if (drag.moved) {
        if (drag.pan) {
          cam.px += dx;
          cam.py += dy;
        } else {
          cam.yaw += dx * 0.008;
          cam.pitch = Math.max(0.08, Math.min(1.5, cam.pitch + dy * 0.008));
        }
        hover = null;
        redraw();
      }
    });
    const up = (e) => {
      const had = ptrs.has(e.pointerId), [x, y] = local(e);
      ptrs.delete(e.pointerId);
      if (!had) return;
      if (ptrs.size < 2) pinch = null;
      if (drag && !drag.moved && ptrs.size === 0 && Date.now() - drag.t < 600 && e.type === "pointerup" && !drag.pan) {
        matrix();
        act(pick(x, y));
      }
      if (ptrs.size === 0) drag = null;
    };
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", (e) => {
      e.preventDefault();
      cam.zoom = Math.max(0.15, Math.min(60, cam.zoom * Math.exp(-e.deltaY * 0.0015)));
      redraw();
    }, { passive: false });
    if (window.ResizeObserver) new ResizeObserver(redraw).observe(cv.parentElement);
  }

  function mkBar() {
    hint = document.createElement("div");
    hint.className = "s3-hint";
    cv.parentElement.appendChild(hint);
  }

  function show(v) {
    on = !!v;
    if (on) {
      hover = null;
      redraw();
    }
  }

  hooks.push((api) => {
    A = api;
    root = api.root;
    const view = root.querySelector("#stView");
    cv = document.createElement("canvas");
    cv.id = "st3";
    view.insertBefore(cv, view.firstChild);
    ptrs.clear();
    drag = pinch = hover = null;
    bind();
    mkBar();
    on = !!api.S.mode3;
    if (on) redraw();
  });
  window.FD_S3 = { redraw, show, cam, setMode: (m) => { cam.mode = m; },  get hits() { return nF; } };
})();

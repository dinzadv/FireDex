/* FireDex · edición avanzada de estructuras
 *  - orient(): orienta solo puertas, antorchas, cofres, camas, escaleras de mano, botones, troncos…
 *  - operaciones sobre la selección: mover, copiar/pegar, duplicar, rotar, reflejar, rellenar, borrar
 *  - duplicar la estructura completa */
(function () {
  "use strict";
  const T = (s) => (window.FD_I18N ? FD_I18N.t(s) : s);
  const A = () => window.FD_STRUCT_API;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  if (window.FD_I18N) FD_I18N.add([
    ["Auto-orient", "Orientar solo"],
    ["Select", "Seleccionar"], ["Paste", "Pegar"], ["Move", "Mover"], ["Copy", "Copiar"], ["Cut", "Cortar"],
    ["Duplicate", "Duplicar"], ["Rotate", "Girar"], ["Mirror", "Reflejar"], ["Delete", "Borrar"], ["Fill", "Rellenar"],
    ["Select all", "Todo"], ["Deselect", "Quitar"], ["View", "Vista"], ["Camera", "Cámara"],
    ["Height", "Alto"], ["Taller", "Más alto"], ["Shorter", "Más bajo"],
    ["Edit", "Editar"], ["Tools", "Herramientas"],
    ["Selection: {0}×{1}×{2}", "Selección: {0}×{1}×{2}"],
    ["Tap two corners to select a box", "Toca dos esquinas para seleccionar una caja"],
    ["Tap where to paste", "Toca dónde pegar"],
    ["Nothing selected", "Nada seleccionado"],
    ["Select something first", "Selecciona algo primero"],
    ["Nothing copied yet", "Aún no hay nada copiado"],
    ["Copied", "Copiado"],
    ["Moved", "Movido"],
    ["Step", "Paso"],
    ["Duplicate…", "Duplicar…"],
    ["Direction", "Dirección"],
    ["Copies", "Copias"],
    ["Gap between copies", "Separación entre copias"],
    ["East (+X)", "Este (+X)"], ["West (−X)", "Oeste (−X)"], ["South (+Z)", "Sur (+Z)"], ["North (−Z)", "Norte (−Z)"], ["Up (+Y)", "Arriba (+Y)"], ["Down (−Y)", "Abajo (−Y)"],
    ["Duplicated ×{0}", "Duplicado ×{0}"],
    ["Duplicate whole structure…", "Duplicar toda la estructura…"],
    ["Cancel", "Cancelar"],
    ["Too big: the structure would exceed the size limit.", "Demasiado grande: la estructura superaría el límite de tamaño."],
    ["Close", "Cerrar"],
    ["North", "Norte"], ["South", "Sur"], ["East", "Este"], ["West", "Oeste"]
  ]);

  // ---------- estados ----------
  function parse(str) {
    const m = /^([^\[]*)(?:\[(.*)\])?\s*$/.exec(str || "");
    const o = [];
    if (m && m[2]) m[2].split(",").forEach((p) => {
      const i = p.indexOf("=");
      if (i > 0) o.push([p.slice(0, i), p.slice(i + 1)]);
    });
    return { base: m ? m[1] : str, st: o };
  }
  function setState(str, key, val) {
    const p = parse(str);
    const e = p.st.find((q) => q[0] === key);
    if (e) e[1] = String(val);
    else p.st.push([key, String(val)]);
    return p.base + "[" + p.st.map((q) => q[0] + "=" + q[1]).join(",") + "]";
  }
  const getState = (str, key) => {
    const e = parse(str).st.find((q) => q[0] === key || q[0] === "minecraft:" + key || "minecraft:" + q[0] === key);
    return e ? e[1] : void 0;
  };

  // ---------- geometría ----------
  const DIR = { east: [1, 0], west: [-1, 0], south: [0, 1], north: [0, -1] };
  const OPP = { east: "west", west: "east", south: "north", north: "south" };
  const dname = (dx, dz) => (Math.abs(dx) > Math.abs(dz) ? (dx > 0 ? "east" : "west") : dz > 0 ? "south" : "north");
  function toward(ctx) {
    const yaw = ctx && typeof ctx.yaw === "number" ? ctx.yaw : Math.PI;
    return dname(-Math.sin(yaw), -Math.cos(yaw));
  }
  function solidAt(x, y, z) {
    const a = A(), S = a.S;
    if (!a.inb(x, y, z)) return false;
    const v = S.grid[a.gi(x, y, z)];
    if (!v) return false;
    const mc = window.FD_MC;
    if (!mc) return true;
    return mc.shapeOf(a.shortName(a.baseOf(S.pal[v]))) === "cube";
  }
  const solidDir = (x, y, z, n) => solidAt(x + DIR[n][0], y, z + DIR[n][1]);
  const normName = (n) => (n && n[1] === 0 && (n[0] || n[2]) ? dname(n[0], n[2]) : null);

  // ---------- orientación automática ----------
  function orient(str, x, y, z, ctx) {
    const a = A();
    if (!a || !str) return str;
    const id = a.shortName(a.baseOf(str));
    const sch = a.D.schemaFor("minecraft:" + id);
    if (!sch) return str;
    const keys = sch.map((s) => s.k), n = ctx && ctx.n, side = normName(n), tw = toward(ctx);
    const has = (k) => keys.indexOf(k) >= 0;
    // antorchas
    if (has("torch_facing_direction")) {
      if (side) return setState(str, "torch_facing_direction", side);
      if (solidAt(x, y - 1, z)) return setState(str, "torch_facing_direction", "top");
      const w = ["north", "east", "south", "west"].find((d) => solidDir(x, y, z, d));
      return setState(str, "torch_facing_direction", w ? OPP[w] : "top");
    }
    // puertas
    if (has("door_hinge_bit")) {
      const sx = solidAt(x - 1, y, z) && solidAt(x + 1, y, z), sz = solidAt(x, y, z - 1) && solidAt(x, y, z + 1);
      const edge = { east: 2, west: 0, south: 3, north: 1 };
      let dir;
      if (sx && !sz) dir = tw === "north" ? 1 : 3;
      else if (sz && !sx) dir = tw === "west" ? 0 : 2;
      else dir = edge[tw];
      return setState(str, "direction", dir);
    }
    // trampillas
    if (has("upside_down_bit") && has("open_bit")) {
      if (side) return setState(setState(str, "direction", { east: 1, west: 0, south: 3, north: 2 }[side]), "upside_down_bit", false);
      if (n && n[1] === -1) return setState(str, "upside_down_bit", true);
      return str;
    }
    // portones
    if (has("in_wall_bit")) {
      const alongX = solidAt(x - 1, y, z) || solidAt(x + 1, y, z) ? !(solidAt(x, y, z - 1) || solidAt(x, y, z + 1)) : tw === "north" || tw === "south";
      return setState(str, "direction", alongX ? 0 : 1);
    }
    // camas
    if (has("head_piece_bit")) {
      const away = OPP[tw];
      return setState(str, "direction", ["south", "west", "north", "east"].indexOf(away));
    }
    // cofres, hornos, yunques…
    if (has("minecraft:cardinal_direction")) {
      const w = ["north", "east", "south", "west"].filter((d) => solidDir(x, y, z, d));
      const f = w.length === 1 ? OPP[w[0]] : tw;
      return setState(str, "minecraft:cardinal_direction", f);
    }
    // escaleras de mano, carteles
    if (has("facing_direction") && !sch[0].o.includes("up")) {
      if (side) return setState(str, "facing_direction", side);
      const w = ["north", "east", "south", "west"].find((d) => solidDir(x, y, z, d));
      return setState(str, "facing_direction", w ? OPP[w] : tw);
    }
    // botones, barriles, pistones…
    if (has("facing_direction")) {
      if (n) return setState(str, "facing_direction", n[1] === 1 ? "up" : n[1] === -1 ? "down" : side);
      if (/glazed_terracotta$/.test(id)) return setState(str, "facing_direction", tw);
      return str;
    }
    if (has("pillar_axis")) {
      if (n) return setState(str, "pillar_axis", n[0] ? "x" : n[2] ? "z" : "y");
      return str;
    }
    if (has("minecraft:vertical_half")) {
      if (n && n[1] === -1) return setState(str, "minecraft:vertical_half", "top");
      return str;
    }
    if (has("hanging")) {
      if (solidAt(x, y + 1, z) && !solidAt(x, y - 1, z)) return setState(str, "hanging", true);
      return str;
    }
    if (has("lever_direction")) {
      if (side) return setState(str, "lever_direction", side);
      if (n && n[1] === -1) return setState(str, "lever_direction", "down_north_south");
      return str;
    }
    return str;
  }
  const BV = [[0, 1], [-1, 0], [0, -1], [1, 0]];
  function bedHead(s, x, y, z) {
    const d = parseInt(getState(s, "direction"), 10) || 0;
    return [x + BV[d & 3][0], y, z + BV[d & 3][1]];
  }
  function bedPartner(s, x, y, z) {
    const d = (parseInt(getState(s, "direction"), 10) || 0) & 3, head = getState(s, "head_piece_bit") === "true";
    return head ? [x - BV[d][0], y, z - BV[d][1]] : [x + BV[d][0], y, z + BV[d][1]];
  }

  // ---------- selección ----------
  function box() {
    const a = A();
    return a.S.sel ? a.selBox() : null;
  }
  function setSel(b) {
    const S = A().S;
    S.sel = { x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, y0: b.y0, y1: b.y1 };
    refresh();
  }
  function selectAll() {
    const a = A(), b = a.bbox();
    if (!b) return;
    setSel(b);
  }
  function clearSel() {
    A().S.sel = null;
    refresh();
  }
  function refresh() {
    const a = A();
    a.reqDraw();
    if (a.renderOpts) a.renderOpts();
    if (window.FD_S3) FD_S3.redraw();
    syncDock();
  }
  function read(b) {
    const a = A(), S = a.S, w = b.x1 - b.x0 + 1, h = b.y1 - b.y0 + 1, d = b.z1 - b.z0 + 1, cells = new Uint16Array(w * h * d), ch = new Map(), beds = new Map();
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) {
      cells[(x * h + y) * d + z] = S.grid[a.gi(b.x0 + x, b.y0 + y, b.z0 + z)];
      const k = b.x0 + x + "," + (b.y0 + y) + "," + (b.z0 + z);
      if (S.chests.has(k)) ch.set(x + "," + y + "," + z, JSON.parse(JSON.stringify(S.chests.get(k))));
      if (S.beds && S.beds.has(k)) beds.set(x + "," + y + "," + z, S.beds.get(k));
    }
    return { w, h, d, cells, ch, beds };
  }
  // ¿cabe? Amplía si hace falta. Devuelve el desplazamiento que sufrieron las coordenadas.
  function fit(minX, minY, minZ, maxX, maxY, maxZ) {
    const a = A();
    a.S.expShift = [0, 0, 0];
    if (!a.expandFor(minX, minY, minZ)) return null;
    const s1 = (a.S.expShift || [0, 0, 0]).slice();
    a.S.expShift = [0, 0, 0];
    if (!a.expandFor(maxX + s1[0], maxY + s1[1], maxZ + s1[2])) return null;
    const s2 = a.S.expShift || [0, 0, 0];
    return [s1[0] + s2[0], s1[1] + s2[1], s1[2] + s2[2]];
  }
  function write(src, X, Y, Z, withAir) {
    const a = A(), S = a.S;
    for (let x = 0; x < src.w; x++) for (let y = 0; y < src.h; y++) for (let z = 0; z < src.d; z++) {
      const v = src.cells[(x * src.h + y) * src.d + z];
      if (!v && !withAir) continue;
      if (!a.inb(X + x, Y + y, Z + z)) continue;
      a.setB(X + x, Y + y, Z + z, v);
      const k = X + x + "," + (Y + y) + "," + (Z + z), c = src.ch.get(x + "," + y + "," + z);
      if (c && S.chests.has(k)) S.chests.set(k, JSON.parse(JSON.stringify(c)));
      if (v && src.beds.has(x + "," + y + "," + z)) {
        S.beds = S.beds || new Map();
        S.beds.set(k, src.beds.get(x + "," + y + "," + z));
      }
    }
  }
  function clearBox(b) {
    const a = A();
    for (let x = b.x0; x <= b.x1; x++) for (let y = b.y0; y <= b.y1; y++) for (let z = b.z0; z <= b.z1; z++) a.setB(x, y, z, 0);
  }
  function commit() {
    const a = A();
    a.afterEdit ? a.afterEdit() : a.changed();
    refresh();
  }

  function moveSel(dx, dy, dz, copy) {
    const a = A(), b = box();
    if (!b) return a.toast(T("Select something first"));
    const sh = fit(b.x0 + dx, b.y0 + dy, b.z0 + dz, b.x1 + dx, b.y1 + dy, b.z1 + dz);
    if (!sh) return a.toast(T("Too big: the structure would exceed the size limit."));
    const nb = { x0: b.x0 + sh[0], x1: b.x1 + sh[0], y0: b.y0 + sh[1], y1: b.y1 + sh[1], z0: b.z0 + sh[2], z1: b.z1 + sh[2] };
    const src = read(nb);
    a.beginOp();
    if (!copy) clearBox(nb);
    write(src, nb.x0 + dx, nb.y0 + dy, nb.z0 + dz, false);
    a.endOp();
    setSel({ x0: nb.x0 + dx, x1: nb.x1 + dx, y0: nb.y0 + dy, y1: nb.y1 + dy, z0: nb.z0 + dz, z1: nb.z1 + dz });
    commit();
  }
  function transformSel(o) {
    const a = A(), S = a.S, b = box();
    if (!b) return a.toast(T("Select something first"));
    const src = read(b), r = a.xfArray(src.cells, src.w, src.h, src.d, o);
    const sh = fit(b.x0, b.y0, b.z0, b.x0 + r.w - 1, b.y0 + r.h - 1, b.z0 + r.d - 1);
    if (!sh) return a.toast(T("Too big: the structure would exceed the size limit."));
    const ob = { x0: b.x0 + sh[0], x1: b.x1 + sh[0], y0: b.y0 + sh[1], y1: b.y1 + sh[1], z0: b.z0 + sh[2], z1: b.z1 + sh[2] };
    const ch = new Map(), beds = new Map();
    src.ch.forEach((v, k) => {
      const [x, y, z] = k.split(",").map(Number);
      ch.set(r.map(x, y, z).join(","), v);
    });
    src.beds.forEach((v, k) => {
      const [x, y, z] = k.split(",").map(Number);
      beds.set(r.map(x, y, z).join(","), v);
    });
    a.beginOp();
    clearBox(ob);
    write({ w: r.w, h: r.h, d: r.d, cells: r.dst, ch, beds }, ob.x0, ob.y0, ob.z0, false);
    a.endOp();
    setSel({ x0: ob.x0, x1: ob.x0 + r.w - 1, y0: ob.y0, y1: ob.y0 + r.h - 1, z0: ob.z0, z1: ob.z0 + r.d - 1 });
    commit();
  }
  function duplicate(axis, sign, count, gap) {
    const a = A(), b = box();
    if (!b) return a.toast(T("Select something first"));
    const size = { x: b.x1 - b.x0 + 1, y: b.y1 - b.y0 + 1, z: b.z1 - b.z0 + 1 }[axis], step = (size + gap) * sign, last = step * count;
    const d = { x: axis === "x" ? last : 0, y: axis === "y" ? last : 0, z: axis === "z" ? last : 0 };
    const sh = fit(Math.min(b.x0, b.x0 + d.x), Math.min(b.y0, b.y0 + d.y), Math.min(b.z0, b.z0 + d.z), Math.max(b.x1, b.x1 + d.x), Math.max(b.y1, b.y1 + d.y), Math.max(b.z1, b.z1 + d.z));
    if (!sh) return a.toast(T("Too big: the structure would exceed the size limit."));
    const nb = { x0: b.x0 + sh[0], x1: b.x1 + sh[0], y0: b.y0 + sh[1], y1: b.y1 + sh[1], z0: b.z0 + sh[2], z1: b.z1 + sh[2] };
    const src = read(nb);
    a.beginOp();
    for (let i = 1; i <= count; i++) write(src, nb.x0 + (axis === "x" ? step * i : 0), nb.y0 + (axis === "y" ? step * i : 0), nb.z0 + (axis === "z" ? step * i : 0), false);
    a.endOp();
    setSel(nb);
    commit();
    a.toast(T("Duplicated ×{0}").replace("{0}", count));
  }
  function copy() {
    const a = A();
    if (!a.S.sel) return a.toast(T("Select something first"));
    a.copySel();
    a.toast(T("Copied"));
    syncDock();
  }
  function cut() {
    const a = A();
    if (!a.S.sel) return a.toast(T("Select something first"));
    a.copySel();
    a.beginOp();
    clearBox(box());
    a.endOp();
    commit();
  }
  function del() {
    const a = A();
    if (!a.S.sel) return a.toast(T("Select something first"));
    a.beginOp();
    clearBox(box());
    a.endOp();
    commit();
  }
  function fillSel() {
    const a = A(), b = box();
    if (!b) return a.toast(T("Select something first"));
    if (a.D.isTall(a.S.cur)) return;
    const v = a.palIdx(a.S.cur);
    a.beginOp();
    for (let x = b.x0; x <= b.x1; x++) for (let y = b.y0; y <= b.y1; y++) for (let z = b.z0; z <= b.z1; z++) a.setB(x, y, z, v);
    a.endOp();
    commit();
  }
  function rotateAny(o) {
    const a = A(), m = window.FD_S3 && FD_S3.cam.mode;
    if (m === "paste" && a.S.clip) {
      a.xfClip(o);
      refresh();
    } else transformSel(o);
  }

  // ---------- panel de mover ----------
  let pad = null;
  function togglePad(show) {
    const a = A(), view = a.root.querySelector("#stView");
    if (pad) {
      pad.remove();
      pad = null;
      if (show !== true) return syncDock();
    }
    if (show === false) return syncDock();
    if (!a.S.sel) return a.toast(T("Select something first"));
    pad = document.createElement("div");
    pad.className = "se-pad";
    const arrow = (d, t) => `<button data-d="${d}" title="${t}">${{ n: "▲", s: "▼", e: "▶", w: "◀", u: "⤒", dn: "⤓" }[d]}<small>${{ n: "N", s: "S", e: "E", w: "W", u: "+Y", dn: "−Y" }[d]}</small></button>`;
    pad.innerHTML = `<div class="se-ph"><b>${T("Move")}</b><label>${T("Step")} <input type="number" id="seStep" min="1" max="64" value="1"></label><button class="se-x" data-d="x" aria-label="${T("Close")}">✕</button></div>
<div class="se-pg">${arrow("u", T("Up (+Y)"))}${arrow("n", T("North (−Z)"))}${arrow("dn", T("Down (−Y)"))}${arrow("w", T("West (−X)"))}${arrow("s", T("South (+Z)"))}${arrow("e", T("East (+X)"))}</div>`;
    view.appendChild(pad);
    pad.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-d]");
      if (!b) return;
      const st = clamp(parseInt(pad.querySelector("#seStep").value, 10) || 1, 1, 64), d = b.dataset.d;
      if (d === "x") return togglePad(false);
      const v = { n: [0, 0, -1], s: [0, 0, 1], e: [1, 0, 0], w: [-1, 0, 0], u: [0, 1, 0], dn: [0, -1, 0] }[d];
      moveSel(v[0] * st, v[1] * st, v[2] * st, false);
    });
    syncDock();
  }

  // ---------- duplicar ----------
  function duplicateDialog() {
    const a = A();
    if (!a.S.sel) return a.toast(T("Select something first"));
    const opts = [["x", 1, "East (+X)"], ["x", -1, "West (−X)"], ["z", 1, "South (+Z)"], ["z", -1, "North (−Z)"], ["y", 1, "Up (+Y)"], ["y", -1, "Down (−Y)"]];
    const pop = a.popDialog(`<div class="st-dh"><b>${T("Duplicate…")}</b></div>
<div class="se-dlg"><div class="se-dir">${opts.map((o, i) => `<button data-i="${i}" class="${i === 0 ? "on" : ""}">${T(o[2])}</button>`).join("")}</div>
<label class="se-f">${T("Copies")}<input type="number" id="sdN" min="1" max="64" value="1"></label>
<label class="se-f">${T("Gap between copies")}<input type="number" id="sdG" min="0" max="64" value="0"></label></div>
<div class="st-dact"><button class="st-btn" data-x>${T("Cancel")}</button><button class="st-btn primary" data-ok>${T("Duplicate")}</button></div>`, () => {
      const i = +pop.querySelector(".se-dir .on").dataset.i, o = opts[i];
      duplicate(o[0], o[1], clamp(parseInt(pop.querySelector("#sdN").value, 10) || 1, 1, 64), clamp(parseInt(pop.querySelector("#sdG").value, 10) || 0, 0, 64));
      return true;
    });
    pop.querySelector(".se-dir").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (!b) return;
      pop.querySelectorAll(".se-dir button").forEach((x) => x.classList.toggle("on", x === b));
    });
  }
  function duplicateStructure() {
    selectAll();
    if (A().S.sel) duplicateDialog();
  }

  // ---------- dock (barra recta) ----------
  let dock = null;
  const IC = {
    place: '<path d="M12 5v14M5 12h14"/>', remove: '<path d="M5 12h14"/>', pick: '<path d="m4 20 4-1 10-10-3-3L5 16l-1 4ZM14 6l3 3"/>',
    select: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/>',
    paste: '<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V4h6v1M9 11h6M9 15h4"/>',
    move: '<path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    cut: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 8l12 10M8 16 20 6"/>',
    dup: '<rect x="3" y="3" width="11" height="11" rx="2"/><rect x="10" y="10" width="11" height="11" rx="2"/>',
    rot: '<path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v5h-5"/>',
    mirror: '<path d="M12 3v18" stroke-dasharray="2 2"/><path d="M8 7 3 12l5 5V7ZM16 7l5 5-5 5V7Z"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    fill: '<path d="M5 13 12 6l7 7-7 7-7-7ZM19 17c1 1.5 1.5 2.5 1.5 3.2a1.5 1.5 0 0 1-3 0c0-.7.5-1.7 1.5-3.2Z"/>',
    all: '<rect x="4" y="4" width="16" height="16" rx="2" stroke-dasharray="3 2"/><path d="M9 12l2 2 4-4"/>',
    off: '<path d="M6 6l12 12M18 6 6 18"/>',
    layer: '<path d="M4 6h16M4 12h16M4 18h8"/>',
    cam: '<path d="M4 9V4h5M20 15v5h-5M4 4l6 6M20 20l-6-6"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>', down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    orient: '<circle cx="12" cy="12" r="8"/><path d="M12 5v7l4 3"/>'
  };
  const ic = (k) => `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[k]}</svg>`;
  const BTN = (id, k, label, extra) => `<button class="se-b" data-e="${id}" ${extra || ""}>${ic(k)}<span>${T(label)}</span></button>`;

  function buildDock() {
    const a = A(), view = a.root.querySelector("#stView");
    if (!view) return;
    const old = view.querySelector(".s3-bar");
    if (old) old.remove();
    dock = document.createElement("div");
    dock.className = "s3-bar se-dock";
    dock.innerHTML = `<div class="se-g" data-g="mode">${BTN("m:place", "place", "Place")}${BTN("m:remove", "remove", "Remove")}${BTN("m:pick", "pick", "Pick")}${BTN("m:select", "select", "Select")}${BTN("m:paste", "paste", "Paste")}</div>
<i class="se-sep"></i>
<div class="se-g" data-g="sel">${BTN("move", "move", "Move")}${BTN("copy", "copy", "Copy")}${BTN("cut", "cut", "Cut")}${BTN("dup", "dup", "Duplicate")}${BTN("rot", "rot", "Rotate")}${BTN("mir", "mirror", "Mirror")}${BTN("fill", "fill", "Fill")}${BTN("del", "trash", "Delete")}${BTN("all", "all", "Select all")}${BTN("none", "off", "Deselect")}</div>
<i class="se-sep"></i>
<div class="se-g" data-g="size">${BTN("hup", "up", "Taller")}<div class="se-h"><b id="seH">0</b><small>${T("Height")}</small></div>${BTN("hdn", "down", "Shorter")}</div>
<i class="se-sep"></i>
<div class="se-g" data-g="view">${BTN("orient", "orient", "Auto-orient")}${BTN("layer", "layer", "Layer")}${BTN("vrot", "rot", "View")}${BTN("vreset", "cam", "Camera")}</div>`;
    view.appendChild(dock);
    dock.addEventListener("click", (e) => {
      const b = e.target.closest("[data-e]");
      if (!b || b.disabled) return;
      act(b.dataset.e);
    });
    syncDock();
  }
  function act(k) {
    const a = A(), S = a.S, s3 = window.FD_S3;
    if (k.indexOf("m:") === 0) {
      s3.cam.mode = k.slice(2);
      if (s3.cam.mode === "paste" && !S.clip) a.toast(T("Nothing copied yet"));
      return syncDock();
    }
    if (k === "move") return togglePad(pad ? false : true);
    if (k === "copy") return copy();
    if (k === "cut") return cut();
    if (k === "dup") return duplicateDialog();
    if (k === "rot") return rotateAny("rot");
    if (k === "mir") return rotateAny("mx");
    if (k === "fill") return fillSel();
    if (k === "del") return del();
    if (k === "all") return selectAll();
    if (k === "none") return clearSel();
    if (k === "hup" || k === "hdn") {
      const ny = clamp(S.sy + (k === "hup" ? 8 : -8), 1, 512);
      if (ny < S.sy) {
        const b = a.bbox();
        if (b && b.y1 >= ny) return a.toast(T("Too big: the structure would exceed the size limit."));
      }
      a.resizeTo(S.sx, ny, S.sz);
      return syncDock();
    }
    if (k === "orient") {
      S.autoOrient = S.autoOrient === false;
      return syncDock();
    }
    if (k === "layer") {
      S.cut = !S.cut;
      const c = a.root.querySelector("#stCut");
      if (c) c.checked = S.cut;
      s3.redraw();
      return syncDock();
    }
    if (k === "vrot") {
      s3.cam.yaw += Math.PI / 2;
      return s3.redraw();
    }
    if (k === "vreset") {
      Object.assign(s3.cam, { yaw: 0.78, pitch: 0.62, zoom: 1, px: 0, py: 0 });
      s3.redraw();
    }
  }
  function syncDock() {
    const a = A();
    if (!dock || !a) return;
    const S = a.S, s3 = window.FD_S3, has = !!S.sel;
    dock.querySelectorAll("[data-e]").forEach((b) => {
      const k = b.dataset.e;
      if (k.indexOf("m:") === 0) b.classList.toggle("on", s3.cam.mode === k.slice(2));
      if (/^(move|copy|cut|dup|rot|mir|fill|del|none)$/.test(k)) b.disabled = !has && !(S.clip && s3.cam.mode === "paste" && /^(rot|mir)$/.test(k));
      if (k === "m:paste") b.classList.toggle("dim", !S.clip);
      if (k === "move") b.classList.toggle("on", !!pad);
      if (k === "orient") b.classList.toggle("on", S.autoOrient !== false);
      if (k === "layer") b.classList.toggle("on", !!S.cut);
    });
    const h = dock.querySelector("#seH");
    if (h) h.textContent = S.sy;
  }

  (window.FD_STRUCT_HOOKS = window.FD_STRUCT_HOOKS || []).push(() => {
    pad = null;
    setTimeout(() => {
      buildDock();
    }, 0);
    const a = A();
    if (a && a.root) {
      const o = a.root.querySelector("#stOpts");
      if (o) o.addEventListener("click", (e) => {
        const b = e.target.closest("[data-sa]");
        if (!b) return;
        const k = b.dataset.sa;
        if (k === "move") togglePad(true);
        else if (k === "dup") duplicateDialog();
        else if (k === "rot") transformSel("rot");
        else if (k === "mir") transformSel("mx");
        else if (k === "all") selectAll();
      });
    }
  });

  window.FD_STRUCT_EDIT = { orient, bedHead, bedPartner, moveSel, transformSel, duplicate, duplicateDialog, duplicateStructure, selectAll, clearSel, setSel, syncDock, togglePad, copy, cut, del, fillSel };
})();

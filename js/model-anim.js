/* FireDex · Modelador — editor de animaciones (línea de tiempo, claves, interpolación) */
(function() {
  "use strict";
  const FD = window.FD;
  if (!FD) return;
  const { S, $, $$, ic, toast, modal, ask, confirmDlg, esc, round, clamp, num } = FD;
  const A = { node: null, root: { format_version: "1.8.0", animations: {} }, name: "", time: 0, playing: false, sel: [], pps: 120, last: 0, raf: 0, speed: 1, snap: 0.05, all: false, clip: null };
  FD.A = A;
  const CH = [["position", "Posición", [0, 0, 0], "#4f9dff"], ["rotation", "Rotación", [0, 0, 0], "#f0605d"], ["scale", "Escala", [1, 1, 1], "#f2c14e"]];
  const ROW = 26, RULER = 30;
  const cur = () => A.root.animations && A.root.animations[A.name] || null;
  const slug = () => FD.geoSlug();
  const sameK = (a, b) => a && b && a.bone === b.bone && a.ch === b.ch && Math.abs(a.t - b.t) < 1e-3;
  const isSel = (bone, ch, t) => A.sel.some((k) => k.bone === bone && k.ch === ch && Math.abs(k.t - t) < 1e-3);
  /* ───────── Lectura / escritura de canales ───────── */
  function parseChan(v) {
    if (v == null) return [];
    const asVec = (x) => Array.isArray(x) && x.length === 3 && x.every((n) => typeof n === "number") ? x.slice() : typeof x === "number" ? [x, x, x] : null;
    if (Array.isArray(v) || typeof v === "number") return [{ t: 0, v: asVec(v), raw: v, lerp: "" }];
    if (typeof v !== "object") return [];
    const out = [];
    Object.keys(v).forEach((k) => {
      const t = parseFloat(k);
      if (!isFinite(t)) return;
      const raw = v[k];
      let vec = asVec(raw), lerp = "";
      if (!vec && raw && typeof raw === "object" && !Array.isArray(raw)) {
        vec = asVec(raw.post !== void 0 ? raw.post : raw.pre);
        lerp = raw.lerp_mode || "";
      }
      out.push({ t, v: vec, raw, lerp });
    });
    return out.sort((a, b) => a.t - b.t);
  }
  const fmtT = (t) => {
    const s = (+t.toFixed(4)).toString();
    return s.indexOf(".") < 0 ? s + ".0" : s;
  };
  function writeChan(anim, bone, ch, keys) {
    anim.bones = anim.bones || {};
    const b = anim.bones[bone] = anim.bones[bone] || {};
    if (!keys.length) {
      delete b[ch];
      if (!Object.keys(b).length) delete anim.bones[bone];
      if (!Object.keys(anim.bones).length) delete anim.bones;
      return;
    }
    const o = {};
    keys.sort((a, c) => a.t - c.t).forEach((k) => {
      let val;
      const rawObj = k.raw && typeof k.raw === "object" && !Array.isArray(k.raw) ? k.raw : null;
      if (k.v && (rawObj || k.lerp)) {
        val = Object.assign({}, rawObj || {});
        if (val.pre !== void 0 && val.post === void 0) val.pre = k.v.slice();
        else val.post = k.v.slice();
        if (k.lerp) val.lerp_mode = k.lerp;
        else delete val.lerp_mode;
      } else val = k.v ? k.v.map((n) => round(n, 4)) : k.raw;
      if (val && val.post) val.post = val.post.map((n) => round(n, 4));
      o[fmtT(k.t)] = val;
    });
    b[ch] = o;
  }
  function getKeys(bone, ch) {
    const a = cur();
    return a && a.bones && a.bones[bone] ? parseChan(a.bones[bone][ch]) : [];
  }
  function catmull(p0, p1, p2, p3, f) {
    const f2 = f * f, f3 = f2 * f;
    return p1.map((_, i) => 0.5 * (2 * p1[i] + (-p0[i] + p2[i]) * f + (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * f2 + (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * f3));
  }
  function evalChan(bone, ch, t) {
    const def = CH.find((c) => c[0] === ch)[2], ks = getKeys(bone, ch).filter((k) => k.v);
    if (!ks.length) return def.slice();
    if (t <= ks[0].t) return ks[0].v.slice();
    const L = ks[ks.length - 1];
    if (t >= L.t) return L.v.slice();
    for (let i = 0; i < ks.length - 1; i++) {
      const a = ks[i], b = ks[i + 1];
      if (t >= a.t && t <= b.t) {
        const f = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
        if (a.lerp === "catmullrom" || b.lerp === "catmullrom") return catmull((ks[i - 1] || a).v, a.v, b.v, (ks[i + 2] || b).v, f);
        return a.v.map((x, k) => x + (b.v[k] - x) * f);
      }
    }
    return def.slice();
  }
  const hasData = (bone) => {
    const a = cur();
    return !!(a && a.bones && a.bones[bone]);
  };
  FD.pose = function(b) {
    if (S.mode !== "anim" && !A.playing) return null;
    if (!cur() || !hasData(b.name)) return null;
    return { pos: evalChan(b.name, "position", A.time), rot: evalChan(b.name, "rotation", A.time), scale: evalChan(b.name, "scale", A.time) };
  };
  const keyAt = (bone, ch, t) => getKeys(bone, ch).find((k) => Math.abs(k.t - t) < 1e-3) || null;
  function setKey(bone, ch, vec, t, lerp) {
    const a = cur();
    if (!a) return;
    t = t == null ? A.time : t;
    const ks = getKeys(bone, ch);
    const ex = ks.find((k) => Math.abs(k.t - t) < 1e-3);
    if (ex) {
      ex.v = vec.slice();
      if (lerp !== void 0) ex.lerp = lerp;
    } else ks.push({ t, v: vec.slice(), raw: null, lerp: lerp || "" });
    writeChan(a, bone, ch, ks);
  }
  function delKey(bone, ch, t) {
    const a = cur();
    if (!a) return;
    writeChan(a, bone, ch, getKeys(bone, ch).filter((k) => Math.abs(k.t - t) >= 1e-3));
  }
  const animLen = () => {
    const a = cur();
    return a ? Math.max(0.05, num(a.animation_length, 1) || 1) : 1;
  };
  const snapT = (t) => A.snap ? Math.round(t / A.snap) * A.snap : t;
  /* ───────── Archivo de animaciones ───────── */
  const P = () => FD.proj;
  function animFiles() {
    return P() ? P().index().anims : [];
  }
  function autoFind() {
    if (!S.project) return null;
    const all = animFiles();
    if (!all.length) return null;
    const sl = slug(), g = FD.geoName(FD.G()).replace(/^geometry\./, "");
    const ix = P().index(), ents = P().entityFor(ix, FD.geoName(FD.G()));
    const refd = new Set();
    ents.forEach((e) => Object.values(e.desc.animations || {}).forEach((v) => refd.add(v)));
    return (all.find((f) => f.ids.some((id) => refd.has(id))) || all.find((f) => f.node.content && f.node.content.indexOf("animation." + g) >= 0) || all.find((f) => f.node.name.toLowerCase().indexOf(sl) >= 0) || all[0]).node;
  }
  function useNode(n) {
    A.node = n;
    try {
      const j = JSON.parse(FD.stripJson(n.content || "") || "{}");
      if (!j.animations) j.animations = {};
      if (!j.format_version) j.format_version = "1.8.0";
      A.root = j;
    } catch (e) {
      toast("El archivo de animaciones tiene errores de JSON", 3500, "bad");
      A.root = { format_version: "1.8.0", animations: {} };
    }
    A.name = Object.keys(A.root.animations)[0] || "";
    A.time = 0;
    A.sel = [];
    refreshUI();
  }
  function createFile() {
    if (!S.project) {
      toast("Abre un proyecto para guardar animaciones en un archivo", 3000);
      return null;
    }
    const dir = P().dirFor("anim");
    const n = P().putFile(dir, slug() + ".animation.json", JSON.stringify({ format_version: "1.8.0", animations: {} }, null, 2), false);
    useNode(n);
    FD.markDirty();
    toast("Archivo creado: animations/" + n.name, 2800, "ok");
    return n;
  }
  function chooseFile() {
    if (!S.project) return toast("Modo demostración: las animaciones no se guardan");
    const files = animFiles();
    modal("Archivo de animaciones", '<div class="sub">Elige dónde viven las animaciones de este modelo (normalmente <b>animations/nombre.animation.json</b>). Si no existe, se crea la carpeta.</div>' + (files.map((f, i) => '<label class="hrow"><input type="radio" name="af" value="' + i + '"' + (A.node && A.node === f.node ? " checked" : "") + "><span><b>" + esc(f.node.name) + "</b><br><small>" + esc(f.path) + " · " + f.ids.length + " animaciones</small></span></label>").join("") || '<div class="empty small">No hay archivos de animación en el proyecto.</div>'), [{ label: "Cancelar" }, { label: "Crear archivo nuevo", fn: () => {
      createFile();
    } }, { label: "Importar…", fn: () => {
      FD.proj.pickFiles();
    } }, { label: "Usar el elegido", cls: "primary", fn: (api) => {
      const r = api.el.querySelector("input:checked");
      if (!r) return false;
      useNode(files[+r.value].node);
      FD.markDirty();
    } }]);
  }
  FD.animApi = {
    refresh: () => refreshUI(),
    async importRoot(j, fname) {
      if (!A.node && S.project) createFile();
      let n = 0;
      Object.keys(j.animations || {}).forEach((id) => {
        let k = id, c = 1;
        while (A.root.animations[k]) k = id + "_" + c++;
        A.root.animations[k] = j.animations[id];
        A.name = k;
        n++;
      });
      if (!n) return 0;
      FD.commit("Importar animaciones");
      refreshUI();
      return n;
    }
  };
  function refreshUI() {
    const sel = $("#animSel");
    const ks = Object.keys(A.root.animations || {});
    sel.innerHTML = ks.length ? ks.map((k) => '<option value="' + esc(k) + '"' + (k === A.name ? " selected" : "") + ">" + esc(k.replace(/^animation\./, "")) + "</option>").join("") : '<option value="">— sin animaciones —</option>';
    const a = cur();
    $("#tLen").value = a ? round(animLen(), 3) : 1;
    $("#tLoop").value = a ? String(a.loop === void 0 ? false : a.loop) : "true";
    $("#tTime").value = round(A.time, 3);
    const tf = $("#tFile");
    tf.textContent = A.node ? A.node.name : S.project ? "Sin archivo · elegir" : "Demostración";
    tf.title = "Archivo de animaciones: " + (A.node ? A.node.name : "ninguno") + " — clic para cambiar";
    $("#tPlay").innerHTML = ic(A.playing ? "pause" : "play");
    $("#tAll").classList.toggle("on", A.all);
    FD.hydrateIcons($("#tl"));
    layout();
    if (S.mode === "anim") FD.refreshProps();
  }
  /* ───────── Línea de tiempo ───────── */
  let rows = [];
  function rowsList() {
    const a = cur();
    if (!a) return [];
    const out = [];
    const data = Object.keys(a.bones || {});
    const selB = S.sel ? S.sel.bone.name : null;
    let names;
    if (A.all) names = FD.bones().map((b) => b.name).concat(data.filter((n) => !FD.boneByName(n)));
    else {
      names = data.slice();
      if (selB && names.indexOf(selB) < 0) names.push(selB);
    }
    names.forEach((n) => {
      const b = FD.boneByName(n);
      let depth = 0, p = b;
      while (p && p.parent && depth < 12) {
        p = FD.parentOf(p);
        depth++;
      }
      out.push({ type: "bone", bone: n, depth: A.all ? depth : 0, ghost: !b });
      if (n === selB) CH.forEach((c) => out.push({ type: "ch", bone: n, ch: c[0], label: c[1], color: c[3] }));
    });
    return out;
  }
  function layout() {
    const track = $("#tlTrack"), cv = $("#tlCv");
    if (!cv || S.mode !== "anim") return;
    rows = rowsList();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(track.clientWidth, Math.ceil(16 + (animLen() + 0.6) * A.pps)), h = Math.max(track.clientHeight, RULER + rows.length * ROW + 6);
    cv.style.width = w + "px";
    cv.style.height = h + "px";
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    const sb = S.sel ? S.sel.bone.name : null;
    $("#tlNames").innerHTML = '<div class="tn rul"></div>' + (rows.map((r, i) => {
      if (r.type === "ch") return '<div class="tn ch" data-i="' + i + '"><span class="cd" style="background:' + r.color + '"></span>' + r.label + "</div>";
      const b = FD.boneByName(r.bone), n = hasData(r.bone) ? Object.keys(cur().bones[r.bone]).length : 0;
      return '<div class="tn' + (sb === r.bone ? " sel" : "") + (r.ghost ? " ghost" : "") + '" data-i="' + i + '" title="' + esc(r.bone) + (r.ghost ? " (no existe en el modelo)" : "") + '" style="padding-left:' + (8 + r.depth * 10) + 'px"><span class="sw" style="background:' + (b ? FD.boneColor(b) : "#888") + '"></span><span class="tx">' + esc(r.bone) + "</span>" + (n ? '<small>' + n + "</small>" : "") + (r.ghost ? ic("alert") : "") + "</div>";
    }).join("") || '<div class="tn emp">Elige un hueso y pulsa K para crear una clave</div>');
    FD.hydrateIcons($("#tlNames"));
    paintTL();
  }
  const X = (t) => 10 + t * A.pps, TX = (x) => (x - 10) / A.pps;
  function diamond(c, x, y, r, col, sel, mol, smooth) {
    c.beginPath();
    if (smooth) c.arc(x, y, r * 0.95, 0, 7);
    else {
      c.moveTo(x, y - r);
      c.lineTo(x + r, y);
      c.lineTo(x, y + r);
      c.lineTo(x - r, y);
      c.closePath();
    }
    c.fillStyle = col;
    c.fill();
    c.lineWidth = sel ? 2.2 : 1;
    c.strokeStyle = sel ? "#fff" : mol ? "#fbbf24" : "rgba(0,0,0,.55)";
    c.stroke();
    c.lineWidth = 1;
  }
  function paintTL() {
    const cv = $("#tlCv");
    if (!cv || S.mode !== "anim") return;
    const c = cv.getContext("2d"), W = parseFloat(cv.style.width), H = parseFloat(cv.style.height), dpr = cv.width / W;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    c.fillStyle = "#14151d";
    c.fillRect(0, 0, W, H);
    c.fillStyle = "#191a24";
    c.fillRect(0, 0, W, RULER);
    const len = animLen();
    c.fillStyle = "rgba(0,0,0,.28)";
    c.fillRect(X(len), RULER, Math.max(0, W - X(len)), H - RULER);
    const fine = A.pps > 160 ? 0.05 : A.pps > 70 ? 0.1 : 0.25;
    c.font = "600 10px system-ui";
    c.textBaseline = "middle";
    for (let t = 0; t <= len + 0.6; t += 0.05) {
      const x = X(t), sec = Math.abs(t - Math.round(t)) < 1e-6, st = Math.abs(t / fine - Math.round(t / fine)) < 1e-4, half = Math.abs(t * 2 - Math.round(t * 2)) < 1e-6;
      if (!st && !(A.pps > 300)) continue;
      c.strokeStyle = sec ? "#3f4260" : half ? "#2d3048" : "#242638";
      c.beginPath();
      c.moveTo(x, sec ? 4 : half ? 12 : 19);
      c.lineTo(x, sec || half || st ? H : RULER);
      c.stroke();
      if (sec || A.pps > 140 && half || A.pps > 300 && st) {
        c.fillStyle = sec ? "#aeb1cc" : "#7b7e99";
        c.fillText(round(t, 2) + "s", x + 4, 10);
      }
    }
    c.fillStyle = "#7b7e99";
    c.fillText(Math.round(A.time / 0.05) + "f", 12, RULER - 8);
    rows.forEach((r, i) => {
      const y = RULER + i * ROW;
      c.fillStyle = r.type === "ch" ? "rgba(133,119,248,.05)" : i % 2 ? "rgba(255,255,255,.012)" : "transparent";
      c.fillRect(0, y, W, ROW);
      if (S.sel && S.sel.bone.name === r.bone && r.type === "bone") {
        c.fillStyle = "rgba(133,119,248,.12)";
        c.fillRect(0, y, W, ROW);
      }
      c.strokeStyle = "#232536";
      c.beginPath();
      c.moveTo(0, y + ROW + 0.5);
      c.lineTo(W, y + ROW + 0.5);
      c.stroke();
      const chs = r.type === "ch" ? [CH.find((q) => q[0] === r.ch)] : CH;
      const ks = [];
      chs.forEach((q) => getKeys(r.bone, q[0]).forEach((k) => ks.push({ k, q })));
      if (r.type === "bone") {
        const all = ks.map((o) => o.k.t).sort((a, b) => a - b);
        c.strokeStyle = "rgba(255,255,255,.07)";
        if (all.length > 1) {
          c.lineWidth = 3;
          c.beginPath();
          c.moveTo(X(all[0]), y + ROW / 2);
          c.lineTo(X(all[all.length - 1]), y + ROW / 2);
          c.stroke();
          c.lineWidth = 1;
        }
      }
      ks.forEach(({ k, q }) => diamond(c, X(k.t), y + ROW / 2, r.type === "ch" ? 6.5 : 5, r.type === "ch" ? q[3] : q[3] + "dd", isSel(r.bone, q[0], k.t), !k.v, k.lerp === "catmullrom"));
    });
    if (A.box) {
      c.fillStyle = "rgba(133,119,248,.14)";
      c.strokeStyle = "rgba(133,119,248,.9)";
      c.fillRect(A.box[0], A.box[1], A.box[2] - A.box[0], A.box[3] - A.box[1]);
      c.strokeRect(A.box[0], A.box[1], A.box[2] - A.box[0], A.box[3] - A.box[1]);
    }
    c.strokeStyle = "#a79cff";
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(X(A.time), 0);
    c.lineTo(X(A.time), H);
    c.stroke();
    c.lineWidth = 1;
    c.fillStyle = "#a79cff";
    c.beginPath();
    c.moveTo(X(A.time) - 7, 0);
    c.lineTo(X(A.time) + 7, 0);
    c.lineTo(X(A.time) + 7, 11);
    c.lineTo(X(A.time), 17);
    c.lineTo(X(A.time) - 7, 11);
    c.fill();
  }
  function setTime(t, noRefresh) {
    A.time = clamp(round(t, 3), 0, animLen());
    $("#tTime").value = A.time;
    FD.rebuild();
    FD.requestDraw();
    paintTL();
    if (S.mode === "anim" && !A.playing && !noRefresh) FD.refreshProps();
  }
  const trk = $("#tlTrack");
  let tdrag = null;
  function trackXY(e) {
    const cv = $("#tlCv").getBoundingClientRect();
    return [e.clientX - cv.left, e.clientY - cv.top];
  }
  function hitKey(x, y) {
    const i = Math.floor((y - RULER) / ROW);
    const r = rows[i];
    if (!r) return null;
    const chs = r.type === "ch" ? [CH.find((q) => q[0] === r.ch)] : CH;
    for (const q of chs) for (const k of getKeys(r.bone, q[0])) if (Math.abs(X(k.t) - x) < 8) return { bone: r.bone, ch: q[0], t: k.t, row: r };
    return null;
  }
  /* Una fila de hueso agrupa 3 canales: al elegir su clave se eligen las claves del mismo instante */
  function keysAtRow(hit) {
    if (hit.row.type === "ch") return [{ bone: hit.bone, ch: hit.ch, t: hit.t }];
    return CH.map((q) => q[0]).filter((ch) => keyAt(hit.bone, ch, hit.t)).map((ch) => ({ bone: hit.bone, ch, t: hit.t }));
  }
  trk.addEventListener("pointerdown", (e) => {
    const [x, y] = trackXY(e);
    trk.setPointerCapture(e.pointerId);
    if (y < RULER) {
      tdrag = { type: "scrub" };
      setTime(snapT(TX(x)));
      return;
    }
    const i = Math.floor((y - RULER) / ROW), r = rows[i];
    if (r) {
      const b = FD.boneByName(r.bone);
      if (b && (!S.sel || S.sel.bone !== b)) FD.select(b, null);
    }
    const k = hitKey(x, y);
    const add = e.shiftKey || e.ctrlKey || e.metaKey;
    if (k) {
      const grp = keysAtRow(k);
      if (add) {
        const already = grp.every((g) => isSel(g.bone, g.ch, g.t));
        A.sel = already ? A.sel.filter((s) => !grp.some((g) => sameK(g, s))) : A.sel.concat(grp.filter((g) => !isSel(g.bone, g.ch, g.t)));
      } else if (!grp.every((g) => isSel(g.bone, g.ch, g.t))) A.sel = grp;
      tdrag = { type: "key", x0: x, t0: k.t, moved: false, orig: A.sel.map((s) => Object.assign({}, s)) };
      if (!add) setTime(k.t);
      paintTL();
      return;
    }
    if (add) {
      tdrag = { type: "box", x0: x, y0: y };
      A.box = [x, y, x, y];
      return;
    }
    A.sel = [];
    tdrag = { type: "scrub" };
    setTime(snapT(TX(x)));
  });
  trk.addEventListener("pointermove", (e) => {
    if (!tdrag) return;
    const [x, y] = trackXY(e);
    if (tdrag.type === "scrub") setTime(snapT(TX(x)));
    else if (tdrag.type === "box") {
      A.box = [Math.min(tdrag.x0, x), Math.min(tdrag.y0, y), Math.max(tdrag.x0, x), Math.max(tdrag.y0, y)];
      paintTL();
    } else if (tdrag.type === "key") {
      let dt = snapT(TX(x)) - snapT(tdrag.t0);
      if (!tdrag.moved && Math.abs(x - tdrag.x0) < 3) return;
      const minT = Math.min.apply(null, tdrag.orig.map((s) => s.t));
      dt = Math.max(dt, -minT);
      const back = tdrag.orig.map((s) => Object.assign({}, s));
      if (tdrag.last === dt) return;
      tdrag.last = dt;
      /* restaura y vuelve a colocar todo el grupo */
      const byCh = {};
      back.forEach((s) => {
        (byCh[s.bone + "|" + s.ch] = byCh[s.bone + "|" + s.ch] || []).push(s);
      });
      Object.keys(byCh).forEach((kk) => {
        const [bone, ch] = kk.split("|");
        const moving = byCh[kk];
        const base = getKeys(bone, ch).filter((q) => !moving.some((m) => Math.abs(m.t - q.t) < 1e-3 || Math.abs(m.t + (tdrag.prevDt || 0) - q.t) < 1e-3));
        const origKeys = tdrag.snapKeys && tdrag.snapKeys[kk] || (tdrag.snapKeys = tdrag.snapKeys || {}, tdrag.snapKeys[kk] = getKeys(bone, ch));
        const rest = origKeys.filter((q) => !moving.some((m) => Math.abs(m.t - q.t) < 1e-3));
        const mv = origKeys.filter((q) => moving.some((m) => Math.abs(m.t - q.t) < 1e-3)).map((q) => Object.assign({}, q, { t: clamp(round(q.t + dt, 4), 0, animLen()) }));
        const clean = rest.filter((q) => !mv.some((m) => Math.abs(m.t - q.t) < 1e-3));
        writeChan(cur(), bone, ch, clean.concat(mv));
      });
      A.sel = back.map((s) => Object.assign({}, s, { t: round(clamp(s.t + dt, 0, animLen()), 4) }));
      tdrag.moved = true;
      const lead = A.sel[A.sel.length - 1];
      A.time = lead.t;
      $("#tTime").value = round(A.time, 3);
      FD.rebuild();
      FD.requestDraw();
      paintTL();
    }
  });
  function tup() {
    if (tdrag && tdrag.type === "box" && A.box) {
      const b = A.box, add = A.sel.slice();
      rows.forEach((r, i) => {
        const y0 = RULER + i * ROW, y1 = y0 + ROW;
        if (y1 < b[1] || y0 > b[3]) return;
        const chs = r.type === "ch" ? [CH.find((q) => q[0] === r.ch)] : CH;
        chs.forEach((q) => getKeys(r.bone, q[0]).forEach((k) => {
          const x = X(k.t);
          if (x >= b[0] && x <= b[2] && !add.some((s) => sameK(s, { bone: r.bone, ch: q[0], t: k.t }))) add.push({ bone: r.bone, ch: q[0], t: k.t });
        }));
      });
      A.sel = add;
      A.box = null;
      paintTL();
    }
    if (tdrag && tdrag.moved) {
      FD.pushHist("Mover claves");
      FD.markDirty();
      FD.refreshProps();
      layout();
    }
    tdrag = null;
  }
  trk.addEventListener("pointerup", tup);
  trk.addEventListener("pointercancel", tup);
  trk.addEventListener("wheel", (e) => {
    if (e.ctrlKey || e.shiftKey) {
      e.preventDefault();
      A.pps = clamp(A.pps * (e.deltaY < 0 ? 1.15 : 0.87), 30, 600);
      layout();
    }
  }, { passive: false });
  trk.addEventListener("scroll", () => {
    $("#tlNames").scrollTop = trk.scrollTop;
  });
  $("#tlNames").addEventListener("click", (e) => {
    const r = e.target.closest(".tn");
    if (!r || r.dataset.i == null) return;
    const row = rows[+r.dataset.i];
    const b = FD.boneByName(row.bone);
    if (b) FD.select(b, null);
  });
  new ResizeObserver(() => layout()).observe(trk);
  /* altura ajustable */
  (function() {
    const grip = $("#tlGrip"), tl = $("#tl");
    try {
      const h = +localStorage.getItem("fd_tlh");
      if (h) document.documentElement.style.setProperty("--tlh", clamp(h, 140, 520) + "px");
    } catch (e) {
    }
    grip.addEventListener("pointerdown", (e) => {
      grip.setPointerCapture(e.pointerId);
      const y0 = e.clientY, h0 = tl.getBoundingClientRect().height;
      const mv = (ev) => {
        const h = clamp(h0 + (y0 - ev.clientY), 140, Math.round(innerHeight * 0.7));
        document.documentElement.style.setProperty("--tlh", h + "px");
        FD.requestDraw();
      };
      const up = () => {
        grip.removeEventListener("pointermove", mv);
        grip.removeEventListener("pointerup", up);
        try {
          localStorage.setItem("fd_tlh", Math.round(tl.getBoundingClientRect().height));
        } catch (e2) {
        }
      };
      grip.addEventListener("pointermove", mv);
      grip.addEventListener("pointerup", up);
    });
  })();
  /* ───────── Barra de animación ───────── */
  $("#animSel").onchange = (e) => {
    A.name = e.target.value;
    A.time = 0;
    A.sel = [];
    refreshUI();
    FD.rebuild();
    FD.requestDraw();
  };
  $("#animNew").onclick = async () => {
    if (!A.node && S.project) createFile();
    const r = await ask({ title: "Nueva animación", fields: [{ id: "n", label: "Nombre (idle, walk, attack…)", value: "idle" }, { id: "loop", label: "Repetición", type: "select", value: "true", options: [["true", "Bucle"], ["false", "Una vez"], ["hold_on_last_frame", "Mantener el último fotograma"]] }, { id: "len", label: "Duración (s)", type: "number", value: 1, step: "0.1", min: 0.05 }], ok: "Crear", validate: (v) => !/^[a-z0-9_.]+$/i.test(v.n.trim()) ? "Usa solo letras, números, «_» y «.»" : "" });
    if (!r) return;
    const nm = r.n.trim().toLowerCase();
    const id = nm.indexOf("animation.") === 0 ? nm : "animation." + slug() + "." + nm;
    if (A.root.animations[id]) return toast("Ya existe esa animación", 2500, "bad");
    A.root.animations[id] = { loop: r.loop === "true" ? true : r.loop === "false" ? false : "hold_on_last_frame", animation_length: r.len || 1, bones: {} };
    A.name = id;
    A.time = 0;
    FD.commit("Nueva animación");
    refreshUI();
  };
  $("#animDel").onclick = async () => {
    if (!cur()) return;
    if (!await confirmDlg("¿Eliminar la animación «" + A.name + "»? Puedes deshacerlo con el historial.", { ok: "Eliminar", danger: true })) return;
    delete A.root.animations[A.name];
    A.name = Object.keys(A.root.animations)[0] || "";
    FD.commit("Eliminar animación");
    refreshUI();
  };
  (function extraBtns() {
    const mk = (id, icon, title, fn) => {
      const b = document.createElement("button");
      b.className = "ib sm";
      b.id = id;
      b.title = title;
      b.innerHTML = ic(icon);
      b.onclick = fn;
      $("#animDel").after(b);
    };
    mk("animRen", "pencil", "Renombrar animación", async () => {
      if (!cur()) return;
      const r = await ask({ title: "Renombrar animación", fields: [{ id: "n", label: "Identificador", value: A.name }], validate: (v) => !v.n.trim() ? "Escribe un nombre" : "" });
      const nn = r && r.n.trim();
      if (!nn || nn === A.name || A.root.animations[nn]) return;
      const out = {};
      Object.keys(A.root.animations).forEach((k) => {
        out[k === A.name ? nn : k] = A.root.animations[k];
      });
      A.root.animations = out;
      A.name = nn;
      FD.commit("Renombrar animación");
      refreshUI();
    });
    mk("animDup", "copy", "Duplicar animación", () => {
      if (!cur()) return;
      let id = A.name + "_copia", k = 2;
      while (A.root.animations[id]) id = A.name + "_copia" + k++;
      A.root.animations[id] = JSON.parse(JSON.stringify(cur()));
      A.name = id;
      FD.commit("Duplicar animación");
      refreshUI();
    });
  })();
  $("#tFile").onclick = chooseFile;
  $("#tTime").onchange = (e) => setTime(+e.target.value || 0);
  $("#tLen").onchange = (e) => {
    const a = cur();
    if (!a) return;
    a.animation_length = Math.max(0.05, +e.target.value || 1);
    FD.commit("Duración");
    layout();
  };
  $("#tLoop").onchange = (e) => {
    const a = cur();
    if (!a) return;
    const v = e.target.value;
    a.loop = v === "true" ? true : v === "false" ? false : "hold_on_last_frame";
    FD.commit("Repetición");
  };
  $("#tSpeed").onchange = (e) => {
    A.speed = +e.target.value || 1;
  };
  $("#tSnap").onchange = (e) => {
    A.snap = +e.target.value;
  };
  $("#tAll").onclick = () => {
    A.all = !A.all;
    $("#tAll").classList.toggle("on", A.all);
    layout();
  };
  function play(on) {
    if (on === void 0) on = !A.playing;
    if (on && !cur()) {
      toast("Crea o elige una animación primero");
      return;
    }
    A.playing = on;
    $("#tPlay").innerHTML = ic(on ? "pause" : "play");
    FD.hydrateIcons($("#tPlay"));
    cancelAnimationFrame(A.raf);
    if (on) {
      A.last = performance.now();
      if (A.time >= animLen() - 1e-3) A.time = 0;
      const loop = (now) => {
        if (!A.playing) return;
        const dt = (now - A.last) / 1e3 * A.speed;
        A.last = now;
        const L = animLen(), a = cur();
        A.time += dt;
        if (A.time >= L) {
          if (a.loop === true) A.time = A.time % L;
          else {
            A.time = a.loop === "hold_on_last_frame" ? L : 0;
            A.playing = false;
            $("#tPlay").innerHTML = ic("play");
            FD.hydrateIcons($("#tPlay"));
          }
        }
        $("#tTime").value = round(A.time, 2);
        FD.rebuild();
        FD.requestDraw();
        paintTL();
        A.raf = requestAnimationFrame(loop);
      };
      A.raf = requestAnimationFrame(loop);
    } else {
      FD.rebuild();
      FD.requestDraw();
      if (S.mode === "anim") FD.refreshProps();
    }
  }
  $("#tPlay").onclick = () => play();
  $("#tStop").onclick = () => {
    play(false);
    setTime(0);
  };
  /* saltar entre claves */
  function jump(dir, bone) {
    const ts = [];
    const bs = bone ? [bone] : Object.keys(cur() && cur().bones || {});
    bs.forEach((bn) => CH.forEach((c) => getKeys(bn, c[0]).forEach((k) => ts.push(k.t))));
    ts.sort((a, c) => a - c);
    const t = dir > 0 ? ts.find((x) => x > A.time + 1e-3) : ts.slice().reverse().find((x) => x < A.time - 1e-3);
    if (t != null) setTime(t);
  }
  $("#tPrevKey").onclick = () => jump(-1, S.sel ? S.sel.bone.name : null);
  $("#tNextKey").onclick = () => jump(1, S.sel ? S.sel.bone.name : null);
  /* ───────── Claves: crear, borrar, copiar, pegar ───────── */
  const curBone = () => S.sel ? S.sel.bone : null;
  const chanForTool = () => S.tool === "move" ? "position" : S.tool === "scale" ? "scale" : "rotation";
  function addKey(ch) {
    const b = curBone();
    if (!b) return toast("Elige un hueso");
    if (!cur()) return toast("Crea o elige una animación");
    ch = ch || chanForTool();
    setKey(b.name, ch, evalChan(b.name, ch, A.time));
    A.sel = [{ bone: b.name, ch, t: A.time }];
    FD.commit("Clave de " + ch);
    layout();
  }
  function deleteSel() {
    if (!A.sel.length) return;
    A.sel.forEach((s) => delKey(s.bone, s.ch, s.t));
    const n = A.sel.length;
    A.sel = [];
    FD.commit(n > 1 ? "Quitar " + n + " claves" : "Quitar clave");
    layout();
  }
  function copySel() {
    if (!A.sel.length) return toast("Selecciona claves (Shift+clic) para copiar");
    const t0 = Math.min.apply(null, A.sel.map((s) => s.t));
    A.clip = A.sel.map((s) => {
      const k = keyAt(s.bone, s.ch, s.t);
      return k && k.v ? { bone: s.bone, ch: s.ch, dt: s.t - t0, v: k.v.slice(), lerp: k.lerp } : null;
    }).filter(Boolean);
    toast(A.clip.length + " claves copiadas");
  }
  function pasteSel() {
    if (!A.clip || !A.clip.length) return toast("No hay claves copiadas");
    if (!cur()) return;
    const bones1 = new Set(A.clip.map((c) => c.bone));
    const target = bones1.size === 1 && S.sel ? S.sel.bone.name : null;
    const out = [];
    A.clip.forEach((c) => {
      const t = round(A.time + c.dt, 4);
      if (t > animLen() + 1e-6) cur().animation_length = round(t, 3);
      const bn = target || c.bone;
      setKey(bn, c.ch, c.v, t, c.lerp);
      out.push({ bone: bn, ch: c.ch, t });
    });
    A.sel = out;
    FD.commit("Pegar claves");
    refreshUI();
  }
  function dupSel() {
    copySel();
    if (!A.clip || !A.clip.length) return;
    const span = Math.max.apply(null, A.clip.map((c) => c.dt)) + (A.snap || 0.05);
    const save = A.time;
    A.time = Math.min.apply(null, A.sel.map((s) => s.t)) + span;
    pasteSel();
    A.time = save;
  }
  $("#keyAdd").onclick = () => addKey();
  $("#keyReset").onclick = () => {
    const b = curBone();
    if (!b || !cur()) return;
    CH.forEach((c) => delKey(b.name, c[0], A.time));
    A.sel = [];
    FD.commit("Quitar claves");
    layout();
  };
  /* pose espejo: copia la pose del hueso al hueso opuesto */
  function mirrorOf(b) {
    const sw = (n) => n.replace(/left/i, (m) => m[0] === "L" ? "Right" : "right").replace(/right/i, (m) => m[0] === "R" ? "Left" : "left").replace(/([_.\-])l$/i, (m, s) => s + "r").replace(/([_.\-])r$/i, (m, s) => s + "l");
    const n = sw(b.name);
    if (n !== b.name && FD.boneByName(n)) return FD.boneByName(n);
    const p = b.pivot || [0, 0, 0];
    return FD.bones().find((q) => q !== b && q.pivot && Math.abs(q.pivot[0] + p[0]) < 1e-3 && Math.abs(q.pivot[0]) > 1e-3 && Math.abs(q.pivot[1] - p[1]) < 1e-3 && Math.abs(q.pivot[2] - p[2]) < 1e-3) || null;
  }
  $("#keyMirror").onclick = () => {
    const b = curBone();
    if (!b || !cur()) return toast("Elige un hueso y una animación");
    const m = mirrorOf(b);
    if (!m) return toast("No encuentro el hueso opuesto de «" + b.name + "»", 3000);
    const p = evalChan(b.name, "position", A.time), r = evalChan(b.name, "rotation", A.time), s = evalChan(b.name, "scale", A.time);
    setKey(m.name, "position", [-p[0], p[1], p[2]]);
    setKey(m.name, "rotation", [r[0], -r[1], -r[2]]);
    setKey(m.name, "scale", s);
    FD.commit("Pose espejo en «" + m.name + "»");
    layout();
    toast("Pose copiada a «" + m.name + "»", 2200, "ok");
  };
  FD.animDrag = function(tool, i, proj, ppu) {
    const b = curBone();
    if (!b || !cur()) {
      toast("Crea o elige una animación para animar");
      return;
    }
    if (tool === "select") return;
    const ch = tool === "move" ? "position" : tool === "scale" ? "scale" : "rotation";
    const v = evalChan(b.name, ch, A.time);
    v[i] = round(v[i] + (ch === "rotation" ? proj * 0.7 : ch === "scale" ? proj / ppu * 0.08 : proj / ppu), 3);
    setKey(b.name, ch, v);
    A.sel = [{ bone: b.name, ch, t: A.time }];
    FD.rebuild();
    FD.refreshProps();
    FD.requestDraw();
    layout();
  };
  /* ───────── Panel de pose ───────── */
  FD.animProps = function(box, title) {
    const b = curBone();
    title.textContent = "Pose · " + (b ? b.name : "");
    if (!cur()) {
      box.innerHTML = '<div class="empty">' + ic("film") + '<b>Aún no hay animaciones</b><span>Crea una para empezar a posar el modelo.</span><button class="btn primary" id="apNew">Crear animación</button></div>';
      FD.hydrateIcons(box);
      $("#apNew").onclick = () => $("#animNew").click();
      return;
    }
    let h = '<div class="sub">Animación <b>' + esc(A.name.replace(/^animation\./, "")) + "</b> · <b>" + round(A.time, 2) + " s</b> (fotograma " + Math.round(A.time / 0.05) + "). Al cambiar un valor se crea o actualiza una clave aquí.</div>";
    CH.forEach((c) => {
      const k = keyAt(b.name, c[0], A.time), v = evalChan(b.name, c[0], A.time), mol = k && !k.v;
      h += '<div class="grp"><h4><span class="cd" style="background:' + c[3] + '"></span>' + c[1] + '<span class="grow"></span>' + (k && k.v ? '<select class="mini" data-lerp="' + c[0] + '" title="Interpolación hacia esta clave"><option value=""' + (!k.lerp ? " selected" : "") + '>Lineal</option><option value="catmullrom"' + (k.lerp === "catmullrom" ? " selected" : "") + ">Suave</option></select>" : "") + '<button class="btn xs ' + (k ? "primary" : "") + '" data-key="' + c[0] + '">' + (k ? "Quitar clave" : "+ Clave") + "</button></h4>" + (mol ? '<div class="note warn">' + ic("alert") + "<span>Esta clave usa Molang; edítala en el JSON.</span></div>" : "") + '<div class="f3" data-ch="' + c[0] + '">' + ["x", "y", "z"].map((l, i) => '<label class="fld"><span class="' + l + '" data-scrub>' + l.toUpperCase() + '</span><input type="number" step="any" inputmode="decimal" data-k="' + i + '" value="' + round(v[i], 3) + '"' + (mol ? " disabled" : "") + "></label>").join("") + "</div></div>";
    });
    h += '<div class="btnrow"><button class="btn" id="apPrev">' + ic("prevkey") + 'Anterior</button><button class="btn" id="apNext">Siguiente' + ic("nextkey") + '</button></div><div class="btnrow" style="margin-top:6px"><button class="btn" id="apSmooth" title="Interpolación suave en todas las claves del hueso">' + ic("wand") + 'Suavizar hueso</button><button class="btn" id="apClear" title="Quitar todas las claves del hueso en esta animación">' + ic("eraser") + "Vaciar hueso</button></div>";
    box.innerHTML = h;
    FD.hydrateIcons(box);
    $$("[data-ch]", box).forEach((g) => {
      $$("input", g).forEach((inp) => {
        inp.onchange = () => {
          const ch = g.dataset.ch, v = evalChan(b.name, ch, A.time);
          v[+inp.dataset.k] = +inp.value || 0;
          setKey(b.name, ch, v);
          A.sel = [{ bone: b.name, ch, t: A.time }];
          FD.commit("Editar pose");
          layout();
        };
      });
    });
    $$("[data-key]", box).forEach((btn) => {
      btn.onclick = () => {
        const ch = btn.dataset.key;
        if (keyAt(b.name, ch, A.time)) {
          delKey(b.name, ch, A.time);
          FD.commit("Quitar clave");
        } else addKey(ch);
        layout();
      };
    });
    $$("[data-lerp]", box).forEach((sel) => {
      sel.onchange = () => {
        const ch = sel.dataset.lerp, k = keyAt(b.name, ch, A.time);
        if (!k) return;
        setKey(b.name, ch, k.v, A.time, sel.value);
        FD.commit("Interpolación");
        layout();
      };
    });
    $("#apPrev").onclick = () => jump(-1, b.name);
    $("#apNext").onclick = () => jump(1, b.name);
    $("#apSmooth").onclick = () => {
      CH.forEach((c) => {
        const ks = getKeys(b.name, c[0]);
        if (ks.length < 3) return;
        ks.forEach((k) => {
          if (k.v) k.lerp = "catmullrom";
        });
        writeChan(cur(), b.name, c[0], ks);
      });
      FD.commit("Suavizar hueso");
      layout();
    };
    $("#apClear").onclick = () => {
      if (!cur().bones || !cur().bones[b.name]) return;
      delete cur().bones[b.name];
      A.sel = [];
      FD.commit("Vaciar hueso");
      layout();
    };
    FD.bindScrub && FD.bindScrub(box);
  };
  /* ───────── Teclado ───────── */
  document.addEventListener("keydown", (e) => {
    if (S.mode !== "anim") return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea" || document.querySelector(".modal-bg")) return;
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (e.key === " ") {
      e.preventDefault();
      play();
    } else if (k === "k" && !mod) addKey();
    else if (mod && k === "c") {
      e.preventDefault();
      copySel();
    } else if (mod && k === "v") {
      e.preventDefault();
      pasteSel();
    } else if (mod && k === "d") {
      e.preventDefault();
      e.stopImmediatePropagation();
      dupSel();
    } else if (mod && k === "a") {
      e.preventDefault();
      e.stopImmediatePropagation();
      const b = curBone();
      if (!b) return;
      A.sel = [];
      CH.forEach((c) => getKeys(b.name, c[0]).forEach((q) => A.sel.push({ bone: b.name, ch: c[0], t: q.t })));
      paintTL();
    } else if ((e.key === "Delete" || e.key === "Backspace") && A.sel.length) {
      e.preventDefault();
      deleteSel();
    } else if (e.key === "[") jump(-1, curBone() && curBone().name);
    else if (e.key === "]") jump(1, curBone() && curBone().name);
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setTime(A.time + (e.key === "ArrowRight" ? 1 : -1) * (A.snap || 0.05));
    }
  });
  /* ───────── Historial, guardado, arranque ───────── */
  FD.hooks.snap.push((h) => {
    h.x.anim = JSON.stringify(A.root);
    h.x.aname = A.name;
    h.x.afile = A.node ? A.node.id : null;
  });
  FD.hooks.restore.push((h) => {
    if (h.x.anim) {
      A.root = JSON.parse(h.x.anim);
      A.name = h.x.aname;
      if (!A.root.animations[A.name]) A.name = Object.keys(A.root.animations)[0] || "";
      A.sel = [];
      refreshUI();
    }
  });
  FD.hooks.save.push((d, draft) => {
    if (draft) {
      d.x.anim = JSON.stringify(A.root);
      d.x.aname = A.name;
      return;
    }
    if (!A.node && S.project && Object.keys(A.root.animations || {}).length) createFile();
    if (A.node) A.node.content = JSON.stringify(A.root, null, 2);
  });
  FD.hooks.init.push(() => {
    const n = FD.pendingAnimNode || autoFind();
    if (n) useNode(n);
    else refreshUI();
    if (FD.draftData && FD.draftData.x && FD.draftData.x.anim) {
      try {
        A.root = JSON.parse(FD.draftData.x.anim);
        A.name = FD.draftData.x.aname || Object.keys(A.root.animations)[0] || "";
        refreshUI();
      } catch (e) {
      }
    }
  });
  FD.hooks.refresh.push((w) => {
    if (w === "mode") {
      if (S.mode !== "anim") play(false);
      FD.rebuild();
      layout();
    } else if (w === "all" && S.mode === "anim") layout();
  });
  FD.hooks.select.push(() => {
    if (S.mode === "anim") layout();
  });
  FD.renameBone = (o, nn) => {
    Object.keys(A.root.animations || {}).forEach((k) => {
      const a = A.root.animations[k];
      if (a.bones && a.bones[o]) {
        a.bones[nn] = a.bones[o];
        delete a.bones[o];
      }
    });
    layout();
  };
})();

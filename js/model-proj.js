/* FireDex · Modelador — proyecto: detección de archivos, texturas, importar/exportar, plantillas */
(function() {
  "use strict";
  const FD = window.FD;
  if (!FD) return;
  const { S, TX, $, $$, ic, toast, modal, ask, confirmDlg, esc, round, clamp } = FD;
  const P = FD.proj = {};
  const uid = FD.uid;
  const stripJson = FD.stripJson;
  const tryJson = (t) => {
    try {
      return JSON.parse(stripJson(t || ""));
    } catch (e) {
      return null;
    }
  };
  /* ───────── Estructura del proyecto ───────── */
  function packRoots(root) {
    const out = [];
    (function walk(n, path) {
      const m = (n.children || []).find((c) => c.type === "file" && c.name.toLowerCase() === "manifest.json");
      if (m) {
        const t = m.content || "";
        out.push({ node: n, path, kind: /"resources"/.test(t) ? "rp" : /"data"|"script"/.test(t) ? "bp" : "other" });
      }
      (n.children || []).forEach((c) => {
        if (c.type === "folder") walk(c, path ? path + "/" + c.name : c.name);
      });
    })(root, "");
    return out;
  }
  P.packRoots = packRoots;
  P.rpRoot = (root) => {
    root = root || S.project && S.project.root;
    if (!root) return null;
    if (root.kind === "model") return { node: root, path: "" };
    return packRoots(root).find((x) => x.kind === "rp") || null;
  };
  P.bpRoot = (root) => packRoots(root || S.project.root).find((x) => x.kind === "bp") || null;
  /* carpeta base donde van models/, textures/, animations/… */
  P.base = function() {
    if (!S.project) return null;
    const rp = P.rpRoot();
    if (rp) return rp.node;
    const root = S.project.root;
    let n = S.node && S.node.id ? FD.findParent(S.node.id, root) : null;
    while (n && n !== root) {
      if ((n.children || []).some((c) => c.type === "folder" && c.name.toLowerCase() === "models")) return n;
      n = FD.findParent(n.id, root);
    }
    return root;
  };
  P.ensureDir = function(base, path) {
    let cur = base;
    path.split("/").filter(Boolean).forEach((seg) => {
      let n = (cur.children || []).find((c) => c.type === "folder" && c.name.toLowerCase() === seg.toLowerCase());
      if (!n) {
        n = { id: uid(), type: "folder", name: seg, open: true, children: [] };
        cur.children = cur.children || [];
        cur.children.push(n);
      }
      cur = n;
    });
    return cur;
  };
  P.putFile = function(dir, name, content, overwrite) {
    const ex = dir.children.find((c) => c.type === "file" && c.name === name);
    if (ex) {
      if (overwrite) {
        ex.content = content;
        return ex;
      }
      let k = 1;
      const m = name.match(/^(.*?)((?:\.[a-z]+)*)$/i), b = m[1], ext = m[2];
      while (dir.children.some((c) => c.name === b + "_" + k + ext)) k++;
      name = b + "_" + k + ext;
    }
    const n = { id: uid(), type: "file", name, content };
    dir.children.push(n);
    return n;
  };
  P.pathOf = function(node) {
    const f = FD.allFiles(S.project.root).find((x) => x.node === node);
    return f ? f.path : node.name;
  };
  const KIND_DIR = { geo: "models/entity", anim: "animations", client: "entity", rc: "render_controllers", attachable: "attachables", tex: "textures/entity" };
  P.dirFor = (kind) => P.ensureDir(P.base(), KIND_DIR[kind]);
  /* Índice de todo lo útil que hay en el proyecto */
  P.index = function() {
    const ix = { geos: [], anims: [], ents: [], texs: [], rcs: [] };
    if (!S.project) return ix;
    FD.allFiles(S.project.root).forEach((f) => {
      const n = f.node, name = n.name;
      if (/\.(png|tga|jpg|jpeg)$/i.test(name)) {
        ix.texs.push({ node: n, path: f.path, loaded: /^data:image/.test(n.content || "") });
        return;
      }
      if (!/\.json$/i.test(name) || !n.content) return;
      const t = n.content;
      if (/minecraft:geometry|"geometry\./.test(t)) {
        const j = tryJson(t);
        if (j) {
          const ids = (Array.isArray(j["minecraft:geometry"]) ? j["minecraft:geometry"].map((g) => g.description && g.description.identifier) : []).concat(Object.keys(j).filter((k) => k.indexOf("geometry.") === 0)).filter(Boolean);
          if (ids.length) ix.geos.push({ node: n, path: f.path, ids });
        }
      } else if (/"animations"/.test(t)) {
        const j = tryJson(t);
        if (j && j.animations && typeof j.animations === "object") ix.anims.push({ node: n, path: f.path, ids: Object.keys(j.animations), json: j });
      } else if (/minecraft:client_entity/.test(t)) {
        const j = tryJson(t);
        const d = j && j["minecraft:client_entity"] && j["minecraft:client_entity"].description;
        if (d) ix.ents.push({ node: n, path: f.path, desc: d, json: j });
      } else if (/"render_controllers"/.test(t)) ix.rcs.push({ node: n, path: f.path });
    });
    return ix;
  };
  /* "textures/entity/foo" → archivo del proyecto */
  P.resolveTex = function(ix, resPath) {
    if (!resPath) return null;
    const key = String(resPath).replace(/\\/g, "/").replace(/\.(png|tga|jpg|jpeg)$/i, "").toLowerCase();
    const hits = ix.texs.filter((t) => {
      const p = t.path.replace(/\\/g, "/").replace(/\.(png|tga|jpg|jpeg)$/i, "").toLowerCase();
      return p === key || p.endsWith("/" + key);
    });
    return hits.find((h) => h.loaded) || hits[0] || null;
  };
  P.entityFor = function(ix, geoId) {
    return ix.ents.filter((e) => e.desc.geometry && Object.values(e.desc.geometry).indexOf(geoId) >= 0);
  };
  P.link = { ents: [], texMap: {} };
  /* ───────── Texturas: detección al abrir ───────── */
  async function autoTextures() {
    if (!S.project) return;
    const ix = P.index(), gid = FD.geoName(FD.G());
    const ents = P.entityFor(ix, gid);
    P.link.ents = ents;
    const wanted = [];
    ents.forEach((e) => {
      Object.keys(e.desc.textures || {}).forEach((k) => {
        const hit = P.resolveTex(ix, e.desc.textures[k]);
        if (hit && !wanted.some((w) => w.hit.node === hit.node)) wanted.push({ key: k, hit, ent: e });
      });
    });
    if (!wanted.length) {
      const base = S.node.name.replace(/\.(geo|model)?\.?json$/i, "").toLowerCase();
      const g = ix.texs.find((t) => t.loaded && t.node.name.toLowerCase().replace(/\.\w+$/, "") === base) || ix.texs.find((t) => t.loaded && t.node.name.toLowerCase().indexOf(base) >= 0);
      if (g) wanted.push({ key: "", hit: g, ent: null });
    }
    if (!wanted.length) return;
    const placeholder = TX.list[0];
    let first = true, loaded = 0;
    for (const w of wanted) {
      if (!/^data:image/.test(w.hit.node.content || "")) continue;
      const t = await FD.addTexture(w.hit.node.content, w.hit.node.name, w.hit.node, first);
      if (t) {
        t.role = w.key;
        loaded++;
        first = false;
      }
    }
    if (loaded && placeholder && !placeholder.node && FD.pixelsBlank(placeholder)) {
      TX.list = TX.list.filter((t) => t !== placeholder);
      if (TX.active === placeholder) FD.activate(TX.list[0]);
    }
    if (loaded) {
      const e = ents[0];
      toast(loaded + (loaded > 1 ? " texturas detectadas" : " textura detectada") + (e ? " por la entidad «" + e.desc.identifier + "»" : " por nombre"), 3200, "ok");
    }
  }
  FD.hooks.init.push(autoTextures);
  /* dónde se guarda una textura nueva */
  P.nodeForTexture = function(t) {
    let sub = "textures/entity";
    const ent = P.link.ents[0];
    const def = ent && ent.desc.textures && (ent.desc.textures.default || Object.values(ent.desc.textures)[0]);
    if (def && /\//.test(def)) {
      const d = def.replace(/\\/g, "/").replace(/\/[^/]*$/, "");
      if (/^textures\//i.test(d)) sub = d;
    }
    const dir = P.ensureDir(P.base(), sub);
    let name = (t.name || "textura.png").replace(/[^a-z0-9_.-]/gi, "_").toLowerCase();
    if (!/\.png$/i.test(name)) name = name.replace(/\.\w+$/, "") + ".png";
    return P.putFile(dir, name, t.canvas.toDataURL("image/png"), false);
  };
  P.texResPath = function(t) {
    t = t || TX.active;
    if (t && t.node && S.project) {
      const p = P.pathOf(t.node).replace(/\\/g, "/");
      const i = p.toLowerCase().lastIndexOf("textures/");
      if (i >= 0) return p.slice(i).replace(/\.\w+$/, "");
    }
    return "textures/entity/" + FD.geoSlug();
  };
  /* ───────── Operaciones con texturas ───────── */
  P.resizeTexture = function(t, w, h, mode, silent) {
    if (!t) return;
    w = clamp(Math.round(w), 1, 4096);
    h = clamp(Math.round(h), 1, 4096);
    const old = document.createElement("canvas");
    old.width = t.canvas.width;
    old.height = t.canvas.height;
    old.getContext("2d").drawImage(t.canvas, 0, 0);
    t.canvas.width = w;
    t.canvas.height = h;
    t.ctx.imageSmoothingEnabled = false;
    if (mode === "scale") t.ctx.drawImage(old, 0, 0, w, h);
    else t.ctx.drawImage(old, 0, 0);
    t.snap = t.cur = FD.snapOf(t);
    t.dirty = true;
    if (t === TX.active) {
      FD.activate(t, true);
      FD.uploadTex();
    }
    if (!silent) {
      FD.pushHist("Redimensionar textura");
      FD.markDirty();
      FD.refreshAll();
    }
    FD.fillTexSel();
    P.renderTexList();
  };
  P.matchSizes = async function() {
    const t = TX.active;
    if (!t) return;
    if (S.texW === t.canvas.width && S.texH === t.canvas.height) return toast("El modelo y la imagen ya miden lo mismo (" + S.texW + "×" + S.texH + ")");
    const r = await ask({ title: "Igualar tamaños", text: "El modelo usa <b>" + S.texW + "×" + S.texH + "</b> y la imagen mide <b>" + t.canvas.width + "×" + t.canvas.height + "</b>.", fields: [{ id: "m", label: "¿Qué quieres hacer?", type: "select", value: "model", options: [["model", "Ajustar el modelo a la imagen (conserva la imagen)"], ["scale", "Escalar la imagen al tamaño del modelo"], ["expand", "Ampliar el lienzo de la imagen (sin escalar)"]] }], ok: "Aplicar" });
    if (!r) return;
    if (r.m === "model") {
      const kx = t.canvas.width / S.texW, ky = t.canvas.height / S.texH;
      FD.allCubes().forEach((c) => {
        if (Array.isArray(c.uv)) c.uv = [Math.round(c.uv[0] * kx), Math.round(c.uv[1] * ky)];
        else if (c.uv) FD.FACE_NAMES.forEach((f) => {
          const q = c.uv[f];
          if (q) {
            q.uv = [q.uv[0] * kx, q.uv[1] * ky];
            q.uv_size = [q.uv_size[0] * kx, q.uv_size[1] * ky];
          }
        });
      });
      if (Math.abs(kx - ky) > 1e-6 || kx !== 1) toast("Aviso: los cubos de caja dependen de su tamaño; revisa el mapa UV.", 3500);
      S.texW = t.canvas.width;
      S.texH = t.canvas.height;
      FD.writeDims();
      FD.commit("Ajustar modelo a la imagen");
    } else if (r.m === "scale") {
      P.resizeTexture(t, S.texW, S.texH, "scale");
    } else P.resizeTexture(t, S.texW, S.texH, "expand");
  };
  P.newTexture = async function() {
    const r = await ask({ title: "Nueva textura", fields: [
      { id: "name", label: "Nombre del archivo", value: FD.geoSlug() + (TX.list.length ? "_" + (TX.list.length + 1) : "") + ".png" },
      { id: "w", label: "Ancho", type: "number", value: S.texW, min: 1, max: 4096 },
      { id: "h", label: "Alto", type: "number", value: S.texH, min: 1, max: 4096 },
      { id: "fill", label: "Relleno inicial", type: "select", value: "colors", options: [["colors", "Colores de cada cubo (recomendado)"], ["none", "Transparente"]] }
    ], ok: "Crear", validate: (v) => !v.name.trim() ? "Escribe un nombre" : !(v.w >= 1 && v.h >= 1) ? "Tamaño no válido" : "" });
    if (!r) return;
    const t = FD.makeTex(r.w, r.h, r.name.trim().replace(/\.png$/i, "") + ".png");
    t.dirty = true;
    TX.list.push(t);
    FD.activate(t);
    if (r.w !== S.texW || r.h !== S.texH) {
      S.texW = r.w;
      S.texH = r.h;
      FD.writeDims();
    }
    if (r.fill === "colors") FD.paintBaseColors(true, false);
    t.snap = t.cur = FD.snapOf(t);
    FD.rebuild();
    FD.pushHist("Nueva textura");
    FD.markDirty();
    FD.refreshAll();
    FD.fillTexSel();
    P.renderTexList();
    toast("Textura creada: " + t.name);
  };
  const readDataURL = (f) => new Promise((ok) => {
    const fr = new FileReader();
    fr.onload = () => ok(fr.result);
    fr.onerror = () => ok(null);
    fr.readAsDataURL(f);
  });
  P.importTextures = async function(files) {
    let last = null;
    for (const f of files) {
      const src = await readDataURL(f);
      if (!src) continue;
      const t = await FD.addTexture(src, f.name.replace(/\.\w+$/, "") + ".png", null, true);
      if (t) {
        t.dirty = true;
        last = t;
      }
    }
    if (!last) return toast("No se pudo leer la imagen", 2500, "bad");
    FD.pushHist("Importar textura");
    FD.markDirty();
    FD.refreshAll();
    P.renderTexList();
    toast("Textura importada: " + last.name + " (" + last.canvas.width + "×" + last.canvas.height + ")");
    if (last.canvas.width !== S.texW || last.canvas.height !== S.texH) setTimeout(() => P.matchSizes(), 300);
  };
  P.removeTexture = async function(t) {
    if (!await confirmDlg("¿Quitar la textura «" + t.name + "»" + (t.node ? " y borrar su archivo del proyecto" : "") + "?", { ok: "Quitar", danger: true })) return;
    if (t.node && S.project) {
      const par = FD.findParent(t.node.id, S.project.root);
      if (par) par.children = par.children.filter((c) => c !== t.node);
    }
    TX.list = TX.list.filter((x) => x !== t);
    if (!TX.list.length) FD.newBlankTex(S.texW, S.texH);
    if (TX.active === t) FD.activate(TX.list[0]);
    FD.markDirty();
    FD.fillTexSel();
    P.renderTexList();
    FD.refreshAll();
  };
  P.renameTexture = async function(t) {
    const r = await ask({ title: "Renombrar textura", fields: [{ id: "n", label: "Nombre", value: t.name.replace(/\.png$/i, "") }], validate: (v) => !/^[a-z0-9_\-.]+$/i.test(v.n.trim()) ? "Usa letras, números, guion y guion bajo" : "" });
    if (!r) return;
    t.name = r.n.trim().replace(/\.png$/i, "") + ".png";
    if (t.node) t.node.name = t.name;
    FD.markDirty();
    FD.fillTexSel();
    P.renderTexList();
  };
  P.dupTexture = function(t) {
    const c = FD.makeTex(t.canvas.width, t.canvas.height, t.name.replace(/\.png$/i, "") + "_copia.png");
    c.ctx.drawImage(t.canvas, 0, 0);
    c.snap = c.cur = FD.snapOf(c);
    c.dirty = true;
    TX.list.push(c);
    FD.activate(c);
    FD.markDirty();
    P.renderTexList();
  };
  /* ───────── Panel de texturas ───────── */
  P.renderTexList = function() {
    const box = $("#texList");
    if (!box) return;
    const ix = P.index();
    const loadedNodes = new Set(TX.list.map((t) => t.node).filter(Boolean));
    const others = ix.texs.filter((t) => !loadedNodes.has(t.node) && t.loaded);
    const ent = P.link.ents[0];
    let h = '<div class="tbar"><button class="btn sm primary" data-ta="new">' + ic("plus") + 'Nueva</button><button class="btn sm" data-ta="import">' + ic("upload") + 'Importar</button><button class="btn sm" data-ta="base" title="Rellena la textura activa con el color de cada cubo">' + ic("palette") + 'Base</button><button class="btn sm" data-ta="fit" title="Igualar tamaño del modelo y de la imagen">' + ic("expand") + "Ajustar</button></div>";
    if (ent) h += '<div class="note ok">' + ic("plug") + "<span>Entidad <b>" + esc(ent.desc.identifier) + "</b> usa este modelo.</span></div>";
    h += TX.list.map((t) => {
      const act = t === TX.active, mism = t.canvas.width !== S.texW || t.canvas.height !== S.texH;
      return '<div class="tcard' + (act ? " on" : "") + '" data-tid="' + t.id + '"><canvas class="tth" width="48" height="48" data-th="' + t.id + '"></canvas><div class="tinfo"><b>' + esc(t.name) + (t.dirty ? '<i class="dd" title="Sin guardar"></i>' : "") + "</b><small>" + t.canvas.width + "×" + t.canvas.height + (t.role ? " · " + esc(t.role) : "") + (t.node ? "" : " · sin archivo") + '</small>' + (mism && act ? '<small class="warnc">≠ modelo ' + S.texW + "×" + S.texH + "</small>" : "") + '</div><div class="tact"><button class="ib sm" data-tb="ren" title="Renombrar">' + ic("pencil") + '</button><button class="ib sm" data-tb="dup" title="Duplicar">' + ic("copy") + '</button><button class="ib sm" data-tb="dl" title="Descargar PNG">' + ic("download") + '</button><button class="ib sm" data-tb="rsz" title="Redimensionar">' + ic("scale") + '</button><button class="ib sm" data-tb="del" title="Quitar">' + ic("trash") + "</button></div></div>";
    }).join("");
    if (others.length) h += '<h5 class="sech">Otras imágenes del proyecto</h5>' + others.slice(0, 40).map((t, i) => '<div class="tcard dim" data-open="' + i + '"><canvas class="tth" width="48" height="48" data-oth="' + i + '"></canvas><div class="tinfo"><b>' + esc(t.node.name) + "</b><small>" + esc(t.path) + '</small></div><div class="tact"><button class="btn xs">Abrir</button></div></div>').join("");
    box.innerHTML = h;
    hydrateThumbs(box, others);
    FD.hydrateIcons(box);
    box.onclick = async (e) => {
      const ta = e.target.closest("[data-ta]");
      if (ta) {
        const a = ta.dataset.ta;
        if (a === "new") P.newTexture();
        else if (a === "import") $("#texIn").click();
        else if (a === "base") $("#uvBaseBtn").click();
        else if (a === "fit") P.matchSizes();
        return;
      }
      const op = e.target.closest("[data-open]");
      if (op) {
        const o = others[+op.dataset.open];
        const t = await FD.addTexture(o.node.content, o.node.name, o.node, true);
        if (t) {
          FD.pushHist("Abrir textura");
          P.renderTexList();
          FD.refreshAll();
        }
        return;
      }
      const card = e.target.closest(".tcard[data-tid]");
      if (!card) return;
      const t = TX.list.find((x) => x.id === card.dataset.tid);
      const b = e.target.closest("[data-tb]");
      if (b) {
        const a = b.dataset.tb;
        if (a === "ren") P.renameTexture(t);
        else if (a === "dup") P.dupTexture(t);
        else if (a === "dl") FD.download(t.name, t.canvas.toDataURL("image/png"));
        else if (a === "del") P.removeTexture(t);
        else if (a === "rsz") {
          const r = await ask({ title: "Redimensionar textura", fields: [{ id: "w", label: "Ancho", type: "number", value: t.canvas.width, min: 1, max: 4096 }, { id: "h", label: "Alto", type: "number", value: t.canvas.height, min: 1, max: 4096 }, { id: "m", label: "Modo", type: "select", value: "scale", options: [["scale", "Escalar el contenido"], ["expand", "Cambiar el lienzo (recortar/ampliar)"]] }], ok: "Aplicar" });
          if (r) P.resizeTexture(t, r.w, r.h, r.m);
        }
        return;
      }
      if (t !== TX.active) {
        FD.activate(t);
        P.renderTexList();
      }
    };
  };
  function hydrateThumbs(box, others) {
    $$("canvas[data-th]", box).forEach((c) => {
      const t = TX.list.find((x) => x.id === c.dataset.th);
      if (t) drawThumb(c, t.canvas);
    });
    $$("canvas[data-oth]", box).forEach((c) => {
      const o = others[+c.dataset.oth];
      FD.loadImage(o.node.content).then((im) => im && drawThumb(c, im));
    });
  }
  function drawThumb(c, src) {
    const x = c.getContext("2d"), w = src.width, h = src.height, k = Math.min(48 / w, 48 / h);
    x.clearRect(0, 0, 48, 48);
    x.imageSmoothingEnabled = false;
    x.drawImage(src, (48 - w * k) / 2, (48 - h * k) / 2, w * k, h * k);
  }
  FD.hooks.refresh.push((w) => {
    if (w === "tex" || w === "texpaint" || w === "saved" || w === "init") P.renderTexList();
  });
  /* ───────── Cargar un modelo (importar / plantilla) ───────── */
  P.loadRoot = function(root, label) {
    S.root = root;
    S.geos = FD.parseGeos(root);
    S.gi = 0;
    S.sel = null;
    S.multi = [];
    FD.readDims();
    const tw = TX.active ? TX.active.canvas.width : S.texW;
    FD.rebuild();
    FD.commit(label || "Cargar modelo");
    FD.frameModel();
    return tw;
  };
  /* ───────── Plantillas ───────── */
  const cube = (o, s, uv, extra) => Object.assign({ origin: o, size: s, uv: uv || [0, 0] }, extra || {});
  const TEMPLATES = {
    humanoid: { name: "Humanoide", desc: "Cabeza, torso, brazos y piernas (estilo jugador)", w: 64, h: 64, bones: () => [
      { name: "root", pivot: [0, 0, 0] },
      { name: "body", parent: "root", pivot: [0, 24, 0], cubes: [cube([-4, 12, -2], [8, 12, 4])] },
      { name: "head", parent: "body", pivot: [0, 24, 0], cubes: [cube([-4, 24, -4], [8, 8, 8])] },
      { name: "rightArm", parent: "body", pivot: [-5, 22, 0], cubes: [cube([-8, 12, -2], [4, 12, 4])] },
      { name: "leftArm", parent: "body", pivot: [5, 22, 0], cubes: [cube([4, 12, -2], [4, 12, 4], [0, 0], { mirror: true })] },
      { name: "rightLeg", parent: "root", pivot: [-1.9, 12, 0], cubes: [cube([-3.9, 0, -2], [4, 12, 4])] },
      { name: "leftLeg", parent: "root", pivot: [1.9, 12, 0], cubes: [cube([-0.1, 0, -2], [4, 12, 4], [0, 0], { mirror: true })] }
    ] },
    quad: { name: "Cuadrúpedo", desc: "Cuerpo, cabeza y cuatro patas (vaca, cerdo, lobo…)", w: 64, h: 64, bones: () => [
      { name: "root", pivot: [0, 0, 0] },
      { name: "body", parent: "root", pivot: [0, 13, 2], cubes: [cube([-5, 9, -4], [10, 8, 16])] },
      { name: "head", parent: "body", pivot: [0, 16, -4], cubes: [cube([-4, 12, -10], [8, 8, 6])] },
      { name: "legFrontR", parent: "root", pivot: [-3, 9, -2], cubes: [cube([-5, 0, -4], [4, 9, 4])] },
      { name: "legFrontL", parent: "root", pivot: [3, 9, -2], cubes: [cube([1, 0, -4], [4, 9, 4], [0, 0], { mirror: true })] },
      { name: "legBackR", parent: "root", pivot: [-3, 9, 9], cubes: [cube([-5, 0, 7], [4, 9, 4])] },
      { name: "legBackL", parent: "root", pivot: [3, 9, 9], cubes: [cube([1, 0, 7], [4, 9, 4], [0, 0], { mirror: true })] }
    ] },
    bird: { name: "Ave", desc: "Cuerpo, cabeza, pico, alas y patas", w: 32, h: 32, bones: () => [
      { name: "root", pivot: [0, 0, 0] },
      { name: "body", parent: "root", pivot: [0, 8, 0], cubes: [cube([-3, 6, -3], [6, 6, 8])] },
      { name: "head", parent: "body", pivot: [0, 12, -3], cubes: [cube([-2, 12, -6], [4, 5, 4])] },
      { name: "beak", parent: "head", pivot: [0, 14, -6], cubes: [cube([-1, 13, -8], [2, 2, 2])] },
      { name: "wingR", parent: "body", pivot: [-3, 11, 0], cubes: [cube([-4, 7, -2], [1, 5, 6])] },
      { name: "wingL", parent: "body", pivot: [3, 11, 0], cubes: [cube([3, 7, -2], [1, 5, 6], [0, 0], { mirror: true })] },
      { name: "legR", parent: "root", pivot: [-1.5, 6, 0], cubes: [cube([-2, 0, -1], [1, 6, 1])] },
      { name: "legL", parent: "root", pivot: [1.5, 6, 0], cubes: [cube([1, 0, -1], [1, 6, 1])] }
    ] },
    block: { name: "Cubo simple", desc: "Un solo cubo de 16×16×16", w: 64, h: 32, bones: () => [
      { name: "root", pivot: [0, 0, 0], cubes: [cube([-8, 0, -8], [16, 16, 16])] }
    ] }
  };
  P.templates = TEMPLATES;
  P.templateRoot = function(key, id) {
    const T = TEMPLATES[key];
    return { format_version: "1.12.0", "minecraft:geometry": [{ description: { identifier: id, texture_width: T.w, texture_height: T.h, visible_bounds_width: 3, visible_bounds_height: 3, visible_bounds_offset: [0, 1, 0] }, bones: T.bones() }] };
  };
  function packRootUV(root) {
    const g = root["minecraft:geometry"][0], cs = [];
    g.bones.forEach((b) => (b.cubes || []).forEach((c) => cs.push(c)));
    const W = g.description.texture_width, bw = (c) => 2 * (Math.ceil(c.size[0]) + Math.ceil(c.size[2])), bh = (c) => Math.ceil(c.size[1]) + Math.ceil(c.size[2]);
    const list = cs.filter((c) => !c.mirror).concat([]);
    const order = cs.slice().sort((a, b) => bh(b) - bh(a));
    let x = 0, y = 0, rh = 0;
    const done = new Map();
    order.forEach((c) => {
      const key = c.size.join("x") + "|" + (c.mirror ? 1 : 0);
      const w = bw(c), h = bh(c);
      if (x + w > W) {
        x = 0;
        y += rh;
        rh = 0;
      }
      c.uv = [x, y];
      x += w;
      rh = Math.max(rh, h);
    });
    g.description.texture_height = Math.max(g.description.texture_height, 1 << Math.ceil(Math.log2(y + rh)));
    return root;
  }
  P.newFromTemplate = async function() {
    const r = await ask({ title: "Nuevo modelo desde plantilla", fields: [
      { id: "t", label: "Plantilla", type: "select", value: "humanoid", options: Object.keys(TEMPLATES).map((k) => [k, TEMPLATES[k].name + " — " + TEMPLATES[k].desc]) },
      { id: "name", label: "Nombre del modelo", value: "mi_modelo", hint: "Será el identificador <b>geometry.nombre</b> y el nombre del archivo." },
      { id: "where", label: "Dónde crearlo", type: "select", value: S.project ? "file" : "replace", options: (S.project ? [["file", "Como archivo nuevo en el proyecto"]] : []).concat([["replace", "Reemplazar el modelo actual (se puede deshacer)"]]) }
    ], ok: "Crear", validate: (v) => !/^[a-z0-9_]+$/i.test(v.name.trim()) ? "El nombre solo admite letras, números y guion bajo" : "" });
    if (!r) return;
    const slug = FD.slugOf(r.name), root = packRootUV(P.templateRoot(r.t, "geometry." + slug));
    if (r.where === "replace") {
      const old = JSON.stringify(S.root);
      P.loadRoot(root, "Plantilla " + TEMPLATES[r.t].name);
      FD.rebuild();
      FD.refreshAll();
      toast("Modelo creado: " + TEMPLATES[r.t].name);
      return;
    }
    await FD.save();
    const dir = P.dirFor("geo");
    const n = P.putFile(dir, slug + ".geo.json", JSON.stringify(root, null, 2), false);
    await FD.idb.put(FD.STORE_DATA, Object.assign({}, S.project, { id: S.project.id, name: S.project.name, root: S.project.root }));
    location.href = "/model/?id=" + encodeURIComponent(S.project.id) + "&file=" + encodeURIComponent(n.id);
  };
  /* ───────── Abrir otro modelo del proyecto ───────── */
  P.openModel = async function() {
    if (!S.project) return toast("Abre un proyecto para ver sus modelos");
    const ix = P.index();
    if (!ix.geos.length) return toast("Este proyecto no tiene modelos");
    const cur = S.node.id;
    modal("Modelos del proyecto", '<div class="sub">Se guardan los cambios y se abre el modelo elegido.</div>' + ix.geos.map((g, i) => '<div class="hrow" data-g="' + i + '">' + ic("cube") + "<span><b>" + esc(g.node.name) + "</b><br><small>" + esc(g.path) + " · " + esc(g.ids.join(", ")) + "</small></span>" + (g.node.id === cur ? "<small>abierto</small>" : "") + "</div>").join(""), [{ label: "Cerrar" }], (el, api) => {
      el.addEventListener("click", async (e) => {
        const r = e.target.closest("[data-g]");
        if (!r) return;
        const g = ix.geos[+r.dataset.g];
        if (g.node.id === cur) return api.close();
        await FD.save();
        location.href = "/model/?id=" + encodeURIComponent(S.project.id) + "&file=" + encodeURIComponent(g.node.id);
      });
    });
  };
  /* ───────── Importar archivos (geo, textura, animaciones, entidad, zip) ───────── */
  const kindOf = (j) => {
    if (!j || typeof j !== "object") return "other";
    if (j["minecraft:geometry"] || Object.keys(j).some((k) => k.indexOf("geometry.") === 0)) return "geo";
    if (j.animations && typeof j.animations === "object") return "anim";
    if (j["minecraft:client_entity"]) return "client";
    if (j.render_controllers) return "rc";
    if (j["minecraft:attachable"]) return "attachable";
    if (j.header && j.modules) return "manifest";
    return "other";
  };
  async function importGeo(j, fname, ask1) {
    const base = FD.slugOf(fname.replace(/\.(geo\.)?json$/i, ""));
    let mode = "file";
    if (ask1) {
      const r = await ask({ title: "Importar modelo «" + fname + "»", fields: [{ id: "m", label: "¿Qué hacer con él?", type: "select", value: S.project ? "file" : "replace", options: (S.project ? [["file", "Guardarlo como archivo nuevo en el proyecto"]] : []).concat([["replace", "Reemplazar el modelo abierto"], ["add", "Añadirlo como otra geometría de este archivo"]]) }], ok: "Importar" });
      if (!r) return null;
      mode = r.m;
    } else if (!S.project) mode = "replace";
    if (mode === "replace") {
      P.loadRoot(j, "Importar modelo");
      return "reemplazado";
    }
    if (mode === "add") {
      const gs = FD.parseGeos(j);
      S.root["minecraft:geometry"] = S.root["minecraft:geometry"] || [];
      gs.forEach((g) => {
        if (g.legacy) S.root["minecraft:geometry"].push({ description: { identifier: g.key, texture_width: g.obj.texturewidth || 64, texture_height: g.obj.textureheight || 64 }, bones: g.obj.bones });
        else S.root["minecraft:geometry"].push(g.obj);
      });
      S.geos = FD.parseGeos(S.root);
      FD.commit("Añadir geometrías");
      return "añadido";
    }
    const n = P.putFile(P.dirFor("geo"), base + ".geo.json", JSON.stringify(j, null, 2), false);
    FD.markDirty();
    return { file: n };
  }
  P.importFiles = async function(files, opts) {
    files = Array.from(files || []);
    if (!files.length) return;
    const log = [], images = files.filter((f) => /^image\//.test(f.type) || /\.(png|jpe?g|webp)$/i.test(f.name));
    const rest = files.filter((f) => images.indexOf(f) < 0);
    if (images.length) {
      await P.importTextures(images);
      log.push(images.length + " textura(s)");
    }
    let openAfter = null;
    for (const f of rest) {
      if (/\.(zip|mcpack|mcaddon|mctemplate)$/i.test(f.name)) {
        const n = await importZip(f);
        if (n) log.push(n);
        continue;
      }
      if (!/\.json$/i.test(f.name)) {
        log.push(f.name + ": formato no admitido");
        continue;
      }
      const j = tryJson(await f.text());
      if (!j) {
        log.push(f.name + ": JSON no válido");
        continue;
      }
      const k = kindOf(j);
      if (k === "geo") {
        const r = await importGeo(j, f.name, !(opts && opts.quiet));
        if (r && r.file) {
          openAfter = r.file;
          log.push("Modelo «" + r.file.name + "» guardado");
        } else if (r) log.push("Modelo " + r);
      } else if (k === "anim") {
        if (FD.animApi) {
          const n = await FD.animApi.importRoot(j, f.name);
          if (n != null) log.push(n + " animación(es)");
        } else log.push("Animaciones no disponibles");
      } else if (S.project && KIND_DIR[k]) {
        P.putFile(P.dirFor(k), f.name, JSON.stringify(j, null, 2), false);
        FD.markDirty();
        log.push(f.name + " → " + KIND_DIR[k]);
      } else log.push(f.name + ": tipo de archivo no reconocido");
    }
    if (log.length) toast("Importado: " + log.join(" · "), 4500, "ok");
    if (openAfter && await confirmDlg("¿Abrir ahora el modelo «" + openAfter.name + "»?", { ok: "Abrir" })) {
      await FD.save();
      location.href = "/model/?id=" + encodeURIComponent(S.project.id) + "&file=" + encodeURIComponent(openAfter.id);
    }
    P.renderTexList();
    FD.refreshAll();
  };
  async function importZip(f) {
    if (!window.JSZip) return toast("Falta la librería JSZip", 2500, "bad");
    if (!S.project) {
      toast("Abre un proyecto para importar paquetes", 3000, "bad");
      return null;
    }
    let z;
    try {
      z = await JSZip.loadAsync(f);
    } catch (e) {
      toast("No se pudo abrir el paquete", 3000, "bad");
      return null;
    }
    const counts = { geo: 0, tex: 0, anim: 0, client: 0, rc: 0, attachable: 0 };
    const known = /(?:^|\/)((?:models|textures|animations|entity|render_controllers|attachables)\/.+)$/i;
    let first = null;
    for (const name of Object.keys(z.files)) {
      const e = z.files[name];
      if (e.dir) continue;
      const m = name.match(known);
      if (!m) continue;
      const rel = m[1].replace(/\\/g, "/");
      const parts = rel.split("/"), file = parts.pop();
      if (/^textures\//i.test(rel) && !/\.(png|jpg|jpeg|tga)$/i.test(file)) continue;
      if (/^textures\//i.test(rel) && /\.tga$/i.test(file)) continue;
      const dir = P.ensureDir(P.base(), parts.join("/"));
      if (/\.(png|jpg|jpeg)$/i.test(file)) {
        const b64 = await e.async("base64");
        P.putFile(dir, file, "data:image/" + (/png$/i.test(file) ? "png" : "jpeg") + ";base64," + b64, false);
        counts.tex++;
      } else if (/\.json$/i.test(file)) {
        const txt = await e.async("string");
        const j = tryJson(txt);
        const n = P.putFile(dir, file, j ? JSON.stringify(j, null, 2) : txt, false);
        const k = j ? kindOf(j) : "other";
        if (counts[k] != null) counts[k]++;
        if (k === "geo" && !first) first = n;
      }
    }
    FD.markDirty();
    const tot = Object.values(counts).reduce((a, b) => a + b, 0);
    if (!tot) {
      toast("El paquete no contiene modelos, texturas ni animaciones", 3500, "bad");
      return null;
    }
    return "Paquete: " + counts.geo + " modelos, " + counts.tex + " texturas, " + counts.anim + " animaciones, " + counts.client + " entidades";
  }
  P.pickFiles = () => $("#packIn").click();
  $("#packIn").onchange = (e) => {
    const f = Array.from(e.target.files);
    e.target.value = "";
    P.importFiles(f);
  };
  $("#texIn").onchange = (e) => {
    const f = Array.from(e.target.files);
    e.target.value = "";
    P.importTextures(f);
  };
  $("#fileIn").onchange = (e) => {
    const f = Array.from(e.target.files);
    e.target.value = "";
    P.importFiles(f);
  };
  /* arrastrar y soltar archivos sobre la página */
  let dcount = 0;
  const dz = $("#vdrop");
  const hasFiles = (e) => e.dataTransfer && Array.from(e.dataTransfer.types || []).indexOf("Files") >= 0;
  window.addEventListener("dragenter", (e) => {
    if (!hasFiles(e)) return;
    dcount++;
    dz.hidden = false;
  });
  window.addEventListener("dragleave", (e) => {
    if (!hasFiles(e)) return;
    dcount = Math.max(0, dcount - 1);
    if (!dcount) dz.hidden = true;
  });
  window.addEventListener("dragover", (e) => {
    if (hasFiles(e)) e.preventDefault();
  });
  window.addEventListener("drop", (e) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    dcount = 0;
    dz.hidden = true;
    P.importFiles(e.dataTransfer.files);
  });
  /* ───────── Exportar ───────── */
  P.exportGeo = function() {
    FD.writeDims();
    FD.download((S.node.name || "modelo.geo.json").replace(/\.json$/i, "").replace(/\.geo$/i, "") + ".geo.json", JSON.stringify(S.root, null, 2), "application/json");
  };
  P.downloadTexture = () => TX.active && FD.download(TX.active.name, TX.active.canvas.toDataURL("image/png"));
  P.saveTexture = async function() {
    const t = TX.active;
    if (!t) return;
    if (!S.project) return toast("Modo demostración: descarga la textura en su lugar");
    t.dirty = true;
    await FD.ensureTexNode(t);
    await FD.save();
    toast("Textura guardada: " + P.pathOf(t.node), 3000, "ok");
    P.renderTexList();
  };
  /* estructura estándar de resource pack si falta */
  P.ensureLayout = async function() {
    if (!S.project) return toast("Abre un proyecto primero");
    const b = P.base();
    ["models/entity", "textures/entity", "animations", "entity"].forEach((d) => P.ensureDir(b, d));
    FD.markDirty();
    await FD.save();
    toast("Carpetas del resource pack listas: models/entity, textures/entity, animations, entity", 3500, "ok");
  };
  Object.assign(FD.act, { newTexture: P.newTexture, importTexture: () => $("#texIn").click(), importAny: P.pickFiles, openModel: P.openModel, newFromTemplate: P.newFromTemplate, exportGeo: P.exportGeo, saveTexture: P.saveTexture, downloadTexture: P.downloadTexture, matchSizes: P.matchSizes, ensureLayout: P.ensureLayout });
})();

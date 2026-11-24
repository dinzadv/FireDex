/* FireDex · Modelador — Revisión: detecta errores del modelo, la textura, las animaciones y el addon */
(function() {
  "use strict";
  const FD = window.FD;
  if (!FD) return;
  const { S, TX, $, $$, ic, toast, esc, round } = FD;
  const C = FD.check = { issues: [], open: false };
  const ver = (v) => String(v || "0").split(".").map((x) => +x || 0);
  const verLt = (a, b) => {
    a = ver(a);
    b = ver(b);
    for (let i = 0; i < 3; i++) {
      if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) < (b[i] || 0);
    }
    return false;
  };
  const isNumArr = (a, n) => Array.isArray(a) && a.length === n && a.every((v) => typeof v === "number" && isFinite(v));
  function lev(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    const m = [];
    for (let i = 0; i <= a.length; i++) m[i] = [i];
    for (let j = 1; j <= b.length; j++) m[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return m[a.length][b.length];
  }
  function run() {
    const out = [];
    const g = FD.G();
    if (!g) return out;
    const add = (sev, code, msg, o) => out.push(Object.assign({ sev, code, msg }, o || {}));
    const bones = FD.bones(), desc = g.obj.description || {};
    const root = S.root;
    /* ── Formato e identificador ── */
    if (g.legacy) add("warn", "legacy", "El modelo usa el formato antiguo (1.8). Funciona, pero conviene pasarlo al formato 1.12.", { fix: { label: "Convertir a 1.12", manual: true, fn: () => FD.act.toNewFormat() } });
    else {
      const id = desc.identifier;
      if (!id) add("error", "noid", "La geometría no tiene identificador.", { fix: { label: "Poner geometry." + FD.geoSlug(), safe: true, fn: () => {
        g.obj.description.identifier = "geometry." + FD.slugOf(S.node.name.replace(/\.(geo\.)?json$/i, ""));
      } } });
      else if (!/^geometry\.[A-Za-z0-9_.\-]+$/.test(id)) add("error", "badid", "El identificador «" + id + "» no es válido: debe empezar por «geometry.» y usar solo letras, números, «_», «.» o «-».", { fix: { label: "Corregir", safe: true, fn: () => {
        g.obj.description.identifier = "geometry." + FD.slugOf(id.replace(/^geometry\.?/, ""));
      } } });
      const dup = S.geos.filter((x) => FD.geoName(x) === id).length;
      if (id && dup > 1) add("error", "dupgeo", "Hay " + dup + " geometrías con el identificador «" + id + "» en este archivo.");
      if (!root.format_version) add("warn", "nofv", "Falta «format_version» en el archivo.", { fix: { label: "Poner 1.12.0", safe: true, fn: () => {
        root.format_version = "1.12.0";
      } } });
      else if (verLt(root.format_version, "1.12.0")) add("warn", "oldfv", "«format_version» " + root.format_version + " es anterior a 1.12.0, que es la que usa «minecraft:geometry».", { fix: { label: "Subir a 1.12.0", safe: true, fn: () => {
        root.format_version = "1.12.0";
      } } });
      if (!(desc.texture_width > 0 && desc.texture_height > 0)) add("error", "nodims", "Faltan texture_width / texture_height. Sin ellos el juego asume 64×64.", { fix: { label: "Poner " + S.texW + "×" + S.texH, safe: true, fn: () => FD.writeDims() } });
    }
    /* ── Huesos ── */
    const names = new Map();
    bones.forEach((b, bi) => {
      const T = { bone: b };
      if (!b.name || typeof b.name !== "string") {
        add("error", "bname", "Hay un hueso sin nombre.", { sel: T, fix: { label: "Nombrarlo", safe: true, fn: () => {
          b.name = FD.newBoneName("hueso");
        } } });
        return;
      }
      if (names.has(b.name)) add("error", "dupbone", "El nombre de hueso «" + b.name + "» está repetido. Las animaciones solo mueven uno de ellos.", { sel: T, fix: { label: "Renombrar este", safe: true, fn: () => {
        const nn = FD.newBoneName(b.name);
        bones.forEach((x) => {
          if (x !== b && x.parent === b.name && bones.indexOf(x) > bi) x.parent = nn;
        });
        b.name = nn;
      } } });
      names.set(b.name, b);
      if (/\s/.test(b.name)) add("warn", "bspace", "El hueso «" + b.name + "» tiene espacios en el nombre; puede dar problemas en animaciones y Molang.", { sel: T, fix: { label: "Cambiar espacios por _", safe: true, fn: () => {
        const nn = b.name.replace(/\s+/g, "_");
        if (FD.renameBone) FD.renameBone(b.name, nn);
        b.name = nn;
      } } });
      if (b.parent && !bones.some((x) => x.name === b.parent)) add("error", "noparent", "El hueso «" + b.name + "» tiene como padre a «" + b.parent + "», que no existe.", { sel: T, fix: { label: "Quitar el padre", safe: true, fn: () => {
        delete b.parent;
      } } });
      if (b.pivot && !isNumArr(b.pivot, 3)) add("error", "bpivot", "El pivote del hueso «" + b.name + "» no es válido.", { sel: T, fix: { label: "Poner [0,0,0]", safe: true, fn: () => {
        b.pivot = [0, 0, 0];
      } } });
      if (b.rotation && !isNumArr(b.rotation, 3)) add("error", "brot", "La rotación del hueso «" + b.name + "» no es válida.", { sel: T, fix: { label: "Quitar rotación", safe: true, fn: () => {
        delete b.rotation;
      } } });
      /* ciclos */
      let cur = b, n = 0;
      const seen = new Set();
      while (cur && cur.parent && n++ < 500) {
        if (seen.has(cur)) {
          add("error", "cycle", "El hueso «" + b.name + "» forma un ciclo de padres.", { sel: T, fix: { label: "Romper el ciclo", safe: true, fn: () => {
            delete b.parent;
          } } });
          break;
        }
        seen.add(cur);
        cur = bones.find((x) => x.name === cur.parent);
      }
      const hasCubes = (b.cubes || []).length > 0;
      if (!hasCubes && !FD.childrenOf(b).length && !Object.keys(b.locators || {}).length && !/^(root|waist|body|root_)/i.test(b.name)) add("info", "empty", "El hueso «" + b.name + "» no tiene cubos, hijos ni locators.", { sel: T });
    });
    /* ── Cubos ── */
    const boxes = [];
    bones.forEach((b) => (b.cubes || []).forEach((c, ci) => {
      const T = { bone: b, cube: c };
      const where = "Cubo " + (ci + 1) + " de «" + b.name + "»";
      if (!isNumArr(c.origin, 3) || !isNumArr(c.size, 3)) {
        add("error", "cubebad", where + " no tiene origen/tamaño válidos.", { sel: T, fix: { label: "Restablecer", safe: true, fn: () => {
          if (!isNumArr(c.origin, 3)) c.origin = [0, 0, 0];
          if (!isNumArr(c.size, 3)) c.size = [1, 1, 1];
        } } });
        return;
      }
      if (c.size.some((v) => v < 0)) add("error", "negsize", where + " tiene tamaño negativo.", { sel: T, fix: { label: "Usar valor absoluto", safe: true, fn: () => {
        c.origin = c.origin.map((o, i) => c.size[i] < 0 ? o + c.size[i] : o);
        c.size = c.size.map(Math.abs);
      } } });
      const z = c.size.filter((v) => v === 0).length;
      if (z >= 2) add("warn", "novol", where + " no tiene volumen (dos o más lados miden 0).", { sel: T, fix: { label: "Poner tamaño 1", fn: () => {
        c.size = c.size.map((v) => v || 1);
      } } });
      else if (z === 1) add("info", "plane", where + " es un plano (un lado mide 0). Es válido; solo se ve por dos caras.", { sel: T });
      if (c.pivot && !isNumArr(c.pivot, 3)) add("error", "cpivot", where + " tiene un pivote no válido.", { sel: T, fix: { label: "Centrar pivote", safe: true, fn: () => {
        c.pivot = c.origin.map((o, i) => o + c.size[i] / 2);
      } } });
      if (c.rotation && !c.pivot) add("warn", "rotnopivot", where + " tiene rotación pero no pivote: girará sobre el origen del hueso.", { sel: T, fix: { label: "Centrar pivote", safe: true, fn: () => {
        c.pivot = c.origin.map((o, i) => o + c.size[i] / 2);
      } } });
      if (c.rotation && c.rotation.filter((v) => v).length > 1 && !/^1\.(1[2-9]|[2-9]\d)/.test(root.format_version || "")) add("warn", "multirot", where + " rota en varios ejes con una versión de formato antigua.", { sel: T });
      if (c.uv == null) add("error", "nouv", where + " no tiene UV: no se verá su textura.", { sel: T, fix: { label: "Auto-colocar UV", safe: true, fn: () => FD.autoUV(c) } });
      else if (Array.isArray(c.uv)) {
        if (!isNumArr(c.uv, 2)) add("error", "uvbad", where + " tiene un UV no válido.", { sel: T, fix: { label: "Auto-colocar UV", safe: true, fn: () => FD.autoUV(c) } });
        else {
          if (c.uv.some((v) => v !== Math.round(v))) add("info", "uvfrac", where + " tiene UV con decimales; las texturas de píxeles se ven mejor con enteros.", { sel: T, fix: { label: "Redondear", safe: true, fn: () => {
            c.uv = c.uv.map(Math.round);
          } } });
          const w = 2 * (Math.ceil(c.size[0]) + Math.ceil(c.size[2])), h = Math.ceil(c.size[1]) + Math.ceil(c.size[2]);
          if (c.uv[0] < 0 || c.uv[1] < 0 || c.uv[0] + w > S.texW || c.uv[1] + h > S.texH) add("warn", "uvout", where + " se sale de la textura (" + S.texW + "×" + S.texH + "): ocupa " + w + "×" + h + " desde " + c.uv.join(", ") + ".", { sel: T, fix: { label: "Auto-colocar UV", safe: true, fn: () => FD.autoUV(c) } });
          boxes.push({ b, c, T, where, r: [c.uv[0], c.uv[1], c.uv[0] + w, c.uv[1] + h] });
        }
      } else if (typeof c.uv === "object") {
        const miss = FD.FACE_NAMES.filter((f) => !c.uv[f]);
        if (miss.length === 6) add("error", "nouvf", where + " no define ninguna cara de UV.", { sel: T });
        else if (miss.length) add("info", "uvmiss", where + " no define las caras: " + miss.join(", ") + " (serán invisibles).", { sel: T });
        const rs = FD.faceUVs(c);
        Object.keys(rs).forEach((f) => {
          const r = rs[f], x0 = Math.min(r[0], r[2]), x1 = Math.max(r[0], r[2]), y0 = Math.min(r[1], r[3]), y1 = Math.max(r[1], r[3]);
          if (x0 < 0 || y0 < 0 || x1 > S.texW + 1e-6 || y1 > S.texH + 1e-6) add("warn", "uvfout", where + ": la cara «" + f + "» se sale de la textura.", { sel: T });
        });
      }
    }));
    /* solapes parciales de UV entre cubos de caja */
    if (boxes.length < 400) for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i], b = boxes[j];
      const same = a.r[0] === b.r[0] && a.r[1] === b.r[1];
      if (!same && a.r[0] < b.r[2] && a.r[2] > b.r[0] && a.r[1] < b.r[3] && a.r[3] > b.r[1]) add("warn", "uvover", a.where + " y " + b.where.toLowerCase() + " comparten píxeles del mapa UV; al pintar uno se mancha el otro.", { sel: a.T, fix: { label: "Reorganizar todos los UV", manual: true, fn: () => $("#uvAutoAll").click() } });
    }
    /* ── Límites visibles ── */
    if (!g.legacy) {
      const bb = FD.modelBounds();
      const w = desc.visible_bounds_width, h = desc.visible_bounds_height;
      if (w == null || h == null) add("info", "nobounds", "No hay límites visibles definidos (visible_bounds). Se recomiendan para que el juego no oculte el modelo.", { fix: { label: "Calcular", safe: true, fn: () => FD.act.autoBounds() } });
      else if (bb) {
        const o = desc.visible_bounds_offset || [0, 0, 0], hw = w * 8, hh = h * 8;
        const out = bb.mn[0] < o[0] * 16 - hw - 0.01 || bb.mx[0] > o[0] * 16 + hw + 0.01 || bb.mn[2] < o[2] * 16 - hw - 0.01 || bb.mx[2] > o[2] * 16 + hw + 0.01 || bb.mn[1] < o[1] * 16 - hh - 0.01 || bb.mx[1] > o[1] * 16 + hh + 0.01;
        if (out) add("warn", "boundsout", "El modelo se sale de los límites visibles: el juego puede dejar de dibujarlo cuando miras hacia otro lado.", { fix: { label: "Ajustar límites", safe: true, fn: () => FD.act.autoBounds() } });
      }
    }
    /* ── Texturas ── */
    const t = TX.active;
    if (t) {
      const blank = FD.pixelsBlank(t);
      if (blank) add("warn", "texblank", "La textura «" + t.name + "» está vacía (totalmente transparente): el modelo no se verá en el juego.", { fix: { label: "Rellenar con los colores de los cubos", manual: true, fn: () => $("#paintBaseBtn").click() } });
      if (t.canvas.width !== S.texW || t.canvas.height !== S.texH) {
        const prop = t.canvas.width / S.texW === t.canvas.height / S.texH && Number.isInteger(t.canvas.width / S.texW);
        add(prop ? "info" : "warn", "texsize", "La imagen mide " + t.canvas.width + "×" + t.canvas.height + " y el modelo declara " + S.texW + "×" + S.texH + (prop ? " (proporcional: es una textura de mayor resolución)." : ". Las UV no coincidirán con los píxeles."), { fix: prop ? null : { label: "Igualar tamaños…", manual: true, fn: () => FD.act.matchSizes() } });
      }
      if (t.canvas.width > 1024 || t.canvas.height > 1024) add("info", "texbig", "La textura es muy grande (" + t.canvas.width + "×" + t.canvas.height + "); en móviles puede ir lenta.");
      if (!t.node && S.project) add("info", "texnofile", "La textura «" + t.name + "» aún no es un archivo del proyecto.", { fix: { label: "Guardar en el proyecto", manual: true, fn: () => FD.act.saveTexture() } });
      if (/[A-Z\s]/.test(t.name)) add("warn", "texname", "El nombre «" + t.name + "» tiene mayúsculas o espacios; en Bedrock conviene usar minúsculas y «_».", { fix: { label: "Renombrar", safe: true, fn: () => {
        t.name = t.name.toLowerCase().replace(/\s+/g, "_");
        if (t.node) t.node.name = t.name;
      } } });
    }
    /* ── Proyecto y addon ── */
    if (S.project && FD.proj) {
      const ix = FD.proj.index(), gid = FD.geoName(g);
      const ents = FD.proj.entityFor(ix, gid);
      const others = ix.geos.filter((x) => x.node !== S.node && x.ids.indexOf(gid) >= 0);
      if (others.length) add("warn", "dupproj", "El identificador «" + gid + "» también existe en " + others.map((o) => o.path).join(", ") + ".");
      if (!ents.length && ix.ents.length) add("info", "noent", "Ninguna entidad cliente del proyecto usa «" + gid + "».", { fix: { label: "Abrir integración", manual: true, fn: () => FD.openIntegration && FD.openIntegration() } });
      ents.forEach((e) => {
        const d = e.desc, nm = "«" + d.identifier + "»";
        Object.keys(d.textures || {}).forEach((k) => {
          if (!FD.proj.resolveTex(ix, d.textures[k])) add("error", "enttex", "La entidad " + nm + " usa la textura «" + d.textures[k] + "» (" + k + ") y no existe en el proyecto.", { fix: { label: "Guardar la textura actual ahí", manual: true, fn: async () => {
            if (!TX.active) return;
            const n = TX.active;
            n.name = d.textures[k].split("/").pop() + ".png";
            n.node = null;
            n.dirty = true;
            FD.proj.link.ents = [e];
            await FD.ensureTexNode(n);
            FD.markDirty();
            C.refresh();
          } } });
        });
        Object.keys(d.animations || {}).forEach((k) => {
          const v = d.animations[k];
          if (typeof v === "string" && !ix.anims.some((a) => a.ids.indexOf(v) >= 0) && !(FD.A && FD.A.root && FD.A.root.animations && FD.A.root.animations[v])) add("warn", "entanim", "La entidad " + nm + " referencia la animación «" + v + "» pero no está en ningún archivo del proyecto.");
        });
        const idn = String(d.identifier || "");
        if (idn.indexOf(":") < 0) add("warn", "entns", "El identificador de entidad " + nm + " no tiene espacio de nombres (usa «espacio:nombre»).");
      });
      /* animaciones del archivo abierto */
      const A = FD.A;
      if (A && A.root && A.root.animations) {
        const bn = new Set(bones.map((b) => b.name));
        const anims = A.root.animations;
        Object.keys(anims).forEach((id) => {
          const a = anims[id], short = id.replace(/^animation\./, "");
          if (!/^animation\./.test(id)) add("error", "animid", "La animación «" + id + "» debe empezar por «animation.».", { anim: id, fix: { label: "Renombrar a animation." + id, safe: true, fn: () => {
            const o = {};
            Object.keys(anims).forEach((k) => {
              o[k === id ? "animation." + id : k] = anims[k];
            });
            A.root.animations = o;
            if (A.name === id) A.name = "animation." + id;
          } } });
          const bs = a.bones || {};
          let maxT = 0;
          Object.keys(bs).forEach((bname) => {
            if (!bn.has(bname)) {
              const near = bones.map((b) => [b.name, lev(b.name, bname)]).sort((x, y) => x[1] - y[1])[0];
              const sug = near && near[1] <= Math.max(2, Math.floor(bname.length / 3)) && !bs[near[0]] ? near[0] : null;
              add("warn", "animghost", "La animación «" + short + "» mueve el hueso «" + bname + "», que no existe en el modelo.", { anim: id, fix: sug ? { label: "Renombrar a «" + sug + "»", fn: () => {
                bs[sug] = bs[bname];
                delete bs[bname];
              } } : { label: "Quitar esa pista", fn: () => {
                delete bs[bname];
              } } });
            }
            ["position", "rotation", "scale"].forEach((ch) => {
              const v = bs[bname] && bs[bname][ch];
              if (v && typeof v === "object" && !Array.isArray(v)) Object.keys(v).forEach((tk) => {
                const tt = parseFloat(tk);
                if (!isFinite(tt)) add("error", "animkey", "En «" + short + "», el tiempo «" + tk + "» de " + bname + "/" + ch + " no es un número.", { anim: id });
                else maxT = Math.max(maxT, tt);
              });
            });
          });
          if (a.animation_length == null) add("warn", "animlen", "La animación «" + short + "» no tiene duración (animation_length).", { anim: id, fix: { label: "Poner " + (maxT || 1) + " s", safe: true, fn: () => {
            a.animation_length = maxT || 1;
          } } });
          else if (maxT > a.animation_length + 1e-6) add("warn", "animover", "La animación «" + short + "» tiene claves en " + round(maxT, 2) + " s, más allá de su duración (" + a.animation_length + " s).", { anim: id, fix: { label: "Ampliar a " + round(maxT, 2) + " s", safe: true, fn: () => {
            a.animation_length = round(maxT, 3);
          } } });
          if (!Object.keys(bs).length && !a.animation_length) add("info", "animempty", "La animación «" + short + "» está vacía.", { anim: id });
        });
      }
    }
    const order = { error: 0, warn: 1, info: 2 };
    out.sort((a, b) => order[a.sev] - order[b.sev]);
    C.issues = out;
    return out;
  }
  C.run = run;
  /* ───────── Interfaz ───────── */
  const ICON = { error: "xcircle", warn: "alert", info: "info" };
  function renderBadge() {
    const e = C.issues.filter((i) => i.sev === "error").length, w = C.issues.filter((i) => i.sev === "warn").length;
    const b = $("#chkBtn"), n = $("#chkN");
    b.classList.toggle("bad", e > 0);
    b.classList.toggle("warn", !e && w > 0);
    b.classList.toggle("good", !e && !w);
    n.hidden = !(e + w);
    n.textContent = e + w;
    $("#chkTxt").textContent = e ? e + (e > 1 ? " errores" : " error") : w ? w + (w > 1 ? " avisos" : " aviso") : "Todo bien";
    const ic0 = b.querySelector("i[data-i]");
    if (ic0) {
      ic0.dataset.i = e ? "shieldx" : "shield";
      ic0.innerHTML = "";
      FD.hydrateIcons(b);
    }
  }
  function renderList() {
    const by = { error: 0, warn: 0, info: 0 };
    C.issues.forEach((i) => by[i.sev]++);
    $("#chkSum").innerHTML = '<span class="sv error">' + by.error + " errores</span><span class=\"sv warn\">" + by.warn + " avisos</span><span class=\"sv info\">" + by.info + " notas</span>";
    const fixable = C.issues.filter((i) => i.fix && i.fix.safe).length;
    $("#chkFixAll").disabled = !fixable;
    $("#chkFixAll").textContent = fixable ? "Corregir " + fixable : "Corregir todo";
    const box = $("#chkList");
    if (!C.issues.length) {
      box.innerHTML = '<div class="empty good">' + ic("shield") + "<b>Todo en orden</b><span>No se encontraron problemas en el modelo, la textura ni las animaciones.</span></div>";
      FD.hydrateIcons(box);
      return;
    }
    box.innerHTML = C.issues.map((it, i) => '<div class="iss ' + it.sev + '" data-i="' + i + '"><span class="ii">' + ic(ICON[it.sev]) + '</span><div class="it"><span>' + esc(it.msg) + "</span>" + '<div class="ia">' + (it.sel ? '<button class="btn xs" data-go>Ir al elemento</button>' : "") + (it.anim ? '<button class="btn xs" data-ganim>Ver animación</button>' : "") + (it.fix ? '<button class="btn xs ' + (it.fix.safe ? "primary" : "") + '" data-fix>' + esc(it.fix.label) + "</button>" : "") + "</div></div></div>").join("");
    FD.hydrateIcons(box);
  }
  $("#chkList").addEventListener("click", async (e) => {
    const row = e.target.closest(".iss");
    if (!row) return;
    const it = C.issues[+row.dataset.i];
    if (!it) return;
    if (e.target.closest("[data-go]") || !e.target.closest("button")) {
      if (it.sel && FD.bones().indexOf(it.sel.bone) >= 0) {
        FD.select(it.sel.bone, it.sel.cube || null);
        if (FD.S.mode === "anim") FD.setMode("edit");
        FD.frameModel();
      }
      if (!e.target.closest("button")) return;
    }
    if (e.target.closest("[data-ganim]")) {
      if (FD.A) {
        FD.A.name = it.anim;
        FD.setMode("anim");
        if (FD.animApi) FD.animApi.refresh();
      }
      return;
    }
    if (e.target.closest("[data-fix]")) {
      const f = it.fix;
      if (f.manual) {
        await f.fn();
        setTimeout(C.refresh, 200);
      } else {
        f.fn();
        FD.commit("Corregir: " + it.code);
        toast("Corregido", 1500, "ok");
      }
    }
  });
  $("#chkFixAll").onclick = () => {
    let n = 0, guard = 0;
    while (guard++ < 8) {
      const fixes = run().filter((i) => i.fix && i.fix.safe);
      if (!fixes.length) break;
      fixes.forEach((i) => {
        try {
          i.fix.fn();
          n++;
        } catch (e) {
          console.warn(e);
        }
      });
    }
    if (n) FD.commit("Corregir " + n + " problemas");
    toast(n ? n + " correcciones aplicadas" : "No había nada que corregir", 2200, n ? "ok" : "");
  };
  C.refresh = () => {
    run();
    renderBadge();
    if (C.open || $("#app").dataset.sheet === "check") renderList();
  };
  C.toggle = (on) => {
    C.open = on == null ? !C.open : on;
    $("#drawer").hidden = !C.open;
    $("#chkBtn").classList.toggle("act", C.open);
    if (C.open) C.refresh();
  };
  $("#chkClose").onclick = () => C.toggle(false);
  let tm = 0;
  FD.hooks.refresh.push((w) => {
    if (w === "mode") return;
    clearTimeout(tm);
    tm = setTimeout(C.refresh, w === "init" ? 50 : 350);
  });
})();

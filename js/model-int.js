/* FireDex · Modelador — integración con el addon: entidad cliente, entidad de comportamiento, paquete .mcpack */
(function() {
  "use strict";
  const FD = window.FD;
  if (!FD) return;
  const { S, TX, $, ic, toast, modal, esc } = FD;
  const P = () => FD.proj;
  const slug = () => FD.geoSlug();
  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : r & 3 | 8).toString(16);
  });
  const animIds = () => FD.A && FD.A.root && FD.A.root.animations ? Object.keys(FD.A.root.animations) : [];
  function curEntityId() {
    return S.project && S.project.meta && S.project.meta.entityId || (P().link.ents[0] && P().link.ents[0].desc.identifier) || "fd:" + slug();
  }
  function setEntityId(v) {
    if (!S.project) return;
    S.project.meta = S.project.meta || {};
    S.project.meta.entityId = v;
  }
  function clientEntityJSON(id, existing) {
    const gid = FD.geoName(FD.G()), ids = animIds();
    const j = existing || { format_version: "1.10.0", "minecraft:client_entity": { description: { identifier: id, materials: { default: "entity_alpha" }, textures: {}, geometry: {}, render_controllers: ["controller.render.default"], spawn_egg: { base_color: "#8577f8", overlay_color: "#ffffff" } } } };
    const d = j["minecraft:client_entity"].description;
    d.identifier = d.identifier || id;
    d.textures = d.textures || {};
    d.geometry = d.geometry || {};
    TX.list.forEach((t, i) => {
      const key = t.role || (t === TX.list[0] ? "default" : t.name.replace(/\.\w+$/, ""));
      if (!d.textures[key]) d.textures[key] = P().texResPath(t);
    });
    if (!d.textures.default) d.textures.default = P().texResPath();
    d.geometry.default = gid;
    if (ids.length) {
      d.animations = d.animations || {};
      ids.forEach((a) => {
        const short = a.split(".").pop();
        if (!Object.values(d.animations).includes(a)) d.animations[d.animations[short] ? short + "_" + Object.keys(d.animations).length : short] = a;
      });
      if (!d.scripts) {
        const idle = Object.keys(d.animations).find((k) => /idle/i.test(k));
        if (idle) d.scripts = { animate: [idle] };
      }
    }
    return j;
  }
  function behaviorEntityJSON(id) {
    return { format_version: "1.20.0", "minecraft:entity": { description: { identifier: id, is_spawnable: true, is_summonable: true, is_experimental: false }, components: { "minecraft:type_family": { family: [slug()] }, "minecraft:collision_box": { width: 0.6, height: 1.8 }, "minecraft:health": { value: 20, max: 20 }, "minecraft:physics": {}, "minecraft:pushable": { is_pushable: true, is_pushable_by_piston: true }, "minecraft:nameable": {} } } };
  }
  function writeClientEntity(id) {
    const ix = P().index();
    const exist = ix.ents.find((e) => e.desc.identifier === id);
    if (exist) {
      exist.node.content = JSON.stringify(clientEntityJSON(id, exist.json), null, 2);
      toast("Entidad cliente actualizada: " + exist.path, 3000, "ok");
    } else {
      const n = P().putFile(P().dirFor("client"), slug() + ".entity.json", JSON.stringify(clientEntityJSON(id), null, 2), false);
      toast("Entidad cliente creada: entity/" + n.name, 3000, "ok");
    }
    FD.markDirty();
  }
  function writeBehaviorEntity(id) {
    const bp = P().bpRoot(S.project.root);
    if (!bp) return toast("No hay un Behavior Pack con manifest en este proyecto", 3200, "bad");
    const dir = P().ensureDir(bp.node, "entities");
    if (dir.children.some((c) => c.name === slug() + ".json")) return toast("Ya existe entities/" + slug() + ".json");
    P().putFile(dir, slug() + ".json", JSON.stringify(behaviorEntityJSON(id), null, 2), false);
    toast("Entidad de comportamiento creada", 2500, "ok");
    FD.markDirty();
  }
  function currentFiles() {
    FD.writeDims();
    const out = { tex: [] };
    out.geo = JSON.stringify(S.root, null, 2);
    TX.list.forEach((t) => out.tex.push({ name: (t.name || "textura.png").replace(/\.png$/i, "") + ".png", data: t.canvas.toDataURL("image/png"), path: P().texResPath(t) }));
    out.anim = FD.A && Object.keys(FD.A.root.animations || {}).length ? JSON.stringify(FD.A.root, null, 2) : null;
    out.entity = JSON.stringify(clientEntityJSON(curEntityId()), null, 2);
    return out;
  }
  async function copyToProject() {
    const idx = await new Promise((ok) => {
      indexedDB.open("devstudio_db", 1).onsuccess = (e) => {
        const q = e.target.result.transaction("projects_index").objectStore("projects_index").getAll();
        q.onsuccess = () => ok(q.result || []);
      };
    });
    const list = idx.filter((p) => !S.project || p.id !== S.project.id);
    if (!list.length) return toast("No hay otros proyectos. Crea un addon desde el inicio primero.", 3000);
    modal("Copiar a otro proyecto", '<div class="sub">Se copian la geometría, las texturas, las animaciones y la entidad cliente al resource pack del proyecto elegido (se crean las carpetas que falten).</div>' + list.map((p, i) => '<label class="hrow"><input type="radio" name="pj" value="' + i + '"' + (i === 0 ? " checked" : "") + "><span>" + esc(p.name) + "</span></label>").join(""), [{ label: "Cancelar" }, { label: "Copiar", cls: "primary", fn: async (api) => {
      const r = api.el.querySelector("input:checked");
      if (!r) return false;
      const p = list[+r.value];
      const data = await FD.idb.get("projects_data", p.id);
      if (!data) return toast("No se pudo leer el proyecto", 2500, "bad");
      const f = currentFiles(), rp = P().rpRoot(data.root) || { node: data.root, path: "" };
      P().putFile(P().ensureDir(rp.node, "models/entity"), slug() + ".geo.json", f.geo, true);
      f.tex.forEach((t) => P().putFile(P().ensureDir(rp.node, t.path.replace(/\/[^/]*$/, "")), t.name, t.data, true));
      if (f.anim) P().putFile(P().ensureDir(rp.node, "animations"), slug() + ".animation.json", f.anim, true);
      P().putFile(P().ensureDir(rp.node, "entity"), slug() + ".entity.json", f.entity, true);
      await FD.idb.put("projects_data", data);
      toast("Copiado a «" + p.name + "»" + (rp.path ? " (" + rp.path + ")" : ""), 3000, "ok");
    } }]);
  }
  async function exportMcpack() {
    if (!window.JSZip) return toast("Falta la librería JSZip", 2500, "bad");
    const f = currentFiles(), z = new JSZip(), nm = slug();
    z.file("manifest.json", JSON.stringify({ format_version: 2, header: { name: nm, description: "Modelo creado con FireDex", uuid: uuid(), version: [1, 0, 0], min_engine_version: [1, 21, 0] }, modules: [{ type: "resources", uuid: uuid(), version: [1, 0, 0] }] }, null, 2));
    z.file("models/entity/" + nm + ".geo.json", f.geo);
    f.tex.forEach((t) => z.file(t.path + ".png", t.data.split(",")[1], { base64: true }));
    if (f.anim) z.file("animations/" + nm + ".animation.json", f.anim);
    z.file("entity/" + nm + ".entity.json", f.entity);
    const blob = await z.generateAsync({ type: "blob" });
    FD.download(nm + ".mcpack", URL.createObjectURL(blob));
    toast("Paquete .mcpack descargado", 2500, "ok");
  }
  const codeBlock = (t) => '<div class="code">' + esc(t) + "</div>";
  FD.openIntegration = function() {
    const id = curEntityId(), A = FD.A, ids = animIds(), geoId = FD.geoName(FD.G());
    const ix = S.project ? P().index() : { ents: [], geos: [], texs: [] };
    const ce = P().entityFor(ix, geoId);
    const ok = (b, t, f) => '<div class="hrow stat">' + (b ? '<span class="okc">' + ic("check") + "</span>" : '<span class="warnc">' + ic("alert") + "</span>") + "<span>" + t + "</span><small>" + (f || "") + "</small></div>";
    const standalone = S.standalone, first = ids[0] || "animation." + slug() + ".idle";
    const t = TX.active;
    const body = '<div class="sub">FireDex detecta los archivos del modelo en el proyecto. Los cambios en archivos se aplican al pulsar <b>Guardar</b>.</div>' + ok(true, "Geometría <b>" + esc(geoId) + "</b>", esc(S.node.name)) + ok(!!(t && t.node), t && t.node ? "Textura <b>" + esc(P().texResPath()) + "</b> (" + TX.list.length + " en total)" : "Sin archivo de textura (se guardará como <b>" + esc(P().texResPath()) + "</b>)", t && t.node ? "" : '<button class="btn xs" id="inSaveTex">Guardar textura</button>') + ok(!!(A && A.node), A && A.node ? "Animaciones: <b>" + ids.length + "</b> en <b>" + esc(A.node.name) + "</b>" : "No hay archivo de animaciones", '<button class="btn xs" id="inAnimFile">' + (A && A.node ? "Cambiar" : "Definir") + "</button>") + ok(ce.length > 0, ce.length ? "Entidad cliente: <b>" + esc(ce[0].path) + "</b>" : "No existe una entidad cliente que use este modelo") + '<div class="kv" style="margin-top:12px"><label>Identificador de la entidad</label><input class="txt" id="inEntId" value="' + esc(id) + '" placeholder="espacio:nombre"></div><div class="btnrow">' + (S.project ? '<button class="btn primary" id="inClient">' + (ce.length ? "Actualizar entidad cliente" : "Crear entidad cliente") + "</button>" : "") + (S.project && !standalone ? '<button class="btn" id="inBeh">Entidad (Behavior Pack)</button>' : "") + (S.project ? '<button class="btn" id="inLayout">Crear carpetas</button>' : "") + '<button class="btn" id="inCopy">Copiar a otro proyecto…</button><button class="btn" id="inPack">Exportar .mcpack</button></div><h4 class="kh">Ejecutar la animación en el juego</h4><div class="sub">La entidad debe existir en el juego (Behavior Pack) y el resource pack debe cargar la geometría, la textura y las animaciones. Luego:</div><div class="sub">Comando</div>' + codeBlock("/playanimation @e[type=" + id + "] " + first) + '<div class="sub">Script API (@minecraft/server)</div>' + codeBlock('import { world } from "@minecraft/server";\n\nfor (const e of world.getDimension("overworld").getEntities({ type: "' + id + '" })) {\n  e.playAnimation("' + first + '");\n}') + '<div class="sub">Animación automática (en la entidad cliente)</div>' + codeBlock('"animations": { "idle": "' + first + '" },\n"scripts": { "animate": ["idle"] }') + '<div class="sub">Invocar: <b>/summon ' + esc(id) + "</b></div>";
    modal("Addon: entidad y exportación", body, [{ label: "Cerrar" }], (el, api) => {
      const on = (sel, fn) => {
        const b = el.querySelector(sel);
        if (b) b.onclick = fn;
      };
      const entVal = () => {
        const v = el.querySelector("#inEntId").value.trim();
        if (!/^[a-z0-9_]+:[a-z0-9_.]+$/.test(v)) {
          toast("Usa el formato espacio:nombre (minúsculas)", 2800, "bad");
          return null;
        }
        setEntityId(v);
        return v;
      };
      on("#inSaveTex", async () => {
        await FD.ensureTexNode();
        FD.markDirty();
        api.close();
        FD.openIntegration();
      });
      on("#inAnimFile", () => {
        api.close();
        FD.setMode("anim");
        $("#tFile").click();
      });
      on("#inClient", () => {
        const v = entVal();
        if (!v) return;
        writeClientEntity(v);
        api.close();
        FD.openIntegration();
      });
      on("#inBeh", () => {
        const v = entVal();
        if (v) writeBehaviorEntity(v);
      });
      on("#inLayout", () => P().ensureLayout());
      on("#inCopy", () => {
        if (!entVal()) return;
        api.close();
        copyToProject();
      });
      on("#inPack", () => {
        if (entVal()) exportMcpack();
      });
    }, "wide");
  };
  FD.act.exportMcpack = () => {
    setEntityId(curEntityId());
    return exportMcpack();
  };
})();

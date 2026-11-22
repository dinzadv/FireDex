(function() {
  "use strict";
  const FD = window.FD;
  if (!FD) return;
  const { S, $, $$, ic, toast, modal, esc } = FD;
  const slug = () => (FD.geoName(FD.G()) || "modelo").replace(/^geometry\./, "").replace(/[^a-z0-9_]/gi, "_").toLowerCase();
  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    return (c === "x" ? r : r & 3 | 8).toString(16);
  });
  function filesOf(root) {
    return FD.allFiles(root);
  }
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
  function rpRoot(root) {
    if (root.kind === "model") return { node: root, path: "" };
    const r = packRoots(root);
    return r.find((x) => x.kind === "rp") || null;
  }
  function bpRoot(root) {
    const r = packRoots(root);
    return r.find((x) => x.kind === "bp") || null;
  }
  function ensureDir(base, path) {
    let cur = base;
    path.split("/").filter(Boolean).forEach((seg) => {
      let n = (cur.children || []).find((c) => c.type === "folder" && c.name === seg);
      if (!n) {
        n = { id: FD.uid(), type: "folder", name: seg, open: false, children: [] };
        cur.children = cur.children || [];
        cur.children.push(n);
      }
      cur = n;
    });
    return cur;
  }
  function putFile(dir, name, content, overwrite) {
    let ex = dir.children.find((c) => c.type === "file" && c.name === name);
    if (ex) {
      if (overwrite) {
        ex.content = content;
        return ex;
      }
      let k = 1;
      const b = name.replace(/(\.[^.]+(\.json)?)$/, ""), ext = name.slice(b.length);
      while (dir.children.some((c) => c.name === b + "_" + k + ext)) k++;
      name = b + "_" + k + ext;
    }
    const n = { id: FD.uid(), type: "file", name, content };
    dir.children.push(n);
    return n;
  }
  function pathOf(node) {
    const f = filesOf(S.project.root).find((x) => x.node === node);
    return f ? f.path : node.name;
  }
  function texResPath() {
    if (S.texNode) {
      const p = pathOf(S.texNode).replace(/\\/g, "/");
      const i = p.toLowerCase().lastIndexOf("textures/");
      return (i >= 0 ? p.slice(i) : "textures/entity/" + S.texNode.name).replace(/\.\w+$/, "");
    }
    return "textures/entity/" + slug();
  }
  function clientEntities() {
    return S.project ? filesOf(S.project.root).filter((f) => /\.json$/i.test(f.node.name) && /minecraft:client_entity/.test(f.node.content || "")) : [];
  }
  function animIds() {
    const A = FD.A;
    return A && A.root && A.root.animations ? Object.keys(A.root.animations) : [];
  }
  function clientEntityJSON(id, existing) {
    const gid = FD.geoName(FD.G()), ids = animIds();
    const j = existing || { format_version: "1.10.0", "minecraft:client_entity": { description: { identifier: id, materials: { default: "entity_alpha" }, textures: {}, geometry: {}, render_controllers: ["controller.render.default"], spawn_egg: { base_color: "#8577f8", overlay_color: "#ffffff" } } } };
    const d = j["minecraft:client_entity"].description;
    d.identifier = d.identifier || id;
    d.textures = d.textures || {};
    d.geometry = d.geometry || {};
    d.textures.default = texResPath();
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
  function curEntityId() {
    return S.project && S.project.meta && S.project.meta.entityId || "fd:" + slug();
  }
  function setEntityId(v) {
    if (!S.project) return;
    S.project.meta = S.project.meta || {};
    S.project.meta.entityId = v;
  }
  function writeClientEntity(id) {
    const root = S.project.root;
    const exist = clientEntities().find((f) => {
      try {
        return JSON.parse(f.node.content)["minecraft:client_entity"].description.identifier === id;
      } catch (e) {
        return false;
      }
    });
    if (exist) {
      let j;
      try {
        j = JSON.parse(exist.node.content);
      } catch (e) {
        return toast("El archivo de entidad cliente tiene errores");
      }
      exist.node.content = JSON.stringify(clientEntityJSON(id, j), null, 2);
      toast("Entidad cliente actualizada: " + exist.path);
    } else {
      const rp = rpRoot(root) || { node: root };
      const dir = ensureDir(rp.node, "entity");
      const n = putFile(dir, slug() + ".entity.json", JSON.stringify(clientEntityJSON(id), null, 2), false);
      toast("Entidad cliente creada: " + n.name);
    }
    FD.markDirty();
  }
  function writeBehaviorEntity(id) {
    const bp = bpRoot(S.project.root);
    if (!bp) return toast("No hay un Behavior Pack con manifest en este proyecto");
    const dir = ensureDir(bp.node, "entities");
    if (dir.children.some((c) => c.name === slug() + ".json")) return toast("Ya existe entities/" + slug() + ".json");
    putFile(dir, slug() + ".json", JSON.stringify(behaviorEntityJSON(id), null, 2), false);
    toast("Entidad de comportamiento creada");
    FD.markDirty();
  }
  function currentFiles() {
    FD.writeDims && FD.writeDims();
    const out = {};
    out.geo = JSON.stringify(FD.S.root, null, 2);
    out.tex = FD.tex.toDataURL("image/png");
    out.anim = FD.A && FD.A.root && Object.keys(FD.A.root.animations || {}).length ? JSON.stringify(FD.A.root, null, 2) : null;
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
    if (!list.length) return toast("No hay otros proyectos. Crea un addon desde el inicio primero.");
    modal(
      "Copiar a otro proyecto",
      '<div class="sub">Se copiar\xE1n la geometr\xEDa, la textura, las animaciones y la entidad cliente al resource pack del proyecto elegido.</div>' + list.map((p, i) => '<label class="hrow"><input type="radio" name="pj" value="' + i + '"' + (i === 0 ? " checked" : "") + "><span>" + esc(p.name) + "</span></label>").join(""),
      [{ label: "Cancelar" }, { label: "Copiar", cls: "primary", fn: async (api) => {
        const r = api.el.querySelector("input:checked");
        if (!r) return false;
        const p = list[+r.value];
        const data = await FD.idb.get("projects_data", p.id);
        if (!data) return toast("No se pudo leer el proyecto");
        const f = currentFiles(), rp = rpRoot(data.root) || { node: data.root, path: "" };
        putFile(ensureDir(rp.node, "models/entity"), slug() + ".geo.json", f.geo, true);
        putFile(ensureDir(rp.node, "textures/entity"), slug() + ".png", f.tex, true);
        if (f.anim) putFile(ensureDir(rp.node, "animations"), slug() + ".animation.json", f.anim, true);
        putFile(ensureDir(rp.node, "entity"), slug() + ".entity.json", f.entity, true);
        await FD.idb.put("projects_data", data);
        toast("Copiado a \xAB" + p.name + "\xBB" + (rp.path ? " (" + rp.path + ")" : ""));
      } }]
    );
  }
  async function exportMcpack() {
    if (!window.JSZip) return toast("Falta la librer\xEDa JSZip");
    const f = currentFiles(), z = new JSZip(), nm = slug();
    z.file("manifest.json", JSON.stringify({ format_version: 2, header: { name: nm, description: "Modelo creado con FireDex", uuid: uuid(), version: [1, 0, 0], min_engine_version: [1, 21, 0] }, modules: [{ type: "resources", uuid: uuid(), version: [1, 0, 0] }] }, null, 2));
    z.file("models/entity/" + nm + ".geo.json", f.geo);
    z.file("textures/entity/" + nm + ".png", f.tex.split(",")[1], { base64: true });
    if (f.anim) z.file("animations/" + nm + ".animation.json", f.anim);
    z.file("entity/" + nm + ".entity.json", f.entity);
    const blob = await z.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nm + ".mcpack";
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast("Paquete .mcpack descargado");
  }
  function codeBlock(t) {
    return '<div class="code">' + esc(t) + "</div>";
  }
  FD.openIntegration = function() {
    const id = curEntityId(), A = FD.A, ids = animIds(), ce = clientEntities(), geoId = FD.geoName(FD.G());
    const ok = (b, t, f) => '<div class="hrow" style="cursor:default">' + (b ? '<span class="okc">' + ic("check") + "</span>" : '<span class="warnc">' + ic("help") + "</span>") + "<span>" + t + "</span><small>" + (f || "") + "</small></div>";
    const standalone = S.standalone, first = ids[0] || "animation." + slug() + ".idle";
    const body = '<div class="sub">FireDex busca autom\xE1ticamente los archivos del modelo en el proyecto. Los cambios en archivos se aplican al pulsar <b>Guardar</b>.</div>' + ok(true, "Geometr\xEDa <b>" + esc(geoId) + "</b>", esc(S.node.name)) + ok(!!S.texNode, S.texNode ? "Textura <b>" + esc(texResPath()) + "</b>" : "Sin archivo de textura (se guardar\xE1 como <b>" + esc(texResPath()) + "</b>)", S.texNode ? "" : '<button class="btn" id="inSaveTex">Guardar textura</button>') + ok(!!(A && A.node), A && A.node ? "Animaciones: <b>" + ids.length + "</b> en <b>" + esc(A.node.name) + "</b>" : "No se encontr\xF3 un archivo de animaciones", '<button class="btn" id="inAnimFile">' + (A && A.node ? "Cambiar" : "Definir") + "</button>") + ok(ce.length > 0, ce.length ? "Entidad cliente: <b>" + esc(ce[0].path) + "</b>" : "No existe una entidad cliente que use este modelo") + '<div class="kv" style="margin-top:12px"><label>Identificador de la entidad</label><input class="txt" id="inEntId" value="' + esc(id) + '" placeholder="espacio:nombre"></div><div class="btnrow">' + (S.project ? '<button class="btn primary" id="inClient">' + (ce.length ? "Actualizar entidad cliente" : "Crear entidad cliente") + "</button>" : "") + (S.project && !standalone ? '<button class="btn" id="inBeh">Crear entidad (Behavior Pack)</button>' : "") + '<button class="btn" id="inCopy">Copiar a otro proyecto\u2026</button><button class="btn" id="inPack">Exportar .mcpack</button></div><h4 style="margin:16px 0 4px;font-size:12px;color:var(--mut);text-transform:uppercase">Ejecutar la animaci\xF3n en el juego</h4><div class="sub">1) La entidad debe existir en el juego (Behavior Pack) y 2) el resource pack debe cargar la geometr\xEDa, la textura y las animaciones. Luego:</div><div class="sub">Comando (chat o bloque de comandos)</div>' + codeBlock("/playanimation @e[type=" + id + "] " + first) + '<div class="sub">Script API (@minecraft/server)</div>' + codeBlock('import { world } from "@minecraft/server";\n\nfor (const e of world.getDimension("overworld").getEntities({ type: "' + id + '" })) {\n  e.playAnimation("' + first + '");\n}') + '<div class="sub">Animaci\xF3n autom\xE1tica (en la entidad cliente)</div>' + codeBlock('"animations": { "idle": "' + first + '" },\n"scripts": { "animate": ["idle"] }') + '<div class="sub">Invocar la entidad: <b>/summon ' + esc(id) + "</b></div>";
    modal("Integraci\xF3n con el addon", body, [{ label: "Cerrar" }], (el, api) => {
      const on = (sel, fn) => {
        const b = el.querySelector(sel);
        if (b) b.onclick = fn;
      };
      const entVal = () => {
        const v = el.querySelector("#inEntId").value.trim();
        if (!/^[a-z0-9_]+:[a-z0-9_.]+$/.test(v)) {
          toast("Usa el formato espacio:nombre (min\xFAsculas)");
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
        if (!v) return;
        writeBehaviorEntity(v);
      });
      on("#inCopy", () => {
        const v = entVal();
        if (!v) return;
        api.close();
        copyToProject();
      });
      on("#inPack", () => {
        const v = entVal();
        if (!v) return;
        exportMcpack();
      });
    });
  };
})();

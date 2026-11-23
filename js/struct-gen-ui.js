/* FireDex · pestaña "Generación" del creador de estructuras + escritura de archivos en el proyecto */
(function () {
  "use strict";
  const K = window.FD_STRUCT_GEN_CORE, G = window.FD_STRUCT_GEN_CODE;
  const { svg, esc, clamp } = K;
  const T = (s) => (window.FD_I18N ? FD_I18N.t(s) : s);
  const api = () => window.FD_STRUCT_API;
  const st = () => api() && api().S;
  if (window.FD_I18N) FD_I18N.add([
    ["Base is {0}% grounded: pillars fill the gap on slopes.", "La base está apoyada al {0}%: los pilares rellenan el hueco en pendientes."],
    ["Hovering base detected: foundations only under solid columns.", "Base flotante detectada: los cimientos solo van bajo columnas sólidas."],
    ["Removes trees and terrain above the floor, {0}×{1} blocks plus a margin.", "Quita árboles y terreno sobre el suelo, {0}×{1} bloques más un margen."],
    ["Skips spots steeper than {0} blocks; the floor sits at the median ground height.", "Salta sitios con más de {0} bloques de pendiente; el suelo queda a la altura mediana del terreno."],
    ["{0} entrance(s): steps and headroom are built to each door.", "{0} entrada(s): se crean escalones y espacio libre hasta cada puerta."],
    ["No doors detected: nothing to connect.", "No se detectaron puertas: nada que conectar."],
    ["Needs solid rock around it (Y {0} to {1}); empty exterior keeps the stone.", "Necesita roca sólida alrededor (Y {0} a {1}); el exterior vacío conserva la piedra."],
    ["Floats at least 24 blocks above the ground (Y {0} to {1}).", "Flota al menos 24 bloques sobre el suelo (Y {0} a {1})."],
    ["Only where the whole footprint is under water.", "Solo donde toda la base está bajo el agua."],
    ["The empty air around the build is saved as structure_void so the terrain is kept.", "El aire vacío alrededor se guarda como structure_void para conservar el terreno."],
    ["Land", "Tierra"], ["Ocean", "Océano"], ["Caves", "Cuevas"],
    ["Plains", "Llanuras"], ["Forest", "Bosque"], ["Birch forest", "Bosque de abedules"], ["Dark forest", "Bosque oscuro"], ["Taiga", "Taiga"], ["Snowy", "Nevado"], ["Desert", "Desierto"], ["Badlands", "Badlands"], ["Savanna", "Sabana"], ["Jungle", "Jungla"], ["Swamp", "Pantano"], ["Mangrove swamp", "Manglar"], ["Mountains", "Montañas"], ["Meadow", "Prado"], ["Cherry grove", "Cerezos"], ["Pale garden", "Jardín pálido"], ["Beach", "Playa"], ["River", "Río"], ["Mushroom fields", "Campos de hongos"], ["Lush caves", "Cuevas frondosas"], ["Dripstone caves", "Cuevas de espeleotemas"], ["Deep dark", "Oscuridad profunda"],
    ["Nether wastes", "Desierto del Nether"], ["Crimson forest", "Bosque carmesí"], ["Warped forest", "Bosque distorsionado"], ["Soul sand valley", "Valle de arena de almas"], ["Basalt deltas", "Deltas de basalto"], ["End biomes", "Biomas del End"]
  ]);
  let an = null, dirtyAn = true, lastKey = "";

  function analysis() {
    const S = st();
    if (!S) return null;
    if (dirtyAn) {
      try {
        an = K.analyze(S, api());
      } catch (e) {
        console.error(e);
        an = null;
      }
      dirtyAn = false;
    }
    return an;
  }
  function dirty(force) {
    dirtyAn = true;
    if (force) lastKey = "";
  }
  const place = (g) => (g.auto && an ? an.rec.place : g.place);
  const freqLabel = (n) => {
    const f = K.FREQ.find((x) => x[0] === n);
    return f ? T(f[1]) : T("1 every {0} chunks").replace("{0}", n);
  };

  function planLines(g) {
    const a = an, out = [];
    if (!a) return out;
    const pl = place(g);
    out.push([K.P[pl] ? pl : "surface", T(K.PLACES.find((p) => p[0] === pl)[1]) + " · " + T(K.DIMS.find((d) => d[0] === g.dim)[1])]);
    if (g.adapt && pl === "surface") {
      if (g.foundation) out.push(["foundation", a.grounded >= 0.5 ? T("Base is {0}% grounded: pillars fill the gap on slopes.").replace("{0}", Math.round(a.grounded * 100)) : T("Hovering base detected: foundations only under solid columns.")]);
      if (g.clear) out.push(["clear", T("Removes trees and terrain above the floor, {0}×{1} blocks plus a margin.").replace("{0}", a.w).replace("{1}", a.d)]);
      if (g.level) out.push(["level", T("Skips spots steeper than {0} blocks; the floor sits at the median ground height.").replace("{0}", g.level)]);
      if (g.entrance) out.push(["door", a.doors ? T("{0} entrance(s): steps and headroom are built to each door.").replace("{0}", Math.round(a.doors)) : T("No doors detected: nothing to connect.")]);
    }
    if (pl === "underground") out.push(["underground", T("Needs solid rock around it (Y {0} to {1}); empty exterior keeps the stone.").replace("{0}", g.minY).replace("{1}", g.maxY)]);
    if (pl === "sky") out.push(["sky", T("Floats at least 24 blocks above the ground (Y {0} to {1}).").replace("{0}", g.skyMin).replace("{1}", g.skyMax)]);
    if (pl === "ocean") out.push(["ocean", T("Only where the whole footprint is under water.")]);
    out.push(["spacing", T("The empty air around the build is saved as structure_void so the terrain is kept.")]);
    return out;
  }

  function files(g, name) {
    const l = [], rot = g.engine === "script" && g.rotate ? 4 : 1;
    for (let i = 0; i < rot; i++) l.push("structures/" + name + "_gen" + (i ? "_r" + i : "") + ".mcstructure");
    if (g.engine === "native") l.push("features/" + name + "_feature.json", "feature_rules/" + name + "_rule.json");
    else l.push("scripts/fd_structgen.js");
    return l;
  }

  const chip = (on, data, icon, label, extra) => `<button class="sg-card${on ? " on" : ""}" ${data}${extra || ""}>${svg(icon, 22)}<span>${esc(label)}</span></button>`;
  const sw = (id, on) => `<label class="sg-sw"><input type="checkbox" id="${id}" ${on ? "checked" : ""}><i></i></label>`;
  const opt = (id, icon, title, sub, on, extra) => `<div class="sg-opt${on ? " on" : ""}"><div class="sg-oi">${svg(icon, 20)}</div><div class="sg-ot"><b>${title}</b><small>${sub}</small>${extra || ""}</div>${sw(id, on)}</div>`;

  function render() {
    const S = st(), root = document.getElementById("stPanGen");
    if (!S || !root) return;
    const g = K.ensure(S), a = analysis(), name = (api().U.slug(S.name) || "name");
    const on = !!g.on, pl = place(g), N = (k) => T(k);
    const dot = document.getElementById("stGenDot");
    if (dot) dot.textContent = on ? "ON" : "";
    let h = `<div class="sg">`;
    h += `<div class="sg-hero${on ? " on" : ""}"><div class="sg-hi">${svg("any", 26)}</div><div class="sg-ht"><b>${N("Structure Generation")}</b><small>${on ? N("Generate this structure automatically in the world") : N("Off: the structure is only exported as a file.")}</small></div>${sw("sgOn", on)}</div>`;
    if (!a) h += `<p class="st-muted">${N("Build something first so it can be analyzed.")}</p>`;
    else {
      h += `<div class="sg-sec"><div class="sg-h">${N("Detected style")}</div><div class="sg-style"><div class="sg-si">${svg(a.style === "structure" ? "monument" : a.style, 30)}</div><div class="sg-st"><b>${N(K.STYLES[a.style])}</b><small>${esc(a.why.join(" · "))}</small></div></div>
      <div class="sg-chips"><span>${N("Size")} ${a.w}×${a.h}×${a.d}</span><span>${N("Blocks")} ${a.solid.toLocaleString()}</span><span>${N("Interior")} ${Math.round(a.interior * 100)}%</span><span>${N("Grounded")} ${Math.round(a.grounded * 100)}%</span><span>${N("Doors")} ${Math.round(a.doors)}</span><span>${N("Containers")} ${a.containers}</span></div>
      <div class="sg-row"><button class="st-btn sm" data-sg="reanalyze">${svg("rotate", 14)} ${N("Analyze again")}</button><button class="st-btn sm primary" data-sg="recommend">${N("Use recommended settings")}</button></div></div>`;
    }
    h += `<div class="sg-body${on ? "" : " off"}">`;
    h += `<div class="sg-sec"><div class="sg-h">${N("Dimension")}</div><div class="sg-grid3">${K.DIMS.map((d) => chip(g.dim === d[0], `data-sg="dim" data-v="${d[0]}"`, d[0], N(d[1]))).join("")}</div></div>`;
    h += `<div class="sg-sec"><div class="sg-h">${N("Location")}<label class="sg-auto"><input type="checkbox" id="sgAuto" ${g.auto ? "checked" : ""}> ${N("Auto (use the detected style)")}</label></div><div class="sg-grid4${g.auto ? " dim" : ""}">${K.PLACES.map((p) => chip(pl === p[0], `data-sg="place" data-v="${p[0]}"`, p[0], N(p[1]))).join("")}</div>`;
    if (pl === "underground") h += `<div class="sg-range">${N("Height range (Y)")}: ${N("From")} <input type="number" id="sgMinY" value="${g.minY}" min="-64" max="300"> ${N("To")} <input type="number" id="sgMaxY" value="${g.maxY}" min="-60" max="316"></div>`;
    if (pl === "sky") h += `<div class="sg-range">${N("Height range (Y)")}: ${N("From")} <input type="number" id="sgSkyMin" value="${g.skyMin}" min="0" max="300"> ${N("To")} <input type="number" id="sgSkyMax" value="${g.skyMax}" min="20" max="316"></div>`;
    h += `</div>`;
    h += `<div class="sg-sec"><div class="sg-h">${svg("freq", 16)} ${N("Frequency")}<b class="sg-val">${freqLabel(g.every)}</b></div><div class="sg-freq">${K.FREQ.map((f) => `<button class="sg-fq${g.every === f[0] ? " on" : ""}" data-sg="every" data-v="${f[0]}">${N(f[1])}</button>`).join("")}</div>
      <div class="sg-range"><input type="range" id="sgEveryR" min="2" max="160" value="${g.every}"> <input type="number" id="sgEvery" min="1" max="1000" value="${g.every}"></div><p class="st-muted">${N("About {0} per 1000×1000 blocks").replace("{0}", (3906 / g.every).toFixed(g.every < 20 ? 0 : 1))}</p></div>`;
    const bl = g.dim === "overworld" ? K.BIOMES.overworld : K.BIOMES[g.dim];
    h += `<div class="sg-sec"><div class="sg-h">${N("Biomes")}<b class="sg-val">${g.biomes.length ? g.biomes.length : N("Any biome")}</b></div><div class="sg-bio"><button class="sg-b${g.biomes.length ? "" : " on"}" data-sg="bioclear">${svg("any", 16)}<span>${N("Any biome")}</span></button>`;
    let lastG = "";
    bl.forEach((b) => {
      if (b.g && b.g !== lastG) {
        lastG = b.g;
        h += `<div class="sg-bg">${N(b.g)}</div>`;
      }
      h += `<button class="sg-b${g.biomes.indexOf(b.k) >= 0 ? " on" : ""}" data-sg="bio" data-v="${b.k}">${svg(K.biomeIcon(b.k), 16)}<span>${N(b.n)}</span></button>`;
    });
    h += `</div>${an && an.rec.biomes.length ? `<p class="st-muted">${an.rec.biomes.map((k) => N((K.allBiomes().find((b) => b.k === k) || {}).n || k)).join(", ")} ← ${N("Recommended")}</p>` : ""}</div>`;
    h += `<div class="sg-sec"><div class="sg-h">${svg("level", 16)} ${N("Complement with the world")}${sw("sgAdapt", g.adapt)}</div><p class="st-muted">${N("The generator adapts the structure to the terrain using what it detected in your build.")}</p><div class="sg-opts${g.adapt ? "" : " dim"}">`;
    const surf = pl === "surface";
    if (surf) {
      h += opt("sgFound", "foundation", N("Foundations"), N("Fills the gap under the build"), g.foundation);
      h += opt("sgClear", "clear", N("Clear obstacles"), N("Removes trees and terrain in the way"), g.clear);
      h += opt("sgLevel", "level", N("Level terrain"), N("Max slope: {0} blocks").replace("{0}", g.level), true, `<input type="range" id="sgLevelN" min="1" max="12" value="${g.level}">`);
      h += opt("sgWater", "nowater", N("Avoid water"), N("Skips lakes and oceans"), !g.water);
      h += opt("sgEnt", "door", N("Entrances"), N("Builds steps and clears the way to the doors"), g.entrance);
    }
    h += opt("sgRot", "rotate", N("Random rotation"), N("4 facings, entrances follow"), g.rotate);
    h += opt("sgSp", "spacing", N("Minimum distance between copies"), N("{0} chunks").replace("{0}", g.spacing), true, `<input type="range" id="sgSpN" min="2" max="32" value="${g.spacing}">`);
    if (surf) h += `<label class="sg-f">${N("Foundation block")}<input type="text" id="sgFB" placeholder="${esc(a ? a.rec.foundBlock : "minecraft:cobblestone")}" value="${esc(g.foundBlock)}" spellcheck="false"></label>`;
    h += `</div>`;
    const pl2 = planLines(g);
    if (pl2.length) h += `<div class="sg-plan"><div class="sg-h">${N("Plan")}</div>${pl2.map((p) => `<div class="sg-pl">${svg(p[0], 16)}<span>${esc(p[1])}</span></div>`).join("")}</div>`;
    h += `</div>`;
    h += `<div class="sg-sec"><div class="sg-h">${N("Engine")}</div><div class="sg-eng">
      <button class="sg-e${g.engine === "native" ? " on" : ""}" data-sg="engine" data-v="native">${svg("engineN", 22)}<div><b>${N("Native (feature rules)")}${a && !g.adapt ? `<em>${N("Recommended")}</em>` : ""}</b><small>${N("Official Bedrock world generation. No scripting, exact biome filters.")}</small></div></button>
      <button class="sg-e${g.engine === "script" ? " on" : ""}" data-sg="engine" data-v="script">${svg("engineS", 22)}<div><b>${N("Adaptive (script)")}${g.adapt && surf ? `<em>${N("Recommended")}</em>` : ""}</b><small>${N("Full terrain complement: foundations, clearing, leveling and entrances.")}</small></div></button></div>`;
    if (a && g.engine === "native" && Math.max(a.w, a.d, a.h) > 64) h += `<p class="sg-warn">${N("Very large structures may fail to place with feature rules (about 64+ blocks per side). The script engine handles them better.")}</p>`;
    if (g.engine === "script" && g.biomes.length) h += `<p class="sg-warn">${N("The script engine filters biomes with the biome API (dimension.getBiome). If your game version lacks it, use the native engine.")}</p>`;
    if (g.engine === "native") h += `<p class="st-muted">${N("New chunks only: structures appear in terrain that has not been generated yet (native engine). Create a new world or explore new areas.")}</p>`;
    h += `</div>`;
    h += `<div class="sg-sec"><div class="sg-h">${svg("file", 16)} ${N("Files that will be written")}</div><div class="sg-files">${files(g, name).map((f) => `<code>${esc(f)}</code>`).join("")}</div>
      <label class="sg-f">${N("Namespace")}<input type="text" id="sgNs" value="${esc(g.ns)}" spellcheck="false"></label>
      <div class="sg-row"><button class="st-btn primary" data-sg="create">${svg("bolt", 16)} ${N("Write everything now")}</button></div></div>`;
    h += `</div></div>`;
    const key = h;
    if (key !== lastKey) {
      const sc = root.scrollTop, ae = document.activeElement, id = ae && ae.id, pos = ae && ae.selectionStart;
      root.innerHTML = h;
      lastKey = key;
      root.scrollTop = sc;
      if (id && root.querySelector("#" + id) && /Ns|FB|Every$|MinY|MaxY|SkyM/.test(id)) {
        const el = root.querySelector("#" + id);
        el.focus();
        try {
          el.setSelectionRange(pos, pos);
        } catch (e) {
        }
      }
    }
  }

  function apply(rec) {
    const g = st().gen;
    ["dim", "every", "level", "spacing", "foundation", "clear", "entrance", "foundBlock"].forEach((k) => {
      if (rec[k] !== void 0) g[k] = rec[k];
    });
    g.biomes = rec.biomes.slice();
    g.place = rec.place;
    g.auto = true;
    g.foundBlock = "";
  }

  function bind() {
    const root = document.getElementById("stPanGen");
    if (!root || root.__sg) return;
    root.__sg = true;
    const S = () => st(), g = () => K.ensure(S());
    const up = () => {
      lastKey = "";
      render();
      if (window.FD_STRUCT_API) FD_STRUCT_API.changed();
    };
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-sg]");
      if (!b) return;
      const k = b.dataset.sg, v = b.dataset.v, G0 = g();
      if (k === "dim") {
        G0.dim = v;
        G0.biomes = [];
      } else if (k === "place") {
        G0.place = v;
        G0.auto = false;
      } else if (k === "every") G0.every = +v;
      else if (k === "bio") {
        const i = G0.biomes.indexOf(v);
        if (i >= 0) G0.biomes.splice(i, 1);
        else G0.biomes.push(v);
      } else if (k === "bioclear") G0.biomes = [];
      else if (k === "engine") G0.engine = v;
      else if (k === "reanalyze") dirty();
      else if (k === "recommend") {
        dirty();
        const a = analysis();
        if (a) apply(a.rec);
      } else if (k === "create") {
        api().create();
        return;
      }
      up();
    });
    root.addEventListener("change", (e) => {
      const t = e.target, G0 = g();
      if (t.id === "sgOn") {
        G0.on = t.checked;
        if (t.checked && !G0.__init) {
          G0.__init = true;
          const a = analysis();
          if (a) apply(a.rec);
        }
      } else if (t.id === "sgAuto") G0.auto = t.checked;
      else if (t.id === "sgAdapt") G0.adapt = t.checked;
      else if (t.id === "sgFound") G0.foundation = t.checked;
      else if (t.id === "sgClear") G0.clear = t.checked;
      else if (t.id === "sgWater") G0.water = !t.checked;
      else if (t.id === "sgEnt") G0.entrance = t.checked;
      else if (t.id === "sgRot") G0.rotate = t.checked;
      else if (t.id === "sgEvery") G0.every = clamp(+t.value || 24, 1, 1000);
      else if (/^sg(MinY|MaxY|SkyMin|SkyMax)$/.test(t.id)) {
        const m = { sgMinY: "minY", sgMaxY: "maxY", sgSkyMin: "skyMin", sgSkyMax: "skyMax" }[t.id];
        G0[m] = clamp(+t.value || 0, -64, 316);
      } else return;
      up();
    });
    root.addEventListener("input", (e) => {
      const t = e.target, G0 = g();
      if (t.id === "sgEveryR") G0.every = +t.value;
      else if (t.id === "sgLevelN") G0.level = +t.value;
      else if (t.id === "sgSpN") G0.spacing = +t.value;
      else if (t.id === "sgNs") {
        G0.ns = t.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
        return;
      } else if (t.id === "sgFB") {
        G0.foundBlock = t.value.trim();
        return;
      } else return;
      if (t.type === "range") {
        lastKey = "";
        render();
      }
    });
  }

  // ---------- escritura en el proyecto ----------
  function wireScript(bp, report, file) {
    const U = api().U, V = window.FD_VERSIONS || { server: "2.0.0" }, m = bp.json;
    m.modules = m.modules || [];
    m.dependencies = m.dependencies || [];
    let sm = m.modules.find((x) => x.type === "script");
    if (!sm) {
      sm = { type: "script", language: "javascript", uuid: U.uuid(), entry: "scripts/main.js", version: [1, 0, 0] };
      m.modules.push(sm);
    }
    if (!m.dependencies.some((d) => d.module_name === "@minecraft/server")) m.dependencies.push({ module_name: "@minecraft/server", version: V.server });
    bp.manifest.content = U.J(m);
    const parts = sm.entry.split("/");
    parts.pop();
    const dir = parts.join("/"), sp = (dir ? dir + "/" : "") + file, f = U.getFile(sp, bp.folder);
    const en = U.getFile(sm.entry, bp.folder), imp = 'import "./' + file + '";';
    if (en.created) {
      en.node.content = "// Behavior Pack entry point\n" + imp + "\n";
      report.push("+ " + bp.folder.name + "/" + sm.entry);
    } else if (en.node.content.indexOf(file) < 0) {
      en.node.content = imp + "\n" + (en.node.content || "");
      report.push("~ " + bp.folder.name + "/" + sm.entry);
    }
    report.push("~ " + bp.folder.name + "/manifest.json");
    return { f, sp };
  }

  function onCreate(o) {
    const A = api(), S = A.S, U = A.U, g = K.ensure(S), a = analysis() || K.analyze(S, A);
    if (!a) {
      A.toast(T("Generation is on but the structure is empty."));
      return null;
    }
    const pl = g.auto ? a.rec.place : g.place, script = g.engine === "script", name = o.name;
    const fb = g.foundBlock || a.rec.foundBlock || "minecraft:cobblestone";
    const vars = G.bake({ A, S, rotations: script && g.rotate, buildPiece: o.buildPiece, lootRel: o.lootRel });
    const sid = (i) => G.structId(o.folderPath, name + "_gen" + (i ? "_r" + i : ""));
    vars.forEach((v) => {
      const bn = name + "_gen" + (v.rot ? "_r" + v.rot : ""), f = U.getFile(bn + ".mcstructure", o.folder);
      f.node.content = "data:application/octet-stream;base64," + o.b64(v.bytes);
      o.report.push((f.created ? "+ " : "~ ") + o.folderPath + "/" + bn + ".mcstructure");
      v.id = sid(v.rot);
    });
    const bp = U.ensurePack("bp");
    let html = "";
    const cmd = (t) => `<div class="st-cmd"><code>${esc(t)}</code><button class="st-btn sm" data-copy="${esc(t)}">${T("Copy")}</button></div>`;
    if (!script) {
      const nf = G.nativeFiles({ gen: g, name, place: pl, size: vars[0].size, structId: vars[0].id });
      const f1 = U.getFile("features/" + name + "_feature.json", bp.folder), f2 = U.getFile("feature_rules/" + name + "_rule.json", bp.folder);
      f1.node.content = U.J(nf.feature);
      f2.node.content = U.J(nf.rule);
      o.report.push((f1.created ? "+ " : "~ ") + bp.folder.name + "/features/" + name + "_feature.json");
      o.report.push((f2.created ? "+ " : "~ ") + bp.folder.name + "/feature_rules/" + name + "_rule.json");
      html = `<h4>${T("Structure Generation")}</h4><p class="st-muted">${T("New chunks only: structures appear in terrain that has not been generated yet (native engine). Create a new world or explore new areas.")}</p>`;
    } else {
      const R = Math.max(Math.ceil(Math.sqrt(g.every)), g.spacing), biomes = {};
      g.biomes.forEach((k) => {
        const b = K.allBiomes().find((x) => x.k === k);
        if (b) biomes[k] = b.rx;
      });
      const cfg = {
        name, dim: g.dim, place: pl, cell: R, p: Math.min(1, R * R / g.every), salt: g.salt, biomes: g.biomes.slice(), minY: g.minY, maxY: g.maxY, skyMin: g.skyMin, skyMax: g.skyMax, skyGap: 24,
        adapt: { on: !!g.adapt, foundation: !!g.foundation, clear: !!g.clear, level: g.level, water: !!g.water, base: a.style === "ruin" ? "min" : "median", sink: a.style === "ruin" ? 1 : 0, maxFound: 16, foundBlock: fb, entrance: !!g.entrance },
        variants: vars.map((v) => ({ id: v.id, size: v.size, fp: v.fp, ent: v.ent }))
      };
      const ws = wireScript(bp, o.report, "fd_structgen.js"), prev = ws.f.created ? [] : G.parsePrev(ws.f.node.content).filter((c) => c.name !== name);
      const all = prev.concat([cfg]), brx = {};
      all.forEach((c) => (c.biomes || []).forEach((k) => {
        const b = K.allBiomes().find((x) => x.k === k);
        if (b) brx[k] = b.rx;
      }));
      ws.f.node.content = G.scriptSource(all, brx);
      o.report.push((ws.f.created ? "+ " : "~ ") + bp.folder.name + "/" + ws.sp);
      html = `<h4>${T("Test it in the world")}</h4><p class="st-muted">${T("Forces one copy where you stand (adaptive engine):")}</p>${cmd("/scriptevent fd:structgen " + name)}<p class="st-muted">${T("Forget every generated spot (adaptive engine):")}</p>${cmd("/scriptevent fd:structgen reset")}`;
    }
    return { html };
  }

  (window.FD_STRUCT_HOOKS = window.FD_STRUCT_HOOKS || []).push((api0) => {
    dirtyAn = true;
    lastKey = "";
    bind();
    K.ensure(api0.S);
    const dot = document.getElementById("stGenDot");
    if (dot) dot.textContent = api0.S.gen.on ? "ON" : "";
  });

  window.FD_STRUCT_GEN = { render, dirty, onCreate, analysis };
})();

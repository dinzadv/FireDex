(function() {
  const V = window.FD_VERSIONS, U = window.FD_UTIL;
  const field = (l, id, v, ph) => `<div class="imgjson-field"><label>${l}</label><input type="text" id="${id}" value="${U.esc(v || "")}" placeholder="${U.esc(ph || "")}"></div>`;
  const head = (t) => `<div class="tbx-tool-head"><button class="tbx-back" id="t2Back">${UI_ICONS.back}</button><h3>${t}</h3></div>`;
  const shell = (t, body, fn) => showModal(`<div class="modal tbx-modal" style="width:560px">${head(t)}${body}</div>`, (el) => {
    el.querySelector("#t2Back").onclick = () => {
      closeModal();
      showToolboxModal();
    };
    fn(el);
  });
  const done = (paths) => {
    render();
    saveState();
    showToast("Creado: " + paths);
    closeModal();
  };
  function openVersions() {
    const dep = (n, v) => `{ "module_name": "${n}", "version": "${v}" }`;
    const snippet = `"dependencies": [
  ${dep("@minecraft/server", V.server)},
  ${dep("@minecraft/server-ui", V.serverUi)}
]`;
    shell("Versiones y APIs", `<p class="ij-lead">Versiones de referencia usadas por el editor (revisadas en nov-2026).</p>
<div class="model-summary-card"><div class="model-summary-row">Bedrock estable: <b>${V.game}</b></div><div class="model-summary-row">@minecraft/server: <b>${V.server}</b></div><div class="model-summary-row">@minecraft/server-ui: <b>${V.serverUi}</b> (requiere server 2.x)</div><div class="model-summary-row">@minecraft/common: <b>${V.common}</b></div><div class="model-summary-row">min_engine_version por defecto: <b>${V.minEngine.join(".")}</b> (la numeraci\xF3n 26.x no est\xE1 verificada en este campo)</div></div>
<pre class="snippet-code">${U.esc(snippet)}</pre><div class="modal-actions"><button class="btn btn-ghost" id="vCopy">Copiar dependencias</button><button class="btn btn-primary" id="vIns">Insertar en archivo</button></div>`, (el) => {
      el.querySelector("#vCopy").onclick = () => {
        copyToClipboard(snippet);
        showToast("Copiado");
      };
      el.querySelector("#vIns").onclick = () => {
        if (insertAtCursor(snippet)) {
          showToast("Insertado");
          closeModal();
        } else showToast("Abre un archivo en el editor primero.");
      };
    });
  }
  function openIcon() {
    shell("Icono de pack", `<p class="ij-lead">Convierte cualquier imagen en un <code>pack_icon.png</code> cuadrado listo para el BP y/o RP.</p>
<label class="imgjson-upload"><span>Elegir imagen</span><input type="file" id="icF" accept="image/*" hidden></label>
<div class="imgjson-field-row"><div class="imgjson-field"><label>Tama\xF1o</label><select id="icS"><option>256</option><option>128</option><option>64</option></select></div>
<div class="imgjson-field"><label>Guardar en</label><select id="icP"><option value="both">BP y RP</option><option value="bp">Solo BP</option><option value="rp">Solo RP</option></select></div></div>
<div class="imgjson-preview-wrap"><canvas id="icC" width="128" height="128" style="width:128px;height:128px"></canvas></div>
<div class="modal-actions"><button class="btn btn-primary" id="icGo" disabled>Guardar pack_icon.png</button></div>`, (el) => {
      let img = null;
      const cv = el.querySelector("#icC");
      const draw = (c, S) => {
        c.width = c.height = S;
        const g = c.getContext("2d"), m = Math.min(img.width, img.height);
        g.clearRect(0, 0, S, S);
        g.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
      };
      el.querySelector("#icF").onchange = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const i = new Image();
        i.onload = () => {
          img = i;
          draw(cv, 128);
          el.querySelector("#icGo").disabled = false;
        };
        i.src = URL.createObjectURL(f);
      };
      el.querySelector("#icGo").onclick = () => {
        const S = +el.querySelector("#icS").value, w = el.querySelector("#icP").value, c = document.createElement("canvas");
        draw(c, S);
        const url = c.toDataURL("image/png"), out = [];
        (w === "both" ? ["bp", "rp"] : [w]).forEach((k) => {
          const p = U.ensurePack(k);
          U.getFile("pack_icon.png", p.folder).node.content = url;
          out.push(p.folder.name + "/pack_icon.png");
        });
        done(out.join(", "));
      };
    });
  }
  function openRecipe() {
    shell("Generador de recetas", `<p class="ij-lead">Crea una receta de crafteo en <code>recipes/</code> del Behavior Pack.</p>
<div class="imgjson-field"><label>Tipo</label><select id="rT"><option value="shaped">Con forma (3\xD73)</option><option value="shapeless">Sin forma</option></select></div>
${field("ID de la receta", "rId", "fd:mi_receta")}${field("Resultado (item)", "rR", "minecraft:diamond_sword")}${field("Cantidad", "rN", "1")}
<div class="imgjson-field"><label>Patr\xF3n (una fila por l\xEDnea, espacio = vac\xEDo)</label><textarea id="rP" rows="3" style="background:var(--panel3);color:var(--text);border:1px solid var(--border-soft);border-radius:8px;padding:8px;font-family:monospace">D\\nD\\nS</textarea></div>
<div class="imgjson-field"><label>Ingredientes (una l\xEDnea: letra=item; en "sin forma" solo items)</label><textarea id="rK" rows="3" style="background:var(--panel3);color:var(--text);border:1px solid var(--border-soft);border-radius:8px;padding:8px;font-family:monospace">D=minecraft:diamond\\nS=minecraft:stick</textarea></div>
<div class="modal-actions"><button class="btn btn-primary" id="rGo">Crear receta</button></div>`, (el) => {
      el.querySelector("#rP").value = "D\nD\nS";
      el.querySelector("#rK").value = "D=minecraft:diamond\nS=minecraft:stick";
      el.querySelector("#rGo").onclick = () => {
        const id = el.querySelector("#rId").value.trim(), res = el.querySelector("#rR").value.trim(), n = Math.max(1, +el.querySelector("#rN").value || 1), t = el.querySelector("#rT").value;
        if (!/^[a-z0-9_]+:[a-z0-9_]+$/.test(id) || !res) return showToast("ID inv\xE1lido (usa espacio:nombre en min\xFAsculas).");
        const lines = el.querySelector("#rK").value.split("\n").map((x) => x.trim()).filter(Boolean);
        let r;
        if (t === "shaped") {
          const key = {};
          lines.forEach((l) => {
            const [k, v] = l.split("=");
            if (k && v) key[k.trim()] = { item: v.trim() };
          });
          r = { format_version: "1.20.10", "minecraft:recipe_shaped": { description: { identifier: id }, tags: ["crafting_table"], pattern: el.querySelector("#rP").value.split("\n").filter((x) => x.length), key, result: { item: res, count: n } } };
        } else r = { format_version: "1.20.10", "minecraft:recipe_shapeless": { description: { identifier: id }, tags: ["crafting_table"], ingredients: lines.map((l) => ({ item: l.split("=").pop().trim() })), result: { item: res, count: n } } };
        const bp = U.ensurePack("bp"), path = "recipes/" + id.split(":")[1] + ".json";
        U.getFile(path, bp.folder).node.content = U.J(r);
        done(bp.folder.name + "/" + path);
      };
    });
  }
  function openLoot() {
    shell("Generador de loot table", `<p class="ij-lead">Una l\xEDnea por objeto: <code>item, m\xEDn, m\xE1x, peso</code>.</p>
${field("Nombre del archivo", "lN", "mi_loot")}
<div class="imgjson-field"><label>Objetos</label><textarea id="lI" rows="5" style="background:var(--panel3);color:var(--text);border:1px solid var(--border-soft);border-radius:8px;padding:8px;font-family:monospace"></textarea></div>
<div class="imgjson-field"><label>Tiradas</label><input type="text" id="lR" value="1"></div>
<div class="modal-actions"><button class="btn btn-primary" id="lGo">Crear loot table</button></div>`, (el) => {
      el.querySelector("#lI").value = "minecraft:diamond, 1, 3, 1\nminecraft:iron_ingot, 2, 5, 5";
      el.querySelector("#lGo").onclick = () => {
        const entries = el.querySelector("#lI").value.split("\n").map((l) => l.split(",").map((x) => x.trim())).filter((a) => a[0]).map((a) => {
          const mn = +a[1] || 1, mx = +a[2] || mn, e = { type: "item", name: a[0], weight: +a[3] || 1 };
          e.functions = [{ function: "set_count", count: mn === mx ? mn : { min: mn, max: mx } }];
          return e;
        });
        if (!entries.length) return showToast("A\xF1ade al menos un objeto.");
        const name = U.slug(el.querySelector("#lN").value), bp = U.ensurePack("bp"), path = "loot_tables/" + name + ".json";
        U.getFile(path, bp.folder).node.content = U.J({ pools: [{ rolls: Math.max(1, +el.querySelector("#lR").value || 1), entries }] });
        done(bp.folder.name + "/" + path);
      };
    });
  }
  function openImages() {
    shell("Add images to the addon", `<p class="ij-lead">Import PNG/JPG/WebP images into any folder of your project (textures, UI, item icons\u2026). Optional resize keeps pixel art crisp.</p>
<label class="imgjson-upload"><span>Choose images</span><input type="file" id="imF" accept="image/*" multiple hidden></label>
<div class="imgjson-field"><label>Destination folder (any path, created if missing)</label><input type="text" id="imD" list="imDl" value="${U.esc((U.findPacks().rp ? U.findPacks().rp.folder.name : "RP") + "/textures/custom")}"><datalist id="imDl">${U.folderPaths().map((p) => `<option value="${U.esc(p)}">`).join("")}</datalist></div>
<div class="imgjson-field-row"><div class="imgjson-field"><label>Resize to (px, 0 = keep)</label><input type="number" id="imS" value="0" min="0" max="2048"></div>
<div class="imgjson-field imgjson-field-checkbox"><label><input type="checkbox" id="imP" checked> Pixel art (no smoothing)</label></div></div>
<div class="ij-files" id="imL"></div><div class="modal-actions"><button class="btn btn-primary" id="imGo" disabled>Add to project</button></div>`, (el) => {
      let files = [];
      el.querySelector("#imF").onchange = (e) => {
        files = Array.from(e.target.files);
        el.querySelector("#imL").innerHTML = files.map((f) => "<li>" + U.esc(f.name) + "</li>").join("");
        el.querySelector("#imGo").disabled = !files.length;
      };
      el.querySelector("#imGo").onclick = async () => {
        const dir = el.querySelector("#imD").value.trim().replace(/^\/+|\/+$/g, ""), S = +el.querySelector("#imS").value || 0, px = el.querySelector("#imP").checked, out = [];
        for (const f of files) {
          const img = await new Promise((r, j) => {
            const i = new Image();
            i.onload = () => r(i);
            i.onerror = j;
            i.src = URL.createObjectURL(f);
          }).catch(() => null);
          if (!img) continue;
          const sc = S ? Math.min(1, S / Math.max(img.width, img.height)) : 1, c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(img.width * sc));
          c.height = Math.max(1, Math.round(img.height * sc));
          const g = c.getContext("2d");
          g.imageSmoothingEnabled = !px;
          g.drawImage(img, 0, 0, c.width, c.height);
          const name = U.slug(f.name) + ".png";
          U.writeProjectFile((dir ? dir + "/" : "") + name, c.toDataURL("image/png"));
          out.push(name);
        }
        done(out.length + " image(s) \u2192 " + (dir || "/"));
      };
    });
  }
  const ic = UI_ICONS;
  TOOLBOX_TOOLS.push(
    { id: "versions", name: "Versiones y APIs", desc: "Versiones actuales de Bedrock y de @minecraft/server / server-ui.", icon: ic.manifest, onOpen: openVersions },
    { id: "images", name: "Images", desc: "Import images into any project folder (textures, UI, icons).", icon: ic.upload, onOpen: openImages },
    { id: "packicon", name: "Icono de pack", desc: "Crea pack_icon.png cuadrado desde cualquier imagen.", icon: ic.imgjson, onOpen: openIcon },
    { id: "recipe", name: "Recetas", desc: "Genera recetas shaped / shapeless en el BP.", icon: ic.snippet, onOpen: openRecipe },
    { id: "loot", name: "Loot tables", desc: "Genera tablas de bot\xEDn con cantidades y pesos.", icon: ic.models, onOpen: openLoot }
  );
})();

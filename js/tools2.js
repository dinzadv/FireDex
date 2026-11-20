/* Herramientas extra del Toolbox: versiones, icono de pack, recetas, loot tables */
(function () {
  const V = window.FD_VERSIONS, U = window.FD_UTIL;
  const field = (l, id, v, ph) => `<div class="imgjson-field"><label>${l}</label><input type="text" id="${id}" value="${U.esc(v || '')}" placeholder="${U.esc(ph || '')}"></div>`;
  const head = (t) => `<div class="tbx-tool-head"><button class="tbx-back" id="t2Back">${UI_ICONS.back}</button><h3>${t}</h3></div>`;
  const shell = (t, body, fn) => showModal(`<div class="modal tbx-modal" style="width:560px">${head(t)}${body}</div>`, (el) => { el.querySelector('#t2Back').onclick = () => { closeModal(); showToolboxModal(); }; fn(el); });
  const done = (paths) => { render(); saveState(); showToast('Creado: ' + paths); closeModal(); };

  function openVersions() {
    const dep = (n, v) => `{ "module_name": "${n}", "version": "${v}" }`;
    const snippet = `"dependencies": [\n  ${dep('@minecraft/server', V.server)},\n  ${dep('@minecraft/server-ui', V.serverUi)}\n]`;
    shell('Versiones y APIs', `<p class="ij-lead">Versiones de referencia usadas por el editor (revisadas en nov-2026).</p>
<div class="model-summary-card"><div class="model-summary-row">Bedrock estable: <b>${V.game}</b></div><div class="model-summary-row">@minecraft/server: <b>${V.server}</b></div><div class="model-summary-row">@minecraft/server-ui: <b>${V.serverUi}</b> (requiere server 2.x)</div><div class="model-summary-row">@minecraft/common: <b>${V.common}</b></div><div class="model-summary-row">min_engine_version por defecto: <b>${V.minEngine.join('.')}</b> (la numeración 26.x no está verificada en este campo)</div></div>
<pre class="snippet-code">${U.esc(snippet)}</pre><div class="modal-actions"><button class="btn btn-ghost" id="vCopy">Copiar dependencias</button><button class="btn btn-primary" id="vIns">Insertar en archivo</button></div>`, (el) => {
      el.querySelector('#vCopy').onclick = () => { copyToClipboard(snippet); showToast('Copiado'); };
      el.querySelector('#vIns').onclick = () => { if (insertAtCursor(snippet)) { showToast('Insertado'); closeModal(); } else showToast('Abre un archivo en el editor primero.'); };
    });
  }

  function openIcon() {
    shell('Icono de pack', `<p class="ij-lead">Convierte cualquier imagen en un <code>pack_icon.png</code> cuadrado listo para el BP y/o RP.</p>
<label class="imgjson-upload"><span>Elegir imagen</span><input type="file" id="icF" accept="image/*" hidden></label>
<div class="imgjson-field-row"><div class="imgjson-field"><label>Tamaño</label><select id="icS"><option>256</option><option>128</option><option>64</option></select></div>
<div class="imgjson-field"><label>Guardar en</label><select id="icP"><option value="both">BP y RP</option><option value="bp">Solo BP</option><option value="rp">Solo RP</option></select></div></div>
<div class="imgjson-preview-wrap"><canvas id="icC" width="128" height="128" style="width:128px;height:128px"></canvas></div>
<div class="modal-actions"><button class="btn btn-primary" id="icGo" disabled>Guardar pack_icon.png</button></div>`, (el) => {
      let img = null; const cv = el.querySelector('#icC');
      const draw = (c, S) => { c.width = c.height = S; const g = c.getContext('2d'), m = Math.min(img.width, img.height); g.clearRect(0, 0, S, S); g.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S); };
      el.querySelector('#icF').onchange = (e) => { const f = e.target.files[0]; if (!f) return; const i = new Image(); i.onload = () => { img = i; draw(cv, 128); el.querySelector('#icGo').disabled = false; }; i.src = URL.createObjectURL(f); };
      el.querySelector('#icGo').onclick = () => {
        const S = +el.querySelector('#icS').value, w = el.querySelector('#icP').value, c = document.createElement('canvas'); draw(c, S);
        const url = c.toDataURL('image/png'), out = [];
        (w === 'both' ? ['bp', 'rp'] : [w]).forEach((k) => { const p = U.ensurePack(k); U.getFile('pack_icon.png', p.folder).node.content = url; out.push(p.folder.name + '/pack_icon.png'); });
        done(out.join(', '));
      };
    });
  }

  function openRecipe() {
    shell('Generador de recetas', `<p class="ij-lead">Crea una receta de crafteo en <code>recipes/</code> del Behavior Pack.</p>
<div class="imgjson-field"><label>Tipo</label><select id="rT"><option value="shaped">Con forma (3×3)</option><option value="shapeless">Sin forma</option></select></div>
${field('ID de la receta', 'rId', 'fd:mi_receta')}${field('Resultado (item)', 'rR', 'minecraft:diamond_sword')}${field('Cantidad', 'rN', '1')}
<div class="imgjson-field"><label>Patrón (una fila por línea, espacio = vacío)</label><textarea id="rP" rows="3" style="background:var(--panel3);color:var(--text);border:1px solid var(--border-soft);border-radius:8px;padding:8px;font-family:monospace">D\\nD\\nS</textarea></div>
<div class="imgjson-field"><label>Ingredientes (una línea: letra=item; en "sin forma" solo items)</label><textarea id="rK" rows="3" style="background:var(--panel3);color:var(--text);border:1px solid var(--border-soft);border-radius:8px;padding:8px;font-family:monospace">D=minecraft:diamond\\nS=minecraft:stick</textarea></div>
<div class="modal-actions"><button class="btn btn-primary" id="rGo">Crear receta</button></div>`, (el) => {
      el.querySelector('#rP').value = 'D\nD\nS'; el.querySelector('#rK').value = 'D=minecraft:diamond\nS=minecraft:stick';
      el.querySelector('#rGo').onclick = () => {
        const id = el.querySelector('#rId').value.trim(), res = el.querySelector('#rR').value.trim(), n = Math.max(1, +el.querySelector('#rN').value || 1), t = el.querySelector('#rT').value;
        if (!/^[a-z0-9_]+:[a-z0-9_]+$/.test(id) || !res) return showToast('ID inválido (usa espacio:nombre en minúsculas).');
        const lines = el.querySelector('#rK').value.split('\n').map((x) => x.trim()).filter(Boolean);
        let r;
        if (t === 'shaped') {
          const key = {}; lines.forEach((l) => { const [k, v] = l.split('='); if (k && v) key[k.trim()] = { item: v.trim() }; });
          r = { format_version: '1.20.10', 'minecraft:recipe_shaped': { description: { identifier: id }, tags: ['crafting_table'], pattern: el.querySelector('#rP').value.split('\n').filter((x) => x.length), key, result: { item: res, count: n } } };
        } else r = { format_version: '1.20.10', 'minecraft:recipe_shapeless': { description: { identifier: id }, tags: ['crafting_table'], ingredients: lines.map((l) => ({ item: l.split('=').pop().trim() })), result: { item: res, count: n } } };
        const bp = U.ensurePack('bp'), path = 'recipes/' + id.split(':')[1] + '.json';
        U.getFile(path, bp.folder).node.content = U.J(r); done(bp.folder.name + '/' + path);
      };
    });
  }

  function openLoot() {
    shell('Generador de loot table', `<p class="ij-lead">Una línea por objeto: <code>item, mín, máx, peso</code>.</p>
${field('Nombre del archivo', 'lN', 'mi_loot')}
<div class="imgjson-field"><label>Objetos</label><textarea id="lI" rows="5" style="background:var(--panel3);color:var(--text);border:1px solid var(--border-soft);border-radius:8px;padding:8px;font-family:monospace"></textarea></div>
<div class="imgjson-field"><label>Tiradas</label><input type="text" id="lR" value="1"></div>
<div class="modal-actions"><button class="btn btn-primary" id="lGo">Crear loot table</button></div>`, (el) => {
      el.querySelector('#lI').value = 'minecraft:diamond, 1, 3, 1\nminecraft:iron_ingot, 2, 5, 5';
      el.querySelector('#lGo').onclick = () => {
        const entries = el.querySelector('#lI').value.split('\n').map((l) => l.split(',').map((x) => x.trim())).filter((a) => a[0]).map((a) => {
          const mn = +a[1] || 1, mx = +a[2] || mn, e = { type: 'item', name: a[0], weight: +a[3] || 1 };
          e.functions = [{ function: 'set_count', count: mn === mx ? mn : { min: mn, max: mx } }]; return e;
        });
        if (!entries.length) return showToast('Añade al menos un objeto.');
        const name = U.slug(el.querySelector('#lN').value), bp = U.ensurePack('bp'), path = 'loot_tables/' + name + '.json';
        U.getFile(path, bp.folder).node.content = U.J({ pools: [{ rolls: Math.max(1, +el.querySelector('#lR').value || 1), entries }] }); done(bp.folder.name + '/' + path);
      };
    });
  }

  const ic = UI_ICONS;
  TOOLBOX_TOOLS.push(
    { id: 'versions', name: 'Versiones y APIs', desc: 'Versiones actuales de Bedrock y de @minecraft/server / server-ui.', icon: ic.manifest, onOpen: openVersions },
    { id: 'packicon', name: 'Icono de pack', desc: 'Crea pack_icon.png cuadrado desde cualquier imagen.', icon: ic.imgjson, onOpen: openIcon },
    { id: 'recipe', name: 'Recetas', desc: 'Genera recetas shaped / shapeless en el BP.', icon: ic.snippet, onOpen: openRecipe },
    { id: 'loot', name: 'Loot tables', desc: 'Genera tablas de botín con cantidades y pesos.', icon: ic.models, onOpen: openLoot }
  );
})();

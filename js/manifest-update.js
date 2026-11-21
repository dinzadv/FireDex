/* Manifest page — "Update existing addon": bumps script-API dependencies / min_engine_version of manifests
   inside a project stored in this browser (IndexedDB devstudio_db) or downloads the updated manifest.json. */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var V = window.FD_VERSIONS || { server: '2.11.0', serverUi: '2.3.0', minEngine: [1, 21, 50], game: '' };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var T = function (s) { return window.FD_I18N ? FD_I18N.t(s) : s; };
  var found = [], proj = null;

  function db() {
    return new Promise(function (res, rej) { var r = indexedDB.open('devstudio_db', 1); r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; });
  }
  function all(store) { return db().then(function (d) { return new Promise(function (res, rej) { var q = d.transaction(store, 'readonly').objectStore(store).getAll(); q.onsuccess = function () { res(q.result || []); }; q.onerror = function () { rej(q.error); }; }); }); }
  function get(store, id) { return db().then(function (d) { return new Promise(function (res, rej) { var q = d.transaction(store, 'readonly').objectStore(store).get(id); q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); }; }); }); }
  function put(store, v) { return db().then(function (d) { return new Promise(function (res, rej) { var tx = d.transaction(store, 'readwrite'); tx.objectStore(store).put(v); tx.oncomplete = res; tx.onerror = function () { rej(tx.error); }; }); }); }
  function parse(t) { try { return JSON.parse(t); } catch (e) { try { return JSON.parse(t.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/,(\s*[}\]])/g, '$1')); } catch (e2) { return null; } } }
  function walk(n, path, out) { (n.children || []).forEach(function (c) { var p = path ? path + '/' + c.name : c.name; if (c.type === 'folder') walk(c, p, out); else if (c.name === 'manifest.json') out.push({ node: c, path: p }); }); return out; }
  var cmp = function (a, b) { var x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (var i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); } return 0; };
  var major = function (v) { return parseInt(String(v).split('.')[0], 10); };

  function mount() {
    var host = $('#upd'); if (!host) return;
    host.innerHTML = '<h2 class="px" style="font-size:30px;margin:0 0 6px">Update an existing addon</h2>' +
      '<p style="opacity:.75;font-size:14px;margin:0 0 12px">When Minecraft or the Script API gets a new version, update your manifests in one click: choose an addon from this browser (or download the new manifest.json).</p>' +
      '<div class="px-card"><div id="uv" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">' +
      '<label>@minecraft/server <input id="u1" value="' + V.server + '" style="width:110px"></label>' +
      '<label>@minecraft/server-ui <input id="u2" value="' + V.serverUi + '" style="width:110px"></label>' +
      '<label>min_engine_version <input id="u3" value="' + V.minEngine.join('.') + '" style="width:110px"></label>' +
      '<button class="px-btn" id="uchk">Check latest versions</button></div><div id="umsg" style="font-size:13px;opacity:.8;margin-top:8px"></div></div>' +
      '<div class="px-card"><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><select id="up" style="min-width:220px"></select><button class="px-btn" id="uscan">Find manifests</button></div><div id="ulist" style="margin-top:12px"></div></div>';
    $('#uchk').onclick = check; $('#uscan').onclick = scan;
    all('projects_index').then(function (l) {
      var sel = $('#up'); l = l.filter(function (p) { return p && p.id; }).sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
      sel.innerHTML = l.length ? l.map(function (p) { return '<option value="' + esc(p.id) + '">' + esc(p.name || p.id) + '</option>'; }).join('') : '<option value="">' + T('No projects in this browser yet') + '</option>';
    }).catch(function () { $('#up').innerHTML = '<option value="">' + T('Could not read your projects') + '</option>'; });
  }

  function check() {
    var msg = $('#umsg'); msg.textContent = T('Checking npm…');
    function latest(pkg) { return fetch('https://registry.npmjs.org/' + pkg.replace('/', '%2f') + '/latest').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { return j.version; }); }
    Promise.all([latest('@minecraft/server'), latest('@minecraft/server-ui')]).then(function (v) {
      var stable = function (x) { return x && x.indexOf('-') < 0; };
      if (stable(v[0])) $('#u1').value = v[0]; if (stable(v[1])) $('#u2').value = v[1];
      msg.textContent = T('Latest published: @minecraft/server {0} · @minecraft/server-ui {1}').replace('{0}', v[0]).replace('{1}', v[1]);
    }).catch(function () { msg.textContent = T('Could not reach npm; using the versions bundled with FireDex (you can type another version).'); });
  }

  function scan() {
    var id = $('#up').value, box = $('#ulist'); if (!id) return;
    get('projects_data', id).then(function (p) {
      proj = p; found = p && p.root ? walk(p.root, '', []) : [];
      if (!found.length) { box.innerHTML = '<p>' + T('No manifest.json found in this project.') + '</p>'; return; }
      box.innerHTML = found.map(function (f, i) {
        var j = parse(f.node.content || ''), deps = j && j.dependencies ? j.dependencies.filter(function (d) { return d.module_name; }).map(function (d) { return d.module_name + ' ' + d.version; }).join(', ') : '';
        var types = j && j.modules ? j.modules.map(function (m) { return m.type; }).join(', ') : '?';
        f.json = j;
        return '<label class="u-row" style="display:block;padding:8px 0;border-bottom:1px solid #fff2"><input type="checkbox" data-i="' + i + '" checked' + (j ? '' : ' disabled') + '> <b>' + esc(f.path) + '</b> <small>(' + esc(types) + ')</small><br><small style="opacity:.7">' + esc(j ? (deps || T('no script dependencies')) + ' · min_engine ' + (j.header && j.header.min_engine_version ? j.header.min_engine_version.join('.') : '—') : T('invalid JSON — skipped')) + '</small></label>';
      }).join('') +
        '<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:14px"><label><input type="checkbox" id="o1" checked> ' + T('Update script dependencies') + '</label><label><input type="checkbox" id="o2" checked> ' + T('Update min_engine_version') + '</label><label><input type="checkbox" id="o3"> ' + T('Bump pack version (patch)') + '</label></div>' +
        '<div id="uwarn" style="margin:8px 0;font-size:13px"></div><button class="px-btn green" id="uapply">Update in project</button> <button class="px-btn yellow" id="udl">Download updated</button>';
      $('#uapply').onclick = function () { run(true); }; $('#udl').onclick = function () { run(false); };
    });
  }

  function patch(j) {
    var notes = [], s = $('#u1').value.trim(), ui = $('#u2').value.trim(), me = $('#u3').value.trim().split('.').map(Number);
    var m = JSON.parse(JSON.stringify(j));
    if ($('#o1').checked && m.dependencies) m.dependencies.forEach(function (d) {
      var to = d.module_name === '@minecraft/server' ? s : d.module_name === '@minecraft/server-ui' ? ui : null;
      if (!to || !d.module_name) return;
      if (major(d.version) !== major(to)) notes.push(d.module_name + ' ' + d.version + ' → ' + to + ' (major change: review your code)');
      d.version = to;
    });
    if ($('#o2').checked && m.header && me.length === 3 && me.every(function (x) { return isFinite(x); })) m.header.min_engine_version = me;
    if ($('#o3').checked && m.header && m.header.version) { var v = m.header.version; if (Array.isArray(v)) v[2] = (v[2] || 0) + 1; }
    return { m: m, notes: notes };
  }

  function run(save) {
    var picks = Array.prototype.slice.call(document.querySelectorAll('[data-i]:checked')).map(function (c) { return found[+c.dataset.i]; });
    if (!picks.length) return;
    var warn = [], outs = picks.map(function (f) { var r = patch(f.json); warn = warn.concat(r.notes); return { f: f, text: JSON.stringify(r.m, null, 2) + '\n' }; });
    $('#uwarn').innerHTML = warn.map(function (w) { return '<div style="color:#ffd24a">⚠ ' + esc(w) + '</div>'; }).join('');
    if (save) {
      outs.forEach(function (o) { o.f.node.content = o.text; });
      put('projects_data', proj).then(function () { $('#uwarn').innerHTML += '<div style="color:#6f6">✔ ' + T('Updated {0} manifest(s) in "{1}".').replace('{0}', outs.length).replace('{1}', esc(proj.name || '')) + '</div>'; })
        .catch(function () { $('#uwarn').innerHTML += '<div style="color:#f77">' + T('Could not save the project.') + '</div>'; });
    } else outs.forEach(function (o, i) {
      setTimeout(function () { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([o.text], { type: 'application/json' })); a.download = outs.length > 1 ? o.f.path.replace(/\//g, '_') : 'manifest.json'; a.click(); }, i * 250);
    });
  }

  if (window.FD_I18N) FD_I18N.add([
    ['Update an existing addon', 'Actualizar un addon existente'],
    ['Check latest versions', 'Buscar últimas versiones'], ['Find manifests', 'Buscar manifests'],
    ['Update in project', 'Actualizar en el proyecto'], ['Download updated', 'Descargar actualizado'],
    ['No projects in this browser yet', 'Aún no hay proyectos en este navegador'], ['Could not read your projects', 'No se pudieron leer tus proyectos'],
    ['Checking npm…', 'Consultando npm…'], ['Latest published: @minecraft/server {0} · @minecraft/server-ui {1}', 'Última publicada: @minecraft/server {0} · @minecraft/server-ui {1}'],
    ['Could not reach npm; using the versions bundled with FireDex (you can type another version).', 'No se pudo consultar npm; se usan las versiones incluidas en FireDex (puedes escribir otra).'],
    ['No manifest.json found in this project.', 'No se encontró ningún manifest.json en este proyecto.'], ['no script dependencies', 'sin dependencias de scripts'], ['invalid JSON — skipped', 'JSON no válido — omitido'],
    ['Update script dependencies', 'Actualizar dependencias de scripts'], ['Update min_engine_version', 'Actualizar min_engine_version'], ['Bump pack version (patch)', 'Subir versión del pack (parche)'],
    ['Updated {0} manifest(s) in "{1}".', 'Se actualizaron {0} manifest(s) en "{1}".'], ['Could not save the project.', 'No se pudo guardar el proyecto.']
  ]);
  document.addEventListener('DOMContentLoaded', mount); if (document.readyState !== 'loading') mount();
})();

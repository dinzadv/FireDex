/* FireDex i18n — idioma por defecto: inglés (en). Alternativo: español (es).
   Diccionarios: /js/i18n/<nombre>.json  =  [["English text","Texto en español"], ...]
   · Elementos sin hijos-elemento: coincidencia por textContent normalizado (espacios colapsados).
   · Elementos con solo hijos "inline" (b, code, a, span…): coincidencia por innerHTML normalizado.
   · Nodos de texto sueltos, option, placeholder / title / aria-label / alt también se traducen.
   · Plantillas con {0} {1}…:  ["Created {0} files","Se crearon {0} archivos"]
   · alert / confirm / prompt nativos se traducen con la misma tabla.
   · Desde JS: FD_I18N.t("English text")  y  FD_I18N.add([[en,es],…])
   · Contenido del usuario: añade data-i18n-skip a su contenedor (o usa SKIP_SEL). */
(function () {
  'use strict';
  var KEY = 'fd_lang', FILES = ['common', 'home', 'guide', 'commands', 'manifest', 'legal', 'editor', 'model', 'tools'];
  var lang = 'en'; try { var s = localStorage.getItem(KEY); if (s === 'es' || s === 'en') lang = s; } catch (e) { }
  var hide = document.createElement('style'); hide.id = 'fd-i18n-hide'; hide.textContent = 'body{visibility:hidden}';
  document.head.appendChild(hide);
  var failsafe = setTimeout(reveal, 2500);
  function reveal() { var h = document.getElementById('fd-i18n-hide'); if (h) h.remove(); clearTimeout(failsafe); }

  var norm = function (s) { return String(s).replace(/\s+/g, ' ').trim(); };
  var maps = { en: new Map(), es: new Map() }, pats = { en: [], es: [] }, ready = false, nativeDlg = {};
  function reEsc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function mkPattern(from, to) {
    return { re: new RegExp('^' + reEsc(norm(from)).replace(/\\\{(\d+)\\\}/g, '([\\s\\S]+?)') + '$'), to: to };
  }
  function add(list) {
    (list || []).forEach(function (p) {
      var en = p && p[0], es = p && p[1]; if (en == null || es == null) return;
      if (/\{\d+\}/.test(en)) { pats.es.push(mkPattern(en, es)); pats.en.push(mkPattern(es, en)); pats.en.push(mkPattern(en, en)); pats.es.push(mkPattern(es, es)); }
      else {
        var ke = norm(en), ks = norm(es);
        maps.es.set(ke, es); maps.en.set(ks, en);
        if (!maps.en.has(ke)) maps.en.set(ke, en);
        if (!maps.es.has(ks)) maps.es.set(ks, es);
      }
    });
    if (ready) apply(document.body);
  }
  function lookup(str) {
    var k = norm(str); if (!k) return null;
    var m = maps[lang].get(k); if (m != null) return m;
    var ps = pats[lang];
    for (var i = 0; i < ps.length; i++) {
      var r = ps[i].re.exec(k);
      if (r) return ps[i].to.replace(/\{(\d+)\}/g, function (_, n) { var v = r[+n + 1]; return v == null ? '' : (lookup(v) != null ? lookup(v) : v); });
    }
    return null;
  }
  function t(str) { var r = lookup(str); return r == null ? str : r; }

  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, PRE: 1, CANVAS: 1, svg: 1, NOSCRIPT: 1, CODE: 0 };
  /* contenido del usuario / código: nunca se traduce */
  var SKIP_SEL = '[data-i18n-skip],#editorEl,#projectNameEl,#titleEl,#treeEl .ed-name,#tabsEl .ed-tab-name,.code,.fd-user';
  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  var INLINE = { A: 1, B: 1, STRONG: 1, I: 1, EM: 1, CODE: 1, SPAN: 1, SMALL: 1, BR: 1, KBD: 1, U: 1, MARK: 1, SUB: 1, SUP: 1, S: 1, WBR: 1 };
  function onlyInline(el) { for (var c = el.firstElementChild; c; c = c.nextElementSibling) { if (!INLINE[c.tagName] || !onlyInline(c)) return false; } return true; }
  var lead = function (s) { return /^\s*/.exec(s)[0]; }, trail = function (s) { return /\s*$/.exec(s)[0]; };

  /* Recorre el DOM; con collect (array) solo registra las cadenas candidatas sin modificar nada */
  function tr(el, collect) {
    if (el.nodeType !== 1 || SKIP_TAG[el.tagName] || (el.matches && el.matches(SKIP_SEL)) || (el.closest && el.closest(SKIP_SEL))) return;
    var i, v, r;
    for (i = 0; i < ATTRS.length; i++) {
      v = el.getAttribute(ATTRS[i]);
      if (v && /\S/.test(v)) { if (collect) collect.push(v); else { r = lookup(v); if (r != null && r !== v) el.setAttribute(ATTRS[i], r); } }
    }
    if (el.tagName === 'INPUT' && /^(button|submit)$/.test(el.type) && el.value) { if (collect) collect.push(el.value); else { r = lookup(el.value); if (r != null) el.value = r; } }
    if (el.tagName === 'OPTION') { v = el.textContent; if (collect) { if (/\S/.test(v)) collect.push(v); } else { r = lookup(v); if (r != null && r !== v) el.textContent = r; } return; }
    if (!el.firstChild) return;
    if (!el.firstElementChild) {                                   // hoja: solo texto
      v = el.textContent; if (!/\S/.test(v)) return;
      if (collect) collect.push(v); else { r = lookup(v); if (r != null && norm(r) !== norm(v)) el.textContent = lead(v) + r + trail(v); }
      return;
    }
    if (onlyInline(el)) {                                          // párrafo con marcas inline: innerHTML completo
      v = el.innerHTML; r = collect ? null : lookup(v);
      if (collect) { collect.push(v); }
      else if (r != null) { if (norm(r) !== norm(v)) el.innerHTML = lead(v) + r + trail(v); return; }
      if (collect) return;
    }
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) {
        v = n.nodeValue; if (!/\S/.test(v)) continue;
        if (collect) collect.push(v); else { r = lookup(v); if (r != null && norm(r) !== norm(v)) n.nodeValue = lead(v) + r + trail(v); }
      } else if (n.nodeType === 1) tr(n, collect);
    }
  }
  function apply(root) {
    if (!root || !ready) return;
    try {
      if (root.nodeType === 3) { var p = root.parentNode; if (p && p.nodeType === 1 && !SKIP_TAG[p.tagName] && !(p.closest && p.closest(SKIP_SEL))) { var r = lookup(root.nodeValue); if (r != null && norm(r) !== norm(root.nodeValue)) root.nodeValue = lead(root.nodeValue) + r + trail(root.nodeValue); } }
      else tr(root);
    } catch (e) { if (window.console) console.warn('[i18n]', e); }
  }
  function applyTitle() {
    var m = /^(.*?)(\s*·\s*FireDex)?$/.exec(document.title), r = lookup(m[1]);
    if (r != null && r !== m[1]) document.title = r + (m[2] || '');
  }
  /* Lista de cadenas candidatas del DOM actual (para el rastreador de cobertura) */
  function units(root) { var out = []; tr(root || document.body, out); return out; }

  var pending = new Set(), sched = false;
  function flush() {
    sched = false; var recs = mo.takeRecords(); queue(recs);
    mo.disconnect();
    pending.forEach(function (n) { if (n && document.contains(n)) apply(n); });
    pending.clear(); mo.observe(document.body, MOPT);
  }
  var MOPT = { childList: true, subtree: true, characterData: true };
  function queue(muts) {
    muts.forEach(function (m) {
      if (m.type === 'childList') m.addedNodes.forEach(function (n) { pending.add(n.nodeType === 3 ? n : n); });
      else if (m.type === 'characterData') pending.add(m.target);
    });
  }
  var mo = new MutationObserver(function (muts) { queue(muts); if (!sched && pending.size) { sched = true; requestAnimationFrame(flush); } });

  function setLang(l) {
    if (l !== 'en' && l !== 'es') return;
    lang = l; try { localStorage.setItem(KEY, l); } catch (e) { }
    document.documentElement.lang = l;
    mo.disconnect(); apply(document.body); applyTitle(); mo.observe(document.body, MOPT); paintBtn();
    document.dispatchEvent(new CustomEvent('fd-lang', { detail: l }));
  }
  function paintBtn() {
    document.querySelectorAll('.fd-lang').forEach(function (b) {
      b.textContent = lang === 'en' ? 'ES' : 'EN'; b.title = lang === 'en' ? 'Cambiar a español' : 'Switch to English';
      b.setAttribute('aria-label', b.title); b.setAttribute('data-i18n-skip', '');
    });
  }
  function mountBtn() {
    if (document.querySelector('.fd-lang')) return;
    var b = document.createElement('button'); b.className = 'fd-lang'; b.type = 'button';
    b.onclick = function () { setLang(lang === 'en' ? 'es' : 'en'); };
    var host = document.querySelector('.px-top .px-wrap') || document.querySelector('header.top') || null;
    if (host) { b.className += ' in'; host.appendChild(b); } else document.body.appendChild(b);
    var st = document.createElement('style');
    st.textContent = '.fd-lang{font:800 12px/1 inherit;font-family:inherit;letter-spacing:.04em;color:#e7e8f2;background:#23243a;border:1.5px solid #3a3c5a;border-radius:9px;padding:8px 10px;cursor:pointer;z-index:2147482000}.fd-lang:hover{border-color:#8577f8}.fd-lang.in{margin-left:10px;flex:none}body>.fd-lang{position:fixed;right:12px;top:12px}';
    document.head.appendChild(st); paintBtn();
  }
  /* alert / confirm / prompt nativos */
  ['alert', 'confirm', 'prompt'].forEach(function (n) {
    var o = window[n]; if (!o) return; nativeDlg[n] = o;
    window[n] = function (msg, d) { return o.call(window, ready ? t(String(msg)) : msg, d); };
  });

  function boot() {
    document.documentElement.lang = lang;
    Promise.all(FILES.map(function (f) { return fetch('/js/i18n/' + f + '.json', { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }); }))
      .then(function (all) {
        all.forEach(function (l) { if (Array.isArray(l)) add(l); });
        ready = true; mountBtn(); apply(document.body); applyTitle();
        mo.observe(document.body, MOPT);
        reveal();
      });
  }
  window.FD_I18N = { add: add, t: t, set: setLang, get: function () { return lang; }, units: units, lookup: lookup };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

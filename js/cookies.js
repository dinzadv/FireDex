/* FireDex · aviso informativo de cookies / almacenamiento local y controles de datos */
(function () {
  'use strict';
  var KEY = 'fd_cookie_notice';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* nada */ } }
  var css = '#fdck{position:fixed;left:16px;bottom:16px;z-index:2147483000;max-width:440px;background:#14151c;color:#e7e8f2;border:2px solid #2c2e40;border-radius:14px;box-shadow:0 14px 40px #000a;padding:14px 16px;display:flex;gap:12px;font:600 14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '#fdck img{width:40px;height:40px;flex:none;image-rendering:auto;margin-top:2px}#fdck b{display:block;font-size:15px;margin-bottom:2px}#fdck p{margin:0 0 10px;color:#b9bbd0;font-weight:600}' +
    '#fdck .r{display:flex;gap:8px;flex-wrap:wrap}#fdck button,#fdck a{font:inherit;font-weight:800;border-radius:9px;padding:8px 14px;cursor:pointer;text-decoration:none;border:2px solid #3a3c52;background:#212230;color:#e7e8f2}' +
    '#fdck button.ok{background:#8577f8;border-color:#8577f8;color:#fff}#fdck button:hover,#fdck a:hover{filter:brightness(1.15)}' +
    '@media(max-width:620px){#fdck{left:10px;right:10px;bottom:10px;max-width:none}body.px-page #fdck{bottom:96px}}';
  function show() {
    if (document.getElementById('fdck')) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var d = document.createElement('div'); d.id = 'fdck'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Aviso de cookies');
    d.innerHTML = '<img src="/img/cookie.png" alt=""><div><b>Cookies y almacenamiento local</b><p>FireDex no usa cookies de publicidad ni de seguimiento. Solo guarda tus proyectos y ajustes en este navegador para que el editor funcione.</p><div class="r"><button class="ok" type="button">Entendido</button><a href="/cookies/">Más información</a></div></div>';
    d.querySelector('.ok').onclick = function () { set('1'); d.remove(); };
    document.body.appendChild(d);
  }
  function wipe() {
    if (!confirm('Se borrarán TODOS tus proyectos, ajustes y borradores de FireDex en este navegador. No se puede deshacer.\n\n¿Continuar?')) return;
    try { Object.keys(localStorage).forEach(function (k) { if (/^(devstudio_|comdex_|fd_)/.test(k)) localStorage.removeItem(k); }); } catch (e) { /* nada */ }
    var done = function () { alert('Datos borrados.'); location.reload(); };
    try { var r = indexedDB.deleteDatabase('devstudio_db'); r.onsuccess = r.onerror = r.onblocked = done; } catch (e) { done(); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-fd-cookie]'); if (!b) return;
    if (b.dataset.fdCookie === 'show') { try { localStorage.removeItem(KEY); } catch (x) { /* nada */ } show(); }
    else if (b.dataset.fdCookie === 'wipe') wipe();
  });
  function init() { if (!get() && !/^\/cookies\/?$/.test(location.pathname)) show(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

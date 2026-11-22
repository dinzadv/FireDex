(function () {
  var shown = false;
  function ignore(t) { return /pixelarticons|fonts\.(googleapis|gstatic)|jsdelivr|api\.github|githubusercontent|registry\.npmjs/.test(t || ''); }
  function show(msg) {
    if (shown || !document.body) return;
    shown = true;
    var d = document.createElement('div');
    d.setAttribute('style', 'position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483647;background:#2a1216;color:#ffd6dc;border:2px solid #ff4b6e;border-radius:10px;padding:12px 14px;font:13px/1.45 system-ui,sans-serif;max-height:40vh;overflow:auto');
    d.innerHTML = '<b style="display:block;margin-bottom:4px">FireDex no pudo cargar algo</b><div id="fdDiagMsg" style="font-family:ui-monospace,monospace;white-space:pre-wrap;word-break:break-word"></div><div style="margin-top:8px;display:flex;gap:8px"><button id="fdDiagReload" style="padding:6px 12px">Recargar</button><button id="fdDiagX" style="padding:6px 12px">Cerrar</button></div>';
    document.body.appendChild(d);
    d.querySelector('#fdDiagMsg').textContent = msg;
    d.querySelector('#fdDiagReload').onclick = function () { location.reload(); };
    d.querySelector('#fdDiagX').onclick = function () { d.remove(); };
  }
  window.addEventListener('error', function (e) {
    var t = e.target;
    if (t && t !== window && (t.src || t.href)) { var u = t.src || t.href; if (!ignore(u)) show('No se pudo cargar: ' + u + '\nRevisa que el sitio esté publicado en la raíz del dominio y que el archivo exista.'); return; }
    var m = e.message || ''; if (!m || /ResizeObserver/.test(m)) return;
    show(m + (e.filename ? '\n' + e.filename + ':' + e.lineno : ''));
  }, true);
  window.addEventListener('unhandledrejection', function (e) {
    var r = e.reason, m = r && (r.stack || r.message) || String(r);
    if (ignore(m)) return;
    show('Error: ' + m);
  });
})();

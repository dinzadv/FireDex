/* FireDex · Modelador — menú principal y arranque */
(function() {
  "use strict";
  const FD = window.FD;
  if (!FD) return;
  const { $ } = FD;
  const act = (n) => () => FD.act[n] && FD.act[n]();
  function items() {
    const sa = FD.S.standalone;
    return [
      { label: "Nuevo modelo desde plantilla…", icon: "cubeplus", fn: act("newFromTemplate") },
      { label: "Abrir otro modelo del proyecto…", icon: "folder", fn: act("openModel"), disabled: !FD.S.project },
      { label: "Importar archivos (png, json, zip, mcpack)…", icon: "upload", fn: act("importAny") },
      { label: "Exportar geometría (.geo.json)", icon: "download", fn: act("exportGeo") },
      { label: "Exportar paquete .mcpack", icon: "zip", fn: act("exportMcpack") },
      { sep: true },
      { label: "Nueva textura…", icon: "image", fn: act("newTexture") },
      { label: "Importar textura(s)…", icon: "upload", fn: act("importTexture") },
      { label: "Guardar textura en el proyecto", icon: "save", fn: act("saveTexture") },
      { label: "Descargar textura PNG", icon: "download", fn: act("downloadTexture") },
      { label: "Ajustar tamaño de textura al modelo", icon: "expand", fn: act("matchSizes") },
      { label: "Rellenar textura con colores de cubos", icon: "palette", fn: () => FD.paintBaseColors && FD.paintBaseColors() },
      { sep: true },
      { label: "Convertir a formato 1.12", icon: "wrench", fn: act("toNewFormat") },
      { label: "Calcular límites visibles", icon: "ruler", fn: act("autoBounds") },
      { label: "Crear carpetas del addon", icon: "folderplus", fn: act("ensureLayout"), disabled: !FD.S.project },
      { label: "Entidad y exportación…", icon: "plug", fn: () => FD.openIntegration && FD.openIntegration() },
      { label: "Revisar errores", icon: "shield", fn: () => FD.check && FD.check.toggle() },
      { sep: true },
      { label: "Atajos de teclado", icon: "help", fn: () => FD.openShortcuts(), key: "?" },
      { label: sa ? "Volver al inicio" : "Volver al proyecto", icon: "back", fn: () => { location.href = $("#backBtn").href; } }
    ];
  }
  const btn = $("#menuBtn");
  if (btn) btn.onclick = (e) => {
    e.stopPropagation();
    const r = btn.getBoundingClientRect();
    FD.ctxMenu(r.right - 280, r.bottom + 6, items());
  };
  window.addEventListener("load", () => {
    FD.init().catch((e) => {
      console.error(e);
      FD.toast("Error al iniciar el modelador: " + e.message, 8000, "bad");
    });
  });
})();

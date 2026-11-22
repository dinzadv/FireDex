import React, { memo, useEffect, useMemo, useState } from "react";
import { loadScripts } from "../loadScript.js";
const uuid = () => crypto.randomUUID();
function build(o) {
  const bp = o.type === "bp", v = o.engine.split(".").map(Number);
  const m = {
    format_version: 2,
    header: { name: o.name, description: o.desc, uuid: uuid(), version: [1, 0, 0], min_engine_version: v.length === 3 ? v : [1, 21, 50] },
    modules: [{ type: bp ? "data" : "resources", uuid: uuid(), version: [1, 0, 0] }]
  };
  if (bp && o.script) {
    m.modules.push({ type: "script", language: "javascript", uuid: uuid(), entry: "scripts/main.js", version: [1, 0, 0] });
    m.dependencies = [{ module_name: "@minecraft/server", version: o.server }];
    if (o.ui) m.dependencies.push({ module_name: "@minecraft/server-ui", version: o.ui });
  }
  return JSON.stringify(m, null, 2);
}
const Updater = memo(function Updater2() {
  useEffect(() => {
    loadScripts(["/js/versions.js", "/js/manifest-update.js"]);
  }, []);
  return <section id="upd" style={{ marginTop: 34 }} />;
});
export function Manifest() {
  const [f, setF] = useState({ name: "Mi Addon", desc: "Creado con FireDex", engine: "1.21.50", type: "bp", script: true, server: "2.11.0", ui: "" });
  const [out, setOut] = useState("");
  const [copied, setCopied] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const gen = () => setOut(build(f));
  useEffect(() => {
    gen();
  }, []);
  const fname = (f.type === "bp" ? "behavior_pack" : "resource_pack") + "/manifest.json";
  const copy = () => navigator.clipboard.writeText(out).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  });
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([out], { type: "application/json" }));
    a.download = "manifest.json";
    a.click();
  };
  return <>
      <p className="px-crumbs"><a href="/">Inicio</a> › Manifest</p>
      <h1 className="px" style={{ fontSize: 44, margin: 0 }}>Generador de manifest</h1>
      <div className="px-card">
        <input value={f.name} onChange={set("name")} placeholder="Nombre" />
        <input value={f.desc} onChange={set("desc")} placeholder="Descripción" />
        <input value={f.engine} onChange={set("engine")} placeholder="min_engine_version (ej. 1.21.50)" />
        <select value={f.type} onChange={set("type")}><option value="bp">Behavior pack (data)</option><option value="rp">Resource pack (resources)</option></select>
        <label><input type="checkbox" checked={f.script} onChange={set("script")} /> Incluir módulo de scripts (solo Behavior pack)</label>
        <select value={f.server} onChange={set("server")}><option>2.11.0</option><option>2.0.0</option><option>1.18.0</option></select>{" "}
        <select value={f.ui} onChange={set("ui")}><option value="">Sin server-ui</option><option value="2.3.0">+ @minecraft/server-ui 2.3.0</option></select>
        <button className="px-btn green" onClick={gen}>Generar</button>
      </div>
      <p style={{ opacity: 0.7, fontSize: 13 }}>Referencia (nov-2026): Bedrock estable 26.63 · @minecraft/server 2.11.0 · @minecraft/server-ui 2.3.0 (requiere server 2.x). <code>min_engine_version</code> con numeración 26.x no está verificado; 1.21.50 funciona en clientes nuevos.</p>
      <div className="px-card">
        <h3>{fname}</h3>
        <code className="cmd" style={{ maxHeight: 420 }}>{out}</code>
        <button className="px-btn" onClick={copy}>{copied ? "\xA1Copiado!" : "Copiar"}</button>{" "}
        <button className="px-btn yellow" onClick={download}>Descargar</button>
      </div>
      <Updater />
    </>;
}

import React, { memo, useEffect } from "react";
import { Px } from "../components/Px.jsx";
import { loadScripts } from "../loadScript.js";
const Hosted = memo(function Hosted2() {
  useEffect(() => {
    loadScripts(["/js/vendor/jszip.min.js", "/js/main.js"]);
  }, []);
  return <section className="hm-sec" id="crear">
      <div className="hm-head"><h2>Tus proyectos</h2><span id="projectsCount" /></div>
      <div id="projectsArea" />
    </section>;
});
const TOOLS = [
  ["cube", "Modelador 3D", "Crea modelos y animaciones Bedrock sin necesidad de un addon.", null, "newModelCard"],
  ["commands", "Comandos", "M\xE1s de 30 comandos con sintaxis, ejemplo y bot\xF3n de copiar.", "/commands/"],
  ["manifest", "Manifest", "Genera manifest.json con UUID v\xE1lidos para BP y RP.", "/manifest/"],
  ["guide", "Gu\xEDa", "Estructura de carpetas y buenas pr\xE1cticas de un addon.", "/guide/"],
  ["info", "Gu\xEDa r\xE1pida", "Primeros pasos para trabajar con tus addons.", null, "guideCard"]
];
export function Home() {
  return <>
      <section className="hm-hero">
        <img className="hm-logo" src="/img/icon.png" alt="" />
        <h1>Crea addons, modelos y animaciones de <span>Minecraft Bedrock</span></h1>
        <p>Editor de código con ayuda de la API de Minecraft, modelador 3D con animaciones, comandos y generador de manifest. Todo en tu navegador.</p>
        <div className="hm-cta">
          <button className="px-btn green" id="createBtn">+ Crear proyecto</button>
          <button className="px-btn ghost" id="uploadCard">Subir addon</button>
          <button className="px-btn" id="newModelBtn">Nuevo modelo 3D</button>
        </div>
        <div className="hm-formats"><b>.mcaddon</b><b>.mcpack</b><b>.zip</b><b>JS</b><b>TS</b><b>JSON</b></div>
      </section>
      <Hosted />
      <section className="hm-sec">
        <div className="hm-head"><h2>Herramientas</h2></div>
        <div className="hm-tools">
          {TOOLS.map(([ico, t, d, href, id]) => {
    const body = <><span className="hm-ico"><Px name={ico} size={30} /></span><div><h3>{t}</h3><p>{d}</p></div></>;
    return href ? <a key={t} className="hm-tool" href={href}>{body}</a> : <button key={t} className="hm-tool" id={id} onClick={id === "newModelCard" ? () => document.getElementById("newModelBtn").click() : void 0}>{body}</button>;
  })}
          <a className="hm-tool" href="/edit/#toolbox"><span className="hm-ico"><Px name="film" size={30} /></span><div><h3>Animator</h3><p>Reproduce imágenes, GIF y sprite sheets como animación a pantalla completa.</p></div></a>
        </div>
        <button className="hm-version" id="versionCard">Versión y formatos compatibles ›</button>
        <div className="hm-legal">
          <b>Información legal</b>
          <nav><a href="/terms/">Términos y condiciones</a><a href="/privacy/">Privacidad</a><a href="/cookies/">Cookies</a><a href="/legal/">Aviso legal</a></nav>
          <small>Contacto: <a href="mailto:mcforgemx@gmail.com">mcforgemx@gmail.com</a></small>
        </div>
      </section>
      <input type="file" id="addonInput" accept=".mcaddon,.mcpack,.zip" style={{ display: "none" }} />
      <input type="file" id="coverInput" accept="image/*" style={{ display: "none" }} />
    </>;
}

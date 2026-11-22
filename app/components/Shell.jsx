import React, { useState } from "react";
import { Px } from "./Px.jsx";
import { Particles } from "./Particles.jsx";
import { CookieBanner } from "./CookieBanner.jsx";
import { SettingsModal } from "./SettingsModal.jsx";
const NAV = [["/", "Inicio", "home"], ["/commands/", "Comandos", "commands"], null, ["/manifest/", "Manifest", "manifest"], ["/guide/", "Gu\xEDa", "guide"]];
const LEGAL = { name: "FireDex", email: "mcforgemx@gmail.com" };
export function Shell({ path, children }) {
  const [settings, setSettings] = useState(false);
  return <>
      <Particles />
      <header className="px-top">
        <div className="px-wrap">
          <a href="/"><img src="/img/logo.png" alt="FireDex" /></a>
          <b className="px" style={{ fontSize: 26 }}>FireDex</b>
          <span className="sp" />
          <a className="px-btn sm" href="/commands/">Comandos</a>
          <a className="px-btn sm green" href="/guide/">Guía</a>
          <button className="px-ib" onClick={() => setSettings(true)} title="Ajustes" aria-label="Ajustes"><Px name="settings" size={24} /></button>
        </div>
      </header>
      <main className="px-wrap">{children}</main>
      <footer className="px-foot">
        <div className="px-wrap">
          <div className="px-foot-in">
            <span>© {(/* @__PURE__ */ new Date()).getFullYear()} {LEGAL.name} · Herramienta independiente, no afiliada a Mojang ni a Microsoft.</span>
            <nav><a href="/terms/">Términos</a><a href="/privacy/">Privacidad</a><a href="/cookies/">Cookies</a><a href="/legal/">Aviso legal</a></nav>
          </div>
        </div>
      </footer>
      <nav className="px-nav">
        {NAV.map((n, i) => n ? <a key={i} href={n[0]} className={n[0] === path ? "on" : ""}><Px name={n[2]} size={28} />{n[1]}</a> : <a key={i} className="plus" href="/#crear" title="Crear proyecto">+</a>)}
      </nav>
      {settings && <SettingsModal onClose={() => setSettings(false)} />}
      <CookieBanner />
    </>;
}
export const CONTACT = LEGAL;

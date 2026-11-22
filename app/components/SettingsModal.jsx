import React, { useEffect, useState } from "react";
import { Px } from "./Px.jsx";
import { lang, setLang } from "../i18n.js";
import { wipe } from "./CookieBanner.jsx";
export function SettingsModal({ onClose }) {
  const [cur, setCur] = useState(lang());
  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const pick = (l) => {
    setLang(l);
    setCur(l);
  };
  return <div className="st-back" onMouseDown={(e) => {
    if (e.target === e.currentTarget) onClose();
  }}>
      <div className="st-modal" role="dialog" aria-label="Ajustes">
        <div className="st-head"><Px name="settings" size={26} /><h3>Ajustes</h3><button className="st-x" onClick={onClose} aria-label="Cerrar"><Px name="close" size={18} /></button></div>
        <div className="st-row">
          <div><b>Idioma</b><small>Language</small></div>
          <div className="st-seg">
            <button className={cur === "en" ? "on" : ""} onClick={() => pick("en")}>English</button>
            <button className={cur === "es" ? "on" : ""} onClick={() => pick("es")}>Español</button>
          </div>
        </div>
        <div className="st-row">
          <div><b>Cookies y datos</b><small>Tus proyectos solo viven en este navegador.</small></div>
          <div className="st-seg"><button data-fd-cookie="show" onClick={onClose}><Px name="cookie" size={16} /> Aviso</button><button className="danger" onClick={wipe}><Px name="trash" size={16} /> Borrar</button></div>
        </div>
        <div className="st-foot"><a href="/terms/">Términos</a><a href="/privacy/">Privacidad</a><a href="/cookies/">Cookies</a><a href="/legal/">Aviso legal</a></div>
        <div className="st-act"><button className="px-btn green sm" onClick={onClose}>Listo</button></div>
      </div>
    </div>;
}

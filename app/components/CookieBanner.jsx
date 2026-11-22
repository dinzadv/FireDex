import React, { useEffect, useState } from "react";
const browser = typeof window !== "undefined";
const KEY = "fd_cookie_notice";
const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch (e) {
    return null;
  }
};
export function CookieBanner() {
  const [open, setOpen] = useState(() => browser && !read() && !/^\/cookies\/?$/.test(location.pathname));
  useEffect(() => {
    const onClick = (e) => {
      const b = e.target.closest && e.target.closest("[data-fd-cookie]");
      if (!b) return;
      if (b.dataset.fdCookie === "show") {
        try {
          localStorage.removeItem(KEY);
        } catch (x) {
        }
        setOpen(true);
      } else if (b.dataset.fdCookie === "wipe") wipe();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  if (!open) return null;
  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch (e) {
    }
    setOpen(false);
  };
  return <div id="fdck" className="fdck" role="dialog" aria-label="Aviso de cookies">
      <img src="/img/cookie.png" alt="" />
      <div>
        <b>Cookies y almacenamiento local</b>
        <p>FireDex no usa cookies de publicidad ni de seguimiento. Solo guarda tus proyectos y ajustes en este navegador para que el editor funcione.</p>
        <div className="r">
          <button className="ok" type="button" onClick={accept}>Entendido</button>
          <a href="/cookies/">Más información</a>
        </div>
      </div>
    </div>;
}
export function wipe() {
  if (!window.confirm("Se borrar\xE1n TODOS tus proyectos, ajustes y borradores de FireDex en este navegador. No se puede deshacer.\n\n\xBFContinuar?")) return;
  try {
    Object.keys(localStorage).forEach((k) => {
      if (/^(devstudio_|comdex_|fd_)/.test(k)) localStorage.removeItem(k);
    });
  } catch (e) {
  }
  const done = () => {
    window.alert("Datos borrados.");
    location.reload();
  };
  try {
    const r = indexedDB.deleteDatabase("devstudio_db");
    r.onsuccess = r.onerror = r.onblocked = done;
  } catch (e) {
    done();
  }
}

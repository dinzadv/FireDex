import React from "react";
import { DOCS } from "../content/docs.js";
export function Doc({ id }) {
  return <div className="doc" dangerouslySetInnerHTML={{ __html: DOCS[id] }} />;
}
export function NotFound() {
  return <div className="px-card" style={{ textAlign: "center", marginTop: 30 }}>
      <img src="/img/icon.png" alt="" style={{ width: 110 }} />
      <h1 className="px" style={{ fontSize: 44, margin: "6px 0" }}>404</h1>
      <p>No encontramos esa página.</p>
      <p style={{ marginTop: 14 }}><a className="px-btn" href="/">Volver al inicio</a></p>
    </div>;
}

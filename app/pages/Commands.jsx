import React, { useMemo, useState } from "react";
import { COMMANDS, ITEMS, MOBS } from "../content/commands.js";
function CopyBtn({ text, label, cls }) {
  const [done, setDone] = useState(false);
  const go = () => {
    navigator.clipboard.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 1e3);
    });
  };
  return <button className={cls} onClick={go}>{done ? "\xA1Copiado!" : label}</button>;
}
export function Commands() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");
  const [type, setType] = useState("give");
  const [target, setTarget] = useState("@s");
  const [id, setId] = useState("diamond_sword");
  const [n, setN] = useState(1);
  const cats = useMemo(() => ["Todos", ...new Set(COMMANDS.map((c) => c.c))], []);
  const list = COMMANDS.filter((c) => (cat === "Todos" || c.c === cat) && (c.n + c.d + c.s).toLowerCase().includes(q.toLowerCase().trim()));
  const out = type === "give" ? `/give ${target} ${id} ${n}` : `/summon ${id} ~ ~ ~`;
  const changeType = (t) => {
    setType(t);
    setId(t === "give" ? "diamond_sword" : "zombie");
  };
  return <>
      <p className="px-crumbs"><a href="/">Inicio</a> › Comandos</p>
      <h1 className="px" style={{ fontSize: 44, margin: 0 }}>Comandos de Bedrock</h1>
      <input className="px-input" placeholder="Buscar: give, fill, execute…" value={q} onChange={(e) => setQ(e.target.value)} style={{ margin: "14px 4px", width: "calc(100% - 8px)" }} />
      <div className="chips">{cats.map((c) => <span key={c} className={"chip" + (c === cat ? " on" : "")} onClick={() => setCat(c)}>{c}</span>)}</div>
      <div className="px-card">
        <h3>Constructor rápido</h3>
        <select value={type} onChange={(e) => changeType(e.target.value)}><option>give</option><option>summon</option></select>
        <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Objetivo" />
        <input list="dl" value={id} onChange={(e) => setId(e.target.value)} placeholder="ID" />
        <input type="number" min="1" value={n} onChange={(e) => setN(e.target.value)} />
        <datalist id="dl">{(type === "give" ? ITEMS : MOBS).map((x) => <option key={x} value={x} />)}</datalist>
        <code className="cmd">{out}</code>
        <CopyBtn cls="px-btn green sm" label="Copiar" text={out} />
      </div>
      <div>
        {list.map((c) => <div className="px-card" key={c.n}>
            <span className="tag">{c.c}</span>
            <h3>/{c.n}</h3>
            <p>{c.d}</p>
            <code className="cmd">{c.s}</code>
            <code className="cmd">{c.e}</code>
            <CopyBtn cls="px-btn sm" label="Copiar ejemplo" text={c.e} />
          </div>)}
      </div>
      {!list.length && <p style={{ textAlign: "center" }}>Sin resultados.</p>}
    </>;
}

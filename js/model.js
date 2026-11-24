/* FireDex · Modelador 3D para Minecraft Bedrock
 * Núcleo: estado, geometría, historial, texturas, colores, render, selección y edición.
 * Módulos que lo extienden: model-proj.js (proyecto/importar/texturas), model-check.js (revisión),
 * model-anim.js (animación), model-int.js (addon), model-boot.js (arranque). */
(function() {
  "use strict";
  /* ───────── Iconos (trazo 24×24, estilo propio) ───────── */
  const IC = {
    back: '<path d="M15 5l-7 7 7 7"/>',
    cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
    cubeplus: '<path d="M12 3l7.5 4.2v8.1M12 21l-7.5-4.2V7.2L12 3"/><path d="M4.5 7.2L12 11.4l7.5-4.2M12 11.4V21"/><path d="M18 17v6M15 20h6" stroke-width="2"/>',
    brush: '<path d="M18.5 3.5l2 2-9.2 9.2-2.8-2.8 10-8.4z"/><path d="M8.5 12.2c-2.5-.3-4 1.3-4 3.3 0 1.6-.8 2.6-1.5 3.3 3.600.8 7.500-.2 7.800-3.400"/>',
    undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.500a5.500 5.500 0 010 11H11"/>',
    redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.500a5.500 5.500 0 000 11H13"/>',
    save: '<path d="M5 3h11l4 4v13a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M8 3v5h7V3M7 21v-7h10v7"/>',
    more: '<circle cx="12" cy="5" r="1.300"/><circle cx="12" cy="12" r="1.300"/><circle cx="12" cy="19" r="1.300"/>',
    cursor: '<path d="M5 3l13 7.500-5.500 1.700L9.800 18 5 3z"/>',
    move: '<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>',
    rotate: '<path d="M20 12a8 8 0 11-2.600-5.900"/><path d="M20 4v5h-5"/>',
    scale: '<path d="M4 20V14M4 20h6M4 20L20 4M20 4h-6M20 4v6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    bone: '<path d="M6.500 8.500a2.500 2.500 0 10-3-3 2.500 2.500 0 003 3zM20.500 18.500a2.500 2.500 0 10-3-3 2.500 2.500 0 003 3z"/><path d="M8 7l9 9"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>',
    paste: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 001 1h8a1 1 0 001-1l1-12M9 7V4h6v3"/>',
    pencil: '<path d="M4 20l1-4L16.500 4.500a1.500 1.500 0 012 0l1 1a1.500 1.500 0 010 2L8 19l-4 1z"/><path d="M14.500 6.500l3 3"/>',
    eraser: '<path d="M8.500 20H20M5.500 15.500l8.500-9a1.500 1.500 0 012 0l3.500 3.500a1.500 1.500 0 010 2L12.500 20H8l-2.500-2.500a1.500 1.500 0 010-2z"/><path d="M9 12.500l5 5"/>',
    bucket: '<path d="M4.500 12.500l7-7 7 7-6 6a1.500 1.500 0 01-2 0l-6-6z"/><path d="M11.500 5.500L8 2M19 15c1.200 1.600 1.800 2.700 1.800 3.500a1.800 1.800 0 01-3.600 0c0-.8.600-1.900 1.800-3.500z"/>',
    picker: '<path d="M14.500 5.500l4 4M16 4a2.100 2.100 0 013 3l-2 2-3-3 2-2zM13.500 8l-8 8-1 4 4-1 8-8"/>',
    faceFill: '<rect x="4" y="4" width="16" height="16" rx="1.500"/><path d="M4 12h16M12 4v16" opacity=".4"/><path d="M12 12V4h8v8z" fill="currentColor" stroke="none" opacity=".75"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5M3 17.500l9 5 9-5" opacity=".6"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    eye: '<path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.300 6.200A9.500 9.500 0 0112 6c6.400 0 10 6 10 6a17 17 0 01-3.200 3.800M6.600 7.600A16 16 0 002 12s3.600 7 10 7a9.600 9.600 0 004.300-1"/><path d="M9.900 9.900a3 3 0 004.200 4.200"/>',
    key: '<path d="M12 3.500l7 8.500-7 8.500L5 12l7-8.500z"/>',
    keyfill: '<path d="M12 3.500l7 8.500-7 8.500L5 12l7-8.500z" fill="currentColor"/>',
    play: '<path d="M7 4.500v15L19.500 12 7 4.500z" fill="currentColor"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="2.600"/>',
    stop: '<rect x="6.500" y="6.500" width="11" height="11" rx="1.500" fill="currentColor"/>',
    prevkey: '<path d="M7 5v14M19 5L10 12l9 7V5z" fill="currentColor"/>',
    nextkey: '<path d="M17 5v14M5 5l9 7-9 7V5z" fill="currentColor"/>',
    hist: '<path d="M3 12a9 9 0 109-9 9 9 0 00-6.400 2.700L3 8"/><path d="M3 3v5h5M12 7.500V12l3 2"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 01-12 0V8zM12 17v4"/>',
    uv: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z"/><path d="M9 9h6v6H9z" opacity=".5"/>',
    uvfaces: '<rect x="3.500" y="3.500" width="7" height="7" rx="1"/><rect x="13.500" y="3.500" width="7" height="7" rx="1"/><rect x="3.500" y="13.500" width="7" height="7" rx="1"/><rect x="13.500" y="13.500" width="7" height="7" rx="1"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="2.500"/><path d="M7.500 4v16M16.500 4v16M3 9h4.500M3 15h4.500M16.500 9H21M16.500 15H21"/>',
    wand: '<path d="M5 19L16.500 7.500M14.500 5.500l1-2.500 1 2.500 2.500 1-2.500 1-1 2.500-1-2.500-2.500-1 2.500-1zM6 8l.6-1.400L8 6l-1.400-.6L6 4l-.6 1.400L4 6l1.400.6L6 8z"/>',
    mirror: '<path d="M12 3v18" stroke-dasharray="2.500 2.500"/><path d="M9 7L3.500 12 9 17V7zM15 7l5.500 5L15 17V7z"/>',
    sym: '<path d="M12 3v18" stroke-dasharray="2.500 2.500"/><rect x="3.500" y="8" width="5.500" height="8" rx="1"/><rect x="15" y="8" width="5.500" height="8" rx="1"/>',
    group: '<rect x="3" y="3" width="18" height="18" rx="3" stroke-dasharray="3 3"/><rect x="8" y="8" width="8" height="8" rx="1.500"/>',
    target: '<circle cx="12" cy="12" r="7.500"/><circle cx="12" cy="12" r="1.800"/><path d="M12 2.500v4M12 17.500v4M2.500 12h4M17.500 12h4"/>',
    ground: '<path d="M12 3v11M8 10l4 4 4-4M4 20h16"/>',
    ruler: '<path d="M3 17L17 3l4 4L7 21l-4-4zM8 12l2 2M11 9l2 2M14 6l2 2"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.500 9.200a2.600 2.600 0 115.100.700c0 1.700-2.600 2.200-2.600 3.600M12 17v.01"/>',
    check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    chevd: '<path d="M6 9l6 6 6-6"/>',
    folder: '<path d="M3 7.500A2.500 2.500 0 015.500 5H9l2 2.500h7.500A2.500 2.500 0 0121 10v7.500a2.500 2.500 0 01-2.500 2.500h-13A2.500 2.500 0 013 17.500v-10z"/>',
    folderplus: '<path d="M3 7.500A2.500 2.500 0 015.500 5H9l2 2.500h7.500A2.500 2.500 0 0121 10v7.500a2.500 2.500 0 01-2.500 2.500h-13A2.500 2.500 0 013 17.500v-10z"/><path d="M12 11v5M9.500 13.500h5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2.500"/><circle cx="8.500" cy="9.500" r="1.600"/><path d="M21 16l-5-5-9 9"/>',
    shield: '<path d="M12 3l8 3v5.500c0 4.600-3.300 8.200-8 9.500-4.700-1.300-8-4.900-8-9.500V6l8-3z"/><path d="M8.500 12l2.500 2.500 4.500-5"/>',
    shieldx: '<path d="M12 3l8 3v5.500c0 4.600-3.300 8.200-8 9.500-4.700-1.300-8-4.900-8-9.500V6l8-3z"/><path d="M9.500 9.500l5 5M14.500 9.500l-5 5"/>',
    alert: '<path d="M12 3.500L2.500 20h19L12 3.500z"/><path d="M12 10v4.500M12 17.500v.01"/>',
    xcircle: '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.500M12 7.800v.01"/>',
    grid: '<path d="M3 9h18M3 15h18M9 3v18M15 3v18"/><rect x="3" y="3" width="18" height="18" rx="2"/>',
    wire: '<path d="M12 3l8 4.500v9L12 21l-8-4.500v-9L12 3z" stroke-dasharray="2.500 2"/><path d="M4 7.500l8 4.500 8-4.500M12 12v9" stroke-dasharray="2.500 2"/>',
    skeleton: '<circle cx="12" cy="5" r="2"/><circle cx="6" cy="14" r="2"/><circle cx="18" cy="14" r="2"/><circle cx="12" cy="20" r="1.600"/><path d="M12 7v11M10.600 6.400L7.200 12.300M13.400 6.400l3.400 5.900"/>',
    user: '<circle cx="12" cy="7.500" r="3.500"/><path d="M5 21v-1.500a5 5 0 015-5h4a5 5 0 015 5V21"/>',
    palette: '<path d="M12 3a9 9 0 100 18c1.400 0 2-1 1.500-2-.5-1.200.2-2.500 1.700-2.500H17a4 4 0 004-4c0-5-4-9.500-9-9.500z"/><circle cx="7.500" cy="11.500" r="1.200" fill="currentColor"/><circle cx="10.500" cy="7.500" r="1.200" fill="currentColor"/><circle cx="15.500" cy="8" r="1.200" fill="currentColor"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.100" fill="currentColor"/><circle cx="15" cy="15" r="1.100" fill="currentColor"/><circle cx="12" cy="12" r="1.100" fill="currentColor"/><circle cx="15" cy="9" r="1.100" fill="currentColor"/><circle cx="9" cy="15" r="1.100" fill="currentColor"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    pin: '<path d="M12 21s-6.500-6-6.500-11a6.500 6.500 0 0113 0c0 5-6.500 11-6.500 11z"/><circle cx="12" cy="10" r="2.300"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
    split: '<path d="M12 3v18M3 8h6M15 16h6M7 5L3 8l4 3M17 13l4 3-4 3"/>',
    flip: '<path d="M12 3v18" stroke-dasharray="2.500 2.500"/><path d="M8 6L3 18h5V6zM16 6l5 12h-5V6z"/>',
    search: '<circle cx="11" cy="11" r="6.500"/><path d="M16 16l5 5"/>',
    wrench: '<path d="M14.500 6a4.500 4.500 0 005.800 5.800L10 22l-3-3 10.200-10.200"/><path d="M6.500 3.500l3 3-2 2-3-3a4 4 0 004.500 4.500"/>',
    box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5M12 13v8"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2.500M12 19v2.500M2.500 12H5M19 12h2.500M5.300 5.300l1.800 1.800M16.900 16.900l1.800 1.800M5.300 18.700l1.800-1.800M16.900 7.100l1.800-1.800"/>',
    zip: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M10 8h2M10 11h2M10 14h2M10 17h2"/>'
  };
  const pxSvg = (n) => '<svg viewBox="0 0 24 24">' + (IC[n] || "") + "</svg>";
  const ic = (n) => '<i data-i="' + n + '">' + pxSvg(n) + "</i>";
  function hydrateIcons(root) {
    (root || document).querySelectorAll("i[data-i]:not(:has(svg))").forEach((e) => {
      e.innerHTML = pxSvg(e.dataset.i);
    });
  }
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const num = (v, d) => typeof v === "number" && isFinite(v) ? v : d || 0;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const round = (v, p) => {
    const k = Math.pow(10, p == null ? 3 : p);
    return Math.round(v * k) / k;
  };
  const isTouch = () => matchMedia("(pointer:coarse)").matches;
  const isMobile = () => matchMedia("(max-width:860px)").matches;
  let toastT = 0;
  function toast(msg, ms, kind) {
    const t = $("#toast");
    t.textContent = msg;
    t.dataset.kind = kind || "";
    t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => {
      t.hidden = true;
    }, ms || 2400);
  }
  /* ───────── Diálogos propios (en lugar de prompt/confirm) ───────── */
  function modal(title, body, buttons, bind, cls) {
    const bg = document.createElement("div");
    bg.className = "modal-bg";
    bg.innerHTML = '<div class="modal-box ' + (cls || "") + '" role="dialog" aria-modal="true"><h3>' + title + '</h3><div class="mb">' + body + '</div><div class="mf"></div></div>';
    const mf = bg.querySelector(".mf");
    const api = { el: bg, close: () => bg.remove() };
    (buttons || [{ label: "Cerrar" }]).forEach((b) => {
      const x = document.createElement("button");
      x.className = "btn " + (b.cls || "");
      x.textContent = b.label;
      x.onclick = () => {
        if (!b.fn || b.fn(api) !== false) api.close();
      };
      mf.appendChild(x);
    });
    bg.addEventListener("mousedown", (e) => {
      if (e.target === bg) api.close();
    });
    document.body.appendChild(bg);
    hydrateIcons(bg);
    if (bind) bind(bg, api);
    return api;
  }
  /* ask({title, text, fields:[{id,label,type:'text'|'number'|'select'|'check',value,options:[[v,l]],min,max,step,hint}], ok}) → valores | null */
  function ask(o) {
    return new Promise((res) => {
      const f = (o.fields || []).map((q) => {
        const id = "ask_" + q.id;
        let inp;
        if (q.type === "select") inp = '<select id="' + id + '">' + q.options.map((p) => '<option value="' + esc(p[0]) + '"' + (String(p[0]) === String(q.value) ? " selected" : "") + ">" + esc(p[1]) + "</option>").join("") + "</select>";
        else if (q.type === "check") inp = '<label class="chk"><input type="checkbox" id="' + id + '"' + (q.value ? " checked" : "") + ">" + esc(q.label2 || "") + "</label>";
        else inp = '<input class="txt" id="' + id + '" type="' + (q.type || "text") + '" value="' + esc(q.value == null ? "" : q.value) + '"' + (q.min != null ? ' min="' + q.min + '"' : "") + (q.max != null ? ' max="' + q.max + '"' : "") + (q.step ? ' step="' + q.step + '"' : "") + (q.placeholder ? ' placeholder="' + esc(q.placeholder) + '"' : "") + ">";
        return '<div class="kv"><label for="' + id + '">' + esc(q.label || "") + "</label>" + inp + (q.hint ? '<div class="hint">' + q.hint + "</div>" : "") + "</div>";
      }).join("");
      let done = false;
      const fin = (v) => {
        if (!done) {
          done = true;
          res(v);
        }
      };
      const api = modal(esc(o.title || ""), (o.text ? '<div class="sub">' + o.text + "</div>" : "") + f, [
        { label: o.cancel || "Cancelar", fn: () => fin(null) },
        { label: o.ok || "Aceptar", cls: o.danger ? "danger" : "primary", fn: (a) => {
          const out = {};
          (o.fields || []).forEach((q) => {
            const el = a.el.querySelector("#ask_" + q.id);
            out[q.id] = q.type === "check" ? el.checked : q.type === "number" ? +el.value : el.value;
          });
          if (o.validate) {
            const m = o.validate(out);
            if (m) {
              toast(m, 2800, "bad");
              return false;
            }
          }
          fin(out);
        } }
      ], (el, a) => {
        const first = el.querySelector("input,select");
        if (first) setTimeout(() => {
          first.focus();
          if (first.select) first.select();
        }, 30);
        el.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
            el.querySelector(".btn.primary,.btn.danger").click();
          }
        });
        const closeObs = new MutationObserver(() => {
          if (!document.body.contains(el)) {
            fin(null);
            closeObs.disconnect();
          }
        });
        closeObs.observe(document.body, { childList: true });
      });
    });
  }
  const confirmDlg = (msg, o) => ask(Object.assign({ title: "Confirmar", text: msg, ok: "Continuar", fields: [] }, o || {})).then((r) => !!r);
  /* Menú contextual flotante: items = [{label, icon, fn, danger, sep, disabled}] */
  function ctxMenu(x, y, items) {
    $$(".ctx").forEach((e) => e.remove());
    const m = document.createElement("div");
    m.className = "ctx";
    m.innerHTML = items.map((it, i) => it.sep ? "<hr>" : '<button data-i="' + i + '"' + (it.disabled ? " disabled" : "") + (it.danger ? ' class="danger"' : "") + ">" + (it.icon ? ic(it.icon) : '<i data-i=""></i>') + "<span>" + esc(it.label) + "</span>" + (it.key ? "<kbd>" + esc(it.key) + "</kbd>" : "") + "</button>").join("");
    document.body.appendChild(m);
    hydrateIcons(m);
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(6, Math.min(x, innerWidth - r.width - 6)) + "px";
    m.style.top = Math.max(6, Math.min(y, innerHeight - r.height - 6)) + "px";
    const kill = (e) => {
      if (e && e.type === "pointerdown" && m.contains(e.target)) return;
      m.remove();
      document.removeEventListener("pointerdown", kill, true);
      document.removeEventListener("keydown", kill, true);
      window.removeEventListener("blur", kill);
    };
    m.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (!b || b.disabled) return;
      const it = items[+b.dataset.i];
      kill();
      if (it && it.fn) it.fn();
    });
    setTimeout(() => {
      document.addEventListener("pointerdown", kill, true);
      document.addEventListener("keydown", kill, true);
      window.addEventListener("blur", kill);
    }, 0);
    return m;
  }
  const M = {
    id() {
      return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    },
    mul(a, b) {
      const o = new Array(16);
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
        let s = 0;
        for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
        o[c * 4 + r] = s;
      }
      return o;
    },
    tr(x, y, z) {
      const m = M.id();
      m[12] = x;
      m[13] = y;
      m[14] = z;
      return m;
    },
    rx(d) {
      const a = d * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), m = M.id();
      m[5] = c;
      m[6] = s;
      m[9] = -s;
      m[10] = c;
      return m;
    },
    ry(d) {
      const a = d * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), m = M.id();
      m[0] = c;
      m[2] = -s;
      m[8] = s;
      m[10] = c;
      return m;
    },
    rz(d) {
      const a = d * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), m = M.id();
      m[0] = c;
      m[1] = s;
      m[4] = -s;
      m[5] = c;
      return m;
    },
    persp(fov, asp, n, f) {
      const t = 1 / Math.tan(fov / 2), m = new Array(16).fill(0);
      m[0] = t / asp;
      m[5] = t;
      m[10] = (f + n) / (n - f);
      m[11] = -1;
      m[14] = 2 * f * n / (n - f);
      return m;
    },
    ortho(h, asp, n, f) {
      const w = h * asp, m = M.id();
      m[0] = 1 / w;
      m[5] = 1 / h;
      m[10] = -2 / (f - n);
      m[14] = -(f + n) / (f - n);
      return m;
    },
    look(e, t, u) {
      let zx = e[0] - t[0], zy = e[1] - t[1], zz = e[2] - t[2];
      const zl = Math.hypot(zx, zy, zz) || 1;
      zx /= zl;
      zy /= zl;
      zz /= zl;
      let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx;
      const xl = Math.hypot(xx, xy, xz) || 1;
      xx /= xl;
      xy /= xl;
      xz /= xl;
      const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0, -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1];
    },
    pt(m, p) {
      return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
    },
    dir(m, p) {
      return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2], m[1] * p[0] + m[5] * p[1] + m[9] * p[2], m[2] * p[0] + m[6] * p[1] + m[10] * p[2]];
    },
    sc(x, y, z) {
      const m = M.id();
      m[0] = x;
      m[5] = y;
      m[10] = z;
      return m;
    },
    about2(p, k) {
      return M.mul(M.tr(p[0], p[1], p[2]), M.mul(M.sc(k[0], k[1], k[2]), M.tr(-p[0], -p[1], -p[2])));
    },
    rot(r) {
      return M.mul(M.rz(r[2]), M.mul(M.ry(r[1]), M.rx(r[0])));
    },
    about(p, r) {
      return M.mul(M.tr(p[0], p[1], p[2]), M.mul(M.rot(r), M.tr(-p[0], -p[1], -p[2])));
    }
  };
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };
  const DB_NAME = "devstudio_db", STORE_INDEX = "projects_index", STORE_DATA = "projects_data";
  let dbP = null;
  function openDB() {
    return dbP || (dbP = new Promise((ok, ko) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = (e) => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_INDEX)) d.createObjectStore(STORE_INDEX, { keyPath: "id" });
        if (!d.objectStoreNames.contains(STORE_DATA)) d.createObjectStore(STORE_DATA, { keyPath: "id" });
      };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ko(r.error);
    }));
  }
  const idb = {
    get: (s, k) => openDB().then((d) => new Promise((ok, ko) => {
      const q = d.transaction(s).objectStore(s).get(k);
      q.onsuccess = () => ok(q.result || null);
      q.onerror = () => ko(q.error);
    })),
    put: (s, v) => openDB().then((d) => new Promise((ok, ko) => {
      const t = d.transaction(s, "readwrite");
      t.objectStore(s).put(v);
      t.oncomplete = ok;
      t.onerror = () => ko(t.error);
    }))
  };
  const uid = () => "n" + Math.random().toString(36).slice(2, 10);
  function findNode(id, n) {
    if (n.id === id) return n;
    for (const c of n.children || []) {
      const r = findNode(id, c);
      if (r) return r;
    }
    return null;
  }
  function findParent(id, n) {
    for (const c of n.children || []) {
      if (c.id === id) return n;
      const r = c.children && findParent(id, c);
      if (r) return r;
    }
    return null;
  }
  function allFiles(n, path, out) {
    out = out || [];
    path = path || "";
    for (const c of n.children || []) {
      if (c.type === "folder") allFiles(c, path + c.name + "/", out);
      else out.push({ node: c, path: path + c.name });
    }
    return out;
  }

  const qs = new URLSearchParams(location.search);
  const FD = { hooks: { snap: [], restore: [], save: [], init: [], draw: [], refresh: [], select: [] }, lazy: {} };
  const S = {
    meta: { colors: {}, bcolors: {} },
    colorMode: "auto",       // auto | tex | color | mix
    shade: true,
    sheetTab: "",
    projId: qs.get("id") || localStorage.getItem("devstudio_active_project"),
    fileId: qs.get("file"),
    project: null,
    node: null,
    root: null,
    geos: [],
    gi: 0,
    sel: null,               // selección principal { bone, cube|null }
    multi: [],               // selección adicional [{ bone, cube|null }]
    face: null,              // cara resaltada (nombre) del cubo seleccionado
    hover: null,
    hidden: new WeakSet(),
    collapsed: new WeakSet(),
    tool: "select",
    ptool: "pencil",
    mode: "edit",
    snap: 1,
    ortho: false,
    wire: false,
    grid: true,
    edges: true,
    skel: false,
    ref: false,
    bounds: false,
    sym: false,
    paintMir: false,
    texW: 64,
    texH: 64,
    dirty: false,
    saving: 0,
    cam: { yaw: 35, pitch: 22, dist: 70, tx: 0, ty: 12, tz: 0 },
    color: "#7c6cf5",
    brush: 1
  };
  /* ───────── Texturas (varias por proyecto, una activa) ───────── */
  const TX = { list: [], active: null };
  let tex = document.createElement("canvas");
  tex.width = 64;
  tex.height = 64;
  let tctx = tex.getContext("2d", { willReadFrequently: true });
  Object.defineProperty(S, "texNode", { get: () => TX.active && TX.active.node, set: (v) => {
    if (TX.active) TX.active.node = v;
  } });
  Object.defineProperty(S, "texDirty", { get: () => !!(TX.active && TX.active.dirty), set: (v) => {
    if (TX.active) TX.active.dirty = !!v;
  } });
  function snapOf(t) {
    return t.ctx.getImageData(0, 0, t.canvas.width, t.canvas.height);
  }
  function makeTex(w, h, name, node) {
    const c = document.createElement("canvas");
    c.width = Math.max(1, w | 0);
    c.height = Math.max(1, h | 0);
    const t = { id: uid(), name: name || "textura.png", node: node || null, canvas: c, ctx: c.getContext("2d", { willReadFrequently: true }), dirty: false, snap: null, cur: null, role: "" };
    t.snap = t.cur = snapOf(t);
    return t;
  }
  function activate(t, quiet) {
    if (!t) return;
    TX.active = t;
    tex = t.canvas;
    tctx = t.ctx;
    uploadTex();
    if (!quiet) {
      drawUV();
      fillTexSel();
      FD.hooks.refresh.forEach((f) => f("tex"));
      status();
    }
  }
  function loadImage(src) {
    return new Promise((ok) => {
      const im = new Image();
      im.onload = () => ok(im);
      im.onerror = () => ok(null);
      im.src = src;
    });
  }
  /* Añade una textura a la sesión (desde un dataURL) y la devuelve */
  async function addTexture(src, name, node, makeActive) {
    const im = await loadImage(src);
    if (!im) return null;
    const t = makeTex(im.width, im.height, name, node);
    t.ctx.drawImage(im, 0, 0);
    t.snap = t.cur = snapOf(t);
    TX.list.push(t);
    if (makeActive || !TX.active) activate(t);
    else {
      fillTexSel();
      FD.hooks.refresh.forEach((f) => f("tex"));
    }
    return t;
  }
  function newBlankTex(w, h) {
    const t = makeTex(w, h, "textura.png");
    TX.list.push(t);
    activate(t, true);
    return t;
  }
  function pixelsBlank(t) {
    t = t || TX.active;
    if (!t) return true;
    const d = t.ctx.getImageData(0, 0, t.canvas.width, t.canvas.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i]) return false;
    return true;
  }
  const texCandidates = () => S.project ? allFiles(S.project.root).filter((f) => /\.(png|jpg|jpeg|webp|tga)$/i.test(f.node.name) && /^data:image/.test(f.node.content || "")) : [];
  function fillTexSel() {
    const sel = $("#texSel");
    if (!sel) return;
    sel.innerHTML = TX.list.map((t) => '<option value="' + t.id + '"' + (t === TX.active ? " selected" : "") + ">" + esc(t.name) + (t.dirty ? " •" : "") + " (" + t.canvas.width + "×" + t.canvas.height + ")</option>").join("") || '<option value="">— sin textura —</option>';
    const c = $("#texCount");
    if (c) c.textContent = TX.list.length || "";
  }
  /* ───────── Identidad y utilidades de geometría ───────── */
  function parseGeos(root) {
    const list = [];
    if (Array.isArray(root["minecraft:geometry"])) {
      root["minecraft:geometry"].forEach((g) => {
        g.description = g.description || { identifier: "geometry.unknown" };
        g.bones = g.bones || [];
        list.push({ obj: g, legacy: false });
      });
    }
    Object.keys(root).forEach((k) => {
      if (k.indexOf("geometry.") === 0 && root[k] && typeof root[k] === "object") {
        root[k].bones = root[k].bones || [];
        list.push({ obj: root[k], legacy: true, key: k });
      }
    });
    return list;
  }
  const G = () => S.geos[S.gi];
  const bones = () => G().obj.bones;
  const geoName = (g) => g.legacy ? g.key : g.obj.description.identifier || "geometry.unknown";
  function readDims() {
    const g = G();
    if (!g) return;
    if (g.legacy) {
      S.texW = num(g.obj.texturewidth, 64) || 64;
      S.texH = num(g.obj.textureheight, 64) || 64;
    } else {
      S.texW = num(g.obj.description.texture_width, 64) || 64;
      S.texH = num(g.obj.description.texture_height, 64) || 64;
    }
  }
  function writeDims() {
    const g = G();
    if (!g) return;
    if (g.legacy) {
      g.obj.texturewidth = S.texW;
      g.obj.textureheight = S.texH;
    } else {
      g.obj.description.texture_width = S.texW;
      g.obj.description.texture_height = S.texH;
    }
  }
  function emptyRoot(name) {
    return { format_version: "1.12.0", "minecraft:geometry": [{ description: { identifier: name || "geometry.modelo", texture_width: 64, texture_height: 64, visible_bounds_width: 2, visible_bounds_height: 3, visible_bounds_offset: [0, 1.5, 0] }, bones: [{ name: "root", pivot: [0, 0, 0] }, { name: "body", parent: "root", pivot: [0, 12, 0], cubes: [{ origin: [-4, 12, -2], size: [8, 12, 4], uv: [16, 16] }] }] }] };
  }
  const boneByName = (n) => bones().find((b) => b.name === n);
  const parentOf = (b) => b.parent ? boneByName(b.parent) : null;
  const childrenOf = (b) => bones().filter((x) => x.parent === b.name);
  function descendants(b, out, seen) {
    out = out || [];
    seen = seen || new Set([b]);
    childrenOf(b).forEach((c) => {
      if (seen.has(c)) return;
      seen.add(c);
      out.push(c);
      descendants(c, out, seen);
    });
    return out;
  }
  function ensureCubes(b) {
    if (!b.cubes) b.cubes = [];
    return b.cubes;
  }
  const allCubes = () => bones().reduce((a, b) => a.concat(b.cubes || []), []);
  const cubesOf = (b) => [b].concat(descendants(b)).reduce((a, x) => a.concat(x.cubes || []), []);
  const cubeCenter = (c) => c.origin.map((o, i) => o + c.size[i] / 2);
  const boneOfCube = (c) => bones().find((b) => (b.cubes || []).indexOf(c) >= 0) || null;
  function newBoneName(base) {
    let n = base || "hueso", k = 1;
    while (boneByName(n)) n = (base || "hueso") + "_" + k++;
    return n;
  }
  const slugOf = (s) => String(s || "modelo").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "modelo";
  const geoSlug = () => slugOf((geoName(G()) || "modelo").replace(/^geometry\./, ""));
  /* ───────── Selección (principal + extra) ───────── */
  const selItems = () => S.sel ? [S.sel].concat(S.multi) : [];
  function isSelCube(c) {
    return selItems().some((s) => s.cube === c);
  }
  function isSelBone(b) {
    return selItems().some((s) => !s.cube && s.bone === b);
  }
  /* quita elementos que ya están cubiertos por un hueso padre también seleccionado */
  function topItems() {
    const items = selItems();
    const bs = items.filter((i) => !i.cube).map((i) => i.bone);
    const covered = new Set();
    bs.forEach((b) => descendants(b).forEach((d) => covered.add(d)));
    return items.filter((i) => i.cube ? !(bs.indexOf(i.bone) >= 0 || covered.has(i.bone)) : !covered.has(i.bone));
  }
  /* ───────── Historial ───────── */
  let hist = [], hpos = -1, histLock = false;
  function selPath(s) {
    if (!s) return null;
    const bi = bones().indexOf(s.bone);
    return { bi, ci: s.cube ? s.bone.cubes.indexOf(s.cube) : -1 };
  }
  function snapshot(label) {
    syncColors();
    const h = { label: label || "Cambio", t: Date.now(), root: JSON.stringify(S.root), gi: S.gi, sel: selPath(S.sel), tx: TX.active ? { id: TX.active.id, snap: TX.active.snap } : null, tw: S.texW, th: S.texH, colors: JSON.stringify(S.meta.colors), bcolors: JSON.stringify(S.meta.bcolors), x: {} };
    FD.hooks.snap.forEach((f) => f(h));
    return h;
  }
  function pushHist(label) {
    if (histLock) return;
    hist = hist.slice(0, hpos + 1);
    hist.push(snapshot(label));
    if (hist.length > 150) hist.shift();
    hpos = hist.length - 1;
    updUndo();
  }
  function restore(h) {
    histLock = true;
    S.root = JSON.parse(h.root);
    S.meta.colors = JSON.parse(h.colors || "{}");
    S.meta.bcolors = JSON.parse(h.bcolors || "{}");
    S.geos = parseGeos(S.root);
    S.gi = Math.min(h.gi, S.geos.length - 1);
    readDims();
    applyColors();
    FD.hooks.restore.forEach((f) => f(h));
    const p = h.sel;
    S.sel = null;
    S.multi = [];
    if (p && p.bi >= 0 && bones()[p.bi]) {
      const b = bones()[p.bi];
      S.sel = { bone: b, cube: p.ci >= 0 ? (b.cubes || [])[p.ci] || null : null };
    }
    if (h.tx) {
      const t = TX.list.find((x) => x.id === h.tx.id);
      if (t) {
        if (t !== TX.active) activate(t, true);
        if (t.cur !== h.tx.snap) {
          if (t.canvas.width !== h.tx.snap.width || t.canvas.height !== h.tx.snap.height) {
            t.canvas.width = h.tx.snap.width;
            t.canvas.height = h.tx.snap.height;
          }
          t.ctx.putImageData(h.tx.snap, 0, 0);
          t.snap = t.cur = h.tx.snap;
          t.dirty = true;
        }
      }
    }
    histLock = false;
    rebuild();
    uploadTex();
    fillTexSel();
    refreshAll();
    markDirty();
  }
  function undo() {
    if (hpos > 0) {
      hpos--;
      restore(hist[hpos]);
    }
    updUndo();
  }
  function redo() {
    if (hpos < hist.length - 1) {
      hpos++;
      restore(hist[hpos]);
    }
    updUndo();
  }
  function updUndo() {
    $("#undoBtn").classList.toggle("off", hpos <= 0);
    $("#redoBtn").classList.toggle("off", hpos >= hist.length - 1);
  }
  function commit(label) {
    pushHist(label);
    rebuild();
    refreshAll();
    markDirty();
  }
  /* ───────── Guardado ───────── */
  let saveT = 0;
  function setSaveState(txt, kind) {
    const s = $("#saveState");
    $("#saveTxt").textContent = txt;
    s.className = kind || "";
  }
  function markDirty() {
    S.dirty = true;
    setSaveState("Cambios sin guardar", "dirty");
    $("#saveBtn").classList.add("pending");
    clearTimeout(saveT);
    saveT = setTimeout(saveDraft, 1500);
  }
  const draftKey = () => "fd_draft_" + (S.project ? S.project.id : "demo") + "_" + (S.node ? S.node.id || S.node.name : "");
  function saveDraft() {
    try {
      writeDims();
      const d = { t: Date.now(), geo: JSON.stringify(S.root), x: {} };
      FD.hooks.save.forEach((f) => f(d, true));
      localStorage.setItem(draftKey(), JSON.stringify(d));
    } catch (e) {
    }
  }
  function clearDraft() {
    try {
      localStorage.removeItem(draftKey());
    } catch (e) {
    }
  }
  async function save() {
    clearTimeout(saveT);
    if (!S.project || !S.node) return false;
    try {
      writeDims();
      S.node.content = JSON.stringify(S.root, null, 2);
      S.project.meta = S.project.meta || {};
      syncColors();
      S.project.meta[S.node.id] = Object.assign(S.project.meta[S.node.id] || {}, { colors: S.meta.colors, bcolors: S.meta.bcolors });
      FD.hooks.save.forEach((f) => f({}, false));
      for (const t of TX.list) {
        if (!t.node && t.dirty && !pixelsBlank(t)) await ensureTexNode(t);
        if (t.node && t.dirty) {
          t.node.content = t.canvas.toDataURL("image/png");
          t.dirty = false;
        }
      }
      await idb.put(STORE_DATA, Object.assign({}, S.project, { id: S.project.id, name: S.project.name, root: S.project.root }));
      const idx = await idb.get(STORE_INDEX, S.project.id);
      if (idx) {
        idx.updatedAt = Date.now();
        await idb.put(STORE_INDEX, idx);
      }
      S.dirty = false;
      clearDraft();
      $("#saveBtn").classList.remove("pending");
      setSaveState("Guardado", "");
      fillTexSel();
      FD.hooks.refresh.forEach((f) => f("saved"));
      return true;
    } catch (e) {
      setSaveState("Error al guardar", "dirty");
      console.error(e);
      toast("No se pudo guardar: " + (e && e.message || e), 4000, "bad");
      return false;
    }
  }
  /* Crea el archivo de una textura en el sitio correcto del proyecto (lo resuelve model-proj.js) */
  async function ensureTexNode(t) {
    t = t || TX.active;
    if (!t) return null;
    if (t.node) return t.node;
    if (FD.proj && FD.proj.nodeForTexture) {
      t.node = FD.proj.nodeForTexture(t);
    } else {
      const par = findParent(S.node.id, S.project.root) || S.project.root;
      let name = t.name, k = 1;
      while ((par.children || []).some((c) => c.name === name)) name = t.name.replace(/\.png$/i, "") + "_" + k++ + ".png";
      t.node = { id: uid(), type: "file", name, content: "" };
      par.children.push(t.node);
    }
    t.name = t.node.name;
    t.node.content = t.canvas.toDataURL("image/png");
    t.dirty = false;
    fillTexSel();
    return t.node;
  }
  /* ───────── Colores por hueso y por cubo ───────── */
  const COLORS = ["#e8736c", "#ec9a5c", "#e6c75e", "#a6d56f", "#52c490", "#4dbdcb", "#5fa0e6", "#8088ee", "#a982e6", "#da82d6", "#e883a8", "#9ca6b6"];
  const boneUser = new WeakMap();
  const userColor = new WeakMap();
  function hexRGBn(h) {
    const n = parseInt(h.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function rgbHex(r, g, b) {
    return "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  }
  function rgb2hsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  function hsl2rgb(h, s, l) {
    const f = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
    };
    if (!s) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255];
  }
  function tint(hex, dl, ds) {
    const c = hexRGBn(hex), [h, s, l] = rgb2hsl(c[0], c[1], c[2]);
    const o = hsl2rgb(h, clamp(s + (ds || 0), 0, 1), clamp(l + dl, 0.12, 0.88));
    return rgbHex(o[0], o[1], o[2]);
  }
  const hashStr = (s) => {
    let h = 7;
    for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) >>> 0;
    return h;
  };
  /* color base de un hueso: el que eligió el usuario o uno estable según su nombre */
  function boneColor(b) {
    return boneUser.get(b) || COLORS[hashStr(String(b.name).toLowerCase()) % COLORS.length];
  }
  const TWEAK = [0, 0.09, -0.09, 0.16, -0.16, 0.05, -0.05];
  /* color de un cubo: el suyo, o el del hueso con una variación para distinguirlos */
  function cubeColor(b, c) {
    if (userColor.has(c)) return userColor.get(c);
    const i = Math.max(0, (b.cubes || []).indexOf(c));
    return i ? tint(boneColor(b), TWEAK[i % TWEAK.length]) : boneColor(b);
  }
  const hasOwnColor = (c) => userColor.has(c);
  const cubeKey = (b, c) => b.name + "/" + (b.cubes || []).indexOf(c);
  function syncColors() {
    const m = {}, bm = {};
    if (G()) bones().forEach((b) => {
      if (boneUser.has(b)) bm[b.name] = boneUser.get(b);
      (b.cubes || []).forEach((c) => {
        if (userColor.has(c)) m[cubeKey(b, c)] = userColor.get(c);
      });
    });
    S.meta.colors = m;
    S.meta.bcolors = bm;
  }
  function applyColors() {
    if (!G()) return;
    bones().forEach((b) => {
      if (S.meta.bcolors && S.meta.bcolors[b.name]) boneUser.set(b, S.meta.bcolors[b.name]);
      (b.cubes || []).forEach((c) => {
        const k = S.meta.colors[cubeKey(b, c)];
        if (k) userColor.set(c, k);
      });
    });
  }
  const setCubeColor = (c, h) => userColor.set(c, h);
  const setBoneColor = (b, h) => boneUser.set(b, h);
  function hexF(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
  }
  const FACE_NAMES = ["north", "south", "east", "west", "up", "down"];

  /* ───────── Geometría → caras ───────── */
  let faces = [], cubeInfo = [], boneWorld = new Map();
  function boneMatrix(b, guard) {
    if (boneWorld.has(b)) return boneWorld.get(b);
    guard = guard || new Set();
    if (guard.has(b)) return M.id();
    guard.add(b);
    const p = parentOf(b);
    const pm = p ? boneMatrix(p, guard) : M.id();
    const pose = FD.pose ? FD.pose(b) : null;
    const pv = b.pivot || [0, 0, 0];
    let rot = b.rotation || [0, 0, 0], loc;
    if (pose) {
      rot = [rot[0] + pose.rot[0], rot[1] + pose.rot[1], rot[2] + pose.rot[2]];
      loc = M.mul(M.tr(pose.pos[0], pose.pos[1], pose.pos[2]), M.mul(M.about(pv, rot), M.about2(pv, pose.scale)));
    } else loc = M.about(pv, rot);
    const m = M.mul(pm, loc);
    boneWorld.set(b, m);
    return m;
  }
  /* rectángulos UV [u0,v0,u1,v1] de cada cara, en unidades del modelo */
  function faceUVs(c) {
    const out = {};
    const s = c.size || [1, 1, 1], w = s[0], h = s[1], d = s[2];
    if (Array.isArray(c.uv)) {
      const u = c.uv[0], v = c.uv[1];
      out.east = [u, v + d, u + d, v + d + h];
      out.north = [u + d, v + d, u + d + w, v + d + h];
      out.west = [u + d + w, v + d, u + d + w + d, v + d + h];
      out.south = [u + 2 * d + w, v + d, u + 2 * d + 2 * w, v + d + h];
      out.up = [u + d, v, u + d + w, v + d];
      out.down = [u + d + w, v + d, u + d + 2 * w, v];
      if (c.mirror) {
        const e = out.east;
        out.east = out.west;
        out.west = e;
        Object.keys(out).forEach((k) => {
          const r = out[k];
          out[k] = [r[2], r[1], r[0], r[3]];
        });
      }
    } else if (c.uv && typeof c.uv === "object") {
      FACE_NAMES.forEach((k) => {
        const f = c.uv[k];
        if (f && Array.isArray(f.uv)) {
          const sz = f.uv_size || [0, 0];
          out[k] = [f.uv[0], f.uv[1], f.uv[0] + sz[0], f.uv[1] + sz[1]];
        }
      });
    }
    return out;
  }
  let vertData = new Float32Array(0), edgeData = new Float32Array(0), glDirty = true;
  function rebuild() {
    faces = [];
    cubeInfo = [];
    boneWorld = new Map();
    const g = G();
    if (!g) return;
    const verts = [], edges = [];
    const selC = new Set(), selB = new Set();
    selItems().forEach((s) => {
      if (s.cube) selC.add(s.cube);
      else selB.add(s.bone);
    });
    g.obj.bones.forEach((b) => {
      const bm = boneMatrix(b);
      const hid = S.hidden.has(b);
      (b.cubes || []).forEach((c) => {
        if (hid || S.hidden.has(c)) {
          cubeInfo.push({ b, c, bm, m: bm, hidden: true });
          return;
        }
        const o = c.origin || [0, 0, 0], s = c.size || [1, 1, 1], inf = num(c.inflate, num(b.inflate, 0));
        const x0 = o[0] - inf, y0 = o[1] - inf, z0 = o[2] - inf, x1 = o[0] + s[0] + inf, y1 = o[1] + s[1] + inf, z1 = o[2] + s[2] + inf;
        const cm = c.rotation && (c.rotation[0] || c.rotation[1] || c.rotation[2]) ? M.mul(bm, M.about(c.pivot || [0, 0, 0], c.rotation)) : bm;
        const ci = { b, c, bm, m: cm, hidden: false, bb: [x0, y0, z0, x1, y1, z1] };
        cubeInfo.push(ci);
        const uvs = faceUVs(c);
        const Q = {
          north: [[x1, y1, z0], [x0, y1, z0], [x0, y0, z0], [x1, y0, z0]],
          south: [[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1]],
          east: [[x1, y1, z1], [x1, y1, z0], [x1, y0, z0], [x1, y0, z1]],
          west: [[x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [x0, y0, z0]],
          up: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]],
          down: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]]
        };
        const isSel = selC.has(c), isBone = selB.has(b);
        const cc = hexF(cubeColor(b, c));
        FACE_NAMES.forEach((fn) => {
          const r = uvs[fn];
          if (!r) return;
          const P = Q[fn].map((p) => M.pt(cm, p));
          const n = norm(cross(sub(P[1], P[0]), sub(P[3], P[0])));
          const shade = 0.6 + 0.4 * clamp(dot(n, norm([0.35, 0.8, -0.5])) * 0.5 + 0.5, 0, 1);
          const U = [[r[0] / S.texW, r[1] / S.texH], [r[2] / S.texW, r[1] / S.texH], [r[2] / S.texW, r[3] / S.texH], [r[0] / S.texW, r[3] / S.texH]];
          faces.push({ b, c, fn, P, U, n, shade });
          const sh = S.shade ? shade : 1;
          const hl = isSel ? S.face === fn && selC.size === 1 ? 1.5 : 0.7 : isBone ? 0.4 : 0;
          [0, 1, 2, 0, 2, 3].forEach((i) => verts.push(P[i][0], P[i][1], P[i][2], U[i][0], U[i][1], sh, cc[0], cc[1], cc[2], hl));
        });
        if (S.edges) {
          const k = (i) => M.pt(cm, [i & 1 ? x1 : x0, i & 2 ? y1 : y0, i & 4 ? z1 : z0]);
          const V = [0, 1, 2, 3, 4, 5, 6, 7].map(k);
          const col = isSel ? [0.72, 0.66, 1, 0.95] : [0, 0, 0, 0.3];
          [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, c2]) => {
            edges.push(V[a][0], V[a][1], V[a][2], col[0], col[1], col[2], col[3], V[c2][0], V[c2][1], V[c2][2], col[0], col[1], col[2], col[3]);
          });
        }
      });
    });
    vertData = new Float32Array(verts);
    edgeData = new Float32Array(edges);
    glDirty = true;
    drawUV();
  }
  /* ───────── WebGL ───────── */
  const cv = $("#gl"), ov = $("#ov"), octx = ov.getContext("2d");
  let gl = null, progTex = null, progLine = null, bufTex = null, bufLine = null, bufEdge = null, glTex = null, texDirtyGL = true;
  const uni = {};
  function initGL() {
    gl = cv.getContext("webgl", { antialias: true, alpha: false, preserveDrawingBuffer: true }) || cv.getContext("experimental-webgl");
    if (!gl) {
      $("#noGl").hidden = false;
      return false;
    }
    const mk = (vs, fs) => {
      const p = gl.createProgram();
      [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(([t, src]) => {
        const s = gl.createShader(t);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
        gl.attachShader(p, s);
      });
      gl.linkProgram(p);
      return p;
    };
    progTex = mk(
      "attribute vec3 p;attribute vec2 u;attribute float s;attribute vec3 k;attribute float h;uniform mat4 m;varying vec2 vu;varying float vs;varying vec3 vk;varying float vh;void main(){vu=u;vs=s;vk=k;vh=h;gl_Position=m*vec4(p,1.);}",
      "precision mediump float;uniform sampler2D t;uniform float mode;varying vec2 vu;varying float vs;varying vec3 vk;varying float vh;void main(){vec4 c=texture2D(t,vu);vec3 col;if(mode<.5){col=mix(vk,c.rgb,c.a);}else if(mode<1.5){if(c.a<.1)discard;col=c.rgb;}else if(mode<2.5){col=vk;}else{col=mix(vk,mix(vk,c.rgb,.85),c.a);}col=mix(col,vec3(.64,.6,1.),clamp(vh,0.,1.)*.34+max(vh-1.,0.)*.5);gl_FragColor=vec4(col*vs,1.);}"
    );
    progLine = mk("attribute vec3 p;attribute vec4 c;uniform mat4 m;varying vec4 vc;void main(){vc=c;gl_Position=m*vec4(p,1.);}", "precision mediump float;varying vec4 vc;void main(){gl_FragColor=vc;}");
    bufTex = gl.createBuffer();
    bufLine = gl.createBuffer();
    bufEdge = gl.createBuffer();
    glTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, glTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    uni.tm = gl.getUniformLocation(progTex, "m");
    uni.tt = gl.getUniformLocation(progTex, "t");
    uni.tmode = gl.getUniformLocation(progTex, "mode");
    uni.lm = gl.getUniformLocation(progLine, "m");
    return true;
  }
  function uploadTex() {
    texDirtyGL = true;
    requestDraw();
  }
  let drawQ = 0;
  function requestDraw() {
    if (!drawQ) drawQ = requestAnimationFrame(() => {
      drawQ = 0;
      draw();
    });
  }
  let VP = M.id(), CW = 1, CH = 1, eye = [0, 0, 0];
  function camSetup() {
    const c = S.cam, yaw = c.yaw * Math.PI / 180, pit = c.pitch * Math.PI / 180;
    const t = [c.tx, c.ty, c.tz];
    eye = [t[0] + c.dist * Math.cos(pit) * Math.sin(yaw), t[1] + c.dist * Math.sin(pit), t[2] - c.dist * Math.cos(pit) * Math.cos(yaw)];
    const asp = CW / CH;
    const V = M.look(eye, t, [0, 1, 0]);
    const P = S.ortho ? M.ortho(c.dist * 0.45, asp, -2e3, 2e3) : M.persp(45 * Math.PI / 180, asp, 0.5, 4e3);
    VP = M.mul(P, V);
  }
  function project(p) {
    const x = VP[0] * p[0] + VP[4] * p[1] + VP[8] * p[2] + VP[12], y = VP[1] * p[0] + VP[5] * p[1] + VP[9] * p[2] + VP[13], w = VP[3] * p[0] + VP[7] * p[1] + VP[11] * p[2] + VP[15];
    if (w < 1e-4 && !S.ortho) return null;
    return [(x / w * 0.5 + 0.5) * CW, (1 - (y / w * 0.5 + 0.5)) * CH, w];
  }
  function rayAt(px, py) {
    const inv = invert(VP);
    if (!inv) return null;
    const nx = px / CW * 2 - 1, ny = 1 - py / CH * 2;
    const a = unproj(inv, nx, ny, -1), b = unproj(inv, nx, ny, 1);
    return { o: a, d: norm(sub(b, a)) };
  }
  function unproj(inv, x, y, z) {
    const v = [x, y, z, 1];
    const o = [0, 0, 0, 0];
    for (let r = 0; r < 4; r++) o[r] = inv[r] * v[0] + inv[4 + r] * v[1] + inv[8 + r] * v[2] + inv[12 + r] * v[3];
    return [o[0] / o[3], o[1] / o[3], o[2] / o[3]];
  }
  function invert(m) {
    const a = m, o = new Array(16), b00 = a[0] * a[5] - a[1] * a[4], b01 = a[0] * a[6] - a[2] * a[4], b02 = a[0] * a[7] - a[3] * a[4], b03 = a[1] * a[6] - a[2] * a[5], b04 = a[1] * a[7] - a[3] * a[5], b05 = a[2] * a[7] - a[3] * a[6], b06 = a[8] * a[13] - a[9] * a[12], b07 = a[8] * a[14] - a[10] * a[12], b08 = a[8] * a[15] - a[11] * a[12], b09 = a[9] * a[14] - a[10] * a[13], b10 = a[9] * a[15] - a[11] * a[13], b11 = a[10] * a[15] - a[11] * a[14];
    let d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!d) return null;
    d = 1 / d;
    o[0] = (a[5] * b11 - a[6] * b10 + a[7] * b09) * d;
    o[1] = (a[2] * b10 - a[1] * b11 - a[3] * b09) * d;
    o[2] = (a[13] * b05 - a[14] * b04 + a[15] * b03) * d;
    o[3] = (a[10] * b04 - a[9] * b05 - a[11] * b03) * d;
    o[4] = (a[6] * b08 - a[4] * b11 - a[7] * b07) * d;
    o[5] = (a[0] * b11 - a[2] * b08 + a[3] * b07) * d;
    o[6] = (a[14] * b02 - a[12] * b05 - a[15] * b01) * d;
    o[7] = (a[8] * b05 - a[10] * b02 + a[11] * b01) * d;
    o[8] = (a[4] * b10 - a[5] * b08 + a[7] * b06) * d;
    o[9] = (a[1] * b08 - a[0] * b10 - a[3] * b06) * d;
    o[10] = (a[12] * b04 - a[13] * b02 + a[15] * b00) * d;
    o[11] = (a[9] * b02 - a[8] * b04 - a[11] * b00) * d;
    o[12] = (a[5] * b07 - a[4] * b09 - a[6] * b06) * d;
    o[13] = (a[0] * b09 - a[1] * b07 + a[2] * b06) * d;
    o[14] = (a[13] * b01 - a[12] * b03 - a[14] * b00) * d;
    o[15] = (a[8] * b03 - a[9] * b01 + a[10] * b00) * d;
    return o;
  }
  function rayTri(o, d, a, b, c) {
    const e1 = sub(b, a), e2 = sub(c, a), p = cross(d, e2), det = dot(e1, p);
    if (Math.abs(det) < 1e-9) return null;
    const inv = 1 / det, t0 = sub(o, a), u = dot(t0, p) * inv;
    if (u < 0 || u > 1) return null;
    const q = cross(t0, e1), v = dot(d, q) * inv;
    if (v < 0 || u + v > 1) return null;
    const t = dot(e2, q) * inv;
    return t > 0 ? { t, u, v } : null;
  }
  /* ───────── Líneas auxiliares: cuadrícula, ejes, referencia, límites ───────── */
  function gridLines() {
    const L = [];
    const push = (p, q, c) => L.push(p[0], p[1], p[2], c[0], c[1], c[2], c[3], q[0], q[1], q[2], c[0], c[1], c[2], c[3]);
    const box = (a, b, c) => {
      const v = (i) => [i & 1 ? b[0] : a[0], i & 2 ? b[1] : a[1], i & 4 ? b[2] : a[2]];
      [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([i, j]) => push(v(i), v(j), c));
    };
    if (S.grid) {
      for (let i = -32; i <= 32; i += 1) {
        const major = i % 16 === 0, mid = i % 4 === 0;
        const c = major ? [0.62, 0.6, 0.86, 0.5] : mid ? [0.55, 0.55, 0.78, 0.22] : [0.5, 0.5, 0.74, 0.09];
        if (!mid && S.cam.dist > 140) continue;
        if (i === 0) continue;
        push([i, 0, -32], [i, 0, 32], c);
        push([-32, 0, i], [32, 0, i], c);
      }
      const o = [0.62, 0.6, 0.86, 0.55];
      push([-32, 0, 0], [0, 0, 0], o);
      push([0, 0, -32], [0, 0, 0], o);
      push([0, 0, 0], [0, 0, 32], o);
      push([0, 0, 0], [32, 0, 0], o);
      box([-8, 0, -8], [8, 0, 8], [0.78, 0.74, 1, 0.5]);
    }
    push([0, 0, 0], [16, 0, 0], [0.94, 0.3, 0.3, 1]);
    push([0, 0, 0], [0, 16, 0], [0.3, 0.8, 0.45, 1]);
    push([0, 0, 0], [0, 0, 16], [0.3, 0.55, 0.98, 1]);
    if (S.ref) {
      const c = [0.45, 0.8, 1, 0.55];
      [[-4, 24, -4, 4, 32, 4], [-4, 12, -2, 4, 24, 2], [-8, 12, -2, -4, 24, 2], [4, 12, -2, 8, 24, 2], [-4, 0, -2, 0, 12, 2], [0, 0, -2, 4, 12, 2]].forEach((r) => box([r[0], r[1], r[2]], [r[3], r[4], r[5]], c));
    }
    if (S.bounds && G() && !G().legacy) {
      const d = G().obj.description, w = num(d.visible_bounds_width, 1) * 8, h = num(d.visible_bounds_height, 1) * 8, o = d.visible_bounds_offset || [0, 0, 0];
      const cx = num(o[0]) * 16, cy = num(o[1]) * 16, cz = num(o[2]) * 16;
      box([cx - w, cy - h, cz - w], [cx + w, cy + h, cz + w], [1, 0.78, 0.25, 0.7]);
    }
    return new Float32Array(L);
  }
  function modeNum() {
    return { auto: 0, tex: 1, color: 2, mix: 3 }[S.colorMode] || 0;
  }
  function draw() {
    if (!gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect();
    CW = Math.max(1, r.width);
    CH = Math.max(1, r.height);
    const w = Math.round(CW * dpr), h = Math.round(CH * dpr);
    if (cv.width !== w || cv.height !== h) {
      cv.width = w;
      cv.height = h;
      ov.width = w;
      ov.height = h;
    }
    camSetup();
    gl.viewport(0, 0, w, h);
    gl.clearColor(0.055, 0.058, 0.082, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.CULL_FACE);
    if (texDirtyGL) {
      gl.bindTexture(gl.TEXTURE_2D, glTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex);
      texDirtyGL = false;
    }
    const fm = new Float32Array(VP);
    const lineDraw = (buf, data) => {
      gl.useProgram(progLine);
      gl.uniformMatrix4fv(uni.lm, false, fm);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
      const pl = gl.getAttribLocation(progLine, "p"), cl = gl.getAttribLocation(progLine, "c");
      gl.enableVertexAttribArray(pl);
      gl.enableVertexAttribArray(cl);
      gl.vertexAttribPointer(pl, 3, gl.FLOAT, false, 28, 0);
      gl.vertexAttribPointer(cl, 4, gl.FLOAT, false, 28, 12);
      gl.drawArrays(gl.LINES, 0, data.length / 7);
    };
    lineDraw(bufLine, gridLines());
    if (vertData.length) {
      gl.useProgram(progTex);
      gl.uniformMatrix4fv(uni.tm, false, fm);
      gl.uniform1i(uni.tt, 0);
      gl.uniform1f(uni.tmode, modeNum());
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, glTex);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufTex);
      gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.DYNAMIC_DRAW);
      [["p", 3, 0], ["u", 2, 12], ["s", 1, 20], ["k", 3, 24], ["h", 1, 36]].forEach(([n, sz, off]) => {
        const l = gl.getAttribLocation(progTex, n);
        gl.enableVertexAttribArray(l);
        gl.vertexAttribPointer(l, sz, gl.FLOAT, false, 40, off);
      });
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1, 1);
      gl.drawArrays(gl.TRIANGLES, 0, vertData.length / 10);
      gl.disable(gl.POLYGON_OFFSET_FILL);
    }
    if (edgeData.length) lineDraw(bufEdge, edgeData);
    drawOverlay(dpr);
  }
  /* ───────── Superposición 2D: selección, gizmo, esqueleto, textos ───────── */
  let gizmo = null, marquee = null, gizHover = -1, dragLabel = "";
  function selMatrixInfo() {
    if (!S.sel) return null;
    const b = S.sel.bone;
    if (S.sel.cube) {
      const ci = cubeInfo.find((x) => x.c === S.sel.cube);
      if (!ci || ci.hidden) return null;
      const bb = ci.bb;
      const ctr = M.pt(ci.m, [(bb[0] + bb[3]) / 2, (bb[1] + bb[4]) / 2, (bb[2] + bb[5]) / 2]);
      return { center: ctr, axM: ci.bm, ci };
    }
    const p = parentOf(b);
    const pm = p ? boneMatrix(p) : M.id();
    return { center: M.pt(boneMatrix(b), b.pivot || [0, 0, 0]), axM: pm };
  }
  function drawSkeleton() {
    octx.lineWidth = 1.4;
    bones().forEach((b) => {
      if (S.hidden.has(b)) return;
      const q = project(M.pt(boneMatrix(b), b.pivot || [0, 0, 0]));
      if (!q) return;
      const p = parentOf(b);
      if (p) {
        const a = project(M.pt(boneMatrix(p), p.pivot || [0, 0, 0]));
        if (a) {
          octx.strokeStyle = "rgba(251,191,36,.5)";
          octx.beginPath();
          octx.moveTo(a[0], a[1]);
          octx.lineTo(q[0], q[1]);
          octx.stroke();
        }
      }
      const sel = isSelBone(b) || S.sel && S.sel.bone === b;
      octx.fillStyle = sel ? "#fbbf24" : "rgba(251,191,36,.85)";
      octx.strokeStyle = "rgba(0,0,0,.6)";
      octx.beginPath();
      octx.arc(q[0], q[1], sel ? 4.5 : 3, 0, 7);
      octx.fill();
      octx.stroke();
      if (S.skel && S.cam.dist < 160 || sel) {
        octx.font = "600 10px system-ui,sans-serif";
        octx.fillStyle = sel ? "#fde68a" : "rgba(253,230,138,.75)";
        octx.fillText(b.name, q[0] + 7, q[1] - 5);
      }
      Object.keys(b.locators || {}).forEach((n) => {
        const v = b.locators[n];
        if (!Array.isArray(v)) return;
        const lp = project(M.pt(boneMatrix(b), v));
        if (!lp) return;
        octx.fillStyle = "#38bdf8";
        octx.beginPath();
        octx.moveTo(lp[0], lp[1] - 5);
        octx.lineTo(lp[0] + 4, lp[1]);
        octx.lineTo(lp[0], lp[1] + 5);
        octx.lineTo(lp[0] - 4, lp[1]);
        octx.closePath();
        octx.fill();
        octx.fillStyle = "rgba(125,211,252,.9)";
        octx.fillText(n, lp[0] + 7, lp[1] + 3);
      });
    });
  }
  function drawOverlay(dpr) {
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    octx.clearRect(0, 0, CW, CH);
    gizmo = null;
    const lw = 1.6;
    octx.font = "700 11px system-ui,sans-serif";
    [["X", [19, 0, 0], "#f87171"], ["Y", [0, 19, 0], "#4ade80"], ["Z", [0, 0, 19], "#60a5fa"]].forEach(([t, p, col]) => {
      const q = project(p);
      if (q) {
        octx.fillStyle = col;
        octx.fillText(t, q[0] - 3, q[1] + 4);
      }
    });
    if (S.wire) {
      octx.strokeStyle = "rgba(255,255,255,.2)";
      octx.lineWidth = 1;
      octx.beginPath();
      faces.forEach((f) => polyPath(f.P));
      octx.stroke();
    }
    if (S.skel || S.mode === "anim") drawSkeleton();
    if (S.hover && !drag) {
      const ci = cubeInfo.find((x) => x.c === S.hover);
      if (ci && !ci.hidden && !isSelCube(ci.c)) boxEdges(ci, "rgba(255,255,255,.6)", 1.5);
    }
    if (marquee) {
      octx.fillStyle = "rgba(133,119,248,.14)";
      octx.strokeStyle = "rgba(133,119,248,.9)";
      octx.lineWidth = 1;
      octx.fillRect(marquee[0], marquee[1], marquee[2] - marquee[0], marquee[3] - marquee[1]);
      octx.strokeRect(marquee[0], marquee[1], marquee[2] - marquee[0], marquee[3] - marquee[1]);
    }
    if (!S.sel) return;
    selItems().forEach((s, i) => {
      const cs = s.cube ? [s.cube] : s.bone.cubes || [];
      cs.forEach((c) => {
        const ci = cubeInfo.find((x) => x.c === c);
        if (!ci || ci.hidden) return;
        boxEdges(ci, s.cube ? i === 0 ? "#c4baff" : "#9a8ff5" : "#fbbf24", 2);
      });
    });
    if (S.mode !== "edit" && S.mode !== "anim") return;
    const info = selMatrixInfo();
    if (!info) return;
    const ctr = project(info.center);
    if (!ctr) return;
    const pv = S.sel.cube ? S.sel.cube.pivot ? M.pt(info.axM, S.sel.cube.pivot) : null : info.center;
    if (pv) {
      const q = project(pv);
      if (q) {
        octx.strokeStyle = "#fbbf24";
        octx.lineWidth = 1.5;
        octx.beginPath();
        octx.arc(q[0], q[1], 5, 0, 7);
        octx.moveTo(q[0] - 9, q[1]);
        octx.lineTo(q[0] + 9, q[1]);
        octx.moveTo(q[0], q[1] - 9);
        octx.lineTo(q[0], q[1] + 9);
        octx.stroke();
      }
    }
    if (S.tool === "select") return;
    const cols = ["#ef4444", "#22c55e", "#3b82f6"], names = ["X", "Y", "Z"], axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    const unit = Math.max(8, S.cam.dist * 0.16);
    const hs = [];
    axes.forEach((a, i) => {
      const d = norm(M.dir(info.axM, a));
      const tip = [info.center[0] + d[0] * unit, info.center[1] + d[1] * unit, info.center[2] + d[2] * unit];
      const q = project(tip);
      if (!q) return;
      const dx = q[0] - ctr[0], dy = q[1] - ctr[1], len = Math.hypot(dx, dy);
      if (len < 6) return;
      const hot = gizHover === i || drag && drag.type === "gizmo" && drag.h.i === i;
      octx.strokeStyle = cols[i];
      octx.fillStyle = cols[i];
      octx.globalAlpha = hot ? 1 : 0.85;
      octx.lineWidth = lw + (hot ? 2 : 1);
      octx.beginPath();
      octx.moveTo(ctr[0], ctr[1]);
      octx.lineTo(q[0], q[1]);
      octx.stroke();
      const R = (isTouch() ? 13 : 8) + (hot ? 2 : 0);
      octx.beginPath();
      if (S.tool === "scale") octx.rect(q[0] - R * 0.7, q[1] - R * 0.7, R * 1.4, R * 1.4);
      else if (S.tool === "rotate") {
        octx.arc(q[0], q[1], R, 0, 7);
      } else {
        const ux = dx / len, uy = dy / len;
        octx.moveTo(q[0] + ux * R * 1.4, q[1] + uy * R * 1.4);
        octx.lineTo(q[0] - uy * R * 0.8, q[1] + ux * R * 0.8);
        octx.lineTo(q[0] + uy * R * 0.8, q[1] - ux * R * 0.8);
        octx.closePath();
      }
      octx.fill();
      octx.globalAlpha = 1;
      octx.fillStyle = "#fff";
      octx.font = "800 10px system-ui,sans-serif";
      octx.fillText(names[i], q[0] + (dx / len) * (R + 8) - 3, q[1] + (dy / len) * (R + 8) + 4);
      hs.push({ i, q, ctr, len, dirScreen: [dx / len, dy / len], unit, R, axisWorld: d });
    });
    gizmo = { hs, center: ctr, info };
    octx.fillStyle = "#fff";
    octx.beginPath();
    octx.arc(ctr[0], ctr[1], 3.5, 0, 7);
    octx.fill();
    if (dragLabel) {
      octx.font = "700 12px ui-monospace,SFMono-Regular,Menlo,monospace";
      const tw = octx.measureText(dragLabel).width + 14;
      octx.fillStyle = "rgba(16,17,24,.92)";
      octx.strokeStyle = "rgba(133,119,248,.8)";
      octx.lineWidth = 1;
      const bx = ctr[0] + 16, by = ctr[1] - 36;
      octx.beginPath();
      octx.roundRect ? octx.roundRect(bx, by, tw, 22, 6) : octx.rect(bx, by, tw, 22);
      octx.fill();
      octx.stroke();
      octx.fillStyle = "#e7e8f2";
      octx.fillText(dragLabel, bx + 7, by + 15);
    }
  }
  function polyPath(P) {
    const a = P.map(project);
    if (a.some((x) => !x)) return;
    octx.moveTo(a[0][0], a[0][1]);
    for (let i = 1; i < 4; i++) octx.lineTo(a[i][0], a[i][1]);
    octx.closePath();
  }
  function boxEdges(ci, col, lw) {
    const bb = ci.bb, c = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]].map((k) => project(M.pt(ci.m, [k[0] ? bb[3] : bb[0], k[1] ? bb[4] : bb[1], k[2] ? bb[5] : bb[2]])));
    if (c.some((x) => !x)) return;
    octx.strokeStyle = col;
    octx.lineWidth = lw || 1.8;
    octx.beginPath();
    [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => {
      octx.moveTo(c[a][0], c[a][1]);
      octx.lineTo(c[b][0], c[b][1]);
    });
    octx.stroke();
  }
  /* ───────── Selección con el ratón (rayos) ───────── */
  function pick(px, py) {
    const ray = rayAt(px, py);
    if (!ray) return null;
    let best = null;
    faces.forEach((f) => {
      [[0, 1, 2], [0, 2, 3]].forEach((tri) => {
        const h = rayTri(ray.o, ray.d, f.P[tri[0]], f.P[tri[1]], f.P[tri[2]]);
        if (h && (!best || h.t < best.t)) {
          const w0 = 1 - h.u - h.v;
          const ia = tri[0], ib = tri[1], ic2 = tri[2];
          const uu = f.U[ia][0] * w0 + f.U[ib][0] * h.u + f.U[ic2][0] * h.v, vv = f.U[ia][1] * w0 + f.U[ib][1] * h.u + f.U[ic2][1] * h.v;
          best = { t: h.t, f, u: uu, v: vv, pt: [ray.o[0] + ray.d[0] * h.t, ray.o[1] + ray.d[1] * h.t, ray.o[2] + ray.d[2] * h.t] };
        }
      });
    });
    return best;
  }
  /* UV de un punto 3D que está sobre alguna cara (para pintar en espejo) */
  function uvAtPoint(p) {
    let best = null, bd = 0.06;
    faces.forEach((f) => {
      const e1 = sub(f.P[1], f.P[0]), e2 = sub(f.P[3], f.P[0]), rel = sub(p, f.P[0]);
      const dist = Math.abs(dot(f.n, rel));
      if (dist > bd) return;
      const l1 = dot(e1, e1), l2 = dot(e2, e2);
      if (!l1 || !l2) return;
      const s = dot(rel, e1) / l1, t = dot(rel, e2) / l2;
      if (s < -0.001 || s > 1.001 || t < -0.001 || t > 1.001) return;
      bd = dist;
      const ux = f.U[0][0] + (f.U[1][0] - f.U[0][0]) * s, uy = f.U[0][1] + (f.U[3][1] - f.U[0][1]) * t;
      best = { f, u: ux, v: uy };
    });
    return best;
  }
  /* ───────── Encuadre y vistas ───────── */
  function modelBounds() {
    let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    faces.forEach((f) => f.P.forEach((p) => {
      for (let i = 0; i < 3; i++) {
        mn[i] = Math.min(mn[i], p[i]);
        mx[i] = Math.max(mx[i], p[i]);
      }
    }));
    return mn[0] > mx[0] ? null : { mn, mx };
  }
  function frameModel() {
    const bb = modelBounds();
    if (!bb) {
      S.cam = { yaw: 35, pitch: 22, dist: 70, tx: 0, ty: 12, tz: 0 };
    } else {
      const { mn, mx } = bb;
      const sz = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2], 8);
      S.cam.tx = (mn[0] + mx[0]) / 2;
      S.cam.ty = (mn[1] + mx[1]) / 2;
      S.cam.tz = (mn[2] + mx[2]) / 2;
      S.cam.dist = clamp(sz * 2.4, 20, 500);
    }
    requestDraw();
  }
  function setView(v) {
    const cur = S.cam;
    const t = { front: [0, 0], side: [90, 0], top: [0, 89], iso: [35, 22] }[v];
    if (!t) return;
    let [yaw, pitch] = t;
    if (Math.abs(cur.yaw - yaw) < 1 && Math.abs(cur.pitch - pitch) < 1 && v !== "iso") yaw += 180, pitch = v === "top" ? -89 : 0;
    S.cam.yaw = yaw;
    S.cam.pitch = pitch;
    requestDraw();
  }
  /* ───────── Selección ───────── */
  function select(bone, cube, add) {
    if (!bone) {
      S.sel = null;
      S.multi = [];
      S.face = null;
    } else if (add && S.sel) {
      const items = selItems(), k = cube || null;
      const idx = items.findIndex((s) => s.bone === bone && s.cube === k);
      if (idx >= 0) items.splice(idx, 1);
      else items.push({ bone, cube: k });
      S.sel = items[0] || null;
      S.multi = items.slice(1);
    } else {
      S.sel = { bone, cube: cube || null };
      S.multi = [];
    }
    if (!add) S.face = null;
    rebuild();
    refreshAll(true);
    FD.hooks.select.forEach((f) => f());
  }
  function selectAll() {
    const items = [];
    bones().forEach((b) => (b.cubes || []).forEach((c) => items.push({ bone: b, cube: c })));
    if (!items.length) return;
    S.sel = items[0];
    S.multi = items.slice(1);
    S.face = null;
    rebuild();
    refreshAll(true);
  }
  /* ───────── Crear / duplicar / borrar ───────── */
  function addBone() {
    const par = S.sel ? S.sel.bone : null;
    const b = { name: newBoneName("hueso"), pivot: par ? (par.pivot || [0, 0, 0]).slice() : [0, 0, 0] };
    if (par) b.parent = par.name;
    bones().push(b);
    S.sel = { bone: b, cube: null };
    S.multi = [];
    commit("Añadir hueso");
    toast("Hueso añadido");
  }
  function addCube() {
    let b = S.sel ? S.sel.bone : bones()[bones().length - 1];
    if (!b) {
      b = { name: "root", pivot: [0, 0, 0] };
      bones().push(b);
    }
    const base = S.sel && S.sel.cube ? S.sel.cube : null;
    const o = base ? base.origin.slice() : [-4, 0, -4];
    if (base) o[0] = round(o[0] + base.size[0]);
    const c = { origin: o, size: base ? base.size.slice() : [8, 8, 8], uv: [0, 0] };
    ensureCubes(b).push(c);
    S.sel = { bone: b, cube: c };
    S.multi = [];
    autoUV(c);
    commit("Añadir cubo");
  }
  const boxW = (c) => 2 * (Math.ceil(c.size[0]) + Math.ceil(c.size[2])), boxH = (c) => Math.ceil(c.size[1]) + Math.ceil(c.size[2]);
  /* coloca un cubo en el primer hueco libre de la textura */
  function autoUV(c) {
    const w = boxW(c), h = boxH(c);
    const used = [];
    bones().forEach((b) => (b.cubes || []).forEach((o) => {
      if (o !== c && Array.isArray(o.uv)) used.push([o.uv[0], o.uv[1], boxW(o), boxH(o)]);
    }));
    for (let v = 0; v + h <= S.texH; v++) for (let u = 0; u + w <= S.texW; u++) {
      if (!used.some((r) => u < r[0] + r[2] && u + w > r[0] && v < r[1] + r[3] && v + h > r[1])) {
        c.uv = [u, v];
        return true;
      }
    }
    c.uv = [0, 0];
    return false;
  }
  /* reparte todos los cubos de caja en estantes; devuelve la altura que necesita */
  function packBoxUV(apply) {
    const list = allCubes().filter((c) => Array.isArray(c.uv));
    list.sort((a, b) => boxH(b) - boxH(a) || boxW(b) - boxW(a));
    let x = 0, y = 0, rowH = 0, maxW = 0;
    const pos = [];
    list.forEach((c) => {
      const w = boxW(c), h = boxH(c);
      if (x + w > S.texW && x > 0) {
        x = 0;
        y += rowH;
        rowH = 0;
      }
      pos.push([c, x, y]);
      x += w;
      maxW = Math.max(maxW, x);
      rowH = Math.max(rowH, h);
    });
    const need = y + rowH;
    if (apply && need <= S.texH) pos.forEach(([c, u, v]) => {
      c.uv = [u, v];
    });
    return { need, width: Math.max(maxW, 1), fits: need <= S.texH, n: list.length };
  }
  function cloneCube(c, d) {
    const n = JSON.parse(JSON.stringify(c));
    n.origin = n.origin.map((v, i) => round(v + (d ? d[i] : 0)));
    if (n.pivot && d) n.pivot = n.pivot.map((v, i) => round(v + d[i]));
    return n;
  }
  function cloneBoneTree(src, parentName, d) {
    const all = [src].concat(descendants(src)), map = {}, used = new Set();
    all.forEach((b) => {
      let n, k = 1;
      do {
        n = b.name + "_" + k++;
      } while (boneByName(n) || used.has(n));
      used.add(n);
      map[b.name] = n;
    });
    return all.map((b) => {
      const n = JSON.parse(JSON.stringify(b));
      n.name = map[b.name];
      if (b === src) {
        if (parentName) n.parent = parentName;
        else delete n.parent;
      } else if (b.parent && map[b.parent]) n.parent = map[b.parent];
      if (d) {
        if (n.pivot) n.pivot = n.pivot.map((v, i) => round(v + d[i]));
        (n.cubes || []).forEach((c) => {
          c.origin = c.origin.map((v, i) => round(v + d[i]));
          if (c.pivot) c.pivot = c.pivot.map((v, i) => round(v + d[i]));
        });
      }
      return n;
    });
  }
  function dup() {
    const items = topItems();
    if (!items.length) return;
    const out = [];
    items.forEach((s) => {
      if (s.cube) {
        const c = cloneCube(s.cube, [2, 0, 0]);
        if (Array.isArray(c.uv)) c.uv = null;
        s.bone.cubes.push(c);
        if (c.uv === null) autoUV(c);
        out.push({ bone: s.bone, cube: c });
      } else {
        const copies = cloneBoneTree(s.bone, s.bone.parent, null);
        copies.forEach((n) => bones().push(n));
        out.push({ bone: copies[0], cube: null });
      }
    });
    S.sel = out[0];
    S.multi = out.slice(1);
    commit("Duplicar");
    toast(out.length > 1 ? out.length + " elementos duplicados" : "Duplicado");
  }
  function del() {
    const items = topItems();
    if (!items.length) return;
    const lastBone = items[0].bone;
    let par = null;
    items.forEach((s) => {
      if (s.cube) {
        const a = s.bone.cubes;
        const i = a.indexOf(s.cube);
        if (i >= 0) a.splice(i, 1);
      }
    });
    const bs = items.filter((s) => !s.cube).map((s) => s.bone);
    if (bs.length) {
      const rm = new Set();
      bs.forEach((b) => {
        rm.add(b);
        descendants(b).forEach((d) => rm.add(d));
      });
      par = bs[0].parent ? boneByName(bs[0].parent) : null;
      while (par && rm.has(par)) par = parentOf(par);
      G().obj.bones = bones().filter((x) => !rm.has(x));
    }
    S.multi = [];
    S.sel = par ? { bone: par, cube: null } : items[0].cube && bones().indexOf(lastBone) >= 0 ? { bone: lastBone, cube: null } : null;
    commit(items.length > 1 ? "Eliminar " + items.length + " elementos" : "Eliminar");
  }
  function moveBone(b, d) {
    [b].concat(descendants(b)).forEach((x) => {
      x.pivot = (x.pivot || [0, 0, 0]).map((v, i) => round(v + d[i]));
      (x.cubes || []).forEach((c) => {
        c.origin = c.origin.map((v, i) => round(v + d[i]));
        if (c.pivot) c.pivot = c.pivot.map((v, i) => round(v + d[i]));
      });
      Object.keys(x.locators || {}).forEach((k) => {
        if (Array.isArray(x.locators[k])) x.locators[k] = x.locators[k].map((v, i) => round(v + d[i]));
      });
    });
  }
  function moveCube(c, d) {
    c.origin = c.origin.map((v, i) => round(v + d[i]));
    if (c.pivot) c.pivot = c.pivot.map((v, i) => round(v + d[i]));
  }
  /* ───────── Simetría en X ───────── */
  const near = (a, b) => Math.abs(a - b) < 1e-3;
  function partnerCube(c) {
    const ex = -(c.origin[0] + c.size[0]);
    if (near(ex, c.origin[0])) return null;
    return allCubes().find((q) => q !== c && near(q.origin[0], ex) && near(q.origin[1], c.origin[1]) && near(q.origin[2], c.origin[2]) && near(q.size[0], c.size[0]) && near(q.size[1], c.size[1]) && near(q.size[2], c.size[2])) || null;
  }
  function partnerBone(b) {
    const p = b.pivot || [0, 0, 0];
    if (near(p[0], 0)) return null;
    return bones().find((q) => q !== b && q.pivot && near(q.pivot[0], -p[0]) && near(q.pivot[1], p[1]) && near(q.pivot[2], p[2])) || null;
  }
  function symSync(s, partner) {
    if (!partner) return;
    if (s.cube) {
      const c = s.cube, q = partner;
      q.origin = [round(-(c.origin[0] + c.size[0])), c.origin[1], c.origin[2]];
      q.size = c.size.slice();
      if (c.pivot) q.pivot = [round(-c.pivot[0]), c.pivot[1], c.pivot[2]];
      if (c.rotation) q.rotation = [c.rotation[0], -c.rotation[1], -c.rotation[2]];
      else delete q.rotation;
      if (c.inflate) q.inflate = c.inflate;
    } else {
      const b = s.bone, q = partner;
      q.rotation = b.rotation ? [b.rotation[0], -b.rotation[1], -b.rotation[2]] : void 0;
      if (!q.rotation) delete q.rotation;
    }
  }
  /* ───────── Cámara y puntero ───────── */
  const view = $("#view");
  const ptrs = new Map();
  let drag = null;
  function pos(e) {
    const r = view.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  function hitGizmo(p) {
    if (!gizmo || S.mode !== "edit" && S.mode !== "anim") return null;
    let best = null, bd = isTouch() ? 28 : 16;
    gizmo.hs.forEach((h) => {
      const d = Math.hypot(h.q[0] - p[0], h.q[1] - p[1]);
      if (d < bd) {
        bd = d;
        best = h;
      }
    });
    return best;
  }
  function orbitBy(d, p) {
    const dx = p[0] - d.p0[0], dy = p[1] - d.p0[1];
    S.cam.yaw = d.cam.yaw - dx * 0.4;
    S.cam.pitch = clamp(d.cam.pitch + dy * 0.4, -89, 89);
    if (d.mid) {
      S.cam.yaw = d.cam.yaw - (p[0] - d.mid[0]) * 0.4;
      S.cam.pitch = clamp(d.cam.pitch + (p[1] - d.mid[1]) * 0.4, -89, 89);
    }
  }
  function panBy(d, p) {
    const o = d.p0 || d.mid, dx = p[0] - o[0], dy = p[1] - o[1], yaw = d.cam.yaw * Math.PI / 180, pit = d.cam.pitch * Math.PI / 180, k = d.cam.dist * 0.9 / CH * (S.ortho ? 0.5 : 1);
    const rx = [-Math.cos(yaw), 0, -Math.sin(yaw)], ux = [-Math.sin(pit) * Math.sin(yaw), Math.cos(pit), Math.sin(pit) * Math.cos(yaw)];
    S.cam.tx = d.cam.tx - (rx[0] * dx - ux[0] * dy) * k * -1;
    S.cam.ty = d.cam.ty + ux[1] * dy * k * -1 * -1;
    S.cam.tz = d.cam.tz - (rx[2] * dx - ux[2] * dy) * k * -1;
  }
  view.addEventListener("contextmenu", (e) => e.preventDefault());
  view.addEventListener("pointerdown", (e) => {
    view.setPointerCapture(e.pointerId);
    const p = pos(e);
    ptrs.set(e.pointerId, p);
    S.hover = null;
    if (ptrs.size === 2) {
      const [a, b] = Array.from(ptrs.values());
      drag = { type: "multi", d0: Math.hypot(a[0] - b[0], a[1] - b[1]), dist0: S.cam.dist, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], cam: Object.assign({}, S.cam) };
      if (painted || paintLast) endStroke();
      return;
    }
    if (ptrs.size > 2) return;
    const right = e.button === 2, mid = e.button === 1;
    if (right || mid || e.altKey) {
      drag = { type: right || e.altKey ? "orbit" : "pan", p0: p, cam: Object.assign({}, S.cam), rc: right && !e.altKey, moved: false };
      if (mid) drag.type = "pan";
      if (right && e.shiftKey) drag.type = "pan";
      return;
    }
    if (S.mode === "paint") {
      const h = pick(p[0], p[1]);
      if (h) {
        drag = { type: "paint", first: true };
        paintHit(h, true);
        drag.first = false;
      } else drag = { type: "orbit", p0: p, cam: Object.assign({}, S.cam) };
      return;
    }
    const g = hitGizmo(p);
    if (g) {
      const items = topItems();
      drag = { type: "gizmo", h: g, p0: p, last: p, acc: 0, tool: S.tool, moved: false, items, partners: [] };
      if (S.sym && S.sel) {
        const s = S.sel;
        drag.partner = s.cube ? partnerCube(s.cube) : partnerBone(s.bone);
      }
      return;
    }
    drag = { type: "tap", p0: p, cam: Object.assign({}, S.cam), moved: false, add: e.shiftKey || e.ctrlKey || e.metaKey, marq: e.shiftKey && S.mode === "edit" };
  });
  view.addEventListener("pointermove", (e) => {
    const p = pos(e);
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, p);
    if (!drag) {
      updateCursor(p);
      return;
    }
    if (drag.type === "multi" && ptrs.size >= 2) {
      const [a, b] = Array.from(ptrs.values());
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      S.cam.dist = clamp(drag.dist0 * drag.d0 / Math.max(d, 1), 4, 800);
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (S.mode === "paint") orbitBy(drag, mid);
      else panBy(drag, mid);
      requestDraw();
      return;
    }
    if (drag.rc && Math.hypot(p[0] - drag.p0[0], p[1] - drag.p0[1]) > 4) drag.moved = true;
    if (drag.type === "orbit") {
      orbitBy(drag, p);
      requestDraw();
    } else if (drag.type === "pan") {
      panBy(drag, p);
      requestDraw();
    } else if (drag.type === "tap") {
      if (Math.hypot(p[0] - drag.p0[0], p[1] - drag.p0[1]) > 5) {
        drag.moved = true;
        drag.type = drag.marq ? "marquee" : "orbit";
      }
    }
    if (drag.type === "marquee") {
      marquee = [Math.min(drag.p0[0], p[0]), Math.min(drag.p0[1], p[1]), Math.max(drag.p0[0], p[0]), Math.max(drag.p0[1], p[1])];
      requestDraw();
    } else if (drag.type === "paint") {
      const h = pick(p[0], p[1]);
      if (h) paintHit(h, false);
      else {
        paintLast = null;
        paintLast2 = null;
      }
    } else if (drag.type === "gizmo") gizmoDrag(p);
  });
  function updateCursor(p) {
    if (S.mode === "paint") {
      view.style.cursor = "crosshair";
      return;
    }
    const g = hitGizmo(p);
    const hi = g ? g.i : -1;
    if (hi !== gizHover) {
      gizHover = hi;
      requestDraw();
    }
    view.style.cursor = g ? "grab" : "default";
    if (!g && !isTouch() && (S.mode === "edit" || S.mode === "uv") && !hoverQ) hoverQ = requestAnimationFrame(() => {
      hoverQ = 0;
      const h = pick(p[0], p[1]);
      const c = h ? h.f.c : null;
      if (c !== S.hover) {
        S.hover = c;
        requestDraw();
      }
    });
  }
  let hoverQ = 0;
  view.addEventListener("pointerleave", () => {
    if (S.hover) {
      S.hover = null;
      requestDraw();
    }
  });
  function gizmoDrag(p) {
    const d = drag, h = d.h;
    d.moved = true;
    const dx = p[0] - d.last[0], dy = p[1] - d.last[1];
    d.last = p;
    const proj = dx * h.dirScreen[0] + dy * h.dirScreen[1];
    const ppu = h.len / h.unit;
    const sel = S.sel;
    if (!sel) return;
    const i = h.i;
    if (S.mode === "anim") {
      if (FD.animDrag) FD.animDrag(d.tool, i, proj, ppu);
      return;
    }
    const AX = ["X", "Y", "Z"][i];
    if (d.tool === "move") {
      d.acc += proj / ppu;
      const step = S.snap || 0.01;
      const n = S.snap ? Math.trunc(d.acc / step) : 0;
      const amt = S.snap ? n * step : d.acc;
      if (!amt) return;
      d.acc -= amt;
      d.total = round((d.total || 0) + amt);
      const v = [0, 0, 0];
      v[i] = amt;
      d.items.forEach((s) => {
        if (s.cube) moveCube(s.cube, v);
        else moveBone(s.bone, v);
      });
      if (d.partner) {
        const mv = [-v[0], v[1], v[2]];
        if (sel.cube) moveCube(d.partner, mv);
        else moveBone(d.partner, mv);
      }
      dragLabel = AX + " " + (d.total > 0 ? "+" : "") + d.total;
    } else if (d.tool === "rotate") {
      d.acc += proj * 0.7;
      const step = S.snap ? 5 : 0.5;
      const n = Math.trunc(d.acc / step);
      if (!n) return;
      d.acc -= n * step;
      const t = sel.cube || sel.bone;
      const r = (t.rotation || [0, 0, 0]).slice();
      r[i] = round(r[i] + n * step, 2);
      t.rotation = r;
      if (sel.cube && !sel.cube.pivot) sel.cube.pivot = sel.cube.origin.map((o, k) => o + sel.cube.size[k] / 2);
      if (d.partner) symSync(sel, d.partner);
      dragLabel = "Rot " + AX + " " + r[i] + "°";
    } else if (d.tool === "scale") {
      if (!sel.cube) return;
      d.acc += proj / ppu;
      const step = S.snap || 0.1;
      const n = Math.trunc(d.acc / step);
      if (!n) return;
      d.acc -= n * step;
      const s = sel.cube.size.slice();
      s[i] = Math.max(0, round(s[i] + n * step));
      sel.cube.size = s;
      if (d.partner) symSync(sel, d.partner);
      dragLabel = "Tamaño " + s.join(" × ");
    }
    rebuild();
    refreshProps();
    requestDraw();
  }
  view.addEventListener("pointerup", (e) => finish(e));
  view.addEventListener("pointercancel", (e) => finish(e));
  function finish(e) {
    const p = pos(e);
    ptrs.delete(e.pointerId);
    const d = drag;
    if (ptrs.size === 0) drag = null;
    else if (ptrs.size === 1 && d && d.type === "multi") drag = null;
    dragLabel = "";
    marquee = null;
    if (!d) return;
    if (d.type === "paint") endStroke();
    else if (d.type === "gizmo") {
      if (d.moved) {
        pushHist(S.mode === "anim" ? "Pose" : d.tool === "move" ? "Mover" : d.tool === "rotate" ? "Rotar" : "Cambiar tamaño");
        markDirty();
        refreshAll();
      } else requestDraw();
    } else if (d.type === "marquee") {
      const r = [Math.min(d.p0[0], p[0]), Math.min(d.p0[1], p[1]), Math.max(d.p0[0], p[0]), Math.max(d.p0[1], p[1])];
      const hit = [];
      cubeInfo.forEach((ci) => {
        if (ci.hidden) return;
        const q = project(M.pt(ci.m, [(ci.bb[0] + ci.bb[3]) / 2, (ci.bb[1] + ci.bb[4]) / 2, (ci.bb[2] + ci.bb[5]) / 2]));
        if (q && q[0] >= r[0] && q[0] <= r[2] && q[1] >= r[1] && q[1] <= r[3]) hit.push({ bone: ci.b, cube: ci.c });
      });
      if (hit.length) {
        const keep = d.add ? selItems().filter((s) => !hit.some((h) => h.cube === s.cube && h.bone === s.bone)) : [];
        const all = keep.concat(hit);
        S.sel = all[0];
        S.multi = all.slice(1);
        S.face = null;
        rebuild();
        refreshAll(true);
        toast(all.length + " cubos seleccionados");
      } else requestDraw();
    } else if (d.type === "tap" && !d.moved && ptrs.size === 0) {
      const h = pick(p[0], p[1]);
      if (h) {
        select(h.f.b, h.f.c, d.add);
        if (!d.add) {
          S.face = h.f.fn;
          rebuild();
          requestDraw();
          if (S.mode === "uv") drawUV();
        }
      } else if (S.mode === "edit" && !d.add) select(null);
    } else if (d.rc && !d.moved && ptrs.size === 0) {
      const h = pick(p[0], p[1]);
      if (h && !isSelCube(h.f.c)) select(h.f.b, h.f.c);
      else if (!h) select(null);
      FD.openCtx(e.clientX, e.clientY, !!h);
    }
  }
  view.addEventListener("wheel", (e) => {
    e.preventDefault();
    S.cam.dist = clamp(S.cam.dist * Math.pow(1.0015, e.deltaY), 3, 800);
    requestDraw();
  }, { passive: false });
  /* ───────── Pintura ───────── */
  function stamp(x, y, erase) {
    const b = S.brush, x0 = Math.round(x - b / 2 + (b % 2 ? 0.5 : 0)), y0 = Math.round(y - b / 2 + (b % 2 ? 0.5 : 0));
    if (erase) tctx.clearRect(x0, y0, b, b);
    else {
      tctx.fillStyle = S.color;
      tctx.fillRect(x0, y0, b, b);
    }
  }
  function strokeLine(a, b, erase) {
    const n = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]), 1);
    for (let i = 0; i <= n; i++) stamp(Math.floor(a[0] + (b[0] - a[0]) * i / n), Math.floor(a[1] + (b[1] - a[1]) * i / n), erase);
  }
  function flood(x, y, rect) {
    x = Math.floor(x);
    y = Math.floor(y);
    const w = tex.width, h = tex.height;
    const [rx0, ry0, rx1, ry1] = rect || [0, 0, w, h];
    if (x < rx0 || y < ry0 || x >= rx1 || y >= ry1 || x < 0 || y < 0 || x >= w || y >= h) return;
    const img = tctx.getImageData(0, 0, w, h), d = img.data, i0 = (y * w + x) * 4, tg = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]], c = hexRGBn(S.color);
    if (tg[0] === c[0] && tg[1] === c[1] && tg[2] === c[2] && tg[3] === 255) return;
    const same = (i) => d[i] === tg[0] && d[i + 1] === tg[1] && d[i + 2] === tg[2] && d[i + 3] === tg[3];
    const st = [[x, y]];
    while (st.length) {
      const [px, py] = st.pop();
      if (px < rx0 || py < ry0 || px >= rx1 || py >= ry1) continue;
      const i = (py * w + px) * 4;
      if (!same(i)) continue;
      d[i] = c[0];
      d[i + 1] = c[1];
      d[i + 2] = c[2];
      d[i + 3] = 255;
      st.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
    }
    tctx.putImageData(img, 0, 0);
  }
  function faceRectPx(f) {
    const x0 = Math.min(f.U[0][0], f.U[1][0]) * tex.width, x1 = Math.max(f.U[0][0], f.U[1][0]) * tex.width, y0 = Math.min(f.U[0][1], f.U[2][1]) * tex.height, y1 = Math.max(f.U[0][1], f.U[2][1]) * tex.height;
    return [Math.floor(x0 + 1e-6), Math.floor(y0 + 1e-6), Math.ceil(x1 - 1e-6), Math.ceil(y1 - 1e-6)];
  }
  function pickColor(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= tex.width || y >= tex.height) return;
    const d = tctx.getImageData(x, y, 1, 1).data;
    if (!d[3]) {
      toast("Píxel transparente");
      return;
    }
    setColor(rgbHex(d[0], d[1], d[2]));
  }
  let paintLast = null, paintLast2 = null, painted = false;
  function paintPx(px, py, first, rect) {
    const p = [Math.floor(px), Math.floor(py)];
    if (S.ptool === "picker") {
      if (first) pickColor(px, py);
      return;
    }
    if (S.ptool === "bucket") {
      if (first) {
        flood(px, py, rect);
        painted = true;
        texChanged();
      }
      return;
    }
    if (paintLast) strokeLine(paintLast, p, S.ptool === "eraser");
    else stamp(p[0], p[1], S.ptool === "eraser");
    paintLast = p;
    painted = true;
    texChanged();
  }
  /* pintar sobre el modelo 3D (con espejo opcional) */
  function paintHit(h, first) {
    const px = h.u * tex.width, py = h.v * tex.height;
    if (S.ptool === "face") {
      if (first) {
        const r = faceRectPx(h.f);
        tctx.fillStyle = S.color;
        tctx.fillRect(r[0], r[1], r[2] - r[0], r[3] - r[1]);
        painted = true;
        texChanged();
      }
      return;
    }
    paintPx(px, py, first, S.ptool === "bucket" ? faceRectPx(h.f) : null);
    if (S.paintMir && S.ptool !== "picker") {
      const m = uvAtPoint([-h.pt[0], h.pt[1], h.pt[2]]);
      if (m) {
        const qx = Math.floor(m.u * tex.width), qy = Math.floor(m.v * tex.height);
        if (S.ptool === "bucket") {
          if (first) flood(qx, qy, faceRectPx(m.f));
        } else if (S.ptool === "face") {
        } else {
          if (paintLast2 && Math.hypot(paintLast2[0] - qx, paintLast2[1] - qy) < 10) strokeLine(paintLast2, [qx, qy], S.ptool === "eraser");
          else stamp(qx, qy, S.ptool === "eraser");
          paintLast2 = [qx, qy];
        }
        texChanged();
      }
    }
  }
  function texChanged() {
    S.texDirty = true;
    uploadTex();
    drawUV();
  }
  const recent = (function() {
    try {
      return JSON.parse(localStorage.getItem("fd_recent_colors") || "[]");
    } catch (e) {
      return [];
    }
  })();
  function addRecent(c) {
    const i = recent.indexOf(c);
    if (i >= 0) recent.splice(i, 1);
    recent.unshift(c);
    recent.length = Math.min(recent.length, 16);
    try {
      localStorage.setItem("fd_recent_colors", JSON.stringify(recent));
    } catch (e) {
    }
    renderRecent();
  }
  function endStroke() {
    paintLast = null;
    paintLast2 = null;
    if (painted) {
      painted = false;
      const t = TX.active;
      t.snap = t.cur = snapOf(t);
      pushHist(S.ptool === "bucket" || S.ptool === "face" ? "Rellenar" : "Pintar");
      markDirty();
      addRecent(S.color);
      fillTexSel();
      FD.hooks.refresh.forEach((f) => f("texpaint"));
    }
  }
  /* aplica a la textura (activa) un color base por cada cara de cada cubo */
  function paintBaseColors(shaded, onlyEmpty) {
    const t = TX.active;
    if (!t) return 0;
    const sx = t.canvas.width / S.texW, sy = t.canvas.height / S.texH;
    const SH = { up: 0.12, down: -0.16, north: 0, south: -0.05, east: -0.08, west: 0.05 };
    let n = 0;
    bones().forEach((b) => (b.cubes || []).forEach((c) => {
      const base = cubeColor(b, c), uvs = faceUVs(c);
      FACE_NAMES.forEach((fn) => {
        const r = uvs[fn];
        if (!r) return;
        const x0 = Math.floor(Math.min(r[0], r[2]) * sx + 1e-6), x1 = Math.ceil(Math.max(r[0], r[2]) * sx - 1e-6), y0 = Math.floor(Math.min(r[1], r[3]) * sy + 1e-6), y1 = Math.ceil(Math.max(r[1], r[3]) * sy - 1e-6);
        const w = x1 - x0, h = y1 - y0;
        if (w <= 0 || h <= 0 || x1 < 0 || y1 < 0 || x0 >= t.canvas.width || y0 >= t.canvas.height) return;
        if (onlyEmpty) {
          const d = t.ctx.getImageData(Math.max(0, x0), Math.max(0, y0), Math.min(w, t.canvas.width - x0), Math.min(h, t.canvas.height - y0)).data;
          let any = false;
          for (let i = 3; i < d.length; i += 4) if (d[i]) {
            any = true;
            break;
          }
          if (any) return;
        }
        t.ctx.fillStyle = shaded ? tint(base, SH[fn] || 0) : base;
        t.ctx.fillRect(x0, y0, w, h);
        n++;
      });
    }));
    return n;
  }
  /* ───────── Refrescos generales ───────── */
  function refreshAll(selChange) {
    renderOutliner();
    refreshProps();
    updToolsState();
    drawUV();
    status();
    requestDraw();
    FD.hooks.refresh.forEach((f) => f("all"));
  }
  function status() {
    const g = G();
    if (!g) return;
    let nb = bones().length, nc = 0;
    bones().forEach((b) => {
      nc += (b.cubes || []).length;
    });
    const bb = modelBounds();
    const dim = bb ? [bb.mx[0] - bb.mn[0], bb.mx[1] - bb.mn[1], bb.mx[2] - bb.mn[2]].map((v) => round(v, 2)).join("×") : "—";
    const n = selItems().length;
    const tx = TX.active ? tex.width + "×" + tex.height : "—";
    $("#status").innerHTML = "<span>" + esc(geoName(g)) + "</span><span>" + nb + " huesos · " + nc + " cubos</span><span title='Tamaño del modelo en unidades'>Medidas " + dim + "</span><span>Textura " + (S.texW === tex.width && S.texH === tex.height ? tx : "modelo " + S.texW + "×" + S.texH + " · imagen " + tx) + "</span><span class='grow'></span><span>" + (n > 1 ? n + " seleccionados" : S.sel ? (S.sel.cube ? "Cubo en " : "Hueso ") + esc(S.sel.bone.name) : "Nada seleccionado") + "</span>";
    $("#outCount").textContent = nb + "·" + nc;
    const vi = $("#vinfo");
    if (S.sel && S.mode !== "anim") {
      const c = S.sel.cube;
      vi.innerHTML = c ? "<b>" + esc(S.sel.bone.name) + "</b> origen " + c.origin.map((v) => round(v, 2)).join(", ") + " · tamaño " + c.size.map((v) => round(v, 2)).join("×") : "<b>" + esc(S.sel.bone.name) + "</b> pivote " + (S.sel.bone.pivot || [0, 0, 0]).map((v) => round(v, 2)).join(", ");
      vi.hidden = false;
    } else vi.hidden = true;
  }
  function updToolsState() {
    const has = !!S.sel;
    ["dupBtn", "delBtn", "mirBtn"].forEach((id) => {
      $("#" + id).classList.toggle("dis", !has);
    });
    $("#symBtn").classList.toggle("on", S.sym);
    $("#paintMirBtn").classList.toggle("on", S.paintMir);
    $("#gridBtn").classList.toggle("on", S.grid);
    $("#wireBtn").classList.toggle("on", S.wire);
    $("#skelBtn").classList.toggle("on", S.skel);
    $("#refBtn").classList.toggle("on", S.ref);
  }
  /* ───────── Esquema (árbol de huesos y cubos) ───────── */
  let outFilter = "";
  function renderOutliner() {
    const box = $("#outliner");
    const all = bones();
    if (!all.length) {
      box.innerHTML = '<div class="empty">' + ic("cube") + "<b>Modelo vacío</b><span>Pulsa «Hueso» o «Cubo» para empezar.</span></div>";
      hydrateIcons(box);
      return;
    }
    const out = [];
    const seen = new Set();
    const f = outFilter.trim().toLowerCase();
    const matches = (b) => !f || b.name.toLowerCase().indexOf(f) >= 0 || descendants(b).some((d) => d.name.toLowerCase().indexOf(f) >= 0);
    function row(b, depth) {
      if (seen.has(b)) return;
      seen.add(b);
      if (!matches(b)) return;
      const kids = childrenOf(b), cubes = b.cubes || [], col = S.collapsed.has(b) && !f, hid = S.hidden.has(b);
      const selB = isSelBone(b);
      out.push('<div class="row bone' + (selB ? " sel" : "") + (hid ? " hid" : "") + '" draggable="true" data-b="' + all.indexOf(b) + '" style="padding-left:' + (6 + depth * 14) + 'px"><span class="car" data-car>' + (kids.length || cubes.length ? ic(col ? "chev" : "chevd") : "") + '</span><span class="sw" data-bcolor style="background:' + boneColor(b) + '" title="Color del hueso"></span><span class="nm">' + esc(b.name) + '</span><span class="cnt">' + (cubes.length || "") + '</span><span class="eye" data-eye title="Mostrar / ocultar">' + ic(hid ? "eyeoff" : "eye") + "</span></div>");
      if (!col) {
        cubes.forEach((c, ci) => {
          const sc = isSelCube(c), ch = S.hidden.has(c);
          out.push('<div class="row cube' + (sc ? " sel" : "") + (ch ? " hid" : "") + '" draggable="true" data-b="' + all.indexOf(b) + '" data-c="' + ci + '" style="padding-left:' + (30 + depth * 14) + 'px"><span class="sw sq" data-ccolor style="background:' + cubeColor(b, c) + '" title="Color del cubo"></span><span class="nm">Cubo ' + (ci + 1) + ' <small>' + (c.size || []).map((v) => round(v, 2)).join("×") + '</small></span><span class="eye" data-eye title="Mostrar / ocultar">' + ic(ch ? "eyeoff" : "eye") + "</span></div>");
        });
        kids.forEach((k) => row(k, depth + 1));
      }
    }
    all.filter((b) => !b.parent || !boneByName(b.parent)).forEach((b) => row(b, 0));
    all.forEach((b) => {
      if (!seen.has(b)) row(b, 0);
    });
    const filt = all.length > 7 ? '<div class="ofilter">' + ic("search") + '<input id="outFilter" placeholder="Buscar hueso…" value="' + esc(outFilter) + '"></div>' : "";
    box.innerHTML = filt + (out.join("") || '<div class="empty"><span>Sin resultados</span></div>');
    hydrateIcons(box);
    const fi = $("#outFilter");
    if (fi) fi.oninput = () => {
      outFilter = fi.value;
      const p = fi.selectionStart;
      renderOutliner();
      const n = $("#outFilter");
      n.focus();
      n.setSelectionRange(p, p);
    };
    const s = box.querySelector(".sel");
    if (s && s.scrollIntoView && !drag) s.scrollIntoView({ block: "nearest" });
  }
  const outEl = $("#outliner");
  function rowTarget(r) {
    const b = bones()[+r.dataset.b];
    const c = r.dataset.c != null ? b.cubes[+r.dataset.c] : null;
    return { b, c };
  }
  outEl.addEventListener("click", (e) => {
    const r = e.target.closest(".row");
    if (!r) return;
    const { b, c } = rowTarget(r);
    if (e.target.closest("[data-eye]")) {
      const t = c || b;
      if (S.hidden.has(t)) S.hidden.delete(t);
      else S.hidden.add(t);
      rebuild();
      renderOutliner();
      requestDraw();
      return;
    }
    if (e.target.closest("[data-car]")) {
      if (S.collapsed.has(b)) S.collapsed.delete(b);
      else S.collapsed.add(b);
      renderOutliner();
      return;
    }
    if (e.target.closest("[data-bcolor],[data-ccolor]") && !e.shiftKey) {
      select(b, c);
      pickColorFor(e.target.closest(".sw"), c ? [c] : null, c ? null : b);
      return;
    }
    select(b, c, e.shiftKey || e.ctrlKey || e.metaKey);
  });
  outEl.addEventListener("dblclick", (e) => {
    const nm = e.target.closest(".nm");
    const r = e.target.closest(".row.bone");
    if (!nm || !r) return;
    renameBoneInline(nm, bones()[+r.dataset.b]);
  });
  function renameBoneInline(el, b) {
    const inp = document.createElement("input");
    inp.className = "txt inl";
    inp.value = b.name;
    el.replaceWith(inp);
    inp.focus();
    inp.select();
    let done = false;
    const fin = (ok) => {
      if (done) return;
      done = true;
      if (ok) renameBone(b, inp.value.trim());
      else renderOutliner();
    };
    inp.onkeydown = (e) => {
      e.stopPropagation();
      if (e.key === "Enter") fin(true);
      else if (e.key === "Escape") fin(false);
    };
    inp.onblur = () => fin(true);
  }
  function renameBone(b, nn) {
    if (!nn || nn === b.name) return renderOutliner();
    if (boneByName(nn)) {
      toast("Ya existe un hueso con ese nombre", 2500, "bad");
      return renderOutliner();
    }
    bones().forEach((x) => {
      if (x.parent === b.name) x.parent = nn;
    });
    if (FD.renameBone) FD.renameBone(b.name, nn);
    b.name = nn;
    commit("Renombrar hueso");
  }
  outEl.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    const r = e.target.closest(".row");
    if (r) {
      const { b, c } = rowTarget(r);
      if (!(c ? isSelCube(c) : isSelBone(b))) select(b, c);
    }
    FD.openCtx(e.clientX, e.clientY, !!r);
  });
  /* arrastrar y soltar para cambiar de padre / mover cubos entre huesos */
  let dragRow = null;
  outEl.addEventListener("dragstart", (e) => {
    const r = e.target.closest(".row");
    if (!r) return;
    dragRow = rowTarget(r);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", "fd-row");
    } catch (er) {
    }
  });
  outEl.addEventListener("dragover", (e) => {
    if (!dragRow) return;
    const r = e.target.closest(".row.bone");
    $$(".row.drop", outEl).forEach((x) => x.classList.remove("drop"));
    if (r) {
      const tg = bones()[+r.dataset.b];
      if (dragRow.c || tg !== dragRow.b && descendants(dragRow.b).indexOf(tg) < 0) {
        e.preventDefault();
        r.classList.add("drop");
      }
    } else if (!dragRow.c) e.preventDefault();
  });
  outEl.addEventListener("dragleave", (e) => {
    if (!e.relatedTarget || !outEl.contains(e.relatedTarget)) $$(".row.drop", outEl).forEach((x) => x.classList.remove("drop"));
  });
  outEl.addEventListener("drop", (e) => {
    if (!dragRow) return;
    e.preventDefault();
    const r = e.target.closest(".row.bone");
    const tg = r ? bones()[+r.dataset.b] : null;
    const d = dragRow;
    dragRow = null;
    $$(".row.drop", outEl).forEach((x) => x.classList.remove("drop"));
    if (d.c) {
      if (!tg || tg === d.b) return;
      d.b.cubes.splice(d.b.cubes.indexOf(d.c), 1);
      ensureCubes(tg).push(d.c);
      S.sel = { bone: tg, cube: d.c };
      S.multi = [];
      commit("Mover cubo a «" + tg.name + "»");
    } else {
      if (tg === d.b || tg && descendants(d.b).indexOf(tg) >= 0) return;
      if (tg) d.b.parent = tg.name;
      else delete d.b.parent;
      commit("Cambiar padre de «" + d.b.name + "»");
    }
  });
  outEl.addEventListener("dragend", () => {
    dragRow = null;
    $$(".row.drop", outEl).forEach((x) => x.classList.remove("drop"));
  });
  /* ───────── Selector de color (hueso / cubos) ───────── */
  function pickColorFor(anchor, cubes, bone) {
    const cur = bone ? boneColor(bone) : cubeColor(boneOfCube(cubes[0]), cubes[0]);
    const r = anchor.getBoundingClientRect();
    $$(".ctx").forEach((x) => x.remove());
    const m = document.createElement("div");
    m.className = "ctx colorpop";
    m.innerHTML = '<div class="swgrid">' + COLORS.map((k) => '<button class="sw big" data-c="' + k + '" style="background:' + k + (k === cur ? ";outline:2px solid #fff" : "") + '"></button>').join("") + '</div><div class="cprow"><input type="color" id="cpCustom" value="' + cur + '"><button class="btn sm" data-act="reset">' + (bone ? "Automático" : "Heredar del hueso") + '</button></div>' + (bone ? '<button class="btn sm wide" data-act="cubes">Aplicar a todos sus cubos</button>' : "");
    document.body.appendChild(m);
    const rr = m.getBoundingClientRect();
    m.style.left = Math.max(6, Math.min(r.left, innerWidth - rr.width - 6)) + "px";
    m.style.top = Math.max(6, Math.min(r.bottom + 6, innerHeight - rr.height - 6)) + "px";
    const apply = (hex) => {
      if (bone) boneUser.set(bone, hex);
      else cubes.forEach((c) => userColor.set(c, hex));
      commit("Color");
    };
    const kill = (e) => {
      if (e && m.contains(e.target)) return;
      m.remove();
      document.removeEventListener("pointerdown", kill, true);
    };
    setTimeout(() => document.addEventListener("pointerdown", kill, true), 0);
    m.addEventListener("click", (e) => {
      const b = e.target.closest("[data-c]");
      if (b) {
        apply(b.dataset.c);
        m.remove();
        return;
      }
      const a = e.target.closest("[data-act]");
      if (!a) return;
      if (a.dataset.act === "reset") {
        if (bone) boneUser.delete(bone);
        else cubes.forEach((c) => userColor.delete(c));
        commit("Color");
      } else if (a.dataset.act === "cubes") {
        (bone.cubes || []).forEach((c) => userColor.delete(c));
        commit("Color de cubos");
      }
      m.remove();
    });
    m.querySelector("#cpCustom").onchange = (e) => {
      apply(e.target.value);
      m.remove();
    };
  }
  /* ───────── Panel de propiedades ───────── */
  function fld(label, cls, val, attrs) {
    return '<label class="fld"><span class="' + cls + '" data-scrub>' + label + '</span><input type="number" inputmode="decimal" step="any" value="' + (val == null ? "" : round(val, 3)) + '" ' + (attrs || "") + "></label>";
  }
  function vec3(title, key, arr, hint) {
    arr = arr || [0, 0, 0];
    return '<div class="grp"><h4>' + title + (hint ? '<small title="' + esc(hint) + '">' + ic("help") + "</small>" : "") + '</h4><div class="f3" data-vec="' + key + '">' + fld("X", "x", arr[0], 'data-k="0"') + fld("Y", "y", arr[1], 'data-k="1"') + fld("Z", "z", arr[2], 'data-k="2"') + "</div></div>";
  }
  function colorRow(cur, own) {
    return '<div class="grp"><h4>Color' + (own ? "" : '<small class="auto">auto</small>') + '</h4><div class="swc" id="cswatch">' + COLORS.map((k) => '<button class="sw big" data-c="' + k + '" style="background:' + k + (cur === k ? ";outline:2px solid #fff" : "") + '"></button>').join("") + '<input type="color" id="ccustom" value="' + cur + '" title="Color personalizado"></div></div>';
  }
  function geoStats() {
    let nc = 0, nf = 0;
    faces.forEach(() => nf++);
    bones().forEach((b) => {
      nc += (b.cubes || []).length;
    });
    return { nb: bones().length, nc, nf };
  }
  function refreshProps() {
    const box = $("#props"), t = $("#propsTitle");
    const g = G();
    if (S.mode === "anim" && S.sel && FD.animProps) {
      FD.animProps(box, t);
      return;
    }
    if (!S.sel) {
      t.textContent = "Modelo";
      const st = geoStats(), d = g.obj.description || {};
      const bnd = !g.legacy;
      box.innerHTML = '<div class="grp"><h4>Geometría</h4>' + (S.geos.length > 1 ? '<select id="geoSel">' + S.geos.map((x, i) => '<option value="' + i + '"' + (i === S.gi ? " selected" : "") + ">" + esc(geoName(x)) + "</option>").join("") + '</select><div style="height:6px"></div>' : "") + (g.legacy ? '<div class="note warn">' + ic("alert") + '<span>Formato antiguo (1.8).</span><button class="btn sm" id="toNew">Convertir a 1.12</button></div>' : '<input class="txt" id="geoId" value="' + esc(geoName(g)) + '" spellcheck="false">') + '</div><div class="grp"><h4>Tamaño de textura del modelo</h4><div class="f2">' + fld("W", "n", S.texW, 'id="texW"') + fld("H", "n", S.texH, 'id="texH"') + '</div><div class="hint">Las coordenadas UV usan estas unidades. Si tu imagen es de mayor resolución, se escala sola.</div></div>' + (bnd ? '<div class="grp"><h4>Límites visibles<button class="btn xs" id="bndAuto" title="Calcular según el modelo">Auto</button></h4><div class="f2">' + fld("Ancho", "n", d.visible_bounds_width, 'id="bndW"') + fld("Alto", "n", d.visible_bounds_height, 'id="bndH"') + '</div><div class="f3" data-vec="bndOff">' + fld("X", "x", (d.visible_bounds_offset || [0, 0, 0])[0], 'data-k="0"') + fld("Y", "y", (d.visible_bounds_offset || [0, 0, 0])[1], 'data-k="1"') + fld("Z", "z", (d.visible_bounds_offset || [0, 0, 0])[2], 'data-k="2"') + '</div><div class="hint">Si el modelo se sale de esta caja, el juego deja de dibujarlo al mirar hacia otro lado.</div></div>' : "") + '<div class="grp stats"><div><b>' + st.nb + "</b><span>huesos</span></div><div><b>" + st.nc + "</b><span>cubos</span></div><div><b>" + st.nf + "</b><span>caras</span></div></div>" + '<div class="hint pad">Toca un cubo o un hueso para editarlo. Con <kbd>Shift</kbd> seleccionas varios.</div>';
      const gs = $("#geoSel");
      if (gs) gs.onchange = () => {
        S.gi = +gs.value;
        S.sel = null;
        S.multi = [];
        readDims();
        rebuild();
        refreshAll();
      };
      const gi = $("#geoId");
      if (gi) gi.onchange = () => {
        let v = gi.value.trim() || "geometry.modelo";
        if (!/^geometry\./.test(v)) v = "geometry." + v.replace(/^geometry\.?/, "");
        g.obj.description.identifier = v;
        commit("Identificador");
      };
      const tn = $("#toNew");
      if (tn) tn.onclick = () => FD.act.toNewFormat();
      ["texW", "texH"].forEach((id) => {
        const el = $("#" + id);
        el.onchange = () => {
          const v = clamp(Math.round(+el.value) || 64, 1, 4096);
          if (id === "texW") S.texW = v;
          else S.texH = v;
          writeDims();
          commit("Tamaño de textura");
        };
      });
      const ba = $("#bndAuto");
      if (ba) ba.onclick = () => FD.act.autoBounds();
      if (bnd) {
        const sb = (k, v) => {
          g.obj.description[k] = v;
          commit("Límites visibles");
        };
        $("#bndW").onchange = (e) => sb("visible_bounds_width", Math.max(0, +e.target.value || 0));
        $("#bndH").onchange = (e) => sb("visible_bounds_height", Math.max(0, +e.target.value || 0));
        $$('[data-vec="bndOff"] input', box).forEach((inp) => {
          inp.onchange = () => {
            const o = (g.obj.description.visible_bounds_offset || [0, 0, 0]).slice();
            o[+inp.dataset.k] = +inp.value || 0;
            sb("visible_bounds_offset", o);
          };
        });
      }
      bindScrub(box);
      return;
    }
    if (S.multi.length) {
      t.textContent = selItems().length + " elementos";
      const nCubes = selItems().filter((s) => s.cube).length;
      box.innerHTML = '<div class="grp"><h4>Selección múltiple</h4><div class="sub">' + nCubes + " cubos y " + (selItems().length - nCubes) + ' huesos. Mover con las flechas o el gizmo afecta a todos.</div></div>' + colorRow(cubeColor(S.sel.bone, S.sel.cube || S.sel.bone.cubes && S.sel.bone.cubes[0] || {}) || "#8577f8", true) + '<div class="grp"><h4>Acciones</h4><div class="btnrow"><button class="btn" id="mDup">' + ic("copy") + 'Duplicar</button><button class="btn" id="mMir">' + ic("mirror") + 'Espejo</button><button class="btn" id="mGrp">' + ic("group") + 'Agrupar</button><button class="btn danger" id="mDel">' + ic("trash") + "Borrar</button></div></div>";
      hydrateIcons(box);
      $("#mDup").onclick = dup;
      $("#mMir").onclick = T_mirror;
      $("#mGrp").onclick = T_group;
      $("#mDel").onclick = del;
      $$("#cswatch .sw").forEach((x) => {
        x.onclick = () => applyColorSel(x.dataset.c);
      });
      $("#ccustom").onchange = (e) => applyColorSel(e.target.value);
      return;
    }
    const b = S.sel.bone, c = S.sel.cube;
    let h = "";
    const parentOpts = (cur, excl) => '<option value="">— ninguno —</option>' + bones().filter((x) => excl.indexOf(x) < 0).map((x) => '<option value="' + esc(x.name) + '"' + (x.name === cur ? " selected" : "") + ">" + esc(x.name) + "</option>").join("");
    if (c) {
      t.textContent = "Cubo";
      h += '<div class="grp"><h4>Hueso</h4><select id="cubeBone">' + bones().map((x) => '<option value="' + esc(x.name) + '"' + (x === b ? " selected" : "") + ">" + esc(x.name) + "</option>").join("") + "</select></div>";
      h += colorRow(cubeColor(b, c), hasOwnColor(c));
      h += vec3("Origen", "origin", c.origin, "Esquina mínima del cubo") + vec3("Tamaño", "size", c.size) + vec3("Pivote", "pivot", c.pivot || cubeCenter(c), "Punto sobre el que rota el cubo") + vec3("Rotación", "rotation", c.rotation);
      h += '<div class="grp"><h4>Extras</h4><div class="f2">' + fld("Inflar", "n", c.inflate || 0, 'id="inflate" title="Expansión en todas las direcciones"') + '<label class="chk"><input type="checkbox" id="mirror"' + (c.mirror ? " checked" : "") + (Array.isArray(c.uv) ? "" : " disabled") + ">Espejo UV</label></div></div>";
      if (Array.isArray(c.uv)) h += '<div class="grp"><h4>UV (caja)</h4><div class="f2" data-vec="uv">' + fld("U", "n", c.uv[0], 'data-k="0"') + fld("V", "n", c.uv[1], 'data-k="1"') + '</div><div class="btnrow" style="margin-top:6px"><button class="btn" id="uvAuto">' + ic("wand") + 'Auto-colocar</button><button class="btn" id="uvFaces">' + ic("uvfaces") + "Por caras</button></div></div>";
      else h += '<div class="grp"><h4>UV por caras<button class="btn xs" id="uvBox" title="Volver a UV de caja">A caja</button></h4>' + FACE_NAMES.map((fn) => {
        const f = c.uv && c.uv[fn] || { uv: [0, 0], uv_size: [0, 0] };
        return '<div class="uvfrow' + (S.face === fn ? " on" : "") + '"><span class="fn" data-face="' + fn + '" title="Resaltar esta cara">' + { north: "Norte", south: "Sur", east: "Este", west: "Oeste", up: "Arriba", down: "Abajo" }[fn] + '</span><div class="uvf" data-face="' + fn + '">' + [f.uv[0], f.uv[1], (f.uv_size || [0, 0])[0], (f.uv_size || [0, 0])[1]].map((v, k) => '<label class="fld"><input type="number" step="any" data-k="' + k + '" value="' + v + '" title="' + ["U", "V", "ancho", "alto"][k] + '"></label>').join("") + "</div></div>";
      }).join("") + "</div>";
      h += '<div class="grp"><div class="btnrow">' + '<button class="btn" id="qCenter">' + ic("target") + 'Centrar pivote</button><button class="btn" id="qMir">' + ic("mirror") + 'Espejo</button></div></div>';
    } else {
      t.textContent = "Hueso";
      const ex = [b].concat(descendants(b));
      h += '<div class="grp"><h4>Nombre</h4><input class="txt" id="boneName" value="' + esc(b.name) + '" spellcheck="false"></div><div class="grp"><h4>Padre</h4><select id="boneParent">' + parentOpts(b.parent, ex) + "</select></div>";
      h += colorRow(boneColor(b), boneUser.has(b));
      h += vec3("Pivote", "pivot", b.pivot, "Mover el pivote traslada todo el hueso") + vec3("Rotación", "rotation", b.rotation);
      h += '<div class="grp"><h4>Opciones del hueso</h4><div class="f2"><label class="chk"><input type="checkbox" id="bMirror"' + (b.mirror ? " checked" : "") + '>Espejo UV</label><label class="chk"><input type="checkbox" id="bNever"' + (b.neverRender ? " checked" : "") + '>No dibujar</label></div><div class="f2" style="margin-top:6px">' + fld("Inflar", "n", b.inflate || 0, 'id="bInflate"') + '<input class="txt" id="bBinding" placeholder="binding (Molang)" value="' + esc(b.binding || "") + '" spellcheck="false"></div></div>';
      const loc = b.locators || {};
      h += '<div class="grp"><h4>Locators<button class="btn xs" id="locAdd" title="Punto de anclaje para efectos, partículas o accesorios">+ Añadir</button></h4>' + (Object.keys(loc).map((n) => '<div class="locrow" data-loc="' + esc(n) + '"><input class="txt" data-n value="' + esc(n) + '" spellcheck="false">' + [0, 1, 2].map((k) => '<input type="number" step="any" data-k="' + k + '" value="' + round((loc[n] || [0, 0, 0])[k] || 0, 3) + '">').join("") + '<button class="ib sm" data-ldel title="Eliminar">' + ic("close") + "</button></div>").join("") || '<div class="hint">Sin locators.</div>') + "</div>";
      h += '<div class="grp"><div class="btnrow"><button class="btn" id="bAddCube">' + ic("cubeplus") + 'Cubo aquí</button><button class="btn" id="bAddChild">' + ic("bone") + 'Hueso hijo</button><button class="btn" id="qCenter">' + ic("target") + "Centrar pivote</button></div></div>";
    }
    box.innerHTML = h;
    hydrateIcons(box);
    bindProps(b, c);
    bindScrub(box);
  }
  function applyColorSel(hex) {
    selItems().forEach((s) => {
      if (s.cube) userColor.set(s.cube, hex);
      else boneUser.set(s.bone, hex);
    });
    commit("Color");
  }
  /* arrastrar sobre la etiqueta X/Y/Z para cambiar el valor (como en Blockbench) */
  function bindScrub(box) {
    $$("[data-scrub]", box).forEach((sp) => {
      const inp = sp.parentElement.querySelector("input");
      sp.style.cursor = "ew-resize";
      sp.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        sp.setPointerCapture(e.pointerId);
        const x0 = e.clientX, v0 = +inp.value || 0, step = e.shiftKey ? 0.1 : S.snap || 0.1;
        let moved = false;
        const mv = (ev) => {
          const dx = ev.clientX - x0;
          if (Math.abs(dx) > 2) moved = true;
          if (!moved) return;
          inp.value = round(v0 + Math.round(dx / 4) * step, 3);
          inp.dispatchEvent(new Event("change"));
        };
        const up = () => {
          sp.removeEventListener("pointermove", mv);
          sp.removeEventListener("pointerup", up);
        };
        sp.addEventListener("pointermove", mv);
        sp.addEventListener("pointerup", up);
      });
    });
  }
  function bindProps(b, c) {
    const box = $("#props");
    $$("[data-vec]", box).forEach((grp) => {
      const key = grp.dataset.vec;
      $$("input", grp).forEach((inp) => {
        inp.onchange = () => {
          const k = +inp.dataset.k, v = +inp.value || 0, tgt = c || b;
          let partner = null;
          if (S.sym) partner = c ? partnerCube(c) : partnerBone(b);
          if (key === "uv") {
            c.uv[k] = Math.round(v);
          } else if (key === "origin" && !c.pivot) {
            c.origin[k] = v;
          } else if (key === "origin") {
            const d = v - c.origin[k];
            c.origin[k] = v;
            c.pivot[k] = round(c.pivot[k] + d);
          } else if (key === "pivot" && !c) {
            const d = v - (b.pivot || [0, 0, 0])[k];
            const dv = [0, 0, 0];
            dv[k] = d;
            moveBone(b, dv);
            if (partner) moveBone(partner, [-dv[0], dv[1], dv[2]]);
            partner = null;
          } else {
            tgt[key] = (tgt[key] || [0, 0, 0]).slice();
            tgt[key][k] = v;
            if (key === "size") tgt[key][k] = Math.max(0, v);
          }
          if (c && key === "rotation" && !c.pivot) c.pivot = c.origin.map((o, i) => o + c.size[i] / 2);
          if (partner) symSync({ bone: b, cube: c }, partner);
          commit("Editar " + (key === "origin" ? "origen" : key === "size" ? "tamaño" : key === "pivot" ? "pivote" : key === "rotation" ? "rotación" : key));
        };
      });
    });
    const bn = $("#boneName");
    if (bn) bn.onchange = () => {
      const nn = bn.value.trim();
      if (!nn || boneByName(nn) && boneByName(nn) !== b) {
        toast("Nombre vacío o repetido", 2500, "bad");
        bn.value = b.name;
        return;
      }
      renameBone(b, nn);
    };
    const bp = $("#boneParent");
    if (bp) bp.onchange = () => {
      if (bp.value) b.parent = bp.value;
      else delete b.parent;
      commit("Cambiar padre");
    };
    const cb = $("#cubeBone");
    if (cb) cb.onchange = () => {
      const nb = boneByName(cb.value);
      if (!nb || nb === b) return;
      b.cubes.splice(b.cubes.indexOf(c), 1);
      ensureCubes(nb).push(c);
      S.sel = { bone: nb, cube: c };
      commit("Mover cubo");
    };
    $$("#cswatch .sw").forEach((x) => {
      x.onclick = () => {
        if (c) setCubeColor(c, x.dataset.c);
        else setBoneColor(b, x.dataset.c);
        commit("Color");
      };
    });
    const cc = $("#ccustom");
    if (cc) cc.onchange = () => {
      if (c) setCubeColor(c, cc.value);
      else setBoneColor(b, cc.value);
      commit("Color");
    };
    const inf = $("#inflate");
    if (inf) inf.onchange = () => {
      c.inflate = +inf.value || 0;
      if (!c.inflate) delete c.inflate;
      commit("Inflar");
    };
    const mi = $("#mirror");
    if (mi) mi.onchange = () => {
      c.mirror = mi.checked;
      if (!c.mirror) delete c.mirror;
      commit("Espejo UV");
    };
    const flag = (id, key, isNum) => {
      const el = $("#" + id);
      if (el) el.onchange = () => {
        const v = isNum ? +el.value || 0 : el.type === "checkbox" ? el.checked : el.value.trim();
        if (v) b[key] = v;
        else delete b[key];
        commit("Opción del hueso");
      };
    };
    flag("bMirror", "mirror");
    flag("bNever", "neverRender");
    flag("bInflate", "inflate", true);
    flag("bBinding", "binding");
    const la = $("#locAdd");
    if (la) la.onclick = () => {
      b.locators = b.locators || {};
      let n = "locator", k = 1;
      while (b.locators[n]) n = "locator_" + k++;
      b.locators[n] = (b.pivot || [0, 0, 0]).slice();
      commit("Añadir locator");
    };
    $$(".locrow", box).forEach((row) => {
      const name = row.dataset.loc;
      $$("input[data-k]", row).forEach((inp) => {
        inp.onchange = () => {
          b.locators[name][+inp.dataset.k] = +inp.value || 0;
          commit("Mover locator");
        };
      });
      row.querySelector("[data-n]").onchange = (e) => {
        const nn = e.target.value.trim();
        if (!nn || nn !== name && b.locators[nn]) return refreshProps();
        const out = {};
        Object.keys(b.locators).forEach((k) => {
          out[k === name ? nn : k] = b.locators[k];
        });
        b.locators = out;
        commit("Renombrar locator");
      };
      row.querySelector("[data-ldel]").onclick = () => {
        delete b.locators[name];
        if (!Object.keys(b.locators).length) delete b.locators;
        commit("Eliminar locator");
      };
    });
    const q = (id, fn) => {
      const el = $("#" + id);
      if (el) el.onclick = fn;
    };
    q("bAddCube", addCube);
    q("bAddChild", addBone);
    q("qCenter", T_center);
    q("qMir", T_mirror);
    q("uvAuto", () => {
      autoUV(c);
      commit("Auto UV");
    });
    q("uvFaces", () => {
      toFaces(c);
      commit("UV por caras");
    });
    q("uvBox", () => {
      c.uv = [0, 0];
      autoUV(c);
      commit("UV de caja");
    });
    $$(".uvfrow .fn", box).forEach((el) => {
      el.onclick = () => {
        S.face = S.face === el.dataset.face ? null : el.dataset.face;
        rebuild();
        refreshProps();
        drawUV();
      };
    });
    $$(".uvf", box).forEach((row) => {
      $$("input", row).forEach((inp) => {
        inp.onchange = () => {
          const fn = row.dataset.face;
          const vals = $$("input", row).map((x) => +x.value || 0);
          if (!c.uv || Array.isArray(c.uv)) c.uv = {};
          c.uv[fn] = { uv: [vals[0], vals[1]], uv_size: [vals[2], vals[3]] };
          commit("UV de cara");
        };
      });
    });
  }
  /* ───────── Color de pintura y paletas ───────── */
  const PAL = ["#ffffff", "#c8c9d4", "#6b6e7e", "#1c1d26", "#e8736c", "#ec9a5c", "#e6c75e", "#a6d56f", "#52c490", "#4dbdcb", "#5fa0e6", "#8088ee", "#a982e6", "#da82d6", "#8a5a3c", "#d9b38c"];
  function setColor(h) {
    S.color = h;
    $("#colorIn").value = h;
  }
  const swHtml = (list) => list.map((c) => '<button class="sw" style="background:' + c + '" data-c="' + c + '" aria-label="' + c + '"></button>').join("");
  function renderRecent() {
    $("#recent").innerHTML = recent.length ? swHtml(recent) : '<span class="hint">Los colores usados aparecen aquí</span>';
  }
  /* ───────── Editor UV ───────── */
  const uvCv = $("#uvCv"), uctx = uvCv.getContext("2d"), uvWrap = $("#uvWrap");
  let uvZoom = 4, uvHot = null;
  const effZoom = () => Math.max(0.5, Math.min(uvZoom, 2048 / Math.max(tex.width, tex.height)));
  function drawUV() {
    if (S.mode !== "paint" && S.mode !== "uv" && !(isMobile() && $("#app").dataset.sheet === "paint")) return;
    const w = tex.width, h = tex.height, z = effZoom();
    const cw = Math.round(w * z), ch = Math.round(h * z);
    if (uvCv.width !== cw || uvCv.height !== ch) {
      uvCv.width = cw;
      uvCv.height = ch;
    }
    uvCv.style.width = cw + "px";
    uvCv.style.height = ch + "px";
    $("#uvZoomV").textContent = Math.round(z * 100) + "%";
    uctx.imageSmoothingEnabled = false;
    uctx.clearRect(0, 0, cw, ch);
    uctx.drawImage(tex, 0, 0, cw, ch);
    const uvmode = S.mode === "uv";
    const rect = (f) => {
      const x0 = Math.min(f.U[0][0], f.U[1][0]) * cw, x1 = Math.max(f.U[0][0], f.U[1][0]) * cw, y0 = Math.min(f.U[0][1], f.U[2][1]) * ch, y1 = Math.max(f.U[0][1], f.U[2][1]) * ch;
      return [x0, y0, x1 - x0, y1 - y0];
    };
    if (z >= 8) {
      uctx.strokeStyle = "rgba(255,255,255,.07)";
      uctx.lineWidth = 1;
      uctx.beginPath();
      for (let x = 0; x <= w; x++) {
        uctx.moveTo(x * z + 0.5, 0);
        uctx.lineTo(x * z + 0.5, ch);
      }
      for (let y = 0; y <= h; y++) {
        uctx.moveTo(0, y * z + 0.5);
        uctx.lineTo(cw, y * z + 0.5);
      }
      uctx.stroke();
    }
    const AB = { north: "N", south: "S", east: "E", west: "O", up: "↑", down: "↓" };
    faces.forEach((f) => {
      const sel = isSelCube(f.c) || !S.sel || S.sel.cube == null && S.sel.bone === f.b;
      const [x, y, rw, rh] = rect(f);
      const col = cubeColor(f.b, f.c);
      if (uvmode || sel) {
        uctx.fillStyle = col + (sel ? "55" : "26");
        uctx.fillRect(x, y, rw, rh);
      }
      const hot = S.face === f.fn && S.sel && S.sel.cube === f.c;
      uctx.strokeStyle = hot ? "#fff" : sel ? "rgba(251,191,36,.95)" : uvmode ? col : "rgba(255,255,255,.25)";
      uctx.lineWidth = hot ? 2.2 : sel ? 1.6 : 1;
      uctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, rw - 1), Math.max(0, rh - 1));
      if (rw > 14 && rh > 12 && (sel || uvmode)) {
        uctx.fillStyle = "rgba(255,255,255,.8)";
        uctx.font = "700 " + Math.min(12, Math.max(8, rh * 0.5)) + "px system-ui";
        uctx.fillText(AB[f.fn], x + 3, y + Math.min(rh - 3, 12));
      }
    });
    const out = uvmode && (S.texW !== w || S.texH !== h);
    $("#uvInfo").textContent = (out ? "Imagen " + w + "×" + h + " · UV " + S.texW + "×" + S.texH : "");
  }
  function uvFit() {
    const avail = Math.max(120, uvWrap.clientWidth - 12);
    uvZoom = clamp(avail / tex.width, 0.5, 24);
    drawUV();
  }
  function uvXY(e) {
    const r = uvCv.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  }
  let uvDrag = null, uvDown = false, uvPan = null;
  uvCv.addEventListener("pointerdown", (e) => {
    uvCv.setPointerCapture(e.pointerId);
    if (e.button === 1 || e.button === 2 || e.altKey) {
      uvPan = { x: e.clientX, y: e.clientY, sl: uvWrap.scrollLeft, st: uvWrap.scrollTop };
      return;
    }
    const p = uvXY(e);
    if (S.mode === "uv") {
      const x = p[0] * S.texW, y = p[1] * S.texH;
      let hit = null;
      for (let i = faces.length - 1; i >= 0; i--) {
        const f = faces[i], u = f.U;
        const x0 = Math.min(u[0][0], u[1][0]) * S.texW, x1 = Math.max(u[0][0], u[1][0]) * S.texW, y0 = Math.min(u[0][1], u[2][1]) * S.texH, y1 = Math.max(u[0][1], u[2][1]) * S.texH;
        if (x >= x0 && x <= x1 && y >= y0 && y <= y1 && (!hit || isSelCube(f.c))) {
          hit = f;
          if (S.sel && S.sel.cube === f.c) break;
        }
      }
      if (!hit) return;
      if (!S.sel || S.sel.cube !== hit.c) select(hit.b, hit.c, e.shiftKey);
      S.face = hit.fn;
      const items = topItems().filter((s) => s.cube);
      uvDrag = { items: items.map((s) => ({ c: s.cube, orig: JSON.stringify(s.cube.uv) })), fn: hit.fn, x, y, moved: false };
      return;
    }
    uvDown = true;
    paintPx(p[0] * tex.width, p[1] * tex.height, true, null);
  });
  uvCv.addEventListener("pointermove", (e) => {
    if (uvPan) {
      uvWrap.scrollLeft = uvPan.sl - (e.clientX - uvPan.x);
      uvWrap.scrollTop = uvPan.st - (e.clientY - uvPan.y);
      return;
    }
    const p = uvXY(e);
    if (uvDrag) {
      const dx = Math.round(p[0] * S.texW - uvDrag.x), dy = Math.round(p[1] * S.texH - uvDrag.y);
      uvDrag.items.forEach(({ c, orig }) => {
        const o = JSON.parse(orig);
        if (Array.isArray(o)) c.uv = [Math.max(0, o[0] + dx), Math.max(0, o[1] + dy)];
        else {
          const f = o[uvDrag.fn];
          if (f) {
            f.uv = [Math.max(0, f.uv[0] + dx), Math.max(0, f.uv[1] + dy)];
            c.uv = o;
          }
        }
      });
      uvDrag.moved = true;
      rebuild();
      requestDraw();
      return;
    }
    if (uvDown) paintPx(p[0] * tex.width, p[1] * tex.height, false, null);
    else if (S.mode === "paint" && e.buttons === 0) {
      const x = Math.floor(p[0] * tex.width), y = Math.floor(p[1] * tex.height);
      if (x >= 0 && y >= 0 && x < tex.width && y < tex.height) $("#uvInfo").textContent = "px " + x + ", " + y;
    }
  });
  function uvEnd() {
    uvPan = null;
    if (uvDrag) {
      const m = uvDrag.moved;
      uvDrag = null;
      if (m) {
        pushHist("Mover UV");
        markDirty();
        refreshProps();
      }
    }
    uvDown = false;
    endStroke();
  }
  uvCv.addEventListener("pointerup", uvEnd);
  uvCv.addEventListener("pointercancel", uvEnd);
  uvCv.addEventListener("contextmenu", (e) => e.preventDefault());
  uvWrap.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = uvCv.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    uvZoom = clamp(uvZoom * (e.deltaY < 0 ? 1.2 : 1 / 1.2), 0.5, 40);
    drawUV();
    const r2 = uvCv.getBoundingClientRect();
    uvWrap.scrollLeft += r2.left + fx * r2.width - e.clientX;
    uvWrap.scrollTop += r2.top + fy * r2.height - e.clientY;
  }, { passive: false });
  /* ───────── Herramientas de edición ───────── */
  function toFaces(c) {
    const r = faceUVs(c), o = {};
    FACE_NAMES.forEach((fn) => {
      const q = r[fn];
      o[fn] = { uv: [q[0], q[1]], uv_size: [q[2] - q[0], q[3] - q[1]] };
    });
    c.uv = o;
    delete c.mirror;
  }
  function mirrorCube(c) {
    const n = JSON.parse(JSON.stringify(c));
    n.origin[0] = round(-(c.origin[0] + c.size[0]));
    if (c.pivot) n.pivot[0] = round(-c.pivot[0]);
    if (c.rotation) n.rotation = [c.rotation[0], -c.rotation[1], -c.rotation[2]];
    if (Array.isArray(n.uv)) n.mirror = !c.mirror;
    else if (n.uv) FACE_NAMES.forEach((k) => {
      if (n.uv[k] && n.uv[k].uv_size) {
        n.uv[k].uv[0] += n.uv[k].uv_size[0];
        n.uv[k].uv_size[0] *= -1;
      }
    });
    if (!n.mirror) delete n.mirror;
    return n;
  }
  function T_mirror() {
    const items = topItems();
    if (!items.length) return toast("Selecciona un cubo o un hueso");
    const out = [];
    items.forEach((s) => {
      if (s.cube) {
        const n = mirrorCube(s.cube);
        s.bone.cubes.push(n);
        out.push({ bone: s.bone, cube: n });
      } else {
        const src = s.bone, all = [src].concat(descendants(src)), map = {};
        all.forEach((b) => {
          let n = b.name.replace(/left/i, "§L").replace(/right/i, "§R").replace(/§L/, "right").replace(/§R/, "left");
          if (n === b.name) n = b.name + "_esp";
          map[b.name] = newBoneName(n);
        });
        const cp = all.map((b) => {
          const n = JSON.parse(JSON.stringify(b));
          n.name = map[b.name];
          if (b.parent && map[b.parent]) n.parent = map[b.parent];
          if (n.pivot) n.pivot[0] = round(-n.pivot[0]);
          if (n.rotation) n.rotation = [n.rotation[0], -n.rotation[1], -n.rotation[2]];
          if (n.cubes) n.cubes = b.cubes.map(mirrorCube);
          if (n.locators) Object.keys(n.locators).forEach((k) => {
            n.locators[k][0] = round(-n.locators[k][0]);
          });
          return n;
        });
        cp.forEach((n) => bones().push(n));
        out.push({ bone: cp[0], cube: null });
      }
    });
    S.sel = out[0];
    S.multi = out.slice(1);
    commit("Espejo en X");
  }
  function T_center() {
    if (!S.sel) return toast("Selecciona algo");
    if (S.sel.cube) {
      S.sel.cube.pivot = cubeCenter(S.sel.cube);
      return commit("Centrar pivote");
    }
    const cs = cubesOf(S.sel.bone);
    if (!cs.length) return toast("El hueso no tiene cubos");
    const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
    cs.forEach((c) => {
      for (let i = 0; i < 3; i++) {
        mn[i] = Math.min(mn[i], c.origin[i]);
        mx[i] = Math.max(mx[i], c.origin[i] + c.size[i]);
      }
    });
    S.sel.bone.pivot = mn.map((v, i) => round((v + mx[i]) / 2));
    commit("Centrar pivote");
  }
  function T_group() {
    const items = selItems().filter((s) => s.cube);
    if (!items.length) return toast("Selecciona uno o más cubos para agrupar");
    const b0 = items[0].bone;
    const ctr = [0, 0, 0];
    items.forEach((s) => cubeCenter(s.cube).forEach((v, i) => {
      ctr[i] += v / items.length;
    }));
    const nb = { name: newBoneName(b0.name + "_grupo"), parent: b0.name, pivot: ctr.map((v) => round(v)), cubes: [] };
    items.forEach((s) => {
      s.bone.cubes.splice(s.bone.cubes.indexOf(s.cube), 1);
      nb.cubes.push(s.cube);
    });
    bones().push(nb);
    S.sel = { bone: nb, cube: null };
    S.multi = [];
    commit("Agrupar en hueso");
  }
  function T_ground() {
    const cs = allCubes();
    if (!cs.length) return;
    const mn = Math.min.apply(null, cs.map((c) => c.origin[1] - num(c.inflate, 0)));
    if (!mn) return toast("Ya está sobre el suelo");
    bones().filter((b) => !parentOf(b)).forEach((b) => moveBone(b, [0, -mn, 0]));
    commit("Alinear al suelo");
  }
  function T_centerXZ() {
    const cs = allCubes();
    if (!cs.length) return;
    let a = 1e9, b = -1e9, c2 = 1e9, d = -1e9;
    cs.forEach((c) => {
      a = Math.min(a, c.origin[0]);
      b = Math.max(b, c.origin[0] + c.size[0]);
      c2 = Math.min(c2, c.origin[2]);
      d = Math.max(d, c.origin[2] + c.size[2]);
    });
    const dx = -round((a + b) / 2), dz = -round((c2 + d) / 2);
    bones().filter((x) => !parentOf(x)).forEach((x) => moveBone(x, [dx, 0, dz]));
    commit("Centrar modelo");
  }
  function T_ints() {
    const items = selItems();
    const cs = items.length ? items.reduce((a, s) => a.concat(s.cube ? [s.cube] : cubesOf(s.bone)), []) : allCubes();
    cs.forEach((c) => {
      c.origin = c.origin.map(Math.round);
      c.size = c.size.map((v) => Math.max(0, Math.round(v)));
      if (c.pivot) c.pivot = c.pivot.map(Math.round);
    });
    commit("Ajustar a enteros");
  }
  async function T_scale() {
    const r = await ask({ title: "Escalar el modelo", text: "Multiplica posiciones y tamaños de todo el modelo.", fields: [{ id: "k", label: "Factor (0.5 = mitad, 2 = doble)", type: "number", value: 1, step: "0.05" }], ok: "Escalar", validate: (v) => !(v.k > 0) ? "El factor debe ser mayor que 0" : "" });
    if (!r || r.k === 1) return;
    const k = r.k;
    bones().forEach((b) => {
      if (b.pivot) b.pivot = b.pivot.map((v) => round(v * k));
      Object.keys(b.locators || {}).forEach((n) => {
        b.locators[n] = b.locators[n].map((v) => round(v * k));
      });
      (b.cubes || []).forEach((c) => {
        c.origin = c.origin.map((v) => round(v * k));
        c.size = c.size.map((v) => round(v * k));
        if (c.pivot) c.pivot = c.pivot.map((v) => round(v * k));
        if (c.inflate) c.inflate = round(c.inflate * k);
      });
    });
    commit("Escalar modelo");
    frameModel();
  }
  function T_split(ax) {
    if (!S.sel || !S.sel.cube) return toast("Selecciona un cubo");
    const c = S.sel.cube, i = ax, sz = c.size[i];
    if (sz < 2) return toast("Es demasiado pequeño para dividir");
    const h1 = Math.floor(sz / 2), h2 = sz - h1, n = JSON.parse(JSON.stringify(c));
    c.size[i] = h1;
    n.size[i] = h2;
    n.origin[i] = round(c.origin[i] + h1);
    if (Array.isArray(n.uv)) n.uv = null;
    S.sel.bone.cubes.push(n);
    if (Array.isArray(c.uv)) autoUV(c);
    if (n.uv === null) autoUV(n);
    commit("Dividir cubo");
  }
  function T_rot90(ax) {
    if (!S.sel || !S.sel.cube) return toast("Selecciona un cubo");
    const c = S.sel.cube, ctr = cubeCenter(c), a = ax === "y" ? [0, 2] : ax === "x" ? [1, 2] : [0, 1];
    const s2 = c.size.slice();
    s2[a[0]] = c.size[a[1]];
    s2[a[1]] = c.size[a[0]];
    c.size = s2;
    c.origin = ctr.map((v, i) => round(v - s2[i] / 2));
    commit("Rotar 90°");
  }
  function T_vis(show) {
    bones().forEach((b) => {
      if (show) {
        S.hidden.delete(b);
        (b.cubes || []).forEach((c) => S.hidden.delete(c));
      } else S.hidden.add(b);
    });
    rebuild();
    renderOutliner();
    requestDraw();
  }
  function T_isolate() {
    if (!S.sel) return toast("Selecciona algo");
    const keep = new Set(selItems().map((s) => s.bone));
    bones().forEach((b) => {
      if (keep.has(b)) S.hidden.delete(b);
      else S.hidden.add(b);
    });
    rebuild();
    renderOutliner();
    requestDraw();
  }
  function T_recolor(mode) {
    if (mode === "auto") {
      bones().forEach((b) => {
        boneUser.delete(b);
        (b.cubes || []).forEach((c) => userColor.delete(c));
      });
    } else if (mode === "random") {
      bones().forEach((b) => {
        boneUser.set(b, COLORS[Math.floor(Math.random() * COLORS.length)]);
        (b.cubes || []).forEach((c) => userColor.delete(c));
      });
    } else if (mode === "cubes") {
      bones().forEach((b) => (b.cubes || []).forEach((c) => userColor.delete(c)));
    }
    commit("Colores del modelo");
  }
  let clip = null;
  function T_copy() {
    const items = topItems();
    if (!items.length) return toast("Selecciona algo para copiar");
    clip = items.map((s) => s.cube ? { cube: JSON.parse(JSON.stringify(s.cube)), bone: s.bone.name } : { tree: [s.bone].concat(descendants(s.bone)).map((b) => JSON.parse(JSON.stringify(b))), parent: s.bone.parent });
    toast("Copiado");
  }
  function T_paste() {
    if (!clip) return toast("No hay nada copiado");
    const out = [];
    clip.forEach((it) => {
      if (it.cube) {
        const b = S.sel && S.sel.bone || boneByName(it.bone) || bones()[0];
        if (!b) return;
        const c = JSON.parse(JSON.stringify(it.cube));
        if (Array.isArray(c.uv)) c.uv = null;
        ensureCubes(b).push(c);
        if (c.uv === null) autoUV(c);
        out.push({ bone: b, cube: c });
      } else {
        const map = {}, used = new Set();
        it.tree.forEach((b) => {
          let n, k = 1;
          do {
            n = b.name + "_" + k++;
          } while (boneByName(n) || used.has(n));
          used.add(n);
          map[b.name] = n;
        });
        const cp = it.tree.map((b, i) => {
          const n = JSON.parse(JSON.stringify(b));
          n.name = map[b.name];
          if (i === 0) {
            if (it.parent && boneByName(it.parent)) n.parent = it.parent;
            else delete n.parent;
          } else if (b.parent && map[b.parent]) n.parent = map[b.parent];
          return n;
        });
        cp.forEach((n) => bones().push(n));
        out.push({ bone: cp[0], cube: null });
      }
    });
    if (!out.length) return;
    S.sel = out[0];
    S.multi = out.slice(1);
    commit("Pegar");
  }
  const MORE = [
    ["Edición", null],
    ["copy", "Copiar", T_copy, "Ctrl+C"],
    ["paste", "Pegar", T_paste, "Ctrl+V"],
    ["mirror", "Espejo en X (copia)", T_mirror, "Shift+M"],
    ["target", "Centrar pivote", T_center, ""],
    ["group", "Agrupar en hueso nuevo", T_group, ""],
    ["eye", "Aislar selección", T_isolate, ""],
    ["Cubo", null],
    ["cube", "Rotar 90° (Y)", () => T_rot90("y"), ""],
    ["cube", "Rotar 90° (X)", () => T_rot90("x"), ""],
    ["cube", "Rotar 90° (Z)", () => T_rot90("z"), ""],
    ["split", "Dividir en X", () => T_split(0), ""],
    ["split", "Dividir en Y", () => T_split(1), ""],
    ["split", "Dividir en Z", () => T_split(2), ""],
    ["Modelo", null],
    ["ground", "Alinear al suelo", T_ground, ""],
    ["target", "Centrar modelo (X/Z)", T_centerXZ, ""],
    ["ruler", "Ajustar a enteros", T_ints, "Selección o todo"],
    ["scale", "Escalar modelo…", T_scale, ""],
    ["eye", "Mostrar todo", () => T_vis(true), ""],
    ["eyeoff", "Ocultar todo", () => T_vis(false), ""],
    ["Colores", null],
    ["palette", "Color automático por hueso", () => T_recolor("auto"), ""],
    ["dice", "Colores aleatorios", () => T_recolor("random"), ""],
    ["palette", "Cubos heredan color del hueso", () => T_recolor("cubes"), ""]
  ];
  function openMore(anchor) {
    const pop = $("#morePop");
    if (!pop.hidden) {
      pop.hidden = true;
      return;
    }
    pop.innerHTML = MORE.map((m, i) => m[1] === null ? "<h5>" + m[0] + "</h5>" : '<button data-i="' + i + '">' + ic(m[0]) + "<span>" + m[1] + "</span><small>" + (m[3] || "") + "</small></button>").join("");
    hydrateIcons(pop);
    pop.hidden = false;
    const r = anchor.getBoundingClientRect(), a = $("#app").getBoundingClientRect();
    pop.style.left = isMobile() ? "8px" : r.right - a.left + 6 + "px";
    pop.style.top = isMobile() ? r.bottom - a.top + 6 + "px" : Math.max(50, Math.min(r.top - a.top - 40, a.height - pop.offsetHeight - 40)) + "px";
  }
  $("#morePop").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $("#morePop").hidden = true;
    MORE[+b.dataset.i][2]();
  });
  $("#moreToolsBtn").onclick = (e) => {
    e.stopPropagation();
    openMore(e.currentTarget);
  };
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#morePop") && !e.target.closest("#moreToolsBtn")) $("#morePop").hidden = true;
  });
  /* menú contextual del modelo / esquema */
  FD.openCtx = function(x, y, onItem) {
    const has = !!S.sel, cube = has && !!S.sel.cube;
    const items = [];
    if (has) {
      items.push({ label: "Duplicar", icon: "copy", key: "Ctrl+D", fn: dup }, { label: "Espejo en X", icon: "mirror", fn: T_mirror }, { label: "Copiar", icon: "copy", key: "Ctrl+C", fn: T_copy }, { label: "Pegar", icon: "paste", key: "Ctrl+V", fn: T_paste, disabled: !clip }, { sep: true });
      if (cube) items.push({ label: "Agrupar en hueso", icon: "group", fn: T_group }, { label: "Centrar pivote", icon: "target", fn: T_center });
      else items.push({ label: "Añadir cubo aquí", icon: "cubeplus", fn: addCube }, { label: "Añadir hueso hijo", icon: "bone", fn: addBone }, { label: "Centrar pivote", icon: "target", fn: T_center });
      items.push({ label: "Aislar", icon: "eye", fn: T_isolate }, { label: "Mostrar todo", icon: "eye", fn: () => T_vis(true) }, { sep: true }, { label: "Eliminar", icon: "trash", key: "Supr", danger: true, fn: del });
    } else {
      items.push({ label: "Añadir cubo", icon: "cubeplus", fn: addCube }, { label: "Añadir hueso", icon: "bone", fn: addBone }, { label: "Pegar", icon: "paste", fn: T_paste, disabled: !clip }, { sep: true }, { label: "Seleccionar todo", icon: "cursor", key: "Ctrl+A", fn: selectAll }, { label: "Mostrar todo", icon: "eye", fn: () => T_vis(true) });
    }
    ctxMenu(x, y, items);
  };
  /* ───────── Modos, hojas, ayuda ───────── */
  function setMode(m) {
    S.mode = m;
    const a = $("#app");
    a.dataset.mode = m;
    $$(".mode").forEach((x) => x.classList.toggle("on", x.dataset.mode === m));
    if (m === "paint" || m === "uv") {
      fillTexSel();
      $("#pPaintTitle").textContent = m === "uv" ? "Mapa UV · arrastra las caras" : "Pintura";
      setTimeout(() => {
        if (uvZoom === 4) uvFit();
        else drawUV();
      }, 40);
    }
    if (m === "anim" || m === "edit") setTool("select");
    if (isMobile()) {
      const cur = a.dataset.sheet;
      const want = m === "edit" ? cur === "paint" || cur === "anim" ? "outliner" : cur : m === "anim" ? "anim" : "paint";
      a.setAttribute("data-sheet", want || "");
      $$("#bnav button").forEach((x) => x.classList.toggle("on", x.dataset.sheet === want));
    }
    FD.hooks.refresh.forEach((f) => f("mode"));
    help();
    rebuild();
    refreshAll();
    setTimeout(requestDraw, 30);
  }
  function setSheet(s) {
    const a = $("#app");
    a.dataset.sheet = a.dataset.sheet === s ? "" : s;
    $$("#bnav button").forEach((b) => b.classList.toggle("on", b.dataset.sheet === a.dataset.sheet));
    if (a.dataset.sheet === "paint") drawUV();
    if (a.dataset.sheet === "check" && FD.check) FD.check.run();
    setTimeout(requestDraw, 30);
  }
  function setTopTab(t) {
    $("#app").dataset.ptab = t;
    $$("#topTabs .tab").forEach((b) => b.classList.toggle("on", b.dataset.ptab === t));
    if (t === "textures" && FD.proj) FD.proj.renderTexList();
  }
  function help() {
    $("#vhelp").textContent = S.mode === "paint" ? "Clic: pintar · Botón derecho: girar · Rueda: zoom · B/E/F/C/I: herramientas" : S.mode === "anim" ? "Elige un hueso · Mover/Rotar/Escala para posar · K: clave · Espacio: reproducir" : S.mode === "uv" ? "Selecciona un cubo · arrastra sus caras en el mapa UV · flechas: mover 1 px" : "Clic: seleccionar · Shift: varios / marco · Arrastrar: girar · Clic derecho: menú · Rueda: zoom";
  }
  function setTool(t) {
    S.tool = t;
    $$("[data-tool]").forEach((b) => b.classList.toggle("on", b.dataset.tool === t));
    requestDraw();
  }
  function setPTool(m) {
    S.ptool = m;
    $$("[data-ptool]").forEach((x) => x.classList.toggle("on", x.dataset.ptool === m));
  }
  /* ───────── Menú de vista (colores, contornos…) ───────── */
  function openViewMenu() {
    const r = $("#shadeBtn").getBoundingClientRect();
    const modes = [["auto", "Automático (textura + color)"], ["tex", "Textura como en el juego"], ["color", "Solo colores por cubo"], ["mix", "Mezcla"]];
    const tg = (label, key, fn) => ({ label, icon: S[key] ? "check" : "", fn: fn || (() => {
      S[key] = !S[key];
      if (key === "shade" || key === "edges") rebuild();
      updToolsState();
      requestDraw();
    }) });
    ctxMenu(r.left, r.bottom + 6, modes.map((m) => ({ label: m[1], icon: S.colorMode === m[0] ? "check" : "", fn: () => setColorMode(m[0]) })).concat([{ sep: true }, tg("Sombreado", "shade"), tg("Contornos de cubos", "edges"), tg("Malla de caras", "wire"), tg("Cuadrícula", "grid"), tg("Esqueleto y pivotes", "skel"), tg("Silueta de jugador", "ref"), tg("Límites visibles", "bounds")]));
  }
  function setColorMode(m) {
    S.colorMode = m;
    $("#shadeBtn span").textContent = { auto: "Auto", tex: "Textura", color: "Color", mix: "Mezcla" }[m];
    requestDraw();
  }
  /* ───────── Modales: historial y atajos ───────── */
  function openHistory() {
    const rows = hist.map((h, i) => '<div class="hrow' + (i === hpos ? " cur" : "") + '" data-i="' + i + '">' + ic(i === hpos ? "check" : "hist") + "<span>" + esc(h.label) + "</span><small>" + new Date(h.t).toLocaleTimeString() + "</small></div>").reverse().join("");
    modal("Historial de cambios", '<div class="sub">Pulsa un paso para volver (o avanzar) a ese estado.</div>' + rows, [{ label: "Cerrar" }], (el, api) => {
      el.addEventListener("click", (e) => {
        const r = e.target.closest(".hrow");
        if (!r) return;
        hpos = +r.dataset.i;
        restore(hist[hpos]);
        updUndo();
        api.close();
      });
    });
  }
  function openShortcuts() {
    const K = [["Modos", [["1 2 3 4", "Modelar · Mapeo · Pintar · Animar"], ["Tab", "Alternar modelar/pintar"]]], ["Herramientas", [["V G R S", "Elegir · Mover · Rotar · Tamaño"], ["Shift+A / Shift+B", "Nuevo cubo / hueso"], ["Ctrl+D", "Duplicar"], ["Shift+M", "Espejo en X"], ["Ctrl+C / Ctrl+V", "Copiar / pegar"], ["Ctrl+A", "Seleccionar todo"], ["Supr", "Eliminar"], ["H", "Ocultar / mostrar selección"], ["Flechas · Re/Av Pág", "Mover la selección"]]], ["Vista", [["F", "Encuadrar modelo"], ["Num 1 / 3 / 7 / 0", "Frente / lado / arriba / iso"], ["Clic der. + arrastrar", "Girar"], ["Shift + clic der.", "Mover vista"], ["Shift + arrastrar", "Selección en marco"]]], ["Pintura", [["B E F C I", "Lápiz · borrador · relleno · cara · gotero"], ["Ctrl + rueda (UV)", "Zoom del mapa"]]], ["Animación", [["Espacio", "Reproducir / pausar"], ["K", "Añadir clave"], ["[ ]", "Clave anterior / siguiente"], ["← →", "Avanzar un fotograma"], ["Ctrl+C / Ctrl+V", "Copiar / pegar claves"]]], ["General", [["Ctrl+S", "Guardar"], ["Ctrl+Z / Ctrl+Shift+Z", "Deshacer / rehacer"], ["?", "Esta ayuda"]]]];
    modal("Atajos de teclado", K.map((g) => "<h4 class='kh'>" + g[0] + "</h4>" + g[1].map((r) => "<div class='krow'><kbd>" + esc(r[0]) + "</kbd><span>" + esc(r[1]) + "</span></div>").join("")).join(""), [{ label: "Cerrar" }], null, "wide");
  }
  /* ───────── Conversión de formato y límites ───────── */
  FD.act = FD.act || {};
  FD.act.toNewFormat = async function() {
    const g = G();
    if (!g || !g.legacy) return toast("Ya usa el formato nuevo");
    if (!await confirmDlg("Se convertirá la geometría al formato 1.12 («minecraft:geometry»). Puedes deshacerlo.")) return;
    const o = g.obj, id = g.key;
    const desc = { identifier: id, texture_width: num(o.texturewidth, 64), texture_height: num(o.textureheight, 64) };
    ["visible_bounds_width", "visible_bounds_height", "visible_bounds_offset"].forEach((k) => {
      if (o[k] != null) desc[k] = o[k];
    });
    const ng = { description: desc, bones: o.bones };
    delete S.root[id];
    S.root.format_version = "1.12.0";
    S.root["minecraft:geometry"] = (S.root["minecraft:geometry"] || []).concat([ng]);
    S.geos = parseGeos(S.root);
    S.gi = S.geos.findIndex((x) => x.obj === ng);
    readDims();
    commit("Convertir a formato 1.12");
    toast("Convertido a 1.12");
  };
  FD.act.autoBounds = function() {
    const g = G();
    if (!g || g.legacy) return;
    const bb = modelBounds();
    if (!bb) return toast("El modelo está vacío");
    const ex = Math.max(Math.abs(bb.mn[0]), Math.abs(bb.mx[0]), Math.abs(bb.mn[2]), Math.abs(bb.mx[2])) / 16;
    const w = Math.max(1, Math.ceil(ex * 2 * 2) / 2), hh = (bb.mx[1] - bb.mn[1]) / 16;
    const h = Math.max(1, Math.ceil(hh * 2) / 2);
    g.obj.description.visible_bounds_width = w;
    g.obj.description.visible_bounds_height = h;
    g.obj.description.visible_bounds_offset = [0, round((bb.mn[1] + bb.mx[1]) / 32, 2), 0];
    commit("Límites visibles");
    toast("Límites visibles ajustados al modelo");
  };
  /* ───────── Enlaces de botones ───────── */
  $$("[data-tool]").forEach((b) => b.addEventListener("click", () => setTool(b.dataset.tool)));
  $$("[data-ptool]").forEach((b) => b.addEventListener("click", () => setPTool(b.dataset.ptool)));
  $$(".mode").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $$("#bnav button").forEach((b) => b.addEventListener("click", () => setSheet(b.dataset.sheet)));
  $$("#topTabs .tab").forEach((b) => b.addEventListener("click", () => setTopTab(b.dataset.ptab)));
  $$("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  $("#frameBtn").onclick = frameModel;
  $("#addCube").onclick = addCube;
  $("#addBone").onclick = addBone;
  $("#dupBtn").onclick = dup;
  $("#delBtn").onclick = del;
  $("#mirBtn").onclick = T_mirror;
  $("#symBtn").onclick = () => {
    S.sym = !S.sym;
    updToolsState();
    toast(S.sym ? "Simetría en X activada: la pieza opuesta imita tus cambios" : "Simetría desactivada");
  };
  $("#paintMirBtn").onclick = () => {
    S.paintMir = !S.paintMir;
    updToolsState();
  };
  $("#undoBtn").onclick = undo;
  $("#redoBtn").onclick = redo;
  $("#histBtn").onclick = openHistory;
  $("#saveBtn").onclick = async () => {
    if (await save()) toast("Guardado en el proyecto", 1800, "ok");
    else if (!S.project) toast("Modo demostración: no hay proyecto donde guardar");
  };
  $("#intBtn").onclick = () => {
    if (FD.openIntegration) FD.openIntegration();
  };
  $("#chkBtn").onclick = () => FD.check && FD.check.toggle();
  $("#snapBtn").onclick = () => {
    const o = [1, 0.5, 0.25, 0];
    S.snap = o[(o.indexOf(S.snap) + 1) % o.length];
    $("#snapBtn").textContent = S.snap ? "Ajuste " + S.snap : "Sin ajuste";
  };
  $("#viewBtn").onclick = () => {
    S.ortho = !S.ortho;
    $("#viewBtn").textContent = S.ortho ? "Ortogonal" : "Perspectiva";
    requestDraw();
  };
  $("#shadeBtn").onclick = openViewMenu;
  [["gridBtn", "grid"], ["wireBtn", "wire"], ["skelBtn", "skel"], ["refBtn", "ref"]].forEach(([id, k]) => {
    $("#" + id).onclick = () => {
      S[k] = !S[k];
      updToolsState();
      requestDraw();
    };
  });
  $("#uvIn").onclick = () => {
    uvZoom = Math.min(40, effZoom() * 1.4);
    drawUV();
  };
  $("#uvOut").onclick = () => {
    uvZoom = Math.max(0.5, effZoom() / 1.4);
    drawUV();
  };
  $("#uvFit").onclick = uvFit;
  $("#uvBig").onclick = () => {
    const a = $("#app");
    a.toggleAttribute("data-uvbig");
    setTimeout(uvFit, 60);
  };
  $("#colorIn").oninput = (e) => {
    S.color = e.target.value;
  };
  $("#brushIn").oninput = (e) => {
    S.brush = +e.target.value;
    $("#brushVal").textContent = S.brush;
  };
  $("#swatches").innerHTML = swHtml(PAL);
  [$("#swatches"), $("#recent")].forEach((el) => {
    el.onclick = (e) => {
      const b = e.target.closest(".sw");
      if (b) setColor(b.dataset.c);
    };
  });
  $("#texSel").onchange = (e) => {
    const t = TX.list.find((x) => x.id === e.target.value);
    if (t) {
      activate(t);
      pushHist("Cambiar textura");
    }
  };
  $("#uvAutoAll").onclick = async () => {
    const r = packBoxUV(false);
    if (!r.n) return toast("No hay cubos con UV de caja");
    if (!r.fits) {
      const nh = 1 << Math.ceil(Math.log2(r.need));
      if (!await confirmDlg("Los cubos necesitan " + r.need + " px de alto y la textura del modelo mide " + S.texH + ". ¿Ampliar el modelo a " + S.texW + "×" + nh + "?")) return;
      S.texH = nh;
      writeDims();
      if (FD.proj) FD.proj.resizeTexture(TX.active, tex.width, Math.round(nh * (tex.width / S.texW)), "expand", true);
    }
    packBoxUV(true);
    commit("Auto UV");
  };
  $("#uvSnapBtn").onclick = () => {
    allCubes().forEach((c) => {
      if (Array.isArray(c.uv)) c.uv = c.uv.map(Math.round);
      else if (c.uv) FACE_NAMES.forEach((f) => {
        const q = c.uv[f];
        if (q) {
          q.uv = q.uv.map(Math.round);
          q.uv_size = q.uv_size.map(Math.round);
        }
      });
    });
    commit("UV a píxeles");
  };
  $("#uvFacesBtn").onclick = () => {
    if (!S.sel || !S.sel.cube) return toast("Selecciona un cubo");
    const c = S.sel.cube;
    if (Array.isArray(c.uv)) toFaces(c);
    else {
      c.uv = [0, 0];
      autoUV(c);
    }
    commit(Array.isArray(c.uv) ? "UV de caja" : "UV por caras");
  };
  $("#uvFitBtn").onclick = () => FD.proj && FD.proj.matchSizes();
  $("#uvBaseBtn").onclick = $("#paintBaseBtn").onclick = () => {
    const n = paintBaseColors(true, false);
    if (!n) return toast("No hay caras con UV para rellenar");
    const t = TX.active;
    t.dirty = true;
    t.snap = t.cur = snapOf(t);
    uploadTex();
    pushHist("Textura base de colores");
    markDirty();
    drawUV();
    toast("Textura rellenada con los colores de " + n + " caras");
  };
  /* ───────── Archivo: abrir/guardar JSON, texturas ───────── */
  function download(name, data, type) {
    const a = document.createElement("a");
    a.href = typeof data === "string" && data.indexOf("data:") === 0 ? data : URL.createObjectURL(new Blob([data], { type }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  function stripJson(t) {
    return t.replace(/^﻿/, "").replace(/^\s*\/\/.*$/gm, "");
  }
  /* ───────── Teclado ───────── */
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    const typing = tag === "input" || tag === "select" || tag === "textarea";
    const mod = e.ctrlKey || e.metaKey;
    const k = e.key.toLowerCase();
    if (e.key === "Escape") {
      const m = document.querySelector(".modal-bg");
      if (m) m.remove();
      $("#morePop").hidden = true;
      $("#menu").hidden = true;
      return;
    }
    if (mod && k === "s") {
      e.preventDefault();
      $("#saveBtn").click();
      return;
    }
    if (mod && k === "z") {
      if (typing && tag !== "select" && e.target.type !== "number") return;
      e.preventDefault();
      e.shiftKey ? redo() : undo();
      return;
    }
    if (mod && k === "y") {
      e.preventDefault();
      redo();
      return;
    }
    if (typing || document.querySelector(".modal-bg")) return;
    if (S.mode === "anim" && mod && (k === "c" || k === "v")) return;
    if (mod && k === "d") {
      e.preventDefault();
      dup();
      return;
    }
    if (mod && k === "a") {
      e.preventDefault();
      selectAll();
      return;
    }
    if (mod && k === "c") return T_copy();
    if (mod && k === "v") return T_paste();
    if (mod) return;
    if (e.key === "?") return openShortcuts();
    if (/^[1-4]$/.test(e.key)) return setMode(["edit", "uv", "paint", "anim"][+e.key - 1]);
    const nv = { Numpad1: "front", Numpad3: "side", Numpad7: "top", Numpad0: "iso" }[e.code];
    if (nv) return setView(nv);
    if ((k === "delete" || k === "backspace") && S.mode !== "anim") {
      e.preventDefault();
      return del();
    }
    if (e.shiftKey && k === "a" && S.mode === "edit") return addCube();
    if (e.shiftKey && k === "b" && S.mode === "edit") return addBone();
    if (e.shiftKey && k === "m" && S.mode === "edit") return T_mirror();
    if (S.mode === "edit" || S.mode === "anim") {
      if (k === "v") setTool("select");
      else if (k === "g") setTool("move");
      else if (k === "r") setTool("rotate");
      else if (k === "s") setTool("scale");
    } else if (S.mode === "paint") {
      const m = { b: "pencil", e: "eraser", f: "bucket", c: "face", i: "picker" }[k];
      if (m) setPTool(m);
      if (e.key === "[") $("#brushIn").value = S.brush = Math.max(1, S.brush - 1), $("#brushVal").textContent = S.brush;
      if (e.key === "]") $("#brushIn").value = S.brush = Math.min(16, S.brush + 1), $("#brushVal").textContent = S.brush;
    }
    if (k === "tab") {
      e.preventDefault();
      setMode(S.mode === "edit" ? "paint" : "edit");
    }
    if (k === "f" && (S.mode === "edit" || S.mode === "uv" || S.mode === "anim")) frameModel();
    if (k === "h" && S.sel) {
      selItems().forEach((s) => {
        const t = s.cube || s.bone;
        if (S.hidden.has(t)) S.hidden.delete(t);
        else S.hidden.add(t);
      });
      rebuild();
      renderOutliner();
      requestDraw();
    }
    if (S.mode === "uv" && S.sel && S.sel.cube && e.key.indexOf("Arrow") === 0) {
      const d = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
      e.preventDefault();
      topItems().filter((s) => s.cube).forEach((s) => {
        const c = s.cube;
        if (Array.isArray(c.uv)) c.uv = [Math.max(0, c.uv[0] + d[0]), Math.max(0, c.uv[1] + d[1])];
        else if (c.uv && S.face && c.uv[S.face]) c.uv[S.face].uv = [Math.max(0, c.uv[S.face].uv[0] + d[0]), Math.max(0, c.uv[S.face].uv[1] + d[1])];
      });
      return commit("Mover UV");
    }
    if (S.mode === "edit" && S.sel) {
      const st = S.snap || 1, m = { ArrowRight: [st, 0, 0], ArrowLeft: [-st, 0, 0], ArrowUp: [0, 0, -st], ArrowDown: [0, 0, st], PageUp: [0, st, 0], PageDown: [0, -st, 0] }[e.key];
      if (m) {
        e.preventDefault();
        const items = topItems();
        let partner = null;
        if (S.sym && S.sel) partner = S.sel.cube ? partnerCube(S.sel.cube) : partnerBone(S.sel.bone);
        items.forEach((s) => s.cube ? moveCube(s.cube, m) : moveBone(s.bone, m));
        if (partner) {
          const mm = [-m[0], m[1], m[2]];
          if (S.sel.cube) moveCube(partner, mm);
          else moveBone(partner, mm);
        }
        commit("Mover con teclas");
      }
    }
  });
  window.addEventListener("beforeunload", (e) => {
    if (S.dirty) {
      saveDraft();
      e.preventDefault();
      e.returnValue = "";
    }
  });
  window.addEventListener("pagehide", () => {
    if (S.dirty) saveDraft();
  });
  new ResizeObserver(() => requestDraw()).observe(view);
  window.addEventListener("resize", requestDraw);
  /* ───────── Búsqueda del primer modelo y arranque ───────── */
  function fdFirstGeo(n) {
    for (const c of n.children || []) {
      if (c.type === "folder") {
        const r = fdFirstGeo(c);
        if (r) return r;
      } else if (/\.geo\.json$/i.test(c.name)) return c;
    }
    return null;
  }
  async function init() {
    hydrateIcons();
    help();
    updUndo();
    renderRecent();
    initGL();
    try {
      S.project = S.projId ? await idb.get(STORE_DATA, S.projId) : null;
    } catch (e) {
      S.project = null;
    }
    let node = S.project && S.fileId ? findNode(S.fileId, S.project.root) : null;
    if (S.project) {
      try {
        localStorage.setItem("devstudio_active_project", S.project.id);
      } catch (e) {
      }
    }
    if (node && /\.animation\.json$/i.test(node.name)) {
      FD.pendingAnimNode = node;
      node = fdFirstGeo(S.project.root);
    }
    if (!node && S.project) node = fdFirstGeo(S.project.root);
    S.node = node;
    if (!S.node) {
      S.project = null;
      S.node = { name: "ejemplo.geo.json", content: "" };
      setSaveState("Demostración (no se guarda)", "dirty");
    }
    S.standalone = !!(S.project && S.project.root && S.project.root.kind === "model");
    if (S.standalone) {
      const bk = $("#backBtn");
      bk.href = "/";
      bk.title = "Volver al inicio";
    }
    $("#fileName").textContent = S.node.name;
    const pm = S.project && S.project.meta && S.project.meta[S.node.id] || {};
    S.meta.colors = pm.colors || {};
    S.meta.bcolors = pm.bcolors || {};
    let root = null;
    const raw = (S.node.content || "").trim();
    let parseErr = null;
    if (raw) {
      try {
        root = JSON.parse(stripJson(raw));
      } catch (e) {
        parseErr = e;
        toast("El JSON del archivo tiene errores (" + e.message + "); se abrió un modelo vacío y no se sobrescribe hasta que guardes.", 6000, "bad");
      }
    }
    if (!root || !parseGeos(root).length) root = emptyRoot("geometry." + slugOf(S.node.name.replace(/\.(geo\.)?json$/i, "")));
    let recovered = false;
    try {
      const dr = JSON.parse(localStorage.getItem(draftKey()) || "null");
      if (dr && dr.geo) {
        if (dr.geo !== JSON.stringify(root) || dr.x && dr.x.anim) {
          if (await confirmDlg("Hay un borrador sin guardar de tu última sesión (" + new Date(dr.t).toLocaleString() + "). ¿Recuperarlo?", { ok: "Recuperar", cancel: "Descartar" })) {
            root = JSON.parse(dr.geo);
            FD.draftData = dr;
            recovered = true;
          } else clearDraft();
        }
      }
    } catch (e) {
    }
    S.root = root;
    S.geos = parseGeos(root);
    S.gi = 0;
    readDims();
    applyColors();
    newBlankTex(S.texW, S.texH);
    rebuild();
    frameModel();
    await Promise.all(FD.hooks.init.map((f) => f()));
    rebuild();
    pushHist("Abrir");
    refreshAll();
    fillTexSel();
    uploadTex();
    if (isMobile()) $("#app").setAttribute("data-sheet", "");
    S.dirty = false;
    if (S.project) setSaveState("Listo", "");
    if (recovered) markDirty();
    updToolsState();
    FD.hooks.refresh.forEach((f) => f("init"));
    window.__MODEL = { S, bones, faces: () => faces, pick, TX };
  }
  Object.assign(FD, { bindScrub, writeDims, readDims, S, TX, M, $, $$, ic, hydrateIcons, toast, modal, ask, confirmDlg, ctxMenu, esc, round, clamp, num, idb, STORE_DATA, STORE_INDEX, findNode, findParent, allFiles, uid, bones, boneByName, parentOf, childrenOf, descendants, rebuild, requestDraw, refreshAll, refreshProps, commit, pushHist, markDirty, select, boneMatrix, project, pick, setTool, setMode, save, download, stripJson, FACE_NAMES, G, geoName, geoSlug, slugOf, renderOutliner, frameModel, uploadTex, activate, addTexture, makeTex, snapOf, loadImage, newBlankTex, pixelsBlank, ensureTexNode, fillTexSel, texCandidates, saveDraft, clearDraft, newBoneName, isMobile, allCubes, cubesOf, boneOfCube, faceUVs, packBoxUV, autoUV, paintBaseColors, cubeColor, boneColor, tint, COLORS, hexRGBn, rgbHex, setColor, drawUV, uvFit, setTopTab, setColorMode, openShortcuts, fdFirstGeo, parseGeos, emptyRoot, selItems, topItems, setSaveState, setPTool, status, T_scale, T_vis, T_recolor, getTex: () => tex, getHist: () => ({ hist, hpos }), getHistLock: () => histLock, init, modelBounds, mirrorCube, cloneBoneTree, cloneCube, hashStr });
  window.FD = FD;
})();

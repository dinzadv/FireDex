(function() {
  "use strict";
  const U = window.FD_UTIL;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const num = (v, d) => {
    const n = parseFloat(v);
    return isFinite(n) ? n : d;
  };
  const r2 = (n) => Math.round(n * 100) / 100;
  const ANCHORS = ["top_left", "top_middle", "top_right", "left_middle", "center", "right_middle", "bottom_left", "bottom_middle", "bottom_right"];
  const AF = { top_left: [0, 0], top_middle: [0.5, 0], top_right: [1, 0], left_middle: [0, 0.5], center: [0.5, 0.5], right_middle: [1, 0.5], bottom_left: [0, 1], bottom_middle: [0.5, 1], bottom_right: [1, 1] };
  const DEVICES = { pc: ["Desktop 1920\xD71080", 1920, 1080], tablet: ["Tablet 1280\xD7800", 1280, 800], phone: ["Phone 2400\xD71080", 2400, 1080] };
  const S = { ns: "my_hud", device: "pc", gui: 3, snap: 8, vanilla: true, safe: false, grid: false, els: [], sel: null, vis: "always", key: "my_hud", hud: true, rp: "", tab: "layers" };
  let hist = [], hi = -1, timer = null, step = "edit", report = null, uidn = 1;
  const snapshot = () => JSON.stringify(S.els);
  function commit() {
    hist = hist.slice(0, hi + 1);
    hist.push(snapshot());
    if (hist.length > 80) hist.shift();
    hi = hist.length - 1;
    saveDraft();
  }
  const PAGE = () => !!window.FD_PAGE_MODE;
  const dkey = () => "fd_hud_draft_" + (typeof state !== "undefined" && state && state.id ? state.id : "x");
  function saveDraft() {
    if (!PAGE()) return;
    try {
      localStorage.setItem(dkey(), JSON.stringify({ els: S.els, ns: S.ns, device: S.device, gui: S.gui, snap: S.snap, vis: S.vis, key: S.key, hud: S.hud, rp: S.rp, uidn }));
    } catch (e) {
    }
  }
  function loadDraft() {
    try {
      const d = JSON.parse(localStorage.getItem(dkey()) || "null");
      if (d && Array.isArray(d.els)) {
        Object.assign(S, { els: d.els, ns: d.ns || S.ns, device: d.device || S.device, gui: d.gui || S.gui, snap: d.snap == null ? S.snap : d.snap, vis: d.vis || S.vis, key: d.key || S.key, hud: d.hud !== false, rp: d.rp || S.rp });
        if (d.uidn) uidn = Math.max(uidn, d.uidn);
        return true;
      }
    } catch (e) {
    }
    return false;
  }
  function clearDraft() {
    try {
      localStorage.removeItem(dkey());
    } catch (e) {
    }
  }
  function leave() {
    closeModal();
    if (PAGE()) window.FD_PAGE_BACK();
    else showToolboxModal();
  }
  function undo() {
    if (hi > 0) {
      hi--;
      S.els = JSON.parse(hist[hi]);
      if (!S.els.find((e) => e.id === S.sel)) S.sel = null;
      refresh();
    }
  }
  function redo() {
    if (hi < hist.length - 1) {
      hi++;
      S.els = JSON.parse(hist[hi]);
      if (!S.els.find((e) => e.id === S.sel)) S.sel = null;
      refresh();
    }
  }
  const cur = () => S.els.find((e) => e.id === S.sel) || null;
  const logical = () => {
    const d = DEVICES[S.device];
    return [Math.ceil(d[1] / S.gui), Math.ceil(d[2] / S.gui)];
  };
  const hex2rgb = (h) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(h || "");
    const n = m ? parseInt(m[1], 16) : 16777215;
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  };
  const rgb01 = (h) => hex2rgb(h).map((v) => r2(v / 255));
  const uniqName = (base) => {
    let n = U.slug(base) || "element", k = 2, o = n;
    while (S.els.some((e) => e.name === n)) n = o + "_" + k++;
    return n;
  };
  function addEl(type, extra) {
    const [W, H] = logical();
    const e = Object.assign({ id: "e" + uidn++, type, name: uniqName(type), anchor: "center", x: 0, y: 0, w: 64, h: 32, color: "#ffffff", alpha: 1, text: "Hello world", scale: 1, shadow: true, tex: null, frames: 1, fps: 8 }, extra || {});
    if (type === "panel") {
      e.color = "#000000";
      e.alpha = 0.5;
      e.w = 100;
      e.h = 40;
    }
    if (type === "label") {
      e.w = 0;
      e.h = 0;
      e.anchor = "top_middle";
      e.y = 20;
    }
    e.w = Math.min(e.w, W);
    e.h = Math.min(e.h, H);
    S.els.push(e);
    S.sel = e.id;
    commit();
    refresh();
    return e;
  }
  function canvasToTex(cv, file) {
    return { src: cv.toDataURL("image/png"), nw: cv.width, nh: cv.height, file: U.slug(file || "image") };
  }
  function pickUpload(cb) {
    const inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "image/*";
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f), im = new Image();
      im.onload = () => {
        const c = document.createElement("canvas");
        c.width = im.naturalWidth;
        c.height = im.naturalHeight;
        c.getContext("2d").drawImage(im, 0, 0);
        URL.revokeObjectURL(url);
        cb(canvasToTex(c, f.name.replace(/\.[^.]+$/, "")));
      };
      im.onerror = () => showToast("Could not read that image.");
      im.src = url;
    };
    inp.click();
  }
  function pickVanilla(cb) {
    if (!window.FD_VANILLA_PICK || !window.FD_VANILLA) return showToast("Vanilla texture picker is not available.");
    window.FD_VANILLA_PICK((name) => {
      FD_VANILLA.canvas(name).then((c) => {
        reopen();
        cb(canvasToTex(c, name));
      }).catch(() => {
        reopen();
        showToast("Could not load the texture (offline?).");
      });
    });
  }
  function reopen() {
    if (!document.getElementById("fdhRoot")) open(true);
  }
  function setTex(el, t) {
    el.tex = t;
    const n = Math.max(1, el.frames), fh = Math.floor(t.nh / n);
    el.w = Math.min(t.nw, 256);
    el.h = Math.round(el.w * fh / t.nw);
    if (el.name.startsWith("image")) el.name = uniqName(t.file);
    commit();
    refresh();
  }
  const HEART = [".##...##.", "#########", "#########", "#########", ".#######.", "..#####..", "...###...", "....#...."];
  function px(g, rows, x, y, fill, line) {
    rows.forEach((r, j) => [...r].forEach((c, i) => {
      if (c === "#") {
        g.fillStyle = line;
        g.fillRect(x + i - 1, y + j, 3, 1);
        g.fillRect(x + i, y + j - 1, 1, 3);
      }
    }));
    rows.forEach((r, j) => [...r].forEach((c, i) => {
      if (c === "#") {
        g.fillStyle = fill;
        g.fillRect(x + i, y + j, 1, 1);
      }
    }));
  }
  function drawVanilla(cv, W, H) {
    cv.width = W;
    cv.height = H;
    const g = cv.getContext("2d");
    g.imageSmoothingEnabled = false;
    const sky = g.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#6f9fe0");
    sky.addColorStop(0.62, "#a8c8f0");
    sky.addColorStop(0.62, "#5d9b3b");
    sky.addColorStop(0.68, "#5d9b3b");
    sky.addColorStop(0.68, "#866043");
    sky.addColorStop(1, "#6b4c33");
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
    if (!S.vanilla) return;
    const cx = Math.floor(W / 2), hy = H - 22;
    g.fillStyle = "#000000b0";
    g.fillRect(cx - 91, hy, 182, 22);
    for (let i = 0; i < 9; i++) {
      const sx = cx - 90 + i * 20;
      g.fillStyle = "#8b8b8b";
      g.fillRect(sx, hy + 1, 20, 20);
      g.fillStyle = "#373737";
      g.fillRect(sx, hy + 1, 20, 1);
      g.fillRect(sx, hy + 1, 1, 20);
      g.fillStyle = "#fff";
      g.fillRect(sx + 19, hy + 1, 1, 20);
      g.fillRect(sx, hy + 20, 20, 1);
      g.fillStyle = "#8b8b8b";
      g.fillRect(sx + 1, hy + 2, 18, 18);
    }
    g.strokeStyle = "#fff";
    g.lineWidth = 2;
    g.strokeRect(cx - 91, hy - 1, 24, 24);
    g.strokeStyle = "#000";
    g.lineWidth = 1;
    g.strokeRect(cx - 92, hy - 2, 26, 26);
    const items = ["#c8a165", "#9a9a9a", "#58c1c9", "#d84d4d", "#e5c34a"];
    items.forEach((c, i) => {
      g.fillStyle = c;
      g.fillRect(cx - 86 + i * 40, hy + 5, 12, 12);
      g.fillStyle = "#0003";
      g.fillRect(cx - 86 + i * 40 + 8, hy + 5, 4, 12);
    });
    g.fillStyle = "#000";
    g.fillRect(cx - 91, hy - 9, 182, 5);
    g.fillStyle = "#7ec850";
    g.fillRect(cx - 90, hy - 8, 110, 3);
    for (let i = 0; i < 10; i++) {
      px(g, HEART, cx - 91 + i * 8, hy - 20, "#e41b1b", "#2a0000");
      g.fillStyle = "#ff8a8a";
      g.fillRect(cx - 91 + i * 8 + 1, hy - 19, 2, 1);
    }
    for (let i = 0; i < 10; i++) {
      const x = cx + 91 - 9 - i * 8, y = hy - 20;
      g.fillStyle = "#3a2000";
      g.fillRect(x - 1, y + 1, 9, 7);
      g.fillStyle = "#c5732a";
      g.fillRect(x, y + 1, 7, 6);
      g.fillStyle = "#e9a45e";
      g.fillRect(x + 1, y + 2, 3, 2);
    }
    g.fillStyle = "#ffffffd0";
    g.fillRect(Math.floor(W / 2) - 1, Math.floor(H / 2) - 7, 2, 14);
    g.fillRect(Math.floor(W / 2) - 7, Math.floor(H / 2) - 1, 14, 2);
    g.font = "8px monospace";
    const lines = ["<Steve> hello", "Alex joined the game", "[Server] Welcome!"];
    lines.forEach((t, i) => {
      const y = hy - 52 + i * 10;
      g.fillStyle = "#00000070";
      g.fillRect(2, y, 150, 9);
      g.fillStyle = "#fff";
      g.textBaseline = "top";
      g.fillText(t, 4, y + 1);
    });
  }
  function open(keep) {
    if (!PAGE() && typeof state !== "undefined" && state && state.id) {
      location.href = "/ui/?id=" + encodeURIComponent(state.id);
      return;
    }
    if (PAGE() && !keep && !hist.length) loadDraft();
    if (!keep) {
      step = "edit";
      if (!hist.length) {
        commit();
      }
      if (!S.rp) S.rp = defaultRP();
    }
    if (!S.rp) S.rp = defaultRP();
    showModal('<div class="modal fdh-modal' + (PAGE() ? " fdh-page" : "") + '" id="fdhRoot"></div>', () => refresh());
  }
  function pathOf(node, root, pre) {
    root = root || state.root;
    pre = pre || "";
    for (const c of root.children || []) {
      if (c.type !== "folder") continue;
      const p = pre ? pre + "/" + c.name : c.name;
      if (c === node) return p;
      const r = pathOf(node, c, p);
      if (r) return r;
    }
    return "";
  }
  function defaultRP() {
    try {
      const f = U.findPacks().rp;
      if (f) return pathOf(f.folder);
    } catch (e) {
    }
    return "RP";
  }
  function refresh() {
    const root = document.getElementById("fdhRoot");
    if (!root) return;
    clearInterval(timer);
    root.innerHTML = step === "done" ? doneHtml() : editHtml();
    step === "done" ? wireDone(root) : wireEdit(root);
  }
  const IC = {
    img: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m21 16-5-5-8 8"/></svg>',
    txt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 6V4h14v2M12 4v16M9 20h6"/></svg>',
    pan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="6" width="16" height="12" rx="1"/></svg>',
    undo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 14 5-5-5-5M20 9H10a6 6 0 0 0 0 12h3"/></svg>',
    dup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
    del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 15 6-6 6 6"/></svg>',
    dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>'
  };
  const typeIcon = (t) => t === "image" ? IC.img : t === "label" ? IC.txt : IC.pan;
  function editHtml() {
    const tabs = [["layers", "Layers"], ["props", "Properties"], ["export", "Export"]];
    return `<div class="tbx-tool-head"><button class="tbx-back" id="fdhBack">${UI_ICONS.back}</button><h3>HUD / UI Designer</h3></div>
<div class="fdh-bar">
  <button class="fdh-b" data-add="image">${IC.img}<span>Image</span></button><button class="fdh-b" data-add="label">${IC.txt}<span>Text</span></button><button class="fdh-b" data-add="panel">${IC.pan}<span>Panel</span></button>
  <span class="fdh-sep"></span>
  <button class="fdh-b ico" id="fdhUndo" title="Undo"${hi > 0 ? "" : " disabled"}>${IC.undo}</button><button class="fdh-b ico" id="fdhRedo" title="Redo"${hi < hist.length - 1 ? "" : " disabled"}>${IC.redo}</button>
  <button class="fdh-b ico fdh-dots" id="fdhDots" title="More options">${IC.dots}</button>
  <span class="fdh-sep"></span>
  <select id="fdhDev" title="Screen preset">${Object.keys(DEVICES).map((k) => `<option value="${k}"${S.device === k ? " selected" : ""}>${DEVICES[k][0]}</option>`).join("")}</select>
  <select id="fdhGui" title="GUI scale">${[1, 2, 3, 4].map((n) => `<option value="${n}"${S.gui === n ? " selected" : ""}>GUI scale ${n}</option>`).join("")}</select>
  <select id="fdhSnap" title="Snap to grid">${[0, 2, 4, 8, 16].map((n) => `<option value="${n}"${S.snap === n ? " selected" : ""}>${n ? "Snap " + n + " px" : "No snap"}</option>`).join("")}</select>
  <label class="fdh-chk"><input type="checkbox" id="fdhVan"${S.vanilla ? " checked" : ""}> Vanilla HUD</label>
  <label class="fdh-chk"><input type="checkbox" id="fdhSafe"${S.safe ? " checked" : ""}> Safe area</label>
  <label class="fdh-chk"><input type="checkbox" id="fdhGrid"${S.grid ? " checked" : ""}> Grid</label>
</div>
<div class="fdh-main">
  <div class="fdh-stagewrap" id="fdhWrap"><div class="fdh-scaler" id="fdhScaler"><div class="fdh-stage" id="fdhStage"><canvas id="fdhBg"></canvas><div class="fdh-guides" id="fdhGuides"></div><div class="fdh-els" id="fdhEls"></div></div></div>
    <div class="fdh-hint" id="fdhHint"></div></div>
  <div class="fdh-side">
    <div class="fdh-tabs">${tabs.map((t) => `<button data-tab="${t[0]}" class="${S.tab === t[0] ? "on" : ""}">${t[1]}</button>`).join("")}</div>
    <div class="fdh-pane" id="fdhPane">${S.tab === "layers" ? layersHtml() : S.tab === "props" ? propsHtml() : exportHtml()}</div>
  </div>
</div>`;
  }
  function layersHtml() {
    if (!S.els.length) return '<div class="fdh-empty">No elements yet.<br>Use <b>Image</b>, <b>Text</b> or <b>Panel</b> above to add one.</div>';
    return `<div class="fdh-layers">${S.els.slice().reverse().map((e) => `<div class="fdh-layer${e.id === S.sel ? " on" : ""}" data-sel="${e.id}">${typeIcon(e.type)}<span class="nm">${esc(e.name)}</span>
<button data-act="up" data-id="${e.id}" title="Bring forward">${IC.up}</button><button data-act="down" data-id="${e.id}" title="Send backward">${IC.down}</button><button data-act="dup" data-id="${e.id}" title="Duplicate">${IC.dup}</button><button data-act="del" data-id="${e.id}" title="Delete">${IC.del}</button></div>`).join("")}</div>
<div class="fdh-note">Top of the list = drawn in front.</div>`;
  }
  function fld(l, inner) {
    return `<div class="fdh-f"><label>${l}</label>${inner}</div>`;
  }
  function propsHtml() {
    const e = cur();
    if (!e) return '<div class="fdh-empty">Select an element on the stage or in Layers.</div>';
    const n = (k, v, extra) => `<input type="number" data-k="${k}" value="${v}" ${extra || ""}>`;
    let h = fld("Name (control id)", `<input type="text" data-k="name" value="${esc(e.name)}">`);
    h += fld("Anchor", `<div class="fdh-anch">${ANCHORS.map((a) => `<button data-anchor="${a}" class="${e.anchor === a ? "on" : ""}" title="${a}"><i></i></button>`).join("")}</div>`);
    h += `<div class="fdh-row2">${fld("Offset X", n("x", e.x))}${fld("Offset Y", n("y", e.y))}</div>`;
    if (e.type !== "label") h += `<div class="fdh-row2">${fld("Width", n("w", e.w, 'min="1"'))}${fld("Height", n("h", e.h, 'min="1"'))}</div>`;
    if (e.type === "image") {
      h += fld("Texture", `<div class="fdh-texrow">${e.tex ? `<img class="fdh-thumb" src="${e.tex.src}" alt="">` : '<div class="fdh-thumb none">?</div>'}<div><button class="fdh-b sm" id="fdhUp">Upload PNG</button> <button class="fdh-b sm" id="fdhVan2">Vanilla block</button></div></div>`);
      h += `<div class="fdh-row2">${fld("Frames (vertical strip)", n("frames", e.frames, 'min="1" max="64"'))}${fld("FPS", n("fps", e.fps, 'min="1" max="30"'))}</div>`;
      h += fld("Tint", `<input type="color" data-k="color" value="${e.color}">`);
    }
    if (e.type === "label") {
      h += fld("Text", `<input type="text" data-k="text" value="${esc(e.text)}">`);
      h += `<div class="fdh-row2">${fld("Color", `<input type="color" data-k="color" value="${e.color}">`)}${fld("Font scale", n("scale", e.scale, 'min="0.5" max="8" step="0.5"'))}</div>`;
      h += `<label class="fdh-chk"><input type="checkbox" data-k="shadow"${e.shadow ? " checked" : ""}> Text shadow</label>`;
    }
    if (e.type === "panel") h += fld("Color", `<input type="color" data-k="color" value="${e.color}">`);
    h += fld("Opacity " + Math.round(e.alpha * 100) + "%", `<input type="range" data-k="alpha" min="0" max="1" step="0.05" value="${e.alpha}">`);
    return h;
  }
  function exportHtml() {
    return `${fld("File / namespace", `<input type="text" id="fdhNs" value="${esc(S.ns)}">`)}
${fld("Resource pack folder", `<input type="text" id="fdhRp" list="fdhRpL" value="${esc(S.rp)}"><datalist id="fdhRpL">${U.folderPaths().map((p) => `<option value="${esc(p)}">`).join("")}</datalist>`)}
${fld("Visibility", `<select id="fdhVis"><option value="always"${S.vis === "always" ? " selected" : ""}>Always visible</option><option value="title"${S.vis === "title" ? " selected" : ""}>Only while a /title with a key is shown</option></select>`)}
<div id="fdhKeyBox" style="${S.vis === "title" ? "" : "display:none"}">${fld("Title key", `<input type="text" id="fdhKey" value="${esc(S.key)}">`)}</div>
<label class="fdh-chk"><input type="checkbox" id="fdhHud"${S.hud ? " checked" : ""}> Add it to ui/hud_screen.json (merge)</label>
<div class="fdh-note">Files are written to <code>ui/</code> and <code>textures/ui/</code> inside that folder (created if it does not exist).</div>
<button class="btn btn-primary fdh-save" id="fdhSave"${S.els.length ? "" : " disabled"}>Generate files</button>`;
  }
  function renderStage() {
    const wrap = document.getElementById("fdhWrap"), scaler = document.getElementById("fdhScaler"), stage = document.getElementById("fdhStage"), els = document.getElementById("fdhEls");
    if (!stage) return;
    const [W, H] = logical();
    const avail = Math.max(200, wrap.clientWidth - 2), maxH = PAGE() ? Math.max(140, wrap.clientHeight - 36) : window.innerWidth < 800 ? 300 : Math.max(240, window.innerHeight * 0.56);
    const k = Math.min(avail / W, maxH / H);
    stage._k = k;
    scaler.style.width = Math.round(W * k) + "px";
    scaler.style.height = Math.round(H * k) + "px";
    stage.style.width = W + "px";
    stage.style.height = H + "px";
    stage.style.transform = "scale(" + k + ")";
    drawVanilla(document.getElementById("fdhBg"), W, H);
    const gd = document.getElementById("fdhGuides");
    gd.innerHTML = "";
    if (S.grid && S.snap) gd.style.backgroundImage = `linear-gradient(#fff2 1px,transparent 1px),linear-gradient(90deg,#fff2 1px,transparent 1px)`, gd.style.backgroundSize = S.snap + "px " + S.snap + "px";
    else gd.style.backgroundImage = "none";
    if (S.safe) gd.innerHTML = `<div class="fdh-safe" style="left:${W * 0.05}px;top:${H * 0.05}px;right:${W * 0.05}px;bottom:${H * 0.05}px"></div>`;
    els.innerHTML = "";
    S.els.forEach((e, i) => {
      const f = AF[e.anchor], d = document.createElement("div");
      d.className = "fdh-el t-" + e.type + (e.id === S.sel ? " sel" : "");
      d.dataset.id = e.id;
      d.style.cssText = `left:${f[0] * 100}%;top:${f[1] * 100}%;transform:translate(${-f[0] * 100}%,${-f[1] * 100}%) translate(${e.x}px,${e.y}px);z-index:${i + 1};opacity:${e.alpha}`;
      if (e.type === "image") {
        d.style.width = e.w + "px";
        d.style.height = e.h + "px";
        if (e.tex) {
          const n = Math.max(1, e.frames);
          d.style.backgroundImage = `url(${e.tex.src})`;
          d.style.backgroundSize = `100% ${n * 100}%`;
          d.dataset.fr = n;
          d.dataset.fps = e.fps;
        } else d.classList.add("empty");
        if (e.color && e.color.toLowerCase() !== "#ffffff") d.style.setProperty("--tint", e.color);
      } else if (e.type === "panel") {
        d.style.width = e.w + "px";
        d.style.height = e.h + "px";
        d.style.background = e.color;
      } else {
        d.textContent = e.text || " ";
        d.style.fontSize = 8 * e.scale + "px";
        d.style.color = e.color;
        d.style.textShadow = e.shadow ? `${e.scale}px ${e.scale}px 0 #3f3f3f` : "none";
      }
      if (e.id === S.sel) {
        d.style.outlineWidth = Math.max(1, 1.5 / k) + "px";
        ["nw", "ne", "sw", "se"].forEach((c) => {
          if (e.type === "label") return;
          const hnd = document.createElement("i");
          hnd.className = "fdh-h " + c;
          hnd.dataset.h = c;
          const s = 9 / k;
          hnd.style.cssText = `width:${s}px;height:${s}px;${c[0] === "n" ? "top" : "bottom"}:${-s / 2}px;${c[1] === "w" ? "left" : "right"}:${-s / 2}px`;
          d.appendChild(hnd);
        });
      }
      els.appendChild(d);
    });
    const hint = document.getElementById("fdhHint");
    if (hint) hint.textContent = `Logical screen ${W}\xD7${H} (GUI scale ${S.gui}) \xB7 drag to move \xB7 arrows nudge 1 px (Shift = 8)`;
    startAnim();
  }
  function startAnim() {
    clearInterval(timer);
    const list = () => document.querySelectorAll("#fdhEls .fdh-el[data-fr]");
    if (![...list()].some((d) => +d.dataset.fr > 1)) return;
    timer = setInterval(() => {
      if (!document.getElementById("fdhRoot")) return clearInterval(timer);
      list().forEach((d) => {
        const n = +d.dataset.fr;
        if (n > 1) {
          const f = Math.floor(Date.now() / 1e3 * (+d.dataset.fps || 8)) % n;
          d.style.backgroundPosition = "0 " + f / (n - 1) * 100 + "%";
        }
      });
    }, 80);
  }
  function drag(ev, stage) {
    const t = ev.target, id = (t.closest(".fdh-el") || {}).dataset && t.closest(".fdh-el").dataset.id;
    if (!id) {
      S.sel = null;
      refresh();
      return;
    }
    const e = S.els.find((x) => x.id === id);
    if (!e) return;
    if (S.sel !== id) {
      S.sel = id;
      if (S.tab === "layers" || S.tab === "props") {
      }
      renderStage();
      refreshPane();
    }
    ev.preventDefault();
    const k = stage._k, sx = ev.clientX, sy = ev.clientY, o = { x: e.x, y: e.y, w: e.w, h: e.h }, hnd = t.dataset && t.dataset.h, f = AF[e.anchor], [W, H] = logical();
    let moved = false;
    const g = S.snap || 1;
    const sn = (v) => S.snap ? Math.round(v / g) * g : Math.round(v);
    const mv = (m) => {
      const dx = (m.clientX - sx) / k, dy = (m.clientY - sy) / k;
      if (Math.abs(dx) + Math.abs(dy) > 1) moved = true;
      if (!moved) return;
      if (!hnd) {
        e.x = sn(o.x + dx);
        e.y = sn(o.y + dy);
      } else {
        const ax = f[0] * W, ay = f[1] * H;
        let L = ax - f[0] * o.w + o.x, T = ay - f[1] * o.h + o.y, R = L + o.w, B = T + o.h;
        if (hnd[1] === "e") R = sn(R + dx);
        else L = sn(L + dx);
        if (hnd[0] === "s") B = sn(B + dy);
        else T = sn(T + dy);
        e.w = Math.max(1, R - L);
        e.h = Math.max(1, B - T);
        e.x = L - ax + f[0] * e.w;
        e.y = T - ay + f[1] * e.h;
      }
      renderStage();
    };
    const up = () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      if (moved) {
        commit();
        refreshPane();
      }
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  }
  function refreshPane() {
    const p = document.getElementById("fdhPane");
    if (!p) return;
    if (S.tab === "export") return;
    p.innerHTML = S.tab === "layers" ? layersHtml() : propsHtml();
    wirePane(document.getElementById("fdhRoot"));
    const u = document.getElementById("fdhUndo"), r = document.getElementById("fdhRedo");
    if (u) u.disabled = !(hi > 0);
    if (r) r.disabled = !(hi < hist.length - 1);
  }
  function wirePane(root) {
    const pane = root.querySelector("#fdhPane");
    if (!pane) return;
    pane.querySelectorAll("[data-sel]").forEach((d) => d.onclick = (ev) => {
      const b = ev.target.closest("[data-act]");
      if (b) {
        rowAct(b.dataset.act, b.dataset.id);
        return;
      }
      S.sel = d.dataset.sel;
      renderStage();
      refreshPane();
    });
    pane.querySelectorAll("[data-anchor]").forEach((b) => b.onclick = () => {
      const e = cur();
      if (!e) return;
      const W = logical();
      e.anchor = b.dataset.anchor;
      commit();
      renderStage();
      refreshPane();
    });
    pane.querySelectorAll("[data-k]").forEach((inp) => {
      const apply = () => {
        const e = cur();
        if (!e) return;
        const k = inp.dataset.k;
        if (inp.type === "checkbox") e[k] = inp.checked;
        else if (k === "name") e[k] = U.slug(inp.value) || e[k];
        else if (k === "text" || k === "color") e[k] = inp.value;
        else {
          const v = num(inp.value, e[k]);
          e[k] = k === "frames" ? clamp(Math.round(v), 1, 64) : k === "fps" ? clamp(Math.round(v), 1, 30) : k === "w" || k === "h" ? Math.max(1, v) : v;
        }
        renderStage();
      };
      inp.oninput = apply;
      inp.onchange = () => {
        apply();
        commit();
        if (inp.dataset.k === "name" || inp.dataset.k === "frames") refreshPane();
        const u = root.querySelector("#fdhUndo");
        if (u) u.disabled = !(hi > 0);
      };
    });
    const up = pane.querySelector("#fdhUp"), va = pane.querySelector("#fdhVan2");
    if (up) up.onclick = () => {
      const e = cur();
      pickUpload((t) => setTex(e, t));
    };
    if (va) va.onclick = () => {
      const e = cur();
      pickVanilla((t) => {
        const ee = S.els.find((x) => x.id === e.id);
        if (ee) setTex(ee, t);
      });
    };
  }
  function rowAct(act, id) {
    const i = S.els.findIndex((e) => e.id === id);
    if (i < 0) return;
    if (act === "del") {
      S.els.splice(i, 1);
      if (S.sel === id) S.sel = null;
    } else if (act === "dup") {
      const c = JSON.parse(JSON.stringify(S.els[i]));
      c.id = "e" + uidn++;
      c.name = uniqName(c.name);
      c.x += 8;
      c.y += 8;
      S.els.splice(i + 1, 0, c);
      S.sel = c.id;
    } else if (act === "up" && i < S.els.length - 1) {
      [S.els[i], S.els[i + 1]] = [S.els[i + 1], S.els[i]];
    } else if (act === "down" && i > 0) {
      [S.els[i], S.els[i - 1]] = [S.els[i - 1], S.els[i]];
    }
    commit();
    refresh();
  }
  function wireEdit(root) {
    root.querySelector("#fdhBack").onclick = leave;
    root.querySelector("#fdhDots").onclick = () => moreDialog(root);
    root.querySelectorAll("[data-add]").forEach((b) => b.onclick = () => {
      const t = b.dataset.add;
      const e = addEl(t);
      S.tab = t === "image" ? "props" : "props";
      refresh();
      if (t === "image") {
        pickUpload((tx) => {
          const ee = S.els.find((x) => x.id === e.id);
          if (ee) setTex(ee, tx);
        });
      }
    });
    root.querySelector("#fdhUndo").onclick = undo;
    root.querySelector("#fdhRedo").onclick = redo;
    root.querySelector("#fdhDev").onchange = (ev) => {
      S.device = ev.target.value;
      renderStage();
    };
    root.querySelector("#fdhGui").onchange = (ev) => {
      S.gui = +ev.target.value;
      renderStage();
    };
    root.querySelector("#fdhSnap").onchange = (ev) => {
      S.snap = +ev.target.value;
      renderStage();
    };
    root.querySelector("#fdhVan").onchange = (ev) => {
      S.vanilla = ev.target.checked;
      renderStage();
    };
    root.querySelector("#fdhSafe").onchange = (ev) => {
      S.safe = ev.target.checked;
      renderStage();
    };
    root.querySelector("#fdhGrid").onchange = (ev) => {
      S.grid = ev.target.checked;
      renderStage();
    };
    root.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => {
      const same = S.tab === b.dataset.tab;
      S.tab = b.dataset.tab;
      if (PAGE()) root.dataset.sheet = same && root.dataset.sheet === "1" ? "0" : "1";
      refresh();
    });
    const stage = root.querySelector("#fdhStage");
    stage.addEventListener("pointerdown", (ev) => drag(ev, stage));
    wirePane(root);
    const ns = root.querySelector("#fdhNs");
    if (ns) {
      ns.onchange = () => {
        S.ns = U.slug(ns.value) || "my_hud";
        ns.value = S.ns;
      };
      root.querySelector("#fdhRp").onchange = (ev) => {
        S.rp = ev.target.value.trim().replace(/^\/+|\/+$/g, "");
      };
      root.querySelector("#fdhVis").onchange = (ev) => {
        S.vis = ev.target.value;
        root.querySelector("#fdhKeyBox").style.display = S.vis === "title" ? "" : "none";
      };
      root.querySelector("#fdhKey").onchange = (ev) => {
        S.key = ev.target.value.replace(/['"\\\s]/g, "") || "my_hud";
        ev.target.value = S.key;
      };
      root.querySelector("#fdhHud").onchange = (ev) => {
        S.hud = ev.target.checked;
      };
      root.querySelector("#fdhSave").onclick = generate;
    }
    root.onkeydown = (ev) => {
      if (/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") {
        ev.preventDefault();
        ev.shiftKey ? redo() : undo();
        return;
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "y") {
        ev.preventDefault();
        redo();
        return;
      }
      const e = cur();
      if (!e) return;
      const d = ev.shiftKey ? 8 : 1;
      if (ev.key === "Delete" || ev.key === "Backspace") {
        ev.preventDefault();
        rowAct("del", e.id);
      } else if (/^Arrow/.test(ev.key)) {
        ev.preventDefault();
        if (ev.key === "ArrowLeft") e.x -= d;
        if (ev.key === "ArrowRight") e.x += d;
        if (ev.key === "ArrowUp") e.y -= d;
        if (ev.key === "ArrowDown") e.y += d;
        renderStage();
        clearTimeout(root._kc);
        root._kc = setTimeout(() => {
          commit();
          refreshPane();
        }, 400);
      }
    };
    root.tabIndex = -1;
    root.focus && root.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      renderStage();
    });
    if (!root._ro && window.ResizeObserver) {
      root._ro = new ResizeObserver(() => {
        if (document.getElementById("fdhRoot") === root && step === "edit") renderStage();
      });
      root._ro.observe(root.querySelector("#fdhWrap"));
    }
  }
  function whitePng() {
    const c = document.createElement("canvas");
    c.width = c.height = 4;
    const g = c.getContext("2d");
    g.fillStyle = "#fff";
    g.fillRect(0, 0, 4, 4);
    return c.toDataURL("image/png");
  }
  function generate() {
    if (!S.els.length) return showToast("Add at least one element first.");
    const ns = U.slug(S.ns) || "my_hud", rpPath = S.rp || defaultRP();
    let base;
    try {
      base = U.folderByPath(rpPath);
    } catch (e) {
      return showToast("Invalid folder.");
    }
    const created = [], updated = [], warnings = [], pre = rpPath + "/";
    const put = (path, content) => {
      const r = U.getFile(path, base);
      r.node.content = content;
      (r.created ? created : updated).push(pre + path);
      return r;
    };
    const merge = (path, fn, init) => {
      const r = U.getFile(path, base);
      let data = r.created ? null : U.parseJson(r.node.content || "");
      if (!r.created && data === null) {
        warnings.push(`Could not read ${path} (invalid JSON); it was not changed. Add the entry by hand.`);
        return null;
      }
      data = fn(data || init());
      r.node.content = U.J(data);
      (r.created ? created : updated).push(pre + path);
      return data;
    };
    const texFiles = {}, usedNames =  new Set(), keyOf = (n) => {
      let k = n, i = 2;
      while (usedNames.has(k)) k = n + "_" + i++;
      usedNames.add(k);
      return k;
    };
    const ui = { namespace: ns }, controls = [], anims = {};
    let needWhite = false;
    S.els.forEach((e, i) => {
      const key = keyOf(U.slug(e.name) || "element"), ctl = {};
      const base_ = { anchor_from: e.anchor, anchor_to: e.anchor, offset: [r2(e.x), r2(e.y)], alpha: r2(e.alpha), layer: 10 + i };
      if (e.type === "image") {
        if (!e.tex) {
          warnings.push(`Image "${e.name}" has no texture and was skipped.`);
          return;
        }
        let tf = texFiles[e.tex.src];
        if (!tf) {
          let n2 = e.tex.file || e.name, c = 2, o = n2;
          while (Object.values(texFiles).some((t) => t.file === n2)) n2 = o + "_" + c++;
          tf = texFiles[e.tex.src] = { file: n2, src: e.tex.src };
        }
        Object.assign(ctl, { type: "image", texture: "textures/ui/" + tf.file, size: [Math.round(e.w), Math.round(e.h)] }, base_);
        const n = Math.max(1, e.frames);
        if (n > 1) {
          const fw = e.tex.nw, fh = Math.floor(e.tex.nh / n), an = key + "_anim";
          anims[an] = { anim_type: "flip_book", initial_uv: [0, 0], frame_count: n, frame_step: fh, fps: e.fps, reversible: false };
          ctl.uv = "@" + ns + "." + an;
          ctl.uv_size = [fw, fh];
          ctl.texture_file_size = [e.tex.nw, e.tex.nh];
          warnings.push(`"${e.name}": flip-book animation (anim_type flip_book, vertical frames) is generated from documentation notes and is unverified in game.`);
        }
        if (e.color && e.color.toLowerCase() !== "#ffffff") ctl.color = rgb01(e.color);
      } else if (e.type === "panel") {
        needWhite = true;
        Object.assign(ctl, { type: "image", texture: "textures/ui/fd_white", size: [Math.round(e.w), Math.round(e.h)], color: rgb01(e.color) }, base_);
      } else {
        Object.assign(ctl, { type: "label", text: e.text, color: rgb01(e.color), shadow: !!e.shadow, font_scale_factor: e.scale }, base_);
      }
      controls.push({ [key]: ctl });
    });
    if (!controls.length) return showToast("Nothing to export (all images lack a texture).");
    const main = { type: "panel", size: ["100%", "100%"], controls };
    if (S.vis === "title") main.bindings = [{ binding_name: "#hud_title_text_string" }, { binding_type: "view", source_property_name: `(not ((#hud_title_text_string - '${S.key}') = #hud_title_text_string))`, target_property_name: "#visible" }];
    ui.main = main;
    Object.assign(ui, anims);
    put("ui/" + ns + ".json", U.J(ui));
    Object.values(texFiles).forEach((t) => put("textures/ui/" + t.file + ".png", t.src));
    if (needWhite) put("textures/ui/fd_white.png", whitePng());
    merge("ui/_ui_defs.json", (d) => {
      d.ui_defs = Array.isArray(d.ui_defs) ? d.ui_defs : [];
      if (!d.ui_defs.includes("ui/" + ns + ".json")) d.ui_defs.push("ui/" + ns + ".json");
      return d;
    }, () => ({ ui_defs: [] }));
    if (S.hud) merge("ui/hud_screen.json", (d) => {
      d.root_panel = d.root_panel || {};
      d.root_panel.modifications = Array.isArray(d.root_panel.modifications) ? d.root_panel.modifications : [];
      const ref = ns + "_main@" + ns + ".main";
      const dup = d.root_panel.modifications.some((m) => m.array_name === "controls" && JSON.stringify(m.value || "").includes(ref));
      if (!dup) d.root_panel.modifications.push({ array_name: "controls", operation: "insert_front", value: [{ [ref]: {} }] });
      return d;
    }, () => ({}));
    const notes = [
      "The exact JSON UI schema was written from known patterns; test the pack in game (Settings \u2192 Storage/Resource packs \u2192 activate, then rejoin the world).",
      'Panels use a generated white texture (textures/ui/fd_white.png) tinted with "color" and "alpha".',
      'Label sizing, "font_scale_factor" and "layer" values are standard properties but their exact rendering depends on the game version.'
    ];
    if (S.vis === "title") notes.push(`The title key mode shows the panel while a title containing "${S.key}" is on screen. Hiding the title text itself is NOT done here (unverified) \u2014 the key text may also appear on screen.`);
    report = { created, updated, warnings, notes, ns, vis: S.vis, key: S.key, hud: S.hud };
    render();
    saveState();
    showToast(`Saved ${created.length + updated.length} files`);
    step = "done";
    clearInterval(timer);
    refresh();
  }
  function doneHtml() {
    const r = report, cmd = (t) => `<div class="ij-cmd"><code>${esc(t)}</code><button class="btn btn-ghost btn-sm" data-copy="${esc(t)}">Copy</button></div>`;
    return `<div class="tbx-tool-head"><button class="tbx-back" id="fdhBack2">${UI_ICONS.back}</button><h3>Done \u2714</h3></div>
<div class="ij-done"><div><h4>Files</h4><ul class="ij-files">${r.created.map((f) => `<li class="new">+ ${esc(f)}</li>`).join("")}${r.updated.map((f) => `<li>~ ${esc(f)}</li>`).join("")}</ul></div>
<div><h4>${r.vis === "title" ? "Show it in game" : "In game"}</h4>${r.vis === "title" ? `<p>Run these commands to display the HUD, then clear it:</p>${cmd(`/title @s times 0 100 20`)}${cmd(`/title @s title ${r.key}`)}${cmd("/title @s clear")}` : "<p>It shows permanently on the HUD once the resource pack is active.</p>"}
<h4>Notes (unverified)</h4><ul class="fdh-notes">${r.notes.concat(r.warnings).map((n) => `<li>${esc(n)}</li>`).join("")}</ul></div></div>
<div class="modal-actions"><button class="btn btn-ghost" id="fdhEdit">Back to the editor</button><button class="btn btn-primary" id="fdhClose">Close</button></div>`;
  }
  function moreDialog(root) {
    const old = root.querySelector("#fdhPop");
    if (old) old.remove();
    const T = (x) => window.FD_I18N && FD_I18N.t ? FD_I18N.t(x) : x;
    const pop = document.createElement("div");
    pop.id = "fdhPop";
    pop.className = "fdh-pop";
    const opt = (id, arr, cur, f) => `<label class="fdh-pf"><span>${T(id)}</span><select data-ctl="${id}">${arr.map((a) => `<option value="${a[0]}"${String(a[0]) === String(cur) ? " selected" : ""}>${f ? f(a) : a[1]}</option>`).join("")}</select></label>`;
    pop.innerHTML = `<div class="fdh-dlg"><div class="fdh-dh"><b>${T("More options")}</b><button class="fdh-b ico" data-x="1">\u2715</button></div>
<div class="fdh-dbody">
<div class="fdh-grid"><button class="fdh-b" data-m="undo"${hi > 0 ? "" : " disabled"}>${IC.undo}<span>${T("Undo")}</span></button><button class="fdh-b" data-m="redo"${hi < hist.length - 1 ? "" : " disabled"}>${IC.redo}<span>${T("Redo")}</span></button>
<button class="fdh-b" data-m="rename"><span>${T("Rename")}</span></button><button class="fdh-b" data-m="clear"><span>${T("Clear all")}</span></button></div>
${opt("Screen preset", Object.keys(DEVICES).map((k) => [k, DEVICES[k][0]]), S.device, (a) => T(a[1]))}
${opt("GUI scale", [1, 2, 3, 4].map((n) => [n, n]), S.gui)}
${opt("Snap to grid", [0, 2, 4, 8, 16].map((n) => [n, n ? n + " px" : T("No snap")]), S.snap)}
<label class="fdh-chk"><input type="checkbox" data-chk="vanilla"${S.vanilla ? " checked" : ""}> ${T("Vanilla HUD")}</label>
<label class="fdh-chk"><input type="checkbox" data-chk="safe"${S.safe ? " checked" : ""}> ${T("Safe area")}</label>
<label class="fdh-chk"><input type="checkbox" data-chk="grid"${S.grid ? " checked" : ""}> ${T("Grid")}</label>
<button class="btn btn-primary fdh-create" data-m="create">${T("Create in project")}</button></div></div>`;
    root.appendChild(pop);
    const close = () => pop.remove();
    pop.onclick = (ev) => {
      if (ev.target === pop || ev.target.closest("[data-x]")) return close();
      const m = ev.target.closest("[data-m]");
      if (!m || m.disabled) return;
      const a = m.dataset.m;
      if (a === "undo") undo();
      else if (a === "redo") redo();
      else if (a === "rename") {
        const v = prompt(T("File / namespace"), S.ns);
        if (v != null) S.ns = U.slug(v) || "my_hud";
        S.tab = "export";
        refresh();
      } else if (a === "clear") {
        if (S.els.length && confirm(T("Clear all") + "?")) {
          S.els = [];
          S.sel = null;
          commit();
          refresh();
        }
      } else if (a === "create") {
        close();
        generate();
        return;
      }
      close();
    };
    pop.onchange = (ev) => {
      const c = ev.target.dataset.ctl, k = ev.target.dataset.chk;
      if (c === "Screen preset") S.device = ev.target.value;
      else if (c === "GUI scale") S.gui = +ev.target.value;
      else if (c === "Snap to grid") S.snap = +ev.target.value;
      else if (k) S[k] = ev.target.checked;
      saveDraft();
      refresh();
    };
  }
  function wireDone(root) {
    root.querySelector("#fdhBack2").onclick = () => {
      step = "edit";
      refresh();
    };
    root.querySelector("#fdhEdit").onclick = () => {
      step = "edit";
      refresh();
    };
    root.querySelector("#fdhClose").onclick = () => {
      clearDraft();
      leave();
    };
    root.querySelectorAll("[data-copy]").forEach((b) => b.onclick = () => {
      copyToClipboard(b.dataset.copy);
      showToast("Copied");
    });
  }
  TOOLBOX_TOOLS.push({
    id: "hud",
    name: "HUD / UI Designer",
    desc: "Design HUD overlays on a simulated Minecraft screen and export JSON UI.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="4" width="18" height="13" rx="1.5"/><path d="M8 21h8M12 17v4M7 14h4M14 8h3"/></svg>',
    onOpen: () => open(false)
  });
  if (window.FD_I18N) window.FD_I18N.add([
    ["More options", "M\xE1s opciones"],
    ["Rename", "Renombrar"],
    ["Clear all", "Borrar todo"],
    ["Create in project", "Crear en el proyecto"],
    ["HUD / UI Designer", "Dise\xF1ador de HUD / UI"],
    ["Design HUD overlays on a simulated Minecraft screen and export JSON UI.", "Dise\xF1a HUD sobre una pantalla simulada de Minecraft y exporta JSON UI."],
    ["Image", "Imagen"],
    ["Text", "Texto"],
    ["Panel", "Panel"],
    ["Undo", "Deshacer"],
    ["Redo", "Rehacer"],
    ["Screen preset", "Tama\xF1o de pantalla"],
    ["GUI scale", "Escala de GUI"],
    ["Snap to grid", "Ajustar a cuadr\xEDcula"],
    ["Desktop 1920\xD71080", "Escritorio 1920\xD71080"],
    ["Tablet 1280\xD7800", "Tableta 1280\xD7800"],
    ["Phone 2400\xD71080", "Tel\xE9fono 2400\xD71080"],
    ["GUI scale {0}", "Escala de GUI {0}"],
    ["Snap {0} px", "Ajuste {0} px"],
    ["No snap", "Sin ajuste"],
    ["Vanilla HUD", "HUD de Minecraft"],
    ["Safe area", "Zona segura"],
    ["Grid", "Cuadr\xEDcula"],
    ["Layers", "Capas"],
    ["Properties", "Propiedades"],
    ["Export", "Exportar"],
    ["No elements yet.<br>Use <b>Image</b>, <b>Text</b> or <b>Panel</b> above to add one.", "A\xFAn no hay elementos.<br>Usa <b>Imagen</b>, <b>Texto</b> o <b>Panel</b> arriba para a\xF1adir uno."],
    ["Bring forward", "Traer al frente"],
    ["Send backward", "Enviar atr\xE1s"],
    ["Duplicate", "Duplicar"],
    ["Delete", "Eliminar"],
    ["Top of the list = drawn in front.", "Arriba en la lista = se dibuja al frente."],
    ["Select an element on the stage or in Layers.", "Selecciona un elemento en el escenario o en Capas."],
    ["Name (control id)", "Nombre (id del control)"],
    ["Anchor", "Ancla"],
    ["Offset X", "Desplazamiento X"],
    ["Offset Y", "Desplazamiento Y"],
    ["Width", "Ancho"],
    ["Height", "Alto"],
    ["Texture", "Textura"],
    ["Upload PNG", "Subir PNG"],
    ["Vanilla block", "Bloque de Minecraft"],
    ["Frames (vertical strip)", "Fotogramas (tira vertical)"],
    ["FPS", "FPS"],
    ["Tint", "Tinte"],
    ["Color", "Color"],
    ["Font scale", "Escala de fuente"],
    ["Text shadow", "Sombra del texto"],
    ["Opacity {0}%", "Opacidad {0}%"],
    ["File / namespace", "Archivo / namespace"],
    ["Resource pack folder", "Carpeta del resource pack"],
    ["Visibility", "Visibilidad"],
    ["Always visible", "Siempre visible"],
    ["Only while a /title with a key is shown", "Solo mientras se muestre un /title con clave"],
    ["Title key", "Clave del t\xEDtulo"],
    ["Add it to ui/hud_screen.json (merge)", "A\xF1adirlo a ui/hud_screen.json (fusionar)"],
    ["Files are written to <code>ui/</code> and <code>textures/ui/</code> inside that folder (created if it does not exist).", "Los archivos se escriben en <code>ui/</code> y <code>textures/ui/</code> dentro de esa carpeta (se crea si no existe)."],
    ["Generate files", "Generar archivos"],
    ["Logical screen {0}\xD7{1} (GUI scale {2}) \xB7 drag to move \xB7 arrows nudge 1 px (Shift = 8)", "Pantalla l\xF3gica {0}\xD7{1} (escala de GUI {2}) \xB7 arrastra para mover \xB7 flechas = 1 px (Shift = 8)"],
    ["Could not read that image.", "No se pudo leer esa imagen."],
    ["Vanilla texture picker is not available.", "El selector de texturas de Minecraft no est\xE1 disponible."],
    ["Could not load the texture (offline?).", "No se pudo cargar la textura (\xBFsin conexi\xF3n?)."],
    ["Add at least one element first.", "A\xF1ade primero al menos un elemento."],
    ["Invalid folder.", "Carpeta no v\xE1lida."],
    ["Nothing to export (all images lack a texture).", "Nada que exportar (ninguna imagen tiene textura)."],
    ["Saved {0} files", "Se guardaron {0} archivos"],
    ["Done \u2714", "Listo \u2714"],
    ["Files", "Archivos"],
    ["Show it in game", "Mostrarlo en el juego"],
    ["In game", "En el juego"],
    ["Run these commands to display the HUD, then clear it:", "Ejecuta estos comandos para mostrar el HUD y luego quitarlo:"],
    ["It shows permanently on the HUD once the resource pack is active.", "Se muestra de forma permanente en el HUD cuando el resource pack est\xE1 activo."],
    ["Notes (unverified)", "Notas (sin verificar)"],
    ["Copy", "Copiar"],
    ["Copied", "Copiado"],
    ["Back to the editor", "Volver al editor"],
    ["Close", "Cerrar"],
    ["The exact JSON UI schema was written from known patterns; test the pack in game (Settings \u2192 Storage/Resource packs \u2192 activate, then rejoin the world).", "El esquema JSON UI se escribi\xF3 a partir de patrones conocidos; prueba el pack en el juego (activa el resource pack y vuelve a entrar al mundo)."],
    ['Panels use a generated white texture (textures/ui/fd_white.png) tinted with "color" and "alpha".', 'Los paneles usan una textura blanca generada (textures/ui/fd_white.png) te\xF1ida con "color" y "alpha".'],
    ['Label sizing, "font_scale_factor" and "layer" values are standard properties but their exact rendering depends on the game version.', 'El tama\xF1o de las etiquetas, "font_scale_factor" y "layer" son propiedades est\xE1ndar, pero su render exacto depende de la versi\xF3n del juego.']
  ]);
})();

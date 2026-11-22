(function() {
  "use strict";
  const U = window.FD_UTIL, V = window.FD_VANILLA;
  const T = (s) => window.FD_I18N ? window.FD_I18N.t(s) : s;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const ES = [
    ["Textures", "Texturas"],
    ["Pixel-art texture editor. Edit vanilla block textures or create new ones.", "Editor de texturas pixel-art. Edita texturas de bloques de Minecraft o crea nuevas."],
    ["New", "Nueva"],
    ["Vanilla blocks", "Bloques de Minecraft"],
    ["Upload PNG", "Subir PNG"],
    ["Undo", "Deshacer"],
    ["Redo", "Rehacer"],
    ["Grid", "Cuadr\xEDcula"],
    ["Pencil", "L\xE1piz"],
    ["Eraser", "Borrador"],
    ["Fill", "Rellenar"],
    ["Pick color", "Cuentagotas"],
    ["Line", "L\xEDnea"],
    ["Rectangle", "Rect\xE1ngulo"],
    ["Lighten", "Aclarar"],
    ["Darken", "Oscurecer"],
    ["Color", "Color"],
    ["Opacity", "Opacidad"],
    ["Recent", "Recientes"],
    ["Minecraft palette", "Paleta de Minecraft"],
    ["Brush", "Pincel"],
    ["Size", "Tama\xF1o"],
    ["Mirror X", "Espejo X"],
    ["Mirror Y", "Espejo Y"],
    ["Filled", "Relleno"],
    ["Adjust", "Ajustes"],
    ["Hue", "Matiz"],
    ["Brightness", "Brillo"],
    ["Saturation", "Saturaci\xF3n"],
    ["Apply", "Aplicar"],
    ["Transform", "Transformar"],
    ["Flip H", "Voltear H"],
    ["Flip V", "Voltear V"],
    ["Rotate 90\xB0", "Girar 90\xB0"],
    ["Shift", "Desplazar"],
    ["Clear", "Vaciar"],
    ["Previews", "Vistas previas"],
    ["Tiled 3\xD73", "Mosaico 3\xD73"],
    ["Cube", "Cubo"],
    ["Save to project", "Guardar en el proyecto"],
    ["New texture", "Textura nueva"],
    ["Override vanilla", "Reemplazar vanilla"],
    ["File name", "Nombre del archivo"],
    ["Vanilla texture name", "Nombre de la textura vanilla"],
    ["Destination folder", "Carpeta de destino"],
    ["Save", "Guardar"],
    ["Also register in terrain_texture.json", "Registrar tambi\xE9n en terrain_texture.json"],
    ["Saved with the vanilla file name so Minecraft replaces the original block texture. It only works inside a resource pack (RP).", "Se guarda con el nombre del archivo vanilla para que Minecraft reemplace la textura original del bloque. Solo funciona dentro de un resource pack (RP)."],
    ["Custom name. Use it in your own blocks (material_instances \u2192 texture).", "Nombre propio. \xDAsalo en tus bloques (material_instances \u2192 texture)."],
    ["Pick a vanilla block texture", "Elige una textura de bloque de Minecraft"],
    ["Search\u2026", "Buscar\u2026"],
    ["Close", "Cerrar"],
    ["Create", "Crear"],
    ["Cancel", "Cancelar"],
    ["Textures come from the official repo github.com/Mojang/bedrock-samples.", "Las texturas vienen del repositorio oficial github.com/Mojang/bedrock-samples."],
    ["Create a new texture", "Crear una textura nueva"],
    ["Resolution", "Resoluci\xF3n"],
    ["Could not load the texture (offline?).", "No se pudo cargar la textura (\xBFsin conexi\xF3n?)."],
    ["Enter a file name.", "Escribe un nombre de archivo."],
    ["Saved: {0}", "Guardado: {0}"],
    ['Folder has no "textures" segment \u2014 the terrain_texture.json path may be wrong.', 'La carpeta no tiene un segmento "textures": la ruta en terrain_texture.json puede ser incorrecta.'],
    ["Could not read terrain_texture.json (invalid JSON). Entry not added.", "No se pudo leer terrain_texture.json (JSON inv\xE1lido). Entrada no a\xF1adida."],
    ["Image too large (max 512 px).", "Imagen demasiado grande (m\xE1x. 512 px)."]
  ];
  if (window.FD_I18N) window.FD_I18N.add(ES);
  function pick(cb) {
    const ov = document.createElement("div");
    ov.className = "fdt-pick";
    ov.innerHTML = `<div class="fdt-pick-box"><h3>Pick a vanilla block texture</h3><input type="text" placeholder="Search\u2026"><div class="fdt-pick-grid"></div>
<p class="fdt-hint">Textures come from the official repo github.com/Mojang/bedrock-samples.</p><div class="fdt-top"><span class="sp"></span><button class="fdt-b" data-x>Close</button></div></div>`;
    document.body.appendChild(ov);
    const grid = ov.querySelector(".fdt-pick-grid"), q = ov.querySelector("input"), close = () => {
      io.disconnect();
      ov.remove();
    };
    ov.querySelector("[data-x]").onclick = close;
    ov.addEventListener("mousedown", (e) => {
      if (e.target === ov) close();
    });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      io.unobserve(el);
      V.image(el.dataset.n).then((img) => {
        el.firstChild.style.backgroundImage = "url(" + img.src + ")";
      }).catch(() => {
        el.firstChild.textContent = "\xD7";
      });
    }), { root: grid, rootMargin: "120px" });
    let names = [];
    const draw = () => {
      const f = q.value.trim().toLowerCase();
      io.disconnect();
      grid.innerHTML = "";
      names.filter((n) => !f || n.toLowerCase().includes(f)).slice(0, 700).forEach((n) => {
        const it = document.createElement("div");
        it.className = "fdt-pick-it";
        it.dataset.n = n;
        it.innerHTML = `<span></span><small>${esc(n)}</small>`;
        it.onclick = () => {
          close();
          cb(n);
        };
        grid.appendChild(it);
        io.observe(it);
      });
    };
    q.oninput = draw;
    q.focus();
    V.list().then((l) => {
      names = l;
      draw();
    });
  }
  window.FD_VANILLA_PICK = pick;
  const MC = [
    "#000000",
    "#0000aa",
    "#00aa00",
    "#00aaaa",
    "#aa0000",
    "#aa00aa",
    "#ffaa00",
    "#aaaaaa",
    "#555555",
    "#5555ff",
    "#55ff55",
    "#55ffff",
    "#ff5555",
    "#ff55ff",
    "#ffff55",
    "#ffffff",
    "#8b5a2b",
    "#5c3a1e",
    "#7f7f7f",
    "#3d3d3d",
    "#d8c27a",
    "#6b8e23",
    "#2f4f2f",
    "#b04a2a",
    "#3b6fb6",
    "#c9a0dc",
    "#f2d6a2",
    "#1f1f2e",
    "#a0a0a0",
    "#d4d4d4",
    "#6e4a2f",
    "#e8e8e8"
  ];
  const IC = {
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19l-4 1z"/>',
    eraser: '<path d="M4 16l8-9 7 6-5 6H8z"/><path d="M12 19h8"/>',
    fill: '<path d="M5 12l7-7 7 7-7 7z"/><path d="M20 15c1 1.5 1 3-.5 3.5"/>',
    pick: '<path d="M14 4l6 6-3 1-7 7H6v-4l7-7z"/>',
    line: '<path d="M5 19L19 5"/>',
    rect: '<rect x="5" y="6" width="14" height="12"/>',
    light: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>',
    dark: '<path d="M20 14a8 8 0 1 1-10-10 6 6 0 0 0 10 10z"/>',
    undo: '<path d="M9 7L4 12l5 5M4 12h10a6 6 0 0 1 0 8"/>',
    redo: '<path d="M15 7l5 5-5 5M20 12H10a6 6 0 0 0 0 8"/>',
    grid: '<path d="M4 4h16v16H4zM4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16"/>'
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">${IC[k]}</svg>`;
  const TOOLS = [["pencil", "Pencil"], ["eraser", "Eraser"], ["fill", "Fill"], ["pick", "Pick color"], ["line", "Line"], ["rect", "Rectangle"], ["light", "Lighten"], ["dark", "Darken"]];
  const S = {
    w: 16,
    h: 16,
    cv: null,
    ctx: null,
    zoom: 20,
    tool: "pencil",
    color: "#7f7f7f",
    alpha: 255,
    size: 1,
    mx: false,
    my: false,
    filled: false,
    grid: true,
    hist: [],
    redo: [],
    recent: [],
    mode: "new",
    vname: "",
    name: "my_texture",
    folder: "",
    terrain: true
  };
  const hex2rgb = (h) => {
    const n = parseInt(h.slice(1), 16);
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  };
  const rgb2hex = (r, g, b) => "#" + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
  function rgb2hsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (mx + mn) / 2;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    return [h, s, l];
  }
  function hsl2rgb(h, s, l) {
    if (s === 0) {
      const v = l * 255;
      return [v, v, v];
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q, f = (t) => {
      t = (t + 1) % 1;
      return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p;
    };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  }
  function newCanvas(w, h) {
    S.w = w;
    S.h = h;
    S.cv = document.createElement("canvas");
    S.cv.width = w;
    S.cv.height = h;
    S.ctx = S.cv.getContext("2d", { willReadFrequently: true });
    S.hist = [];
    S.redo = [];
    S.zoom = clamp(Math.floor(480 / Math.max(w, h)), 3, 32);
  }
  function loadFrom(src) {
    const w = src.width || src.naturalWidth, h = src.height || src.naturalHeight;
    if (w > 512 || h > 512) {
      showToast(T("Image too large (max 512 px)."));
      return false;
    }
    newCanvas(w, h);
    S.ctx.drawImage(src, 0, 0);
    return true;
  }
  function snap() {
    S.hist.push(S.ctx.getImageData(0, 0, S.w, S.h));
    if (S.hist.length > 80) S.hist.shift();
    S.redo = [];
  }
  function restore(id) {
    if (id.width !== S.w || id.height !== S.h) {
      S.w = id.width;
      S.h = id.height;
      S.cv.width = S.w;
      S.cv.height = S.h;
    }
    S.ctx.putImageData(id, 0, 0);
  }
  function undo() {
    if (!S.hist.length) return;
    S.redo.push(S.ctx.getImageData(0, 0, S.w, S.h));
    restore(S.hist.pop());
    sizeView();
  }
  function redo() {
    if (!S.redo.length) return;
    S.hist.push(S.ctx.getImageData(0, 0, S.w, S.h));
    restore(S.redo.pop());
    sizeView();
  }
  function open() {
    if (!S.cv) newCanvas(16, 16);
    const rp = U.findPacks().rp;
    if (!S.folder) S.folder = (rp ? rp.folder.name : "RP") + "/textures/blocks";
    showModal(`<div class="modal tbx-modal fdt-modal" id="fdtRoot"></div>`, (ov) => {
      root = ov.querySelector("#fdtRoot");
      build();
    });
  }
  let root = null, view = null, vctx = null, drawing = null, raf = 0;
  function build() {
    root.innerHTML = `<div class="tbx-tool-head"><button class="tbx-back" id="fdtBack">${UI_ICONS.back}</button><h3>Textures</h3></div>
<p class="ij-lead" style="margin:0 0 8px">Pixel-art texture editor. Edit vanilla block textures or create new ones.</p>
<div class="fdt-top">
 <button class="fdt-b" data-a="new">New</button><button class="fdt-b" data-a="vanilla">Vanilla blocks</button><button class="fdt-b" data-a="upload">Upload PNG</button>
 <input type="file" accept="image/png,image/*" id="fdtFile" hidden><span class="sp"></span>
 <button class="fdt-b" data-a="undo" title="Undo">${svg("undo")}</button><button class="fdt-b" data-a="redo" title="Redo">${svg("redo")}</button>
 <button class="fdt-b" data-a="zout" title="Zoom out">\u2212</button><button class="fdt-b" data-a="zin" title="Zoom in">+</button><button class="fdt-b${S.grid ? " on" : ""}" data-a="grid" title="Grid">${svg("grid")}</button>
</div>
<div class="fdt-main">
 <div class="fdt-tools">${TOOLS.map((t) => `<button class="fdt-b${S.tool === t[0] ? " on" : ""}" data-tool="${t[0]}" title="${t[1]}">${svg(t[0] === "pick" ? "pick" : t[0])}</button>`).join("")}</div>
 <div class="fdt-stage" id="fdtStage"><canvas id="fdtView"></canvas></div>
 <div class="fdt-side">
  <div class="fdt-box"><h5>Color</h5>
   <div class="fdt-row"><input type="color" id="fdtCol" value="${S.color}"><input type="text" id="fdtHex" value="${S.color}" maxlength="7"></div>
   <div class="fdt-row">Opacity <input type="range" id="fdtAlpha" min="0" max="255" value="${S.alpha}"></div>
   <div class="fdt-row" style="margin-bottom:3px">Recent</div><div class="fdt-pal" id="fdtRecent"></div>
   <div class="fdt-row" style="margin:8px 0 3px">Minecraft palette</div><div class="fdt-pal" id="fdtPal">${MC.map((c) => `<i style="background:${c}" data-c="${c}"></i>`).join("")}</div></div>
  <div class="fdt-box"><h5>Brush</h5>
   <div class="fdt-row">Size <input type="range" id="fdtSize" min="1" max="8" value="${S.size}"><b id="fdtSizeN">${S.size}</b></div>
   <div class="fdt-row"><label><input type="checkbox" id="fdtMx"${S.mx ? " checked" : ""}> Mirror X</label><label><input type="checkbox" id="fdtMy"${S.my ? " checked" : ""}> Mirror Y</label><label><input type="checkbox" id="fdtFill"${S.filled ? " checked" : ""}> Filled</label></div></div>
  <div class="fdt-box"><h5>Adjust</h5>
   <div class="fdt-row">Hue <input type="range" id="fdtH" min="-180" max="180" value="0"></div>
   <div class="fdt-row">Saturation <input type="range" id="fdtSa" min="-100" max="100" value="0"></div>
   <div class="fdt-row">Brightness <input type="range" id="fdtBr" min="-100" max="100" value="0"></div>
   <div class="fdt-row"><button class="fdt-b" data-a="adjust">Apply</button></div></div>
  <div class="fdt-box"><h5>Transform</h5><div class="fdt-row">
   <button class="fdt-b" data-a="fh">Flip H</button><button class="fdt-b" data-a="fv">Flip V</button><button class="fdt-b" data-a="rot">Rotate 90\xB0</button><button class="fdt-b" data-a="clear">Clear</button></div>
   <div class="fdt-row">Shift <button class="fdt-b" data-sh="-1,0">\u2190</button><button class="fdt-b" data-sh="0,-1">\u2191</button><button class="fdt-b" data-sh="0,1">\u2193</button><button class="fdt-b" data-sh="1,0">\u2192</button></div></div>
  <div class="fdt-box"><h5>Previews</h5><div class="fdt-prev"><canvas id="fdtTile" width="168" height="168" title="Tiled 3\xD73"></canvas><canvas id="fdtIso" width="168" height="168" title="Cube"></canvas></div></div>
 </div>
</div>
<div class="fdt-save">
 <div><div class="fdt-seg"><button class="fdt-b${S.mode === "new" ? " on" : ""}" data-mode="new">New texture</button><button class="fdt-b${S.mode === "override" ? " on" : ""}" data-mode="override">Override vanilla</button></div></div>
 <label><span id="fdtNameL">${S.mode === "override" ? "Vanilla texture name" : "File name"}</span><input type="text" id="fdtName" value="${esc(S.mode === "override" ? S.vname : S.name)}"></label>
 <label>Destination folder<input type="text" id="fdtFolder" list="fdtFolders" value="${esc(S.folder)}"><datalist id="fdtFolders">${U.folderPaths().map((p) => `<option value="${esc(p)}">`).join("")}</datalist></label>
 <button class="fdt-b on" data-a="save" style="height:34px">Save</button>
</div>
<p class="fdt-hint" id="fdtModeHint"></p>
<label class="fdt-hint" id="fdtTerrL" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="fdtTerr"${S.terrain ? " checked" : ""}> Also register in terrain_texture.json</label>`;
    view = root.querySelector("#fdtView");
    vctx = view.getContext("2d");
    wire();
    sizeView();
    paintRecent();
    modeUI();
  }
  function modeUI() {
    root.querySelector("#fdtModeHint").textContent = T(S.mode === "override" ? "Saved with the vanilla file name so Minecraft replaces the original block texture. It only works inside a resource pack (RP)." : "Custom name. Use it in your own blocks (material_instances \u2192 texture).");
    root.querySelector("#fdtTerrL").style.display = S.mode === "new" ? "flex" : "none";
  }
  function sizeView() {
    view.width = S.w * S.zoom;
    view.height = S.h * S.zoom;
    redraw();
  }
  function redraw() {
    if (!view) return;
    const z = S.zoom, W = view.width, H = view.height;
    vctx.imageSmoothingEnabled = false;
    const c = Math.max(4, z >> 1);
    for (let y = 0; y < H; y += c) for (let x = 0; x < W; x += c) {
      vctx.fillStyle = x / c + y / c & 1 ? "#3a3a42" : "#2a2a30";
      vctx.fillRect(x, y, c, c);
    }
    vctx.drawImage(S.cv, 0, 0, W, H);
    if (S.grid && z >= 6) {
      vctx.strokeStyle = "rgba(255,255,255,.14)";
      vctx.lineWidth = 1;
      vctx.beginPath();
      for (let x = 0; x <= S.w; x++) {
        vctx.moveTo(x * z + 0.5, 0);
        vctx.lineTo(x * z + 0.5, H);
      }
      for (let y = 0; y <= S.h; y++) {
        vctx.moveTo(0, y * z + 0.5);
        vctx.lineTo(W, y * z + 0.5);
      }
      vctx.stroke();
    }
    vctx.strokeStyle = "rgba(255,90,90,.7)";
    vctx.beginPath();
    if (S.mx) {
      vctx.moveTo(W / 2, 0);
      vctx.lineTo(W / 2, H);
    }
    if (S.my) {
      vctx.moveTo(0, H / 2);
      vctx.lineTo(W, H / 2);
    }
    vctx.stroke();
    previews();
  }
  function sched() {
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0;
      redraw();
    });
  }
  function previews() {
    const t = root && root.querySelector("#fdtTile"), iso = root && root.querySelector("#fdtIso");
    if (!t) return;
    const g = t.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, 168, 168);
    const cell = 56;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) g.drawImage(S.cv, i * cell, j * cell, cell, cell);
    const c = iso.getContext("2d");
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, 168, 168);
    const s = 72, cs = 0.866 * s, sn = 0.5 * s, p0 = { x: 84, y: 12 }, w = S.w, h = S.h;
    const face = (ox, oy, ax, ay, bx, by, shade) => {
      c.setTransform(ax / w, ay / w, bx / h, by / h, ox, oy);
      c.drawImage(S.cv, 0, 0);
      c.setTransform(1, 0, 0, 1, 0, 0);
      if (shade) {
        c.fillStyle = `rgba(0,0,0,${shade})`;
        c.beginPath();
        c.moveTo(ox, oy);
        c.lineTo(ox + ax, oy + ay);
        c.lineTo(ox + ax + bx, oy + ay + by);
        c.lineTo(ox + bx, oy + by);
        c.closePath();
        c.fill();
      }
    };
    face(p0.x - cs, p0.y + sn, cs, sn, 0, s, 0.28);
    face(p0.x, p0.y + 2 * sn, cs, -sn, 0, s, 0.5);
    face(p0.x, p0.y, cs, sn, -cs, sn, 0);
  }
  const rgbaStr = () => {
    const [r, g, b] = hex2rgb(S.color);
    return `rgba(${r},${g},${b},${S.alpha / 255})`;
  };
  function plot(x, y, mode) {
    const pts = [[x, y]];
    if (S.mx) pts.push(...pts.map(([a, b]) => [S.w - 1 - a, b]));
    if (S.my) pts.push(...pts.map(([a, b]) => [a, S.h - 1 - b]));
    const o = Math.floor((S.size - 1) / 2);
    pts.forEach(([px, py]) => {
      const x0 = px - o, y0 = py - o;
      if (mode === "erase") S.ctx.clearRect(x0, y0, S.size, S.size);
      else if (mode === "draw") {
        S.ctx.clearRect(x0, y0, S.size, S.size);
        S.ctx.fillStyle = rgbaStr();
        S.ctx.fillRect(x0, y0, S.size, S.size);
      } else {
        const xa = Math.max(0, x0), ya = Math.max(0, y0), xb = Math.min(S.w, x0 + S.size), yb = Math.min(S.h, y0 + S.size);
        if (xb <= xa || yb <= ya) return;
        const id = S.ctx.getImageData(xa, ya, xb - xa, yb - ya), d = id.data, k = mode === "light" ? 1.12 : 0.88;
        for (let i = 0; i < d.length; i += 4) {
          if (!d[i + 3]) continue;
          if (mode === "light") {
            d[i] = Math.min(255, d[i] * k + 6);
            d[i + 1] = Math.min(255, d[i + 1] * k + 6);
            d[i + 2] = Math.min(255, d[i + 2] * k + 6);
          } else {
            d[i] *= k;
            d[i + 1] *= k;
            d[i + 2] *= k;
          }
        }
        S.ctx.putImageData(id, xa, ya);
      }
    });
  }
  function lineTo(a, b, mode) {
    let [x0, y0] = a;
    const [x1, y1] = b, dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (; ; ) {
      plot(x0, y0, mode);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e;
      if (e2 >= dy) {
        e += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        e += dx;
        y0 += sy;
      }
    }
  }
  function rectTo(a, b, mode) {
    const x0 = Math.min(a[0], b[0]), x1 = Math.max(a[0], b[0]), y0 = Math.min(a[1], b[1]), y1 = Math.max(a[1], b[1]);
    if (S.filled) {
      for (let y = y0; y <= y1; y++) lineTo([x0, y], [x1, y], mode);
    } else {
      lineTo([x0, y0], [x1, y0], mode);
      lineTo([x1, y0], [x1, y1], mode);
      lineTo([x1, y1], [x0, y1], mode);
      lineTo([x0, y1], [x0, y0], mode);
    }
  }
  function flood(x, y) {
    const id = S.ctx.getImageData(0, 0, S.w, S.h), d = id.data, w = S.w, h = S.h, i0 = (y * w + x) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]], [r, g, b] = hex2rgb(S.color), a = S.alpha;
    if (t[0] === r && t[1] === g && t[2] === b && t[3] === a) return;
    const st = [[x, y]];
    while (st.length) {
      const [cx, cy] = st.pop();
      if (cx < 0 || cy < 0 || cx >= w || cy >= h) continue;
      const i = (cy * w + cx) * 4;
      if (d[i] !== t[0] || d[i + 1] !== t[1] || d[i + 2] !== t[2] || d[i + 3] !== t[3]) continue;
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = a;
      st.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    S.ctx.putImageData(id, 0, 0);
  }
  function setColor(h, a) {
    S.color = h;
    if (a != null) S.alpha = a;
    root.querySelector("#fdtCol").value = h;
    root.querySelector("#fdtHex").value = h;
    root.querySelector("#fdtAlpha").value = S.alpha;
  }
  function pushRecent() {
    S.recent = [S.color].concat(S.recent.filter((c) => c !== S.color)).slice(0, 8);
    paintRecent();
  }
  function paintRecent() {
    const r = root.querySelector("#fdtRecent");
    r.innerHTML = S.recent.map((c) => `<i style="background:${c}" data-c="${c}"></i>`).join("") || '<small style="grid-column:1/-1;color:var(--text-dim2)">\u2014</small>';
  }
  const pt = (e) => {
    const r = view.getBoundingClientRect();
    return [clamp(Math.floor((e.clientX - r.left) / r.width * S.w), 0, S.w - 1), clamp(Math.floor((e.clientY - r.top) / r.height * S.h), 0, S.h - 1)];
  };
  function down(e) {
    if (e.button === 1 || e.button === 2) return;
    e.preventDefault();
    view.setPointerCapture(e.pointerId);
    const p = pt(e), t = S.tool;
    if (t === "pick") {
      const d = S.ctx.getImageData(p[0], p[1], 1, 1).data;
      setColor(rgb2hex(d[0], d[1], d[2]), d[3]);
      return;
    }
    snap();
    if (t === "fill") {
      flood(p[0], p[1]);
      pushRecent();
      redraw();
      return;
    }
    if (t === "line" || t === "rect") {
      drawing = { p0: p, base: S.ctx.getImageData(0, 0, S.w, S.h) };
      return;
    }
    const mode = t === "eraser" ? "erase" : t === "pencil" ? "draw" : t;
    drawing = { last: p, mode };
    plot(p[0], p[1], mode);
    sched();
  }
  function move(e) {
    if (!drawing) return;
    const p = pt(e);
    if (drawing.base) {
      S.ctx.putImageData(drawing.base, 0, 0);
      (S.tool === "line" ? lineTo : rectTo)(drawing.p0, p, "draw");
    } else {
      lineTo(drawing.last, p, drawing.mode);
      drawing.last = p;
    }
    sched();
  }
  function up() {
    if (!drawing) return;
    if (drawing.mode === "draw" || drawing.base) pushRecent();
    drawing = null;
    redraw();
  }
  function mapPixels(fn) {
    snap();
    const id = S.ctx.getImageData(0, 0, S.w, S.h), d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const o = fn(d[i], d[i + 1], d[i + 2]);
      d[i] = o[0];
      d[i + 1] = o[1];
      d[i + 2] = o[2];
    }
    S.ctx.putImageData(id, 0, 0);
    redraw();
  }
  function adjust() {
    const dh = +root.querySelector("#fdtH").value / 360, ds = +root.querySelector("#fdtSa").value / 100, db = +root.querySelector("#fdtBr").value / 100;
    mapPixels((r, g, b) => {
      let [h, s, l] = rgb2hsl(r, g, b);
      h = (h + dh + 1) % 1;
      s = clamp(s + ds * (ds > 0 ? 1 - s : s), 0, 1);
      l = clamp(l + db * (db > 0 ? 1 - l : l), 0, 1);
      return hsl2rgb(h, s, l);
    });
    ["#fdtH", "#fdtSa", "#fdtBr"].forEach((q) => root.querySelector(q).value = 0);
  }
  function xform(kind) {
    snap();
    const w = S.w, h = S.h, src = document.createElement("canvas");
    src.width = w;
    src.height = h;
    src.getContext("2d").drawImage(S.cv, 0, 0);
    if (kind === "rot") {
      S.w = h;
      S.h = w;
      S.cv.width = S.w;
      S.cv.height = S.h;
      S.ctx = S.cv.getContext("2d", { willReadFrequently: true });
      S.ctx.save();
      S.ctx.translate(S.w, 0);
      S.ctx.rotate(Math.PI / 2);
      S.ctx.drawImage(src, 0, 0);
      S.ctx.restore();
      sizeView();
      return;
    }
    S.ctx.clearRect(0, 0, w, h);
    S.ctx.save();
    if (kind === "fh") {
      S.ctx.translate(w, 0);
      S.ctx.scale(-1, 1);
    } else if (kind === "fv") {
      S.ctx.translate(0, h);
      S.ctx.scale(1, -1);
    }
    if (kind !== "clear") S.ctx.drawImage(src, 0, 0);
    S.ctx.restore();
    redraw();
  }
  function shift(dx, dy) {
    snap();
    const src = document.createElement("canvas");
    src.width = S.w;
    src.height = S.h;
    src.getContext("2d").drawImage(S.cv, 0, 0);
    S.ctx.clearRect(0, 0, S.w, S.h);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) S.ctx.drawImage(src, dx + i * S.w, dy + j * S.h);
    redraw();
  }
  function save() {
    const raw = root.querySelector("#fdtName").value.trim().replace(/\.png$/i, ""), name = raw.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
    if (!name) return showToast(T("Enter a file name."));
    const folder = root.querySelector("#fdtFolder").value.trim().replace(/^\/+|\/+$/g, "") || "textures/blocks";
    S.folder = folder;
    if (S.mode === "override") S.vname = name;
    else S.name = name;
    S.terrain = root.querySelector("#fdtTerr").checked;
    const path = folder + "/" + name + ".png";
    U.writeProjectFile(path, S.cv.toDataURL("image/png"));
    if (S.mode === "new" && S.terrain) {
      const rp = U.ensurePack("rp"), tp = U.getFile("textures/terrain_texture.json", rp.folder), ix = folder.indexOf("textures");
      let data = tp.created ? null : U.parseJson(tp.node.content || "");
      if (!tp.created && data === null) showToast(T("Could not read terrain_texture.json (invalid JSON). Entry not added."));
      else {
        data = data || { resource_pack_name: "fd", texture_name: "atlas.terrain", padding: 8, num_mip_levels: 4, texture_data: {} };
        data.texture_data = data.texture_data || {};
        data.texture_data[name] = { textures: (ix >= 0 ? folder.slice(ix) : "textures/blocks") + "/" + name };
        tp.node.content = U.J(data);
        if (ix < 0) showToast(T('Folder has no "textures" segment \u2014 the terrain_texture.json path may be wrong.'));
      }
    }
    render();
    saveState();
    showToast(T("Saved: {0}").replace("{0}", path));
    if (window.FD_I18N && window.FD_I18N.get() === "es") {
    }
  }
  function wire() {
    root.querySelector("#fdtBack").onclick = () => {
      closeModal();
      showToolboxModal();
    };
    view.addEventListener("pointerdown", down);
    view.addEventListener("pointermove", move);
    view.addEventListener("pointerup", up);
    view.addEventListener("pointercancel", up);
    view.addEventListener("contextmenu", (e) => e.preventDefault());
    view.addEventListener("wheel", (e) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      S.zoom = clamp(S.zoom + (e.deltaY < 0 ? 2 : -2), 2, 40);
      sizeView();
    }, { passive: false });
    const sync = () => {
      const m = Math.max(S.w, S.h);
      S.zoom = clamp(S.zoom, 2, Math.max(2, Math.floor(1800 / m)));
    };
    root.querySelectorAll("[data-tool]").forEach((b) => b.onclick = () => {
      S.tool = b.dataset.tool;
      root.querySelectorAll("[data-tool]").forEach((x) => x.classList.toggle("on", x === b));
    });
    root.querySelectorAll("[data-mode]").forEach((b) => b.onclick = () => {
      S.mode = b.dataset.mode;
      root.querySelectorAll("[data-mode]").forEach((x) => x.classList.toggle("on", x === b));
      root.querySelector("#fdtNameL").textContent = T(S.mode === "override" ? "Vanilla texture name" : "File name");
      root.querySelector("#fdtName").value = S.mode === "override" ? S.vname : S.name;
      if (S.mode === "override") root.querySelector("#fdtFolder").value = S.folder = (S.folder.replace(/\/textures\/.*$/, "") || "RP") + "/textures/blocks";
      modeUI();
    });
    root.querySelectorAll("[data-sh]").forEach((b) => b.onclick = () => {
      const [x, y] = b.dataset.sh.split(",").map(Number);
      shift(x, y);
    });
    root.querySelectorAll("#fdtPal,#fdtRecent").forEach((p) => p.addEventListener("click", (e) => {
      const c = e.target.dataset.c;
      if (c) setColor(c);
    }));
    root.querySelector("#fdtCol").oninput = (e) => setColor(e.target.value);
    root.querySelector("#fdtHex").onchange = (e) => {
      const v = e.target.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(v)) setColor(v.toLowerCase());
      else e.target.value = S.color;
    };
    root.querySelector("#fdtAlpha").oninput = (e) => {
      S.alpha = +e.target.value;
    };
    root.querySelector("#fdtSize").oninput = (e) => {
      S.size = +e.target.value;
      root.querySelector("#fdtSizeN").textContent = S.size;
    };
    root.querySelector("#fdtMx").onchange = (e) => {
      S.mx = e.target.checked;
      redraw();
    };
    root.querySelector("#fdtMy").onchange = (e) => {
      S.my = e.target.checked;
      redraw();
    };
    root.querySelector("#fdtFill").onchange = (e) => {
      S.filled = e.target.checked;
    };
    root.querySelector("#fdtTerr").onchange = (e) => {
      S.terrain = e.target.checked;
    };
    const file = root.querySelector("#fdtFile");
    file.onchange = () => {
      const f = file.files[0];
      if (!f) return;
      const i = new Image();
      i.onload = () => {
        if (loadFrom(i)) {
          S.mode = "new";
          S.name = f.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9_]+/g, "_") || "my_texture";
          build();
        }
        URL.revokeObjectURL(i.src);
      };
      i.src = URL.createObjectURL(f);
      file.value = "";
    };
    root.querySelectorAll("[data-a]").forEach((b) => b.onclick = () => {
      const a = b.dataset.a;
      if (a === "undo") undo();
      else if (a === "redo") redo();
      else if (a === "zin") {
        S.zoom = clamp(S.zoom + 2, 2, 40);
        sync();
        sizeView();
      } else if (a === "zout") {
        S.zoom = clamp(S.zoom - 2, 2, 40);
        sizeView();
      } else if (a === "grid") {
        S.grid = !S.grid;
        b.classList.toggle("on", S.grid);
        redraw();
      } else if (a === "adjust") adjust();
      else if (a === "fh" || a === "fv" || a === "rot" || a === "clear") xform(a);
      else if (a === "save") save();
      else if (a === "upload") file.click();
      else if (a === "vanilla") openVanilla();
      else if (a === "new") newDialog();
    });
  }
  function openVanilla() {
    pick((name) => V.canvas(name).then((c) => {
      if (loadFrom(c)) {
        S.mode = "override";
        S.vname = name;
        S.name = name;
        S.folder = (S.folder.replace(/\/textures\/.*$/, "") || "RP") + "/textures/blocks";
        build();
      }
    }).catch(() => showToast(T("Could not load the texture (offline?)."))));
  }
  function newDialog() {
    const ov = document.createElement("div");
    ov.className = "fdt-pick";
    ov.innerHTML = `<div class="fdt-pick-box" style="width:300px"><h3>Create a new texture</h3><div class="fdt-row">Resolution <select id="fdtNS">${[16, 32, 64, 128].map((n) => `<option>${n}</option>`).join("")}</select></div>
<div class="fdt-top"><span class="sp"></span><button class="fdt-b" data-x>Cancel</button><button class="fdt-b on" data-ok>Create</button></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector("[data-x]").onclick = () => ov.remove();
    ov.querySelector("[data-ok]").onclick = () => {
      const n = +ov.querySelector("#fdtNS").value;
      ov.remove();
      newCanvas(n, n);
      S.mode = "new";
      build();
    };
  }
  document.addEventListener("keydown", (e) => {
    if (!root || !document.body.contains(root) || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName || "")) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redo();
    }
  });
  TOOLBOX_TOOLS.push({
    id: "textures",
    name: "Textures",
    desc: "Pixel-art editor: edit vanilla block textures or paint new ones.",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16"/><path d="M4 12h16M12 4v16"/><path d="M12 12h8v8h-8z" fill="currentColor"/></svg>',
    onOpen: open
  });
  if (window.FD_I18N) window.FD_I18N.add([["Pixel-art editor: edit vanilla block textures or paint new ones.", "Editor pixel-art: edita texturas de bloques de Minecraft o pinta nuevas."]]);
})();

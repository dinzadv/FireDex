/* FireDex · Importador de estructuras (.mcstructure)
 * Lee el NBT little-endian de Bedrock, reconstruye paleta + bloques + contenedores y los
 * carga en el editor (reemplazando la estructura o como portapapeles para pegarla).
 * Después de importar se puede editar todo: bloques, loot, tamaño, generación... */
(function () {
  "use strict";
  const T = (s) => (window.FD_I18N ? FD_I18N.t(s) : s);
  const MAXAXIS = 512, MAXVOL = 1 << 24;
  const dec = new TextDecoder();

  if (window.FD_I18N) FD_I18N.add([
    ["Import", "Importar"],
    ["Import structure", "Importar estructura"],
    ["Drop a .mcstructure file here or tap to choose one", "Suelta aquí un archivo .mcstructure o toca para elegirlo"],
    ["Bedrock structure files (.mcstructure) · up to 512 blocks per axis", "Archivos de estructura de Bedrock (.mcstructure) · hasta 512 bloques por eje"],
    ["From your project", "De tu proyecto"],
    ["No .mcstructure files in your project yet.", "Aún no hay archivos .mcstructure en tu proyecto."],
    ["When importing", "Al importar"],
    ["Replace the current structure", "Reemplazar la estructura actual"],
    ["Paste into the current structure", "Pegar en la estructura actual"],
    ["Pick a spot with the Paste tool; the imported blocks are added to your palette.", "Elige el sitio con la herramienta Pegar; los bloques importados se añaden a tu paleta."],
    ["Everything stays editable: blocks, doors, torches, chests and loot.", "Todo se puede editar: bloques, puertas, antorchas, cofres y loot."],
    ["Replace the current structure with the imported one?", "¿Reemplazar la estructura actual por la importada?"],
    ["That file is not a valid .mcstructure.", "Ese archivo no es un .mcstructure válido."],
    ["The structure is too large to import (max {0} per axis).", "La estructura es demasiado grande para importarla (máx. {0} por eje)."],
    ["Imported {0}×{1}×{2} · {3} blocks", "Importada {0}×{1}×{2} · {3} bloques"],
    ["{0} chest(s) used a loot table and were imported empty.", "{0} cofre(s) usaban una loot table y se importaron vacíos."],
    ["Block entities other than containers and beds (signs, banners…) are not imported.", "Las entidades de bloque que no son contenedores (carteles, banderas…) no se importan."],
    ["Close", "Cerrar"],
    ["Reading file…", "Leyendo archivo…"],
    ["Imported as clipboard: choose a spot with the Paste tool.", "Importada como portapapeles: elige el sitio con la herramienta Pegar."]
  ]);

  // ---------- lector NBT (Bedrock, little-endian, sin comprimir) ----------
  function readNBT(buf) {
    const a = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    const dv = new DataView(a.buffer, a.byteOffset, a.byteLength);
    let p = 0;
    const need = (n) => {
      if (p + n > a.length) throw new Error("EOF");
    };
    const u8 = () => {
      need(1);
      return a[p++];
    };
    const str = () => {
      need(2);
      const n = dv.getUint16(p, true);
      p += 2;
      need(n);
      const s = dec.decode(a.subarray(p, p + n));
      p += n;
      return s;
    };
    function payload(t, depth) {
      if (depth > 64) throw new Error("deep");
      switch (t) {
        case 1: need(1); return dv.getInt8(p++);
        case 2: need(2); p += 2; return dv.getInt16(p - 2, true);
        case 3: need(4); p += 4; return dv.getInt32(p - 4, true);
        case 4: need(8); p += 8; return dv.getInt32(p - 4, true) * 4294967296 + dv.getUint32(p - 8, true);
        case 5: need(4); p += 4; return dv.getFloat32(p - 4, true);
        case 6: need(8); p += 8; return dv.getFloat64(p - 8, true);
        case 7: {
          need(4);
          const n = dv.getInt32(p, true);
          p += 4;
          need(n);
          const r = a.slice(p, p + n);
          p += n;
          return r;
        }
        case 8: return str();
        case 9: {
          const et = u8();
          need(4);
          const n = dv.getInt32(p, true);
          p += 4;
          if (n < 0) throw new Error("len");
          if (et === 3) {
            need(n * 4);
            const r = new Int32Array(n);
            for (let i = 0; i < n; i++) r[i] = dv.getInt32(p + i * 4, true);
            p += n * 4;
            return r;
          }
          const r = new Array(n);
          for (let i = 0; i < n; i++) r[i] = payload(et, depth + 1);
          return r;
        }
        case 10: {
          const o = {}, ty = {};
          for (;;) {
            const tt = u8();
            if (!tt) break;
            const k = str();
            o[k] = payload(tt, depth + 1);
            ty[k] = tt;
          }
          Object.defineProperty(o, "__t", { value: ty, enumerable: false });
          return o;
        }
        case 11: {
          need(4);
          const n = dv.getInt32(p, true);
          p += 4;
          need(n * 4);
          const r = new Int32Array(n);
          for (let i = 0; i < n; i++) r[i] = dv.getInt32(p + i * 4, true);
          p += n * 4;
          return r;
        }
        case 12: {
          need(4);
          const n = dv.getInt32(p, true);
          p += 4;
          need(n * 8);
          p += n * 8;
          return [];
        }
        default: throw new Error("tag " + t);
      }
    }
    if (u8() !== 10) throw new Error("root");
    str();
    return payload(10, 0);
  }

  // ---------- .mcstructure → datos del editor ----------
  function stateStr(v, t) {
    if (t === 1) return v ? "true" : "false";
    return String(v);
  }
  function blockId(ent) {
    const name = String(ent.name || "minecraft:air");
    const st = ent.states || {}, ty = st.__t || {}, ks = Object.keys(st);
    if (!ks.length) return name;
    return name + "[" + ks.map((k) => k + "=" + stateStr(st[k], ty[k])).join(",") + "]";
  }
  function parseStructure(bytes, D) {
    let root;
    try {
      root = readNBT(bytes);
    } catch (e) {
      throw new Error("invalid");
    }
    const size = root.size, st = root.structure;
    if (!size || size.length < 3 || !st || !st.block_indices || !st.palette) throw new Error("invalid");
    const sx = size[0] | 0, sy = size[1] | 0, sz = size[2] | 0;
    if (sx < 1 || sy < 1 || sz < 1) throw new Error("invalid");
    if (sx > MAXAXIS || sy > MAXAXIS || sz > MAXAXIS || sx * sy * sz > MAXVOL) {
      const e = new Error("large");
      e.max = MAXAXIS;
      throw e;
    }
    const pal0 = st.palette.default || st.palette[Object.keys(st.palette)[0]];
    if (!pal0 || !pal0.block_palette) throw new Error("invalid");
    const vol = sx * sy * sz, l0 = st.block_indices[0], l1 = st.block_indices[1];
    if (!l0 || l0.length < vol) throw new Error("invalid");
    const pal = ["minecraft:air"], pmap = new Map([["minecraft:air", 0]]);
    const remap = new Int32Array(pal0.block_palette.length), isWater = new Uint8Array(remap.length);
    pal0.block_palette.forEach((ent, i) => {
      const id = blockId(ent), base = String(ent.name || "");
      if (/^(minecraft:)?(flowing_)?water$/.test(base)) isWater[i] = 1;
      if (base === "minecraft:air" || base === "air") {
        remap[i] = 0;
        return;
      }
      let k = pmap.get(id);
      if (k === void 0) {
        k = pal.length;
        pal.push(id);
        pmap.set(id, k);
      }
      remap[i] = k;
    });
    if (pal.length > 65000) throw new Error("palette");
    const grid = new Uint16Array(vol);
    const waterIdx = (() => {
      let k = pmap.get("minecraft:water");
      return k;
    })();
    for (let i = 0; i < vol; i++) {
      const v = l0[i];
      grid[i] = v >= 0 && v < remap.length ? remap[v] : 0;
    }
    // capa 1 (agua en bloques con waterlogged): solo la usamos para rellenar huecos de aire con agua
    if (l1 && l1.length >= vol) {
      let wi = waterIdx;
      for (let i = 0; i < vol; i++) {
        const v = l1[i];
        if (v >= 0 && v < remap.length && isWater[v] && !grid[i]) {
          if (wi === void 0) {
            wi = pal.length;
            pal.push("minecraft:water");
            pmap.set("minecraft:water", wi);
          }
          grid[i] = wi;
        }
      }
    }
    // contenedores
    const chests = new Map();
    let lootChests = 0;
    const bpd = pal0.block_position_data || {};
    Object.keys(bpd).forEach((k) => {
      const idx = +k, be = bpd[k] && bpd[k].block_entity_data;
      if (!be || !(idx >= 0 && idx < vol)) return;
      const z = idx % sz, y = Math.floor(idx / sz) % sy, x = Math.floor(idx / (sz * sy));
      const str = pal[grid[idx]];
      if (!str || !D.containerOf(str)) return;
      const c = { mode: "empty", items: {}, loot: null, name: be.CustomName ? String(be.CustomName) : "" };
      if (Array.isArray(be.Items) && be.Items.length) {
        be.Items.forEach((it) => {
          if (it && it.Name && it.Count > 0) c.items[it.Slot | 0] = { id: String(it.Name), n: Math.max(1, it.Count | 0) };
        });
        if (Object.keys(c.items).length) c.mode = "items";
      }
      if (be.LootTable) lootChests++;
      chests.set(x + "," + y + "," + z, c);
    });
    const beds = new Map();
    Object.keys(bpd).forEach((k) => {
      const idx = +k, be = bpd[k] && bpd[k].block_entity_data;
      if (be && be.id === "Bed" && idx >= 0 && idx < vol) beds.set(Math.floor(idx / (sz * sy)) + "," + (Math.floor(idx / sz) % sy) + "," + (idx % sz), be.color | 0);
    });
    // cofres sin entidad de bloque en el archivo
    for (let i = 0; i < vol; i++) {
      if (!grid[i] || !D.containerOf(pal[grid[i]])) continue;
      const z = i % sz, y = Math.floor(i / sz) % sy, x = Math.floor(i / (sz * sy)), key = x + "," + y + "," + z;
      if (!chests.has(key)) chests.set(key, { mode: "empty", items: {}, loot: null, name: "" });
    }
    let blocks = 0;
    for (let i = 0; i < vol; i++) if (grid[i]) blocks++;
    return { sx, sy, sz, pal, grid, chests, beds, lootChests, blocks };
  }

  // ---------- helpers de archivo ----------
  function dataUrlToBytes(u) {
    const b = atob(u.slice(u.indexOf(",") + 1)), a = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    return a;
  }
  const slug = (s) => String(s || "structure").replace(/\.mcstructure$/i, "").trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "structure";

  function load(bytes, fileName, mode) {
    const A = window.FD_STRUCT_API;
    if (!A) return;
    let o;
    try {
      o = parseStructure(bytes, A.D);
    } catch (e) {
      A.toast(e.message === "large" ? T("The structure is too large to import (max {0} per axis).").replace("{0}", e.max) : T("That file is not a valid .mcstructure."));
      return false;
    }
    o.name = slug(fileName);
    if (mode === "clip") {
      A.importAsClip(o);
      A.toast(T("Imported as clipboard: choose a spot with the Paste tool."));
    } else {
      if (A.countBlocks() && !confirm(T("Replace the current structure with the imported one?"))) return false;
      A.applyImported(o);
      A.toast(T("Imported {0}×{1}×{2} · {3} blocks").replace("{0}", o.sx).replace("{1}", o.sy).replace("{2}", o.sz).replace("{3}", o.blocks.toLocaleString()));
    }
    if (o.lootChests) setTimeout(() => A.toast(T("{0} chest(s) used a loot table and were imported empty.").replace("{0}", o.lootChests)), 1800);
    return true;
  }

  // ---------- diálogo ----------
  let mode = "replace";
  function open() {
    const A = window.FD_STRUCT_API;
    if (!A || !A.root) return;
    const files = A.projectFiles(".mcstructure");
    const up = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>';
    const cube = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3ZM4 7.5 12 12l8-4.5M12 12v9"/></svg>';
    const pop = A.popDialog(`<div class="st-dh"><b>${T("Import structure")}</b></div>
<div class="si-wrap">
  <label class="si-drop" id="siDrop">${up}<b>${T("Drop a .mcstructure file here or tap to choose one")}</b><small>${T("Bedrock structure files (.mcstructure) · up to 512 blocks per axis")}</small><input type="file" id="siFile" accept=".mcstructure" hidden></label>
  <div class="si-h">${T("From your project")}</div>
  <div class="si-list" id="siList">${files.length ? files.map((f, i) => `<button class="si-file" data-i="${i}">${cube}<span><b>${A.esc(f.name)}</b><small>${A.esc(f.path)}</small></span></button>`).join("") : `<p class="st-muted">${T("No .mcstructure files in your project yet.")}</p>`}</div>
  <div class="si-h">${T("When importing")}</div>
  <div class="si-mode">
    <label class="${mode === "replace" ? "on" : ""}"><input type="radio" name="siMode" value="replace" ${mode === "replace" ? "checked" : ""}><span>${T("Replace the current structure")}</span></label>
    <label class="${mode === "clip" ? "on" : ""}"><input type="radio" name="siMode" value="clip" ${mode === "clip" ? "checked" : ""}><span>${T("Paste into the current structure")}</span></label>
  </div>
  <p class="st-muted">${T("Pick a spot with the Paste tool; the imported blocks are added to your palette.")}</p>
  <p class="st-muted">${T("Everything stays editable: blocks, doors, torches, chests and loot.")} ${T("Block entities other than containers (signs, banners…) are not imported.")}</p>
</div>
<div class="st-dact"><button class="st-btn" data-x>${T("Close")}</button></div>`, () => true);
    const wrap = pop.querySelector(".si-wrap"), drop = pop.querySelector("#siDrop"), inp = pop.querySelector("#siFile");
    const go = async (file) => {
      A.toast(T("Reading file…"));
      const buf = new Uint8Array(await file.arrayBuffer());
      if (load(buf, file.name, mode) !== false) {
        pop.hidden = true;
        pop.innerHTML = "";
      }
    };
    inp.onchange = () => inp.files[0] && go(inp.files[0]);
    ["dragenter", "dragover"].forEach((ev) => drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.add("over");
    }));
    ["dragleave", "drop"].forEach((ev) => drop.addEventListener(ev, (e) => {
      e.preventDefault();
      drop.classList.remove("over");
    }));
    drop.addEventListener("drop", (e) => {
      const f = e.dataTransfer && e.dataTransfer.files[0];
      if (f) go(f);
    });
    wrap.addEventListener("change", (e) => {
      if (e.target.name === "siMode") {
        mode = e.target.value;
        wrap.querySelectorAll(".si-mode label").forEach((l) => l.classList.toggle("on", l.querySelector("input").checked));
      }
    });
    wrap.addEventListener("click", (e) => {
      const b = e.target.closest(".si-file");
      if (!b) return;
      const f = files[+b.dataset.i];
      if (load(dataUrlToBytes(f.node.content), f.name, mode) !== false) {
        pop.hidden = true;
        pop.innerHTML = "";
      }
    });
  }

  // arrastrar y soltar directamente sobre el lienzo
  (window.FD_STRUCT_HOOKS = window.FD_STRUCT_HOOKS || []).push((api) => {
    const v = api.root && api.root.querySelector("#stView");
    if (!v) return;
    v.addEventListener("dragover", (e) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types || []).indexOf("Files") >= 0) e.preventDefault();
    });
    v.addEventListener("drop", async (e) => {
      const f = e.dataTransfer && e.dataTransfer.files[0];
      if (!f || !/\.mcstructure$/i.test(f.name)) return;
      e.preventDefault();
      load(new Uint8Array(await f.arrayBuffer()), f.name, "replace");
    });
  });

  window.FD_STRUCT_IMPORT = { open, parseStructure, readNBT, load };
})();

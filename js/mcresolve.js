/* FireDex · resolvedor de texturas de Minecraft Bedrock.
 * Lee blocks.json + terrain_texture.json + item_texture.json del resource pack
 * oficial (Mojang/bedrock-samples) y produce un manifest compacto:
 *   blocks[id] = "textures/blocks/stone"                       (todas las caras iguales)
 *   blocks[id] = { up, down, side, north, south, east, west }  (solo las caras que difieren)
 *   tints[path] = [ "#79c05a", "full" | "overlay" ]
 * Se usa igual en el navegador (fallback sin /mc/manifest.json) y en Node (tools/sync-mc-assets.mjs). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.FD_MCRESOLVE = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // JSON de Mojang: tolera comentarios // y /* */ y comas finales.
  function parseLoose(text) {
    if (typeof text !== "string") return text;
    try {
      return JSON.parse(text);
    } catch (e) {
      let out = "", i = 0, str = false;
      while (i < text.length) {
        const c = text[i], n = text[i + 1];
        if (str) {
          out += c;
          if (c === "\\") out += text[++i] || "";
          else if (c === '"') str = false;
        } else if (c === '"') {
          str = true;
          out += c;
        } else if (c === "/" && n === "/") {
          while (i < text.length && text[i] !== "\n") i++;
          continue;
        } else if (c === "/" && n === "*") {
          i += 2;
          while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++;
          i++;
        } else out += c;
        i++;
      }
      return JSON.parse(out.replace(/,(\s*[}\]])/g, "$1").replace(/^\uFEFF/, ""));
    }
  }

  // Una entrada de texture_data -> { path, tint, mode }
  function texRef(entry) {
    if (!entry) return null;
    let t = entry.textures;
    if (Array.isArray(t)) t = t[0];
    if (t == null) return null;
    if (typeof t === "string") return { path: t };
    if (typeof t === "object" && t.path) {
      const r = { path: t.path };
      if (t.tint_color) {
        r.tint = t.tint_color;
        r.mode = "full";
      } else if (t.overlay_color) {
        r.tint = t.overlay_color;
        r.mode = "overlay";
      }
      return r;
    }
    return null;
  }

  function terrainMap(terrain) {
    const td = (terrain && terrain.texture_data) || {};
    const out = {}, tints = {};
    Object.keys(td).forEach((k) => {
      const r = texRef(td[k]);
      if (!r || !r.path) return;
      out[k] = r.path;
      if (r.tint) tints[r.path] = [r.tint, r.mode];
    });
    return { terrain: out, tints };
  }

  function itemMap(items) {
    const td = (items && items.texture_data) || {};
    const out = {};
    Object.keys(td).forEach((k) => {
      const r = texRef(td[k]);
      if (r && r.path) out[k] = r.path;
    });
    return out;
  }

  const F6 = ["up", "down", "north", "south", "east", "west"];

  // blocks.json -> caras por bloque (como claves de terrain_texture)
  function blockFaces(ent) {
    const tx = ent && ent.textures;
    if (!tx) return null;
    if (typeof tx === "string") return { up: tx, down: tx, north: tx, south: tx, east: tx, west: tx };
    const side = tx.side, all = tx.all;
    const f = {
      up: tx.up || tx.top || all || side,
      down: tx.down || tx.bottom || all || side,
      north: tx.north || side || all,
      south: tx.south || side || all,
      east: tx.east || side || all,
      west: tx.west || side || all
    };
    const any = f.up || f.down || f.north || f.south || f.east || f.west;
    if (!any) return null;
    F6.forEach((k) => {
      if (!f[k]) f[k] = any;
    });
    return f;
  }

  // Compacta 6 caras en lo mínimo
  function pack(faces) {
    const u = faces.up, d = faces.down, n = faces.north, s = faces.south, e = faces.east, w = faces.west;
    if (u === d && u === n && u === s && u === e && u === w) return u;
    const o = { up: u, down: d };
    if (n === s && n === e && n === w) o.side = n;
    else {
      o.north = n;
      o.south = s;
      o.east = e;
      o.west = w;
    }
    return o;
  }

  function expand(v) {
    if (!v) return null;
    if (typeof v === "string") return { up: v, down: v, north: v, south: v, east: v, west: v };
    const side = v.side;
    return {
      up: v.up,
      down: v.down || v.up,
      north: v.north || side || v.up,
      south: v.south || side || v.up,
      east: v.east || side || v.up,
      west: v.west || side || v.up
    };
  }

  function buildManifest(input) {
    const blocksJson = parseLoose(input.blocks) || {};
    const T = terrainMap(parseLoose(input.terrain));
    const items = itemMap(parseLoose(input.items));
    const blocks = {};
    let miss = 0;
    Object.keys(blocksJson).forEach((id) => {
      if (id === "format_version") return;
      const f = blockFaces(blocksJson[id]);
      if (!f) return;
      const res = {};
      let ok = true;
      F6.forEach((k) => {
        const p = T.terrain[f[k]];
        if (p) res[k] = p;
        else ok = false;
      });
      if (!ok) {
        miss++;
        // completa con lo que sí exista
        const any = F6.map((k) => res[k]).find(Boolean);
        if (!any) return;
        F6.forEach((k) => {
          if (!res[k]) res[k] = any;
        });
      }
      blocks[id] = pack(res);
    });
    return {
      v: 1,
      source: "Mojang/bedrock-samples",
      blocks,
      terrain: T.terrain,
      tints: T.tints,
      items,
      files: input.files || null,
      stats: { blocks: Object.keys(blocks).length, terrain: Object.keys(T.terrain).length, items: Object.keys(items).length, partial: miss }
    };
  }

  return { parseLoose, texRef, terrainMap, itemMap, blockFaces, pack, expand, buildManifest, F6 };
});

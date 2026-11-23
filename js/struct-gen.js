/* FireDex · Generación de estructuras en el mundo
 *
 *  1) Analiza la estructura (tamaño, materiales, interior, entradas, base…) y detecta su ESTILO.
 *  2) Pestaña "Generación": dimensión, ubicación (superficie / subterránea / aire / fondo marino),
 *     frecuencia, biomas y "complementar con el mundo".
 *  3) Al pulsar "Crear estructura" escribe en el proyecto el código que haga falta:
 *       · Motor nativo  → features/ + feature_rules/ (generación oficial de Bedrock)
 *       · Motor script  → scripts/fd_structgen.js (cimientos, despeje, nivelado, entradas, separación)
 *     más la estructura "_gen" ya procesada (aire exterior → structure_void, 4 rotaciones, etc.). */
(function () {
  "use strict";
  const T = (s) => (window.FD_I18N ? FD_I18N.t(s) : s);
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const A = () => window.FD_STRUCT_API;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // ---------- textos ----------
  if (window.FD_I18N) FD_I18N.add([
    ["Generation", "Generación"],
    ["Structure Generation", "Generación de estructura"],
    ["Generate this structure automatically in the world", "Generar esta estructura automáticamente en el mundo"],
    ["Off: the structure is only exported as a file.", "Apagado: la estructura solo se exporta como archivo."],
    ["Detected style", "Estilo detectado"],
    ["Analyze again", "Analizar de nuevo"],
    ["Use recommended settings", "Usar ajustes recomendados"],
    ["Build something first so it can be analyzed.", "Construye algo primero para poder analizarla."],
    ["Dimension", "Dimensión"],
    ["Overworld", "Mundo normal"],
    ["Nether", "Nether"],
    ["The End", "El End"],
    ["Location", "Ubicación"],
    ["Surface", "Superficie"],
    ["Underground", "Subterránea"],
    ["Sky", "Aire"],
    ["Seabed", "Fondo marino"],
    ["Auto (use the detected style)", "Auto (usar el estilo detectado)"],
    ["Height range (Y)", "Rango de altura (Y)"],
    ["From", "Desde"],
    ["To", "Hasta"],
    ["Frequency", "Frecuencia"],
    ["1 every {0} chunks", "1 cada {0} chunks"],
    ["Very rare", "Muy rara"],
    ["Rare", "Rara"],
    ["Uncommon", "Poco común"],
    ["Common", "Común"],
    ["Frequent", "Frecuente"],
    ["Very frequent", "Muy frecuente"],
    ["About {0} per 1000×1000 blocks", "Unas {0} por cada 1000×1000 bloques"],
    ["Biomes", "Biomas"],
    ["Any biome", "Cualquier bioma"],
    ["Only in the selected biomes", "Solo en los biomas elegidos"],
    ["Complement with the world", "Complementar con el mundo"],
    ["The generator adapts the structure to the terrain using what it detected in your build.", "El generador adapta la estructura al terreno usando lo que detectó en tu construcción."],
    ["Foundations", "Cimientos"],
    ["Fills the gap under the build", "Rellena el hueco bajo la construcción"],
    ["Clear obstacles", "Despejar obstáculos"],
    ["Removes trees and terrain in the way", "Quita árboles y terreno que estorban"],
    ["Level terrain", "Nivelar terreno"],
    ["Max slope: {0} blocks", "Pendiente máx.: {0} bloques"],
    ["Avoid water", "Evitar agua"],
    ["Skips lakes and oceans", "Salta lagos y océanos"],
    ["Random rotation", "Rotación aleatoria"],
    ["4 facings, entrances follow", "4 orientaciones; las entradas se ajustan"],
    ["Entrances", "Entradas"],
    ["Builds steps and clears the way to the doors", "Crea el camino y despeja hasta las puertas"],
    ["Minimum distance between copies", "Distancia mínima entre copias"],
    ["{0} chunks", "{0} chunks"],
    ["Foundation block", "Bloque de cimientos"],
    ["Engine", "Motor"],
    ["Native (feature rules)", "Nativo (feature rules)"],
    ["Official Bedrock world generation. No scripting, exact biome filters.", "Generación oficial de Bedrock. Sin scripts y con filtros de bioma exactos."],
    ["Adaptive (script)", "Adaptativo (script)"],
    ["Full terrain complement: foundations, clearing, leveling and entrances.", "Complemento completo del terreno: cimientos, despeje, nivelado y entradas."],
    ["Recommended", "Recomendado"],
    ["Files that will be written", "Archivos que se escribirán"],
    ["Namespace", "Namespace"],
    ["Write everything now", "Escribir todo ahora"],
    ["Size", "Tamaño"],
    ["Blocks", "Bloques"],
    ["Interior", "Interior"],
    ["Doors", "Puertas"],
    ["Containers", "Contenedores"],
    ["Grounded", "Apoyada"],
    ["Plan", "Plan"],
    ["Very large structures may fail to place with feature rules (about 64+ blocks per side). The script engine handles them better.", "Las estructuras muy grandes pueden fallar con feature rules (a partir de unos 64 bloques por lado). El motor de script las maneja mejor."],
    ["The script engine filters biomes with the biome API (dimension.getBiome). If your game version lacks it, use the native engine.", "El motor de script filtra biomas con la API de biomas (dimension.getBiome). Si tu versión del juego no la tiene, usa el motor nativo."],
    ["Generation is on but the structure is empty.", "La generación está activada pero la estructura está vacía."],
    ["Generation files written", "Archivos de generación escritos"],
    ["Test it in the world", "Pruébalo en el mundo"],
    ["Forces one copy where you stand (adaptive engine):", "Fuerza una copia donde estás (motor adaptativo):"],
    ["Forget every generated spot (adaptive engine):", "Olvida todos los puntos generados (motor adaptativo):"],
    ["New chunks only: structures appear in terrain that has not been generated yet (native engine). Create a new world or explore new areas.", "Solo chunks nuevos: las estructuras aparecen en terreno aún no generado (motor nativo). Crea un mundo nuevo o explora zonas nuevas."],
    ["Style: house", "Estilo: casa"],
    ["Style: tower", "Estilo: torre"],
    ["Style: castle", "Estilo: castillo"],
    ["Style: dungeon", "Estilo: mazmorra"],
    ["Style: ruin", "Estilo: ruina"],
    ["Style: farm", "Estilo: granja"],
    ["Style: tree", "Estilo: árbol"],
    ["Style: bridge", "Estilo: puente"],
    ["Style: floating island", "Estilo: isla flotante"],
    ["Style: monument", "Estilo: monumento"],
    ["Style: decoration", "Estilo: decoración"],
    ["Style: underwater build", "Estilo: construcción submarina"],
    ["Style: structure", "Estilo: estructura"]
  ]);

  // ---------- iconos ----------
  const P = {
    // dimensiones
    overworld: '<circle cx="12" cy="9" r="3.2"/><path d="M12 2.8v1.4M5.6 5.2l1 1M18.4 5.2l-1 1M3 9h1.4M19.6 9H21M3 20.5c2.5-4 5.5-6 9-6s6.5 2 9 6"/>',
    nether: '<path d="M12 3c.6 3.2 4.4 5 4.4 9.1A4.4 4.4 0 0 1 12 16.5a4.4 4.4 0 0 1-4.4-4.4c0-1.8.9-3 2-4 .2 1.2.8 1.9 1.6 2.3C11.1 8.2 11.2 5.7 12 3Z"/><path d="M5 21h14"/>',
    the_end: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.8"/><path d="M12 4v2.2M12 17.8V20M4 12h2.2M17.8 12H20"/>',
    // ubicación
    surface: '<path d="M3 18h18"/><path d="M6 18v-6l6-4.5 6 4.5v6"/><path d="M10.5 18v-3.6h3V18"/>',
    underground: '<path d="M3 6.5h18"/><path d="M3 10.5h18" opacity=".45"/><rect x="8" y="13" width="8" height="6.5" rx="1"/><path d="M12 2v2.6M10.6 3.4 12 4.8l1.4-1.4"/>',
    sky: '<path d="M7 18h10a3.6 3.6 0 0 0 .4-7.2A5 5 0 0 0 7.8 9.8 4.1 4.1 0 0 0 7 18Z"/>',
    ocean: '<path d="M3 8c2 0 2-1.4 4.5-1.4S10 8 12 8s2.5-1.4 4.5-1.4S19 8 21 8"/><path d="M3 13c2 0 2-1.4 4.5-1.4S10 13 12 13s2.5-1.4 4.5-1.4S19 13 21 13"/><path d="M3 19h18"/>',
    // complemento
    foundation: '<rect x="5" y="4" width="14" height="7" rx="1"/><path d="M7 11v8M12 11v8M17 11v8M3.5 20h17"/>',
    clear: '<path d="M12 21v-6"/><path d="M12 15c-4 0-6-2.5-6-5.5C6 6 9 3 12 3s6 3 6 6.5c0 3-2 5.5-6 5.5Z"/><path d="m4 4 16 16"/>',
    level: '<path d="M3 11h18"/><path d="M3 17c3 0 3-2 6-2s3 2 6 2 3-2 6-2"/><path d="M12 3.5v4.2M9.8 5.6 12 7.8l2.2-2.2"/>',
    nowater: '<path d="M12 3s6 6.2 6 10.2A6 6 0 0 1 6 13.2C6 9.2 12 3 12 3Z"/><path d="m4 4 16 16"/>',
    rotate: '<path d="M20 11A8 8 0 1 0 18.6 16"/><path d="M20 5v6h-6"/>',
    spacing: '<rect x="3" y="8" width="5" height="8" rx="1"/><rect x="16" y="8" width="5" height="8" rx="1"/><path d="M9.6 12h4.8M11 10.6 9.6 12 11 13.4M13 10.6l1.4 1.4-1.4 1.4"/>',
    door: '<path d="M6 21V4.5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1V21"/><path d="M4 21h16"/><circle cx="14.6" cy="12.6" r=".9"/>',
    freq: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/>',
    engineN: '<path d="M4 6h16v12H4z"/><path d="M8 10l-2 2 2 2M16 10l2 2-2 2M13 9l-2 6"/>',
    engineS: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"/>',
    file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>',
    bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z"/>',
    any: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.6 2.4 3.8 5.2 3.8 8.5s-1.2 6.1-3.8 8.5c-2.6-2.4-3.8-5.2-3.8-8.5S9.4 5.9 12 3.5Z"/>',
    // estilos
    house: '<path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M6 10v10h12V10"/><path d="M10.5 20v-5h3v5"/>',
    tower: '<path d="M8 21V7h8v14"/><path d="M7 7l.8-3.5h2V5h4V3.5h2L17 7"/><path d="M11 12h2M11 16h2"/>',
    castle: '<path d="M3 21V8h3v2h2V8h3v2h2V8h3v2h2V8h3v13"/><path d="M10 21v-4.5a2 2 0 0 1 4 0V21"/>',
    dungeon: '<rect x="4" y="9" width="16" height="10" rx="1.2"/><path d="M4 13h16M10.5 12v3.5h3V12M6 9V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/>',
    ruin: '<path d="M4 21V12l2-1V8l3 1 1-3 3 2 2-1 1 4 2 1v10"/>',
    farm: '<path d="M12 21V6"/><path d="M12 10c-2.2-.2-3.4-1.4-3.6-3.8 2.2 0 3.4 1.2 3.6 3.8ZM12 10c2.2-.2 3.4-1.4 3.6-3.8-2.2 0-3.4 1.2-3.6 3.8ZM12 15c-2.2-.2-3.4-1.4-3.6-3.8 2.2 0 3.4 1.2 3.6 3.8ZM12 15c2.2-.2 3.4-1.4 3.6-3.8-2.2 0-3.4 1.2-3.6 3.8Z"/>',
    tree: '<circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V21"/>',
    bridge: '<path d="M3 14h18"/><path d="M5 14v-3h14v3M8 14v6M16 14v6M3 20h18"/>',
    island: '<path d="M5 12h14l-3 4h-2l-2 5-2-5H8l-3-4Z"/><path d="M8 9c1-2 3-3 4-3s3 1 4 3"/>',
    monument: '<path d="M12 4 21 20H3L12 4Z"/><path d="M12 4v16M7.5 12h9"/>',
    decor: '<circle cx="12" cy="5.5" r="2.5"/><path d="M8 21l1.5-9h5L16 21M7 12h10"/>',
    // biomas
    plains: '<path d="M4 19h16"/><path d="M8 19c0-3 .5-5 1.5-6.5M8 19c0-2.5-1-4-2.5-5M13 19c0-3 .5-5 1.5-6.5M13 19c0-2.5-1-4-2.5-5M18 19c0-2 .5-4 1.5-5"/>',
    forest: '<circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V21"/>',
    dark_forest: '<circle cx="12" cy="9" r="5.5" fill="currentColor" fill-opacity=".3"/><path d="M12 14.5V21"/>',
    birch_forest: '<path d="M9 21V5M15 21V8"/><path d="M7 4h4M13 7h4M9 12h.01M15 15h.01M9 17h.01"/>',
    taiga: '<path d="M12 21v-3"/><path d="m12 3 4.5 6.5h-2.2L18 15H6l3.7-5.5H7.5L12 3Z"/>',
    snowy: '<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/><path d="M9.5 4.5 12 6.5l2.5-2M9.5 19.5l2.5-2 2.5 2"/>',
    desert: '<rect x="10" y="4" width="4" height="17" rx="2"/><path d="M10 12H8a2 2 0 0 1-2-2V8M14 14h2a2 2 0 0 0 2-2v-2"/>',
    badlands: '<path d="M4 20h16M6 16h12M8 12h8M10 8h4"/>',
    savanna: '<path d="M12 21v-8"/><path d="M3.5 11c3-3 5.5-3 8.5-1 3-2 5.5-2 8.5 1"/>',
    jungle: '<path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14Z"/><path d="M5 19 14 10"/>',
    swamp: '<path d="M8 17V6M12 17V3M16 17V8"/><path d="M3 20c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1"/>',
    mangrove_swamp: '<path d="M12 4a5 5 0 0 0-5 5c0 2 1 3 2 3.6V21M12 4a5 5 0 0 1 5 5c0 2-1 3-2 3.6V21M12 12v9"/>',
    mountains: '<path d="M3 20 9.5 8l3.5 6 2-3 6 9H3Z"/>',
    meadow: '<circle cx="12" cy="9" r="1.6"/><circle cx="12" cy="4.8" r="1.6"/><circle cx="12" cy="13.2" r="1.6"/><circle cx="7.8" cy="9" r="1.6"/><circle cx="16.2" cy="9" r="1.6"/><path d="M12 15v6"/>',
    cherry_grove: '<circle cx="12" cy="9" r="1.6"/><circle cx="12" cy="4.8" r="1.6"/><circle cx="12" cy="13.2" r="1.6"/><circle cx="7.8" cy="9" r="1.6"/><circle cx="16.2" cy="9" r="1.6"/><path d="M12 15v6"/>',
    pale_garden: '<path d="M12 21v-6"/><path d="M12 3c-4 0-6 3-6 6 0 2 1 3 2 4h8c1-1 2-2 2-4 0-3-2-6-6-6Z"/><path d="M10 8v.01M14 8v.01"/>',
    beach: '<path d="M12 21V9"/><path d="M12 9c-3-4-7-3-8-2M12 9c3-4 7-3 8-2M12 9c-1-4 0-6 0-6s1 2 0 6"/><path d="M3 21h18"/>',
    river: '<path d="M5 3c4 3 2 5 0 7s-1 4 3 6 4 3 4 5"/><path d="M14 3c4 3 2 5 0 7s-1 4 3 6"/>',
    mushroom: '<path d="M4 12a8 7 0 0 1 16 0Z"/><path d="M10 12v7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-7"/>',
    lush_caves: '<path d="M3 20c0-8 4-14 9-14s9 6 9 14"/><path d="M9 6.5v4M12 6v6M15 6.5v3"/>',
    dripstone_caves: '<path d="M3 4h18M6 4l2 7 2-7M12 4l1.5 10L15 4M17 4l1 5 1-5"/>',
    deep_dark: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/>',
    crimson_forest: '<path d="M5 12a7 6 0 0 1 14 0Z"/><path d="M12 12v8M9 20h6"/>',
    warped_forest: '<path d="M5 12a7 6 0 0 1 14 0Z"/><path d="M12 12v8M9 20h6M9 9v.01M13 8v.01M15 10v.01"/>',
    soulsand_valley: '<path d="M6 20V10a6 6 0 0 1 12 0v10l-2-2-2 2-2-2-2 2-2-2-2 2Z"/><path d="M10 10v.01M14 10v.01"/>',
    basalt_deltas: '<path d="M5 20v-7l3-2v9M10 20V8l3-2v14M15 20v-9l3-1v10"/>',
    end_islands: '<path d="M5 12h14l-3 4h-2l-2 5-2-5H8l-3-4Z"/><path d="M12 3v3M10.5 4.5 12 3l1.5 1.5"/>'
  };
  const svg = (k, w) => `<svg class="sg-i" viewBox="0 0 24 24" width="${w || 20}" height="${w || 20}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k] || P.any}</svg>`;

  // ---------- biomas ----------
  // tag = etiqueta de bioma de Bedrock (feature rules). rx = expresión que reconoce los ids de bioma (script).
  const BIOMES = {
    overworld: [
      { g: "Land", k: "plains", n: "Plains", tag: "plains", rx: "^(sunflower_)?plains$" },
      { k: "forest", n: "Forest", tag: "forest", rx: "^(flower_)?forest(_hills)?$" },
      { k: "birch_forest", n: "Birch forest", tag: "birch", rx: "^birch_forest" },
      { k: "dark_forest", n: "Dark forest", tag: "roofed", rx: "^(roofed|dark)_forest" },
      { k: "taiga", n: "Taiga", tag: "taiga", rx: "taiga|redwood" },
      { k: "snowy", n: "Snowy", tag: "frozen", rx: "^ice_|^cold_taiga|snowy|frozen_peaks|jagged_peaks|grove" },
      { k: "desert", n: "Desert", tag: "desert", rx: "^desert" },
      { k: "badlands", n: "Badlands", tag: "mesa", rx: "^mesa|badlands" },
      { k: "savanna", n: "Savanna", tag: "savanna", rx: "savanna" },
      { k: "jungle", n: "Jungle", tag: "jungle", rx: "jungle" },
      { k: "swamp", n: "Swamp", tag: "swamp", rx: "^swampland" },
      { k: "mangrove_swamp", n: "Mangrove swamp", tag: "mangrove_swamp", rx: "^mangrove_swamp" },
      { k: "mountains", n: "Mountains", tag: "extreme_hills", rx: "^extreme_hills|stony_peaks|stone_peaks|windswept" },
      { k: "meadow", n: "Meadow", tag: "meadow", rx: "^meadow" },
      { k: "cherry_grove", n: "Cherry grove", tag: "cherry_grove", rx: "^cherry_grove" },
      { k: "pale_garden", n: "Pale garden", tag: "pale_garden", rx: "^pale_garden" },
      { k: "beach", n: "Beach", tag: "beach", rx: "beach|shore" },
      { k: "river", n: "River", tag: "river", rx: "river" },
      { k: "mushroom", n: "Mushroom fields", tag: "mushroom_island", rx: "^mushroom" },
      { g: "Ocean", k: "ocean", n: "Ocean", tag: "ocean", rx: "ocean$" },
      { g: "Caves", k: "lush_caves", n: "Lush caves", tag: "lush_caves", rx: "^lush_caves" },
      { k: "dripstone_caves", n: "Dripstone caves", tag: "dripstone_caves", rx: "^dripstone_caves" },
      { k: "deep_dark", n: "Deep dark", tag: "deep_dark", rx: "^deep_dark" }
    ],
    nether: [
      { g: "Nether", k: "nether", n: "Nether wastes", tag: "nether_wastes", rx: "^(hell|nether_wastes)$" },
      { k: "crimson_forest", n: "Crimson forest", tag: "crimson_forest", rx: "^crimson_forest" },
      { k: "warped_forest", n: "Warped forest", tag: "warped_forest", rx: "^warped_forest" },
      { k: "soulsand_valley", n: "Soul sand valley", tag: "soulsand_valley", rx: "^soulsand_valley" },
      { k: "basalt_deltas", n: "Basalt deltas", tag: "basalt_deltas", rx: "^basalt_deltas" }
    ],
    the_end: [
      { g: "The End", k: "end_islands", n: "End biomes", tag: "the_end", rx: "^the_end|^end_" }
    ]
  };
  const BIOME_ICON = { nether: "nether", end_islands: "end_islands" };
  const biomeIcon = (k) => (P[k] ? k : BIOME_ICON[k] || "any");
  const allBiomes = () => [].concat(BIOMES.overworld, BIOMES.nether, BIOMES.the_end);

  // ---------- opciones ----------
  const DIMS = [["overworld", "Overworld"], ["nether", "Nether"], ["the_end", "The End"]];
  const PLACES = [["surface", "Surface"], ["underground", "Underground"], ["sky", "Sky"], ["ocean", "Seabed"]];
  const FREQ = [[128, "Very rare"], [64, "Rare"], [32, "Uncommon"], [16, "Common"], [8, "Frequent"], [4, "Very frequent"]];
  const STYLES = {
    house: "Style: house", tower: "Style: tower", castle: "Style: castle", dungeon: "Style: dungeon", ruin: "Style: ruin", farm: "Style: farm",
    tree: "Style: tree", bridge: "Style: bridge", island: "Style: floating island", monument: "Style: monument", decor: "Style: decoration", ocean: "Style: underwater build", structure: "Style: structure"
  };
  const DIMID = { overworld: "minecraft:overworld", nether: "minecraft:nether", the_end: "minecraft:the_end" };

  function defaults() {
    return {
      on: false, engine: "native", dim: "overworld", auto: true, place: "surface", every: 24, biomes: [],
      minY: -48, maxY: 40, skyMin: 110, skyMax: 220,
      adapt: true, foundation: true, clear: true, level: 4, water: false, rotate: true, entrance: true, spacing: 8,
      foundBlock: "", ns: "fd_gen", salt: (Math.random() * 1e9) | 0
    };
  }
  function ensure(S) {
    if (!S.gen) S.gen = defaults();
    else {
      const d = defaults();
      Object.keys(d).forEach((k) => {
        if (S.gen[k] === void 0) S.gen[k] = d[k];
      });
    }
    return S.gen;
  }

  // ---------- análisis ----------
  const MAT = [
    ["nether", /netherrack|nether_brick|soul_sand|soul_soil|basalt|blackstone|crimson|warped|shroomlight|magma|nether_wart|glowstone|ancient_debris/],
    ["end", /end_stone|purpur|end_rod|chorus|end_brick/],
    ["ocean", /prismarine|sea_lantern|kelp|seagrass|coral|sea_pickle|conduit|sponge/],
    ["glass", /glass/],
    ["light", /torch|lantern|candle|froglight|redstone_lamp/],
    ["wood", /planks|_log$|_wood$|_stem$|_hyphae$|bamboo|mosaic|bookshelf|barrel|fence|door|ladder|crafting_table|scaffolding|_sign$|^chest$|trapped_chest|beehive|bee_nest|composter|lectern|loom|cartography|fletching|smithing|jukebox|noteblock|chiseled_bookshelf/],
    ["plant", /leaves|short_grass|tall_grass|^grass$|flower|sapling|fern|vine|moss|azalea|bush|mushroom|petals|lily|cactus|wheat|carrots|potatoes|beetroot|melon|pumpkin|hay_block|cocoa|dripleaf|spore|roots|lichen|sweet_berry|tulip|orchid|allium|cornflower|dandelion|poppy|daisy|bluet/],
    ["soil", /^(grass_block|dirt|coarse_dirt|podzol|mycelium|farmland|gravel|sand|red_sand|clay|snow|snow_layer|powder_snow|ice|packed_ice|blue_ice|grass_path|dirt_path|mud|rooted_dirt)$/],
    ["stone", /stone|cobble|brick|deepslate|tuff|andesite|granite|diorite|calcite|sandstone|obsidian|concrete|terracotta|furnace|smoker|copper|quartz|iron|anvil|bell|dripstone|bedrock|stonecutter|grindstone/],
    ["wool", /wool|carpet|^bed$|banner/],
    ["fluid", /^(water|flowing_water|lava|flowing_lava)$/]
  ];
  function classify(str, A0) {
    const b = A0.shortName(A0.baseOf(str));
    if (b === "air") return { m: "air" };
    for (let i = 0; i < MAT.length; i++) if (MAT[i][1].test(b)) return { m: MAT[i][0], b };
    return { m: "other", b };
  }
  const isDoorStr = (str) => /(^|_)door$/.test(str.replace(/\[.*$/, "").replace(/^[^:]*:/, "")) && !/trapdoor/.test(str);
  const isLowerDoor = (str) => isDoorStr(str) && !/upper_block_bit=(true|1)\b/.test(str);

  function exteriorAir(g, w, h, d) {
    // devuelve Uint8Array con 1 = aire alcanzable desde fuera (BFS 6-vecinos sobre aire, bordes incluidos)
    const vol = w * h * d, ext = new Uint8Array(vol), q = new Int32Array(vol);
    let qh = 0, qt = 0;
    const idx = (x, y, z) => (x * h + y) * d + z;
    const push = (x, y, z) => {
      const i = idx(x, y, z);
      if (g[i] || ext[i]) return;
      ext[i] = 1;
      q[qt++] = i;
    };
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
      push(x, y, 0);
      push(x, y, d - 1);
    }
    for (let x = 0; x < w; x++) for (let z = 0; z < d; z++) {
      push(x, 0, z);
      push(x, h - 1, z);
    }
    for (let y = 0; y < h; y++) for (let z = 0; z < d; z++) {
      push(0, y, z);
      push(w - 1, y, z);
    }
    while (qh < qt) {
      const i = q[qh++], z = i % d, y = Math.floor(i / d) % h, x = Math.floor(i / (d * h));
      if (x > 0) push(x - 1, y, z);
      if (x < w - 1) push(x + 1, y, z);
      if (y > 0) push(x, y - 1, z);
      if (y < h - 1) push(x, y + 1, z);
      if (z > 0) push(x, y, z - 1);
      if (z < d - 1) push(x, y, z + 1);
    }
    return ext;
  }

  // recorta a la caja que contiene bloques
  function trimGrid(g, sx, sy, sz, b) {
    const w = b.x1 - b.x0 + 1, h = b.y1 - b.y0 + 1, d = b.z1 - b.z0 + 1, out = new Uint16Array(w * h * d);
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) {
      const a = ((x + b.x0) * sy + y + b.y0) * sz + b.z0;
      out.set(g.subarray(a, a + d), (x * h + y) * d);
    }
    return { g: out, w, h, d };
  }

  function analyze(S, A0) {
    const b = A0.bbox();
    if (!b) return null;
    const { g, w, h, d } = trimGrid(S.grid, S.sx, S.sy, S.sz, b);
    const vol = w * h * d, cls = S.pal.map((s, i) => (i ? classify(s, A0) : { m: "air" }));
    const cnt = {}, flag = { doors: 0, windows: 0, containers: 0, spawners: 0, beds: 0, lights: 0, farm: 0, mossy: 0, water: 0, lava: 0, logs: 0, leaves: 0, stairs: 0 };
    const pcount = new Float64Array(S.pal.length);
    let solid = 0;
    for (let i = 0; i < g.length; i++) {
      const v = g[i];
      if (v) pcount[v]++;
    }
    S.pal.forEach((s, i) => {
      const n = pcount[i];
      if (!n || !i) return;
      const c = cls[i], bn = c.b || "";
      solid += n;
      cnt[c.m] = (cnt[c.m] || 0) + n;
      if (isLowerDoor(s)) flag.doors += n;
      if (/glass/.test(bn)) flag.windows += n;
      if (A0.D.containerOf(s)) flag.containers += n;
      if (/spawner/.test(bn)) flag.spawners += n;
      if (/(^|_)bed$/.test(bn)) flag.beds += n;
      if (/torch|lantern|candle/.test(bn)) flag.lights += n;
      if (/farmland|^(wheat|carrots|potatoes|beetroot)/.test(bn)) flag.farm += n;
      if (/mossy|cracked|vine|moss_|infested|cobweb|^web$/.test(bn)) flag.mossy += n;
      if (/^(water|flowing_water)$/.test(bn)) flag.water += n;
      if (/^(lava|flowing_lava)$/.test(bn)) flag.lava += n;
      if (/_log$|_wood$|_stem$/.test(bn)) flag.logs += n;
      if (/leaves/.test(bn)) flag.leaves += n;
      if (/stairs/.test(bn)) flag.stairs += n;
    });
    const share = (k) => (cnt[k] || 0) / Math.max(1, solid);
    // interior cerrado
    const ext = vol <= 9e6 ? exteriorAir(g, w, h, d) : null;
    let interior = 0;
    if (ext) for (let i = 0; i < vol; i++) if (!g[i] && !ext[i]) interior++;
    const interiorR = interior / vol, fill = solid / vol;
    // base: columnas cuyo bloque más bajo toca el suelo de la caja
    let cols = 0, grounded = 0;
    for (let x = 0; x < w; x++) for (let z = 0; z < d; z++) {
      let low = -1;
      for (let y = 0; y < h; y++) if (g[(x * h + y) * d + z]) {
        low = y;
        break;
      }
      if (low >= 0) {
        cols++;
        if (low <= 1) grounded++;
      }
    }
    const groundR = cols ? grounded / cols : 0;
    // material dominante de la capa inferior (cubos completos)
    const bot = {};
    for (let x = 0; x < w; x++) for (let z = 0; z < d; z++) {
      const v = g[(x * h) * d + z];
      if (!v) continue;
      const bn = (cls[v].b || "");
      if (/stairs|slab|door|fence|wall|torch|lantern|trapdoor|glass|pane|carpet|chest|barrel/.test(bn)) continue;
      bot[S.pal[v]] = (bot[S.pal[v]] || 0) + 1;
    }
    const botTop = Object.keys(bot).sort((a, b2) => bot[b2] - bot[a])[0] || null;
    const dim3 = Math.max(w, d), tall = h / dim3, aspect = Math.max(w, d) / Math.max(1, Math.min(w, d));
    // estilo
    const why = [];
    let style = "structure";
    const flo = groundR < 0.4 && cols > 8 && w >= 6 && d >= 6;
    if (share("plant") + share("wood") * 0 > 0.7 && flag.leaves > 0 && flag.logs > 0 || flag.leaves > 0 && flag.logs > 0 && (flag.leaves + flag.logs) / Math.max(1, solid) > 0.8) {
      style = "tree";
      why.push("logs + leaves");
    } else if ((flag.farm + (cnt.plant || 0) * 0.5 + flag.water * 0.3) / Math.max(1, solid) > 0.4 && h <= 8) {
      style = "farm";
      why.push("crops / farmland");
    } else if (share("ocean") > 0.3 || flag.water / Math.max(1, solid) > 0.4 && share("ocean") > 0.1) {
      style = "ocean";
      why.push("ocean materials");
    } else if (flo) {
      style = "island";
      why.push("hovering base");
    } else if (aspect >= 3 && h <= Math.max(6, dim3 / 3) && interiorR < 0.03) {
      style = "bridge";
      why.push("long and low");
    } else if (fill >= 0.45 && interiorR > 0.02 && (flag.spawners > 0 || flag.doors === 0 && (flag.containers > 0 || (cnt.stone || 0) / Math.max(1, solid) > 0.6))) {
      style = "dungeon";
      why.push("dense stone with hidden rooms");
    } else if (tall >= 1.4 && interiorR > 0.02) {
      style = "tower";
      why.push("much taller than wide");
    } else if (dim3 >= 40 && share("stone") > 0.4 && interiorR > 0.04) {
      style = "castle";
      why.push("large stone building");
    } else if (flag.mossy / Math.max(1, solid) > 0.12 || interiorR < 0.03 && fill < 0.3 && solid > 300 && flag.doors === 0) {
      style = "ruin";
      why.push("worn or open blocks");
    } else if (interiorR >= 0.05 && (flag.doors > 0 || flag.windows > 0 || flag.beds > 0)) {
      style = "house";
      why.push("enclosed rooms with doors or windows");
    } else if (dim3 >= 24) {
      style = "monument";
      why.push("large structure");
    } else if (solid < 400) {
      style = "decor";
      why.push("small build");
    }
    // recomendaciones
    const rec = { place: "surface", dim: "overworld", biomes: [], every: 24, level: 4, spacing: 8, foundation: groundR >= 0.5, clear: true, entrance: flag.doors > 0 };
    if (share("nether") >= 0.35) rec.dim = "nether";
    else if (share("end") >= 0.35) rec.dim = "the_end";
    if (style === "dungeon") rec.place = "underground";
    else if (style === "island") rec.place = "sky";
    else if (style === "ocean") rec.place = "ocean";
    if (rec.place !== "surface") {
      rec.foundation = false;
      rec.clear = false;
    }
    rec.every = dim3 >= 60 ? 96 : dim3 >= 32 ? 48 : dim3 >= 16 ? 24 : 12;
    if (style === "castle" || style === "monument") rec.every = Math.max(rec.every, 64);
    if (style === "dungeon") rec.every = 20;
    rec.level = clamp(Math.round(dim3 / 6) + 2, 2, 8);
    rec.spacing = clamp(Math.ceil(dim3 / 16) + 4, 4, 16);
    const name = (re) => {
      let n = 0;
      S.pal.forEach((s, i) => {
        if (pcount[i] && re.test(s)) n += pcount[i];
      });
      return n;
    };
    const bi = [];
    if (rec.dim === "overworld") {
      if (name(/cactus|dead_?bush|sandstone|(^|:)sand$/) > solid * 0.15) bi.push("desert");
      else if (name(/red_sand|terracotta|red_sandstone/) > solid * 0.15) bi.push("badlands");
      else if (name(/spruce|snow|ice/) > solid * 0.15) bi.push("taiga", "snowy");
      else if (name(/jungle|bamboo|cocoa|mossy/) > solid * 0.12) bi.push("jungle");
      else if (name(/acacia/) > solid * 0.15) bi.push("savanna");
      else if (name(/dark_oak/) > solid * 0.2) bi.push("dark_forest");
      else if (name(/cherry/) > solid * 0.15) bi.push("cherry_grove");
      else if (name(/mangrove|mud/) > solid * 0.15) bi.push("mangrove_swamp", "swamp");
      else if (name(/birch/) > solid * 0.2) bi.push("birch_forest");
    }
    rec.biomes = bi;
    // bloque de cimientos
    let fb = "minecraft:cobblestone";
    if (botTop) {
      const bn = A0.shortName(A0.baseOf(botTop));
      if (/planks|_log$|_wood$|^bamboo/.test(bn)) fb = "minecraft:cobblestone";
      else fb = A0.baseOf(botTop);
    }
    if (rec.dim === "nether") fb = /netherrack|blackstone|nether_brick|basalt/.test(fb) ? fb : "minecraft:netherrack";
    if (rec.dim === "the_end") fb = /end_stone|purpur/.test(fb) ? fb : "minecraft:end_stone";
    rec.foundBlock = fb;
    return { w, h, d, solid, vol, fill, interior: interiorR, grounded: groundR, doors: flag.doors, windows: flag.windows, containers: flag.containers, flags: flag, style, why, rec, cls: cnt };
  }

  window.FD_STRUCT_GEN_CORE = { P, svg, BIOMES, allBiomes, biomeIcon, DIMS, PLACES, FREQ, STYLES, DIMID, defaults, ensure, analyze, exteriorAir, trimGrid, isLowerDoor, isDoorStr, clamp, esc, T, A };
})();

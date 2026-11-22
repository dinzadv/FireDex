const C = {
  orange: "#ff8a2b",
  green: "#2bf08f",
  red: "#ff4b6e",
  purple: "#b68cf5",
  cyan: "#35d4f0",
  yellow: "#ffd23f",
  gray: "#aeb2c4",
  white: "#eceef8",
  blue: "#7a92ff",
  brown: "#c58a4a",
  lime: "#8ee03a",
  pink: "#ff7fb6"
};
const D = {
  home: ["orange", [".....XX.....", "...XXXXXX...", ".XXXllllXXX.", "XXXXXXXXXXXX", "..XllllllX..", "..XllXXllX..", "..XllXXllX..", "..XXXXXXXX.."]],
  code: ["cyan", ["...X....X...", "..X......X..", ".X...XX...X.", "X...XX.....X", ".X..X.....X.", "..X......X..", "...X....X..."]],
  cube: ["purple", ["....XXXX....", "..XXllllXX..", ".XllllllllX.", "XXXXllllXXXX", "XllXXXXXXllX", "XlllXllXllllX".slice(0, 12), "XlllXllXlllX", ".XllXllXllX.", "..XXXllXXX..", "....XXXX...."]],
  manifest: ["green", ["XXXXXXXXX...", "XllllllllXX.", "XlXXXXXllXXX", "XllllllllllX", "XlXXXXXXXXlX", "XllllllllllX", "XlXXXXXlllXX".slice(0, 12), "XllllllllllX", "XXXXXXXXXXXX"]],
  commands: ["yellow", ["XXXXXXXXXXXX", "XllllllllllX", "XlXXllllllllX".slice(0, 12), "XllXXllllllX", "XlXXllllllllX".slice(0, 12), "XllllllXXXXX".slice(0, 12), "XllllllllllX", "XXXXXXXXXXXX"]],
  guide: ["blue", [".XXXX..XXXX.", "XllllXXllllX", "XlXXlXXlXXlX", "XllllXXllllX", "XlXXlXXlXXlX", "XllllXXllllX", "XXXXXXXXXXXX"]],
  toolbox: ["orange", ["....XXXX....", "....X..X....", "XXXXXXXXXXXX", "XllllllllllX", "XXXXXXXXXXXX", "XllllXXllllX", "XllllXXllllX", "XXXXXXXXXXXX"]],
  settings: ["gray", ["....X..X....", ".X.XXXXXX.X.", "..XXllllXX..", ".XXlXXXXlXX.", "XXXllXXllXXX", ".XXlXXXXlXX.", "..XXllllXX..", ".X.XXXXXX.X.", "....X..X...."]],
  globe: ["cyan", ["...XXXXXX...", "..XllXlllX..", ".XllXXllllX.", "XXXXXXXXXXXX", "XllXllXllllX", "XXXXXXXXXXXX", ".XllXXllllX.", "..XllXlllX..", "...XXXXXX..."]],
  folder: ["yellow", ["XXXX........", "XllXXXXXXXX.", "XllllllllllX", "XllllllllllX", "XllllllllllX", "XllllllllllX", "XXXXXXXXXXXX"]],
  folderOpen: ["yellow", ["XXXX........", "XllXXXXXXXX.", "XllXlllllllX", "XXXXXXXXXXXX", "XllllllllllX", ".XllllllllX.", ".XXXXXXXXXX."]],
  folderPlus: ["yellow", ["XXXX........", "XllXXXXXXXX.", "XlllllXllllX", "XlllllXllllX", "XllXXXXXXXlX", "XlllllXllllX", "XXXXXXXXXXXX"]],
  file: ["gray", [".XXXXXXX....", ".XllllXXX...", ".XllllXlXX..", ".XllllXXXXX.", ".XlllllllllX", ".XlllllllllX", ".XlllllllllX", ".XXXXXXXXXXX"]],
  filePlus: ["gray", [".XXXXXXX....", ".XllllXXX...", ".XllllXlXX..", ".XlllXXXXXX.", ".XllXXXXXXXX", ".XlllXXXXXX.", ".XlllllXlllX", ".XXXXXXXXXXX"]],
  image: ["green", ["XXXXXXXXXXXX", "XllllllllllX", "XlllXXllllllX".slice(0, 12), "XllXXXXllllX", "XlllXXlllXlX", "XlllllllXXXX", "XlXXllXXXXXX", "XXXXXXXXXXXX"]],
  plus: ["green", ["....XXXX....", "....XllX....", "....XllX....", "XXXXXllXXXXX", "XllllllllllX", "XXXXXllXXXXX", "....XllX....", "....XllX....", "....XXXX...."]],
  minus: ["red", ["XXXXXXXXXXXX", "XllllllllllX", "XXXXXXXXXXXX"]],
  close: ["red", ["XX........XX", "XXX......XXX", ".XXX....XXX.", "..XXX..XXX..", "...XXXXXX...", "....XXXX....", "...XXXXXX...", "..XXX..XXX..", ".XXX....XXX.", "XXX......XXX", "XX........XX"]],
  back: ["gray", ["....X.......", "...XX.......", "..XXX.......", ".XXXXXXXXXX.", "XXXXllllllX.", ".XXXXXXXXXX.", "..XXX.......", "...XX.......", "....X......."]],
  chevronR: ["gray", ["..XX........", "...XX.......", "....XX......", ".....XX.....", "....XX......", "...XX.......", "..XX........"]],
  chevronD: ["gray", ["XX......XX", ".XX....XX.", "..XX..XX..", "...XXXX...", "....XX...."]],
  check: ["green", ["..........XX", ".........XXX", "........XXX.", "XX.....XXX..", "XXX...XXX...", ".XXX.XXX....", "..XXXXX.....", "...XXX......", "....X......."]],
  trash: ["red", ["....XXXX....", "XXXXXXXXXXXX", ".XlllllllllX.".slice(0, 12), "..XlXlXlXlX.", "..XlXlXlXlX.", "..XlXlXlXlX.", "..XlXlXlXlX.", "..XXXXXXXXX."]],
  copy: ["gray", ["XXXXXXX.....", "XllllllX....", "XlXXXXXXXXX.", "XlXllllllllX", "XlXllllllllX", "XXXllllllllX", "..XllllllllX", "..XXXXXXXXXX"]],
  download: ["green", ["....XXXX....", "....XllX....", "....XllX....", "XX..XllX..XX", ".XXXXllXXXX.", "..XXllllXX..", "...XXllXX...", "....XXXX....", "XXXXXXXXXXXX", "XllllllllllX", "XXXXXXXXXXXX"]],
  upload: ["cyan", ["....XXXX....", "...XllllX...", "..XXllllXX..", ".XXXllllXXX.", "XX..XllX..XX", "....XllX....", "....XllX....", "....XXXX....", "XXXXXXXXXXXX", "XllllllllllX", "XXXXXXXXXXXX"]],
  save: ["blue", ["XXXXXXXXXX..", "XlXXXXXXlXX.", "XlXlllXXlllX", "XlXXXXXXlllX", "XllllllllllX", "XllXXXXXXllX", "XllXllllXllX", "XXXXXXXXXXXX"]],
  search: ["cyan", ["..XXXXXX....", ".XllllllX...", "XllXXXXllX..", "XllX..XllX..", "XllX..XllX..", "XllXXXXllX..", ".XllllllXX..", "..XXXXXXXXX.", ".........XXX", "..........XX"]],
  undo: ["gray", ["...X........", "..XX........", ".XXXXXXXXX..", "XXXXlllllXX.", ".XXXXXXXllX.", "..XX...XllX.", "...X...XllX.", ".......XXX.."]],
  redo: ["gray", ["........X...", "........XX..", "..XXXXXXXXX.", ".XXlllllXXXX", ".XllXXXXXXX.", ".XllX...XX..", ".XllX....X..", "..XXX......."]],
  play: ["green", [".XX.........", ".XXXX.......", ".XllXXX.....", ".XllllXXX...", ".XllllllXXX.", ".XllllXXX...", ".XllXXX.....", ".XXXX.......", ".XX........."]],
  pause: ["yellow", ["XXXX..XXXX..", "XllX..XllX..", "XllX..XllX..", "XllX..XllX..", "XllX..XllX..", "XllX..XllX..", "XllX..XllX..", "XXXX..XXXX.."]],
  stop: ["red", ["XXXXXXXXXX", "XllllllllX", "XllllllllX", "XllllllllX", "XllllllllX", "XllllllllX", "XllllllllX", "XXXXXXXXXX"]],
  refresh: ["cyan", ["..XXXXXX....", ".XXllllXX.X.", "XXl....lXXXX", "Xl......XXXX", "Xl..........", "Xl......lX..", "XXl....lXX..", ".XXllllXX...", "..XXXXXX...."]],
  eye: ["purple", ["............", "...XXXXXX...", ".XXllllllXX.", "XllllXXllllX", "XlllXXXXlllX", "XllllXXllllX", ".XXllllllXX.", "...XXXXXX..."]],
  warn: ["yellow", [".....XX.....", "....XllX....", "....XllX....", "...XlXXlX...", "...XlXXlX...", "..XllXXllX..", "..XllllllX..", ".XllllXXllX.", "XXXXXXXXXXXX"]],
  info: ["blue", ["...XXXXXX...", "..XllXXllX..", ".XllllllllX.", "XlllllXXlllX", "XllllllllllX", "XlllllXXlllX", "XlllllXXlllX", ".XllllXXllX.", "..XllXXllX..", "...XXXXXX..."]],
  error: ["red", ["...XXXXXX...", "..XllllllX..", ".XXlllllXXX.", "XXXXllllXXXX".slice(0, 12), "XllXXllXXllX", "XlllXXXXllllX".slice(0, 12), "XllXXllXXllX", ".XXXlllXXXX.", "..XllllllX..", "...XXXXXX..."]],
  edit: ["orange", [".........XX.", "........XllX", ".......XllXX", "......XllXX.", ".....XllXX..", "....XllXX...", "...XllXX....", "..XXlXX.....", ".XXXXX......", "XXXX........"]],
  move: ["cyan", [".....XX.....", "....XXXX....", ".....XX.....", "..X..XX..X..", ".XX..XX..XX.", "XXXXXXXXXXXX", ".XX..XX..XX.", "..X..XX..X..", ".....XX.....", "....XXXX....", ".....XX....."]],
  brush: ["orange", ["........XX..", ".......XllX.", "......XllX..", ".....XllX...", "..XXXllX....", ".XllXXX.....", "XllllX......", "XlllX.......", ".XXX........"]],
  eraser: ["pink", [".....XXXXXX.", "....XllllllX", "...XllllllXX", "..XllllllXX.", ".XXXXXXXXX..", "XlllllllXX..", "XllllllXX...", "XXXXXXXX...."]],
  bucket: ["cyan", ["....XX......", "...XXXX.....", "..XXllXX....", ".XXllllXX...", "XXllllllXX..", "XXXXXXXXXX..", ".XXllllXXXX.", "..XXllXX.XX.", "...XXXX..XX.", "..........X."]],
  line: ["white", ["..........XX", ".........XXX", "........XXX.", ".......XXX..", "......XXX...", ".....XXX....", "....XXX.....", "...XXX......", "XXXXX.......", "XXX........."]],
  rect: ["white", ["XXXXXXXXXXXX", "XllllllllllX", "XllllllllllX", "XllllllllllX", "XllllllllllX", "XllllllllllX", "XXXXXXXXXXXX"]],
  ellipse: ["white", ["...XXXXXX...", ".XXllllllXX.", "XllllllllllX", "XllllllllllX", "XllllllllllX", ".XXllllllXX.", "...XXXXXX..."]],
  sphere: ["purple", ["...XXXXXX...", "..XllllllX..", ".XlXXllllXX.", "XlXllllllllX", "XXXXXXXXXXXX", "XlllllllllXX", ".XllllllllX.", "..XXllllXX..", "...XXXXXX..."]],
  select: ["white", ["XX.XX.XX.XX.", "X..........X", "............", "X..........X", "............", "X..........X", "............", "XX.XX.XX.XX."]],
  picker: ["blue", [".......XXX..", "......XXXXX.", ".....XXXXXX.", "....XXXXXX..", "...XXXXX....", "..XXlXX.....", ".XXlXX......", "XXlXX.......", "XXXX........"]],
  hand: ["orange", ["....XX......", "....XlX.XX..", "..X.XlXXlXX.", ".XlXXllXllXX", ".XllXllllllX", "..XllllllllX", "..XlllllllX.", "...XllllllX.", "....XXXXXX.."]],
  chest: ["brown", ["..XXXXXXXX..", ".XllllllllX.", "XllllllllllX", "XXXXXXXXXXXX", "XllllXXllllX", "XllllXXllllX", "XllllllllllX", "XXXXXXXXXXXX"]],
  layers: ["purple", [".....XX.....", "...XXllXX...", ".XXllllllXX.", "XXXXllllXXXX", ".XXllllllXX.", "XXXXXllXXXXX", ".XXllllllXX.", "...XXXXXX..."]],
  grid: ["gray", ["XXXXXXXXXXXX", "XllXllXllllX".slice(0, 12), "XllXllXllllX".slice(0, 12), "XXXXXXXXXXXX", "XllXllXllllX".slice(0, 12), "XllXllXllllX".slice(0, 12), "XXXXXXXXXXXX"]],
  bone: ["white", ["XX........XX", "XXX......XXX", "XlXXXXXXXXlX", "XXXllllllXXX", "XX........XX"]],
  film: ["purple", ["XXXXXXXXXXXX", "XlXllllllXlX", "XXXllllllXXX", "XlXllXXllXlX", "XXXllXXllXXX", "XlXllllllXlX", "XXXllllllXXX", "XlXXXXXXXXlX", "XXXXXXXXXXXX"]],
  star: ["yellow", [".....XX.....", ".....XX.....", "....XllX....", "XXXXXllXXXXX", ".XXllllllXX.", "..XXllllXX..", "..XllXXllX..", ".XXlX..XlXX.", ".XX......XX."]],
  block: ["lime", ["..XXXXXXXX..", ".XllllllllXX", "XXXXXXXXXXlX", "XbbbbbbbbbXX".replace(/b/g, "X"), "XlXXlXXlXXlX", "XlXXXXXXXXlX", "XlXXlXXXXXlX", "XXXXXXXXXXXX"]],
  structure: ["orange", ["X.X.XX.X.X..", "XXXXXXXXXXX.", "XllXllllXllX", "XllXllllXllX", "XXXXlXXlXXXX", "XllXllllXllX", "XllXllllXllX", "XXXXXXXXXXXX"]],
  recipe: ["brown", ["XXXXXXXXXXXX", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "XlXXlXXlXXlX", "XlXXlXXlXXlX", "XXXXXXXXXXXX", "XlXXlXXlXXlX", "XlXXlXXlXXlX", "XXXXXXXXXXXX"]],
  loot: ["cyan", ["..XXXXXXXX..", ".XllXllXllX.", "XllllXXllllX", "XXXXXXXXXXXX", ".XlllXXlllX.", "..XllXXllX..", "...XlXXlX...", "....XXXX...."]],
  tag: ["pink", ["XXXXXXXX....", "XllllllXX...", "XlXXllllXX..", "XlXXlllllXX.", "XllllllllXX.", "XXllllllXX..", ".XXllllXX...", "..XXXXXX...."]],
  hud: ["red", ["XXXXXXXXXXXX", "XllllllllllX", "XlXXlXXllllX", "XlXXXXXXllll".slice(0, 12), "XllXXXXllllX", "XlllXXllllllX".slice(0, 12), "XllllllllllX", "XXXXXXXXXXXX", ".XXXXXXXXXX."]],
  texture: ["green", ["XXXXXXXXXXXX", "XlXXllllXXlX", "XXXXXllXXXXX", "XllXXllXXllX", "XllllXXllllX", "XXllllllllXX", "XXXXllllXXXX", "XXXXXXXXXXXX"]],
  cookie: ["brown", ["...XXXXXX...", "..XllXllXX..", ".XlXllllllX.", "XllllXllXllX", "XlXllllllllX", "XllllllXllXX", ".XlXllllllX.", "..XXllXlXX..", "...XXXXXX..."]],
  shield: ["blue", ["XXXXXXXXXXXX", "XllllXXllllX", "XllllXXllllX", "XlllXXXXlllX", ".XlllXXlllX.", ".XXllXXllXX.", "..XXllllXX..", "...XXXXXX...", "....XXXX...."]],
  scroll: ["yellow", ["..XXXXXXXXX.", ".XllllllllX.", ".XXXXXXXXXXX".slice(0, 12), "..XllllllX..", "..XXXXXXXX..", "..XllllllX..", ".XXXXXXXXXX.", ".XllllllllX.", "..XXXXXXXX.."]],
  menu: ["gray", ["XXXXXXXXXXXX", "XXXXXXXXXXXX", "............", "XXXXXXXXXXXX", "XXXXXXXXXXXX", "............", "XXXXXXXXXXXX", "XXXXXXXXXXXX"]],
  more: ["gray", ["............", "XX..XX..XX..", "XX..XX..XX..", "............"]],
  lock: ["yellow", ["...XXXXXX...", "..XX....XX..", "..X......X..", "XXXXXXXXXXXX", "XllllllllllX", "XlllllXXlllX".slice(0, 12), "XlllllXXllllX".slice(0, 12), "XXXXXXXXXXXX"]],
  wand: ["purple", [".......X....", ".......XX..X", "..X.....XXX.", ".X.X...XXX..", "..X...XXX...", ".....XXX....", "....XXX.....", "...XXX......", "..XXX.......", ".XXX........"]],
  link: ["cyan", ["..XXXX......", ".XllllX.....", "XlXXXXlX....", "XlX..XlXXXX.", "XlX...XXllX.", ".XXXX.XlllX.", "......XlXXXX", ".......XllllX", "........XXXX."]],
  js: ["yellow", ["XXXXXXXXXXXX", "XlllllXXXXlX", "XlllllXlllXX", "XlXllXXXXXlX", "XlXllllllXlX", "XXXllllXXXlX", "XXXXXXXXXXXX"]],
  json: ["orange", ["..XX....XX..", ".XX......XX.", ".X...XX...X.", "XX...XX...XX", ".X........X.", ".XX......XX.", "..XX....XX.."]],
  bell: ["yellow", [".....XX.....", "...XXXXXX...", "..XllllllX..", "..XllllllX..", ".XllllllllX.", "XXXXXXXXXXXX", ".....XX....."]],
  heart: ["red", [".XXX..XXX...", "XllllXllllX.", "XlllllllllX.", "XlllllllllX.", ".XllllllXX..", "..XlllllX...", "...XllXX....", "....XX......"]]
};
const mix = (hex, t) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.round(v + (255 - v) * t);
  return "#" + [f(n >> 16 & 255), f(n >> 8 & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, "0")).join("");
};
const shade = (hex, t) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.round(v * (1 - t));
  return "#" + [f(n >> 16 & 255), f(n >> 8 & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, "0")).join("");
};
export const iconNames = Object.keys(D);
export function iconLayers(name, color) {
  const def = D[name] || D.file;
  const main = color || C[def[0]] || def[0];
  const rows = def[1];
  const w = 12;
  const oy = Math.max(0, Math.floor((12 - rows.length) / 2));
  const fills = { X: main, l: shade(main, 0.66), d: mix(main, 0.55) };
  const layers = {};
  rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const ch = row[x];
      if (!ch || ch === ".") {
        x++;
        continue;
      }
      let e = x;
      while (e < w && row[e] === ch) e++;
      const key = fills[ch] || main;
      (layers[key] = layers[key] || []).push("M" + x + " " + (y + oy) + "h" + (e - x) + "v1h-" + (e - x) + "z");
      x = e;
    }
  });
  return Object.keys(layers).map((fill) => ({ fill, d: layers[fill].join("") }));
}
export function iconSvg(name, opts) {
  const o = opts || {};
  const size = o.size || 20;
  const body = iconLayers(name, o.color).map((l) => '<path fill="' + l.fill + '" d="' + l.d + '"/>').join("");
  return '<svg class="pxi" viewBox="0 0 12 12" width="' + size + '" height="' + size + '" shape-rendering="crispEdges" aria-hidden="true">' + body + "</svg>";
}
const LEGACY = {
  folderClosed: "folder",
  folderOpen: "folderOpen",
  file: "file",
  image: "image",
  cube: "cube",
  chevron: "chevronR",
  chevronDown: "chevronD",
  plus: "plus",
  folderPlus: "folderPlus",
  folderUp: "upload",
  filePlus: "filePlus",
  fileUp: "upload",
  trash: "trash",
  edit: "edit",
  move: "move",
  download: "download",
  warn: "warn",
  emptyDoc: "file",
  package: "toolbox",
  structure: "structure",
  varIcon: "code",
  tagIcon: "tag",
  syntaxIcon: "code",
  save: "save",
  play: "play",
  menu: "menu",
  back: "back",
  fwd: "back",
  undo: "undo",
  redo: "redo",
  find: "search",
  more: "more",
  close: "close",
  home: "home",
  toolbox: "toolbox",
  gear: "settings",
  box: "download",
  err: "error",
  warnTri: "warn",
  infoC: "info",
  info: "info",
  check: "check",
  wand: "wand",
  up: "chevronD",
  arrowL: "back",
  arrowU: "chevronD",
  copy: "copy",
  line: "line",
  eye: "eye",
  puzzle: "block",
  globe: "globe",
  term: "commands",
  snapshot: "image",
  wrench: "settings",
  person: "hand",
  clock: "refresh",
  camera: "image",
  brackets: "json",
  gradCap: "guide",
  dragon: "star",
  checkCircle: "check",
  circleEmpty: "rect",
  dots: "more",
  models: "cube",
  uuid: "tag",
  jsonFormat: "json",
  colors: "texture",
  snippet: "code",
  manifest: "manifest",
  imgjson: "film",
  upload: "upload",
  regen: "refresh",
  pause: "pause",
  restart: "refresh"
};
const FLIP = { fwd: 1, up: 1, arrowU: 1 };
export function legacyIcon(key) {
  const name = LEGACY[key];
  if (!name) return null;
  let s = iconSvg(name, { size: 24 });
  if (key === "fwd") s = s.replace('class="pxi"', 'class="pxi" style="transform:scaleX(-1)"');
  if (key === "up" || key === "arrowU") s = s.replace('class="pxi"', 'class="pxi" style="transform:scaleY(-1)"');
  return s;
}
export function overrideIcons(obj) {
  Object.keys(obj).forEach((k) => {
    const s = legacyIcon(k);
    if (s) obj[k] = s;
  });
  return obj;
}
export const colors = C;
void FLIP;

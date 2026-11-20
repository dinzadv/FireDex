document.title = "FireDex \xB7 Editor";
const ICONS = { "folderClosed": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>', "folderOpen": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.2A2 2 0 0 1 5 6.2h3.6l1.8 2.1H19a2 2 0 0 1 1.94 2.47l-1.18 5.1A2 2 0 0 1 17.8 17.4H5.4a2 2 0 0 1-1.95-1.56L2.06 10.2A2 2 0 0 1 3 8.2Z"/><path d="M3 8.2 5.4 6.2"/></svg>', "file": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-5Z"/><path d="M13 3v5h6"/></svg>', "image": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 15-5-5-9 9"/></svg>', "cube": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5"/><path d="M12 12v9"/></svg>', "chevron": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>', "plus": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>', "folderPlus": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M12 11v5M9.5 13.5h5"/></svg>', "folderUp": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/><path d="M12 16v-5M9.5 13.5 12 11l2.5 2.5"/></svg>', "filePlus": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-5Z"/><path d="M13 3v5h6"/><path d="M9 15h6M12 12v6"/></svg>', "fileUp": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-5Z"/><path d="M13 3v5h6"/><path d="M9 17.5v-5M6.5 15l2.5-2.5 2.5 2.5"/></svg>', "trash": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M10 11v6M14 11v6"/></svg>', "edit": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>', "move": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9V7a2 2 0 0 1 2-2h3l2 2.5h5a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2"/><path d="M2 13h9M8 9.5 11.5 13 8 16.5"/></svg>', "download": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7.5 10.5 12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/></svg>', "warn": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".2" fill="currentColor"/></svg>', "emptyDoc": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-5Z"/><path d="M13 3v5h6"/><path d="M9 13h6M9 17h4"/></svg>', "package": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>', "structure": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4H6.5A2.5 2.5 0 0 0 4 6.5v3A2.5 2.5 0 0 1 1.5 12 2.5 2.5 0 0 1 4 14.5v3A2.5 2.5 0 0 0 6.5 20H8"/><path d="M16 4h1.5A2.5 2.5 0 0 1 20 6.5v3a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0-2.5 2.5v3a2.5 2.5 0 0 1-2.5 2.5H16"/></svg>', "varIcon": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m9.5 9.5 5 5m0-5-5 5"/></svg>', "tagIcon": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.5 3H6a1 1 0 0 0-1 1v6.5a1 1 0 0 0 .3.7l9 9a1 1 0 0 0 1.4 0l6.5-6.5a1 1 0 0 0 0-1.4l-9-9a1 1 0 0 0-.7-.3Z"/><circle cx="8.3" cy="8.3" r="1.3"/></svg>', "syntaxIcon": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/></svg>', "save": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M8 3v5h8V3"/><path d="M7 13h10v8H7z"/></svg>', "play": '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7.5 4.8v14.4a1 1 0 0 0 1.53.85l11.2-7.2a1 1 0 0 0 0-1.7l-11.2-7.2a1 1 0 0 0-1.53.85Z"/></svg>' }, FILE_TYPES = { "js": { "bg": "#f0db4f", "color": "#1c1c1c", "label": "JS", "lang": "javascript" }, "mjs": { "bg": "#f0db4f", "color": "#1c1c1c", "label": "JS", "lang": "javascript" }, "cjs": { "bg": "#f0db4f", "color": "#1c1c1c", "label": "JS", "lang": "javascript" }, "jsx": { "bg": "#61dafb", "color": "#0b1b26", "label": "JSX", "lang": "javascript" }, "ts": { "bg": "#3178c6", "color": "#fff", "label": "TS", "lang": "typescript" }, "tsx": { "bg": "#3178c6", "color": "#fff", "label": "TSX", "lang": "typescript" }, "json": { "bg": "#f2a24b", "color": "#1c1c1c", "label": "{ }", "lang": "json" }, "html": { "bg": "#e34c26", "color": "#fff", "label": "<>", "lang": "xml" }, "htm": { "bg": "#e34c26", "color": "#fff", "label": "<>", "lang": "xml" }, "css": { "bg": "#2965f1", "color": "#fff", "label": "#", "lang": "css" }, "scss": { "bg": "#c76494", "color": "#fff", "label": "#", "lang": "css" }, "md": { "bg": "#63b3ed", "color": "#0b1220", "label": "M\u2193", "lang": "markdown" }, "py": { "bg": "#3572a5", "color": "#fff", "label": "Py", "lang": "python" }, "yml": { "bg": "#a8324a", "color": "#fff", "label": "YML", "lang": "yaml" }, "yaml": { "bg": "#a8324a", "color": "#fff", "label": "YML", "lang": "yaml" }, "txt": { "bg": "#5a5a62", "color": "#fff", "label": "TXT", "lang": "plaintext" }, "sh": { "bg": "#4eaa25", "color": "#fff", "label": "SH", "lang": "bash" }, "lang": { "bg": "#20c997", "color": "#0b1220", "label": "LANG", "lang": "plaintext" }, "material": { "bg": "#e879f9", "color": "#1c0a1c", "label": "MTL", "lang": "json" }, "mcfunction": { "bg": "#20c997", "color": "#0b1220", "label": "MCF", "lang": "plaintext" } }, IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"], MODEL_EXTS = ["obj", "fbx", "glb", "gltf", "bbmodel"], BEDROCK_API_KEYWORDS = ["world", "system", "ItemStack", "BlockPermutation", "BlockTypes", "ItemTypes", "EntityComponentTypes", "EquipmentSlot", "GameMode", "Direction", "DimensionTypes", "MinecraftBlockTypes", "MinecraftItemTypes", "ScriptEventSource", "TicksPerSecond", "Vector3", "Vector2", "EntityQueryOptions", "CustomCommand", "CustomCommandStatus", "ItemComponentTypes"], LANG_KEYWORDS = { "javascript": ["const", "let", "var", "function", "return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "class", "extends", "new", "this", "import", "export", "from", "default", "try", "catch", "finally", "throw", "async", "await", "typeof", "instanceof", "in", "of", "null", "undefined", "true", "false", "yield", "static", "get", "set", "super", ...BEDROCK_API_KEYWORDS], "typescript": ["const", "let", "var", "function", "return", "if", "else", "for", "while", "do", "switch", "case", "break", "continue", "class", "extends", "implements", "interface", "type", "enum", "new", "this", "import", "export", "from", "default", "try", "catch", "finally", "throw", "async", "await", "typeof", "instanceof", "in", "of", "null", "undefined", "true", "false", "public", "private", "protected", "readonly", ...BEDROCK_API_KEYWORDS], "xml": ["div", "span", "a", "img", "ul", "li", "ol", "p", "h1", "h2", "h3", "h4", "h5", "h6", "table", "tr", "td", "th", "thead", "tbody", "form", "input", "button", "select", "option", "textarea", "label", "header", "footer", "nav", "section", "article", "aside", "main", "script", "style", "link", "meta", "title", "head", "body", "html", "svg", "path", "iframe", "video", "audio", "source", "canvas"], "css": ["color", "background", "display", "flex", "grid", "position", "width", "height", "margin", "padding", "border", "font-size", "font-weight", "align-items", "justify-content", "transition", "transform", "overflow", "cursor", "opacity", "box-shadow", "border-radius", "important", "media", "keyframes", "hover", "focus", "active", "before", "after"], "python": ["def", "return", "if", "elif", "else", "for", "while", "import", "from", "class", "try", "except", "finally", "with", "as", "lambda", "yield", "None", "True", "False", "and", "or", "not", "in", "is"], "bash": ["if", "then", "else", "fi", "for", "do", "done", "while", "function", "echo", "export"], "json": [], "yaml": [], "plaintext": [] }, BRACKET_PAIRS = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'", "`": "`" }, BRACKET_CLOSERS = [")", "]", "}", '"', "'", "`"], INDENT_OPENERS = ["(", "[", "{"], SETTINGS_KEY = "devstudio_editor_settings";

/* ================= FireDex Editor · base ================= */
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const EC = window.EC;
const sv = (p, sw) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.9) + '" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
Object.assign(ICONS, {
  menu: sv('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  back: sv('<path d="M15 5 8 12l7 7"/>'),
  fwd: sv('<path d="m9 5 7 7-7 7"/>'),
  undo: sv('<path d="M9 7 4 12l5 5"/><path d="M4 12h10a6 6 0 0 1 0 12h-3" transform="translate(0 -4)"/>'),
  redo: sv('<path d="m15 7 5 5-5 5"/><path d="M20 12H10a6 6 0 0 0 0 12h3" transform="translate(0 -4)"/>'),
  find: sv('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>'),
  save: sv('<path d="M5 3h11l3 3v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M8 3v5h8V3M7 21v-8h10v8"/>'),
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.9"/><circle cx="12" cy="12" r="1.9"/><circle cx="12" cy="19" r="1.9"/></svg>',
  close: sv('<path d="M6 6l12 12M18 6 6 18"/>', 2.2),
  home: sv('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1v-9"/>'),
  toolbox: sv('<rect x="2.5" y="9.5" width="19" height="10.5" rx="2.2"/><path d="M8 9.5V6.8A2.3 2.3 0 0 1 10.3 4.5h3.4A2.3 2.3 0 0 1 16 6.8v2.7M2.5 14.5h5.2M16.3 14.5h5.2"/>'),
  gear: sv('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>'),
  box: sv('<path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/>'),
  err: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M8.5 8.5l7 7m0-7-7 7" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>',
  warnTri: '<svg viewBox="0 0 24 24"><path d="M12 2.8 22.2 20.5a1 1 0 0 1-.87 1.5H2.67a1 1 0 0 1-.87-1.5L12 2.8Z" fill="currentColor"/><path d="M12 9.5v5" stroke="#1b1b1b" stroke-width="2.3" stroke-linecap="round"/><circle cx="12" cy="18" r="1.25" fill="#1b1b1b"/></svg>',
  infoC: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 11v6" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/><circle cx="12" cy="7.3" r="1.3" fill="#fff"/></svg>',
  check: sv('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 2.4),
  wand: sv('<path d="m4 20 11-11M14 4l1.2 2.3L17.5 7.5l-2.3 1.2L14 11l-1.2-2.3L10.5 7.5l2.3-1.2L14 4ZM18.5 13l.7 1.3 1.3.7-1.3.7-.7 1.3-.7-1.3-1.3-.7 1.3-.7.7-1.3Z"/>'),
  up: sv('<path d="m6 15 6-6 6 6"/>'), down: sv('<path d="m6 9 6 6 6-6"/>'),
  arrowL: sv('<path d="M19 12H5M11 6l-6 6 6 6"/>'), arrowR: sv('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  arrowU: sv('<path d="M12 19V5M6 11l6-6 6 6"/>'), arrowD: sv('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  copy: sv('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>'),
  line: sv('<path d="M4 6h16M4 12h10M4 18h13"/>'),
  eye: sv('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
  puzzle: sv('<path d="M10 4a2 2 0 1 1 4 0v2h4v4h-2a2 2 0 1 0 0 4h2v4h-4v-2a2 2 0 1 0-4 0v2H6v-4h2a2 2 0 1 0 0-4H6V6h4V4Z"/>', 1.7),
  globe: sv('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3Z"/>', 1.6),
  term: sv('<path d="m5 8 4 4-4 4M12 17h7"/>'),
  snapshot: sv('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>')
});

const EDITOR_DEFAULTS = { autocomplete: true, autoClose: true, lineNumbers: true, fontSize: 14, tabSize: 2, autoSave: true, lint: true, mcHints: true };
let editorSettings = loadEditorSettings();
function loadEditorSettings() { try { return Object.assign({}, EDITOR_DEFAULTS, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); } catch (e) { return Object.assign({}, EDITOR_DEFAULTS); } }
function saveEditorSettings() { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(editorSettings)); } catch (e) { } }

function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
const BINARY_EXTS = ['ogg', 'wav', 'mp3', 'fsb', 'mcstructure', 'nbt', 'zip', 'mcpack', 'mcaddon', 'ttf', 'otf', 'woff', 'woff2', 'tga', 'dat', 'ldb', 'bin', 'mp4', 'pdf'];

/* ---------- Tipos de archivo e íconos ---------- */
const FOLDER_COLORS = { scripts: '#f7df1e', textures: '#c084fc', models: '#2dd4bf', entities: '#4ade80', entity: '#4ade80', items: '#fb923c', blocks: '#a8a29e', recipes: '#f472b6', loot_tables: '#fbbf24', animations: '#38bdf8', animation_controllers: '#38bdf8', render_controllers: '#60a5fa', particles: '#f0abfc', sounds: '#34d399', texts: '#20c997', functions: '#4ade80', ui: '#fb7185', attachables: '#fdba74', spawn_rules: '#86efac', biomes: '#86efac', features: '#a3e635', materials: '#e879f9', behavior_packs: '#7c8cff', resource_packs: '#f59e0b', bp: '#7c8cff', rp: '#f59e0b' };
const JSON_KINDS = [['entities', 'Entidad'], ['entity', 'Entidad'], ['items', 'Objeto'], ['blocks', 'Bloque'], ['recipes', 'Receta'], ['loot_tables', 'Loot table'], ['animation_controllers', 'Controlador de animación'], ['animations', 'Animación'], ['render_controllers', 'Render controller'], ['particles', 'Partícula'], ['spawn_rules', 'Spawn rule'], ['attachables', 'Attachable'], ['biomes', 'Bioma'], ['features', 'Feature'], ['sounds', 'Sonidos'], ['ui', 'Interfaz'], ['texts', 'Textos'], ['trading', 'Comercio'], ['dialogue', 'Diálogo']];
const BADGES = {
  js: { bg: '#f7df1e', fg: '#1b1b1b', t: 'JS' }, mjs: { bg: '#f7df1e', fg: '#1b1b1b', t: 'JS' }, cjs: { bg: '#f7df1e', fg: '#1b1b1b', t: 'JS' }, jsx: { bg: '#61dafb', fg: '#0b1b26', t: 'JSX' },
  ts: { bg: '#3178c6', fg: '#fff', t: 'TS' }, mts: { bg: '#3178c6', fg: '#fff', t: 'TS' }, cts: { bg: '#3178c6', fg: '#fff', t: 'TS' }, tsx: { bg: '#3178c6', fg: '#fff', t: 'TSX' },
  json: { bg: '#f2a24b', fg: '#1b1b1b', t: '{}' }, jsonc: { bg: '#f2a24b', fg: '#1b1b1b', t: '{}' }, mcmeta: { bg: '#f2a24b', fg: '#1b1b1b', t: '{}' },
  html: { bg: '#e34c26', fg: '#fff', t: '<>' }, htm: { bg: '#e34c26', fg: '#fff', t: '<>' }, xml: { bg: '#e34c26', fg: '#fff', t: '<>' }, svg: { bg: '#ffb13b', fg: '#1b1b1b', t: 'SVG' },
  css: { bg: '#2965f1', fg: '#fff', t: '#' }, scss: { bg: '#c76494', fg: '#fff', t: '#' }, md: { bg: '#63b3ed', fg: '#0b1220', t: 'M↓' },
  mcfunction: { bg: '#4ade80', fg: '#06210f', t: '/_' }, lang: { bg: '#20c997', fg: '#06231c', t: 'Aa' }, material: { bg: '#e879f9', fg: '#2a0a30', t: 'MAT' },
  py: { bg: '#3572a5', fg: '#fff', t: 'Py' }, yml: { bg: '#cb4b5f', fg: '#fff', t: 'YML' }, yaml: { bg: '#cb4b5f', fg: '#fff', t: 'YML' }, sh: { bg: '#4eaa25', fg: '#fff', t: 'SH' },
  txt: { bg: '#6b7089', fg: '#fff', t: 'TXT' }, bbmodel: { bg: '#2dd4bf', fg: '#04211d', t: 'BB' }
};
function pathOf(node) { return (typeof node === 'object' && node.id) ? (getNodePath(node.id) || node.name) : String(node); }
function getNodePath(id, cur, acc) {
  cur = cur || state.root; acc = acc || [];
  if (cur.id === id) return acc.concat(cur.id === 'root' ? [] : [cur.name]).join('/');
  if (cur.children) for (const c of cur.children) { const r = getNodePath(id, c, cur.id === 'root' ? acc : acc.concat([cur.name])); if (r) return r; }
  return null;
}
/** Metadatos de un archivo (nodo o nombre). */
function fileMeta(arg) {
  const name = typeof arg === 'string' ? arg : arg.name; const path = typeof arg === 'object' ? (getNodePath(arg.id) || name) : name; const ext = getExt(name);
  const content = typeof arg === 'object' ? arg.content : '';
  const lower = name.toLowerCase(); const lang = EC.langOf(name); const L = EC.LANGS[lang];
  const m = { name, path, ext, lang, langName: L.name, isModel: false, isImage: false, isBinary: false, bg: L.color, color: L.ink, label: L.short, kind: L.name, badge: BADGES[ext] };
  if (IMAGE_EXTS.includes(ext)) { if (ext === 'svg') { m.isImage = false; m.lang = 'html'; m.kind = 'SVG'; return m; } return Object.assign(m, { isImage: true, bg: '#a855f7', color: '#fff', label: 'IMG', kind: 'Imagen ' + ext.toUpperCase(), lang: 'text', icon: 'image' }); }
  if (BINARY_EXTS.includes(ext) || (typeof content === 'string' && content.startsWith('data:') && !IMAGE_EXTS.includes(ext))) return Object.assign(m, { isBinary: true, bg: '#6b7089', color: '#fff', label: ext.toUpperCase().slice(0, 4) || 'BIN', kind: 'Archivo binario', lang: 'text' });
  if (typeof isModelFile === 'function' && isModelFile(path, name, content)) { m.isModel = true; m.bg = 'var(--model)'; m.color = '#fff'; m.icon = 'cube'; m.kind = ext === 'json' ? 'JSON · Modelo' : 'Modelo 3D'; if (ext === 'json') m.lang = 'json'; else if (ext === 'bbmodel') m.lang = 'json'; else m.lang = 'text'; return m; }
  if (lower === 'manifest.json') { m.bg = '#ff9f1c'; m.color = '#1b1b1b'; m.icon = 'puzzle'; m.kind = 'JSON · Manifest'; return m; }
  if (ext === 'json') { const seg = path.toLowerCase().split('/'); const hit = JSON_KINDS.find((k) => seg.includes(k[0])); if (hit) m.kind = 'JSON · ' + hit[1]; }
  if (ext === 'lang') m.icon = 'globe';
  if (!EXT_KNOWN(ext) ) { m.generic = true; m.label = ext ? ext.toUpperCase().slice(0, 3) : '··'; m.bg = '#4b4f66'; m.color = '#fff'; m.kind = 'Texto'; }
  if (m.badge) { m.bg = m.badge.bg; m.color = m.badge.fg; m.label = m.badge.t; }
  return m;
}
function EXT_KNOWN(ext) { return !!(BADGES[ext] || EC.langOf('x.' + ext) !== 'text'); }
/** HTML del ícono de un archivo (insignia legible, 24px). */
function fileIconHtml(node, size) {
  const m = fileMeta(node); const cls = 'fi' + (size ? ' ' + size : '');
  if (m.isImage && node.content && node.content.startsWith('data:')) return '<img class="fi-thumb ' + (size || '') + '" src="' + node.content + '" alt="">';
  const inner = m.icon && ICONS[m.icon] ? ICONS[m.icon] : escapeHtml(m.label);
  return '<span class="' + cls + (m.icon ? ' ico' : '') + (m.label.length > 2 ? ' l3' : '') + '" style="--fbg:' + m.bg + ';--ffg:' + m.color + '">' + inner + '</span>';
}
function folderIconHtml(node) {
  const c = FOLDER_COLORS[node.name.toLowerCase()] || '';
  return '<span class="fo" ' + (c ? 'style="--fc:' + c + '"' : '') + '>' + (node.open ? ICONS.folderOpen : ICONS.folderClosed) + '</span>';
}
function renderFileIcon(node) { return fileIconHtml(node); }

/* ---------- Plantillas de archivos nuevos ---------- */
function uuid4() { return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }); }
function templateFor(name) {
  const l = name.toLowerCase(); const ext = getExt(name);
  if (l === 'manifest.json') return JSON.stringify({ format_version: 2, header: { name: 'Mi Addon', description: 'Descripción del addon', uuid: uuid4(), version: [1, 0, 0], min_engine_version: [1, 21, 0] }, modules: [{ type: 'data', uuid: uuid4(), version: [1, 0, 0] }] }, null, 2) + '\n';
  if (ext === 'js' || ext === 'mjs') return 'import { world, system } from "@minecraft/server";\n\n';
  if (ext === 'ts') return 'import { world, system } from "@minecraft/server";\n\n';
  if (ext === 'json') return '{\n  \n}\n';
  if (ext === 'mcfunction') return '# Comentarios con #. Los comandos van sin "/"\n';
  if (ext === 'lang') return '## Textos: clave=Valor\n';
  if (ext === 'md') return '# ' + name.replace(/\.md$/i, '') + '\n\n';
  if (ext === 'html') return '<!DOCTYPE html>\n<html>\n<head>\n  <meta charset="UTF-8">\n  <title></title>\n</head>\n<body>\n  \n</body>\n</html>\n';
  return '';
}

function getExt(arg57) {
  return arg57.includes(".") ? arg57.split(".").pop().toLowerCase() : "";
}
function isModelFile(arg61, arg62, arg63) {
  const v87 = getExt(arg62);
  if (MODEL_EXTS.includes(v87)) return true;
  if (v87 === "json") {
    const v88 = arg62.toLowerCase();
    if (v88.endsWith(".geo.json") || v88.endsWith(".model.json") || v88.endsWith(".animation.json")) return true;
    const v89 = (arg61 || arg62).toLowerCase();
    if (v89.includes("models/") || v89.includes("models\\") || v89.includes(".geo.") || v89.includes(".model.")) return true;
    if (typeof arg63 === "string" && /"minecraft:geometry"|"format_version"[\s\S]{0,200}"minecraft:geometry"/.test(arg63)) return true;
  }
  return false;
}
const DB_NAME = "devstudio_db", DB_VERSION = 1, STORE_INDEX = "projects_index", STORE_DATA = "projects_data";
let dbPromise = null;
function openDB() {
  if (dbPromise) return dbPromise;
  return dbPromise = new Promise((arg66, arg67) => {
    const v94 = indexedDB.open(DB_NAME, DB_VERSION);
    v94.onupgradeneeded = (arg65) => {
      const v95 = arg65.target.result;
      !v95.objectStoreNames.contains(STORE_INDEX) && v95.createObjectStore(STORE_INDEX, { "keyPath": "id" }), !v95.objectStoreNames.contains(STORE_DATA) && v95.createObjectStore(STORE_DATA, { "keyPath": "id" });
    }, v94.onsuccess = () => arg66(v94.result), v94.onerror = () => arg67(v94.error);
  }), dbPromise;
}
function idbPut(arg71, arg72) {
  return openDB().then((arg70) => new Promise((arg68, arg69) => {
    const tx = arg70.transaction(arg71, "readwrite");
    tx.objectStore(arg71).put(arg72), tx.oncomplete = () => arg68(), tx.onerror = () => arg69(tx.error);
  }));
}
function idbGet(arg76, arg77) {
  return openDB().then((arg75) => new Promise((arg73, arg74) => {
    const tx2 = arg75.transaction(arg76, "readonly"), store = tx2.objectStore(arg76).get(arg77);
    store.onsuccess = () => arg73(store.result || null), store.onerror = () => arg74(store.error);
  }));
}
function idbGetAll(arg81) {
  return openDB().then((arg80) => new Promise((arg78, arg79) => {
    const tx3 = arg80.transaction(arg81, "readonly"), store2 = tx3.objectStore(arg81).getAll();
    store2.onsuccess = () => arg78(store2.result || []), store2.onerror = () => arg79(store2.error);
  }));
}
function idbDelete(arg85, arg86) {
  return openDB().then((arg84) => new Promise((arg82, arg83) => {
    const tx4 = arg84.transaction(arg85, "readwrite");
    tx4.objectStore(arg85).delete(arg86), tx4.oncomplete = () => arg82(), tx4.onerror = () => arg83(tx4.error);
  }));
}
let state = null, selectedId = null, activeFileId = null, openMenuEl = null, uploadTargetFolderId = null, renamingId = null, structurePanelOpen = false;
function uid() {
  return "n" + Math.random().toString(36).slice(2, 10);
}
function defaultProject() {
  return { "name": "Minecraft Bedrock Addon Project", "root": { "id": "root", "type": "folder", "name": "root", "open": true, "children": [{ "id": uid(), "type": "folder", "name": "addon", "open": true, "children": [{ "id": uid(), "type": "folder", "name": "scripts", "open": false, "children": [{ "id": uid(), "type": "file", "name": "main.js", "content": 'import { world, system } from "@minecraft/server";\n\nconst ADDON_TAG = "my_addon";\n\nworld.afterEvents.playerSpawn.subscribe((event) => {\n  const player = event.player;\n  if (!player.hasTag(ADDON_TAG)) {\n    player.addTag(ADDON_TAG);\n    player.sendMessage("\xA7b[Addon] \xA7fWelcome, addon loaded successfully.");\n  }\n});\n\nsystem.runInterval(() => {\n  for (const player of world.getPlayers()) {\n    if (player.isSneaking) {\n      player.onScreenDisplay.setActionBar("\xA77Stealth mode active");\n    }\n  }\n}, 20);\n' }] }, { "id": uid(), "type": "folder", "name": "textures", "open": false, "children": [{ "id": uid(), "type": "file", "name": "pack_icon.png", "content": "" }] }, { "id": uid(), "type": "file", "name": "manifest.json", "content": '{\n  "format_version": 2,\n  "header": {\n    "name": "My Addon",\n    "description": "Provisional behavior addon",\n    "uuid": "8f2b6f2a-9d3a-4b7a-9e1c-3a2f1b6d4a10",\n    "version": [1, 0, 0],\n    "min_engine_version": [1, 21, 0]\n  },\n  "modules": [\n    {\n      "type": "data",\n      "uuid": "1c4a7e9b-5f2d-4c6a-8b3e-2d5f9a0e7c31",\n      "version": [1, 0, 0]\n    },\n    {\n      "type": "script",\n      "language": "javascript",\n      "uuid": "6d3e8f1a-2b4c-4a9d-9f7e-4c1a8b2d6e52",\n      "entry": "scripts/main.js",\n      "version": [1, 0, 0]\n    }\n  ],\n  "dependencies": [\n    { "module_name": "@minecraft/server", "version": "2.11.0" }\n  ]\n}\n' }] }, { "id": uid(), "type": "file", "name": "README.md", "content": "# My Addon\n\nProvisional structure of an addon for Minecraft Bedrock.\n\n## Content\n- addon/manifest.json \u2014 behavior pack configuration.\n- addon/scripts/main.js \u2014 main addon logic.\n- addon/textures/ \u2014 addon graphical assets.\n" }] } };
}
async function getProjectsIndex() {
  try {
    return await idbGetAll(STORE_INDEX);
  } catch (err5) {
    return [];
  }
}
async function updateIndexEntry(arg88, arg89) {
  const result = await getProjectsIndex(), fn5 = result.find((arg87) => arg87.id === arg88), v96 = fn5 ? Object.assign({}, fn5, arg89) : Object.assign({ "id": arg88, "cover": null }, arg89);
  await idbPut(STORE_INDEX, v96);
}
async function removeIndexEntry(arg90) {
  await idbDelete(STORE_INDEX, arg90);
}
async function getProjectData(arg91) {
  try {
    return await idbGet(STORE_DATA, arg91);
  } catch (err6) {
    return null;
  }
}
async function saveProjectData(arg92) {
  await idbPut(STORE_DATA, arg92);
}
async function removeProjectData(arg93) {
  await idbDelete(STORE_DATA, arg93);
}
function getUrlProjectId() {
  return new URLSearchParams(window.location.search).get("id");
}
async function loadOrCreateProject() {
  const result2 = await getProjectsIndex();
  let v97 = getUrlProjectId() || localStorage.getItem("devstudio_active_project");
  !v97 && result2.length && (v97 = result2.slice().sort((arg94, arg95) => (arg95.updatedAt || 0) - (arg94.updatedAt || 0))[0].id);
  if (v97) {
    const result3 = await getProjectData(v97);
    if (result3) return localStorage.setItem("devstudio_active_project", v97), history.replaceState(null, "", window.location.pathname + "?id=" + v97 + "&name=" + encodeURIComponent(result3.name || "")), { "id": v97, "name": result3.name, "root": result3.root };
  }
  const v98 = uid(), v99 = defaultProject();
  return v99.id = v98, await saveProjectData({ "id": v98, "name": v99.name, "root": v99.root }), await updateIndexEntry(v98, { "name": v99.name, "updatedAt": Date.now() }), localStorage.setItem("devstudio_active_project", v98), history.replaceState(null, "", window.location.pathname + "?id=" + v98 + "&name=" + encodeURIComponent(v99.name || "")), v99;
}
async function saveState() {
  await saveProjectData({ "id": state.id, "name": state.name, "root": state.root }), await updateIndexEntry(state.id, { "name": state.name, "updatedAt": Date.now() });
}
function findNode(arg96, arg97 = state.root) {
  if (arg97.id === arg96) return arg97;
  if (arg97.children) for (const v100 of arg97.children) {
    const v101 = findNode(arg96, v100);
    if (v101) return v101;
  }
  return null;
}
function findParent(arg98, arg99 = state.root) {
  if (arg99.children) for (const v102 of arg99.children) {
    if (v102.id === arg98) return arg99;
    const v103 = findParent(arg98, v102);
    if (v103) return v103;
  }
  return null;
}
function closeMenu() {
  openMenuEl && (openMenuEl.remove(), openMenuEl = null);
}
document.addEventListener("click", (arg100) => {
  if (openMenuEl && !openMenuEl.contains(arg100.target)) closeMenu();
});
function openMenu(arg103, arg104) {
  closeMenu();
  const divEl3 = document.createElement("div");
  divEl3.className = "menu", arg104.forEach((arg102) => {
    if (arg102.sep) {
      const divEl4 = document.createElement("div");
      divEl4.className = "menu-sep", divEl3.appendChild(divEl4);
      return;
    }
    const divEl5 = document.createElement("div");
    divEl5.className = "menu-item" + (arg102.danger ? " danger" : ""), divEl5.innerHTML = arg102.icon + "<span>" + arg102.label + "</span>", divEl5.addEventListener("click", (arg101) => {
      arg101.stopPropagation(), closeMenu(), arg102.onClick();
    }), divEl3.appendChild(divEl5);
  }), document.body.appendChild(divEl3);
  const v104 = arg103.getBoundingClientRect(), v105 = divEl3.getBoundingClientRect();
  let v106 = v104.bottom + 6, v107 = v104.right - v105.width;
  if (v106 + v105.height > window.innerHeight) v106 = v104.top - v105.height - 6;
  if (v107 < 8) v107 = v104.left;
  divEl3.style.top = v106 + "px", divEl3.style.left = v107 + "px", openMenuEl = divEl3;
}
function closeModal() {
  const modalOverlay = document.getElementById("modalOverlay");
  if (modalOverlay) modalOverlay.remove();
}
function showModal(arg106, arg107) {
  closeModal();
  const divEl6 = document.createElement("div");
  divEl6.className = "overlay", divEl6.id = "modalOverlay", divEl6.innerHTML = arg106, divEl6.addEventListener("mousedown", (arg105) => {
    if (arg105.target === divEl6) closeModal();
  }), document.body.appendChild(divEl6);
  if (arg107) arg107(divEl6);
}
function promptModal(arg110, arg111, arg112, arg113) {
  showModal('\n    <div class="modal">\n      <h3>' + arg110 + '</h3>\n      <input type="text" id="promptInput" placeholder="' + arg111 + '" value="' + (arg112 || "") + '">\n      <div class="modal-actions">\n        <button class="btn btn-ghost" id="promptCancel">Cancelar</button>\n        <button class="btn btn-primary" id="promptConfirm">Confirmar</button>\n      </div>\n    </div>\n  ', ((arg109) => {
    const promptInputEl = arg109.querySelector("#promptInput");
    promptInputEl.focus(), promptInputEl.select(), arg109.querySelector("#promptCancel").onclick = closeModal;
    const fn6 = () => {
      const v108 = promptInputEl.value.trim();
      if (!v108) return;
      closeModal(), arg113(v108);
    };
    arg109.querySelector("#promptConfirm").onclick = fn6, promptInputEl.addEventListener("keydown", (arg108) => {
      if (arg108.key === "Enter") fn6();
    });
  }));
}
function confirmDeleteModal(arg115, arg116) {
  showModal('\n    <div class="modal">\n      <div class="warn-icon">' + ICONS.warn + '</div>\n      <h3>Eliminar "' + arg115 + '"</h3>\n      <p>Podrás deshacerlo justo después desde el aviso inferior.</p>\n      <div class="modal-actions">\n        <button class="btn btn-ghost" id="delCancel">Cancelar</button>\n        <button class="btn btn-danger" id="delConfirm">Eliminar</button>\n      </div>\n    </div>\n  ', ((arg114) => {
    arg114.querySelector("#delCancel").onclick = closeModal, arg114.querySelector("#delConfirm").onclick = () => {
      closeModal(), arg116();
    };
  }));
}
function deleteProjectModal() {
  const v109 = "Delete My Project";
  showModal('\n    <div class="modal">\n      <div class="warn-icon">' + ICONS.warn + '</div>\n      <h3>Eliminar proyecto</h3>\n      <p>Se eliminará el proyecto completo con todas sus carpetas y archivos. No se puede deshacer.</p>\n      <p>Escribe <b style="color:var(--text)">' + v109 + '</b> to confirm.</p>\n      <input type="text" id="delProjectInput" placeholder="' + v109 + '">\n      <div class="modal-actions">\n        <button class="btn btn-ghost" id="delProjectCancel">Cancelar</button>\n        <button class="btn btn-danger" id="delProjectConfirm" disabled>Eliminar proyecto</button>\n      </div>\n    </div>\n  ', ((arg117) => {
    const delProjectInputEl = arg117.querySelector("#delProjectInput"), delProjectConfirmEl = arg117.querySelector("#delProjectConfirm");
    delProjectInputEl.focus(), delProjectInputEl.addEventListener("input", () => {
      delProjectConfirmEl.disabled = delProjectInputEl.value.trim() !== v109;
    }), arg117.querySelector("#delProjectCancel").onclick = closeModal, delProjectConfirmEl.onclick = async () => {
      const v110 = "4|3|6|2|0|5|1".split("|");
      let v111 = 0;
      while (true) {
        switch (v110[v111++]) {
          case "0":
            localStorage.getItem("devstudio_active_project") === state.id && localStorage.removeItem("devstudio_active_project");
            continue;
          case "1":
            window.location.href = "/";
            continue;
          case "2":
            await removeIndexEntry(state.id);
            continue;
          case "3":
            delProjectConfirmEl.disabled = true;
            continue;
          case "4":
            if (delProjectInputEl.value.trim() !== v109) return;
            continue;
          case "5":
            closeModal();
            continue;
          case "6":
            await removeProjectData(state.id);
            continue;
        }
        break;
      }
    };
  }));
}
function moveFileModal(arg125) {
  const list6 = [];
  (function helper(arg119, arg120) {
    arg119.type === "folder" && (list6.push({ "id": arg119.id, "name": arg119.id === "root" ? state.name : arg119.name, "depth": arg120 }), arg119.children.forEach((arg118) => {
      if (arg118.type === "folder") helper(arg118, arg120 + 1);
    }));
  })(state.root, 0);
  let v112 = findParent(arg125).id;
  showModal('\n    <div class="modal">\n      <h3>Mover archivo</h3>\n      <p>Elige la carpeta de destino.</p>\n      <div class="folder-pick" id="folderPickList"></div>\n      <div class="modal-actions">\n        <button class="btn btn-ghost" id="moveCancel">Cancelar</button>\n        <button class="btn btn-primary" id="moveConfirm">Mover aquí</button>\n      </div>\n    </div>\n  ', ((arg124) => {
    const folderPickListEl = arg124.querySelector("#folderPickList");
    list6.forEach((arg122) => {
      const divEl7 = document.createElement("div");
      divEl7.className = "folder-pick-item" + (arg122.id === v112 ? " active" : ""), divEl7.style.paddingLeft = 13 + arg122.depth * 16 + "px", divEl7.innerHTML = ICONS.folderClosed + "<span>" + arg122.name + "</span>", divEl7.onclick = () => {
        v112 = arg122.id, folderPickListEl.querySelectorAll(".folder-pick-item").forEach((arg121) => arg121.classList.remove("active")), divEl7.classList.add("active");
      }, folderPickListEl.appendChild(divEl7);
    }), arg124.querySelector("#moveCancel").onclick = closeModal, arg124.querySelector("#moveConfirm").onclick = () => {
      const v113 = findNode(arg125), v114 = findParent(arg125), v115 = findNode(v112);
      if (v114.id === v115.id) {
        closeModal();
        return;
      }
      snapTree("mover"), v114.children = v114.children.filter((arg123) => arg123.id !== arg125), v115.children.push(v113), v115.open = true, saveState(), render(), closeModal();
    };
  }));
}
function showDownloadFormatModal() {
  let v116 = "mcaddon";
  showModal('\n    <div class="modal" style="width:420px;">\n      <h3>Formato de descarga</h3>\n      <p>Elige el formato para exportar el proyecto:</p>\n      <div class="fmt-grid">\n        <div class="fmt-card active" data-fmt="mcaddon">\n          <div class="fmt-icon"><img src="../img/icons/ic1.jpg" alt="MCAddon"></div>\n          <div class="fmt-info">\n            <span class="fmt-name">.mcaddon</span>\n            <span class="fmt-desc">Addon de Minecraft</span>\n          </div>\n        </div>\n        <div class="fmt-card" data-fmt="zip">\n          <div class="fmt-icon">' + ICONS.package + '</div>\n          <div class="fmt-info">\n            <span class="fmt-name">.zip</span>\n            <span class="fmt-desc">Archivo comprimido</span>\n          </div>\n        </div>\n        <div class="fmt-card" data-fmt="mcpack">\n          <div class="fmt-icon"><img src="../img/icons/ic1.jpg" alt="MCPack"></div>\n          <div class="fmt-info">\n            <span class="fmt-name">.mcpack</span>\n            <span class="fmt-desc">Paquete de Minecraft</span>\n          </div>\n        </div>\n        <div class="fmt-card" data-fmt="mcworld">\n          <div class="fmt-icon"><img src="../img/icons/ic1.jpg" alt="MCWorld"></div>\n          <div class="fmt-info">\n            <span class="fmt-name">.mcworld</span>\n            <span class="fmt-desc">Mundo de Minecraft</span>\n          </div>\n        </div>\n      </div>\n      <div class="modal-actions">\n        <button class="btn btn-ghost" id="dlFormatClose">Cerrar</button>\n        <button class="btn btn-primary" id="dlFormatConfirm">Descargar</button>\n      </div>\n    </div>\n  ', ((arg128) => {
    const v117 = arg128.querySelectorAll(".fmt-card");
    v117.forEach((arg127) => {
      arg127.onclick = () => {
        v117.forEach((arg126) => arg126.classList.remove("active")), arg127.classList.add("active"), v116 = arg127.getAttribute("data-fmt");
      };
    }), arg128.querySelector("#dlFormatClose").onclick = closeModal, arg128.querySelector("#dlFormatConfirm").onclick = () => {
      exportProjectFormat(v116), closeModal();
    };
  }));
}
let cachedDefaultLogo = null;
async function getDefaultLogoBase64() {
  if (cachedDefaultLogo !== null) return cachedDefaultLogo;
  try {
    const result4 = await fetch("/img/logo-192.png");
    if (!result4.ok) throw new Error("logo not found");
    const result5 = await result4.blob();
    cachedDefaultLogo = await new Promise((arg129, arg130) => {
      const v118 = new FileReader();
      v118.onload = () => arg129(v118.result.split(",")[1]), v118.onerror = arg130, v118.readAsDataURL(result5);
    });
  } catch (err7) {
    cachedDefaultLogo = "";
  }
  return cachedDefaultLogo;
}
const LOGO_NAME_REGEX = /icon|logo/i;
async function buildZipFromNode(arg131, arg132, arg133) {
  if (arg132.type === "file") {
    const v119 = fileMeta(arg132);
    if (arg132.content && arg132.content.startsWith("data:")) {
      const v120 = arg132.content.split(",")[1];
      arg131.file(arg132.name, v120, { "base64": true });
    } else v119.isImage && !arg132.content && arg133 && LOGO_NAME_REGEX.test(arg132.name) ? arg131.file(arg132.name, arg133, { "base64": true }) : arg131.file(arg132.name, arg132.content || "");
  } else {
    if (arg132.type === "folder" && arg132.children) {
      const v121 = arg132.id === "root" ? arg131 : arg131.folder(arg132.name);
      for (const v122 of arg132.children) {
        await buildZipFromNode(v121, v122, arg133);
      }
    }
  }
}
async function exportProjectFormat(arg135) {
  if (typeof JSZip === "undefined") {
    alert("JSZip is not loaded");
    return;
  }
  const zip = new JSZip(), result6 = await getDefaultLogoBase64();
  await buildZipFromNode(zip, state.root, result6), zip.generateAsync({ "type": "blob" }).then((arg134) => {
    const v123 = document.createElement("a");
    v123.href = URL.createObjectURL(arg134), v123.download = (state.name || "project").replace(/[\/\\?%*:|"<>]/g, "_") + "." + arg135, v123.click(), URL.revokeObjectURL(v123.href);
  });
}

/* ================= Árbol de archivos, pestañas y operaciones ================= */
let openTabs = [];
const treeUndo = [];
let searchQuery = '';

function toast(msg, actionLabel, onAction, ms) {
  let el = $('#edToast'); if (!el) { el = document.createElement('div'); el.id = 'edToast'; el.className = 'ed-toast'; document.body.appendChild(el); }
  el.innerHTML = '<span>' + escapeHtml(msg) + '</span>' + (actionLabel ? '<button type="button">' + escapeHtml(actionLabel) + '</button>' : '');
  if (actionLabel) el.querySelector('button').onclick = () => { el.classList.remove('show'); onAction && onAction(); };
  el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), ms || (actionLabel ? 5200 : 2200));
}
function snapTree(label) { treeUndo.push({ label, root: JSON.stringify(state.root), tabs: openTabs.slice(), active: activeFileId }); if (treeUndo.length > 40) treeUndo.shift(); updateTreeUndoUi(); }
function undoTree() {
  const s = treeUndo.pop(); if (!s) { toast('No hay cambios de archivos para deshacer'); return; }
  if (typeof flushEditor === 'function') flushEditor();
  state.root = JSON.parse(s.root); openTabs = s.tabs.filter((id) => findNode(id)); activeFileId = findNode(s.active) ? s.active : (openTabs[0] || null);
  saveState(); render(); renderEditor(); updateTreeUndoUi(); toast('Deshecho: ' + s.label);
}
function updateTreeUndoUi() { const b = $('#treeUndoBtn'); if (b) b.disabled = !treeUndo.length; }

function uniqueName(parent, name, ignoreId) {
  const names = new Set(parent.children.filter((c) => c.id !== ignoreId).map((c) => c.name.toLowerCase())); if (!names.has(name.toLowerCase())) return name;
  const m = /^(.*?)(\.[^.]+)?$/.exec(name); let i = 2; while (names.has((m[1] + ' (' + i + ')' + (m[2] || '')).toLowerCase())) i++; return m[1] + ' (' + i + ')' + (m[2] || '');
}
function cleanName(n) { return String(n || '').replace(/[\\/:*?"<>|]/g, '_').replace(/^\.\.+$/, '_').trim(); }

function addFolder(parentId, name) {
  name = cleanName(name); if (!name) return null; const p = findNode(parentId); if (!p) return null; snapTree('crear carpeta');
  const node = { id: uid(), type: 'folder', name: uniqueName(p, name), open: false, children: [] }; p.children.push(node); p.open = true; sortChildren(p); saveState(); render(); return node;
}
function addFile(parentId, name, content, silent) {
  name = cleanName(name); if (!name) return null; const p = findNode(parentId); if (!p) return null; if (!silent) snapTree('crear archivo');
  const node = { id: uid(), type: 'file', name: uniqueName(p, name), content: content == null || content === '' ? templateFor(name) : content }; p.children.push(node); p.open = true; sortChildren(p); saveState(); render();
  if (!silent) openFile(node.id); return node;
}
function sortChildren(p) { p.children.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }) : (a.type === 'folder' ? -1 : 1))); }
function renameNode(id, name) {
  name = cleanName(name); const n = findNode(id), par = findParent(id); if (!n || !par || !name || name === n.name) { render(); return; }
  if (par.children.some((c) => c.id !== id && c.name.toLowerCase() === name.toLowerCase())) { toast('Ya existe "' + name + '" en esta carpeta'); render(); return; }
  snapTree('renombrar'); n.name = name; sortChildren(par); saveState(); render(); if (activeFileId === id) renderEditor();
}
function deleteNode(id) {
  const par = findParent(id); if (!par) return; const n = findNode(id); snapTree('eliminar "' + n.name + '"');
  par.children = par.children.filter((c) => c.id !== id); if (selectedId === id) selectedId = null;
  pruneTabs(); saveState(); render(); renderEditor(); toast('"' + n.name + '" eliminado', 'Deshacer', undoTree);
}
function duplicateNode(id) {
  const n = findNode(id), par = findParent(id); if (!n || !par) return; snapTree('duplicar');
  const clone = (x) => { const c = JSON.parse(JSON.stringify(x)); const re = (y) => { y.id = uid(); (y.children || []).forEach(re); }; re(c); return c; };
  const c = clone(n); const m = /^(.*?)(\.[^.]+)?$/.exec(n.name); c.name = uniqueName(par, m[1] + ' copia' + (n.type === 'file' && m[2] ? m[2] : ''));
  par.children.push(c); sortChildren(par); saveState(); render(); if (c.type === 'file') openFile(c.id);
}
function pruneTabs() { openTabs = openTabs.filter((id) => { const n = findNode(id); return n && n.type === 'file'; }); if (activeFileId && !findNode(activeFileId)) activeFileId = openTabs[openTabs.length - 1] || null; }
function downloadFile(id) {
  const n = findNode(id); if (!n) return; const c = n.content || ''; const a = document.createElement('a'); let url, rev = false;
  if (c.startsWith('data:')) url = c; else { url = URL.createObjectURL(new Blob([c], { type: 'text/plain;charset=utf-8' })); rev = true; }
  a.href = url; a.download = n.name; document.body.appendChild(a); a.click(); a.remove(); if (rev) setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function startRename(id) { renamingId = id; renderTree(); }
function newFilePrompt(parentId) { promptModal('Nuevo archivo', 'nombre.js, manifest.json, main.ts…', '', (n) => addFile(parentId, n)); }
function newFolderPrompt(parentId) { promptModal('Nueva carpeta', 'Nombre de la carpeta', '', (n) => addFolder(parentId, n)); }
function uploadInto(id, folder) { uploadTargetFolderId = id; $(folder ? '#folderUploadInput' : '#fileUploadInput').click(); }

function folderMenuItems(n) {
  return [
    { label: 'Nuevo archivo', icon: ICONS.filePlus, onClick: () => newFilePrompt(n.id) },
    { label: 'Nueva carpeta', icon: ICONS.folderPlus, onClick: () => newFolderPrompt(n.id) },
    { label: 'Subir archivos', icon: ICONS.fileUp, onClick: () => uploadInto(n.id, false) },
    { label: 'Subir carpeta', icon: ICONS.folderUp, onClick: () => uploadInto(n.id, true) },
    { sep: true },
    { label: 'Renombrar', icon: ICONS.edit, onClick: () => startRename(n.id) },
    { label: 'Duplicar', icon: ICONS.copy, onClick: () => duplicateNode(n.id) },
    { sep: true },
    { label: 'Eliminar', icon: ICONS.trash, danger: true, onClick: () => confirmDeleteModal(n.name, () => deleteNode(n.id)) }
  ];
}
function fileMenuItems(n) {
  return [
    { label: 'Renombrar', icon: ICONS.edit, onClick: () => startRename(n.id) },
    { label: 'Duplicar', icon: ICONS.copy, onClick: () => duplicateNode(n.id) },
    { label: 'Mover a…', icon: ICONS.move, onClick: () => moveFileModal(n.id) },
    { label: 'Descargar', icon: ICONS.download, onClick: () => downloadFile(n.id) },
    { label: 'Copiar ruta', icon: ICONS.copy, onClick: () => { copyToClipboard(getNodePath(n.id) || n.name); toast('Ruta copiada'); } },
    { sep: true },
    { label: 'Eliminar', icon: ICONS.trash, danger: true, onClick: () => confirmDeleteModal(n.name, () => deleteNode(n.id)) }
  ];
}
function rootMenuItems() {
  return [
    { label: 'Nuevo archivo', icon: ICONS.filePlus, onClick: () => newFilePrompt('root') },
    { label: 'Nueva carpeta', icon: ICONS.folderPlus, onClick: () => newFolderPrompt('root') },
    { label: 'Subir archivos', icon: ICONS.fileUp, onClick: () => uploadInto('root', false) },
    { label: 'Subir carpeta', icon: ICONS.folderUp, onClick: () => uploadInto('root', true) },
    { sep: true },
    { label: 'Deshacer cambio en archivos', icon: ICONS.snapshot, onClick: undoTree },
    { label: 'Renombrar proyecto', icon: ICONS.edit, onClick: () => promptModal('Renombrar proyecto', 'Nombre', state.name, async (v) => { state.name = v; await saveState(); render(); }) },
    { sep: true },
    { label: 'Eliminar proyecto', icon: ICONS.trash, danger: true, onClick: () => deleteProjectModal() }
  ];
}

/* ---------- Render del árbol ---------- */
function filterTree(n, q) { if (!q) return true; if (n.name.toLowerCase().includes(q)) return true; return !!(n.children && n.children.some((c) => filterTree(c, q))); }
function countFiles(n) { let c = 0; (n.children || []).forEach((x) => { c += x.type === 'file' ? 1 : countFiles(x); }); return c; }
function treeHtml(n, depth, q) {
  const isF = n.type === 'folder'; const open = isF && (q ? true : n.open);
  const act = !isF && n.id === activeFileId; const sel = selectedId === n.id;
  let h = '<div class="tr-node"><div class="tr-row' + (act ? ' act' : '') + (sel && !act ? ' sel' : '') + '" data-id="' + n.id + '" role="treeitem" style="--d:' + depth + '">';
  h += '<span class="tr-chev' + (isF ? '' : ' hid') + (open ? ' open' : '') + '">' + ICONS.chevron + '</span>';
  h += isF ? folderIconHtml(Object.assign({}, n, { open })) : fileIconHtml(n);
  if (renamingId === n.id) h += '<input class="tr-input" value="' + escapeHtml(n.name) + '" autocomplete="off" autocapitalize="off" spellcheck="false">';
  else h += '<span class="tr-name">' + escapeHtml(n.name) + '</span>';
  if (isF) h += '<span class="tr-count">' + countFiles(n) + '</span>';
  h += '<button class="tr-more" data-more type="button" aria-label="Opciones">' + ICONS.more + '</button></div>';
  if (open) h += '<div class="tr-kids">' + n.children.filter((c) => filterTree(c, q)).map((c) => treeHtml(c, depth + 1, q)).join('') + '</div>';
  return h + '</div>';
}
function renderTree() {
  const t = $('#treeEl'); if (!t) return; const q = searchQuery;
  const kids = state.root.children.filter((c) => filterTree(c, q));
  t.innerHTML = kids.length ? kids.map((c) => treeHtml(c, 0, q)).join('') : '<div class="tr-empty">' + (q ? 'Sin resultados para “' + escapeHtml(q) + '”' : 'El proyecto está vacío.<br>Toca <b>+</b> para crear un archivo.') + '</div>';
  if (renamingId) { const inp = t.querySelector('.tr-input'); if (inp) { setTimeout(() => { inp.focus(); const dot = inp.value.lastIndexOf('.'); inp.setSelectionRange(0, dot > 0 ? dot : inp.value.length); }, 0);
    let done = false; const fin = (ok) => { if (done) return; done = true; const id = renamingId; renamingId = null; if (ok && inp.value.trim()) renameNode(id, inp.value); else renderTree(); };
    inp.addEventListener('click', (e) => e.stopPropagation()); inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') fin(true); else if (e.key === 'Escape') fin(false); }); inp.addEventListener('blur', () => fin(true)); } }
}
function render() {
  if (!state) return; pruneTabs();
  const pn = $('#projectNameEl'); if (pn) { pn.textContent = state.name; pn.title = state.name; }
  const ps = $('#projectSubEl'); if (ps) { const c = countFiles(state.root); ps.textContent = c + (c === 1 ? ' archivo' : ' archivos'); }
  renderTree(); if (typeof renderChrome === 'function') renderChrome(); updateTreeUndoUi();
}
function selectNode(n) {
  selectedId = n.id;
  if (n.type === 'folder') { n.open = !n.open; renderTree(); saveState(); } else { openFile(n.id); closeSide(); renderTree(); }
}
function openSide() { $('#side').classList.add('open'); $('#scrim').classList.add('on'); }
function closeSide() { $('#side').classList.remove('open'); $('#scrim').classList.remove('on'); }
function toggleSide() {
  if (window.matchMedia('(max-width: 860px)').matches) { $('#side').classList.contains('open') ? closeSide() : openSide(); }
  else { const c = $('#app').classList.toggle('side-hidden'); try { localStorage.setItem('comdex_side_hidden', c ? '1' : ''); } catch (e) { } if (typeof layoutEditor === 'function') setTimeout(layoutEditor, 220); }
}

/* ---------- Subidas ---------- */
const SKIP_UPLOAD = /(^|\/)(\.DS_Store|__MACOSX|node_modules|\.git|Thumbs\.db)(\/|$)/;
function readUpload(file) {
  return new Promise((res) => {
    const ext = getExt(file.name); const fr = new FileReader(); const asData = IMAGE_EXTS.includes(ext) && ext !== 'svg' || BINARY_EXTS.includes(ext) || file.size > 4 * 1024 * 1024;
    fr.onload = () => res(fr.result); fr.onerror = () => res(''); asData ? fr.readAsDataURL(file) : fr.readAsText(file);
  });
}
async function handleFileUpload(files) {
  snapTree('subir archivos'); let n = 0; const p = findNode(uploadTargetFolderId || 'root');
  for (const f of files) { if (SKIP_UPLOAD.test(f.name)) continue; const content = await readUpload(f); const name = uniqueName(p, cleanName(f.name) || 'archivo'); p.children.push({ id: uid(), type: 'file', name, content }); n++; }
  p.open = true; sortChildren(p); await saveState(); render(); toast(n + (n === 1 ? ' archivo subido' : ' archivos subidos'), 'Deshacer', undoTree);
}
async function handleFolderUpload(files) {
  snapTree('subir carpeta'); const base = findNode(uploadTargetFolderId || 'root'); const cache = { '': base }; let n = 0;
  for (const f of files) {
    const rel = f.webkitRelativePath || f.name; if (SKIP_UPLOAD.test(rel)) continue; const parts = rel.split('/'); const fname = parts.pop(); let key = '', cur = base;
    for (const seg of parts) { key = key ? key + '/' + seg : seg; if (!cache[key]) { const nf = { id: uid(), type: 'folder', name: seg, open: false, children: [] }; cur.children.push(nf); cache[key] = nf; } cur = cache[key]; }
    cur.children.push({ id: uid(), type: 'file', name: fname, content: await readUpload(f) }); n++;
  }
  base.open = true; Object.values(cache).forEach((x) => x.children && sortChildren(x)); await saveState(); render(); toast(n + ' archivos subidos', 'Deshacer', undoTree);
}

/* ---------- Pestañas persistentes ---------- */
function tabsKey() { return 'comdex_tabs_' + (state && state.id); }
function saveTabs() { try { localStorage.setItem(tabsKey(), JSON.stringify({ tabs: openTabs, active: activeFileId })); } catch (e) { } }
function restoreTabs() { try { const s = JSON.parse(localStorage.getItem(tabsKey()) || 'null'); if (s) { openTabs = (s.tabs || []).filter((id) => { const n = findNode(id); return n && n.type === 'file'; }); activeFileId = findNode(s.active) ? s.active : (openTabs[0] || null); } } catch (e) { } }

async function initApp() {
  state = await loadOrCreateProject(); restoreTabs();
  if (!activeFileId) { const first = (function f(n) { for (const c of (n.children || [])) { if (c.type === 'file') { if (/^(main|index)\.(js|ts)$/i.test(c.name)) return c; } const r = c.type === 'folder' ? f(c) : null; if (r) return r; } return null; })(state.root); if (first) { activeFileId = first.id; openTabs = [first.id]; } }
  try { if (localStorage.getItem('comdex_side_hidden') === '1' && !window.matchMedia('(max-width: 860px)').matches) $('#app').classList.add('side-hidden'); } catch (e) { }
  // iconos de botones
  const setI = (sel, ic) => { const e = $(sel); if (e) e.innerHTML = ICONS[ic]; };
  setI('#addRootBtn', 'plus'); setI('#closeSideBtn', 'close'); setI('#searchIco', 'find'); setI('#menuBtn', 'menu');
  setI('#homeBtn span', 'home'); setI('#toolboxBtn span', 'toolbox'); setI('#boxBtn span', 'box'); setI('#settingsBtn span', 'gear');
  $('#addRootBtn').addEventListener('click', (e) => { e.stopPropagation(); openMenu(e.currentTarget, rootMenuItems()); });
  $('#closeSideBtn').addEventListener('click', closeSide); $('#scrim').addEventListener('click', closeSide); $('#menuBtn').addEventListener('click', toggleSide);
  $('#boxBtn').addEventListener('click', showDownloadFormatModal); $('#settingsBtn').addEventListener('click', showSettingsModal);
  $('#searchInput').addEventListener('input', (e) => { searchQuery = e.target.value.trim().toLowerCase(); renderTree(); });
  $('#treeEl').addEventListener('click', (e) => {
    const row = e.target.closest('.tr-row'); if (!row) return; const n = findNode(row.dataset.id); if (!n) return;
    if (e.target.closest('[data-more]')) { e.stopPropagation(); openMenu(e.target.closest('[data-more]'), n.type === 'folder' ? folderMenuItems(n) : fileMenuItems(n)); return; }
    if (e.target.closest('.tr-input')) return; selectNode(n);
  });
  $('#fileUploadInput').addEventListener('change', (e) => { const f = Array.from(e.target.files); e.target.value = ''; if (f.length) handleFileUpload(f); });
  $('#folderUploadInput').addEventListener('change', (e) => { const f = Array.from(e.target.files); e.target.value = ''; if (f.length) handleFolderUpload(f); });
  window.addEventListener('pageshow', async (ev) => { if (!ev.persisted || !state) return; flushEditor(); const d = await getProjectData(state.id); if (d) { state.name = d.name; state.root = d.root; render(); renderEditor(); } });
  render(); await renderEditor(); if (typeof layoutEditor === 'function') layoutEditor();
}

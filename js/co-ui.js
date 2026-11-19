const UI_ICONS = { "models": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/></svg>', "uuid": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 0 0-9 9v3a3 3 0 0 0 3 3"/><path d="M12 3a9 9 0 0 1 9 9v3a3 3 0 0 1-3 3"/><path d="M8 8.5A4 4 0 0 1 12 5a4 4 0 0 1 4 3.5"/><path d="M8.5 12v3.5M12 11v6.5M15.5 12v2.8"/></svg>', "jsonFormat": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3.5c-2 0-2.6 1-2.6 2.6v3.2c0 1.3-.5 2-1.9 2.2 1.4.2 1.9.9 1.9 2.2v3.2c0 1.6.6 2.6 2.6 2.6"/><path d="M16 3.5c2 0 2.6 1 2.6 2.6v3.2c0 1.3.5 2 1.9 2.2-1.4.2-1.9.9-1.9 2.2v3.2c0 1.6-.6 2.6-2.6 2.6"/></svg>', "colors": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-2 0-.6-.3-1-.6-1.4-.3-.4-.5-.7-.5-1.2 0-.9.7-1.4 1.6-1.4H16a4.5 4.5 0 0 0 4.5-4.5C20.5 6.4 16.7 3 12 3Z"/><circle cx="7.5" cy="11" r="1.1" fill="currentColor" stroke="none"/><circle cx="9.5" cy="7.2" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="7.2" r="1.1" fill="currentColor" stroke="none"/><circle cx="16.5" cy="11" r="1.1" fill="currentColor" stroke="none"/></svg>', "snippet": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 8-4 4 4 4"/><path d="m15 8 4 4-4 4"/><path d="M13.5 5.5 10.5 18.5"/></svg>', "manifest": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8a1 1 0 0 1 1 1v15l-5-3-5 3V5a1 1 0 0 1 1-1Z"/><path d="m9.5 11 1.8 1.8L14.5 9"/></svg>', "imgjson": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="12" height="10" rx="1.6"/><circle cx="6.6" cy="7.6" r="1.1" fill="currentColor" stroke="none"/><path d="m15 11-3-3-6.5 6"/><path d="M17.5 9.5v9M13.5 14h8M13.5 18h5.5"/></svg>', "upload": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>', "back": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>', "close": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 6 12 12M18 6 6 18"/></svg>', "regen": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11A8 8 0 1 0 18.6 16"/><path d="M20 5v6h-6"/></svg>', "pause": '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6.5" y="4.8" width="4" height="14.4" rx="1"/><rect x="13.5" y="4.8" width="4" height="14.4" rx="1"/></svg>', "restart": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4v6h6"/><path d="M4.5 13a8 8 0 1 0 2.5-7.5L4 10"/></svg>' }, MC_COLORS = [{ "code": "0", "name": "Black", "hex": "#000000" }, { "code": "1", "name": "Dark Blue", "hex": "#0000AA" }, { "code": "2", "name": "Dark Green", "hex": "#00AA00" }, { "code": "3", "name": "Dark Aqua", "hex": "#00AAAA" }, { "code": "4", "name": "Dark Red", "hex": "#AA0000" }, { "code": "5", "name": "Dark Purple", "hex": "#AA00AA" }, { "code": "6", "name": "Gold", "hex": "#FFAA00" }, { "code": "7", "name": "Gray", "hex": "#AAAAAA" }, { "code": "8", "name": "Dark Gray", "hex": "#555555" }, { "code": "9", "name": "Blue", "hex": "#5555FF" }, { "code": "a", "name": "Green", "hex": "#55FF55" }, { "code": "b", "name": "Aqua", "hex": "#55FFFF" }, { "code": "c", "name": "Red", "hex": "#FF5555" }, { "code": "d", "name": "Light Purple", "hex": "#FF55FF" }, { "code": "e", "name": "Yellow", "hex": "#FFFF55" }, { "code": "f", "name": "White", "hex": "#FFFFFF" }, { "code": "g", "name": "Minecoin Gold", "hex": "#DDD605" }], MC_FORMATS = [{ "code": "l", "name": "Bold" }, { "code": "o", "name": "Italic" }, { "code": "n", "name": "Underline" }, { "code": "m", "name": "Strikethrough" }, { "code": "k", "name": "Obfuscated" }, { "code": "r", "name": "Reset" }], BEDROCK_SNIPPETS = [{ "name": "Event: Player Spawn", "code": 'world.afterEvents.playerSpawn.subscribe((event) => {\n  if (!event.initialSpawn) return;\n  event.player.sendMessage("\xA7aWelcome to the world.");\n});\n' }, { "name": "Event: Item Use", "code": 'world.afterEvents.itemUse.subscribe((event) => {\n  const { source, itemStack } = event;\n  if (itemStack.typeId === "minecraft:stick") {\n    source.sendMessage("You used a stick.");\n  }\n});\n' }, { "name": "Custom Command", "code": 'system.beforeEvents.startup.subscribe((init) => {\n  init.customCommandRegistry.registerCommand({\n    name: "addon:greeting",\n    description: "Sends a greeting",\n    permissionLevel: 0\n  }, (origin) => {\n    origin.sourceEntity?.sendMessage("Hello!");\n    return { status: 0 };\n  });\n});\n' }, { "name": "Tick Loop (Interval)", "code": 'system.runInterval(() => {\n  for (const player of world.getPlayers()) {\n    player.onScreenDisplay.setActionBar("\xA77Addon active");\n  }\n}, 20);\n' }, { "name": "Give Item to Player", "code": 'const item = new ItemStack("minecraft:diamond", 1);\nplayer.getComponent("inventory").container.addItem(item);\n' }, { "name": "Scoreboard: Add Points", "code": 'const objective = world.scoreboard.getObjective("points") ?? world.scoreboard.addObjective("points", "Points");\nobjective.addScore(player, 1);\n' }];
let uiToastTimer = null;
function showToast(arg) {
  let uiToast = document.getElementById("uiToast");
  !uiToast && (uiToast = document.createElement("div"), uiToast.id = "uiToast", uiToast.className = "ui-toast", document.body.appendChild(uiToast)), uiToast.textContent = arg, uiToast.classList.add("show"), clearTimeout(uiToastTimer), uiToastTimer = setTimeout((() => uiToast.classList.remove("show")), 2600);
}
function copyToClipboard(arg2) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(arg2).catch(() => {
    });
    return;
  }
  const textareaEl = document.createElement("textarea");
  textareaEl.value = arg2, textareaEl.style.position = "fixed", textareaEl.style.left = "-9999px", document.body.appendChild(textareaEl), textareaEl.select();
  try {
    document.execCommand("copy");
  } catch (err) {
  }
  document.body.removeChild(textareaEl);
}
function insertAtCursor(arg3) {
  const codeArea = document.getElementById("codeArea");
  if (!codeArea) return false;
  const v = codeArea.selectionStart, v2 = codeArea.selectionEnd, v3 = codeArea.value;
  codeArea.value = v3.slice(0, v) + arg3 + v3.slice(v2);
  const v4 = v + arg3.length;
  return codeArea.setSelectionRange(v4, v4), codeArea.dispatchEvent(new Event("input")), codeArea.focus(), true;
}
function uuidv4() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (arg4) => {
    const v5 = Math.random() * 16 | 0, v6 = arg4 === "x" ? v5 : v5 & 3 | 8;
    return v6.toString(16);
  });
}
function ensureFolderPath(arg7) {
  let v7 = findNode("root");
  return arg7.forEach((arg6) => {
    let fn = v7.children.find((arg5) => arg5.type === "folder" && arg5.name === arg6);
    !fn && (fn = { "id": uid(), "type": "folder", "name": arg6, "open": true, "children": [] }, v7.children.push(fn)), v7 = fn;
  }), v7;
}
const TOOLBOX_TOOLS = [{ "id": "models", "name": "Models", "beta": true, "desc": "Inspecciona los archivos de geometría Bedrock (.geo.json) del proyecto.", "icon": UI_ICONS.models, "onOpen": () => openModelsTool() }, { "id": "uuid", "name": "Generador de UUID", "desc": "Crea identificadores únicos para el header y los módulos de tu manifest.json.", "icon": UI_ICONS.uuid, "onOpen": () => openUuidTool() }, { "id": "jsonfmt", "name": "Formato JSON", "desc": "Formatea o minifica el archivo JSON activo.", "icon": UI_ICONS.jsonFormat, "onOpen": () => openJsonFormatTool() }, { "id": "colors", "name": "Colores de Minecraft", "desc": "Palette of color codes and text formatting (\xA7) with quick copy.", "icon": UI_ICONS.colors, "onOpen": () => openColorsTool() }, { "id": "snippets", "name": "Fragmentos Bedrock", "desc": "Inserta fragmentos comunes de la Script API en el archivo activo.", "icon": UI_ICONS.snippet, "onOpen": () => openSnippetsTool() }, { "id": "manifest", "name": "Validador de manifest", "desc": "Comprueba que tu manifest.json cumple la estructura que espera Bedrock.", "icon": UI_ICONS.manifest, "onOpen": () => openManifestValidatorTool() }, { "id": "imgjson", "name": "Img.Json", "desc": "Convierte spritesheets en animaciones con JSON + JS listos para usar.", "icon": UI_ICONS.imgjson, "onOpen": () => openImgJsonTool() }];
function showToolboxModal() {
  showModal('\n    <div class="modal tbx-modal">\n      <div class="tbx-head">\n        <h3>Toolbox</h3>\n        <p>Herramientas para acelerar la creación de addons de Minecraft.</p>\n      </div>\n      <div class="tbx-grid" id="tbxGrid"></div>\n      <div class="modal-actions">\n        <button class="btn btn-ghost" id="tbxCloseBtn">Cerrar</button>\n      </div>\n    </div>\n  ', ((arg9) => {
    const tbxGridEl = arg9.querySelector("#tbxGrid");
    TOOLBOX_TOOLS.forEach((arg8) => {
      const divEl = document.createElement("div");
      divEl.className = "tbx-card", divEl.innerHTML = '\n        <div class="tbx-card-icon">' + arg8.icon + '</div>\n        <div class="tbx-card-info">\n          <div class="tbx-card-name">' + arg8.name + (arg8.beta ? '<span class="tbx-beta">BETA</span>' : "") + '</div>\n          <div class="tbx-card-desc">' + arg8.desc + "</div>\n        </div>\n      ", divEl.addEventListener("click", () => {
        closeModal(), arg8.onOpen();
      }), tbxGridEl.appendChild(divEl);
    }), arg9.querySelector("#tbxCloseBtn").onclick = closeModal;
  }));
}
function openUuidTool() {
  let v8 = uuidv4();
  showModal('\n    <div class="modal tbx-modal" style="width:420px;">\n      <div class="tbx-tool-head">\n        <button class="tbx-back" id="uuidBack">' + UI_ICONS.back + '</button>\n        <h3>Generador de UUID</h3>\n      </div>\n      <p>Generate unique identifiers for the header and modules of your manifest.json.</p>\n      <div class="tbx-uuid-box">\n        <input type="text" id="uuidValue" readonly>\n        <button class="icon-btn" id="uuidRegen" title="Regenerate">' + UI_ICONS.regen + '</button>\n      </div>\n      <div class="modal-actions" style="justify-space-between;">\n        <button class="btn btn-ghost" id="uuidCopy">Copiar</button>\n        <button class="btn btn-primary" id="uuidInsert">Insert into file</button>\n      </div>\n    </div>\n  ', ((arg10) => {
    const uuidValueEl = arg10.querySelector("#uuidValue");
    uuidValueEl.value = v8, arg10.querySelector("#uuidBack").onclick = () => {
      closeModal(), showToolboxModal();
    }, arg10.querySelector("#uuidRegen").onclick = () => {
      v8 = uuidv4(), uuidValueEl.value = v8;
    }, arg10.querySelector("#uuidCopy").onclick = () => {
      copyToClipboard(v8), showToast("UUID copied");
    }, arg10.querySelector("#uuidInsert").onclick = () => {
      if (insertAtCursor(v8)) showToast("UUID inserted");
      else showToast("Open a file in the editor to insert the UUID.");
    };
  }));
}
function openJsonFormatTool() {
  const codeArea2 = document.getElementById("codeArea"), v9 = activeFileId ? findNode(activeFileId) : null;
  showModal('\n    <div class="modal tbx-modal" style="width:460px;">\n      <div class="tbx-tool-head">\n        <button class="tbx-back" id="jsonBack">' + UI_ICONS.back + "</button>\n        <h3>Formato JSON</h3>\n      </div>\n      <p>" + (v9 ? 'Active file: <b style="color:var(--text)">' + escapeHtml(v9.name) + "</b>" : "No hay ningún archivo abierto en el editor.") + '</p>\n      <div class="modal-actions" style="justify-content:flex-start;gap:10px;">\n        <button class="btn btn-primary" id="jsonBeautify">Format (2 spaces)</button>\n        <button class="btn btn-ghost" id="jsonMinify">Minificar</button>\n      </div>\n      <div class="tbx-json-status" id="jsonStatus"></div>\n    </div>\n  ', ((arg12) => {
    arg12.querySelector("#jsonBack").onclick = () => {
      closeModal(), showToolboxModal();
    };
    const jsonStatusEl = arg12.querySelector("#jsonStatus"), data2 = (arg11) => {
      if (!codeArea2 || !v9) {
        jsonStatusEl.textContent = "Abre primero un archivo en el editor.", jsonStatusEl.className = "tbx-json-status err";
        return;
      }
      try {
        const data = JSON.parse(codeArea2.value || "{}"), v10 = arg11 === "min" ? JSON.stringify(data) : JSON.stringify(data, null, 2);
        codeArea2.value = v10, codeArea2.dispatchEvent(new Event("input")), jsonStatusEl.textContent = "Done. Recuerda guardar el archivo.", jsonStatusEl.className = "tbx-json-status ok";
      } catch (err2) {
        jsonStatusEl.textContent = "Invalid JSON: " + err2.message, jsonStatusEl.className = "tbx-json-status err";
      }
    };
    arg12.querySelector("#jsonBeautify").onclick = () => data2("beauty"), arg12.querySelector("#jsonMinify").onclick = () => data2("min");
  }));
}
function openColorsTool() {
  showModal('\n    <div class="modal tbx-modal">\n      <div class="tbx-tool-head">\n        <button class="tbx-back" id="colorsBack">' + UI_ICONS.back + '</button>\n        <h3>Colores de Minecraft</h3>\n      </div>\n      <p>Click on a color or format to insert it into the open file (or copy it if none is open).</p>\n      <div class="mc-color-grid" id="mcColorGrid"></div>\n      <div class="tbx-tool-subtitle">Text Formatting</div>\n      <div class="mc-format-grid" id="mcFormatGrid"></div>\n    </div>\n  ', ((arg15) => {
    arg15.querySelector("#colorsBack").onclick = () => {
      closeModal(), showToolboxModal();
    };
    const mcColorGridEl = arg15.querySelector("#mcColorGrid");
    MC_COLORS.forEach((arg13) => {
      const divEl2 = document.createElement("div");
      divEl2.className = "mc-chip", divEl2.innerHTML = '<span class="mc-swatch" style="background:' + arg13.hex + '"></span><span class="mc-chip-info"><b>\xA7' + arg13.code + "</b>" + arg13.name + "</span>", divEl2.addEventListener("click", () => {
        const v11 = "\xA7" + arg13.code;
        if (insertAtCursor(v11)) showToast(v11 + " inserted");
        else copyToClipboard(v11), showToast(v11 + " copied");
      }), mcColorGridEl.appendChild(divEl2);
    });
    const mcFormatGridEl = arg15.querySelector("#mcFormatGrid");
    MC_FORMATS.forEach((arg14) => {
      const divEl3 = document.createElement("div");
      divEl3.className = "mc-chip mc-chip-format", divEl3.innerHTML = '<span class="mc-chip-info"><b>\xA7' + arg14.code + "</b>" + arg14.name + "</span>", divEl3.addEventListener("click", () => {
        const v12 = "\xA7" + arg14.code;
        if (insertAtCursor(v12)) showToast(v12 + " inserted");
        else copyToClipboard(v12), showToast(v12 + " copied");
      }), mcFormatGridEl.appendChild(divEl3);
    });
  }));
}
function openSnippetsTool() {
  showModal('\n    <div class="modal tbx-modal">\n      <div class="tbx-tool-head">\n        <button class="tbx-back" id="snipBack">' + UI_ICONS.back + '</button>\n        <h3>Bedrock API Snippets</h3>\n      </div>\n      <p>Insert common Minecraft Bedrock Script API code snippets into your file.</p>\n      <div class="snippet-list" id="snippetList"></div>\n    </div>\n  ', ((arg17) => {
    arg17.querySelector("#snipBack").onclick = () => {
      closeModal(), showToolboxModal();
    };
    const snippetListEl = arg17.querySelector("#snippetList");
    BEDROCK_SNIPPETS.forEach((arg16) => {
      const divEl4 = document.createElement("div");
      divEl4.className = "snippet-item", divEl4.innerHTML = '\n        <div class="snippet-item-head">\n          <span class="snippet-item-name">' + escapeHtml(arg16.name) + '</span>\n          <div class="snippet-item-actions">\n            <button class="btn btn-ghost btn-sm" data-action="copy">Copiar</button>\n            <button class="btn btn-primary btn-sm" data-action="insert">Insertar</button>\n          </div>\n        </div>\n        <pre class="snippet-code">' + escapeHtml(arg16.code) + "</pre>\n      ", divEl4.querySelector('[data-action="copy"]').onclick = () => {
        copyToClipboard(arg16.code), showToast("Snippet copied");
      }, divEl4.querySelector('[data-action="insert"]').onclick = () => {
        if (insertAtCursor(arg16.code)) showToast("Snippet inserted");
        else copyToClipboard(arg16.code), showToast("Open a file to insert. Copiado al portapapeles.");
      }, snippetListEl.appendChild(divEl4);
    });
  }));
}
function collectManifests(arg19 = state.root, arg20 = "", arg21 = []) {
  return arg19.type === "file" && arg19.name.toLowerCase() === "manifest.json" && arg21.push({ "id": arg19.id, "path": arg20 ? arg20 + "/" + arg19.name : arg19.name, "node": arg19 }), arg19.children && arg19.children.forEach((arg18) => collectManifests(arg18, arg19.id === "root" ? arg20 : arg20 ? arg20 + "/" + arg19.name : arg19.name, arg21)), arg21;
}
function validateManifest(arg24) {
  let v13;
  try {
    v13 = JSON.parse(arg24);
  } catch (err3) {
    return [{ "ok": false, "msg": "Invalid JSON: " + err3.message }];
  }
  const list = [];
  list.push({ "ok": typeof v13.format_version === "number", "msg": "Numeric format_version present" }), list.push({ "ok": !!v13.header, "msg": "Header object present" });
  v13.header && (list.push({ "ok": !!v13.header.name, "msg": "header.name defined" }), list.push({ "ok": !!v13.header.uuid, "msg": "header.uuid defined" }), list.push({ "ok": Array.isArray(v13.header.version) && v13.header.version.length === 3, "msg": "header.version is an array [x, y, z]" }), list.push({ "ok": Array.isArray(v13.header.min_engine_version), "msg": "header.min_engine_version defined" }));
  list.push({ "ok": Array.isArray(v13.modules) && v13.modules.length > 0, "msg": "At least one module defined" });
  if (Array.isArray(v13.modules)) {
    const list2 = [];
    if (v13.header && v13.header.uuid) list2.push(v13.header.uuid);
    v13.modules.forEach((arg22, arg23) => {
      const v14 = "1|0|4|3|2".split("|");
      let v15 = 0;
      while (true) {
        switch (v14[v15++]) {
          case "0":
            list.push({ "ok": !!arg22.uuid, "msg": "modules[" + arg23 + "].uuid defined" });
            continue;
          case "1":
            list.push({ "ok": !!arg22.type, "msg": "modules[" + arg23 + "].type defined" });
            continue;
          case "2":
            if (arg22.uuid) list2.push(arg22.uuid);
            continue;
          case "3":
            if (arg22.type === "script") list.push({ "ok": !!arg22.entry, "msg": "modules[" + arg23 + "].entry defined (script)" });
            continue;
          case "4":
            list.push({ "ok": Array.isArray(arg22.version), "msg": "modules[" + arg23 + "].version defined" });
            continue;
        }
        break;
      }
    }), list.push({ "ok": new Set(list2).size === list2.length, "msg": "Header and module UUIDs are unique relative to each other" });
  }
  return list;
}
function openManifestValidatorTool() {
  const v16 = collectManifests();
  showModal('\n    <div class="modal tbx-modal" style="width:480px;">\n      <div class="tbx-tool-head">\n        <button class="tbx-back" id="manBack">' + UI_ICONS.back + "</button>\n        <h3>Validador de manifest</h3>\n      </div>\n      " + (v16.length ? '\n        <div class="imgjson-field">\n          <label>manifest.json File</label>\n          <select id="manSelect">' + v16.map((arg25) => '<option value="' + arg25.id + '">' + escapeHtml(arg25.path) + "</option>").join("") + '</select>\n        </div>\n        <div class="modal-actions" style="justify-content:flex-start;">\n          <button class="btn btn-primary" id="manValidate">Validar</button>\n        </div>\n        <div class="manifest-checks" id="manChecks"></div>\n      ' : "<p>No manifest.json file was found in the project.</p>") + "\n    </div>\n  ", ((arg28) => {
    arg28.querySelector("#manBack").onclick = () => {
      closeModal(), showToolboxModal();
    };
    if (!v16.length) return;
    arg28.querySelector("#manValidate").onclick = () => {
      const manSelectEl = arg28.querySelector("#manSelect").value, fn2 = v16.find((arg26) => arg26.id === manSelectEl), v17 = validateManifest(fn2.node.content || "");
      arg28.querySelector("#manChecks").innerHTML = v17.map((arg27) => '<div class="manifest-check ' + (arg27.ok ? "ok" : "bad") + '">' + (arg27.ok ? "\u2713 " : "\u2717 ") + escapeHtml(arg27.msg) + "</div>").join("");
    };
  }));
}
function collectModelFiles(arg30 = state.root, arg31 = "", arg32 = []) {
  if (arg30.type === "file") {
    const v18 = fileMeta(arg30);
    if (v18.isModel) arg32.push({ "id": arg30.id, "path": arg31 ? arg31 + "/" + arg30.name : arg30.name });
  }
  return arg30.children && arg30.children.forEach((arg29) => collectModelFiles(arg29, arg30.id === "root" ? arg31 : arg31 ? arg31 + "/" + arg30.name : arg30.name, arg32)), arg32;
}
function summarizeGeometry(arg36) {
  try {
    const data3 = JSON.parse(arg36), v19 = data3["minecraft:geometry"];
    if (!Array.isArray(v19)) return null;
    return v19.map((arg35) => {
      const v20 = arg35.bones || [], fn3 = v20.reduce((arg33, arg34) => arg33 + (arg34.cubes ? arg34.cubes.length : 0), 0), v21 = arg35.description || {};
      return { "identifier": v21.identifier || "(no identifier)", "textureWidth": v21.texture_width, "textureHeight": v21.texture_height, "boneCount": v20.length, "cubeCount": fn3 };
    });
  } catch (err4) {
    return null;
  }
}
function openModelsTool() {
  const v22 = collectModelFiles();
  showModal('\n    <div class="modal tbx-modal">\n      <div class="tbx-tool-head">\n        <button class="tbx-back" id="modBack">' + UI_ICONS.back + '</button>\n        <h3>Models<span class="tbx-beta">BETA</span></h3>\n      </div>\n      <p>Inspecciona los archivos de geometría Bedrock (.geo.json) del proyecto.</p>\n      <div class="model-list" id="modelList"></div>\n      <div class="model-detail" id="modelDetail"></div>\n    </div>\n  ', ((arg40) => {
    arg40.querySelector("#modBack").onclick = () => {
      closeModal(), showToolboxModal();
    };
    const modelListEl = arg40.querySelector("#modelList"), modelDetailEl = arg40.querySelector("#modelDetail");
    if (!v22.length) {
      modelListEl.innerHTML = '<div class="imgjson-empty">No models were detected in the project.</div>';
      return;
    }
    v22.forEach((arg39) => {
      const divEl5 = document.createElement("div");
      divEl5.className = "model-list-item", divEl5.innerHTML = UI_ICONS.models + "<span>" + escapeHtml(arg39.path) + "</span>", divEl5.addEventListener("click", () => {
        modelListEl.querySelectorAll(".model-list-item").forEach((arg37) => arg37.classList.remove("active")), divEl5.classList.add("active");
        const v23 = findNode(arg39.id), v24 = summarizeGeometry(v23.content || "");
        v24 && v24.length ? modelDetailEl.innerHTML = v24.map((arg38) => '\n            <div class="model-summary-card">\n              <div class="model-summary-title">' + escapeHtml(arg38.identifier) + '</div>\n              <div class="model-summary-row">Texture: ' + (arg38.textureWidth || "?") + "\xD7" + (arg38.textureHeight || "?") + 'px</div>\n              <div class="model-summary-row">Bones: ' + arg38.boneCount + '</div>\n              <div class="model-summary-row">Total Cubes: ' + arg38.cubeCount + "</div>\n            </div>\n          ").join("") : modelDetailEl.innerHTML = '<pre class="model-raw">' + escapeHtml((v23.content || "").slice(0, 1200)) + "</pre>";
      }), modelListEl.appendChild(divEl5);
    });
  }));
}
class UISpriteAnimator {
  constructor(arg41, arg42, arg43, arg44) {
    const v25 = "2|6|7|5|8|1|4|0|3".split("|");
    let v26 = 0;
    while (true) {
      switch (v25[v26++]) {
        case "0":
          this.playing = false;
          continue;
        case "1":
          this.scale = arg44 && arg44.scale ? arg44.scale : 1;
          continue;
        case "2":
          this.canvas = arg41;
          continue;
        case "3":
          this.timer = null;
          continue;
        case "4":
          this.currentFrame = 0;
          continue;
        case "5":
          this.frames = arg43;
          continue;
        case "6":
          this.ctx = arg41.getContext("2d");
          continue;
        case "7":
          this.image = arg42;
          continue;
        case "8":
          this.loop = arg44 && arg44.loop !== void 0 ? arg44.loop : true;
          continue;
      }
      break;
    }
  }
  ["drawFrame"](arg45) {
    const v27 = this.frames[arg45];
    if (!v27) return;
    const v28 = v27.frame.w * this.scale, v29 = v27.frame.h * this.scale;
    this.canvas.width = v28, this.canvas.height = v29, this.ctx.clearRect(0, 0, v28, v29), this.ctx.drawImage(this.image, v27.frame.x, v27.frame.y, v27.frame.w, v27.frame.h, 0, 0, v28, v29);
  }
  ["play"]() {
    if (this.playing || !this.frames.length) return;
    this.playing = true;
    const fn4 = () => {
      if (!this.playing) return;
      this.drawFrame(this.currentFrame);
      const v30 = this.frames[this.currentFrame] ? this.frames[this.currentFrame].duration : 100;
      this.timer = setTimeout((() => {
        this.currentFrame++;
        if (this.currentFrame >= this.frames.length) {
          if (this.loop) this.currentFrame = 0;
          else {
            this.playing = false;
            return;
          }
        }
        fn4();
      }), v30);
    };
    fn4();
  }
  ["pause"]() {
    this.playing = false, clearTimeout(this.timer);
  }
  ["restart"]() {
    this.pause(), this.currentFrame = 0, this.drawFrame(0);
  }
}
function computeFrames(arg46, arg47, arg48, arg49, arg50, arg51) {
  const v31 = Math.max(1, Math.min(arg49, arg47)), v32 = Math.max(1, Math.min(arg50, arg48)), v33 = Math.max(1, Math.floor(arg47 / v31)), v34 = Math.max(1, Math.floor(arg48 / v32)), list3 = [];
  let v35 = 0;
  for (let v36 = 0; v36 < v34; v36++) {
    for (let v37 = 0; v37 < v33; v37++) {
      list3.push({ "filename": arg46 + " " + v35 + ".png", "frame": { "x": v37 * v31, "y": v36 * v32, "w": v31, "h": v32 }, "rotated": false, "trimmed": false, "spriteSourceSize": { "x": 0, "y": 0, "w": v31, "h": v32 }, "sourceSize": { "w": v31, "h": v32 }, "duration": arg51 }), v35++;
    }
  }
  return list3;
}
function buildFramesJson(arg52, arg53, arg54, arg55, arg56, arg57, arg58) {
  return { "frames": computeFrames(arg52, arg53, arg54, arg55, arg56, arg57), "meta": { "app": "FireDex Img.Json", "version": "1.0", "image": arg58, "format": "RGBA8888", "size": { "w": arg53, "h": arg54 }, "scale": "1", "frameTags": [], "layers": [{ "name": "Sprite Sheet", "opacity": 255, "blendMode": "normal" }], "slices": [] } };
}
function buildAnimatorFileSource(arg125, arg126) {
  const obj = { "wayMH": function(arg59, arg60) {
    return arg59 + arg60;
  }, "xiTLF": function(arg61, arg62) {
    return arg61 + arg62;
  }, "EqpOf": function(arg63, arg64) {
    return arg63 + arg64;
  }, "zZjHJ": function(arg65, arg66) {
    return arg65 + arg66;
  }, "BBbyY": function(arg67, arg68) {
    return arg67 + arg68;
  }, "kcWof": function(arg69, arg70) {
    return arg69 + arg70;
  }, "aSewH": function(arg71, arg72) {
    return arg71 + arg72;
  }, "GIeOs": function(arg73, arg74) {
    return arg73 + arg74;
  }, "gEsNZ": function(arg75, arg76) {
    return arg75 + arg76;
  }, "ilDVw": function(arg77, arg78) {
    return arg77 + arg78;
  }, "wHJjm": function(arg79, arg80) {
    return arg79 + arg80;
  }, "jQHYk": function(arg81, arg82) {
    return arg81 + arg82;
  }, "jZHrS": function(arg83, arg84) {
    return arg83 + arg84;
  }, "ynJWl": function(arg85, arg86) {
    return arg85 + arg86;
  }, "hJoqn": function(arg87, arg88) {
    return arg87 + arg88;
  }, "TjpnI": function(arg89, arg90) {
    return arg89 + arg90;
  }, "jXzbj": function(arg91, arg92) {
    return arg91 + arg92;
  }, "ZCayx": function(arg93, arg94) {
    return arg93 + arg94;
  }, "fFkia": function(arg95, arg96) {
    return arg95 + arg96;
  }, "TmLcm": function(arg97, arg98) {
    return arg97 + arg98;
  }, "mDBgJ": function(arg99, arg100) {
    return arg99 + arg100;
  }, "BDhKe": function(arg101, arg102) {
    return arg101 + arg102;
  }, "LBpdL": function(arg103, arg104) {
    return arg103 + arg104;
  }, "RICUM": function(arg105, arg106) {
    return arg105 + arg106;
  }, "mHvIr": function(arg107, arg108) {
    return arg107 + arg108;
  }, "iKXca": function(arg109, arg110) {
    return arg109 + arg110;
  }, "hFcEK": function(arg111, arg112) {
    return arg111 + arg112;
  }, "QcjlQ": function(arg113, arg114) {
    return arg113 + arg114;
  }, "KlTLq": function(arg115, arg116) {
    return arg115 + arg116;
  }, "PFXdz": function(arg117, arg118) {
    return arg117 + arg118;
  }, "CWiJa": function(arg119, arg120) {
    return arg119 + arg120;
  }, "CSygs": function(arg121, arg122) {
    return arg121 + arg122;
  }, "hunvr": function(arg123, arg124) {
    return arg123 + arg124;
  }, "udAMp": "class SpriteAnimator{\n", "HFVYA": "  constructor(canvas,image,frames,options){\n", "MlOEK": "    this.canvas=canvas;\n", "tVOPS": '    this.ctx=canvas.getContext("2d");\n', "MGstL": "    this.image=image;\n", "CYJVe": "    this.frames=frames;\n", "zUhvQ": "    this.loop=options&&options.loop!==undefined?options.loop:true;\n", "UeQAQ": "    this.scale=options&&options.scale?options.scale:1;\n", "NIyOE": "    this.currentFrame=0;\n", "ltirA": "    this.playing=false;\n", "AZWtB": "    this.timer=null;\n", "GQash": "  }\n", "AAuic": "  drawFrame(index){\n", "cjtZF": "    const f=this.frames[index];\n", "CAmyk": "    if(!f)return;\n", "yDCCD": "    const w=f.frame.w*this.scale;\n", "dxfBJ": "    const h=f.frame.h*this.scale;\n", "NccWj": "    this.canvas.width=w;\n", "DczrU": "    this.canvas.height=h;\n", "hQJKH": "    this.ctx.clearRect(0,0,w,h);\n", "GHYhZ": "    this.ctx.drawImage(this.image,f.frame.x,f.frame.y,f.frame.w,f.frame.h,0,0,w,h);\n", "ENSPd": "  play(){\n", "zyHWL": "    if(this.playing||!this.frames.length)return;\n", "AatPi": "    this.playing=true;\n", "ypwBL": "    const step=()=>{\n", "CPOig": "      if(!this.playing)return;\n", "yLsgz": "      this.drawFrame(this.currentFrame);\n", "GNslh": "      const duration=this.frames[this.currentFrame]?this.frames[this.currentFrame].duration:100;\n", "icSIN": "      this.timer=setTimeout(()=>{\n", "vVHHH": "        this.currentFrame++;\n", "RyllY": "        if(this.currentFrame>=this.frames.length){\n", "rPUPW": "          if(this.loop)this.currentFrame=0;\n", "LAfEK": "          else{this.playing=false;return;}\n", "BydXb": "        }\n", "ceUFe": "        step();\n", "Sdffx": "      },duration);\n", "NahFC": "    };\n", "lpJbX": "    step();\n", "dIGGR": "  pause(){\n", "jusPe": "    clearTimeout(this.timer);\n", "uyyJE": "  restart(){\n", "UEAHJ": "    this.pause();\n", "HrAmj": "    this.drawFrame(0);\n", "nXspL": "function loadSpriteAnimation(canvasId,options){\n", "PkIbO": "  const canvas=document.getElementById(canvasId);\n", "QTScr": "  const image=new Image();\n", "YpQyw": '  image.src="', "BuqkV": '";\n', "xRLlf": '  return fetch("', "KJpXa": '")\n', "tcjgZ": "    .then((response)=>response.json())\n", "MVbHx": "    .then((jsonData)=>new Promise((resolve)=>{\n", "VmGPi": "      const start=()=>{\n", "toJZn": "        const animator=new SpriteAnimator(canvas,image,jsonData.frames,options||{loop:true});\n", "HHwKG": "        animator.play();\n", "VwcOr": "        resolve(animator);\n", "okEiW": "      };\n", "uBCDj": "      if(image.complete)start();\n", "XDvKi": "      else image.onload=start;\n", "CMhIp": "    }));\n", "GBrLj": 'if(typeof module!=="undefined"&&module.exports){\n', "jONUY": "  module.exports={SpriteAnimator,loadSpriteAnimation};\n" };
  return obj.wayMH(obj.xiTLF(obj.xiTLF(obj.xiTLF(obj.wayMH(obj.xiTLF(obj.wayMH(obj.EqpOf(obj.EqpOf(obj.zZjHJ(obj.xiTLF(obj.EqpOf(obj.BBbyY(obj.wayMH(obj.kcWof(obj.zZjHJ(obj.BBbyY(obj.aSewH(obj.GIeOs(obj.gEsNZ(obj.ilDVw(obj.BBbyY(obj.gEsNZ(obj.GIeOs(obj.ilDVw(obj.GIeOs(obj.kcWof(obj.wHJjm(obj.gEsNZ(obj.jQHYk(obj.jZHrS(obj.GIeOs(obj.ynJWl(obj.hJoqn(obj.TjpnI(obj.jXzbj(obj.EqpOf(obj.ZCayx(obj.kcWof(obj.fFkia(obj.TmLcm(obj.ilDVw(obj.BBbyY(obj.fFkia(obj.mDBgJ(obj.jXzbj(obj.gEsNZ(obj.BDhKe(obj.LBpdL(obj.RICUM(obj.ZCayx(obj.GIeOs(obj.jXzbj(obj.mHvIr(obj.iKXca(obj.hFcEK(obj.ynJWl(obj.QcjlQ(obj.TjpnI(obj.KlTLq(obj.ZCayx('class SpriteAnimator{\n  constructor(canvas,image,frames,options){\n    this.canvas=canvas;\n    this.ctx=canvas.getContext("2d");\n    this.image=image;\n    this.frames=frames;\n    this.loop=options&&options.loop!==undefined?options.loop:true;\n    this.scale=options&&options.scale?options.scale:1;\n    this.currentFrame=0;\n    this.playing=false;\n    this.timer=null;\n  }\n', "  drawFrame(index){\n"), "    const f=this.frames[index];\n"), "    if(!f)return;\n"), "    const w=f.frame.w*this.scale;\n"), "    const h=f.frame.h*this.scale;\n"), "    this.canvas.width=w;\n"), "    this.canvas.height=h;\n"), "    this.ctx.clearRect(0,0,w,h);\n"), "    this.ctx.drawImage(this.image,f.frame.x,f.frame.y,f.frame.w,f.frame.h,0,0,w,h);\n"), "  }\n"), "  play(){\n"), "    if(this.playing||!this.frames.length)return;\n"), "    this.playing=true;\n"), "    const step=()=>{\n"), "      if(!this.playing)return;\n"), "      this.drawFrame(this.currentFrame);\n"), "      const duration=this.frames[this.currentFrame]?this.frames[this.currentFrame].duration:100;\n"), "      this.timer=setTimeout(()=>{\n"), "        this.currentFrame++;\n"), "        if(this.currentFrame>=this.frames.length){\n"), "          if(this.loop)this.currentFrame=0;\n"), "          else{this.playing=false;return;}\n"), "        }\n"), "        step();\n"), "      },duration);\n"), "    };\n"), "    step();\n"), "  }\n"), "  pause(){\n"), "    this.playing=false;\n"), "    clearTimeout(this.timer);\n"), "  }\n"), "  restart(){\n"), "    this.pause();\n"), "    this.currentFrame=0;\n"), "    this.drawFrame(0);\n"), "  }\n"), "}\n"), "function loadSpriteAnimation(canvasId,options){\n"), "  const canvas=document.getElementById(canvasId);\n"), "  const image=new Image();\n"), '  image.src="'), arg126), '";\n'), '  return fetch("'), arg125), '")\n'), "    .then((response)=>response.json())\n"), "    .then((jsonData)=>new Promise((resolve)=>{\n"), "      const start=()=>{\n"), "        const animator=new SpriteAnimator(canvas,image,jsonData.frames,options||{loop:true});\n"), "        animator.play();\n"), "        resolve(animator);\n"), "      };\n"), "      if(image.complete)start();\n"), "      else image.onload=start;\n"), "    }));\n"), "}\n"), 'if(typeof module!=="undefined"&&module.exports){\n'), "  module.exports={SpriteAnimator,loadSpriteAnimation};\n"), "}\n");
}
function readImageFile(arg128) {
  return new Promise((arg127) => {
    const v38 = new FileReader();
    v38.onload = () => {
      const v39 = new Image();
      v39.onload = () => arg127({ "dataUrl": v38.result, "width": v39.naturalWidth, "height": v39.naturalHeight }), v39.src = v38.result;
    }, v38.readAsDataURL(arg128);
  });
}
function baseNameOf(arg129) {
  const v40 = arg129.lastIndexOf(".");
  return v40 > 0 ? arg129.slice(0, v40) : arg129;
}
let imgJsonEntries = [], imgJsonActiveId = null, imgJsonPlayer = null;
function openImgJsonTool() {
  imgJsonEntries = [], imgJsonActiveId = null, imgJsonPlayer = null, showModal('\n    <div class="modal tbx-modal imgjson-modal">\n      <div class="tbx-tool-head">\n        <button class="tbx-back" id="imgJsonBack">' + UI_ICONS.back + '</button>\n        <h3>Img.Json</h3>\n      </div>\n      <p>Convert one or multiple spritesheets into animations with ready-to-play JSON + JS.</p>\n      <div class="imgjson-layout">\n        <div class="imgjson-col">\n          <label class="imgjson-upload" id="imgJsonUploadZone">\n            ' + UI_ICONS.upload + '\n            <span>Select images</span>\n            <input type="file" id="imgJsonFileInput" accept="image/*" multiple style="display:none">\n          </label>\n          <div class="imgjson-list" id="imgJsonList"></div>\n        </div>\n        <div class="imgjson-col">\n          <div class="imgjson-params" id="imgJsonParams"></div>\n          <div class="imgjson-preview-wrap">\n            <canvas id="imgJsonCanvas"></canvas>\n            <div class="imgjson-preview-controls" id="imgJsonControls" style="display:none;">\n              <button class="icon-btn" id="imgJsonPlayBtn" title="Play">' + UI_ICONS_PLAY() + '</button>\n              <button class="icon-btn" id="imgJsonPauseBtn" title="Pause">' + UI_ICONS.pause + '</button>\n              <button class="icon-btn" id="imgJsonRestartBtn" title="Restart">' + UI_ICONS.restart + '</button>\n              <span class="imgjson-frame-count" id="imgJsonFrameCount"></span>\n            </div>\n          </div>\n        </div>\n      </div>\n      <div class="imgjson-folder-row">\n        <label>Destination folder</label>\n        <input type="text" id="imgJsonFolderName" value="sprites">\n      </div>\n      <div class="modal-actions">\n        <button class="btn btn-ghost" id="imgJsonCancel">Cancelar</button>\n        <button class="btn btn-primary" id="imgJsonGenerate">Generate Project</button>\n      </div>\n    </div>\n  ', ((arg130) => mountImgJsonTool(arg130)));
}
function UI_ICONS_PLAY() {
  return ICONS.play;
}
function mountImgJsonTool(arg135) {
  arg135.querySelector("#imgJsonBack").onclick = () => {
    closeModal(), showToolboxModal();
  }, arg135.querySelector("#imgJsonCancel").onclick = closeModal;
  const imgJsonUploadZoneEl = arg135.querySelector("#imgJsonUploadZone"), imgJsonFileInputEl = arg135.querySelector("#imgJsonFileInput");
  imgJsonFileInputEl.addEventListener("change", async (arg131) => {
    const v41 = Array.from(arg131.target.files);
    for (const v42 of v41) {
      const result = await readImageFile(v42), obj2 = { "id": uid(), "baseName": baseNameOf(v42.name).replace(/[^a-zA-Z0-9_-]/g, "_") || "sprite", "dataUrl": result.dataUrl, "width": result.width, "height": result.height, "frameWidth": result.height, "frameHeight": result.height, "duration": 100, "loop": true };
      imgJsonEntries.push(obj2);
    }
    if (!imgJsonActiveId && imgJsonEntries.length) imgJsonActiveId = imgJsonEntries[0].id;
    renderImgJsonList(arg135), renderImgJsonParams(arg135), imgJsonFileInputEl.value = "";
  }), imgJsonUploadZoneEl.addEventListener("dragover", (arg132) => {
    arg132.preventDefault(), imgJsonUploadZoneEl.classList.add("drag");
  }), imgJsonUploadZoneEl.addEventListener("dragleave", () => imgJsonUploadZoneEl.classList.remove("drag")), imgJsonUploadZoneEl.addEventListener("drop", (arg134) => {
    arg134.preventDefault(), imgJsonUploadZoneEl.classList.remove("drag");
    const v43 = new DataTransfer();
    Array.from(arg134.dataTransfer.files).forEach((arg133) => {
      if (arg133.type.startsWith("image/")) v43.items.add(arg133);
    }), imgJsonFileInputEl.files = v43.files, imgJsonFileInputEl.dispatchEvent(new Event("change"));
  }), arg135.querySelector("#imgJsonPlayBtn").onclick = () => {
    if (imgJsonPlayer) imgJsonPlayer.play();
  }, arg135.querySelector("#imgJsonPauseBtn").onclick = () => {
    if (imgJsonPlayer) imgJsonPlayer.pause();
  }, arg135.querySelector("#imgJsonRestartBtn").onclick = () => {
    if (imgJsonPlayer) imgJsonPlayer.restart();
  }, arg135.querySelector("#imgJsonGenerate").onclick = () => handleImgJsonGenerate(arg135), renderImgJsonList(arg135), renderImgJsonParams(arg135);
}
function renderImgJsonList(arg140) {
  const imgJsonListEl = arg140.querySelector("#imgJsonList");
  if (!imgJsonEntries.length) {
    imgJsonListEl.innerHTML = '<div class="imgjson-empty">No images added yet.</div>';
    return;
  }
  imgJsonListEl.innerHTML = "", imgJsonEntries.forEach((arg139) => {
    const divEl6 = document.createElement("div");
    divEl6.className = "imgjson-item" + (arg139.id === imgJsonActiveId ? " active" : ""), divEl6.innerHTML = '\n      <img src="' + arg139.dataUrl + '" alt="' + escapeHtml(arg139.baseName) + '">\n      <div class="imgjson-item-info">\n        <div class="imgjson-item-name">' + escapeHtml(arg139.baseName) + '</div>\n        <div class="imgjson-item-dim">' + arg139.width + "\xD7" + arg139.height + 'px</div>\n      </div>\n      <button class="imgjson-item-remove" title="Remove">' + UI_ICONS.close + "</button>\n    ", divEl6.addEventListener("click", (arg136) => {
      if (arg136.target.closest(".imgjson-item-remove")) return;
      imgJsonActiveId = arg139.id, renderImgJsonList(arg140), renderImgJsonParams(arg140);
    }), divEl6.querySelector(".imgjson-item-remove").addEventListener("click", (arg138) => {
      const v44 = "4|3|1|0|2".split("|");
      let v45 = 0;
      while (true) {
        switch (v44[v45++]) {
          case "0":
            renderImgJsonList(arg140);
            continue;
          case "1":
            if (imgJsonActiveId === arg139.id) imgJsonActiveId = imgJsonEntries.length ? imgJsonEntries[0].id : null;
            continue;
          case "2":
            renderImgJsonParams(arg140);
            continue;
          case "3":
            imgJsonEntries = imgJsonEntries.filter((arg137) => arg137.id !== arg139.id);
            continue;
          case "4":
            arg138.stopPropagation();
            continue;
        }
        break;
      }
    }), imgJsonListEl.appendChild(divEl6);
  });
}
function renderImgJsonParams(arg143) {
  const imgJsonParamsEl = arg143.querySelector("#imgJsonParams"), fn5 = imgJsonEntries.find((arg141) => arg141.id === imgJsonActiveId);
  if (!fn5) {
    imgJsonParamsEl.innerHTML = '<div class="imgjson-empty">Select an image to adjust its parameters.</div>', updateImgJsonPreview(arg143);
    return;
  }
  imgJsonParamsEl.innerHTML = '\n    <div class="imgjson-field">\n      <label>Base name</label>\n      <input type="text" id="pBaseName" value="' + escapeHtml(fn5.baseName) + '">\n    </div>\n    <div class="imgjson-field-row">\n      <div class="imgjson-field">\n        <label>Frame width</label>\n        <input type="number" id="pFrameWidth" min="1" max="' + fn5.width + '" value="' + fn5.frameWidth + '">\n      </div>\n      <div class="imgjson-field">\n        <label>Frame height</label>\n        <input type="number" id="pFrameHeight" min="1" max="' + fn5.height + '" value="' + fn5.frameHeight + '">\n      </div>\n    </div>\n    <div class="imgjson-field-row">\n      <div class="imgjson-field">\n        <label>Duration per frame (ms)</label>\n        <input type="number" id="pDuration" min="10" step="10" value="' + fn5.duration + '">\n      </div>\n      <div class="imgjson-field imgjson-field-checkbox">\n        <label><input type="checkbox" id="pLoop" ' + (fn5.loop ? "checked" : "") + '> Loop animation</label>\n      </div>\n    </div>\n    <div class="imgjson-meta-info">' + fn5.width + "\xD7" + fn5.height + 'px \xB7 <span id="pGridInfo"></span></div>\n  ';
  const pLoopEl = () => {
    const v46 = "3|6|5|2|1|0|4".split("|");
    let v47 = 0;
    while (true) {
      switch (v46[v47++]) {
        case "0":
          updateImgJsonPreview(arg143);
          continue;
        case "1":
          fn5.loop = imgJsonParamsEl.querySelector("#pLoop").checked;
          continue;
        case "2":
          fn5.duration = Math.max(10, parseInt(imgJsonParamsEl.querySelector("#pDuration").value, 10) || 100);
          continue;
        case "3":
          fn5.baseName = imgJsonParamsEl.querySelector("#pBaseName").value.replace(/[^a-zA-Z0-9_-]/g, "_") || "sprite";
          continue;
        case "4":
          renderImgJsonList(arg143);
          continue;
        case "5":
          fn5.frameHeight = Math.max(1, Math.min(parseInt(imgJsonParamsEl.querySelector("#pFrameHeight").value, 10) || fn5.height, fn5.height));
          continue;
        case "6":
          fn5.frameWidth = Math.max(1, Math.min(parseInt(imgJsonParamsEl.querySelector("#pFrameWidth").value, 10) || fn5.width, fn5.width));
          continue;
      }
      break;
    }
  };
  imgJsonParamsEl.querySelectorAll("input").forEach((arg142) => arg142.addEventListener("input", pLoopEl)), updateImgJsonPreview(arg143);
}
function updateImgJsonPreview(arg145) {
  const fn6 = imgJsonEntries.find((arg144) => arg144.id === imgJsonActiveId), imgJsonCanvasEl = arg145.querySelector("#imgJsonCanvas"), imgJsonControlsEl = arg145.querySelector("#imgJsonControls");
  imgJsonPlayer && (imgJsonPlayer.pause(), imgJsonPlayer = null);
  if (!imgJsonCanvasEl) return;
  const v48 = imgJsonCanvasEl.getContext("2d");
  v48.clearRect(0, 0, imgJsonCanvasEl.width, imgJsonCanvasEl.height);
  if (!fn6) {
    imgJsonControlsEl.style.display = "none";
    return;
  }
  const v49 = computeFrames(fn6.baseName, fn6.width, fn6.height, fn6.frameWidth, fn6.frameHeight, fn6.duration), v50 = Math.max(1, Math.floor(fn6.width / fn6.frameWidth)), v51 = Math.max(1, Math.floor(fn6.height / fn6.frameHeight)), pGridInfoEl = arg145.querySelector("#pGridInfo");
  if (pGridInfoEl) pGridInfoEl.textContent = v49.length + " frames (" + v50 + "\xD7" + v51 + ")";
  const imgJsonFrameCountEl = arg145.querySelector("#imgJsonFrameCount");
  if (imgJsonFrameCountEl) imgJsonFrameCountEl.textContent = v49.length + " frames";
  const v52 = new Image();
  v52.onload = () => {
    imgJsonPlayer = new UISpriteAnimator(imgJsonCanvasEl, v52, v49, { "loop": fn6.loop, "scale": 1 }), imgJsonPlayer.drawFrame(0), imgJsonPlayer.play();
  }, v52.src = fn6.dataUrl, imgJsonControlsEl.style.display = "flex";
}
function handleImgJsonGenerate(arg147) {
  if (!imgJsonEntries.length) {
    showToast("Add at least one image.");
    return;
  }
  const imgJsonFolderNameEl = arg147.querySelector("#imgJsonFolderName"), v53 = (imgJsonFolderNameEl.value || "sprites").trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "sprites", v54 = ensureFolderPath([v53]), set = /* @__PURE__ */ new Set();
  let v55 = null;
  imgJsonEntries.forEach((arg146) => {
    let v56 = (arg146.baseName || "sprite").trim() || "sprite", v57 = v56, v58 = 1;
    while (set.has(v57)) {
      v57 = v56 + "_" + v58, v58++;
    }
    set.add(v57), v56 = v57;
    const v59 = v56 + ".png", v60 = v56 + ".json", v61 = v56 + ".js", v62 = buildFramesJson(v56, arg146.width, arg146.height, arg146.frameWidth, arg146.frameHeight, arg146.duration, v59), v63 = buildAnimatorFileSource(v60, v59), obj3 = { "id": uid(), "type": "file", "name": v59, "content": arg146.dataUrl }, obj4 = { "id": uid(), "type": "file", "name": v60, "content": JSON.stringify(v62, null, 2) }, obj5 = { "id": uid(), "type": "file", "name": v61, "content": v63 };
    v54.children.push(obj3, obj4, obj5);
    if (!v55) v55 = obj4.id;
  }), v54.open = true, render(), saveState(), v55 && (activeFileId = v55, renderEditor()), showToast('Animation generated in "' + v53 + '/"'), closeModal();
}
document.getElementById("toolboxBtn").addEventListener("click", showToolboxModal);

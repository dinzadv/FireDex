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
document.getElementById("toolboxBtn").addEventListener("click", showToolboxModal);

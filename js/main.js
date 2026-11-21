const ICONS = { "folderClosed": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"/></svg>', "folderOpen": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.2A2 2 0 0 1 5 6.2h3.6l1.8 2.1H19a2 2 0 0 1 1.94 2.47l-1.18 5.1A2 2 0 0 1 17.8 17.4H5.4a2 2 0 0 1-1.95-1.56L2.06 10.2A2 2 0 0 1 3 8.2Z"/><path d="M3 8.2 5.4 6.2"/></svg>', "file": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-6-5Z"/><path d="M13 3v5h6"/></svg>', "image": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 15-5-5-9 9"/></svg>', "cube": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="M4 7.5 12 12l8-4.5"/><path d="M12 12v9"/></svg>', "chevron": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>', "chevronDown": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>', "warn": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".2" fill="currentColor"/></svg>', "info": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r="1" fill="currentColor" stroke="none"/></svg>', "package": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>', "wrench": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8Z"/></svg>', "person": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>', "globe": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/></svg>', "clock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>', "camera": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-1.5h7L16.5 7h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z"/><circle cx="12" cy="13" r="3.2"/></svg>', "brackets": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4M16 8l4 4-4 4"/></svg>', "gradCap": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m2 9 10-5 10 5-10 5-10-5Z"/><path d="M6 11v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4"/></svg>', "dragon": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 15-5-5-9 9"/><path d="M17 3.5v3M15.5 5h3"/></svg>', "close": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>', "checkCircle": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.3 2.3L16 10"/></svg>', "circleEmpty": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/></svg>', "plus": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>', "dots": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>', "edit": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>', "download": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7.5 10.5 12 15l4.5-4.5"/><path d="M4 18v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/></svg>', "trash": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"/><path d="M10 11v6M14 11v6"/></svg>' }, FILE_TYPES = { "js": { "bg": "#f0db4f", "color": "#1c1c1c", "label": "JS" }, "mjs": { "bg": "#f0db4f", "color": "#1c1c1c", "label": "JS" }, "cjs": { "bg": "#f0db4f", "color": "#1c1c1c", "label": "JS" }, "jsx": { "bg": "#61dafb", "color": "#0b1b26", "label": "JSX" }, "ts": { "bg": "#3178c6", "color": "#fff", "label": "TS" }, "tsx": { "bg": "#3178c6", "color": "#fff", "label": "TSX" }, "json": { "bg": "#f2a24b", "color": "#1c1c1c", "label": "{ }" }, "html": { "bg": "#e34c26", "color": "#fff", "label": "<>" }, "htm": { "bg": "#e34c26", "color": "#fff", "label": "<>" }, "css": { "bg": "#2965f1", "color": "#fff", "label": "#" }, "scss": { "bg": "#c76494", "color": "#fff", "label": "#" }, "md": { "bg": "#63b3ed", "color": "#0b1220", "label": "M\u2193" }, "py": { "bg": "#3572a5", "color": "#fff", "label": "Py" }, "yml": { "bg": "#a8324a", "color": "#fff", "label": "YML" }, "yaml": { "bg": "#a8324a", "color": "#fff", "label": "YML" }, "txt": { "bg": "#5a5a62", "color": "#fff", "label": "TXT" }, "sh": { "bg": "#4eaa25", "color": "#fff", "label": "SH" }, "lang": { "bg": "#20c997", "color": "#0b1220", "label": "LANG" }, "material": { "bg": "#e879f9", "color": "#1c0a1c", "label": "MTL" } }, IMAGE_EXTS = ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico"], MODEL_EXTS = ["obj", "fbx", "glb", "gltf", "bbmodel"], TEXT_EXTS = ["json", "js", "mjs", "cjs", "ts", "tsx", "jsx", "md", "txt", "css", "html", "htm", "yml", "yaml", "lang", "mcfunction", "xml", "cfg", "ini", "sh"], MC_VERSIONS = ["1.20.80", "1.20.90", "1.21.0", "1.21.20", "1.21.40", "1.21.60", "1.21.80", "1.21.90", "1.21.100", "1.21.120", "1.21.130"], DB_NAME = "devstudio_db", DB_VERSION = 1, STORE_INDEX = "projects_index", STORE_DATA = "projects_data";
let dbPromise = null, activeContextMenu = null;
function openDB() {
  if (dbPromise) return dbPromise;
  return dbPromise = new Promise((arg2, arg3) => {
    const v = indexedDB.open(DB_NAME, DB_VERSION);
    v.onupgradeneeded = (arg) => {
      const v2 = arg.target.result;
      !v2.objectStoreNames.contains(STORE_INDEX) && v2.createObjectStore(STORE_INDEX, { "keyPath": "id" }), !v2.objectStoreNames.contains(STORE_DATA) && v2.createObjectStore(STORE_DATA, { "keyPath": "id" });
    }, v.onsuccess = () => arg2(v.result), v.onerror = () => arg3(v.error);
  }), dbPromise;
}
function idbPut(arg7, arg8) {
  return openDB().then((arg6) => new Promise((arg4, arg5) => {
    const tx = arg6.transaction(arg7, "readwrite");
    tx.objectStore(arg7).put(arg8), tx.oncomplete = () => arg4(), tx.onerror = () => arg5(tx.error);
  }));
}
function idbGet(arg12, arg13) {
  return openDB().then((arg11) => new Promise((arg9, arg10) => {
    const tx2 = arg11.transaction(arg12, "readonly"), store = tx2.objectStore(arg12).get(arg13);
    store.onsuccess = () => arg9(store.result || null), store.onerror = () => arg10(store.error);
  }));
}
function idbGetAll(arg17) {
  return openDB().then((arg16) => new Promise((arg14, arg15) => {
    const tx3 = arg16.transaction(arg17, "readonly"), store2 = tx3.objectStore(arg17).getAll();
    store2.onsuccess = () => arg14(store2.result || []), store2.onerror = () => arg15(store2.error);
  }));
}
function idbDelete(arg21, arg22) {
  return openDB().then((arg20) => new Promise((arg18, arg19) => {
    const tx4 = arg20.transaction(arg21, "readwrite");
    tx4.objectStore(arg21).delete(arg22), tx4.oncomplete = () => arg18(), tx4.onerror = () => arg19(tx4.error);
  }));
}
function getExt(arg23) {
  return arg23.includes(".") ? arg23.split(".").pop().toLowerCase() : "";
}
function isModelFile(arg24, arg25) {
  const v3 = getExt(arg25);
  if (MODEL_EXTS.includes(v3)) return true;
  if (v3 === "json" && /(^|\/)models(\/|$)/i.test(arg24)) return true;
  return false;
}
function genId() {
  return "n" + Math.random().toString(36).slice(2, 10);
}
function genUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (arg26) => {
    const v4 = Math.random() * 16 | 0, v5 = arg26 === "x" ? v4 : v4 & 3 | 8;
    return v5.toString(16);
  });
}
async function getProjectsIndex() {
  try {
    return await idbGetAll(STORE_INDEX);
  } catch (err) {
    return [];
  }
}
async function registerProject(arg27, arg28, arg29) {
  await idbPut(STORE_INDEX, { "id": arg27, "name": arg28, "cover": arg29 || null, "updatedAt": Date.now() });
}
async function saveProjectData(arg30, arg31, arg32) {
  await idbPut(STORE_DATA, { "id": arg30, "name": arg31, "root": arg32 });
}
async function getProjectData(arg33) {
  try {
    return await idbGet(STORE_DATA, arg33);
  } catch (err2) {
    return null;
  }
}
async function removeProject(arg34) {
  await idbDelete(STORE_INDEX, arg34), await idbDelete(STORE_DATA, arg34);
}
function closeModal() {
  const modalOverlay = document.getElementById("modalOverlay");
  if (modalOverlay) modalOverlay.remove();
}
function showModal(arg36, arg37, arg38) {
  closeModal();
  const divEl = document.createElement("div");
  divEl.className = "overlay" + (arg38 ? " " + arg38 : ""), divEl.id = "modalOverlay", divEl.innerHTML = arg36, divEl.addEventListener("mousedown", (arg35) => {
    if (arg35.target === divEl) closeModal();
  }), document.body.appendChild(divEl);
  if (arg37) arg37(divEl);
}
function formatDate(arg39) {
  try {
    return new Date(arg39).toLocaleDateString("en-US", { "day": "2-digit", "month": "short", "year": "numeric" });
  } catch (err3) {
    return "";
  }
}
function scanProjectTags(arg41) {
  let v6 = false, v7 = false, v8 = false, v9 = false;
  function helper(arg40) {
    if (!arg40) return;
    if (arg40.type === "file") {
      const v10 = getExt(arg40.name);
      if (arg40.isModel || MODEL_EXTS.includes(v10)) v8 = true;
      else {
        if (["js", "mjs", "cjs", "ts", "tsx", "jsx"].includes(v10)) v6 = true;
        else v10 === "json" ? v7 = true : v9 = true;
      }
    }
    arg40.children && Array.isArray(arg40.children) && arg40.children.forEach(helper);
  }
  helper(arg41);
  const list = [];
  if (v6) list.push({ "label": "JS", "cls": "js" });
  if (v7) list.push({ "label": "JSON", "cls": "json" });
  if (v8) list.push({ "label": "Models", "cls": "model" });
  if (v9 || list.length === 0) list.push({ "label": "Other", "cls": "other" });
  return list;
}
function closeContextMenu() {
  activeContextMenu && (activeContextMenu.remove(), activeContextMenu = null);
}
document.addEventListener("click", () => closeContextMenu());
async function renderProjects() {
  const fn = (await getProjectsIndex()).sort((arg42, arg43) => arg43.updatedAt - arg42.updatedAt), projectsArea = document.getElementById("projectsArea"), projectsCount = document.getElementById("projectsCount");
  projectsCount.textContent = fn.length ? fn.length + (fn.length === 1 ? " project" : " projects") : "";
  if (!fn.length) {
    projectsArea.innerHTML = `<div class="empty-projects">Aún no tienes proyectos guardados. Crea uno nuevo o sube un addon para empezar.</div>`;
    return;
  }
  const divEl2 = document.createElement("div");
  divEl2.className = "projects-grid";
  for (const v11 of fn) {
    const divEl3 = document.createElement("div");
    divEl3.className = "project-card";
    const result = await getProjectData(v11.id);
    let list2 = [{ "label": "Other", "cls": "other" }];
    result && result.root && (list2 = scanProjectTags(result.root));
    const v12 = v11.cover ? '<div class="project-cover"><img src="' + v11.cover + '" alt="' + v11.name + '"></div>' : '<div class="project-cover fallback"><img src="img/logo.png" alt="' + v11.name + '"></div>', fn2 = list2.map((arg44) => '<span class="tag-bubble ' + arg44.cls + '">' + arg44.label + "</span>").join("");
    divEl3.innerHTML = "\n      " + v12 + '\n      <div class="project-info">\n        <div class="project-name" title="' + v11.name + '">' + v11.name + '</div>\n        <div class="project-date">' + formatDate(v11.updatedAt) + '</div>\n        <div class="project-tags">' + fn2 + '</div>\n      </div>\n      <button class="project-actions-btn" aria-label="Options">' + ICONS.dots + "</button>\n    ", divEl3.addEventListener("click", (arg45) => {
      if (arg45.target.closest(".project-actions-btn")) return;
      window.location.href = openTargetFor(v11.id, result);
    });
    const projectActionsBtnEl = divEl3.querySelector(".project-actions-btn");
    projectActionsBtnEl.addEventListener("click", (arg49) => {
      arg49.stopPropagation(), closeContextMenu();
      const divEl4 = document.createElement("div");
      divEl4.className = "context-menu", divEl4.innerHTML = '\n        <button class="context-menu-item" id="optRename">' + ICONS.edit + '<span>Rename</span></button>\n        <button class="context-menu-item" id="optDownload">' + ICONS.download + '<span>Download</span></button>\n        <button class="context-menu-item danger" id="optDelete">' + ICONS.trash + "<span>Delete</span></button>\n      ";
      const v13 = projectActionsBtnEl.getBoundingClientRect();
      divEl4.style.top = v13.bottom + 4 + "px", divEl4.style.left = Math.min(v13.left, window.innerWidth - 160) + "px", document.body.appendChild(divEl4), activeContextMenu = divEl4, divEl4.querySelector("#optRename").addEventListener("click", (arg46) => {
        arg46.stopPropagation(), closeContextMenu(), showRenameModal(v11);
      }), divEl4.querySelector("#optDownload").addEventListener("click", (arg47) => {
        arg47.stopPropagation(), closeContextMenu(), showDownloadModal(v11);
      }), divEl4.querySelector("#optDelete").addEventListener("click", (arg48) => {
        arg48.stopPropagation(), closeContextMenu(), showDeleteModal(v11);
      });
    }), divEl2.appendChild(divEl3);
  }
  projectsArea.innerHTML = "", projectsArea.appendChild(divEl2);
}
function showRenameModal(arg51) {
  showModal('\n    <div class="modal">\n      <h3>Renombrar proyecto</h3>\n      <p>Escribe un nuevo nombre para tu proyecto.</p>\n      <input type="text" id="renameInput" value="' + arg51.name + '">\n      <div class="modal-actions">\n        <button class="btn btn-ghost" id="renameCancel">Cancel</button>\n        <button class="btn btn-primary" id="renameConfirm">Save</button>\n      </div>\n    </div>\n  ', ((arg50) => {
    const renameInputEl = arg50.querySelector("#renameInput");
    renameInputEl.focus(), renameInputEl.select(), arg50.querySelector("#renameCancel").onclick = closeModal, arg50.querySelector("#renameConfirm").onclick = async () => {
      const v14 = renameInputEl.value.trim();
      if (v14) {
        await registerProject(arg51.id, v14, arg51.cover);
        const result2 = await getProjectData(arg51.id);
        result2 && await saveProjectData(arg51.id, v14, result2.root), await renderProjects(), closeModal();
      }
    };
  }));
}
function showDeleteModal(arg53) {
  const nm = String(arg53.name || "").trim(), safe = nm.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  showModal('<div class="modal"><div class="warn-icon">' + ICONS.warn + '</div><h3>Delete project?</h3><p>All files of this project will be deleted. This action cannot be undone.</p><p>Type the project name <b style="color:var(--text);user-select:all">' + safe + '</b> to confirm.</p><input type="text" id="delInput" placeholder="Project name" autocomplete="off"><div class="modal-actions"><button class="btn btn-ghost" id="delCancel">Cancel</button><button class="btn btn-danger" id="delConfirm" disabled>Delete</button></div></div>', ((el) => {
    const inp = el.querySelector("#delInput"), ok = el.querySelector("#delConfirm");
    inp.focus(); inp.addEventListener("input", () => { ok.disabled = inp.value.trim() !== nm; });
    el.querySelector("#delCancel").onclick = closeModal; ok.onclick = async () => {
      if (inp.value.trim() !== nm) return;
      await removeProject(arg53.id), await renderProjects(), closeModal();
    };
  }));
}
function zipAddFolder(arg55, arg56) {
  if (!arg56.children) return;
  arg56.children.forEach((arg54) => {
    if (arg54.type === "folder") {
      const v15 = arg55.folder(arg54.name);
      zipAddFolder(v15, arg54);
    } else {
      let v16 = arg54.content || "";
      if (typeof v16 === "string" && v16.startsWith("data:")) {
        const v17 = v16.split(",")[1] || "";
        arg55.file(arg54.name, v17, { "base64": true });
      } else arg55.file(arg54.name, v16);
    }
  });
}
async function showDownloadModal(arg60) {
  const result3 = await getProjectData(arg60.id);
  if (!result3 || !result3.root) {
    showErrorModal("Project data could not be found.");
    return;
  }
  const v18 = result3.root;
  let v19 = "mcaddon";
  showModal('\n    <div class="modal">\n      <h3>Descargar proyecto</h3>\n      <p>Elige el formato de exportación de tu addon de Minecraft.</p>\n      <div class="fmt-grid">\n        <div class="fmt-card active" data-fmt="mcaddon">\n          <div class="fmt-icon"><img src="img/icons/ic1.jpg" alt="MCAddon"></div>\n          <div class="fmt-info">\n            <div class="fmt-name">.mcaddon</div>\n            <div class="fmt-desc">Addon de Minecraft</div>\n          </div>\n        </div>\n        <div class="fmt-card" data-fmt="zip">\n          <div class="fmt-icon">' + ICONS.package + '</div>\n          <div class="fmt-info">\n            <div class="fmt-name">.zip</div>\n            <div class="fmt-desc">Archivo comprimido</div>\n          </div>\n        </div>\n        <div class="fmt-card" data-fmt="mcpack">\n          <div class="fmt-icon"><img src="img/icons/ic1.jpg" alt="MCPack"></div>\n          <div class="fmt-info">\n            <div class="fmt-name">.mcpack</div>\n            <div class="fmt-desc">Paquete de Minecraft</div>\n          </div>\n        </div>\n        <div class="fmt-card" data-fmt="mcworld">\n          <div class="fmt-icon"><img src="img/icons/ic1.jpg" alt="MCWorld"></div>\n          <div class="fmt-info">\n            <div class="fmt-name">.mcworld</div>\n            <div class="fmt-desc">Mundo de Minecraft</div>\n          </div>\n        </div>\n      </div>\n      <div class="modal-actions">\n        <button class="btn btn-ghost" id="dlCancel">Cancel</button>\n        <button class="btn btn-primary" id="dlConfirm">Download</button>\n      </div>\n    </div>\n  ', ((arg59) => {
    const v20 = arg59.querySelectorAll(".fmt-card");
    v20.forEach((arg58) => {
      arg58.addEventListener("click", () => {
        v20.forEach((arg57) => arg57.classList.remove("active")), arg58.classList.add("active"), v19 = arg58.getAttribute("data-fmt");
      });
    }), arg59.querySelector("#dlCancel").onclick = closeModal, arg59.querySelector("#dlConfirm").onclick = async () => {
      const dlConfirmEl = arg59.querySelector("#dlConfirm");
      dlConfirmEl.disabled = true, dlConfirmEl.textContent = "Generating...";
      try {
        const zip = new JSZip();
        zipAddFolder(zip, v18);
        const result4 = await zip.generateAsync({ "type": "blob" }), v21 = (arg60.name || "project").replace(/[^a-z0-9_-]/gi, "_") + "." + v19, v22 = document.createElement("a");
        v22.href = URL.createObjectURL(result4), v22.download = v21, v22.click(), URL.revokeObjectURL(v22.href), closeModal();
      } catch (err4) {
        dlConfirmEl.disabled = false, dlConfirmEl.textContent = "Download", showErrorModal("The download file could not be generated.");
      }
    };
  }));
}
(document.getElementById("versionCard") || document.createElement("i")).addEventListener("click", () => {
  showModal('\n    <div class="modal">\n      <div class="info-icon">' + ICONS.info + '</div>\n      <h3>Version</h3>\n      <p>FireDex v1.0.0<br>Editor de addons para Minecraft Bedrock.</p>\n      <div class="modal-actions">\n        <button class="btn btn-primary" id="versionClose">Close</button>\n      </div>\n    </div>\n  ', ((arg61) => {
    arg61.querySelector("#versionClose").onclick = closeModal;
  }));
}), (document.getElementById("guideCard") || document.createElement("i")).addEventListener("click", () => {
  showModal('\n    <div class="modal">\n      <div class="info-icon">' + ICONS.info + `</div>
      <h3>Guía rápida</h3>
      <p>Pasos básicos para empezar a trabajar con tus addons.</p>
      <ul class="guide-list">
        <li><b>Crear proyecto</b> \u2014 define behavior pack, resource pack and other data, then open the editor.</li>
        <li><b>Subir addon</b> \u2014 load an existing .mcaddon file to explore its contents.</li>
        <li>Puedes abrir y cerrar las carpetas del addon para revisar su estructura.</li>
        <li>Images are shown as thumbnails and 3D models with their own icon.</li>
      </ul>
      <div class="modal-actions">
        <button class="btn btn-primary" id="guideClose">Got it</button>
      </div>
    </div>
  `, ((arg62) => {
    arg62.querySelector("#guideClose").onclick = closeModal;
  }));
}), document.getElementById("uploadCard").addEventListener("click", () => {
  document.getElementById("addonInput").click();
});
function showProgressModal(arg63) {
  showModal('\n    <div class="modal">\n      <div class="info-icon">' + ICONS.package + '</div>\n      <h3>Procesando addon</h3>\n      <div class="progress-file" id="progressFileName">' + arg63 + '</div>\n      <div class="progress-track"><div class="progress-fill" id="progressFill"></div></div>\n      <div class="progress-meta">\n        <span id="progressStage">Leyendo archivo…</span>\n        <span id="progressPct">0%</span>\n      </div>\n    </div>\n  ');
}
function updateProgress(arg64, arg65) {
  const progressFill = document.getElementById("progressFill"), progressPct = document.getElementById("progressPct"), progressStage = document.getElementById("progressStage");
  if (!progressFill) return;
  const v23 = Math.max(0, Math.min(100, arg64));
  progressFill.style.width = v23 + "%", progressPct.textContent = Math.round(v23) + "%";
  if (arg65) progressStage.textContent = arg65;
}
function showErrorModal(arg67) {
  showModal('\n    <div class="modal">\n      <div class="warn-icon">' + ICONS.warn + '</div>\n      <h3>Error al cargar el addon</h3>\n      <p style="text-align:center;margin-top:8px;">' + arg67 + '</p>\n      <div class="modal-actions" style="justify-content:center;">\n        <button class="btn btn-primary" id="errorClose">Got it</button>\n      </div>\n    </div>\n  ', ((arg66) => {
    arg66.querySelector("#errorClose").onclick = closeModal;
  }));
}
function readFileWithProgress(arg71, arg72) {
  return new Promise((arg69, arg70) => {
    const v24 = new FileReader();
    v24.onprogress = (arg68) => {
      if (arg68.lengthComputable) arg72(arg68.loaded / arg68.total);
    }, v24.onload = () => arg69(v24.result), v24.onerror = () => arg70(v24.error), v24.readAsArrayBuffer(arg71);
  });
}
function ensureFolderChain(arg74, arg75, arg76) {
  let v25 = arg74, v26 = "";
  return arg76.forEach((arg73) => {
    if (!arg73) return;
    const v27 = v26 ? v26 + "/" + arg73 : arg73;
    if (!arg75[v27]) {
      const obj = { "id": genId(), "type": "folder", "name": arg73, "open": false, "children": [] };
      v25.children.push(obj), arg75[v27] = obj;
    }
    v25 = arg75[v27], v26 = v27;
  }), v25;
}
function findManifestName(arg77) {
  if (arg77.type === "file" && arg77.name.toLowerCase() === "manifest.json" && arg77.content) try {
    const data = JSON.parse(arg77.content);
    if (data.header && data.header.name) return data.header.name;
  } catch (err5) {
  }
  if (arg77.children) for (const v28 of arg77.children) {
    const v29 = findManifestName(v28);
    if (v29) return v29;
  }
  return null;
}
function findCoverImage(arg78) {
  if (arg78.type === "file" && /^pack_icon\./i.test(arg78.name) && arg78.content) return arg78.content;
  if (arg78.children) for (const v30 of arg78.children) {
    const v31 = findCoverImage(v30);
    if (v31) return v31;
  }
  return null;
}
async function processAddon(arg82) {
  showProgressModal(arg82.name);
  try {
    updateProgress(3, "Reading file...");
    const result5 = await readFileWithProgress(arg82, ((arg79) => {
      updateProgress(3 + arg79 * 37, "Reading file...");
    }));
    updateProgress(42, "Analyzing addon...");
    const result6 = await JSZip.loadAsync(result5);
    updateProgress(52, "Extracting content...");
    const obj2 = { "id": "root", "type": "folder", "name": "root", "open": true, "children": [] }, obj3 = { "": obj2 }, v32 = Object.keys(result6.files), v33 = v32.length || 1;
    let v34 = 0;
    for (const v35 of v32) {
      const v36 = result6.files[v35], v37 = v35.replace(/\/$/, "").split("/").filter(Boolean);
      if (v36.dir) ensureFolderChain(obj2, obj3, v37);
      else {
        const v38 = v37.pop(), v39 = ensureFolderChain(obj2, obj3, v37), v40 = getExt(v38);
        let v41 = "";
        if (IMAGE_EXTS.includes(v40)) try {
          const result7 = await v36.async("base64"), v42 = v40 === "svg" ? "svg+xml" : v40;
          v41 = "data:image/" + v42 + ";base64," + result7;
        } catch (err6) {
          v41 = "";
        }
        else {
          if (TEXT_EXTS.includes(v40)) try {
            v41 = await v36.async("string");
          } catch (err7) {
            v41 = "";
          }
        }
        v39.children.push({ "id": genId(), "type": "file", "name": v38, "content": v41, "isModel": isModelFile(v35, v38) });
      }
      v34 += 1, updateProgress(52 + v34 / v33 * 46, "Processing " + v35);
    }
    obj2.children.forEach((arg80) => {
      if (arg80.type === "folder") arg80.open = true;
    }), updateProgress(100, "Completed"), await new Promise((arg81) => setTimeout(arg81, 350));
    const v43 = findManifestName(obj2), v44 = findCoverImage(obj2), v45 = v43 || arg82.name.replace(/\.[^.]+$/, "");
    showResultModal(v45, obj2, v44);
  } catch (err8) {
    showErrorModal("Make sure it is a valid addon (.mcaddon) and try again.");
  }
}
function countAll(arg84) {
  let v46 = 0, v47 = 0;
  return arg84.children.forEach((arg83) => {
    if (arg83.type === "folder") {
      v46 += 1;
      const v48 = countAll(arg83);
      v46 += v48.folders, v47 += v48.files;
    } else v47 += 1;
  }), { "folders": v46, "files": v47 };
}
function fileBadgeHtml(arg85) {
  if (arg85.isModel) return '<div class="file-badge" style="background:var(--model);color:#fff">' + ICONS.cube + "</div>";
  const v49 = getExt(arg85.name);
  if (IMAGE_EXTS.includes(v49)) {
    if (arg85.content) return '<img class="thumb" src="' + arg85.content + '" alt="' + arg85.name + '">';
    return '<div class="file-badge" style="background:#a855f7;color:#fff">' + ICONS.image + "</div>";
  }
  if (FILE_TYPES[v49]) {
    const v50 = FILE_TYPES[v49];
    return '<div class="file-badge" style="background:' + v50.bg + ";color:" + v50.color + '">' + v50.label + "</div>";
  }
  return '<div class="rnode-icon">' + ICONS.file + "</div>";
}
function renderResultNode(arg87, arg88) {
  const divEl5 = document.createElement("div");
  divEl5.className = "rnode" + (arg87.type === "folder" && arg87.open ? " open" : "");
  const divEl6 = document.createElement("div");
  divEl6.className = "rnode-row", divEl6.style.paddingLeft = 9 + arg88 * 14 + "px";
  const divEl7 = document.createElement("div");
  divEl7.className = "rchevron" + (arg87.type === "file" ? " hidden" : ""), divEl7.innerHTML = ICONS.chevron, divEl6.appendChild(divEl7);
  let v51 = null;
  arg87.type === "folder" ? (v51 = document.createElement("div"), v51.className = "rnode-icon", v51.innerHTML = arg87.open ? ICONS.folderOpen : ICONS.folderClosed, divEl6.appendChild(v51)) : divEl6.insertAdjacentHTML("beforeend", fileBadgeHtml(arg87));
  const divEl8 = document.createElement("div");
  divEl8.className = "rnode-name", divEl8.textContent = arg87.name, divEl6.appendChild(divEl8);
  if (arg87.type === "folder") {
    const divEl9 = document.createElement("div");
    divEl9.className = "rnode-count", divEl9.textContent = arg87.children.length, divEl6.appendChild(divEl9), divEl6.addEventListener("click", () => {
      arg87.open = !arg87.open, divEl5.classList.toggle("open", arg87.open), v51.innerHTML = arg87.open ? ICONS.folderOpen : ICONS.folderClosed;
    });
  }
  divEl5.appendChild(divEl6);
  if (arg87.type === "folder") {
    const divEl10 = document.createElement("div");
    divEl10.className = "rchildren-wrap";
    const divEl11 = document.createElement("div");
    divEl11.className = "rchildren-inner";
    const divEl12 = document.createElement("div");
    divEl12.className = "rchildren", arg87.children.forEach((arg86) => divEl12.appendChild(renderResultNode(arg86, arg88 + 1))), divEl11.appendChild(divEl12), divEl10.appendChild(divEl11), divEl5.appendChild(divEl10);
  }
  return divEl5;
}
function showResultModal(arg91, arg92, arg93) {
  const v52 = countAll(arg92);
  showModal('\n    <div class="modal modal-wide">\n      <div class="result-header">\n        <div class="icon-circle">' + ICONS.package + '</div>\n        <div style="min-width:0">\n          <div class="result-title">' + arg91 + '</div>\n        </div>\n      </div>\n      <div class="result-sub">' + v52.folders + " folders \xB7 " + v52.files + ' files</div>\n      <div class="result-tree" id="resultTree"></div>\n      <div class="modal-actions">\n        <button class="btn btn-ghost" id="resultClose">Close</button>\n        <button class="btn btn-primary" id="resultCreate">' + ICONS.plus + " Create Project</button>\n      </div>\n    </div>\n  ", ((arg90) => {
    const resultTreeEl = arg90.querySelector("#resultTree");
    arg92.children.forEach((arg89) => resultTreeEl.appendChild(renderResultNode(arg89, 0))), arg90.querySelector("#resultClose").onclick = closeModal, arg90.querySelector("#resultCreate").onclick = async () => {
      const v53 = genId(), obj4 = { "id": "root", "type": "folder", "name": "root", "open": true, "children": arg92.children };
      await saveProjectData(v53, arg91, obj4), await registerProject(v53, arg91, arg93), window.location.href = "/edit/?id=" + v53;
    };
  }));
}
document.getElementById("addonInput").addEventListener("change", (arg94) => {
  const v54 = arg94.target.files[0];
  if (v54) processAddon(v54);
  arg94.target.value = "";
});
const PACK_DEFS = [{ "key": "behavior", "title": "Behavior Pack", "icon": ICONS.wrench, "desc": "Create new gameplay mechanics and change Minecraft's behavior.", "full": true, "dep": { "key": "bpDependsRp", "label": "Register the behavior pack as a dependency of the resource pack" } }, { "key": "resource", "title": "Resource Pack", "icon": ICONS.image, "desc": "Used to change the look and sound of Minecraft.", "full": false, "dep": { "key": "rpDependsBp", "label": "Register the resource pack as a dependency of the behavior pack" } }, { "key": "skin", "title": "Skin Pack", "icon": ICONS.person, "desc": "Offers new appearances a player can choose for their character.", "full": false }, { "key": "world", "title": "World Template", "icon": ICONS.globe, "desc": "Create a world that users can use to experience your project.", "full": true }], EXPERIMENTAL_DEFS = [{ "key": "upcomingCreator", "title": "Upcoming Creator Features", "icon": ICONS.clock, "desc": "Enables autocompletion for upcoming experimental creator features." }, { "key": "experimentalCamera", "title": "Experimental Creator Camera Features", "icon": ICONS.camera, "desc": "Enables autocompletion for experimental camera features." }, { "key": "betaApis", "title": "Beta APIs", "icon": ICONS.brackets, "desc": "Enables beta-phase script modules and allows creating scripts with autocompletion." }, { "key": "renderDragon", "title": "Render Dragon Features for Creators", "icon": ICONS.dragon, "desc": "Enables creation of deferred rendering configuration files." }, { "key": "educationEdition", "title": "Enable Education Edition", "icon": ICONS.gradCap, "desc": "Enables autocompletion for education features such as material reducer recipes." }], INDIVIDUAL_FILES_DEFS = [{ "key": "tick", "name": "tick.json", "pack": "Behavior Pack", "target": "bp", "folder": "", "desc": "Defines which functions run on each tick.", "content": { "values": [] } }, { "key": "player", "name": "player.json", "pack": "Behavior Pack", "target": "bp", "folder": "entities", "desc": "Edits the default player behavior.", "content": { "format_version": "1.20.0", "minecraft:entity": { "description": { "identifier": "minecraft:player" }, "components": {} } } }, { "key": "blocks", "name": "blocks.json", "pack": "Resource Pack", "target": "rp", "folder": "", "desc": "Defines how block faces are combined.", "content": {} }, { "key": "itemTexture", "name": "item_texture.json", "pack": "Resource Pack", "target": "rp", "folder": "textures", "desc": "Assigns textures to items.", "content": { "resource_pack_name": "pack", "texture_name": "atlas.items", "texture_data": {} } }, { "key": "terrainTexture", "name": "terrain_texture.json", "pack": "Resource Pack", "target": "rp", "folder": "textures", "desc": "Assigns textures to block faces.", "content": { "resource_pack_name": "pack", "texture_name": "atlas.terrain", "padding": 8, "num_mip_levels": 4, "texture_data": {} } }, { "key": "flipbook", "name": "flipbook_textures.json", "pack": "Resource Pack", "target": "rp", "folder": "textures", "desc": "Used to animate block textures.", "content": [] }, { "key": "biomes", "name": "biomes_client.json", "pack": "Resource Pack", "target": "rp", "folder": "", "desc": "Defines how each biome's effects are rendered.", "content": { "biomes": {} } }, { "key": "sounds", "name": "sounds.json", "pack": "Resource Pack", "target": "rp", "folder": "", "desc": "Defines sounds for specific game functions.", "content": { "individual_event_sounds": { "events": {} } } }, { "key": "soundDefs", "name": "sound_definitions.json", "pack": "Resource Pack", "target": "rp", "folder": "sounds", "desc": "Registers sound ids for use in the project.", "content": { "format_version": "1.14.0", "sound_definitions": {} } }, { "key": "splashes", "name": "splashes.json", "pack": "Resource Pack", "target": "rp", "folder": "texts", "desc": "Defines the splash messages on the title screen.", "content": { "splashes": ["Made with FireDex!"] } }];
document.getElementById("createBtn").addEventListener("click", () => openWizard());
function openWizard() {
  const obj5 = { "packs": { "behavior": true, "resource": true, "skin": false, "world": false }, "deps": { "bpDependsRp": false, "rpDependsBp": false }, "experimental": {}, "files": {}, "name": "New Project", "description": "", "prefix": "", "author": "FireDex", "targetVersion": MC_VERSIONS[MC_VERSIONS.length - 1], "cover": null, "manifestFlag": false, "dedicatedFlag": false, "expOpen": false, "filesOpen": false };
  showModal('\n    <div class="modal">\n      <div class="wizard-header">\n        <h3>Crear proyecto</h3>\n        <button class="wizard-close" id="wizClose">' + ICONS.close + '</button>\n      </div>\n      <div class="wizard-scroll" id="wizScroll"></div>\n      <div class="wizard-footer">\n        <button class="btn btn-ghost" id="wizCancel">Cancel</button>\n        <button class="btn btn-primary" id="wizCreate">' + ICONS.plus + " Create</button>\n      </div>\n    </div>\n  ", ((arg95) => {
    renderWizardBody(arg95, obj5), arg95.querySelector("#wizClose").onclick = closeModal, arg95.querySelector("#wizCancel").onclick = closeModal, arg95.querySelector("#wizCreate").onclick = () => submitWizard(obj5);
  }), "wizard-overlay");
}
function statusToggleHtml(arg96) {
  return arg96 ? '<span class="status-toggle on">' + ICONS.checkCircle + "Active</span>" : '<span class="status-toggle">' + ICONS.circleEmpty + "Inactive</span>";
}
function packCardHtml(arg97, arg98) {
  const v55 = arg98.packs[arg97.key], v56 = "pack-card" + (arg97.full ? "" : " half") + (v55 ? " active" : "");
  let v57 = "";
  if (arg97.dep && v55) {
    const v58 = arg98.deps[arg97.dep.key];
    v57 = '\n      <div class="dep-row">\n        <div class="pill-switch' + (v58 ? " on" : "") + '" data-dep="' + arg97.dep.key + '"></div>\n        <span>' + arg97.dep.label + "</span>\n      </div>\n    ";
  }
  return '\n    <div class="' + v56 + '" data-pack="' + arg97.key + '">\n      <div class="pack-card-top">\n        <div class="icon-circle">' + arg97.icon + '</div>\n        <div>\n          <div class="pack-card-title">' + arg97.title + "</div>\n          " + statusToggleHtml(v55) + '\n        </div>\n      </div>\n      <p class="pack-desc">' + arg97.desc + "</p>\n      " + v57 + "\n    </div>\n  ";
}
function miniCardHtml(arg99, arg100, arg101, arg102) {
  return '\n    <div class="mini-card' + (arg100 ? " active" : "") + '" data-' + arg101 + '="' + arg99.key + '">\n      <div class="mini-card-top">\n        <div class="icon-circle">' + (arg99.icon || ICONS.file) + '</div>\n        <div>\n          <div class="mini-card-title">' + (arg99.title || arg99.name) + "</div>\n          " + (arg102 ? '<div class="mini-card-tag">' + arg102 + "</div>" : "") + '\n        </div>\n      </div>\n      <div class="mini-status' + (arg100 ? " on" : "") + '">' + (arg100 ? ICONS.checkCircle : ICONS.circleEmpty) + (arg100 ? "Active" : "Inactive") + '</div>\n      <p class="mini-desc">' + arg99.desc + "</p>\n    </div>\n  ";
}
function renderWizardBody(arg107, arg108) {
  const wizScrollEl = arg107.querySelector("#wizScroll"), v59 = wizScrollEl.scrollTop, fn3 = PACK_DEFS.map((arg103) => packCardHtml(arg103, arg108)).join(""), fn4 = EXPERIMENTAL_DEFS.map((arg104) => miniCardHtml(arg104, !!arg108.experimental[arg104.key], "exp")).join(""), fn5 = INDIVIDUAL_FILES_DEFS.map((arg105) => miniCardHtml(arg105, !!arg108.files[arg105.key], "file", arg105.pack)).join(""), v60 = arg108.cover ? '<img src="' + arg108.cover + '" alt="cover">' : ICONS.image;
  wizScrollEl.innerHTML = '\n    <div class="section-title">Pack type</div>\n    <div class="pack-grid">' + fn3 + '</div>\n\n    <div class="section-title">Ajustes experimentales</div>\n    <div class="collapse-box' + (arg108.expOpen ? " open" : "") + '" id="expBox">\n      <div class="collapse-head" id="expHead">Experimental Gameplay ' + ICONS.chevronDown + '</div>\n      <div class="collapse-body-wrap"><div class="collapse-body-inner"><div class="collapse-body">' + fn4 + '</div></div></div>\n    </div>\n\n    <div class="section-title">Archivos individuales</div>\n    <div class="collapse-box' + (arg108.filesOpen ? " open" : "") + '" id="filesBox">\n      <div class="collapse-head" id="filesHead">Individual Files ' + ICONS.chevronDown + '</div>\n      <div class="collapse-body-wrap"><div class="collapse-body-inner"><div class="collapse-body">' + fn5 + '</div></div></div>\n    </div>\n\n    <div class="section-title">Detalles del proyecto</div>\n    <div class="cover-row">\n      <div class="cover-picker" id="coverPicker">' + v60 + '</div>\n      <div class="form-col">\n        <label>Nombre del proyecto</label>\n        <input type="text" id="wizName" value="' + arg108.name + '">\n      </div>\n    </div>\n\n    <div class="form-row">\n      <div class="form-col">\n        <label>Project Description (optional)</label>\n        <textarea id="wizDesc">' + arg108.description + '</textarea>\n      </div>\n    </div>\n\n    <div class="form-row">\n      <div class="form-col">\n        <label>Prefijo del proyecto</label>\n        <input type="text" id="wizPrefix" value="' + arg108.prefix + '" placeholder="prefix">\n      </div>\n      <div class="form-col">\n        <label>Autor del proyecto</label>\n        <input type="text" id="wizAuthor" value="' + arg108.author + '">\n      </div>\n      <div class="form-col">\n        <label>Destino del proyecto</label>\n        <select id="wizVersion">\n          ' + MC_VERSIONS.map((arg106) => '<option value="' + arg106 + '"' + (arg106 === arg108.targetVersion ? " selected" : "") + ">" + arg106 + "</option>").join("") + '\n        </select>\n      </div>\n    </div>\n\n    <div class="toggle-line">\n      <span>Add pack name/description directly to the manifest</span>\n      <div class="pill-switch' + (arg108.manifestFlag ? " on" : "") + '" id="manifestToggle"></div>\n    </div>\n    <div class="toggle-line">\n      <span>Proyecto para servidores dedicados de Bedrock</span>\n      <div class="pill-switch' + (arg108.dedicatedFlag ? " on" : "") + '" id="dedicatedToggle"></div>\n    </div>\n  ', wizScrollEl.scrollTop = v59, wireWizardEvents(arg107, arg108);
}
function wireWizardEvents(arg120, arg121) {
  arg120.querySelectorAll("[data-pack]").forEach((arg110) => {
    arg110.addEventListener("click", (arg109) => {
      if (arg109.target.closest("[data-dep]")) return;
      const v61 = arg110.getAttribute("data-pack");
      arg121.packs[v61] = !arg121.packs[v61], renderWizardBody(arg120, arg121);
    });
  }), arg120.querySelectorAll("[data-dep]").forEach((arg112) => {
    arg112.addEventListener("click", (arg111) => {
      arg111.stopPropagation();
      const v62 = arg112.getAttribute("data-dep");
      arg121.deps[v62] = !arg121.deps[v62], renderWizardBody(arg120, arg121);
    });
  }), arg120.querySelectorAll("[data-exp]").forEach((arg113) => {
    arg113.addEventListener("click", () => {
      const v63 = arg113.getAttribute("data-exp");
      arg121.experimental[v63] = !arg121.experimental[v63], renderWizardBody(arg120, arg121);
    });
  }), arg120.querySelectorAll("[data-file]").forEach((arg114) => {
    arg114.addEventListener("click", () => {
      const v64 = arg114.getAttribute("data-file");
      arg121.files[v64] = !arg121.files[v64], renderWizardBody(arg120, arg121);
    });
  }), arg120.querySelector("#expHead").addEventListener("click", () => {
    arg121.expOpen = !arg121.expOpen, renderWizardBody(arg120, arg121);
  }), arg120.querySelector("#filesHead").addEventListener("click", () => {
    arg121.filesOpen = !arg121.filesOpen, renderWizardBody(arg120, arg121);
  }), arg120.querySelector("#coverPicker").addEventListener("click", () => {
    const coverInput = document.getElementById("coverInput");
    coverInput.onchange = () => {
      const v65 = coverInput.files[0];
      if (v65) {
        const v66 = new FileReader();
        v66.onload = () => {
          arg121.cover = v66.result, renderWizardBody(arg120, arg121);
        }, v66.readAsDataURL(v65);
      }
      coverInput.value = "";
    }, coverInput.click();
  }), arg120.querySelector("#wizName").addEventListener("input", (arg115) => {
    arg121.name = arg115.target.value;
  }), arg120.querySelector("#wizDesc").addEventListener("input", (arg116) => {
    arg121.description = arg116.target.value;
  }), arg120.querySelector("#wizPrefix").addEventListener("input", (arg117) => {
    arg121.prefix = arg117.target.value;
  }), arg120.querySelector("#wizAuthor").addEventListener("input", (arg118) => {
    arg121.author = arg118.target.value;
  }), arg120.querySelector("#wizVersion").addEventListener("change", (arg119) => {
    arg121.targetVersion = arg119.target.value;
  }), arg120.querySelector("#manifestToggle").addEventListener("click", () => {
    arg121.manifestFlag = !arg121.manifestFlag, renderWizardBody(arg120, arg121);
  }), arg120.querySelector("#dedicatedToggle").addEventListener("click", () => {
    arg121.dedicatedFlag = !arg121.dedicatedFlag, renderWizardBody(arg120, arg121);
  });
}
function addFolderNode(arg122, arg123) {
  const obj6 = { "id": genId(), "type": "folder", "name": arg123, "open": true, "children": [] };
  return arg122.children.push(obj6), obj6;
}
function addFileNode(arg124, arg125, arg126) {
  arg124.children.push({ "id": genId(), "type": "file", "name": arg125, "content": arg126 || "" });
}
function getOrCreateSubfolder(arg129, arg130) {
  if (!arg130) return arg129;
  const v67 = arg130.split("/").filter(Boolean);
  let v68 = arg129;
  return v67.forEach((arg128) => {
    let fn6 = v68.children.find((arg127) => arg127.type === "folder" && arg127.name === arg128);
    !fn6 && (fn6 = addFolderNode(v68, arg128)), v68 = fn6;
  }), v68;
}
function buildProjectFromWizard(arg133) {
  const obj7 = { "id": "root", "type": "folder", "name": "root", "open": true, "children": [] }, fn7 = arg133.targetVersion.split(".").map((arg131) => parseInt(arg131, 10)), v69 = genUUID(), v70 = genUUID(), v71 = genUUID(), v72 = genUUID(), v73 = arg133.name.trim() || "New Project";
  let v74 = null, v75 = null;
  if (arg133.packs.behavior) {
    v74 = addFolderNode(obj7, "BP");
    const obj8 = { "format_version": 2, "header": { "name": arg133.manifestFlag ? v73 : "pack.name", "description": arg133.manifestFlag ? arg133.description : "pack.description", "uuid": v69, "version": [1, 0, 0], "min_engine_version": fn7 }, "modules": [{ "type": "data", "uuid": genUUID(), "version": [1, 0, 0] }] };
    if (arg133.deps.bpDependsRp && arg133.packs.resource) obj8.dependencies = [{ "uuid": v70, "version": [1, 0, 0] }];
    addFileNode(v74, "manifest.json", JSON.stringify(obj8, null, 2));
    if (arg133.cover) addFileNode(v74, "pack_icon.png", arg133.cover);
    addFolderNode(v74, "scripts");
  }
  if (arg133.packs.resource) {
    v75 = addFolderNode(obj7, "RP");
    const obj9 = { "format_version": 2, "header": { "name": arg133.manifestFlag ? v73 : "pack.name", "description": arg133.manifestFlag ? arg133.description : "pack.description", "uuid": v70, "version": [1, 0, 0], "min_engine_version": fn7 }, "modules": [{ "type": "resources", "uuid": genUUID(), "version": [1, 0, 0] }] };
    if (arg133.deps.rpDependsBp && arg133.packs.behavior) obj9.dependencies = [{ "uuid": v69, "version": [1, 0, 0] }];
    addFileNode(v75, "manifest.json", JSON.stringify(obj9, null, 2));
    if (arg133.cover) addFileNode(v75, "pack_icon.png", arg133.cover);
    addFolderNode(v75, "textures");
  }
  if (arg133.packs.skin) {
    const v76 = addFolderNode(obj7, "SP"), obj10 = { "format_version": 2, "header": { "name": arg133.manifestFlag ? v73 : "pack.name", "description": arg133.manifestFlag ? arg133.description : "pack.description", "uuid": v71, "version": [1, 0, 0] }, "modules": [{ "type": "skin_pack", "uuid": genUUID(), "version": [1, 0, 0] }] };
    addFileNode(v76, "manifest.json", JSON.stringify(obj10, null, 2)), addFileNode(v76, "skins.json", JSON.stringify({ "serialize_name": arg133.prefix || "skins", "geometry": "geometry.humanoid.custom", "skins": [] }, null, 2));
    if (arg133.cover) addFileNode(v76, "pack_icon.png", arg133.cover);
  }
  if (arg133.packs.world) {
    const v77 = addFolderNode(obj7, "World"), obj11 = { "format_version": 2, "header": { "name": arg133.manifestFlag ? v73 : "pack.name", "description": arg133.manifestFlag ? arg133.description : "pack.description", "uuid": v72, "version": [1, 0, 0] }, "modules": [{ "type": "world_template", "uuid": genUUID(), "version": [1, 0, 0] }] };
    addFileNode(v77, "manifest.json", JSON.stringify(obj11, null, 2));
    if (arg133.cover) addFileNode(v77, "world_icon.png", arg133.cover);
  }
  return INDIVIDUAL_FILES_DEFS.forEach((arg132) => {
    if (!arg133.files[arg132.key]) return;
    const v78 = arg132.target === "bp" ? v74 : v75;
    if (!v78) return;
    const v79 = getOrCreateSubfolder(v78, arg132.folder);
    addFileNode(v79, arg132.name, JSON.stringify(arg132.content, null, 2));
  }), addFileNode(obj7, "README.md", "# " + v73 + "\n\nAuthor: " + (arg133.author || "FireDex") + "\nTarget version: " + arg133.targetVersion + "\n" + (arg133.dedicatedFlag ? "Configured for Bedrock Dedicated Servers.\n" : "") + "\nProject generated with FireDex.\n"), obj7;
}
async function submitWizard(arg134) {
  arg134.name = (arg134.name || "").trim() || "New Project";
  const v80 = buildProjectFromWizard(arg134), v81 = genId();
  await saveProjectData(v81, arg134.name, v80), await registerProject(v81, arg134.name, arg134.cover), window.location.href = "/edit/?id=" + v81;
}
const canvas = document.getElementById("particles"), ctx = canvas.getContext("2d");
let particles = [];
function resizeCanvas() {
  canvas.width = window.innerWidth, canvas.height = window.innerHeight;
}
function initParticles() {
  const v82 = Math.min(70, Math.floor(window.innerWidth * window.innerHeight / 24e3));
  particles = [];
  for (let v83 = 0; v83 < v82; v83++) {
    particles.push({ "x": Math.random() * canvas.width, "y": Math.random() * canvas.height, "r": Math.random() * 1.5 + 0.6, "vx": (Math.random() - 0.5) * 0.12, "vy": (Math.random() - 0.5) * 0.12, "o": Math.random() * 0.3 + 0.06 });
  }
}
function tickParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height), particles.forEach((arg135) => {
    const v84 = "4|7|9|1|3|8|6|5|2|0".split("|");
    let v85 = 0;
    while (true) {
      switch (v84[v85++]) {
        case "0":
          ctx.fill();
          continue;
        case "1":
          if (arg135.x > canvas.width) arg135.x = 0;
          continue;
        case "2":
          ctx.fillStyle = "rgba(133,119,248," + arg135.o + ")";
          continue;
        case "3":
          if (arg135.y < 0) arg135.y = canvas.height;
          continue;
        case "4":
          arg135.x += arg135.vx;
          continue;
        case "5":
          ctx.arc(arg135.x, arg135.y, arg135.r, 0, Math.PI * 2);
          continue;
        case "6":
          ctx.beginPath();
          continue;
        case "7":
          arg135.y += arg135.vy;
          continue;
        case "8":
          if (arg135.y > canvas.height) arg135.y = 0;
          continue;
        case "9":
          if (arg135.x < 0) arg135.x = canvas.width;
          continue;
      }
      break;
    }
  }), requestAnimationFrame(tickParticles);
}
window.addEventListener("resize", () => {
  resizeCanvas(), initParticles();
}), resizeCanvas(), initParticles(), tickParticles(), renderProjects();


/* ================= FireDex · Modelos independientes (sin addon) ================= */
function fdUid() { return 'n' + Math.random().toString(36).slice(2, 10); }
function fdFirstGeo(n) { for (const c of (n.children || [])) { if (c.type === 'folder') { const r = fdFirstGeo(c); if (r) return r; } else if (/\.geo\.json$/i.test(c.name)) return c; } return null; }
function openTargetFor(id, data) {
  if (data && data.root && data.root.kind === 'model') { const g = fdFirstGeo(data.root); if (g) return '/model/?id=' + encodeURIComponent(id) + '&file=' + encodeURIComponent(g.id); }
  return '/edit/?id=' + id;
}
function fdSlug(n) { return (n || 'modelo').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || 'modelo'; }
function fdModelFiles(slug, name) {
  const geo = { format_version: '1.12.0', 'minecraft:geometry': [{ description: { identifier: 'geometry.' + slug, texture_width: 64, texture_height: 64, visible_bounds_width: 2, visible_bounds_height: 3, visible_bounds_offset: [0, 1.5, 0] }, bones: [{ name: 'root', pivot: [0, 0, 0] }, { name: 'body', parent: 'root', pivot: [0, 12, 0], cubes: [{ origin: [-4, 12, -2], size: [8, 12, 4], uv: [16, 16] }] }] }] };
  const anim = { format_version: '1.8.0', animations: { ['animation.' + slug + '.idle']: { loop: true, animation_length: 2, bones: { body: { position: { '0.0': [0, 0, 0], '1.0': [0, 1, 0], '2.0': [0, 0, 0] } } } } } };
  return { geo: JSON.stringify(geo, null, 2), anim: JSON.stringify(anim, null, 2) };
}
async function createModelProject(name) {
  name = (name || '').trim() || 'Mi modelo'; const slug = fdSlug(name), f = fdModelFiles(slug, name), id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const geoNode = { id: fdUid(), type: 'file', name: slug + '.geo.json', content: f.geo };
  const root = { id: 'root', type: 'folder', name: 'root', kind: 'model', open: true, children: [
    { id: fdUid(), type: 'folder', name: 'models', open: true, children: [{ id: fdUid(), type: 'folder', name: 'entity', open: true, children: [geoNode] }] },
    { id: fdUid(), type: 'folder', name: 'animations', open: true, children: [{ id: fdUid(), type: 'file', name: slug + '.animation.json', content: f.anim }] },
    { id: fdUid(), type: 'folder', name: 'textures', open: true, children: [{ id: fdUid(), type: 'folder', name: 'entity', open: true, children: [] }] }
  ] };
  await saveProjectData(id, name, root); await registerProject(id, name, null);
  window.location.href = '/model/?id=' + encodeURIComponent(id) + '&file=' + encodeURIComponent(geoNode.id);
}
(function () {
  const b = document.getElementById('newModelBtn'); if (!b) return;
  b.addEventListener('click', () => {
    showModal('<div class="modal"><h3>Nuevo modelo</h3><p>Crea un modelo 3D independiente, sin necesidad de un addon. Más adelante podrás integrarlo en cualquier proyecto.</p><input id="nmName" class="px-input" value="Mi modelo" maxlength="40" style="width:100%;margin:8px 0"><div class="modal-actions"><button class="btn" id="nmCancel">Cancelar</button><button class="btn btn-primary" id="nmOk">Crear y abrir</button></div></div>', (el) => {
      const i = el.querySelector('#nmName'); i.focus(); i.select(); el.querySelector('#nmCancel').onclick = closeModal; el.querySelector('#nmOk').onclick = () => createModelProject(i.value);
      i.addEventListener('keydown', (e) => { if (e.key === 'Enter') createModelProject(i.value); });
    });
  });
})();

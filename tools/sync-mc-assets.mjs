#!/usr/bin/env node
/* Arma el repositorio de assets de Minecraft de FireDex en /mc/.
 *
 *   node tools/sync-mc-assets.mjs                      → clona (sparse) Mojang/bedrock-samples con git
 *   node tools/sync-mc-assets.mjs --dir  RUTA          → carpeta ya descargada (bedrock-samples o su resource_pack)
 *   node tools/sync-mc-assets.mjs --zip  archivo.zip   → ZIP de GitHub ("Download ZIP") de bedrock-samples
 *   opciones: --out mc   (carpeta de salida, por defecto /mc junto a package.json)
 *
 * Copia solo lo que usa el creador de estructuras (bloques, items, cofres) y genera mc/manifest.json
 * con las texturas de cada cara de cada bloque. Los assets son de Mojang/Microsoft: respeta su licencia
 * (https://github.com/Mojang/bedrock-samples/blob/main/LICENSE).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const R = require(path.join(root, "js/mcresolve.js"));

const args = process.argv.slice(2);
const opt = (k) => {
  const i = args.indexOf("--" + k);
  return i >= 0 ? args[i + 1] : null;
};
const OUT = path.resolve(root, opt("out") || "mc");

// carpetas que se copian tal cual (relativas a resource_pack/)
const COPY_DIRS = ["textures/blocks", "textures/items", "textures/entity/chest"];
const COPY_FILES = ["blocks.json", "textures/terrain_texture.json", "textures/item_texture.json"];
const REPO = "https://github.com/Mojang/bedrock-samples.git";

function findPack(dir) {
  const c = [dir, path.join(dir, "resource_pack")];
  for (const p of c) if (fs.existsSync(path.join(p, "blocks.json")) && fs.existsSync(path.join(p, "textures"))) return p;
  // ZIP de GitHub: bedrock-samples-main/resource_pack
  for (const d of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
    const p = path.join(dir, d, "resource_pack");
    if (fs.existsSync(path.join(p, "blocks.json"))) return p;
  }
  return null;
}

async function fromZip(zipPath) {
  const JSZip = require(path.join(root, "js/vendor/jszip.min.js"));
  const zip = await JSZip.loadAsync(fs.readFileSync(zipPath));
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fd-mc-"));
  const want = (n) => /\/resource_pack\//.test(n) && (COPY_FILES.some((f) => n.endsWith("/resource_pack/" + f)) || COPY_DIRS.some((d) => n.includes("/resource_pack/" + d + "/")));
  let n = 0;
  for (const name of Object.keys(zip.files)) {
    const f = zip.files[name];
    if (f.dir || !want(name)) continue;
    const dest = path.join(tmp, name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, await f.async("nodebuffer"));
    n++;
  }
  console.log("ZIP leído:", n, "archivos útiles");
  return tmp;
}

function fromGit() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fd-mc-"));
  const git = (...a) => execFileSync("git", a, { cwd: tmp, stdio: "inherit" });
  console.log("Clonando solo las carpetas necesarias de Mojang/bedrock-samples…");
  git("clone", "--depth", "1", "--filter=blob:none", "--sparse", REPO, "repo");
  const cwd = path.join(tmp, "repo");
  const run = (...a) => execFileSync("git", a, { cwd, stdio: "inherit" });
  run("sparse-checkout", "set", "--no-cone", ...COPY_DIRS.map((d) => "/resource_pack/" + d + "/"), ...COPY_FILES.map((f) => "/resource_pack/" + f));
  return cwd;
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  let n = 0;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) n += copyDir(s, d);
    else if (/\.(png|tga|json)$/i.test(e.name)) {
      fs.copyFileSync(s, d);
      n++;
    }
  }
  return n;
}
function listPng(dir, rel) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) out.push(...listPng(path.join(dir, e.name), rel + "/" + e.name));
    else if (/\.png$/i.test(e.name)) out.push(rel + "/" + e.name.replace(/\.png$/i, ""));
  }
  return out.sort();
}

async function main() {
  let src = null;
  if (opt("zip")) src = findPack(await fromZip(path.resolve(opt("zip"))));
  else if (opt("dir")) src = findPack(path.resolve(opt("dir")));
  else src = findPack(fromGit());
  if (!src) {
    console.error("No encuentro resource_pack/blocks.json. Pasa --dir con bedrock-samples o su carpeta resource_pack.");
    process.exit(1);
  }
  console.log("resource_pack:", src);
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  let total = 0;
  for (const f of COPY_FILES) {
    const s = path.join(src, f);
    if (!fs.existsSync(s)) {
      console.warn("  (falta " + f + ")");
      continue;
    }
    fs.mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true });
    fs.copyFileSync(s, path.join(OUT, f));
    total++;
  }
  for (const d of COPY_DIRS) {
    const s = path.join(src, d);
    if (!fs.existsSync(s)) {
      console.warn("  (falta " + d + ")");
      continue;
    }
    total += copyDir(s, path.join(OUT, d));
  }
  const rd = (f) => (fs.existsSync(path.join(OUT, f)) ? fs.readFileSync(path.join(OUT, f), "utf8") : null);
  const files = [...listPng(path.join(OUT, "textures/blocks"), "textures/blocks"), ...listPng(path.join(OUT, "textures/items"), "textures/items"), ...listPng(path.join(OUT, "textures/entity/chest"), "textures/entity/chest")];
  const manifest = R.buildManifest({ blocks: rd("blocks.json"), terrain: rd("textures/terrain_texture.json"), items: rd("textures/item_texture.json"), files });
  manifest.generated = new Date().toISOString();
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest));
  console.log("Listo:", total, "archivos copiados a", path.relative(root, OUT) || ".");
  console.log("Manifest:", JSON.stringify(manifest.stats));
  console.log("Sube la carpeta mc/ junto con el resto del sitio.");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

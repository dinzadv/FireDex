import { build, transform } from "esbuild";
import fs from "node:fs";
import path from "node:path";
const root = path.dirname(new URL(import.meta.url).pathname);
const ROUTES = [["", "Inicio"], ["commands", "Comandos"], ["manifest", "Manifest"], ["guide", "Gu\xEDa"], ["terms", "T\xE9rminos y condiciones"], ["privacy", "Pol\xEDtica de privacidad"], ["cookies", "Pol\xEDtica de cookies"], ["legal", "Aviso legal"]];
const page = (title, desc, html = '') => `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} \xB7 FireDex</title><meta name="description" content="${desc}">
<link rel="icon" type="image/png" href="/img/logo-64.png"><link rel="apple-touch-icon" href="/img/logo-192.png">
<link rel="stylesheet" href="/css/main.css"><link rel="stylesheet" href="/css/pixel.css"><link rel="stylesheet" href="/css/app.css">
<script src="/js/diag.js"><\/script><script src="/js/i18n.js"><\/script></head>
<body class="px-page"><div id="root">${html}</div><script src="/assets/icons.js"><\/script><script src="/assets/app.js"><\/script></body></html>
`;
const write = (f, s) => {
  const p = path.join(root, f);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s);
};
const DESC = "FireDex: editor de c\xF3digo, modelador 3D y animaciones para addons de Minecraft Bedrock, todo en tu navegador.";
await build({ entryPoints: [path.join(root, "app/main.jsx")], bundle: true, minify: true, legalComments: "none", format: "iife", jsx: "automatic", outfile: path.join(root, "assets/app.js"), define: { "process.env.NODE_ENV": '"production"' }, logLevel: "error" });
await build({ entryPoints: [path.join(root, "app/icons/bridge.js")], bundle: true, minify: true, legalComments: "none", format: "iife", outfile: path.join(root, "assets/icons.js"), logLevel: "error" });
const srvFile = path.join(root, "assets/.server.mjs");
await build({ entryPoints: [path.join(root, "app/server.jsx")], bundle: true, platform: "node", format: "esm", packages: "external", jsx: "automatic", legalComments: "none", outfile: srvFile, define: { "process.env.NODE_ENV": '"production"' }, logLevel: "error" });
const { render } = await import(srvFile + "?v=" + Date.now());
fs.rmSync(srvFile);
ROUTES.forEach(([r, t]) => write(r ? r + "/index.html" : "index.html", page(t, r === "" ? DESC : t + " de FireDex.", render(r ? "/" + r + "/" : "/"))));
write("404.html", page("P\xE1gina no encontrada", DESC, render("/404/")));
const REDIR = { "commands.html": "/commands/", "manifest.html": "/manifest/", "guide.html": "/guide/", "ed/co.html": "/edit/", "ed/model.html": "/model/" };
Object.keys(REDIR).forEach((f) => write(f, `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="robots" content="noindex"><title>FireDex</title><script>location.replace('${REDIR[f]}' + location.search + location.hash)<\/script><meta http-equiv="refresh" content="0;url=${REDIR[f]}"></head><body><a href="${REDIR[f]}">Continuar</a></body></html>`));
console.log("ok");

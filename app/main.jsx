import React from "react";
import { createRoot } from "react-dom/client";
import { Shell } from "./components/Shell.jsx";
import { Home } from "./pages/Home.jsx";
import { Commands } from "./pages/Commands.jsx";
import { Manifest } from "./pages/Manifest.jsx";
import { Doc, NotFound } from "./pages/Doc.jsx";
const ROUTES = {
  "/": () => <Home />,
  "/commands/": () => <Commands />,
  "/manifest/": () => <Manifest />,
  "/guide/": () => <Doc id="guide" />,
  "/terms/": () => <Doc id="terms" />,
  "/privacy/": () => <Doc id="privacy" />,
  "/cookies/": () => <Doc id="cookies" />,
  "/legal/": () => <Doc id="legal" />
};
function normalize(p) {
  let x = p.replace(/index\.html$/, "");
  if (!x.endsWith("/")) x += "/";
  return x;
}
export function App({ route }) {
  const path = normalize(route || location.pathname);
  const Page = ROUTES[path] || (() => <NotFound />);
  return <Shell path={ROUTES[path] ? path : ""}><Page /></Shell>;
}
if (typeof document !== "undefined" && document.getElementById("root")) createRoot(document.getElementById("root")).render(<App />);

const cache = {};
export function loadScript(src) {
  if (cache[src]) return cache[src];
  cache[src] = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = res;
    s.onerror = rej;
    document.body.appendChild(s);
  });
  return cache[src];
}
export async function loadScripts(list) {
  for (const s of list) await loadScript(s);
}

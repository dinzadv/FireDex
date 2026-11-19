/* FireDex · Núcleo del editor: lenguajes, resaltado, diagnósticos y autocompletado.
 * Sin dependencias de DOM: se puede probar en Node.  window.EC / module.exports
 */
(function (root) {
  'use strict';
  const MC = (typeof require !== 'undefined' && typeof module !== 'undefined' && !root.MCDATA) ? require('./mcdata.js') : root.MCDATA;

  /* ====================================================================
   * Lenguajes
   * ==================================================================== */
  const LANGS = {
    js: { id: 'js', name: 'JavaScript', short: 'JS', color: '#f7df1e', ink: '#1b1b1b', comment: '//' },
    ts: { id: 'ts', name: 'TypeScript', short: 'TS', color: '#3178c6', ink: '#ffffff', comment: '//' },
    json: { id: 'json', name: 'JSON', short: '{}', color: '#f2a24b', ink: '#1b1b1b', comment: null },
    html: { id: 'html', name: 'HTML / XML', short: '<>', color: '#e34c26', ink: '#ffffff', comment: null },
    css: { id: 'css', name: 'CSS', short: '#', color: '#2965f1', ink: '#ffffff', comment: null },
    md: { id: 'md', name: 'Markdown', short: 'M↓', color: '#63b3ed', ink: '#0b1220', comment: null },
    mcfunction: { id: 'mcfunction', name: 'mcfunction', short: '/_', color: '#4ade80', ink: '#06210f', comment: '#' },
    lang: { id: 'lang', name: 'Lang (textos)', short: 'Aa', color: '#20c997', ink: '#06231c', comment: '##' },
    py: { id: 'py', name: 'Python', short: 'Py', color: '#3572a5', ink: '#ffffff', comment: '#' },
    yaml: { id: 'yaml', name: 'YAML', short: 'YML', color: '#cb4b5f', ink: '#ffffff', comment: '#' },
    sh: { id: 'sh', name: 'Shell', short: 'SH', color: '#4eaa25', ink: '#ffffff', comment: '#' },
    text: { id: 'text', name: 'Texto', short: 'TXT', color: '#6b7089', ink: '#ffffff', comment: null }
  };
  const EXT_LANG = {
    js: 'js', mjs: 'js', cjs: 'js', jsx: 'js', ts: 'ts', tsx: 'ts', mts: 'ts', cts: 'ts',
    json: 'json', mcmeta: 'json', material: 'json', bbmodel: 'json', jsonc: 'json', json5: 'json',
    html: 'html', htm: 'html', xml: 'html', svg: 'html', css: 'css', scss: 'css', less: 'css', md: 'md', markdown: 'md',
    mcfunction: 'mcfunction', lang: 'lang', py: 'py', yml: 'yaml', yaml: 'yaml', sh: 'sh', bash: 'sh', txt: 'text'
  };
  function extOf(name) { const i = name.lastIndexOf('.'); return i > 0 ? name.slice(i + 1).toLowerCase() : (name.startsWith('.') ? name.slice(1).toLowerCase() : ''); }
  function langOf(name) { return EXT_LANG[extOf(name)] || 'text'; }

  /* ====================================================================
   * Tokenizador   token = [tipo, inicio, fin]
   * ==================================================================== */
  const JS_KW = new Set('break case catch continue debugger default delete do else export finally for if import in instanceof new return super switch throw try typeof void while with yield await async static extends as from of get set'.split(' '));
  const JS_KW_ALWAYS = new Set('break case catch continue debugger default delete do else export finally for if import in instanceof new return super switch throw try typeof void while with yield extends'.split(' '));
  const JS_DECL = new Set('const let var function class'.split(' '));
  const TS_DECL = new Set('interface enum namespace declare abstract module'.split(' '));
  const TS_MOD = new Set('public private protected readonly implements keyof infer satisfies override is asserts unique'.split(' '));
  const TS_TYPES = new Set('string number boolean any unknown never void object symbol bigint'.split(' '));
  const JS_LIT = new Set('true false null undefined this NaN Infinity'.split(' '));
  const JS_BI = new Set('Math JSON Object Array String Number Boolean Promise Map Set WeakMap WeakSet Date RegExp Error TypeError RangeError console Symbol BigInt parseInt parseFloat isNaN isFinite structuredClone globalThis Uint8Array Float32Array Intl Reflect Proxy'.split(' '));
  const MC_NAMES = new Set(Object.keys(MC.IMPORTS));
  const RX_AFTER_KW = new Set(['return', 'typeof', 'case', 'delete', 'void', 'throw', 'yield', 'await', 'in', 'of', 'instanceof', 'new', 'else', 'do']);

  const reNum = /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d+)?)n?/y;
  const reId = /[A-Za-z_$][\w$]*/y;
  const reOp = /[=<>!+\-*%&|^~?:]+/y;

  function nextNonSpace(src, i) { while (i < src.length && (src[i] === ' ' || src[i] === '\t')) i++; return src[i]; }

  function tokJS(src, ts) {
    const out = []; const n = src.length; let i = 0, depth = 0, prev = null, prevPrev = null;
    const tpl = [];
    const push = (t, s, e) => { out.push([t, s, e]); prevPrev = prev; prev = [t, src.slice(s, e)]; };
    function scanTemplate(from) {
      let j = from, seg = from - (from > 0 && (src[from - 1] === '`' || src[from - 1] === '}') ? 1 : 0);
      for (; j < n; j++) {
        const c = src[j];
        if (c === '\\') { j++; continue; }
        if (c === '`') { push('str', seg, j + 1); return j + 1; }
        if (c === '$' && src[j + 1] === '{') { push('str', seg, j + 2); tpl.push(depth); return j + 2; }
      }
      push('str', seg, n); return n;
    }
    while (i < n) {
      const c = src[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
      const c2 = src[i + 1];
      if (c === '/' && c2 === '/') { let e = src.indexOf('\n', i); if (e < 0) e = n; out.push(['com', i, e]); i = e; continue; }
      if (c === '/' && c2 === '*') { let e = src.indexOf('*/', i + 2); e = e < 0 ? n : e + 2; out.push(['com', i, e]); i = e; continue; }
      if (c === '"' || c === "'") {
        let j = i + 1; while (j < n && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
        if (src[j] === c) j++; push('str', i, Math.min(j, n)); i = Math.min(j, n); continue;
      }
      if (c === '`') { i = scanTemplate(i + 1); continue; }
      if (c === '}' && tpl.length && tpl[tpl.length - 1] === depth) { tpl.pop(); i = scanTemplate(i + 1); continue; }
      if ((c >= '0' && c <= '9') || (c === '.' && c2 >= '0' && c2 <= '9')) {
        reNum.lastIndex = i; const m = reNum.exec(src); if (m && m[0]) { push('num', i, i + m[0].length); i += m[0].length; continue; }
      }
      if (/[A-Za-z_$]/.test(c)) {
        reId.lastIndex = i; const w = reId.exec(src)[0]; const e = i + w.length; const nx = nextNonSpace(src, e);
        const afterDot = prev && prev[1] === '.' && prev[0] === 'pun';
        let t = 'id';
        if (afterDot) t = nx === '(' ? 'fn' : 'prop';
        else if (JS_DECL.has(w)) t = 'kw2';
        else if (ts && TS_DECL.has(w) && /[A-Za-z_{]/.test(nextNonSpace(src, e) || '')) t = 'kw2';
        else if (ts && w === 'type' && prev && !(prev[1] === '.') && /[A-Za-z_$]/.test(nx || '') ) t = 'kw2';
        else if (JS_KW_ALWAYS.has(w)) t = 'kw';
        else if ((w === 'async' || w === 'await' || w === 'static') ) t = 'kw';
        else if ((w === 'of' || w === 'from' || w === 'as') && /[\w"'{*`$]/.test(nx || '') && prev && prev[0] !== 'op') t = 'kw';
        else if ((w === 'get' || w === 'set') && /[A-Za-z_$\[]/.test(nx || '') && nx !== undefined && prev && (prev[1] === '{' || prev[1] === ';' || prev[1] === '}' || prev[0] === 'kw')) t = 'kw';
        else if (ts && TS_MOD.has(w) && /[A-Za-z_$\[{]/.test(nx || '')) t = 'kw';
        else if (JS_LIT.has(w)) t = 'lit';
        else if (ts && TS_TYPES.has(w)) t = 'type';
        else if (MC_NAMES.has(w)) t = 'mc';
        else if (JS_BI.has(w)) t = 'bi';
        else if (nx === '(') t = 'fn';
        else if (/^[A-Z]/.test(w) && w.length > 1 && !/^[A-Z0-9_]+$/.test(w)) t = 'cls';
        else if (/^[A-Z][A-Z0-9_]*$/.test(w) && w.length > 1) t = 'const';
        push(t, i, e); i = e; continue;
      }
      if (c === '@' && /[A-Za-z_]/.test(c2 || '')) { reId.lastIndex = i + 1; const w = reId.exec(src)[0]; push('dec', i, i + 1 + w.length); i += 1 + w.length; continue; }
      if (c === '/') {
        const okRx = !prev || (prev[0] === 'op') || (prev[0] === 'pun' && '(,[{;'.includes(prev[1])) || (prev[0] === 'kw' && RX_AFTER_KW.has(prev[1]));
        if (okRx) {
          let j = i + 1, cls = false, ok = false;
          for (; j < n && src[j] !== '\n'; j++) { const d = src[j]; if (d === '\\') { j++; continue; } if (d === '[') cls = true; else if (d === ']') cls = false; else if (d === '/' && !cls) { ok = true; break; } }
          if (ok) { j++; while (j < n && /[a-z]/.test(src[j])) j++; push('rx', i, j); i = j; continue; }
        }
      }
      if ('{}()[];,.'.includes(c)) {
        if (c === '{') depth++; else if (c === '}') depth--;
        push('pun', i, i + 1); i++; continue;
      }
      reOp.lastIndex = i; const om = reOp.exec(src);
      if (om) { push('op', i, i + om[0].length); i += om[0].length; continue; }
      push('op', i, i + 1); i++;
    }
    return out;
  }

  function tokJSON(src) {
    const out = []; const n = src.length; let i = 0;
    while (i < n) {
      const c = src[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
      if (c === '/' && src[i + 1] === '/') { let e = src.indexOf('\n', i); if (e < 0) e = n; out.push(['com', i, e]); i = e; continue; }
      if (c === '/' && src[i + 1] === '*') { let e = src.indexOf('*/', i + 2); e = e < 0 ? n : e + 2; out.push(['com', i, e]); i = e; continue; }
      if (c === '"' || c === "'") {
        let j = i + 1; while (j < n && src[j] !== c && src[j] !== '\n') { if (src[j] === '\\') j++; j++; }
        if (src[j] === c) j++; j = Math.min(j, n);
        const isKey = nextNonSpace(src, j) === ':';
        const body = src.slice(i + 1, j - 1);
        out.push([isKey ? 'key' : (/^[a-z0-9_.\-]+:[a-z0-9_.\-\/]+$/.test(body) ? 'mc' : 'str'), i, j]); i = j; continue;
      }
      if ((c >= '0' && c <= '9') || c === '-') { reNum.lastIndex = i + (c === '-' ? 1 : 0); const m = reNum.exec(src); if (m && m[0]) { const e = reNum.lastIndex; out.push(['num', i, e]); i = e; continue; } }
      if (/[A-Za-z]/.test(c)) { reId.lastIndex = i; const w = reId.exec(src)[0]; out.push([/^(true|false|null)$/.test(w) ? 'lit' : 'err', i, i + w.length]); i += w.length; continue; }
      if ('{}[],:'.includes(c)) { out.push(['pun', i, i + 1]); i++; continue; }
      i++;
    }
    return out;
  }

  // Tokenizador por reglas (CSS, Markdown, Python, YAML, Shell…)
  function ruleTok(src, rules, offset, out) {
    out = out || []; offset = offset || 0; let i = 0; const n = src.length;
    outer: while (i < n) {
      const c = src[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
      for (let r = 0; r < rules.length; r++) {
        const re = rules[r][1]; re.lastIndex = i; const m = re.exec(src);
        if (m && m[0].length) { if (rules[r][0]) out.push([rules[r][0], offset + i, offset + i + m[0].length]); i += m[0].length; continue outer; }
      }
      i++;
    }
    return out;
  }
  const CSS_RULES = [
    ['com', /\/\*[\s\S]*?(?:\*\/|$)/y], ['str', /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?/y], ['kw', /@[\w-]+/y],
    ['num', /#[\da-fA-F]{3,8}\b/y], ['num', /-?(?:\d+\.?\d*|\.\d+)(?:px|em|rem|%|vh|vw|vmin|vmax|s|ms|deg|fr|ch|pt)?\b/y],
    ['attr', /--[\w-]+/y], ['attr', /[\w-]+(?=\s*:(?!:)\s*[^;{]*[;}])/y], ['cls', /[.#][\w-]+/y], ['fn', /[\w-]+(?=\()/y], ['pun', /[{}()[\];,:]/y], ['op', /[>+~*=]/y]
  ];
  const MD_RULES = [
    ['com', /^```.*$/my], ['kw', /^#{1,6}\s.*$/my], ['com', /^>.*$/my], ['op', /^[ \t]*(?:[-*+]|\d+\.)(?=\s)/my],
    ['str', /`[^`\n]+`/y], ['fn', /\*\*[^*\n]+\*\*/y], ['cls', /__[^_\n]+__/y], ['prop', /\[[^\]\n]*\]\([^)\n]*\)/y]
  ];
  const PY_KW = new Set('and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield'.split(' '));
  function tokWords(src, rules, kw, lit) {
    const out = []; const n = src.length; let i = 0;
    outer: while (i < n) {
      const c = src[i];
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
      if (/[A-Za-z_]/.test(c)) {
        reId.lastIndex = i; const w = reId.exec(src)[0]; const e = i + w.length;
        out.push([kw.has(w) ? 'kw' : (lit && lit.has(w) ? 'lit' : (nextNonSpace(src, e) === '(' ? 'fn' : (/^[A-Z]/.test(w) ? 'cls' : 'id'))), i, e]); i = e; continue;
      }
      for (let r = 0; r < rules.length; r++) { const re = rules[r][1]; re.lastIndex = i; const m = re.exec(src); if (m && m[0].length) { out.push([rules[r][0], i, i + m[0].length]); i += m[0].length; continue outer; } }
      i++;
    }
    return out;
  }
  const PY_RULES = [['com', /#.*/y], ['str', /"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?/y], ['num', /\d[\d_]*\.?\d*/y], ['pun', /[{}()[\];,.:]/y], ['op', /[=<>!+\-*/%&|^~]+/y], ['dec', /@\w+/y]];
  const YAML_RULES = [['com', /#.*/y], ['str', /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?/y], ['attr', /[\w.\-/]+(?=\s*:(?:\s|$))/y], ['num', /-?\d+\.?\d*/y], ['pun', /[{}[\],:\-]/y]];
  const SH_RULES = [['com', /#.*/y], ['str', /"(?:[^"\\]|\\.)*"?|'[^']*'?/y], ['attr', /\$\{?[\w#?@*]+\}?/y], ['num', /\d+/y], ['op', /[|&;<>=]+/y]];

  function tokHTML(src) {
    const out = []; const n = src.length; let i = 0, inTag = false;
    while (i < n) {
      const c = src[i];
      if (!inTag) {
        if (src.startsWith('<!--', i)) { let e = src.indexOf('-->', i + 4); e = e < 0 ? n : e + 3; out.push(['com', i, e]); i = e; continue; }
        if (c === '<' && /[A-Za-z\/!?]/.test(src[i + 1] || '')) {
          const m = /<[\/!?]?[A-Za-z][\w:.-]*|<[!?\/]/y; m.lastIndex = i; const r = m.exec(src);
          if (r) { out.push(['tag', i, i + r[0].length]); i += r[0].length; inTag = true; continue; }
        }
        if (c === '&') { const m = /&#?\w+;/y; m.lastIndex = i; const r = m.exec(src); if (r) { out.push(['num', i, i + r[0].length]); i += r[0].length; continue; } }
        i++; continue;
      }
      if (c === '>' || (c === '/' && src[i + 1] === '>') || (c === '?' && src[i + 1] === '>')) { const l = c === '>' ? 1 : 2; out.push(['tag', i, i + l]); i += l; inTag = false; continue; }
      if (c === '"' || c === "'") { let j = src.indexOf(c, i + 1); j = j < 0 ? n : j + 1; out.push(['str', i, j]); i = j; continue; }
      if (c === '=') { out.push(['op', i, i + 1]); i++; continue; }
      if (/[A-Za-z_:@]/.test(c)) { const m = /[A-Za-z_:@][\w:.\-]*/y; m.lastIndex = i; const r = m.exec(src); out.push(['attr', i, i + r[0].length]); i += r[0].length; continue; }
      i++;
    }
    return out;
  }

  const SELECTOR_KEYS = new Set(['type', 'name', 'tag', 'r', 'rm', 'x', 'y', 'z', 'dx', 'dy', 'dz', 'scores', 'l', 'lm', 'c', 'm', 'family', 'haspermission', 'hasitem', 'rx', 'rxm', 'ry', 'rym']);
  function tokMcfunction(src) {
    const out = []; let pos = 0;
    const lines = src.split('\n');
    for (const line of lines) {
      const base = pos; pos += line.length + 1;
      const m = /^([ \t]*)(\/?)([A-Za-z_]+)?/.exec(line); if (!m) continue;
      if (line[m[1].length] === '#') { out.push(['com', base + m[1].length, base + line.length]); continue; }
      let i = m[1].length;
      if (m[2]) { out.push(['err', base + i, base + i + 1]); i++; }
      if (m[3]) { out.push(['kw', base + i, base + i + m[3].length]); i += m[3].length; }
      const rest = line.slice(i); let k = 0;
      const rr = [
        ['com', /#.*/y], ['str', /"(?:[^"\\]|\\.)*"?/y], ['kw2', /@[aeprsvn](?![\w])|@initiator/y],
        ['fn', /\b(?:as|at|if|unless|run|positioned|rotated|facing|align|anchored|in|store|entity|block|blocks|score|scores|items|result|success|players|add|remove|set|list|reset|operation|objectives|test|matches|dimension)\b(?![:=])/y],
        ['attr', /[A-Za-z_]+(?=\s*=)/y], ['mc', /(?:minecraft:)?[a-z_]+:[a-z0-9_./]+/y], ['num', /[~^]?-?\d*\.?\d+|[~^]/y], ['pun', /[\[\]{},=]/y], ['op', /[!.<>]+/y]
      ];
      ruleTok(rest, rr, base + i, out);
    }
    return out;
  }
  function tokLang(src) {
    const out = []; let pos = 0;
    for (const line of src.split('\n')) {
      const base = pos; pos += line.length + 1;
      const t = line.trimStart(); if (!t) continue; const lead = line.length - t.length;
      if (t.startsWith('#')) { out.push(['com', base + lead, base + line.length]); continue; }
      const eq = line.indexOf('=');
      if (eq < 0) { out.push(['err', base + lead, base + line.length]); continue; }
      out.push(['attr', base + lead, base + eq]); out.push(['op', base + eq, base + eq + 1]);
      let vend = line.length; const hash = line.indexOf('\t#', eq); if (hash >= 0) { out.push(['com', base + hash + 1, base + line.length]); vend = hash; }
      if (vend > eq + 1) out.push(['str', base + eq + 1, base + vend]);
    }
    return out;
  }

  function tokenize(src, lang) {
    switch (lang) {
      case 'js': return tokJS(src, false);
      case 'ts': return tokJS(src, true);
      case 'json': return tokJSON(src);
      case 'html': return tokHTML(src);
      case 'css': return ruleTok(src, CSS_RULES);
      case 'md': return ruleTok(src, MD_RULES);
      case 'mcfunction': return tokMcfunction(src);
      case 'lang': return tokLang(src);
      case 'py': return tokWords(src, PY_RULES, PY_KW, new Set(['True', 'False', 'None', 'self']));
      case 'yaml': return ruleTok(src, YAML_RULES);
      case 'sh': return tokWords(src, SH_RULES, new Set('if then else elif fi for do done while case esac function in echo cd export source'.split(' ')));
      default: return [];
    }
  }

  /* ====================================================================
   * Render HTML con subrayados de diagnósticos
   * ==================================================================== */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
  const esc = (s) => s.replace(/[&<>]/g, (c) => ESC[c]);
  const SEV_RANK = { error: 3, warn: 2, info: 1, hint: 0, find: -2, findc: -1 };

  function escStr(s) { return esc(s).replace(/§[0-9a-vA-V]/g, (m) => '<i class="mcc">' + m + '</i>'); }

  function render(src, toks, diags) {
    const n = src.length; let html = ''; let pos = 0;
    // Diagnósticos: limitar a una línea
    const ds = [];
    for (const d of (diags || [])) {
      let a = Math.max(0, Math.min(d.from, n)), b = Math.max(a, Math.min(d.to, n));
      if (b <= a) { if (a > 0 && src[a - 1] !== '\n') { a--; b = a + 1; } else if (a < n && src[a] !== '\n') b = a + 1; else continue; }
      const nl = src.indexOf('\n', a); if (nl >= 0 && b > nl) b = nl; if (b <= a) continue;
      ds.push({ a, b, sev: d.sev, tag: d.tag });
      if (ds.length > 400) break;
    }
    ds.sort((x, y) => x.a - y.a);
    const cuts = (a, b) => {
      if (!ds.length) return null;
      const pts = new Set([a, b]); let any = false;
      for (const d of ds) { if (d.a >= b) break; if (d.b <= a) continue; any = true; if (d.a > a) pts.add(d.a); if (d.b < b) pts.add(d.b); }
      if (!any) return null;
      const arr = Array.from(pts).sort((x, y) => x - y); const segs = [];
      for (let k = 0; k < arr.length - 1; k++) {
        let best = null; for (const d of ds) { if (d.a >= arr[k + 1]) break; if (d.b > arr[k] && d.a <= arr[k]) { if (!best || SEV_RANK[d.sev] > SEV_RANK[best.sev]) best = d; } }
        segs.push([arr[k], arr[k + 1], best]);
      }
      return segs;
    };
    const emit = (a, b, type) => {
      if (b <= a) return;
      const esc1 = type === 'str' || type === 'mc' ? escStr : esc;
      const segs = cuts(a, b);
      const wrapTok = (inner) => type ? '<span class="t-' + type + '">' + inner + '</span>' : inner;
      if (!segs) { html += wrapTok(esc1(src.slice(a, b))); return; }
      let inner = '';
      for (const [x, y, d] of segs) { const t = esc1(src.slice(x, y)); inner += d ? '<span class="dg dg-' + d.sev + (d.tag ? ' dg-' + d.tag : '') + '">' + t + '</span>' : t; }
      html += wrapTok(inner);
    };
    for (const [t, s, e] of toks) {
      if (s < pos) continue;
      if (s > pos) emit(pos, s, '');
      emit(s, e, t === 'id' ? '' : t); pos = e;
    }
    if (pos < n) emit(pos, n, '');
    return html + '\n';
  }

  /* ====================================================================
   * JSON: parser con posiciones y mensajes en español
   * ==================================================================== */
  function parseJSON(src) {
    const diags = []; let i = 0; const n = src.length; let commentSeen = false;
    class Stop extends Error { }
    const fail = (from, to, msg) => { diags.push({ sev: 'error', from, to: Math.max(to, from + 1), msg }); throw new Stop(); };
    function ws() {
      for (;;) {
        while (i < n && /\s/.test(src[i])) i++;
        if (src[i] === '/' && src[i + 1] === '/') { if (!commentSeen) { commentSeen = true; diags.push({ sev: 'info', from: i, to: Math.min(n, i + 2), msg: 'Comentarios en JSON: Minecraft los acepta, pero otros programas pueden rechazarlos.' }); } const e = src.indexOf('\n', i); i = e < 0 ? n : e; continue; }
        if (src[i] === '/' && src[i + 1] === '*') { if (!commentSeen) { commentSeen = true; diags.push({ sev: 'info', from: i, to: i + 2, msg: 'Comentarios en JSON: Minecraft los acepta, pero otros programas pueden rechazarlos.' }); } const e = src.indexOf('*/', i + 2); if (e < 0) fail(i, n, 'Comentario sin cerrar (falta */).'); i = e + 2; continue; }
        break;
      }
    }
    function str() {
      const s = i; const q = src[i]; if (q === "'") fail(i, i + 1, 'Las cadenas de JSON deben usar comillas dobles ("), no simples.');
      i++; let out = '';
      while (i < n) {
        const c = src[i];
        if (c === '"') { i++; return { t: 's', s, e: i, v: out }; }
        if (c === '\n') fail(s, i, 'Cadena sin cerrar: falta la comilla de cierre (").');
        if (c === '\\') { const d = src[i + 1]; if (!d || !'"\\/bfnrtu'.includes(d)) fail(i, i + 2, 'Secuencia de escape no válida: \\' + (d || '')); out += d; i += 2; continue; }
        out += c; i++;
      }
      fail(s, n, 'Cadena sin cerrar: falta la comilla de cierre (").');
    }
    function val() {
      ws(); const c = src[i]; const s = i;
      if (i >= n) fail(Math.max(0, n - 1), n, 'El JSON termina antes de tiempo: se esperaba un valor.');
      if (c === '{') return obj();
      if (c === '[') return arr();
      if (c === '"' || c === "'") return str();
      if (c === '-' || (c >= '0' && c <= '9')) {
        const m = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y; m.lastIndex = i; const r = m.exec(src);
        if (!r) fail(i, i + 1, 'Número no válido.'); i += r[0].length; return { t: 'n', s, e: i, v: parseFloat(r[0]) };
      }
      const w = /[A-Za-z_]+/y; w.lastIndex = i; const r = w.exec(src);
      if (r) {
        if (r[0] === 'true' || r[0] === 'false') { i += r[0].length; return { t: 'b', s, e: i, v: r[0] === 'true' }; }
        if (r[0] === 'null') { i += 4; return { t: 'z', s, e: i, v: null }; }
        fail(i, i + r[0].length, "Valor no válido en JSON: '" + r[0] + "'. Usa true, false, null, números o cadenas entre comillas dobles.");
      }
      fail(i, i + 1, "Carácter inesperado '" + c + "'.");
    }
    function obj() {
      const s = i; i++; const props = []; const seen = new Map(); ws();
      if (src[i] === '}') { i++; return { t: 'o', s, e: i, props }; }
      for (;;) {
        ws();
        if (i >= n) fail(s, s + 1, "Falta cerrar la llave '{' abierta aquí.");
        if (src[i] !== '"') { if (src[i] === "'") fail(i, i + 1, 'Las claves de JSON deben usar comillas dobles ("), no simples.'); if (src[i] === '}') fail(i - 1, i, 'Coma sobrante antes de }.'); fail(i, i + 1, /[A-Za-z_]/.test(src[i]) ? 'La clave debe ir entre comillas dobles.' : "Se esperaba una clave entre comillas dobles, pero hay '" + src[i] + "'."); }
        const k = str(); ws();
        if (src[i] !== ':') fail(i < n ? i : n - 1, i + 1, "Falta ':' después de la clave " + src.slice(k.s, k.e) + '.');
        i++; const v = val();
        if (seen.has(k.v)) diags.push({ sev: 'warn', from: k.s, to: k.e, msg: "Clave duplicada '" + k.v + "': solo se usará una." }); else seen.set(k.v, 1);
        props.push({ k: k.v, ks: k.s, ke: k.e, v });
        ws();
        if (src[i] === ',') {
          i++; ws();
          if (src[i] === '}') { diags.push({ sev: 'warn', from: i - 1, to: i, msg: 'Coma final sobrante: algunos lectores de JSON la rechazan.' }); i++; return { t: 'o', s, e: i, props }; }
          continue;
        }
        if (src[i] === '}') { i++; return { t: 'o', s, e: i, props }; }
        if (i >= n) fail(s, s + 1, "Falta cerrar la llave '{' abierta aquí.");
        fail(i, i + 1, "Se esperaba ',' o '}' pero hay '" + src[i] + "'. ¿Falta una coma en la línea anterior?");
      }
    }
    function arr() {
      const s = i; i++; const items = []; ws();
      if (src[i] === ']') { i++; return { t: 'a', s, e: i, items }; }
      for (;;) {
        ws(); if (i >= n) fail(s, s + 1, "Falta cerrar el corchete '[' abierto aquí.");
        if (src[i] === ']') { diags.push({ sev: 'warn', from: i - 1, to: i, msg: 'Coma final sobrante: algunos lectores de JSON la rechazan.' }); i++; return { t: 'a', s, e: i, items }; }
        items.push(val()); ws();
        if (src[i] === ',') { i++; continue; }
        if (src[i] === ']') { i++; return { t: 'a', s, e: i, items }; }
        if (i >= n) fail(s, s + 1, "Falta cerrar el corchete '[' abierto aquí.");
        fail(i, i + 1, "Se esperaba ',' o ']' pero hay '" + src[i] + "'. ¿Falta una coma?");
      }
    }
    let ast = null;
    try { ws(); if (i < n) { ast = val(); ws(); if (i < n) fail(i, n, 'Hay contenido sobrante después del valor JSON principal.'); } } catch (e) { if (!(e instanceof Stop)) throw e; ast = null; }
    return { ast, diags, ok: !diags.some((d) => d.sev === 'error') };
  }
  const jget = (node, key) => (node && node.t === 'o') ? node.props.find((p) => p.k === key) : null;

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  function lintManifest(ast) {
    const d = []; if (!ast || ast.t !== 'o') return d;
    const w = (node, msg, sev) => d.push({ sev: sev || 'warn', from: node.ks != null ? node.ks : node.s, to: node.ke != null ? node.ke : node.e, msg });
    const fv = jget(ast, 'format_version'); if (!fv) d.push({ sev: 'warn', from: ast.s, to: ast.s + 1, msg: "Falta 'format_version' (normalmente 2)." });
    const header = jget(ast, 'header'); const uuids = new Map();
    const chkUuid = (p, where) => {
      if (!p) return; if (p.v.t !== 's' || !UUID_RE.test(p.v.v)) { d.push({ sev: 'error', from: p.v.s, to: p.v.e, msg: 'UUID no válido en ' + where + '. Usa el generador de la Toolbox.' }); return; }
      const low = p.v.v.toLowerCase(); if (uuids.has(low)) d.push({ sev: 'error', from: p.v.s, to: p.v.e, msg: 'UUID repetido: el header y cada módulo necesitan UUID distintos.' }); else uuids.set(low, 1);
    };
    const chkVer = (p, where) => { if (!p) return; const v = p.v; if (v.t === 'a') { if (v.items.length !== 3 || v.items.some((x) => x.t !== 'n')) d.push({ sev: 'warn', from: v.s, to: v.e, msg: 'La versión de ' + where + ' debe ser [mayor, menor, parche], por ejemplo [1, 0, 0].' }); } else if (v.t !== 's') d.push({ sev: 'warn', from: v.s, to: v.e, msg: 'Formato de versión inesperado en ' + where + '.' }); };
    if (!header) d.push({ sev: 'error', from: ast.s, to: ast.s + 1, msg: "Falta el objeto 'header'." });
    else if (header.v.t === 'o') {
      const hn = header.v; if (!jget(hn, 'name')) w(header, "El header no tiene 'name'."); chkUuid(jget(hn, 'uuid'), 'header'); if (!jget(hn, 'uuid')) w(header, "El header no tiene 'uuid'.", 'error');
      chkVer(jget(hn, 'version'), 'header'); if (!jget(hn, 'min_engine_version')) w(header, "Falta 'min_engine_version' (ej: [1, 21, 0]).", 'info');
    }
    const modules = jget(ast, 'modules');
    if (!modules) d.push({ sev: 'warn', from: ast.s, to: ast.s + 1, msg: "Falta la lista 'modules'." });
    else if (modules.v.t === 'a') {
      if (!modules.v.items.length) w(modules, 'La lista de módulos está vacía.');
      let hasScript = false;
      modules.v.items.forEach((m, idx) => {
        if (m.t !== 'o') return; const t = jget(m, 'type'); chkUuid(jget(m, 'uuid'), 'el módulo ' + (idx + 1)); chkVer(jget(m, 'version'), 'el módulo ' + (idx + 1));
        if (!t) d.push({ sev: 'error', from: m.s, to: m.s + 1, msg: "Este módulo no tiene 'type' (data, resources, script…)." });
        else if (t.v.t === 's') {
          if (!['data', 'resources', 'script', 'client_data', 'interface', 'world_template', 'skin_pack', 'invalid', 'plugin'].includes(t.v.v)) d.push({ sev: 'warn', from: t.v.s, to: t.v.e, msg: "Tipo de módulo desconocido: '" + t.v.v + "'." });
          if (t.v.v === 'script') { hasScript = true; if (!jget(m, 'entry')) d.push({ sev: 'warn', from: t.v.s, to: t.v.e, msg: "Un módulo script necesita 'entry' (ej: \"scripts/main.js\") y 'language': \"javascript\"." }); else if (!jget(m, 'language')) d.push({ sev: 'warn', from: t.v.s, to: t.v.e, msg: "Falta 'language': \"javascript\" en el módulo script." }); }
        }
      });
      const deps = jget(ast, 'dependencies');
      if (hasScript) {
        const has = deps && deps.v.t === 'a' && deps.v.items.some((x) => { const mn = jget(x, 'module_name'); return mn && mn.v.v === '@minecraft/server'; });
        if (!has) d.push({ sev: 'warn', from: modules.ks, to: modules.ke, msg: "Hay un módulo script pero falta la dependencia '@minecraft/server' en 'dependencies'." });
      }
    }
    return d;
  }

  /* ====================================================================
   * Diagnósticos
   * ==================================================================== */
  const ACORN_ES = [
    [/^Unexpected token/, 'Token inesperado'], [/^Unexpected character '(.*)'/, "Carácter inesperado '$1'"], [/^Unexpected end of input/, 'El código termina antes de tiempo (falta cerrar algo)'],
    [/^Unterminated string constant/, 'Cadena sin cerrar'], [/^Unterminated template/, 'Plantilla (`) sin cerrar'], [/^Unterminated regular expression/, 'Expresión regular sin cerrar'],
    [/^Identifier '(.*)' has already been declared/, "'$1' ya fue declarado antes en este ámbito"], [/^Unexpected identifier '?(.*?)'?$/, "Identificador inesperado '$1' (¿falta una coma, operador o ';'?)"],
    [/^Missing semicolon/, "Falta ';'"], [/^Unexpected keyword '(.*)'/, "Palabra clave inesperada '$1'"], [/^Assigning to rvalue/, 'No se puede asignar a esta expresión'],
    [/^'return' outside of function/, "'return' fuera de una función"], [/^Cannot use keyword '(.*)' as/, "No puedes usar '$1' como nombre"],
    [/^The keyword '(.*)' is reserved/, "'$1' es una palabra reservada"], [/^Unexpected reserved word '(.*)'/, "'$1' es una palabra reservada"], [/^Invalid left-hand side in assignment/, 'Lado izquierdo de la asignación no válido'],
    [/^Argument name clash/, 'Parámetros con el mismo nombre'], [/^Unterminated comment/, 'Comentario sin cerrar'], [/^Binding (.*) in strict mode/, "No se puede usar '$1' como nombre en modo estricto"],
    [/^Invalid regular expression/, 'Expresión regular no válida'], [/^Deleting local variable in strict mode/, 'No se puede borrar una variable local'], [/^await is only valid in async functions/, "'await' solo se puede usar dentro de funciones async"],
    [/^Duplicate (.*)/, 'Duplicado: $1']
  ];
  function esAcorn(msg) { const m = msg.replace(/\s*\(\d+:\d+\)$/, ''); for (const [re, t] of ACORN_ES) { if (re.test(m)) return m.replace(re, t); } return m; }

  function wordLenAt(src, pos) { const m = /^[\w$]+|^\S/.exec(src.slice(pos, pos + 80)); return m ? m[0].length : 1; }

  function bracketLint(src, toks) {
    const d = []; const open = { '(': ')', '[': ']', '{': '}' }; const close = { ')': '(', ']': '[', '}': '{' }; const st = [];
    for (const [t, s] of toks) {
      if (t !== 'pun') continue; const c = src[s];
      if (open[c]) st.push({ c, s });
      else if (close[c]) {
        if (!st.length) d.push({ sev: 'error', from: s, to: s + 1, msg: "Cierre inesperado '" + c + "' sin apertura." });
        else { const top = st.pop(); if (top.c !== close[c]) { d.push({ sev: 'error', from: s, to: s + 1, msg: "Se esperaba '" + open[top.c] + "' para cerrar '" + top.c + "' (línea " + lineOf(src, top.s) + "), pero hay '" + c + "'." }); st.push(top); } }
      }
    }
    st.forEach((o) => d.push({ sev: 'error', from: o.s, to: o.s + 1, msg: "'" + o.c + "' abierto aquí nunca se cierra." }));
    return d;
  }
  function lineOf(src, pos) { let l = 1; for (let i = 0; i < pos && i < src.length; i++) if (src.charCodeAt(i) === 10) l++; return l; }

  function addImportEdit(src, toks, name, module) {
    // ¿Existe ya `import { ... } from "module"`?
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k]; if (t[0] !== 'kw' || src.slice(t[1], t[2]) !== 'import') continue;
      let j = k + 1; if (!toks[j] || src[toks[j][1]] !== '{') continue;
      let close = -1; for (let q = j + 1; q < toks.length && q < j + 80; q++) { if (src[toks[q][1]] === '}' && toks[q][0] === 'pun') { close = q; break; } }
      if (close < 0) continue; const f = toks[close + 1], m = toks[close + 2];
      if (f && src.slice(f[1], f[2]) === 'from' && m && m[0] === 'str' && src.slice(m[1] + 1, m[2] - 1) === module) {
        const closePos = toks[close][1]; const inner = src.slice(toks[j][2], closePos); const hasMulti = inner.includes('\n');
        const trimmedEnd = closePos - (inner.length - inner.replace(/\s+$/, '').length);
        const empty = inner.trim() === '';
        return { edits: [{ from: empty ? toks[j][2] : trimmedEnd, to: empty ? closePos : trimmedEnd, text: empty ? ' ' + name + ' ' : (hasMulti ? ',\n  ' : ', ') + name }] };
      }
    }
    // Nueva línea de import: tras otros imports iniciales o al principio
    let at = 0, lastImportEnd = -1;
    for (let k = 0; k < toks.length; k++) { const t = toks[k]; if (t[0] === 'kw' && src.slice(t[1], t[2]) === 'import') { const semi = src.indexOf('\n', t[1]); lastImportEnd = semi < 0 ? src.length : semi + 1; } else if (t[0] !== 'com' && lastImportEnd < 0 && k > 0) break; }
    at = lastImportEnd >= 0 ? lastImportEnd : 0;
    return { edits: [{ from: at, to: at, text: 'import { ' + name + ' } from "' + module + '";\n' }] };
  }

  function lintScript(src, toks, lang) {
    const d = []; const txt = (t) => src.slice(t[1], t[2]);
    const ids = new Map(); const declared = new Set(); const decls = [];
    const N = toks.length;
    for (let k = 0; k < N; k++) { const t = toks[k]; if (t[0] === 'id' || t[0] === 'cls' || t[0] === 'fn' || t[0] === 'mc' || t[0] === 'const' || t[0] === 'bi' || t[0] === 'type' || t[0] === 'lit') { const w = txt(t); ids.set(w, (ids.get(w) || 0) + 1); } }
    const isIdTok = (t) => t && ['id', 'cls', 'fn', 'mc', 'const', 'bi', 'prop', 'type'].includes(t[0]);
    const constNames = new Map();
    for (let k = 0; k < N; k++) {
      const t = toks[k]; const w = txt(t); const prev = toks[k - 1]; const next = toks[k + 1];
      const afterDot = prev && prev[0] === 'pun' && src[prev[1]] === '.';
      // Declaraciones
      if (t[0] === 'kw2' && (w === 'const' || w === 'let' || w === 'var')) {
        const exported = prev && txt(prev) === 'export';
        const nx = next; if (nx && isIdTok(nx)) { decls.push({ name: txt(nx), t: nx, exported, kind: w }); declared.add(txt(nx)); if (w === 'const' && toks[k + 2] && txt(toks[k + 2]) === '=') constNames.set(txt(nx), k + 1); }
        else if (nx && (src[nx[1]] === '{' || src[nx[1]] === '[')) {
          const closer = src[nx[1]] === '{' ? '}' : ']'; let dep = 0;
          for (let q = k + 1; q < N && q < k + 200; q++) {
            const c = src[toks[q][1]]; if (toks[q][0] === 'pun') { if (c === '{' || c === '[') dep++; else if (c === '}' || c === ']') { dep--; if (dep === 0) break; } }
            else if (isIdTok(toks[q]) && dep === 1) { const pr = toks[q - 1], nn = toks[q + 1]; if (nn && src[nn[1]] === ':' && toks[q][0] !== 'op') continue; if (pr && txt(pr) === '=') continue; decls.push({ name: txt(toks[q]), t: toks[q], exported, kind: w, destruct: true }); declared.add(txt(toks[q])); }
          }
        }
      } else if (t[0] === 'kw2' && (w === 'function' || w === 'class' || w === 'enum' || w === 'interface' || w === 'namespace') && next && isIdTok(next)) {
        declared.add(txt(next)); if (w === 'function' || w === 'class') decls.push({ name: txt(next), t: next, exported: prev && (txt(prev) === 'export' || txt(prev) === 'default' || txt(prev) === 'async'), kind: w, fnDecl: true });
      } else if (t[0] === 'kw2' && w === 'type' && next && isIdTok(next)) declared.add(txt(next));
      else if (t[0] === 'kw' && w === 'import') {
        // import a, { b, c as d } from 'x' / * as ns
        let q = k + 1; const names = [];
        for (; q < N && q < k + 120; q++) { const tt = toks[q]; const tw = txt(tt); if (tw === 'from' || tt[0] === 'str') break; if (tw === ';') break; if (isIdTok(tt) && tw !== 'type') { const pr = toks[q - 1]; if (pr && txt(pr) === 'as') names.pop(); names.push({ name: tw, t: tt }); } else if (tt[0] === 'kw' && tw === 'as') { /* siguiente id sustituye */ } }
        names.forEach((x) => { declared.add(x.name); decls.push({ name: x.name, t: x.t, exported: false, kind: 'import' }); });
      }
      // Reglas por token
      if (t[0] === 'op' && (w === '==' || w === '!=')) {
        d.push({ sev: 'warn', from: t[1], to: t[2], msg: 'Usa ' + w + '= en lugar de ' + w + ': evita conversiones de tipo inesperadas.', fix: { label: 'Cambiar a ' + w + '=', edits: [{ from: t[1], to: t[2], text: w + '=' }] } });
      }
      if (t[0] === 'kw2' && w === 'var') d.push({ sev: 'warn', from: t[1], to: t[2], msg: "'var' tiene alcance de función y se eleva (hoisting). Usa 'let' o 'const'.", fix: { label: "Cambiar a 'let'", edits: [{ from: t[1], to: t[2], text: 'let' }] } });
      if (t[0] === 'kw' && w === 'debugger') d.push({ sev: 'warn', from: t[1], to: t[2], msg: "'debugger' no hace nada en Minecraft; quítalo antes de publicar." });
      if (!afterDot && (t[0] === 'fn' || t[0] === 'bi' || t[0] === 'id') && /^(setTimeout|setInterval|clearTimeout|clearInterval|setImmediate)$/.test(w) && next && src[next[1]] === '(') {
        const map = { setTimeout: 'system.runTimeout', setInterval: 'system.runInterval', clearTimeout: 'system.clearRun', clearInterval: 'system.clearRun', setImmediate: 'system.run' };
        d.push({ sev: 'warn', from: t[1], to: t[2], msg: w + '() no existe en la Script API de Minecraft. Usa ' + map[w] + '() (el tiempo va en ticks: 20 ticks = 1 s).', fix: { label: 'Usar ' + map[w], edits: [{ from: t[1], to: t[2], text: map[w] }], needs: map[w].startsWith('system') ? 'system' : null } });
      }
      if (!afterDot && /^(document|window|localStorage|sessionStorage|alert|XMLHttpRequest|navigator)$/.test(w) && t[0] !== 'prop') d.push({ sev: 'warn', from: t[1], to: t[2], msg: "'" + w + "' es de los navegadores y no existe dentro de Minecraft." });
      if (!afterDot && w === 'require' && next && src[next[1]] === '(') d.push({ sev: 'warn', from: t[1], to: t[2], msg: "require() no funciona en la Script API. Usa 'import { … } from \"@minecraft/server\"'." });
      if (!afterDot && w === 'fetch' && next && src[next[1]] === '(') d.push({ sev: 'warn', from: t[1], to: t[2], msg: "fetch() no está disponible en scripts normales; usa @minecraft/server-net en servidores dedicados." });
      if (afterDot && w === 'runCommandAsync') d.push({ sev: 'warn', from: t[1], to: t[2], msg: 'runCommandAsync está obsoleto en las versiones nuevas de la API. Usa runCommand().', fix: { label: 'Usar runCommand', edits: [{ from: t[1], to: t[2], text: 'runCommand' }] } });
      // world.events (obsoleto) / eventos desconocidos
      if (t[0] === 'mc' && (w === 'world' || w === 'system') && !afterDot) {
        const dot = toks[k + 1], ev = toks[k + 2];
        if (dot && src[dot[1]] === '.' && ev && txt(ev) === 'events') d.push({ sev: 'error', from: ev[1], to: ev[2], msg: w + '.events ya no existe. Usa ' + w + '.afterEvents o ' + w + '.beforeEvents.', fix: { label: 'Usar afterEvents', edits: [{ from: ev[1], to: ev[2], text: 'afterEvents' }] } });
        if (dot && src[dot[1]] === '.' && ev && (txt(ev) === 'afterEvents' || txt(ev) === 'beforeEvents')) {
          const d2 = toks[k + 3], name = toks[k + 4];
          if (d2 && src[d2[1]] === '.' && name && (name[0] === 'prop' || name[0] === 'id' || name[0] === 'fn')) {
            const table = w === 'world' ? (txt(ev) === 'afterEvents' ? MC.AFTER : MC.BEFORE) : (txt(ev) === 'afterEvents' ? { scriptEventReceive: 1 } : MC.BEFORE);
            const nm = txt(name);
            if (!(nm in table) && !Object.keys(table).some((x) => x.startsWith(nm)) && !(w === 'world' && txt(ev) === 'afterEvents' && nm === 'scriptEventReceive')) {
              const near = Object.keys(table).map((x) => [x, lev(x.toLowerCase(), nm.toLowerCase())]).sort((a, b) => a[1] - b[1])[0];
              const hint = near && near[1] <= 4 ? " ¿Quisiste decir '" + near[0] + "'?" : '';
              d.push({ sev: 'warn', from: name[1], to: name[2], msg: "El evento '" + nm + "' no existe en " + w + '.' + txt(ev) + '.' + hint, fix: hint ? { label: "Usar '" + near[0] + "'", edits: [{ from: name[1], to: name[2], text: near[0] }] } : null });
            }
          }
        }
      }
      // catch vacío
      if (t[0] === 'kw' && w === 'catch') { let q = k + 1; if (toks[q] && src[toks[q][1]] === '(') { while (q < N && src[toks[q][1]] !== ')') q++; q++; } if (toks[q] && src[toks[q][1]] === '{' && toks[q + 1] && src[toks[q + 1][1]] === '}') d.push({ sev: 'warn', from: t[1], to: t[2], msg: 'Bloque catch vacío: el error se ignora en silencio. Al menos regístralo con console.warn.' }); }
      // Asignación dentro de if/while
      if (t[0] === 'kw' && (w === 'if' || w === 'while') && next && src[next[1]] === '(') {
        let dep = 0; for (let q = k + 1; q < N && q < k + 120; q++) { const c = src[toks[q][1]]; if (toks[q][0] === 'pun') { if (c === '(' || c === '[' || c === '{') dep++; else if (c === ')' || c === ']' || c === '}') { dep--; if (dep === 0) break; } } else if (toks[q][0] === 'op' && txt(toks[q]) === '=' && dep === 1) { d.push({ sev: 'warn', from: toks[q][1], to: toks[q][2], msg: '¿Querías comparar con ===? Aquí hay una asignación (=) dentro de la condición.', fix: { label: 'Cambiar a ===', edits: [{ from: toks[q][1], to: toks[q][2], text: '===' }] } }); break; } }
      }
      // Código inalcanzable tras return/throw
      if (t[0] === 'kw' && (w === 'return' || w === 'throw')) {
        let dep = 0, q = k + 1;
        for (; q < N; q++) { const c = src[toks[q][1]]; if (toks[q][0] === 'pun') { if (c === '(' || c === '[' || c === '{') dep++; else if (c === ')' || c === ']' || c === '}') { dep--; if (dep < 0) { q = -1; break; } } else if (c === ';' && dep === 0) break; } if (q > k + 400) { q = -1; break; } }
        if (q > 0 && q + 1 < N) { const nx = toks[q + 1]; const nw = txt(nx); if (nx[0] !== 'com' && !(nx[0] === 'pun' && src[nx[1]] === '}') && !['case', 'default', 'function'].includes(nw) && !(nx[0] === 'kw2' && nw === 'function')) { let e = nx[2]; for (let z = q + 2; z < N && toks[z][1] <= nx[2] + 0; z++) e = toks[z][2]; d.push({ sev: 'warn', from: nx[1], to: nx[2], msg: "Código inalcanzable: nunca se ejecuta porque hay un '" + w + "' antes.", tag: 'unused' }); } }
      }
      if (t[0] === 'com') { const m = /\b(TODO|FIXME|HACK)\b:?\s*(.*)/.exec(txt(t)); if (m) d.push({ sev: 'info', from: t[1] + m.index, to: t[1] + m.index + m[1].length, msg: m[1] + (m[2] ? ': ' + m[2].slice(0, 60) : '') }); }
    }
    // Reasignar una constante
    constNames.forEach((idx, name) => {
      for (let k = idx + 2; k < N; k++) {
        const t = toks[k]; if (!isIdTok(t) || txt(t) !== name) continue; const prev = toks[k - 1], next = toks[k + 1]; if (!next) continue;
        if (prev && (txt(prev) === '.' || ['const', 'let', 'var', 'function'].includes(txt(prev)))) continue;
        const nw = txt(next); if (next[0] === 'op' && /^(=|\+=|-=|\*=|\/=|%=|\+\+|--|\*\*=|\|\|=|&&=|\?\?=)$/.test(nw) && !(prev && prev[0] === 'op' && /^(\+\+|--)$/.test(txt(prev)))) {
          // evitar sombra evidente: si la constante se redeclara después, ignorar
          d.push({ sev: 'warn', from: t[1], to: t[2], msg: "'" + name + "' es una constante (const): esta reasignación provocará un error en ejecución. Usa 'let' si debe cambiar." }); break;
        }
      }
    });
    // Variables / imports sin usar
    const seenDecl = new Set();
    decls.forEach((x) => {
      if (x.exported || x.name.startsWith('_') || seenDecl.has(x.name + x.t[1])) return; seenDecl.add(x.name + x.t[1]);
      if ((ids.get(x.name) || 0) <= 1) d.push({ sev: 'warn', from: x.t[1], to: x.t[2], tag: 'unused', msg: (x.kind === 'import' ? "Import '" : x.fnDecl ? "'" : "'") + x.name + (x.kind === 'import' ? "' se importa pero nunca se usa." : "' se declara pero nunca se usa.") });
    });
    // Falta importar nombres de Minecraft
    const reported = new Set();
    for (let k = 0; k < N; k++) {
      const t = toks[k]; if (t[0] !== 'mc') continue; const w = txt(t); const prev = toks[k - 1];
      if (prev && prev[0] === 'pun' && src[prev[1]] === '.') continue;
      if (declared.has(w) || reported.has(w)) continue; const nx = toks[k + 1];
      if (nx && src[nx[1]] === ':' && prev && (src[prev[1]] === '{' || src[prev[1]] === ',')) continue; // clave de objeto
      reported.add(w);
      const mod = MC.IMPORTS[w]; const fix = addImportEdit(src, toks, w, mod);
      d.push({ sev: 'warn', from: t[1], to: t[2], msg: "'" + w + "' no está importado. Añade: import { " + w + ' } from "' + mod + '";', fix: { label: 'Importar ' + w, edits: fix.edits } });
    }
    return d;
  }
  function lev(a, b) { const m = a.length, n = b.length; if (!m) return n; if (!n) return m; let p = Array.from({ length: n + 1 }, (_, i) => i); for (let i = 1; i <= m; i++) { const c = [i]; for (let j = 1; j <= n; j++) c[j] = Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); p = c; } return p[n]; }

  function lintHTMLToks(src, toks) {
    const d = []; const stack = []; const VOID = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
    for (let k = 0; k < toks.length; k++) {
      const t = toks[k]; if (t[0] !== 'tag') continue; const s = src.slice(t[1], t[2]);
      if (/^<[!?]/.test(s) || s === '>' || s === '/>' || s === '?>') continue;
      const closing = s.startsWith('</'); const name = s.replace(/^<\/?/, '').toLowerCase(); if (!name) continue;
      if (closing) {
        const idx = stack.map((x) => x.name).lastIndexOf(name);
        if (idx < 0) d.push({ sev: 'error', from: t[1], to: t[2], msg: 'La etiqueta de cierre </' + name + '> no tiene apertura.' });
        else { for (let z = stack.length - 1; z > idx; z--) d.push({ sev: 'warn', from: stack[z].s, to: stack[z].e, msg: '<' + stack[z].name + '> no se cierra antes de </' + name + '>.' }); stack.length = idx; }
      } else {
        let q = k + 1, selfClose = false; while (toks[q] && toks[q][0] !== 'tag') q++;
        if (toks[q] && src.slice(toks[q][1], toks[q][2]) === '/>') selfClose = true;
        if (!selfClose && !VOID.has(name)) stack.push({ name, s: t[1], e: t[2] });
      }
    }
    stack.forEach((x) => d.push({ sev: 'error', from: x.s, to: x.e, msg: '<' + x.name + '> nunca se cierra.' }));
    return d.slice(0, 60);
  }

  function lintMcfunction(src) {
    const d = []; let pos = 0; const known = new Set(MC.MCFUNCTION_COMMANDS);
    for (const line of src.split('\n')) {
      const base = pos; pos += line.length + 1; const t = line.trim(); if (!t || t[0] === '#') continue; const lead = line.length - line.trimStart().length;
      if (t[0] === '/') d.push({ sev: 'warn', from: base + lead, to: base + lead + 1, msg: "En archivos .mcfunction los comandos van sin '/'.", fix: { label: "Quitar '/'", edits: [{ from: base + lead, to: base + lead + 1, text: '' }] } });
      const m = /^\/?([A-Za-z_]+)/.exec(t);
      if (m && !known.has(m[1].toLowerCase())) { const near = MC.MCFUNCTION_COMMANDS.map((x) => [x, lev(x, m[1].toLowerCase())]).sort((a, b) => a[1] - b[1])[0]; d.push({ sev: 'warn', from: base + lead + (t[0] === '/' ? 1 : 0), to: base + lead + (t[0] === '/' ? 1 : 0) + m[1].length, msg: "Comando desconocido '" + m[1] + "'." + (near[1] <= 2 ? " ¿Quisiste decir '" + near[0] + "'?" : ''), fix: near[1] <= 2 ? { label: "Usar '" + near[0] + "'", edits: [{ from: base + lead + (t[0] === '/' ? 1 : 0), to: base + lead + (t[0] === '/' ? 1 : 0) + m[1].length, text: near[0] }] } : null }); }
      let br = 0, cu = 0, q = false; for (let i = 0; i < line.length; i++) { const c = line[i]; if (c === '\\') { i++; continue; } if (c === '"') q = !q; if (q) continue; if (c === '[') br++; else if (c === ']') br--; else if (c === '{') cu++; else if (c === '}') cu--; }
      if (q) d.push({ sev: 'error', from: base + lead, to: base + line.length, msg: 'Comillas sin cerrar en este comando.' });
      else if (br !== 0) d.push({ sev: 'error', from: base + lead, to: base + line.length, msg: "Corchetes '[ ]' desbalanceados (selector sin cerrar)." });
      else if (cu !== 0) d.push({ sev: 'error', from: base + lead, to: base + line.length, msg: "Llaves '{ }' desbalanceadas (JSON sin cerrar)." });
    }
    return d;
  }
  function lintLang(src) {
    const d = []; let pos = 0; const keys = new Map();
    for (const line of src.split('\n')) {
      const base = pos; pos += line.length + 1; const t = line.trim(); if (!t || t.startsWith('#')) continue; const lead = line.length - line.trimStart().length; const eq = line.indexOf('=');
      if (eq < 0) { d.push({ sev: 'warn', from: base + lead, to: base + line.length, msg: "Línea sin '=': Minecraft la ignorará. Formato: clave=Texto" }); continue; }
      const key = line.slice(lead, eq).trim(); if (/\s/.test(key)) d.push({ sev: 'warn', from: base + lead, to: base + eq, msg: 'La clave contiene espacios.' });
      if (keys.has(key)) d.push({ sev: 'warn', from: base + lead, to: base + eq, msg: "Clave repetida '" + key + "' (primera en la línea " + keys.get(key) + ')' }); else keys.set(key, lineOf(src, base));
      if (!line.slice(eq + 1).trim()) d.push({ sev: 'info', from: base + lead, to: base + eq, msg: 'Texto vacío.' });
    }
    return d;
  }

  function lint(src, lang, ctx) {
    ctx = ctx || {}; if (!src || !src.trim()) return [];
    if (src.length > 600000) return [];
    let d = []; let toks = ctx.toks || tokenize(src, lang);
    try {
      if (lang === 'js' || lang === 'ts') {
        let syntaxErr = null;
        if (lang === 'js' && ctx.acorn) {
          try { ctx.acorn.parse(src, { ecmaVersion: 'latest', sourceType: 'module', allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true, allowImportExportEverywhere: true, allowHashBang: true }); }
          catch (e) { const p = typeof e.pos === 'number' ? e.pos : 0; syntaxErr = { sev: 'error', from: p, to: p + wordLenAt(src, p), msg: esAcorn(e.message || 'Error de sintaxis') }; }
        }
        const b = bracketLint(src, toks);
        if (!syntaxErr && b.length) { syntaxErr = b[0]; d = d.concat(b.slice(1)); } else d = d.concat(b);
        if (syntaxErr) d.push(syntaxErr);
        d = d.concat(lintScript(src, toks, lang));
      } else if (lang === 'json') {
        const r = parseJSON(src); d = r.diags.slice();
        if (r.ast && /manifest\.json$/i.test(ctx.name || '')) d = d.concat(lintManifest(r.ast));
      } else if (lang === 'html') d = lintHTMLToks(src, toks);
      else if (lang === 'css') d = bracketLint(src, toks);
      else if (lang === 'mcfunction') d = lintMcfunction(src);
      else if (lang === 'lang') d = lintLang(src);
    } catch (e) { /* un fallo del linter nunca debe romper el editor */ }
    d.sort((a, b) => a.from - b.from || SEV_RANK[b.sev] - SEV_RANK[a.sev]);
    // quitar duplicados exactos
    const out = []; const seen = new Set(); for (const x of d) { const k = x.from + ':' + x.sev + ':' + x.msg; if (!seen.has(k)) { seen.add(k); out.push(x); } }
    return out.slice(0, 300);
  }

  /* ====================================================================
   * Autocompletado (API de Minecraft + JS/TS + identificadores del archivo)
   * ==================================================================== */
  const T = MC.TYPES;
  T.ActionFormData = [['title', 'm', '(title: string)', 'Título del formulario', 'ActionFormData'], ['body', 'm', '(text: string)', 'Texto del cuerpo', 'ActionFormData'], ['button', 'm', '(text: string, iconPath?: string)', 'Añade un botón', 'ActionFormData'], ['show', 'm', '(player: Player): Promise<ActionFormResponse>', 'Muestra el formulario', 'Response']];
  T.ModalFormData = [['title', 'm', '(title: string)', 'Título', 'ModalFormData'], ['textField', 'm', '(label, placeholder, defaultValue?)', 'Campo de texto', 'ModalFormData'], ['toggle', 'm', '(label, defaultValue?)', 'Interruptor', 'ModalFormData'], ['slider', 'm', '(label, min, max, step, default?)', 'Control deslizante', 'ModalFormData'], ['dropdown', 'm', '(label, options: string[], default?)', 'Lista desplegable', 'ModalFormData'], ['submitButton', 'm', '(text: string)', 'Texto del botón enviar', 'ModalFormData'], ['show', 'm', '(player: Player): Promise<ModalFormResponse>', 'Muestra el formulario', 'Response']];
  T.MessageFormData = [['title', 'm', '(title: string)', 'Título', 'MessageFormData'], ['body', 'm', '(text: string)', 'Mensaje', 'MessageFormData'], ['button1', 'm', '(text: string)', 'Botón 1', 'MessageFormData'], ['button2', 'm', '(text: string)', 'Botón 2', 'MessageFormData'], ['show', 'm', '(player: Player): Promise<MessageFormResponse>', 'Muestra el formulario', 'Response']];
  T.Response = [['canceled', 'p', 'boolean', 'true si el jugador cerró el formulario'], ['selection', 'p', 'number', 'Botón elegido (ActionForm/MessageForm)'], ['formValues', 'p', 'any[]', 'Valores del ModalForm'], ['cancelationReason', 'p', 'FormCancelationReason', 'Motivo de la cancelación']];
  const GT = Object.assign({}, MC.GLOBAL_TYPE); const CONSTRUCT = { ItemStack: 'ItemStack', ActionFormData: 'ActionFormData', ModalFormData: 'ModalFormData', MessageFormData: 'MessageFormData' };
  const EFFECTS = 'speed slowness haste mining_fatigue strength instant_health instant_damage jump_boost nausea regeneration resistance fire_resistance water_breathing invisibility blindness night_vision hunger weakness poison wither health_boost absorption saturation levitation slow_falling darkness'.split(' ');
  const ENTITIES = 'zombie skeleton creeper spider enderman pig cow sheep chicken villager iron_golem wolf cat horse bat blaze ghast slime witch pillager warden allay armor_stand item xp_orb arrow snowball player husk drowned phantom piglin hoglin ender_dragon wither'.split(' ');
  const ITEMS = 'diamond diamond_sword diamond_pickaxe iron_sword netherite_sword bow arrow golden_apple apple bread cooked_beef stick stone dirt oak_log emerald gold_ingot iron_ingot torch tnt ender_pearl totem_of_undying elytra shield trident compass clock book name_tag'.split(' ');
  const DIMENSIONS = ['overworld', 'nether', 'the_end'];

  function varTypeByName(name) { for (const [re, t] of MC.VAR_TYPE) if (re.test(name)) return t; return null; }
  function normType(t) { if (!t) return null; t = t.trim(); if (/(After|Before)Event$/.test(t)) return 'Event'; if (T[t]) return t; if (t.endsWith('[]')) return T[t.slice(0, -2)] ? t : 'Array'; if (/^Array<(\w+)>$/.test(t)) return RegExp.$1 + '[]'; return null; }

  function parseChainForward(text) {
    // "world.getPlayers()[0].dimension" → [{name, call, args}]
    const segs = []; let i = 0; const n = text.length;
    const ident = /[A-Za-z_$][\w$]*/y; ident.lastIndex = 0; let m = ident.exec(text); if (!m || m.index !== 0) return segs; segs.push({ name: m[0] }); i = m[0].length;
    for (;;) {
      if (text[i] === '(') { const end = matchClose(text, i); if (end < 0) break; segs[segs.length - 1].call = true; segs[segs.length - 1].args = text.slice(i + 1, end); i = end + 1; continue; }
      if (text[i] === '[') { const end = matchClose(text, i); if (end < 0) break; segs.push({ index: true }); i = end + 1; continue; }
      if (text[i] === '!') { i++; continue; }
      if (text[i] === '?' && text[i + 1] === '.') i++;
      if (text[i] === '.') { ident.lastIndex = i + 1; m = ident.exec(text); if (!m || m.index !== i + 1) break; segs.push({ name: m[0] }); i += 1 + m[0].length; continue; }
      break;
    }
    return segs;
  }
  function matchClose(text, i) { const o = text[i], c = o === '(' ? ')' : o === '[' ? ']' : '}'; let dep = 0, q = null; for (let j = i; j < text.length; j++) { const ch = text[j]; if (q) { if (ch === '\\') j++; else if (ch === q) q = null; continue; } if (ch === '"' || ch === "'" || ch === '`') { q = ch; continue; } if (ch === o) dep++; else if (ch === c) { dep--; if (dep === 0) return j; } } return -1; }

  function chainStart(src, dotIdx) {
    // Recorre hacia atrás desde el '.' para encontrar el inicio de la expresión
    let i = dotIdx - 1;
    for (;;) {
      if (i < 0) break; let c = src[i];
      if (c === '!' ) { i--; continue; }
      if (c === ')' || c === ']') {
        const o = c === ')' ? '(' : '['; let dep = 0, j = i; for (; j >= 0; j--) { if (src[j] === c) dep++; else if (src[j] === o) { dep--; if (dep === 0) break; } if (i - j > 600) return -1; }
        if (j < 0) return -1; i = j - 1; if (c === ']') { continue; } // tras ( viene el identificador
        c = src[i]; if (!c || !/[\w$]/.test(c)) return -1; // llamada sin nombre
      }
      if (c && /[\w$]/.test(src[i])) { while (i >= 0 && /[\w$]/.test(src[i])) i--; }
      else return i + 1;
      // ¿hay otro eslabón antes? ('.' o '?.')
      if (src[i] === '.') { i--; if (src[i] === '?') i--; continue; }
      return i + 1;
    }
    return i + 1;
  }

  function resolveSegs(segs, src, depth) {
    depth = depth || 0; if (!segs.length || depth > 4) return null;
    let type = null; const s0 = segs[0];
    if (s0.name === 'new') return null;
    if (!s0.call) { if (GT[s0.name]) type = GT[s0.name]; else type = inferVarType(s0.name, src, depth); }
    else if (CONSTRUCT[s0.name]) type = CONSTRUCT[s0.name];
    if (!type) return null;
    for (let k = 1; k < segs.length; k++) {
      const sg = segs[k]; const base = type.endsWith('[]');
      if (sg.index) { type = base ? type.slice(0, -2) : null; if (!type) return null; continue; }
      const members = base ? T.Array : T[type]; if (!members) return null;
      const m = members.find((x) => x[0] === sg.name); if (!m) return null;
      let r = m[4] || null;
      if (sg.name === 'getComponent' && sg.call) { const a = (sg.args || '').replace(/["'`\s]/g, ''); r = MC.COMPONENTS[a] || MC.COMPONENTS[a.replace('.', '_')] || 'Component'; }
      if (base) { if (['find', 'at', 'pop', 'shift'].includes(sg.name)) r = type.slice(0, -2); else if (['filter', 'slice', 'sort', 'reverse', 'concat'].includes(sg.name)) r = type; else r = null; }
      type = normType(r); if (!type) return null;
    }
    return type;
  }
  function inferVarType(name, src, depth) {
    let m;
    const ann = new RegExp('\\b' + name + '\\s*\\??\\s*:\\s*([A-Z][\\w]*(?:\\[\\])?)', 'g'); let last = null; while ((m = ann.exec(src))) last = m[1]; const tn = normType(last); if (tn) return tn;
    const decl = new RegExp('(?:const|let|var)\\s+' + name + '\\s*(?::[^=;]+)?=\\s*(?:await\\s+)?(new\\s+)?([^;\\n]+)', 'g'); last = null; while ((m = decl.exec(src))) last = m; if (last) {
      if (last[1]) { const nm = /^([A-Za-z_$][\w$]*)/.exec(last[2]); if (nm && CONSTRUCT[nm[1]]) return CONSTRUCT[nm[1]]; }
      else { const segs = parseChainForward(last[2].trim()); const t = resolveSegs(segs, src, depth + 1); if (t) return t; }
    }
    const forOf = new RegExp('for\\s*\\(\\s*(?:const|let|var)\\s+' + name + '\\s+of\\s+([^)]+)\\)'); m = forOf.exec(src); if (m) { const t = resolveSegs(parseChainForward(m[1].trim()), src, depth + 1); if (t && t.endsWith('[]')) return t.slice(0, -2); }
    if (new RegExp('\\.(?:subscribe|forEach)\\(\\s*\\(?\\s*' + name + '\\b').test(src) && /^(e|ev|evt|event|data|result)$/i.test(name)) return 'Event';
    return varTypeByName(name);
  }

  function entryToItem(e, prefix) {
    const [n, k, sig, doc] = e; const it = { label: n, kind: k, detail: k === 'm' ? n + (sig || '()') : (sig || ''), doc: doc || '', insert: n };
    if (k === 'm') { it.insert = (sig && !sig.startsWith('()')) ? n + '($0)' : n + '()'; it.snippet = true; it.sig = sig; }
    return it;
  }
  function score(label, prefix) {
    if (!prefix) return 5; const l = label.toLowerCase(), p = prefix.toLowerCase();
    if (l === p) return -1; if (l.startsWith(p)) return label.startsWith(prefix) ? 0 : 1; if (l.includes(p)) return 3;
    // abreviatura camelCase: "gap" → getAllPlayers
    const caps = label.replace(/[^A-Z]/g, '').toLowerCase(); if (label[0] && (label[0].toLowerCase() + caps).startsWith(p)) return 2; return 99;
  }

  const JS_KEYWORDS = 'const let var function return if else for while do switch case break continue class extends new this import export from default try catch finally throw async await typeof instanceof in of null undefined true false yield static get set super delete void'.split(' ');
  const TS_KEYWORDS = JS_KEYWORDS.concat('interface type enum implements public private protected readonly abstract namespace declare as keyof unknown never any string number boolean'.split(' '));

  function suggest(src, caret, lang, ctx) {
    ctx = ctx || {}; let ws = caret; const wordRe = lang === 'mcfunction' ? /[A-Za-z0-9_:.@~^\/-]/ : /[A-Za-z0-9_$]/;
    while (ws > 0 && wordRe.test(src[ws - 1])) ws--; let prefix = src.slice(ws, caret);
    if (lang === 'js' || lang === 'ts') return suggestScript(src, caret, ws, prefix, lang, ctx);
    if (lang === 'mcfunction') return suggestMcfn(src, caret, ws, prefix, ctx);
    if (lang === 'json' || lang === 'css' || lang === 'html' || lang === 'md' || lang === 'text' || lang === 'lang') {
      if (prefix.length < 2) return null; const words = identsOf(src, prefix); const items = words.filter((w) => score(w, prefix) < 90 && w.toLowerCase() !== prefix.toLowerCase()).slice(0, 8).map((w) => ({ label: w, kind: 'v', detail: 'en este archivo', insert: w }));
      return items.length ? { items, from: ws, to: caret } : null;
    }
    return null;
  }
  function identsOf(src, skip) { const set = new Set(); const re = /[A-Za-z_$][\w$-]{2,}/g; let m; let cnt = 0; while ((m = re.exec(src)) && cnt++ < 6000) set.add(m[0]); set.delete(skip); return Array.from(set); }

  function inStringOrComment(toks, caret) { for (const [t, s, e] of toks) { if (s >= caret) break; if ((t === 'str' || t === 'com' || t === 'rx') && caret > s && caret <= e) { return t; } if (s > caret) break; } return null; }

  function suggestScript(src, caret, ws, prefix, lang, ctx) {
    const toks = ctx.toks || [];
    const inTok = inStringOrComment(toks, caret);
    if (inTok === 'com' || inTok === 'rx') return null;
    if (inTok === 'str') {
      // Sugerencias dentro de cadenas: ids de componentes y dimensiones
      const before = src.slice(Math.max(0, ws - 80), ws); let sm = /(getComponent|hasComponent)\(\s*["'`]$/.exec(before);
      if (sm) { const ids = ['minecraft:health', 'minecraft:inventory', 'minecraft:equippable', 'minecraft:movement', 'minecraft:ageable', 'minecraft:tameable', 'minecraft:rideable', 'minecraft:onfire', 'minecraft:durability', 'minecraft:enchantable', 'minecraft:cooldown', 'minecraft:food']; return mk(ids, 'ids', 'Componente'); }
      sm = /getDimension\(\s*["'`]$/.exec(before); if (sm) return mk(DIMENSIONS, 'ids', 'Dimensión');
      sm = /(?:addEffect|removeEffect|getEffect)\(\s*["'`]$/.exec(before); if (sm) return mk(EFFECTS, 'ids', 'Efecto');
      sm = /(?:spawnEntity)\(\s*["'`]$/.exec(before); if (sm) return mk(ENTITIES.map((x) => 'minecraft:' + x), 'ids', 'Entidad');
      sm = /(?:typeId\s*[!=]==?\s*|new ItemStack\(\s*)["'`]$/.exec(before); if (sm) return mk(ITEMS.map((x) => 'minecraft:' + x).concat(ENTITIES.map((x) => 'minecraft:' + x)), 'ids', 'Id');
      return null;
      function mk(list, kind, det) { const items = list.filter((x) => score(x, prefix) < 90).slice(0, 12).map((x) => ({ label: x, kind: 'k', detail: det, insert: x })); return items.length ? { items, from: ws, to: caret } : null; }
    }
    // acceso a miembros
    let dot = ws - 1; if (src[dot] === '.' ) {
      if (src[dot - 1] === '.') return null; // spread
      const st = chainStart(src, dot); if (st < 0 || st >= dot) return null;
      let chainText = src.slice(st, dot); // sin el punto final
      const segs = parseChainForward(chainText); if (!segs.length) return null;
      if (/^\d/.test(chainText)) return null;
      const type = resolveSegs(segs, src.slice(0, caret), 0); let members = null;
      if (type) { members = type.endsWith('[]') ? T.Array : T[type]; }
      else if (segs.length === 1 && T[segs[0].name] === undefined && !segs[0].call) { const t2 = inferStringy(segs[0].name, src); if (t2) members = T[t2]; }
      if (!members) { // sin tipo: ofrecer miembros del archivo (propiedades vistas)
        if (prefix.length < 1) return null; const re = new RegExp('\\.(' + prefix.replace(/[$]/g, '\\$') + '[\\w$]*)', 'g'); const set = new Set(); let m; while ((m = re.exec(src))) { if (m.index + 1 !== ws) set.add(m[1]); }
        const items = Array.from(set).filter((w) => w !== prefix).slice(0, 8).map((w) => ({ label: w, kind: 'p', detail: 'en este archivo', insert: w })); return items.length ? { items, from: ws, to: caret } : null;
      }
      let items = members.map((e) => ({ e, s: score(e[0], prefix) })).filter((x) => x.s < 90).sort((a, b) => a.s - b.s || a.e[0].localeCompare(b.e[0])).slice(0, 40).map((x) => entryToItem(x.e));
      items = items.filter((x) => !(x.label === prefix && x.kind !== 'm'));
      return items.length ? { items, from: ws, to: caret, member: true } : null;
    }
    if (prefix.length < 1 || /^\d/.test(prefix)) return null;
    // ¿es el nombre de una declaración? (const |let |function ...)
    const lineStart = src.lastIndexOf('\n', ws - 1) + 1; const lineBefore = src.slice(lineStart, ws);
    if (/\b(?:const|let|var|function|class|interface|type|enum)\s+$/.test(lineBefore)) return null;
    const out = []; const seen = new Set();
    const add = (it, s) => { if (seen.has(it.label + it.kind)) return; seen.add(it.label + it.kind); out.push({ it, s }); };
    if (prefix.length >= 2 || true) {
      MC.SNIPPETS.forEach((sn) => { if (!sn.l.includes(lang)) return; const s = score(sn.p, prefix); if (s < 90) add({ label: sn.p, kind: 's', detail: sn.n, doc: sn.d, insert: sn.t, snippet: true, full: true }, s - 0.5); });
    }
    Object.keys(MC.IMPORTS).forEach((nm) => { const s = score(nm, prefix); if (s < 90 && nm !== prefix) add({ label: nm, kind: (GT[nm] && !/^[A-Z]/.test(nm)) ? 'v' : 'c', detail: MC.IMPORTS[nm], doc: 'Minecraft Script API', insert: nm, autoImport: { name: nm, module: MC.IMPORTS[nm] } }, s - 0.2); });
    ['Math', 'console', 'Object', 'JSON', 'Number', 'Array', 'String', 'Promise', 'Map', 'Set', 'Date'].forEach((nm) => { const s = score(nm, prefix); if (s < 90 && nm !== prefix) add({ label: nm, kind: 'c', detail: 'JavaScript', insert: nm }, s + 0.4); });
    (lang === 'ts' ? TS_KEYWORDS : JS_KEYWORDS).forEach((kw) => { const s = score(kw, prefix); if (s < 90 && kw !== prefix) add({ label: kw, kind: 'w', detail: 'palabra clave', insert: kw }, s + 0.6); });
    identsOf(src, prefix).forEach((w) => { const s = score(w, prefix); if (s < 90 && w !== prefix && !/^(const|let|var)$/.test(w)) add({ label: w, kind: 'v', detail: 'en este archivo', insert: w }, s + 0.3); });
    out.sort((a, b) => a.s - b.s || a.it.label.length - b.it.label.length);
    const items = out.slice(0, 30).map((x) => x.it);
    return items.length ? { items, from: ws, to: caret } : null;
  }
  function inferStringy(name, src) { return null; }

  function suggestMcfn(src, caret, ws, prefix, ctx) {
    const lineStart = src.lastIndexOf('\n', caret - 1) + 1; const before = src.slice(lineStart, caret); const words = before.trimStart().replace(/^\//, '').split(/\s+/);
    if (before.trim().startsWith('#')) return null;
    const items = []; const push = (arr, kind, det) => arr.forEach((x) => { const s = score(x, prefix); if (s < 90 && x !== prefix) items.push({ it: { label: x, kind, detail: det, insert: x }, s }); });
    if (words.length <= 1) { push(MC.MCFUNCTION_COMMANDS, 'f', 'comando'); MC.MCFUNCTION_SNIPPETS.forEach((sn) => { const s = score(sn.p, prefix); if (s < 90) items.push({ it: { label: sn.p, kind: 's', detail: sn.n, doc: sn.d, insert: sn.t, snippet: true, full: true }, s: s - 0.5 }); }); }
    else {
      const cmd = words[0].toLowerCase(); const sel = /@[a-z]*\[[^\]]*$/.test(before);
      if (prefix.startsWith('@')) push(['@a', '@e', '@p', '@r', '@s', '@n', '@initiator'], 'k', 'selector');
      else if (sel) push(Array.from(SELECTOR_KEYS), 'p', 'argumento de selector');
      else if (cmd === 'execute') push(MC.EXEC_SUB, 'k', 'subcomando de execute');
      else if (cmd === 'effect') push(EFFECTS, 'k', 'efecto'); else if (cmd === 'summon') push(ENTITIES.map((x) => 'minecraft:' + x), 'k', 'entidad'); else if (cmd === 'give') push(ITEMS.map((x) => 'minecraft:' + x), 'k', 'objeto');
      else if (cmd === 'gamemode') push(['survival', 'creative', 'adventure', 'spectator'], 'k', 'modo');
      else if (cmd === 'time') push(['set', 'add', 'query', 'day', 'night', 'noon', 'midnight'], 'k', 'time'); else if (cmd === 'weather') push(['clear', 'rain', 'thunder'], 'k', 'clima');
    }
    items.sort((a, b) => a.s - b.s); const out = items.slice(0, 20).map((x) => x.it);
    return out.length && (prefix.length >= 1 || words.length > 1) ? { items: out, from: ws, to: caret } : null;
  }

  /* Snippets: ${1:texto} y $0 → { text, sel:[[start,end],...] } */
  function expandSnippet(tpl, indent) {
    let text = ''; const stops = []; let i = 0;
    while (i < tpl.length) {
      const c = tpl[i];
      if (c === '$' && tpl[i + 1] === '{') { const m = /^\$\{(\d+)(?::([^}]*))?\}/.exec(tpl.slice(i)); if (m) { const ph = m[2] || ''; stops.push({ n: +m[1], s: text.length, e: text.length + ph.length }); text += ph; i += m[0].length; continue; } }
      if (c === '$' && /\d/.test(tpl[i + 1] || '')) { stops.push({ n: +tpl[i + 1], s: text.length, e: text.length }); i += 2; continue; }
      text += c; i++;
    }
    if (indent) { let off = 0; const adj = (p) => p; const lines = text.split('\n'); let acc = 0; const map = []; let out = ''; lines.forEach((ln, li) => { map.push(acc); out += (li ? '\n' + indent : '') + ln; acc += ln.length + 1; }); const shift = (pos) => { let li = 0; for (let q = 0; q < map.length; q++) if (map[q] <= pos) li = q; return pos + li * indent.length; }; stops.forEach((s) => { s.s = shift(s.s); s.e = shift(s.e); }); text = out; }
    stops.sort((a, b) => (a.n === 0 ? 99 : a.n) - (b.n === 0 ? 99 : b.n));
    return { text, stops };
  }

  /* Reindentar JS/TS/CSS/JSON según llaves */
  function reindent(src, lang, unit) {
    unit = unit || '  '; const toks = tokenize(src, lang === 'json' ? 'json' : lang); const starts = []; let p = 0; src.split('\n').forEach((l) => { starts.push(p); p += l.length + 1; });
    const lines = src.split('\n'); const protectedLines = new Set();
    toks.forEach(([t, s, e]) => { if (t === 'str' || t === 'com') { const l1 = lineOf(src, s), l2 = lineOf(src, e - 1); for (let l = l1 + 1; l <= l2; l++) protectedLines.add(l); } });
    const depthAt = new Array(lines.length).fill(0); let dep = 0; const open = '([{', close = ')]}';
    const events = toks.filter((t) => t[0] === 'pun' || (lang === 'css' && t[0] === 'pun')).map((t) => [t[1], src[t[1]]]);
    let ei = 0; const out = [];
    for (let li = 0; li < lines.length; li++) {
      const ls = starts[li], le = ls + lines[li].length; const trimmed = lines[li].trim();
      // cierres iniciales en la línea
      let lead = 0; while (lead < trimmed.length && close.includes(trimmed[lead])) lead++;
      const d0 = Math.max(0, dep - lead);
      if (protectedLines.has(li + 1)) out.push(lines[li]); else out.push(trimmed ? unit.repeat(d0) + trimmed : '');
      while (ei < events.length && events[ei][0] < le + 1) { const c = events[ei][1]; if (open.includes(c)) dep++; else if (close.includes(c)) dep = Math.max(0, dep - 1); ei++; }
    }
    return out.join('\n');
  }

  const API = { LANGS, langOf, extOf, tokenize, render, lint, suggest, expandSnippet, parseJSON, reindent, addImportEdit, esc, lineOf, SEV_RANK, lev };
  root.EC = API; if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);

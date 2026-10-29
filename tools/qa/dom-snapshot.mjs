#!/usr/bin/env node
/**
 * Snapshot do "contrato público" de cada página HTML.
 *
 * Captura o que suítes de automação de terceiros usam como seletor:
 * ids, names, data-*, aria-label, placeholder, type e textos de
 * botões/labels/links/títulos. Scripts e estilos são ignorados de
 * propósito: a reestruturação muda ONDE eles vivem, não o DOM.
 *
 * Uso:
 *   node tools/qa/dom-snapshot.mjs --root <dir> --out <arquivo.json>
 *   node tools/qa/dom-snapshot.mjs --root <dir> --compare <baseline.json>
 */
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);
const ROOT = path.resolve(args.root || '.');

// Ignorados apenas na raiz do projeto (pages/tools é conteúdo!)
const IGNORED_ROOT_DIRS = new Set(['node_modules', '.git', '.idea', 'dist', 'tools', 'src', 'server']);
const TRACKED_ATTRS = ['id', 'name', 'type', 'for', 'role', 'aria-label', 'placeholder', 'value', 'href'];
const TEXT_TAGS = ['button', 'label', 'a', 'h1', 'h2', 'h3', 'h4', 'option', 'th', 'legend', 'summary', 'title'];

function listHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return dir === ROOT && IGNORED_ROOT_DIRS.has(e.name) ? [] : listHtml(path.join(dir, e.name));
    return e.name.endsWith('.html') ? [path.join(dir, e.name)] : [];
  });
}

const clean = (s) => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

function parseAttrs(raw = '') {
  const attrs = {};
  const re = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = re.exec(raw))) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  return attrs;
}

function snapshot(file) {
  let html = fs.readFileSync(file, 'utf8');
  html = html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');

  const elements = [];
  const tagRe = /<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?>/g;
  let m;
  while ((m = tagRe.exec(html))) {
    const tag = m[1].toLowerCase();
    const attrs = parseAttrs(m[2]);
    const picked = {};
    for (const [k, v] of Object.entries(attrs)) {
      if (TRACKED_ATTRS.includes(k) || k.startsWith('data-')) picked[k] = v;
    }
    if (Object.keys(picked).length) elements.push(`${tag} ${JSON.stringify(picked)}`);
  }

  const texts = [];
  for (const tag of TEXT_TAGS) {
    const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
    while ((m = re.exec(html))) {
      const t = clean(m[1]);
      if (t) texts.push(`${tag}: ${t}`);
    }
  }
  return { elements: elements.sort(), texts: texts.sort() };
}

const result = {};
for (const file of listHtml(ROOT).sort()) {
  result[path.relative(ROOT, file).split(path.sep).join('/')] = snapshot(file);
}

if (args.out) {
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(result, null, 1));
  console.log(`Snapshot de ${Object.keys(result).length} páginas salvo em ${args.out}`);
}

if (args.compare) {
  const base = JSON.parse(fs.readFileSync(args.compare, 'utf8'));
  let diffs = 0;
  const pages = new Set([...Object.keys(base), ...Object.keys(result)]);
  for (const p of [...pages].sort()) {
    if (!base[p]) { console.log(`+ página nova: ${p}`); diffs++; continue; }
    if (!result[p]) { console.log(`- página removida: ${p}`); diffs++; continue; }
    for (const key of ['elements', 'texts']) {
      const a = new Set(base[p][key]);
      const b = new Set(result[p][key]);
      const removed = [...a].filter((x) => !b.has(x));
      const added = [...b].filter((x) => !a.has(x));
      if (removed.length || added.length) {
        console.log(`\n${p} [${key}]`);
        removed.forEach((x) => console.log(`  - ${x}`));
        added.forEach((x) => console.log(`  + ${x}`));
        diffs += removed.length + added.length;
      }
    }
  }
  console.log(diffs ? `\n${diffs} diferença(s) no contrato do DOM.` : 'Contrato do DOM idêntico ao baseline.');
  process.exitCode = diffs ? 1 : 0;
}

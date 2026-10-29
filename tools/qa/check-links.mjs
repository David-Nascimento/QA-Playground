#!/usr/bin/env node
/**
 * Verifica href/src locais de todas as páginas HTML.
 * Uso: node tools/qa/check-links.mjs [--root <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';

const rootArg = process.argv.indexOf('--root');
const ROOT = path.resolve(rootArg > -1 ? process.argv[rootArg + 1] : '.');
// Ignorados apenas na raiz do projeto (pages/tools é conteúdo!)
const IGNORED_ROOT_DIRS = new Set(['node_modules', '.git', '.idea', 'dist', 'tools', 'src', 'server']);

function listHtml(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return dir === ROOT && IGNORED_ROOT_DIRS.has(e.name) ? [] : listHtml(path.join(dir, e.name));
    return e.name.endsWith('.html') ? [path.join(dir, e.name)] : [];
  });
}

const broken = [];
for (const file of listHtml(ROOT)) {
  const html = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  const re = /\s(?:href|src)\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const url = m[1];
    if (/^(?:[a-z]+:|\/\/|#|\$\{|javascript:)/i.test(url)) continue;
    const clean = url.split(/[?#]/)[0];
    if (!clean) continue;
    const target = clean.startsWith('/') ? path.join(ROOT, clean) : path.join(path.dirname(file), clean);
    if (!fs.existsSync(target)) broken.push(`${path.relative(ROOT, file)} -> ${url}`);
  }
}

[...new Set(broken)].sort().forEach((b) => console.log(b));
console.log(`\n${new Set(broken).size} link(s) quebrado(s).`);
process.exitCode = broken.length ? 1 : 0;

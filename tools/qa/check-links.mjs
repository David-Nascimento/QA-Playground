#!/usr/bin/env node
/**
 * Verifica href/src locais de todas as páginas HTML.
 * Uso: node tools/qa/check-links.mjs [--root <dir>]
 *
 * Links quebrados de propósito (exercícios) ficam em tools/qa/links-allowlist.txt.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

const allowFile = path.join(path.dirname(fileURLToPath(import.meta.url)), 'links-allowlist.txt');
const allowed = new Set(
  fs.existsSync(allowFile)
    ? fs.readFileSync(allowFile, 'utf8').split(/\r?\n/)
        .map((l) => l.replace(/#.*$/, '').trim())
        .filter(Boolean)
        .map((l) => l.replace(/\s+->\s+/, ' -> '))
    : []
);

const broken = [];
for (const file of listHtml(ROOT)) {
  const html = fs
    .readFileSync(file, 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    // exemplos de código (texto escapado) não são links de verdade
    .replace(/<pre\b[\s\S]*?<\/pre>/gi, '')
    .replace(/<code\b[\s\S]*?<\/code>/gi, '');
  const re = /\s(?:href|src)\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(html))) {
    const url = m[1];
    if (/^(?:[a-z]+:|\/\/|#|\$\{|javascript:)/i.test(url)) continue;
    const clean = url.split(/[?#]/)[0];
    if (!clean) continue;
    const target = clean.startsWith('/') ? path.join(ROOT, clean) : path.join(path.dirname(file), clean);
    const entry = `${path.relative(ROOT, file).split(path.sep).join('/')} -> ${url}`;
    if (!fs.existsSync(target) && !allowed.has(entry)) broken.push(entry);
  }
}

[...new Set(broken)].sort().forEach((b) => console.log(b));
console.log(`\n${new Set(broken).size} link(s) quebrado(s).`);
process.exitCode = broken.length ? 1 : 0;

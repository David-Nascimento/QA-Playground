#!/usr/bin/env node
/**
 * Monta o site estático em dist/public.
 *
 *   public/                 -> dist/public/        (HTML, assets, favicon)
 *   src/client/legacy/      -> dist/public/js/     (JS ainda não migrado para TS)
 *   src/styles/legacy/      -> dist/public/css/    (CSS ainda não migrado para SCSS)
 *   LICENSE                 -> dist/public/LICENSE (linkado no rodapé das páginas)
 *
 * Arquivos .html de public/ passam pelos partials de src/partials
 * (<!-- @include header -->); ver src/partials/README.md.
 *
 * O TypeScript (tsc) e o SCSS (sass) escrevem direto em dist/public/js e
 * dist/public/css; este script cuida apenas do que é copiado.
 *
 * Uso:
 *   node tools/build/build-site.mjs           build único
 *   node tools/build/build-site.mjs --watch   recopia arquivos alterados
 *   node tools/build/build-site.mjs --clean   apaga dist/public antes
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'dist', 'public');

const PUBLIC_DIR = path.join(ROOT, 'public');
const PARTIALS_DIR = path.join(ROOT, 'src', 'partials');

/** Pares origem -> destino copiados para o site. */
export const COPY_RULES = [
  { from: PUBLIC_DIR, to: OUT },
  { from: path.join(ROOT, 'src', 'client', 'legacy'), to: path.join(OUT, 'js') },
  { from: path.join(ROOT, 'src', 'styles', 'legacy'), to: path.join(OUT, 'css') },
  { from: path.join(ROOT, 'LICENSE'), to: path.join(OUT, 'LICENSE') },
];

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

// ---------------------------------------------------------------------------
// Partials
// ---------------------------------------------------------------------------

// O lookahead preserva o \r da linha original (arquivos CRLF)
const INCLUDE_RE = /^([ \t]*)<!-- @include ([\w-]+) -->[ \t]*(?=\r?$)/gm;

function loadPartial(name) {
  const file = path.join(PARTIALS_DIR, `${name}.html`);
  if (!fs.existsSync(file)) throw new Error(`partial inexistente: src/partials/${name}.html`);
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').trimEnd();
}

/**
 * Renderiza uma página de public/: injeta partials, ajusta {{root}} e marca
 * o link da página atual com aria-current="page".
 * @param {string} html conteúdo da página
 * @param {string} pagePath caminho da página relativo a public/ (ex.: pages/junior/index.html)
 */
export function renderPage(html, pagePath) {
  const dir = path.posix.dirname(pagePath);
  const eol = html.includes('\r\n') ? '\r\n' : '\n';

  /** {{root}}alvo -> caminho relativo mínimo da página até o alvo */
  const resolve = (target) => path.posix.relative(dir, target) || path.posix.basename(target);

  return html.replace(INCLUDE_RE, (_line, indent, name) =>
    loadPartial(name)
      .replace(/(href|src)="\{\{root\}\}([^"]*)"/g, (_m, attr, target) => {
        const current = attr === 'href' && target === pagePath ? ' aria-current="page"' : '';
        return `${attr}="${resolve(target)}"${current}`;
      })
      .split('\n')
      .map((line) => (line ? indent + line : line))
      .join(eol)
      .trimStart() // a indentação da 1ª linha já vem da linha do comentário
      .replace(/^/, indent)
  );
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (src.endsWith('.html') && src.startsWith(PUBLIC_DIR + path.sep)) {
    const pagePath = path.relative(PUBLIC_DIR, src).split(path.sep).join('/');
    fs.writeFileSync(dest, renderPage(fs.readFileSync(src, 'utf8'), pagePath));
  } else {
    fs.copyFileSync(src, dest);
  }
}

/** Re-renderiza todas as páginas (quando um partial muda). */
function renderAllPages(dir = PUBLIC_DIR) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const src = path.join(dir, entry.name);
    if (entry.isDirectory()) renderAllPages(src);
    else if (entry.name.endsWith('.html')) copyFile(src, path.join(OUT, path.relative(PUBLIC_DIR, src)));
  }
}

function copyTree(from, to) {
  if (fs.statSync(from).isFile()) {
    copyFile(from, to);
    return 1;
  }
  let count = 0;
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) count += copyTree(src, dest);
    else {
      copyFile(src, dest);
      count++;
    }
  }
  return count;
}

export function build({ clean = false } = {}) {
  if (clean) fs.rmSync(OUT, { recursive: true, force: true });
  let total = 0;
  for (const { from, to } of COPY_RULES) total += copyTree(from, to);
  console.log(`[site] ${total} arquivos copiados para ${rel(OUT)}`);
}

function watch() {
  for (const { from, to } of COPY_RULES) {
    const single = fs.statSync(from).isFile();
    fs.watch(from, { recursive: !single }, (_event, name) => {
      if (!name) return;
      const src = single ? from : path.join(from, name);
      const dest = single ? to : path.join(to, name);
      try {
        if (fs.existsSync(src) && fs.statSync(src).isFile()) {
          copyFile(src, dest);
          console.log(`[site] ${rel(src)} -> ${rel(dest)}`);
        } else if (!fs.existsSync(src)) {
          fs.rmSync(dest, { recursive: true, force: true });
          console.log(`[site] removido ${rel(dest)}`);
        }
      } catch (err) {
        console.error(`[site] erro ao copiar ${rel(src)}:`, err.message);
      }
    });
  }
  fs.watch(PARTIALS_DIR, () => {
    try {
      renderAllPages();
      console.log('[site] partial alterado: páginas re-renderizadas');
    } catch (err) {
      console.error('[site] erro ao renderizar partials:', err.message);
    }
  });
  console.log('[site] observando public/, src/partials e pastas legacy...');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  build({ clean: args.includes('--clean') });
  if (args.includes('--watch')) watch();
}

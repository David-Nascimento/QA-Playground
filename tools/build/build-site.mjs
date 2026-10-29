#!/usr/bin/env node
/**
 * Monta o site estático em dist/public.
 *
 *   public/                 -> dist/public/        (HTML, assets, favicon)
 *   src/client/legacy/      -> dist/public/js/     (JS ainda não migrado para TS)
 *   src/styles/legacy/      -> dist/public/css/    (CSS ainda não migrado para SCSS)
 *   LICENSE                 -> dist/public/LICENSE (linkado no rodapé das páginas)
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

/** Pares origem -> destino copiados para o site. */
export const COPY_RULES = [
  { from: path.join(ROOT, 'public'), to: OUT },
  { from: path.join(ROOT, 'src', 'client', 'legacy'), to: path.join(OUT, 'js') },
  { from: path.join(ROOT, 'src', 'styles', 'legacy'), to: path.join(OUT, 'css') },
  { from: path.join(ROOT, 'LICENSE'), to: path.join(OUT, 'LICENSE') },
];

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
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
  console.log('[site] observando public/ e pastas legacy...');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  build({ clean: args.includes('--clean') });
  if (args.includes('--watch')) watch();
}

#!/usr/bin/env node
/**
 * Smoke test de contrato da API mock.
 * Executa a mesma sequência de requisições contra o adaptador Express e o
 * adaptador Vercel, normaliza campos voláteis (token, datas) e:
 *   --out <arq>      salva o resultado como baseline
 *   --compare <arq>  compara com um baseline salvo
 * Os caminhos dos módulos compilados podem ser trocados com
 *   --express <modulo> --vercel <modulo>
 */
import { fork } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (k, d) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : d);

const ADAPTERS = {
  express: opt('express', 'api/js/index.js'),
  vercel: opt('vercel', 'api/js/[...path].js'),
};

// Sequência fixa (o estado em memória evolui ao longo dela).
const STEPS = [
  ['GET', '/api/health'],
  ['GET', '/api'],
  ['GET', '/api/docs'],
  ['GET', '/api/postman-collection'],
  ['GET', '/api/nao-existe'],
  ['POST', '/api/auth/login', { body: {} }],
  ['POST', '/api/auth/login', { body: { email: 'admin@example.com', password: 'errada' } }],
  ['POST', '/api/auth/login', { body: { email: 'ADMIN@example.com', password: 'admin123' }, save: 'admin' }],
  ['POST', '/api/auth/login', { body: { email: 'user@example.com', password: 'user123' }, save: 'user' }],
  ['POST', '/api/auth/login', { body: { email: 'viewer@example.com', password: 'viewer123' }, save: 'viewer' }],
  ['GET', '/api/auth/me'],
  ['GET', '/api/auth/me', { as: 'user' }],
  ['GET', '/api/auth/me', { headers: { authorization: 'Bearer invalido' } }],
  ['POST', '/api/auth/validate', { as: 'admin' }],
  ['POST', '/api/auth/validate', { body: {} }],
  ['GET', '/api/users'],
  ['GET', '/api/users', { as: 'admin' }],
  ['GET', '/api/users', { as: 'user' }],
  ['GET', '/api/users', { as: 'viewer' }],
  ['GET', '/api/users/1', { as: 'admin' }],
  ['GET', '/api/users/1', { as: 'user' }],
  ['GET', '/api/users/999', { as: 'admin' }],
  ['GET', '/api/users/abc', { as: 'admin' }],
  ['POST', '/api/users', { as: 'user', body: { name: 'X', email: 'x@x.com' } }],
  ['POST', '/api/users', { as: 'admin', body: { name: 'Sem email' } }],
  ['POST', '/api/users', { as: 'admin', body: { name: 'Dup', email: 'user@example.com' } }],
  ['POST', '/api/users', { as: 'admin', body: { name: 'Novo', email: 'novo@example.com', role: 'user' } }],
  ['PUT', '/api/users/2', { as: 'admin', body: { name: 'Editado' } }],
  ['PUT', '/api/users/2', { as: 'viewer', body: { name: 'Hack' } }],
  ['PUT', '/api/users/999', { as: 'admin', body: { name: 'X' } }],
  ['DELETE', '/api/users/3', { as: 'user' }],
  ['DELETE', '/api/users/3', { as: 'admin' }],
  ['DELETE', '/api/users/3', { as: 'admin' }],
  ['GET', '/api/orders'],
  ['GET', '/api/orders', { as: 'admin' }],
  ['GET', '/api/orders', { as: 'user' }],
  ['GET', '/api/orders/1', { as: 'user' }],
  ['GET', '/api/orders/1', { as: 'viewer' }],
  ['GET', '/api/orders/999', { as: 'admin' }],
  ['POST', '/api/orders', { as: 'user', body: {} }],
  ['POST', '/api/orders', { as: 'user', body: { items: [{ productId: 1 }] } }],
  ['POST', '/api/orders', { as: 'user', body: { items: [{ productId: 1, productName: 'A', quantity: -1, price: 10 }] } }],
  ['POST', '/api/orders', { as: 'user', body: { items: [{ productId: 1, productName: 'A', quantity: 2, price: -1 }] } }],
  ['POST', '/api/orders', { as: 'user', body: { items: [{ productId: 1, productName: 'A', quantity: 2, price: 10 }] } }],
  ['PUT', '/api/orders/1', { as: 'admin', body: { status: 'shipped' } }],
  ['PUT', '/api/orders/1', { as: 'viewer', body: { status: 'cancelled' } }],
  ['PUT', '/api/orders/1', { as: 'admin', body: { status: 'invalido' } }],
  ['DELETE', '/api/orders/2', { as: 'user' }],
  ['DELETE', '/api/orders/2', { as: 'admin' }],
  ...['error-400', 'error-401', 'error-403', 'error-404', 'error-409', 'error-422', 'error-429', 'error-500', 'error-503', 'inexistente'].flatMap((s) => [
    ['GET', `/api/users?scenario=${s}`, { as: 'admin' }],
    ['GET', '/api/orders', { as: 'admin', headers: { 'x-mock-scenario': s } }],
  ]),
  ['POST', '/api/auth/logout', { as: 'user' }],
  ['GET', '/api/auth/me', { as: 'user' }],
  ['POST', '/api/auth/logout'],
];

const normalize = (text) =>
  text
    .replace(/fake-jwt-[A-Za-z0-9+/=]+/g, '<TOKEN>')
    .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z/g, '<DATE>')
    .replace(/"uptime":\s*[\d.]+/g, '"uptime":"<N>"');

async function run(kind, modPath, port) {
  const child = fork(path.join(here, 'api-host.cjs'), [kind, modPath, String(port)], { silent: true });
  await new Promise((res, rej) => {
    child.on('message', (m) => m === 'ready' && res());
    child.on('exit', (c) => rej(new Error(`${kind} saiu com código ${c}`)));
    setTimeout(() => rej(new Error(`${kind} não subiu`)), 15000);
  });
  const tokens = {};
  const out = [];
  try {
    for (const [method, url, o = {}] of STEPS) {
      const headers = { 'content-type': 'application/json', ...(o.headers || {}) };
      if (o.as) headers.authorization = `Bearer ${tokens[o.as]}`;
      const r = await fetch(`http://127.0.0.1:${port}${url}`, {
        method,
        headers,
        body: o.body !== undefined ? JSON.stringify(o.body) : undefined,
      });
      const text = await r.text();
      if (o.save) tokens[o.save] = text.match(/fake-jwt-[A-Za-z0-9+/=]+/)?.[0];
      out.push({ req: `${method} ${url}${o.as ? ` (as ${o.as})` : ''}${o.body ? ` ${JSON.stringify(o.body)}` : ''}${o.headers ? ` ${JSON.stringify(o.headers)}` : ''}`, status: r.status, body: normalize(text) });
    }
  } finally {
    child.kill();
  }
  return out;
}

const result = {
  express: await run('express', ADAPTERS.express, 39101),
  vercel: await run('vercel', ADAPTERS.vercel, 39102),
};

// Divergências entre os dois adaptadores (devem ser zero depois da Fase 1)
const divergent = result.express.filter((e, i) => e.status !== result.vercel[i].status || e.body !== result.vercel[i].body);
console.log(`${STEPS.length} requisições por adaptador; ${divergent.length} divergência(s) Express x Vercel.`);
divergent.forEach((e) => {
  const v = result.vercel[result.express.indexOf(e)];
  console.log(`  ${e.req}\n    express ${e.status} ${e.body.slice(0, 160)}\n    vercel  ${v.status} ${v.body.slice(0, 160)}`);
});

if (opt('out')) {
  fs.writeFileSync(opt('out'), JSON.stringify(result, null, 1));
  console.log(`Baseline salvo em ${opt('out')}`);
}
if (opt('compare')) {
  const base = JSON.parse(fs.readFileSync(opt('compare'), 'utf8'));
  let diffs = 0;
  for (const kind of ['express', 'vercel']) {
    result[kind].forEach((e, i) => {
      const b = base[kind][i];
      if (!b || b.status !== e.status || b.body !== e.body) {
        diffs++;
        console.log(`\n[${kind}] ${e.req}\n  antes  ${b?.status} ${b?.body.slice(0, 200)}\n  depois ${e.status} ${e.body.slice(0, 200)}`);
      }
    });
  }
  console.log(diffs ? `\n${diffs} diferença(s) em relação ao baseline.` : 'API idêntica ao baseline.');
  process.exitCode = diffs ? 1 : 0;
}

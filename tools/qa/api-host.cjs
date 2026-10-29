/**
 * Sobe a API mock em uma porta, usando um dos dois "adaptadores":
 *   express <modulo>  -> o app Express (uso local)
 *   vercel  <modulo>  -> o handler serverless da Vercel, emulando o runtime dela
 * Uso: node tools/qa/api-host.cjs <express|vercel> <caminho-do-modulo> <porta>
 */
const http = require('node:http');
const path = require('node:path');

const [, , kind, modPath, port] = process.argv;
const mod = require(path.resolve(modPath));
const exported = mod.default || mod;

if (kind === 'express') {
  exported.listen(Number(port), () => process.send && process.send('ready'));
} else {
  // Emula o runtime Node da Vercel: query parseada, body JSON parseado,
  // helpers res.status/json/send e req.query.path para rotas [...path].
  http
    .createServer((req, res) => {
      let raw = '';
      req.on('data', (c) => (raw += c));
      req.on('end', async () => {
        const url = new URL(req.url, 'http://localhost');
        const query = Object.fromEntries(url.searchParams);
        const segments = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
        if (segments.length) query.path = segments;
        req.query = query;
        try { req.body = raw ? JSON.parse(raw) : undefined; } catch { req.body = raw; }
        res.status = (c) => { res.statusCode = c; return res; };
        res.json = (b) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(b)); return res; };
        res.send = (b) => { res.end(typeof b === 'string' || Buffer.isBuffer(b) ? b : JSON.stringify(b)); return res; };
        try { await exported(req, res); } catch (e) { res.statusCode = 599; res.end(String(e)); }
      });
    })
    .listen(Number(port), () => process.send && process.send('ready'));
}

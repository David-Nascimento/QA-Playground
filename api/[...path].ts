/**
 * Função serverless da Vercel para /api/*.
 *
 * Reutiliza o mesmo app Express do ambiente local (server/app.ts), então
 * existe um único mapa de rotas. Toda a lógica da API vive em server/.
 *
 * Atenção: a Vercel transforma em função cada arquivo .ts/.js desta pasta.
 * Não coloque código aqui além deste ponto de entrada.
 */
import app from '../server/app';

export default app;

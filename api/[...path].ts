/**
 * Serverless function catch-all para Vercel
 * Captura todas as rotas /api/* e roteia para o Express app
 * 
 * IMPORTANTE: Este arquivo será compilado pelo TypeScript e usado pela Vercel
 * A Vercel compila automaticamente arquivos TypeScript na pasta api/
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as authRoutes from './routes/auth';
import * as usersRoutes from './routes/users';
import * as ordersRoutes from './routes/orders';
import { API_DOCUMENTATION } from './config/documentation';
import * as postmanCollection from './QA-Playground-API.postman_collection.json';
  
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Configura CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-mock-scenario');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Parse body se necessário (Vercel já faz isso automaticamente, mas garantimos)
    let body = req.body;
    if (req.headers['content-type']?.includes('application/json') && typeof req.body === 'string') {
      try {
        body = JSON.parse(req.body);
      } catch (e) {
        // Body já está parseado ou é inválido
      }
    }
    
    // Extrai o path da URL
    // No Vercel, o path pode vir de diferentes formas:
    // 1. req.url - URL completa
    // 2. req.query.path - Array de segmentos do path (quando usa [...path])
    let path = '/';
    
    // Tenta obter o path do query (formato do Vercel para catch-all routes)
    if (req.query && typeof req.query.path === 'string') {
      path = '/' + req.query.path;
    } else if (req.query && Array.isArray(req.query.path)) {
      path = '/' + (req.query.path as string[]).join('/');
    } else if (req.url) {
      // Fallback para req.url
      path = req.url;
      // Remove /api do início se presente
      if (path.startsWith('/api')) {
        path = path.substring(4) || '/';
      }
    }
    
    // Garante que começa com /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Remove query string do path para roteamento
    const pathWithoutQuery = path.split('?')[0];
    
    // Health check
    if (pathWithoutQuery === '/health' || pathWithoutQuery === 'health') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'QA Playground API Mock',
      });
    }
    
    // Rota de documentação
    if (pathWithoutQuery === '/' || pathWithoutQuery === '' || pathWithoutQuery === '/docs') {
      return res.json(API_DOCUMENTATION);
    }
    
    // Rota para download da coleção Postman
    if (pathWithoutQuery === '/postman-collection') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="QA-Playground-API.postman_collection.json"');
      return res.json(postmanCollection);
    }
    
    // Cria objetos compatíveis com Express Request/Response
    const expressReq = {
      ...req,
      path: pathWithoutQuery,
      url: path,
      originalUrl: req.url,
      method: req.method,
      headers: req.headers,
      query: req.query,
      body: body,
      params: extractParams(pathWithoutQuery, req.url || ''),
    } as any;
    
    const expressRes = {
      ...res,
      status: (code: number) => {
        res.status(code);
        return expressRes;
      },
      json: (body: any) => {
        res.json(body);
        return expressRes;
      },
      send: (body: any) => {
        res.send(body);
        return expressRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return expressRes;
      },
    } as any;
    
    // Roteia baseado no método e path
    await routeRequest(expressReq, expressRes, authRoutes, usersRoutes, ordersRoutes);
    return;
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro inesperado no servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

function extractParams(_path: string, _url: string): Record<string, string> {
  const params: Record<string, string> = {};
  // Extrai parâmetros de rotas como /users/:id
  // Implementação simples - pode ser melhorada
  // Os parâmetros são extraídos diretamente nas rotas usando regex
  return params;
}

async function routeRequest(
  req: any,
  res: any,
  authRoutes: any,
  usersRoutes: any,
  ordersRoutes: any
) {
  const method = req.method;
  const path = req.path || '/';
  
  // Rotas de autenticação
  if (path.startsWith('/auth/')) {
    if (path === '/auth/login' && method === 'POST') {
      return await authRoutes.login(req, res);
    }
    if (path === '/auth/logout' && method === 'POST') {
      return await authRoutes.logout(req, res);
    }
    if (path === '/auth/me' && method === 'GET') {
      return await authRoutes.getMe(req, res);
    }
    if (path === '/auth/validate' && method === 'POST') {
      return await authRoutes.validateToken(req, res);
    }
  }
  
  // Rotas de usuários
  if (path.startsWith('/users')) {
    const idMatch = path.match(/^\/users\/(\d+)$/);
    if (idMatch) {
      req.params = { id: idMatch[1] };
      if (method === 'GET') return await usersRoutes.getUserById(req, res);
      if (method === 'PUT') return await usersRoutes.updateUser(req, res);
      if (method === 'DELETE') return await usersRoutes.deleteUser(req, res);
    } else if (path === '/users' || path === '/users/') {
      if (method === 'GET') return await usersRoutes.getUsers(req, res);
      if (method === 'POST') return await usersRoutes.createUser(req, res);
    }
  }
  
  // Rotas de pedidos
  if (path.startsWith('/orders')) {
    const idMatch = path.match(/^\/orders\/(\d+)$/);
    if (idMatch) {
      req.params = { id: idMatch[1] };
      if (method === 'GET') return await ordersRoutes.getOrderById(req, res);
      if (method === 'PUT') return await ordersRoutes.updateOrder(req, res);
      if (method === 'DELETE') return await ordersRoutes.deleteOrder(req, res);
    } else if (path === '/orders' || path === '/orders/') {
      if (method === 'GET') return await ordersRoutes.getOrders(req, res);
      if (method === 'POST') return await ordersRoutes.createOrder(req, res);
    }
  }
  
  // Rota não encontrada
  return res.status(404).json({
    error: 'Not Found',
    message: 'Rota não encontrada',
  });
}

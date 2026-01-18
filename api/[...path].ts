/**
 * Serverless function catch-all para Vercel
 * Captura todas as rotas /api/* e roteia para o Express app
 * 
 * IMPORTANTE: Este arquivo será compilado pelo TypeScript e usado pela Vercel
 * A Vercel compila automaticamente arquivos TypeScript na pasta api/
 */

// @ts-ignore - @vercel/node types are available at runtime in Vercel
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Reutiliza o app Express do index.ts
// Em produção, a Vercel compilará este arquivo e as dependências
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Importa dinamicamente para evitar problemas de compilação
  const express = require('express');
  const cors = require('cors');
  
  // Importa rotas (a Vercel compilará os arquivos TypeScript automaticamente)
  // Usa caminhos relativos aos arquivos TypeScript, não aos compilados
  const authRoutes = require('./routes/auth');
  const usersRoutes = require('./routes/users');
  const ordersRoutes = require('./routes/orders');
  
  const app = express();
  
  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Extrai o path da URL
  // A Vercel passa o path completo em req.url, incluindo /api
  // Precisamos remover o prefixo /api para rotear corretamente
  let path = req.url || '/';
  
  // Remove /api do início se presente
  if (path.startsWith('/api')) {
    path = path.substring(4) || '/';
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
  if (pathWithoutQuery === '/' || pathWithoutQuery === '') {
    return res.json({
      name: 'QA Playground API Mock',
      version: '1.0.0',
      description: 'API mockada para prática de testes QA',
      endpoints: {
        auth: {
          'POST /api/auth/login': 'Faz login e retorna token',
          'POST /api/auth/logout': 'Faz logout',
          'GET /api/auth/me': 'Retorna informações do usuário autenticado',
          'POST /api/auth/validate': 'Valida um token',
        },
        users: {
          'GET /api/users': 'Lista todos os usuários (admin)',
          'GET /api/users/:id': 'Retorna um usuário específico',
          'POST /api/users': 'Cria um novo usuário (admin)',
          'PUT /api/users/:id': 'Atualiza um usuário',
          'DELETE /api/users/:id': 'Deleta um usuário (admin)',
        },
        orders: {
          'GET /api/orders': 'Lista pedidos',
          'GET /api/orders/:id': 'Retorna um pedido específico',
          'POST /api/orders': 'Cria um novo pedido',
          'PUT /api/orders/:id': 'Atualiza um pedido',
          'DELETE /api/orders/:id': 'Deleta um pedido (admin)',
        },
      },
      scenarios: {
        description: 'Use ?scenario=<tipo> ou header x-mock-scenario para controlar comportamentos',
        types: [
          'success',
          'error-400',
          'error-401',
          'error-403',
          'error-404',
          'error-409',
          'error-422',
          'error-429',
          'error-500',
          'error-503',
          'timeout',
        ],
        example: 'GET /api/users?scenario=error-401',
      },
      credentials: {
        admin: { email: 'admin@example.com', password: 'admin123' },
        user: { email: 'user@example.com', password: 'user123' },
        viewer: { email: 'viewer@example.com', password: 'viewer123' },
      },
    });
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
    body: req.body,
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
  try {
    await routeRequest(expressReq, expressRes, authRoutes, usersRoutes, ordersRoutes);
    return;
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro inesperado no servidor',
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

/**
 * Servidor API Mockada para QA Playground
 * Simula comportamentos reais de backend para testes
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';

// Rotas
import * as authRoutes from './routes/auth';
import * as usersRoutes from './routes/users';
import * as ordersRoutes from './routes/orders';

const app: Express = express();
const PORT = process.env.API_PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging simples para debug
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'QA Playground API Mock',
  });
});

// Rotas de autenticação
app.post('/api/auth/login', authRoutes.login);
app.post('/api/auth/logout', authRoutes.logout);
app.get('/api/auth/me', authRoutes.getMe);
app.post('/api/auth/validate', authRoutes.validateToken);

// Rotas de usuários
app.get('/api/users', usersRoutes.getUsers);
app.get('/api/users/:id', usersRoutes.getUserById);
app.post('/api/users', usersRoutes.createUser);
app.put('/api/users/:id', usersRoutes.updateUser);
app.delete('/api/users/:id', usersRoutes.deleteUser);

// Rotas de pedidos
app.get('/api/orders', ordersRoutes.getOrders);
app.get('/api/orders/:id', ordersRoutes.getOrderById);
app.post('/api/orders', ordersRoutes.createOrder);
app.put('/api/orders/:id', ordersRoutes.updateOrder);
app.delete('/api/orders/:id', ordersRoutes.deleteOrder);

// Rota de documentação rápida
app.get('/api', (_req: Request, res: Response) => {
  res.json({
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
});

// Tratamento de erros
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Erro inesperado no servidor',
  });
});

// Inicia o servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 QA Playground API Mock rodando na porta ${PORT}`);
    console.log(`📚 Documentação: http://localhost:${PORT}/api`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;

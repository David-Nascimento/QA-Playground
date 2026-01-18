/**
 * Servidor API Mockada para QA Playground
 * Simula comportamentos reais de backend para testes
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';

// Rotas
import * as authRoutes from './routes/auth';
import * as usersRoutes from './routes/users';
import * as ordersRoutes from './routes/orders';
import { API_DOCUMENTATION } from './config/documentation';

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

// Rota de documentação completa
app.get('/api', (_req: Request, res: Response) => {
  res.json(API_DOCUMENTATION);
});

// Rota alternativa de documentação
app.get('/api/docs', (_req: Request, res: Response) => {
  res.json(API_DOCUMENTATION);
});

// Rota para download da coleção Postman
app.get('/api/postman-collection', (_req: Request, res: Response) => {
  try {
    const collectionPath = path.join(__dirname, 'QA-Playground-API.postman_collection.json');
    const collectionData = fs.readFileSync(collectionPath, 'utf8');
    const collection = JSON.parse(collectionData);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="QA-Playground-API.postman_collection.json"');
    res.json(collection);
  } catch (error) {
    console.error('Erro ao ler coleção Postman:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Erro ao carregar coleção Postman',
    });
  }
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

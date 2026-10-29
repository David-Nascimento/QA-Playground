/**
 * Mapa único de rotas da API (usado localmente e na Vercel).
 *
 * Cadeia padrão de uma rota de recurso:
 *   applyScenario -> requireAuth -> controller
 */
import { Router } from 'express';
import * as meta from '../controllers/meta.controller';
import * as auth from '../controllers/auth.controller';
import * as users from '../controllers/users.controller';
import * as orders from '../controllers/orders.controller';
import { applyScenario } from '../middlewares/scenario';
import { requireAuth } from '../middlewares/authenticate';

/** /auth/me e /auth/validate usam mensagens próprias. */
const requireAuthSession = requireAuth({
  missing: 'Token não fornecido',
  invalid: 'Token inválido ou expirado',
});

const ID = ':id(\\d+)';

const authRouter = Router()
  .post('/login', applyScenario, auth.login)
  .post('/logout', applyScenario, auth.logout)
  .get('/me', applyScenario, requireAuthSession, auth.me)
  .post('/validate', applyScenario, requireAuthSession, auth.validate);

const usersRouter = Router()
  .get('/', applyScenario, requireAuth(), users.list)
  .post('/', applyScenario, requireAuth(), users.create)
  .get(`/${ID}`, applyScenario, requireAuth(), users.getById)
  .put(`/${ID}`, applyScenario, requireAuth(), users.update)
  .delete(`/${ID}`, applyScenario, requireAuth(), users.remove);

const ordersRouter = Router()
  .get('/', applyScenario, requireAuth(), orders.list)
  .post('/', applyScenario, requireAuth(), orders.create)
  .get(`/${ID}`, applyScenario, requireAuth(), orders.getById)
  .put(`/${ID}`, applyScenario, requireAuth(), orders.update)
  .delete(`/${ID}`, applyScenario, requireAuth(), orders.remove);

export const apiRouter = Router()
  .get('/', meta.docs)
  .get('/docs', meta.docs)
  .get('/health', meta.health)
  .get('/postman-collection', meta.postman)
  .use('/auth', authRouter)
  .use('/users', usersRouter)
  .use('/orders', ordersRouter);

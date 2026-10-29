/**
 * QA Playground — API mock
 * Monta o app Express. Não abre porta: quem sobe o servidor é
 * server/dev.ts (local) ou api/[...path].ts (Vercel).
 */
import express, { type Express } from 'express';
import cors from 'cors';
import { apiRouter } from './routes';
import { parseJsonBody } from './middlewares/parse-body';
import { requestLogger } from './middlewares/request-logger';
import { errorHandler, notFoundHandler } from './middlewares/errors';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(parseJsonBody);
  app.use(express.urlencoded({ extended: true }));
  app.use(requestLogger);

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;

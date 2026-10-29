import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../http/http-error';

/** Nenhuma rota correspondeu. */
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found', message: 'Rota não encontrada' });
}

/** Converte erros em respostas JSON padronizadas. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json(err.toBody());
  }

  if ((err as { type?: string })?.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ error: 'Bad Request', message: 'JSON malformado no corpo da requisição' });
  }

  console.error('Erro:', err);
  return res.status(500).json({
    error: 'Internal Server Error',
    message: 'Erro inesperado no servidor',
  });
}

import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Express 4 não encaminha rejeições de Promises ao middleware de erro.
 * Este wrapper garante que erros de handlers async cheguem ao errorHandler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => unknown
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

import express, { type NextFunction, type Request, type Response } from 'express';

const jsonParser = express.json();

/**
 * Parser de JSON compatível com os dois ambientes:
 * - Local: req.body ainda não existe, então usa express.json().
 * - Vercel: o runtime já expõe req.body parseado (e lança erro se o JSON é
 *   inválido). Nesse caso o body é aproveitado e o stream não é relido.
 */
export function parseJsonBody(req: Request, res: Response, next: NextFunction) {
  let preParsed: unknown;
  try {
    preParsed = (req as { body?: unknown }).body;
  } catch {
    return next(Object.assign(new Error('Invalid JSON'), { type: 'entity.parse.failed' }));
  }

  if (preParsed !== undefined) {
    (req as { _body?: boolean })._body = true; // sinaliza aos parsers do Express que o body já foi lido
    return next();
  }

  return jsonParser(req, res, next);
}

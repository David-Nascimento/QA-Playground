import type { NextFunction, Request, Response } from 'express';
import { unauthorized } from '../http/http-error';
import * as authService from '../services/auth.service';
import type { AuthToken } from '../data/tokens.store';

export interface AuthMessages {
  missing: string;
  invalid: string;
}

/** Mensagens usadas pelos recursos (users, orders). */
const RESOURCE_MESSAGES: AuthMessages = {
  missing: 'Token de autenticação não fornecido',
  invalid: 'Token inválido ou expirado',
};

/**
 * Exige um token Bearer válido e disponibiliza o token em res.locals.auth.
 * As mensagens são parametrizáveis porque /auth/* usa textos próprios.
 */
export function requireAuth(messages: AuthMessages = RESOURCE_MESSAGES) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header) throw unauthorized(messages.missing);

    const token = authService.validateToken(header);
    if (!token) throw unauthorized(messages.invalid);

    res.locals.auth = token;
    next();
  };
}

/** Lê o usuário autenticado colocado por requireAuth. */
export function currentActor(res: Response): AuthToken {
  return res.locals.auth as AuthToken;
}

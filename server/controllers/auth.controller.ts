/**
 * Controller de autenticação: traduz HTTP <-> auth.service.
 */
import type { Request, Response } from 'express';
import { badRequest, unauthorized } from '../http/http-error';
import { currentActor } from '../middlewares/authenticate';
import * as authService from '../services/auth.service';

/** POST /api/auth/login */
export function login(req: Request, res: Response) {
  const { email, password } = req.body ?? {};
  if (!email || !password) throw badRequest('Email e senha são obrigatórios');

  const result = authService.login({ email, password });
  if (!result) throw unauthorized('Credenciais inválidas');

  res.status(200).json({ success: true, data: result });
}

/** POST /api/auth/logout */
export function logout(req: Request, res: Response) {
  const header = req.headers.authorization;
  if (!header) throw unauthorized('Token não fornecido');
  if (!authService.logout(header)) throw unauthorized('Token inválido');

  res.status(200).json({ success: true, message: 'Logout realizado com sucesso' });
}

const tokenSummary = (res: Response) => {
  const { userId, role, expiresAt } = currentActor(res);
  return { userId, role, expiresAt };
};

/** GET /api/auth/me */
export function me(_req: Request, res: Response) {
  res.status(200).json({ success: true, data: tokenSummary(res) });
}

/** POST /api/auth/validate */
export function validate(_req: Request, res: Response) {
  res.status(200).json({ success: true, valid: true, data: tokenSummary(res) });
}

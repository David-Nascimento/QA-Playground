/**
 * Rotas de autenticação
 */

import { Request, Response } from 'express';
import * as authService from '../data/auth.mock';
import {
  getScenarioFromRequest,
  applyScenario,
  successResponse,
  errorResponse,
} from '../config/scenarios';

/**
 * POST /api/auth/login
 * Faz login e retorna token
 */
export async function login(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);

  const result = await applyScenario(scenario, async () => {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return errorResponse('Bad Request', 'Email e senha são obrigatórios', 400);
    }

    const loginResult = authService.login({ email, password });

    if (!loginResult) {
      return errorResponse('Unauthorized', 'Credenciais inválidas', 401);
    }

    return successResponse(
      {
        success: true,
        data: loginResult,
      },
      200
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * POST /api/auth/logout
 * Faz logout e invalida token
 */
export async function logout(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);
  const authHeader = req.headers.authorization;

  const result = await applyScenario(scenario, async () => {
    if (!authHeader) {
      return errorResponse('Unauthorized', 'Token não fornecido', 401);
    }

    const success = authService.logout(authHeader);

    if (!success) {
      return errorResponse('Unauthorized', 'Token inválido', 401);
    }

    return successResponse(
      {
        success: true,
        message: 'Logout realizado com sucesso',
      },
      200
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * GET /api/auth/me
 * Retorna informações do usuário autenticado
 */
export async function getMe(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);
  const authHeader = req.headers.authorization;

  const result = await applyScenario(scenario, async () => {
    if (!authHeader) {
      return errorResponse('Unauthorized', 'Token não fornecido', 401);
    }

    const tokenInfo = authService.validateToken(authHeader);

    if (!tokenInfo) {
      return errorResponse('Unauthorized', 'Token inválido ou expirado', 401);
    }

    return successResponse(
      {
        success: true,
        data: {
          userId: tokenInfo.userId,
          role: tokenInfo.role,
          expiresAt: tokenInfo.expiresAt,
        },
      },
      200
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * POST /api/auth/validate
 * Valida um token
 */
export async function validateToken(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);
  const authHeader = req.headers.authorization;

  const result = await applyScenario(scenario, async () => {
    if (!authHeader) {
      return errorResponse('Unauthorized', 'Token não fornecido', 401);
    }

    const tokenInfo = authService.validateToken(authHeader);

    if (!tokenInfo) {
      return errorResponse('Unauthorized', 'Token inválido ou expirado', 401);
    }

    return successResponse(
      {
        success: true,
        valid: true,
        data: {
          userId: tokenInfo.userId,
          role: tokenInfo.role,
          expiresAt: tokenInfo.expiresAt,
        },
      },
      200
    );
  });

  res.status(result.statusCode).json(result.body);
}

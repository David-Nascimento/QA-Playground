/**
 * Rotas de usuários
 */

import { Request, Response } from 'express';
import * as usersService from '../data/users.mock';
import * as authService from '../data/auth.mock';
import {
  getScenarioFromRequest,
  applyScenario,
  successResponse,
  errorResponse,
} from '../config/scenarios';

/**
 * Middleware de autenticação
 */
function authenticate(req: Request): { valid: boolean; tokenInfo?: any; error?: { statusCode: number; body: any } } {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return {
      valid: false,
      error: errorResponse('Unauthorized', 'Token de autenticação não fornecido', 401),
    };
  }

  const tokenInfo = authService.validateToken(authHeader);

  if (!tokenInfo) {
    return {
      valid: false,
      error: errorResponse('Unauthorized', 'Token inválido ou expirado', 401),
    };
  }

  return { valid: true, tokenInfo };
}

/**
 * Middleware de autorização
 */
function authorize(tokenInfo: any, requiredRole: 'admin' | 'user' | 'viewer'): boolean {
  return authService.hasPermission(tokenInfo, requiredRole);
}

/**
 * GET /api/users
 * Lista todos os usuários
 */
export async function getUsers(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);

  const result = await applyScenario(scenario, async () => {
    const auth = authenticate(req);
    if (!auth.valid) {
      return auth.error!;
    }

    // Apenas admin pode ver todos os usuários
    if (!authorize(auth.tokenInfo, 'admin')) {
      return errorResponse('Forbidden', 'Você não tem permissão para listar usuários', 403);
    }

    const users = usersService.getAllUsers();
    return successResponse(
      {
        success: true,
        data: users,
        count: users.length,
      },
      200
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * GET /api/users/:id
 * Retorna um usuário específico
 */
export async function getUserById(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);
  const id = parseInt(req.params.id);

  const result = await applyScenario(scenario, async () => {
    const auth = authenticate(req);
    if (!auth.valid) {
      return auth.error!;
    }

    // Usuário pode ver seu próprio perfil, admin pode ver qualquer um
    if (auth.tokenInfo.userId !== id && !authorize(auth.tokenInfo, 'admin')) {
      return errorResponse('Forbidden', 'Você não tem permissão para acessar este recurso', 403);
    }

    const user = usersService.getUserById(id);

    if (!user) {
      return errorResponse('Not Found', 'Usuário não encontrado', 404);
    }

    return successResponse(
      {
        success: true,
        data: user,
      },
      200
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * POST /api/users
 * Cria um novo usuário
 */
export async function createUser(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);

  const result = await applyScenario(scenario, async () => {
    const auth = authenticate(req);
    if (!auth.valid) {
      return auth.error!;
    }

    // Apenas admin pode criar usuários
    if (!authorize(auth.tokenInfo, 'admin')) {
      return errorResponse('Forbidden', 'Você não tem permissão para criar usuários', 403);
    }

    const { name, email, role, active } = req.body;

    // Validação
    if (!name || !email) {
      return errorResponse('Bad Request', 'Nome e email são obrigatórios', 400);
    }

    // Verifica se email já existe
    if (usersService.emailExists(email)) {
      return errorResponse('Conflict', 'Já existe um usuário com este email', 409);
    }

    const newUser = usersService.createUser({
      name,
      email,
      role: role || 'user',
      active: active !== undefined ? active : true,
    });

    return successResponse(
      {
        success: true,
        data: newUser,
      },
      201
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * PUT /api/users/:id
 * Atualiza um usuário
 */
export async function updateUser(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);
  const id = parseInt(req.params.id);

  const result = await applyScenario(scenario, async () => {
    const auth = authenticate(req);
    if (!auth.valid) {
      return auth.error!;
    }

    // Usuário pode atualizar seu próprio perfil (exceto role), admin pode atualizar qualquer um
    const canUpdate =
      auth.tokenInfo.userId === id || authorize(auth.tokenInfo, 'admin');

    if (!canUpdate) {
      return errorResponse('Forbidden', 'Você não tem permissão para atualizar este usuário', 403);
    }

    const user = usersService.getUserById(id);
    if (!user) {
      return errorResponse('Not Found', 'Usuário não encontrado', 404);
    }

    // Usuário comum não pode alterar role
    if (auth.tokenInfo.userId === id && req.body.role && req.body.role !== user.role) {
      return errorResponse('Forbidden', 'Você não pode alterar seu próprio role', 403);
    }

    const { name, email, role, active } = req.body;
    const updates: any = {};

    if (name) updates.name = name;
    if (email) {
      // Verifica conflito de email
      if (usersService.emailExists(email, id)) {
        return errorResponse('Conflict', 'Já existe outro usuário com este email', 409);
      }
      updates.email = email;
    }
    if (role && authorize(auth.tokenInfo, 'admin')) updates.role = role;
    if (active !== undefined && authorize(auth.tokenInfo, 'admin'))
      updates.active = active;

    const updatedUser = usersService.updateUser(id, updates);

    return successResponse(
      {
        success: true,
        data: updatedUser,
      },
      200
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * DELETE /api/users/:id
 * Deleta um usuário
 */
export async function deleteUser(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);
  const id = parseInt(req.params.id);

  const result = await applyScenario(scenario, async () => {
    const auth = authenticate(req);
    if (!auth.valid) {
      return auth.error!;
    }

    // Apenas admin pode deletar usuários
    if (!authorize(auth.tokenInfo, 'admin')) {
      return errorResponse('Forbidden', 'Você não tem permissão para deletar usuários', 403);
    }

    const user = usersService.getUserById(id);
    if (!user) {
      return errorResponse('Not Found', 'Usuário não encontrado', 404);
    }

    usersService.deleteUser(id);

    return { statusCode: 204, body: null };
  });

  if (result.statusCode === 204) {
    res.status(204).send();
  } else {
    res.status(result.statusCode).json(result.body);
  }
}

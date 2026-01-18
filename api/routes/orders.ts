/**
 * Rotas de pedidos
 */

import { Request, Response } from 'express';
import * as ordersService from '../data/orders.mock';
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
 * GET /api/orders
 * Lista pedidos (próprios ou todos se admin)
 */
export async function getOrders(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);

  const result = await applyScenario(scenario, async () => {
    const auth = authenticate(req);
    if (!auth.valid) {
      return auth.error!;
    }

    let orders;
    if (auth.tokenInfo.role === 'admin') {
      // Admin vê todos os pedidos
      orders = ordersService.getAllOrders();
    } else {
      // Usuário vê apenas seus pedidos
      orders = ordersService.getOrdersByUserId(auth.tokenInfo.userId);
    }

    return successResponse(
      {
        success: true,
        data: orders,
        count: orders.length,
      },
      200
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * GET /api/orders/:id
 * Retorna um pedido específico
 */
export async function getOrderById(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);
  const id = parseInt(req.params.id);

  const result = await applyScenario(scenario, async () => {
    const auth = authenticate(req);
    if (!auth.valid) {
      return auth.error!;
    }

    const order = ordersService.getOrderById(id);

    if (!order) {
      return errorResponse('Not Found', 'Pedido não encontrado', 404);
    }

    // Usuário só pode ver seus próprios pedidos (exceto admin)
    if (
      auth.tokenInfo.role !== 'admin' &&
      order.userId !== auth.tokenInfo.userId
    ) {
      return errorResponse('Forbidden', 'Você não tem permissão para acessar este pedido', 403);
    }

    return successResponse(
      {
        success: true,
        data: order,
      },
      200
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * POST /api/orders
 * Cria um novo pedido
 */
export async function createOrder(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);

  const result = await applyScenario(scenario, async () => {
    const auth = authenticate(req);
    if (!auth.valid) {
      return auth.error!;
    }

    const { items } = req.body;

    // Validação
    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('Bad Request', 'Items são obrigatórios e devem ser um array não vazio', 400);
    }

    // Validação de itens
    for (const item of items) {
      if (!item.productId || !item.productName || !item.quantity || !item.price) {
        return errorResponse(
          'Unprocessable Entity',
          'Cada item deve conter productId, productName, quantity e price',
          422,
          {
            item: 'Campos obrigatórios: productId, productName, quantity, price',
          }
        );
      }

      if (item.quantity <= 0) {
        return errorResponse('Unprocessable Entity', 'Quantidade deve ser maior que zero', 422, {
          quantity: 'Quantidade deve ser um número positivo',
        });
      }

      if (item.price < 0) {
        return errorResponse('Unprocessable Entity', 'Preço não pode ser negativo', 422, {
          price: 'Preço deve ser um número positivo ou zero',
        });
      }
    }

    // Calcula total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const newOrder = ordersService.createOrder({
      userId: auth.tokenInfo.userId,
      items,
      total,
      status: 'pending',
    });

    return successResponse(
      {
        success: true,
        data: newOrder,
      },
      201
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * PUT /api/orders/:id
 * Atualiza um pedido
 */
export async function updateOrder(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);
  const id = parseInt(req.params.id);

  const result = await applyScenario(scenario, async () => {
    const auth = authenticate(req);
    if (!auth.valid) {
      return auth.error!;
    }

    const order = ordersService.getOrderById(id);

    if (!order) {
      return errorResponse('Not Found', 'Pedido não encontrado', 404);
    }

    // Usuário só pode atualizar seus próprios pedidos (exceto admin)
    if (
      auth.tokenInfo.role !== 'admin' &&
      order.userId !== auth.tokenInfo.userId
    ) {
      return errorResponse('Forbidden', 'Você não tem permissão para atualizar este pedido', 403);
    }

    // Não permite atualizar pedidos cancelados ou entregues
    if (order.status === 'cancelled' || order.status === 'delivered') {
      return errorResponse('Conflict', 'Não é possível atualizar um pedido cancelado ou entregue', 409);
    }

    const { status, items } = req.body;
    const updates: any = {};

    if (status) {
      // Valida transições de status
      const validTransitions: Record<string, string[]> = {
        pending: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['delivered'],
        delivered: [],
        cancelled: [],
      };

      if (!validTransitions[order.status]?.includes(status)) {
        return errorResponse(
          'Unprocessable Entity',
          `Transição de status inválida: ${order.status} -> ${status}`,
          422
        );
      }

      updates.status = status;
    }

    if (items) {
      // Recalcula total
      const total = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      updates.items = items;
      updates.total = total;
    }

    const updatedOrder = ordersService.updateOrder(id, updates);

    return successResponse(
      {
        success: true,
        data: updatedOrder,
      },
      200
    );
  });

  res.status(result.statusCode).json(result.body);
}

/**
 * DELETE /api/orders/:id
 * Deleta um pedido
 */
export async function deleteOrder(req: Request, res: Response) {
  const scenario = getScenarioFromRequest(req.query as any, req.headers as any);
  const id = parseInt(req.params.id);

  const result = await applyScenario(scenario, async () => {
    const auth = authenticate(req);
    if (!auth.valid) {
      return auth.error!;
    }

    const order = ordersService.getOrderById(id);

    if (!order) {
      return errorResponse('Not Found', 'Pedido não encontrado', 404);
    }

    // Apenas admin pode deletar pedidos
    if (auth.tokenInfo.role !== 'admin') {
      return errorResponse('Forbidden', 'Você não tem permissão para deletar pedidos', 403);
    }

    ordersService.deleteOrder(id);

    return { statusCode: 204, body: null };
  });

  if (result.statusCode === 204) {
    res.status(204).send();
  } else {
    res.status(result.statusCode).json(result.body);
  }
}

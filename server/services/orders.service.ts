/**
 * Regras de negócio de pedidos: propriedade, validação de itens,
 * cálculo de total e máquina de estados do status.
 *
 * A ordem das verificações é parte do contrato (define qual erro o cliente
 * recebe quando mais de uma condição falha).
 */
import { badRequest, conflict, forbidden, notFound, unprocessable } from '../http/http-error';
import * as ordersStore from '../data/orders.store';
import type { Order, OrderItem } from '../data/orders.store';
import type { AuthToken } from '../data/tokens.store';

export interface OrderInput {
  items?: OrderItem[];
  status?: Order['status'];
}

/** Transições de status permitidas. */
export const STATUS_TRANSITIONS: Record<Order['status'], Order['status'][]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const isAdmin = (actor: AuthToken) => actor.role === 'admin';

const calculateTotal = (items: OrderItem[]) =>
  items.reduce((sum, item) => sum + item.price * item.quantity, 0);

function findOrder(id: number): Order {
  const order = ordersStore.getOrderById(id);
  if (!order) throw notFound('Pedido não encontrado');
  return order;
}

function assertOwnerOrAdmin(actor: AuthToken, order: Order, message: string): void {
  if (!isAdmin(actor) && order.userId !== actor.userId) throw forbidden(message);
}

function validateItems(items: unknown): asserts items is OrderItem[] {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw badRequest('Items são obrigatórios e devem ser um array não vazio');
  }

  for (const item of items) {
    if (!item.productId || !item.productName || !item.quantity || !item.price) {
      throw unprocessable('Cada item deve conter productId, productName, quantity e price', {
        item: 'Campos obrigatórios: productId, productName, quantity, price',
      });
    }
    if (item.quantity <= 0) {
      throw unprocessable('Quantidade deve ser maior que zero', {
        quantity: 'Quantidade deve ser um número positivo',
      });
    }
    if (item.price < 0) {
      throw unprocessable('Preço não pode ser negativo', {
        price: 'Preço deve ser um número positivo ou zero',
      });
    }
  }
}

/** Admin vê todos; demais veem apenas os próprios. */
export function listOrders(actor: AuthToken): Order[] {
  return isAdmin(actor) ? ordersStore.getAllOrders() : ordersStore.getOrdersByUserId(actor.userId);
}

export function getOrder(actor: AuthToken, id: number): Order {
  const order = findOrder(id);
  assertOwnerOrAdmin(actor, order, 'Você não tem permissão para acessar este pedido');
  return order;
}

export function createOrder(actor: AuthToken, input: OrderInput): Order {
  const { items } = input;
  validateItems(items);

  return ordersStore.createOrder({
    userId: actor.userId,
    items,
    total: calculateTotal(items),
    status: 'pending',
  });
}

export function updateOrder(actor: AuthToken, id: number, input: OrderInput): Order | null {
  const order = findOrder(id);
  assertOwnerOrAdmin(actor, order, 'Você não tem permissão para atualizar este pedido');

  if (order.status === 'cancelled' || order.status === 'delivered') {
    throw conflict('Não é possível atualizar um pedido cancelado ou entregue');
  }

  const { status, items } = input;
  const updates: Partial<Order> = {};

  if (status) {
    if (!STATUS_TRANSITIONS[order.status]?.includes(status)) {
      throw unprocessable(`Transição de status inválida: ${order.status} -> ${status}`);
    }
    updates.status = status;
  }

  if (items) {
    updates.items = items;
    updates.total = calculateTotal(items);
  }

  return ordersStore.updateOrder(id, updates);
}

/** Apenas admin remove pedidos (verifica existência antes da permissão). */
export function deleteOrder(actor: AuthToken, id: number): void {
  findOrder(id);
  if (!isAdmin(actor)) throw forbidden('Você não tem permissão para deletar pedidos');
  ordersStore.deleteOrder(id);
}

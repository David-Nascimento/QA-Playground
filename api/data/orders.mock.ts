/**
 * Dados mockados de pedidos para testes QA
 */

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export const MOCK_ORDERS: Order[] = [
  {
    id: 1,
    userId: 2,
    items: [
      { productId: 101, productName: 'Notebook', quantity: 1, price: 2500.0 },
      { productId: 102, productName: 'Mouse', quantity: 2, price: 50.0 },
    ],
    total: 2600.0,
    status: 'delivered',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
  },
  {
    id: 2,
    userId: 2,
    items: [{ productId: 103, productName: 'Teclado', quantity: 1, price: 150.0 }],
    total: 150.0,
    status: 'shipped',
    createdAt: '2024-01-18T09:30:00Z',
    updatedAt: '2024-01-19T11:00:00Z',
  },
  {
    id: 3,
    userId: 5,
    items: [
      { productId: 104, productName: 'Monitor', quantity: 2, price: 800.0 },
    ],
    total: 1600.0,
    status: 'processing',
    createdAt: '2024-01-19T14:20:00Z',
    updatedAt: '2024-01-19T14:20:00Z',
  },
  {
    id: 4,
    userId: 1,
    items: [{ productId: 105, productName: 'Webcam', quantity: 1, price: 200.0 }],
    total: 200.0,
    status: 'pending',
    createdAt: '2024-01-20T08:15:00Z',
    updatedAt: '2024-01-20T08:15:00Z',
  },
  {
    id: 5,
    userId: 3,
    items: [{ productId: 106, productName: 'Headset', quantity: 1, price: 300.0 }],
    total: 300.0,
    status: 'cancelled',
    createdAt: '2024-01-17T16:45:00Z',
    updatedAt: '2024-01-18T10:30:00Z',
  },
];

let orders = [...MOCK_ORDERS];
let nextId = 6;

/**
 * Retorna todos os pedidos
 */
export function getAllOrders(): Order[] {
  return orders;
}

/**
 * Retorna pedidos de um usuário
 */
export function getOrdersByUserId(userId: number): Order[] {
  return orders.filter((o) => o.userId === userId);
}

/**
 * Retorna um pedido por ID
 */
export function getOrderById(id: number): Order | undefined {
  return orders.find((o) => o.id === id);
}

/**
 * Cria um novo pedido
 */
export function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
  const now = new Date().toISOString();
  const newOrder: Order = {
    id: nextId++,
    ...orderData,
    createdAt: now,
    updatedAt: now,
  };
  orders.push(newOrder);
  return newOrder;
}

/**
 * Atualiza um pedido
 */
export function updateOrder(id: number, updates: Partial<Omit<Order, 'id' | 'createdAt'>>): Order | null {
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return orders[index];
}

/**
 * Deleta um pedido
 */
export function deleteOrder(id: number): boolean {
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return false;

  orders.splice(index, 1);
  return true;
}

/**
 * Reseta os dados para o estado inicial
 */
export function resetOrders(): void {
  orders = [...MOCK_ORDERS];
  nextId = 6;
}

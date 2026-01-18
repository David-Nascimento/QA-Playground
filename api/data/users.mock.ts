/**
 * Dados mockados de usuários para testes QA
 */

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export const MOCK_USERS: User[] = [
  {
    id: 1,
    name: 'João Silva',
    email: 'joao.silva@example.com',
    role: 'admin',
    active: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    role: 'user',
    active: true,
    createdAt: '2024-01-16T11:30:00Z',
    updatedAt: '2024-01-16T11:30:00Z',
  },
  {
    id: 3,
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@example.com',
    role: 'user',
    active: false,
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
  },
  {
    id: 4,
    name: 'Ana Costa',
    email: 'ana.costa@example.com',
    role: 'viewer',
    active: true,
    createdAt: '2024-01-18T13:45:00Z',
    updatedAt: '2024-01-18T13:45:00Z',
  },
  {
    id: 5,
    name: 'Carlos Ferreira',
    email: 'carlos.ferreira@example.com',
    role: 'user',
    active: true,
    createdAt: '2024-01-19T08:00:00Z',
    updatedAt: '2024-01-19T08:00:00Z',
  },
];

let users = [...MOCK_USERS];
let nextId = 6;

/**
 * Retorna todos os usuários
 */
export function getAllUsers(): User[] {
  return users;
}

/**
 * Retorna um usuário por ID
 */
export function getUserById(id: number): User | undefined {
  return users.find((u) => u.id === id);
}

/**
 * Retorna um usuário por email
 */
export function getUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Cria um novo usuário
 */
export function createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User {
  const now = new Date().toISOString();
  const newUser: User = {
    id: nextId++,
    ...userData,
    createdAt: now,
    updatedAt: now,
  };
  users.push(newUser);
  return newUser;
}

/**
 * Atualiza um usuário
 */
export function updateUser(id: number, updates: Partial<Omit<User, 'id' | 'createdAt'>>): User | null {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return users[index];
}

/**
 * Deleta um usuário
 */
export function deleteUser(id: number): boolean {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;

  users.splice(index, 1);
  return true;
}

/**
 * Verifica se email já existe
 */
export function emailExists(email: string, excludeId?: number): boolean {
  return users.some(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== excludeId
  );
}

/**
 * Reseta os dados para o estado inicial
 */
export function resetUsers(): void {
  users = [...MOCK_USERS];
  nextId = 6;
}

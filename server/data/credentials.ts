/**
 * Credenciais aceitas no login (simula a tabela de contas).
 * O userId aponta para um registro em users.store.
 */
export type Role = 'admin' | 'user' | 'viewer';

export interface Credential {
  password: string;
  userId: number;
  role: Role;
}

export const CREDENTIALS: Record<string, Credential> = {
  'admin@example.com': { password: 'admin123', userId: 1, role: 'admin' },
  'user@example.com': { password: 'user123', userId: 2, role: 'user' },
  'viewer@example.com': { password: 'viewer123', userId: 4, role: 'viewer' },
};

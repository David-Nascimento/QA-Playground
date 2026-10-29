/**
 * Tokens emitidos, em memória (simula uma tabela de sessões).
 */
import type { Role } from './credentials';

export interface AuthToken {
  token: string;
  expiresAt: string;
  userId: number;
  role: Role;
}

const tokens = new Map<string, AuthToken>();

export const saveToken = (authToken: AuthToken): void => {
  tokens.set(authToken.token, authToken);
};

export const findToken = (token: string): AuthToken | undefined => tokens.get(token);

export const deleteToken = (token: string): boolean => tokens.delete(token);

export const clearTokens = (): void => tokens.clear();

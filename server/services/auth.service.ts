/**
 * Regras de autenticação: login, validação de token, logout e hierarquia de papéis.
 */
import { CREDENTIALS, type Role } from '../data/credentials';
import * as tokensStore from '../data/tokens.store';
import type { AuthToken } from '../data/tokens.store';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  expiresAt: string;
  user: { id: number; role: Role };
}

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

const ROLE_LEVEL: Record<Role, number> = { viewer: 1, user: 2, admin: 3 };

const stripBearer = (header: string) => header.replace(/^Bearer\s+/i, '');

/** Gera um token fake (simula JWT; não é um JWT real). */
function generateToken(userId: number, role: Role): string {
  const payload = { userId, role, iat: Math.floor(Date.now() / 1000) };
  return `fake-jwt-${Buffer.from(JSON.stringify(payload)).toString('base64')}`;
}

/** Faz login e retorna token, ou null se as credenciais forem inválidas. */
export function login({ email, password }: LoginCredentials): LoginResult | null {
  const credential = CREDENTIALS[email.toLowerCase()];
  if (!credential || credential.password !== password) return null;

  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  const token = generateToken(credential.userId, credential.role);
  tokensStore.saveToken({ token, expiresAt, userId: credential.userId, role: credential.role });

  return { token, expiresAt, user: { id: credential.userId, role: credential.role } };
}

/** Valida um header/token. Remove tokens expirados. */
export function validateToken(header: string): AuthToken | null {
  const token = stripBearer(header);
  const authToken = tokensStore.findToken(token);
  if (!authToken) return null;

  if (new Date(authToken.expiresAt) < new Date()) {
    tokensStore.deleteToken(token);
    return null;
  }
  return authToken;
}

/** Invalida um token. Retorna false se ele não existia. */
export function logout(header: string): boolean {
  return tokensStore.deleteToken(stripBearer(header));
}

/** true se o papel do token for igual ou superior ao exigido. */
export function hasPermission(token: AuthToken, requiredRole: Role): boolean {
  return ROLE_LEVEL[token.role] >= ROLE_LEVEL[requiredRole];
}

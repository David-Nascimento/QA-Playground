/**
 * Dados mockados de autenticação para testes QA
 */

export interface AuthToken {
  token: string;
  expiresAt: string;
  userId: number;
  role: 'admin' | 'user' | 'viewer';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Tokens válidos em memória (simula banco de dados)
const validTokens = new Map<string, AuthToken>();

// Usuários válidos para login (simula banco de dados)
const VALID_USERS: Record<string, { password: string; userId: number; role: 'admin' | 'user' | 'viewer' }> = {
  'admin@example.com': {
    password: 'admin123',
    userId: 1,
    role: 'admin',
  },
  'user@example.com': {
    password: 'user123',
    userId: 2,
    role: 'user',
  },
  'viewer@example.com': {
    password: 'viewer123',
    userId: 4,
    role: 'viewer',
  },
};

/**
 * Gera um token fake (simula JWT)
 */
function generateToken(userId: number, role: 'admin' | 'user' | 'viewer'): string {
  const payload = {
    userId,
    role,
    iat: Math.floor(Date.now() / 1000),
  };
  // Token fake base64 (não é um JWT real, apenas para simulação)
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
  return `fake-jwt-${encoded}`;
}

/**
 * Faz login e retorna token
 */
export function login(credentials: LoginCredentials): { token: string; expiresAt: string; user: { id: number; role: string } } | null {
  const user = VALID_USERS[credentials.email.toLowerCase()];

  if (!user || user.password !== credentials.password) {
    return null;
  }

  const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hora
  const token = generateToken(user.userId, user.role);

  validTokens.set(token, {
    token,
    expiresAt,
    userId: user.userId,
    role: user.role,
  });

  return {
    token,
    expiresAt,
    user: {
      id: user.userId,
      role: user.role,
    },
  };
}

/**
 * Valida um token
 */
export function validateToken(token: string): AuthToken | null {
  // Remove "Bearer " se presente
  const cleanToken = token.replace(/^Bearer\s+/i, '');

  const authToken = validTokens.get(cleanToken);

  if (!authToken) {
    return null;
  }

  // Verifica se expirou
  if (new Date(authToken.expiresAt) < new Date()) {
    validTokens.delete(cleanToken);
    return null;
  }

  return authToken;
}

/**
 * Verifica se o usuário tem permissão
 */
export function hasPermission(token: AuthToken, requiredRole: 'admin' | 'user' | 'viewer'): boolean {
  const roleHierarchy: Record<string, number> = {
    viewer: 1,
    user: 2,
    admin: 3,
  };

  return roleHierarchy[token.role] >= roleHierarchy[requiredRole];
}

/**
 * Faz logout (invalida token)
 */
export function logout(token: string): boolean {
  const cleanToken = token.replace(/^Bearer\s+/i, '');
  return validTokens.delete(cleanToken);
}

/**
 * Limpa todos os tokens (útil para testes)
 */
export function clearAllTokens(): void {
  validTokens.clear();
}

/**
 * Retorna informações de um token sem validar expiração (para testes)
 */
export function getTokenInfo(token: string): AuthToken | null {
  const cleanToken = token.replace(/^Bearer\s+/i, '');
  return validTokens.get(cleanToken) || null;
}

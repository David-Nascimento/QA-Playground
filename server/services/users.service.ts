/**
 * Regras de negócio de usuários: permissões, validação e conflitos.
 *
 * A ordem das verificações é parte do contrato (define qual erro o cliente
 * recebe quando mais de uma condição falha).
 */
import { badRequest, conflict, forbidden, notFound } from '../http/http-error';
import * as usersStore from '../data/users.store';
import type { User } from '../data/users.store';
import type { AuthToken } from '../data/tokens.store';
import { hasPermission } from './auth.service';

export interface UserInput {
  name?: string;
  email?: string;
  role?: User['role'];
  active?: boolean;
}

const isAdmin = (actor: AuthToken) => hasPermission(actor, 'admin');

/** Apenas admin lista usuários. */
export function listUsers(actor: AuthToken): User[] {
  if (!isAdmin(actor)) throw forbidden('Você não tem permissão para listar usuários');
  return usersStore.getAllUsers();
}

/** O próprio usuário ou admin. */
export function getUser(actor: AuthToken, id: number): User {
  if (actor.userId !== id && !isAdmin(actor)) {
    throw forbidden('Você não tem permissão para acessar este recurso');
  }
  const user = usersStore.getUserById(id);
  if (!user) throw notFound('Usuário não encontrado');
  return user;
}

/** Apenas admin cria usuários. */
export function createUser(actor: AuthToken, input: UserInput): User {
  if (!isAdmin(actor)) throw forbidden('Você não tem permissão para criar usuários');

  const { name, email, role, active } = input;
  if (!name || !email) throw badRequest('Nome e email são obrigatórios');
  if (usersStore.emailExists(email)) throw conflict('Já existe um usuário com este email');

  return usersStore.createUser({
    name,
    email,
    role: role || 'user',
    active: active !== undefined ? active : true,
  });
}

/** O próprio usuário (sem alterar o role) ou admin. */
export function updateUser(actor: AuthToken, id: number, input: UserInput): User | null {
  const isSelf = actor.userId === id;
  if (!isSelf && !isAdmin(actor)) {
    throw forbidden('Você não tem permissão para atualizar este usuário');
  }

  const user = usersStore.getUserById(id);
  if (!user) throw notFound('Usuário não encontrado');

  if (isSelf && input.role && input.role !== user.role) {
    throw forbidden('Você não pode alterar seu próprio role');
  }

  const { name, email, role, active } = input;
  const updates: Partial<User> = {};

  if (name) updates.name = name;
  if (email) {
    if (usersStore.emailExists(email, id)) {
      throw conflict('Já existe outro usuário com este email');
    }
    updates.email = email;
  }
  if (role && isAdmin(actor)) updates.role = role;
  if (active !== undefined && isAdmin(actor)) updates.active = active;

  return usersStore.updateUser(id, updates);
}

/** Apenas admin remove usuários. */
export function deleteUser(actor: AuthToken, id: number): void {
  if (!isAdmin(actor)) throw forbidden('Você não tem permissão para deletar usuários');
  if (!usersStore.getUserById(id)) throw notFound('Usuário não encontrado');
  usersStore.deleteUser(id);
}

/**
 * Controller de usuários: traduz HTTP <-> users.service.
 */
import type { Request, Response } from 'express';
import { currentActor } from '../middlewares/authenticate';
import * as usersService from '../services/users.service';

const idParam = (req: Request) => parseInt(req.params.id, 10);

/** GET /api/users */
export function list(_req: Request, res: Response) {
  const users = usersService.listUsers(currentActor(res));
  res.status(200).json({ success: true, data: users, count: users.length });
}

/** GET /api/users/:id */
export function getById(req: Request, res: Response) {
  const user = usersService.getUser(currentActor(res), idParam(req));
  res.status(200).json({ success: true, data: user });
}

/** POST /api/users */
export function create(req: Request, res: Response) {
  const user = usersService.createUser(currentActor(res), req.body ?? {});
  res.status(201).json({ success: true, data: user });
}

/** PUT /api/users/:id */
export function update(req: Request, res: Response) {
  const user = usersService.updateUser(currentActor(res), idParam(req), req.body ?? {});
  res.status(200).json({ success: true, data: user });
}

/** DELETE /api/users/:id */
export function remove(req: Request, res: Response) {
  usersService.deleteUser(currentActor(res), idParam(req));
  res.status(204).send();
}

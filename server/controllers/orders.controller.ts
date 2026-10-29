/**
 * Controller de pedidos: traduz HTTP <-> orders.service.
 */
import type { Request, Response } from 'express';
import { currentActor } from '../middlewares/authenticate';
import * as ordersService from '../services/orders.service';

const idParam = (req: Request) => parseInt(req.params.id, 10);

/** GET /api/orders */
export function list(_req: Request, res: Response) {
  const orders = ordersService.listOrders(currentActor(res));
  res.status(200).json({ success: true, data: orders, count: orders.length });
}

/** GET /api/orders/:id */
export function getById(req: Request, res: Response) {
  const order = ordersService.getOrder(currentActor(res), idParam(req));
  res.status(200).json({ success: true, data: order });
}

/** POST /api/orders */
export function create(req: Request, res: Response) {
  const order = ordersService.createOrder(currentActor(res), req.body ?? {});
  res.status(201).json({ success: true, data: order });
}

/** PUT /api/orders/:id */
export function update(req: Request, res: Response) {
  const order = ordersService.updateOrder(currentActor(res), idParam(req), req.body ?? {});
  res.status(200).json({ success: true, data: order });
}

/** DELETE /api/orders/:id */
export function remove(req: Request, res: Response) {
  ordersService.deleteOrder(currentActor(res), idParam(req));
  res.status(204).send();
}

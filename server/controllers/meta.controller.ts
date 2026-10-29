/**
 * Endpoints informativos: health check, documentação e coleção Postman.
 */
import type { Request, Response } from 'express';
import { API_DOCUMENTATION } from '../docs/documentation';
import postmanCollection from '../docs/postman-collection.json';

/** GET /api/health */
export function health(_req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'QA Playground API Mock',
  });
}

/** GET /api e GET /api/docs */
export function docs(_req: Request, res: Response) {
  res.json(API_DOCUMENTATION);
}

/** GET /api/postman-collection */
export function postman(_req: Request, res: Response) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="QA-Playground-API.postman_collection.json"');
  res.json(postmanCollection);
}

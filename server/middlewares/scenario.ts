import type { NextFunction, Request, Response } from 'express';
import { SCENARIOS, SCENARIO_ERROR_BODIES, getScenarioFromRequest } from '../config/scenarios';
import { asyncHandler } from '../http/async-handler';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Aplica o cenário forçado pelo cliente antes de qualquer outra etapa da rota
 * (inclusive autenticação). 'success' segue o fluxo normal.
 */
export const applyScenario = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const scenario = getScenarioFromRequest(req.query, req.headers);
  const config = SCENARIOS[scenario];

  if (config.delay) await sleep(config.delay);

  if (scenario === 'success') return next();

  res
    .status(config.statusCode)
    .json(SCENARIO_ERROR_BODIES[config.statusCode] ?? { error: 'Error', message: 'Erro desconhecido' });
});

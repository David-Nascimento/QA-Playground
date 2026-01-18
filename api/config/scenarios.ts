/**
 * Sistema de controle de cenários para testes QA
 * Permite alternar entre diferentes comportamentos da API
 */

export type ScenarioType =
  | 'success'
  | 'error-400'
  | 'error-401'
  | 'error-403'
  | 'error-404'
  | 'error-409'
  | 'error-422'
  | 'error-429'
  | 'error-500'
  | 'error-503'
  | 'timeout';

export interface ScenarioConfig {
  type: ScenarioType;
  description: string;
  statusCode: number;
  delay?: number; // em milissegundos
}

export const SCENARIOS: Record<ScenarioType, ScenarioConfig> = {
  success: {
    type: 'success',
    description: 'Resposta de sucesso',
    statusCode: 200,
  },
  'error-400': {
    type: 'error-400',
    description: 'Bad Request - Payload inválido',
    statusCode: 400,
  },
  'error-401': {
    type: 'error-401',
    description: 'Unauthorized - Não autenticado',
    statusCode: 401,
  },
  'error-403': {
    type: 'error-403',
    description: 'Forbidden - Sem permissão',
    statusCode: 403,
  },
  'error-404': {
    type: 'error-404',
    description: 'Not Found - Recurso inexistente',
    statusCode: 404,
  },
  'error-409': {
    type: 'error-409',
    description: 'Conflict - Conflito de dados',
    statusCode: 409,
  },
  'error-422': {
    type: 'error-422',
    description: 'Unprocessable Entity - Erro de validação',
    statusCode: 422,
  },
  'error-429': {
    type: 'error-429',
    description: 'Too Many Requests - Rate limit',
    statusCode: 429,
  },
  'error-500': {
    type: 'error-500',
    description: 'Internal Server Error - Erro inesperado',
    statusCode: 500,
  },
  'error-503': {
    type: 'error-503',
    description: 'Service Unavailable - Serviço indisponível',
    statusCode: 503,
  },
  timeout: {
    type: 'timeout',
    description: 'Timeout - Requisição demorada',
    statusCode: 504,
    delay: 10000, // 10 segundos
  },
};

/**
 * Extrai o cenário da requisição (query param ou header)
 */
export function getScenarioFromRequest(
  query?: Record<string, string | string[]>,
  headers?: Record<string, string | string[]>
): ScenarioType {
  // Prioridade: query param > header
  const scenarioParam =
    (query?.scenario as string) ||
    (query?.['x-mock-scenario'] as string) ||
    (headers?.['x-mock-scenario'] as string);

  if (scenarioParam && scenarioParam in SCENARIOS) {
    return scenarioParam as ScenarioType;
  }

  return 'success'; // padrão
}

/**
 * Helper para criar resposta de sucesso
 */
export function successResponse(data: any, statusCode: number = 200): { statusCode: number; body: any } {
  return {
    statusCode,
    body: data,
  };
}

/**
 * Helper para criar resposta de erro
 */
export function errorResponse(
  error: string,
  message: string,
  statusCode: number,
  details?: any
): { statusCode: number; body: any } {
  return {
    statusCode,
    body: {
      error,
      message,
      ...(details && { details }),
    },
  };
}

/**
 * Aplica o cenário à resposta
 */
export async function applyScenario(
  scenario: ScenarioType,
  handler: () => Promise<{ statusCode: number; body: any }>
): Promise<{ statusCode: number; body: any }> {
  const config = SCENARIOS[scenario];

  // Aplica delay se configurado
  if (config.delay) {
    await new Promise((resolve) => setTimeout(resolve, config.delay));
  }

  // Para cenários de erro, retorna erro direto
  if (scenario.startsWith('error-')) {
    const statusCode = config.statusCode;
    const errorMessages: Record<number, any> = {
      400: {
        error: 'Bad Request',
        message: 'Payload inválido ou malformado',
        details: 'Verifique os dados enviados na requisição',
      },
      401: {
        error: 'Unauthorized',
        message: 'Token de autenticação inválido ou ausente',
        details: 'Faça login novamente para obter um token válido',
      },
      403: {
        error: 'Forbidden',
        message: 'Você não tem permissão para acessar este recurso',
        details: 'Contate o administrador para solicitar acesso',
      },
      404: {
        error: 'Not Found',
        message: 'Recurso não encontrado',
        details: 'O recurso solicitado não existe ou foi removido',
      },
      409: {
        error: 'Conflict',
        message: 'Conflito de dados',
        details: 'Já existe um recurso com os mesmos dados',
      },
      422: {
        error: 'Unprocessable Entity',
        message: 'Erro de validação',
        details: {
          email: 'Email inválido',
          password: 'Senha deve ter no mínimo 8 caracteres',
        },
      },
      429: {
        error: 'Too Many Requests',
        message: 'Limite de requisições excedido',
        details: 'Tente novamente em alguns minutos',
        retryAfter: 60,
      },
      500: {
        error: 'Internal Server Error',
        message: 'Erro inesperado no servidor',
        details: 'Nossa equipe foi notificada. Tente novamente mais tarde',
      },
      503: {
        error: 'Service Unavailable',
        message: 'Serviço temporariamente indisponível',
        details: 'Estamos em manutenção. Tente novamente em breve',
      },
      504: {
        error: 'Gateway Timeout',
        message: 'A requisição demorou muito para ser processada',
        details: 'Tente novamente com uma requisição mais simples',
      },
    };

    return {
      statusCode,
      body: errorMessages[statusCode] || {
        error: 'Error',
        message: 'Erro desconhecido',
      },
    };
  }

  // Para sucesso, executa o handler
  const result = await handler();
  return {
    statusCode: config.statusCode,
    body: result,
  };
}

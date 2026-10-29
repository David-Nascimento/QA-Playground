/**
 * Erro HTTP de domínio.
 *
 * Services lançam HttpError; o middleware de erro converte em resposta.
 * Formato do corpo (contrato público da API): { error, message, details? }
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly error: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'HttpError';
  }

  toBody(): { error: string; message: string; details?: unknown } {
    return {
      error: this.error,
      message: this.message,
      ...(this.details ? { details: this.details } : {}),
    };
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, 'Bad Request', message, details);

export const unauthorized = (message: string, details?: unknown) =>
  new HttpError(401, 'Unauthorized', message, details);

export const forbidden = (message: string, details?: unknown) =>
  new HttpError(403, 'Forbidden', message, details);

export const notFound = (message: string, details?: unknown) =>
  new HttpError(404, 'Not Found', message, details);

export const conflict = (message: string, details?: unknown) =>
  new HttpError(409, 'Conflict', message, details);

export const unprocessable = (message: string, details?: unknown) =>
  new HttpError(422, 'Unprocessable Entity', message, details);

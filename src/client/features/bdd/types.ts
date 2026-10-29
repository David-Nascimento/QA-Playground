// ========================================
// BDD Types - Definições de Tipos BDD
// ========================================

/**
 * Nível de validação BDD
 */
export type BDDSessionLevel = 'basico' | 'intermediario' | 'avancado' | 'especialista';

/**
 * Resultado de validação
 */
export interface BDDValidation {
  valid: boolean;
  errors: BDDValidationError[];
}

/**
 * Erro de validação
 */
export interface BDDValidationError {
  rule?: string;
  message: string;
}

/**
 * Pontuação calculada
 */
export interface BDDScore {
  score: number;
  level: string;
  breakdown?: {
    [key: string]: {
      score: number;
      total: number;
      percentage: number;
    };
  };
}

/**
 * Feedback educacional
 */
export interface BDDFeedback {
  suggestions?: string[];
  explanations?: BDDExplanation[];
  general?: {
    title: string;
    content: string;
  };
}

/**
 * Explicação educacional
 */
export interface BDDExplanation {
  title: string;
  content: string;
}

/**
 * Sessão BDD
 */
export interface BDDSession {
  name: string;
  description: string;
  tips: string[];
}

/**
 * Estrutura parseada do Gherkin
 */
export interface ParsedGherkin {
  feature?: string;
  scenarios?: unknown[];
  [key: string]: unknown;
}

/**
 * Interface global para módulos BDD (compatibilidade)
 */
declare global {
  interface Window {
    BDDParser?: {
      parse(text: string): ParsedGherkin;
    };
    BDDValidator?: {
      validate(parsed: ParsedGherkin, session: string): BDDValidation;
    };
    BDDScore?: {
      calculate(validation: BDDValidation, session: string): BDDScore;
    };
    BDDFeedback?: {
      generate(validation: BDDValidation, score: BDDScore): BDDFeedback;
    };
    BDDSessions?: {
      getSession(session: string): BDDSession;
    };
  }
}

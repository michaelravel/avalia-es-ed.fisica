// Types for the assessment system

export type NivelEnsino = "educacao_infantil" | "fundamental_1" | "fundamental_2";

export const NIVEL_ENSINO_LABELS: Record<NivelEnsino, string> = {
  educacao_infantil: "Educação Infantil",
  fundamental_1: "Fundamental 1",
  fundamental_2: "Fundamental 2",
};

export interface Professor {
  id: number;
  email: string;
  nome: string;
}

export interface Aluno {
  id_aluno: string;
  nome: string;
  escola: string;
  turma: string;
  idade: number;
  sexo: string;
}

// Observation-based question (Ed. Infantil, Fund 1, Fund 2)
export interface QuestaoObservacao {
  id_questao: string;
  competencia: string;
  descricao: string;
  nivel_ensino: NivelEnsino;
}

// Multiple-choice question (legacy)
export interface Questao {
  id_questao: string;
  competencia: string;
  pergunta: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  resposta_correta: string;
}

export type NivelResposta = "basico" | "intermediario" | "avancado";

export const NIVEL_RESPOSTA_LABELS: Record<NivelResposta, string> = {
  basico: "Básico",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export interface Avaliacao {
  id_avaliacao: string;
  data: string;
  escola: string;
  turma: string;
  professor: string;
  nivel_ensino?: NivelEnsino;
}

export interface Resposta {
  id_aluno: string;
  id_avaliacao: string;
  id_questao: string;
  resposta: string;
  data_hora: string;
}

export interface Resultado {
  id_aluno: string;
  id_avaliacao: string;
  acertos: number;
  erros: number;
  percentual: number;
  nivel: string;
  neurodivergente?: boolean;
}

export interface UserProfile {
  email: string;
  nome: string;
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

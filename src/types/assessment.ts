// Types for the assessment system

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

export interface Avaliacao {
  id_avaliacao: string;
  data: string;
  escola: string;
  turma: string;
  professor: string;
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
}

export interface UserProfile {
  email: string;
  nome: string;
  isAuthenticated: boolean;
}

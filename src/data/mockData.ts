// Mock data for development. In production, all data comes from Google Apps Script API.
import type { Aluno, Questao, Avaliacao, Resultado, QuestaoObservacao, NivelEnsino } from "@/types/assessment";
import { questoesEducacaoInfantil } from "./questoesEducacaoInfantil";

export const mockAlunos: Aluno[] = [
  { id_aluno: "A001", nome: "Ana Clara Silva", escola: "EM Prof. João da Silva", turma: "6A", idade: 11, sexo: "F" },
  { id_aluno: "A002", nome: "Pedro Henrique Santos", escola: "EM Prof. João da Silva", turma: "6A", idade: 12, sexo: "M" },
  { id_aluno: "A003", nome: "Maria Eduarda Oliveira", escola: "EM Prof. João da Silva", turma: "6A", idade: 11, sexo: "F" },
  { id_aluno: "A004", nome: "Lucas Gabriel Costa", escola: "EM Prof. João da Silva", turma: "6B", idade: 12, sexo: "M" },
  { id_aluno: "A005", nome: "Julia Fernanda Lima", escola: "EM Prof. João da Silva", turma: "6B", idade: 11, sexo: "F" },
  { id_aluno: "A006", nome: "Gabriel Augusto Pereira", escola: "EM Santa Fé", turma: "7A", idade: 13, sexo: "M" },
  { id_aluno: "A007", nome: "Isabela Cristina Souza", escola: "EM Santa Fé", turma: "7A", idade: 12, sexo: "F" },
  { id_aluno: "A008", nome: "Matheus Ryan Almeida", escola: "EM Santa Fé", turma: "7A", idade: 13, sexo: "M" },
  // Ed. Infantil students
  { id_aluno: "A009", nome: "Helena Beatriz Rocha", escola: "EMEI Pequenos Passos", turma: "PRE-A", idade: 5, sexo: "F" },
  { id_aluno: "A010", nome: "Theo Miguel Dias", escola: "EMEI Pequenos Passos", turma: "PRE-A", idade: 5, sexo: "M" },
  { id_aluno: "A011", nome: "Laura Sophie Mendes", escola: "EMEI Pequenos Passos", turma: "PRE-B", idade: 4, sexo: "F" },
];

export const mockQuestoes: Questao[] = [
  {
    id_questao: "Q001", competencia: "Jogos e Brincadeiras",
    pergunta: "Qual é o principal objetivo dos jogos cooperativos na Educação Física escolar?",
    alternativa_a: "Definir um vencedor e um perdedor", alternativa_b: "Promover a competição entre os alunos",
    alternativa_c: "Estimular a colaboração e o trabalho em equipe", alternativa_d: "Avaliar o desempenho individual dos alunos",
    resposta_correta: "C",
  },
  {
    id_questao: "Q002", competencia: "Esportes",
    pergunta: "No voleibol, qual é o número máximo de toques que uma equipe pode dar na bola antes de enviá-la para o campo adversário?",
    alternativa_a: "2 toques", alternativa_b: "3 toques", alternativa_c: "4 toques", alternativa_d: "5 toques",
    resposta_correta: "B",
  },
];

export const mockQuestoesObservacao: QuestaoObservacao[] = [
  ...questoesEducacaoInfantil,
  // Fundamental 1 and 2 questions will be added later
];

export const mockAvaliacoes: Avaliacao[] = [
  { id_avaliacao: "AV001", data: "2026-03-10", escola: "EM Prof. João da Silva", turma: "6A", professor: "ABRAAO DOUGLAS DE SOUZA", nivel_ensino: "fundamental_2" },
  { id_avaliacao: "AV002", data: "2026-03-10", escola: "EM Prof. João da Silva", turma: "6B", professor: "ABRAAO DOUGLAS DE SOUZA", nivel_ensino: "fundamental_2" },
  { id_avaliacao: "AV003", data: "2026-03-08", escola: "EM Santa Fé", turma: "7A", professor: "DIEGO DE FREITAS COSTA PAGANI", nivel_ensino: "fundamental_2" },
  { id_avaliacao: "AV004", data: "2026-03-10", escola: "EMEI Pequenos Passos", turma: "PRE-A", professor: "ABRAAO DOUGLAS DE SOUZA", nivel_ensino: "educacao_infantil" },
  { id_avaliacao: "AV005", data: "2026-03-10", escola: "EMEI Pequenos Passos", turma: "PRE-B", professor: "ABRAAO DOUGLAS DE SOUZA", nivel_ensino: "educacao_infantil" },
];

export const mockResultados: Resultado[] = [
  { id_aluno: "A001", id_avaliacao: "AV001", acertos: 8, erros: 2, percentual: 80, nivel: "Avançado" },
  { id_aluno: "A002", id_avaliacao: "AV001", acertos: 6, erros: 4, percentual: 60, nivel: "Intermediário" },
  { id_aluno: "A003", id_avaliacao: "AV001", acertos: 4, erros: 6, percentual: 40, nivel: "Básico" },
  { id_aluno: "A004", id_avaliacao: "AV002", acertos: 7, erros: 3, percentual: 70, nivel: "Intermediário" },
  { id_aluno: "A005", id_avaliacao: "AV002", acertos: 9, erros: 1, percentual: 90, nivel: "Avançado" },
  { id_aluno: "A006", id_avaliacao: "AV003", acertos: 5, erros: 5, percentual: 50, nivel: "Básico" },
  { id_aluno: "A007", id_avaliacao: "AV003", acertos: 7, erros: 3, percentual: 70, nivel: "Intermediário" },
  { id_aluno: "A008", id_avaliacao: "AV003", acertos: 3, erros: 7, percentual: 30, nivel: "Básico" },
];

export const escolas = ["EM Prof. João da Silva", "EM Santa Fé", "EM Maracanã", "EM Nossa Senhora de Lourdes", "EMEI Pequenos Passos"];

export function getTurmasByEscola(escola: string): string[] {
  const turmas = mockAlunos.filter(a => a.escola === escola).map(a => a.turma);
  return [...new Set(turmas)];
}

export function getAlunosByTurma(escola: string, turma: string): Aluno[] {
  return mockAlunos.filter(a => a.escola === escola && a.turma === turma);
}

export function getAvaliacoesByEscolaTurma(escola: string, turma: string): Avaliacao[] {
  return mockAvaliacoes.filter(a => a.escola === escola && a.turma === turma);
}

export function getQuestoesObservacaoByNivel(nivel_ensino: NivelEnsino): QuestaoObservacao[] {
  return mockQuestoesObservacao.filter(q => q.nivel_ensino === nivel_ensino);
}

export function calcularNivel(percentual: number): string {
  if (percentual >= 80) return "Avançado";
  if (percentual >= 60) return "Intermediário";
  if (percentual >= 40) return "Básico";
  return "Abaixo do Básico";
}

// Mock data for development. In production, all data comes from Google Apps Script API.
import type { Aluno, Questao, Avaliacao, Resultado, QuestaoObservacao, NivelEnsino } from "@/types/assessment";
import { questoesEducacaoInfantil } from "./questoesEducacaoInfantil";
import { questoesFundamental1 } from "./questoesFundamental1";
import { questoesFundamental2 } from "./questoesFundamental2";
import { alunosImportados, getEscolasImportadas, getTurmasByEscolaImportada, getAlunosByTurmaImportada } from "./alunosImportados";

export const mockAlunos: Aluno[] = [
  ...alunosImportados,
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
  ...questoesFundamental1,
  ...questoesFundamental2,
];

function inferNivelEnsino(turma: string): NivelEnsino {
  const t = turma.toUpperCase().trim();
  // Educação Infantil: PRE, MATERNAL, BERÇÁRIO, INFANTIL, JARDIM, CRECHE, etc.
  if (/^(PRE|PRÉ|MATERNAL|BER[CÇ]|INFANTIL|JARDIM|CRECHE|MINI|GRUPO|GR\s)/i.test(t)) return "educacao_infantil";
  // Fundamental 2: 6° ao 9° ano
  if (/^[6-9]/.test(t)) return "fundamental_2";
  // Fundamental 1: 1° ao 5° ano
  if (/^[1-5]/.test(t)) return "fundamental_1";
  // Default by school name prefix
  return "fundamental_1";
}

// Auto-generate one assessment per escola+turma from imported data
function generateAvaliacoes(): Avaliacao[] {
  const escolaTurmas = new Set<string>();
  alunosImportados.forEach(a => {
    if (a.escola && a.turma) escolaTurmas.add(`${a.escola}|||${a.turma}`);
  });
  let idx = 1;
  return Array.from(escolaTurmas).map(key => {
    const [escola, turma] = key.split("|||");
    const id = `AV${String(idx++).padStart(4, "0")}`;
    return {
      id_avaliacao: id,
      data: "2026-03-10",
      escola,
      turma,
      professor: "",
      nivel_ensino: inferNivelEnsino(turma),
    };
  });
}

export const mockAvaliacoes: Avaliacao[] = generateAvaliacoes();

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

export const escolas = getEscolasImportadas();

export function getTurmasByEscola(escola: string): string[] {
  return getTurmasByEscolaImportada(escola);
}

export function getAlunosByTurma(escola: string, turma: string): Aluno[] {
  return getAlunosByTurmaImportada(escola, turma);
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

// Mock data for development. In production, all data comes from Google Apps Script API.
import type { Aluno, Questao, Avaliacao, Resultado } from "@/types/assessment";

export const mockAlunos: Aluno[] = [
  { id_aluno: "A001", nome: "Ana Clara Silva", escola: "EM Prof. João da Silva", turma: "6A", idade: 11, sexo: "F" },
  { id_aluno: "A002", nome: "Pedro Henrique Santos", escola: "EM Prof. João da Silva", turma: "6A", idade: 12, sexo: "M" },
  { id_aluno: "A003", nome: "Maria Eduarda Oliveira", escola: "EM Prof. João da Silva", turma: "6A", idade: 11, sexo: "F" },
  { id_aluno: "A004", nome: "Lucas Gabriel Costa", escola: "EM Prof. João da Silva", turma: "6B", idade: 12, sexo: "M" },
  { id_aluno: "A005", nome: "Julia Fernanda Lima", escola: "EM Prof. João da Silva", turma: "6B", idade: 11, sexo: "F" },
  { id_aluno: "A006", nome: "Gabriel Augusto Pereira", escola: "EM Santa Fé", turma: "7A", idade: 13, sexo: "M" },
  { id_aluno: "A007", nome: "Isabela Cristina Souza", escola: "EM Santa Fé", turma: "7A", idade: 12, sexo: "F" },
  { id_aluno: "A008", nome: "Matheus Ryan Almeida", escola: "EM Santa Fé", turma: "7A", idade: 13, sexo: "M" },
];

export const mockQuestoes: Questao[] = [
  {
    id_questao: "Q001",
    competencia: "Jogos e Brincadeiras",
    pergunta: "Qual é o principal objetivo dos jogos cooperativos na Educação Física escolar?",
    alternativa_a: "Definir um vencedor e um perdedor",
    alternativa_b: "Promover a competição entre os alunos",
    alternativa_c: "Estimular a colaboração e o trabalho em equipe",
    alternativa_d: "Avaliar o desempenho individual dos alunos",
    resposta_correta: "C",
  },
  {
    id_questao: "Q002",
    competencia: "Esportes",
    pergunta: "No voleibol, qual é o número máximo de toques que uma equipe pode dar na bola antes de enviá-la para o campo adversário?",
    alternativa_a: "2 toques",
    alternativa_b: "3 toques",
    alternativa_c: "4 toques",
    alternativa_d: "5 toques",
    resposta_correta: "B",
  },
  {
    id_questao: "Q003",
    competencia: "Ginástica",
    pergunta: "Qual das alternativas abaixo é um exemplo de elemento da ginástica artística?",
    alternativa_a: "Saque por cima",
    alternativa_b: "Rolamento para frente",
    alternativa_c: "Passe de peito",
    alternativa_d: "Drible de proteção",
    resposta_correta: "B",
  },
  {
    id_questao: "Q004",
    competencia: "Danças",
    pergunta: "O frevo é uma manifestação cultural originária de qual região do Brasil?",
    alternativa_a: "Região Sul",
    alternativa_b: "Região Sudeste",
    alternativa_c: "Região Nordeste",
    alternativa_d: "Região Norte",
    resposta_correta: "C",
  },
  {
    id_questao: "Q005",
    competencia: "Lutas",
    pergunta: "A capoeira é reconhecida como patrimônio cultural imaterial do Brasil. Ela combina elementos de:",
    alternativa_a: "Luta, dança e música",
    alternativa_b: "Ginástica e natação",
    alternativa_c: "Atletismo e ciclismo",
    alternativa_d: "Futebol e basquete",
    resposta_correta: "A",
  },
  {
    id_questao: "Q006",
    competencia: "Corpo e Saúde",
    pergunta: "Qual é a importância do aquecimento antes de uma atividade física?",
    alternativa_a: "Deixar o corpo cansado antes do exercício",
    alternativa_b: "Preparar o corpo para o esforço, prevenindo lesões",
    alternativa_c: "Substituir a atividade principal",
    alternativa_d: "Reduzir a frequência cardíaca",
    resposta_correta: "B",
  },
  {
    id_questao: "Q007",
    competencia: "Esportes",
    pergunta: "No basquetebol, quantos pontos vale uma cesta convertida de fora da linha de três pontos?",
    alternativa_a: "1 ponto",
    alternativa_b: "2 pontos",
    alternativa_c: "3 pontos",
    alternativa_d: "4 pontos",
    resposta_correta: "C",
  },
  {
    id_questao: "Q008",
    competencia: "Jogos e Brincadeiras",
    pergunta: "Os jogos pré-desportivos têm como principal característica:",
    alternativa_a: "Seguir rigorosamente as regras oficiais do esporte",
    alternativa_b: "Adaptar regras para facilitar a aprendizagem de fundamentos esportivos",
    alternativa_c: "Excluir alunos com menor habilidade",
    alternativa_d: "Focar apenas na competição",
    resposta_correta: "B",
  },
  {
    id_questao: "Q009",
    competencia: "Corpo e Saúde",
    pergunta: "A frequência cardíaca tende a aumentar durante a prática de exercícios físicos. Isso acontece porque:",
    alternativa_a: "O corpo precisa de menos oxigênio durante o exercício",
    alternativa_b: "O coração precisa bombear mais sangue para os músculos em atividade",
    alternativa_c: "Os músculos param de funcionar durante o exercício",
    alternativa_d: "A respiração diminui durante o esforço",
    resposta_correta: "B",
  },
  {
    id_questao: "Q010",
    competencia: "Práticas de Aventura",
    pergunta: "Qual das atividades abaixo é considerada uma prática corporal de aventura na natureza?",
    alternativa_a: "Futebol de salão",
    alternativa_b: "Corrida de orientação",
    alternativa_c: "Queimada",
    alternativa_d: "Vôlei de quadra",
    resposta_correta: "B",
  },
];

export const mockAvaliacoes: Avaliacao[] = [
  { id_avaliacao: "AV001", data: "2026-03-10", escola: "EM Prof. João da Silva", turma: "6A", professor: "ABRAAO DOUGLAS DE SOUZA" },
  { id_avaliacao: "AV002", data: "2026-03-10", escola: "EM Prof. João da Silva", turma: "6B", professor: "ABRAAO DOUGLAS DE SOUZA" },
  { id_avaliacao: "AV003", data: "2026-03-08", escola: "EM Santa Fé", turma: "7A", professor: "DIEGO DE FREITAS COSTA PAGANI" },
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

export const escolas = ["EM Prof. João da Silva", "EM Santa Fé", "EM Maracanã", "EM Nossa Senhora de Lourdes"];

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

export function calcularNivel(percentual: number): string {
  if (percentual >= 80) return "Avançado";
  if (percentual >= 60) return "Intermediário";
  if (percentual >= 40) return "Básico";
  return "Abaixo do Básico";
}

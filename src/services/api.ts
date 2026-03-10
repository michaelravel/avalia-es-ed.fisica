// API service layer - connects to Google Apps Script in production
// Uses mock data in development

const API_BASE_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "";

const USE_MOCK = !API_BASE_URL;

import { mockAlunos, mockQuestoes, mockAvaliacoes, mockResultados, escolas, getTurmasByEscola, getAlunosByTurma, getAvaliacoesByEscolaTurma, calcularNivel } from "@/data/mockData";
import type { Aluno, Questao, Avaliacao, Resposta, Resultado } from "@/types/assessment";

async function apiFetch<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  if (USE_MOCK) {
    return handleMock(action, params) as T;
  }
  const url = new URL(API_BASE_URL);
  url.searchParams.set("action", action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

async function apiPost<T>(action: string, body: Record<string, unknown>): Promise<T> {
  if (USE_MOCK) {
    return handleMockPost(action, body) as T;
  }
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

// Mock handlers
function handleMock(action: string, params: Record<string, string>): unknown {
  switch (action) {
    case "getEscolas": return { data: escolas };
    case "getTurmas": return { data: getTurmasByEscola(params.escola) };
    case "getAlunos": return { data: getAlunosByTurma(params.escola, params.turma) };
    case "getAvaliacoes": return { data: getAvaliacoesByEscolaTurma(params.escola, params.turma) };
    case "getQuestoes": return { data: mockQuestoes };
    case "getResultados": {
      const filtered = mockResultados.filter(r => r.id_avaliacao === params.id_avaliacao);
      const withNames = filtered.map(r => {
        const aluno = mockAlunos.find(a => a.id_aluno === r.id_aluno);
        return { ...r, nome_aluno: aluno?.nome || "Desconhecido", turma: aluno?.turma || "" };
      });
      return { data: withNames };
    }
    case "getResultadoAluno": {
      const r = mockResultados.find(
        res => res.id_aluno === params.id_aluno && res.id_avaliacao === params.id_avaliacao
      );
      if (!r) return { data: null };
      const aluno = mockAlunos.find(a => a.id_aluno === params.id_aluno);
      return { data: { ...r, nome_aluno: aluno?.nome, turma: aluno?.turma } };
    }
    default: return { data: [] };
  }
}

function handleMockPost(action: string, body: Record<string, unknown>): unknown {
  switch (action) {
    case "submitRespostas": {
      const respostas = body.respostas as Array<{ id_questao: string; resposta: string }>;
      let acertos = 0;
      respostas.forEach(r => {
        const q = mockQuestoes.find(q => q.id_questao === r.id_questao);
        if (q && q.resposta_correta === r.resposta) acertos++;
      });
      const total = respostas.length;
      const erros = total - acertos;
      const percentual = Math.round((acertos / total) * 100);
      const nivel = calcularNivel(percentual);

      const resultado: Resultado = {
        id_aluno: body.id_aluno as string,
        id_avaliacao: body.id_avaliacao as string,
        acertos,
        erros,
        percentual,
        nivel,
      };

      // Build correction details
      const correcao = respostas.map(r => {
        const q = mockQuestoes.find(q => q.id_questao === r.id_questao)!;
        return {
          id_questao: r.id_questao,
          pergunta: q.pergunta,
          resposta_aluno: r.resposta,
          resposta_correta: q.resposta_correta,
          acertou: q.resposta_correta === r.resposta,
        };
      });

      return { data: { resultado, correcao } };
    }
    default: return { success: true };
  }
}

// Public API
export const api = {
  getEscolas: () => apiFetch<{ data: string[] }>("getEscolas").then(r => r.data),
  getTurmas: (escola: string) => apiFetch<{ data: string[] }>("getTurmas", { escola }).then(r => r.data),
  getAlunos: (escola: string, turma: string) =>
    apiFetch<{ data: Aluno[] }>("getAlunos", { escola, turma }).then(r => r.data),
  getAvaliacoes: (escola: string, turma: string) =>
    apiFetch<{ data: Avaliacao[] }>("getAvaliacoes", { escola, turma }).then(r => r.data),
  getQuestoes: (id_avaliacao: string) =>
    apiFetch<{ data: Questao[] }>("getQuestoes", { id_avaliacao }).then(r => r.data),
  getResultados: (id_avaliacao: string) =>
    apiFetch<{ data: (Resultado & { nome_aluno: string; turma: string })[] }>("getResultados", { id_avaliacao }).then(r => r.data),
  getResultadoAluno: (id_aluno: string, id_avaliacao: string) =>
    apiFetch<{ data: Resultado & { nome_aluno: string; turma: string } | null }>("getResultadoAluno", { id_aluno, id_avaliacao }).then(r => r.data),
  submitRespostas: (data: { id_aluno: string; id_avaliacao: string; respostas: Array<{ id_questao: string; resposta: string }> }) =>
    apiPost<{ data: { resultado: Resultado; correcao: Array<{ id_questao: string; pergunta: string; resposta_aluno: string; resposta_correta: string; acertou: boolean }> } }>("submitRespostas", data).then(r => r.data),
};

// API service layer - uses Lovable Cloud (Supabase) for all data
import { supabase } from "@/integrations/supabase/client";
import type { Aluno, Questao, Avaliacao, Resultado, QuestaoObservacao, NivelEnsino, NivelResposta } from "@/types/assessment";

function calcularNivel(percentual: number): string {
  if (percentual >= 80) return "Avançado";
  if (percentual >= 60) return "Intermediário";
  if (percentual >= 40) return "Básico";
  return "Abaixo do Básico";
}

export const api = {
  getEscolas: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from("alunos")
      .select("escola")
      .order("escola");
    if (error) throw error;
    return [...new Set((data || []).map((d: any) => d.escola))].filter(Boolean).sort();
  },

  getTurmas: async (escola: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from("alunos")
      .select("turma")
      .eq("escola", escola);
    if (error) throw error;
    return [...new Set((data || []).map((d: any) => d.turma))].filter(Boolean).sort();
  },

  getAlunos: async (escola: string, turma: string): Promise<Aluno[]> => {
    const { data, error } = await supabase
      .from("alunos")
      .select("*")
      .eq("escola", escola)
      .eq("turma", turma)
      .order("nome");
    if (error) throw error;
    return (data || []) as Aluno[];
  },

  getAvaliacoes: async (escola: string, turma: string, nivelEnsino?: string): Promise<Avaliacao[]> => {
    let query = supabase
      .from("avaliacoes")
      .select("*")
      .eq("escola", escola)
      .eq("turma", turma);
    if (nivelEnsino) query = query.eq("nivel_ensino", nivelEnsino);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as Avaliacao[];
  },

  createAvaliacao: async (escola: string, turma: string, nivelEnsino: NivelEnsino, professor: string): Promise<Avaliacao> => {
    const id_avaliacao = `AV-${nivelEnsino.toUpperCase().slice(0, 3)}-${Date.now()}`;
    const { data, error } = await supabase
      .from("avaliacoes")
      .insert({ id_avaliacao, escola, turma, nivel_ensino: nivelEnsino, professor })
      .select()
      .single();
    if (error) throw error;
    return data as Avaliacao;
  },

  getQuestoes: async (_id_avaliacao: string): Promise<Questao[]> => {
    // Legacy multiple-choice - not currently used
    return [];
  },

  getQuestoesObservacao: async (nivel_ensino: NivelEnsino): Promise<QuestaoObservacao[]> => {
    const { data, error } = await supabase
      .from("questoes_observacao")
      .select("*")
      .eq("nivel_ensino", nivel_ensino);
    if (error) throw error;
    return (data || []) as QuestaoObservacao[];
  },

  getResultados: async (id_avaliacao: string): Promise<(Resultado & { nome_aluno: string; turma: string })[]> => {
    const { data, error } = await supabase
      .from("resultados")
      .select("*")
      .eq("id_avaliacao", id_avaliacao);
    if (error) throw error;
    
    // Enrich with aluno names
    const results = data || [];
    const alunoIds = results.map((r: any) => r.id_aluno);
    const { data: alunos } = await supabase
      .from("alunos")
      .select("id_aluno, nome, turma")
      .in("id_aluno", alunoIds);
    
    const alunoMap = new Map((alunos || []).map((a: any) => [a.id_aluno, a]));
    return results.map((r: any) => {
      const aluno = alunoMap.get(r.id_aluno);
      return { ...r, nome_aluno: aluno?.nome || "Desconhecido", turma: aluno?.turma || "" };
    });
  },

  getResultadoAluno: async (id_aluno: string, id_avaliacao: string): Promise<(Resultado & { nome_aluno: string; turma: string }) | null> => {
    const { data, error } = await supabase
      .from("resultados")
      .select("*")
      .eq("id_aluno", id_aluno)
      .eq("id_avaliacao", id_avaliacao)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    
    const { data: aluno } = await supabase
      .from("alunos")
      .select("nome, turma")
      .eq("id_aluno", id_aluno)
      .maybeSingle();
    
    return { ...data, nome_aluno: aluno?.nome || "Desconhecido", turma: aluno?.turma || "" } as any;
  },

  submitRespostas: async (data: { id_aluno: string; id_avaliacao: string; respostas: Array<{ id_questao: string; resposta: string }> }) => {
    // Legacy multiple-choice submission - kept for compatibility
    return { resultado: { id_aluno: data.id_aluno, id_avaliacao: data.id_avaliacao, acertos: 0, erros: 0, percentual: 0, nivel: "Básico" } as Resultado, correcao: [] };
  },

  submitRespostasObservacao: async (input: { id_aluno: string; id_avaliacao: string; neurodivergente: boolean; nivel_ensino: NivelEnsino; respostas: Array<{ id_questao: string; resposta: string }> }) => {
    const respostas = input.respostas as Array<{ id_questao: string; resposta: NivelResposta }>;
    const counts = { avancado: 0, intermediario: 0, basico: 0 };
    respostas.forEach(r => {
      if (r.resposta in counts) counts[r.resposta as keyof typeof counts]++;
    });
    const total = respostas.length;
    const score = (counts.avancado * 3 + counts.intermediario * 2 + counts.basico * 1) / (total * 3) * 100;
    const percentual = Math.round(score);
    const nivel = calcularNivel(percentual);

    const resultado: Resultado = {
      id_aluno: input.id_aluno,
      id_avaliacao: input.id_avaliacao,
      acertos: counts.avancado,
      erros: counts.basico,
      percentual,
      nivel,
      neurodivergente: input.neurodivergente,
    };

    // Upsert into database
    const { error } = await supabase
      .from("resultados")
      .upsert({
        id_aluno: resultado.id_aluno,
        id_avaliacao: resultado.id_avaliacao,
        acertos: resultado.acertos,
        erros: resultado.erros,
        percentual: resultado.percentual,
        nivel: resultado.nivel,
        neurodivergente: resultado.neurodivergente,
      }, { onConflict: "id_aluno,id_avaliacao" });
    
    if (error) throw error;

    return { resultado };
  },
};

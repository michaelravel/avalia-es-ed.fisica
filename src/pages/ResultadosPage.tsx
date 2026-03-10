import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import AppHeader from "@/components/AppHeader";
import { ChevronRight, User, Trophy } from "lucide-react";
import type { Resultado } from "@/types/assessment";

export default function ResultadosPage() {
  const [escola, setEscola] = useState("");
  const [turma, setTurma] = useState("");
  const [avaliacaoId, setAvaliacaoId] = useState("");

  const { data: escolas = [] } = useQuery({ queryKey: ["escolas"], queryFn: api.getEscolas });
  const { data: turmas = [] } = useQuery({ queryKey: ["turmas", escola], queryFn: () => api.getTurmas(escola), enabled: !!escola });
  const { data: avaliacoes = [] } = useQuery({ queryKey: ["avaliacoes", escola, turma], queryFn: () => api.getAvaliacoes(escola, turma), enabled: !!escola && !!turma });
  const { data: resultados = [] } = useQuery({ queryKey: ["resultados", avaliacaoId], queryFn: () => api.getResultados(avaliacaoId), enabled: !!avaliacaoId });

  const nivelColor = (nivel: string) => {
    switch (nivel) {
      case "Avançado": return "text-success";
      case "Intermediário": return "text-primary";
      case "Básico": return "text-amber-600";
      default: return "text-destructive";
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader title="Resultados" />
      <main className="container py-6 max-w-lg">
        {/* Filters */}
        <div className="space-y-3 mb-6">
          <select value={escola} onChange={e => { setEscola(e.target.value); setTurma(""); setAvaliacaoId(""); }}
            className="w-full card-surface p-3 text-sm bg-card">
            <option value="">Selecione a escola</option>
            {escolas.map(e => <option key={e} value={e}>{e}</option>)}
          </select>

          {escola && (
            <select value={turma} onChange={e => { setTurma(e.target.value); setAvaliacaoId(""); }}
              className="w-full card-surface p-3 text-sm bg-card animate-fade-in">
              <option value="">Selecione a turma</option>
              {turmas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}

          {turma && (
            <select value={avaliacaoId} onChange={e => setAvaliacaoId(e.target.value)}
              className="w-full card-surface p-3 text-sm bg-card animate-fade-in">
              <option value="">Selecione a avaliação</option>
              {avaliacoes.map(a => <option key={a.id_avaliacao} value={a.id_avaliacao}>{a.id_avaliacao} — {a.data}</option>)}
            </select>
          )}
        </div>

        {/* Results list */}
        {avaliacaoId && (
          <div className="space-y-3 animate-fade-in">
            {resultados.length === 0 && <p className="text-sm text-muted-foreground">Nenhum resultado encontrado.</p>}
            {resultados.map((r: Resultado & { nome_aluno: string }) => (
              <div key={r.id_aluno} className="card-surface p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                      <User className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.nome_aluno}</p>
                      <p className="text-xs text-muted-foreground">{r.acertos} acertos · {r.erros} erros</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">{r.percentual}%</div>
                    <div className={`text-xs font-medium ${nivelColor(r.nivel)}`}>{r.nivel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

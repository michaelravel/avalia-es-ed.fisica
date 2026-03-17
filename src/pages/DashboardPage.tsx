import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import AppHeader from "@/components/AppHeader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Resultado } from "@/types/assessment";

export default function DashboardPage() {
  const [escola, setEscola] = useState("");
  const [turma, setTurma] = useState("");
  const [avaliacaoId, setAvaliacaoId] = useState("");

  const { data: escolas = [] } = useQuery({ queryKey: ["escolas"], queryFn: api.getEscolas });
  const { data: turmas = [] } = useQuery({ queryKey: ["turmas", escola], queryFn: () => api.getTurmas(escola), enabled: !!escola });
  const { data: avaliacoes = [] } = useQuery({ queryKey: ["avaliacoes", escola, turma], queryFn: () => api.getAvaliacoes(escola, turma), enabled: !!escola && !!turma });
  const { data: resultados = [] } = useQuery({ queryKey: ["resultados", avaliacaoId], queryFn: () => api.getResultados(avaliacaoId), enabled: !!avaliacaoId });

  const media = resultados.length > 0 ? Math.round(resultados.reduce((s, r) => s + r.percentual, 0) / resultados.length) : 0;

  // Distribution by level
  const nivelData = ["Avançado", "Intermediário", "Básico", "Abaixo do Básico"].map(nivel => ({
    nivel,
    quantidade: resultados.filter(r => r.nivel === nivel).length,
  }));

  // Per-student performance for bar chart
  const alunoData = resultados.map((r: Resultado & { nome_aluno: string }) => ({
    nome: r.nome_aluno?.split(" ").slice(0, 2).join(" ") || r.id_aluno,
    percentual: r.percentual,
  }));

  const barColor = (pct: number) => {
    if (pct >= 80) return "var(--color-success)";
    if (pct >= 60) return "var(--color-primary)";
    if (pct >= 40) return "var(--color-warning)";
    return "var(--color-destructive)";
  };

  return (
    <div className="min-h-screen">
      <AppHeader title="Dashboard" />
      <main className="container py-6 max-w-2xl">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <select value={escola} onChange={e => { setEscola(e.target.value); setTurma(""); setAvaliacaoId(""); }}
            className="card-surface p-3 text-sm bg-card">
            <option value="">Escola</option>
            {escolas.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={turma} onChange={e => { setTurma(e.target.value); setAvaliacaoId(""); }}
            className="card-surface p-3 text-sm bg-card" disabled={!escola}>
            <option value="">Turma</option>
            {turmas.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={avaliacaoId} onChange={e => setAvaliacaoId(e.target.value)}
            className="card-surface p-3 text-sm bg-card" disabled={!turma}>
            <option value="">Avaliação</option>
            {avaliacoes.map(a => <option key={a.id_avaliacao} value={a.id_avaliacao}>{a.id_avaliacao}</option>)}
          </select>
        </div>

        {avaliacaoId && resultados.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card-surface p-4 text-center">
                <div className="text-3xl font-bold text-primary">{media}%</div>
                <div className="text-xs text-muted-foreground">Média da Turma</div>
              </div>
              <div className="card-surface p-4 text-center">
                <div className="text-3xl font-bold text-foreground">{resultados.length}</div>
                <div className="text-xs text-muted-foreground">Alunos</div>
              </div>
              <div className="card-surface p-4 text-center">
                <div className="text-3xl font-bold text-success">
                  {resultados.filter(r => r.percentual >= 60).length}
                </div>
                <div className="text-xs text-muted-foreground">Acima de 60%</div>
              </div>
            </div>

            {/* Distribution chart */}
            <div className="card-surface p-6">
              <h3 className="text-sm font-bold mb-4">Distribuição por Nível</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={nivelData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="nivel" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="quantidade" radius={[0, 4, 4, 0]}>
                    {nivelData.map((entry, i) => (
                      <Cell key={i} fill={
                        entry.nivel === "Avançado" ? "var(--color-success)" :
                        entry.nivel === "Intermediário" ? "var(--color-primary)" :
                        entry.nivel === "Básico" ? "var(--color-warning)" :
                        "var(--color-destructive)"
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Per-student chart */}
            <div className="card-surface p-6">
              <h3 className="text-sm font-bold mb-4">Desempenho por Aluno</h3>
              <ResponsiveContainer width="100%" height={Math.max(200, alunoData.length * 40)}>
                <BarChart data={alunoData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="nome" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="percentual" radius={[0, 4, 4, 0]}>
                    {alunoData.map((entry, i) => (
                      <Cell key={i} fill={barColor(entry.percentual)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {avaliacaoId && resultados.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nenhum resultado encontrado para esta avaliação.</p>
        )}

        {!avaliacaoId && (
          <p className="text-center text-muted-foreground py-12">Selecione escola, turma e avaliação para visualizar o dashboard.</p>
        )}
      </main>
    </div>
  );
}

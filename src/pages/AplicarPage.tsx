import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { ChevronRight, Baby, BookOpen, GraduationCap, AlertCircle, Plus } from "lucide-react";
import type { Aluno, Avaliacao, NivelEnsino } from "@/types/assessment";
import { NIVEL_ENSINO_LABELS } from "@/types/assessment";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import AppHeader from "@/components/AppHeader";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
const NIVEL_ICONS: Record<NivelEnsino, React.ReactNode> = {
  educacao_infantil: <Baby className="h-6 w-6" />,
  fundamental_1: <BookOpen className="h-6 w-6" />,
  fundamental_2: <GraduationCap className="h-6 w-6" />,
};

export default function AplicarPage() {
  const navigate = useNavigate();
  const [nivelEnsino, setNivelEnsino] = useState<NivelEnsino | "">("");
  const [escola, setEscola] = useState("");
  const [turma, setTurma] = useState("");
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [aluno, setAluno] = useState<Aluno | null>(null);
  const [neurodivergente, setNeurodivergente] = useState(false);

  const { data: escolas = [] } = useQuery({
    queryKey: ["escolas"],
    queryFn: api.getEscolas,
  });

  const { data: turmas = [] } = useQuery({
    queryKey: ["turmas", escola],
    queryFn: () => api.getTurmas(escola),
    enabled: !!escola,
  });

  const { data: avaliacoes = [] } = useQuery({
    queryKey: ["avaliacoes", escola, turma, nivelEnsino],
    queryFn: () => api.getAvaliacoes(escola, turma, nivelEnsino),
    enabled: !!escola && !!turma && !!nivelEnsino,
  });

  const { data: alunos = [] } = useQuery({
    queryKey: ["alunos", escola, turma],
    queryFn: () => api.getAlunos(escola, turma),
    enabled: !!escola && !!turma,
  });

  const handleStart = () => {
    if (aluno && avaliacao && nivelEnsino) {
      const params = new URLSearchParams({ neurodivergente: neurodivergente ? "1" : "0", nivel: nivelEnsino });
      navigate(`/prova/${avaliacao.id_avaliacao}/${aluno.id_aluno}?${params}`);
    }
  };

  // Step logic
  const step = !nivelEnsino ? 0 : !escola ? 1 : !turma ? 2 : !avaliacao ? 3 : !aluno ? 4 : 5;

  return (
    <div className="min-h-screen">
      <AppHeader title="Aplicar Avaliação" />
      <main className="container py-6 max-w-lg">
        {/* Step 0: Nível de Ensino */}
        <section className="mb-4 animate-fade-in">
          <label className="text-sm font-bold text-muted-foreground mb-2 block">Nível de Ensino</label>
          {nivelEnsino ? (
            <button onClick={() => { setNivelEnsino(""); setEscola(""); setTurma(""); setAvaliacao(null); setAluno(null); }}
              className="card-surface w-full p-3 text-left text-sm flex justify-between items-center hover:bg-accent/50">
              <div className="flex items-center gap-2">
                {NIVEL_ICONS[nivelEnsino]}
                <span>{NIVEL_ENSINO_LABELS[nivelEnsino]}</span>
              </div>
              <span className="text-xs text-muted-foreground">Alterar</span>
            </button>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {(["educacao_infantil", "fundamental_1", "fundamental_2"] as NivelEnsino[]).map(nivel => (
                <button key={nivel} onClick={() => setNivelEnsino(nivel)}
                  className="card-surface w-full p-4 text-left text-sm flex items-center gap-3 hover:bg-accent/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    {NIVEL_ICONS[nivel]}
                  </div>
                  <span className="font-medium">{NIVEL_ENSINO_LABELS[nivel]}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Step 1: Escola */}
        {step >= 1 && (
          <section className="mb-4 animate-fade-in">
            <label className="text-sm font-bold text-muted-foreground mb-2 block">Escola</label>
            {escola ? (
              <button onClick={() => { setEscola(""); setTurma(""); setAvaliacao(null); setAluno(null); }}
                className="card-surface w-full p-3 text-left text-sm flex justify-between items-center hover:bg-accent/50">
                <span>{escola}</span>
                <span className="text-xs text-muted-foreground">Alterar</span>
              </button>
            ) : (
              <div className="space-y-2">
                {escolas.map(e => (
                  <button key={e} onClick={() => setEscola(e)}
                    className="card-surface w-full p-3 text-left text-sm flex justify-between items-center hover:bg-accent/50 transition-colors">
                    <span>{e}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Step 2: Turma */}
        {step >= 2 && escola && (
          <section className="mb-4 animate-fade-in">
            <label className="text-sm font-bold text-muted-foreground mb-2 block">Turma</label>
            {turma ? (
              <button onClick={() => { setTurma(""); setAvaliacao(null); setAluno(null); }}
                className="card-surface w-full p-3 text-left text-sm flex justify-between items-center hover:bg-accent/50">
                <span>{turma}</span>
                <span className="text-xs text-muted-foreground">Alterar</span>
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                {turmas.map(t => (
                  <button key={t} onClick={() => setTurma(t)}
                    className="card-surface px-4 py-2 text-sm hover:bg-accent/50 transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Step 3: Avaliação */}
        {step >= 3 && turma && (
          <section className="mb-4 animate-fade-in">
            <label className="text-sm font-bold text-muted-foreground mb-2 block">Avaliação</label>
            {avaliacao ? (
              <button onClick={() => { setAvaliacao(null); setAluno(null); }}
                className="card-surface w-full p-3 text-left text-sm flex justify-between items-center hover:bg-accent/50">
                <span>{avaliacao.id_avaliacao} — {avaliacao.data}</span>
                <span className="text-xs text-muted-foreground">Alterar</span>
              </button>
            ) : (
              <div className="space-y-2">
                {avaliacoes.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma avaliação encontrada.</p>}
                {avaliacoes.map(av => (
                  <button key={av.id_avaliacao} onClick={() => setAvaliacao(av)}
                    className="card-surface w-full p-3 text-left text-sm flex justify-between items-center hover:bg-accent/50 transition-colors">
                    <div>
                      <div className="font-medium">{av.id_avaliacao}</div>
                      <div className="text-xs text-muted-foreground">{av.data} — Prof. {av.professor}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Step 4: Aluno + Neurodivergente */}
        {step >= 4 && avaliacao && (
          <section className="mb-4 animate-fade-in">
            <label className="text-sm font-bold text-muted-foreground mb-2 block">Aluno</label>
            {aluno ? (
              <>
                <button onClick={() => setAluno(null)}
                  className="card-surface w-full p-3 text-left text-sm flex justify-between items-center hover:bg-accent/50 mb-3">
                  <span>{aluno.nome}</span>
                  <span className="text-xs text-muted-foreground">Alterar</span>
                </button>
                {/* Neurodivergente toggle */}
                <div className="card-surface p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-accent-foreground" />
                    <span className="text-sm font-medium">Aluno Neurodivergente?</span>
                  </div>
                  <Switch checked={neurodivergente} onCheckedChange={setNeurodivergente} />
                </div>
              </>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {alunos.map(a => (
                  <button key={a.id_aluno} onClick={() => setAluno(a)}
                    className="card-surface w-full p-3 text-left text-sm flex justify-between items-center hover:bg-accent/50 transition-colors">
                    <span>{a.nome}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Step 5: Start */}
        {step === 5 && (
          <div className="animate-fade-in">
            <Button onClick={handleStart} className="w-full" size="lg">
              Iniciar Avaliação
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

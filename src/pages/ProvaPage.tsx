import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Check } from "lucide-react";
import type { QuestaoObservacao, NivelEnsino, NivelResposta, Resultado } from "@/types/assessment";
import { NIVEL_RESPOSTA_LABELS } from "@/types/assessment";
import ProvaResultado from "@/components/ProvaResultado";

const NIVEL_COLORS: Record<NivelResposta, string> = {
  basico: "bg-destructive text-destructive-foreground",
  intermediario: "bg-accent text-accent-foreground border border-border",
  avancado: "bg-success text-success-foreground",
};

export default function ProvaPage() {
  const { id_avaliacao, id_aluno } = useParams<{ id_avaliacao: string; id_aluno: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const nivelEnsino = (searchParams.get("nivel") || "educacao_infantil") as NivelEnsino;
  const neurodivergente = searchParams.get("neurodivergente") === "1";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, NivelResposta>>({});
  const [submitted, setSubmitted] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const { data: questoes = [] } = useQuery({
    queryKey: ["questoes_obs", nivelEnsino],
    queryFn: () => api.getQuestoesObservacao(nivelEnsino),
  });

  // Timer
  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [startTime, submitted]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const questao = questoes[currentIndex];
  const total = questoes.length;

  // Group questions by competencia for display
  const competencias = questoes.reduce<string[]>((acc, q) => {
    if (!acc.includes(q.competencia)) acc.push(q.competencia);
    return acc;
  }, []);
  const currentCompetencia = questao?.competencia;

  const handleSelect = useCallback((nivel: NivelResposta) => {
    if (submitted || submitting || !questao) return;
    setRespostas(prev => ({ ...prev, [questao.id_questao]: nivel }));

    // Auto-advance after brief delay
    setTimeout(() => {
      if (currentIndex < total - 1) {
        setCurrentIndex(i => i + 1);
      }
    }, 350);
  }, [currentIndex, total, questao, submitted, submitting]);

  const handleSubmit = async () => {
    if (!id_aluno || !id_avaliacao || submitting) return;

    const submittedKey = `submitted_${id_aluno}_${id_avaliacao}`;
    if (localStorage.getItem(submittedKey)) {
      alert("Esta avaliação já foi enviada.");
      return;
    }

    setSubmitting(true);
    try {
      const respArray = Object.entries(respostas).map(([id_questao, resposta]) => ({ id_questao, resposta }));
      const result = await api.submitRespostasObservacao({
        id_aluno,
        id_avaliacao,
        neurodivergente,
        nivel_ensino: nivelEnsino,
        respostas: respArray,
      });
      setResultado(result.resultado);
      setSubmitted(true);
      localStorage.setItem(submittedKey, "true");
    } catch {
      const pending = JSON.parse(localStorage.getItem("pending_respostas") || "[]");
      pending.push({ id_aluno, id_avaliacao, neurodivergente, nivel_ensino: nivelEnsino, respostas: Object.entries(respostas).map(([id_questao, resposta]) => ({ id_questao, resposta })), timestamp: Date.now() });
      localStorage.setItem("pending_respostas", JSON.stringify(pending));
      alert("Sem conexão. Respostas salvas para envio posterior.");
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = total > 0 && Object.keys(respostas).length === total;
  const isLastQuestion = currentIndex === total - 1;

  if (questoes.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Carregando questões...</p>
      </div>
    );
  }

  if (submitted && resultado) {
    return <ProvaResultado resultado={resultado} respostas={respostas} questoes={questoes} neurodivergente={neurodivergente} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="bg-card border-b px-4 py-3">
        <div className="container max-w-lg flex items-center justify-between mb-2">
          <button onClick={() => currentIndex > 0 ? setCurrentIndex(i => i - 1) : navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium">{currentIndex + 1} de {total}</span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatTime(elapsed)}</span>
          </div>
        </div>
        <Progress value={((currentIndex + 1) / total) * 100} className="h-1.5" />
      </div>

      {/* Question */}
      <div className="flex-1 container max-w-lg py-6 flex flex-col">
        <div className="mb-4">
          <span className="inline-block rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-accent-foreground mb-3">
            {currentCompetencia}
          </span>
          <p className="text-base font-medium leading-relaxed">{questao.descricao}</p>
        </div>

        {/* Level selection buttons */}
        <div className="flex-1 flex flex-col justify-center space-y-3 my-6">
          {(["basico", "intermediario", "avancado"] as NivelResposta[]).map(nivel => {
            const isSelected = respostas[questao.id_questao] === nivel;

            return (
              <button
                key={nivel}
                onClick={() => handleSelect(nivel)}
                className={`w-full p-4 rounded-lg text-sm font-medium transition-all flex items-center justify-between
                  ${isSelected ? NIVEL_COLORS[nivel] + " shadow-md scale-[1.02]" : "card-surface hover:bg-accent/50"}
                `}
              >
                <span className="text-base">{NIVEL_RESPOSTA_LABELS[nivel]}</span>
                {isSelected && <Check className="h-5 w-5" />}
              </button>
            );
          })}
        </div>

        {/* Submit button on last question */}
        {isLastQuestion && allAnswered && (
          <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="lg">
            {submitting ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        )}

        {/* Navigation dots */}
        <div className="flex justify-center gap-1.5 mt-4 flex-wrap">
          {questoes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 w-2 rounded-full transition-all ${
                i === currentIndex ? "bg-primary w-4" : respostas[questoes[i].id_questao] ? "bg-primary/40" : "bg-secondary"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

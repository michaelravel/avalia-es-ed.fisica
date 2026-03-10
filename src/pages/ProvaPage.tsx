import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowLeft, Clock } from "lucide-react";
import type { Questao, Resultado } from "@/types/assessment";

type CorrecaoItem = {
  id_questao: string;
  pergunta: string;
  resposta_aluno: string;
  resposta_correta: string;
  acertou: boolean;
};

const LABELS: Record<string, string> = { A: "alternativa_a", B: "alternativa_b", C: "alternativa_c", D: "alternativa_d" };

export default function ProvaPage() {
  const { id_avaliacao, id_aluno } = useParams<{ id_avaliacao: string; id_aluno: string }>();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [correcao, setCorrecao] = useState<CorrecaoItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const { data: questoes = [] } = useQuery({
    queryKey: ["questoes", id_avaliacao],
    queryFn: () => api.getQuestoes(id_avaliacao!),
    enabled: !!id_avaliacao,
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
  const progress = total > 0 ? ((currentIndex + (submitted ? 1 : 0)) / total) * 100 : 0;

  const handleSelect = useCallback((letter: string) => {
    if (submitted || submitting) return;

    setSelectedAnswer(letter);
    setRespostas(prev => ({ ...prev, [questao.id_questao]: letter }));

    // Auto-advance after brief delay
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentIndex < total - 1) {
        setCurrentIndex(i => i + 1);
      }
    }, 400);
  }, [currentIndex, total, questao, submitted, submitting]);

  const handleSubmit = async () => {
    if (!id_aluno || !id_avaliacao || submitting) return;
    
    // Check if already submitted (prevent duplicates)
    const submittedKey = `submitted_${id_aluno}_${id_avaliacao}`;
    if (localStorage.getItem(submittedKey)) {
      alert("Esta avaliação já foi enviada.");
      return;
    }

    setSubmitting(true);
    try {
      const respArray = Object.entries(respostas).map(([id_questao, resposta]) => ({ id_questao, resposta }));
      const result = await api.submitRespostas({ id_aluno, id_avaliacao, respostas: respArray });
      setResultado(result.resultado);
      setCorrecao(result.correcao);
      setSubmitted(true);
      localStorage.setItem(submittedKey, "true");
    } catch (e) {
      // Offline: store for later sync
      const pending = JSON.parse(localStorage.getItem("pending_respostas") || "[]");
      pending.push({ id_aluno, id_avaliacao, respostas: Object.entries(respostas).map(([id_questao, resposta]) => ({ id_questao, resposta })), timestamp: Date.now() });
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

  // Results view (Signature Moment)
  if (submitted && resultado) {
    return (
      <div className="min-h-screen p-4">
        <div className="container max-w-lg">
          {/* Result card */}
          <div className="card-surface p-6 mb-6 text-center animate-scale-in">
            <h2 className="text-2xl font-bold mb-4">Resultado</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-3xl font-bold text-success">{resultado.acertos}</div>
                <div className="text-xs text-muted-foreground">Acertos</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-destructive">{resultado.erros}</div>
                <div className="text-xs text-muted-foreground">Erros</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{resultado.percentual}%</div>
                <div className="text-xs text-muted-foreground">Desempenho</div>
              </div>
            </div>
            <div className="inline-block rounded-full px-4 py-1 text-sm font-medium bg-accent text-accent-foreground">
              Nível: {resultado.nivel}
            </div>
          </div>

          {/* Correction details */}
          <div className="space-y-3">
            {correcao.map((c, i) => (
              <div key={c.id_questao} className="card-surface p-4 animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${c.acertou ? "bg-success" : "bg-destructive"}`}>
                    {c.acertou ? <Check className="h-3 w-3 text-success-foreground" /> : <X className="h-3 w-3 text-destructive-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">
                      {i + 1}. {c.pergunta}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sua resposta: <span className={c.acertou ? "text-success font-medium" : "text-destructive font-medium"}>{c.resposta_aluno}</span>
                      {!c.acertou && <> · Correta: <span className="text-success font-medium">{c.resposta_correta}</span></>}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button onClick={() => navigate("/")} className="w-full" variant="outline">
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Question view
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
        <div className="mb-2">
          <span className="inline-block rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-accent-foreground mb-3">
            {questao.competencia}
          </span>
          <p className="text-base font-medium leading-relaxed">{questao.pergunta}</p>
        </div>

        <div className="flex-1 flex flex-col justify-center space-y-3 my-6">
          {(["A", "B", "C", "D"] as const).map(letter => {
            const key = LABELS[letter] as keyof Questao;
            const isSelected = respostas[questao.id_questao] === letter;
            const isAnimating = selectedAnswer === letter;

            return (
              <button
                key={letter}
                onClick={() => handleSelect(letter)}
                className={`card-surface w-full p-4 text-left text-sm transition-all flex items-start gap-3
                  ${isSelected ? "border-primary bg-answer-selected shadow-sm" : "hover:bg-answer-hover"}
                  ${isAnimating ? "scale-[0.98]" : ""}
                `}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors
                  ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {letter}
                </span>
                <span className="pt-0.5">{questao[key]}</span>
              </button>
            );
          })}
        </div>

        {/* Submit button on last question */}
        {isLastQuestion && allAnswered && (
          <Button onClick={handleSubmit} disabled={submitting} className="w-full" size="lg">
            {submitting ? "Enviando..." : "Enviar Respostas"}
          </Button>
        )}

        {/* Navigation dots */}
        <div className="flex justify-center gap-1.5 mt-4">
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

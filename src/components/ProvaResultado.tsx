import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Resultado, QuestaoObservacao, NivelResposta } from "@/types/assessment";
import { NIVEL_RESPOSTA_LABELS } from "@/types/assessment";

interface Props {
  resultado: Resultado;
  respostas: Record<string, NivelResposta>;
  questoes: QuestaoObservacao[];
  neurodivergente: boolean;
}

const NIVEL_DOT: Record<NivelResposta, string> = {
  basico: "bg-destructive",
  intermediario: "bg-accent-foreground",
  avancado: "bg-success",
};

export default function ProvaResultado({ resultado, respostas, questoes, neurodivergente }: Props) {
  const navigate = useNavigate();

  // Group by competencia
  const grouped = questoes.reduce<Record<string, { questao: QuestaoObservacao; resposta: NivelResposta }[]>>((acc, q) => {
    if (!acc[q.competencia]) acc[q.competencia] = [];
    acc[q.competencia].push({ questao: q, resposta: respostas[q.id_questao] });
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-4">
      <div className="container max-w-lg">
        {/* Result card */}
        <div className="card-surface p-6 mb-6 text-center animate-scale-in">
          <h2 className="text-2xl font-bold mb-4">Resultado da Avaliação</h2>
          {neurodivergente && (
            <div className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground mb-4">
              Aluno Neurodivergente
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-3xl font-bold text-success">{resultado.acertos}</div>
              <div className="text-xs text-muted-foreground">Avançado</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{resultado.erros}</div>
              <div className="text-xs text-muted-foreground">Intermediário</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-destructive">{resultado.percentual}%</div>
              <div className="text-xs text-muted-foreground">Básico</div>
            </div>
          </div>
          <div className="inline-block rounded-full px-4 py-1 text-sm font-medium bg-accent text-accent-foreground">
            Nível Geral: {resultado.nivel}
          </div>
        </div>

        {/* Details by competencia */}
        <div className="space-y-4">
          {Object.entries(grouped).map(([comp, items], i) => (
            <div key={comp} className="card-surface p-4 animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
              <h3 className="text-sm font-bold mb-2">{comp}</h3>
              <div className="space-y-2">
                {items.map(({ questao, resposta }) => (
                  <div key={questao.id_questao} className="flex items-start gap-2">
                    <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${NIVEL_DOT[resposta] || "bg-secondary"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{questao.descricao}</p>
                      <p className="text-xs font-medium">{NIVEL_RESPOSTA_LABELS[resposta] || "—"}</p>
                    </div>
                  </div>
                ))}
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

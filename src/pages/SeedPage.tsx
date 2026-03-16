import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/AppHeader";
import { Database, Upload, CheckCircle, Loader2 } from "lucide-react";
import csvData from "@/data/alunos-importados.csv?raw";

function inferNivelEnsino(turma: string): string {
  const t = turma.toUpperCase().trim();
  if (/^(PRE|PRÉ|MATERNAL|BER[CÇ]|INFANTIL|JARDIM|CRECHE|MINI|GRUPO|GR\s)/i.test(t)) return "educacao_infantil";
  if (/^[6-9]/.test(t)) return "fundamental_2";
  if (/^[1-5]/.test(t)) return "fundamental_1";
  return "fundamental_1";
}

function parseCSV(csv: string) {
  const lines = csv.trim().split("\n");
  return lines.slice(1).map((line) => {
    const parts = line.split(",");
    const escola = parts[0]?.trim() || "";
    const matricula = parts[1]?.trim() || "";
    const serie = parts[parts.length - 1]?.trim() || "";
    const nome = parts.slice(2, parts.length - 1).join(",").trim();
    return { id_aluno: matricula, nome, escola, turma: serie, idade: 0, sexo: "" };
  }).filter(a => a.id_aluno && a.nome);
}

export default function SeedPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [log, setLog] = useState<string[]>([]);

  if (!user?.isAdmin) return <Navigate to="/" replace />;

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  const handleSeed = async () => {
    setStatus("running");
    setLog([]);

    try {
      // 1. Parse CSV
      const alunos = parseCSV(csvData);
      addLog(`Parsed ${alunos.length} alunos from CSV`);

      // 2. Insert alunos in batches
      const BATCH = 500;
      let inserted = 0;
      for (let i = 0; i < alunos.length; i += BATCH) {
        const batch = alunos.slice(i, i + BATCH);
        const { error } = await supabase.from("alunos").upsert(batch as any, { onConflict: "id_aluno" });
        if (error) throw error;
        inserted += batch.length;
        addLog(`Alunos: ${inserted}/${alunos.length}`);
      }

      // 3. Generate and insert avaliacoes
      const escolaTurmas = new Set<string>();
      alunos.forEach(a => {
        if (a.escola && a.turma) escolaTurmas.add(`${a.escola}|||${a.turma}`);
      });

      let idx = 1;
      const avaliacoes = Array.from(escolaTurmas).map((key) => {
        const [escola, turma] = key.split("|||");
        return {
          id_avaliacao: `AV${String(idx++).padStart(4, "0")}`,
          data: "2026-03-10",
          escola,
          turma,
          professor: "",
          nivel_ensino: inferNivelEnsino(turma),
        };
      });

      for (let i = 0; i < avaliacoes.length; i += BATCH) {
        const batch = avaliacoes.slice(i, i + BATCH);
        const { error } = await supabase.from("avaliacoes").upsert(batch as any, { onConflict: "id_avaliacao" });
        if (error) throw error;
      }
      addLog(`Inserted ${avaliacoes.length} avaliacoes`);

      setStatus("done");
      addLog("✅ Seed completo!");
    } catch (err: any) {
      addLog(`❌ Erro: ${err.message}`);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader title="Importar Dados" />
      <main className="container py-6 max-w-lg space-y-6">
        <div className="card-surface p-6 text-center">
          <Database className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-lg font-bold mb-2">Importar Dados para o Cloud</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Importa os 25.710 alunos e gera as avaliações automaticamente no banco de dados.
          </p>
          <Button onClick={handleSeed} disabled={status === "running"} size="lg" className="gap-2">
            {status === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : 
             status === "done" ? <CheckCircle className="h-4 w-4" /> : 
             <Upload className="h-4 w-4" />}
            {status === "running" ? "Importando..." : status === "done" ? "Importação Concluída" : "Iniciar Importação"}
          </Button>
        </div>

        {log.length > 0 && (
          <div className="card-surface p-4">
            <h3 className="text-sm font-bold mb-2">Log</h3>
            <div className="space-y-1 max-h-60 overflow-y-auto font-mono text-xs">
              {log.map((l, i) => <div key={i} className="text-muted-foreground">{l}</div>)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

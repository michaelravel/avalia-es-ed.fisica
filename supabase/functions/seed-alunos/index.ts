import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { csvData } = await req.json();
    if (!csvData) {
      return new Response(JSON.stringify({ error: "No CSV data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lines = csvData.trim().split("\n");
    const alunos: Array<{ id_aluno: string; nome: string; escola: string; turma: string; idade: number; sexo: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(",");
      const escola = parts[0]?.trim() || "";
      const matricula = parts[1]?.trim() || "";
      const serie = parts[parts.length - 1]?.trim() || "";
      const nome = parts.slice(2, parts.length - 1).join(",").trim();
      if (matricula && nome) {
        alunos.push({ id_aluno: matricula, nome, escola, turma: serie, idade: 0, sexo: "" });
      }
    }

    // Insert in batches of 1000
    const BATCH = 1000;
    let inserted = 0;
    for (let i = 0; i < alunos.length; i += BATCH) {
      const batch = alunos.slice(i, i + BATCH);
      const { error } = await supabase.from("alunos").upsert(batch, { onConflict: "id_aluno" });
      if (error) throw error;
      inserted += batch.length;
    }

    // Generate avaliacoes from unique escola+turma combinations
    const escolaTurmas = new Set<string>();
    alunos.forEach((a) => {
      if (a.escola && a.turma) escolaTurmas.add(`${a.escola}|||${a.turma}`);
    });

    function inferNivelEnsino(turma: string): string {
      const t = turma.toUpperCase().trim();
      if (/^(PRE|PRÉ|MATERNAL|BER[CÇ]|INFANTIL|JARDIM|CRECHE|MINI|GRUPO|GR\s)/i.test(t)) return "educacao_infantil";
      if (/^[6-9]/.test(t)) return "fundamental_2";
      if (/^[1-5]/.test(t)) return "fundamental_1";
      return "fundamental_1";
    }

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

    // Insert avaliacoes in batches
    for (let i = 0; i < avaliacoes.length; i += BATCH) {
      const batch = avaliacoes.slice(i, i + BATCH);
      const { error } = await supabase.from("avaliacoes").upsert(batch, { onConflict: "id_avaliacao" });
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ success: true, alunos: inserted, avaliacoes: avaliacoes.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

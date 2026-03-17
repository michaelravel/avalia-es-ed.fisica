
-- Fix 1: Allow INSERT and DELETE on professores (public, since auth is email-only)
CREATE POLICY "Anyone can insert professores" ON public.professores FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can delete professores" ON public.professores FOR DELETE TO public USING (true);

-- Fix 2: Add unique constraint on resultados(id_aluno, id_avaliacao) for upsert to work
ALTER TABLE public.resultados ADD CONSTRAINT resultados_aluno_avaliacao_unique UNIQUE (id_aluno, id_avaliacao);

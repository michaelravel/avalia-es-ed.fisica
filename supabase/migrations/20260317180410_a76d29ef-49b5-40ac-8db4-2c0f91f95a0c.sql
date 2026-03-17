CREATE POLICY "allow_anon_insert_alunos" ON public.alunos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_auth_insert_alunos" ON public.alunos FOR INSERT TO authenticated WITH CHECK (true);
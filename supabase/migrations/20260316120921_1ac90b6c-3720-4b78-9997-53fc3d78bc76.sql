
-- Professores table
CREATE TABLE public.professores (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read professores" ON public.professores FOR SELECT USING (true);

-- Alunos table
CREATE TABLE public.alunos (
 
  matricula	PRIMARY KEY,
  unidade	NOT NULL,
  aluno NOT NULL,
  serie	NOT NULL,
  avaliacao NOT NULL,
);

ALTER TABLE alunos disable row level security;
CREATE POLICY "Anyone can insert alunos" ON public.alunos FOR INSERT WITH CHECK (true);
-- Questoes de observação
CREATE TABLE public.questoes_observacao (
  id_questao TEXT PRIMARY KEY,
  competencia TEXT NOT NULL,
  descricao TEXT NOT NULL,
  nivel_ensino TEXT NOT NULL CHECK (nivel_ensino IN ('educacao_infantil', 'fundamental_1', 'fundamental_2'))
);

ALTER TABLE public.questoes_observacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read questoes" ON public.questoes_observacao FOR SELECT USING (true);

-- Avaliacoes table
CREATE TABLE public.avaliacoes (
  id_avaliacao TEXT PRIMARY KEY,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  escola TEXT NOT NULL,
  turma TEXT NOT NULL,
  professor TEXT NOT NULL DEFAULT '',
  nivel_ensino TEXT CHECK (nivel_ensino IN ('educacao_infantil', 'fundamental_1', 'fundamental_2'))
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read avaliacoes" ON public.avaliacoes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert avaliacoes" ON public.avaliacoes FOR INSERT WITH CHECK (true);

-- Resultados table
CREATE TABLE public.resultados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  id_aluno TEXT NOT NULL,
  id_avaliacao TEXT NOT NULL,
  acertos INTEGER NOT NULL DEFAULT 0,
  erros INTEGER NOT NULL DEFAULT 0,
  percentual INTEGER NOT NULL DEFAULT 0,
  nivel TEXT NOT NULL DEFAULT '',
  neurodivergente BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(id_aluno, id_avaliacao)
);

ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read resultados" ON public.resultados FOR SELECT USING (true);
CREATE POLICY "Anyone can insert resultados" ON public.resultados FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update resultados" ON public.resultados FOR UPDATE USING (true);

-- Indexes
CREATE INDEX idx_alunos_escola ON public.alunos(escola);
CREATE INDEX idx_alunos_escola_turma ON public.alunos(escola, turma);
CREATE INDEX idx_avaliacoes_escola_turma ON public.avaliacoes(escola, turma);
CREATE INDEX idx_resultados_avaliacao ON public.resultados(id_avaliacao);
CREATE INDEX idx_resultados_aluno ON public.resultados(id_aluno);

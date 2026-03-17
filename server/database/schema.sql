-- SDG-VBS: Schema do Banco de Dados

CREATE TABLE IF NOT EXISTS organizacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  segmento TEXT,
  resumo_estrategico TEXT,
  horizonte_temporal TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gestores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cargo TEXT,
  departamento TEXT,
  email TEXT,
  telefone TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projetos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizacao_id INTEGER REFERENCES organizacoes(id) ON DELETE SET NULL,
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  objetivo TEXT,
  duracao TEXT,
  status TEXT DEFAULT 'Planejamento',
  gestor_id INTEGER REFERENCES gestores(id) ON DELETE SET NULL,
  patrocinador_id INTEGER REFERENCES gestores(id) ON DELETE SET NULL,
  responsavel_id INTEGER REFERENCES gestores(id) ON DELETE SET NULL,
  area_responsavel TEXT,
  abordagem_gestao TEXT,
  numero_revisoes_previstas INTEGER DEFAULT 0,
  frequencia_revisoes TEXT,
  frequencia_revisoes_dias INTEGER DEFAULT 30,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eventos_projeto (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  data_evento DATE NOT NULL,
  tipo_evento TEXT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  responsavel_id INTEGER REFERENCES gestores(id) ON DELETE SET NULL,
  data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  usuario_registro TEXT
);

CREATE TABLE IF NOT EXISTS stakeholders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  papel TEXT,
  tipo TEXT,
  origem TEXT,
  classe_principal TEXT,
  interesses TEXT,
  contato TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projeto_stakeholders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  stakeholder_id INTEGER NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  papel_no_projeto TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(projeto_id, stakeholder_id)
);

CREATE TABLE IF NOT EXISTS valores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  tipo TEXT,
  natureza TEXT,
  classe_valor TEXT,
  temporalidade TEXT,
  conflitos TEXT,
  classe_conflito TEXT,
  riscos TEXT,
  probabilidade_risco TEXT,
  criterios_mensuracao TEXT,
  frequencia_revisao TEXT,
  proxima_revisao DATE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS valor_stakeholders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  valor_id INTEGER NOT NULL REFERENCES valores(id) ON DELETE CASCADE,
  stakeholder_id INTEGER NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  perspectiva TEXT,
  classe_stakeholder TEXT,
  poder INTEGER DEFAULT 1,
  legitimidade INTEGER DEFAULT 1,
  urgencia INTEGER DEFAULT 1,
  saliencia INTEGER DEFAULT 1,
  saliencia_normalizada REAL DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(valor_id, stakeholder_id)
);

CREATE TABLE IF NOT EXISTS beneficios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  valor_id INTEGER REFERENCES valores(id) ON DELETE SET NULL,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  natureza TEXT,
  classe TEXT,
  classe_conflito TEXT,
  temporalidade TEXT,
  responsavel_id INTEGER REFERENCES gestores(id) ON DELETE SET NULL,
  responsavel TEXT,
  forma_avaliacao TEXT,
  riscos TEXT,
  probabilidade_risco TEXT,
  quando_realizar TEXT,
  como_realizar TEXT,
  frequencia_revisao TEXT,
  proxima_revisao DATE,
  status_realizacao TEXT DEFAULT 'Planejado',
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beneficio_stakeholders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beneficio_id INTEGER NOT NULL REFERENCES beneficios(id) ON DELETE CASCADE,
  stakeholder_id INTEGER NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  papel TEXT,
  classe_stakeholder TEXT,
  poder INTEGER DEFAULT 1,
  legitimidade INTEGER DEFAULT 1,
  urgencia INTEGER DEFAULT 1,
  saliencia INTEGER DEFAULT 1,
  saliencia_normalizada REAL DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS propagacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beneficio_id INTEGER NOT NULL REFERENCES beneficios(id) ON DELETE CASCADE,
  classe_beneficio TEXT,
  stakeholders_alvo TEXT,
  descricao_propagacao TEXT,
  riscos_nao_propagacao TEXT,
  efeitos_colaterais TEXT,
  stakeholders_estimados INTEGER DEFAULT 0,
  numero_periodos INTEGER DEFAULT 12,
  abordagem_principal TEXT,
  justificativa_outros TEXT,
  projecao_temporal TEXT,
  total_acumulado INTEGER DEFAULT 0,
  cobertura_final REAL DEFAULT 0,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sinergias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beneficio_a_id INTEGER NOT NULL REFERENCES beneficios(id) ON DELETE CASCADE,
  beneficio_b_id INTEGER NOT NULL REFERENCES beneficios(id) ON DELETE CASCADE,
  tipo_relacao TEXT,
  justificativa_outros TEXT,
  descricao TEXT,
  impacto TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS revisoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  data_revisao DATE NOT NULL,
  data_encerramento DATE,
  descricao TEXT,
  etapa_projeto TEXT,
  status TEXT DEFAULT 'Aberto',
  snapshot_dados TEXT,
  nome_arquivo TEXT,
  proxima_revisao_sugerida DATE,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

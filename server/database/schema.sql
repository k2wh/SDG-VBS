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
  vinculo_acao TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stakeholders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  papel TEXT,
  tipo TEXT,
  origem TEXT,
  interesses TEXT,
  contato TEXT,
  poder INTEGER DEFAULT 1,
  legitimidade INTEGER DEFAULT 1,
  urgencia INTEGER DEFAULT 1,
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
  temporalidade TEXT,
  conflitos TEXT,
  riscos TEXT,
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
  temporalidade TEXT,
  responsavel TEXT,
  forma_avaliacao TEXT,
  riscos TEXT,
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
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS propagacoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beneficio_id INTEGER NOT NULL REFERENCES beneficios(id) ON DELETE CASCADE,
  stakeholder_origem_id INTEGER NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  stakeholder_destino_id INTEGER NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  tipo_propagacao TEXT,
  efeitos_colaterais TEXT,
  tendencia TEXT,
  observacoes TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sinergias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beneficio_a_id INTEGER NOT NULL REFERENCES beneficios(id) ON DELETE CASCADE,
  beneficio_b_id INTEGER NOT NULL REFERENCES beneficios(id) ON DELETE CASCADE,
  tipo_relacao TEXT,
  descricao TEXT,
  impacto TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS revisoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
  data_revisao DATE NOT NULL,
  descricao TEXT,
  snapshot_dados TEXT,
  nome_arquivo TEXT,
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/projeto/:projetoId', (req, res) => {
  const rows = db.prepare('SELECT id, projeto_id, data_revisao, descricao, nome_arquivo, status, etapa_projeto, proxima_revisao_sugerida, criado_em FROM revisoes WHERE projeto_id = ? ORDER BY data_revisao DESC').all(req.params.projetoId);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM revisoes WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Não encontrado' });
  if (row.snapshot_dados) row.snapshot_dados = JSON.parse(row.snapshot_dados);
  res.json(row);
});

router.post('/projeto/:projetoId', (req, res) => {
  const projetoId = req.params.projetoId;
  const { descricao } = req.body;

  const projeto = db.prepare('SELECT * FROM projetos WHERE id = ?').get(projetoId);
  if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado' });

  const stakeholders = db.prepare(`
    SELECT ps.*, s.* FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id
    WHERE ps.projeto_id = ?
  `).all(projetoId);

  const valores = db.prepare('SELECT * FROM valores WHERE projeto_id = ?').all(projetoId);
  const beneficios = db.prepare('SELECT * FROM beneficios WHERE projeto_id = ?').all(projetoId);

  const propagacoes = db.prepare(`
    SELECT p.* FROM propagacoes p
    JOIN beneficios b ON p.beneficio_id = b.id
    WHERE b.projeto_id = ?
  `).all(projetoId);

  const sinergias = db.prepare(`
    SELECT s.* FROM sinergias s
    JOIN beneficios b ON s.beneficio_a_id = b.id
    WHERE b.projeto_id = ?
  `).all(projetoId);

  const valor_stakeholders = db.prepare(`
    SELECT vs.* FROM valor_stakeholders vs
    JOIN valores v ON vs.valor_id = v.id WHERE v.projeto_id = ?
  `).all(projetoId);
  const beneficio_stakeholders = db.prepare(`
    SELECT bs.* FROM beneficio_stakeholders bs
    JOIN beneficios b ON bs.beneficio_id = b.id WHERE b.projeto_id = ?
  `).all(projetoId);

  const snapshot = { projeto, stakeholders, valores, beneficios, propagacoes, sinergias, valor_stakeholders, beneficio_stakeholders };

  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, '0');
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const aaaa = hoje.getFullYear();
  const dataRevisao = `${aaaa}-${mm}-${dd}`;
  const nomeArquivo = `${dd}${mm}${aaaa} - ${projeto.nome} - revisão executada em ${dd}/${mm}/${aaaa}`;

  const { etapa_projeto } = req.body;

  let proxRevisao = null;
  if (projeto.frequencia_revisoes_dias) {
    const prox = new Date();
    prox.setDate(prox.getDate() + projeto.frequencia_revisoes_dias);
    proxRevisao = prox.toISOString().split('T')[0];
  }

  const result = db.prepare(
    'INSERT INTO revisoes (projeto_id, data_revisao, descricao, snapshot_dados, nome_arquivo, status, etapa_projeto, proxima_revisao_sugerida) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(projetoId, dataRevisao, descricao || '', JSON.stringify(snapshot), nomeArquivo, 'Aberto', etapa_projeto || null, proxRevisao);

  res.status(201).json({ id: result.lastInsertRowid, nome_arquivo: nomeArquivo, data_revisao: dataRevisao, status: 'Aberto' });
});

router.patch('/:id/encerrar', (req, res) => {
  const rev = db.prepare('SELECT * FROM revisoes WHERE id = ?').get(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Não encontrado' });

  const projetoId = rev.projeto_id;
  const projeto = db.prepare('SELECT * FROM projetos WHERE id = ?').get(projetoId);

  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, '0');
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const aaaa = hoje.getFullYear();
  const dataEncerramento = `${aaaa}-${mm}-${dd}`;

  // Recapture snapshot with latest live data
  const stakeholders = db.prepare(`
    SELECT ps.*, s.* FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id WHERE ps.projeto_id = ?
  `).all(projetoId);
  const valores = db.prepare('SELECT * FROM valores WHERE projeto_id = ?').all(projetoId);
  const beneficios = db.prepare('SELECT * FROM beneficios WHERE projeto_id = ?').all(projetoId);
  const propagacoes = db.prepare(`
    SELECT p.* FROM propagacoes p JOIN beneficios b ON p.beneficio_id = b.id WHERE b.projeto_id = ?
  `).all(projetoId);
  const sinergias = db.prepare(`
    SELECT s.* FROM sinergias s JOIN beneficios b ON s.beneficio_a_id = b.id WHERE b.projeto_id = ?
  `).all(projetoId);
  const valor_stakeholders = db.prepare(`
    SELECT vs.* FROM valor_stakeholders vs
    JOIN valores v ON vs.valor_id = v.id WHERE v.projeto_id = ?
  `).all(projetoId);
  const beneficio_stakeholders = db.prepare(`
    SELECT bs.* FROM beneficio_stakeholders bs
    JOIN beneficios b ON bs.beneficio_id = b.id WHERE b.projeto_id = ?
  `).all(projetoId);

  const snapshot = {
    projeto, stakeholders, valores, beneficios, propagacoes, sinergias,
    valor_stakeholders, beneficio_stakeholders,
    ultima_atualizacao: new Date().toISOString()
  };

  // Calculate proxima_revisao_sugerida
  let proxRevisao = null;
  if (projeto && projeto.frequencia_revisoes_dias) {
    const prox = new Date();
    prox.setDate(prox.getDate() + projeto.frequencia_revisoes_dias);
    proxRevisao = prox.toISOString().split('T')[0];
  }

  db.prepare('UPDATE revisoes SET status = ?, data_encerramento = ?, snapshot_dados = ?, proxima_revisao_sugerida = ? WHERE id = ?')
    .run('Encerrado', dataEncerramento, JSON.stringify(snapshot), proxRevisao, req.params.id);

  res.json({ success: true, status: 'Encerrado', data_encerramento: dataEncerramento, proxima_revisao_sugerida: proxRevisao });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM revisoes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Ciclo completo para edição de revisão
router.get('/:id/ciclo', (req, res) => {
  const rev = db.prepare('SELECT * FROM revisoes WHERE id = ?').get(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Não encontrado' });

  const projetoId = rev.projeto_id;
  const projeto = db.prepare('SELECT * FROM projetos WHERE id = ?').get(projetoId);

  // Eventos do projeto (para selecionar etapa)
  const eventos = db.prepare('SELECT * FROM eventos_projeto WHERE projeto_id = ? ORDER BY data_evento ASC').all(projetoId);

  // Valores com seus stakeholders
  const valores = db.prepare('SELECT * FROM valores WHERE projeto_id = ?').all(projetoId);
  valores.forEach(v => {
    v.stakeholders = db.prepare(`
      SELECT vs.*, s.nome as stakeholder_nome, s.tipo as stakeholder_tipo, s.classe_principal
      FROM valor_stakeholders vs
      JOIN stakeholders s ON vs.stakeholder_id = s.id
      WHERE vs.valor_id = ?
    `).all(v.id);
  });

  // Benefícios com seus stakeholders
  const beneficios = db.prepare(`
    SELECT b.*, v.descricao as valor_descricao
    FROM beneficios b LEFT JOIN valores v ON b.valor_id = v.id
    WHERE b.projeto_id = ?
  `).all(projetoId);
  beneficios.forEach(b => {
    b.stakeholders = db.prepare(`
      SELECT bs.*, s.nome as stakeholder_nome, s.tipo as stakeholder_tipo, s.classe_principal
      FROM beneficio_stakeholders bs
      JOIN stakeholders s ON bs.stakeholder_id = s.id
      WHERE bs.beneficio_id = ?
    `).all(b.id);
  });

  // Propagações
  const propagacoes = db.prepare(`
    SELECT p.*, b.descricao as beneficio_descricao
    FROM propagacoes p
    JOIN beneficios b ON p.beneficio_id = b.id
    WHERE b.projeto_id = ?
  `).all(projetoId);

  // Sinergias
  const sinergias = db.prepare(`
    SELECT s.*, ba.descricao as beneficio_a_descricao, bb.descricao as beneficio_b_descricao
    FROM sinergias s
    JOIN beneficios ba ON s.beneficio_a_id = ba.id
    JOIN beneficios bb ON s.beneficio_b_id = bb.id
    WHERE ba.projeto_id = ?
  `).all(projetoId);

  // All project stakeholders (for adding new ones)
  const allStakeholders = db.prepare(`
    SELECT s.* FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id
    WHERE ps.projeto_id = ?
  `).all(projetoId);

  res.json({
    revisao: rev,
    projeto,
    eventos,
    valores,
    beneficios,
    propagacoes,
    sinergias,
    allStakeholders
  });
});

// Salvar bloco progressivamente
router.patch('/:id/salvar-bloco', (req, res) => {
  const rev = db.prepare('SELECT * FROM revisoes WHERE id = ?').get(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Não encontrado' });
  if (rev.status === 'Encerrado') return res.status(400).json({ error: 'Ciclo encerrado' });

  // Update the snapshot with the new block data
  let snapshot = {};
  try { snapshot = rev.snapshot_dados ? JSON.parse(rev.snapshot_dados) : {}; } catch {}

  const { bloco, dados } = req.body;
  // bloco can be: 'etapa_projeto', 'valores', 'beneficios', 'propagacoes', 'sinergias', 'stakeholders'
  snapshot[bloco] = dados;
  snapshot.ultima_atualizacao = new Date().toISOString();

  if (bloco === 'etapa_projeto') {
    db.prepare('UPDATE revisoes SET etapa_projeto = ?, snapshot_dados = ? WHERE id = ?')
      .run(dados, JSON.stringify(snapshot), req.params.id);
  } else {
    db.prepare('UPDATE revisoes SET snapshot_dados = ? WHERE id = ?')
      .run(JSON.stringify(snapshot), req.params.id);
  }

  res.json({ success: true, bloco });
});

// Recapturar snapshot completo dos dados live
router.patch('/:id/atualizar-snapshot', (req, res) => {
  const rev = db.prepare('SELECT * FROM revisoes WHERE id = ?').get(req.params.id);
  if (!rev) return res.status(404).json({ error: 'Não encontrado' });
  if (rev.status === 'Encerrado') return res.status(400).json({ error: 'Ciclo encerrado' });

  const projetoId = rev.projeto_id;
  const projeto = db.prepare('SELECT * FROM projetos WHERE id = ?').get(projetoId);
  const stakeholders = db.prepare(`
    SELECT ps.*, s.* FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id WHERE ps.projeto_id = ?
  `).all(projetoId);
  const valores = db.prepare('SELECT * FROM valores WHERE projeto_id = ?').all(projetoId);
  const beneficios = db.prepare('SELECT * FROM beneficios WHERE projeto_id = ?').all(projetoId);
  const propagacoes = db.prepare(`
    SELECT p.* FROM propagacoes p JOIN beneficios b ON p.beneficio_id = b.id WHERE b.projeto_id = ?
  `).all(projetoId);
  const sinergias = db.prepare(`
    SELECT s.* FROM sinergias s JOIN beneficios b ON s.beneficio_a_id = b.id WHERE b.projeto_id = ?
  `).all(projetoId);

  // Also get valor_stakeholders and beneficio_stakeholders
  const valor_stakeholders = db.prepare(`
    SELECT vs.* FROM valor_stakeholders vs
    JOIN valores v ON vs.valor_id = v.id WHERE v.projeto_id = ?
  `).all(projetoId);
  const beneficio_stakeholders = db.prepare(`
    SELECT bs.* FROM beneficio_stakeholders bs
    JOIN beneficios b ON bs.beneficio_id = b.id WHERE b.projeto_id = ?
  `).all(projetoId);

  const snapshot = {
    projeto, stakeholders, valores, beneficios, propagacoes, sinergias,
    valor_stakeholders, beneficio_stakeholders,
    ultima_atualizacao: new Date().toISOString()
  };

  db.prepare('UPDATE revisoes SET snapshot_dados = ? WHERE id = ?')
    .run(JSON.stringify(snapshot), req.params.id);

  res.json({ success: true });
});

// Consolidação
router.get('/consolidacao/projeto/:projetoId', (req, res) => {
  const projetoId = req.params.projetoId;

  const projeto = db.prepare('SELECT nome, codigo, status, abordagem_gestao, duracao FROM projetos WHERE id = ?').get(projetoId);

  const totalStakeholders = db.prepare('SELECT COUNT(*) as total FROM projeto_stakeholders WHERE projeto_id = ?').get(projetoId).total;
  const totalValores = db.prepare('SELECT COUNT(*) as total FROM valores WHERE projeto_id = ?').get(projetoId).total;
  const totalBeneficios = db.prepare('SELECT COUNT(*) as total FROM beneficios WHERE projeto_id = ?').get(projetoId).total;

  const totalPropagacoes = db.prepare(`
    SELECT COUNT(*) as total FROM propagacoes p
    JOIN beneficios b ON p.beneficio_id = b.id WHERE b.projeto_id = ?
  `).get(projetoId).total;

  const totalSinergias = db.prepare(`
    SELECT COUNT(*) as total FROM sinergias s
    JOIN beneficios b ON s.beneficio_a_id = b.id WHERE b.projeto_id = ?
  `).get(projetoId).total;

  const totalRevisoes = db.prepare('SELECT COUNT(*) as total FROM revisoes WHERE projeto_id = ?').get(projetoId).total;

  const beneficiosPorStatus = db.prepare('SELECT status_realizacao, COUNT(*) as total FROM beneficios WHERE projeto_id = ? GROUP BY status_realizacao').all(projetoId);

  const sinergiasPorTipo = db.prepare(`
    SELECT s.tipo_relacao, COUNT(*) as total FROM sinergias s
    JOIN beneficios b ON s.beneficio_a_id = b.id
    WHERE b.projeto_id = ? GROUP BY s.tipo_relacao
  `).all(projetoId);

  const propagacoesPorTendencia = db.prepare(`
    SELECT p.tendencia, COUNT(*) as total FROM propagacoes p
    JOIN beneficios b ON p.beneficio_id = b.id
    WHERE b.projeto_id = ? AND p.tendencia IS NOT NULL GROUP BY p.tendencia
  `).all(projetoId);

  const propagacoesPorTipo = db.prepare(`
    SELECT p.tipo_propagacao, COUNT(*) as total FROM propagacoes p
    JOIN beneficios b ON p.beneficio_id = b.id
    WHERE b.projeto_id = ? AND p.tipo_propagacao IS NOT NULL GROUP BY p.tipo_propagacao
  `).all(projetoId);

  const stakeholdersSaliencia = db.prepare(`
    SELECT s.nome, s.tipo, ps.papel_no_projeto,
      COALESCE(vs_avg.avg_poder, 0) as poder,
      COALESCE(vs_avg.avg_legitimidade, 0) as legitimidade,
      COALESCE(vs_avg.avg_urgencia, 0) as urgencia,
      COALESCE(vs_avg.avg_saliencia, 0) as saliencia_total
    FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id
    LEFT JOIN (
      SELECT vs.stakeholder_id,
        ROUND(AVG(vs.poder),1) as avg_poder,
        ROUND(AVG(vs.legitimidade),1) as avg_legitimidade,
        ROUND(AVG(vs.urgencia),1) as avg_urgencia,
        ROUND(AVG(vs.saliencia),1) as avg_saliencia
      FROM valor_stakeholders vs
      JOIN valores v ON vs.valor_id = v.id
      WHERE v.projeto_id = ?
      GROUP BY vs.stakeholder_id
    ) vs_avg ON vs_avg.stakeholder_id = s.id
    WHERE ps.projeto_id = ?
    ORDER BY saliencia_total DESC
  `).all(projetoId, projetoId);

  const salienciaMedia = db.prepare(`
    SELECT
      ROUND(AVG(vs.poder), 1) as media_poder,
      ROUND(AVG(vs.legitimidade), 1) as media_legitimidade,
      ROUND(AVG(vs.urgencia), 1) as media_urgencia
    FROM valor_stakeholders vs
    JOIN valores v ON vs.valor_id = v.id
    WHERE v.projeto_id = ?
  `).get(projetoId);

  const stakeholdersPorTipo = db.prepare(`
    SELECT s.tipo, COUNT(*) as total
    FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id
    WHERE ps.projeto_id = ? GROUP BY s.tipo
  `).all(projetoId);

  const valoresPorTemporalidade = db.prepare(`
    SELECT temporalidade, COUNT(*) as total
    FROM valores WHERE projeto_id = ? AND temporalidade IS NOT NULL AND temporalidade != ''
    GROUP BY temporalidade
  `).all(projetoId);

  const valoresPorNatureza = db.prepare(`
    SELECT natureza, COUNT(*) as total
    FROM valores WHERE projeto_id = ? AND natureza IS NOT NULL AND natureza != ''
    GROUP BY natureza
  `).all(projetoId);

  const beneficiosDetalhados = db.prepare(`
    SELECT b.descricao, b.status_realizacao, b.natureza, b.classe,
           v.descricao as valor_descricao
    FROM beneficios b
    LEFT JOIN valores v ON b.valor_id = v.id
    WHERE b.projeto_id = ?
  `).all(projetoId);

  const vinculosPropagacoes = db.prepare(`
    SELECT COUNT(*) as total FROM propagacoes p
    JOIN beneficios b ON p.beneficio_id = b.id
    WHERE b.projeto_id = ?
  `).get(projetoId).total;

  const stakeholdersEngajamento = db.prepare(`
    SELECT s.nome, s.id as stakeholder_id,
      (SELECT COUNT(*) FROM valor_stakeholders vs
       JOIN valores v ON vs.valor_id = v.id
       WHERE vs.stakeholder_id = s.id AND v.projeto_id = ?) as vinculos_valores
    FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id
    WHERE ps.projeto_id = ?
  `).all(projetoId, projetoId).map(row => ({ ...row, vinculos_propagacoes: vinculosPropagacoes }));

  const revisoes = db.prepare('SELECT id, data_revisao, descricao, nome_arquivo, snapshot_dados FROM revisoes WHERE projeto_id = ? ORDER BY data_revisao ASC').all(projetoId);

  res.json({
    projeto,
    totalStakeholders, totalValores, totalBeneficios,
    totalPropagacoes, totalSinergias, totalRevisoes,
    beneficiosPorStatus, sinergiasPorTipo,
    propagacoesPorTendencia, propagacoesPorTipo,
    stakeholdersSaliencia, salienciaMedia, stakeholdersPorTipo,
    valoresPorTemporalidade, valoresPorNatureza,
    beneficiosDetalhados, stakeholdersEngajamento,
    revisoes
  });
});

module.exports = router;

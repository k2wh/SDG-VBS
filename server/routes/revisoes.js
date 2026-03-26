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

router.patch('/:id/descricao', (req, res) => {
  const { descricao } = req.body;
  db.prepare('UPDATE revisoes SET descricao = ? WHERE id = ?').run(descricao || '', req.params.id);
  res.json({ success: true });
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

// Questões de análise do valor por revisão
router.get('/:id/questoes-valor', (req, res) => {
  const rows = db.prepare('SELECT * FROM revisao_valor_questoes WHERE revisao_id = ?').all(req.params.id);
  const map = {};
  rows.forEach(r => { map[r.valor_id] = r; });
  res.json(map);
});

router.put('/:id/questoes-valor/:valorId', (req, res) => {
  const { q1, q1_justificativa, q2, q2_justificativa, q3, q3_justificativa, q4, q4_justificativa, q5, q6, q7 } = req.body;
  const existing = db.prepare('SELECT id FROM revisao_valor_questoes WHERE revisao_id = ? AND valor_id = ?').get(req.params.id, req.params.valorId);

  if (existing) {
    db.prepare(`UPDATE revisao_valor_questoes SET
      q1 = ?, q1_justificativa = ?, q2 = ?, q2_justificativa = ?,
      q3 = ?, q3_justificativa = ?, q4 = ?, q4_justificativa = ?,
      q5 = ?, q6 = ?, q7 = ?, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ?`
    ).run(q1 || null, q1_justificativa || null, q2 || null, q2_justificativa || null,
          q3 || null, q3_justificativa || null, q4 || null, q4_justificativa || null,
          q5 || null, q6 || null, q7 || null, existing.id);
  } else {
    db.prepare(`INSERT INTO revisao_valor_questoes
      (revisao_id, valor_id, q1, q1_justificativa, q2, q2_justificativa, q3, q3_justificativa, q4, q4_justificativa, q5, q6, q7)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.params.id, req.params.valorId,
          q1 || null, q1_justificativa || null, q2 || null, q2_justificativa || null,
          q3 || null, q3_justificativa || null, q4 || null, q4_justificativa || null,
          q5 || null, q6 || null, q7 || null);
  }

  res.json({ success: true });
});

// Questões de análise do benefício por revisão
router.get('/:id/questoes-beneficio', (req, res) => {
  const rows = db.prepare('SELECT * FROM revisao_beneficio_questoes WHERE revisao_id = ?').all(req.params.id);
  const map = {};
  rows.forEach(r => { map[r.beneficio_id] = r; });
  res.json(map);
});

router.put('/:id/questoes-beneficio/:beneficioId', (req, res) => {
  const { q1, q1_justificativa, q2, q2_justificativa, q3, q3_detalhamento, q4, q4_detalhamento, q5, q5_justificativa, q6, q7 } = req.body;
  const existing = db.prepare('SELECT id FROM revisao_beneficio_questoes WHERE revisao_id = ? AND beneficio_id = ?').get(req.params.id, req.params.beneficioId);

  if (existing) {
    db.prepare(`UPDATE revisao_beneficio_questoes SET
      q1 = ?, q1_justificativa = ?, q2 = ?, q2_justificativa = ?,
      q3 = ?, q3_detalhamento = ?, q4 = ?, q4_detalhamento = ?,
      q5 = ?, q5_justificativa = ?, q6 = ?, q7 = ?, atualizado_em = CURRENT_TIMESTAMP
      WHERE id = ?`
    ).run(q1 || null, q1_justificativa || null, q2 || null, q2_justificativa || null,
          q3 || null, q3_detalhamento || null, q4 || null, q4_detalhamento || null,
          q5 || null, q5_justificativa || null, q6 || null, q7 || null, existing.id);
  } else {
    db.prepare(`INSERT INTO revisao_beneficio_questoes
      (revisao_id, beneficio_id, q1, q1_justificativa, q2, q2_justificativa, q3, q3_detalhamento, q4, q4_detalhamento, q5, q5_justificativa, q6, q7)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(req.params.id, req.params.beneficioId,
          q1 || null, q1_justificativa || null, q2 || null, q2_justificativa || null,
          q3 || null, q3_detalhamento || null, q4 || null, q4_detalhamento || null,
          q5 || null, q5_justificativa || null, q6 || null, q7 || null);
  }

  res.json({ success: true });
});

// Questões de propagação por revisão
router.get('/:id/questoes-propagacao', (req, res) => {
  const rows = db.prepare('SELECT * FROM revisao_propagacao_questoes WHERE revisao_id = ?').all(req.params.id);
  const map = {};
  rows.forEach(r => { map[r.propagacao_id] = r; });
  res.json(map);
});

router.put('/:id/questoes-propagacao/:propagacaoId', (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT id FROM revisao_propagacao_questoes WHERE revisao_id = ? AND propagacao_id = ?').get(req.params.id, req.params.propagacaoId);
  const fields = ['q1','q2','q3','q3_justificativa','q4','q4_justificativa','q5','q5_justificativa','q6','q6_justificativa','q7','q8','q9','q9_detalhamento','q10'];
  const vals = fields.map(f => d[f] || null);

  if (existing) {
    db.prepare(`UPDATE revisao_propagacao_questoes SET ${fields.map(f => `${f} = ?`).join(', ')}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`).run(...vals, existing.id);
  } else {
    db.prepare(`INSERT INTO revisao_propagacao_questoes (revisao_id, propagacao_id, ${fields.join(', ')}) VALUES (?, ?, ${fields.map(() => '?').join(', ')})`).run(req.params.id, req.params.propagacaoId, ...vals);
  }
  res.json({ success: true });
});

// Questões de sinergia por revisão
router.get('/:id/questoes-sinergia', (req, res) => {
  const rows = db.prepare('SELECT * FROM revisao_sinergia_questoes WHERE revisao_id = ?').all(req.params.id);
  const map = {};
  rows.forEach(r => { map[r.sinergia_id] = r; });
  res.json(map);
});

router.put('/:id/questoes-sinergia/:sinergiaId', (req, res) => {
  const d = req.body;
  const existing = db.prepare('SELECT id FROM revisao_sinergia_questoes WHERE revisao_id = ? AND sinergia_id = ?').get(req.params.id, req.params.sinergiaId);
  const fields = ['q1','q1_beneficio','q2','q2_outros','q3','q3_outros','q4','q4_detalhamento','q5','q5_detalhamento','q6','q6_outros'];
  const vals = fields.map(f => d[f] || null);

  if (existing) {
    db.prepare(`UPDATE revisao_sinergia_questoes SET ${fields.map(f => `${f} = ?`).join(', ')}, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?`).run(...vals, existing.id);
  } else {
    db.prepare(`INSERT INTO revisao_sinergia_questoes (revisao_id, sinergia_id, ${fields.join(', ')}) VALUES (?, ?, ${fields.map(() => '?').join(', ')})`).run(req.params.id, req.params.sinergiaId, ...vals);
  }
  res.json({ success: true });
});

module.exports = router;

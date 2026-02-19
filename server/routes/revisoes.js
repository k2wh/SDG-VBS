const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/projeto/:projetoId', (req, res) => {
  const rows = db.prepare('SELECT id, projeto_id, data_revisao, descricao, nome_arquivo, criado_em FROM revisoes WHERE projeto_id = ? ORDER BY data_revisao DESC').all(req.params.projetoId);
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

  const snapshot = { projeto, stakeholders, valores, beneficios, propagacoes, sinergias };

  const hoje = new Date();
  const dd = String(hoje.getDate()).padStart(2, '0');
  const mm = String(hoje.getMonth() + 1).padStart(2, '0');
  const aaaa = hoje.getFullYear();
  const dataRevisao = `${aaaa}-${mm}-${dd}`;
  const nomeArquivo = `${dd}${mm}${aaaa} - ${projeto.nome} - revisão executada em ${dd}/${mm}/${aaaa}`;

  const result = db.prepare(
    'INSERT INTO revisoes (projeto_id, data_revisao, descricao, snapshot_dados, nome_arquivo) VALUES (?, ?, ?, ?, ?)'
  ).run(projetoId, dataRevisao, descricao || '', JSON.stringify(snapshot), nomeArquivo);

  res.status(201).json({ id: result.lastInsertRowid, nome_arquivo: nomeArquivo, data_revisao: dataRevisao });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM revisoes WHERE id = ?').run(req.params.id);
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
    SELECT s.nome, s.poder, s.legitimidade, s.urgencia, s.tipo,
           (s.poder + s.legitimidade + s.urgencia) as saliencia_total,
           ps.papel_no_projeto
    FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id
    WHERE ps.projeto_id = ?
    ORDER BY saliencia_total DESC
  `).all(projetoId);

  const salienciaMedia = db.prepare(`
    SELECT
      ROUND(AVG(s.poder), 1) as media_poder,
      ROUND(AVG(s.legitimidade), 1) as media_legitimidade,
      ROUND(AVG(s.urgencia), 1) as media_urgencia
    FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id
    WHERE ps.projeto_id = ?
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

  const stakeholdersEngajamento = db.prepare(`
    SELECT s.nome, s.id as stakeholder_id,
      (SELECT COUNT(*) FROM valor_stakeholders vs
       JOIN valores v ON vs.valor_id = v.id
       WHERE vs.stakeholder_id = s.id AND v.projeto_id = ?) as vinculos_valores,
      (SELECT COUNT(*) FROM propagacoes p
       JOIN beneficios b ON p.beneficio_id = b.id
       WHERE (p.stakeholder_origem_id = s.id OR p.stakeholder_destino_id = s.id) AND b.projeto_id = ?) as vinculos_propagacoes
    FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id
    WHERE ps.projeto_id = ?
  `).all(projetoId, projetoId, projetoId);

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

const express = require('express');
const router = express.Router();
const db = require('../database/db');

const FREQUENCIA_DIAS = {
  'Semanal': 7, 'semanal': 7,
  'Quinzenal': 15, 'quinzenal': 15,
  'Mensal': 30, 'mensal': 30,
  'Bimestral': 60, 'bimestral': 60,
  'Trimestral': 90, 'trimestral': 90,
  'Semestral': 180, 'semestral': 180,
  'Anual': 365, 'anual': 365
};

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, o.nome as organizacao_nome,
      g1.nome as gestor_nome, g2.nome as patrocinador_nome, g3.nome as responsavel_nome
    FROM projetos p
    LEFT JOIN organizacoes o ON p.organizacao_id = o.id
    LEFT JOIN gestores g1 ON p.gestor_id = g1.id
    LEFT JOIN gestores g2 ON p.patrocinador_id = g2.id
    LEFT JOIN gestores g3 ON p.responsavel_id = g3.id
    ORDER BY p.criado_em DESC
  `).all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT p.*, o.nome as organizacao_nome,
      g1.nome as gestor_nome, g2.nome as patrocinador_nome, g3.nome as responsavel_nome
    FROM projetos p
    LEFT JOIN organizacoes o ON p.organizacao_id = o.id
    LEFT JOIN gestores g1 ON p.gestor_id = g1.id
    LEFT JOIN gestores g2 ON p.patrocinador_id = g2.id
    LEFT JOIN gestores g3 ON p.responsavel_id = g3.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Não encontrado' });

  const stakeholders = db.prepare(`
    SELECT ps.*, s.nome as stakeholder_nome, s.tipo as stakeholder_tipo
    FROM projeto_stakeholders ps
    JOIN stakeholders s ON ps.stakeholder_id = s.id
    WHERE ps.projeto_id = ?
  `).all(req.params.id);

  res.json({ ...row, stakeholders });
});

router.post('/', (req, res) => {
  const { organizacao_id, codigo, nome, objetivo, duracao, status, gestor_id, patrocinador_id, responsavel_id, area_responsavel, abordagem_gestao, numero_revisoes_previstas, frequencia_revisoes } = req.body;
  const frequencia_revisoes_dias = FREQUENCIA_DIAS[frequencia_revisoes] || null;
  const result = db.prepare(
    'INSERT INTO projetos (organizacao_id, codigo, nome, objetivo, duracao, status, gestor_id, patrocinador_id, responsavel_id, area_responsavel, abordagem_gestao, numero_revisoes_previstas, frequencia_revisoes, frequencia_revisoes_dias) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(organizacao_id || null, codigo, nome, objetivo, duracao, status || 'Planejamento', gestor_id || null, patrocinador_id || null, responsavel_id || null, area_responsavel, abordagem_gestao, numero_revisoes_previstas || null, frequencia_revisoes || null, frequencia_revisoes_dias);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body, frequencia_revisoes_dias });
});

router.put('/:id', (req, res) => {
  const { organizacao_id, codigo, nome, objetivo, duracao, status, gestor_id, patrocinador_id, responsavel_id, area_responsavel, abordagem_gestao, numero_revisoes_previstas, frequencia_revisoes } = req.body;
  const frequencia_revisoes_dias = FREQUENCIA_DIAS[frequencia_revisoes] || null;
  db.prepare(
    'UPDATE projetos SET organizacao_id=?, codigo=?, nome=?, objetivo=?, duracao=?, status=?, gestor_id=?, patrocinador_id=?, responsavel_id=?, area_responsavel=?, abordagem_gestao=?, numero_revisoes_previstas=?, frequencia_revisoes=?, frequencia_revisoes_dias=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(organizacao_id || null, codigo, nome, objetivo, duracao, status, gestor_id || null, patrocinador_id || null, responsavel_id || null, area_responsavel, abordagem_gestao, numero_revisoes_previstas || null, frequencia_revisoes || null, frequencia_revisoes_dias, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body, frequencia_revisoes_dias });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM projetos WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Stakeholder linking
router.post('/:id/stakeholders', (req, res) => {
  const { stakeholder_id, papel_no_projeto } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO projeto_stakeholders (projeto_id, stakeholder_id, papel_no_projeto) VALUES (?, ?, ?)'
    ).run(req.params.id, stakeholder_id, papel_no_projeto);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(409).json({ error: 'Stakeholder já vinculado a este projeto' });
  }
});

router.delete('/:id/stakeholders/:sid', (req, res) => {
  db.prepare('DELETE FROM projeto_stakeholders WHERE projeto_id = ? AND stakeholder_id = ?').run(req.params.id, req.params.sid);
  res.json({ success: true });
});

module.exports = router;

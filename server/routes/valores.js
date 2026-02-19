const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/projeto/:projetoId', (req, res) => {
  const rows = db.prepare('SELECT * FROM valores WHERE projeto_id = ? ORDER BY criado_em DESC').all(req.params.projetoId);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM valores WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Não encontrado' });

  const stakeholders = db.prepare(`
    SELECT vs.*, s.nome as stakeholder_nome
    FROM valor_stakeholders vs
    JOIN stakeholders s ON vs.stakeholder_id = s.id
    WHERE vs.valor_id = ?
  `).all(req.params.id);

  res.json({ ...row, stakeholders });
});

router.post('/', (req, res) => {
  const { projeto_id, descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao } = req.body;
  const result = db.prepare(
    'INSERT INTO valores (projeto_id, descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(projeto_id, descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao } = req.body;
  db.prepare(
    'UPDATE valores SET descricao=?, tipo=?, natureza=?, temporalidade=?, conflitos=?, riscos=?, criterios_mensuracao=?, frequencia_revisao=?, proxima_revisao=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM valores WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Stakeholder linking
router.post('/:id/stakeholders', (req, res) => {
  const { stakeholder_id, perspectiva } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO valor_stakeholders (valor_id, stakeholder_id, perspectiva) VALUES (?, ?, ?)'
    ).run(req.params.id, stakeholder_id, perspectiva);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(409).json({ error: 'Stakeholder já vinculado a este valor' });
  }
});

router.delete('/:id/stakeholders/:sid', (req, res) => {
  db.prepare('DELETE FROM valor_stakeholders WHERE valor_id = ? AND stakeholder_id = ?').run(req.params.id, req.params.sid);
  res.json({ success: true });
});

module.exports = router;

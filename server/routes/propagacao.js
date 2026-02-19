const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/projeto/:projetoId', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, b.descricao as beneficio_descricao,
      so.nome as stakeholder_origem_nome, sd.nome as stakeholder_destino_nome
    FROM propagacoes p
    JOIN beneficios b ON p.beneficio_id = b.id
    JOIN stakeholders so ON p.stakeholder_origem_id = so.id
    JOIN stakeholders sd ON p.stakeholder_destino_id = sd.id
    WHERE b.projeto_id = ?
    ORDER BY p.criado_em DESC
  `).all(req.params.projetoId);
  res.json(rows);
});

router.get('/beneficio/:beneficioId', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, so.nome as stakeholder_origem_nome, sd.nome as stakeholder_destino_nome
    FROM propagacoes p
    JOIN stakeholders so ON p.stakeholder_origem_id = so.id
    JOIN stakeholders sd ON p.stakeholder_destino_id = sd.id
    WHERE p.beneficio_id = ?
  `).all(req.params.beneficioId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { beneficio_id, stakeholder_origem_id, stakeholder_destino_id, tipo_propagacao, efeitos_colaterais, tendencia, observacoes } = req.body;
  const result = db.prepare(
    'INSERT INTO propagacoes (beneficio_id, stakeholder_origem_id, stakeholder_destino_id, tipo_propagacao, efeitos_colaterais, tendencia, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(beneficio_id, stakeholder_origem_id, stakeholder_destino_id, tipo_propagacao, efeitos_colaterais, tendencia, observacoes);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { beneficio_id, stakeholder_origem_id, stakeholder_destino_id, tipo_propagacao, efeitos_colaterais, tendencia, observacoes } = req.body;
  db.prepare(
    'UPDATE propagacoes SET beneficio_id=?, stakeholder_origem_id=?, stakeholder_destino_id=?, tipo_propagacao=?, efeitos_colaterais=?, tendencia=?, observacoes=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(beneficio_id, stakeholder_origem_id, stakeholder_destino_id, tipo_propagacao, efeitos_colaterais, tendencia, observacoes, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM propagacoes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

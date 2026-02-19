const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM organizacoes ORDER BY criado_em DESC').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM organizacoes WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Não encontrado' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { nome, segmento, resumo_estrategico, horizonte_temporal } = req.body;
  const result = db.prepare(
    'INSERT INTO organizacoes (nome, segmento, resumo_estrategico, horizonte_temporal) VALUES (?, ?, ?, ?)'
  ).run(nome, segmento, resumo_estrategico, horizonte_temporal);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { nome, segmento, resumo_estrategico, horizonte_temporal } = req.body;
  db.prepare(
    'UPDATE organizacoes SET nome=?, segmento=?, resumo_estrategico=?, horizonte_temporal=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(nome, segmento, resumo_estrategico, horizonte_temporal, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM organizacoes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

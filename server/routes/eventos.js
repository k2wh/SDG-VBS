const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/projeto/:projetoId', (req, res) => {
  const rows = db.prepare(`
    SELECT e.*, g.nome as responsavel_nome
    FROM eventos_projeto e
    LEFT JOIN gestores g ON e.responsavel_id = g.id
    WHERE e.projeto_id = ?
    ORDER BY e.data_evento ASC
  `).all(req.params.projetoId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { projeto_id, data_evento, tipo_evento, titulo, descricao, responsavel_id } = req.body;
  const result = db.prepare(
    'INSERT INTO eventos_projeto (projeto_id, data_evento, tipo_evento, titulo, descricao, responsavel_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(projeto_id, data_evento, tipo_evento, titulo, descricao || null, responsavel_id || null);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { data_evento, tipo_evento, titulo, descricao, responsavel_id } = req.body;
  db.prepare(
    'UPDATE eventos_projeto SET data_evento=?, tipo_evento=?, titulo=?, descricao=?, responsavel_id=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(data_evento, tipo_evento, titulo, descricao || null, responsavel_id || null, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM eventos_projeto WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

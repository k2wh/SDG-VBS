const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/projeto/:projetoId', (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, ba.descricao as beneficio_a_descricao, bb.descricao as beneficio_b_descricao
    FROM sinergias s
    JOIN beneficios ba ON s.beneficio_a_id = ba.id
    JOIN beneficios bb ON s.beneficio_b_id = bb.id
    WHERE ba.projeto_id = ?
    ORDER BY s.criado_em DESC
  `).all(req.params.projetoId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { beneficio_a_id, beneficio_b_id, tipo_relacao, descricao, impacto } = req.body;
  const result = db.prepare(
    'INSERT INTO sinergias (beneficio_a_id, beneficio_b_id, tipo_relacao, descricao, impacto) VALUES (?, ?, ?, ?, ?)'
  ).run(beneficio_a_id, beneficio_b_id, tipo_relacao, descricao, impacto);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { beneficio_a_id, beneficio_b_id, tipo_relacao, descricao, impacto } = req.body;
  db.prepare(
    'UPDATE sinergias SET beneficio_a_id=?, beneficio_b_id=?, tipo_relacao=?, descricao=?, impacto=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(beneficio_a_id, beneficio_b_id, tipo_relacao, descricao, impacto, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM sinergias WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

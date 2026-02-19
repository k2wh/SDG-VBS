const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM gestores ORDER BY nome ASC').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM gestores WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Não encontrado' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { nome, cargo, departamento, email, telefone } = req.body;
  const result = db.prepare(
    'INSERT INTO gestores (nome, cargo, departamento, email, telefone) VALUES (?, ?, ?, ?, ?)'
  ).run(nome, cargo, departamento, email, telefone);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { nome, cargo, departamento, email, telefone } = req.body;
  db.prepare(
    'UPDATE gestores SET nome=?, cargo=?, departamento=?, email=?, telefone=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(nome, cargo, departamento, email, telefone, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM gestores WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

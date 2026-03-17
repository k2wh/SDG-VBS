const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM stakeholders ORDER BY nome ASC').all();
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM stakeholders WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Não encontrado' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { nome, papel, tipo, origem, interesses, contato, classe_principal } = req.body;
  const result = db.prepare(
    'INSERT INTO stakeholders (nome, papel, tipo, origem, interesses, contato, classe_principal) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(nome, papel, tipo, origem, interesses, contato, classe_principal || null);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { nome, papel, tipo, origem, interesses, contato, classe_principal } = req.body;
  db.prepare(
    'UPDATE stakeholders SET nome=?, papel=?, tipo=?, origem=?, interesses=?, contato=?, classe_principal=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(nome, papel, tipo, origem, interesses, contato, classe_principal || null, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM stakeholders WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

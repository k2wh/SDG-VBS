const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/projeto/:projetoId', (req, res) => {
  const rows = db.prepare(`
    SELECT b.*, v.descricao as valor_descricao
    FROM beneficios b
    LEFT JOIN valores v ON b.valor_id = v.id
    WHERE b.projeto_id = ?
    ORDER BY b.criado_em DESC
  `).all(req.params.projetoId);
  res.json(rows);
});

router.get('/valor/:valorId', (req, res) => {
  const rows = db.prepare('SELECT * FROM beneficios WHERE valor_id = ? ORDER BY criado_em DESC').all(req.params.valorId);
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM beneficios WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Não encontrado' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { valor_id, projeto_id, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao } = req.body;
  const result = db.prepare(
    'INSERT INTO beneficios (valor_id, projeto_id, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(valor_id || null, projeto_id, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao || 'Planejado');
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { valor_id, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao } = req.body;
  db.prepare(
    'UPDATE beneficios SET valor_id=?, descricao=?, natureza=?, classe=?, temporalidade=?, responsavel=?, forma_avaliacao=?, riscos=?, quando_realizar=?, como_realizar=?, frequencia_revisao=?, proxima_revisao=?, status_realizacao=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(valor_id || null, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM beneficios WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

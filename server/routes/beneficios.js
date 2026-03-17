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
  const { valor_id, projeto_id, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao, classe_conflito, probabilidade_risco, responsavel_id } = req.body;
  const result = db.prepare(
    'INSERT INTO beneficios (valor_id, projeto_id, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao, classe_conflito, probabilidade_risco, responsavel_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(valor_id || null, projeto_id, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao || 'Planejado', classe_conflito || null, probabilidade_risco || null, responsavel_id || null);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { valor_id, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao, classe_conflito, probabilidade_risco, responsavel_id } = req.body;
  db.prepare(
    'UPDATE beneficios SET valor_id=?, descricao=?, natureza=?, classe=?, temporalidade=?, responsavel=?, forma_avaliacao=?, riscos=?, quando_realizar=?, como_realizar=?, frequencia_revisao=?, proxima_revisao=?, status_realizacao=?, classe_conflito=?, probabilidade_risco=?, responsavel_id=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(valor_id || null, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao, classe_conflito || null, probabilidade_risco || null, responsavel_id || null, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM beneficios WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Stakeholder linking
router.post('/:id/stakeholders', (req, res) => {
  const { stakeholder_id, papel, classe_stakeholder, poder, legitimidade, urgencia } = req.body;
  const saliencia = (poder || 0) * (legitimidade || 0) * (urgencia || 0);
  try {
    const result = db.prepare(
      'INSERT INTO beneficio_stakeholders (beneficio_id, stakeholder_id, papel, classe_stakeholder, poder, legitimidade, urgencia, saliencia, saliencia_normalizada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(req.params.id, stakeholder_id, papel || null, classe_stakeholder || null, poder || 0, legitimidade || 0, urgencia || 0, saliencia, 0);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (e) {
    console.error('Erro ao vincular stakeholder ao benefício:', e.message);
    if (e.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Stakeholder já vinculado a este benefício' });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

router.get('/:id/stakeholders', (req, res) => {
  const rows = db.prepare(`
    SELECT bs.*, s.nome as stakeholder_nome, s.tipo as stakeholder_tipo
    FROM beneficio_stakeholders bs
    JOIN stakeholders s ON bs.stakeholder_id = s.id
    WHERE bs.beneficio_id = ?
  `).all(req.params.id);
  res.json(rows);
});

router.put('/:beneficioId/stakeholders/:stakeholderId', (req, res) => {
  const { poder, legitimidade, urgencia, classe_stakeholder } = req.body;
  const saliencia = (poder || 0) * (legitimidade || 0) * (urgencia || 0);
  db.prepare(
    'UPDATE beneficio_stakeholders SET poder=?, legitimidade=?, urgencia=?, saliencia=?, classe_stakeholder=? WHERE beneficio_id=? AND stakeholder_id=?'
  ).run(poder || 0, legitimidade || 0, urgencia || 0, saliencia, classe_stakeholder || null, req.params.beneficioId, req.params.stakeholderId);
  res.json({ success: true });
});

router.delete('/:id/stakeholders/:sid', (req, res) => {
  db.prepare('DELETE FROM beneficio_stakeholders WHERE beneficio_id = ? AND stakeholder_id = ?').run(req.params.id, req.params.sid);
  res.json({ success: true });
});

// Recalcular saliencia normalizada
router.post('/:id/recalcular-saliencia', (req, res) => {
  const rows = db.prepare('SELECT * FROM beneficio_stakeholders WHERE beneficio_id = ?').all(req.params.id);
  if (rows.length === 0) return res.json({ success: true, message: 'Nenhum stakeholder vinculado' });

  const updated = rows.map(r => {
    const saliencia = (r.poder || 0) * (r.legitimidade || 0) * (r.urgencia || 0);
    return { ...r, saliencia };
  });

  const maxSaliencia = Math.max(...updated.map(r => r.saliencia), 1);

  const updateStmt = db.prepare('UPDATE beneficio_stakeholders SET saliencia=?, saliencia_normalizada=? WHERE beneficio_id=? AND stakeholder_id=?');
  for (const r of updated) {
    const saliencia_normalizada = r.saliencia / maxSaliencia;
    updateStmt.run(r.saliencia, saliencia_normalizada, req.params.id, r.stakeholder_id);
  }

  res.json({ success: true });
});

module.exports = router;

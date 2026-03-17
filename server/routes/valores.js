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
    SELECT vs.*, s.nome as stakeholder_nome, s.tipo as stakeholder_tipo
    FROM valor_stakeholders vs
    JOIN stakeholders s ON vs.stakeholder_id = s.id
    WHERE vs.valor_id = ?
  `).all(req.params.id);

  res.json({ ...row, stakeholders });
});

router.post('/', (req, res) => {
  const { projeto_id, descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao, classe_valor, classe_conflito, probabilidade_risco } = req.body;
  const result = db.prepare(
    'INSERT INTO valores (projeto_id, descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao, classe_valor, classe_conflito, probabilidade_risco) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(projeto_id, descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao, classe_valor || null, classe_conflito || null, probabilidade_risco || null);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const { descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao, classe_valor, classe_conflito, probabilidade_risco } = req.body;
  db.prepare(
    'UPDATE valores SET descricao=?, tipo=?, natureza=?, temporalidade=?, conflitos=?, riscos=?, criterios_mensuracao=?, frequencia_revisao=?, proxima_revisao=?, classe_valor=?, classe_conflito=?, probabilidade_risco=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?'
  ).run(descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao, classe_valor || null, classe_conflito || null, probabilidade_risco || null, req.params.id);
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM valores WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Stakeholder linking
router.post('/:id/stakeholders', (req, res) => {
  const { stakeholder_id, perspectiva, classe_stakeholder, poder, legitimidade, urgencia } = req.body;
  const saliencia = (poder || 0) * (legitimidade || 0) * (urgencia || 0);
  try {
    const result = db.prepare(
      'INSERT INTO valor_stakeholders (valor_id, stakeholder_id, perspectiva, classe_stakeholder, poder, legitimidade, urgencia, saliencia, saliencia_normalizada) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(req.params.id, stakeholder_id, perspectiva, classe_stakeholder || null, poder || 0, legitimidade || 0, urgencia || 0, saliencia, 0);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (e) {
    console.error('Erro ao vincular stakeholder ao valor:', e.message);
    if (e.message.includes('UNIQUE')) {
      res.status(409).json({ error: 'Stakeholder já vinculado a este valor' });
    } else {
      res.status(500).json({ error: e.message });
    }
  }
});

router.get('/:id/stakeholders', (req, res) => {
  const rows = db.prepare(`
    SELECT vs.*, s.nome as stakeholder_nome, s.tipo as stakeholder_tipo
    FROM valor_stakeholders vs
    JOIN stakeholders s ON vs.stakeholder_id = s.id
    WHERE vs.valor_id = ?
  `).all(req.params.id);
  res.json(rows);
});

router.put('/:valorId/stakeholders/:stakeholderId', (req, res) => {
  const { poder, legitimidade, urgencia, classe_stakeholder } = req.body;
  const saliencia = (poder || 0) * (legitimidade || 0) * (urgencia || 0);
  db.prepare(
    'UPDATE valor_stakeholders SET poder=?, legitimidade=?, urgencia=?, saliencia=?, classe_stakeholder=? WHERE valor_id=? AND stakeholder_id=?'
  ).run(poder || 0, legitimidade || 0, urgencia || 0, saliencia, classe_stakeholder || null, req.params.valorId, req.params.stakeholderId);
  res.json({ success: true });
});

router.delete('/:id/stakeholders/:sid', (req, res) => {
  db.prepare('DELETE FROM valor_stakeholders WHERE valor_id = ? AND stakeholder_id = ?').run(req.params.id, req.params.sid);
  res.json({ success: true });
});

// Recalcular saliencia normalizada
router.post('/:id/recalcular-saliencia', (req, res) => {
  const rows = db.prepare('SELECT * FROM valor_stakeholders WHERE valor_id = ?').all(req.params.id);
  if (rows.length === 0) return res.json({ success: true, message: 'Nenhum stakeholder vinculado' });

  // Calculate saliencia for each
  const updated = rows.map(r => {
    const saliencia = (r.poder || 0) * (r.legitimidade || 0) * (r.urgencia || 0);
    return { ...r, saliencia };
  });

  const maxSaliencia = Math.max(...updated.map(r => r.saliencia), 1);

  const updateStmt = db.prepare('UPDATE valor_stakeholders SET saliencia=?, saliencia_normalizada=? WHERE valor_id=? AND stakeholder_id=?');
  for (const r of updated) {
    const saliencia_normalizada = r.saliencia / maxSaliencia;
    updateStmt.run(r.saliencia, saliencia_normalizada, req.params.id, r.stakeholder_id);
  }

  res.json({ success: true });
});

module.exports = router;

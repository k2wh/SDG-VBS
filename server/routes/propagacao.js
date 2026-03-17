const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/projeto/:projetoId', (req, res) => {
  const rows = db.prepare(`
    SELECT p.*, b.descricao as beneficio_descricao
    FROM propagacoes p
    JOIN beneficios b ON p.beneficio_id = b.id
    WHERE b.projeto_id = ?
    ORDER BY p.criado_em DESC
  `).all(req.params.projetoId);
  res.json(rows);
});

router.get('/beneficio/:beneficioId', (req, res) => {
  const rows = db.prepare('SELECT * FROM propagacoes WHERE beneficio_id = ? ORDER BY criado_em DESC').all(req.params.beneficioId);
  res.json(rows);
});

router.post('/', (req, res) => {
  const {
    beneficio_id, classe_beneficio, stakeholders_alvo, descricao_propagacao,
    riscos_nao_propagacao, efeitos_colaterais, stakeholders_estimados,
    numero_periodos, abordagem_principal, justificativa_outros,
    projecao_temporal, total_acumulado, cobertura_final
  } = req.body;
  const result = db.prepare(
    `INSERT INTO propagacoes (beneficio_id, classe_beneficio, stakeholders_alvo, descricao_propagacao,
      riscos_nao_propagacao, efeitos_colaterais, stakeholders_estimados,
      numero_periodos, abordagem_principal, justificativa_outros,
      projecao_temporal, total_acumulado, cobertura_final)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    beneficio_id,
    classe_beneficio || null,
    typeof stakeholders_alvo === 'string' ? stakeholders_alvo : JSON.stringify(stakeholders_alvo || []),
    descricao_propagacao || null,
    riscos_nao_propagacao || null,
    efeitos_colaterais || null,
    stakeholders_estimados || null,
    numero_periodos || null,
    abordagem_principal || null,
    justificativa_outros || null,
    typeof projecao_temporal === 'string' ? projecao_temporal : JSON.stringify(projecao_temporal || []),
    total_acumulado || null,
    cobertura_final || null
  );
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

router.put('/:id', (req, res) => {
  const {
    beneficio_id, classe_beneficio, stakeholders_alvo, descricao_propagacao,
    riscos_nao_propagacao, efeitos_colaterais, stakeholders_estimados,
    numero_periodos, abordagem_principal, justificativa_outros,
    projecao_temporal, total_acumulado, cobertura_final
  } = req.body;
  db.prepare(
    `UPDATE propagacoes SET beneficio_id=?, classe_beneficio=?, stakeholders_alvo=?, descricao_propagacao=?,
      riscos_nao_propagacao=?, efeitos_colaterais=?, stakeholders_estimados=?,
      numero_periodos=?, abordagem_principal=?, justificativa_outros=?,
      projecao_temporal=?, total_acumulado=?, cobertura_final=?,
      atualizado_em=CURRENT_TIMESTAMP WHERE id=?`
  ).run(
    beneficio_id,
    classe_beneficio || null,
    typeof stakeholders_alvo === 'string' ? stakeholders_alvo : JSON.stringify(stakeholders_alvo || []),
    descricao_propagacao || null,
    riscos_nao_propagacao || null,
    efeitos_colaterais || null,
    stakeholders_estimados || null,
    numero_periodos || null,
    abordagem_principal || null,
    justificativa_outros || null,
    typeof projecao_temporal === 'string' ? projecao_temporal : JSON.stringify(projecao_temporal || []),
    total_acumulado || null,
    cobertura_final || null,
    req.params.id
  );
  res.json({ id: Number(req.params.id), ...req.body });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM propagacoes WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;

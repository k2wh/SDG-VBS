import * as XLSX from 'xlsx';
import { revisoes } from './api';

/**
 * Exporta uma revisão completa para XLSX com todas as tabs e respostas dos questionários.
 */
export async function exportarRevisaoXlsx(revId, nomeArquivo) {
  const wb = XLSX.utils.book_new();

  // Load all revision data in parallel
  const [revData, cicloData, qValor, qBeneficio, qPropagacao, qSinergia] = await Promise.all([
    revisoes.get(revId).catch(() => null),
    revisoes.getCiclo(revId).catch(() => null),
    revisoes.getQuestoesValor(revId).catch(() => ({})),
    revisoes.getQuestoesBeneficio(revId).catch(() => ({})),
    revisoes.getQuestoesPropagacao(revId).catch(() => ({})),
    revisoes.getQuestoesSinergia(revId).catch(() => ({})),
  ]);

  const snap = revData?.snapshot_dados || {};

  // ── 1. Dados Gerais ──
  const dadosGerais = [];
  if (snap.projeto) {
    const p = snap.projeto;
    dadosGerais.push({
      'Código': p.codigo, 'Nome': p.nome, 'Status': p.status,
      'Abordagem': p.abordagem_gestao, 'Duração': p.duracao,
      'Área Responsável': p.area_responsavel, 'Objetivo': p.objetivo,
      'Data Revisão': revData?.data_revisao, 'Descrição Revisão': revData?.descricao,
      'Status Revisão': revData?.status || 'Aberto',
      'Etapa Projeto': revData?.etapa_projeto,
      'Próxima Revisão Sugerida': revData?.proxima_revisao_sugerida,
    });
  }
  addSheet(wb, dadosGerais, 'Dados Gerais');

  // ── 2. Valores e Stakeholders ──
  const valoresRows = [];
  const valStakeholderRows = [];
  const valoresArr = cicloData?.valores || snap.valores || [];
  for (const v of valoresArr) {
    valoresRows.push({
      'ID': v.id, 'Descrição': v.descricao, 'Tipo': v.tipo,
      'Natureza': v.natureza, 'Classe': v.classe_valor,
      'Temporalidade': v.temporalidade,
      'Critérios Mensuração': v.criterios_mensuracao,
      'Frequência Revisão': v.frequencia_revisao,
      'Conflitos': v.conflitos, 'Riscos': v.riscos,
    });
    // Stakeholders desse valor (do cicloData)
    const shs = cicloData?.stakeholders_valor?.[v.id] || v.stakeholders || [];
    for (const s of (Array.isArray(shs) ? shs : [])) {
      valStakeholderRows.push({
        'Valor': v.descricao,
        'Stakeholder': s.stakeholder_nome || s.nome,
        'Classe': s.classe || s.classe_stakeholder || '',
        'Poder': s.poder, 'Legitimidade': s.legitimidade, 'Urgência': s.urgencia,
        'Saliência': (s.poder || 1) * (s.legitimidade || 1) * (s.urgencia || 1),
        'Saliência Norm.': s.saliencia_normalizada != null ? Number(s.saliencia_normalizada).toFixed(3) : '',
        'Descontinuado': s.descontinuado ? 'Sim' : 'Não',
      });
    }
  }
  addSheet(wb, valoresRows, 'Valores');
  if (valStakeholderRows.length > 0) addSheet(wb, valStakeholderRows, 'Valor-Stakeholders');

  // ── 3. Questões de Valor (Q1-Q7) ──
  const qValorRows = [];
  for (const v of valoresArr) {
    const q = qValor[v.id] || {};
    if (Object.keys(q).length === 0) continue;
    qValorRows.push({
      'Valor': v.descricao,
      'Q1 - Percebido como relevante': q.q1 || '', 'Q1 Justificativa': q.q1_justificativa || '',
      'Q2 - Alinhamento estratégico': q.q2 || '', 'Q2 Justificativa': q.q2_justificativa || '',
      'Q3 - Percepção de valor': q.q3 || '', 'Q3 Justificativa': q.q3_justificativa || '',
      'Q4 - Critérios adequados': q.q4 || '', 'Q4 Justificativa': q.q4_justificativa || '',
      'Q5 - Novos fatores': q.q5 || '',
      'Q6 - Conflitos entre stakeholders': q.q6 || '',
      'Q7 - Ajustes recomendados': q.q7 || '',
    });
  }
  if (qValorRows.length > 0) addSheet(wb, qValorRows, 'Questões Valor');

  // ── 4. Benefícios e Stakeholders ──
  const beneficiosRows = [];
  const benStakeholderRows = [];
  const beneficiosArr = cicloData?.beneficios || snap.beneficios || [];
  for (const b of beneficiosArr) {
    beneficiosRows.push({
      'ID': b.id, 'Descrição': b.descricao, 'Valor': b.valor_descricao || '',
      'Natureza': b.natureza, 'Classe': b.classe,
      'Temporalidade': b.temporalidade, 'Status': b.status || b.status_realizacao || '',
      'Responsável': b.responsavel_nome || '',
      'Forma Avaliação': b.forma_avaliacao || '',
    });
    const shs = cicloData?.stakeholders_beneficio?.[b.id] || b.stakeholders || [];
    for (const s of (Array.isArray(shs) ? shs : [])) {
      benStakeholderRows.push({
        'Benefício': b.descricao,
        'Stakeholder': s.stakeholder_nome || s.nome,
        'Classe': s.classe || '', 'Poder': s.poder, 'Legitimidade': s.legitimidade, 'Urgência': s.urgencia,
        'Saliência': (s.poder || 1) * (s.legitimidade || 1) * (s.urgencia || 1),
        'Saliência Norm.': s.saliencia_normalizada != null ? Number(s.saliencia_normalizada).toFixed(3) : '',
        'Descontinuado': s.descontinuado ? 'Sim' : 'Não',
      });
    }
  }
  addSheet(wb, beneficiosRows, 'Benefícios');
  if (benStakeholderRows.length > 0) addSheet(wb, benStakeholderRows, 'Benef-Stakeholders');

  // ── 5. Questões de Benefício (Q1-Q7) ──
  const qBenRows = [];
  for (const b of beneficiosArr) {
    const q = qBeneficio[b.id] || {};
    if (Object.keys(q).length === 0) continue;
    qBenRows.push({
      'Benefício': b.descricao,
      'Q1 - Entregue': q.q1 || '', 'Q1 Justificativa': q.q1_justificativa || '',
      'Q2 - Nível realização': q.q2 || '', 'Q2 Justificativa': q.q2_justificativa || '',
      'Q3 - Novos usos': q.q3 || '', 'Q3 Detalhamento': q.q3_detalhamento || '',
      'Q4 - Efeitos colaterais': q.q4 || '', 'Q4 Detalhamento': q.q4_detalhamento || '',
      'Q5 - Avaliação atual': q.q5 || '', 'Q5 Justificativa': q.q5_justificativa || '',
      'Q6 - Melhorias sugeridas': q.q6 || '',
      'Q7 - Ajustes recomendados': formatMultiSelect(q.q7), 'Q7 Outros': q.q7_outros || '',
    });
  }
  if (qBenRows.length > 0) addSheet(wb, qBenRows, 'Questões Benefício');

  // ── 6. Propagação ──
  const propagacoesArr = cicloData?.propagacoes || snap.propagacoes || [];
  const propRows = propagacoesArr.map(p => ({
    'ID': p.id, 'Benefício': p.beneficio_descricao || '',
    'Abordagem': p.abordagem || '', 'Stakeholders Estimados': p.stakeholders_estimados ?? '',
    'Períodos': p.periodos ?? '', 'Cobertura Final': p.cobertura_final ?? p.cobertura ?? '',
    'Registro Propagação': p.registro_propagacao || '',
    'Riscos': p.riscos_nao_propagacao || '', 'Efeitos Colaterais': p.efeitos_colaterais || '',
  }));
  addSheet(wb, propRows, 'Propagação');

  // ── 7. Questões de Propagação (Q1-Q10) ──
  const qPropRows = [];
  for (const p of propagacoesArr) {
    const q = qPropagacao[p.id] || {};
    if (Object.keys(q).length === 0) continue;
    qPropRows.push({
      'Propagação': p.beneficio_descricao || `#${p.id}`,
      'Q1 - Stakeholders beneficiados': q.q1 || '',
      'Q2 - Público esperado': q.q2 || '',
      'Q3 - Classificação propagação': q.q3 || '', 'Q3 Justificativa': q.q3_justificativa || '',
      'Q4 - Percepção geral': q.q4 || '', 'Q4 Justificativa': q.q4_justificativa || '',
      'Q5 - Permanência': q.q5 || '', 'Q5 Justificativa': q.q5_justificativa || '',
      'Q6 - Redução de uso': q.q6 || '', 'Q6 Justificativa': q.q6_justificativa || '',
      'Q7 - Fatores': q.q7 || '',
      'Q8 - Mecanismos': q.q8 || '',
      'Q9 - Efeitos indiretos': q.q9 || '', 'Q9 Detalhamento': q.q9_detalhamento || '',
      'Q10 - Ajustes': formatMultiSelect(q.q10), 'Q10 Outros': q.q10_outros || '',
    });
  }
  if (qPropRows.length > 0) addSheet(wb, qPropRows, 'Questões Propagação');

  // ── 8. Sinergias ──
  const sinergiasArr = cicloData?.sinergias || snap.sinergias || [];
  const sinRows = sinergiasArr.map(s => ({
    'ID': s.id, 'Benefício A': s.beneficio_a_descricao || '',
    'Benefício B': s.beneficio_b_descricao || '',
    'Tipo Relação': s.tipo_relacao || '', 'Descrição': s.descricao || '',
    'Impacto': s.impacto ?? '',
  }));
  addSheet(wb, sinRows, 'Sinergias');

  // ── 9. Questões de Sinergia (Q1-Q6) ──
  const qSinRows = [];
  for (const s of sinergiasArr) {
    const q = qSinergia[s.id] || {};
    if (Object.keys(q).length === 0) continue;
    qSinRows.push({
      'Sinergia': `${s.beneficio_a_descricao || ''} ↔ ${s.beneficio_b_descricao || ''}`,
      'Q1 - Relação com outros': q.q1 || '', 'Q1 Benefício relacionado': q.q1_beneficio || '',
      'Q2 - Tipos de relação': formatMultiSelect(q.q2), 'Q2 Outros': q.q2_outros || '',
      'Q3 - Intensidade sinergia': q.q3 || '', 'Q3 Outros': q.q3_outros || '',
      'Q4 - Conflitos/sobreposições': q.q4 || '', 'Q4 Detalhamento': q.q4_detalhamento || '',
      'Q5 - Benefícios emergentes': q.q5 || '', 'Q5 Detalhamento': q.q5_detalhamento || '',
      'Q6 - Ajustes recomendados': formatMultiSelect(q.q6), 'Q6 Outros': q.q6_outros || '',
    });
  }
  if (qSinRows.length > 0) addSheet(wb, qSinRows, 'Questões Sinergia');

  // Download
  const fileName = nomeArquivo
    ? `Revisao_${nomeArquivo.replace(/[^a-zA-Z0-9À-ú_ -]/g, '').replace(/\s+/g, '_')}`
    : `Revisao_${revId}`;
  downloadWorkbook(wb, fileName);
}

function formatMultiSelect(value) {
  if (!value) return '';
  if (value.includes('|||')) return value.split('|||').join(', ');
  return value;
}

function addSheet(wb, rows, name) {
  if (!rows || rows.length === 0) {
    rows = [{ Info: 'Sem dados' }];
  }
  const ws = XLSX.utils.json_to_sheet(rows);
  // Auto-size columns
  const maxWidths = {};
  for (const row of rows) {
    for (const [key, val] of Object.entries(row)) {
      const len = Math.max(key.length, String(val || '').length);
      maxWidths[key] = Math.min(Math.max(maxWidths[key] || 0, len), 60);
    }
  }
  ws['!cols'] = Object.values(maxWidths).map(w => ({ wch: w + 2 }));
  XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
}

function downloadWorkbook(wb, filename) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

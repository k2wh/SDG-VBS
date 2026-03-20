import * as XLSX from 'xlsx';
import { organizacoes, gestores, projetos, stakeholders, valores, beneficios, propagacoes, sinergias, eventos, revisoes } from './api';

export async function exportarProjetoXlsx(projetoAtivo, projetoNome) {
  const wb = XLSX.utils.book_new();

  // 1. Organizações
  const orgs = await organizacoes.list();
  const wsOrgs = XLSX.utils.json_to_sheet(orgs.map(o => ({
    'Nome': o.nome,
    'Segmento': o.segmento,
    'Horizonte Temporal': o.horizonte_temporal,
    'Alinhamento Estratégico': o.resumo_estrategico,
  })));
  XLSX.utils.book_append_sheet(wb, wsOrgs, 'Organizações');

  // 2. Gestores
  const gest = await gestores.list();
  const wsGest = XLSX.utils.json_to_sheet(gest.map(g => ({
    'Nome': g.nome,
    'Cargo': g.cargo,
    'Departamento': g.departamento,
    'Email': g.email,
    'Telefone': g.telefone,
  })));
  XLSX.utils.book_append_sheet(wb, wsGest, 'Gestores');

  // 3. Projetos
  const projs = await projetos.list();
  const wsProj = XLSX.utils.json_to_sheet(projs.map(p => ({
    'Código': p.codigo,
    'Nome': p.nome,
    'Status': p.status,
    'Abordagem': p.abordagem_gestao,
    'Duração': p.duracao,
    'Gestor': p.gestor_nome,
    'Patrocinador': p.patrocinador_nome,
    'Área Responsável': p.area_responsavel,
    'Objetivo': p.objetivo,
    'Revisões Previstas': p.numero_revisoes_previstas,
    'Frequência Revisões': p.frequencia_revisoes,
  })));
  XLSX.utils.book_append_sheet(wb, wsProj, 'Projetos');

  if (!projetoAtivo) {
    downloadWorkbook(wb, 'SGD-VBS_Geral');
    return;
  }

  // 4. Eventos do Projeto
  const evts = await eventos.listByProjeto(projetoAtivo).catch(() => []);
  if (evts.length > 0) {
    const wsEvts = XLSX.utils.json_to_sheet(evts.map(e => ({
      'Data': e.data_evento,
      'Tipo': e.tipo_evento,
      'Título': e.titulo,
      'Descrição': e.descricao,
    })));
    XLSX.utils.book_append_sheet(wb, wsEvts, 'Eventos');
  }

  // 5. Stakeholders
  const shs = await stakeholders.list();
  const wsStk = XLSX.utils.json_to_sheet(shs.map(s => ({
    'Nome': s.nome,
    'Papel': s.papel,
    'Tipo': s.tipo,
    'Origem': s.origem,
    'Classe Principal': s.classe_principal,
    'Contato': s.contato,
    'Interesses': s.interesses,
  })));
  XLSX.utils.book_append_sheet(wb, wsStk, 'Stakeholders');

  // 5b. Stakeholders Vinculados ao Projeto
  const projData = await projetos.get(projetoAtivo).catch(() => ({}));
  const vinculados = projData.stakeholders || [];
  if (vinculados.length > 0) {
    const wsVinc = XLSX.utils.json_to_sheet(vinculados.map(v => ({
      'Nome': v.stakeholder_nome || v.nome,
      'Tipo': v.stakeholder_tipo || v.tipo,
      'Papel no Projeto': v.papel_no_projeto,
    })));
    XLSX.utils.book_append_sheet(wb, wsVinc, 'SH Vinculados');
  }

  // 6. Valores DPD
  const vals = await valores.listByProjeto(projetoAtivo).catch(() => []);
  if (vals.length > 0) {
    const wsVals = XLSX.utils.json_to_sheet(vals.map(v => ({
      'Descrição': v.descricao,
      'Tipo': v.tipo,
      'Natureza': v.natureza,
      'Classe de Valor': v.classe_valor,
      'Temporalidade': v.temporalidade,
      'Critérios Mensuração': v.criterios_mensuracao,
      'Frequência Revisão': v.frequencia_revisao,
      'Próxima Revisão': v.proxima_revisao,
      'Conflitos': v.conflitos,
      'Classe Conflito': v.classe_conflito,
      'Riscos': v.riscos,
      'Probabilidade Risco': v.probabilidade_risco,
    })));
    XLSX.utils.book_append_sheet(wb, wsVals, 'Valores DPD');

    // 6b. Valor-Stakeholders (saliência)
    const valShRows = [];
    for (const val of vals) {
      const detail = await valores.get(val.id).catch(() => null);
      if (detail?.stakeholders) {
        for (const s of detail.stakeholders) {
          valShRows.push({
            'Valor': val.descricao,
            'Stakeholder': s.stakeholder_nome,
            'Perspectiva': s.perspectiva,
            'Classe SH': s.classe_stakeholder,
            'Poder': s.poder,
            'Legitimidade': s.legitimidade,
            'Urgência': s.urgencia,
            'Saliência (P×L×U)': (s.poder || 0) * (s.legitimidade || 0) * (s.urgencia || 0),
            'Saliência Normalizada': s.saliencia_normalizada != null ? Number(s.saliencia_normalizada).toFixed(3) : '',
          });
        }
      }
    }
    if (valShRows.length > 0) {
      const wsValSh = XLSX.utils.json_to_sheet(valShRows);
      XLSX.utils.book_append_sheet(wb, wsValSh, 'Valor-Stakeholders');
    }
  }

  // 7. Benefícios GADB
  const bens = await beneficios.listByProjeto(projetoAtivo).catch(() => []);
  if (bens.length > 0) {
    const wsBens = XLSX.utils.json_to_sheet(bens.map(b => ({
      'Descrição': b.descricao,
      'Valor Associado': b.valor_descricao,
      'Natureza': b.natureza,
      'Classe': b.classe,
      'Temporalidade': b.temporalidade,
      'Responsável': b.responsavel_nome,
      'Como Realizar': b.como_realizar,
      'Forma Avaliação': b.forma_avaliacao,
      'Status': b.status_realizacao,
      'Quando Realizar': b.quando_realizar,
      'Riscos': b.riscos,
      'Probabilidade Risco': b.probabilidade_risco,
      'Classe Conflito': b.classe_conflito,
    })));
    XLSX.utils.book_append_sheet(wb, wsBens, 'Benefícios GADB');

    // 7b. Benefício-Stakeholders (saliência)
    const benShRows = [];
    for (const ben of bens) {
      const shs = await beneficios.getStakeholders(ben.id).catch(() => []);
      for (const s of shs) {
        const p = s.poder || 1;
        const l = s.legitimidade || 1;
        const u = s.urgencia || 1;
        benShRows.push({
          'Benefício': ben.descricao,
          'Stakeholder': s.stakeholder_nome || s.nome,
          'Papel': s.papel || s.perspectiva,
          'Classe SH': s.classe,
          'Poder': p,
          'Legitimidade': l,
          'Urgência': u,
          'Saliência (P×L×U)': p * l * u,
          'Saliência Normalizada': s.saliencia_normalizada != null ? Number(s.saliencia_normalizada).toFixed(3) : '',
        });
      }
    }
    if (benShRows.length > 0) {
      const wsBenSh = XLSX.utils.json_to_sheet(benShRows);
      XLSX.utils.book_append_sheet(wb, wsBenSh, 'Benef-Stakeholders');
    }
  }

  // 8. Propagação
  const props = await propagacoes.listByProjeto(projetoAtivo).catch(() => []);
  if (props.length > 0) {
    const wsProps = XLSX.utils.json_to_sheet(props.map(p => ({
      'Benefício': p.beneficio_descricao,
      'Abordagem': p.abordagem,
      'Stakeholders Estimados': p.stakeholders_estimados,
      'Períodos': p.periodos,
      'Cobertura Final (%)': p.cobertura_final,
      'Registro Propagação': p.registro_propagacao,
      'Riscos Não Propagação': p.riscos_nao_propagacao,
      'Efeitos Colaterais': p.efeitos_colaterais,
    })));
    XLSX.utils.book_append_sheet(wb, wsProps, 'Propagação');
  }

  // 9. Sinergias
  const sins = await sinergias.listByProjeto(projetoAtivo).catch(() => []);
  if (sins.length > 0) {
    const wsSins = XLSX.utils.json_to_sheet(sins.map(s => ({
      'Benefício A': s.beneficio_a_descricao,
      'Benefício B': s.beneficio_b_descricao,
      'Tipo Relação': s.tipo_relacao,
      'Descrição': s.descricao,
      'Impacto': s.impacto,
    })));
    XLSX.utils.book_append_sheet(wb, wsSins, 'Sinergias');
  }

  // 10. Revisões
  const revs = await revisoes.listByProjeto(projetoAtivo).catch(() => []);
  if (revs.length > 0) {
    const wsRevs = XLSX.utils.json_to_sheet(revs.map(r => ({
      'Nome': r.nome_arquivo,
      'Data': r.data_revisao,
      'Status': r.status || 'Aberto',
      'Etapa': r.etapa_projeto,
      'Descrição': r.descricao,
      'Próxima Revisão Sugerida': r.proxima_revisao_sugerida,
    })));
    XLSX.utils.book_append_sheet(wb, wsRevs, 'Revisões');
  }

  const nomeArquivo = projetoNome
    ? `SGD-VBS_${projetoNome.replace(/[^a-zA-Z0-9À-ú ]/g, '').replace(/\s+/g, '_')}`
    : 'SGD-VBS_Projeto';

  downloadWorkbook(wb, nomeArquivo);
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

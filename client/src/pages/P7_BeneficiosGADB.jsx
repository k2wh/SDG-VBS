import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { beneficios, valores, gestores as gestoresApi, stakeholders as stakeholdersApi } from '../services/api';

const empty = { valor_id: '', descricao: '', natureza: '', classe: '', temporalidade: '', responsavel_id: '', forma_avaliacao: '', riscos: '', quando_realizar: '', como_realizar: '', frequencia_revisao: '', proxima_revisao: '', status_realizacao: 'Planejado', classe_conflito: '', probabilidade_risco: '' };

const PLU_DESCRIPTIONS = {
  Poder: 'Considerando sua percepção geral, em que medida este stakeholder possui capacidade de influenciar recursos estratégicos, decisões críticas, governança e resultados do projeto, incluindo a possibilidade de acelerar, bloquear ou redirecionar iniciativas relacionadas aos valor e aos benefícios?',
  Legitimidade: 'Considerando sua percepção geral, em que medida as expectativas, demandas e participação deste stakeholder são apropriadas, tecnicamente relevantes, institucionalmente reconhecidas, alinhadas às normas e estratégias organizacionais e socialmente aceitas no contexto do projeto?',
  Urgência: 'Considerando sua percepção geral, em que medida as demandas deste stakeholder exigem atenção imediata, exercem pressão significativa nos prazos e necessitam ação rápida para evitar impactos relevantes, riscos ou conflitos no curto prazo?',
};

function PLUInfoModal({ field, onClose }) {
  if (!field) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{field}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <p className="text-gray-600 leading-relaxed">{PLU_DESCRIPTIONS[field]}</p>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">Entendi</button>
        </div>
      </div>
    </div>
  );
}

function PLULabel({ label, onClick }) {
  return (
    <span className="flex items-center gap-1">
      {label}
      <button type="button" onClick={onClick} className="text-primary-500 hover:text-primary-700" title={`Saiba mais sobre ${label}`}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><path strokeWidth="2" d="M12 16v-4M12 8h.01"/></svg>
      </button>
    </span>
  );
}

export default function P7_BeneficiosGADB({ projetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [valoresList, setValoresList] = useState([]);
  const [gestoresList, setGestoresList] = useState([]);
  const [allStakeholders, setAllStakeholders] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detail, setDetail] = useState(null);
  const [linkSH, setLinkSH] = useState('');
  const [linkPersp, setLinkPersp] = useState('');
  const [linkPoder, setLinkPoder] = useState(1);
  const [linkLegitimidade, setLinkLegitimidade] = useState(1);
  const [toast, setToast] = useState(null);
  const [linkUrgencia, setLinkUrgencia] = useState(1);
  const [linkClasseSH, setLinkClasseSH] = useState('');
  const [pluModal, setPluModal] = useState(null);

  const load = () => {
    if (!projetoAtivo) return;
    beneficios.listByProjeto(projetoAtivo).then(setLista);
    valores.listByProjeto(projetoAtivo).then(setValoresList);
    gestoresApi.list().then(setGestoresList);
    stakeholdersApi.list().then(setAllStakeholders);
  };
  useEffect(() => { load(); }, [projetoAtivo]);

  if (!projetoAtivo) return <div><StepHeader numero={7} titulo="GADB Beneficios" descricao="Identificacao e definicao dos beneficios" /><EmptyState /></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await beneficios.update(editId, form);
    } else {
      await beneficios.create({ ...form, projeto_id: projetoAtivo });
    }
    setForm({ ...empty });
    setEditId(null);
    setShowForm(false);
    load();
  };

  const handleEdit = (row) => {
    setForm({ valor_id: row.valor_id || '', descricao: row.descricao, natureza: row.natureza, classe: row.classe, temporalidade: row.temporalidade, responsavel_id: row.responsavel_id || '', forma_avaliacao: row.forma_avaliacao, riscos: row.riscos, quando_realizar: row.quando_realizar, como_realizar: row.como_realizar, frequencia_revisao: row.frequencia_revisao, proxima_revisao: row.proxima_revisao, status_realizacao: row.status_realizacao, classe_conflito: row.classe_conflito || '', probabilidade_risco: row.probabilidade_risco || '' });
    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await beneficios.remove(deleteTarget.id);
    setDeleteTarget(null);
    setDetail(null);
    load();
  };

  const openDetail = async (row) => {
    const d = await beneficios.get(row.id);
    const shs = await beneficios.getStakeholders(row.id).catch(() => []);
    setDetail({ ...d, stakeholders: shs });
  };

  const handleLinkSH = async () => {
    if (!linkSH || !detail) return;
    try {
      await beneficios.addStakeholder(detail.id, { stakeholder_id: Number(linkSH), papel: linkPersp, classe_stakeholder: linkClasseSH, poder: Number(linkPoder), legitimidade: Number(linkLegitimidade), urgencia: Number(linkUrgencia) });
      setLinkSH('');
      setLinkPersp('');
      setLinkPoder(1);
      setLinkLegitimidade(1);
      setLinkUrgencia(1);
      setLinkClasseSH('');
      openDetail(detail);
      setToast({ type: 'success', msg: 'Stakeholder vinculado com sucesso' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', msg: err.message });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleUnlinkSH = async (sid) => {
    await beneficios.removeStakeholder(detail.id, sid);
    openDetail(detail);
  };

  const handleRecalcSaliencia = async () => {
    if (!detail) return;
    try {
      await beneficios.recalcSaliencia(detail.id);
      openDetail(detail);
      setToast({ type: 'success', msg: 'Saliência recalculada com sucesso' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', msg: err.message });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const columns = [
    { key: 'descricao', label: 'Beneficio' },
    { key: 'valor_descricao', label: 'Valor Associado' },
    { key: 'natureza', label: 'Natureza' },
    { key: 'classe', label: 'Classe' },
    { key: 'status_realizacao', label: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        v === 'Realizado' ? 'bg-green-100 text-green-800' :
        v === 'Em Andamento' ? 'bg-yellow-100 text-yellow-800' :
        v === 'Não Realizado' ? 'bg-red-100 text-red-800' :
        'bg-blue-100 text-blue-800'
      }`}>{v}</span>
    )},
  ];

  const valoresOpts = valoresList.map(v => ({ value: v.id, label: v.descricao }));
  const gestoresOpts = gestoresList.map(g => ({ value: g.id, label: `${g.nome}${g.cargo ? ` (${g.cargo})` : ''}` }));

  const naturezaOpts = [
    { value: 'Tangivel', label: 'Tangivel' },
    { value: 'Intangivel', label: 'Intangivel' },
  ];

  const classeOpts = [
    { value: 'Ambientais', label: 'Ambientais' },
    { value: 'Aprendizagem organizacional e desenvolvimento de capacidades', label: 'Aprendizagem organizacional e desenvolvimento de capacidades' },
    { value: 'Conformidade / regulatorios', label: 'Conformidade / regulatorios' },
    { value: 'Economico', label: 'Economico' },
    { value: 'Estrategicos', label: 'Estrategicos' },
    { value: 'Financeiros', label: 'Financeiros' },
    { value: 'Novos conhecimentos e inovacao', label: 'Novos conhecimentos e inovacao' },
    { value: 'Operacionais - Ganho Eficiencia', label: 'Operacionais - Ganho Eficiencia' },
    { value: 'Outros', label: 'Outros' },
    { value: 'Reputacionais', label: 'Reputacionais' },
    { value: 'Sociais', label: 'Sociais' },
  ];

  const classeConflitoOpts = [
    { value: 'Conflito de interesses pessoais ou grupais', label: 'Conflito de interesses pessoais ou grupais' },
    { value: 'Conflitos associados com os processos comunicacionais do grupo', label: 'Conflitos associados com os processos comunicacionais do grupo' },
    { value: 'Conflitos de percepcao do valor e/ou beneficios', label: 'Conflitos de percepcao do valor e/ou beneficios' },
    { value: 'Conflitos por diversidade cultural', label: 'Conflitos por diversidade cultural' },
    { value: 'Conflitos relacionados ao conteudo das atividades e coordenacao', label: 'Conflitos relacionados ao conteudo das atividades e coordenacao' },
    { value: 'Conflitos relacionados aos estabelecimentos de prioridades', label: 'Conflitos relacionados aos estabelecimentos de prioridades' },
    { value: 'Conflitos relacionados com a distribuicao dos beneficios', label: 'Conflitos relacionados com a distribuicao dos beneficios' },
    { value: 'Conflitos relacionados com diferencas entre expectativas e os resultados obtidos', label: 'Conflitos relacionados com diferencas entre expectativas e os resultados obtidos' },
    { value: 'Conflitos relacionados com interpretacao de dados e sistema de medicao/avaliacao', label: 'Conflitos relacionados com interpretacao de dados e sistema de medicao/avaliacao' },
    { value: 'Outros', label: 'Outros' },
  ];

  const probabilidadeRiscoOpts = [
    { value: '0-10% Muito improvavel', label: '0-10% Muito improvavel' },
    { value: '11-30% Improvavel', label: '11-30% Improvavel' },
    { value: '51-70% Provavel', label: '51-70% Provavel' },
    { value: '71-90% Muito provavel', label: '71-90% Muito provavel' },
  ];

  const classeSHOpts = [
    { value: 'Avaliador / Validador', label: 'Avaliador / Validador' },
    { value: 'Cocriador', label: 'Cocriador' },
    { value: 'Colaborador / Facilitador', label: 'Colaborador / Facilitador' },
    { value: 'Contratante', label: 'Contratante' },
    { value: 'Definidor', label: 'Definidor' },
    { value: 'Fornecedor', label: 'Fornecedor' },
    { value: 'Influenciador', label: 'Influenciador' },
    { value: 'Investidor / Patrocinador', label: 'Investidor / Patrocinador' },
    { value: 'Negociador / Mediador', label: 'Negociador / Mediador' },
    { value: 'Outros', label: 'Outros' },
    { value: 'Priorizador', label: 'Priorizador' },
    { value: 'Sustentador / Mantenedor', label: 'Sustentador / Mantenedor' },
    { value: 'Usuario / Cliente', label: 'Usuario / Cliente' },
  ];

  const poderOpts = [1,2,3,4,5].map(n => ({ value: n, label: String(n) }));

  const salienciaMax = 5 * 5 * 5;

  return (
    <div>
      <StepHeader numero={7} titulo="GADB Beneficios" descricao="Identificacao e definicao dos beneficios" />

      <div className="mb-4 flex justify-end">
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...empty }); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
          {showForm ? 'Cancelar' : '+ Novo Beneficio'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{editId ? 'Editar' : 'Novo'} Beneficio</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><FormField label="Descricao" value={form.descricao} onChange={(v) => setForm({ ...form, descricao: v })} required /></div>
            <FormField label="Valor Associado" type="select" value={form.valor_id} onChange={(v) => setForm({ ...form, valor_id: v })} options={valoresOpts} searchable />
            <FormField label="Natureza" type="select" value={form.natureza} onChange={(v) => setForm({ ...form, natureza: v })} options={naturezaOpts} />
            <FormField label="Classe de beneficios" type="select" value={form.classe} onChange={(v) => setForm({ ...form, classe: v })} options={classeOpts} />
            <FormField label="Classe de conflito" type="select" value={form.classe_conflito} onChange={(v) => setForm({ ...form, classe_conflito: v })} options={classeConflitoOpts} />
            <FormField label="Temporalidade" value={form.temporalidade} onChange={(v) => setForm({ ...form, temporalidade: v })} />
            <FormField label="Responsavel" type="select" value={form.responsavel_id} onChange={(v) => setForm({ ...form, responsavel_id: v })} options={gestoresOpts} searchable />
            <FormField label="Como sera realizado" type="textarea" value={form.como_realizar} onChange={(v) => setForm({ ...form, como_realizar: v })} maxLength={200} rows={2} />
            <FormField label="Como identificar / medir" value={form.forma_avaliacao} onChange={(v) => setForm({ ...form, forma_avaliacao: v })} maxLength={200} />
            <FormField label="Status" type="select" value={form.status_realizacao} onChange={(v) => setForm({ ...form, status_realizacao: v })}
              options={[{ value: 'Planejado', label: 'Planejado' }, { value: 'Em Andamento', label: 'Em Andamento' }, { value: 'Realizado', label: 'Realizado' }, { value: 'Nao Realizado', label: 'Nao Realizado' }]} />
            <FormField label="Quando realizar (meses)" type="number" value={form.quando_realizar} onChange={(v) => setForm({ ...form, quando_realizar: v })} />
            <FormField label="Frequencia de Revisao" value={form.frequencia_revisao} onChange={(v) => setForm({ ...form, frequencia_revisao: v })} />
            <FormField label="Proxima Revisao" type="date" value={form.proxima_revisao} onChange={(v) => setForm({ ...form, proxima_revisao: v })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="Riscos (positivos ou negativos) associados a realizacao deste beneficio" type="textarea" value={form.riscos} onChange={(v) => setForm({ ...form, riscos: v })} rows={2} />
            <FormField label="Probabilidade do risco" type="select" value={form.probabilidade_risco} onChange={(v) => setForm({ ...form, probabilidade_risco: v })} options={probabilidadeRiscoOpts} />
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editId ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}

      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)}
        actions={(row) => <button onClick={() => openDetail(row)} className="text-primary-600 hover:text-primary-800 text-sm font-medium mr-2">Detalhes</button>} />

      {detail && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Stakeholders — "{detail.descricao}"</h3>
            <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
            <div>
              <FormField label="Stakeholder" type="select" value={linkSH} onChange={setLinkSH}
                options={allStakeholders.filter(s => !(detail.stakeholders || []).find(v => v.stakeholder_id === s.id)).map(s => ({ value: s.id, label: s.nome }))} searchable />
            </div>
            <div>
              <FormField label="Papel" value={linkPersp} onChange={setLinkPersp} placeholder="Papel do stakeholder" />
            </div>
            <div>
              <FormField label="Classe" type="select" value={linkClasseSH} onChange={setLinkClasseSH} options={classeSHOpts} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4">
            <div>
              <FormField label={<PLULabel label="Poder" onClick={() => setPluModal('Poder')} />} type="select" value={linkPoder} onChange={(v) => setLinkPoder(Number(v))} options={poderOpts} />
            </div>
            <div>
              <FormField label={<PLULabel label="Legitimidade" onClick={() => setPluModal('Legitimidade')} />} type="select" value={linkLegitimidade} onChange={(v) => setLinkLegitimidade(Number(v))} options={poderOpts} />
            </div>
            <div>
              <FormField label={<PLULabel label="Urgência" onClick={() => setPluModal('Urgência')} />} type="select" value={linkUrgencia} onChange={(v) => setLinkUrgencia(Number(v))} options={poderOpts} />
            </div>
            <button onClick={handleLinkSH} disabled={!linkSH} className={`rounded-lg px-4 py-2 text-sm font-medium h-fit ${linkSH ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Vincular</button>
          </div>
          {(detail.stakeholders || []).length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex justify-end mb-2">
                <button onClick={handleRecalcSaliencia} className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg px-4 py-2 text-sm font-medium">Recalcular Saliencia</button>
              </div>
              <table className="w-full"><thead><tr className="bg-gray-50 border-b">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Papel</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Classe</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase"><PLULabel label="P" onClick={() => setPluModal('Poder')} /></th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase"><PLULabel label="L" onClick={() => setPluModal('Legitimidade')} /></th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase"><PLULabel label="U" onClick={() => setPluModal('Urgência')} /></th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase" title="Saliencia = Poder x Legitimidade x Urgencia">Saliencia (P*L*U)</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase" title="Saliencia Normalizada = (P*L*U) / 125 * 100">Saliencia Norm.</th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Acoes</th>
              </tr></thead><tbody className="divide-y">
                {detail.stakeholders.map(s => {
                  const p = s.poder || 1;
                  const l = s.legitimidade || 1;
                  const u = s.urgencia || 1;
                  const sal = p * l * u;
                  const salNorm = ((sal / salienciaMax) * 100).toFixed(1);
                  return (
                    <tr key={s.stakeholder_id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{s.stakeholder_nome || s.nome}</td>
                      <td className="px-4 py-2 text-sm">{s.papel || s.perspectiva || '-'}</td>
                      <td className="px-4 py-2 text-sm">{s.classe || '-'}</td>
                      <td className="px-4 py-2 text-sm text-center">{p}</td>
                      <td className="px-4 py-2 text-sm text-center">{l}</td>
                      <td className="px-4 py-2 text-sm text-center">{u}</td>
                      <td className="px-4 py-2 text-sm text-center font-semibold">{sal}</td>
                      <td className="px-4 py-2 text-sm text-center">{salNorm}%</td>
                      <td className="px-4 py-2 text-right"><button onClick={() => handleUnlinkSH(s.stakeholder_id)} className="text-red-600 text-sm">Remover</button></td>
                    </tr>
                  );
                })}
              </tbody></table>
            </div>
          ) : <p className="text-gray-400 text-sm">Nenhum stakeholder vinculado.</p>}
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          <span>{toast.type === 'error' ? '✕' : '✓'}</span>
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-gray-600">&times;</button>
        </div>
      )}

      <PLUInfoModal field={pluModal} onClose={() => setPluModal(null)} />

      <ConfirmDialog open={!!deleteTarget} title="Excluir Beneficio" message={`Deseja excluir "${deleteTarget?.descricao}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

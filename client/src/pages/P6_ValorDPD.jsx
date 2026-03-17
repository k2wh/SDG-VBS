import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { valores, stakeholders as stakeholdersApi } from '../services/api';

const empty = { descricao: '', tipo: '', natureza: '', temporalidade: '', conflitos: '', riscos: '', criterios_mensuracao: '', frequencia_revisao: '', proxima_revisao: '', classe_valor: '', classe_conflito: '', probabilidade_risco: '' };

const classeValorOptions = [
  { value: 'Valor ambiental e de sustentabilidade', label: 'Valor ambiental e de sustentabilidade' },
  { value: 'Valor de conformidade/regulatório', label: 'Valor de conformidade/regulatório' },
  { value: 'Valor do conhecimento e inovação', label: 'Valor do conhecimento e inovação' },
  { value: 'Valor econômico agregado', label: 'Valor econômico agregado' },
  { value: 'Valor estratégico', label: 'Valor estratégico' },
  { value: 'Valor financeiro', label: 'Valor financeiro' },
  { value: 'Valor intangível / subjetivo', label: 'Valor intangível / subjetivo' },
  { value: 'Valor operacional', label: 'Valor operacional' },
  { value: 'Valor para cliente/usuário final', label: 'Valor para cliente/usuário final' },
  { value: 'Valor percebido pelo stakeholders', label: 'Valor percebido pelo stakeholders' },
  { value: 'Valor Social', label: 'Valor Social' },
  { value: 'Valor mercadológico ou reputacional', label: 'Valor mercadológico ou reputacional' },
  { value: 'Outros', label: 'Outros' },
];

const classeConflitoOptions = [
  { value: 'Conflito de interesses pessoais ou grupais', label: 'Conflito de interesses pessoais ou grupais' },
  { value: 'Conflitos associados com os processos comunicacionais do grupo', label: 'Conflitos associados com os processos comunicacionais do grupo' },
  { value: 'Conflitos de percepção do valor e/ou benefícios', label: 'Conflitos de percepção do valor e/ou benefícios' },
  { value: 'Conflitos por diversidade cultural', label: 'Conflitos por diversidade cultural' },
  { value: 'Conflitos relacionados ao conteúdo das atividades e coordenação', label: 'Conflitos relacionados ao conteúdo das atividades e coordenação' },
  { value: 'Conflitos relacionados aos estabelecimentos de prioridades', label: 'Conflitos relacionados aos estabelecimentos de prioridades' },
  { value: 'Conflitos relacionados com a distribuição dos benefícios', label: 'Conflitos relacionados com a distribuição dos benefícios' },
  { value: 'Conflitos relacionados com diferenças entre expectativas e os resultados obtidos', label: 'Conflitos relacionados com diferenças entre expectativas e os resultados obtidos' },
  { value: 'Conflitos relacionados com interpretação de dados e sistema de medição/avaliação', label: 'Conflitos relacionados com interpretação de dados e sistema de medição/avaliação' },
  { value: 'Outros', label: 'Outros' },
];

const probabilidadeRiscoOptions = [
  { value: '0–10% Muito improvável', label: '0–10% Muito improvável' },
  { value: '11–30% Improvável', label: '11–30% Improvável' },
  { value: '51–70% Provável', label: '51–70% Provável' },
  { value: '71–90% Muito provável', label: '71–90% Muito provável' },
];

const classeSHOptions = [
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
  { value: 'Usuário / Cliente', label: 'Usuário / Cliente' },
];

const salienciaScaleOptions = [
  { value: 1, label: '1 - Muito baixa' },
  { value: 2, label: '2 - Baixa' },
  { value: 3, label: '3 - Moderada' },
  { value: 4, label: '4 - Alta' },
  { value: 5, label: '5 - Muito alta' },
];

export default function P6_ValorDPD({ projetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [allStakeholders, setAllStakeholders] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detail, setDetail] = useState(null);
  const [linkSH, setLinkSH] = useState('');
  const [linkPersp, setLinkPersp] = useState('');
  const [toast, setToast] = useState(null);
  const [linkClasseSH, setLinkClasseSH] = useState('');
  const [linkPoder, setLinkPoder] = useState(1);
  const [linkLegitimidade, setLinkLegitimidade] = useState(1);
  const [linkUrgencia, setLinkUrgencia] = useState(1);

  const load = () => {
    if (!projetoAtivo) return;
    valores.listByProjeto(projetoAtivo).then(setLista);
    stakeholdersApi.list().then(setAllStakeholders);
  };
  useEffect(() => { load(); }, [projetoAtivo]);

  if (!projetoAtivo) return <div><StepHeader numero={6} titulo="DPD Valor" descricao="Diagnóstico e planejamento do valor" /><EmptyState /></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await valores.update(editId, form);
    } else {
      await valores.create({ ...form, projeto_id: projetoAtivo });
    }
    setForm({ ...empty });
    setEditId(null);
    setShowForm(false);
    load();
  };

  const handleEdit = (row) => {
    setForm({ descricao: row.descricao, tipo: row.tipo, natureza: row.natureza, temporalidade: row.temporalidade, conflitos: row.conflitos, riscos: row.riscos, criterios_mensuracao: row.criterios_mensuracao, frequencia_revisao: row.frequencia_revisao, proxima_revisao: row.proxima_revisao, classe_valor: row.classe_valor || '', classe_conflito: row.classe_conflito || '', probabilidade_risco: row.probabilidade_risco || '' });
    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await valores.remove(deleteTarget.id);
    setDeleteTarget(null);
    setDetail(null);
    load();
  };

  const openDetail = async (row) => {
    const d = await valores.get(row.id);
    setDetail(d);
  };

  const handleLinkSH = async () => {
    if (!linkSH || !detail) return;
    try {
      await valores.addStakeholder(detail.id, { stakeholder_id: Number(linkSH), perspectiva: linkPersp, classe_stakeholder: linkClasseSH, poder: Number(linkPoder), legitimidade: Number(linkLegitimidade), urgencia: Number(linkUrgencia) });
      setLinkSH('');
      setLinkPersp('');
      setLinkClasseSH('');
      setLinkPoder(1);
      setLinkLegitimidade(1);
      setLinkUrgencia(1);
      openDetail(detail);
      setToast({ type: 'success', msg: 'Stakeholder vinculado com sucesso' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', msg: err.message });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleUnlinkSH = async (sid) => {
    await valores.removeStakeholder(detail.id, sid);
    openDetail(detail);
  };

  const handleRecalcularSaliencia = async () => {
    if (!detail) return;
    try {
      await valores.recalcularSaliencia(detail.id);
      openDetail(detail);
      setToast({ type: 'success', msg: 'Saliência recalculada com sucesso' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: 'error', msg: err.message });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const columns = [
    { key: 'descricao', label: 'Descrição do Valor' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'natureza', label: 'Natureza' },
    { key: 'temporalidade', label: 'Temporalidade', render: (v) => v ? <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">{v}</span> : '-' },
  ];

  return (
    <div>
      <StepHeader numero={6} titulo="DPD Valor" descricao="Diagnóstico e planejamento do valor" />

      <div className="mb-4 flex justify-end">
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...empty }); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
          {showForm ? 'Cancelar' : '+ Novo Valor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{editId ? 'Editar' : 'Novo'} Valor</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3"><FormField label="Descrição" value={form.descricao} onChange={(v) => setForm({ ...form, descricao: v })} required /></div>
            <FormField label="Tipo" value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })} />
            <FormField label="Natureza" type="select" value={form.natureza} onChange={(v) => setForm({ ...form, natureza: v })}
              options={[{ value: 'Tangível', label: 'Tangível' }, { value: 'Intangível', label: 'Intangível' }]} />
            <FormField label="Classe de valor" type="select" value={form.classe_valor} onChange={(v) => setForm({ ...form, classe_valor: v })}
              options={classeValorOptions} />
            <FormField label="Temporalidade" type="select" value={form.temporalidade} onChange={(v) => setForm({ ...form, temporalidade: v })}
              options={[{ value: 'Ex-ante', label: 'Ex-ante' }, { value: 'Emergente', label: 'Emergente' }, { value: 'Adaptativa', label: 'Adaptativa' }]} />
            <FormField label="Frequência de Revisão" value={form.frequencia_revisao} onChange={(v) => setForm({ ...form, frequencia_revisao: v })} placeholder="Ex: Mensal" />
            <FormField label="Próxima Revisão" type="date" value={form.proxima_revisao} onChange={(v) => setForm({ ...form, proxima_revisao: v })} />
            <FormField label="Critérios de Mensuração" value={form.criterios_mensuracao} onChange={(v) => setForm({ ...form, criterios_mensuracao: v })} />
            <FormField label="Probabilidade do risco" type="select" value={form.probabilidade_risco} onChange={(v) => setForm({ ...form, probabilidade_risco: v })}
              options={probabilidadeRiscoOptions} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="Possível conflito associado ao valor" type="textarea" value={form.conflitos} onChange={(v) => setForm({ ...form, conflitos: v })} rows={2} />
            <FormField label="Riscos (positivos ou negativos) associados à criação do valor" type="textarea" value={form.riscos} onChange={(v) => setForm({ ...form, riscos: v })} rows={2} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="Classe de conflito" type="select" value={form.classe_conflito} onChange={(v) => setForm({ ...form, classe_conflito: v })}
              options={classeConflitoOptions} />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <FormField label="Stakeholder" type="select" value={linkSH} onChange={setLinkSH}
                options={allStakeholders.filter(s => !(detail.stakeholders || []).find(v => v.stakeholder_id === s.id)).map(s => ({ value: s.id, label: s.nome }))} searchable />
            </div>
            <div>
              <FormField label="Perspectiva" value={linkPersp} onChange={setLinkPersp} placeholder="Como percebe este valor?" />
            </div>
            <div>
              <FormField label="Classe do stakeholder no valor" type="select" value={linkClasseSH} onChange={setLinkClasseSH}
                options={classeSHOptions} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div>
              <FormField label="Poder" type="select" value={linkPoder} onChange={(v) => setLinkPoder(Number(v))}
                options={salienciaScaleOptions} />
            </div>
            <div>
              <FormField label="Legitimidade" type="select" value={linkLegitimidade} onChange={(v) => setLinkLegitimidade(Number(v))}
                options={salienciaScaleOptions} />
            </div>
            <div>
              <FormField label="Urgência" type="select" value={linkUrgencia} onChange={(v) => setLinkUrgencia(Number(v))}
                options={salienciaScaleOptions} />
            </div>
          </div>
          <div className="mb-4 flex gap-2">
            <button onClick={handleLinkSH} disabled={!linkSH} className={`rounded-lg px-4 py-2 text-sm font-medium ${linkSH ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Vincular</button>
            <button onClick={handleRecalcularSaliencia} className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 py-2 text-sm font-medium">Recalcular Saliência</button>
          </div>
          {(detail.stakeholders || []).length > 0 ? (
            <div className="overflow-x-auto">
            <table className="w-full"><thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Perspectiva</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Classe</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase" title="Considerando sua percepção geral, em que medida este stakeholder possui capacidade de influenciar recursos estratégicos, decisões críticas, governança e resultados do projeto?">Poder</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase" title="Considerando sua percepção geral, em que medida as reivindicações deste stakeholder são percebidas como apropriadas, adequadas e desejáveis no contexto do projeto?">Legitimidade</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase" title="Considerando sua percepção geral, em que medida as demandas deste stakeholder exigem atenção imediata, exercem pressão significativa nos prazos?">Urgência</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Saliência</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Saliência Normalizada</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
            </tr></thead><tbody className="divide-y">
              {detail.stakeholders.map(s => (
                <tr key={s.stakeholder_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{s.stakeholder_nome}</td>
                  <td className="px-4 py-2 text-sm">{s.perspectiva || '-'}</td>
                  <td className="px-4 py-2 text-sm">{s.classe_stakeholder || '-'}</td>
                  <td className="px-4 py-2 text-sm">{s.poder || 0}</td>
                  <td className="px-4 py-2 text-sm">{s.legitimidade || 0}</td>
                  <td className="px-4 py-2 text-sm">{s.urgencia || 0}</td>
                  <td className="px-4 py-2 text-sm">{(s.poder || 0) * (s.legitimidade || 0) * (s.urgencia || 0)}</td>
                  <td className="px-4 py-2 text-sm">{s.saliencia_normalizada != null ? Number(s.saliencia_normalizada).toFixed(3) : '-'}</td>
                  <td className="px-4 py-2 text-right"><button onClick={() => handleUnlinkSH(s.stakeholder_id)} className="text-red-600 text-sm">Remover</button></td>
                </tr>
              ))}
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

      <ConfirmDialog open={!!deleteTarget} title="Excluir Valor" message={`Deseja excluir "${deleteTarget?.descricao}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

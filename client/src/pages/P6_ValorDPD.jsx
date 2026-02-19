import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { valores, stakeholders as stakeholdersApi } from '../services/api';

const empty = { descricao: '', tipo: '', natureza: '', temporalidade: '', conflitos: '', riscos: '', criterios_mensuracao: '', frequencia_revisao: '', proxima_revisao: '' };

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
    setForm({ descricao: row.descricao, tipo: row.tipo, natureza: row.natureza, temporalidade: row.temporalidade, conflitos: row.conflitos, riscos: row.riscos, criterios_mensuracao: row.criterios_mensuracao, frequencia_revisao: row.frequencia_revisao, proxima_revisao: row.proxima_revisao });
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
    await valores.addStakeholder(detail.id, { stakeholder_id: Number(linkSH), perspectiva: linkPersp });
    setLinkSH('');
    setLinkPersp('');
    openDetail(detail);
  };

  const handleUnlinkSH = async (sid) => {
    await valores.removeStakeholder(detail.id, sid);
    openDetail(detail);
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

      <div className="mb-4">
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
            <FormField label="Natureza" value={form.natureza} onChange={(v) => setForm({ ...form, natureza: v })} />
            <FormField label="Temporalidade" type="select" value={form.temporalidade} onChange={(v) => setForm({ ...form, temporalidade: v })}
              options={[{ value: 'Ex-ante', label: 'Ex-ante' }, { value: 'Emergente', label: 'Emergente' }, { value: 'Adaptativa', label: 'Adaptativa' }]} />
            <FormField label="Frequência de Revisão" value={form.frequencia_revisao} onChange={(v) => setForm({ ...form, frequencia_revisao: v })} placeholder="Ex: Mensal" />
            <FormField label="Próxima Revisão" type="date" value={form.proxima_revisao} onChange={(v) => setForm({ ...form, proxima_revisao: v })} />
            <FormField label="Critérios de Mensuração" value={form.criterios_mensuracao} onChange={(v) => setForm({ ...form, criterios_mensuracao: v })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="Conflitos" type="textarea" value={form.conflitos} onChange={(v) => setForm({ ...form, conflitos: v })} rows={2} />
            <FormField label="Riscos" type="textarea" value={form.riscos} onChange={(v) => setForm({ ...form, riscos: v })} rows={2} />
          </div>
          <div className="mt-4">
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
          <div className="flex gap-3 items-end mb-4">
            <div className="flex-1">
              <FormField label="Stakeholder" type="select" value={linkSH} onChange={setLinkSH}
                options={allStakeholders.filter(s => !(detail.stakeholders || []).find(v => v.stakeholder_id === s.id)).map(s => ({ value: s.id, label: s.nome }))} searchable />
            </div>
            <div className="flex-1">
              <FormField label="Perspectiva" value={linkPersp} onChange={setLinkPersp} placeholder="Como percebe este valor?" />
            </div>
            <button onClick={handleLinkSH} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium h-fit">Vincular</button>
          </div>
          {(detail.stakeholders || []).length > 0 ? (
            <table className="w-full"><thead><tr className="bg-gray-50 border-b">
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Perspectiva</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
            </tr></thead><tbody className="divide-y">
              {detail.stakeholders.map(s => (
                <tr key={s.stakeholder_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{s.stakeholder_nome}</td>
                  <td className="px-4 py-2 text-sm">{s.perspectiva || '-'}</td>
                  <td className="px-4 py-2 text-right"><button onClick={() => handleUnlinkSH(s.stakeholder_id)} className="text-red-600 text-sm">Remover</button></td>
                </tr>
              ))}
            </tbody></table>
          ) : <p className="text-gray-400 text-sm">Nenhum stakeholder vinculado.</p>}
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Excluir Valor" message={`Deseja excluir "${deleteTarget?.descricao}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

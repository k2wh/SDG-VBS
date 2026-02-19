import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { propagacoes, beneficios, stakeholders as stakeholdersApi } from '../services/api';

const empty = { beneficio_id: '', stakeholder_origem_id: '', stakeholder_destino_id: '', tipo_propagacao: '', efeitos_colaterais: '', tendencia: '', observacoes: '' };

export default function P8_Propagacao({ projetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [beneficiosList, setBeneficiosList] = useState([]);
  const [shList, setShList] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    if (!projetoAtivo) return;
    propagacoes.listByProjeto(projetoAtivo).then(setLista);
    beneficios.listByProjeto(projetoAtivo).then(setBeneficiosList);
    stakeholdersApi.list().then(setShList);
  };
  useEffect(() => { load(); }, [projetoAtivo]);

  if (!projetoAtivo) return <div><StepHeader numero={8} titulo="Propagação" descricao="Análise da propagação e evolução dos benefícios" /><EmptyState /></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await propagacoes.update(editId, form);
    } else {
      await propagacoes.create(form);
    }
    setForm({ ...empty });
    setEditId(null);
    setShowForm(false);
    load();
  };

  const handleEdit = (row) => {
    setForm({ beneficio_id: row.beneficio_id, stakeholder_origem_id: row.stakeholder_origem_id, stakeholder_destino_id: row.stakeholder_destino_id, tipo_propagacao: row.tipo_propagacao, efeitos_colaterais: row.efeitos_colaterais, tendencia: row.tendencia, observacoes: row.observacoes });
    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await propagacoes.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const columns = [
    { key: 'beneficio_descricao', label: 'Benefício' },
    { key: 'stakeholder_origem_nome', label: 'Origem' },
    { key: 'stakeholder_destino_nome', label: 'Destino' },
    { key: 'tipo_propagacao', label: 'Tipo', render: (v) => v ? <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">{v}</span> : '-' },
    { key: 'tendencia', label: 'Tendência', render: (v) => (
      <span className={`text-xs font-medium ${v === 'Crescimento' ? 'text-green-600' : v === 'Redução' ? 'text-red-600' : 'text-gray-600'}`}>{v || '-'}</span>
    )},
  ];

  const beneficiosOpts = beneficiosList.map(b => ({ value: b.id, label: b.descricao }));
  const shOpts = shList.map(s => ({ value: s.id, label: s.nome }));

  return (
    <div>
      <StepHeader numero={8} titulo="Propagação" descricao="Análise da propagação e evolução dos benefícios" />

      <div className="mb-4">
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...empty }); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
          {showForm ? 'Cancelar' : '+ Nova Propagação'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{editId ? 'Editar' : 'Nova'} Propagação</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Benefício" type="select" value={form.beneficio_id} onChange={(v) => setForm({ ...form, beneficio_id: v })} options={beneficiosOpts} required searchable />
            <FormField label="Stakeholder Origem" type="select" value={form.stakeholder_origem_id} onChange={(v) => setForm({ ...form, stakeholder_origem_id: v })} options={shOpts} required searchable />
            <FormField label="Stakeholder Destino" type="select" value={form.stakeholder_destino_id} onChange={(v) => setForm({ ...form, stakeholder_destino_id: v })} options={shOpts} required searchable />
            <FormField label="Tipo de Propagação" type="select" value={form.tipo_propagacao} onChange={(v) => setForm({ ...form, tipo_propagacao: v })}
              options={[{ value: 'Adoção', label: 'Adoção' }, { value: 'Expansão', label: 'Expansão' }, { value: 'Estabilização', label: 'Estabilização' }, { value: 'Resistência', label: 'Resistência' }, { value: 'Adaptação', label: 'Adaptação' }]} />
            <FormField label="Tendência" type="select" value={form.tendencia} onChange={(v) => setForm({ ...form, tendencia: v })}
              options={[{ value: 'Crescimento', label: 'Crescimento' }, { value: 'Estável', label: 'Estável' }, { value: 'Redução', label: 'Redução' }]} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="Efeitos Colaterais" type="textarea" value={form.efeitos_colaterais} onChange={(v) => setForm({ ...form, efeitos_colaterais: v })} rows={2} />
            <FormField label="Observações" type="textarea" value={form.observacoes} onChange={(v) => setForm({ ...form, observacoes: v })} rows={2} />
          </div>
          <div className="mt-4">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editId ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}

      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)} />

      <ConfirmDialog open={!!deleteTarget} title="Excluir Propagação" message="Deseja excluir esta propagação?"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

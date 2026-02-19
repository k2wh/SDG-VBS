import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { sinergias, beneficios } from '../services/api';

const empty = { beneficio_a_id: '', beneficio_b_id: '', tipo_relacao: '', descricao: '', impacto: '' };

export default function P9_Sinergia({ projetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [beneficiosList, setBeneficiosList] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    if (!projetoAtivo) return;
    sinergias.listByProjeto(projetoAtivo).then(setLista);
    beneficios.listByProjeto(projetoAtivo).then(setBeneficiosList);
  };
  useEffect(() => { load(); }, [projetoAtivo]);

  if (!projetoAtivo) return <div><StepHeader numero={9} titulo="Sinergias" descricao="Análise de sinergia entre benefícios" /><EmptyState /></div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await sinergias.update(editId, form);
    } else {
      await sinergias.create(form);
    }
    setForm({ ...empty });
    setEditId(null);
    setShowForm(false);
    load();
  };

  const handleEdit = (row) => {
    setForm({ beneficio_a_id: row.beneficio_a_id, beneficio_b_id: row.beneficio_b_id, tipo_relacao: row.tipo_relacao, descricao: row.descricao, impacto: row.impacto });
    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await sinergias.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const tipoColors = {
    'Sinergia': 'bg-green-100 text-green-800',
    'Complementaridade': 'bg-blue-100 text-blue-800',
    'Dependência': 'bg-yellow-100 text-yellow-800',
    'Competição': 'bg-red-100 text-red-800',
    'Neutralização': 'bg-gray-100 text-gray-800',
  };

  const columns = [
    { key: 'beneficio_a_descricao', label: 'Benefício A' },
    { key: 'beneficio_b_descricao', label: 'Benefício B' },
    { key: 'tipo_relacao', label: 'Tipo de Relação', render: (v) => v ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tipoColors[v] || ''}`}>{v}</span> : '-' },
    { key: 'impacto', label: 'Impacto' },
  ];

  const beneficiosOpts = beneficiosList.map(b => ({ value: b.id, label: b.descricao }));

  return (
    <div>
      <StepHeader numero={9} titulo="Sinergias" descricao="Análise de sinergia entre benefícios" />

      <div className="mb-4 flex justify-end">
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...empty }); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
          {showForm ? 'Cancelar' : '+ Nova Sinergia'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{editId ? 'Editar' : 'Nova'} Sinergia</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Benefício A" type="select" value={form.beneficio_a_id} onChange={(v) => setForm({ ...form, beneficio_a_id: v })} options={beneficiosOpts} required searchable />
            <FormField label="Benefício B" type="select" value={form.beneficio_b_id} onChange={(v) => setForm({ ...form, beneficio_b_id: v })} options={beneficiosOpts} required searchable />
            <FormField label="Tipo de Relação" type="select" value={form.tipo_relacao} onChange={(v) => setForm({ ...form, tipo_relacao: v })}
              options={[{ value: 'Sinergia', label: 'Sinergia' }, { value: 'Complementaridade', label: 'Complementaridade' }, { value: 'Dependência', label: 'Dependência' }, { value: 'Competição', label: 'Competição' }, { value: 'Neutralização', label: 'Neutralização' }]} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="Descrição" type="textarea" value={form.descricao} onChange={(v) => setForm({ ...form, descricao: v })} rows={2} />
            <FormField label="Impacto na Maximização do Valor" type="textarea" value={form.impacto} onChange={(v) => setForm({ ...form, impacto: v })} rows={2} />
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editId ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}

      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)} />

      <ConfirmDialog open={!!deleteTarget} title="Excluir Sinergia" message="Deseja excluir esta sinergia?"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { beneficios, valores } from '../services/api';

const empty = { valor_id: '', descricao: '', natureza: '', classe: '', temporalidade: '', responsavel: '', forma_avaliacao: '', riscos: '', quando_realizar: '', como_realizar: '', frequencia_revisao: '', proxima_revisao: '', status_realizacao: 'Planejado' };

export default function P7_BeneficiosGADB({ projetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [valoresList, setValoresList] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    if (!projetoAtivo) return;
    beneficios.listByProjeto(projetoAtivo).then(setLista);
    valores.listByProjeto(projetoAtivo).then(setValoresList);
  };
  useEffect(() => { load(); }, [projetoAtivo]);

  if (!projetoAtivo) return <div><StepHeader numero={7} titulo="GADB Benefícios" descricao="Identificação e definição dos benefícios" /><EmptyState /></div>;

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
    setForm({ valor_id: row.valor_id || '', descricao: row.descricao, natureza: row.natureza, classe: row.classe, temporalidade: row.temporalidade, responsavel: row.responsavel, forma_avaliacao: row.forma_avaliacao, riscos: row.riscos, quando_realizar: row.quando_realizar, como_realizar: row.como_realizar, frequencia_revisao: row.frequencia_revisao, proxima_revisao: row.proxima_revisao, status_realizacao: row.status_realizacao });
    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await beneficios.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const columns = [
    { key: 'descricao', label: 'Benefício' },
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

  return (
    <div>
      <StepHeader numero={7} titulo="GADB Benefícios" descricao="Identificação e definição dos benefícios" />

      <div className="mb-4">
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...empty }); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
          {showForm ? 'Cancelar' : '+ Novo Benefício'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{editId ? 'Editar' : 'Novo'} Benefício</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2"><FormField label="Descrição" value={form.descricao} onChange={(v) => setForm({ ...form, descricao: v })} required /></div>
            <FormField label="Valor Associado" type="select" value={form.valor_id} onChange={(v) => setForm({ ...form, valor_id: v })} options={valoresOpts} searchable />
            <FormField label="Natureza" value={form.natureza} onChange={(v) => setForm({ ...form, natureza: v })} />
            <FormField label="Classe" value={form.classe} onChange={(v) => setForm({ ...form, classe: v })} />
            <FormField label="Temporalidade" value={form.temporalidade} onChange={(v) => setForm({ ...form, temporalidade: v })} />
            <FormField label="Responsável" value={form.responsavel} onChange={(v) => setForm({ ...form, responsavel: v })} />
            <FormField label="Forma de Avaliação" value={form.forma_avaliacao} onChange={(v) => setForm({ ...form, forma_avaliacao: v })} />
            <FormField label="Status" type="select" value={form.status_realizacao} onChange={(v) => setForm({ ...form, status_realizacao: v })}
              options={[{ value: 'Planejado', label: 'Planejado' }, { value: 'Em Andamento', label: 'Em Andamento' }, { value: 'Realizado', label: 'Realizado' }, { value: 'Não Realizado', label: 'Não Realizado' }]} />
            <FormField label="Quando Realizar" value={form.quando_realizar} onChange={(v) => setForm({ ...form, quando_realizar: v })} />
            <FormField label="Frequência de Revisão" value={form.frequencia_revisao} onChange={(v) => setForm({ ...form, frequencia_revisao: v })} />
            <FormField label="Próxima Revisão" type="date" value={form.proxima_revisao} onChange={(v) => setForm({ ...form, proxima_revisao: v })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="Como Realizar" type="textarea" value={form.como_realizar} onChange={(v) => setForm({ ...form, como_realizar: v })} rows={2} />
            <FormField label="Riscos" type="textarea" value={form.riscos} onChange={(v) => setForm({ ...form, riscos: v })} rows={2} />
          </div>
          <div className="mt-4">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editId ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}

      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)} />

      <ConfirmDialog open={!!deleteTarget} title="Excluir Benefício" message={`Deseja excluir "${deleteTarget?.descricao}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

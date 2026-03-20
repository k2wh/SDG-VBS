import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';
import { organizacoes } from '../services/api';

const emptyForm = { nome: '', segmento: '', resumo_estrategico: '', horizonte_temporal: '' };

export default function P2_Organizacao() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => organizacoes.list().then(setLista);
  useEffect(() => { load(); }, []);

  const closeModal = () => { setShowForm(false); setEditId(null); setForm({ ...emptyForm }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await organizacoes.update(editId, form);
    } else {
      await organizacoes.create(form);
    }
    closeModal();
    load();
  };

  const handleEdit = (row) => {
    setForm({ nome: row.nome, segmento: row.segmento, resumo_estrategico: row.resumo_estrategico, horizonte_temporal: row.horizonte_temporal });
    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await organizacoes.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'segmento', label: 'Segmento' },
    { key: 'horizonte_temporal', label: 'Horizonte Temporal' },
  ];

  return (
    <div>
      <StepHeader numero={2} titulo="Organização" descricao="Registro da organização e resumo do plano estratégico" />

      <div className="mb-4 flex justify-end">
        <button onClick={() => { setEditId(null); setForm({ ...emptyForm }); setShowForm(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          + Nova Organização
        </button>
      </div>

      <FormModal open={showForm} onClose={closeModal} title={editId ? 'Editar Organização' : 'Nova Organização'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
            <FormField label="Segmento" value={form.segmento} onChange={(v) => setForm({ ...form, segmento: v })} />
            <FormField label="Horizonte Temporal" value={form.horizonte_temporal} onChange={(v) => setForm({ ...form, horizonte_temporal: v })} placeholder="Ex: 2024-2028" />
          </div>
          <FormField label="Alinhamento / direcionador Estratégico do Projeto" type="textarea" value={form.resumo_estrategico} onChange={(v) => setForm({ ...form, resumo_estrategico: v })} rows={4} placeholder="Registre aqui como este projeto está alinhado com a estratégia" />
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancelar</button>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editId ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </FormModal>

      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)} />

      <ConfirmDialog open={!!deleteTarget} title="Excluir Organização"
        message={`Deseja excluir "${deleteTarget?.nome}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

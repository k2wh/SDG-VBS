import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';
import { gestores } from '../services/api';

const empty = { nome: '', cargo: '', departamento: '', email: '', telefone: '' };

export default function P3_Gestores() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => gestores.list().then(setLista);
  useEffect(() => { load(); }, []);

  const closeModal = () => { setShowForm(false); setEditId(null); setForm({ ...empty }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await gestores.update(editId, form);
    } else {
      await gestores.create(form);
    }
    closeModal();
    load();
  };

  const handleEdit = (row) => {
    setForm({ nome: row.nome, cargo: row.cargo, departamento: row.departamento, email: row.email, telefone: row.telefone });
    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await gestores.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'departamento', label: 'Departamento' },
    { key: 'email', label: 'Email' },
    { key: 'telefone', label: 'Telefone' },
  ];

  return (
    <div>
      <StepHeader numero={3} titulo="Gestores" descricao="Cadastro de gestores, patrocinadores e responsáveis" />

      <div className="mb-4 flex justify-end">
        <button onClick={() => { setEditId(null); setForm({ ...empty }); setShowForm(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          + Novo Gestor
        </button>
      </div>

      <FormModal open={showForm} onClose={closeModal} title={editId ? 'Editar Gestor' : 'Novo Gestor'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
            <FormField label="Cargo" value={form.cargo} onChange={(v) => setForm({ ...form, cargo: v })} />
            <FormField label="Departamento" value={form.departamento} onChange={(v) => setForm({ ...form, departamento: v })} />
            <FormField label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <FormField label="Telefone" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} mask="telefone" />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancelar</button>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editId ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </FormModal>

      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)} />

      <ConfirmDialog open={!!deleteTarget} title="Excluir Gestor"
        message={`Deseja excluir "${deleteTarget?.nome}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

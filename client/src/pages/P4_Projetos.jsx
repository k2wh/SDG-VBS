import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import { projetos, organizacoes, gestores as gestoresApi } from '../services/api';

const empty = { organizacao_id: '', codigo: '', nome: '', objetivo: '', duracao: '', status: 'Planejamento', gestor_id: '', patrocinador_id: '', responsavel_id: '', area_responsavel: '', abordagem_gestao: '', vinculo_acao: '' };

export default function P4_Projetos({ setProjetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [gestores, setGestores] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    projetos.list().then(setLista);
    organizacoes.list().then(setOrgs);
    gestoresApi.list().then(setGestores);
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await projetos.update(editId, form);
    } else {
      await projetos.create(form);
    }
    setForm({ ...empty });
    setEditId(null);
    setShowForm(false);
    load();
    window.dispatchEvent(new Event('projetos-updated'));
  };

  const handleEdit = (row) => {
    setForm({
      organizacao_id: row.organizacao_id || '', codigo: row.codigo, nome: row.nome, objetivo: row.objetivo,
      duracao: row.duracao, status: row.status, gestor_id: row.gestor_id || '', patrocinador_id: row.patrocinador_id || '',
      responsavel_id: row.responsavel_id || '', area_responsavel: row.area_responsavel, abordagem_gestao: row.abordagem_gestao, vinculo_acao: row.vinculo_acao
    });
    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await projetos.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
    window.dispatchEvent(new Event('projetos-updated'));
  };

  const gestoresOpts = gestores.map(g => ({ value: g.id, label: `${g.nome}${g.cargo ? ` (${g.cargo})` : ''}` }));
  const orgsOpts = orgs.map(o => ({ value: o.id, label: o.nome }));

  const columns = [
    { key: 'codigo', label: 'Código' },
    { key: 'nome', label: 'Nome' },
    { key: 'status', label: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        v === 'Execução' ? 'bg-green-100 text-green-800' :
        v === 'Encerrado' ? 'bg-gray-100 text-gray-800' :
        'bg-blue-100 text-blue-800'
      }`}>{v}</span>
    )},
    { key: 'abordagem_gestao', label: 'Abordagem' },
    { key: 'gestor_nome', label: 'Gestor' },
  ];

  return (
    <div>
      <StepHeader numero={4} titulo="Projetos" descricao="Cadastro de projetos — elemento central do sistema" />

      <div className="mb-4 flex justify-end">
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...empty }); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          {showForm ? 'Cancelar' : '+ Novo Projeto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{editId ? 'Editar' : 'Novo'} Projeto</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Código" value={form.codigo} onChange={(v) => setForm({ ...form, codigo: v })} required placeholder="Ex: PRJ-001" mask="codigo" />
            <FormField label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
            <FormField label="Organização" type="select" value={form.organizacao_id} onChange={(v) => setForm({ ...form, organizacao_id: v })} options={orgsOpts} searchable />
            <FormField label="Status" type="select" value={form.status} onChange={(v) => setForm({ ...form, status: v })}
              options={[{ value: 'Planejamento', label: 'Planejamento' }, { value: 'Execução', label: 'Execução' }, { value: 'Encerrado', label: 'Encerrado' }]} />
            <FormField label="Abordagem de Gestão" type="select" value={form.abordagem_gestao} onChange={(v) => setForm({ ...form, abordagem_gestao: v })}
              options={[{ value: 'Preditiva', label: 'Preditiva' }, { value: 'Iterativa', label: 'Iterativa' }, { value: 'Híbrida', label: 'Híbrida' }]} />
            <FormField label="Duração" value={form.duracao} onChange={(v) => setForm({ ...form, duracao: v })} placeholder="Ex: 12 meses" />
            <FormField label="Gestor Responsável" type="select" value={form.gestor_id} onChange={(v) => setForm({ ...form, gestor_id: v })} options={gestoresOpts} searchable />
            <FormField label="Patrocinador" type="select" value={form.patrocinador_id} onChange={(v) => setForm({ ...form, patrocinador_id: v })} options={gestoresOpts} searchable />
            <FormField label="Responsável da Área" type="select" value={form.responsavel_id} onChange={(v) => setForm({ ...form, responsavel_id: v })} options={gestoresOpts} searchable />
            <FormField label="Área Responsável" value={form.area_responsavel} onChange={(v) => setForm({ ...form, area_responsavel: v })} />
            <FormField label="Vínculo com Ação" value={form.vinculo_acao} onChange={(v) => setForm({ ...form, vinculo_acao: v })} placeholder="Opcional" />
          </div>
          <div className="mt-4">
            <FormField label="Objetivo" type="textarea" value={form.objetivo} onChange={(v) => setForm({ ...form, objetivo: v })} />
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editId ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}

      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)}
        actions={(row) => (
          <button onClick={() => setProjetoAtivo(row.id)} className="text-green-600 hover:text-green-800 text-sm font-medium mr-2">
            Selecionar
          </button>
        )}
      />

      <ConfirmDialog open={!!deleteTarget} title="Excluir Projeto"
        message={`Deseja excluir "${deleteTarget?.nome}"? Todos os dados vinculados serão perdidos.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { stakeholders as api, projetos } from '../services/api';

const empty = { nome: '', papel: '', tipo: '', origem: '', interesses: '', contato: '', poder: 1, legitimidade: 1, urgencia: 1 };

export default function P5_Stakeholders({ projetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [vinculados, setVinculados] = useState([]);
  const [linkStakeholder, setLinkStakeholder] = useState('');
  const [linkPapel, setLinkPapel] = useState('');

  const load = () => {
    api.list().then(setLista);
    if (projetoAtivo) {
      projetos.get(projetoAtivo).then(p => setVinculados(p.stakeholders || []));
    }
  };
  useEffect(() => { load(); }, [projetoAtivo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.update(editId, form);
    } else {
      await api.create(form);
    }
    setForm({ ...empty });
    setEditId(null);
    setShowForm(false);
    load();
  };

  const handleEdit = (row) => {
    setForm({ nome: row.nome, papel: row.papel, tipo: row.tipo, origem: row.origem, interesses: row.interesses, contato: row.contato, poder: row.poder, legitimidade: row.legitimidade, urgencia: row.urgencia });
    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await api.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const handleLink = async () => {
    if (!linkStakeholder) return;
    await projetos.addStakeholder(projetoAtivo, { stakeholder_id: Number(linkStakeholder), papel_no_projeto: linkPapel });
    setLinkStakeholder('');
    setLinkPapel('');
    load();
  };

  const handleUnlink = async (sid) => {
    await projetos.removeStakeholder(projetoAtivo, sid);
    load();
  };

  const renderSaliencia = (val) => {
    const colors = ['', 'bg-gray-200', 'bg-blue-200', 'bg-yellow-200', 'bg-orange-200', 'bg-red-200'];
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[val] || ''}`}>{val}/5</span>;
  };

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'papel', label: 'Papel' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'poder', label: 'Poder', render: renderSaliencia },
    { key: 'legitimidade', label: 'Legitimidade', render: renderSaliencia },
    { key: 'urgencia', label: 'Urgência', render: renderSaliencia },
  ];

  const nivelOptions = [1,2,3,4,5].map(n => ({ value: n, label: `${n}` }));

  return (
    <div>
      <StepHeader numero={5} titulo="Stakeholders" descricao="Cadastro central de stakeholders e avaliação de saliência" />

      <div className="mb-4">
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...empty }); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          {showForm ? 'Cancelar' : '+ Novo Stakeholder'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{editId ? 'Editar' : 'Novo'} Stakeholder</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Nome" value={form.nome} onChange={(v) => setForm({ ...form, nome: v })} required />
            <FormField label="Papel" value={form.papel} onChange={(v) => setForm({ ...form, papel: v })} />
            <FormField label="Tipo" type="select" value={form.tipo} onChange={(v) => setForm({ ...form, tipo: v })}
              options={[{ value: 'Interno', label: 'Interno' }, { value: 'Externo', label: 'Externo' }]} />
            <FormField label="Origem" value={form.origem} onChange={(v) => setForm({ ...form, origem: v })} />
            <FormField label="Contato" value={form.contato} onChange={(v) => setForm({ ...form, contato: v })} mask="telefone" />
            <FormField label="Poder (1-5)" type="select" value={form.poder} onChange={(v) => setForm({ ...form, poder: Number(v) })} options={nivelOptions} />
            <FormField label="Legitimidade (1-5)" type="select" value={form.legitimidade} onChange={(v) => setForm({ ...form, legitimidade: Number(v) })} options={nivelOptions} />
            <FormField label="Urgência (1-5)" type="select" value={form.urgencia} onChange={(v) => setForm({ ...form, urgencia: Number(v) })} options={nivelOptions} />
          </div>
          <div className="mt-4">
            <FormField label="Interesses" type="textarea" value={form.interesses} onChange={(v) => setForm({ ...form, interesses: v })} />
          </div>
          <div className="mt-4">
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editId ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}

      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)} />

      {projetoAtivo && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Stakeholders vinculados ao Projeto</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <FormField label="Stakeholder" type="select" value={linkStakeholder} onChange={setLinkStakeholder}
                  options={lista.filter(s => !vinculados.find(v => v.stakeholder_id === s.id)).map(s => ({ value: s.id, label: s.nome }))} searchable />
              </div>
              <div className="flex-1">
                <FormField label="Papel no Projeto" value={linkPapel} onChange={setLinkPapel} placeholder="Opcional" />
              </div>
              <button onClick={handleLink} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium h-fit">
                Vincular
              </button>
            </div>
          </div>
          {vinculados.length > 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead><tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Papel no Projeto</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {vinculados.map(v => (
                    <tr key={v.stakeholder_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{v.stakeholder_nome || v.nome}</td>
                      <td className="px-4 py-3 text-sm">{v.stakeholder_tipo || v.tipo}</td>
                      <td className="px-4 py-3 text-sm">{v.papel_no_projeto || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleUnlink(v.stakeholder_id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Desvincular</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Nenhum stakeholder vinculado a este projeto.</p>
          )}
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Excluir Stakeholder"
        message={`Deseja excluir "${deleteTarget?.nome}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

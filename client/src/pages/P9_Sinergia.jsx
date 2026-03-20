import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';
import EmptyState from '../components/EmptyState';
import { sinergias, beneficios } from '../services/api';

const empty = { beneficio_a_id: '', beneficio_b_id: '', tipo_relacao: '', justificativa_outros: '', descricao: '', impacto: '' };

const tipoRelacaoOptions = [
  { value: 'Reforço', label: 'Reforço - os benefícios se reforçam mutuamente' },
  { value: 'Complementaridade', label: 'Complementaridade - benefícios que se completam' },
  { value: 'Dependência funcional', label: 'Dependência funcional - útil se outros benefícios forem realizados' },
  { value: 'Estrutural', label: 'Estrutural - dependência com estruturas da organização' },
  { value: 'Sequencial', label: 'Sequencial - predecessor ou sucessor de outros benefícios' },
  { value: 'Escala', label: 'Escala - cresce quando outros benefícios são alcançados' },
  { value: 'Dinâmica', label: 'Dinâmica - ciclo de retroalimentação com outros benefícios' },
  { value: 'Emergente', label: 'Emergente - surge da interação entre outros benefícios' },
  { value: 'Evolutiva', label: 'Evolutiva - modificações acarretam mudanças em outros' },
  { value: 'Ambiental', label: 'Ambiental - influenciado pelo contexto externo' },
  { value: 'Antagônica', label: 'Antagônica - conflita com um ou mais benefícios' },
  { value: 'Outros', label: 'Outros' },
];

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

  const closeModal = () => { setShowForm(false); setEditId(null); setForm({ ...empty }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await sinergias.update(editId, form);
    } else {
      await sinergias.create(form);
    }
    closeModal();
    load();
  };

  const handleEdit = (row) => {
    setForm({ beneficio_a_id: row.beneficio_a_id, beneficio_b_id: row.beneficio_b_id, tipo_relacao: row.tipo_relacao, justificativa_outros: row.justificativa_outros || '', descricao: row.descricao, impacto: row.impacto });
    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await sinergias.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const tipoColors = {
    'Reforço': 'bg-green-100 text-green-800',
    'Complementaridade': 'bg-blue-100 text-blue-800',
    'Dependência funcional': 'bg-yellow-100 text-yellow-800',
    'Estrutural': 'bg-purple-100 text-purple-800',
    'Sequencial': 'bg-indigo-100 text-indigo-800',
    'Escala': 'bg-teal-100 text-teal-800',
    'Dinâmica': 'bg-cyan-100 text-cyan-800',
    'Emergente': 'bg-lime-100 text-lime-800',
    'Evolutiva': 'bg-amber-100 text-amber-800',
    'Ambiental': 'bg-emerald-100 text-emerald-800',
    'Antagônica': 'bg-red-100 text-red-800',
    'Outros': 'bg-gray-100 text-gray-800',
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
        <button onClick={() => { setEditId(null); setForm({ ...empty }); setShowForm(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
          + Nova Sinergia
        </button>
      </div>

      <FormModal open={showForm} onClose={closeModal} title={editId ? 'Editar Sinergia' : 'Nova Sinergia'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField label="Benefício A" type="select" value={form.beneficio_a_id} onChange={(v) => setForm({ ...form, beneficio_a_id: v })} options={beneficiosOpts} required searchable />
            <FormField label="Benefício B" type="select" value={form.beneficio_b_id} onChange={(v) => setForm({ ...form, beneficio_b_id: v })} options={beneficiosOpts} required searchable />
            <FormField label="Tipo de Relação" type="select" value={form.tipo_relacao} onChange={(v) => setForm({ ...form, tipo_relacao: v })}
              options={tipoRelacaoOptions} required />
          </div>
          {form.tipo_relacao === 'Outros' && (
            <div className="mt-4">
              <FormField label="Justificativa (Outros)" value={form.justificativa_outros} onChange={(v) => setForm({ ...form, justificativa_outros: v })} required placeholder="Descreva o tipo de relação" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField label="Descrição" type="textarea" value={form.descricao} onChange={(v) => setForm({ ...form, descricao: v })} rows={2} />
            <FormField label="Impacto na Maximização do Valor" type="textarea" value={form.impacto} onChange={(v) => setForm({ ...form, impacto: v })} rows={2} />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancelar</button>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editId ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </FormModal>

      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)} />

      <ConfirmDialog open={!!deleteTarget} title="Excluir Sinergia" message="Deseja excluir esta sinergia?"
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

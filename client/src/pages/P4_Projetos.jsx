import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';
import { projetos, organizacoes, gestores as gestoresApi, eventos } from '../services/api';

const empty = { organizacao_id: '', codigo: '', nome: '', objetivo: '', duracao: '', status: 'Planejamento', gestor_id: '', patrocinador_id: '', responsavel_id: '', area_responsavel: '', abordagem_gestao: '', numero_revisoes_previstas: 0, frequencia_revisoes: '', frequencia_revisoes_dias: 30 };

export default function P4_Projetos({ setProjetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [gestores, setGestores] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [eventosList, setEventosList] = useState([]);
  const [eventoForm, setEventoForm] = useState({ projeto_id: '', data_evento: '', tipo_evento: '', titulo: '', descricao: '', responsavel_id: '' });
  const [showEventos, setShowEventos] = useState(null);
  const [editEventoId, setEditEventoId] = useState(null);

  const tipoEventoOpts = [
    { value: 'kick-off', label: 'Kick-off' }, { value: 'Execução', label: 'Execução' }, { value: 'Entrega', label: 'Entrega' },
    { value: 'check-point', label: 'Check-point' }, { value: 'revisão', label: 'Revisão' }, { value: 'encerramento de fase', label: 'Encerramento de fase' },
    { value: 'encerramento do projeto', label: 'Encerramento do projeto' }, { value: 'realização de benefícios', label: 'Realização de benefícios' }, { value: 'outros', label: 'Outros' },
  ];

  const loadEventos = (projetoId) => {
    eventos.listByProjeto(projetoId).then(setEventosList);
  };

  const load = () => {
    projetos.list().then(setLista);
    organizacoes.list().then(setOrgs);
    gestoresApi.list().then(setGestores);
  };
  useEffect(() => { load(); }, []);

  const closeModal = () => { setShowForm(false); setEditId(null); setForm({ ...empty }); };
  const closeEventosModal = () => { setShowEventos(null); setEventosList([]); setEditEventoId(null); setEventoForm({ projeto_id: '', data_evento: '', tipo_evento: '', titulo: '', descricao: '', responsavel_id: '' }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await projetos.update(editId, form);
    } else {
      await projetos.create(form);
    }
    closeModal();
    load();
    window.dispatchEvent(new Event('projetos-updated'));
  };

  const handleEdit = (row) => {
    setForm({
      organizacao_id: row.organizacao_id || '', codigo: row.codigo, nome: row.nome, objetivo: row.objetivo,
      duracao: row.duracao, status: row.status, gestor_id: row.gestor_id || '', patrocinador_id: row.patrocinador_id || '',
      responsavel_id: row.responsavel_id || '', area_responsavel: row.area_responsavel, abordagem_gestao: row.abordagem_gestao,
      numero_revisoes_previstas: row.numero_revisoes_previstas || 0, frequencia_revisoes: row.frequencia_revisoes || '', frequencia_revisoes_dias: row.frequencia_revisoes_dias || 30
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
        <button onClick={() => { setEditId(null); setForm({ ...empty }); setShowForm(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          + Novo Projeto
        </button>
      </div>

      <FormModal open={showForm} onClose={closeModal} title={editId ? 'Editar Projeto' : 'Novo Projeto'} maxWidth="max-w-4xl">
        <form onSubmit={handleSubmit}>
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
            <FormField label="Número de revisões previstas" type="number" value={form.numero_revisoes_previstas} onChange={(v) => setForm({ ...form, numero_revisoes_previstas: v })} />
            <FormField label="Frequência de revisões" type="select" value={form.frequencia_revisoes} onChange={(v) => {
              const diasMap = { 'Semanal': 7, 'Quinzenal': 15, 'Mensal': 30, 'Bimestral': 60, 'Trimestral': 90, 'Semestral': 180, 'Anual': 365 };
              setForm({ ...form, frequencia_revisoes: v, frequencia_revisoes_dias: diasMap[v] || 30 });
            }} options={[
              { value: 'Semanal', label: 'Semanal' }, { value: 'Quinzenal', label: 'Quinzenal' }, { value: 'Mensal', label: 'Mensal' },
              { value: 'Bimestral', label: 'Bimestral' }, { value: 'Trimestral', label: 'Trimestral' }, { value: 'Semestral', label: 'Semestral' },
              { value: 'Anual', label: 'Anual' }
            ]} />
          </div>
          <div className="mt-4">
            <FormField label="Objetivo" type="textarea" value={form.objetivo} onChange={(v) => setForm({ ...form, objetivo: v })} />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancelar</button>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editId ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </FormModal>

      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)}
        actions={(row) => (
          <>
            <button onClick={() => setProjetoAtivo(row.id)} className="text-green-600 hover:text-green-800 text-sm font-medium mr-2">
              Selecionar
            </button>
            <button onClick={() => { setShowEventos(row.id); loadEventos(row.id); }} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              Eventos
            </button>
          </>
        )}
      />

      <FormModal open={!!showEventos} onClose={closeEventosModal} title={`Eventos do Projeto — ${lista.find(p => p.id === showEventos)?.nome || ''}`} maxWidth="max-w-4xl">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <FormField label="Data" type="date" value={eventoForm.data_evento} onChange={(v) => setEventoForm({ ...eventoForm, data_evento: v })} required />
            <FormField label="Tipo" type="select" value={eventoForm.tipo_evento} onChange={(v) => setEventoForm({ ...eventoForm, tipo_evento: v })} options={tipoEventoOpts} />
            <FormField label="Título" value={eventoForm.titulo} onChange={(v) => setEventoForm({ ...eventoForm, titulo: v })} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 items-end">
            <FormField label="Responsável" type="select" value={eventoForm.responsavel_id} onChange={(v) => setEventoForm({ ...eventoForm, responsavel_id: v })} options={gestoresOpts} searchable />
          </div>
          <div className="mt-3">
            <FormField label="Descrição" type="textarea" value={eventoForm.descricao} onChange={(v) => setEventoForm({ ...eventoForm, descricao: v })} rows={2} />
          </div>
          <div className="mt-3 flex justify-end gap-2">
            {editEventoId && <button onClick={() => { setEditEventoId(null); setEventoForm({ projeto_id: '', data_evento: '', tipo_evento: '', titulo: '', descricao: '', responsavel_id: '' }); }} className="text-gray-500 hover:text-gray-700 text-sm">Cancelar</button>}
            <button onClick={async () => {
              if (!eventoForm.data_evento || !eventoForm.titulo) return;
              if (editEventoId) {
                await eventos.update(editEventoId, eventoForm);
              } else {
                await eventos.create({ ...eventoForm, projeto_id: showEventos });
              }
              setEventoForm({ projeto_id: '', data_evento: '', tipo_evento: '', titulo: '', descricao: '', responsavel_id: '' });
              setEditEventoId(null);
              loadEventos(showEventos);
            }} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
              {editEventoId ? 'Salvar' : 'Adicionar Evento'}
            </button>
          </div>
        </div>
        {eventosList.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead><tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Título</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {eventosList.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{ev.data_evento}</td>
                    <td className="px-4 py-3 text-sm"><span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">{ev.tipo_evento}</span></td>
                    <td className="px-4 py-3 text-sm font-medium">{ev.titulo}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{ev.descricao || '-'}</td>
                    <td className="px-4 py-3 text-right flex gap-2 justify-end">
                      <button onClick={() => { setEditEventoId(ev.id); setEventoForm({ data_evento: ev.data_evento, tipo_evento: ev.tipo_evento, titulo: ev.titulo, descricao: ev.descricao || '', responsavel_id: ev.responsavel_id || '' }); }} className="text-primary-600 hover:text-primary-800 text-sm font-medium">Editar</button>
                      <button onClick={async () => { await eventos.remove(ev.id); loadEventos(showEventos); }} className="text-red-600 hover:text-red-800 text-sm font-medium">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-400 text-sm">Nenhum evento cadastrado.</p>}
      </FormModal>

      <ConfirmDialog open={!!deleteTarget} title="Excluir Projeto"
        message={`Deseja excluir "${deleteTarget?.nome}"? Todos os dados vinculados serão perdidos.`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

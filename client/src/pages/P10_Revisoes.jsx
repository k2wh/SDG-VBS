import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { revisoes } from '../services/api';

export default function P10_Revisoes({ projetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [snapshot, setSnapshot] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    if (!projetoAtivo) return;
    revisoes.listByProjeto(projetoAtivo).then(setLista);
  };
  useEffect(() => { load(); }, [projetoAtivo]);

  if (!projetoAtivo) return <div><StepHeader numero={10} titulo="Revisões" descricao="Ciclos de revisão contínua" /><EmptyState /></div>;

  const handleCreate = async () => {
    await revisoes.create(projetoAtivo, { descricao });
    setDescricao('');
    load();
  };

  const handleViewSnapshot = async (rev) => {
    const data = await revisoes.get(rev.id);
    setSnapshot(data);
  };

  const handleDelete = async () => {
    await revisoes.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <StepHeader numero={10} titulo="Revisões" descricao="Ciclos de revisão contínua — gere snapshots periódicos" />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Gerar Nova Revisão</h3>
        <p className="text-sm text-gray-500 mb-4">
          Uma revisão captura um snapshot completo de todos os dados do projeto neste momento (stakeholders, valores, benefícios, propagações e sinergias).
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <FormField label="Notas da Revisão (opcional)" value={descricao} onChange={setDescricao} placeholder="Observações sobre esta revisão..." />
          </div>
          <button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-6 py-2 text-sm font-medium h-fit">
            Gerar Revisão
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Revisões</h3>
      {lista.length > 0 ? (
        <div className="space-y-3">
          {lista.map(rev => (
            <div key={rev.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{rev.nome_arquivo}</p>
                <p className="text-sm text-gray-500">{rev.data_revisao} {rev.descricao && `— ${rev.descricao}`}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleViewSnapshot(rev)} className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                  Ver Snapshot
                </button>
                <button onClick={() => setDeleteTarget(rev)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-400">Nenhuma revisão gerada ainda.</p>
        </div>
      )}

      {snapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSnapshot(null)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Snapshot — {snapshot.nome_arquivo}</h3>
              <button onClick={() => setSnapshot(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            {snapshot.snapshot_dados && (
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Projeto</h4>
                  <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(snapshot.snapshot_dados.projeto, null, 2)}</pre>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Stakeholders ({snapshot.snapshot_dados.stakeholders?.length || 0})</h4>
                  <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(snapshot.snapshot_dados.stakeholders, null, 2)}</pre>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Valores ({snapshot.snapshot_dados.valores?.length || 0})</h4>
                  <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(snapshot.snapshot_dados.valores, null, 2)}</pre>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Benefícios ({snapshot.snapshot_dados.beneficios?.length || 0})</h4>
                  <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(snapshot.snapshot_dados.beneficios, null, 2)}</pre>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Propagações ({snapshot.snapshot_dados.propagacoes?.length || 0})</h4>
                  <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(snapshot.snapshot_dados.propagacoes, null, 2)}</pre>
                </div>
                <div>
                  <h4 className="font-semibold text-primary-700 mb-2">Sinergias ({snapshot.snapshot_dados.sinergias?.length || 0})</h4>
                  <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(snapshot.snapshot_dados.sinergias, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Excluir Revisão" message={`Deseja excluir "${deleteTarget?.nome_arquivo}"?`}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}

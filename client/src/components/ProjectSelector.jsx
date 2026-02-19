import { useEffect, useState } from 'react';
import { projetos } from '../services/api';

export default function ProjectSelector({ projetoAtivo, setProjetoAtivo }) {
  const [lista, setLista] = useState([]);

  useEffect(() => {
    projetos.list().then(setLista).catch(() => {});
  }, []);

  const refreshList = () => {
    projetos.list().then(setLista).catch(() => {});
  };

  useEffect(() => {
    window.addEventListener('projetos-updated', refreshList);
    return () => window.removeEventListener('projetos-updated', refreshList);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500 font-medium">Projeto:</label>
      <select
        value={projetoAtivo || ''}
        onChange={(e) => setProjetoAtivo(e.target.value ? Number(e.target.value) : null)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-48"
      >
        <option value="">Selecione um projeto</option>
        {lista.map((p) => (
          <option key={p.id} value={p.id}>{p.codigo} - {p.nome}</option>
        ))}
      </select>
    </div>
  );
}

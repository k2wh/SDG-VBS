import { useEffect, useState } from 'react';
import { projetos } from '../services/api';
import { CustomSelect } from './FormField';

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

  const options = lista.map((p) => ({
    value: p.id,
    label: `${p.codigo} - ${p.nome}`,
  }));

  return (
    <div className="flex items-center gap-2.5">
      <label className="text-sm text-gray-500 font-medium whitespace-nowrap">Projeto:</label>
      <div className="min-w-56">
        <CustomSelect
          value={projetoAtivo || ''}
          onChange={(val) => setProjetoAtivo(val ? Number(val) : null)}
          options={options}
          placeholder="Selecione um projeto"
          compact
        />
      </div>
    </div>
  );
}

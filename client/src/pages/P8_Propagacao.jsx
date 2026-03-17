import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import DataTable from '../components/DataTable';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { propagacoes, beneficios, stakeholders as stakeholdersApi } from '../services/api';

const ABORDAGENS = [
  { value: 'Hierárquica', label: 'Hierárquica', desc: 'Patrocínio a partir da gestão' },
  { value: 'Processual', label: 'Processual', desc: 'Incorporação do benefício ao processo' },
  { value: 'Rede', label: 'Rede', desc: 'Uso de relações, influência e centralidade' },
  { value: 'Comunicação institucional', label: 'Comunicação institucional', desc: 'Mensagens, procedimentos e normas' },
  { value: 'Champions / multiplicadores', label: 'Champions / multiplicadores', desc: 'Uso de multiplicadores' },
  { value: 'Capacitação / treinamento', label: 'Capacitação / treinamento', desc: 'Uso de aprendizagem' },
  { value: 'Outros', label: 'Outros', desc: '' },
];

const emptyForm = {
  beneficio_id: '',
  classe_beneficio: '',
  stakeholders_alvo: '',
  registro_propagacao: '',
  riscos_nao_propagacao: '',
  efeitos_colaterais: '',
  stakeholders_estimados: '',
  periodos: '',
  abordagem: '',
  justificativa_outros: '',
  projeto_id: '',
};

export default function P8_Propagacao({ projetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [beneficiosList, setBeneficiosList] = useState([]);
  const [shList, setShList] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [stakeholdersSelecionados, setStakeholdersSelecionados] = useState([]);
  const [stakeholderSelect, setStakeholderSelect] = useState('');
  const [projecao, setProjecao] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    if (!projetoAtivo) return;
    propagacoes.listByProjeto(projetoAtivo).then(setLista).catch(() => setLista([]));
    beneficios.listByProjeto(projetoAtivo).then(setBeneficiosList).catch(() => setBeneficiosList([]));
    stakeholdersApi.list().then(setShList).catch(() => setShList([]));
  };

  useEffect(() => { load(); }, [projetoAtivo]);

  // Rebuild projecao array when periodos changes
  useEffect(() => {
    const n = parseInt(form.periodos) || 0;
    if (n < 1) {
      setProjecao([]);
      return;
    }
    setProjecao(prev => {
      const arr = [];
      for (let i = 0; i < n; i++) {
        arr.push({
          tempo: `t${i}`,
          beneficiarios_previstos: prev[i]?.beneficiarios_previstos || '',
        });
      }
      return arr;
    });
  }, [form.periodos]);

  // Auto-fill classe when beneficio changes
  useEffect(() => {
    if (form.beneficio_id) {
      const ben = beneficiosList.find(b => String(b.id) === String(form.beneficio_id));
      setForm(f => ({ ...f, classe_beneficio: ben?.classe || ben?.tipo || '' }));
    } else {
      setForm(f => ({ ...f, classe_beneficio: '' }));
    }
  }, [form.beneficio_id, beneficiosList]);

  if (!projetoAtivo) {
    return (
      <div>
        <StepHeader numero={8} titulo="Propagação" descricao="Planejamento da propagação dos benefícios com projeção temporal" />
        <EmptyState />
      </div>
    );
  }

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  // --- Stakeholder tags ---
  const addStakeholder = () => {
    if (!stakeholderSelect) return;
    const sh = shList.find(s => String(s.id) === String(stakeholderSelect));
    if (sh && !stakeholdersSelecionados.find(s => String(s.id) === String(sh.id))) {
      setStakeholdersSelecionados(prev => [...prev, sh]);
    }
    setStakeholderSelect('');
  };

  const removeStakeholder = (id) => {
    setStakeholdersSelecionados(prev => prev.filter(s => String(s.id) !== String(id)));
  };

  // --- Projecao helpers ---
  const setProjecaoRow = (index, value) => {
    setProjecao(prev => prev.map((row, i) => i === index ? { ...row, beneficiarios_previstos: value } : row));
  };

  const stEst = parseInt(form.stakeholders_estimados) || 0;
  const totalBeneficiarios = projecao.reduce((sum, r) => sum + (parseInt(r.beneficiarios_previstos) || 0), 0);
  const coberturaFinal = stEst > 0 ? ((totalBeneficiarios / stEst) * 100) : 0;

  const abordagemInfo = ABORDAGENS.find(a => a.value === form.abordagem);

  // --- Available stakeholders for select (exclude already selected) ---
  const shOpts = shList
    .filter(s => !stakeholdersSelecionados.find(sel => String(sel.id) === String(s.id)))
    .map(s => ({ value: s.id, label: s.nome }));

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.beneficio_id) return alert('Selecione um benefício.');
    if (!form.abordagem) return alert('Selecione uma abordagem de propagação.');
    const hasAtLeastOne = projecao.some(r => parseInt(r.beneficiarios_previstos) > 0);
    if (!hasAtLeastOne) return alert('Informe ao menos um período com beneficiários previstos maior que zero.');

    const payload = {
      ...form,
      projeto_id: projetoAtivo,
      stakeholders_alvo: JSON.stringify(stakeholdersSelecionados.map(s => ({ id: s.id, nome: s.nome }))),
      projecao_temporal: JSON.stringify(projecao),
      cobertura_final: coberturaFinal.toFixed(2),
    };

    try {
      if (editId) {
        await propagacoes.update(editId, payload);
      } else {
        await propagacoes.create(payload);
      }
      resetForm();
      load();
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    }
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setStakeholdersSelecionados([]);
    setProjecao([]);
    setEditId(null);
    setShowForm(false);
    setStakeholderSelect('');
  };

  const handleEdit = (row) => {
    setForm({
      beneficio_id: row.beneficio_id || '',
      classe_beneficio: row.classe_beneficio || '',
      registro_propagacao: row.registro_propagacao || '',
      riscos_nao_propagacao: row.riscos_nao_propagacao || '',
      efeitos_colaterais: row.efeitos_colaterais || '',
      stakeholders_estimados: row.stakeholders_estimados || '',
      periodos: row.periodos || '',
      abordagem: row.abordagem || '',
      justificativa_outros: row.justificativa_outros || '',
      stakeholders_alvo: '',
      projeto_id: row.projeto_id || projetoAtivo,
    });

    // Parse stakeholders_alvo
    try {
      const parsed = JSON.parse(row.stakeholders_alvo || '[]');
      setStakeholdersSelecionados(Array.isArray(parsed) ? parsed : []);
    } catch {
      setStakeholdersSelecionados([]);
    }

    // Parse projecao_temporal
    try {
      const parsed = JSON.parse(row.projecao_temporal || '[]');
      setProjecao(Array.isArray(parsed) ? parsed : []);
    } catch {
      setProjecao([]);
    }

    setEditId(row.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await propagacoes.remove(deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const beneficiosOpts = beneficiosList.map(b => ({ value: b.id, label: b.descricao }));

  const columns = [
    { key: 'beneficio_descricao', label: 'Benefício', render: (v, row) => {
      if (v) return v;
      const ben = beneficiosList.find(b => String(b.id) === String(row.beneficio_id));
      return ben?.descricao || '-';
    }},
    { key: 'abordagem', label: 'Abordagem', render: (v) => v ? (
      <span className="bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">{v}</span>
    ) : '-' },
    { key: 'stakeholders_estimados', label: 'Stakeholders est.' },
    { key: 'periodos', label: 'Períodos' },
    { key: 'cobertura_final', label: 'Cobertura final', render: (v) => v ? `${parseFloat(v).toFixed(1)}%` : '-' },
  ];

  return (
    <div>
      <StepHeader numero={8} titulo="Propagação" descricao="Planejamento da propagação dos benefícios com projeção temporal" />

      {/* Toggle form button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => { if (showForm) { resetForm(); } else { setShowForm(true); setEditId(null); setForm({ ...emptyForm }); setStakeholdersSelecionados([]); setProjecao([]); } }}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancelar' : '+ Nova Propagação'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {editId ? 'Editar' : 'Nova'} Propagação
          </h3>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* === LEFT PANEL: Identificação e público-alvo === */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary-500">
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                </svg>
                Identificação e público-alvo
              </h4>
              <div className="space-y-4">
                {/* Benefício */}
                <FormField
                  label="Benefício"
                  type="select"
                  value={form.beneficio_id}
                  onChange={(v) => set('beneficio_id', v)}
                  options={beneficiosOpts}
                  required
                  searchable
                />

                {/* Classe de benefício (readonly) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Classe de benefício</label>
                  <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600">
                    {form.classe_beneficio || '—'}
                  </div>
                </div>

                {/* Stakeholders alvo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stakeholders alvo da propagação</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <FormField
                        label=""
                        type="select"
                        value={stakeholderSelect}
                        onChange={setStakeholderSelect}
                        options={shOpts}
                        searchable
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addStakeholder}
                      className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-3 py-2 text-sm font-medium transition-colors shrink-0 self-end"
                    >
                      Vincular
                    </button>
                  </div>
                  {/* Tags */}
                  {stakeholdersSelecionados.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {stakeholdersSelecionados.map(sh => (
                        <span
                          key={sh.id}
                          className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full border border-primary-200"
                        >
                          {sh.nome}
                          <button
                            type="button"
                            onClick={() => removeStakeholder(sh.id)}
                            className="text-primary-400 hover:text-primary-700 transition-colors ml-0.5"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                              <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Registro de como se dá a propagação */}
                <FormField
                  label="Registrar como se dá a propagação"
                  type="textarea"
                  value={form.registro_propagacao}
                  onChange={(v) => set('registro_propagacao', v.slice(0, 1000))}
                  rows={3}
                  placeholder="Descreva como a propagação ocorrerá..."
                />
                <p className="text-xs text-gray-400 -mt-2 text-right">{(form.registro_propagacao || '').length}/1000</p>

                {/* Riscos de não propagação */}
                <FormField
                  label="Riscos de não propagação"
                  type="textarea"
                  value={form.riscos_nao_propagacao}
                  onChange={(v) => set('riscos_nao_propagacao', v.slice(0, 700))}
                  rows={2}
                  placeholder="Quais riscos se a propagação não ocorrer?"
                />
                <p className="text-xs text-gray-400 -mt-2 text-right">{(form.riscos_nao_propagacao || '').length}/700</p>

                {/* Possíveis efeitos colaterais */}
                <FormField
                  label="Possíveis efeitos colaterais"
                  type="textarea"
                  value={form.efeitos_colaterais}
                  onChange={(v) => set('efeitos_colaterais', v.slice(0, 700))}
                  rows={2}
                  placeholder="Efeitos colaterais possíveis da propagação..."
                />
                <p className="text-xs text-gray-400 -mt-2 text-right">{(form.efeitos_colaterais || '').length}/700</p>
              </div>
            </div>

            {/* === RIGHT PANEL: Planejamento da propagação === */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary-500">
                  <path fillRule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
                Planejamento da propagação
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Stakeholders estimados */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stakeholders estimados</label>
                    <input
                      type="number"
                      min="0"
                      max="9999999"
                      value={form.stakeholders_estimados}
                      onChange={(e) => set('stakeholders_estimados', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-150 hover:border-gray-400"
                      placeholder="0"
                    />
                  </div>

                  {/* Períodos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Períodos</label>
                    <input
                      type="number"
                      min="1"
                      max="36"
                      value={form.periodos}
                      onChange={(e) => {
                        const v = Math.min(36, Math.max(0, parseInt(e.target.value) || 0));
                        set('periodos', v || e.target.value);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-150 hover:border-gray-400"
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Abordagem */}
                <FormField
                  label="Abordagem principal de propagação"
                  type="select"
                  value={form.abordagem}
                  onChange={(v) => set('abordagem', v)}
                  options={ABORDAGENS.map(a => ({ value: a.value, label: a.label }))}
                  required
                />

                {/* Abordagem info card */}
                {abordagemInfo && abordagemInfo.value !== 'Outros' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">{abordagemInfo.value}</p>
                    <p className="text-xs text-blue-600 mt-0.5">{abordagemInfo.desc}</p>
                  </div>
                )}

                {/* Outros justificativa */}
                {form.abordagem === 'Outros' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Justificativa</label>
                    <input
                      type="text"
                      maxLength={80}
                      value={form.justificativa_outros}
                      onChange={(e) => set('justificativa_outros', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-150 hover:border-gray-400"
                      placeholder="Descreva a abordagem..."
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{(form.justificativa_outros || '').length}/80</p>
                  </div>
                )}

                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Períodos</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{parseInt(form.periodos) || 0}</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Stakeholders est.</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{stEst.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className={`border rounded-lg p-3 text-center ${coberturaFinal >= 100 ? 'bg-green-50 border-green-200' : coberturaFinal > 0 ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Cobertura final</p>
                    <p className={`text-xl font-bold mt-1 ${coberturaFinal >= 100 ? 'text-green-700' : coberturaFinal > 0 ? 'text-blue-700' : 'text-gray-800'}`}>
                      {coberturaFinal.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-xs text-gray-500 leading-relaxed">
                  A cobertura final é calculada pela soma de todos os beneficiários previstos em cada período, dividida pelo total de stakeholders estimados.
                  Fórmula: <span className="font-mono bg-gray-100 px-1 rounded">Cobertura = (Soma beneficiários / Stakeholders estimados) x 100</span>
                </p>
              </div>
            </div>
          </div>

          {/* === BOTTOM PANEL: Projeção temporal === */}
          {projecao.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary-500">
                  <path fillRule="evenodd" d="M1 2.75A.75.75 0 011.75 2h16.5a.75.75 0 010 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h16.5a.75.75 0 010 1.5H1.75A.75.75 0 011 7.75zM1.75 12a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5H1.75zM1 17.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H1.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                </svg>
                Projeção temporal da propagação
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Tempo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Beneficiários previstos</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Cobertura (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projecao.map((row, i) => {
                      const benPrev = parseInt(row.beneficiarios_previstos) || 0;
                      const cob = stEst > 0 ? ((benPrev / stEst) * 100) : 0;
                      return (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2">
                            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 text-xs font-mono font-medium px-2 py-0.5 rounded">
                              {row.tempo}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="0"
                              value={row.beneficiarios_previstos}
                              onChange={(e) => setProjecaoRow(i, e.target.value)}
                              className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-150 hover:border-gray-400"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className={`text-sm font-medium ${cob > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                              {cob.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t-2 border-gray-300">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">Total acumulado</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">{totalBeneficiarios.toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-bold ${coberturaFinal >= 100 ? 'text-green-700' : coberturaFinal > 0 ? 'text-blue-700' : 'text-gray-400'}`}>
                          {coberturaFinal.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-5 py-2 text-sm font-medium transition-colors"
            >
              Limpar
            </button>
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
            >
              {editId ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      )}

      {/* Data listing */}
      <DataTable columns={columns} data={lista} onEdit={handleEdit} onDelete={(row) => setDeleteTarget(row)} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir Propagação"
        message="Deseja excluir esta propagação?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

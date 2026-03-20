import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import FormField from '../components/FormField';
import ConfirmDialog from '../components/ConfirmDialog';
import FormModal from '../components/FormModal';
import EmptyState from '../components/EmptyState';
import { revisoes, valores, beneficios } from '../services/api';

const BLOCK_TABS = [
  { key: 'dados_gerais', label: 'Dados Gerais' },
  { key: 'valores_stakeholders', label: 'Valores e Stakeholders' },
  { key: 'beneficios_stakeholders', label: 'Beneficios e Stakeholders' },
  { key: 'propagacao', label: 'Propagacao' },
  { key: 'sinergias', label: 'Sinergias' },
];

const PLU_OPTIONS = [1, 2, 3, 4, 5];

function SalienciaSelect({ value, onChange }) {
  return (
    <select
      value={value || 1}
      onChange={(e) => onChange(Number(e.target.value))}
      className="border border-gray-300 rounded px-2 py-1 text-sm w-16 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    >
      {PLU_OPTIONS.map((v) => (
        <option key={v} value={v}>{v}</option>
      ))}
    </select>
  );
}

function StakeholderRow({ sh, onUpdate, onToggleDescontinuado }) {
  const saliencia = (sh.poder || 1) * (sh.legitimidade || 1) * (sh.urgencia || 1);
  return (
    <tr className={`border-b border-gray-100 ${sh.descontinuado ? 'opacity-50' : ''}`}>
      <td className={`px-3 py-2 text-sm ${sh.descontinuado ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {sh.nome || sh.stakeholder_nome || `Stakeholder #${sh.stakeholder_id || sh.id}`}
        {sh.descontinuado && (
          <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium no-underline inline-block">
            Descontinuado
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-sm text-gray-600">{sh.classe || '-'}</td>
      <td className="px-3 py-2">
        <SalienciaSelect value={sh.poder} onChange={(v) => onUpdate({ ...sh, poder: v })} />
      </td>
      <td className="px-3 py-2">
        <SalienciaSelect value={sh.legitimidade} onChange={(v) => onUpdate({ ...sh, legitimidade: v })} />
      </td>
      <td className="px-3 py-2">
        <SalienciaSelect value={sh.urgencia} onChange={(v) => onUpdate({ ...sh, urgencia: v })} />
      </td>
      <td className="px-3 py-2 text-sm text-center font-medium text-gray-800">{saliencia}</td>
      <td className="px-3 py-2 text-sm text-center text-gray-600">{sh.saliencia_normalizada != null ? sh.saliencia_normalizada.toFixed(2) : '-'}</td>
      <td className="px-3 py-2">
        <button
          onClick={() => onToggleDescontinuado(sh)}
          className={`text-xs font-medium px-2 py-1 rounded ${sh.descontinuado ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'}`}
        >
          {sh.descontinuado ? 'Reativar' : 'Descontinuar'}
        </button>
      </td>
    </tr>
  );
}

function ExpandableStakeholders({
  parentId,
  parentType,
  stakeholdersList,
  allStakeholders,
  onStakeholdersChange,
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newShId, setNewShId] = useState('');

  const handleUpdate = (updated) => {
    const next = stakeholdersList.map((s) =>
      (s.id === updated.id && s.stakeholder_id === updated.stakeholder_id) ? updated : s
    );
    onStakeholdersChange(parentId, next);
  };

  const handleToggleDescontinuado = (sh) => {
    handleUpdate({ ...sh, descontinuado: !sh.descontinuado });
  };

  const handleAddStakeholder = () => {
    if (!newShId) return;
    const found = allStakeholders.find((s) => String(s.id) === String(newShId));
    if (!found) return;
    const newEntry = {
      id: `new_${Date.now()}`,
      stakeholder_id: found.id,
      nome: found.nome,
      stakeholder_nome: found.nome,
      classe: found.classe || '',
      poder: 1,
      legitimidade: 1,
      urgencia: 1,
      saliencia_normalizada: null,
      descontinuado: false,
    };
    onStakeholdersChange(parentId, [...stakeholdersList, newEntry]);
    setNewShId('');
    setAdding(false);
  };

  return (
    <div className="mt-1 mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
      >
        <span className={`transform transition-transform ${open ? 'rotate-90' : ''}`}>&#9654;</span>
        Stakeholders ({stakeholdersList.length})
      </button>
      {open && (
        <div className="mt-2 ml-2 border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-3 py-2">Nome</th>
                <th className="px-3 py-2">Classe</th>
                <th className="px-3 py-2">Poder</th>
                <th className="px-3 py-2">Legitimidade</th>
                <th className="px-3 py-2">Urgencia</th>
                <th className="px-3 py-2 text-center">P*L*U</th>
                <th className="px-3 py-2 text-center">Sal. Norm.</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {stakeholdersList.map((sh, idx) => (
                <StakeholderRow
                  key={sh.id || sh.stakeholder_id || idx}
                  sh={sh}
                  onUpdate={handleUpdate}
                  onToggleDescontinuado={handleToggleDescontinuado}
                />
              ))}
              {stakeholdersList.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-sm text-gray-400">
                    Nenhum stakeholder vinculado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="p-2 border-t border-gray-200 bg-gray-50 flex items-center gap-2">
            {adding ? (
              <>
                <select
                  value={newShId}
                  onChange={(e) => setNewShId(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm flex-1 focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione um stakeholder...</option>
                  {allStakeholders.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
                <button onClick={handleAddStakeholder} className="bg-primary-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-primary-700">
                  Adicionar
                </button>
                <button onClick={() => { setAdding(false); setNewShId(''); }} className="text-gray-500 hover:text-gray-700 text-xs font-medium">
                  Cancelar
                </button>
              </>
            ) : (
              <button onClick={() => setAdding(true)} className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                + Adicionar Stakeholder
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BlockDadosGerais({ cicloData, onSave }) {
  const [etapaProjeto, setEtapaProjeto] = useState(cicloData.revisao?.etapa_projeto || '');

  useEffect(() => {
    setEtapaProjeto(cicloData.revisao?.etapa_projeto || '');
  }, [cicloData.revisao?.etapa_projeto]);

  const projeto = cicloData.projeto || {};
  const eventos = cicloData.eventos || [];

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-3">Informacoes do Projeto</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Codigo:</span>
            <span className="ml-2 font-medium text-gray-800">{projeto.codigo || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">Nome:</span>
            <span className="ml-2 font-medium text-gray-800">{projeto.nome || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <span className="ml-2 font-medium text-gray-800">{projeto.status || '-'}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Etapa do Projeto</label>
        <select
          value={etapaProjeto}
          onChange={(e) => setEtapaProjeto(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Selecione uma etapa...</option>
          {eventos.map((ev) => (
            <option key={ev.id} value={`${ev.tipo_evento}: ${ev.titulo}`}>
              {ev.tipo_evento} - {ev.titulo}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onSave({ etapa_projeto: etapaProjeto })}
        className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-6 py-2 text-sm font-medium"
      >
        Salvar Bloco
      </button>
    </div>
  );
}

const VALOR_QUESTIONS = [
  { key: 'q1', label: 'Q1 - O valor inicialmente proposto para o projeto continua sendo percebido como relevante pelos principais stakeholders?', type: 'select', options: ['Sim', 'Não'], hasJustificativa: true },
  { key: 'q2', label: 'Q2 - Há alinhamento entre os objetivos estratégicos com este valor?', type: 'select', options: ['Sim', 'Não'], hasJustificativa: true },
  { key: 'q3', label: 'Q3 - Houve redução, estabilização ou ampliação da percepção de valor desde a última revisão?', type: 'select', options: ['Não houve criação deste valor até o momento', 'Houve criação deste valor', 'O valor está sendo criado e observa-se crescimento'], hasJustificativa: true },
  { key: 'q4', label: 'Q4 - Os critérios e indicadores usados para medir este valor continuam adequados para representar a realidade atual do projeto?', type: 'select', options: ['Sim', 'Não'], hasJustificativa: true },
  { key: 'q5', label: 'Q5 - Há novos fatores internos ou externos que estejam alterando a importância atribuída ao valor do projeto?', type: 'textarea', placeholder: 'Se sim, especifique' },
  { key: 'q6', label: 'Q6 - Existem conflitos entre stakeholders que estejam enfraquecendo a convergência sobre o valor do projeto?', type: 'textarea', placeholder: 'Se sim, mencionar' },
  { key: 'q7', label: 'Q7 - Que ajustes devem ser feitos no projeto para preservar, recuperar ou ampliar a criação do valor no próximo ciclo?', type: 'textarea', placeholder: 'Descrever ajustes recomendados' },
];

function ValorQuestionnaire({ valorId, questoesMap, onQuestoesChange }) {
  const [open, setOpen] = useState(false);
  const data = questoesMap[valorId] || {};

  const set = (field, value) => {
    onQuestoesChange(valorId, { ...data, [field]: value });
  };

  const answeredCount = VALOR_QUESTIONS.filter(q => {
    if (q.hasJustificativa) return data[q.key];
    return data[q.key];
  }).length;

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-emerald-200 shadow-sm">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all text-left"
      >
        <span className="text-sm font-bold text-emerald-800 flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-emerald-600">
            <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm4.75 6.75a.75.75 0 00-1.5 0v2.546l-.943-1.048a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.114 0l2.25-2.5a.75.75 0 00-1.114-1.004l-.943 1.048V8.75z" clipRule="evenodd" />
          </svg>
          Questões para análise do valor
          <span className={`transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M4.22 6.22a.75.75 0 011.06 0L8 8.94l2.72-2.72a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 7.28a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </span>
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
          answeredCount === VALOR_QUESTIONS.length
            ? 'bg-emerald-200 text-emerald-800'
            : answeredCount > 0
              ? 'bg-amber-100 text-amber-700'
              : 'bg-gray-100 text-gray-500'
        }`}>
          {answeredCount}/{VALOR_QUESTIONS.length}
        </span>
      </button>

      {/* Questions */}
      {open && (
        <div className="bg-white divide-y divide-gray-100">
          {VALOR_QUESTIONS.map((q, idx) => {
            const isAnswered = q.hasJustificativa ? !!data[q.key] : !!data[q.key];
            return (
              <div key={q.key} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isAnswered
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.label.replace(/^Q\d+ - /, '')}</p>
                </div>

                {q.type === 'select' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-10">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Resposta</label>
                      <select
                        value={data[q.key] || ''}
                        onChange={(e) => set(q.key, e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all hover:border-gray-400"
                      >
                        <option value="">Selecione</option>
                        {q.options.map((opt, i) => (
                          <option key={opt} value={opt}>{i + 1}. {opt}</option>
                        ))}
                      </select>
                    </div>
                    {q.hasJustificativa && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Justifique sua resposta</label>
                        <textarea
                          value={data[`${q.key}_justificativa`] || ''}
                          onChange={(e) => set(`${q.key}_justificativa`, e.target.value)}
                          placeholder="Justifique sua resposta..."
                          rows={2}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all hover:border-gray-400 resize-none"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="ml-10">
                    <textarea
                      value={data[q.key] || ''}
                      onChange={(e) => set(q.key, e.target.value)}
                      placeholder={q.placeholder}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all hover:border-gray-400 resize-none"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BlockValoresStakeholders({ cicloData, stakeholdersMap, onStakeholdersChange, onRecalcular, onSave, questoesMap, onQuestoesChange }) {
  const valoresList = cicloData.valores || [];
  const allStakeholders = cicloData.allStakeholders || [];

  return (
    <div className="space-y-4">
      {valoresList.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">Nenhum valor cadastrado neste projeto.</p>
      ) : (
        valoresList.map((val) => (
          <div key={val.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-800">{val.descricao || val.nome || `Valor #${val.id}`}</h4>
                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                  <span>Natureza: {val.natureza || '-'}</span>
                  <span>Classe: {val.classe || '-'}</span>
                  <span>Temporalidade: {val.temporalidade || '-'}</span>
                </div>
              </div>
              <button
                onClick={() => onRecalcular(val.id, 'valor')}
                className="text-xs text-amber-600 hover:text-amber-800 font-medium border border-amber-300 rounded px-3 py-1"
              >
                Recalcular Saliencia
              </button>
            </div>
            <ExpandableStakeholders
              parentId={val.id}
              parentType="valor"
              stakeholdersList={stakeholdersMap[`valor_${val.id}`] || []}
              allStakeholders={allStakeholders}
              onStakeholdersChange={(id, list) => onStakeholdersChange(`valor_${id}`, list)}
            />
            <ValorQuestionnaire
              valorId={val.id}
              questoesMap={questoesMap}
              onQuestoesChange={onQuestoesChange}
            />
          </div>
        ))
      )}
      <button
        onClick={onSave}
        className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-6 py-2 text-sm font-medium"
      >
        Salvar Bloco
      </button>
    </div>
  );
}

function BlockBeneficiosStakeholders({ cicloData, stakeholdersMap, onStakeholdersChange, onRecalcular, onSave }) {
  const beneficiosList = cicloData.beneficios || [];
  const allStakeholders = cicloData.allStakeholders || [];

  return (
    <div className="space-y-4">
      {beneficiosList.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">Nenhum beneficio cadastrado neste projeto.</p>
      ) : (
        beneficiosList.map((ben) => (
          <div key={ben.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-800">{ben.descricao || ben.nome || `Beneficio #${ben.id}`}</h4>
                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                  <span>Valor: {ben.valor_descricao || ben.valor_id || '-'}</span>
                  <span>Natureza: {ben.natureza || '-'}</span>
                  <span>Classe: {ben.classe || '-'}</span>
                  <span>Status: {ben.status || '-'}</span>
                </div>
              </div>
              <button
                onClick={() => onRecalcular(ben.id, 'beneficio')}
                className="text-xs text-amber-600 hover:text-amber-800 font-medium border border-amber-300 rounded px-3 py-1"
              >
                Recalcular Saliencia
              </button>
            </div>
            <ExpandableStakeholders
              parentId={ben.id}
              parentType="beneficio"
              stakeholdersList={stakeholdersMap[`beneficio_${ben.id}`] || []}
              allStakeholders={allStakeholders}
              onStakeholdersChange={(id, list) => onStakeholdersChange(`beneficio_${id}`, list)}
            />
          </div>
        ))
      )}
      <button
        onClick={onSave}
        className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-6 py-2 text-sm font-medium"
      >
        Salvar Bloco
      </button>
    </div>
  );
}

function BlockPropagacao({ cicloData, onSave }) {
  const propagacoes = cicloData.propagacoes || [];

  return (
    <div className="space-y-4">
      {propagacoes.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">Nenhuma propagacao cadastrada neste projeto.</p>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Beneficio</th>
                <th className="px-4 py-3">Abordagem</th>
                <th className="px-4 py-3 text-center">Stakeholders Est.</th>
                <th className="px-4 py-3 text-center">Periodos</th>
                <th className="px-4 py-3 text-center">Cobertura</th>
              </tr>
            </thead>
            <tbody>
              {propagacoes.map((p, idx) => (
                <tr key={p.id || idx} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-800">{p.beneficio_descricao || p.beneficio_id || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.abordagem || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{p.stakeholders_estimados ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{p.periodos ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{p.cobertura != null ? `${(p.cobertura * 100).toFixed(0)}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={onSave}
        className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-6 py-2 text-sm font-medium"
      >
        Salvar Bloco
      </button>
    </div>
  );
}

function BlockSinergias({ cicloData, onSave }) {
  const sinergiasList = cicloData.sinergias || [];

  return (
    <div className="space-y-4">
      {sinergiasList.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">Nenhuma sinergia cadastrada neste projeto.</p>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Beneficio A</th>
                <th className="px-4 py-3">Beneficio B</th>
                <th className="px-4 py-3">Tipo Relacao</th>
                <th className="px-4 py-3 text-center">Impacto</th>
              </tr>
            </thead>
            <tbody>
              {sinergiasList.map((s, idx) => (
                <tr key={s.id || idx} className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-800">{s.beneficio_a_descricao || s.beneficio_a_id || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-800">{s.beneficio_b_descricao || s.beneficio_b_id || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.tipo_relacao || '-'}</td>
                  <td className="px-4 py-3 text-sm text-center text-gray-600">{s.impacto ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        onClick={onSave}
        className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-6 py-2 text-sm font-medium"
      >
        Salvar Bloco
      </button>
    </div>
  );
}

function CycleEditorModal({ revId, onClose, onReload }) {
  const [cicloData, setCicloData] = useState(null);
  const [activeBlock, setActiveBlock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stakeholdersMap, setStakeholdersMap] = useState({});
  const [questoesMap, setQuestoesMap] = useState({});

  const loadCiclo = async () => {
    setLoading(true);
    try {
      const data = await revisoes.getCiclo(revId);
      setCicloData(data);
      const map = {};
      (data.valores || []).forEach((val) => {
        map[`valor_${val.id}`] = val.stakeholders || [];
      });
      (data.beneficios || []).forEach((ben) => {
        map[`beneficio_${ben.id}`] = ben.stakeholders || [];
      });
      setStakeholdersMap(map);

      // Load questões
      const qMap = await revisoes.getQuestoesValor(revId).catch(() => ({}));
      setQuestoesMap(qMap);
    } catch (err) {
      console.error('Erro ao carregar ciclo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestoesChange = (valorId, data) => {
    setQuestoesMap(prev => ({ ...prev, [valorId]: data }));
  };

  useEffect(() => {
    loadCiclo();
  }, [revId]);

  const handleStakeholdersChange = (key, list) => {
    setStakeholdersMap((prev) => ({ ...prev, [key]: list }));
  };

  const handleRecalcular = async (id, type) => {
    try {
      if (type === 'valor') {
        await valores.recalcularSaliencia(id);
      } else {
        await beneficios.recalcSaliencia(id);
      }
      await loadCiclo();
    } catch (err) {
      console.error('Erro ao recalcular saliencia:', err);
    }
  };

  const handleSaveBlock = async (blockKey, extraData = {}) => {
    setSaving(true);
    try {
      let dados = { ...extraData };

      if (blockKey === 'valores_stakeholders') {
        const valoresIds = (cicloData.valores || []).map((v) => v.id);
        for (const vId of valoresIds) {
          const shs = stakeholdersMap[`valor_${vId}`] || [];
          for (const sh of shs) {
            if (sh.stakeholder_id && !String(sh.id).startsWith('new_')) {
              await valores.updateStakeholder(vId, sh.stakeholder_id, {
                poder: sh.poder,
                legitimidade: sh.legitimidade,
                urgencia: sh.urgencia,
                descontinuado: sh.descontinuado || false,
              });
            } else if (String(sh.id).startsWith('new_')) {
              await valores.addStakeholder(vId, {
                stakeholder_id: sh.stakeholder_id,
                poder: sh.poder,
                legitimidade: sh.legitimidade,
                urgencia: sh.urgencia,
              });
            }
          }
        }
        dados.valores_stakeholders = stakeholdersMap;

        // Save questões for each valor
        for (const vId of valoresIds) {
          const qData = questoesMap[vId];
          if (qData) {
            await revisoes.saveQuestoesValor(revId, vId, qData);
          }
        }
      }

      if (blockKey === 'beneficios_stakeholders') {
        const beneficiosIds = (cicloData.beneficios || []).map((b) => b.id);
        for (const bId of beneficiosIds) {
          const shs = stakeholdersMap[`beneficio_${bId}`] || [];
          for (const sh of shs) {
            if (sh.stakeholder_id && !String(sh.id).startsWith('new_')) {
              await beneficios.updateStakeholder(bId, sh.stakeholder_id, {
                poder: sh.poder,
                legitimidade: sh.legitimidade,
                urgencia: sh.urgencia,
                descontinuado: sh.descontinuado || false,
              });
            } else if (String(sh.id).startsWith('new_')) {
              await beneficios.addStakeholder(bId, {
                stakeholder_id: sh.stakeholder_id,
                poder: sh.poder,
                legitimidade: sh.legitimidade,
                urgencia: sh.urgencia,
              });
            }
          }
        }
        dados.beneficios_stakeholders = stakeholdersMap;
      }

      await revisoes.salvarBloco(revId, { bloco: blockKey, dados });
      await loadCiclo();
    } catch (err) {
      console.error('Erro ao salvar bloco:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAtualizarSnapshot = async () => {
    setSaving(true);
    try {
      await revisoes.atualizarSnapshot(revId);
      await loadCiclo();
    } catch (err) {
      console.error('Erro ao atualizar snapshot:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !cicloData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="relative text-gray-500 text-sm bg-white rounded-lg px-6 py-4 shadow-lg">Carregando dados do ciclo...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative flex flex-col bg-white mx-4 my-4 rounded-xl shadow-xl overflow-hidden flex-1">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Editar Ciclo - {cicloData.revisao?.nome_arquivo || `Revisao #${revId}`}
            </h2>
            <p className="text-sm text-gray-500">{cicloData.revisao?.data_revisao}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 shrink-0">
          <div className="flex gap-1">
            {BLOCK_TABS.map((tab, idx) => (
              <button
                key={tab.key}
                onClick={() => setActiveBlock(idx)}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeBlock === idx
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {saving && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
              Salvando...
            </div>
          )}

          {activeBlock === 0 && (
            <BlockDadosGerais
              cicloData={cicloData}
              onSave={(dados) => handleSaveBlock('dados_gerais', dados)}
            />
          )}

          {activeBlock === 1 && (
            <BlockValoresStakeholders
              cicloData={cicloData}
              stakeholdersMap={stakeholdersMap}
              onStakeholdersChange={handleStakeholdersChange}
              onRecalcular={handleRecalcular}
              onSave={() => handleSaveBlock('valores_stakeholders')}
              questoesMap={questoesMap}
              onQuestoesChange={handleQuestoesChange}
            />
          )}

          {activeBlock === 2 && (
            <BlockBeneficiosStakeholders
              cicloData={cicloData}
              stakeholdersMap={stakeholdersMap}
              onStakeholdersChange={handleStakeholdersChange}
              onRecalcular={handleRecalcular}
              onSave={() => handleSaveBlock('beneficios_stakeholders')}
            />
          )}

          {activeBlock === 3 && (
            <BlockPropagacao
              cicloData={cicloData}
              onSave={() => handleSaveBlock('propagacao')}
            />
          )}

          {activeBlock === 4 && (
            <BlockSinergias
              cicloData={cicloData}
              onSave={() => handleSaveBlock('sinergias')}
            />
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={handleAtualizarSnapshot}
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg px-5 py-2 text-sm font-medium"
          >
            Atualizar Snapshot
          </button>
          <button
            onClick={() => { onReload(); onClose(); }}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg px-5 py-2 text-sm font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function P10_Revisoes({ projetoAtivo }) {
  const [lista, setLista] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [snapshot, setSnapshot] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cicloRevId, setCicloRevId] = useState(null);

  const load = () => {
    if (!projetoAtivo) return;
    revisoes.listByProjeto(projetoAtivo).then(setLista);
  };

  useEffect(() => { load(); }, [projetoAtivo]);

  if (!projetoAtivo) return <div><StepHeader numero={10} titulo="Revisoes" descricao="Ciclos de revisao continua" /><EmptyState /></div>;

  const handleCreate = async () => {
    await revisoes.create(projetoAtivo, { descricao });
    setDescricao('');
    setShowCreateModal(false);
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
      <StepHeader numero={10} titulo="Revisoes" descricao="Ciclos de revisao continua - gere snapshots periodicos" />

      <div className="mb-6 flex justify-end">
        <button onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          + Nova Revisão
        </button>
      </div>

      <FormModal open={showCreateModal} onClose={() => { setShowCreateModal(false); setDescricao(''); }} title="Gerar Nova Revisão" maxWidth="max-w-xl">
        <p className="text-sm text-gray-500 mb-4">
          Uma revisao captura um snapshot completo de todos os dados do projeto neste momento (stakeholders, valores, beneficios, propagacoes e sinergias).
        </p>
        <FormField label="Notas da Revisão (opcional)" value={descricao} onChange={setDescricao} placeholder="Observações sobre esta revisão..." />
        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={() => { setShowCreateModal(false); setDescricao(''); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Cancelar</button>
          <button onClick={handleCreate} className="bg-primary-600 hover:bg-primary-700 text-white rounded-lg px-6 py-2 text-sm font-medium">
            Gerar Revisão
          </button>
        </div>
      </FormModal>

      {/* Revision List */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Historico de Revisoes</h3>
      {lista.length > 0 ? (
        <div className="space-y-3">
          {lista.map((rev) => (
            <div key={rev.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800">{rev.nome_arquivo}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      rev.status === 'Encerrado'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {rev.status || 'Aberto'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {rev.data_revisao} {rev.descricao && `\u2014 ${rev.descricao}`}
                  </p>
                  {rev.etapa_projeto && (
                    <p className="text-xs text-gray-400 mt-1">Etapa: {rev.etapa_projeto}</p>
                  )}
                  {rev.proxima_revisao_sugerida && (
                    <p className="text-xs text-gray-400 mt-1">Proxima revisao sugerida: {rev.proxima_revisao_sugerida}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {(!rev.status || rev.status === 'Aberto') && (
                    <button
                      onClick={() => setCicloRevId(rev.id)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      Editar Ciclo
                    </button>
                  )}
                  <button
                    onClick={() => handleViewSnapshot(rev)}
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    Ver Snapshot
                  </button>
                  {(!rev.status || rev.status === 'Aberto') && (
                    <button
                      onClick={async () => { await revisoes.encerrar(rev.id); load(); }}
                      className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                    >
                      Encerrar Ciclo
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(rev)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-400">Nenhuma revisao gerada ainda.</p>
        </div>
      )}

      {/* Snapshot Viewer Modal */}
      <FormModal open={!!snapshot} onClose={() => setSnapshot(null)} title={`Snapshot - ${snapshot?.nome_arquivo || ''}`} maxWidth="max-w-4xl">
        {snapshot?.snapshot_dados && (
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
              <h4 className="font-semibold text-primary-700 mb-2">Beneficios ({snapshot.snapshot_dados.beneficios?.length || 0})</h4>
              <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(snapshot.snapshot_dados.beneficios, null, 2)}</pre>
            </div>
            <div>
              <h4 className="font-semibold text-primary-700 mb-2">Propagacoes ({snapshot.snapshot_dados.propagacoes?.length || 0})</h4>
              <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(snapshot.snapshot_dados.propagacoes, null, 2)}</pre>
            </div>
            <div>
              <h4 className="font-semibold text-primary-700 mb-2">Sinergias ({snapshot.snapshot_dados.sinergias?.length || 0})</h4>
              <pre className="bg-gray-50 p-3 rounded-lg overflow-x-auto text-xs">{JSON.stringify(snapshot.snapshot_dados.sinergias, null, 2)}</pre>
            </div>
          </div>
        )}
      </FormModal>

      {/* Cycle Editor Modal */}
      {cicloRevId && (
        <CycleEditorModal
          revId={cicloRevId}
          onClose={() => setCicloRevId(null)}
          onReload={load}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir Revisao"
        message={`Deseja excluir "${deleteTarget?.nome_arquivo}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

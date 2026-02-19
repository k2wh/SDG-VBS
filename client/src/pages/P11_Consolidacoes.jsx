import { useState, useEffect } from 'react';
import StepHeader from '../components/StepHeader';
import EmptyState from '../components/EmptyState';
import { consolidacao } from '../services/api';

// ---- Componentes de gráfico CSS ----

function BarChart({ items, colorMap }) {
  if (!items || items.length === 0) return <p className="text-gray-400 text-sm">Sem dados</p>;
  const max = Math.max(...items.map(i => i.total), 1);
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-700 font-medium">{item.label}</span>
            <span className="text-sm text-gray-500 font-mono">{item.total}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${colorMap?.[item.label] || 'bg-blue-500'}`}
              style={{ width: `${(item.total / max) * 100}%`, minWidth: item.total > 0 ? '24px' : '0' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ items, colors, size = 140 }) {
  if (!items || items.length === 0) return <p className="text-gray-400 text-sm">Sem dados</p>;
  const total = items.reduce((s, i) => s + i.total, 0);
  if (total === 0) return <p className="text-gray-400 text-sm">Sem dados</p>;

  const r = size / 2 - 10;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        {items.map((item, i) => {
          const pct = item.total / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const rotation = (offset / total) * 360 - 90;
          offset += item.total;
          return (
            <circle
              key={i}
              cx={size / 2} cy={size / 2} r={r}
              fill="none" stroke={colors[i % colors.length]} strokeWidth={20}
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
              className="transition-all duration-700"
            />
          );
        })}
        <text x={size / 2} y={size / 2 - 4} textAnchor="middle" className="text-2xl font-bold" fill="#1f2937">{total}</text>
        <text x={size / 2} y={size / 2 + 14} textAnchor="middle" className="text-xs" fill="#6b7280">total</text>
      </svg>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-sm text-gray-700">{item.label}</span>
            <span className="text-sm text-gray-400 font-mono ml-auto">{item.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalienciaChart({ stakeholders }) {
  if (!stakeholders || stakeholders.length === 0) return <p className="text-gray-400 text-sm">Sem dados</p>;
  return (
    <div className="space-y-3">
      {stakeholders.map((sh, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-800">{sh.nome}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${sh.tipo === 'Interno' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
              {sh.tipo}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Poder', value: sh.poder, color: 'bg-red-400' },
              { label: 'Legitimidade', value: sh.legitimidade, color: 'bg-blue-400' },
              { label: 'Urgencia', value: sh.urgencia, color: 'bg-amber-400' },
            ].map(attr => (
              <div key={attr.label}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-500">{attr.label}</span>
                  <span className="text-xs font-mono text-gray-600">{attr.value}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className={`h-full rounded-full ${attr.color}`} style={{ width: `${(attr.value / 5) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function KpiCard({ icon, label, value, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function EngajamentoChart({ stakeholders }) {
  if (!stakeholders || stakeholders.length === 0) return <p className="text-gray-400 text-sm">Sem dados</p>;
  const max = Math.max(...stakeholders.map(s => s.vinculos_valores + s.vinculos_propagacoes), 1);
  return (
    <div className="space-y-2.5">
      {stakeholders.map((sh, i) => {
        const totalVinculos = sh.vinculos_valores + sh.vinculos_propagacoes;
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">{sh.nome}</span>
              <span className="text-xs text-gray-400">{totalVinculos} vinculos</span>
            </div>
            <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
              {sh.vinculos_valores > 0 && (
                <div
                  className="bg-indigo-500 transition-all duration-700"
                  style={{ width: `${(sh.vinculos_valores / max) * 100}%` }}
                  title={`${sh.vinculos_valores} valor(es)`}
                />
              )}
              {sh.vinculos_propagacoes > 0 && (
                <div
                  className="bg-emerald-500 transition-all duration-700"
                  style={{ width: `${(sh.vinculos_propagacoes / max) * 100}%` }}
                  title={`${sh.vinculos_propagacoes} propagacao(oes)`}
                />
              )}
            </div>
          </div>
        );
      })}
      <div className="flex gap-4 mt-2">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500" /><span className="text-xs text-gray-500">Valores</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-xs text-gray-500">Propagacoes</span></div>
      </div>
    </div>
  );
}

// ---- Icones ----
const iconPaths = {
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  diamond: 'M6 3h12l4 6-10 13L2 9z',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
};

// ---- Cores ----
const statusColors = {
  'Planejado': 'bg-blue-500',
  'Em Andamento': 'bg-amber-500',
  'Realizado': 'bg-emerald-500',
  'Não Realizado': 'bg-red-500',
};

const sinergiaColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const propagacaoColors = ['#6366f1', '#06b6d4', '#84cc16', '#f97316', '#ec4899'];

const tendenciaColors = {
  'Crescimento': 'bg-emerald-500',
  'Estável': 'bg-blue-500',
  'Redução': 'bg-red-500',
};

// ---- Página ----

export default function P11_Consolidacoes({ projetoAtivo }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projetoAtivo) return;
    setLoading(true);
    consolidacao.get(projetoAtivo).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [projetoAtivo]);

  if (!projetoAtivo) return <div><StepHeader numero={11} titulo="Consolidacoes" descricao="Analises e consolidacoes" /><EmptyState /></div>;

  if (loading || !data) return (
    <div>
      <StepHeader numero={11} titulo="Consolidacoes" descricao="Analises e consolidacoes" />
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
      </div>
    </div>
  );

  const kpis = [
    { icon: iconPaths.users, label: 'Stakeholders', value: data.totalStakeholders, color: 'bg-blue-600', subtitle: 'Vinculados ao projeto' },
    { icon: iconPaths.diamond, label: 'Valores', value: data.totalValores, color: 'bg-indigo-600', subtitle: 'Valores identificados' },
    { icon: iconPaths.target, label: 'Beneficios', value: data.totalBeneficios, color: 'bg-emerald-600', subtitle: 'Beneficios mapeados' },
    { icon: iconPaths.share, label: 'Propagacoes', value: data.totalPropagacoes, color: 'bg-amber-600', subtitle: 'Fluxos de propagacao' },
    { icon: iconPaths.link, label: 'Sinergias', value: data.totalSinergias, color: 'bg-purple-600', subtitle: 'Relacoes entre beneficios' },
    { icon: iconPaths.calendar, label: 'Revisoes', value: data.totalRevisoes, color: 'bg-pink-600', subtitle: 'Ciclos de revisao' },
  ];

  return (
    <div>
      <StepHeader numero={11} titulo="Consolidacoes" descricao="Visao consolidada e analises do projeto" />

      {/* Header do Projeto */}
      {data.projeto && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">{data.projeto.codigo}</p>
              <h2 className="text-2xl font-bold mt-1">{data.projeto.nome}</h2>
              <div className="flex items-center gap-4 mt-2">
                {data.projeto.status && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">{data.projeto.status}</span>
                )}
                {data.projeto.abordagem_gestao && (
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">{data.projeto.abordagem_gestao}</span>
                )}
                {data.projeto.duracao && (
                  <span className="text-blue-200 text-sm">{data.projeto.duracao}</span>
                )}
              </div>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-5xl font-bold opacity-30">
                {data.totalBeneficios + data.totalValores + data.totalStakeholders}
              </p>
              <p className="text-blue-200 text-xs mt-1">elementos mapeados</p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* Linha 1: Status dos Benefícios + Sinergias por Tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-emerald-500"><path d={iconPaths.target} /></svg>
            Status dos Beneficios
          </h3>
          <BarChart
            items={(data.beneficiosPorStatus || []).map(b => ({ label: b.status_realizacao, total: b.total }))}
            colorMap={statusColors}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-purple-500"><path d={iconPaths.link} /></svg>
            Sinergias por Tipo
          </h3>
          <DonutChart
            items={(data.sinergiasPorTipo || []).map(s => ({ label: s.tipo_relacao, total: s.total }))}
            colors={sinergiaColors}
          />
        </div>
      </div>

      {/* Linha 2: Propagações + Valores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-amber-500"><path d={iconPaths.share} /></svg>
            Propagacoes por Tendencia
          </h3>
          <BarChart
            items={(data.propagacoesPorTendencia || []).map(p => ({ label: p.tendencia, total: p.total }))}
            colorMap={tendenciaColors}
          />
          {data.propagacoesPorTipo && data.propagacoesPorTipo.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Por Tipo de Propagacao</h4>
              <DonutChart
                items={data.propagacoesPorTipo.map(p => ({ label: p.tipo_propagacao, total: p.total }))}
                colors={propagacaoColors}
                size={120}
              />
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-indigo-500"><path d={iconPaths.diamond} /></svg>
            Distribuicao de Valores
          </h3>
          {data.valoresPorTemporalidade && data.valoresPorTemporalidade.length > 0 && (
            <div className="mb-5">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Por Temporalidade</h4>
              <div className="flex gap-3 flex-wrap">
                {data.valoresPorTemporalidade.map((v, i) => (
                  <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-center min-w-[100px]">
                    <p className="text-2xl font-bold text-indigo-700">{v.total}</p>
                    <p className="text-xs text-indigo-500 font-medium mt-0.5">{v.temporalidade}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {data.valoresPorNatureza && data.valoresPorNatureza.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">Por Natureza</h4>
              <div className="flex gap-3 flex-wrap">
                {data.valoresPorNatureza.map((v, i) => (
                  <div key={i} className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-center min-w-[100px]">
                    <p className="text-2xl font-bold text-blue-700">{v.total}</p>
                    <p className="text-xs text-blue-500 font-medium mt-0.5">{v.natureza}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Linha 3: Saliência dos Stakeholders + Engajamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-blue-500"><path d={iconPaths.users} /></svg>
            Saliencia dos Stakeholders
          </h3>
          {data.salienciaMedia && (
            <div className="flex gap-4 mb-4">
              {[
                { label: 'Poder', value: data.salienciaMedia.media_poder, color: 'text-red-600' },
                { label: 'Legitimidade', value: data.salienciaMedia.media_legitimidade, color: 'text-blue-600' },
                { label: 'Urgencia', value: data.salienciaMedia.media_urgencia, color: 'text-amber-600' },
              ].map(m => (
                <div key={m.label} className="text-center">
                  <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-xs text-gray-400">Media {m.label}</p>
                </div>
              ))}
            </div>
          )}
          <SalienciaChart stakeholders={data.stakeholdersSaliencia} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-emerald-500">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            Engajamento dos Stakeholders
          </h3>
          <EngajamentoChart stakeholders={data.stakeholdersEngajamento} />
          {data.stakeholdersPorTipo && data.stakeholdersPorTipo.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-600 mb-3">Distribuicao por Tipo</h4>
              <div className="flex gap-3">
                {data.stakeholdersPorTipo.map((t, i) => (
                  <div key={i} className={`flex-1 rounded-lg p-3 text-center ${t.tipo === 'Interno' ? 'bg-blue-50 border border-blue-100' : 'bg-amber-50 border border-amber-100'}`}>
                    <p className={`text-2xl font-bold ${t.tipo === 'Interno' ? 'text-blue-700' : 'text-amber-700'}`}>{t.total}</p>
                    <p className={`text-xs font-medium ${t.tipo === 'Interno' ? 'text-blue-500' : 'text-amber-500'}`}>{t.tipo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Linha 4: Tabela de Benefícios Detalhados */}
      {data.beneficiosDetalhados && data.beneficiosDetalhados.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4">Mapa de Beneficios</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Beneficio</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Valor Associado</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Natureza</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Classe</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.beneficiosDetalhados.map((b, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm text-gray-800 font-medium">{b.descricao}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-600">{b.valor_descricao || '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-600">{b.natureza || '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-600">{b.classe || '-'}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.status_realizacao === 'Realizado' ? 'bg-emerald-100 text-emerald-800' :
                        b.status_realizacao === 'Em Andamento' ? 'bg-amber-100 text-amber-800' :
                        b.status_realizacao === 'Não Realizado' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {b.status_realizacao}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Linha 5: Timeline de Revisões */}
      {data.revisoes && data.revisoes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 text-pink-500"><path d={iconPaths.calendar} /></svg>
            Timeline de Revisoes
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
            <div className="space-y-6">
              {data.revisoes.map((rev, i) => {
                let snapshot = null;
                try { snapshot = typeof rev.snapshot_dados === 'string' ? JSON.parse(rev.snapshot_dados) : rev.snapshot_dados; } catch {}
                return (
                  <div key={rev.id} className="relative flex gap-4 pl-0">
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0 relative z-[1]">
                      {i + 1}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 -mt-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-800">{rev.nome_arquivo}</p>
                        <span className="text-xs text-gray-400 font-mono">{rev.data_revisao}</span>
                      </div>
                      {rev.descricao && <p className="text-sm text-gray-600 mb-2">{rev.descricao}</p>}
                      {snapshot && (
                        <div className="flex gap-2 flex-wrap">
                          {snapshot.valores !== undefined && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{typeof snapshot.valores === 'number' ? snapshot.valores : snapshot.valores?.length || 0} valores</span>}
                          {snapshot.beneficios !== undefined && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{typeof snapshot.beneficios === 'number' ? snapshot.beneficios : snapshot.beneficios?.length || 0} beneficios</span>}
                          {snapshot.stakeholders !== undefined && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{typeof snapshot.stakeholders === 'number' ? snapshot.stakeholders : snapshot.stakeholders?.length || 0} stakeholders</span>}
                          {snapshot.propagacoes !== undefined && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{typeof snapshot.propagacoes === 'number' ? snapshot.propagacoes : snapshot.propagacoes?.length || 0} propagacoes</span>}
                          {snapshot.sinergias !== undefined && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{typeof snapshot.sinergias === 'number' ? snapshot.sinergias : snapshot.sinergias?.length || 0} sinergias</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

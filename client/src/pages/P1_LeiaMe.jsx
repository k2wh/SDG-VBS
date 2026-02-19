import StepHeader from '../components/StepHeader';

export default function P1_LeiaMe() {
  return (
    <div>
      <StepHeader numero={1} titulo="Leia-me" descricao="Compreensão do sistema e seus princípios" />

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-primary-700 mb-3">O que é o SDG-VBS?</h3>
          <p className="text-gray-600 leading-relaxed">
            O <strong>Sistema Dinâmico de Gestão do Valor e Benefícios a partir da Perspectiva de Múltiplos Stakeholders (SDG-VBS)</strong> constitui
            um framework prescritivo que integra os constructos de valor, benefícios e stakeholders em um modelo adaptativo. Esse modelo permite o
            monitoramento contínuo da evolução do valor e dos benefícios percebidos ao longo do ciclo de vida do projeto.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-primary-700 mb-3">Princípios Fundamentais</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">●</span>
              O valor e a realização de benefícios são processos dinâmicos e subjetivos
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">●</span>
              Decorrem de interações complexas que evoluem ao longo do tempo
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">●</span>
              Admitem variações perceptuais entre stakeholders conforme interesses, expectativas e influência
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 mt-1">●</span>
              O sistema oferece suporte à tomada de decisões de governança orientadas pelo valor percebido
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-primary-700 mb-4">Fluxo Operacional — 11 Passos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { n: 1, t: 'Leia-me', d: 'Compreensão do sistema' },
              { n: 2, t: 'Organização', d: 'Registro da organização e plano estratégico' },
              { n: 3, t: 'Gestores', d: 'Cadastro de gestores e responsáveis' },
              { n: 4, t: 'Projetos', d: 'Cadastro de projetos (elemento central)' },
              { n: 5, t: 'Stakeholders', d: 'Cadastro central e avaliação de saliência' },
              { n: 6, t: 'DPD Valor', d: 'Diagnóstico e planejamento do valor' },
              { n: 7, t: 'GADB Benefícios', d: 'Identificação e definição dos benefícios' },
              { n: 8, t: 'Propagação', d: 'Análise da propagação dos benefícios' },
              { n: 9, t: 'Sinergias', d: 'Análise de sinergia entre benefícios' },
              { n: 10, t: 'Revisões', d: 'Ciclos de revisão contínua' },
              { n: 11, t: 'Consolidações', d: 'Análises e consolidações' },
            ].map((step) => (
              <div key={step.n} className="flex items-center gap-3 p-3 rounded-lg bg-primary-50 border border-primary-100">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold shrink-0">
                  {step.n}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{step.t}</p>
                  <p className="text-xs text-gray-500">{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm text-blue-800">
            <strong>Como começar:</strong> Navegue pelos passos na ordem indicada na barra lateral. Comece registrando sua organização (Passo 2),
            depois cadastre os gestores (Passo 3) e em seguida crie seu primeiro projeto (Passo 4).
          </p>
        </div>
      </div>
    </div>
  );
}

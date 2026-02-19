const db = require('./db');

const force = process.argv.includes('--force');

// Verifica se já tem dados
const count = db.prepare('SELECT COUNT(*) as c FROM organizacoes').get();
if (count.c > 0 && !force) {
  console.log('Banco já possui dados. Use --force para limpar e reinserir.');
  process.exit(0);
}

if (force) {
  console.log('Limpando tabelas existentes...');
  db.pragma('foreign_keys = OFF');
  db.exec('DELETE FROM revisoes');
  db.exec('DELETE FROM sinergias');
  db.exec('DELETE FROM propagacoes');
  db.exec('DELETE FROM beneficio_stakeholders');
  db.exec('DELETE FROM beneficios');
  db.exec('DELETE FROM valor_stakeholders');
  db.exec('DELETE FROM valores');
  db.exec('DELETE FROM projeto_stakeholders');
  db.exec('DELETE FROM stakeholders');
  db.exec('DELETE FROM projetos');
  db.exec('DELETE FROM gestores');
  db.exec('DELETE FROM organizacoes');
  // Reset autoincrement counters
  db.exec("DELETE FROM sqlite_sequence");
  db.pragma('foreign_keys = ON');
}

console.log('Inserindo dados fictícios...');

// === ORGANIZAÇÕES ===
const insertOrg = db.prepare('INSERT INTO organizacoes (nome, segmento, resumo_estrategico, horizonte_temporal) VALUES (?, ?, ?, ?)');
insertOrg.run('TechNova Soluções', 'Tecnologia da Informação', 'Expandir a presença digital e fortalecer a plataforma SaaS para PMEs. Foco em inovação, escalabilidade e experiência do cliente.', '2024-2028');
insertOrg.run('Construtora Horizonte', 'Construção Civil', 'Consolidar liderança regional em empreendimentos sustentáveis, incorporando práticas ESG em todos os projetos.', '2024-2027');

// === GESTORES ===
const insertGestor = db.prepare('INSERT INTO gestores (nome, cargo, departamento, email, telefone) VALUES (?, ?, ?, ?, ?)');
insertGestor.run('Carlos Eduardo Silva', 'Diretor de Projetos', 'PMO', 'carlos.silva@technova.com', '(11) 99876-5432');
insertGestor.run('Ana Paula Ferreira', 'Gerente de TI', 'Tecnologia', 'ana.ferreira@technova.com', '(11) 98765-4321');
insertGestor.run('Roberto Almeida', 'Diretor Executivo', 'Diretoria', 'roberto@technova.com', '(11) 97654-3210');
insertGestor.run('Mariana Costa', 'Coordenadora de Qualidade', 'Qualidade', 'mariana.costa@horizonte.com', '(21) 99123-4567');
insertGestor.run('Felipe Santos', 'Gerente de Obras', 'Engenharia', 'felipe.santos@horizonte.com', '(21) 98234-5678');
insertGestor.run('Juliana Mendes', 'Diretora Financeira', 'Financeiro', 'juliana@horizonte.com', '(21) 97345-6789');

// === PROJETOS ===
const insertProjeto = db.prepare('INSERT INTO projetos (organizacao_id, codigo, nome, objetivo, duracao, status, gestor_id, patrocinador_id, responsavel_id, area_responsavel, abordagem_gestao, vinculo_acao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
insertProjeto.run(1, 'PRJ-001', 'Plataforma SaaS 2.0', 'Redesenhar a plataforma SaaS atual para suportar multi-tenancy, melhorar a performance e adicionar módulo de analytics avançado.', '18 meses', 'Execução', 1, 3, 2, 'Tecnologia', 'Iterativa', 'OE-01: Expansão Digital');
insertProjeto.run(1, 'PRJ-002', 'Migração Cloud AWS', 'Migrar toda a infraestrutura on-premise para AWS, garantindo alta disponibilidade e redução de custos operacionais.', '8 meses', 'Planejamento', 2, 3, 1, 'Infraestrutura', 'Híbrida', 'OE-02: Modernização Infraestrutura');
insertProjeto.run(2, 'PRJ-003', 'Edifício Verde Ipanema', 'Construção de edifício residencial sustentável com certificação LEED, 20 andares, no bairro de Ipanema.', '24 meses', 'Execução', 5, 6, 4, 'Engenharia', 'Preditiva', 'OE-01: Empreendimentos Sustentáveis');

// === STAKEHOLDERS ===
const insertSH = db.prepare('INSERT INTO stakeholders (nome, papel, tipo, origem, interesses, contato, poder, legitimidade, urgencia) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
insertSH.run('Equipe de Desenvolvimento', 'Desenvolvedores', 'Interno', 'TI', 'Utilizar tecnologias modernas, manter qualidade do código, prazos viáveis', '(11) 91111-2222', 3, 4, 3);
insertSH.run('Clientes PME', 'Usuários finais', 'Externo', 'Mercado', 'Plataforma estável, preço acessível, suporte ágil, novas funcionalidades', '(11) 92222-3333', 5, 5, 4);
insertSH.run('Investidores Série A', 'Acionistas', 'Externo', 'Financeiro', 'Retorno sobre investimento, crescimento de receita, escalabilidade', '(11) 93333-4444', 5, 4, 3);
insertSH.run('Prefeitura Municipal', 'Regulador', 'Externo', 'Governo', 'Cumprimento de normas urbanísticas, sustentabilidade, geração de empregos', '(21) 94444-5555', 4, 5, 2);
insertSH.run('Moradores do Entorno', 'Comunidade', 'Externo', 'Sociedade', 'Minimizar impactos da obra, valorização imobiliária, segurança', '(21) 95555-6666', 2, 3, 4);
insertSH.run('Fornecedores de Materiais', 'Parceiros', 'Externo', 'Cadeia de Suprimentos', 'Contratos de longo prazo, pagamentos em dia, volume de compras', '(21) 96666-7777', 3, 3, 3);
insertSH.run('Equipe de Infraestrutura', 'Administradores de Sistemas', 'Interno', 'TI', 'Ferramentas adequadas, documentação clara, estabilidade', '(11) 97777-8888', 3, 4, 4);
insertSH.run('Compradores de Unidades', 'Clientes', 'Externo', 'Mercado Imobiliário', 'Qualidade do acabamento, prazo de entrega, valorização', '(21) 98888-9999', 4, 5, 5);

// === PROJETO_STAKEHOLDERS ===
const insertPS = db.prepare('INSERT INTO projeto_stakeholders (projeto_id, stakeholder_id, papel_no_projeto) VALUES (?, ?, ?)');
// PRJ-001
insertPS.run(1, 1, 'Equipe de execução técnica');
insertPS.run(1, 2, 'Beneficiários diretos');
insertPS.run(1, 3, 'Patrocinadores financeiros');
insertPS.run(1, 7, 'Suporte de infraestrutura');
// PRJ-002
insertPS.run(2, 1, 'Equipe de migração');
insertPS.run(2, 7, 'Responsáveis pela infraestrutura atual');
insertPS.run(2, 3, 'Aprovação de investimento');
// PRJ-003
insertPS.run(3, 4, 'Aprovador regulatório');
insertPS.run(3, 5, 'Partes impactadas');
insertPS.run(3, 6, 'Fornecimento de materiais');
insertPS.run(3, 8, 'Beneficiários finais');

// === VALORES (Passo 6) ===
const insertValor = db.prepare('INSERT INTO valores (projeto_id, descricao, tipo, natureza, temporalidade, conflitos, riscos, criterios_mensuracao, frequencia_revisao, proxima_revisao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
insertValor.run(1, 'Aumento da satisfação dos clientes PME com a nova plataforma', 'Estratégico', 'Tangível', 'Emergente', 'Possível resistência a mudanças de interface por parte de clientes antigos', 'Atraso na entrega pode comprometer percepção de valor', 'NPS, taxa de churn, tickets de suporte', 'Mensal', '2026-03-15');
insertValor.run(1, 'Escalabilidade técnica para crescimento de 10x', 'Técnico', 'Intangível', 'Ex-ante', 'Trade-off entre velocidade de entrega e qualidade arquitetural', 'Débito técnico se priorizar velocidade', 'Tempo de resposta, uptime, capacidade concurrent users', 'Trimestral', '2026-06-01');
insertValor.run(1, 'Retorno sobre investimento para acionistas', 'Financeiro', 'Tangível', 'Adaptativa', 'Conflito entre investir em features vs. estabilidade', 'Mercado pode mudar direção competitiva', 'ROI, MRR, CAC/LTV', 'Mensal', '2026-03-01');
insertValor.run(3, 'Sustentabilidade e certificação LEED do empreendimento', 'Ambiental', 'Tangível', 'Ex-ante', 'Custo adicional vs. benefício ambiental de longo prazo', 'Fornecedores podem não atender padrões sustentáveis', 'Pontuação LEED, consumo energético projetado', 'Bimestral', '2026-04-01');
insertValor.run(3, 'Qualidade de vida e valorização imobiliária', 'Social', 'Intangível', 'Emergente', 'Moradores do entorno podem ter resistência durante a obra', 'Atrasos podem reduzir confiança dos compradores', 'Pesquisa de satisfação, valorização m²', 'Trimestral', '2026-06-15');

// === VALOR_STAKEHOLDERS ===
const insertVS = db.prepare('INSERT INTO valor_stakeholders (valor_id, stakeholder_id, perspectiva) VALUES (?, ?, ?)');
insertVS.run(1, 2, 'Esperam interface mais intuitiva e funcionalidades que economizem tempo');
insertVS.run(1, 1, 'Querem construir produto de qualidade com tecnologia moderna');
insertVS.run(2, 1, 'Percebem como oportunidade de trabalhar com arquitetura escalável');
insertVS.run(2, 7, 'Preocupados com complexidade operacional da nova arquitetura');
insertVS.run(3, 3, 'Focam no retorno financeiro e métricas de crescimento');
insertVS.run(4, 4, 'Valorizam cumprimento de normas ambientais e urbanas');
insertVS.run(4, 8, 'Veem sustentabilidade como diferencial de valorização');
insertVS.run(5, 5, 'Esperam mínimo impacto durante obra e valorização do bairro');
insertVS.run(5, 8, 'Priorizam qualidade de acabamento e prazo de entrega');

// === BENEFÍCIOS (Passo 7) ===
const insertBen = db.prepare('INSERT INTO beneficios (valor_id, projeto_id, descricao, natureza, classe, temporalidade, responsavel, forma_avaliacao, riscos, quando_realizar, como_realizar, frequencia_revisao, proxima_revisao, status_realizacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
insertBen.run(1, 1, 'Redução de 40% nos tickets de suporte', 'Operacional', 'Direto', 'Curto prazo', 'Ana Paula Ferreira', 'Contagem mensal de tickets', 'Bugs na nova versão podem aumentar tickets temporariamente', 'Após launch da v2.0', 'Redesign de UX baseado em feedback dos usuários', 'Mensal', '2026-03-15', 'Em Andamento');
insertBen.run(1, 1, 'Aumento de 25% no NPS', 'Estratégico', 'Direto', 'Médio prazo', 'Carlos Eduardo Silva', 'Pesquisa NPS trimestral', 'Transição pode causar queda temporária', 'Q2 2026', 'Pesquisas regulares com usuários beta', 'Trimestral', '2026-06-01', 'Planejado');
insertBen.run(2, 1, 'Suportar 10.000 usuários simultâneos', 'Técnico', 'Habilitador', 'Médio prazo', 'Ana Paula Ferreira', 'Testes de carga', 'Arquitetura pode ter gargalos não previstos', 'Durante fase de desenvolvimento', 'Arquitetura baseada em microsserviços', 'Mensal', '2026-04-01', 'Em Andamento');
insertBen.run(3, 1, 'Crescimento de 50% no MRR em 12 meses', 'Financeiro', 'Final', 'Longo prazo', 'Roberto Almeida', 'Dashboard financeiro', 'Competição pode comprometer aquisição', 'Ao longo do próximo ano fiscal', 'Estratégia de pricing e upsell', 'Mensal', '2026-03-01', 'Planejado');
insertBen.run(4, 3, 'Obtenção da certificação LEED Gold', 'Ambiental', 'Final', 'Longo prazo', 'Mariana Costa', 'Auditoria LEED', 'Materiais podem não atender requisitos', 'Ao final da obra', 'Seleção criteriosa de materiais e processos construtivos', 'Bimestral', '2026-04-01', 'Em Andamento');
insertBen.run(5, 3, 'Valorização de 30% do m² em relação ao entorno', 'Financeiro', 'Final', 'Longo prazo', 'Felipe Santos', 'Comparativo de mercado', 'Crise imobiliária pode reduzir valorização', 'Pós-entrega', 'Design premium + certificação ambiental', 'Trimestral', '2026-06-15', 'Planejado');

// === PROPAGAÇÕES (Passo 8) ===
const insertProp = db.prepare('INSERT INTO propagacoes (beneficio_id, stakeholder_origem_id, stakeholder_destino_id, tipo_propagacao, efeitos_colaterais, tendencia, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?)');
insertProp.run(1, 1, 2, 'Adoção', 'Curva de aprendizado inicial para usuários', 'Crescimento', 'Equipe de dev entrega melhorias de UX que beneficiam diretamente os clientes PME');
insertProp.run(2, 2, 3, 'Expansão', 'Pressão por mais funcionalidades pode sobrecarregar equipe', 'Crescimento', 'Clientes satisfeitos geram métricas positivas que atraem mais investidores');
insertProp.run(3, 7, 1, 'Estabilização', 'Maior complexidade de infraestrutura', 'Estável', 'Infraestrutura escalável permite que devs foquem em features');
insertProp.run(5, 4, 8, 'Adoção', 'Aumento de burocracia nos processos', 'Crescimento', 'Certificação LEED aprovada pela prefeitura agrega valor percebido pelos compradores');
insertProp.run(6, 8, 5, 'Expansão', 'Maior trânsito e impacto urbano durante vendas', 'Crescimento', 'Valorização do empreendimento se propaga para o entorno beneficiando moradores');

// === SINERGIAS (Passo 9) ===
const insertSin = db.prepare('INSERT INTO sinergias (beneficio_a_id, beneficio_b_id, tipo_relacao, descricao, impacto) VALUES (?, ?, ?, ?, ?)');
insertSin.run(1, 2, 'Sinergia', 'Redução de tickets melhora NPS e vice-versa', 'Ambos se reforçam mutuamente criando um ciclo virtuoso de satisfação');
insertSin.run(2, 4, 'Complementaridade', 'NPS alto justifica investimento e melhora métricas financeiras', 'Satisfação do cliente alimenta crescimento de receita');
insertSin.run(3, 1, 'Dependência', 'Escalabilidade é pré-requisito para redução de tickets em volume', 'Sem escalabilidade, a plataforma não suportaria a base crescente');
insertSin.run(5, 6, 'Sinergia', 'Certificação LEED impulsiona valorização imobiliária', 'A sustentabilidade certificada é diferencial competitivo que maximiza valorização');

// === REVISÕES (Passo 10) ===
const insertRev = db.prepare('INSERT INTO revisoes (projeto_id, data_revisao, descricao, snapshot_dados, nome_arquivo) VALUES (?, ?, ?, ?, ?)');
insertRev.run(1, '2026-01-15', 'Revisão inicial do projeto. Definição de valores e primeiros benefícios mapeados. Equipe alinhada com objetivos.', JSON.stringify({ valores: 3, beneficios: 4, stakeholders: 4, propagacoes: 3, sinergias: 3 }), '15012026 - Plataforma SaaS 2.0');
insertRev.run(3, '2026-02-01', 'Revisão de acompanhamento do Edifício Verde. Certificação LEED em progresso, stakeholders externos engajados.', JSON.stringify({ valores: 2, beneficios: 2, stakeholders: 4, propagacoes: 2, sinergias: 1 }), '01022026 - Edifício Verde Ipanema');

console.log('Dados fictícios inseridos com sucesso!');
console.log('  - 2 organizações');
console.log('  - 6 gestores');
console.log('  - 3 projetos');
console.log('  - 8 stakeholders');
console.log('  - 11 vínculos projeto-stakeholder');
console.log('  - 5 valores');
console.log('  - 9 vínculos valor-stakeholder');
console.log('  - 6 benefícios');
console.log('  - 5 propagações');
console.log('  - 4 sinergias');
console.log('  - 2 revisões');

process.exit(0);

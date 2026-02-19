const API = '/api';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Organizações
export const organizacoes = {
  list: () => request(`${API}/organizacoes`),
  get: (id) => request(`${API}/organizacoes/${id}`),
  create: (data) => request(`${API}/organizacoes`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${API}/organizacoes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`${API}/organizacoes/${id}`, { method: 'DELETE' }),
};

// Gestores
export const gestores = {
  list: () => request(`${API}/gestores`),
  get: (id) => request(`${API}/gestores/${id}`),
  create: (data) => request(`${API}/gestores`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${API}/gestores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`${API}/gestores/${id}`, { method: 'DELETE' }),
};

// Projetos
export const projetos = {
  list: () => request(`${API}/projetos`),
  get: (id) => request(`${API}/projetos/${id}`),
  create: (data) => request(`${API}/projetos`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${API}/projetos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`${API}/projetos/${id}`, { method: 'DELETE' }),
  addStakeholder: (id, data) => request(`${API}/projetos/${id}/stakeholders`, { method: 'POST', body: JSON.stringify(data) }),
  removeStakeholder: (id, sid) => request(`${API}/projetos/${id}/stakeholders/${sid}`, { method: 'DELETE' }),
};

// Stakeholders
export const stakeholders = {
  list: () => request(`${API}/stakeholders`),
  get: (id) => request(`${API}/stakeholders/${id}`),
  create: (data) => request(`${API}/stakeholders`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${API}/stakeholders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`${API}/stakeholders/${id}`, { method: 'DELETE' }),
};

// Valores
export const valores = {
  listByProjeto: (projetoId) => request(`${API}/valores/projeto/${projetoId}`),
  get: (id) => request(`${API}/valores/${id}`),
  create: (data) => request(`${API}/valores`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${API}/valores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`${API}/valores/${id}`, { method: 'DELETE' }),
  addStakeholder: (id, data) => request(`${API}/valores/${id}/stakeholders`, { method: 'POST', body: JSON.stringify(data) }),
  removeStakeholder: (id, sid) => request(`${API}/valores/${id}/stakeholders/${sid}`, { method: 'DELETE' }),
};

// Benefícios
export const beneficios = {
  listByProjeto: (projetoId) => request(`${API}/beneficios/projeto/${projetoId}`),
  listByValor: (valorId) => request(`${API}/beneficios/valor/${valorId}`),
  get: (id) => request(`${API}/beneficios/${id}`),
  create: (data) => request(`${API}/beneficios`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${API}/beneficios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`${API}/beneficios/${id}`, { method: 'DELETE' }),
};

// Propagações
export const propagacoes = {
  listByProjeto: (projetoId) => request(`${API}/propagacoes/projeto/${projetoId}`),
  listByBeneficio: (beneficioId) => request(`${API}/propagacoes/beneficio/${beneficioId}`),
  create: (data) => request(`${API}/propagacoes`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${API}/propagacoes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`${API}/propagacoes/${id}`, { method: 'DELETE' }),
};

// Sinergias
export const sinergias = {
  listByProjeto: (projetoId) => request(`${API}/sinergias/projeto/${projetoId}`),
  create: (data) => request(`${API}/sinergias`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`${API}/sinergias/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id) => request(`${API}/sinergias/${id}`, { method: 'DELETE' }),
};

// Revisões
export const revisoes = {
  listByProjeto: (projetoId) => request(`${API}/revisoes/projeto/${projetoId}`),
  get: (id) => request(`${API}/revisoes/${id}`),
  create: (projetoId, data) => request(`${API}/revisoes/projeto/${projetoId}`, { method: 'POST', body: JSON.stringify(data) }),
  remove: (id) => request(`${API}/revisoes/${id}`, { method: 'DELETE' }),
};

// Consolidação
export const consolidacao = {
  get: (projetoId) => request(`${API}/revisoes/consolidacao/projeto/${projetoId}`),
};

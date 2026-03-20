import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import P1_LeiaMe from './pages/P1_LeiaMe';
import P2_Organizacao from './pages/P2_Organizacao';
import P3_Gestores from './pages/P3_Gestores';
import P4_Projetos from './pages/P4_Projetos';
import P5_Stakeholders from './pages/P5_Stakeholders';
import P6_ValorDPD from './pages/P6_ValorDPD';
import P7_BeneficiosGADB from './pages/P7_BeneficiosGADB';
import P8_Propagacao from './pages/P8_Propagacao';
import P9_Sinergia from './pages/P9_Sinergia';
import P10_Revisoes from './pages/P10_Revisoes';
import P11_Consolidacoes from './pages/P11_Consolidacoes';

function RotaPrivada({ children }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gray-500 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const [projetoAtivo, setProjetoAtivoState] = useState(() => {
    const saved = localStorage.getItem('projetoAtivo');
    return saved ? Number(saved) : null;
  });

  const setProjetoAtivo = (id) => {
    setProjetoAtivoState(id);
    if (id != null) localStorage.setItem('projetoAtivo', id);
    else localStorage.removeItem('projetoAtivo');
  };

  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<RotaPrivada><Layout projetoAtivo={projetoAtivo} setProjetoAtivo={setProjetoAtivo} /></RotaPrivada>}>
        <Route index element={<P1_LeiaMe />} />
        <Route path="/organizacao" element={<P2_Organizacao />} />
        <Route path="/gestores" element={<P3_Gestores />} />
        <Route path="/projetos" element={<P4_Projetos setProjetoAtivo={setProjetoAtivo} />} />
        <Route path="/stakeholders" element={<P5_Stakeholders projetoAtivo={projetoAtivo} />} />
        <Route path="/valor" element={<P6_ValorDPD projetoAtivo={projetoAtivo} />} />
        <Route path="/beneficios" element={<P7_BeneficiosGADB projetoAtivo={projetoAtivo} />} />
        <Route path="/propagacao" element={<P8_Propagacao projetoAtivo={projetoAtivo} />} />
        <Route path="/sinergias" element={<P9_Sinergia projetoAtivo={projetoAtivo} />} />
        <Route path="/revisoes" element={<P10_Revisoes projetoAtivo={projetoAtivo} />} />
        <Route path="/consolidacoes" element={<P11_Consolidacoes projetoAtivo={projetoAtivo} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

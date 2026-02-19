import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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

function App() {
  const [projetoAtivo, setProjetoAtivo] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout projetoAtivo={projetoAtivo} setProjetoAtivo={setProjetoAtivo} />}>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;

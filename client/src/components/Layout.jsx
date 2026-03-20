import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProjectSelector from './ProjectSelector';
import { exportarProjetoXlsx } from '../services/exportXlsx';
import { projetos as projetosApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ projetoAtivo, setProjetoAtivo }) {
  const { usuario, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      let projetoNome = null;
      if (projetoAtivo) {
        const proj = await projetosApi.get(projetoAtivo).catch(() => null);
        projetoNome = proj?.nome;
      }
      await exportarProjetoXlsx(projetoAtivo, projetoNome);
    } catch (err) {
      console.error('Erro ao exportar:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 shrink-0 sticky top-0 z-[5]">
          <h1 className="text-base font-semibold text-gray-700 tracking-tight">
            Sistema Dinamico de Gestao do Valor e Beneficios
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
              title="Exportar todos os dados para Excel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              {exporting ? 'Exportando...' : 'Exportar XLSX'}
            </button>
            <ProjectSelector projetoAtivo={projetoAtivo} setProjetoAtivo={setProjetoAtivo} />
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <span className="text-sm text-gray-500">{usuario?.nome}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                title="Sair"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

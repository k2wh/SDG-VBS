import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProjectSelector from './ProjectSelector';

export default function Layout({ projetoAtivo, setProjetoAtivo }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-6 shrink-0 sticky top-0 z-[5]">
          <h1 className="text-base font-semibold text-gray-700 tracking-tight">
            Sistema Dinamico de Gestao do Valor e Beneficios
          </h1>
          <ProjectSelector projetoAtivo={projetoAtivo} setProjetoAtivo={setProjetoAtivo} />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

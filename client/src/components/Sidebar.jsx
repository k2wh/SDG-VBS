import { NavLink } from 'react-router-dom';

const Icon = ({ d, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 shrink-0" {...props}>
    <path d={d} />
  </svg>
);

const icons = {
  book: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  building: 'M3 21h18M3 7v14M21 7v14M6 11h.01M6 15h.01M6 7h.01M10 11h.01M10 15h.01M10 7h.01M14 11h.01M14 15h.01M14 7h.01M18 11h.01M18 15h.01M18 7h.01M6 3h12v4H6z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  folder: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z',
  handshake: 'M11 17a1 1 0 0 1-1 1H7a5 5 0 0 1-5-5V7h4l4 4M13 17a1 1 0 0 0 1 1h3a5 5 0 0 0 5-5V7h-4l-4 4M7 7l5-5 5 5',
  diamond: 'M6 3h12l4 6-10 13L2 9z',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  share: 'M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  chart: 'M18 20V10M12 20V4M6 20v-6',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
};

const steps = [
  { path: '/', label: 'Leia-me', num: 1, icon: 'book' },
  { path: '/organizacao', label: 'Organizacao', num: 2, icon: 'building' },
  { path: '/gestores', label: 'Gestores', num: 3, icon: 'users' },
  { path: '/projetos', label: 'Projetos', num: 4, icon: 'folder' },
  { path: '/stakeholders', label: 'Stakeholders', num: 5, icon: 'handshake' },
  { path: '/valor', label: 'DPD Valor', num: 6, icon: 'diamond' },
  { path: '/beneficios', label: 'GADB Beneficios', num: 7, icon: 'target' },
  { path: '/propagacao', label: 'Propagacao', num: 8, icon: 'share' },
  { path: '/sinergias', label: 'Sinergias', num: 9, icon: 'link' },
  { path: '/revisoes', label: 'Revisoes', num: 10, icon: 'calendar' },
  { path: '/consolidacoes', label: 'Consolidacoes', num: 11, icon: 'chart' },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  return (
    <aside
      className={`${collapsed ? 'w-[72px]' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 h-screen sticky top-0 flex flex-col shrink-0 shadow-2xl shadow-black/40 z-10 transition-all duration-300 ease-in-out`}
    >
      {/* Logo */}
      <div className={`${collapsed ? 'px-3 py-4' : 'px-5 py-5'} flex items-center justify-between`}>
        {collapsed ? (
          <img src="/logo.svg" alt="SDG-VBS" className="h-9 w-9 object-left object-cover overflow-hidden mx-auto" />
        ) : (
          <img src="/logo.svg" alt="SDG-VBS" className="h-14 w-auto" />
        )}
      </div>

      {/* Toggle Button - abaixo do logo */}
      <div className={`${collapsed ? 'px-1.5' : 'px-2'} pb-2 border-b border-white/8`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:bg-white/8 hover:text-white transition-colors"
          title={collapsed ? 'Expandir menu' : 'Compactar menu'}
        >
          <Icon d={collapsed ? icons.chevronRight : icons.chevronLeft} />
          {!collapsed && <span className="text-xs">Compactar</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-3 ${collapsed ? 'px-1.5' : 'px-2'} overflow-y-auto space-y-0.5`}>
        {steps.map((step) => (
          <NavLink
            key={step.path}
            to={step.path}
            end={step.path === '/'}
            title={collapsed ? `${step.num}. ${step.label}` : undefined}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600/90 text-white shadow-md shadow-blue-900/40 font-medium'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <Icon d={icons[step.icon]} />
            {!collapsed && (
              <span className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
                <span className="text-blue-300/70 text-xs font-mono">{String(step.num).padStart(2, '0')}</span>
                {step.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={`${collapsed ? 'px-2' : 'px-5'} py-3 border-t border-white/8`}>
        <p className={`text-xs text-slate-500 ${collapsed ? 'text-center' : ''}`}>{collapsed ? 'v1.0' : 'SDG-VBS v1.0'}</p>
      </div>
    </aside>
  );
}

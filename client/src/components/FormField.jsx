import { useState, useRef, useEffect, useCallback } from 'react';

const masks = {
  telefone: (value) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  },
  cpf: (value) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  },
  cnpj: (value) => {
    const d = value.replace(/\D/g, '').slice(0, 14);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
  },
  cep: (value) => {
    const d = value.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  },
  codigo: (value) => {
    return value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 15);
  },
};

const ChevronIcon = ({ open }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-blue-600">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

const ClearIcon = ({ onClick }) => (
  <button onClick={onClick} type="button"
    className="p-0.5 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  </button>
);

export function CustomSelect({ value, onChange, options = [], placeholder = 'Selecione...', searchable = true, clearable = true, compact = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));
  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
        setHighlighted(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    setHighlighted(-1);
  }, [search]);

  const scrollToItem = useCallback((index) => {
    if (!listRef.current) return;
    const items = listRef.current.children;
    if (items[index]) items[index].scrollIntoView({ block: 'nearest' });
  }, []);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(highlighted + 1, filtered.length - 1);
      setHighlighted(next);
      scrollToItem(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(highlighted - 1, 0);
      setHighlighted(prev);
      scrollToItem(prev);
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      handleSelect(filtered[highlighted].value);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setSearch('');
      setHighlighted(-1);
    }
  };

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setSearch('');
    setHighlighted(-1);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  const toggleOpen = () => {
    setOpen(!open);
    if (open) {
      setSearch('');
      setHighlighted(-1);
    }
  };

  const py = compact ? 'py-1.5' : 'py-2';
  const textSize = compact ? 'text-sm' : 'text-sm';

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <div
        onClick={toggleOpen}
        tabIndex={0}
        className={`w-full bg-white border rounded-lg px-3 ${py} ${textSize} cursor-pointer flex items-center gap-2 transition-all duration-150 ${
          open
            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className={`flex-1 truncate ${selected ? 'text-gray-800' : 'text-gray-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          {clearable && value && <ClearIcon onClick={handleClear} />}
          <ChevronIcon open={open} />
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl shadow-gray-200/50 overflow-hidden animate-in"
          style={{ animation: 'selectIn 150ms ease-out' }}>
          {searchable && (
            <div className="px-3 py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <SearchIcon />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  placeholder="Buscar..."
                  onClick={(e) => e.stopPropagation()}
                />
                {search && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setSearch(''); }}
                    className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                      <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
          <div ref={listRef} className="max-h-52 overflow-y-auto py-1 scrollbar-thin">
            {filtered.length > 0 ? (
              filtered.map((opt, idx) => {
                const isSelected = String(opt.value) === String(value);
                const isHighlighted = idx === highlighted;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    onMouseEnter={() => setHighlighted(idx)}
                    className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors duration-75 mx-1 rounded-lg ${
                      isHighlighted
                        ? 'bg-blue-50 text-blue-700'
                        : isSelected
                          ? 'text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={isSelected ? 'font-medium' : ''}>{opt.label}</span>
                    {isSelected && <CheckIcon />}
                  </div>
                );
              })
            ) : (
              <div className="px-3 py-6 text-sm text-gray-400 text-center flex flex-col items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <span>Nenhum resultado encontrado</span>
              </div>
            )}
          </div>
          {options.length > 5 && filtered.length > 0 && (
            <div className="px-3 py-1.5 border-t border-gray-100 text-xs text-gray-400 text-center">
              {filtered.length} de {options.length} itens
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes selectIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>
    </div>
  );
}

function SearchSelect({ label, value, onChange, options, required, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <CustomSelect
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder || 'Selecione...'}
      />
    </div>
  );
}

export default function FormField({ label, type = 'text', value, onChange, options, placeholder, required, rows, mask, searchable }) {
  const baseClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-150 hover:border-gray-400';

  const handleChange = (rawValue) => {
    if (mask && masks[mask]) {
      onChange(masks[mask](rawValue));
    } else {
      onChange(rawValue);
    }
  };

  if (type === 'select' && searchable) {
    return <SearchSelect label={label} value={value} onChange={onChange} options={options} required={required} placeholder={placeholder} />;
  }

  if (type === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        <CustomSelect
          value={value || ''}
          onChange={onChange}
          options={options}
          placeholder={placeholder || 'Selecione...'}
          searchable={false}
          clearable={false}
        />
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
        <textarea value={value || ''} onChange={(e) => handleChange(e.target.value)} className={baseClass} placeholder={placeholder} required={required} rows={rows || 3} />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input type={type} value={value || ''} onChange={(e) => handleChange(e.target.value)} className={baseClass} placeholder={placeholder} required={required} />
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';

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

function SearchSelect({ label, value, onChange, options, required, placeholder }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options?.find(o => String(o.value) === String(value));
  const filtered = (options || []).filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
        className={`w-full border rounded-lg px-3 py-2 text-sm cursor-pointer flex items-center justify-between gap-2 transition-colors ${
          open ? 'border-primary-500 ring-2 ring-primary-500' : 'border-gray-300'
        }`}
      >
        {open ? (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none flex-1 bg-transparent"
            placeholder="Pesquisar..."
          />
        ) : (
          <span className={selected ? 'text-gray-800' : 'text-gray-400'}>
            {selected ? selected.label : (placeholder || 'Selecione...')}
          </span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 p-0.5" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                  String(opt.value) === String(value)
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-gray-400 text-center">Nenhum resultado</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FormField({ label, type = 'text', value, onChange, options, placeholder, required, rows, mask, searchable }) {
  const baseClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors';

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
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={baseClass} required={required}>
          <option value="">Selecione...</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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

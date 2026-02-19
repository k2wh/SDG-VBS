export default function EmptyState({ message, hint }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mx-auto mb-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z" />
      </svg>
      <p className="text-gray-500 font-medium">{message || 'Selecione um projeto para continuar.'}</p>
      {hint && <p className="text-gray-400 text-sm mt-1">{hint}</p>}
    </div>
  );
}

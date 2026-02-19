export default function StepHeader({ numero, titulo, descricao }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold">
          {numero}
        </span>
        <h2 className="text-2xl font-bold text-gray-800">{titulo}</h2>
      </div>
      {descricao && <p className="text-gray-500 ml-11">{descricao}</p>}
    </div>
  );
}

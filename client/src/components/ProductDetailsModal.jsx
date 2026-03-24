export function ProductDetailsModal({ product, onClose, onAdd }) {
  if (!product) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/70 p-4 sm:items-center sm:justify-center" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <img src={product.image} alt={product.name} className="h-64 w-full rounded-xl object-cover" />
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-zinc-400">{product.brand}</p>
            <h3 className="text-2xl font-bold text-white">{product.name}</h3>
            <p className="text-sm text-zinc-300">{product.description}</p>
            <p className="text-lg text-zinc-400">Categoria: {product.category}</p>
            <p className="text-2xl font-bold text-white">
              {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <div className="flex gap-2">
              <button onClick={() => onAdd(product)} className="rounded-xl bg-accent px-4 py-2 font-semibold text-white hover:bg-violet-500">
                Adicionar ao carrinho
              </button>
              <button onClick={onClose} className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-200 hover:bg-zinc-800">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

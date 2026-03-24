export function ProductCard({ product, onAdd }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-premium">
      <div className="relative h-56 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-zinc-200">
          {product.brand}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <h3 className="text-lg font-semibold text-white">{product.name}</h3>
        <p className="text-sm text-zinc-400">{product.category}</p>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-white">
            {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <button
            onClick={() => onAdd(product)}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Adicionar
          </button>
        </div>
      </div>
    </article>
  );
}

function currency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function CartDrawer({ cartItems, onIncrease, onDecrease, total }) {
  return (
    <aside className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="text-xl font-bold text-white">Carrinho</h2>
      {cartItems.length === 0 ? (
        <p className="text-sm text-zinc-400">Seu carrinho está vazio.</p>
      ) : (
        <ul className="space-y-4">
          {cartItems.map((item) => (
            <li key={item.id} className="rounded-xl border border-zinc-800 p-3">
              <p className="font-medium text-white">{item.name}</p>
              <p className="text-sm text-zinc-400">{currency(item.price)}</p>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => onDecrease(item.id)} className="h-8 w-8 rounded-lg bg-zinc-800 text-white">
                  -
                </button>
                <span className="min-w-8 text-center">{item.quantity}</span>
                <button onClick={() => onIncrease(item.id)} className="h-8 w-8 rounded-lg bg-zinc-800 text-white">
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="rounded-xl bg-black/40 p-4">
        <p className="text-sm text-zinc-300">Total</p>
        <p className="text-2xl font-bold text-white">{currency(total)}</p>
      </div>
    </aside>
  );
}

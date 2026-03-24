import { useState } from 'react';

export function AdminPanel({ onCreate }) {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <button onClick={() => setOpen((v) => !v)} className="text-sm font-semibold text-zinc-200 hover:text-white">
        {open ? 'Ocultar painel admin' : 'Exibir painel admin'}
      </button>
      {open && (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const data = Object.fromEntries(new FormData(event.currentTarget).entries());
            onCreate({
              ...data,
              price: Number(data.price)
            });
            event.currentTarget.reset();
          }}
        >
          <input name="name" required placeholder="Nome" className="rounded-lg bg-zinc-950 p-2" />
          <input name="brand" required placeholder="Marca" className="rounded-lg bg-zinc-950 p-2" />
          <input name="category" required placeholder="Categoria" className="rounded-lg bg-zinc-950 p-2" />
          <input name="price" required type="number" step="0.01" placeholder="Preço" className="rounded-lg bg-zinc-950 p-2" />
          <input name="image" required placeholder="URL da imagem" className="rounded-lg bg-zinc-950 p-2 sm:col-span-2" />
          <button className="rounded-lg bg-accent p-2 font-semibold sm:col-span-2">Adicionar produto</button>
        </form>
      )}
    </section>
  );
}

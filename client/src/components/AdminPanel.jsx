import { useState } from 'react';

const initialForm = {
  name: '',
  brand: '',
  category: '',
  price: '',
  description: '',
  image: ''
};

export function AdminPanel({ products, token, onLogin, onCreate, onUpdate, onDelete, loading }) {
  const [open, setOpen] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState('');

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
      <button onClick={() => setOpen((v) => !v)} className="text-sm font-semibold text-zinc-200 hover:text-white">
        {open ? 'Ocultar área admin' : 'Login admin'}
      </button>

      {!open ? null : !token ? (
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            onLogin(login);
          }}
        >
          <input
            type="email"
            required
            placeholder="E-mail admin"
            value={login.email}
            onChange={(e) => setLogin((c) => ({ ...c, email: e.target.value }))}
            className="rounded-lg bg-zinc-950 p-2"
          />
          <input
            type="password"
            required
            placeholder="Senha"
            value={login.password}
            onChange={(e) => setLogin((c) => ({ ...c, password: e.target.value }))}
            className="rounded-lg bg-zinc-950 p-2"
          />
          <button className="rounded-lg bg-accent p-2 font-semibold sm:col-span-2" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar como admin'}
          </button>
        </form>
      ) : (
        <div className="mt-4 space-y-5">
          <form
            className="grid gap-2 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              if (editingId) {
                onUpdate(editingId, form);
              } else {
                onCreate(form);
              }
              setForm(initialForm);
              setEditingId('');
            }}
          >
            <input className="rounded-lg bg-zinc-950 p-2" placeholder="Título" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required />
            <input className="rounded-lg bg-zinc-950 p-2" placeholder="Marca" value={form.brand} onChange={(e) => setForm((c) => ({ ...c, brand: e.target.value }))} required />
            <input className="rounded-lg bg-zinc-950 p-2" placeholder="Categoria" value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))} required />
            <input type="number" step="0.01" className="rounded-lg bg-zinc-950 p-2" placeholder="Preço" value={form.price} onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))} required />
            <input className="rounded-lg bg-zinc-950 p-2 sm:col-span-2" placeholder="Descrição" value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} required />
            <input className="rounded-lg bg-zinc-950 p-2 sm:col-span-2" placeholder="URL da imagem" value={form.image} onChange={(e) => setForm((c) => ({ ...c, image: e.target.value }))} required />
            <div className="flex gap-2 sm:col-span-2">
              <button className="rounded-lg bg-accent px-3 py-2 font-semibold" disabled={loading}>
                {editingId ? 'Salvar edição' : 'Adicionar produto'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setForm(initialForm);
                    setEditingId('');
                  }}
                  className="rounded-lg border border-zinc-600 px-3 py-2"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.id} className="rounded-xl border border-zinc-800 p-3">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-zinc-400">{product.brand} • {product.category} • R$ {product.price}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(product.id);
                      setForm({
                        name: product.name,
                        brand: product.brand,
                        category: product.category,
                        price: product.price,
                        description: product.description,
                        image: product.image
                      });
                    }}
                    className="rounded-lg border border-zinc-700 px-3 py-1 text-sm"
                  >
                    Editar
                  </button>
                  <button onClick={() => onDelete(product.id)} className="rounded-lg bg-rose-600 px-3 py-1 text-sm text-white">
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

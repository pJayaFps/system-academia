import { useState } from 'react';

export function AdminLogin({ onLogin, loading }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  return (
    <section className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
      <h2 className="text-2xl font-bold text-white">Login admin</h2>
      <p className="text-sm text-zinc-400">Entre com seu e-mail e senha para gerenciar o catálogo.</p>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          onLogin(credentials);
        }}
      >
        <input
          type="email"
          required
          placeholder="E-mail"
          value={credentials.email}
          onChange={(e) => setCredentials((c) => ({ ...c, email: e.target.value }))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
        <input
          type="password"
          required
          placeholder="Senha"
          value={credentials.password}
          onChange={(e) => setCredentials((c) => ({ ...c, password: e.target.value }))}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2"
        />
        <button className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar como admin'}
        </button>
      </form>
    </section>
  );
}

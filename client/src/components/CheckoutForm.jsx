const initialState = {
  nome: '',
  sobrenome: '',
  telefone: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: ''
};

export function CheckoutForm({ onSubmit, loading, disabled }) {
  return (
    <form
      className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const customer = Object.fromEntries(formData.entries());
        onSubmit(customer);
      }}
    >
      <h2 className="text-xl font-bold text-white">Dados do cliente</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Object.entries(initialState).map(([key]) => (
          <label key={key} className="space-y-1 text-sm">
            <span className="capitalize text-zinc-300">{key}</span>
            <input
              name={key}
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-white outline-none ring-accent transition focus:ring"
              placeholder={`Digite ${key}`}
            />
          </label>
        ))}
      </div>
      <button
        disabled={disabled || loading}
        className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-zinc-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Gerando Pix...' : 'Gerar pagamento Pix'}
      </button>
    </form>
  );
}

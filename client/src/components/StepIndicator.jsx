const labels = {
  catalogo: 'Catálogo',
  carrinho: 'Carrinho',
  cliente: 'Dados',
  pagamento: 'Pagamento',
  confirmacao: 'Confirmação',
  'admin-login': 'Login admin',
  'admin-panel': 'Painel admin'
};

const order = ['catalogo', 'carrinho', 'cliente', 'pagamento', 'confirmacao'];

export function StepIndicator({ step }) {
  const adminMode = step === 'admin-login' || step === 'admin-panel';
  const steps = adminMode ? ['admin-login', 'admin-panel'] : order;
  const currentIndex = steps.indexOf(step);

  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((item, index) => (
        <div
          key={item}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            index <= currentIndex ? 'bg-accent text-white' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          {index + 1}. {labels[item]}
        </div>
      ))}
    </div>
  );
}

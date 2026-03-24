const labels = {
  catalogo: 'Catálogo',
  carrinho: 'Carrinho',
  cliente: 'Dados',
  pagamento: 'Pagamento',
  confirmacao: 'Confirmação'
};

const order = ['catalogo', 'carrinho', 'cliente', 'pagamento', 'confirmacao'];

export function StepIndicator({ step }) {
  const currentIndex = order.indexOf(step);

  return (
    <div className="flex flex-wrap gap-2">
      {order.map((item, index) => (
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

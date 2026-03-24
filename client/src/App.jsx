import { useEffect, useMemo, useState } from 'react';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { FilterTabs } from './components/FilterTabs';
import { ProductCard } from './components/ProductCard';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { StepIndicator } from './components/StepIndicator';
import { brands, categories } from './data/products';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '5511999999999';

const initialCustomer = {
  nome: '',
  sobrenome: '',
  telefone: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: ''
};

const initialPayment = {
  method: '',
  installments: 1,
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: ''
};

function currency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function App() {
  const [step, setStep] = useState('catalogo');
  const [activeBrand, setActiveBrand] = useState('Todos');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [catalog, setCatalog] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customer, setCustomer] = useState(initialCustomer);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [payment, setPayment] = useState(initialPayment);
  const [paymentData, setPaymentData] = useState(null);
  const [adminToken, setAdminToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const matchesBrand = activeBrand === 'Todos' || product.brand === activeBrand;
      const matchesCategory = activeCategory === 'Todas' || product.category === activeCategory;
      return matchesBrand && matchesCategory;
    });
  }, [catalog, activeBrand, activeCategory]);

  const total = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setCatalog(data.products ?? []))
      .catch(() => setError('Não foi possível carregar catálogo.'));

    fetch(`${API_URL}/api/payments/options`)
      .then((res) => res.json())
      .then((data) => setPaymentOptions(data.methods ?? []))
      .catch(() => setError('Não foi possível carregar métodos de pagamento.'));
  }, []);

  function logoutAdmin() {
    setAdminToken('');
    setStep('catalogo');
  }

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function updateQuantity(id, delta) {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function buildOrderMessage() {
    const lines = cart.map((item) => `- ${item.name} (${item.quantity}x)`).join('\n');
    const paymentLabel = payment.method === 'credit' ? `Cartão de crédito (${payment.installments}x)` : payment.method;

    return [
      'Novo Pedido 🛒',
      '',
      `Nome: ${customer.nome} ${customer.sobrenome}`,
      `Telefone: ${customer.telefone}`,
      `Endereço: ${customer.rua}, Nº ${customer.numero}, ${customer.bairro}, ${customer.cidade}`,
      '',
      'Produtos:',
      lines,
      '',
      `Total: ${currency(total)}`,
      `Pagamento: ${paymentLabel}`
    ].join('\n');
  }

  async function loginAdmin(credentials) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Falha no login admin.');
      setAdminToken(data.token);
      setStep('admin-panel');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function createProduct(product) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/admin/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(product)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao adicionar produto.');
      setCatalog((current) => [data.product, ...current]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProduct(id, product) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(product)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao atualizar produto.');
      setCatalog((current) => current.map((item) => (item.id === id ? data.product : item)));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao remover produto.');
      }
      setCatalog((current) => current.filter((item) => item.id !== id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPayment() {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/payments/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          customer,
          items: cart,
          payment
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar pagamento.');
      }
      setPaymentData(data);
      setStep('confirmacao');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmPaymentAndRedirect() {
    if (!paymentData?.paymentId) return;

    const response = await fetch(`${API_URL}/api/payments/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: paymentData.paymentId })
    });
    const result = await response.json();
    if (result.status !== 'paid') {
      setError('Não foi possível confirmar o pagamento.');
      return;
    }

    const message = buildOrderMessage();
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.location.href = link;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Ateliê Prime Store</h1>
          <p className="text-zinc-400">Experiência premium: catálogo, etapas de checkout e envio para WhatsApp.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStep('carrinho')}
            className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 hover:border-accent"
          >
            🛒 Carrinho ({cart.reduce((acc, item) => acc + item.quantity, 0)})
          </button>
          {!adminToken ? (
            <button
              onClick={() => setStep('admin-login')}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 hover:border-accent"
            >
              Login admin
            </button>
          ) : (
            <>
              <button
                onClick={() => setStep('admin-panel')}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 hover:border-accent"
              >
                Painel admin
              </button>
              <button
                onClick={logoutAdmin}
                className="rounded-full border border-rose-500/40 bg-rose-900/20 px-4 py-2 text-sm font-semibold text-rose-300 hover:border-rose-400"
              >
                Sair
              </button>
            </>
          )}
        </div>
      </header>

      <StepIndicator step={step} />

      {step === 'catalogo' && (
        <section className="space-y-6">
          <FilterTabs
            brands={brands}
            categories={categories}
            activeBrand={activeBrand}
            activeCategory={activeCategory}
            setActiveBrand={setActiveBrand}
            setActiveCategory={setActiveCategory}
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} onOpenDetails={setSelectedProduct} />
            ))}
          </div>
        </section>
      )}

      {step === 'admin-login' && <AdminLogin onLogin={loginAdmin} loading={loading} />}

      {step === 'admin-panel' && adminToken && (
        <AdminPanel products={catalog} onCreate={createProduct} onUpdate={updateProduct} onDelete={deleteProduct} loading={loading} />
      )}

      {step === 'carrinho' && (
        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-2xl font-bold text-white">Carrinho de compras</h2>
          {cart.length === 0 ? (
            <p className="text-zinc-400">Seu carrinho está vazio.</p>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border border-zinc-800 p-3">
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-sm text-zinc-400">{currency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="h-8 w-8 rounded-lg bg-zinc-800">
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="h-8 w-8 rounded-lg bg-zinc-800">
                      +
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-right text-2xl font-bold text-white">Total: {currency(total)}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setStep('catalogo')} className="rounded-xl border border-zinc-700 px-4 py-2 hover:bg-zinc-800">
              Continuar comprando
            </button>
            <button
              onClick={() => setStep('cliente')}
              disabled={!cart.length}
              className="rounded-xl bg-accent px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              Finalizar pagamento
            </button>
          </div>
        </section>
      )}

      {step === 'cliente' && (
        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-2xl font-bold text-white">Dados do cliente</h2>
          <form
            className="grid gap-3 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const data = Object.fromEntries(new FormData(event.currentTarget).entries());
              setCustomer(data);
              setStep('pagamento');
            }}
          >
            {Object.keys(initialCustomer).map((field) => (
              <input
                key={field}
                required
                name={field}
                defaultValue={customer[field]}
                placeholder={field}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2"
              />
            ))}
            <button className="rounded-xl bg-accent px-4 py-3 font-semibold text-white sm:col-span-2">Escolher forma de pagamento</button>
          </form>
        </section>
      )}

      {step === 'pagamento' && (
        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-2xl font-bold text-white">Forma de pagamento</h2>
          <div className="flex flex-wrap gap-2">
            {paymentOptions.map((method) => (
              <button
                key={method.id}
                onClick={() => setPayment((current) => ({ ...current, method: method.id }))}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${payment.method === method.id ? 'bg-accent text-white' : 'bg-zinc-800 text-zinc-200'}`}
              >
                {method.label}
              </button>
            ))}
          </div>

          {payment.method === 'credit' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder="Nome no cartão" className="rounded-xl bg-zinc-950 p-2" onChange={(e) => setPayment((c) => ({ ...c, cardName: e.target.value }))} />
              <input placeholder="Número do cartão" className="rounded-xl bg-zinc-950 p-2" onChange={(e) => setPayment((c) => ({ ...c, cardNumber: e.target.value }))} />
              <input placeholder="Validade (MM/AA)" className="rounded-xl bg-zinc-950 p-2" onChange={(e) => setPayment((c) => ({ ...c, expiry: e.target.value }))} />
              <input placeholder="CVV" className="rounded-xl bg-zinc-950 p-2" onChange={(e) => setPayment((c) => ({ ...c, cvv: e.target.value }))} />
              <select
                className="rounded-xl bg-zinc-950 p-2 sm:col-span-2"
                value={payment.installments}
                onChange={(e) => setPayment((c) => ({ ...c, installments: Number(e.target.value) }))}
              >
                {[1, 2, 3, 4, 5, 6, 10, 12].map((item) => (
                  <option key={item} value={item}>
                    {item}x
                  </option>
                ))}
              </select>
            </div>
          )}

          {payment.method && (
            <button onClick={submitPayment} disabled={loading} className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-zinc-900">
              {loading ? 'Processando...' : 'Confirmar pagamento'}
            </button>
          )}
        </section>
      )}

      {step === 'confirmacao' && paymentData && (
        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-2xl font-bold text-white">Pagamento confirmado</h2>
          <p className="text-zinc-300">ID: {paymentData.paymentId}</p>
          {paymentData.pixKey && (
            <div className="space-y-2">
              <img src={paymentData.qrCodeImage} alt="QR Code Pix" className="w-48 rounded-xl border border-zinc-700" />
              <p className="break-all rounded-lg bg-zinc-950 p-2 text-xs text-zinc-400">{paymentData.pixKey}</p>
            </div>
          )}
          <button onClick={confirmPaymentAndRedirect} className="rounded-xl bg-accent px-4 py-3 font-semibold text-white">
            Enviar pedido no WhatsApp
          </button>
        </section>
      )}

      {error && <p className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-rose-300">{error}</p>}

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={(product) => {
          addToCart(product);
          setSelectedProduct(null);
        }}
      />
    </main>
  );
}

export default App;

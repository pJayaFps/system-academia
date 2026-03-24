import { useMemo, useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutForm } from './components/CheckoutForm';
import { FilterTabs } from './components/FilterTabs';
import { ProductCard } from './components/ProductCard';
import { brands, categories, products as seedProducts } from './data/products';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? '5511999999999';

function App() {
  const [activeBrand, setActiveBrand] = useState('Todos');
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [catalog, setCatalog] = useState(seedProducts);
  const [cart, setCart] = useState([]);
  const [loadingPix, setLoadingPix] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [error, setError] = useState('');

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const matchesBrand = activeBrand === 'Todos' || product.brand === activeBrand;
      const matchesCategory = activeCategory === 'Todas' || product.category === activeCategory;
      return matchesBrand && matchesCategory;
    });
  }, [catalog, activeBrand, activeCategory]);

  const total = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);

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

  function buildOrderMessage(customer, paymentMethod = 'Pix') {
    const lines = cart.map((item) => `- ${item.name} (${item.quantity}x)`).join('\n');
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
      `Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      `Pagamento: ${paymentMethod}`
    ].join('\n');
  }

  async function handleCheckout(customer) {
    if (!cart.length) {
      setError('Adicione produtos no carrinho antes de gerar o Pix.');
      return;
    }

    setLoadingPix(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/pix/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          customer,
          items: cart
        })
      });

      if (!response.ok) {
        throw new Error('Não foi possível gerar cobrança Pix.');
      }

      const pix = await response.json();
      setPixData({ ...pix, customer });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoadingPix(false);
    }
  }

  async function confirmPayment() {
    if (!pixData) {
      return;
    }

    const response = await fetch(`${API_URL}/api/pix/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId: pixData.paymentId })
    });

    const result = await response.json();
    if (result.status !== 'paid') {
      setError('Pagamento não confirmado. Tente novamente.');
      return;
    }

    const message = buildOrderMessage(pixData.customer);
    const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.location.href = link;
  }

  function createProduct(product) {
    const newProduct = {
      id: crypto.randomUUID(),
      ...product
    };

    setCatalog((current) => [newProduct, ...current]);
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-3 text-center">
        <p className="inline-flex rounded-full border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300">
          Catálogo + Checkout via WhatsApp
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white">Ateliê Prime Store</h1>
        <p className="mx-auto max-w-2xl text-zinc-400">
          Moda premium com experiência mobile-first, pagamento Pix e finalização automática no WhatsApp.
        </p>
      </header>

      <FilterTabs
        brands={brands}
        categories={categories}
        activeBrand={activeBrand}
        activeCategory={activeCategory}
        setActiveBrand={setActiveBrand}
        setActiveCategory={setActiveCategory}
      />

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={addToCart} />
          ))}
        </div>
        <CartDrawer
          cartItems={cart}
          onIncrease={(id) => updateQuantity(id, 1)}
          onDecrease={(id) => updateQuantity(id, -1)}
          total={total}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <CheckoutForm onSubmit={handleCheckout} loading={loadingPix} disabled={!cart.length} />
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-xl font-bold text-white">Pagamento Pix</h2>
          {!pixData ? (
            <p className="text-sm text-zinc-400">Após preencher seus dados, gere o Pix para visualizar QR Code e chave dinâmica.</p>
          ) : (
            <div className="space-y-3">
              <img src={pixData.qrCodeImage} alt="QR Code Pix" className="w-full max-w-xs rounded-xl border border-zinc-700" />
              <p className="break-all rounded-lg bg-zinc-950 p-3 text-xs text-zinc-300">{pixData.pixKey}</p>
              <button onClick={confirmPayment} className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-white hover:bg-violet-500">
                Confirmar pagamento e enviar no WhatsApp
              </button>
            </div>
          )}
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>
      </section>

      <AdminPanel onCreate={createProduct} />
    </main>
  );
}

export default App;

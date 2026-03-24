import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

const app = express();
const port = process.env.PORT || 3001;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@atelieprime.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

app.use(cors());
app.use(express.json());

const payments = new Map();
const adminSessions = new Map();

const methods = [
  { id: 'pix', label: 'Pix' },
  { id: 'debit', label: 'Cartão de débito' },
  { id: 'credit', label: 'Cartão de crédito', installments: [1, 2, 3, 4, 5, 6, 10, 12] },
  { id: 'paypal', label: 'PayPal' }
];

const products = [
  {
    id: 'nk-tee-01',
    name: 'Camiseta Nike Essential',
    brand: 'Nike',
    category: 'Camiseta',
    price: 129.9,
    description: 'Camiseta premium em algodão macio, corte moderno e ótimo caimento para uso diário.',
    image: 'https://images.unsplash.com/photo-1622445272461-c6580cab8755?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'ad-hd-01',
    name: 'Moletom Adidas Street',
    brand: 'Adidas',
    category: 'Moletom',
    price: 289.9,
    description: 'Moletom com interior felpado, visual urbano e acabamento premium para dias frios.',
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'lc-pol-01',
    name: 'Polo Lacoste Classic',
    brand: 'Lacoste',
    category: 'Camiseta',
    price: 349.9,
    description: 'Polo clássica com tecido respirável e toque refinado para compor looks elegantes.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80'
  }
];

function authAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }
  req.admin = adminSessions.get(token);
  return next();
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', now: new Date().toISOString() });
});

app.get('/api/products', (_req, res) => {
  res.json({ products });
});

app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = randomUUID();
  adminSessions.set(token, { email, createdAt: new Date().toISOString() });

  return res.json({ token, email });
});

app.post('/api/admin/products', authAdmin, (req, res) => {
  const { name, brand, category, price, description, image } = req.body;

  if (!name || !brand || !category || !price || !description || !image) {
    return res.status(400).json({ message: 'Preencha todos os campos do produto.' });
  }

  const product = {
    id: randomUUID(),
    name,
    brand,
    category,
    price: Number(price),
    description,
    image
  };

  products.unshift(product);
  return res.status(201).json({ product });
});

app.put('/api/admin/products/:id', authAdmin, (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  products[index] = {
    ...products[index],
    ...req.body,
    price: Number(req.body.price ?? products[index].price)
  };

  return res.json({ product: products[index] });
});

app.delete('/api/admin/products/:id', authAdmin, (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  products.splice(index, 1);
  return res.status(204).send();
});

app.get('/api/payments/options', (_req, res) => {
  res.json({ methods });
});

app.post('/api/payments/create', (req, res) => {
  const { amount, customer, items, payment } = req.body;

  if (!amount || !customer || !items?.length || !payment?.method) {
    return res.status(400).json({ message: 'Dados inválidos para gerar pagamento.' });
  }

  const paymentId = randomUUID();
  const payload = {
    amount,
    customer,
    items,
    payment,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  let pixKey;
  let qrCodeImage;
  if (payment.method === 'pix') {
    pixKey = `pix-${paymentId.slice(0, 8)}-${Date.now()}`;
    qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixKey)}`;
  }

  payments.set(paymentId, payload);

  return res.json({
    paymentId,
    status: 'pending',
    pixKey,
    qrCodeImage
  });
});

app.post('/api/payments/confirm', (req, res) => {
  const { paymentId } = req.body;

  if (!payments.has(paymentId)) {
    return res.status(404).json({ status: 'not_found' });
  }

  const payment = payments.get(paymentId);
  const updated = {
    ...payment,
    status: 'paid',
    paidAt: new Date().toISOString()
  };

  payments.set(paymentId, updated);

  return res.json({ status: 'paid', paymentId });
});

app.listen(port, () => {
  console.log(`API de pagamentos mock rodando em http://localhost:${port}`);
});

import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { initDatabase, seedDatabase } from './db.js';

const app = express();
const port = process.env.PORT || 3001;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@atelieprime.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';

const methods = [
  { id: 'pix', label: 'Pix' },
  { id: 'debit', label: 'Cartão de débito' },
  { id: 'credit', label: 'Cartão de crédito', installments: [1, 2, 3, 4, 5, 6, 10, 12] },
  { id: 'paypal', label: 'PayPal' }
];

app.use(cors());
app.use(express.json());

const db = await initDatabase();
await seedDatabase(db, ADMIN_EMAIL, ADMIN_PASSWORD);

async function authAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  const session = await db.get('SELECT token, email, created_at FROM admin_sessions WHERE token = ?', token);
  if (!session) {
    return res.status(401).json({ message: 'Não autorizado.' });
  }

  req.admin = session;
  return next();
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', now: new Date().toISOString() });
});

app.get('/api/products', async (_req, res) => {
  const products = await db.all('SELECT * FROM products ORDER BY rowid DESC');
  res.json({ products });
});

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body;

  const admin = await db.get('SELECT email FROM admin_users WHERE email = ? AND password = ?', email, password);
  if (!admin) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = randomUUID();
  await db.run('INSERT INTO admin_sessions (token, email, created_at) VALUES (?, ?, ?)', token, email, new Date().toISOString());

  return res.json({ token, email });
});

app.post('/api/admin/logout', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(400).json({ message: 'Token não informado.' });
  }

  await db.run('DELETE FROM admin_sessions WHERE token = ?', token);
  return res.json({ status: 'ok' });
});

app.post('/api/admin/products', authAdmin, async (req, res) => {
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

  await db.run(
    'INSERT INTO products (id, name, brand, category, price, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
    product.id,
    product.name,
    product.brand,
    product.category,
    product.price,
    product.description,
    product.image
  );

  return res.status(201).json({ product });
});

app.put('/api/admin/products/:id', authAdmin, async (req, res) => {
  const { id } = req.params;
  const current = await db.get('SELECT * FROM products WHERE id = ?', id);

  if (!current) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  const updated = {
    ...current,
    ...req.body,
    price: Number(req.body.price ?? current.price)
  };

  await db.run(
    'UPDATE products SET name = ?, brand = ?, category = ?, price = ?, description = ?, image = ? WHERE id = ?',
    updated.name,
    updated.brand,
    updated.category,
    updated.price,
    updated.description,
    updated.image,
    id
  );

  return res.json({ product: updated });
});

app.delete('/api/admin/products/:id', authAdmin, async (req, res) => {
  const { id } = req.params;
  const result = await db.run('DELETE FROM products WHERE id = ?', id);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Produto não encontrado.' });
  }

  return res.status(204).send();
});

app.get('/api/payments/options', (_req, res) => {
  res.json({ methods });
});

app.post('/api/payments/create', async (req, res) => {
  const { amount, customer, items, payment } = req.body;

  if (!amount || !customer || !items?.length || !payment?.method) {
    return res.status(400).json({ message: 'Dados inválidos para gerar pagamento.' });
  }

  const paymentId = randomUUID();
  let pixKey = null;
  let qrCodeImage = null;

  if (payment.method === 'pix') {
    pixKey = `pix-${paymentId.slice(0, 8)}-${Date.now()}`;
    qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixKey)}`;
  }

  await db.run(
    `INSERT INTO payments
    (payment_id, amount, customer_json, items_json, payment_json, status, pix_key, qr_code_image, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    paymentId,
    Number(amount),
    JSON.stringify(customer),
    JSON.stringify(items),
    JSON.stringify(payment),
    'pending',
    pixKey,
    qrCodeImage,
    new Date().toISOString()
  );

  return res.json({ paymentId, status: 'pending', pixKey, qrCodeImage });
});

app.post('/api/payments/confirm', async (req, res) => {
  const { paymentId } = req.body;
  const payment = await db.get('SELECT payment_id FROM payments WHERE payment_id = ?', paymentId);

  if (!payment) {
    return res.status(404).json({ status: 'not_found' });
  }

  await db.run('UPDATE payments SET status = ?, paid_at = ? WHERE payment_id = ?', 'paid', new Date().toISOString(), paymentId);

  return res.json({ status: 'paid', paymentId });
});

app.listen(port, () => {
  console.log(`API com SQLite rodando em http://localhost:${port}`);
});

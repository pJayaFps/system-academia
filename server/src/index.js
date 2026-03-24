import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const payments = new Map();

const methods = [
  { id: 'pix', label: 'Pix' },
  { id: 'debit', label: 'Cartão de débito' },
  { id: 'credit', label: 'Cartão de crédito', installments: [1, 2, 3, 4, 5, 6, 10, 12] },
  { id: 'paypal', label: 'PayPal' }
];

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', now: new Date().toISOString() });
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

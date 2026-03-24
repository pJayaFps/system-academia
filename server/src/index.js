import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const payments = new Map();

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', now: new Date().toISOString() });
});

app.post('/api/pix/create', (req, res) => {
  const { amount, customer, items } = req.body;

  if (!amount || !customer || !items?.length) {
    return res.status(400).json({ message: 'Dados inválidos para gerar Pix.' });
  }

  const paymentId = randomUUID();
  const pixKey = `pix-${paymentId.slice(0, 8)}-${Date.now()}`;
  const qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixKey)}`;

  payments.set(paymentId, {
    amount,
    customer,
    items,
    status: 'pending',
    createdAt: new Date().toISOString()
  });

  return res.json({
    paymentId,
    status: 'pending',
    pixKey,
    qrCodeImage
  });
});

app.post('/api/pix/confirm', (req, res) => {
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
  console.log(`API Pix mock rodando em http://localhost:${port}`);
});

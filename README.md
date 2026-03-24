# Ateliê Prime Store

Loja de roupas online com visual premium, checkout por etapas e finalização automática no WhatsApp.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Pagamento: API mock com Pix, débito, crédito e PayPal
- Checkout: catálogo → carrinho → dados do cliente → pagamento → confirmação

## Como rodar

### 1) Instalar dependências

```bash
npm --prefix client install
npm --prefix server install
```

### 2) Rodar backend

```bash
npm run dev:server
```

### 3) Rodar frontend

```bash
npm run dev:client
```

## Variáveis opcionais do frontend

No `client/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_WHATSAPP_NUMBER=5511999999999
```

## Fluxo implementado

1. Catálogo com filtros e modal de detalhes do produto
2. Carrinho em página separada
3. Página de dados do cliente
4. Página de forma de pagamento (Pix, débito, crédito, PayPal)
5. Confirmação de pagamento e envio para WhatsApp

## Endpoints da API mock

- `GET /api/payments/options`
- `POST /api/payments/create`
- `POST /api/payments/confirm`

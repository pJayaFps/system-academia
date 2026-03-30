# Ateliê Prime Store

Loja de roupas online com visual premium, checkout por etapas e finalização automática no WhatsApp.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Banco de dados local: SQLite (`.sqlite`)
- Pagamento: API mock com Pix, débito, crédito e PayPal
- Checkout: catálogo → carrinho → dados do cliente → pagamento → confirmação
- Admin: login em página separada + botão de sair + CRUD completo de produtos (adicionar, editar, remover)

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

## Variáveis opcionais

### Frontend (`client/.env`)

```env
VITE_API_URL=http://localhost:3001
VITE_WHATSAPP_NUMBER=5511999999999
```

### Backend (`server/.env`)

```env
ADMIN_EMAIL=admin@atelieprime.com
ADMIN_PASSWORD=123456
DB_PATH=./server/data/store.sqlite
```

## Banco de dados local (SQLite)

Todos os dados agora ficam no banco local (`DB_PATH`):

- produtos
- usuários admin (login/senha)
- sessões de admin (token)
- pagamentos (cliente, itens, forma de pagamento, status)

## Fluxo implementado

1. Catálogo com filtros, menu de departamentos (hover) e modal de detalhes do produto
2. Carrinho em página separada
3. Página de dados do cliente
4. Página de forma de pagamento (Pix, débito, crédito, PayPal)
5. Confirmação de pagamento e envio para WhatsApp
6. Login admin em página separada e painel admin em página separada

## Endpoints da API mock

- `GET /api/products`
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/payments/options`
- `POST /api/payments/create`
- `POST /api/payments/confirm`

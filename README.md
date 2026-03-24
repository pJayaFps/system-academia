# Ateliê Prime Store

Site de loja de roupas online com visual premium, catálogo com filtros, carrinho, checkout com dados do cliente, pagamento Pix (mock) e finalização automática no WhatsApp.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Pagamento: Pix mock (QR Code + confirmação simulada)
- Checkout: Redirecionamento para WhatsApp com mensagem pré-formatada

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

## Funcionalidades implementadas

- Grid responsivo de produtos com hover premium
- Filtro por marcas (tabs) e categorias
- Carrinho com adição, remoção e atualização de quantidade
- Formulário de cliente completo
- Geração de Pix mock com QR Code e chave dinâmica
- Simulação de confirmação de pagamento
- Mensagem automática com pedido completo e redirecionamento para WhatsApp
- Painel admin opcional para adicionar novos produtos no catálogo

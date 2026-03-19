# Sistema Premium de Gestão de Academia

Base arquitetural e documental de um sistema comercial de gestão de academia, pensado para operação premium e venda recorrente na faixa de **R$ 400 a R$ 700/mês**.

## Objetivo

Este repositório descreve e estrutura um produto completo com:

- reconhecimento facial integrado;
- controle de catraca física;
- financeiro avançado com Pix, boleto e cartão;
- WhatsApp automático;
- treinos, exercícios, contratos e nutrição;
- portal/app do aluno;
- painel premium com relatórios e auditoria;
- backend modular com segurança e permissões;
- frontend com menu lateral obrigatório.

## Estrutura

- `docs/arquitetura.md`: blueprint completo, passo a passo, módulos e integrações.
- `prisma/schema.prisma`: modelo de dados completo para PostgreSQL + Prisma.
- `apps/api/src/contracts/backend-blueprint.ts`: contratos de módulos, permissões e rotas do backend.
- `apps/web/src/config/sidebar.ts`: definição do menu lateral obrigatório.
- `apps/web/src/router/app-routes.ts`: mapa de telas e rotas do frontend.

## Stack alvo

- **Backend**: Node.js, Fastify ou NestJS, Prisma, PostgreSQL, Redis, filas, JWT + Refresh Token.
- **Frontend**: React, Vite, Tailwind, Zustand, React Query, React Router.
- **Integrações**: facial, catraca, gateways de pagamento, WhatsApp, armazenamento de mídia e BI.

## Como usar esta base

1. Use `docs/arquitetura.md` como guia de construção do produto.
2. Use `prisma/schema.prisma` como ponto de partida do banco.
3. Use os contratos em `apps/api` e `apps/web` para iniciar a implementação técnica.
4. Evolua cada módulo com testes, observabilidade e deploy automatizado.


## Executando a demo localmente

Como o repositório agora possui uma demo executável sem dependências externas, você pode visualizar o sistema assim:

```bash
npm run dev
```

Depois, abra no navegador:

```text
http://localhost:3000
```

### Endpoints úteis da demo

- `GET /api/health`
- `GET /api/system`
- `GET /api/dashboard`

### Observação

Esta demo é uma **visualização executável** da arquitetura e do menu obrigatório. Ela não substitui a implementação completa em React + Vite + Tailwind + Zustand + Prisma, mas permite navegar e validar o conceito imediatamente.


## Persistência real local

Os dados agora são persistidos no arquivo:

```text
data/system.json
```

Isso significa que:

- o sistema começa zerado;
- todos os cadastros e configurações são salvos em disco;
- filtros de frequência por aluno, período e tipo de plano usam os dados reais cadastrados;
- configurações de facial, catraca, pagamentos e WhatsApp ficam editáveis na tela de Configurações.


## Diferenciais comerciais já incluídos

- funil de leads com status comercial;
- previsão de receita com base nos planos ativos;
- lista de possíveis reativações por falta de frequência;
- regras de automação para WhatsApp e campanhas de retenção;
- painel e relatórios com foco em crescimento comercial.

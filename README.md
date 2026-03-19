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

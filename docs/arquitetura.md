# Arquitetura Completa — Sistema Premium de Gestão de Academia

## 1. Visão do produto

O produto é um **ERP premium para academias**, com operação presencial e digital, preparado para venda SaaS no ticket de **R$ 400 a R$ 700 por mês**, atendendo academias de pequeno e médio porte com possibilidade de expansão para redes.

### Proposta de valor

- operação unificada de alunos, treinos, nutrição, frequência e financeiro;
- controle de acesso com **reconhecimento facial** e **integração com catraca**;
- cobrança recorrente com **Pix, boleto e cartão**;
- automações de relacionamento por **WhatsApp**;
- painéis premium com indicadores operacionais e financeiros;
- segurança corporativa com permissões por cargo, auditoria e logs.

---

## 2. Menu lateral obrigatório do frontend

O menu lateral deve conter **exatamente** as seguintes seções:

1. **Painel (Dashboard Geral)**
2. **Usuários**
3. **Planos**
4. **Frequência**
5. **Exercícios**
6. **Grupo Muscular**
7. **Lista de Exercícios**
8. **Treinos**
9. **Nutrição**
10. **Vendas**
11. **Financeiro**
12. **Relatórios**
13. **Configurações**

Essas seções precisam existir no **backend** como domínios/rotas e no **frontend** como páginas, navegação e permissões.

---

## 3. Arquitetura macro

## 3.1 Camadas

### Camada 1 — Canais

- painel web administrativo;
- portal/app do aluno;
- APIs para catraca, câmeras e dispositivos;
- webhooks de pagamento;
- automações de WhatsApp.

### Camada 2 — Aplicação

- autenticação e autorização;
- gestão de alunos e contratos;
- gestão de usuários internos;
- treinos, exercícios e grupo muscular;
- nutrição;
- frequência e reconhecimento facial;
- vendas/PDV;
- financeiro e cobrança;
- relatórios e dashboards;
- configurações e integrações.

### Camada 3 — Dados e infraestrutura

- PostgreSQL para dados transacionais;
- Redis para cache, filas leves, rate limit e sessões auxiliares;
- object storage para fotos faciais, anexos e exports;
- mensageria/filas para webhooks, notificações e processamento facial;
- observabilidade com logs, métricas e traces.

---

## 4. Arquitetura técnica sugerida

## 4.1 Backend

### Stack

- Node.js + TypeScript;
- Fastify ou NestJS;
- Prisma ORM;
- PostgreSQL;
- Redis;
- BullMQ ou equivalente;
- JWT + Refresh Token;
- Zod para validação;
- OpenAPI/Swagger.

### Estratégia modular

Cada domínio deve ter:

- controller/route;
- service;
- repository;
- schema DTO/validator;
- policy de permissão;
- eventos/auditoria;
- testes unitários e de integração.

## 4.2 Frontend

### Stack

- React + Vite;
- Tailwind CSS;
- Zustand para estado global;
- React Query para cache de API;
- React Router;
- React Hook Form + Zod;
- Recharts ou ECharts para analytics.

### Organização

- layout principal com sidebar obrigatória;
- páginas protegidas por permissão;
- componentes compartilhados de tabela, filtro, cards e gráficos;
- páginas com listagem, cadastro, edição, detalhes e relatórios.

## 4.3 Mobile/Portal do aluno

Pode começar com:

- PWA responsiva ou app React Native/Flutter;
- login do aluno;
- treinos ativos;
- plano alimentar;
- pagamentos e contratos;
- QR/facial status e histórico de entradas.

---

## 5. Segurança e acesso

## 5.1 Perfis obrigatórios

- **dono**: acesso total, multiunidade, billing, configurações críticas;
- **admin**: operação completa com restrições estratégicas;
- **recepção**: check-in, cadastro, plano, vendas e cobrança básica;
- **professor**: treinos, exercícios, frequência e evolução;
- **nutricionista**: planos alimentares, peso, macros e evolução nutricional.

## 5.2 Segurança obrigatória

- JWT de curta duração;
- Refresh Token com rotação;
- hash forte de senha;
- MFA opcional para dono/admin;
- controle RBAC com permissões granulares;
- auditoria de login, reset de senha e ações críticas;
- rate limiting e proteção anti-bruteforce;
- segregação por unidade e tenant futuro.

---

## 6. Passo a passo de construção do sistema

## Etapa 1 — Fundação da plataforma

1. Criar monorepo com `apps/api` e `apps/web`.
2. Configurar lint, formatter, Husky e CI.
3. Provisionar PostgreSQL, Redis e storage.
4. Definir autenticação JWT + Refresh Token.
5. Criar base de papéis, permissões, auditoria e configurações.

## Etapa 2 — Núcleo operacional

1. Cadastro de alunos, responsáveis e documentos.
2. Cadastro de planos, contratos e assinaturas.
3. Check-in manual e integração futura com facial/catraca.
4. Dashboard inicial com KPIs e atividade recente.

## Etapa 3 — Frequência + facial + catraca

1. Cadastro biométrico/facial do aluno.
2. Endpoint de identificação facial.
3. Validação de status financeiro e regras de acesso.
4. Comando de abertura de catraca.
5. Registro de evento com imagem, score, dispositivo e resultado.

## Etapa 4 — Treino, exercícios e nutrição

1. Grupo muscular e lista de exercícios.
2. Biblioteca multimídia com vídeo e descrição.
3. Prescrição de treino por objetivo.
4. Histórico de alterações de treino.
5. Plano alimentar, macros e evolução.

## Etapa 5 — Vendas e financeiro

1. PDV com produtos, categorias e estoque.
2. Fluxo de caixa, contas e conciliação.
3. Integração com gateway e webhooks.
4. Cobrança recorrente e inadimplência.
5. Relatórios financeiros premium.

## Etapa 6 — Relatórios, automações e escala

1. Exportação PDF/Excel.
2. WhatsApp automático para lembretes e cobrança.
3. Heatmap de horários e ranking de frequência.
4. Observabilidade completa.
5. Multiunidade e catálogo comercial escalável.

---

## 7. Módulos funcionais detalhados

## 7.1 Painel

### Objetivo
Entregar visão executiva em tempo real da academia.

### Widgets obrigatórios

- alunos ativos;
- inadimplentes;
- novos alunos do período;
- entradas recentes por reconhecimento facial;
- faturamento diário, semanal e mensal;
- produtos mais vendidos;
- horas de pico da academia;
- ranking de presença;
- alertas de contratos vencendo;
- tarefas pendentes operacionais.

### Fontes de dados

- `students`, `memberships`, `attendance_records`, `sales_orders`, `financial_entries`, `facial_events`.

## 7.2 Usuários

### Funcionalidades

- cadastro de funcionários;
- permissões por cargo;
- reset de senha;
- bloqueio/desbloqueio;
- logs de ações;
- controle de acesso por unidade e menu.

### Regras

- somente dono/admin podem alterar permissões;
- toda alteração de permissão gera auditoria;
- reset de senha precisa invalidar sessões antigas.

## 7.3 Planos

### Funcionalidades

- cadastro de planos;
- recorrência mensal, trimestral, semestral e anual;
- descontos promocionais;
- regras de multa/pausa/cancelamento;
- assinatura por aluno;
- histórico de mudanças de plano.

### Dados críticos

- valor base;
- taxa de matrícula;
- recorrência;
- fidelidade;
- status;
- benefícios incluídos.

## 7.4 Frequência

### Funcionalidades

- check-in manual;
- check-in facial;
- relatórios por aluno, plano e período;
- heatmap de presença por horário;
- ranking de frequência;
- registro do dispositivo de entrada.

### Integrações

- câmeras/IP camera;
- SDK/API facial;
- catraca via TCP/IP, HTTP, relay ou SDK do fabricante.

## 7.5 Exercícios

### Grupo muscular

Cadastrar no mínimo:

- peito;
- costas;
- ombro;
- bíceps;
- tríceps;
- pernas;
- glúteo;
- abs.

### Lista de exercícios

Cada exercício deve conter:

- nome;
- descrição;
- link de vídeo;
- grupo muscular;
- equipamento necessário;
- nível;
- restrições/observações.

## 7.6 Treinos

### Funcionalidades

- criar treino completo por aluno;
- divisão A/B/C/D ou full body;
- séries, repetições, tempo, descanso e carga;
- treinos por objetivo;
- histórico por aluno;
- assinatura do professor e data de revisão.

### Objetivos padrão

- hipertrofia;
- emagrecimento;
- condicionamento;
- iniciante;
- reabilitação;
- performance.

## 7.7 Nutrição

### Funcionalidades

- plano alimentar por aluno;
- refeições por horário;
- macros diárias;
- peso, circunferência e bioimpedância;
- observações e anexos.

### Estrutura

- plano alimentar principal;
- refeições;
- itens alimentares;
- metas e evolução.

## 7.8 Vendas

### Funcionalidades

- PDV rápido;
- produtos, categorias, variações e estoque;
- desconto e cupom;
- integração com financeiro;
- relatório por vendedor, categoria e período.

### Itens vendáveis

- suplementos;
- roupas;
- acessórios;
- bebidas;
- serviços avulsos.

## 7.9 Financeiro

### Funcionalidades

- fluxo de caixa;
- contas a pagar e receber;
- mensalidades;
- baixa automática por webhook;
- Pix, boleto e cartão;
- split futuro para franquias;
- conciliação bancária;
- dunning de inadimplência.

### Indicadores

- MRR;
- churn financeiro;
- inadimplência;
- ticket médio;
- receita por unidade;
- DRE simplificado.

## 7.10 Relatórios

### Relatórios exportáveis

- frequência;
- financeiro;
- vendas;
- cancelamentos;
- contratos vencendo;
- produtividade de professores;
- alunos sem treino atualizado.

### Saídas

- PDF;
- Excel/CSV;
- dashboards com filtros persistentes.

## 7.11 Configurações

### Configurações gerais

- dados da academia;
- branding;
- preferências de layout;
- notificações;
- templates de WhatsApp/e-mail;
- políticas financeiras.

### Configurações de hardware

- IP da catraca;
- porta;
- protocolo;
- timeout;
- câmera/fonte de vídeo;
- dispositivo de captura facial.

---

## 8. Fluxos críticos do sistema

## 8.1 Check-in com reconhecimento facial

1. câmera captura frame;
2. serviço facial identifica aluno e score;
3. backend valida contrato e pendências;
4. se autorizado, envia comando para catraca;
5. grava evento de frequência, facial e auditoria;
6. atualiza dashboard em tempo real.

## 8.2 Cobrança recorrente

1. sistema agenda cobrança;
2. gateway processa Pix, boleto ou cartão;
3. webhook confirma pagamento ou falha;
4. financeiro baixa título;
5. sistema envia WhatsApp automático;
6. status do aluno e acesso são atualizados.

## 8.3 Geração de treino

1. professor escolhe aluno e objetivo;
2. filtra exercícios por grupo muscular e nível;
3. monta treino com séries, carga e descanso;
4. publica para portal do aluno;
5. histórico fica versionado.

## 8.4 Venda no PDV

1. atendente seleciona produtos;
2. sistema calcula desconto e estoque;
3. registra pagamento;
4. baixa estoque;
5. integra com financeiro e relatório de vendas.

---

## 9. Banco de dados — visão de domínio

### Núcleos principais

- identidade e acesso;
- CRM acadêmico/alunos;
- contratos e planos;
- presença e controle de acesso;
- treinos e exercícios;
- nutrição;
- vendas e estoque;
- financeiro;
- relatórios e auditoria;
- dispositivos e integrações.

### Estratégias de modelagem

- soft delete para cadastros relevantes;
- versionamento para treino e plano alimentar;
- tabelas de eventos para facial, webhook e catraca;
- índices compostos por tenant/unidade/data;
- enums para estados operacionais.

---

## 10. Integrações externas

## 10.1 Reconhecimento facial

### Opções

- provedor SaaS com API REST;
- serviço próprio com embeddings e vetor de face;
- integração com NVR/câmera IP.

### Requisitos

- score mínimo configurável;
- fallback manual;
- reprocessamento de falhas;
- consentimento LGPD e retenção controlada.

## 10.2 Catraca

### Possibilidades

- comando HTTP/TCP;
- SDK nativo do fabricante;
- relay/IoT intermediário.

### Requisitos

- resposta síncrona curta;
- retry controlado;
- logs de abertura, falha e timeout;
- mapeamento por unidade/dispositivo.

## 10.3 Pagamentos

### Métodos

- Pix;
- boleto;
- cartão recorrente;
- link de pagamento.

### Requisitos

- idempotência de webhook;
- reconciliação;
- antifraude quando disponível;
- status financeiro refletido no acesso.

## 10.4 WhatsApp automático

### Eventos sugeridos

- boas-vindas;
- confirmação de pagamento;
- cobrança pendente;
- treino atualizado;
- lembrete de avaliação;
- reativação de aluno inativo.

---

## 11. Relatórios premium e analytics

### Painéis analíticos

- conversão de leads em alunos;
- retenção e churn;
- horários de pico;
- evolução de frequência;
- venda por categoria;
- inadimplência por plano;
- performance de professores.

### Recursos premium

- filtros salvos;
- drill-down por unidade, professor e plano;
- exportação agendada;
- snapshots mensais.

---

## 12. Roadmap comercial sugerido

### Plano Start — ~R$ 400/mês

- alunos, planos, frequência, financeiro básico, dashboard e WhatsApp.

### Plano Pro — ~R$ 550/mês

- inclui facial, treinos, nutrição, PDV, relatórios avançados.

### Plano Premium — ~R$ 700/mês

- inclui catraca, BI avançado, múltiplas unidades, automações avançadas e SLA superior.

---

## 13. Critérios de qualidade para produção

- cobertura mínima de testes em regras críticas;
- auditoria para operações sensíveis;
- backups automáticos;
- observabilidade com alertas;
- migrações versionadas;
- segregação de segredo por ambiente;
- documentação viva com OpenAPI e playbooks operacionais.

---

## 14. Entregáveis finais desta base

Esta base contempla a definição de:

- arquitetura completa;
- banco Prisma completo;
- blueprint de backend;
- frontend com menu obrigatório;
- sistema de permissões;
- sistema facial;
- integração com catraca;
- dashboard premium;
- financeiro, treinos, nutrição e vendas;
- relatórios e configurações;
- logs e auditoria.

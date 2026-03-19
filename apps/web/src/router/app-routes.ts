import { sidebarItems } from '../config/sidebar';

export type AppRoute = {
  path: string;
  pageTitle: string;
  module: string;
  features: string[];
};

export const appRoutes: AppRoute[] = [
  {
    path: '/painel',
    pageTitle: 'Painel Geral',
    module: 'Painel',
    features: ['resumo geral', 'entradas recentes via facial', 'indicadores', 'gráficos de faturamento', 'horas de pico'],
  },
  {
    path: '/usuarios',
    pageTitle: 'Usuários',
    module: 'Usuários',
    features: ['funcionários', 'permissões por cargo', 'logs de ações', 'reset de senha', 'controle de acesso'],
  },
  {
    path: '/planos',
    pageTitle: 'Planos',
    module: 'Planos',
    features: ['cadastro de planos', 'valores e recorrência', 'descontos', 'assinatura por aluno', 'histórico'],
  },
  {
    path: '/frequencia',
    pageTitle: 'Frequência',
    module: 'Frequência',
    features: ['lista de presença', 'facial', 'heatmap', 'ranking', 'filtros por aluno/período/plano'],
  },
  {
    path: '/exercicios',
    pageTitle: 'Exercícios',
    module: 'Exercícios',
    features: ['hub da biblioteca', 'atalhos por grupo muscular', 'curadoria técnica'],
  },
  {
    path: '/exercicios/grupo-muscular',
    pageTitle: 'Grupo Muscular',
    module: 'Grupo Muscular',
    features: ['cadastro de grupos', 'edição', 'vinculação com exercícios'],
  },
  {
    path: '/exercicios/lista',
    pageTitle: 'Lista de Exercícios',
    module: 'Lista de Exercícios',
    features: ['cadastro completo', 'vídeo', 'descrição', 'grupo muscular', 'equipamento'],
  },
  {
    path: '/treinos',
    pageTitle: 'Treinos',
    module: 'Treinos',
    features: ['criação por professor', 'séries', 'repetições', 'cargas', 'objetivos', 'histórico por aluno'],
  },
  {
    path: '/nutricao',
    pageTitle: 'Nutrição',
    module: 'Nutrição',
    features: ['plano alimentar', 'refeições por horários', 'macros do dia', 'peso'],
  },
  {
    path: '/vendas',
    pageTitle: 'Vendas',
    module: 'Vendas',
    features: ['PDV', 'categorias', 'estoque', 'relatórios de vendas', 'integração com financeiro'],
  },
  {
    path: '/financeiro',
    pageTitle: 'Financeiro',
    module: 'Financeiro',
    features: ['fluxo de caixa', 'entradas e saídas', 'gateway', 'webhooks', 'relatórios financeiros'],
  },
  {
    path: '/relatorios',
    pageTitle: 'Relatórios',
    module: 'Relatórios',
    features: ['PDF/Excel', 'frequência', 'financeiro', 'cancelamentos', 'gráficos avançados'],
  },
  {
    path: '/configuracoes',
    pageTitle: 'Configurações',
    module: 'Configurações',
    features: ['catraca e câmera', 'IP da catraca', 'notificações', 'preferências de layout'],
  },
];

export const sidebarValidation = {
  totalSections: 13,
  exactLabels: sidebarItems.map((item) => item.label),
};

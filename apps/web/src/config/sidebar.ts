export type SidebarItem = {
  key:
    | 'painel'
    | 'usuarios'
    | 'planos'
    | 'frequencia'
    | 'exercicios'
    | 'grupo-muscular'
    | 'lista-exercicios'
    | 'treinos'
    | 'nutricao'
    | 'vendas'
    | 'financeiro'
    | 'relatorios'
    | 'configuracoes';
  label: string;
  path: string;
  description: string;
};

export const sidebarItems: SidebarItem[] = [
  {
    key: 'painel',
    label: 'Painel',
    path: '/painel',
    description: 'Dashboard geral com KPIs, entradas recentes, faturamento e horas de pico.',
  },
  {
    key: 'usuarios',
    label: 'Usuários',
    path: '/usuarios',
    description: 'Gestão completa de funcionários, permissões, resets de senha e logs.',
  },
  {
    key: 'planos',
    label: 'Planos',
    path: '/planos',
    description: 'Planos da academia, recorrência, descontos e histórico de assinaturas.',
  },
  {
    key: 'frequencia',
    label: 'Frequência',
    path: '/frequencia',
    description: 'Lista de presença, relatórios, ranking e heatmap de horários.',
  },
  {
    key: 'exercicios',
    label: 'Exercícios',
    path: '/exercicios',
    description: 'Hub de navegação da biblioteca técnica de exercícios.',
  },
  {
    key: 'grupo-muscular',
    label: 'Grupo Muscular',
    path: '/exercicios/grupo-muscular',
    description: 'Cadastro dos grupos musculares como peito, costas, ombro e pernas.',
  },
  {
    key: 'lista-exercicios',
    label: 'Lista de Exercícios',
    path: '/exercicios/lista',
    description: 'Cadastro completo de exercícios com vídeo, descrição e equipamento.',
  },
  {
    key: 'treinos',
    label: 'Treinos',
    path: '/treinos',
    description: 'Criação de treinos completos com séries, repetições, cargas e objetivos.',
  },
  {
    key: 'nutricao',
    label: 'Nutrição',
    path: '/nutricao',
    description: 'Planos alimentares, refeições por horário, macros e peso.',
  },
  {
    key: 'vendas',
    label: 'Vendas',
    path: '/vendas',
    description: 'PDV, produtos, suplementos, roupas, estoque e integração financeira.',
  },
  {
    key: 'financeiro',
    label: 'Financeiro',
    path: '/financeiro',
    description: 'Fluxo de caixa, entradas, saídas, gateways, webhooks e relatórios.',
  },
  {
    key: 'relatorios',
    label: 'Relatórios',
    path: '/relatorios',
    description: 'Relatórios premium exportáveis em PDF e Excel com gráficos avançados.',
  },
  {
    key: 'configuracoes',
    label: 'Configurações',
    path: '/configuracoes',
    description: 'Setup de catraca, câmera, IP, notificações, preferências e layout.',
  },
];

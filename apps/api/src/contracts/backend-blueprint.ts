export type SidebarSectionKey =
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

export type SystemRole = 'owner' | 'admin' | 'reception' | 'coach' | 'nutritionist';

export interface PermissionMatrixItem {
  section: SidebarSectionKey;
  actions: Array<'view' | 'create' | 'update' | 'delete' | 'export' | 'manage'>;
  roles: SystemRole[];
}

export const permissionMatrix: PermissionMatrixItem[] = [
  { section: 'painel', actions: ['view'], roles: ['owner', 'admin', 'reception', 'coach', 'nutritionist'] },
  { section: 'usuarios', actions: ['view', 'create', 'update', 'manage'], roles: ['owner', 'admin'] },
  { section: 'planos', actions: ['view', 'create', 'update'], roles: ['owner', 'admin', 'reception'] },
  { section: 'frequencia', actions: ['view', 'create', 'export'], roles: ['owner', 'admin', 'reception', 'coach'] },
  { section: 'exercicios', actions: ['view'], roles: ['owner', 'admin', 'coach', 'nutritionist'] },
  { section: 'grupo-muscular', actions: ['view', 'create', 'update'], roles: ['owner', 'admin', 'coach'] },
  { section: 'lista-exercicios', actions: ['view', 'create', 'update'], roles: ['owner', 'admin', 'coach'] },
  { section: 'treinos', actions: ['view', 'create', 'update', 'export'], roles: ['owner', 'admin', 'coach'] },
  { section: 'nutricao', actions: ['view', 'create', 'update', 'export'], roles: ['owner', 'admin', 'nutritionist'] },
  { section: 'vendas', actions: ['view', 'create', 'update', 'export'], roles: ['owner', 'admin', 'reception'] },
  { section: 'financeiro', actions: ['view', 'create', 'update', 'export', 'manage'], roles: ['owner', 'admin'] },
  { section: 'relatorios', actions: ['view', 'export'], roles: ['owner', 'admin', 'coach', 'nutritionist'] },
  { section: 'configuracoes', actions: ['view', 'update', 'manage'], roles: ['owner', 'admin'] },
];

export interface ModuleBlueprint {
  section: SidebarSectionKey;
  description: string;
  entities: string[];
  endpoints: string[];
  integrations?: string[];
}

export const backendModules: ModuleBlueprint[] = [
  {
    section: 'painel',
    description: 'Dashboard geral com KPIs operacionais, financeiros e eventos recentes de acesso.',
    entities: ['Student', 'AttendanceRecord', 'FinancialEntry', 'SaleOrder', 'FacialRecognitionEvent'],
    endpoints: ['GET /dashboard/summary', 'GET /dashboard/revenue', 'GET /dashboard/peak-hours', 'GET /dashboard/recent-access'],
  },
  {
    section: 'usuarios',
    description: 'Gestão completa de funcionários, papéis, permissões, reset de senha e auditoria.',
    entities: ['User', 'Role', 'Permission', 'AuditLog', 'RefreshToken'],
    endpoints: [
      'GET /users',
      'POST /users',
      'PATCH /users/:id',
      'POST /users/:id/reset-password',
      'GET /roles',
      'PATCH /roles/:id/permissions',
      'GET /audit-logs',
    ],
  },
  {
    section: 'planos',
    description: 'Cadastro de planos, assinatura por aluno, regras de recorrência e histórico contratual.',
    entities: ['Plan', 'Membership', 'Student'],
    endpoints: ['GET /plans', 'POST /plans', 'PATCH /plans/:id', 'POST /memberships', 'GET /students/:id/memberships'],
  },
  {
    section: 'frequencia',
    description: 'Presença, ranking, heatmap e eventos integrados com facial/catraca.',
    entities: ['AttendanceRecord', 'FacialRecognitionEvent', 'Device', 'Student'],
    endpoints: [
      'GET /attendance',
      'POST /attendance/manual',
      'POST /attendance/facial-identify',
      'GET /attendance/heatmap',
      'GET /attendance/ranking',
    ],
    integrations: ['Face API/SDK', 'Turnstile SDK/API'],
  },
  {
    section: 'exercicios',
    description: 'Catálogo de exercícios e navegação de apoio para professores.',
    entities: ['Exercise', 'MuscleGroup'],
    endpoints: ['GET /exercises/catalog'],
  },
  {
    section: 'grupo-muscular',
    description: 'Cadastro e manutenção dos grupos musculares base.',
    entities: ['MuscleGroup'],
    endpoints: ['GET /muscle-groups', 'POST /muscle-groups', 'PATCH /muscle-groups/:id'],
  },
  {
    section: 'lista-exercicios',
    description: 'CRUD completo de exercícios com vídeo, descrição, grupo muscular e equipamento.',
    entities: ['Exercise', 'MuscleGroup'],
    endpoints: ['GET /exercises', 'POST /exercises', 'PATCH /exercises/:id', 'DELETE /exercises/:id'],
  },
  {
    section: 'treinos',
    description: 'Prescrição de treinos, objetivos, séries, repetições, carga e histórico por aluno.',
    entities: ['WorkoutPlan', 'WorkoutItem', 'Student', 'Exercise'],
    endpoints: ['GET /workouts', 'POST /workouts', 'PATCH /workouts/:id', 'POST /workouts/:id/publish', 'GET /students/:id/workouts'],
  },
  {
    section: 'nutricao',
    description: 'Planos alimentares, refeições por horário, macros e evolução corporal.',
    entities: ['NutritionPlan', 'NutritionMeal', 'NutritionMealItem', 'BodyMetric'],
    endpoints: ['GET /nutrition/plans', 'POST /nutrition/plans', 'PATCH /nutrition/plans/:id', 'POST /students/:id/body-metrics'],
  },
  {
    section: 'vendas',
    description: 'PDV, estoque, produtos, categorias e integração financeira automática.',
    entities: ['ProductCategory', 'Product', 'SaleOrder', 'SaleOrderItem', 'FinancialEntry'],
    endpoints: ['GET /sales/orders', 'POST /sales/orders', 'GET /products', 'POST /products', 'PATCH /products/:id/stock'],
  },
  {
    section: 'financeiro',
    description: 'Fluxo de caixa, contas, gateways de pagamento, webhooks e indicadores premium.',
    entities: ['FinancialEntry', 'FinancialCategory', 'Membership', 'SaleOrder'],
    endpoints: [
      'GET /financial/entries',
      'POST /financial/entries',
      'PATCH /financial/entries/:id',
      'POST /payments/checkout',
      'POST /payments/webhooks/:provider',
      'GET /financial/reports/cashflow',
    ],
    integrations: ['Pix gateway', 'Boleto gateway', 'Card acquirer'],
  },
  {
    section: 'relatorios',
    description: 'Relatórios premium em tela e exportáveis em PDF/Excel.',
    entities: ['AttendanceRecord', 'FinancialEntry', 'SaleOrder', 'Membership'],
    endpoints: ['GET /reports/attendance', 'GET /reports/financial', 'GET /reports/cancellations', 'POST /reports/export'],
  },
  {
    section: 'configuracoes',
    description: 'Parâmetros gerais, branding, notificações, câmeras e catracas.',
    entities: ['Gym', 'GymUnit', 'Device', 'NotificationLog'],
    endpoints: ['GET /settings/general', 'PATCH /settings/general', 'GET /devices', 'POST /devices', 'PATCH /devices/:id'],
    integrations: ['WhatsApp provider', 'Turnstile devices', 'Camera devices'],
  },
];

export interface IntegrationFlow {
  name: string;
  steps: string[];
}

export const integrationFlows: IntegrationFlow[] = [
  {
    name: 'Reconhecimento facial + catraca',
    steps: [
      'Receber frame/imagem do dispositivo configurado.',
      'Enviar para provedor facial e recuperar score de confiança.',
      'Validar matrícula, status financeiro e regras de acesso.',
      'Disparar comando de abertura da catraca quando aprovado.',
      'Persistir attendance record, facial event e audit log.',
    ],
  },
  {
    name: 'Cobrança recorrente',
    steps: [
      'Gerar cobrança a partir da membership.',
      'Criar intenção de pagamento em gateway (Pix, boleto ou cartão).',
      'Receber webhook idempotente com atualização de status.',
      'Baixar financeiro e liberar/acompanhar acesso do aluno.',
      'Enviar mensagem automática por WhatsApp conforme evento.',
    ],
  },
];

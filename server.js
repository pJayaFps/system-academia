const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'public');

const sidebar = [
  { key: 'painel', label: 'Painel', path: '/painel', description: 'Dashboard geral com KPIs, entradas recentes, faturamento e horas de pico.' },
  { key: 'usuarios', label: 'Usuários', path: '/usuarios', description: 'Gestão completa de funcionários, permissões, resets de senha e logs.' },
  { key: 'planos', label: 'Planos', path: '/planos', description: 'Planos da academia, recorrência, descontos e histórico de assinaturas.' },
  { key: 'frequencia', label: 'Frequência', path: '/frequencia', description: 'Lista de presença, relatórios, ranking e heatmap de horários.' },
  { key: 'exercicios', label: 'Exercícios', path: '/exercicios', description: 'Hub de navegação da biblioteca técnica de exercícios.' },
  { key: 'grupo-muscular', label: 'Grupo Muscular', path: '/exercicios/grupo-muscular', description: 'Cadastro dos grupos musculares como peito, costas, ombro e pernas.' },
  { key: 'lista-exercicios', label: 'Lista de Exercícios', path: '/exercicios/lista', description: 'Cadastro completo de exercícios com vídeo, descrição e equipamento.' },
  { key: 'treinos', label: 'Treinos', path: '/treinos', description: 'Criação de treinos completos com séries, repetições, cargas e objetivos.' },
  { key: 'nutricao', label: 'Nutrição', path: '/nutricao', description: 'Planos alimentares, refeições por horário, macros e peso.' },
  { key: 'vendas', label: 'Vendas', path: '/vendas', description: 'PDV, produtos, suplementos, roupas, estoque e integração financeira.' },
  { key: 'financeiro', label: 'Financeiro', path: '/financeiro', description: 'Fluxo de caixa, entradas, saídas, gateways, webhooks e relatórios.' },
  { key: 'relatorios', label: 'Relatórios', path: '/relatorios', description: 'Relatórios premium exportáveis em PDF e Excel com gráficos avançados.' },
  { key: 'configuracoes', label: 'Configurações', path: '/configuracoes', description: 'Setup de catraca, câmera, IP, notificações, preferências e layout.' },
];

const modules = {
  painel: {
    title: 'Painel Geral',
    subtitle: 'Resumo executivo da operação da academia.',
    highlights: [
      { label: 'Alunos ativos', value: '842' },
      { label: 'Inadimplentes', value: '57' },
      { label: 'Novos alunos', value: '36' },
      { label: 'Faturamento mensal', value: 'R$ 84.920' },
    ],
    lists: {
      'Entradas recentes via facial': ['07:02 · Ana Souza · score 98.7', '07:04 · Bruno Lima · score 96.3', '07:08 · Carla Santos · score 97.9'],
      'Horas de pico': ['06h–08h', '12h–13h', '18h–20h'],
    },
  },
  usuarios: {
    title: 'Usuários',
    subtitle: 'Gestão completa de funcionários e permissões.',
    highlights: [
      { label: 'Funcionários ativos', value: '18' },
      { label: 'Perfis configurados', value: '5' },
      { label: 'Ações auditadas hoje', value: '126' },
      { label: 'Resets pendentes', value: '2' },
    ],
    lists: {
      'Perfis padrão': ['Dono', 'Admin', 'Recepção', 'Professor', 'Nutricionista'],
      'Controles': ['Reset de senha', 'Bloqueio de sessão', 'Permissão por menu', 'Auditoria de ações'],
    },
  },
  planos: {
    title: 'Planos',
    subtitle: 'Cadastro de planos e assinatura por aluno.',
    highlights: [
      { label: 'Planos ativos', value: '7' },
      { label: 'Assinaturas vigentes', value: '801' },
      { label: 'Ticket médio', value: 'R$ 129' },
      { label: 'Desconto médio', value: '8%' },
    ],
    lists: {
      'Recorrências': ['Mensal', 'Trimestral', 'Semestral', 'Anual'],
      'Campos-chave': ['Valor', 'Fidelidade', 'Desconto', 'Taxa de matrícula', 'Histórico'],
    },
  },
  frequencia: {
    title: 'Frequência',
    subtitle: 'Presença, ranking e heatmap por horário.',
    highlights: [
      { label: 'Check-ins hoje', value: '412' },
      { label: 'Reconhecimento facial', value: '93%' },
      { label: 'Ranking top 10', value: 'Disponível' },
      { label: 'Catracas online', value: '3/3' },
    ],
    lists: {
      'Filtros': ['Aluno', 'Período', 'Tipo de plano', 'Origem da entrada'],
      'Visualizações': ['Lista de presença', 'Heatmap', 'Ranking', 'Eventos faciais'],
    },
  },
  exercicios: {
    title: 'Exercícios',
    subtitle: 'Hub da biblioteca técnica de exercícios.',
    highlights: [
      { label: 'Exercícios cadastrados', value: '214' },
      { label: 'Grupos musculares', value: '8' },
      { label: 'Vídeos vinculados', value: '186' },
      { label: 'Equipamentos mapeados', value: '32' },
    ],
    lists: {
      'Acessos rápidos': ['Grupo muscular', 'Lista de exercícios', 'Restrições', 'Equipamentos'],
      'Padrão comercial': ['Vídeo', 'Descrição', 'Nível', 'Equipamento', 'Observações'],
    },
  },
  'grupo-muscular': {
    title: 'Grupo Muscular',
    subtitle: 'Cadastro dos grupos musculares base.',
    highlights: [
      { label: 'Base padrão', value: '8 grupos' },
      { label: 'Mais usados', value: 'Peito / Pernas' },
      { label: 'Ativos', value: '100%' },
      { label: 'Atualização', value: 'Centralizada' },
    ],
    lists: {
      'Grupos padrão': ['Peito', 'Costas', 'Ombro', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteo', 'Abs'],
    },
  },
  'lista-exercicios': {
    title: 'Lista de Exercícios',
    subtitle: 'Cadastro completo da biblioteca de exercícios.',
    highlights: [
      { label: 'Cadastros completos', value: '214' },
      { label: 'Com vídeo', value: '186' },
      { label: 'Com equipamento', value: '203' },
      { label: 'Níveis mapeados', value: '3' },
    ],
    lists: {
      'Campos obrigatórios': ['Nome', 'Descrição', 'Link de vídeo', 'Grupo muscular', 'Equipamento'],
    },
  },
  treinos: {
    title: 'Treinos',
    subtitle: 'Prescrição de treinos completos por objetivo.',
    highlights: [
      { label: 'Treinos ativos', value: '533' },
      { label: 'Revisões pendentes', value: '28' },
      { label: 'Objetivos padrão', value: '6' },
      { label: 'Professores logados', value: '4' },
    ],
    lists: {
      'Objetivos': ['Hipertrofia', 'Emagrecimento', 'Iniciante', 'Condicionamento', 'Reabilitação', 'Performance'],
      'Campos técnicos': ['Séries', 'Repetições', 'Carga', 'Descanso', 'Tempo', 'Histórico'],
    },
  },
  nutricao: {
    title: 'Nutrição',
    subtitle: 'Planos alimentares, macros e evolução corporal.',
    highlights: [
      { label: 'Planos ativos', value: '147' },
      { label: 'Pesagens no mês', value: '94' },
      { label: 'Macros calculadas', value: 'Automático' },
      { label: 'Nutricionistas', value: '2' },
    ],
    lists: {
      'Blocos do módulo': ['Plano alimentar', 'Refeições por horário', 'Macros do dia', 'Acompanhamento de peso'],
    },
  },
  vendas: {
    title: 'Vendas',
    subtitle: 'PDV, estoque e integração com financeiro.',
    highlights: [
      { label: 'Produtos ativos', value: '126' },
      { label: 'Vendas hoje', value: 'R$ 3.420' },
      { label: 'Itens em estoque baixo', value: '11' },
      { label: 'Categorias', value: '9' },
    ],
    lists: {
      'PDV': ['Suplementos', 'Roupas', 'Acessórios', 'Bebidas', 'Serviços avulsos'],
      'Recursos': ['Cupom', 'Desconto', 'Estoque', 'Relatórios', 'Integração financeira'],
    },
  },
  financeiro: {
    title: 'Financeiro',
    subtitle: 'Fluxo de caixa, gateway e relatórios financeiros.',
    highlights: [
      { label: 'Recebimentos previstos', value: 'R$ 102.400' },
      { label: 'Pagamentos do mês', value: 'R$ 29.700' },
      { label: 'MRR', value: 'R$ 78.900' },
      { label: 'Inadimplência', value: '6.8%' },
    ],
    lists: {
      'Métodos': ['Pix', 'Boleto', 'Cartão', 'Transferência'],
      'Rotinas': ['Fluxo de caixa', 'Entradas e saídas', 'Webhooks', 'Conciliação', 'DRE simplificado'],
    },
  },
  relatorios: {
    title: 'Relatórios',
    subtitle: 'Relatórios premium exportáveis e analíticos.',
    highlights: [
      { label: 'Relatórios salvos', value: '24' },
      { label: 'Exports no mês', value: '67' },
      { label: 'Formatos', value: 'PDF / Excel' },
      { label: 'Filtros persistentes', value: 'Sim' },
    ],
    lists: {
      'Relatórios padrão': ['Frequência', 'Financeiro', 'Cancelamentos', 'Vendas', 'Produtividade'],
    },
  },
  configuracoes: {
    title: 'Configurações',
    subtitle: 'Parâmetros gerais, branding e dispositivos.',
    highlights: [
      { label: 'Câmeras configuradas', value: '4' },
      { label: 'Catracas configuradas', value: '3' },
      { label: 'Templates WhatsApp', value: '12' },
      { label: 'Tema premium', value: 'Ativo' },
    ],
    lists: {
      'Setup': ['IP da catraca', 'Porta', 'Protocolo', 'Timeout', 'Câmera', 'Layout', 'Notificações'],
    },
  },
};

const apiResponse = {
  product: 'Sistema Premium de Gestão de Academia',
  version: 'demo-executavel-1.0.0',
  menuCount: sidebar.length,
  sidebar,
  modules,
  integrations: [
    'Reconhecimento facial integrado',
    'Controle físico de catraca',
    'Pix, boleto e cartão',
    'WhatsApp automático',
    'Logs e auditoria',
  ],
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data, null, 2));
}

function serveStaticFile(reqPath, res) {
  const filePath = path.join(publicDir, reqPath === '/' ? 'index.html' : reqPath.replace(/^\//, ''));
  const normalized = path.normalize(filePath);
  if (!normalized.startsWith(publicDir)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(normalized, (error, content) => {
    if (error) {
      if (reqPath !== '/' && reqPath.endsWith('.html') === false) {
        return serveStaticFile('/', res);
      }
      sendJson(res, 404, { error: 'File not found' });
      return;
    }

    const ext = path.extname(normalized);
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
    };

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8' });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname === '/api/health') {
    return sendJson(res, 200, { status: 'ok', port: PORT });
  }

  if (parsed.pathname === '/api/system') {
    return sendJson(res, 200, apiResponse);
  }

  if (parsed.pathname === '/api/dashboard') {
    return sendJson(res, 200, modules.painel);
  }

  return serveStaticFile(parsed.pathname || '/', res);
});

server.listen(PORT, () => {
  console.log(`Sistema Premium de Gestão de Academia disponível em http://localhost:${PORT}`);
});

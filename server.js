const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const publicDir = path.join(__dirname, 'public');
const dataFile = path.join(__dirname, 'data', 'system.json');

const sidebar = [
  { key: 'painel', label: 'Painel', path: '/painel', description: 'Dashboard geral com KPIs e visão operacional em tempo real.' },
  { key: 'usuarios', label: 'Usuários', path: '/usuarios', description: 'Funcionários, cargos, permissões e acesso ao sistema.' },
  { key: 'planos', label: 'Planos', path: '/planos', description: 'Planos, recorrências, descontos e assinaturas.' },
  { key: 'frequencia', label: 'Frequência', path: '/frequencia', description: 'Entradas, filtros, heatmap e ranking de frequência.' },
  { key: 'exercicios', label: 'Exercícios', path: '/exercicios', description: 'Resumo técnico do módulo de exercícios.' },
  { key: 'grupo-muscular', label: 'Grupo Muscular', path: '/exercicios/grupo-muscular', description: 'Cadastro de grupos musculares.' },
  { key: 'lista-exercicios', label: 'Lista de Exercícios', path: '/exercicios/lista', description: 'Cadastro de exercícios com vídeo, descrição e equipamento.' },
  { key: 'treinos', label: 'Treinos', path: '/treinos', description: 'Treinos completos por aluno, objetivo e professor.' },
  { key: 'nutricao', label: 'Nutrição', path: '/nutricao', description: 'Planos alimentares e acompanhamento corporal.' },
  { key: 'vendas', label: 'Vendas', path: '/vendas', description: 'PDV, produtos, categorias, estoque e integração financeira.' },
  { key: 'financeiro', label: 'Financeiro', path: '/financeiro', description: 'Contas, fluxo de caixa, gateways e cobranças.' },
  { key: 'relatorios', label: 'Relatórios', path: '/relatorios', description: 'Relatórios operacionais e exportáveis.' },
  { key: 'configuracoes', label: 'Configurações', path: '/configuracoes', description: 'Academia, facial, catraca, pagamentos, WhatsApp e layout.' },
];

function defaultData() {
  return {
    gym: {
      name: '',
      tradeName: '',
      document: '',
      email: '',
      phone: '',
      timezone: 'America/Sao_Paulo',
    },
    settings: {
      facial: {
        enabled: false,
        provider: '',
        endpoint: '',
        apiKey: '',
        cameraSource: '',
        threshold: 0,
      },
      turnstile: {
        enabled: false,
        name: '',
        ip: '',
        port: 0,
        protocol: '',
        timeoutMs: 0,
        openCommand: '',
      },
      payments: {
        pixEnabled: false,
        pixProvider: '',
        boletoEnabled: false,
        boletoProvider: '',
        cardEnabled: false,
        cardProvider: '',
        webhookUrl: '',
      },
      whatsapp: {
        enabled: false,
        provider: '',
        token: '',
        phoneNumberId: '',
        endpoint: '',
      },
      layout: {
        theme: 'dark',
        compactSidebar: false,
      },
    },
    users: [],
    students: [],
    plans: [],
    memberships: [],
    muscleGroups: [],
    exercises: [],
    workouts: [],
    nutritionPlans: [],
    products: [],
    sales: [],
    financialEntries: [],
    attendance: [],
    leads: [],
    automationRules: [],
    auditLogs: [],
  };
}

function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
    fs.mkdirSync(path.dirname(dataFile), { recursive: true });
    fs.writeFileSync(dataFile, JSON.stringify(defaultData(), null, 2));
  }
}

function loadData() {
  ensureDataFile();
  const raw = fs.readFileSync(dataFile, 'utf8');
  return { ...defaultData(), ...JSON.parse(raw) };
}

function saveData(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

function withId(record) {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...record,
  };
}

function addAuditLog(data, action, resource, payload = {}) {
  data.auditLogs.unshift(withId({ action, resource, payload }));
  data.auditLogs = data.auditLogs.slice(0, 100);
}

async function runExternalRequest(targetUrl, payload) {
  if (!targetUrl) {
    return { executed: false, message: 'Nenhum endpoint configurado.' };
  }

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });

  const text = await response.text();
  return { executed: true, status: response.status, body: text };
}

function calculateDashboard(data) {
  const activeMemberships = data.memberships.filter((item) => item.status === 'active').length;
  const overdueMemberships = data.memberships.filter((item) => item.status === 'overdue').length;
  const monthlyRevenue = data.financialEntries
    .filter((item) => item.type === 'income' && item.status === 'paid')
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  const forecastRevenue = data.memberships
    .filter((item) => item.status === 'active')
    .reduce((acc, membership) => {
      const plan = data.plans.find((item) => item.id === membership.planId);
      return acc + Number(plan?.price || 0);
    }, 0);

  const hotLeads = data.leads.filter((item) => ['hot', 'proposal'].includes(item.status)).length;
  const wonLeads = data.leads.filter((item) => item.status === 'won').length;
  const conversionRate = data.leads.length ? Number(((wonLeads / data.leads.length) * 100).toFixed(2)) : 0;

  const reactivationCandidates = data.students.filter((student) => {
    const records = data.attendance.filter((item) => item.studentId === student.id);
    if (!records.length) return true;
    const last = records.map((item) => new Date(item.checkedAt).getTime()).sort((a, b) => b - a)[0];
    const days = (Date.now() - last) / (1000 * 60 * 60 * 24);
    return days >= 30;
  }).length;

  return {
    activeStudents: data.students.length,
    activeMemberships,
    overdueMemberships,
    users: data.users.length,
    plans: data.plans.length,
    checkins: data.attendance.length,
    exercises: data.exercises.length,
    workouts: data.workouts.length,
    nutritionPlans: data.nutritionPlans.length,
    products: data.products.length,
    financialEntries: data.financialEntries.length,
    monthlyRevenue,
    forecastRevenue,
    hotLeads,
    conversionRate,
    reactivationCandidates,
  };
}

function applyAttendanceFilters(records, query, data) {
  return records.filter((record) => {
    if (query.studentId && record.studentId !== query.studentId) return false;

    if (query.planId) {
      const membership = data.memberships.find((item) => item.studentId === record.studentId && item.planId === query.planId);
      if (!membership) return false;
    }

    if (query.dateFrom && new Date(record.checkedAt) < new Date(query.dateFrom)) return false;
    if (query.dateTo && new Date(record.checkedAt) > new Date(query.dateTo + 'T23:59:59')) return false;
    return true;
  });
}

function summarizeSystem(data) {
  return {
    gym: data.gym,
    settings: data.settings,
    dashboard: calculateDashboard(data),
    sidebar,
    users: data.users,
    students: data.students,
    plans: data.plans,
    memberships: data.memberships,
    muscleGroups: data.muscleGroups,
    exercises: data.exercises,
    workouts: data.workouts,
    nutritionPlans: data.nutritionPlans,
    products: data.products,
    sales: data.sales,
    financialEntries: data.financialEntries,
    attendance: data.attendance,
    leads: data.leads,
    automationRules: data.automationRules,
    auditLogs: data.auditLogs,
  };
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload, null, 2));
}

function notFound(res) {
  return sendJson(res, 404, { error: 'Not found' });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function serveStaticFile(reqPath, res) {
  const filePath = path.join(publicDir, reqPath === '/' ? 'index.html' : reqPath.replace(/^\//, ''));
  const normalized = path.normalize(filePath);
  if (!normalized.startsWith(publicDir)) {
    return sendJson(res, 403, { error: 'Forbidden' });
  }

  fs.readFile(normalized, (error, content) => {
    if (error) {
      if (!reqPath.includes('.') || reqPath.endsWith('.html')) {
        return fs.readFile(path.join(publicDir, 'index.html'), (fallbackError, fallbackContent) => {
          if (fallbackError) return notFound(res);
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(fallbackContent);
        });
      }
      return notFound(res);
    }

    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
    };

    res.writeHead(200, { 'Content-Type': contentTypes[path.extname(normalized)] || 'text/plain; charset=utf-8' });
    res.end(content);
  });
}

async function handlePostCollection(req, res, collectionName, normalizer) {
  const data = loadData();
  const payload = await parseBody(req);
  const item = withId(normalizer(payload));
  data[collectionName].push(item);
  addAuditLog(data, 'create_record', collectionName, { id: item.id });
  saveData(data);
  return sendJson(res, 201, item);
}

function normalizeBoolean(value) {
  return value === true || value === 'true' || value === 'on';
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);

  try {
    if (req.method === 'GET' && parsed.pathname === '/api/health') {
      return sendJson(res, 200, { status: 'ok', port: PORT });
    }

    if (req.method === 'GET' && parsed.pathname === '/api/system') {
      return sendJson(res, 200, summarizeSystem(loadData()));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/reset') {
      const data = defaultData();
      addAuditLog(data, 'reset_system', 'system', {});
      saveData(data);
      return sendJson(res, 200, summarizeSystem(data));
    }

    if (req.method === 'GET' && parsed.pathname === '/api/dashboard') {
      const data = loadData();
      return sendJson(res, 200, calculateDashboard(data));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/settings') {
      const data = loadData();
      const payload = await parseBody(req);
      data.gym = { ...data.gym, ...(payload.gym || {}) };
      data.settings = {
        facial: { ...data.settings.facial, ...(payload.settings?.facial || {}) },
        turnstile: { ...data.settings.turnstile, ...(payload.settings?.turnstile || {}) },
        payments: { ...data.settings.payments, ...(payload.settings?.payments || {}) },
        whatsapp: { ...data.settings.whatsapp, ...(payload.settings?.whatsapp || {}) },
        layout: { ...data.settings.layout, ...(payload.settings?.layout || {}) },
      };
      addAuditLog(data, 'update_settings', 'settings', { gymName: data.gym.name });
      saveData(data);
      return sendJson(res, 200, { success: true, gym: data.gym, settings: data.settings });
    }

    if (req.method === 'POST' && parsed.pathname === '/api/integrations/facial/identify') {
      const data = loadData();
      const payload = await parseBody(req);
      const student = data.students.find((item) => item.id === payload.studentId);
      if (!student) return sendJson(res, 400, { error: 'Aluno não encontrado.' });

      const attendance = withId({
        studentId: payload.studentId,
        source: 'facial',
        checkedAt: payload.checkedAt || new Date().toISOString(),
        deviceName: payload.deviceName || data.settings.facial.cameraSource || 'facial',
        confidence: Number(payload.confidence || data.settings.facial.threshold || 0),
        releasedTurnstile: false,
      });

      data.attendance.push(attendance);
      addAuditLog(data, 'facial_identify', 'integration', { studentId: payload.studentId, confidence: attendance.confidence });

      const external = await runExternalRequest(data.settings.facial.endpoint, payload);
      saveData(data);
      return sendJson(res, 200, { success: true, attendance, external });
    }

    if (req.method === 'POST' && parsed.pathname === '/api/integrations/turnstile/open') {
      const data = loadData();
      const payload = await parseBody(req);
      const settings = data.settings.turnstile;
      const url = settings.openCommand || (settings.ip ? `${settings.protocol || 'http'}://${settings.ip}${settings.port ? `:${settings.port}` : ''}` : '');
      const external = await runExternalRequest(url, payload);
      addAuditLog(data, 'turnstile_open', 'integration', { reason: payload.reason || '', studentId: payload.studentId || '' });
      saveData(data);
      return sendJson(res, 200, { success: true, external });
    }

    if (req.method === 'POST' && parsed.pathname === '/api/integrations/whatsapp/test') {
      const data = loadData();
      const payload = await parseBody(req);
      const external = await runExternalRequest(data.settings.whatsapp.endpoint, payload);
      addAuditLog(data, 'whatsapp_test', 'integration', { to: payload.to || '', message: payload.message || '' });
      saveData(data);
      return sendJson(res, 200, { success: true, external });
    }

    if (req.method === 'POST' && parsed.pathname.startsWith('/api/payments/webhooks/')) {
      const data = loadData();
      const payload = await parseBody(req);
      const provider = parsed.pathname.split('/').pop();
      addAuditLog(data, 'payment_webhook', 'payment', { provider, payload });
      if (payload.description || payload.amount) {
        data.financialEntries.push(withId({
          description: payload.description || `Webhook ${provider}`,
          type: payload.type || 'income',
          status: payload.status || 'paid',
          amount: Number(payload.amount || 0),
          dueDate: payload.dueDate || '',
        }));
      }
      saveData(data);
      return sendJson(res, 200, { success: true, provider });
    }

    if (req.method === 'POST' && parsed.pathname === '/api/users') {
      return handlePostCollection(req, res, 'users', (payload) => ({
        name: payload.name || '',
        email: payload.email || '',
        role: payload.role || '',
        status: payload.status || 'active',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/students') {
      return handlePostCollection(req, res, 'students', (payload) => ({
        name: payload.name || '',
        email: payload.email || '',
        phone: payload.phone || '',
        notes: payload.notes || '',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/plans') {
      return handlePostCollection(req, res, 'plans', (payload) => ({
        name: payload.name || '',
        price: Number(payload.price || 0),
        recurrenceDays: Number(payload.recurrenceDays || 0),
        description: payload.description || '',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/memberships') {
      return handlePostCollection(req, res, 'memberships', (payload) => ({
        studentId: payload.studentId || '',
        planId: payload.planId || '',
        status: payload.status || 'active',
        startDate: payload.startDate || '',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/muscle-groups') {
      return handlePostCollection(req, res, 'muscleGroups', (payload) => ({
        name: payload.name || '',
        description: payload.description || '',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/exercises') {
      return handlePostCollection(req, res, 'exercises', (payload) => ({
        name: payload.name || '',
        muscleGroupId: payload.muscleGroupId || '',
        videoUrl: payload.videoUrl || '',
        equipment: payload.equipment || '',
        description: payload.description || '',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/workouts') {
      return handlePostCollection(req, res, 'workouts', (payload) => ({
        studentId: payload.studentId || '',
        coachName: payload.coachName || '',
        title: payload.title || '',
        goal: payload.goal || '',
        notes: payload.notes || '',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/nutrition-plans') {
      return handlePostCollection(req, res, 'nutritionPlans', (payload) => ({
        studentId: payload.studentId || '',
        title: payload.title || '',
        calories: Number(payload.calories || 0),
        notes: payload.notes || '',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/products') {
      return handlePostCollection(req, res, 'products', (payload) => ({
        name: payload.name || '',
        category: payload.category || '',
        stock: Number(payload.stock || 0),
        price: Number(payload.price || 0),
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/sales') {
      return handlePostCollection(req, res, 'sales', (payload) => ({
        productId: payload.productId || '',
        quantity: Number(payload.quantity || 0),
        amount: Number(payload.amount || 0),
        paymentMethod: payload.paymentMethod || '',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/financial-entries') {
      return handlePostCollection(req, res, 'financialEntries', (payload) => ({
        description: payload.description || '',
        type: payload.type || 'income',
        status: payload.status || 'pending',
        amount: Number(payload.amount || 0),
        dueDate: payload.dueDate || '',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/leads') {
      return handlePostCollection(req, res, 'leads', (payload) => ({
        name: payload.name || '',
        phone: payload.phone || '',
        source: payload.source || '',
        interest: payload.interest || '',
        status: payload.status || 'new',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/automation-rules') {
      return handlePostCollection(req, res, 'automationRules', (payload) => ({
        name: payload.name || '',
        trigger: payload.trigger || '',
        channel: payload.channel || '',
        active: normalizeBoolean(payload.active),
        template: payload.template || '',
      }));
    }

    if (req.method === 'POST' && parsed.pathname === '/api/attendance') {
      return handlePostCollection(req, res, 'attendance', (payload) => ({
        studentId: payload.studentId || '',
        source: payload.source || 'manual',
        checkedAt: payload.checkedAt || new Date().toISOString(),
        deviceName: payload.deviceName || '',
        confidence: Number(payload.confidence || 0),
        releasedTurnstile: normalizeBoolean(payload.releasedTurnstile),
      }));
    }

    if (req.method === 'GET' && parsed.pathname === '/api/attendance') {
      const data = loadData();
      const filtered = applyAttendanceFilters(data.attendance, parsed.query, data).map((record) => {
        const student = data.students.find((item) => item.id === record.studentId);
        return {
          ...record,
          studentName: student ? student.name : '',
        };
      });
      return sendJson(res, 200, filtered);
    }

    return serveStaticFile(parsed.pathname || '/', res);
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Unexpected error' });
  }
});

ensureDataFile();
server.listen(PORT, () => {
  console.log(`Sistema Premium de Gestão de Academia disponível em http://localhost:${PORT}`);
});

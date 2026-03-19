const state = {
  system: null,
  activeKey: 'painel',
  alerts: [],
};

const MODULE_META = {
  painel: { title: 'Painel Geral', subtitle: 'Indicadores reais calculados a partir do que você cadastrar no sistema.' },
  usuarios: { title: 'Usuários', subtitle: 'Cadastre funcionários, cargos e status de acesso.' },
  planos: { title: 'Planos', subtitle: 'Cadastre planos e vincule assinaturas reais aos alunos.' },
  frequencia: { title: 'Frequência', subtitle: 'Registre entradas e filtre por aluno, período e tipo de plano.' },
  exercicios: { title: 'Exercícios', subtitle: 'Hub de operação do módulo de exercícios.' },
  'grupo-muscular': { title: 'Grupo Muscular', subtitle: 'Cadastre grupos musculares de forma totalmente configurável.' },
  'lista-exercicios': { title: 'Lista de Exercícios', subtitle: 'Cadastre exercícios com vínculo técnico e operacional.' },
  treinos: { title: 'Treinos', subtitle: 'Crie treinos completos por aluno e objetivo.' },
  nutricao: { title: 'Nutrição', subtitle: 'Cadastre planos alimentares e metas nutricionais.' },
  vendas: { title: 'Vendas', subtitle: 'Cadastre produtos e realize vendas integradas.' },
  financeiro: { title: 'Financeiro', subtitle: 'Cadastre entradas e saídas reais do fluxo de caixa.' },
  relatorios: { title: 'Relatórios', subtitle: 'Veja consolidações reais do que foi configurado e registrado.' },
  configuracoes: { title: 'Configurações', subtitle: 'Configure academia, facial, catraca, pagamentos, WhatsApp e layout.' },
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Falha na requisição');
  }

  return response.json();
}

function notify(message, type = 'success') {
  state.alerts = [{ message, type }];
  renderAlerts();
}

function renderAlerts() {
  const node = document.getElementById('alerts');
  node.innerHTML = '';
  state.alerts.forEach((alert) => {
    const div = document.createElement('div');
    div.className = `alert ${alert.type}`;
    div.textContent = alert.message;
    node.appendChild(div);
  });
}

async function refreshSystem() {
  state.system = await api('/api/system');
  render();
}

function sectionTitle() {
  return MODULE_META[state.activeKey] || MODULE_META.painel;
}

function renderSidebar() {
  const menu = document.getElementById('sidebar-menu');
  menu.innerHTML = '';
  state.system.sidebar.forEach((item) => {
    const button = document.createElement('button');
    button.className = `menu-item ${item.key === state.activeKey ? 'active' : ''}`;
    button.textContent = item.label;
    button.onclick = () => {
      state.activeKey = item.key;
      render();
    };
    menu.appendChild(button);
  });
}

function heroStatuses() {
  const { settings } = state.system;
  return [
    `Facial: ${settings.facial.enabled ? 'ativo' : 'inativo'}`,
    `Catraca: ${settings.turnstile.enabled ? 'ativa' : 'inativa'}`,
    `Pix: ${settings.payments.pixEnabled ? 'ativo' : 'inativo'}`,
    `WhatsApp: ${settings.whatsapp.enabled ? 'ativo' : 'inativo'}`,
  ];
}

function renderHero() {
  const meta = sectionTitle();
  document.getElementById('page-title').textContent = state.system.sidebar.find((item) => item.key === state.activeKey)?.label || 'Painel';
  document.getElementById('module-title').textContent = meta.title;
  document.getElementById('module-subtitle').textContent = meta.subtitle;

  const list = document.getElementById('hero-status-list');
  list.innerHTML = '';
  heroStatuses().forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = entry;
    list.appendChild(li);
  });
}

function card(label, value) {
  return `<article class="stat-card"><span>${label}</span><strong>${value}</strong></article>`;
}

function renderTable(headers, rows) {
  if (!rows.length) return '<p class="empty-state">Nenhum registro encontrado.</p>';
  const head = headers.map((item) => `<th>${item}</th>`).join('');
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${cell ?? ''}</td>`).join('')}</tr>`).join('');
  return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function selectOptions(items, valueKey = 'id', labelKey = 'name') {
  const options = ['<option value="">Selecione</option>'];
  items.forEach((item) => options.push(`<option value="${item[valueKey]}">${item[labelKey]}</option>`));
  return options.join('');
}

function renderPainel() {
  const dashboard = state.system.dashboard;
  const reactivationRows = state.system.students.filter((student) => {
    const records = state.system.attendance.filter((item) => item.studentId === student.id);
    if (!records.length) return true;
    const last = records.map((item) => new Date(item.checkedAt).getTime()).sort((a, b) => b - a)[0];
    const days = (Date.now() - last) / (1000 * 60 * 60 * 24);
    return days >= 30;
  }).map((student) => [student.name, student.phone || student.email || 'Sem contato', 'Reativação']);

  return `
    <section class="grid four">
      ${card('Alunos cadastrados', dashboard.activeStudents)}
      ${card('Leads quentes', dashboard.hotLeads)}
      ${card('Conversão de leads', `${dashboard.conversionRate}%`)}
      ${card('Previsão de receita', `R$ ${Number(dashboard.forecastRevenue || 0).toFixed(2)}`)}
    </section>
    <section class="grid two">
      <section class="panel-card">
        <h3>Captar lead comercial</h3>
        <form data-endpoint="/api/leads" class="resource-form">
          <div class="grid two">
            <label>Nome<input name="name" required /></label>
            <label>Telefone<input name="phone" /></label>
            <label>Origem<input name="source" placeholder="Instagram, indicação, Google..." /></label>
            <label>Interesse<input name="interest" placeholder="musculação, funcional, premium..." /></label>
            <label>Status<select name="status"><option value="new">Novo</option><option value="hot">Quente</option><option value="proposal">Proposta</option><option value="won">Fechado</option><option value="lost">Perdido</option></select></label>
          </div>
          <button class="button primary" type="submit">Salvar lead</button>
        </form>
      </section>
      <section class="panel-card">
        <h3>Leitura real da base</h3>
        <p>Os indicadores são gerados automaticamente a partir dos dados salvos. Isso ajuda o dono a enxergar funil comercial, reativação e previsão de receita sem depender de planilha.</p>
      </section>
    </section>
    <section class="grid two">
      <section class="panel-card">
        <h3>Leads cadastrados</h3>
        ${renderTable(['Nome', 'Telefone', 'Origem', 'Interesse', 'Status'], state.system.leads.map((item) => [item.name, item.phone, item.source, item.interest, item.status]))}
      </section>
      <section class="panel-card">
        <h3>Possíveis reativações</h3>
        ${renderTable(['Aluno', 'Contato', 'Ação'], reactivationRows)}
      </section>
    </section>
  `;
}

function renderUsuarios() {
  return `
    <section class="panel-card">
      <h3>Cadastrar funcionário</h3>
      <form data-endpoint="/api/users" class="resource-form">
        <div class="grid two">
          <label>Nome<input name="name" required /></label>
          <label>E-mail<input name="email" type="email" required /></label>
          <label>Cargo<input name="role" placeholder="dono, admin, recepção, professor..." required /></label>
          <label>Status<select name="status"><option value="active">Ativo</option><option value="blocked">Bloqueado</option></select></label>
        </div>
        <button class="button primary" type="submit">Salvar usuário</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Funcionários cadastrados</h3>
      ${renderTable(['Nome', 'E-mail', 'Cargo', 'Status'], state.system.users.map((item) => [item.name, item.email, item.role, item.status]))}
    </section>
  `;
}

function renderPlanos() {
  return `
    <section class="panel-card">
      <h3>Cadastrar aluno</h3>
      <form data-endpoint="/api/students" class="resource-form">
        <div class="grid two">
          <label>Nome<input name="name" required /></label>
          <label>E-mail<input name="email" type="email" /></label>
          <label>Telefone<input name="phone" /></label>
          <label>Observações<input name="notes" /></label>
        </div>
        <button class="button primary" type="submit">Salvar aluno</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Cadastrar plano</h3>
      <form data-endpoint="/api/plans" class="resource-form">
        <div class="grid two">
          <label>Nome<input name="name" required /></label>
          <label>Valor<input name="price" type="number" min="0" step="0.01" value="0" /></label>
          <label>Recorrência (dias)<input name="recurrenceDays" type="number" min="0" value="0" /></label>
          <label>Descrição<input name="description" /></label>
        </div>
        <button class="button primary" type="submit">Salvar plano</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Assinar plano por aluno</h3>
      <form data-endpoint="/api/memberships" class="resource-form">
        <div class="grid two">
          <label>Aluno<select name="studentId">${selectOptions(state.system.students)}</select></label>
          <label>Plano<select name="planId">${selectOptions(state.system.plans)}</select></label>
          <label>Status<select name="status"><option value="active">Ativo</option><option value="overdue">Inadimplente</option><option value="paused">Pausado</option></select></label>
          <label>Início<input name="startDate" type="date" /></label>
        </div>
        <button class="button primary" type="submit">Salvar assinatura</button>
      </form>
    </section>
    <section class="grid two">
      <section class="panel-card">
        <h3>Alunos</h3>
        ${renderTable(['Nome', 'E-mail', 'Telefone'], state.system.students.map((item) => [item.name, item.email, item.phone]))}
      </section>
      <section class="panel-card">
        <h3>Planos</h3>
        ${renderTable(['Nome', 'Valor', 'Recorrência'], state.system.plans.map((item) => [item.name, `R$ ${Number(item.price || 0).toFixed(2)}`, `${item.recurrenceDays} dias`]))}
      </section>
    </section>
  `;
}

function renderFrequencia() {
  return `
    <section class="panel-card">
      <h3>Registrar entrada</h3>
      <form data-endpoint="/api/attendance" class="resource-form">
        <div class="grid three">
          <label>Aluno<select name="studentId">${selectOptions(state.system.students)}</select></label>
          <label>Origem<select name="source"><option value="manual">Manual</option><option value="facial">Facial</option><option value="turnstile">Catraca</option></select></label>
          <label>Data/hora<input name="checkedAt" type="datetime-local" /></label>
          <label>Dispositivo<input name="deviceName" placeholder="Câmera 1 / Catraca 1" /></label>
          <label>Confiança<input name="confidence" type="number" min="0" step="0.01" value="0" /></label>
          <label class="checkbox-label"><input name="releasedTurnstile" type="checkbox" /> Liberou catraca</label>
        </div>
        <button class="button primary" type="submit">Salvar entrada</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Filtros reais</h3>
      <form id="attendance-filter-form" class="resource-form">
        <div class="grid four">
          <label>Aluno<select name="studentId">${selectOptions(state.system.students)}</select></label>
          <label>Período inicial<input name="dateFrom" type="date" /></label>
          <label>Período final<input name="dateTo" type="date" /></label>
          <label>Tipo de plano<select name="planId">${selectOptions(state.system.plans)}</select></label>
        </div>
        <button class="button primary" type="submit">Aplicar filtros</button>
      </form>
      <div id="attendance-results"></div>
    </section>
  `;
}

function renderExerciciosHub() {
  return `
    <section class="grid four">
      ${card('Grupos musculares', state.system.muscleGroups.length)}
      ${card('Exercícios', state.system.exercises.length)}
      ${card('Treinos', state.system.workouts.length)}
      ${card('Planos nutricionais', state.system.nutritionPlans.length)}
    </section>
    <section class="panel-card"><p>Use os módulos <strong>Grupo Muscular</strong>, <strong>Lista de Exercícios</strong>, <strong>Treinos</strong> e <strong>Nutrição</strong> para configurar toda a operação técnica.</p></section>
  `;
}

function renderGrupoMuscular() {
  return `
    <section class="panel-card">
      <h3>Cadastrar grupo muscular</h3>
      <form data-endpoint="/api/muscle-groups" class="resource-form">
        <div class="grid two">
          <label>Nome<input name="name" required /></label>
          <label>Descrição<input name="description" /></label>
        </div>
        <button class="button primary" type="submit">Salvar grupo</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Grupos musculares</h3>
      ${renderTable(['Nome', 'Descrição'], state.system.muscleGroups.map((item) => [item.name, item.description]))}
    </section>
  `;
}

function renderListaExercicios() {
  return `
    <section class="panel-card">
      <h3>Cadastrar exercício</h3>
      <form data-endpoint="/api/exercises" class="resource-form">
        <div class="grid two">
          <label>Nome<input name="name" required /></label>
          <label>Grupo muscular<select name="muscleGroupId">${selectOptions(state.system.muscleGroups)}</select></label>
          <label>Vídeo<input name="videoUrl" /></label>
          <label>Equipamento<input name="equipment" /></label>
          <label class="full-width">Descrição<textarea name="description"></textarea></label>
        </div>
        <button class="button primary" type="submit">Salvar exercício</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Exercícios cadastrados</h3>
      ${renderTable(['Nome', 'Grupo', 'Equipamento', 'Vídeo'], state.system.exercises.map((item) => [item.name, state.system.muscleGroups.find((group) => group.id === item.muscleGroupId)?.name || '', item.equipment, item.videoUrl]))}
    </section>
  `;
}

function renderTreinos() {
  return `
    <section class="panel-card">
      <h3>Cadastrar treino</h3>
      <form data-endpoint="/api/workouts" class="resource-form">
        <div class="grid two">
          <label>Aluno<select name="studentId">${selectOptions(state.system.students)}</select></label>
          <label>Professor<input name="coachName" /></label>
          <label>Título<input name="title" required /></label>
          <label>Objetivo<input name="goal" placeholder="hipertrofia, emagrecimento..." /></label>
          <label class="full-width">Observações<textarea name="notes"></textarea></label>
        </div>
        <button class="button primary" type="submit">Salvar treino</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Treinos cadastrados</h3>
      ${renderTable(['Aluno', 'Professor', 'Título', 'Objetivo'], state.system.workouts.map((item) => [state.system.students.find((student) => student.id === item.studentId)?.name || '', item.coachName, item.title, item.goal]))}
    </section>
  `;
}

function renderNutricao() {
  return `
    <section class="panel-card">
      <h3>Cadastrar plano alimentar</h3>
      <form data-endpoint="/api/nutrition-plans" class="resource-form">
        <div class="grid two">
          <label>Aluno<select name="studentId">${selectOptions(state.system.students)}</select></label>
          <label>Título<input name="title" required /></label>
          <label>Calorias do dia<input name="calories" type="number" min="0" value="0" /></label>
          <label class="full-width">Observações<textarea name="notes"></textarea></label>
        </div>
        <button class="button primary" type="submit">Salvar plano</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Planos nutricionais</h3>
      ${renderTable(['Aluno', 'Título', 'Calorias'], state.system.nutritionPlans.map((item) => [state.system.students.find((student) => student.id === item.studentId)?.name || '', item.title, item.calories]))}
    </section>
  `;
}

function renderVendas() {
  return `
    <section class="panel-card">
      <h3>Cadastrar produto</h3>
      <form data-endpoint="/api/products" class="resource-form">
        <div class="grid two">
          <label>Nome<input name="name" required /></label>
          <label>Categoria<input name="category" /></label>
          <label>Estoque<input name="stock" type="number" min="0" value="0" /></label>
          <label>Preço<input name="price" type="number" min="0" step="0.01" value="0" /></label>
        </div>
        <button class="button primary" type="submit">Salvar produto</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Registrar venda</h3>
      <form data-endpoint="/api/sales" class="resource-form">
        <div class="grid two">
          <label>Produto<select name="productId">${selectOptions(state.system.products)}</select></label>
          <label>Quantidade<input name="quantity" type="number" min="0" value="0" /></label>
          <label>Valor<input name="amount" type="number" min="0" step="0.01" value="0" /></label>
          <label>Pagamento<input name="paymentMethod" placeholder="Pix, boleto, cartão..." /></label>
        </div>
        <button class="button primary" type="submit">Salvar venda</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Produtos</h3>
      ${renderTable(['Nome', 'Categoria', 'Estoque', 'Preço'], state.system.products.map((item) => [item.name, item.category, item.stock, `R$ ${Number(item.price || 0).toFixed(2)}`]))}
    </section>
  `;
}

function renderFinanceiro() {
  return `
    <section class="panel-card">
      <h3>Cadastrar lançamento financeiro</h3>
      <form data-endpoint="/api/financial-entries" class="resource-form">
        <div class="grid two">
          <label>Descrição<input name="description" required /></label>
          <label>Tipo<select name="type"><option value="income">Entrada</option><option value="expense">Saída</option></select></label>
          <label>Status<select name="status"><option value="pending">Pendente</option><option value="paid">Pago</option><option value="overdue">Vencido</option></select></label>
          <label>Valor<input name="amount" type="number" min="0" step="0.01" value="0" /></label>
          <label>Vencimento<input name="dueDate" type="date" /></label>
        </div>
        <button class="button primary" type="submit">Salvar lançamento</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Lançamentos</h3>
      ${renderTable(['Descrição', 'Tipo', 'Status', 'Valor', 'Vencimento'], state.system.financialEntries.map((item) => [item.description, item.type, item.status, `R$ ${Number(item.amount || 0).toFixed(2)}`, item.dueDate]))}
    </section>
  `;
}

function renderRelatorios() {
  const revenue = state.system.financialEntries.filter((item) => item.type === 'income').reduce((acc, item) => acc + Number(item.amount || 0), 0);
  const expenses = state.system.financialEntries.filter((item) => item.type === 'expense').reduce((acc, item) => acc + Number(item.amount || 0), 0);
  return `
    <section class="grid four">
      ${card('Alunos', state.system.students.length)}
      ${card('Check-ins', state.system.attendance.length)}
      ${card('Entradas lançadas', `R$ ${revenue.toFixed(2)}`)}
      ${card('Saídas lançadas', `R$ ${expenses.toFixed(2)}`)}
    </section>
    <section class="grid two">
      <section class="panel-card">
        <h3>Indicadores de venda</h3>
        ${renderTable(['Indicador', 'Valor'], [
          ['Leads cadastrados', state.system.leads.length],
          ['Leads quentes', state.system.dashboard.hotLeads],
          ['Conversão', `${state.system.dashboard.conversionRate}%`],
          ['Previsão de receita', `R$ ${Number(state.system.dashboard.forecastRevenue || 0).toFixed(2)}`],
          ['Reativações possíveis', state.system.dashboard.reactivationCandidates],
        ])}
      </section>
      <section class="panel-card">
        <h3>Resumo exportável</h3>
        <pre class="json-preview">${JSON.stringify({
          students: state.system.students.length,
          plans: state.system.plans.length,
          memberships: state.system.memberships.length,
          attendance: state.system.attendance.length,
          financialEntries: state.system.financialEntries.length,
          leads: state.system.leads.length,
          automationRules: state.system.automationRules.length,
        }, null, 2)}</pre>
      </section>
    </section>
    <section class="panel-card">
      <h3>Auditoria operacional</h3>
      ${renderTable(['Ação', 'Recurso', 'Criado em'], state.system.auditLogs.map((item) => [item.action, item.resource, item.createdAt]))}
    </section>
  `;
}

function configCheckbox(name, checked) {
  return `<label class="checkbox-label"><input type="checkbox" name="${name}" ${checked ? 'checked' : ''} /> Ativar</label>`;
}

function renderConfiguracoes() {
  const { gym, settings } = state.system;
  return `
    <section class="panel-card">
      <h3>Configurações gerais e integrações</h3>
      <form id="settings-form" class="resource-form">
        <div class="grid two">
          <label>Nome da academia<input name="gym.name" value="${gym.name || ''}" /></label>
          <label>Nome fantasia<input name="gym.tradeName" value="${gym.tradeName || ''}" /></label>
          <label>CNPJ/Documento<input name="gym.document" value="${gym.document || ''}" /></label>
          <label>E-mail<input name="gym.email" value="${gym.email || ''}" /></label>
          <label>Telefone<input name="gym.phone" value="${gym.phone || ''}" /></label>
          <label>Timezone<input name="gym.timezone" value="${gym.timezone || ''}" /></label>
        </div>

        <h4>Reconhecimento facial</h4>
        <div class="grid three">
          ${configCheckbox('settings.facial.enabled', settings.facial.enabled)}
          <label>Provider<input name="settings.facial.provider" value="${settings.facial.provider || ''}" /></label>
          <label>Endpoint<input name="settings.facial.endpoint" value="${settings.facial.endpoint || ''}" /></label>
          <label>API Key<input name="settings.facial.apiKey" value="${settings.facial.apiKey || ''}" /></label>
          <label>Fonte da câmera<input name="settings.facial.cameraSource" value="${settings.facial.cameraSource || ''}" /></label>
          <label>Threshold<input name="settings.facial.threshold" type="number" min="0" step="0.01" value="${settings.facial.threshold || 0}" /></label>
        </div>

        <h4>Catraca</h4>
        <div class="grid three">
          ${configCheckbox('settings.turnstile.enabled', settings.turnstile.enabled)}
          <label>Nome<input name="settings.turnstile.name" value="${settings.turnstile.name || ''}" /></label>
          <label>IP<input name="settings.turnstile.ip" value="${settings.turnstile.ip || ''}" /></label>
          <label>Porta<input name="settings.turnstile.port" type="number" min="0" value="${settings.turnstile.port || 0}" /></label>
          <label>Protocolo<input name="settings.turnstile.protocol" value="${settings.turnstile.protocol || ''}" /></label>
          <label>Timeout (ms)<input name="settings.turnstile.timeoutMs" type="number" min="0" value="${settings.turnstile.timeoutMs || 0}" /></label>
          <label class="full-width">Comando de abertura<textarea name="settings.turnstile.openCommand">${settings.turnstile.openCommand || ''}</textarea></label>
        </div>

        <h4>Pagamentos</h4>
        <div class="grid three">
          ${configCheckbox('settings.payments.pixEnabled', settings.payments.pixEnabled)}
          <label>Provider Pix<input name="settings.payments.pixProvider" value="${settings.payments.pixProvider || ''}" /></label>
          ${configCheckbox('settings.payments.boletoEnabled', settings.payments.boletoEnabled)}
          <label>Provider boleto<input name="settings.payments.boletoProvider" value="${settings.payments.boletoProvider || ''}" /></label>
          ${configCheckbox('settings.payments.cardEnabled', settings.payments.cardEnabled)}
          <label>Provider cartão<input name="settings.payments.cardProvider" value="${settings.payments.cardProvider || ''}" /></label>
          <label class="full-width">Webhook URL<input name="settings.payments.webhookUrl" value="${settings.payments.webhookUrl || ''}" /></label>
        </div>

        <h4>WhatsApp</h4>
        <div class="grid three">
          ${configCheckbox('settings.whatsapp.enabled', settings.whatsapp.enabled)}
          <label>Provider<input name="settings.whatsapp.provider" value="${settings.whatsapp.provider || ''}" /></label>
          <label>Token<input name="settings.whatsapp.token" value="${settings.whatsapp.token || ''}" /></label>
          <label>Phone Number ID<input name="settings.whatsapp.phoneNumberId" value="${settings.whatsapp.phoneNumberId || ''}" /></label>
          <label>Endpoint<input name="settings.whatsapp.endpoint" value="${settings.whatsapp.endpoint || ''}" /></label>
        </div>

        <h4>Layout</h4>
        <div class="grid two">
          <label>Tema<input name="settings.layout.theme" value="${settings.layout.theme || 'dark'}" /></label>
          ${configCheckbox('settings.layout.compactSidebar', settings.layout.compactSidebar)}
        </div>

        <button class="button primary" type="submit">Salvar configurações</button>
      </form>
    </section>
    <section class="panel-card">
      <h3>Automação comercial e retenção</h3>
      <form data-endpoint="/api/automation-rules" class="resource-form">
        <div class="grid two">
          <label>Nome da regra<input name="name" required /></label>
          <label>Trigger<input name="trigger" placeholder="lead_hot, overdue, no_checkin_30d..." /></label>
          <label>Canal<input name="channel" placeholder="WhatsApp, e-mail..." /></label>
          <label>Status<select name="active"><option value="true">Ativa</option><option value="false">Inativa</option></select></label>
          <label class="full-width">Template<textarea name="template" placeholder="Mensagem que será usada na automação"></textarea></label>
        </div>
        <button class="button primary" type="submit">Salvar automação</button>
      </form>
      <div class="spacer"></div>
      ${renderTable(['Nome', 'Trigger', 'Canal', 'Ativa'], state.system.automationRules.map((item) => [item.name, item.trigger, item.channel, item.active ? 'Sim' : 'Não']))}
    </section>
    <section class="panel-card">
      <h3>Ações operacionais de integração</h3>
      <form data-endpoint="/api/integrations/facial/identify" class="resource-form">
        <div class="grid two">
          <label>Aluno (facial)<select name="studentId">${selectOptions(state.system.students)}</select></label>
          <label>Confiança<input name="confidence" type="number" min="0" step="0.01" value="0" /></label>
        </div>
        <button class="button primary" type="submit">Executar identificação facial</button>
      </form>
      <div class="spacer"></div>
      <form data-endpoint="/api/integrations/turnstile/open" class="resource-form">
        <div class="grid two">
          <label>Aluno (catraca)<select name="studentId">${selectOptions(state.system.students)}</select></label>
          <label>Motivo<input name="reason" placeholder="liberação de acesso" /></label>
        </div>
        <button class="button primary" type="submit">Executar abertura de catraca</button>
      </form>
      <div class="spacer"></div>
      <form data-endpoint="/api/integrations/whatsapp/test" class="resource-form">
        <div class="grid two">
          <label>Destino<input name="to" placeholder="5511999999999" /></label>
          <label>Mensagem<input name="message" placeholder="Mensagem de teste" /></label>
        </div>
        <button class="button primary" type="submit">Executar WhatsApp teste</button>
      </form>
    </section>
  `;
}

function renderModuleBody() {
  const body = document.getElementById('module-body');
  const views = {
    painel: renderPainel,
    usuarios: renderUsuarios,
    planos: renderPlanos,
    frequencia: renderFrequencia,
    exercicios: renderExerciciosHub,
    'grupo-muscular': renderGrupoMuscular,
    'lista-exercicios': renderListaExercicios,
    treinos: renderTreinos,
    nutricao: renderNutricao,
    vendas: renderVendas,
    financeiro: renderFinanceiro,
    relatorios: renderRelatorios,
    configuracoes: renderConfiguracoes,
  };
  body.innerHTML = views[state.activeKey]();
  bindForms();
  if (state.activeKey === 'frequencia') bindAttendanceFilter();
  if (state.activeKey === 'configuracoes') bindSettingsForm();
}

function formToObject(form) {
  const data = new FormData(form);
  const entries = Object.fromEntries(data.entries());
  form.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    entries[checkbox.name] = checkbox.checked;
  });
  return entries;
}

async function postForm(endpoint, payload) {
  await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
  await refreshSystem();
  notify('Dados salvos com sucesso.');
}

function bindForms() {
  document.querySelectorAll('.resource-form[data-endpoint]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        await postForm(form.dataset.endpoint, formToObject(form));
      } catch (error) {
        notify(error.message, 'error');
      }
    });
  });
}

function bindSettingsForm() {
  const form = document.getElementById('settings-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const flat = formToObject(form);
    const payload = {
      gym: {},
      settings: { facial: {}, turnstile: {}, payments: {}, whatsapp: {}, layout: {} },
    };

    Object.entries(flat).forEach(([key, value]) => {
      const parts = key.split('.');
      if (parts[0] === 'gym') payload.gym[parts[1]] = value;
      if (parts[0] === 'settings') payload.settings[parts[1]][parts[2]] = value;
    });

    ['threshold'].forEach((key) => {
      payload.settings.facial[key] = Number(payload.settings.facial[key] || 0);
    });
    ['port', 'timeoutMs'].forEach((key) => {
      payload.settings.turnstile[key] = Number(payload.settings.turnstile[key] || 0);
    });

    try {
      await api('/api/settings', { method: 'POST', body: JSON.stringify(payload) });
      await refreshSystem();
      notify('Configurações salvas com sucesso.');
    } catch (error) {
      notify(error.message, 'error');
    }
  });
}

async function bindAttendanceFilter() {
  const form = document.getElementById('attendance-filter-form');
  const target = document.getElementById('attendance-results');

  async function run() {
    const params = new URLSearchParams(formToObject(form));
    const records = await api(`/api/attendance?${params.toString()}`);
    target.innerHTML = renderTable(
      ['Aluno', 'Origem', 'Data/hora', 'Dispositivo', 'Confiança', 'Catraca'],
      records.map((item) => [item.studentName, item.source, item.checkedAt, item.deviceName, item.confidence, item.releasedTurnstile ? 'Sim' : 'Não'])
    );
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await run();
      notify('Filtros aplicados com sucesso.');
    } catch (error) {
      notify(error.message, 'error');
    }
  });

  await run();
}

function render() {
  renderSidebar();
  renderHero();
  renderAlerts();
  renderModuleBody();
}

document.getElementById('reload-button').addEventListener('click', async () => {
  try {
    await refreshSystem();
    notify('Sistema recarregado.');
  } catch (error) {
    notify(error.message, 'error');
  }
});

document.getElementById('reset-button').addEventListener('click', async () => {
  if (!confirm('Tem certeza que deseja zerar todos os dados locais?')) return;
  try {
    await api('/api/reset', { method: 'POST', body: '{}' });
    await refreshSystem();
    notify('Sistema zerado com sucesso.');
  } catch (error) {
    notify(error.message, 'error');
  }
});

refreshSystem().catch((error) => {
  document.body.innerHTML = `<main style="padding:40px;font-family:Arial,sans-serif"><h1>Erro</h1><p>${error.message}</p></main>`;
});

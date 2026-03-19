const state = {
  system: null,
  activeKey: 'painel',
};

async function fetchSystem() {
  const response = await fetch('/api/system');
  if (!response.ok) throw new Error('Falha ao carregar a demo.');
  return response.json();
}

function createMenuItem(item) {
  const button = document.createElement('button');
  button.className = `menu-item ${state.activeKey === item.key ? 'active' : ''}`;
  button.textContent = item.label;
  button.onclick = () => {
    state.activeKey = item.key;
    render();
  };
  return button;
}

function renderSidebar() {
  const sidebarMenu = document.getElementById('sidebar-menu');
  sidebarMenu.innerHTML = '';
  state.system.sidebar.forEach((item) => sidebarMenu.appendChild(createMenuItem(item)));
}

function renderHighlights(moduleData) {
  const grid = document.getElementById('highlights-grid');
  grid.innerHTML = '';

  moduleData.highlights.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'stat-card';
    article.innerHTML = `<span>${item.label}</span><strong>${item.value}</strong>`;
    grid.appendChild(article);
  });
}

function renderLists(moduleData) {
  const listGrid = document.getElementById('module-lists');
  listGrid.innerHTML = '';

  Object.entries(moduleData.lists || {}).forEach(([title, items]) => {
    const card = document.createElement('section');
    card.className = 'panel-card';

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    card.appendChild(titleElement);

    const list = document.createElement('ul');
    items.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      list.appendChild(li);
    });

    card.appendChild(list);
    listGrid.appendChild(card);
  });
}

function renderHeader(moduleData) {
  const sidebarItem = state.system.sidebar.find((item) => item.key === state.activeKey);
  document.getElementById('page-title').textContent = sidebarItem.label;
  document.getElementById('module-title').textContent = moduleData.title;
  document.getElementById('module-subtitle').textContent = moduleData.subtitle;

  const integrationList = document.getElementById('integration-list');
  integrationList.innerHTML = '';
  state.system.integrations.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    integrationList.appendChild(li);
  });
}

function render() {
  if (!state.system) return;
  const moduleData = state.system.modules[state.activeKey];
  renderSidebar();
  renderHeader(moduleData);
  renderHighlights(moduleData);
  renderLists(moduleData);
}

async function init() {
  try {
    state.system = await fetchSystem();
    render();
  } catch (error) {
    document.body.innerHTML = `<main style="padding:40px;font-family:Arial,sans-serif"><h1>Erro ao carregar</h1><p>${error.message}</p></main>`;
  }
}

document.getElementById('refresh-button').addEventListener('click', init);

init();

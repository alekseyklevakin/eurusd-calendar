const STORAGE_KEY = 'eurusd_calendar';

const defaultNews = [
  { id: 1, date: '2026-10-05', time: '16:00', name: 'ISM Services PMI', forecast: '55.1', previous: '55.4', importance: 'high', direction: 'inverse' },
  { id: 2, date: '2026-10-09', time: '15:30', name: 'Non-Farm Payrolls', forecast: '150K', previous: '142K', importance: 'high', direction: 'inverse' },
  { id: 3, date: '2026-10-15', time: '15:30', name: 'CPI (м/м)', forecast: '0.3%', previous: '0.2%', importance: 'high', direction: 'inverse' }
];

let news = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultNews;
let currentFilter = 'all';

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(news)); }

function importanceLabel(imp) {
  return { high: '🔴 Высокая', medium: '🟡 Средняя', low: '🟢 Низкая' }[imp];
}

function buildScenario(item) {
  const aboveIsSell = item.direction === 'inverse';
  const aboveAction = aboveIsSell ? 'SELL' : 'BUY';
  const belowAction = aboveIsSell ? 'BUY' : 'SELL';
  const aboveClass = aboveIsSell ? 'sell' : 'buy';
  const belowClass = aboveIsSell ? 'buy' : 'sell';
  return `
    <div class="scenario">
      <div>📈 Если факт <strong>выше</strong> прогноза (${item.forecast}) → <span class="${aboveClass}">${aboveAction}</span> EUR/USD</div>
      <div>📉 Если факт <strong>ниже</strong> прогноза (${item.forecast}) → <span class="${belowClass}">${belowAction}</span> EUR/USD</div>
      <div>➖ Если факт <strong>по прогнозу</strong> → возможна волатильность без чёткого направления</div>
    </div>`;
}

function render() {
  const list = document.getElementById('newsList');
  const filtered = currentFilter === 'all' ? news : news.filter(n => n.importance === currentFilter);
  if (filtered.length === 0) { list.innerHTML = '<div class="empty">Нет новостей. Добавьте первую!</div>'; return; }
  filtered.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  list.innerHTML = filtered.map(item => `
    <div class="card ${item.importance}">
      <div class="card-header">
        <div>
          <div class="card-title">${item.name}</div>
          <div class="card-date">📅 ${item.date} в ${item.time}</div>
        </div>
        <button class="delete-btn" data-id="${item.id}">✕</button>
      </div>
      <div class="values">
        <span>Прогноз: <strong>${item.forecast}</strong></span>
        <span>Предыдущее: <strong>${item.previous}</strong></span>
        <span>Важность: ${importanceLabel(item.importance)}</span>
      </div>
      ${buildScenario(item)}
    </div>`).join('');
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      news = news.filter(n => n.id !== Number(btn.dataset.id));
      save(); render();
    });
  });
}

document.getElementById('addBtn').addEventListener('click', () => {
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const name = document.getElementById('name').value.trim();
  const forecast = document.getElementById('forecast').value.trim();
  const previous = document.getElementById('previous').value.trim();
  const importance = document.getElementById('importance').value;
  const direction = document.getElementById('direction').value;
  if (!date || !time || !name || !forecast || !previous) { alert('Заполните все поля'); return; }
  news.push({ id: Date.now(), date, time, name, forecast, previous, importance, direction });
  save(); render();
  ['date','time','name','forecast','previous'].forEach(id => { document.getElementById(id).value = ''; });
});

document.querySelectorAll('.filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

render();
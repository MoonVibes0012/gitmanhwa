let SERIES = [];

// Load data
fetch('../data/series.json')
  .then(r => r.json())
  .then(data => {
    SERIES = data;
    renderSeriesGrid('manhwa');
    renderUpdates();
  })
  .catch(err => console.error('Gagal load series:', err));

function renderSeriesGrid(filter = 'manhwa') {
  const grid = document.getElementById('series-grid');
  if (!grid) return;
  const filtered = SERIES.filter(s => s.type === filter);
  grid.innerHTML = filtered.map(s => {
    const cover = s.cover || '';
    return `<a href="series.html?id=${s.id}" class="series-card">
      <div class="series-cover">
        <img src="${cover}" alt="${s.title}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="cover-fallback" style="display:none;width:100%;height:100%;background:linear-gradient(135deg,#2a2a3e,#1a1a2e);align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#666">${s.title.charAt(0)}</div>
        <span class="flag">${s.flag}</span>
      </div>
      <div class="series-meta">
        <div class="series-title">${s.title}</div>
        <div class="series-info"><span>⏱ ${s.chapters[0] ? 'baru' : '-'}</span></div>
      </div>
    </a>`;
  }).join('');
}

function renderUpdates() {
  const list = document.getElementById('update-list');
  if (!list) return;
  list.innerHTML = SERIES.filter(s => s.chapters.length).map(s => {
    const chaptersHtml = s.chapters.slice(0, 3).map(c =>
      `<a href="reader.html?series=${s.id}&chapter=${c.folder}" class="chapter-row">
        <span class="chapter-name">Chapter ${c.num}</span>
        <span class="chapter-time">baru</span>
      </a>`
    ).join('');
    return `<div class="update-item">
      <div class="update-cover">
        <img src="${s.cover}" style="width:100%;height:100%;object-fit:cover;border-radius:6px" onerror="this.style.display='none'">
      </div>
      <div class="update-info">
        <div class="update-title"><span class="up">UP</span> ${s.title}</div>
        <div class="chapter-list">${chaptersHtml}</div>
      </div>
    </div>`;
  }).join('');
}

// Tabs
document.querySelectorAll('.tab[data-tab]').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tab[data-tab]').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    renderSeriesGrid(this.dataset.tab);
  });
});

// Search
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const searchResult = document.getElementById('searchResult');
const closeSearch = document.getElementById('closeSearch');

searchBtn.addEventListener('click', function() {
  searchModal.classList.add('show');
  searchInput.focus();
  searchResult.innerHTML = '';
  searchInput.value = '';
});

closeSearch.addEventListener('click', function() {
  searchModal.classList.remove('show');
});

searchModal.addEventListener('click', function(e) {
  if (e.target === this) searchModal.classList.remove('show');
});

searchInput.addEventListener('input', function() {
  const q = this.value.toLowerCase().trim();
  if (!q) { searchResult.innerHTML = ''; return; }
  const filtered = SERIES.filter(s => s.title.toLowerCase().includes(q));
  searchResult.innerHTML = filtered.map(s =>
    `<a href="series.html?id=${s.id}" class="search-item">${s.title} (${s.type})</a>`
  ).join('');
});

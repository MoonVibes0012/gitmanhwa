console.log('🚀 app.js loaded');

let SERIES = [];

fetch('data/series.json')
  .then(response => {
    console.log('📡 Fetch response status:', response.status);
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ Data loaded:', data);
    SERIES = data;
    renderSeriesGrid('manhwa');
    renderUpdates();
    // Tampilkan pesan sukses di grid
    document.querySelector('.series-grid .empty')?.remove();
    document.querySelector('.update-list .empty')?.remove();
  })
  .catch(err => {
    console.error('❌ Gagal load series:', err);
    document.getElementById('series-grid').innerHTML = `<div class="empty">❌ Gagal load data: ${err.message}</div>`;
    document.getElementById('update-list').innerHTML = `<div class="empty">❌ Gagal load data: ${err.message}</div>`;
  });

function renderSeriesGrid(filter = 'manhwa') {
  const grid = document.getElementById('series-grid');
  if (!grid) return;
  
  const filtered = SERIES.filter(s => s.type === filter);
  console.log('📊 Render grid:', filter, filtered.length, 'items');
  
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty">Tidak ada series untuk kategori ${filter}</div>`;
    return;
  }

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
  
  const hasData = SERIES.filter(s => s.chapters.length);
  console.log('📰 Render updates:', hasData.length, 'series');
  
  if (hasData.length === 0) {
    list.innerHTML = `<div class="empty">Belum ada update</div>`;
    return;
  }

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

// ===== SEARCH =====
console.log('🔍 Search init');
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const searchResult = document.getElementById('searchResult');
const closeSearch = document.getElementById('closeSearch');

if (searchBtn) {
  searchBtn.addEventListener('click', function() {
    console.log('🔍 Search button clicked');
    searchModal.classList.add('show');
    searchInput.focus();
    searchResult.innerHTML = '';
    searchInput.value = '';
  });
}

if (closeSearch) {
  closeSearch.addEventListener('click', function() {
    searchModal.classList.remove('show');
  });
}

if (searchModal) {
  searchModal.addEventListener('click', function(e) {
    if (e.target === this) searchModal.classList.remove('show');
  });
}

if (searchInput) {
  searchInput.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    if (!q) { 
      searchResult.innerHTML = ''; 
      return; 
    }
    const filtered = SERIES.filter(s => s.title.toLowerCase().includes(q));
    console.log('🔍 Search results:', filtered.length);
    if (filtered.length === 0) {
      searchResult.innerHTML = `<div class="search-item" style="color:#666">Tidak ditemukan</div>`;
      return;
    }
    searchResult.innerHTML = filtered.map(s =>
      `<a href="series.html?id=${s.id}" class="search-item">${s.title} (${s.type})</a>`
    ).join('');
  });
                               }

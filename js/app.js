console.log('🦈 GITMANHWA loaded');

let SERIES = [];
let currentSlide = 0;
let slideInterval;

// ===== LOAD DATA =====
fetch('data/series.json')
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(data => {
    SERIES = data;
    console.log('✅ Data loaded:', SERIES.length, 'series');
    renderAll();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    document.getElementById('seriesGrid').innerHTML = `<div class="empty">❌ Gagal load data: ${err.message}</div>`;
    document.getElementById('updateList').innerHTML = `<div class="empty">❌ Gagal load data: ${err.message}</div>`;
  });

// ===== RENDER ALL =====
function renderAll() {
  renderSlider();
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab') || 'all';
  const genre = document.querySelector('.genre-btn.active')?.dataset.genre || 'all';
  renderSeriesGrid(tab, genre);
  renderUpdates();
  updateSeriesCount();
}

// ===== SLIDER =====
function renderSlider() {
  const container = document.getElementById('sliderContainer');
  const dotsContainer = document.getElementById('sliderDots');
  if (!container) return;

  const slides = SERIES.slice(0, 5);
  if (slides.length === 0) {
    container.innerHTML = `<div class="empty">Tidak ada data</div>`;
    return;
  }

  container.innerHTML = slides.map((s, i) => {
    const coverHtml = s.cover 
      ? `<img src="${s.cover}" class="slide-cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fallbackHtml = `<div class="slide-cover-fallback" style="display:${s.cover ? 'none' : 'flex'}">${s.title.charAt(0)}</div>`;
    
    return `
      <div class="slide ${i === 0 ? 'active' : ''}" data-index="${i}">
        ${coverHtml}
        ${fallbackHtml}
        <div class="slide-info">
          <h2>${s.title}</h2>
          <div class="slide-meta">${s.flag || ''} ${s.type || 'Manhwa'} · ${s.status || 'Ongoing'}</div>
          <div class="slide-desc">${s.synopsis || 'Sinopsis tidak tersedia'}</div>
          <a href="series.html?id=${s.id}" class="slide-btn">Baca Sekarang</a>
        </div>
      </div>
    `;
  }).join('');

  dotsContainer.innerHTML = slides.map((_, i) => `
    <span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>
  `).join('');

  dotsContainer.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', function() {
      goToSlide(parseInt(this.dataset.index));
    });
  });

  clearInterval(slideInterval);
  slideInterval = setInterval(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, 5000);
}

function goToSlide(index) {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (!slides.length) return;

  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));

  slides[index].classList.add('active');
  dots[index].classList.add('active');
  currentSlide = index;
}

// ===== SERIES GRID =====
function renderSeriesGrid(tab = 'all', genre = 'all') {
  const grid = document.getElementById('seriesGrid');
  if (!grid) return;

  let filtered = [...SERIES];

  if (tab === 'populer') {
    filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (tab === 'selesai') {
    filtered = filtered.filter(s => s.status === 'Completed' || s.status === 'Selesai');
  }

  if (genre !== 'all') {
    filtered = filtered.filter(s => s.genre && s.genre.some(g => 
      g.toLowerCase() === genre.toLowerCase()
    ));
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty">Tidak ada series untuk filter ini</div>`;
    return;
  }

  grid.innerHTML = filtered.map(s => `
    <a href="series.html?id=${s.id}" class="series-card">
      <div class="series-cover">
        <img src="${s.cover || ''}" alt="${s.title}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="cover-fallback" style="display:none">${s.title.charAt(0)}</div>
        <span class="flag">${s.flag || ''}</span>
      </div>
      <div class="series-meta">
        <div class="series-title">${s.title}</div>
        <div class="series-info">
          <span class="rating">⭐ ${s.rating || '?'}</span>
          <span class="chapter-info">Ch.${s.chapters[0]?.num || 0}</span>
        </div>
      </div>
    </a>
  `).join('');

  updateSeriesCount();
}

function updateSeriesCount() {
  const el = document.getElementById('seriesCount');
  if (!el) return;
  const visible = document.querySelectorAll('.series-card').length;
  el.textContent = visible + ' series';
}

// ===== UPDATES =====
function renderUpdates() {
  const list = document.getElementById('updateList');
  if (!list) return;

  const hasData = SERIES.filter(s => s.chapters.length);
  if (hasData.length === 0) {
    list.innerHTML = `<div class="empty">Belum ada update</div>`;
    return;
  }

  const sorted = [...SERIES].sort((a, b) => {
    const aLatest = a.chapters[0]?.num || 0;
    const bLatest = b.chapters[0]?.num || 0;
    return bLatest - aLatest;
  });

  list.innerHTML = sorted.map(s => {
    const latest = [...s.chapters].sort((a, b) => b.num - a.num).slice(0, 3);
    const chaptersHtml = latest.map(c => `
      <a href="reader.html?series=${s.id}&chapter=${c.folder}" class="chapter-row">
        <span class="chapter-name">Chapter ${c.num}</span>
        <span class="chapter-time">baru</span>
      </a>
    `).join('');

    const genreTags = s.genre ? s.genre.slice(0, 2).map(g => `<span class="genre-tag">${g}</span>`).join('') : '';

    return `
      <div class="update-item">
        <div class="update-cover">
          <img src="${s.cover || ''}" onerror="this.style.display='none'">
        </div>
        <div class="update-info">
          <div class="update-title">
            <span class="up">UP</span>
            ${s.title}
            ${genreTags}
          </div>
          <div class="chapter-list">${chaptersHtml}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ===== GENRE FILTER =====
document.querySelectorAll('.genre-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const genre = this.dataset.genre;
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'all';
    renderSeriesGrid(tab, genre);
  });
});

// ===== NAV MENU ACTIVE =====
document.querySelectorAll('.nav-menu a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === 'index.html' || href === '/') {
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
      a.classList.add('active');
    }
  } else if (window.location.href.includes(href)) {
    a.classList.add('active');
  }
});

// ===== SEARCH =====
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const searchResult = document.getElementById('searchResult');
const closeSearch = document.getElementById('closeSearch');

searchBtn?.addEventListener('click', () => {
  searchModal.classList.add('show');
  searchInput.focus();
  searchResult.innerHTML = '';
  searchInput.value = '';
});

closeSearch?.addEventListener('click', () => searchModal.classList.remove('show'));
searchModal?.addEventListener('click', (e) => {
  if (e.target === searchModal) searchModal.classList.remove('show');
});

searchInput?.addEventListener('input', function() {
  const q = this.value.toLowerCase().trim();
  if (!q) { searchResult.innerHTML = ''; return; }
  const filtered = SERIES.filter(s => s.title.toLowerCase().includes(q));
  if (filtered.length === 0) {
    searchResult.innerHTML = `<div class="search-item" style="color:#666">Tidak ditemukan</div>`;
    return;
  }
  searchResult.innerHTML = filtered.map(s =>
    `<a href="series.html?id=${s.id}" class="search-item">${s.title} ⭐${s.rating || '?'} · ${s.type || 'Manhwa'}</a>`
  ).join('');
});

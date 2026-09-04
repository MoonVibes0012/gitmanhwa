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
  });

// ===== RENDER ALL =====
function renderAll() {
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab') || 'home';

  const defaultContent = document.getElementById('defaultContent');
  const exploreContent = document.getElementById('exploreContent');

  if (tab === 'explore') {
    // Tampilkan Explore, sembunyikan Home
    defaultContent.style.display = 'none';
    exploreContent.style.display = 'block';
    renderExplorePage();
  } else {
    // Tampilkan Home, sembunyikan Explore
    defaultContent.style.display = 'block';
    exploreContent.style.display = 'none';
    renderHomePage(tab);
  }

  updateNavActive();
}

function renderHomePage(tab) {
  const genre = document.querySelector('.genre-btn.active')?.dataset.genre || 'all';
  renderSlider();
  renderAnnouncement();
  renderSeriesGrid(tab, genre, document.getElementById('seriesGrid'));
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
      ? `<img src="${s.cover}" class="slide-cover" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
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

// ===== ANNOUNCEMENT =====
function renderAnnouncement() {
  const card = document.querySelector('.announcement-card');
  if (card) {
    card.addEventListener('click', () => {
      alert('Premium Sekarang Cuma 12500!!!');
    });
  }
}

// ===== SERIES GRID =====
function renderSeriesGrid(tab = 'home', genre = 'all', targetGrid) {
  const grid = targetGrid || document.getElementById('seriesGrid');
  if (!grid) return;

  let filtered = [...SERIES];

  if (tab === 'populer' || tab === 'explore') {
    filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (tab === 'selesai' || tab === 'library') {
    filtered = filtered.filter(s => s.status === 'Completed' || s.status === 'Selesai');
  } else if (tab === 'all') {
    // semua series
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
        <img src="${s.cover || ''}" alt="${s.title}" loading="lazy" decoding="async" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
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

    const coverImg = s.cover 
      ? `<img src="${s.cover}" loading="lazy" decoding="async" onerror="this.style.display='none'">` 
      : `<div class="cover-placeholder" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#2a2a3e,#1a1a2e);color:#555;font-size:20px;font-weight:bold;">${s.title.charAt(0)}</div>`;

    return `
      <div class="update-item" data-href="series.html?id=${s.id}">
        <div class="update-cover">
          ${coverImg}
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

  list.querySelectorAll('.update-item').forEach(item => {
    item.addEventListener('click', function(e) {
      if (e.target.closest('.chapter-row')) return;
      const href = this.dataset.href;
      if (href) window.location.href = href;
    });
  });
}

// ===== RENDER EXPLORE PAGE =====
function renderExplorePage() {
  const heroBanner = document.getElementById('heroBanner');
  const horizontalScroll = document.getElementById('horizontalScroll');
  const exploreGrid = document.getElementById('exploreGrid');
  const tabBanner = document.getElementById('tabBanner');

  if (!heroBanner || !horizontalScroll || !exploreGrid) return;

  // Urutkan berdasarkan rating untuk Hero
  const sorted = [...SERIES].sort((a,b) => (b.rating || 0) - (a.rating || 0));
  const hero = sorted[0];

  // 1. Hero Banner
  if (hero) {
    heroBanner.innerHTML = `
      <a href="series.html?id=${hero.id}" style="text-decoration:none;color:inherit;">
        <img src="${hero.cover || ''}" onerror="this.style.display='none'">
        <div class="hero-banner-content">
          <h2>${hero.title}</h2>
          <p>${hero.synopsis || ''}</p>
          <div class="tags">
            ${(hero.genre || []).slice(0,2).map(g => `<span class="tag">${g}</span>`).join('')}
          </div>
        </div>
      </a>
    `;
  }

  // 2. Horizontal Scroll
  const badges = ['3d', '4d', '4mo', '2d', '5mo', '3d', '3mo', '6d', '1yr', '2d'];
  horizontalScroll.innerHTML = sorted.slice(0, 10).map((s, i) => `
    <a href="series.html?id=${s.id}" class="horizontal-card">
      <img src="${s.cover || ''}" loading="lazy" onerror="this.style.display='none'">
      <span class="time-badge">🕓 ${badges[i] || '3d'}</span>
      <span class="flag-badge">${s.flag || '🇰🇷'}</span>
    </a>
  `).join('');

  // 3. Grid Utama Explore
  renderSeriesGrid('all', 'all', exploreGrid);

  // 4. Lanjut Baca
  const continueEmpty = document.getElementById('continueEmpty');
  let hasHistory = false;
  SERIES.forEach(s => {
    if (localStorage.getItem('gitmanhwa_progress_' + s.id)) hasHistory = true;
  });

  if (hasHistory) {
    continueEmpty.innerHTML = "Ada riwayat baca!";
  } else {
    continueEmpty.innerHTML = "Belum ada Data<br><br>Kamu belum punya riwayat baca";
  }

  // 5. Tab Rekomendasi / Pilihan Admin
  const tabs = document.querySelectorAll('.explore-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const type = this.dataset.tab;
      const pilihan = type === 'rekomendasi' ? sorted[0] : (sorted[1] || sorted[0]);
      tabBanner.innerHTML = `
        <a href="series.html?id=${pilihan.id}" style="text-decoration:none;color:inherit;">
          <img src="${pilihan.cover || ''}" onerror="this.style.display='none'">
          <div class="hero-banner-content">
            <h2>${pilihan.title}</h2>
            <p>${pilihan.synopsis || ''}</p>
            <div class="tags">
              <span class="tag new">New</span>
              <span class="tag popular">Popular</span>
            </div>
          </div>
        </a>
      `;
    });
  });

  // Trigger klik pertama
  tabs[0].click();
}

// ===== NAV ACTIVE =====
function updateNavActive() {
  const params = new URLSearchParams(location.search);
  const tab = params.get('tab') || 'home';
  
  document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
    item.classList.remove('active');
    const page = item.dataset.page;
    if (page === 'home' && tab === 'home') item.classList.add('active');
    else if (page === 'explore' && tab === 'explore') item.classList.add('active');
    else if (page === 'library' && tab === 'library') item.classList.add('active');
    else if (page === 'all' && tab === 'all') item.classList.add('active');
  });
}

// ===== GENRE FILTER =====
document.querySelectorAll('.genre-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const genre = this.dataset.genre;
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'home';
    renderSeriesGrid(tab, genre, document.getElementById('seriesGrid'));
  });
});

// ===== SEARCH =====
const searchBtn = document.getElementById('searchBtn');
const searchModal = document.getElementById('searchModal');
const searchInput = document.getElementById('searchInput');
const searchResult = document.getElementById('searchResult');
const closeSearch = document.getElementById('closeSearch');

if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    searchModal.classList.add('show');
    searchInput.focus();
    searchResult.innerHTML = '';
    searchInput.value = '';
  });
}

if (closeSearch) closeSearch.addEventListener('click', () => searchModal.classList.remove('show'));

if (searchModal) {
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) searchModal.classList.remove('show');
  });
}

if (searchInput) {
  searchInput.addEventListener('input', function() {
    const q = this.value.toLowerCase().trim();
    if (!q) { searchResult.innerHTML = ''; return; }
    const filtered = SERIES.filter(s => s.title.toLowerCase().includes(q));
    if (filtered.length === 0) { searchResult.innerHTML = `<div class="search-item" style="color:#666">Tidak ditemukan</div>`; return; }
    searchResult.innerHTML = filtered.map(s =>
      `<a href="series.html?id=${s.id}" class="search-item">${s.title} ⭐${s.rating || '?'} · ${s.type || 'Manhwa'}</a>`
    ).join('');
  });
}

// ===== BLOCKIR COPY =====
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('cut', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

// ===== INIT =====
setTimeout(updateNavActive, 100);

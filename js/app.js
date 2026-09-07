console.log('🦈 GITMANHWA loaded');

let SERIES = [];
let currentSlide = 0;
let slideInterval;

// Skeleton loading
function showSkeleton() {
  const grid = document.getElementById('seriesGrid');
  const updateList = document.getElementById('updateList');

  if (grid) {
    grid.innerHTML = Array(6).fill(`
      <div class="skeleton-card">
        <div class="skeleton"></div>
        <div class="skeleton-title skeleton"></div>
      </div>
    `).join('');
  }

  if (updateList) {
    updateList.innerHTML = Array(3).fill(`
      <div class="skeleton-item">
        <div class="skeleton-cover skeleton"></div>
        <div class="skeleton-info">
          <div class="skeleton-line w-75 skeleton"></div>
          <div class="skeleton-line w-50 skeleton"></div>
        </div>
      </div>
    `).join('');
  }
}

showSkeleton();

// Load data
fetch('data/series.json')
  .then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(function(data) {
    SERIES = data;
    console.log('✅ Data loaded:', SERIES.length, 'series');
    renderAll();
  })
  .catch(function(err) {
    console.error('❌ Error load data:', err);
    var grid = document.getElementById('seriesGrid');
    if (grid) {
      grid.innerHTML = '<div class="empty">❌ Gagal load data: ' + err.message + '</div>';
    }
  });

// Render semua
function renderAll() {
  var params = new URLSearchParams(location.search);
  var tab = params.get('tab') || 'home';

  var defaultContent = document.getElementById('defaultContent');
  var exploreContent = document.getElementById('exploreContent');

  if (tab === 'explore') {
    if (defaultContent) defaultContent.style.display = 'none';
    if (exploreContent) exploreContent.style.display = 'block';
    renderExplorePage();
  } else {
    if (defaultContent) defaultContent.style.display = 'block';
    if (exploreContent) exploreContent.style.display = 'none';
    renderHomePage(tab);
  }

  updateNavActive();
}

function renderHomePage(tab) {
  var activeGenre = document.querySelector('.genre-btn.active');
  var genre = activeGenre ? activeGenre.dataset.genre : 'all';

  renderSlider();
  renderAnnouncement();
  renderSeriesGrid(tab, genre, document.getElementById('seriesGrid'));
  renderContinueReading();
  renderUpdates();
  updateSeriesCount();
}

// Slider
function renderSlider() {
  var container = document.getElementById('sliderContainer');
  var dotsContainer = document.getElementById('sliderDots');
  if (!container) return;

  var slides = SERIES.slice(0, 5);
  if (slides.length === 0) {
    container.innerHTML = '<div class="empty">Tidak ada data</div>';
    return;
  }

  var html = '';
  slides.forEach(function(s, i) {
    var coverHtml = s.cover
      ? '<img src="' + s.cover + '" class="slide-cover" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
      : '';
    var fallback = '<div class="slide-cover-fallback" style="display:' + (s.cover ? 'none' : 'flex') + '">' + s.title.charAt(0) + '</div>';

    html += '<div class="slide ' + (i === 0 ? 'active' : '') + '" data-index="' + i + '">';
    html += coverHtml + fallback;
    html += '<div class="slide-info">';
    html += '<h2>' + s.title + '</h2>';
    html += '<div class="slide-meta">' + (s.flag || '') + ' ' + (s.type || 'Manhwa') + ' · ' + (s.status || 'Ongoing') + '</div>';
    html += '<div class="slide-desc">' + (s.synopsis || 'Sinopsis tidak tersedia') + '</div>';
    html += '<a href="series.html?id=' + s.id + '" class="slide-btn">Baca Sekarang</a>';
    html += '</div></div>';
  });
  container.innerHTML = html;

  if (dotsContainer) {
    var dotsHtml = '';
    slides.forEach(function(_, i) {
      dotsHtml += '<span class="dot ' + (i === 0 ? 'active' : '') + '" data-index="' + i + '"></span>';
    });
    dotsContainer.innerHTML = dotsHtml;

    dotsContainer.querySelectorAll('.dot').forEach(function(dot) {
      dot.addEventListener('click', function() {
        goToSlide(parseInt(this.dataset.index));
      });
    });
  }

  clearInterval(slideInterval);
  slideInterval = setInterval(function() {
    goToSlide((currentSlide + 1) % slides.length);
  }, 5000);
}

function goToSlide(index) {
  var slides = document.querySelectorAll('.slide');
  var dots = document.querySelectorAll('.dot');
  if (!slides.length) return;

  slides.forEach(function(s) { s.classList.remove('active'); });
  dots.forEach(function(d) { d.classList.remove('active'); });

  slides[index].classList.add('active');
  if (dots[index]) dots[index].classList.add('active');
  currentSlide = index;
}

// Announcement
function renderAnnouncement() {
  var card = document.querySelector('.announcement-card');
  if (card) {
    card.onclick = function() {
      alert('Premium Sekarang Cuma 12500!!!');
    };
  }
}

// Continue Reading
function renderContinueReading() {
  var container = document.getElementById('continueReading');
  if (!container) return;

  if (typeof Progress === 'undefined') {
    container.innerHTML = '<div class="empty">Belum ada riwayat baca</div>';
    return;
  }

  var history = Progress.getAll();
  if (!history || history.length === 0) {
    container.innerHTML = '<div class="empty">Belum ada riwayat baca</div>';
    return;
  }

  var html = '';
  history.forEach(function(h) {
    var series = SERIES.find(function(s) { return s.id === h.id; });
    if (!series) return;

    var chNum = h.progress && h.progress.chapter ? h.progress.chapter.replace('chapter-', '') : '?';

    html += '<a href="reader.html?series=' + series.id + '&chapter=' + (h.progress.chapter || '') + '" class="update-item">';
    html += '<div class="update-cover">';
    html += '<img src="' + (series.cover || '') + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px" onerror="this.style.display=\'none\'">';
    html += '</div>';
    html += '<div class="update-info">';
    html += '<div class="update-title">' + series.title + '</div>';
    html += '<div style="font-size:12px;color:var(--muted);margin-top:4px;">Lanjut Chapter ' + chNum + '</div>';
    html += '</div></a>';
  });

  container.innerHTML = html || '<div class="empty">Belum ada riwayat baca</div>';
}

// Series Grid
function renderSeriesGrid(tab, genre, targetGrid) {
  var grid = targetGrid || document.getElementById('seriesGrid');
  if (!grid) return;

  var filtered = SERIES.slice();

  if (tab === 'populer' || tab === 'explore') {
    filtered.sort(function(a, b) {
      return (b.rating || 0) - (a.rating || 0);
    });
  } else if (tab === 'selesai' || tab === 'library') {
    filtered = filtered.filter(function(s) {
      return s.status === 'Completed' || s.status === 'Selesai';
    });
  }

  if (genre && genre !== 'all') {
    filtered = filtered.filter(function(s) {
      return s.genre && s.genre.some(function(g) {
        return g.toLowerCase() === genre.toLowerCase();
      });
    });
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty">Tidak ada series</div>';
    return;
  }

  var html = '';
  filtered.forEach(function(s) {
    html += '<a href="series.html?id=' + s.id + '" class="series-card">';
    html += '<div class="series-cover">';
    html += '<img src="' + (s.cover || '') + '" alt="' + s.title + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">';
    html += '<div class="cover-fallback" style="display:none">' + s.title.charAt(0) + '</div>';
    html += '<span class="flag">' + (s.flag || '') + '</span>';
    html += '</div>';
    html += '<div class="series-meta">';
    html += '<div class="series-title">' + s.title + '</div>';
    html += '<div class="series-info">';
    html += '<span class="rating">⭐ ' + (s.rating || '?') + '</span>';
    html += '<span class="chapter-info">Ch.' + (s.chapters && s.chapters[0] ? s.chapters[0].num : 0) + '</span>';
    html += '</div></div></a>';
  });

  grid.innerHTML = html;
}

function updateSeriesCount() {
  var el = document.getElementById('seriesCount');
  if (!el) return;
  var count = document.querySelectorAll('#seriesGrid .series-card').length;
  el.textContent = count + ' series';
}

// Updates
function renderUpdates() {
  var list = document.getElementById('updateList');
  if (!list) return;

  if (!SERIES.length) {
    list.innerHTML = '<div class="empty">Belum ada update</div>';
    return;
  }

  var sorted = SERIES.slice().sort(function(a, b) {
    var aNum = a.chapters && a.chapters[0] ? a.chapters[0].num : 0;
    var bNum = b.chapters && b.chapters[0] ? b.chapters[0].num : 0;
    return bNum - aNum;
  });

  var html = '';
  sorted.forEach(function(s) {
    if (!s.chapters || !s.chapters.length) return;

    var latest = s.chapters.slice().sort(function(a, b) {
      return b.num - a.num;
    }).slice(0, 3);

    var chaptersHtml = '';
    latest.forEach(function(c) {
      chaptersHtml += '<a href="reader.html?series=' + s.id + '&chapter=' + c.folder + '" class="chapter-row">';
      chaptersHtml += '<span class="chapter-name">Chapter ' + c.num + '</span>';
      chaptersHtml += '<span class="chapter-time">baru</span>';
      chaptersHtml += '</a>';
    });

    var coverImg = s.cover
      ? '<img src="' + s.cover + '" loading="lazy" onerror="this.style.display=\'none\'">'
      : '<div class="cover-placeholder">' + s.title.charAt(0) + '</div>';

    html += '<div class="update-item" data-href="series.html?id=' + s.id + '">';
    html += '<div class="update-cover">' + coverImg + '</div>';
    html += '<div class="update-info">';
    html += '<div class="update-title"><span class="up">UP</span> ' + s.title + '</div>';
    html += '<div class="chapter-list">' + chaptersHtml + '</div>';
    html += '</div></div>';
  });

  list.innerHTML = html || '<div class="empty">Belum ada update</div>';

  list.querySelectorAll('.update-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      if (e.target.closest('.chapter-row')) return;
      var href = this.getAttribute('data-href');
      if (href) location.href = href;
    });
  });
}

// Explore page
function renderExplorePage() {
  var heroBanner = document.getElementById('heroBanner');
  var horizontalScroll = document.getElementById('horizontalScroll');
  var exploreGrid = document.getElementById('exploreGrid');

  if (!heroBanner || !horizontalScroll || !exploreGrid) return;

  var sorted = SERIES.slice().sort(function(a, b) {
    return (b.rating || 0) - (a.rating || 0);
  });

  var hero = sorted[0];
  if (hero) {
    heroBanner.innerHTML = '<a href="series.html?id=' + hero.id + '" style="text-decoration:none;color:inherit;">' +
      '<img src="' + (hero.cover || '') + '" onerror="this.style.display=\'none\'">' +
      '<div class="hero-banner-content"><h2>' + hero.title + '</h2>' +
      '<p>' + (hero.synopsis || '') + '</p></div></a>';
  }

  var badges = ['3d', '4d', '4mo', '2d', '5mo', '3d', '3mo', '6d', '1yr', '2d'];
  var hHtml = '';
  sorted.slice(0, 10).forEach(function(s, i) {
    hHtml += '<a href="series.html?id=' + s.id + '" class="horizontal-card">';
    hHtml += '<img src="' + (s.cover || '') + '" loading="lazy" onerror="this.style.display=\'none\'">';
    hHtml += '<span class="time-badge">🕓 ' + (badges[i] || '3d') + '</span>';
    hHtml += '<span class="flag-badge">' + (s.flag || '🇰🇷') + '</span>';
    hHtml += '</a>';
  });
  horizontalScroll.innerHTML = hHtml;

  renderSeriesGrid('all', 'all', exploreGrid);
}

// Nav active
function updateNavActive() {
  var params = new URLSearchParams(location.search);
  var tab = params.get('tab') || 'home';

  document.querySelectorAll('.bottom-nav .nav-item').forEach(function(item) {
    item.classList.remove('active');
    var page = item.dataset.page;
    if ((page === 'home' && tab === 'home') ||
        (page === 'explore' && tab === 'explore') ||
        (page === 'library' && tab === 'library') ||
        (page === 'all' && tab === 'all')) {
      item.classList.add('active');
    }
  });
}

// Genre filter
document.querySelectorAll('.genre-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.genre-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    this.classList.add('active');
    var genre = this.dataset.genre;
    var params = new URLSearchParams(location.search);
    var tab = params.get('tab') || 'home';
    renderSeriesGrid(tab, genre, document.getElementById('seriesGrid'));
    updateSeriesCount();
  });
});

// Search
var searchBtn = document.getElementById('searchBtn');
var searchModal = document.getElementById('searchModal');
var searchInput = document.getElementById('searchInput');
var searchResult = document.getElementById('searchResult');
var closeSearch = document.getElementById('closeSearch');

if (searchBtn) {
  searchBtn.addEventListener('click', function() {
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
    if (e.target === searchModal) searchModal.classList.remove('show');
  });
}

if (searchInput) {
  searchInput.addEventListener('input', function() {
    var q = this.value.toLowerCase().trim();
    if (!q) {
      searchResult.innerHTML = '';
      return;
    }
    var filtered = SERIES.filter(function(s) {
      return s.title.toLowerCase().includes(q);
    });
    if (filtered.length === 0) {
      searchResult.innerHTML = '<div class="search-item" style="color:#666">Tidak ditemukan</div>';
      return;
    }
    var html = '';
    filtered.forEach(function(s) {
      html += '<a href="series.html?id=' + s.id + '" class="search-item">' + s.title + ' ⭐' + (s.rating || '?') + '</a>';
    });
    searchResult.innerHTML = html;
  });
}

// Block copy
document.addEventListener('copy', function(e) { e.preventDefault(); });
document.addEventListener('cut', function(e) { e.preventDefault(); });
document.addEventListener('contextmenu', function(e) { e.preventDefault(); });

setTimeout(updateNavActive, 100);

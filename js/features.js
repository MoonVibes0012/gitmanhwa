/* ===================================================================
   GITMANHWA - FEATURES.JS
   Fitur lanjutan: Bookmark, Scroll ke Atas, dan Progress Bar
   =================================================================== */

// ===== SCROLL KE ATAS =====
const ScrollTop = {
  init() {
    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.innerHTML = '↑';
    btn.style.display = 'none';
    document.body.appendChild(btn);

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        btn.style.display = 'block';
      } else {
        btn.style.display = 'none';
      }
    });
  }
};

// ===== BOOKMARK (Tandai Series) =====
const Bookmark = {
  // Ambil semua bookmark dari localStorage
  getAll() {
    return Storage.get('gitmanhwa_bookmarks', []);
  },
  // Cek apakah series di-bookmark
  exists(seriesId) {
    const bookmarks = this.getAll();
    return bookmarks.includes(seriesId);
  },
  // Tambah bookmark
  add(seriesId) {
    const bookmarks = this.getAll();
    if (!bookmarks.includes(seriesId)) {
      bookmarks.push(seriesId);
      Storage.set('gitmanhwa_bookmarks', bookmarks);
      console.log(`📌 Bookmark ditambahkan: ${seriesId}`);
    }
  },
  // Hapus bookmark
  remove(seriesId) {
    const bookmarks = this.getAll();
    const index = bookmarks.indexOf(seriesId);
    if (index !== -1) {
      bookmarks.splice(index, 1);
      Storage.set('gitmanhwa_bookmarks', bookmarks);
      console.log(`📌 Bookmark dihapus: ${seriesId}`);
    }
  },
  // Toggle bookmark
  toggle(seriesId) {
    if (this.exists(seriesId)) {
      this.remove(seriesId);
      return false;
    } else {
      this.add(seriesId);
      return true;
    }
  },
  // Tampilkan semua bookmark dalam grid
  renderGrid(targetElement) {
    const bookmarks = this.getAll();
    if (bookmarks.length === 0) {
      targetElement.innerHTML = `<div class="empty">Belum ada bookmark</div>`;
      return;
    }

    const bookmarkedSeries = SERIES.filter(s => bookmarks.includes(s.id));
    targetElement.innerHTML = bookmarkedSeries.map(s => `
      <a href="series.html?id=${s.id}" class="series-card">
        <div class="series-cover">
          <img src="${s.cover || ''}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <div class="cover-fallback" style="display:none">${s.title.charAt(0)}</div>
        </div>
        <div class="series-meta">
          <div class="series-title">${s.title}</div>
          <div class="series-info">
            <span class="rating">⭐ ${s.rating || '?'}</span>
          </div>
        </div>
      </a>
    `).join('');
  }
};

// ===== PROGRESS BAR BACA =====
const ReadingProgress = {
  init() {
    const bar = document.createElement('div');
    bar.className = 'reading-progress-bar';
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    });
  }
};

// ===== INISIALISASI SEMUA FITUR =====
function initFeatures() {
  ScrollTop.init();
  ReadingProgress.init();
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', initFeatures);

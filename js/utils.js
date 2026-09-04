/* ===================================================================
   GITMANHWA - UTILS.JS
   Fungsi-fungsi utility yang reusable (tidak bergantung DOM)
   Dipisahkan dari app.js agar kode lebih terstruktur & mudah di-maintain
   =================================================================== */

// ===== STORAGE (LocalStorage) =====
const Storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
  },
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      console.warn('Gagal membaca localStorage:', e);
      return defaultValue;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Gagal menghapus localStorage:', e);
    }
  }
};

// ===== FORMAT (Angka, Waktu, Ukuran) =====
const Format = {
  // Format angka ribuan: 12500 -> "12.500"
  number(num) {
    return num ? num.toLocaleString('id-ID') : '0';
  },
  // Format rating: 8.65 -> "8.6"
  rating(num) {
    return num ? num.toFixed(1) : '?';
  },
  // Format waktu relatif: timestamp -> "x menit lalu", "x jam lalu"
  timeAgo(timestamp) {
    if (!timestamp) return 'baru saja';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'baru saja';
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks} minggu lalu`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} bulan lalu`;
    const years = Math.floor(months / 12);
    return `${years} tahun lalu`;
  },
  // Format ukuran file: 1.2MB -> "1.2 MB"
  fileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    return mb.toFixed(1) + ' MB';
  }
};

// ===== URL & NAVIGASI =====
const URLHelper = {
  // Bangun URL series detail
  seriesDetail(id) {
    return `series.html?id=${id}`;
  },
  // Bangun URL reader
  reader(id, chapterFolder) {
    return `reader.html?series=${id}&chapter=${chapterFolder}`;
  },
  // Bangun URL explore
  explore() {
    return `index.html?tab=explore`;
  },
  // Ambil parameter dari URL
  getParam(key) {
    const params = new URLSearchParams(location.search);
    return params.get(key);
  }
};

// ===== PROGRESS (Riwayat Baca) =====
const Progress = {
  // Simpan progress baca
  save(seriesId, chapterFolder, scrollY = 0) {
    Storage.set(`gitmanhwa_progress_${seriesId}`, {
      chapter: chapterFolder,
      scrollY: scrollY,
      timestamp: Date.now()
    });
  },
  // Ambil progress baca
  get(seriesId) {
    return Storage.get(`gitmanhwa_progress_${seriesId}`);
  },
  // Cek apakah series punya riwayat
  exists(seriesId) {
    return !!Storage.get(`gitmanhwa_progress_${seriesId}`);
  },
  // Ambil semua series yang punya riwayat (untuk tab Library)
  getAll() {
    const all = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('gitmanhwa_progress_')) {
        const seriesId = key.replace('gitmanhwa_progress_', '');
        all.push({
          id: seriesId,
          progress: Storage.get(key)
        });
      }
    }
    return all;
  }
};

// ===== SEARCH & FILTER =====
const Filter = {
  // Filter series berdasarkan genre
  byGenre(seriesList, genre) {
    if (!genre || genre === 'all') return seriesList;
    return seriesList.filter(s =>
      s.genre && s.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  },
  // Filter series berdasarkan status
  byStatus(seriesList, status) {
    if (!status || status === 'all') return seriesList;
    return seriesList.filter(s => s.status === status);
  },
  // Cari series berdasarkan keyword (judul, author, genre)
  search(seriesList, query) {
    const q = query.toLowerCase().trim();
    if (!q) return seriesList;
    return seriesList.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.author && s.author.toLowerCase().includes(q)) ||
      (s.genre && s.genre.some(g => g.toLowerCase().includes(q)))
    );
  },
  // Sort series berdasarkan rating
  byRating(seriesList, direction = 'desc') {
    const sorted = [...seriesList].sort((a, b) =>
      (b.rating || 0) - (a.rating || 0)
    );
    return direction === 'asc' ? sorted.reverse() : sorted;
  }
};

// ===== DOM HELPER (Query & Manipulasi Sederhana) =====
const DOM = {
  // Query single element
  q(selector) {
    return document.querySelector(selector);
  },
  // Query multiple elements
  qa(selector) {
    return document.querySelectorAll(selector);
  },
  // Buat elemen HTML dari string
  create(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  },
  // Sembunyikan elemen
  hide(el) {
    if (el) el.style.display = 'none';
  },
  // Tampilkan elemen
  show(el) {
    if (el) el.style.display = 'block';
  }
};

// ===== THROTTLE & DEBOUNCE (Optimasi Performa) =====
const Performance = {
  // Debounce: jalan setelah berhenti scroll/input
  debounce(fn, delay = 200) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },
  // Throttle: jalan maksimal 1x per interval
  throttle(fn, limit = 200) {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        return fn.apply(this, args);
      }
    };
  }
};

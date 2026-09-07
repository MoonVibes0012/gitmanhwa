/* ===================================================================
   GITMANHWA - FEATURES.JS
   Bookmark + Progress + Scroll Top + Reading Progress Bar
   =================================================================== */

const Bookmark = {
  getAll() {
    try {
      return JSON.parse(localStorage.getItem('gitmanhwa_bookmarks') || '[]');
    } catch (e) {
      return [];
    }
  },

  exists(seriesId) {
    return this.getAll().includes(seriesId);
  },

  add(seriesId) {
    const list = this.getAll();
    if (!list.includes(seriesId)) {
      list.push(seriesId);
      localStorage.setItem('gitmanhwa_bookmarks', JSON.stringify(list));
    }
  },

  remove(seriesId) {
    const list = this.getAll().filter(function(id) {
      return id !== seriesId;
    });
    localStorage.setItem('gitmanhwa_bookmarks', JSON.stringify(list));
  },

  toggle(seriesId) {
    if (this.exists(seriesId)) {
      this.remove(seriesId);
      return false;
    } else {
      this.add(seriesId);
      return true;
    }
  }
};

const Progress = {
  save(seriesId, chapterFolder, scrollY) {
    try {
      localStorage.setItem('gitmanhwa_progress_' + seriesId, JSON.stringify({
        chapter: chapterFolder,
        scrollY: scrollY || 0,
        timestamp: Date.now()
      }));
    } catch (e) {}
  },

  get(seriesId) {
    try {
      const data = localStorage.getItem('gitmanhwa_progress_' + seriesId);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  exists(seriesId) {
    return !!localStorage.getItem('gitmanhwa_progress_' + seriesId);
  },

  getAll() {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.indexOf('gitmanhwa_progress_') === 0) {
        const id = key.replace('gitmanhwa_progress_', '');
        result.push({
          id: id,
          progress: this.get(id)
        });
      }
    }
    // Urutkan dari yang paling baru
    return result.sort(function(a, b) {
      return (b.progress && b.progress.timestamp || 0) - (a.progress && a.progress.timestamp || 0);
    });
  },

  remove(seriesId) {
    localStorage.removeItem('gitmanhwa_progress_' + seriesId);
  }
};

// ===== Scroll to Top =====
const ScrollTop = {
  init() {
    if (document.querySelector('.scroll-top-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'scroll-top-btn';
    btn.innerHTML = '↑';
    btn.title = 'Kembali ke atas';
    btn.style.cssText = 'position:fixed;bottom:80px;right:16px;width:44px;height:44px;border-radius:50%;background:var(--accent,#7c3aed);color:white;border:none;font-size:20px;cursor:pointer;display:none;z-index:90;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
    document.body.appendChild(btn);

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', function() {
      btn.style.display = window.scrollY > 400 ? 'block' : 'none';
    });
  }
};

// ===== Reading Progress Bar =====
const ReadingProgress = {
  init() {
    if (document.querySelector('.reading-progress-bar')) return;

    const bar = document.createElement('div');
    bar.className = 'reading-progress-bar';
    bar.style.cssText = 'position:fixed;top:0;left:0;height:3px;background:var(--accent,#7c3aed);width:0%;z-index:9999;transition:width 0.1s linear;';
    document.body.appendChild(bar);

    window.addEventListener('scroll', function() {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    });
  }
};

// ===== Init =====
function initFeatures() {
  ScrollTop.init();
  ReadingProgress.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFeatures);
} else {
  initFeatures();
}

/* ===================================================================
   GITMANHWA - LIBRARY.JS
   Halaman Library: Bookmark + Riwayat Baca
   =================================================================== */

const Library = {
  // Render semua konten Library
  render() {
    const container = document.getElementById('libraryContent');
    if (!container) return;

    const bookmarks = (typeof Bookmark !== 'undefined') ? Bookmark.getAll() : [];
    const history = (typeof Progress !== 'undefined') ? Progress.getAll() : [];

    let html = '';

    // ===== Section Bookmark =====
    html += '<div class="section">';
    html += '<div class="section-header"><h3 class="section-title">Bookmark</h3></div>';

    if (bookmarks.length === 0) {
      html += '<div class="empty">Belum ada bookmark</div>';
    } else {
      html += '<div class="series-grid">';
      bookmarks.forEach(function (id) {
        const series = SERIES.find(function (s) { return s.id === id; });
        if (!series) return;

        html += '<a href="series.html?id=' + series.id + '" class="series-card">';
        html += '<div class="series-cover">';
        html += '<img src="' + (series.cover || '') + '" alt="' + series.title + '" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">';
        html += '<div class="cover-fallback" style="display:none">' + series.title.charAt(0) + '</div>';
        html += '<span class="flag">' + (series.flag || '') + '</span>';
        html += '</div>';
        html += '<div class="series-meta">';
        html += '<div class="series-title">' + series.title + '</div>';
        html += '<div class="series-info"><span class="rating">⭐ ' + (series.rating || '?') + '</span></div>';
        html += '</div></a>';
      });
      html += '</div>';
    }
    html += '</div>';

    // ===== Section Riwayat Baca =====
    html += '<div class="section" style="margin-top:24px;">';
    html += '<div class="section-header"><h3 class="section-title">Riwayat Baca</h3></div>';

    if (history.length === 0) {
      html += '<div class="empty">Belum ada riwayat baca</div>';
    } else {
      html += '<div class="update-list">';
      history.forEach(function (item) {
        const series = SERIES.find(function (s) { return s.id === item.id; });
        if (!series) return;

        const chNum = item.progress && item.progress.chapter
          ? item.progress.chapter.replace('chapter-', '')
          : '?';

        html += '<a href="reader.html?series=' + series.id + '&chapter=' + (item.progress.chapter || '') + '" class="update-item">';
        html += '<div class="update-cover">';
        html += '<img src="' + (series.cover || '') + '" style="width:100%;height:100%;object-fit:cover;border-radius:6px" onerror="this.style.display=\'none\'">';
        html += '</div>';
        html += '<div class="update-info">';
        html += '<div class="update-title">' + series.title + '</div>';
        html += '<div style="font-size:12px;color:var(--muted);margin-top:4px;">Lanjut Chapter ' + chNum + '</div>';
        html += '</div></a>';
      });
      html += '</div>';
    }
    html += '</div>';

    // Tombol clear history
    if (history.length > 0) {
      html += '<div style="text-align:center;margin:20px 0;">';
      html += '<button id="clearHistoryBtn" style="padding:10px 18px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);font-size:13px;cursor:pointer;">Hapus Semua Riwayat</button>';
      html += '</div>';
    }

    container.innerHTML = html;

    // Event clear history
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        if (confirm('Yakin mau hapus semua riwayat baca?')) {
          history.forEach(function (item) {
            Progress.remove(item.id);
          });
          Library.render(); // refresh
        }
      });
    }
  }
};

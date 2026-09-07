/* ===================================================================
   GITMANHWA - DATA.JS
   Helper untuk memuat data series dengan caching
   =================================================================== */

const DataLoader = {
  _cache: null,

  // Muat data series.json (dengan cache)
  load: function(forceRefresh) {
    var self = this;

    // Jika data sudah ada & tidak force refresh, pakai cache
    if (this._cache && !forceRefresh) {
      console.log('📦 Data dimuat dari cache');
      return Promise.resolve(this._cache);
    }

    return fetch('data/series.json')
      .then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function(data) {
        self._cache = data;
        console.log('✅ Data dimuat dari server:', data.length, 'series');
        return data;
      })
      .catch(function(error) {
        console.error('❌ Gagal memuat data:', error);
        return [];
      });
  },

  // Ambil satu series berdasarkan ID
  getSeriesById: function(id) {
    return this.load().then(function(allData) {
      for (var i = 0; i < allData.length; i++) {
        if (allData[i].id === id) return allData[i];
      }
      return null;
    });
  },

  // Ambil semua chapter dari satu series
  getChapters: function(seriesId) {
    return this.getSeriesById(seriesId).then(function(series) {
      return series ? series.chapters : [];
    });
  },

  // Ambil series terbaru (berdasarkan timestamp chapter terakhir)
  getLatestSeries: function(limit) {
    limit = limit || 10;
    return this.load().then(function(allData) {
      var sorted = allData.slice().sort(function(a, b) {
        var aTime = a.chapters && a.chapters[0] ? a.chapters[0].timestamp || '' : '';
        var bTime = b.chapters && b.chapters[0] ? b.chapters[0].timestamp || '' : '';
        return new Date(bTime) - new Date(aTime);
      });
      return sorted.slice(0, limit);
    });
  },

  // Hapus cache (kalau perlu refresh paksa)
  clearCache: function() {
    this._cache = null;
  }
};

/* ===================================================================
   GITMANHWA - DATA.JS
   Helper untuk memuat data series dengan caching (biar cepat)
   =================================================================== */

const DataLoader = {
  // Simpan data di cache memory (bukan localStorage)
  _cache: null,

  // Muat data series.json (dengan cache)
  async load(forceRefresh = false) {
    // Jika data sudah ada & tidak force refresh, pakai cache
    if (this._cache && !forceRefresh) {
      console.log('📦 Data dimuat dari cache');
      return this._cache;
    }

    try {
      const response = await fetch('data/series.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      this._cache = data;
      console.log('✅ Data dimuat dari server:', data.length, 'series');
      return data;
    } catch (error) {
      console.error('❌ Gagal memuat data:', error);
      return [];
    }
  },

  // Ambil satu series berdasarkan ID
  async getSeriesById(id) {
    const allData = await this.load();
    return allData.find(s => s.id === id) || null;
  },

  // Ambil semua chapter dari satu series
  async getChapters(seriesId) {
    const series = await this.getSeriesById(seriesId);
    return series ? series.chapters : [];
  },

  // Ambil series terbaru (berdasarkan timestamp chapter terakhir)
  async getLatestSeries(limit = 10) {
    const allData = await this.load();
    const sorted = [...allData].sort((a, b) => {
      const aLatest = a.chapters[0]?.timestamp || '';
      const bLatest = b.chapters[0]?.timestamp || '';
      return new Date(bLatest) - new Date(aLatest);
    });
    return sorted.slice(0, limit);
  }
};

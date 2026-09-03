const CONFIG = {
  CACHE_NAME: 'gitmanhwa-cache-v2',
  MAX_PAGES: 200,
  BATCH_SIZE: 40,
  IMAGE_FORMATS: ['jpg', 'png', 'webp', 'jpeg', 'bmp'],
  API_URL: 'data/series.json',
  ENABLE_COPY_PROTECTION: true,
  ENABLE_SERVICE_WORKER: true,
  DEFAULT_TAB: 'home'
};

// Blokir copy/context menu (kalau aktif)
if (CONFIG.ENABLE_COPY_PROTECTION) {
  document.addEventListener('copy', (e) => e.preventDefault());
  document.addEventListener('cut', (e) => e.preventDefault());
  document.addEventListener('contextmenu', (e) => e.preventDefault());
}

# GITMANHWA

Web manhwa pribadi pure static — hanya GitHub.

## Struktur Folder Chapter

```
series/
  hell-login/
    cover.jpg          ← cover series (opsional)
    chapter-1/
      01.jpg
      02.jpg
      03.jpg
      ...
    chapter-2/
      01.jpg
      02.jpg
      ...
  pemuda-abadi/
    chapter-1/
      01.jpg
      ...
```

## Cara Pakai

1. Clone / download repo ini.
2. Tambah series baru di `js/app.js` (array SERIES).
3. Buat folder sesuai id + chapter-X.
4. Masukkan gambar berurut: `01.jpg`, `02.jpg`, ... (atau .png).
5. Push ke GitHub.
6. Aktifkan GitHub Pages (Settings → Pages → Deploy from branch main / root).

## UI

- Header + logo **GITMANHWA** (gaya abu + garis dari foto 1).
- Rekomendasi + Update diambil dari foto 2 (tanpa bottom nav Explore/Library/All Series).

## Catatan

- Semua storage di dalam repo GitHub.
- Tidak butuh server / database.
- Untuk gambar besar, pertimbangkan Git LFS.

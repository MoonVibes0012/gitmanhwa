#!/usr/bin/env python3
"""
GITMANHWA - Image Compressor Final
Fungsi: Kompres & optimasi semua gambar di folder series/ agar web lebih cepat
Cara pakai:
  1. Install Pillow:  pip install Pillow
  2. Jalankan:        python tools/compress-images.py
  3. Opsi:            python tools/compress-images.py --dry-run
                      python tools/compress-images.py --max-width 800
                      python tools/compress-images.py --to-webp
                      python tools/compress-images.py --series taylor
"""

import os
import sys
import argparse
from datetime import datetime

# ===== KONFIGURASI DEFAULT =====
DEFAULT_QUALITY = 78
DEFAULT_MAX_WIDTH = 1100
DEFAULT_FORMATS = ('.jpg', '.jpeg', '.png', '.webp')
LOG_FILE = 'compress-log.txt'

# ===== CEK PILLOW =====
try:
    from PIL import Image, ImageOps
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("❌ PIL/Pillow belum terinstall!")
    print("👉 Install dengan perintah: pip install Pillow")
    print("👉 Atau: python -m pip install Pillow")
    sys.exit(1)

# ===== UTILITAS =====
def parse_args():
    parser = argparse.ArgumentParser(description='Kompres gambar untuk GITMANHWA')
    parser.add_argument('--folder', default='series', help='Folder utama (default: series)')
    parser.add_argument('--series', default=None, help='Hanya proses series tertentu (misal: taylor)')
    parser.add_argument('--max-width', type=int, default=DEFAULT_MAX_WIDTH, help='Lebar maksimal (default: 1100)')
    parser.add_argument('--quality', type=int, default=DEFAULT_QUALITY, help='Kualitas (1-100, default: 78)')
    parser.add_argument('--to-webp', action='store_true', help='Ubah semua ke format WebP')
    parser.add_argument('--dry-run', action='store_true', help='Hitung penghematan tanpa mengubah file')
    return parser.parse_args()

def human_size(bytes):
    if bytes < 1024:
        return f"{bytes} B"
    kb = bytes / 1024
    if kb < 1024:
        return f"{kb:.1f} KB"
    mb = kb / 1024
    return f"{mb:.1f} MB"

def log_message(message, save_to_file=True):
    """Tampilkan ke console & simpan ke file log"""
    print(message)
    if save_to_file:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(message + '\n')

# ===== KOMpres SATU GAMBAR =====
def compress_image(file_path, quality, max_width, to_webp):
    """Kompres satu file gambar, return (original_size, new_size, new_path, success)"""
    original_size = os.path.getsize(file_path)
    
    try:
        img = Image.open(file_path)
        
        # Handle EXIF orientation (biar nggak kebalik)
        img = ImageOps.exif_transpose(img)
        
        # Resize jika terlalu lebar
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.LANCZOS)
        
        # Tentukan format output
        if to_webp:
            output_format = 'WEBP'
            output_ext = '.webp'
        else:
            output_format = 'JPEG'
            output_ext = '.jpg'
        
        # Simpan ke file baru (ke temp dulu biar aman)
        temp_path = os.path.splitext(file_path)[0] + '_compressed' + output_ext
        img.save(temp_path, output_format, quality=quality, optimize=True)
        img.close()
        
        new_size = os.path.getsize(temp_path)
        
        # Jika hasilnya lebih besar dari asli, batalkan & pertahankan file asli
        if new_size >= original_size:
            os.remove(temp_path)
            return original_size, original_size, file_path, True
        
        # Replace file asli dengan file baru
        os.replace(temp_path, file_path)
        
        # Jika format berubah, hapus file lama yang duplikat
        if output_ext != os.path.splitext(file_path)[1]:
            base = os.path.splitext(file_path)[0]
            for ext in DEFAULT_FORMATS:
                old_file = base + ext
                if os.path.exists(old_file) and old_file != file_path:
                    os.remove(old_file)
        
        return original_size, new_size, file_path, True
        
    except Exception as e:
        # Kalau error, jangan crash. Skip file ini
        return original_size, original_size, file_path, False

# ===== PROSES SEMUA GAMBAR =====
def process_folder(folder_path, quality, max_width, to_webp, dry_run, series_filter=None):
    total_original = 0
    total_new = 0
    total_files = 0
    failed_files = 0
    skipped_files = 0
    
    # Reset log
    with open(LOG_FILE, 'w', encoding='utf-8') as f:
        f.write(f"GITMANHWA Image Compression Log\n")
        f.write(f"Tanggal: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Quality: {quality} | Max Width: {max_width}px | Format: {'WebP' if to_webp else 'JPG'}\n")
        f.write("=" * 50 + "\n\n")
    
    log_message(f"\n📁 Memproses folder: {folder_path}")
    if series_filter:
        log_message(f"🎯 Filter series: {series_filter}")
    log_message(f"⚙️  Kualitas: {quality} | Lebar maks: {max_width}px | Format target: {'WebP' if to_webp else 'JPG'}")
    log_message("=" * 50)
    
    for root, dirs, files in os.walk(folder_path):
        # Skip folder tersembunyi
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        
        # Filter series
        if series_filter and series_filter not in root:
            continue
        
        for file in files:
            if not file.lower().endswith(DEFAULT_FORMATS):
                continue
            
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, folder_path)
            
            # Dry run: cuma hitung
            if dry_run:
                original_size = os.path.getsize(file_path)
                total_original += original_size
                total_files += 1
                continue
            
            # Kompres
            original_size, new_size, new_path, success = compress_image(
                file_path, quality, max_width, to_webp
            )
            
            saved = original_size - new_size
            total_original += original_size
            total_new += new_size
            total_files += 1
            
            if not success:
                failed_files += 1
                log_message(f"  ⚠️ {rel_path}: GAGAL (dilewati)")
                continue
            
            if saved > 0:
                status = "✅"
                log_message(f"  {status} {rel_path}: {human_size(original_size)} → {human_size(new_size)} (hemat {human_size(saved)})")
            else:
                skipped_files += 1
                log_message(f"  ➖ {rel_path}: Sudah optimal (tidak dikompres)")
    
    log_message("=" * 50)
    
    if dry_run:
        log_message(f"\n📊 DRY RUN - Estimasi penghematan:")
        log_message(f"  Total file: {total_files}")
        log_message(f"  Total ukuran: {human_size(total_original)}")
        log_message(f"  Estimasi hemat: {human_size(total_original * 0.4)} (asumsi 40%)")
        log_message("  Jalankan tanpa --dry-run untuk eksekusi.")
    else:
        saved_total = total_original - total_new
        percent_saved = (saved_total / total_original * 100) if total_original > 0 else 0
        log_message(f"\n📊 HASIL:")
        log_message(f"  Total file diproses: {total_files}")
        log_message(f"  Ukuran awal: {human_size(total_original)}")
        log_message(f"  Ukuran akhir: {human_size(total_new)}")
        log_message(f"  Total hemat: {human_size(saved_total)} ({percent_saved:.1f}% lebih kecil)")
        log_message(f"  File sukses: {total_files - failed_files - skipped_files}")
        log_message(f"  File gagal/error: {failed_files}")
        log_message(f"  File sudah optimal: {skipped_files}")
        log_message("\n✅ Selesai! Push ke GitHub untuk hasil terbaik.")
        log_message(f"📄 Log lengkap disimpan di: {LOG_FILE}")

# ===== MAIN =====
if __name__ == "__main__":
    args = parse_args()
    
    # Validasi folder
    target_folder = args.folder
    if args.series:
        target_folder = os.path.join(args.folder, args.series)
    
    if not os.path.exists(target_folder):
        print(f"❌ Folder '{target_folder}' tidak ditemukan!")
        print(f"   Cek path: {os.path.abspath(target_folder)}")
        sys.exit(1)
    
    # Jalankan
    process_folder(
        folder_path=target_folder,
        quality=args.quality,
        max_width=args.max_width,
        to_webp=args.to_webp,
        dry_run=args.dry_run,
        series_filter=args.series if args.series else None
    )

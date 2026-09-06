#!/usr/bin/env python3
"""
GITMANHWA - Image Compressor
Fungsi: Kompres & optimasi semua gambar di folder series/ agar web lebih cepat
Cara pakai:
  1. Install Pillow:  pip install Pillow
  2. Jalankan:        python tools/compress-images.py
  3. Opsi:            python tools/compress-images.py --dry-run
                      python tools/compress-images.py --max-width 800
                      python tools/compress-images.py --to-webp
"""

import os
import sys
import argparse
from PIL import Image, ImageOps

# ===== KONFIGURASI DEFAULT =====
DEFAULT_QUALITY = 80
DEFAULT_MAX_WIDTH = 1200
DEFAULT_FORMATS = ('.jpg', '.jpeg', '.png', '.webp')
TARGET_FORMAT = 'jpg'  # Format output (jpg, webp, atau 'original')

# ===== UTILITAS =====
def parse_args():
    parser = argparse.ArgumentParser(description='Kompres gambar untuk GITMANHWA')
    parser.add_argument('--folder', default='series', help='Folder gambar (default: series)')
    parser.add_argument('--max-width', type=int, default=DEFAULT_MAX_WIDTH, help='Lebar maksimal (default: 1200)')
    parser.add_argument('--quality', type=int, default=DEFAULT_QUALITY, help='Kualitas (1-100, default: 80)')
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

# ===== KOMpres SATU GAMBAR =====
def compress_image(file_path, quality, max_width, to_webp):
    """Kompres satu file gambar, return (original_size, new_size, new_path)"""
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
        
        # Simpan ke file baru
        new_path = os.path.splitext(file_path)[0] + output_ext
        img.save(new_path, output_format, quality=quality, optimize=True)
        img.close()
        
        new_size = os.path.getsize(new_path)
        
        # Jika file asli .png dan hasil jpg lebih besar, pertahankan png
        if new_size >= original_size:
            os.remove(new_path)
            new_path = file_path
            new_size = original_size
            
        return original_size, new_size, new_path
        
    except Exception as e:
        print(f"  ⚠️ Gagal kompres {file_path}: {e}")
        return original_size, original_size, file_path

# ===== PROSES SEMUA GAMBAR =====
def process_folder(folder_path, quality, max_width, to_webp, dry_run):
    total_original = 0
    total_new = 0
    total_files = 0
    failed_files = 0
    
    print(f"\n📁 Memproses folder: {folder_path}")
    print(f"⚙️  Kualitas: {quality} | Lebar maks: {max_width}px | Format target: {'WebP' if to_webp else 'JPG'}")
    print("=" * 50)
    
    for root, dirs, files in os.walk(folder_path):
        # Skip folder tersembunyi
        dirs[:] = [d for d in dirs if not d.startswith('.')]
        
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
            original_size, new_size, new_path = compress_image(
                file_path, quality, max_width, to_webp
            )
            
            saved = original_size - new_size
            total_original += original_size
            total_new += new_size
            total_files += 1
            
            status = "✅" if saved > 0 else "➖"
            print(f"  {status} {rel_path}: {human_size(original_size)} → {human_size(new_size)} (hemat {human_size(saved)})")
            
            if new_path != file_path:
                # Hapus file lama jika format berubah
                if os.path.exists(file_path) and file_path != new_path:
                    os.remove(file_path)
                    print(f"    🗑️  File lama dihapus: {os.path.basename(file_path)}")
            
            if saved <= 0:
                failed_files += 1
    
    print("=" * 50)
    
    if dry_run:
        print(f"\n📊 DRY RUN - Estimasi penghematan:")
        print(f"  Total file: {total_files}")
        print(f"  Total ukuran: {human_size(total_original)}")
        print(f"  Estimasi hemat: {human_size(total_original * 0.4)} (asumsi 40%)")
        print("  Jalankan tanpa --dry-run untuk eksekusi.")
    else:
        saved_total = total_original - total_new
        print(f"\n📊 HASIL:")
        print(f"  Total file diproses: {total_files}")
        print(f"  Ukuran awal: {human_size(total_original)}")
        print(f"  Ukuran akhir: {human_size(total_new)}")
        print(f"  Total hemat: {human_size(saved_total)} ({saved_total/total_original*100:.1f}% lebih kecil)")
        print(f"  File gagal/lewat: {failed_files}")
        print("\n✅ Selesai! Push ke GitHub untuk hasil terbaik.")

# ===== MAIN =====
if __name__ == "__main__":
    args = parse_args()
    
    if not os.path.exists(args.folder):
        print(f"❌ Folder '{args.folder}' tidak ditemukan!")
        sys.exit(1)
    
    process_folder(
        folder_path=args.folder,
        quality=args.quality,
        max_width=args.max_width,
        to_webp=args.to_webp,
        dry_run=args.dry_run
    )

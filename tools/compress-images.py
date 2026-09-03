import os
from PIL import Image

def compress_images(folder_path, quality=75, max_width=1200):
    total_saved = 0
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png')):
                file_path = os.path.join(root, file)
                img = Image.open(file_path)
                original_size = os.path.getsize(file_path)
                
                # Resize jika terlalu lebar
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((max_width, new_height), Image.LANCZOS)
                
                # Kompres dan simpan
                if file.lower().endswith('.png'):
                    img.save(file_path, optimize=True, quality=quality)
                else:
                    img.save(file_path, optimize=True, quality=quality)
                
                new_size = os.path.getsize(file_path)
                saved = original_size - new_size
                total_saved += saved
                print(f"✓ {file}: {original_size//1024}KB -> {new_size//1024}KB (Hemat {saved//1024}KB)")
    
    print(f"\n✅ Total hemat: {total_saved//1024}KB")

if __name__ == "__main__":
    folder = "series"
    if os.path.exists(folder):
        print(f"Memproses folder '{folder}'...")
        compress_images(folder)
    else:
        print("Folder 'series' tidak ditemukan!")

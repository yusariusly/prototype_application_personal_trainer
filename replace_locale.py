import os, glob

# Rename the locale file
try:
    os.rename('src/locales/id.json', 'src/locales/ms.json')
except FileNotFoundError:
    pass # Already renamed

for file in glob.glob('**/*.html', recursive=True):
    if 'node_modules' in file: continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace id with ms in language selector
    content = content.replace('<option data-i18n="id" value="id">ID</option>', '<option data-i18n="ms" value="ms">MY</option>')
    content = content.replace('<option data-i18n="bahasa_id" value="id">Bahasa (ID)</option>', '<option data-i18n="bahasa_ms" value="ms">Bahasa Melayu (MY)</option>')
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

with open('src/i18n.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import id from './locales/id.json';", "import ms from './locales/ms.json';")
content = content.replace("id: { translation: id }", "ms: { translation: ms }")

with open('src/i18n.js', 'w', encoding='utf-8') as f:
    f.write(content)

# Now quickly update some words in ms.json for Malay
import json
with open('src/locales/ms.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

replacements = {
    "Selamat datang kembali": "Selamat kembali",
    "Beli Paket": "Beli Pakej",
    "Pesan Sesi": "Tempah Sesi",
    "Pesan": "Mesej", 
    "Kata Sandi": "Kata Laluan",
    "Masuk": "Log Masuk",
    "Kuesioner": "Soal Selidik",
    "Kesehatan": "Kesihatan",
    "Olahraga": "Sukan",
    "Kebugaran": "Kecergasan",
    "Belum punya akun?": "Belum mempunyai akaun?",
    "Pelatih": "Jurulatih",
    "Penjualan": "Jualan",
    "Pengaturan": "Tetapan",
    "Tujuan": "Matlamat",
    "Tatap Muka": "Bersemuka",
    "Batal": "Batal",
    "Pesan Jadwal": "Tempah Jadual",
    "Mulai Latihan": "Mula Latihan",
    "Mulai": "Mula",
    "Latihan": "Senaman",
    "Kelola": "Urus",
    "Kemajuan": "Kemajuan",
    "Terbaik": "Terbaik",
    "Lacak": "Jejak",
    "Capai": "Capai"
}

for key, val in data.items():
    new_val = val
    for indo, malay in replacements.items():
        new_val = new_val.replace(indo, malay)
    data[key] = new_val

# Specific changes for landing page main texts
data["hero_start"] = "Mula Perjalanan Anda"
data["hero_cancel"] = "Batal Bila-bila Masa"
data["hero_dashboard"] = "Papan Pemuka Peribadi"
data["nav_get_started"] = "Mula"
data["nav_features"] = "Ciri-ciri"
data["nav_about"] = "Tentang"
data["cta_ready"] = "Sedia untuk mengubah hidup anda?"
data["cta_join"] = "Sertai platform Elite Trainer hari ini. Sama ada anda profesional kecergasan atau pelanggan, kami menyediakan alat yang anda perlukan."

with open('src/locales/ms.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

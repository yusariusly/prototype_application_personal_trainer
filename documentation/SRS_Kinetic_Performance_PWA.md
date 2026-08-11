# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
# Kinetic Performance — Personal Training & Fitness Coaching Platform
## Progressive Web App (PWA)

| Metadata | Detail |
|---|---|
| **Nama Produk** | Kinetic Performance PWA |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 7 Agustus 2026 |
| **Status** | Draft untuk Review Tim Dev |
| **Sumber Acuan** | Analisis Fitur Unggulan Personal Training.pdf (7 kompetitor: Trainerize, TrueCoach, Future, Freeletics, Fita, FIT HUB, AYO) + Audit source code prototype internal |
| **Standar Acuan** | IEEE 830-1998 (adaptasi) |

---

## DAFTAR ISI

1. Pendahuluan
2. Deskripsi Umum Sistem
3. Kebutuhan Fungsional
4. Kebutuhan Non-Fungsional
5. Kebutuhan Antarmuka Eksternal
6. Arsitektur & Kebutuhan Khusus PWA
7. Matriks Traceability Fitur vs Kompetitor
8. Rencana Prioritas Rilis
9. Lampiran

---

## 1. PENDAHULUAN

### 1.1 Tujuan Dokumen
Dokumen ini mendefinisikan kebutuhan fungsional dan non-fungsional untuk pengembangan **Kinetic Performance**, sebuah platform SaaS coaching berbasis **Progressive Web App (PWA)** yang menghubungkan personal trainer dengan kliennya. Dokumen ini disusun agar seluruh fitur yang terbukti bernilai di 7 platform kompetitor (Trainerize, TrueCoach, Future, Freeletics, Fita, FIT HUB, AYO) tercakup dalam scope pengembangan, sekaligus mempertahankan tiga keunggulan unik yang sudah dimiliki prototype (Volume Overview otomatis, PAR-Q terstruktur, dan alur anti-double-booking).

### 1.2 Ruang Lingkup Produk
Kinetic Performance adalah platform **B2B2C SaaS coaching** yang melayani dua peran utama:
- **Trainer/Coach** — mengelola program latihan, klien, penjadwalan, dan bisnis coaching-nya.
- **Client** — menerima program, melacak progres, berkomunikasi dengan coach, dan melakukan pembayaran.

Produk dikembangkan sebagai **PWA** (bukan native app) namun harus memberikan pengalaman setara native: dapat di-install di homescreen, bekerja offline, dan menerima push notification.

**Di luar ruang lingkup (out of scope) versi 1.0:**
- Live video call coaching real-time (dicatat sebagai future enhancement, lihat 8.4).
- Model bisnis venue booking (fitur AYO tidak relevan karena model bisnis berbeda — bukan coaching).

### 1.3 Definisi, Akronim, dan Singkatan

| Istilah | Definisi |
|---|---|
| **PWA** | Progressive Web App — aplikasi web yang dapat diinstal dan berjalan seperti native app |
| **PAR-Q** | Physical Activity Readiness Questionnaire — kuesioner kesiapan aktivitas fisik |
| **TDEE** | Total Daily Energy Expenditure |
| **BMR** | Basal Metabolic Rate |
| **SW** | Service Worker |
| **FR** | Functional Requirement |
| **NFR** | Non-Functional Requirement |
| **MoSCoW** | Metode prioritas: Must have, Should have, Could have, Won't have |

### 1.4 Referensi
- *Analisis Aplikasi Personal Training.pdf* — hasil scraping 7 kompetitor.
- *Pemetaan Fitur Lintas Platform: Personal Training/Fitness Coaching* — dokumen perbandingan fitur (sumber utama SRS ini).
- Audit source code prototype internal Kinetic Performance (Elite Trainer).

### 1.5 Ikhtisar Dokumen
Bagian 2 menjelaskan gambaran umum sistem dan aktor. Bagian 3–4 merinci kebutuhan fungsional per modul dan non-fungsional. Bagian 5–6 membahas antarmuka eksternal dan kebutuhan teknis khusus PWA. Bagian 7 memetakan setiap fitur terhadap keberadaannya di kompetitor (traceability), dan Bagian 8 menyusun prioritas rilis.

---

## 2. DESKRIPSI UMUM SISTEM

### 2.1 Perspektif Produk
Kinetic Performance diposisikan sebagai **direct competitor** terhadap Trainerize dan TrueCoach (SaaS coaching untuk trainer solo/studio kecil), dengan fitur nutrisi, engagement, dan native-app-experience (via PWA) yang menyamai atau melampaui keduanya. Fitur dari Future.co (matching coach), Freeletics (AI coach), Fita.co.id (konten lokal & gamifikasi), FIT HUB (paket sesi & kelas), dan AYO (booking & komunitas) diadopsi secara selektif sebagai *value-add differentiator*.

### 2.2 Ikhtisar Fungsi Produk

| # | Modul | Fungsi Utama |
|---|---|---|
| 1 | Autentikasi & Akun | Registrasi, login, role management (Trainer/Client/Admin) |
| 2 | Program & Workout Building | Membuat, mengelola, dan menugaskan program latihan |
| 3 | Client Management & Onboarding | Onboarding klien, PAR-Q, roster, catatan |
| 4 | Progress Tracking | Metrik tubuh, foto progres, kepatuhan, habit |
| 5 | Nutrisi | Food diary, macro tracking, meal plan, kalkulator TDEE |
| 6 | Scheduling & Booking | Kalender sesi, validasi kehadiran, kuota sesi |
| 7 | Komunikasi & Engagement | Chat, video demo, community, gamifikasi |
| 8 | Bisnis & Pembayaran | Payment gateway, paket sesi, laporan penjualan |
| 9 | Multi-Trainer/Team | Manajemen studio dengan banyak coach |
| 10 | Integrasi & Wearable | Sinkronisasi data wearable, API pihak ketiga |
| 11 | Platform PWA | Instalasi, offline mode, push notification |

### 2.3 Karakteristik Pengguna / Aktor

| Aktor | Deskripsi | Kebutuhan Utama |
|---|---|---|
| **Trainer/Coach** | Pemilik bisnis coaching, mengelola banyak klien | Efisiensi manajemen klien & program, insight bisnis |
| **Client** | Penerima layanan coaching | Kemudahan akses program, tracking progres, komunikasi |
| **Admin/Studio Owner** | Mengelola tim trainer (untuk skala studio/gym) | Kontrol multi-coach, laporan agregat |
| **Sistem (AI Engine)** | Menghasilkan rekomendasi program otomatis | Data historis klien yang akurat |

### 2.4 Batasan Desain dan Implementasi
- Aplikasi wajib dibangun sebagai **PWA** — tidak ada rilis native iOS/Android terpisah pada versi 1.0.
- Backend wajib menggunakan database sungguhan (bukan localStorage) — lihat FR-AUTH dan NFR keamanan.
- Payment gateway wajib mendukung metode pembayaran populer Indonesia (QRIS, e-wallet, VA bank).
- Bahasa aplikasi minimal mendukung Bahasa Indonesia dan Inggris (multi-bahasa).

### 2.5 Asumsi dan Ketergantungan
- Pengguna mengakses aplikasi melalui browser modern yang mendukung Service Worker (Chrome, Safari, Edge, Firefox terbaru).
- Trainer memiliki koneksi internet stabil untuk fitur real-time (chat, live tracking); klien dapat bekerja secara offline-first untuk logging latihan di gym dengan sinyal lemah.
- Integrasi wearable bergantung pada ketersediaan API resmi pihak ketiga (Apple Health, Google Fit, dsb).

---

## 3. KEBUTUHAN FUNGSIONAL

> Setiap requirement diberi Prioritas MoSCoW: **M** (Must), **S** (Should), **C** (Could), **W** (Won't — versi ini). Kolom **Acuan** menunjukkan kompetitor yang menginspirasi/memiliki fitur tersebut, sebagai bukti bahwa kebutuhan ini menutup gap kompetitif.

### 3.1 Modul Autentikasi & Manajemen Akun (FR-AUTH)

| ID | Kebutuhan | Prioritas | Acuan |
|---|---|---|---|
| FR-AUTH-01 | Sistem harus menyediakan registrasi & login terpisah untuk role Trainer dan Client | M | Semua kompetitor |
| FR-AUTH-02 | Sistem harus mendukung reset password via email/OTP | M | Standar industri |
| FR-AUTH-03 | Sistem harus menyimpan sesi login menggunakan token aman (JWT/session) dengan backend database, menggantikan localStorage mock | M | Gap internal |
| FR-AUTH-04 | Sistem harus mendukung role-based access control (Trainer, Client, Admin/Studio Owner) | M | Trainerize |
| FR-AUTH-05 | Sistem harus menyediakan onboarding awal berbeda untuk Trainer (setup profil bisnis) dan Client (onboarding wizard) | S | Future.co |

### 3.2 Modul Program & Workout Building (FR-WKT)

| ID | Kebutuhan | Prioritas | Acuan |
|---|---|---|---|
| FR-WKT-01 | Sistem harus menyediakan **Manual Workout Builder** untuk menyusun sets/reps/weight/rest per exercise | M | Trainerize, TrueCoach, KP (existing) |
| FR-WKT-02 | Sistem harus menyediakan **AI Workout Builder/AI Coach** yang dapat menghasilkan program otomatis berdasarkan profil & histori klien | M | Trainerize, Freeletics |
| FR-WKT-03 | Sistem harus menyediakan **Exercise Library bawaan** minimal 300 exercise dengan video demonstrasi | M | Trainerize, TrueCoach, Freeletics |
| FR-WKT-04 | Sistem harus mengizinkan Trainer mengunggah/menautkan **video exercise custom/branded** per exercise | M | TrueCoach, KP (existing, tingkatkan) |
| FR-WKT-05 | Sistem harus mendukung **Reusable Program Template / Master Program** yang dapat digunakan ulang ke banyak klien | M | Trainerize, TrueCoach |
| FR-WKT-06 | Sistem harus mendukung **On-Demand/Self-paced Program** yang dapat diakses klien tanpa penugasan manual | S | Trainerize, Freeletics |
| FR-WKT-07 | Sistem harus menampilkan **Progressive Overload / Previous Lift Comparison** otomatis saat klien logging latihan baru | M | TrueCoach, KP (existing) |
| FR-WKT-08 | Sistem harus mempertahankan dan menyempurnakan **Volume/Load Auto-Calculation** (estimasi waktu & volume load otomatis) — *fitur diferensiasi unik* | M | Tidak ada di kompetitor — pertahankan |
| FR-WKT-09 | Sistem harus mendukung pembuatan **Custom Block: Superset/Circuit** dengan logic pengelompokan exercise yang lengkap | M | KP (existing, sempurnakan) |

### 3.3 Modul Client Management & Onboarding (FR-CLM)

| ID | Kebutuhan | Prioritas | Acuan |
|---|---|---|---|
| FR-CLM-01 | Sistem harus menyediakan **Client Roster/Dashboard** multi-klien dengan indikator status (compliance rate, due date) | M | Trainerize, TrueCoach, KP (existing) |
| FR-CLM-02 | Sistem harus menyediakan **Client Onboarding Wizard** bertahap (multi-step form) | M | Future.co, KP (existing) |
| FR-CLM-03 | Sistem harus mempertahankan dan menyempurnakan **Medical Questionnaire/PAR-Q** terstruktur minimal 7 pertanyaan — *keunggulan kompetitif utama* | M | Detail tertinggi vs semua kompetitor — pertahankan |
| FR-CLM-04 | Sistem harus menampilkan **Red Flag/Injury Warning** secara visual otomatis berdasarkan jawaban PAR-Q | M | KP (existing) — fitur unik |
| FR-CLM-05 | Sistem harus mendukung **Goal Tracking** per klien (target berat, kekuatan, dsb) | M | Trainerize, TrueCoach, Future |
| FR-CLM-06 | Sistem harus mendukung **Team/Multi-Trainer Management** untuk skala studio (multi-coach dalam satu akun bisnis) | S | Trainerize |
| FR-CLM-07 | Sistem harus menyediakan **Client Notes/Case File** yang dapat diedit trainer (termasuk catatan analisis postural) | M | TrueCoach, Future, KP (existing) |

### 3.4 Modul Progress Tracking (FR-PRT)

| ID | Kebutuhan | Prioritas | Acuan |
|---|---|---|---|
| FR-PRT-01 | Sistem harus mendukung **Body Metrics Tracking** (berat, lemak, otot, lingkar tubuh) | M | Trainerize, KP (existing) |
| FR-PRT-02 | Sistem harus mendukung upload dan galeri **Progress Photos** (before/after) | M | Trainerize, KP (existing) |
| FR-PRT-03 | Sistem harus menampilkan **grafik interaktif** (line chart) untuk tren metrik dan nutrisi | M | TrueCoach, KP (existing) |
| FR-PRT-04 | Sistem harus menyediakan **Compliance Rate Dashboard** (7/30/90 hari) untuk memantau kepatuhan klien | M | TrueCoach — gap prioritas tinggi |
| FR-PRT-05 | Sistem harus mendukung **Habit Tracking** (air minum, tidur, langkah, stres) | M | Trainerize, Freeletics, KP (existing) |
| FR-PRT-06 | Sistem harus mendukung **Client Check-in Terjadwal** otomatis untuk akuntabilitas | S | Future.co |

### 3.5 Modul Nutrisi (FR-NUT) — *Prioritas Tertinggi (Gap Terbesar)*

| ID | Kebutuhan | Prioritas | Acuan |
|---|---|---|---|
| FR-NUT-01 | Sistem harus menyediakan **Food/Meal Tracking (food diary)** untuk mencatat asupan harian klien | M | Trainerize, Fita |
| FR-NUT-02 | Sistem harus mendukung **Macro Tracking** (protein/karbohidrat/lemak) dengan target & grafik | M | Trainerize, TrueCoach |
| FR-NUT-03 | Sistem harus mengizinkan Trainer menyusun **Meal Plan** untuk klien | M | Trainerize, Fita |
| FR-NUT-04 | Sistem harus menyediakan **database resep** (minimal 50 resep di rilis awal, target 400+) lengkap dengan rincian nutrisi | S | Fita |
| FR-NUT-05 | Sistem harus melacak **Nutrition Compliance** (persentase kepatuhan target nutrisi) | M | Trainerize |
| FR-NUT-06 | Sistem harus menyediakan **Kalkulator BMR/TDEE/Kalori** yang dinamis berbasis data klien (bukan hardcoded) | M | Fita, FIT HUB, KP (existing — perbaiki) |

### 3.6 Modul Scheduling & Booking (FR-SCH)

| ID | Kebutuhan | Prioritas | Acuan |
|---|---|---|---|
| FR-SCH-01 | Sistem harus menyediakan **Calendar/Scheduling System** untuk penjadwalan sesi | M | Semua kompetitor, KP (existing) |
| FR-SCH-02 | Sistem harus mempertahankan dan menyempurnakan mekanisme **Anti-Double-Booking** — *keunggulan kompetitif* | M | KP (existing) — paling matang |
| FR-SCH-03 | Sistem harus mempertahankan **Session Attendance Validation** | M | KP (existing) — unik |
| FR-SCH-04 | Sistem harus mempertahankan **Auto-Deduct Kuota Sesi** saat sesi selesai — *fitur diferensiasi unik* | M | Tidak ditemukan di kompetitor — pertahankan |
| FR-SCH-05 | Sistem harus mengirim **Automated Reminders** (push notification/WA) H-1 dan H-1 jam sebelum sesi | M | Trainerize, Future, AYO — gap yang harus ditutup |
| FR-SCH-06 | Sistem harus mengizinkan klien melakukan **Reschedule/Cancel Sesi** sesuai kebijakan trainer | M | Trainerize, KP (existing) |

### 3.7 Modul Komunikasi & Engagement (FR-COM)

| ID | Kebutuhan | Prioritas | Acuan |
|---|---|---|---|
| FR-COM-01 | Sistem harus mendukung **In-App Messaging 1-on-1** real-time antara trainer dan klien | M | Trainerize, TrueCoach, Future, KP (existing) |
| FR-COM-02 | Sistem harus mendukung **Group Messaging** untuk trainer dengan banyak klien/kelas | S | Trainerize |
| FR-COM-03 | Sistem harus mendukung **Voice Messaging** dalam chat | C | Trainerize |
| FR-COM-04 | Sistem harus mendukung **Video Coaching Live** (opsional, dapat menggunakan integrasi pihak ketiga seperti WebRTC) | C | Trainerize |
| FR-COM-05 | Sistem harus mempertahankan **Video Coaching On-Demand** (video demo per-exercise) | M | Semua kompetitor kecuali FIT HUB/AYO, KP (existing) |
| FR-COM-06 | Sistem harus menyediakan **Community/Social Feature** (feed, forum, atau grup diskusi) | S | Freeletics, Fita, AYO |
| FR-COM-07 | Sistem harus mengimplementasikan **Gamifikasi** (badge, poin, level, streak) untuk mendorong retensi klien | M | Trainerize, Fita, FIT HUB — gap penting |

### 3.8 Modul Bisnis, Pembayaran & Paket (FR-BIZ)

| ID | Kebutuhan | Prioritas | Acuan |
|---|---|---|---|
| FR-BIZ-01 | Sistem harus mengintegrasikan **Payment Gateway sungguhan** (Midtrans/Xendit) mendukung QRIS, e-wallet, VA — menggantikan mock payment | M | TrueCoach (Stripe), Trainerize — gap kritis |
| FR-BIZ-02 | Sistem harus mempertahankan dan menyempurnakan **Packages/Session Bundle** (paket kuota sesi) | M | FIT HUB, KP (existing) |
| FR-BIZ-03 | Sistem harus mempertahankan **Sales/Revenue Report** dengan data harga riil (bukan formula mock) | M | KP (existing) — sempurnakan |
| FR-BIZ-04 | Sistem harus mendukung **Digital Membership/Subscription** berbasis periode (bulanan/tahunan) | M | Trainerize, Future, Freeletics, Fita, FIT HUB |
| FR-BIZ-05 | Sistem harus mendukung **Corporate/B2B Membership** untuk kerja sama dengan perusahaan | C | Fita x Telkomsel, AYO |
| FR-BIZ-06 | Sistem harus mendukung **Freeze/Pause Membership** untuk klien yang berhenti sementara | S | FIT HUB |

### 3.9 Modul Multi-Trainer/Team Management (FR-ADM)

| ID | Kebutuhan | Prioritas | Acuan |
|---|---|---|---|
| FR-ADM-01 | Sistem harus menyediakan dashboard Admin/Studio Owner untuk memantau performa seluruh trainer | S | Trainerize |
| FR-ADM-02 | Sistem harus mendukung distribusi klien antar trainer dalam satu studio | C | Trainerize |
| FR-ADM-03 | Sistem harus menyediakan laporan agregat pendapatan & okupansi lintas trainer | C | Trainerize |

### 3.10 Modul Wearable & Integrasi Eksternal (FR-INT)

| ID | Kebutuhan | Prioritas | Acuan |
|---|---|---|---|
| FR-INT-01 | Sistem harus mendukung **integrasi wearable** (Apple Health, Google Fit, Fitbit) untuk sinkronisasi heart rate & aktivitas | S | Trainerize, TrueCoach, Future |
| FR-INT-02 | Sistem harus menyediakan **API terbuka/webhook** untuk integrasi pihak ketiga (WhatsApp Business API, dsb) | S | Kebutuhan skalabilitas |
| FR-INT-03 | Sistem harus mendukung **multi-bahasa** minimal Indonesia dan Inggris dengan toggle bahasa | M | Freeletics (multi-bahasa), KP (existing — perbaiki artefak migrasi) |

---

## 4. KEBUTUHAN NON-FUNGSIONAL (NFR)

### 4.1 Performa
- NFR-01: Waktu muat halaman awal (First Contentful Paint) harus < 2.5 detik pada koneksi 4G.
- NFR-02: Sistem harus mampu menangani minimal 1.000 pengguna aktif bersamaan tanpa degradasi signifikan.
- NFR-03: Query dashboard (roster klien, laporan) harus merespons < 1 detik untuk data hingga 500 klien per trainer.

### 4.2 Keamanan
- NFR-04: Seluruh data medis (PAR-Q, catatan cedera) harus dienkripsi at-rest dan in-transit (TLS 1.2+).
- NFR-05: Sistem harus menerapkan role-based access control ketat agar klien tidak dapat mengakses data klien lain.
- NFR-06: Payment gateway harus mematuhi standar PCI-DSS (via provider bersertifikat, mis. Midtrans/Xendit).
- NFR-07: Sistem harus mencatat audit log untuk setiap perubahan data sensitif (medis & pembayaran).

### 4.3 Usability & Accessibility
- NFR-08: Antarmuka harus responsif di layar mobile (360px) hingga desktop (1920px).
- NFR-09: Aplikasi harus dapat dioperasikan dengan maksimal 3 tap untuk aksi utama (mis. logging workout).
- NFR-10: Kontras warna dan ukuran font harus memenuhi standar WCAG 2.1 AA minimum.

### 4.4 Reliability & Availability
- NFR-11: Target uptime sistem minimal 99,5% per bulan.
- NFR-12: Sistem harus memiliki mekanisme backup database harian otomatis.

### 4.5 Skalabilitas
- NFR-13: Arsitektur backend harus mendukung penambahan trainer/studio baru tanpa downtime (multi-tenant ready).

### 4.6 Maintainability & Extensibility
- NFR-14: Kode harus modular per domain (workout, nutrisi, scheduling, dsb) untuk memudahkan pengembangan fitur baru.
- NFR-15: Sistem harus menyediakan dokumentasi API internal untuk memudahkan integrasi modul AI Coach di masa depan.

### 4.7 Kepatuhan Regulasi
- NFR-16: Sistem harus mematuhi UU Perlindungan Data Pribadi (UU PDP) Indonesia, khususnya untuk data kesehatan (PAR-Q, metrik tubuh).
- NFR-17: Sistem harus menyediakan mekanisme consent eksplisit sebelum mengumpulkan data kesehatan klien.

### 4.8 Kebutuhan Khusus Progressive Web App
- NFR-18: Aplikasi harus lolos audit **Lighthouse PWA Score ≥ 90**.
- NFR-19: Aplikasi harus dapat diinstal ke homescreen (Add to Home Screen) di Android dan iOS.
- NFR-20: Aplikasi harus tetap dapat menampilkan data terakhir (cached) saat offline.

---

## 5. KEBUTUHAN ANTARMUKA EKSTERNAL

### 5.1 Antarmuka Pengguna
- Desain berbasis komponen (design system) yang konsisten antara portal Trainer dan portal Client.
- Mode gelap (dark mode) sebagai *should-have* untuk kenyamanan penggunaan malam hari.

### 5.2 Antarmuka Perangkat Keras
- Akses kamera perangkat untuk fitur upload progress photo dan video custom exercise.
- Akses sensor perangkat (jika tersedia) untuk integrasi wearable melalui Web Bluetooth API (opsional, *could-have*).

### 5.3 Antarmuka Perangkat Lunak (Pihak Ketiga)
| Integrasi | Fungsi | Prioritas |
|---|---|---|
| Midtrans/Xendit | Payment gateway | M |
| WhatsApp Business API | Automated reminders & notifikasi | M |
| Apple Health / Google Fit API | Sinkronisasi data wearable | S |
| YouTube/Cloud Storage (S3/Cloudinary) | Hosting video exercise | M |
| Firebase Cloud Messaging / Web Push API | Push notification PWA | M |

### 5.4 Antarmuka Komunikasi
- REST API atau GraphQL untuk komunikasi frontend–backend.
- WebSocket untuk fitur chat real-time.

---

## 6. ARSITEKTUR & KEBUTUHAN KHUSUS PWA

### 6.1 Web App Manifest
Sistem harus menyediakan `manifest.json` lengkap dengan nama aplikasi, ikon multi-resolusi (192px, 512px), warna tema, dan mode tampilan `standalone`.

### 6.2 Service Worker & Strategi Caching
- Strategi **Cache First** untuk aset statis (CSS, JS, ikon, exercise library dasar).
- Strategi **Network First with Cache Fallback** untuk data dinamis (roster klien, chat).
- Strategi **Stale While Revalidate** untuk konten yang sering berubah namun tidak kritikal (feed komunitas).

### 6.3 Offline-First & Background Sync
- Klien harus dapat mencatat log latihan (workout logging) secara offline saat berada di gym dengan sinyal lemah.
- Data yang dicatat offline harus otomatis tersinkronisasi ke server via **Background Sync API** saat koneksi kembali tersedia.

### 6.4 Push Notification
- Sistem harus mengirim push notification untuk: reminder sesi (FR-SCH-05), pesan chat baru (FR-COM-01), dan penc

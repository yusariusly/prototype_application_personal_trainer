# SOFTWARE DESIGN DOCUMENT (SDD)
# Kinetic Performance — Personal Training & Fitness Coaching Platform
## Progressive Web App (PWA)

| Metadata | Detail |
|---|---|
| **Nama Produk** | Kinetic Performance PWA |
| **Jenis Dokumen** | Software Design Document (SDD) |
| **Versi Dokumen** | 1.0 |
| **Tanggal** | 12 Agustus 2026 |
| **Status** | Draft untuk Pengembangan |
| **Turunan dari** | SRS Kinetic Performance PWA v1.0 |
| **Target Pembaca** | Backend Developer, Frontend Developer, UI/UX Designer, QA Engineer, DevOps Engineer, Product Owner |
| **Platform** | Progressive Web App |
| **Bahasa Aplikasi** | Bahasa Indonesia dan Inggris |
| **Model Bisnis** | B2B2C SaaS Coaching |

## DAFTAR ISI
---

1. Pendahuluan  
2. Tujuan dan Ruang Lingkup Desain  
3. Ringkasan Arsitektur Sistem  
4. Prinsip Desain Sistem  
5. Aktor dan Hak Akses  
6. Arsitektur Aplikasi  
7. Desain Modul Frontend  
8. Desain Modul Backend  
9. Desain Database  
10. Desain API  
11. Desain Autentikasi dan Otorisasi  
12. Desain Modul Program & Workout  
13. Desain Modul Client Management & Onboarding  
14. Desain Modul Progress Tracking  
15. Desain Modul Nutrisi  
16. Desain Modul Scheduling & Booking  
17. Desain Modul Komunikasi & Engagement  
18. Desain Modul Bisnis, Pembayaran & Paket  
19. Desain Modul Multi-Trainer/Studio  
20. Desain Modul Integrasi Eksternal  
21. Desain PWA, Offline Mode, dan Background Sync  
22. Desain Notifikasi  
23. Desain Keamanan dan Privasi Data  
24. Desain Logging, Audit Trail, dan Monitoring  
25. Desain Deployment dan Infrastruktur  
26. Desain Error Handling  
27. Desain Testing  
28. Traceability SRS ke Komponen Desain  
29. Risiko Teknis dan Mitigasi  
30. Lampiran

---

# 1. PENDAHULUAN

## 1.1 Tujuan Dokumen

Dokumen ini menjelaskan desain perangkat lunak untuk pengembangan **Kinetic Performance PWA**, sebuah platform SaaS coaching yang menghubungkan personal trainer, klien, dan admin/studio owner.

Dokumen ini digunakan sebagai acuan teknis selama proses pengembangan agar seluruh tim memiliki pemahaman yang sama mengenai:

- Arsitektur sistem.
- Struktur modul.
- Desain frontend dan backend.
- Desain database.
- Desain API.
- Integrasi pihak ketiga.
- Keamanan data.
- Mekanisme PWA dan offline-first.
- Deployment dan monitoring.
- Strategi testing.

Dokumen ini merupakan turunan dari dokumen SRS dan tidak menggantikan SRS. SRS menjelaskan **apa yang harus dibangun**, sedangkan SDD ini menjelaskan **bagaimana sistem akan dirancang dan diimplementasikan**.

---

## 1.2 Ruang Lingkup Desain

SDD ini mencakup desain untuk versi 1.0 Kinetic Performance PWA, meliputi:

- Autentikasi dan manajemen akun.
- Role-based access control.
- Portal trainer, client, dan admin/studio owner.
- Workout builder manual dan AI-assisted.
- Exercise library.
- Client onboarding dan PAR-Q.
- Progress tracking.
- Nutrition tracking.
- Scheduling dan booking.
- Anti-double-booking.
- Chat real-time.
- Payment gateway.
- Paket sesi dan membership.
- PWA installable.
- Offline workout logging.
- Push notification.
- Multi-language.
- Audit log dan keamanan data kesehatan.

---

## 1.3 Di Luar Ruang Lingkup Desain Versi 1.0

Fitur berikut tidak menjadi prioritas implementasi utama versi 1.0, tetapi desain sistem dibuat agar dapat diperluas di masa depan:

- Live video coaching penuh berbasis WebRTC.
- Native Android/iOS app.
- Venue booking seperti model bisnis AYO.
- AI Coach generatif penuh tanpa validasi trainer.
- Marketplace trainer publik berskala nasional.
- Wearable integration tingkat lanjut untuk semua vendor.

---

## 1.4 Referensi

- SRS Kinetic Performance PWA v1.0.
- IEEE 1016 Software Design Description.
- OWASP Application Security Verification Standard.
- WCAG 2.1 AA.
- UU Perlindungan Data Pribadi Indonesia.
- Dokumentasi Web App Manifest.
- Dokumentasi Service Worker.
- Dokumentasi Background Sync API.
- Dokumentasi Midtrans/Xendit.
- Dokumentasi Firebase Cloud Messaging/Web Push API.

---

# 2. TUJUAN DAN RUANG LINGKUP DESAIN

## 2.1 Tujuan Teknis

Desain sistem harus memenuhi tujuan berikut:

1. **Scalable**  
   Sistem harus mampu mendukung pertumbuhan jumlah trainer, klien, studio, dan transaksi.

2. **Secure**  
   Data kesehatan, pembayaran, dan percakapan pengguna harus dilindungi dengan standar keamanan yang kuat.

3. **Offline-capable**  
   Klien harus dapat mencatat workout saat offline dan melakukan sinkronisasi saat koneksi tersedia.

4. **Modular**  
   Setiap domain bisnis dipisahkan agar mudah dikembangkan dan diuji.

5. **Multi-tenant ready**  
   Sistem harus siap digunakan oleh trainer solo maupun studio dengan banyak trainer.

6. **Mobile-first**  
   Karena aplikasi digunakan di gym, pengalaman mobile harus menjadi prioritas.

7. **Extensible**  
   Sistem harus mudah diperluas untuk AI Coach, wearable, community, dan fitur enterprise.

---

## 2.2 Sasaran Kualitas

| Sasaran | Target |
|---|---|
| Performance | FCP < 2.5 detik pada 4G |
| Availability | 99,5% uptime per bulan |
| Security | TLS 1.2+, enkripsi data sensitif |
| Accessibility | WCAG 2.1 AA |
| PWA Score | Lighthouse PWA ≥ 90 |
| Offline Support | Workout logging dan cached data |
| Scalability | Minimal 1.000 concurrent active users |
| Maintainability | Modular domain-based architecture |

---

# 3. RINGKASAN ARSITEKTUR SISTEM

## 3.1 Model Arsitektur

Kinetic Performance menggunakan arsitektur **client-server modular monolith** pada fase awal, dengan desain domain yang dapat diekstraksi menjadi microservices di masa depan.

Pendekatan ini dipilih karena:

- Lebih cepat dikembangkan untuk MVP/versi 1.0.
- Lebih mudah di-debug dan di-deploy.
- Tetap bisa modular melalui pemisahan domain.
- Mengurangi kompleksitas awal dibanding microservices penuh.
- Cocok untuk SaaS tahap awal hingga menengah.

---

## 3.2 Komponen Utama Sistem

```text
+------------------------------------------------------+
|                    PWA Frontend                      |
|------------------------------------------------------|
| Trainer Portal | Client Portal | Admin Portal         |
| Offline Store  | Service Worker | Push Handler        |
+--------------------------|---------------------------+
                           |
                           | HTTPS / WebSocket
                           |
+--------------------------v---------------------------+
|                    Backend API                       |
|------------------------------------------------------|
| Auth Module        | Workout Module                  |
| Client Module      | Nutrition Module                |
| Scheduling Module  | Payment Module                  |
| Chat Module        | Notification Module             |
| Admin Module       | Integration Module              |
| Audit Module       | AI Recommendation Adapter       |
+--------------------------|---------------------------+
                           |
+--------------------------v---------------------------+
|                     Data Layer                       |
|------------------------------------------------------|
| PostgreSQL | Redis | Object Storage | Search Index    |
+--------------------------|---------------------------+
                           |
+--------------------------v---------------------------+
|                 External Services                    |
|------------------------------------------------------|
| Midtrans/Xendit | WhatsApp API | FCM/Web Push         |
| Cloudinary/S3   | Google Fit   | Apple Health         |
+------------------------------------------------------+
```

---

## 3.3 Pola Komunikasi

| Komunikasi | Protokol | Digunakan Untuk |
|---|---|---|
| Frontend ke Backend | HTTPS REST API | CRUD data utama |
| Frontend ke Backend | WebSocket | Chat real-time, live notification |
| Backend ke Payment Gateway | HTTPS Webhook/API | Payment request dan callback |
| Backend ke Push Service | HTTPS | Push notification |
| Backend ke WhatsApp API | HTTPS | Reminder sesi |
| PWA Offline ke Backend | Background Sync | Sinkronisasi log offline |

---

# 4. PRINSIP DESAIN SISTEM

## 4.1 Domain-Driven Modular Design

Sistem dibagi berdasarkan domain bisnis:

- Auth
- User/Profile
- Workout
- Exercise
- Client Management
- PAR-Q
- Progress Tracking
- Nutrition
- Scheduling
- Chat
- Payment
- Membership
- Notification
- Admin/Studio
- Integration
- Audit Log

Setiap domain memiliki:

- Controller/API layer.
- Service layer.
- Repository/data access layer.
- DTO/validation schema.
- Domain events.
- Unit tests.

---

## 4.2 Mobile-First and Offline-First

Karena pengguna utama klien akan sering menggunakan aplikasi di gym, sistem harus dirancang:

- Cepat dibuka di perangkat mobile.
- Tetap menampilkan program terakhir saat offline.
- Mengizinkan workout logging offline.
- Melakukan sync otomatis setelah online.
- Menangani konflik data dengan aman.

---

## 4.3 Security by Design

Semua desain fitur harus mempertimbangkan:

- Least privilege access.
- Role-based access control.
- Tenant isolation.
- Audit log untuk data sensitif.
- Enkripsi data medis.
- Validasi input di frontend dan backend.
- Proteksi dari OWASP Top 10.

---

## 4.4 Event-Driven Internal Workflow

Beberapa proses bisnis menggunakan event internal agar tidak saling bergantung langsung.

Contoh event:

- `ClientOnboarded`
- `ParqSubmitted`
- `WorkoutAssigned`
- `WorkoutLogged`
- `SessionBooked`
- `SessionCompleted`
- `PaymentPaid`
- `MembershipExpired`
- `ChatMessageSent`

Event ini dapat digunakan untuk:

- Membuat notifikasi.
- Mengupdate compliance rate.
- Mengurangi kuota sesi.
- Membuat audit log.
- Memicu reminder.

---

# 5. AKTOR DAN HAK AKSES

## 5.1 Daftar Aktor

| Aktor | Deskripsi |
|---|---|
| Client | Pengguna yang menerima program coaching |
| Trainer | Pengguna yang membuat program dan mengelola klien |
| Admin/Studio Owner | Pengguna yang mengelola trainer, klien, dan bisnis studio |
| System | Proses otomatis backend |
| AI Engine | Komponen rekomendasi program |
| Payment Provider | Layanan pembayaran eksternal |
| Notification Provider | Layanan push/WhatsApp/email |

---

## 5.2 Role-Based Access Matrix

| Fitur | Client | Trainer | Admin/Studio Owner |
|---|---:|---:|---:|
| Login/Register | Ya | Ya | Ya |
| Mengisi PAR-Q | Ya | Tidak | Tidak |
| Melihat PAR-Q klien | Terbatas milik sendiri | Ya, klien miliknya | Ya, dalam studio |
| Membuat workout | Tidak | Ya | Opsional |
| Mengakses assigned workout | Ya | Ya | Ya |
| Logging workout | Ya | Bisa atas nama klien | Tidak |
| Melihat progress | Ya, milik sendiri | Ya, klien miliknya | Ya, agregat |
| Membuat meal plan | Tidak | Ya | Tidak |
| Food diary | Ya | Bisa melihat | Bisa melihat agregat |
| Booking sesi | Ya | Ya | Ya |
| Validasi kehadiran | Terbatas | Ya | Ya |
| Chat | Ya | Ya | Monitoring terbatas |
| Payment | Ya | Melihat pembayaran | Melihat laporan |
| Mengelola trainer | Tidak | Tidak | Ya |
| Mengelola studio | Tidak | Tidak | Ya |
| Audit log | Tidak | Terbatas | Ya |

---

# 6. ARSITEKTUR APLIKASI

## 6.1 Teknologi Rekomendasi

Teknologi final dapat disesuaikan oleh tim, namun desain ini merekomendasikan stack berikut.

| Layer | Teknologi Rekomendasi |
|---|---|
| Frontend | React / Next.js atau Vue / Nuxt |
| Styling | Tailwind CSS + Design System |
| State Management | Zustand / Redux Toolkit / Pinia |
| Form Validation | Zod / Yup |
| PWA | Workbox, Service Worker, Web App Manifest |
| Backend | Node.js NestJS / Express modular |
| Database | PostgreSQL |
| Cache/Queue | Redis |
| Realtime | WebSocket / Socket.IO |
| Object Storage | S3-compatible / Cloudinary |
| Payment | Midtrans atau Xendit |
| Push Notification | Firebase Cloud Messaging / Web Push |
| Monitoring | Sentry, Prometheus, Grafana |
| CI/CD | GitHub Actions / GitLab CI |
| Containerization | Docker |

---

## 6.2 Lingkungan Sistem

| Environment | Tujuan |
|---|---|
| Local | Development individual |
| Development | Integrasi awal antar developer |
| Staging | QA, UAT, demo internal |
| Production | Pengguna nyata |

---

## 6.3 Struktur Aplikasi Frontend

```text
src/
├── app/
│   ├── auth/
│   ├── trainer/
│   ├── client/
│   ├── admin/
│   └── public/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── charts/
│   ├── forms/
│   └── domain/
├── modules/
│   ├── auth/
│   ├── workout/
│   ├── client-management/
│   ├── progress/
│   ├── nutrition/
│   ├── scheduling/
│   ├── chat/
│   ├── payment/
│   └── notification/
├── services/
│   ├── apiClient.ts
│   ├── websocketClient.ts
│   ├── offlineQueue.ts
│   └── syncManager.ts
├── stores/
├── hooks/
├── i18n/
├── pwa/
│   ├── service-worker.ts
│   ├── manifest.json
│   └── cacheStrategies.ts
└── utils/
```

---

## 6.4 Struktur Aplikasi Backend

```text
src/
├── main.ts
├── config/
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   ├── validators/
│   └── utils/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── studios/
│   ├── clients/
│   ├── parq/
│   ├── exercises/
│   ├── workouts/
│   ├── programs/
│   ├── progress/
│   ├── nutrition/
│   ├── scheduling/
│   ├── chat/
│   ├── payments/
│   ├── memberships/
│   ├── notifications/
│   ├── integrations/
│   ├── audit/
│   └── ai/
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── repositories/
└── workers/
    ├── reminder.worker.ts
    ├── payment-sync.worker.ts
    ├── notification.worker.ts
    └── offline-sync.worker.ts
```

---

# 7. DESAIN MODUL FRONTEND

## 7.1 Portal Trainer

Portal Trainer digunakan untuk mengelola bisnis coaching.

### Halaman Utama Trainer

| Halaman | Fungsi |
|---|---|
| Dashboard | Ringkasan klien, jadwal, compliance, revenue |
| Clients | Roster klien dan status |
| Client Detail | Profil, PAR-Q, progress, program, catatan |
| Program Builder | Membuat program/template |
| Exercise Library | Mengelola exercise bawaan/custom |
| Calendar | Jadwal sesi dan booking |
| Chat | Pesan 1-on-1 dan group |
| Nutrition | Meal plan dan monitoring food diary |
| Payments | Paket, membership, invoice, laporan |
| Settings | Profil bisnis, bahasa, integrasi |

---

## 7.2 Portal Client

Portal Client digunakan untuk menjalani program coaching.

### Halaman Utama Client

| Halaman | Fungsi |
|---|---|
| Home | Program hari ini, habit, reminder |
| Workout | Daftar workout dan logging |
| Nutrition | Food diary dan target makro |
| Progress | Body metrics, progress photo, grafik |
| Booking | Jadwal dan reschedule sesi |
| Chat | Komunikasi dengan trainer |
| Membership | Status paket/membership |
| Profile | Data pribadi, goal, PAR-Q |

---

## 7.3 Portal Admin/Studio Owner

Portal Admin digunakan oleh pemilik studio atau organisasi multi-trainer.

| Halaman | Fungsi |
|---|---|
| Studio Dashboard | Ringkasan performa studio |
| Trainers | Daftar dan performa trainer |
| Clients | Daftar klien lintas trainer |
| Revenue | Laporan pendapatan agregat |
| Occupancy | Tingkat penggunaan jadwal |
| Settings | Konfigurasi studio dan role |

---

## 7.4 Design System

### Komponen UI Wajib

- Button
- Input
- Select
- Textarea
- Checkbox
- Radio
- Date Picker
- Time Picker
- Calendar
- Modal
- Drawer
- Toast
- Card
- Badge
- Tabs
- Table
- Chart
- Avatar
- Progress Bar
- Skeleton Loader
- Empty State
- Error State
- Offline Banner
- Install PWA Prompt

---

## 7.5 Responsive Layout

| Breakpoint | Target |
|---|---|
| 360px - 480px | Mobile kecil |
| 481px - 768px | Mobile besar/tablet kecil |
| 769px - 1024px | Tablet |
| 1025px - 1440px | Desktop |
| > 1440px | Large desktop |

---

# 8. DESAIN MODUL BACKEND

## 8.1 Layer Backend

Setiap modul backend menggunakan struktur layer berikut:

```text
Controller
   ↓
DTO Validation
   ↓
Service
   ↓
Domain Logic
   ↓
Repository
   ↓
Database
```

---

## 8.2 Controller Layer

Controller bertanggung jawab untuk:

- Menerima request HTTP.
- Menjalankan guard autentikasi dan otorisasi.
- Memvalidasi DTO.
- Mengembalikan response standar.
- Tidak menyimpan logic bisnis kompleks.

---

## 8.3 Service Layer

Service bertanggung jawab untuk:

- Logic bisnis.
- Validasi state.
- Transaction handling.
- Emit domain event.
- Memanggil repository.
- Integrasi ke service eksternal.

---

## 8.4 Repository Layer

Repository bertanggung jawab untuk:

- Query database.
- Optimasi query.
- Pagination.
- Filtering.
- Sorting.
- Soft delete.
- Tenant isolation.

---

## 8.5 Worker dan Background Job

Worker digunakan untuk proses asynchronous:

| Worker | Tugas |
|---|---|
| Reminder Worker | Mengirim reminder H-1 dan H-1 jam |
| Payment Sync Worker | Mengecek status pembayaran |
| Notification Worker | Mengirim push/WA/email |
| Compliance Worker | Menghitung compliance harian |
| Membership Worker | Mengecek expiry dan freeze |
| Offline Sync Worker | Memproses sync dari queue |
| Audit Worker | Menyimpan audit log asinkron |

---

# 9. DESAIN DATABASE

## 9.1 Database Utama

Database utama menggunakan **PostgreSQL** karena mendukung:

- Relasi kompleks.
- Transaksi ACID.
- JSONB untuk field fleksibel.
- Indexing kuat.
- Row-level security jika dibutuhkan.
- Cocok untuk SaaS multi-tenant.

---

## 9.2 Prinsip Database

- Semua tabel memiliki `id` UUID.
- Semua tabel utama memiliki `created_at` dan `updated_at`.
- Data penting menggunakan soft delete dengan `deleted_at`.
- Semua data tenant-scoped memiliki `studio_id`.
- Semua data client-scoped memiliki `client_id`.
- Semua data sensitif harus dienkripsi di level aplikasi atau database.
- Index wajib dibuat untuk foreign key dan query dashboard.

---

## 9.3 Entitas Utama

### 9.3.1 users

Menyimpan akun login semua role.

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK | ID user |
| email | VARCHAR UNIQUE | Email login |
| phone | VARCHAR | Nomor telepon |
| password_hash | TEXT | Hash password |
| role | ENUM | CLIENT, TRAINER, ADMIN |
| status | ENUM | ACTIVE, INVITED, SUSPENDED |
| preferred_language | VARCHAR | id/en |
| last_login_at | TIMESTAMP | Login terakhir |
| created_at | TIMESTAMP | Tanggal dibuat |
| updated_at | TIMESTAMP | Tanggal update |

---

### 9.3.2 profiles

Menyimpan data profil umum.

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| user_id | UUID FK |
| full_name | VARCHAR |
| gender | ENUM |
| date_of_birth | DATE |
| avatar_url | TEXT |
| address | TEXT |
| timezone | VARCHAR |
| emergency_contact_name | VARCHAR |
| emergency_contact_phone | VARCHAR |

---

### 9.3.3 studios

Menyimpan data bisnis/studio.

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| owner_user_id | UUID FK |
| name | VARCHAR |
| slug | VARCHAR UNIQUE |
| description | TEXT |
| logo_url | TEXT |
| default_currency | VARCHAR |
| timezone | VARCHAR |
| status | ENUM |

---

### 9.3.4 trainer_profiles

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| user_id | UUID FK |
| studio_id | UUID FK nullable |
| bio | TEXT |
| certification | TEXT |
| specialization | TEXT[] |
| years_experience | INTEGER |
| business_name | VARCHAR |
| public_profile_enabled | BOOLEAN |

---

### 9.3.5 client_profiles

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| user_id | UUID FK |
| primary_trainer_id | UUID FK |
| studio_id | UUID FK nullable |
| height_cm | NUMERIC |
| starting_weight_kg | NUMERIC |
| goal_type | ENUM |
| goal_description | TEXT |
| onboarding_status | ENUM |
| risk_level | ENUM |

---

### 9.3.6 trainer_client_assignments

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| trainer_id | UUID FK |
| client_id | UUID FK |
| studio_id | UUID FK nullable |
| status | ENUM |
| assigned_at | TIMESTAMP |
| ended_at | TIMESTAMP nullable |

---

## 9.4 Entitas PAR-Q

### 9.4.1 parq_submissions

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| client_id | UUID FK |
| submitted_at | TIMESTAMP |
| reviewed_by_trainer_id | UUID FK nullable |
| reviewed_at | TIMESTAMP nullable |
| risk_level | ENUM LOW, MEDIUM, HIGH |
| red_flag_detected | BOOLEAN |
| trainer_notes | TEXT encrypted |
| consent_given | BOOLEAN |
| consent_at | TIMESTAMP |

---

### 9.4.2 parq_answers

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| submission_id | UUID FK |
| question_code | VARCHAR |
| question_text | TEXT |
| answer | BOOLEAN |
| detail | TEXT encrypted |
| is_red_flag | BOOLEAN |

---

## 9.5 Entitas Exercise dan Workout

### 9.5.1 exercises

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| owner_trainer_id | UUID FK nullable |
| studio_id | UUID FK nullable |
| name | VARCHAR |
| description | TEXT |
| muscle_group | VARCHAR[] |
| equipment | VARCHAR[] |
| difficulty | ENUM |
| video_url | TEXT |
| thumbnail_url | TEXT |
| is_builtin | BOOLEAN |
| is_active | BOOLEAN |

---

### 9.5.2 program_templates

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| trainer_id | UUID FK |
| studio_id | UUID FK nullable |
| title | VARCHAR |
| description | TEXT |
| goal_type | ENUM |
| difficulty | ENUM |
| duration_weeks | INTEGER |
| is_public_to_clients | BOOLEAN |
| created_at | TIMESTAMP |

---

### 9.5.3 workouts

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| program_template_id | UUID FK nullable |
| trainer_id | UUID FK |
| client_id | UUID FK nullable |
| title | VARCHAR |
| description | TEXT |
| scheduled_date | DATE nullable |
| estimated_duration_minutes | INTEGER |
| estimated_volume_load | NUMERIC |
| status | ENUM DRAFT, ASSIGNED, COMPLETED |

---

### 9.5.4 workout_blocks

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| workout_id | UUID FK |
| type | ENUM STRAIGHT_SET, SUPERSET, CIRCUIT |
| title | VARCHAR |
| order_index | INTEGER |
| rounds | INTEGER nullable |

---

### 9.5.5 workout_exercises

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| block_id | UUID FK |
| exercise_id | UUID FK |
| order_index | INTEGER |
| sets | INTEGER |
| reps | VARCHAR |
| target_weight | NUMERIC nullable |
| rest_seconds | INTEGER |
| tempo | VARCHAR nullable |
| notes | TEXT |

---

### 9.5.6 workout_logs

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| workout_id | UUID FK |
| client_id | UUID FK |
| started_at | TIMESTAMP |
| completed_at | TIMESTAMP nullable |
| perceived_exertion | INTEGER |
| client_notes | TEXT |
| sync_source | ENUM ONLINE, OFFLINE |
| sync_status | ENUM SYNCED, PENDING, CONFLICT |
| total_volume_load | NUMERIC |

---

### 9.5.7 workout_set_logs

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| workout_log_id | UUID FK |
| workout_exercise_id | UUID FK |
| set_number | INTEGER |
| actual_reps | INTEGER |
| actual_weight | NUMERIC |
| completed | BOOLEAN |
| notes | TEXT |

---

## 9.6 Entitas Progress Tracking

### 9.6.1 body_metrics

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| client_id | UUID FK |
| measured_at | TIMESTAMP |
| weight_kg | NUMERIC |
| body_fat_percentage | NUMERIC |
| muscle_mass_kg | NUMERIC |
| waist_cm | NUMERIC |
| chest_cm | NUMERIC |
| hip_cm | NUMERIC |
| arm_cm | NUMERIC |
| thigh_cm | NUMERIC |

---

### 9.6.2 progress_photos

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| client_id | UUID FK |
| photo_url | TEXT |
| angle | ENUM FRONT, SIDE, BACK |
| taken_at | TIMESTAMP |
| visibility | ENUM CLIENT_ONLY, TRAINER_VISIBLE |

---

### 9.6.3 habits

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| client_id | UUID FK |
| name | VARCHAR |
| target_value | NUMERIC |
| unit | VARCHAR |
| frequency | ENUM DAILY, WEEKLY |
| is_active | BOOLEAN |

---

### 9.6.4 habit_logs

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| habit_id | UUID FK |
| client_id | UUID FK |
| logged_date | DATE |
| value | NUMERIC |
| completed | BOOLEAN |

---

## 9.7 Entitas Nutrisi

### 9.7.1 nutrition_targets

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| client_id | UUID FK |
| calories | INTEGER |
| protein_g | INTEGER |
| carbs_g | INTEGER |
| fat_g | INTEGER |
| created_by_trainer_id | UUID FK |
| effective_from | DATE |
| effective_to | DATE nullable |

---

### 9.7.2 food_items

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| name | VARCHAR |
| brand | VARCHAR nullable |
| serving_size | NUMERIC |
| serving_unit | VARCHAR |
| calories | INTEGER |
| protein_g | NUMERIC |
| carbs_g | NUMERIC |
| fat_g | NUMERIC |
| source | ENUM SYSTEM, TRAINER, CLIENT |

---

### 9.7.3 food_logs

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| client_id | UUID FK |
| food_item_id | UUID FK nullable |
| meal_type | ENUM BREAKFAST, LUNCH, DINNER, SNACK |
| logged_at | TIMESTAMP |
| quantity | NUMERIC |
| calories | INTEGER |
| protein_g | NUMERIC |
| carbs_g | NUMERIC |
| fat_g | NUMERIC |
| photo_url | TEXT nullable |

---

### 9.7.4 meal_plans

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| trainer_id | UUID FK |
| client_id | UUID FK |
| title | VARCHAR |
| description | TEXT |
| start_date | DATE |
| end_date | DATE |
| status | ENUM DRAFT, ACTIVE, ARCHIVED |

---

### 9.7.5 recipes

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| title | VARCHAR |
| description | TEXT |
| ingredients | JSONB |
| steps | JSONB |
| calories | INTEGER |
| protein_g | NUMERIC |
| carbs_g | NUMERIC |
| fat_g | NUMERIC |
| image_url | TEXT |

---

## 9.8 Entitas Scheduling dan Booking

### 9.8.1 trainer_availability

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| trainer_id | UUID FK |
| day_of_week | INTEGER |
| start_time | TIME |
| end_time | TIME |
| is_active | BOOLEAN |

---

### 9.8.2 sessions

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| trainer_id | UUID FK |
| client_id | UUID FK |
| studio_id | UUID FK nullable |
| start_at | TIMESTAMP |
| end_at | TIMESTAMP |
| status | ENUM BOOKED, COMPLETED, CANCELLED, NO_SHOW, RESCHEDULED |
| attendance_validated | BOOLEAN |
| attendance_validated_at | TIMESTAMP nullable |
| package_id | UUID FK nullable |
| notes | TEXT |

---

### 9.8.3 session_packages

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| client_id | UUID FK |
| trainer_id | UUID FK |
| package_name | VARCHAR |
| total_sessions | INTEGER |
| remaining_sessions | INTEGER |
| expires_at | TIMESTAMP |
| status | ENUM ACTIVE, EXPIRED, USED_UP, FROZEN |

---

## 9.9 Entitas Chat

### 9.9.1 conversations

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| type | ENUM DIRECT, GROUP |
| studio_id | UUID FK nullable |
| title | VARCHAR nullable |
| created_by | UUID FK |
| created_at | TIMESTAMP |

---

### 9.9.2 conversation_members

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| conversation_id | UUID FK |
| user_id | UUID FK |
| role | ENUM MEMBER, ADMIN |
| joined_at | TIMESTAMP |

---

### 9.9.3 messages

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| conversation_id | UUID FK |
| sender_id | UUID FK |
| message_type | ENUM TEXT, IMAGE, VOICE, SYSTEM |
| content | TEXT |
| media_url | TEXT nullable |
| sent_at | TIMESTAMP |
| read_at | TIMESTAMP nullable |

---

## 9.10 Entitas Payment dan Membership

### 9.10.1 products

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| trainer_id | UUID FK nullable |
| studio_id | UUID FK nullable |
| name | VARCHAR |
| type | ENUM SESSION_PACKAGE, MEMBERSHIP, PROGRAM |
| price | NUMERIC |
| currency | VARCHAR |
| description | TEXT |
| is_active | BOOLEAN |

---

### 9.10.2 orders

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| client_id | UUID FK |
| trainer_id | UUID FK nullable |
| studio_id | UUID FK nullable |
| total_amount | NUMERIC |
| currency | VARCHAR |
| status | ENUM PENDING, PAID, FAILED, EXPIRED, REFUNDED |
| payment_provider | ENUM MIDTRANS, XENDIT |
| provider_reference | VARCHAR |
| created_at | TIMESTAMP |
| paid_at | TIMESTAMP nullable |

---

### 9.10.3 order_items

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| order_id | UUID FK |
| product_id | UUID FK |
| quantity | INTEGER |
| unit_price | NUMERIC |
| subtotal | NUMERIC |

---

### 9.10.4 memberships

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| client_id | UUID FK |
| product_id | UUID FK |
| status | ENUM ACTIVE, EXPIRED, FROZEN, CANCELLED |
| started_at | TIMESTAMP |
| expires_at | TIMESTAMP |
| frozen_at | TIMESTAMP nullable |
| resumed_at | TIMESTAMP nullable |

---

## 9.11 Entitas Notification

### 9.11.1 notification_devices

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| user_id | UUID FK |
| device_token | TEXT |
| platform | ENUM WEB, ANDROID_BROWSER, IOS_BROWSER |
| is_active | BOOLEAN |
| last_seen_at | TIMESTAMP |

---

### 9.11.2 notifications

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| user_id | UUID FK |
| type | VARCHAR |
| title | VARCHAR |
| body | TEXT |
| data | JSONB |
| read_at | TIMESTAMP nullable |
| sent_at | TIMESTAMP nullable |
| status | ENUM PENDING, SENT, FAILED |

---

## 9.12 Entitas Audit Log

### 9.12.1 audit_logs

| Field | Type | Keterangan |
|---|---|---|
| id | UUID PK |
| actor_user_id | UUID FK |
| action | VARCHAR |
| entity_type | VARCHAR |
| entity_id | UUID |
| old_value | JSONB encrypted nullable |
| new_value | JSONB encrypted nullable |
| ip_address | VARCHAR |
| user_agent | TEXT |
| created_at | TIMESTAMP |

---

# 10. DESAIN API

## 10.1 Standar API

API menggunakan pola REST dengan format JSON.

Base URL:

```text
https://api.kineticperformance.app/v1
```

Format response sukses:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

Format response error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "details": []
  }
}
```

---

## 10.2 HTTP Status Code

| Status | Penggunaan |
|---|---|
| 200 | Request sukses |
| 201 | Resource berhasil dibuat |
| 204 | Resource berhasil dihapus/tidak ada body |
| 400 | Input tidak valid |
| 401 | Belum login/token tidak valid |
| 403 | Tidak punya akses |
| 404 | Data tidak ditemukan |
| 409 | Konflik state/data |
| 422 | Business rule gagal |
| 429 | Terlalu banyak request |
| 500 | Error server |

---

## 10.3 Pagination

Endpoint list menggunakan query:

```text
?page=1&limit=20&sort=created_at:desc
```

Response meta:

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "total_pages": 6
  }
}
```

---

# 11. DESAIN AUTENTIKASI DAN OTORISASI

## 11.1 Mekanisme Login

Sistem menggunakan access token dan refresh token.

- Access token berlaku pendek, contoh 15 menit.
- Refresh token berlaku lebih panjang, contoh 7–30 hari.
- Refresh token disimpan secara aman menggunakan HTTP-only cookie jika memungkinkan.
- Password disimpan menggunakan algoritma hashing kuat seperti Argon2 atau bcrypt.

---

## 11.2 Endpoint Auth

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/auth/register/trainer` | Registrasi trainer |
| POST | `/auth/register/client` | Registrasi client |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh` | Refresh token |
| POST | `/auth/forgot-password` | Request reset password |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/me` | Ambil user aktif |

---

## 11.3 Otorisasi

Backend menerapkan guard:

- `AuthGuard`
- `RoleGuard`
- `TenantGuard`
- `TrainerClientAccessGuard`
- `SensitiveDataGuard`

Contoh rule:

- Trainer hanya bisa melihat klien yang terhubung dengannya.
- Admin hanya bisa melihat data dalam studio miliknya.
- Client hanya bisa melihat data miliknya sendiri.
- Data PAR-Q memerlukan akses khusus dan tercatat di audit log.

---

# 12. DESAIN MODUL PROGRAM & WORKOUT

## 12.1 Tujuan Modul

Modul ini memungkinkan trainer membuat program latihan, menyusun workout detail, menetapkan program ke klien, dan memungkinkan klien melakukan logging latihan.

---

## 12.2 Komponen Utama

| Komponen | Fungsi |
|---|---|
| Exercise Library | Daftar exercise bawaan dan custom |
| Workout Builder | Builder sets/reps/weight/rest |
| Program Template | Template reusable |
| Workout Assignment | Penugasan workout ke klien |
| Workout Logger | Logging hasil workout oleh client |
| Volume Calculator | Menghitung estimasi volume/load |
| Previous Lift Comparator | Membandingkan lift sebelumnya |
| AI Workout Adapter | Membantu generate draft program |

---

## 12.3 Alur Membuat Workout Manual

1. Trainer membuka halaman Program Builder.
2. Trainer memilih atau membuat program template.
3. Trainer membuat workout.
4. Trainer menambahkan block:
   - Straight Set
   - Superset
   - Circuit
5. Trainer menambahkan exercise.
6. Trainer menentukan:
   - Sets
   - Reps
   - Target weight
   - Rest
   - Tempo
   - Notes
7. Sistem menghitung:
   - Estimasi durasi.
   - Estimasi volume load.
8. Trainer menyimpan sebagai draft atau assign ke klien.

---

## 12.4 Perhitungan Volume Load

Untuk setiap set:

```text
volume_load = sets × reps × weight
```

Untuk reps berbentuk range, sistem menggunakan nilai tengah.

Contoh:

```text
reps = "8-12"
effective_reps = 10
```

Total workout volume:

```text
total_volume = sum(volume_load_per_exercise)
```

Jika weight kosong, sistem:

1. Menggunakan target weight jika tersedia.
2. Menggunakan previous logged weight jika tersedia.
3. Jika tidak ada, volume tidak dihitung untuk exercise tersebut.

---

## 12.5 Previous Lift Comparison

Saat client membuka workout logger:

1. Sistem mencari log terakhir untuk exercise yang sama.
2. Sistem menampilkan:
   - Berat terakhir.
   - Reps terakhir.
   - Total volume terakhir.
   - Indikator naik/turun.
3. Sistem memberi label:
   - `Higher than last session`
   - `Same as last session`
   - `Below last session`

---

## 12.6 AI Workout Builder

AI Workout Builder tidak langsung mem-publish program. Hasil AI harus berupa draft yang dapat direview trainer.

### Input AI

- Goal client.
- Level pengalaman.
- Injury/risk flag.
- Riwayat workout.
- Equipment tersedia.
- Jumlah hari latihan per minggu.
- Durasi sesi.
- Preferensi exercise.

### Output AI

- Program draft.
- Workout per hari.
- Exercise list.
- Sets/reps/rest.
- Catatan progresi.

### Guardrail

- Jika PAR-Q risk level HIGH, AI tidak boleh memberikan program intensitas tinggi.
- AI output harus ditandai sebagai `DRAFT`.
- Trainer harus melakukan review sebelum assign.

---

# 13. DESAIN MODUL CLIENT MANAGEMENT & ONBOARDING

## 13.1 Tujuan Modul

Modul ini menangani proses onboarding klien, penyimpanan profil, PAR-Q, goal, catatan trainer, dan pengelolaan roster klien.

---

## 13.2 Alur Onboarding Client

1. Client menerima invitation link atau mendaftar.
2. Client membuat akun.
3. Client mengisi profil dasar.
4. Client memilih goal.
5. Client mengisi data fisik.
6. Client memberikan consent pengumpulan data kesehatan.
7. Client mengisi PAR-Q.
8. Sistem menghitung risk level.
9. Sistem memberi tanda red flag bila ada.
10. Trainer menerima notifikasi untuk review.

---

## 13.3 PAR-Q Risk Scoring

Setiap pertanyaan PAR-Q memiliki bobot risiko.

| Jawaban | Efek |
|---|---|
| Semua “Tidak” | LOW |
| Ada “Ya” pada gejala ringan | MEDIUM |
| Ada “Ya” pada jantung, nyeri dada, pingsan, cedera serius | HIGH |

Jika risk level HIGH:

- Sistem menampilkan warning.
- Trainer harus review manual.
- Sistem menolak assignment program intensitas tinggi sampai review selesai.

---

## 13.4 Client Roster Dashboard

Roster menampilkan:

- Nama klien.
- Foto profil.
- Status onboarding.
- Compliance 7/30/90 hari.
- Risk level.
- Membership/session status.
- Workout due.
- Last check-in.
- Last message.

---

# 14. DESAIN MODUL PROGRESS TRACKING

## 14.1 Tujuan Modul

Modul ini melacak perkembangan klien melalui metrik tubuh, foto progres, habit, dan compliance.

---

## 14.2 Body Metrics Flow

1. Client membuka Progress.
2. Client menambahkan data metrik.
3. Sistem validasi input.
4. Sistem menyimpan data.
5. Grafik diperbarui.
6. Trainer dapat melihat tren di client detail.

---

## 14.3 Progress Photos

Ketentuan:

- Foto disimpan di object storage.
- URL disimpan di database.
- Foto bersifat private.
- Akses foto harus melalui signed URL atau protected media endpoint.
- Client dapat mengatur visibilitas foto.

---

## 14.4 Compliance Rate

Compliance dihitung dari aktivitas:

- Workout selesai.
- Food diary terisi.
- Habit terpenuhi.
- Check-in dikirim.

Contoh bobot awal:

| Aktivitas | Bobot |
|---|---:|
| Workout completion | 40% |
| Nutrition logging | 30% |
| Habit completion | 20% |
| Check-in | 10% |

Compliance harian:

```text
daily_compliance = weighted_completed_score / total_possible_score × 100
```

Dashboard menampilkan:

- 7 hari.
- 30 hari.
- 90 hari.

---

# 15. DESAIN MODUL NUTRISI

## 15.1 Tujuan Modul

Modul nutrisi memungkinkan client mencatat makanan, memantau kalori dan makro, serta menerima meal plan dari trainer.

---

## 15.2 Komponen Nutrisi

| Komponen | Fungsi |
|---|---|
| Food Diary | Logging makanan harian |
| Food Database | Data makanan |
| Macro Target | Target kalori dan makro |
| Meal Plan | Rencana makan dari trainer |
| Recipe Library | Resep dengan nutrisi |
| TDEE Calculator | Hitung kebutuhan kalori |

---

## 15.3 Kalkulator BMR/TDEE

Sistem menggunakan formula Mifflin-St Jeor.

Untuk pria:

```text
BMR = 10 × berat_kg + 6.25 × tinggi_cm - 5 × usia + 5
```

Untuk wanita:

```text
BMR = 10 × berat_kg + 6.25 × tinggi_cm - 5 × usia - 161
```

TDEE:

```text
TDEE = BMR × activity_factor
```

Activity factor:

| Aktivitas | Faktor |
|---|---:|
| Sedentary | 1.2 |
| Light | 1.375 |
| Moderate | 1.55 |
| Active | 1.725 |
| Very Active | 1.9 |

Goal adjustment:

| Goal | Adjustment |
|---|---:|
| Fat Loss | -10% sampai -20% |
| Maintenance | 0% |
| Muscle Gain | +5% sampai +15% |

---

## 15.4 Food Diary Flow

1. Client memilih tanggal.
2. Client memilih meal type.
3. Client mencari makanan.
4. Client memasukkan quantity.
5. Sistem menghitung kalori dan makro.
6. Sistem memperbarui progress harian.
7. Sistem menghitung nutrition compliance.

---

## 15.5 Nutrition Compliance

Nutrition compliance dihitung dari kedekatan asupan aktual terhadap target.

Rules awal:

- Kalori dalam ±10% target = memenuhi.
- Protein minimal 90% target = memenuhi.
- Karbo dan lemak dapat menggunakan toleransi ±15%.

---

# 16. DESAIN MODUL SCHEDULING & BOOKING

## 16.1 Tujuan Modul

Modul scheduling menangani jadwal sesi trainer-client, anti-double-booking, validasi kehadiran, reminder, dan pengurangan kuota sesi otomatis.

---

## 16.2 Alur Booking Sesi

1. Client membuka halaman booking.
2. Sistem menampilkan slot tersedia berdasarkan availability trainer.
3. Client memilih slot.
4. Sistem memvalidasi:
   - Trainer tersedia.
   - Tidak ada sesi bentrok.
   - Client memiliki paket/membership aktif.
   - Slot masih dalam kebijakan booking.
5. Sistem membuat sesi dengan status `BOOKED`.
6. Sistem menjadwalkan reminder.
7. Trainer dan client menerima notifikasi.

---

## 16.3 Anti-Double-Booking

Saat membuat atau mengubah sesi, sistem menjalankan query overlap.

Rule:

```text
existing.start_at < new.end_at AND existing.end_at > new.start_at
```

Jika kondisi benar untuk trainer yang sama dan status sesi masih aktif, sistem menolak booking.

Status yang dianggap aktif:

- BOOKED
- RESCHEDULED

Status yang tidak dianggap aktif:

- CANCELLED
- COMPLETED
- NO_SHOW

---

## 16.4 Attendance Validation

Validasi kehadiran dilakukan oleh trainer.

Flow:

1. Sesi memasuki waktu selesai.
2. Trainer membuka session detail.
3. Trainer menandai:
   - Hadir
   - Tidak hadir
   - Cancelled
4. Jika hadir, status menjadi `COMPLETED`.
5. Sistem menjalankan auto-deduct kuota sesi.
6. Audit log dibuat.

---

## 16.5 Auto-Deduct Kuota Sesi

Ketika sesi berstatus `COMPLETED`:

1. Sistem mencari session package aktif.
2. Sistem mengurangi `remaining_sessions` sebesar 1.
3. Jika sisa sesi menjadi 0, status package menjadi `USED_UP`.
4. Sistem mengirim notifikasi jika kuota hampir habis.

---

## 16.6 Reschedule dan Cancel Policy

Trainer dapat mengatur kebijakan:

- Minimal waktu reschedule, contoh 12 jam sebelum sesi.
- Minimal waktu cancel, contoh 24 jam sebelum sesi.
- Apakah cancel mengurangi kuota atau tidak.
- Maksimal reschedule per sesi.

---

# 17. DESAIN MODUL KOMUNIKASI & ENGAGEMENT

## 17.1 Chat Real-Time

Chat menggunakan WebSocket.

Fitur:

- Direct message client-trainer.
- Group message.
- Read receipt.
- Typing indicator.
- Attachment image.
- Voice message sebagai could-have.
- Push notification saat penerima offline.

---

## 17.2 Alur Pengiriman Pesan

1. User mengetik pesan.
2. Frontend mengirim pesan via WebSocket.
3. Backend validasi user adalah member conversation.
4. Backend menyimpan pesan.
5. Backend broadcast ke member online.
6. Backend membuat push notification untuk member offline.

---

## 17.3 Community Feature

Untuk versi awal, community dapat dibuat sebagai group feed sederhana.

Komponen:

- Post.
- Comment.
- Like.
- Group by trainer/studio.
- Moderasi oleh trainer/admin.

---

## 17.4 Gamifikasi

Gamifikasi digunakan untuk meningkatkan retensi client.

Elemen:

| Elemen | Contoh |
|---|---|
| Badge | 7-day streak, First Workout |
| Points | +10 workout selesai |
| Level | Level naik berdasarkan poin |
| Streak | Habit atau workout berturut-turut |
| Leaderboard | Opsional per group/studio |

---

# 18. DESAIN MODUL BISNIS, PEMBAYARAN & PAKET

## 18.1 Payment Gateway

Sistem menggunakan Midtrans atau Xendit sebagai payment provider.

Metode pembayaran wajib:

- QRIS.
- E-wallet.
- Virtual Account bank.
- Kartu jika tersedia.

---

## 18.2 Alur Pembayaran

1. Client memilih produk.
2. Sistem membuat order status `PENDING`.
3. Backend membuat payment request ke provider.
4. Provider mengembalikan payment URL/token.
5. Client melakukan pembayaran.
6. Provider mengirim webhook.
7. Backend memverifikasi signature webhook.
8. Jika valid dan paid:
   - Order menjadi `PAID`.
   - Membership/session package dibuat.
   - Notifikasi dikirim.
   - Audit log dibuat.

---

## 18.3 Webhook Security

Webhook harus:

- Memverifikasi signature.
- Mengecek idempotency.
- Menolak event duplikat.
- Tidak mempercayai data nominal tanpa validasi ke order internal.
- Mencatat semua payload penting.

---

## 18.4 Membership

Membership mendukung:

- Bulanan.
- Tahunan.
- Freeze/pause.
- Resume.
- Expiry otomatis.

---

## 18.5 Revenue Report

Laporan trainer/studio menampilkan:

- Gross revenue.
- Net revenue.
- Jumlah order.
- Produk terlaris.
- Client aktif.
- Membership aktif.
- Paket sesi terjual.

---

# 19. DESAIN MODUL MULTI-TRAINER/STUDIO

## 19.1 Tujuan Modul

Modul ini memungkinkan studio owner mengelola banyak trainer dalam satu akun bisnis.

---

## 19.2 Struktur Multi-Tenant

Setiap data studio-scoped memiliki `studio_id`.

Rule:

- Admin/studio owner hanya melihat data studio-nya.
- Trainer studio hanya melihat klien yang ditugaskan.
- Trainer solo memiliki `studio_id = null` atau studio personal.
- Client dapat memiliki primary trainer.

---

## 19.3 Distribusi Klien

Admin dapat:

- Assign client ke trainer.
- Transfer client ke trainer lain.
- Melihat riwayat assignment.
- Melihat workload trainer.

---

# 20. DESAIN MODUL INTEGRASI EKSTERNAL

## 20.1 Payment Provider

Adapter pattern digunakan agar sistem dapat berpindah provider.

```text
PaymentService
   ↓
PaymentProviderInterface
   ├── MidtransAdapter
   └── XenditAdapter
```

---

## 20.2 WhatsApp Business API

Digunakan untuk:

- Reminder sesi.
- Reminder pembayaran.
- Notifikasi paket hampir habis.

Fallback:

1. Push notification.
2. Email.
3. WhatsApp.

---

## 20.3 Object Storage

Digunakan untuk:

- Exercise video.
- Progress photo.
- Chat attachment.
- Recipe image.

File harus:

- Dibatasi ukuran.
- Dicek MIME type.
- Menggunakan signed URL untuk file private.
- Discan malware jika memungkinkan.

---

## 20.4 Wearable Integration

Versi 1.0 cukup menyediakan desain adapter.

Data wearable:

- Steps.
- Heart rate.
- Calories burned.
- Sleep.
- Workout activity.

---

# 21. DESAIN PWA, OFFLINE MODE, DAN BACKGROUND SYNC

## 21.1 Web App Manifest

Manifest wajib berisi:

```json
{
  "name": "Kinetic Performance",
  "short_name": "Kinetic",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#111827",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 21.2 Service Worker Strategy

| Resource | Strategy |
|---|---|
| Static assets | Cache First |
| App shell | Cache First |
| Workout assigned data | Network First with Cache Fallback |
| Chat | Network First |
| Community feed | Stale While Revalidate |
| Food database basic | Cache First |
| Uploaded media | Network Only atau Cache terbatas |

---

## 21.3 Offline Store

Frontend menggunakan IndexedDB untuk menyimpan:

- Assigned workout terakhir.
- Exercise library dasar.
- Pending workout logs.
- Pending habit logs.
- Pending food logs.
- Sync queue metadata.

---

## 21.4 Offline Workout Logging Flow

1. Client membuka workout.
2. Jika offline, data workout diambil dari IndexedDB.
3. Client mengisi set log.
4. Data disimpan ke local offline queue.
5. UI menampilkan status `Pending Sync`.
6. Saat online, Background Sync mengirim data ke API.
7. Backend menyimpan log.
8. Frontend menandai item sebagai `Synced`.

---

## 21.5 Conflict Resolution

Konflik dapat terjadi jika:

- Workout diubah trainer saat client offline.
- Client mengirim log untuk versi workout lama.
- Data sudah pernah tersinkron.

Strategi:

- Setiap workout memiliki `version`.
- Offline log menyimpan `workout_version`.
- Jika version tidak sama:
  - Backend menerima log sebagai historical log.
  - Sistem memberi flag `version_mismatch`.
  - Trainer dapat melihat warning.
- Idempotency key digunakan untuk mencegah duplikasi sync.

---

# 22. DESAIN NOTIFIKASI

## 22.1 Jenis Notifikasi

| Jenis | Channel |
|---|---|
| Reminder sesi H-1 | Push, WhatsApp |
| Reminder sesi H-1 jam | Push, WhatsApp |
| Chat baru | Push |
| Workout assigned | Push |
| Meal plan assigned | Push |
| Payment success | Push, Email |
| Membership expiring | Push, WhatsApp |
| Paket sesi hampir habis | Push, WhatsApp |
| PAR-Q red flag | Push ke trainer |
| Compliance rendah | Push ke trainer |

---

## 22.2 Notification Preference

User dapat mengatur:

- Push notification on/off.
- WhatsApp reminder on/off.
- Email notification on/off.
- Jenis notifikasi yang ingin diterima.

Namun notifikasi keamanan dan pembayaran kritikal tetap dapat dikirim sesuai kebutuhan legal/bisnis.

---

# 23. DESAIN KEAMANAN DAN PRIVASI DATA

## 23.1 Data Sensitif

Data yang dianggap sensitif:

- PAR-Q.
- Riwayat cedera.
- Catatan medis.
- Body metrics.
- Progress photo.
- Payment data.
- Chat pribadi.

---

## 23.2 Enkripsi

| Data | Perlindungan |
|---|---|
| Password | Hash Argon2/bcrypt |
| Data in transit | TLS 1.2+ |
| PAR-Q detail | Encrypted at rest |
| Medical notes | Encrypted at rest |
| Progress photo | Private storage + signed URL |
| Payment | Tokenized by provider |

---

## 23.3 Consent

Sebelum mengumpulkan data kesehatan:

1. Sistem menampilkan consent form.
2. Client harus mencentang persetujuan eksplisit.
3. Sistem menyimpan:
   - Timestamp.
   - IP address.
   - Versi consent.
4. Client dapat melihat riwayat consent.

---

## 23.4 Proteksi OWASP

Sistem harus melindungi dari:

- SQL Injection.
- XSS.
- CSRF.
- Broken Access Control.
- Insecure Direct Object Reference.
- Sensitive Data Exposure.
- Rate limit abuse.
- File upload abuse.
- Webhook spoofing.

---

## 23.5 Rate Limiting

| Endpoint | Limit Awal |
|---|---|
| Login | 5 percobaan / 15 menit |
| Forgot password | 3 request / jam |
| Chat send | 60 pesan / menit |
| File upload | 20 file / jam |
| Payment create | 10 order / jam |

---

# 24. DESAIN LOGGING, AUDIT TRAIL, DAN MONITORING

## 24.1 Application Logging

Log minimal mencakup:

- Request ID.
- User ID jika ada.
- Endpoint.
- Latency.
- Status code.
- Error stack untuk server error.
- Provider response untuk integrasi penting.

---

## 24.2 Audit Log

Audit log wajib dibuat untuk:

- Login gagal berulang.
- Perubahan password.
- Akses data PAR-Q.
- Update medical notes.
- Update payment status.
- Perubahan membership.
- Validasi kehadiran sesi.
- Auto-deduct session package.
- Transfer client antar trainer.

---

## 24.3 Monitoring

Metric yang dipantau:

- API latency.
- Error rate.
- Database CPU/memory.
- Queue backlog.
- Payment webhook failure.
- Push notification failure.
- WebSocket connection count.
- PWA offline sync failure.
- Storage usage.

---

# 25. DESAIN DEPLOYMENT DAN INFRASTRUKTUR

## 25.1 Infrastruktur Rekomendasi

```text
CDN
 |
Frontend Hosting
 |
API Gateway / Load Balancer
 |
Backend App Containers
 |
PostgreSQL Managed DB
 |
Redis
 |
Object Storage
 |
Queue Workers
```

---

## 25.2 Deployment Strategy

- CI/CD otomatis dari branch utama.
- Staging deployment sebelum production.
- Database migration dijalankan otomatis dengan approval.
- Rollback image container tersedia.
- Environment variable disimpan di secret manager.

---

## 25.3 Backup

Backup database:

- Harian otomatis.
- Retention minimal 14–30 hari.
- Point-in-time recovery jika tersedia.
- Backup restore diuji berkala.

---

# 26. DESAIN ERROR HANDLING

## 26.1 Error Code Standar

| Code | Keterangan |
|---|---|
| AUTH_INVALID_CREDENTIALS | Email/password salah |
| AUTH_TOKEN_EXPIRED | Token kedaluwarsa |
| ACCESS_DENIED | Tidak punya akses |
| VALIDATION_ERROR | Input tidak valid |
| RESOURCE_NOT_FOUND | Data tidak ditemukan |
| BOOKING_CONFLICT | Jadwal bentrok |
| PACKAGE_EMPTY | Kuota sesi habis |
| PAYMENT_FAILED | Pembayaran gagal |
| PAYMENT_WEBHOOK_INVALID | Webhook tidak valid |
| OFFLINE_SYNC_CONFLICT | Konflik sinkronisasi offline |
| PARQ_HIGH_RISK | PAR-Q high risk membutuhkan review |

---

## 26.2 UX Error State

Frontend harus menyediakan:

- Toast error ringkas.
- Inline validation.
- Retry button untuk network error.
- Offline banner.
- Empty state.
- Error boundary untuk crash UI.
- Fallback page jika API tidak tersedia.

---

# 27. DESAIN TESTING

## 27.1 Jenis Testing

| Jenis Test | Target |
|---|---|
| Unit Test | Service, utils, calculator |
| Integration Test | API + database |
| E2E Test | Flow user utama |
| Security Test | Auth, RBAC, file upload |
| Performance Test | Dashboard, booking, chat |
| PWA Test | Lighthouse, offline, install |
| Accessibility Test | WCAG 2.1 AA |
| Payment Test | Sandbox Midtrans/Xendit |
| Webhook Test | Signature dan idempotency |

---

## 27.2 E2E Scenario Wajib

### Scenario 1: Client Onboarding

1. Client register.
2. Client mengisi profil.
3. Client memberikan consent.
4. Client mengisi PAR-Q.
5. Sistem menghitung risk level.
6. Trainer melihat client di roster.

---

### Scenario 2: Trainer Membuat dan Assign Workout

1. Trainer login.
2. Trainer membuat program.
3. Trainer menambahkan workout.
4. Trainer menambahkan superset.
5. Sistem menghitung estimasi volume.
6. Trainer assign ke client.
7. Client menerima notifikasi.

---

### Scenario 3: Client Logging Workout Offline

1. Client membuka workout saat online.
2. Data tersimpan ke cache.
3. Client offline.
4. Client logging workout.
5. Data masuk pending sync.
6. Client online kembali.
7. Data tersinkron ke server.

---

### Scenario 4: Booking Anti-Double-Booking

1. Client memilih slot trainer.
2. Sistem membuat booking.
3. Client lain mencoba slot yang overlap.
4. Sistem menolak dengan `BOOKING_CONFLICT`.

---

### Scenario 5: Attendance dan Auto-Deduct

1. Trainer membuka sesi selesai.
2. Trainer validasi hadir.
3. Status sesi menjadi completed.
4. Kuota sesi client berkurang.
5. Audit log dibuat.

---

### Scenario 6: Payment Success

1. Client membeli paket.
2. Sistem membuat order.
3. Payment provider mengirim webhook paid.
4. Sistem validasi signature.
5. Order menjadi paid.
6. Session package dibuat.

---

### Scenario 7: PAR-Q High Risk

1. Client menjawab “Ya” pada pertanyaan red flag.
2. Sistem memberi risk level HIGH.
3. Trainer menerima alert.
4. Sistem mencegah assignment workout intensitas tinggi sampai review.

---

# 28. TRACEABILITY SRS KE KOMPONEN DESAIN

| SRS ID | Komponen Desain |
|---|---|
| FR-AUTH-01 sampai FR-AUTH-05 | Auth Module, User Module, RBAC |
| FR-WKT-01 sampai FR-WKT-09 | Workout Module, Exercise Module, AI Adapter |
| FR-CLM-01 sampai FR-CLM-07 | Client Module, PAR-Q Module, Notes Module |
| FR-PRT-01 sampai FR-PRT-06 | Progress Module, Habit Module, Compliance Worker |
| FR-NUT-01 sampai FR-NUT-06 | Nutrition Module, Food Diary, TDEE Calculator |
| FR-SCH-01 sampai FR-SCH-06 | Scheduling Module, Reminder Worker |
| FR-COM-01 sampai FR-COM-07 | Chat Module, Community Module, Gamification |
| FR-BIZ-01 sampai FR-BIZ-06 | Payment Module, Membership Module |
| FR-ADM-01 sampai FR-ADM-03 | Studio/Admin Module |
| FR-INT-01 sampai FR-INT-03 | Integration Module, i18n Module |
| NFR-01 sampai NFR-03 | Performance Design, Cache, Indexing |
| NFR-04 sampai NFR-07 | Security, Encryption, Audit Log |
| NFR-08 sampai NFR-10 | Design System, Accessibility |
| NFR-11 sampai NFR-13 | Infrastructure, Backup, Scalability |
| NFR-14 sampai NFR-15 | Modular Architecture, API Docs |
| NFR-16 sampai NFR-17 | Consent, Privacy, PDP Compliance |
| NFR-18 sampai NFR-20 | PWA, Service Worker, Offline Cache |

---

# 29. RISIKO TEKNIS DAN MITIGASI

## 29.1 Risiko PWA di iOS

| Risiko | Mitigasi |
|---|---|
| Push notification di iOS memiliki batasan | Gunakan Web Push modern, fallback WhatsApp/email |
| Background Sync tidak konsisten | Gunakan sync saat app dibuka kembali |
| Storage browser terbatas | Cache selektif dan cleanup berkala |

---

## 29.2 Risiko Offline Sync

| Risiko | Mitigasi |
|---|---|
| Data duplikat | Gunakan idempotency key |
| Workout version mismatch | Simpan workout version |
| Queue gagal terkirim | Retry exponential backoff |

---

## 29.3 Risiko Payment Webhook

| Risiko | Mitigasi |
|---|---|
| Webhook duplikat | Idempotency check |
| Webhook palsu | Signature verification |
| Provider downtime | Payment status polling worker |

---

## 29.4 Risiko Data Kesehatan

| Risiko | Mitigasi |
|---|---|
| Akses tidak sah | RBAC dan audit log |
| Kebocoran progress photo | Signed URL dan private storage |
| Pelanggaran consent | Consent eksplisit dan versioning |

---

# 30. LAMPIRAN

## 30.1 Status Enum Utama

### User Status

```text
ACTIVE
INVITED
SUSPENDED
DELETED
```

### Role

```text
CLIENT
TRAINER
ADMIN
```

### Session Status

```text
BOOKED
COMPLETED
CANCELLED
NO_SHOW
RESCHEDULED
```

### Payment Status

```text
PENDING
PAID
FAILED
EXPIRED
REFUNDED
```

### Membership Status

```text
ACTIVE
EXPIRED
FROZEN
CANCELLED
```

### Sync Status

```text
PENDING
SYNCED
FAILED
CONFLICT
```

### Risk Level

```text
LOW
MEDIUM
HIGH
```

---

## 30.2 Domain Event List

```text
UserRegistered
ClientInvited
ClientOnboarded
ParqSubmitted
ParqHighRiskDetected
WorkoutCreated
WorkoutAssigned
WorkoutLogged
ProgressMetricAdded
FoodLogged
MealPlanAssigned
SessionBooked
SessionRescheduled
SessionCancelled
SessionCompleted
SessionPackageDeducted
PaymentCreated
PaymentPaid
MembershipActivated
MembershipFrozen
MembershipExpired
ChatMessageSent
NotificationSent
OfflineSyncCompleted
OfflineSyncConflictDetected
```

---

## 30.3 Minimum Seed Data

Untuk development dan testing, sistem membutuhkan seed data:

- 1 admin/studio owner.
- 2 trainer.
- 5 client.
- 300 exercise bawaan.
- 50 food items.
- 50 recipes.
- 3 program templates.
- 5 dummy session packages.
- 10 sample sessions.
- 20 body metrics.
- 20 food logs.
- 20 workout logs.

---

## 30.4 Acceptance Design Criteria

Desain dianggap siap untuk implementasi jika:

- Semua modul SRS terpetakan ke komponen teknis.
- Database schema awal tersedia.
- API contract utama tersedia.
- Flow offline sync terdokumentasi.
- Flow payment webhook terdokumentasi.
- Flow anti-double-booking terdokumentasi.
- RBAC dan tenant isolation terdokumentasi.
- Testing scenario utama tersedia.
- Risiko teknis utama memiliki mitigasi.

---

# PENUTUP

Dokumen SDD ini menjadi acuan desain teknis untuk pengembangan Kinetic Performance PWA versi 1.0. Seluruh implementasi frontend, backend, database, integrasi, PWA, keamanan, testing, dan deployment harus mengacu pada struktur dan prinsip desain yang dijelaskan di dokumen ini.

Perubahan besar pada arsitektur, data model, atau integrasi pihak ketiga harus melalui proses review teknis dan dicatat sebagai revisi dokumen.
```

---
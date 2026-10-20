# Prospera — Growth & Sales Copilot

Platform internal untuk **CV Arba'in Jaya Mandiri** (jasa maklon herbal & kosmetik) yang membantu tim marketing dan sales mengelola akuisisi klien secara terukur.

Dibangun dengan **Next.js 16 (App Router)**, **Prisma**, dan **PostgreSQL**. Mode UI: **light only**.

## Modul (sesuai BRD)

| Modul | Fitur |
|---|---|
| **A — AI Lead Prospecting** | **Pencarian berbasis ICP** (segmen + daerah → sistem mencarikan, menilai, dan mengkualifikasikan kandidat), import CSV, CRUD prospek, deteksi duplikat, kategorisasi segmen, skor prioritas + alasan, status pipeline, catatan tindak lanjut |
| **B — WhatsApp AI Sales Assistant** | Simulasi percakapan, jawaban ter-*grounding* ke basis pengetahuan resmi, kualifikasi lead, ringkasan untuk sales, human handoff, penjadwalan konsultasi |
| **C — AI Marketing & GEO Content** | Generate draft per segmen, rekomendasi SEO/GEO + skor, validasi klaim, alur review (Draft → Review → Approved → Published) |
| **D — Unified Growth Dashboard** | Funnel prospek & lead, qualified lead rate, lead→meeting, meeting attendance, median respons AI, metrik konten |
| **E — Relationship Path Finder** | Context graph relasi (tim, klien lama, mitra, komunitas), pencarian jalur perkenalan hangat deterministik ke prospek, skor jalur + alasan, warm-intro bonus pada prioritas prospek |

## Prinsip yang diterapkan dari BRD

- **Logika deterministik** (bukan AI) untuk deduplikasi, skoring, kualifikasi, transisi status, dan KPI (§15).
- **Grounding** (NFR-05): AI hanya menjawab dari basis pengetahuan yang disetujui; pertanyaan harga/MOQ/timeline/di luar basis → *fallback* + handoff (BR#4, BR#6).
- **Guardrail klaim** (NFR-08): klaim kesehatan/kosmetik berisiko dideteksi; konten tidak bisa terbit sebelum klaim divalidasi.
- **Transparansi**: skor adalah rekomendasi prioritisasi, bukan bukti niat beli; data tidak lengkap ditandai, bukan direkayasa (BR#2, BR#3).
- **Audit** (BR#10): aktivitas penting dicatat di `ActivityLog`.
- Integrasi WhatsApp berjalan dalam **mode simulasi berlabel** karena akses kanal resmi di luar scope awal.

## Menjalankan secara lokal

Prasyarat: Node.js 18+, PostgreSQL berjalan.

```bash
# 1. Dependencies
npm install

# 2. Konfigurasi database — salin dan sesuaikan
cp .env.example .env
#   edit DATABASE_URL sesuai koneksi PostgreSQL Anda

# 3. Buat skema + data awal
npm run db:migrate      # jalankan migrasi
npm run db:seed         # isi user, FAQ, prospek & konten contoh

# 4. Development
npm run dev             # http://localhost:3000
```

Script lain:

```bash
npm run build        # production build
npm run db:studio    # Prisma Studio (inspeksi data)
```

## Uji cepat

- **Temukan dari ICP**: buka `/prospects` → "🔍 Temukan dari ICP" → pilih segmen + daerah (mis. Klinik Kecantikan @ Bandung) → sistem menampilkan kandidat ter-skor & terkualifikasi (berlabel SIMULASI) → centang & "Simpan ke Pipeline".
- **Import CSV**: buka `/prospects` → "Impor CSV" → unggah `public/sample-prospects.csv`. Baris "Glow Aesthetic Clinic" sengaja duplikat untuk menguji dedup.
- **Assistant**: `/assistant` → mulai percakapan → tanya *"Apa itu jasa maklon?"* (dijawab dari FAQ) lalu *"Berapa harganya?"* (otomatis fallback + handoff).
- **Konten**: `/content` → generate draft → perhatikan skor GEO & status validasi klaim.
- **Jaringan Relasi**: `/network` → lihat jalur perkenalan ke prospek (mis. *Budi → Hendra → dr. Lina*). Tambah kontak + relasi, lalu buka detail prospek untuk melihat panel Warm Intro dan skor prioritas yang naik.

## Struktur

```
app/            # routes (dashboard, prospects, assistant, content, meetings, knowledge)
  actions.ts    # semua Server Actions (mutasi)
components/     # Sidebar + UI primitives
lib/            # prisma, prospecting, assistant, content, metrics, csv, labels
prisma/         # schema.prisma, migrations, seed.ts
```

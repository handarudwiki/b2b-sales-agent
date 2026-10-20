# BUSINESS REQUIREMENTS DOCUMENT (BRD)
## AI B2B Growth & Sales Copilot
**Mitra:** CV Arba'in Jaya Mandiri  
**Versi:** 1.0 — Draft untuk Validasi Mitra  
**Status:** Proposed Solution  
**Kategori:** AI-Powered B2B Marketing, Lead Generation, dan Sales Enablement

---

## 1. Executive Summary

CV Arba'in Jaya Mandiri menyediakan jasa maklon herbal dan kosmetik yang membantu pemilik bisnis mengembangkan produk, mulai dari diskusi kebutuhan, formulasi, pembuatan sampel, pengurusan legalitas, produksi, hingga produk siap dipasarkan.

Namun, proses pertumbuhan bisnis berpotensi terkendala oleh keterbatasan sumber daya tim marketing dan sales, pencarian calon klien yang belum terstruktur, respons terhadap pertanyaan berulang, serta persaingan mendapatkan perhatian calon pelanggan melalui kanal digital.

AI B2B Growth & Sales Copilot diusulkan sebagai platform untuk membantu perusahaan mengelola proses akuisisi klien secara lebih terukur. Platform ini memiliki tiga kapabilitas utama:

1. **AI Lead Prospecting:** mengidentifikasi dan memprioritaskan calon klien yang berpotensi membutuhkan jasa maklon.
2. **WhatsApp AI Sales Assistant:** memberikan informasi awal, mengidentifikasi kebutuhan calon klien, melakukan kualifikasi prospek, dan mengarahkan prospek potensial ke konsultasi bersama tim sales.
3. **AI Marketing & GEO Content:** membantu menghasilkan konten pemasaran yang relevan dan terstruktur untuk meningkatkan peluang ditemukan melalui mesin pencari serta platform pencarian berbasis AI.

Ketiga kapabilitas tersebut merupakan ruang lingkup visi produk. Implementasi awal akan dipilih setelah validasi dengan mitra, berdasarkan masalah yang paling mendesak, ketersediaan data, kemudahan integrasi, dan potensi dampak bisnis.

**Prinsip utama:** AI membantu tim sales bekerja lebih efektif, bukan menggantikan proses konsultasi, negosiasi, dan pengambilan keputusan bisnis yang tetap membutuhkan manusia.

## 2. Business Background

### 2.1 Profil Bisnis

CV Arba'in Jaya Mandiri menyediakan layanan maklon herbal dan kosmetik bagi pihak yang ingin memiliki produk dengan merek sendiri.

Target pelanggan potensial meliputi:

- Pemilik brand baru atau startup.
- UMKM yang ingin mengembangkan produk.
- Klinik kecantikan.
- Toko herbal.
- Influencer dan personal brand.
- Perusahaan yang ingin meluncurkan produk private label.

### 2.2 Proses Bisnis Jasa Maklon

| Tahap | Aktivitas | Peran AI yang Diusulkan |
|---|---|---|
| 1. Diskusi kebutuhan | Memahami ide, konsep, target pasar, dan jenis produk | Mengumpulkan informasi awal dan merangkum kebutuhan |
| 2. Formulasi | R&D mengembangkan formula sesuai konsep | Memberikan informasi umum tentang proses, tanpa menggantikan keputusan R&D |
| 3. Pembuatan sampel | Sampel dibuat dan dievaluasi | Menjelaskan tahapan dan membantu mencatat pertanyaan calon klien |
| 4. Legalitas | Proses dokumen dan legalitas yang diperlukan | Memberikan informasi berdasarkan panduan resmi perusahaan |
| 5. Produksi | Produksi dilakukan setelah persyaratan terkait terpenuhi | Menjelaskan tahapan produksi dan mengarahkan pertanyaan teknis kepada tim terkait |
| 6. Pengiriman | Produk siap dikirim kepada pemilik brand | Menjelaskan alur akhir sesuai informasi resmi perusahaan |

AI berperan terutama pada **tahap sebelum dan menuju diskusi kebutuhan**, ketika calon klien masih mengeksplorasi ide, mencari informasi, dan mempertimbangkan apakah jasa maklon sesuai dengan kebutuhannya.

AI tidak menjanjikan bahwa formula, sampel, legalitas, biaya, atau produksi pasti dapat diselesaikan sebelum tim terkait melakukan evaluasi.

## 3. Problem Statement

### 3.1 Permasalahan Bisnis

**P1 — Prospect discovery belum optimal**

Tim membutuhkan cara yang lebih efisien untuk mengidentifikasi calon klien potensial di antara banyak brand, UMKM, klinik, influencer, dan perusahaan.

**P2 — Keterbatasan kapasitas tim sales**

Pertanyaan awal calon klien dapat mencakup jenis produk, proses maklon, formulasi, sampel, legalitas, dan produksi. Menangani pertanyaan berulang secara manual dapat mengurangi waktu yang tersedia untuk konsultasi dengan prospek potensial.

**P3 — Kualitas lead belum terukur secara konsisten**

Tanpa kriteria kualifikasi yang jelas, tim dapat menghabiskan waktu pada calon klien yang belum memiliki kebutuhan, kesiapan, atau kecocokan dengan layanan perusahaan.

**P4 — Aktivitas marketing digital sulit diukur sampai ke peluang bisnis**

Konten pemasaran dapat diproduksi tanpa alur pengukuran yang menghubungkan konten, pertanyaan masuk, prospek berkualitas, dan meeting yang berhasil dijadwalkan.

### 3.2 Hipotesis yang Harus Divalidasi

Permasalahan di atas merupakan hipotesis awal berdasarkan konteks bisnis, bukan temuan audit internal. Pada tahap discovery, tim perlu memastikan:

- Aktivitas mana yang paling banyak menyita waktu karyawan.
- Dari mana sebagian besar klien saat ini berasal.
- Berapa jumlah pertanyaan dan lead yang masuk per minggu atau bulan.
- Seberapa sering lead berlanjut menjadi konsultasi.
- Apakah data prospek, katalog layanan, FAQ, dan riwayat penjualan sudah tersedia.
- Apakah hambatan terbesar saat ini berada pada jumlah prospek, kecepatan respons, kualitas lead, atau konversi meeting.

## 4. Business Objectives

| ID | Tujuan | Indikator keberhasilan |
|---|---|---|
| BO-01 | Mengurangi waktu pencarian calon klien | Waktu riset per lead yang memenuhi kriteria |
| BO-02 | Mempercepat respons terhadap pertanyaan awal | Median waktu respons dan persentase respons sesuai SLA |
| BO-03 | Meningkatkan kualitas prospek yang diteruskan ke sales | Persentase lead berkualitas dari seluruh lead yang dikualifikasi |
| BO-04 | Mengurangi beban administratif sales | Waktu administrasi dan pencatatan per lead |
| BO-05 | Meningkatkan jumlah konsultasi yang relevan | Jumlah meeting yang dijadwalkan dan benar-benar terlaksana |
| BO-06 | Memperkuat akuisisi organik | Konten terbit, impresi, kunjungan relevan, dan lead yang berasal dari konten |

## 5. Target Users

### 5.1 Marketing Team

Membutuhkan bantuan untuk menemukan calon pelanggan, merancang kampanye, membuat konten, dan memantau performa kanal pemasaran.

### 5.2 B2B Sales Team

Membutuhkan informasi prospek yang terorganisasi, ringkasan kebutuhan calon klien, respons awal yang cepat, dan jadwal konsultasi yang relevan.

### 5.3 Management

Membutuhkan visibilitas terhadap funnel akuisisi, produktivitas tim, sumber lead, dan peluang bisnis.

### 5.4 Prospective Clients

Calon pemilik brand yang membutuhkan informasi awal tentang jasa maklon, ingin memahami alur kerja, dan ingin berkonsultasi sebelum membuat keputusan.

---

## 6. Proposed Solution Overview

Platform terdiri dari tiga modul utama dengan satu dashboard terintegrasi.

### Modul A — AI Lead Prospecting

Tujuan: membantu tim marketing dan sales menemukan serta memprioritaskan calon klien potensial.

**Alur kerja:**

1. Tim menentukan target prospek, misalnya brand kosmetik baru, klinik kecantikan, toko herbal, atau influencer.
2. Sistem mencari atau mengimpor data prospek dari sumber yang tersedia dan diizinkan.
3. Sistem membersihkan data, menghapus duplikasi, dan menormalisasi informasi perusahaan.
4. AI membantu mengategorikan prospek berdasarkan segmen, relevansi, dan sinyal kebutuhan yang dapat diverifikasi.
5. Sistem menghasilkan skor prioritas dan alasan mengapa prospek layak ditinjau.
6. Tim marketing atau sales memeriksa hasil, memperbaiki informasi yang salah, lalu menentukan tindakan berikutnya.
7. Hasil kontak dan perkembangan prospek dicatat pada dashboard.

**Informasi yang ditampilkan per prospek:**

- Nama brand atau perusahaan.
- Segmen bisnis.
- Website atau profil bisnis publik, jika tersedia.
- Lokasi dan kanal kontak bisnis yang relevan, jika tersedia secara sah.
- Indikasi kecocokan dengan layanan maklon.
- Sumber informasi dan tanggal terakhir diverifikasi.
- Skor prioritas dan alasan penilaian.
- Status: New, Reviewed, Contacted, Interested, Qualified, Meeting Scheduled, Not a Fit.

**Prinsip penting:** skor AI merupakan rekomendasi untuk membantu prioritisasi, bukan bukti bahwa suatu perusahaan pasti membutuhkan jasa maklon.

Modul ini berfokus pada prospecting dan penyusunan prioritas. Pengiriman cold outreach otomatis bukan bagian dari MVP awal.

**Pencarian berbasis ICP (ICP-driven discovery):**

Alih-alih memasukkan prospek satu per satu, tim cukup mendefinisikan *Ideal Customer Profile* lalu sistem mencarikan kandidat dan mengkualifikasikannya:

1. Tim menentukan ICP: **segmen** (mis. klinik kecantikan), **daerah/kota** target, kata kunci, dan **ambang skor** kualifikasi.
2. Sistem mencari kandidat prospek dari sumber yang tersedia dan diizinkan.
3. Sistem membersihkan data, melakukan deduplikasi terhadap pipeline yang ada, lalu menilai dan mengkualifikasikan tiap kandidat terhadap ICP secara deterministik.
4. Tim meninjau daftar hasil (skor, alasan, status kualifikasi) dan memilih kandidat untuk disimpan ke pipeline.
5. Setiap run pencarian dan hasilnya dicatat untuk audit.

**Sumber data (provider-agnostic):** modul dirancang agar dapat dicolokkan ke penyedia data resmi (mis. Google Places, Apollo) melalui satu antarmuka sumber. Selama akses provider belum tersedia, digunakan **mode simulasi yang diberi label jelas** — mengikuti pendekatan "kanal WhatsApp simulasi". Hasil simulasi tidak boleh diklaim sebagai data nyata, dan setiap prospek disimpan dengan sumber serta tanggal verifikasi (BR#2, BR#3).

### Modul B — WhatsApp AI Sales Assistant

Tujuan: menjawab pertanyaan awal calon klien, mengidentifikasi kebutuhan, dan membantu mengarahkan prospek yang sesuai ke meeting bersama tim sales.

**Alur kerja:**

1. Calon klien menghubungi kanal WhatsApp resmi perusahaan.
2. AI memberikan salam dan mengidentifikasi kebutuhan utama calon klien.
3. AI menjawab pertanyaan menggunakan basis pengetahuan yang telah disetujui perusahaan.
4. AI menanyakan informasi relevan, misalnya jenis produk, target pasar, tahap bisnis, dan gambaran kebutuhan pengembangan.
5. Sistem mengklasifikasikan prospek berdasarkan kriteria kualifikasi yang disepakati bersama mitra.
6. Jika prospek memenuhi kriteria, AI menawarkan jadwal konsultasi atau meneruskan percakapan kepada sales.
7. Sistem membuat ringkasan kebutuhan agar sales tidak perlu mengulang semua pertanyaan dasar.
8. Hasil konsultasi dan tindak lanjut dicatat pada dashboard.

**Contoh informasi yang dapat dijawab:**

- Apa itu jasa maklon herbal dan kosmetik?
- Bagaimana tahapan maklon dari diskusi hingga produksi?
- Apakah perusahaan melayani brand baru?
- Informasi apa yang perlu disiapkan sebelum konsultasi?
- Bagaimana proses formulasi dan pembuatan sampel?
- Bagaimana proses pengurusan legalitas?
- Bagaimana cara menghubungi tim untuk konsultasi?

**Batasan AI Sales Assistant:**

- Tidak menyetujui harga khusus atau memberikan penawaran final tanpa otorisasi.
- Tidak menjanjikan hasil formulasi, kelulusan legalitas, waktu produksi, atau hasil penjualan.
- Tidak memberikan klaim kesehatan atau kosmetik yang tidak disetujui perusahaan.
- Tidak membuat keputusan final mengenai kelayakan teknis produk.
- Mengalihkan pertanyaan yang tidak diketahui, sensitif, atau membutuhkan keputusan manusia kepada staf terkait.
- Menyampaikan dengan jelas ketika informasi belum tersedia.

**Hasil akhir yang diharapkan:** prospek yang lebih siap dan terinformasi memasuki sesi konsultasi bersama tim sales. AI tidak ditargetkan untuk menutup kontrak maklon secara mandiri.

### Modul C — AI Marketing & GEO Content

Tujuan: membantu perusahaan menyusun konten yang informatif, relevan bagi target pasar, dan mudah dipahami mesin pencari konvensional maupun sistem pencarian berbasis AI.

**Alur kerja:**

1. Marketing memilih segmen audiens dan tujuan kampanye.
2. Sistem menyusun ide konten berdasarkan layanan, pertanyaan umum, dan kebutuhan audiens.
3. AI membuat draft konten untuk ditinjau.
4. Sistem memberikan rekomendasi SEO/GEO, seperti struktur heading, pertanyaan-jawaban yang jelas, konsistensi informasi bisnis, dan metadata yang relevan.
5. Marketing meninjau klaim, fakta, bahasa, dan kesesuaian merek.
6. Konten yang disetujui diterbitkan melalui kanal yang digunakan perusahaan.
7. Performa konten dipantau melalui data yang tersedia, seperti impresi, kunjungan, dan lead yang dapat diatribusikan.

**Contoh konten berdasarkan segmen:**

- Brand baru: panduan memulai brand herbal atau kosmetik.
- UMKM: gambaran tahapan pengembangan produk private label.
- Klinik kecantikan: pertanyaan yang perlu dipersiapkan sebelum konsultasi pengembangan produk.
- Toko herbal: panduan awal untuk memahami proses pengembangan produk herbal.
- Influencer: pertimbangan bisnis sebelum meluncurkan produk dengan merek pribadi.

Konten tidak boleh menyiratkan bahwa GEO menjamin sebuah perusahaan direkomendasikan oleh AI Search. Dampaknya perlu diukur melalui eksperimen dan data yang tersedia.

### Modul D — Unified Growth Dashboard

Dashboard menyatukan aktivitas prospecting, interaksi awal, kualifikasi lead, meeting, dan performa konten.

**Komponen utama:**

- Total prospek ditemukan dan diverifikasi.
- Distribusi prospek berdasarkan segmen.
- Lead yang telah dihubungi dan yang menunjukkan ketertarikan.
- Lead berkualitas dan meeting terjadwal.
- Tingkat kehadiran meeting.
- Waktu respons WhatsApp.
- Waktu yang dihemat melalui otomatisasi.
- Konten yang dibuat dan diterbitkan.
- Kinerja kanal pemasaran jika integrasi datanya tersedia.
- Alasan lead tidak memenuhi kriteria atau tidak melanjutkan proses.

Dashboard harus membedakan data aktual dari perkiraan AI dan tidak menampilkan metrik yang belum memiliki sumber data.

### Modul E — Relationship Path Finder & Context Graph

Tujuan: meningkatkan probabilitas deal dengan mengganti pendekatan dingin (cold outreach) menjadi perkenalan hangat (warm introduction). Sistem memetakan aset relasi internal perusahaan ke dalam sebuah *context graph*, lalu menemukan jalur perkenalan terpendek dan terkuat dari tim ke prospek target.

**Konsep graph:**

- **Node:** kontak dalam jaringan — anggota tim internal (titik awal), klien lama, mitra/vendor, tokoh komunitas, dan kenalan lain. Sebuah kontak dapat menjadi *jembatan* ke sebuah prospek.
- **Edge (relasi):** hubungan antar dua kontak dengan **tipe** (rekan kerja, teman, mantan klien, relasi bisnis, komunitas, keluarga, referral) dan **kekuatan** 1–100 beserta alasan yang dapat ditinjau.

**Alur kerja:**

1. Tim mencatat kontak dan relasi dari sumber yang sah dan tercatat.
2. Tim menandai kontak yang menjadi jembatan ke prospek tertentu.
3. Sistem menjalankan pencarian jalur **deterministik** (algoritma terpendek/terkuat berbasis kekuatan relasi — bukan AI, sesuai §15) dari node tim ke jembatan prospek.
4. Sistem menghasilkan **skor jalur** (0–100): makin pendek dan makin kuat rantai relasi, makin tinggi skornya.
5. Skor jalur memberi **bonus prioritas** pada prospek sehingga prospek dengan jalur hangat naik ke atas antrian tindak lanjut.
6. Sistem menampilkan jalur (mis. "Budi → Hendra → dr. Lina") dengan alasan tiap langkah agar sales tahu kepada siapa harus meminta perkenalan.

**Informasi yang ditampilkan per prospek:**

- Skor dan kualitas jalur perkenalan (kuat / sedang / lemah / tidak ada).
- Rangkaian jalur dan tipe serta kekuatan tiap relasi.
- Alasan yang dapat ditinjau untuk setiap langkah.
- Daftar kontak jembatan dan status persetujuannya untuk dimintai perkenalan.

**Prinsip penting:** jalur perkenalan adalah **rekomendasi untuk meminta warm intro**, bukan izin untuk menghubungi massal. Skor jalur bukan jaminan deal; keputusan dan eksekusi perkenalan tetap pada manusia. Data relasi hanya boleh berasal dari sumber yang sah dan tercatat, serta menghormati persetujuan kontak.

---

## 7. Lead Qualification Framework

Kualifikasi prospek perlu ditentukan bersama tim sales CV Arba'in Jaya Mandiri.

Contoh kriteria awal:

| Kriteria | Pertanyaan atau sinyal | Penggunaan |
|---|---|---|
| Product interest | Herbal, kosmetik, atau kategori lain yang dilayani | Memastikan kecocokan layanan |
| Business stage | Baru memiliki ide, sedang riset, atau sudah memiliki brand | Memahami kebutuhan dan kesiapan |
| Target market | Siapa calon konsumen produk tersebut? | Memahami konsep bisnis |
| Development readiness | Apakah sudah memiliki konsep, formula, atau sampel? | Menentukan topik konsultasi |
| Timeline | Kapan ingin memulai pengembangan? | Menentukan urgensi tindak lanjut |
| Budget readiness | Apakah sudah memiliki kisaran anggaran? | Digunakan jika relevan dan nyaman ditanyakan |
| Decision authority | Apakah calon klien terlibat dalam keputusan? | Membantu menentukan langkah selanjutnya |

Kriteria tersebut tidak harus ditanyakan sekaligus. AI sebaiknya melakukan percakapan secara natural dan hanya mengumpulkan informasi yang diperlukan.

**Contoh status lead:**

- **Unqualified:** belum sesuai dengan layanan atau belum ada kebutuhan yang jelas.
- **Early-stage:** memiliki ide, tetapi masih membutuhkan edukasi.
- **Qualified:** memiliki kebutuhan yang sesuai dan cukup informasi untuk dilanjutkan ke sales.
- **Meeting Scheduled:** telah memilih jadwal konsultasi.
- **Meeting Completed:** konsultasi telah berlangsung.
- **Follow-up:** membutuhkan tindak lanjut dari sales.
- **Converted:** telah menjadi klien sesuai definisi konversi internal.
- **Lost / Not a Fit:** tidak melanjutkan atau tidak sesuai.

Status dan definisi final harus mengikuti proses bisnis mitra.

---

## 8. Functional Requirements

Prioritas:
- **P0:** wajib untuk MVP yang dipilih.
- **P1:** penting, dapat menjadi pengembangan berikutnya.
- **P2:** tambahan setelah kebutuhan dasar tervalidasi.

| ID | Requirement | Prioritas |
|---|---|---|
| FR-01 | Admin dapat mengelola data prospek | P0 |
| FR-02 | Sistem dapat mengimpor daftar prospek dari CSV | P0 |
| FR-03 | Sistem mendeteksi dan menggabungkan data duplikat | P0 |
| FR-04 | Sistem mengategorikan prospek berdasarkan segmen bisnis | P0 |
| FR-05 | Sistem menampilkan alasan dan sumber data untuk rekomendasi prospek | P0 |
| FR-06 | Sales dapat mengubah status dan menambahkan catatan prospek | P0 |
| FR-07 | AI dapat menjawab FAQ berdasarkan basis pengetahuan yang disetujui | P0 |
| FR-08 | AI dapat mengumpulkan kebutuhan awal calon klien | P0 |
| FR-09 | AI dapat menghasilkan ringkasan percakapan untuk sales | P0 |
| FR-10 | AI dapat mengarahkan prospek ke konsultasi atau human handoff | P0 |
| FR-11 | Dashboard menampilkan funnel lead dan meeting | P0 |
| FR-12 | Sistem dapat menghasilkan draft konten pemasaran | P1 |
| FR-13 | Sistem memberikan rekomendasi SEO/GEO pada konten | P1 |
| FR-14 | Sistem dapat menjadwalkan meeting melalui integrasi kalender | P1 |
| FR-15 | Sistem dapat mengintegrasikan kanal WhatsApp resmi | P1, bergantung akses |
| FR-16 | Sistem mengukur performa organik dan atribusi lead | P1, bergantung integrasi |
| FR-17 | Sistem mendukung rekomendasi kampanye berkala | P2 |
| FR-18 | Sistem mendukung otomatisasi pengiriman pesan outbound | Di luar MVP awal; memerlukan validasi kebijakan dan persetujuan |
| FR-19a | Tim dapat mendefinisikan ICP (segmen + daerah + kriteria) untuk pencarian prospek | P0 |
| FR-19b | Sistem mencarikan kandidat prospek berdasarkan ICP dari sumber yang diizinkan | P0 |
| FR-19c | Sistem membersihkan, deduplikasi, menilai, dan mengkualifikasikan kandidat terhadap ICP | P0 |
| FR-19d | Tim meninjau dan memilih kandidat sebelum disimpan ke pipeline; tiap run tercatat untuk audit | P0 |
| FR-19e | Sumber data pencarian bersifat provider-agnostic; mode simulasi diberi label jelas | P1, bergantung akses provider |
| FR-19 | Admin dapat mengelola kontak dan relasi dalam context graph | P1 |
| FR-20 | Sistem menemukan jalur perkenalan hangat dari tim ke prospek secara deterministik | P1 |
| FR-21 | Sistem memberi skor jalur perkenalan dan menampilkan alasan tiap langkah | P1 |
| FR-22 | Skor jalur perkenalan memengaruhi prioritas prospek (warm-intro bonus) | P1 |
| FR-23 | Sistem menandai status persetujuan kontak sebelum perkenalan diminta | P1 |

## 9. Non-Functional Requirements

### NFR-01 — Usability
Antarmuka harus sederhana dan dapat digunakan staf marketing atau sales tanpa pengetahuan teknis mendalam.

### NFR-02 — Reliability
Jika AI gagal, sistem harus menyediakan pesan fallback atau eskalasi ke manusia. Data lead yang sudah tercatat tidak boleh hilang karena kegagalan generasi jawaban.

### NFR-03 — Response Time
Target awal untuk respons AI adalah median di bawah 10 detik pada skenario uji yang telah ditentukan. Target ini perlu diuji pada integrasi dan model yang benar-benar digunakan.

### NFR-04 — Data Privacy
Data prospek dan percakapan hanya dapat diakses oleh pihak yang berwenang. Sistem harus mengumpulkan data seperlunya dan menyediakan mekanisme penghapusan sesuai kebijakan perusahaan.

### NFR-05 — Accuracy and Grounding
Jawaban yang berhubungan dengan layanan perusahaan harus didasarkan pada basis pengetahuan yang disetujui. Jika jawaban tidak tersedia, AI harus mengakui keterbatasan dan meneruskan pertanyaan.

### NFR-06 — Maintainability
Admin yang berwenang harus dapat memperbarui FAQ, informasi layanan, dan panduan respons tanpa mengubah kode aplikasi.

### NFR-07 — Cost Efficiency
Penggunaan model AI harus dibatasi melalui prompt yang terstruktur, penggunaan konteks yang relevan, penyimpanan hasil yang dapat digunakan kembali, dan pemilihan model sesuai kompleksitas tugas.

### NFR-08 — Compliance
Konten dan respons tentang herbal maupun kosmetik harus melalui aturan validasi yang sesuai. AI tidak boleh membuat klaim pengobatan, khasiat, keamanan, atau hasil produk yang tidak memiliki dasar dan persetujuan yang diperlukan.

---

## 10. Data Requirements

| Data | Sumber yang diharapkan | Kebutuhan |
|---|---|---|
| Profil perusahaan | Materi resmi perusahaan | Menjadi sumber informasi utama |
| Katalog layanan maklon | Dokumen dari mitra | Menentukan layanan yang dapat ditawarkan |
| FAQ | Wawancara sales dan dokumen internal | Basis pengetahuan AI |
| Proses konsultasi | Tim sales | Menentukan alur kualifikasi |
| Profil pelanggan yang sudah ada | Data internal, jika tersedia | Memahami karakteristik pelanggan ideal |
| Riwayat lead | Spreadsheet, CRM, atau catatan sales | Menyusun baseline funnel |
| Riwayat meeting dan konversi | Catatan internal | Mengukur hasil bisnis |
| Data prospek eksternal | Sumber publik atau penyedia data yang diizinkan | Prospecting |
| Materi konten | Kanal digital perusahaan | Mengukur aktivitas dan hasil marketing |
| Panduan klaim produk | Dokumen yang disetujui perusahaan | Mencegah informasi yang tidak sesuai |

Data harga, minimum order, estimasi biaya, durasi, formula, dan persyaratan legalitas tidak boleh diasumsikan. Informasi tersebut harus dikonfirmasi oleh mitra sebelum dimasukkan ke basis pengetahuan AI.

---

## 11. Business Rules and Guardrails

1. AI tidak boleh menyatakan bahwa prospek pasti membutuhkan jasa maklon hanya berdasarkan profil publik.
2. Semua rekomendasi prospek harus memiliki alasan yang dapat ditinjau.
3. Data prospek yang tidak lengkap harus ditandai, bukan dilengkapi dengan informasi rekaan.
4. Jawaban tentang harga, minimum order, timeline, dan layanan khusus hanya boleh diberikan jika tersedia sumber resmi.
5. Keputusan komersial dan teknis yang bersifat final tetap berada pada tim perusahaan.
6. Pertanyaan di luar basis pengetahuan harus dialihkan kepada manusia.
7. Konten kesehatan dan kosmetik harus melalui validasi fakta dan persetujuan sebelum dipublikasikan.
8. Prospek harus memiliki jalur yang jelas untuk meminta bantuan manusia atau menghentikan komunikasi.
9. Sistem tidak boleh melakukan pengiriman pesan massal tanpa mempertimbangkan persetujuan penerima, kebijakan kanal, dan aturan yang berlaku.
10. Aktivitas AI harus dapat ditinjau melalui log yang sesuai untuk evaluasi kualitas dan audit.
11. Jalur perkenalan hanya boleh digunakan untuk meminta *warm intro* dengan persetujuan kontak jembatan, bukan sebagai dasar pengiriman pesan massal.
12. Data relasi dalam context graph harus berasal dari sumber yang sah dan tercatat; relasi tanpa sumber atau tanpa persetujuan tidak boleh dijadikan dasar tindakan.
13. Skor jalur perkenalan adalah rekomendasi prioritisasi dan tidak boleh disajikan sebagai jaminan bahwa deal pasti terjadi.
14. Kandidat hasil pencarian ICP harus memiliki sumber dan tanggal verifikasi; hasil mode simulasi diberi label jelas dan tidak boleh diklaim sebagai data nyata.
15. Kualifikasi otomatis kandidat ICP adalah rekomendasi awal; tim tetap meninjau sebelum kandidat masuk ke pipeline dan sebelum tindak lanjut dilakukan.

---

## 12. User Journey End-to-End

### Journey A — Menemukan calon klien (ICP-driven)

1. Marketing mendefinisikan ICP: segmen (mis. klinik kecantikan), daerah target, kata kunci, dan ambang skor.
2. Sistem mencarikan kandidat dari sumber yang tersedia/diizinkan.
3. Sistem membersihkan, deduplikasi, menilai, dan mengkualifikasikan kandidat; menampilkan skor dan alasan.
4. Marketing meninjau hasil dan memilih kandidat untuk disimpan ke pipeline.
5. Sales menentukan metode kontak yang sesuai (termasuk mempertimbangkan jalur warm intro dari Modul E).
6. Hasil tindak lanjut dan run pencarian dicatat di dashboard untuk audit.

### Journey B — Calon klien meminta informasi

1. Calon klien menghubungi WhatsApp perusahaan.
2. AI menjelaskan proses maklon berdasarkan informasi resmi.
3. AI menanyakan kategori produk dan kebutuhan awal.
4. AI menilai apakah kebutuhan sesuai dengan layanan perusahaan.
5. Jika sesuai, AI menawarkan konsultasi atau meneruskan percakapan.
6. Sales menerima ringkasan kebutuhan, riwayat percakapan yang relevan, dan informasi yang masih perlu dikonfirmasi.
7. Sales melakukan konsultasi dan mengelola tahap berikutnya.

### Journey C — Mengembangkan konten

1. Marketing memilih segmen dan tujuan.
2. AI menghasilkan ide dan draft konten.
3. Sistem memberikan rekomendasi SEO/GEO.
4. Marketing memeriksa akurasi dan klaim.
5. Konten diterbitkan oleh pihak yang berwenang.
6. Data performa digunakan untuk mengevaluasi konten berikutnya.

### Journey D — Mencari jalur perkenalan ke prospek

1. Tim mencatat kontak dan relasi (tim, klien lama, mitra, komunitas) beserta sumbernya.
2. Tim menandai kontak yang menjadi jembatan ke prospek target.
3. Sistem menghitung jalur perkenalan terkuat dari tim ke prospek secara deterministik.
4. Sistem menampilkan jalur (mis. "Budi → Hendra → dr. Lina"), skor, dan alasan tiap langkah.
5. Prospek dengan jalur hangat naik prioritasnya di daftar prospecting.
6. Sales meminta perkenalan kepada kontak jembatan yang telah menyetujui, lalu melanjutkan ke konsultasi.

---

## 13. Measurable Baseline: Sebelum dan Sesudah

**Catatan penting:** CV Arba'in Jaya Mandiri belum memberikan data operasional aktual dalam dokumen ini. Karena itu, angka berikut adalah target pilot awal yang bersifat ilustratif. Angka tersebut bukan hasil pengukuran perusahaan dan tidak boleh disajikan sebagai kondisi aktual.

Baseline aktual harus dikumpulkan sebelum implementasi atau melalui pengamatan proses manual.

### 13.1 Baseline dan Target Operasional

| KPI | Cara mengukur kondisi sebelum | Target awal setelah implementasi |
|---|---|---|
| Waktu riset per prospek | Catat waktu dari mulai mencari hingga data prospek siap ditinjau | Turun minimal 30% |
| Waktu respons awal | Ukur median waktu dari pesan masuk hingga respons pertama | Median di bawah 10 detik untuk respons AI pada skenario yang didukung |
| Waktu administrasi per lead | Catat waktu pencatatan dan penyusunan ringkasan secara manual | Turun minimal 30% |
| Akurasi jawaban FAQ | Audit sampel pertanyaan dan jawaban manual berdasarkan informasi resmi | Minimal 90% jawaban benar pada kumpulan pertanyaan uji yang disepakati |
| Kualitas lead | Hitung lead yang memenuhi kriteria dibagi total lead yang dikualifikasi | Meningkat dibanding baseline |
| Meeting yang terlaksana | Catat jumlah meeting yang benar-benar berlangsung per bulan | Meningkat setelah memperhitungkan volume lead dan sumbernya |
| Konsistensi data prospek | Audit kelengkapan field wajib dan duplikasi | Minimal 90% data yang diproses memenuhi standar kelengkapan yang disepakati |
| Produksi konten | Catat jam kerja dan jumlah konten yang disetujui | Waktu per draft turun minimal 30% |
| Lead dari konten | Catat pertanyaan atau lead yang dapat diatribusikan ke kanal konten | Membentuk baseline dan tren peningkatan; tidak menjanjikan hasil dalam periode singkat |

Target-target di atas merupakan **usulan untuk pilot**, bukan jaminan hasil. Target akhir harus ditetapkan setelah mengetahui kondisi awal dan kemampuan integrasi.

### 13.2 Contoh Simulasi Terukur

Misalnya, hasil pengamatan awal menunjukkan bahwa tim menghabiskan rata-rata 20 menit untuk meriset dan menyiapkan satu prospek.

Jika modul prospecting mampu menurunkan waktu tersebut sebesar 30%, maka:

- Sebelum: 20 menit per prospek.
- Sesudah: 14 menit per prospek.
- Penghematan: 6 menit per prospek.

Untuk 100 prospek, penghematan menjadi 600 menit atau 10 jam kerja.

Ini hanya contoh perhitungan. Angka 20 menit harus diganti dengan hasil pengukuran aktual dari tim mitra.

### 13.3 Rumus Pengukuran

**Penghematan waktu:**

`(Waktu sebelum - Waktu sesudah) / Waktu sebelum × 100%`

**Qualified lead rate:**

`Jumlah lead berkualitas / Total lead yang dikualifikasi × 100%`

**Meeting attendance rate:**

`Jumlah meeting terlaksana / Jumlah meeting terjadwal × 100%`

**Lead-to-meeting rate:**

`Jumlah meeting terjadwal / Total lead yang masuk × 100%`

**Content-to-lead rate:**

`Jumlah lead yang dapat diatribusikan ke konten / Kunjungan konten yang relevan × 100%`

**Cost per qualified lead:**

`Total biaya akuisisi yang relevan / Jumlah qualified lead`

Untuk evaluasi yang adil, bandingkan periode dengan durasi serupa dan catat perbedaan sumber lead, volume prospek, jenis produk, serta jumlah staf yang terlibat.

### 13.4 Metode Pengambilan Baseline

Sebelum membangun solusi, lakukan pencatatan selama 1–2 minggu jika volume aktivitas memungkinkan. Jika volume rendah, gunakan periode lebih panjang atau audit data historis.

Catat setidaknya:

- Jumlah lead masuk per kanal.
- Jumlah prospek yang dicari secara manual.
- Waktu riset per prospek.
- Waktu respons pertama.
- Jumlah lead berkualitas.
- Jumlah meeting terjadwal dan terlaksana.
- Jumlah lead yang menjadi klien, jika dapat ditelusuri.
- Waktu yang dihabiskan untuk pertanyaan berulang.
- Waktu pembuatan konten dan jumlah konten yang disetujui.

Jika data historis tidak tersedia, baseline dapat dibuat melalui observasi langsung dan pencatatan manual selama pilot.

---

## 14. MVP Scope and Prioritization

Solusi penuh memiliki tiga modul yang berpotensi bernilai, tetapi implementasi semuanya sekaligus berisiko menghasilkan prototipe yang luas namun tidak membuktikan dampak dengan baik.

MVP sebaiknya dipilih berdasarkan hasil discovery.

### Opsi A — Prospecting-First

**Cocok jika:** masalah utama adalah kesulitan menemukan calon klien baru.

Ruang lingkup:
- Import data prospek.
- Pembersihan dan deduplikasi.
- Kategorisasi segmen.
- AI lead scoring dengan alasan.
- Status pipeline dan catatan tindak lanjut.
- Dashboard jumlah prospek dan waktu riset.

### Opsi B — WhatsApp Sales-First

**Cocok jika:** perusahaan sudah memiliki lead yang cukup, tetapi respons awal dan kualifikasi menyita waktu.

Ruang lingkup:
- Basis pengetahuan layanan.
- FAQ assistant.
- Pengumpulan kebutuhan calon klien.
- Kualifikasi awal.
- Ringkasan untuk sales.
- Alur handoff atau booking meeting.
- Dashboard interaksi dan kualifikasi.

Integrasi WhatsApp resmi memerlukan akses dan konfigurasi yang sesuai. Jika akses belum tersedia selama hackathon, gunakan antarmuka simulasi percakapan untuk mendemonstrasikan logika produk tanpa mengklaim integrasi langsung.

### Opsi C — Marketing/GEO-First

**Cocok jika:** masalah utama adalah rendahnya efisiensi produksi konten atau minimnya informasi yang menjawab pertanyaan target pasar.

Ruang lingkup:
- Pemilihan segmen audiens.
- Ide dan draft konten.
- Rekomendasi struktur SEO/GEO.
- Validasi klaim.
- Alur review dan persetujuan.
- Dashboard produksi konten dan metrik yang tersedia.

### Rekomendasi Pemilihan

Jangan menetapkan modul utama hanya berdasarkan mana yang paling menarik secara teknis. Beri skor 1–5 pada masing-masing opsi berdasarkan:

- Tingkat urgensi masalah.
- Potensi dampak bisnis.
- Ketersediaan data.
- Kemudahan implementasi.
- Kemudahan mengukur hasil.
- Kesiapan mitra untuk menguji solusi.

Pilih modul dengan skor tertinggi dan buat satu alur end-to-end yang benar-benar berfungsi. Dua modul lain tetap dijelaskan sebagai roadmap.

---

## 15. Suggested Technical Architecture

Arsitektur ini merupakan opsi implementasi awal, bukan persyaratan mutlak. Stack final dapat disesuaikan dengan kemampuan tim dan lingkungan mitra.

### Frontend
- Next.js atau Nuxt.js untuk dashboard internal.
- UI responsif untuk tim marketing dan sales.

### Backend
- API server untuk mengelola prospek, percakapan, konten, dan pipeline.
- Background jobs untuk proses riset atau generasi konten yang membutuhkan waktu.
- Integrasi layanan AI melalui backend agar API key tidak terekspos ke browser.

### Database
- PostgreSQL untuk data pengguna, prospek, status pipeline, konten, dan aktivitas.
- Prisma jika menggunakan stack TypeScript.

### AI Layer
- LLM untuk klasifikasi, ekstraksi kebutuhan, ringkasan percakapan, dan generasi draft.
- Retrieval-Augmented Generation (RAG) untuk menjawab pertanyaan berdasarkan dokumen resmi.
- Rule-based validation untuk field wajib, status lead, dan larangan klaim tertentu.

### Integrasi
- WhatsApp Business Platform atau penyedia resmi yang sesuai, jika akses tersedia.
- Kalender untuk penjadwalan meeting, jika diperlukan.
- Sumber data publik atau dataset prospek yang diizinkan.
- Analytics kanal digital, jika akses diberikan.

### Data Flow

1. Pengguna memasukkan data atau prospek masuk melalui kanal yang tersedia.
2. Backend memvalidasi dan menyimpan data.
3. AI memproses tugas yang membutuhkan pemahaman bahasa atau penilaian kontekstual.
4. Aturan bisnis memeriksa hasil AI sebelum digunakan.
5. Hasil ditampilkan di dashboard atau diteruskan ke staf terkait.
6. Aktivitas dan hasil dicatat untuk evaluasi.

**Prinsip arsitektur:** jangan menggunakan AI untuk keputusan deterministik yang sederhana. Deduplikasi, validasi field wajib, perhitungan KPI, dan transisi status sebaiknya menggunakan logika aplikasi biasa.

---

## 16. Risk Assessment

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Data prospek tidak akurat | Tim membuang waktu pada lead yang salah | Verifikasi sumber, tanggal, dan informasi penting |
| AI menghasilkan informasi layanan yang salah | Hilangnya kepercayaan calon klien | RAG, FAQ resmi, fallback, dan audit jawaban |
| Klaim kesehatan atau kosmetik berlebihan | Risiko reputasi dan kepatuhan | Aturan klaim, sumber yang disetujui, human review |
| Integrasi WhatsApp belum tersedia | Demo tidak dapat menguji kanal nyata | Siapkan simulasi yang diberi label jelas |
| Tidak ada baseline historis | Dampak sulit dibuktikan | Observasi awal dan pencatatan manual |
| Terlalu banyak fitur | MVP tidak matang | Fokus pada satu workflow utama |
| Prospek tidak tertarik meski datanya relevan | Hasil outreach rendah | Uji segmen dan proposisi nilai; jangan menyamakan skor dengan niat membeli |
| Biaya model AI membengkak | Solusi tidak ekonomis | Batasi pemanggilan model dan gunakan aturan deterministik |
| Tim tidak mengadopsi sistem | Manfaat tidak tercapai | Libatkan pengguna sejak discovery dan uji dengan workflow aktual |
| Pengiriman pesan tanpa persetujuan | Risiko kebijakan kanal dan reputasi | Prospecting dan persetujuan kontak dipisahkan; patuhi kebijakan kanal |
| Data relasi tidak akurat atau tanpa persetujuan | Perkenalan salah sasaran, risiko privasi | Wajibkan sumber relasi, tandai status consent, jalur hanya sebagai rekomendasi |
| Over-reliance pada skor jalur | Mengabaikan prospek tanpa jalur yang sebenarnya potensial | Skor jalur hanya menambah prioritas, tidak menggantikan kualifikasi lead |

---

## 17. Implementation Plan

### Tahap 1 — Discovery dan Baseline
- Wawancara marketing, sales, dan manajemen.
- Pemetaan proses akuisisi klien saat ini.
- Audit data prospek, FAQ, katalog, dan kanal digital.
- Pengukuran baseline.
- Pemilihan satu modul MVP.

**Deliverable:** process map, baseline KPI, prioritas kebutuhan, dan scope MVP yang disepakati.

### Tahap 2 — Prototype
- Rancangan UI/UX.
- Implementasi alur utama modul terpilih.
- Integrasi data dan AI yang diperlukan.
- Pengujian menggunakan data contoh yang telah disetujui.

**Deliverable:** prototipe fungsional end-to-end.

### Tahap 3 — Pilot
- Uji coba dengan staf mitra.
- Bandingkan waktu kerja dan kualitas hasil dengan proses manual.
- Kumpulkan feedback.
- Perbaiki alur dan aturan bisnis.

**Deliverable:** hasil pengujian, evaluasi KPI, daftar perbaikan, dan rekomendasi implementasi.

### Tahap 4 — Roadmap
- Integrasi modul kedua dan ketiga.
- Integrasi kanal produksi.
- Penguatan analytics dan pelaporan.
- Evaluasi biaya operasional dan pemeliharaan.

---

## 18. Acceptance Criteria

MVP dinyatakan layak untuk demonstrasi dan evaluasi awal jika:

1. Pengguna dapat menyelesaikan workflow utama tanpa bantuan teknis.
2. Sistem menyimpan data yang diproses dengan struktur yang konsisten.
3. Hasil AI dapat ditinjau dan dikoreksi oleh pengguna.
4. Sistem menampilkan sumber informasi atau alasan rekomendasi yang relevan.
5. Sistem tidak mengarang informasi layanan yang belum tersedia.
6. Human handoff berfungsi pada skenario yang membutuhkannya.
7. Dashboard menampilkan metrik yang berasal dari data yang benar-benar tercatat.
8. Uji coba membandingkan workflow baru dengan proses manual.
9. Batasan prototipe dan integrasi yang belum aktif dijelaskan secara transparan.

Target kualitas numerik untuk akurasi, kecepatan, dan penghematan waktu ditetapkan berdasarkan baseline serta hasil pengujian.

---

## 19. Success Metrics dan Evaluasi Bisnis

Keberhasilan tidak cukup diukur dari jumlah pesan yang dihasilkan AI, jumlah prospek yang ditemukan, atau jumlah konten yang dibuat.

Evaluasi perlu mencakup tiga lapisan:

**Operational efficiency**
- Waktu riset per prospek.
- Waktu respons awal.
- Waktu administrasi per lead.
- Waktu penyusunan draft konten.

**Sales effectiveness**
- Persentase lead berkualitas.
- Meeting terjadwal dan terlaksana.
- Lead yang berlanjut ke tahap komersial.
- Konversi menjadi klien, jika volume dan durasi observasi memadai.

**Marketing performance**
- Jumlah konten yang disetujui dan diterbitkan.
- Impresi dan kunjungan relevan.
- Lead yang dapat diatribusikan ke konten.
- Biaya per lead berkualitas.

Untuk hackathon, bukti yang kuat adalah demonstrasi workflow yang berfungsi, pengujian dengan skenario realistis, dan pengukuran waktu atau kualitas yang dapat diverifikasi. Klaim peningkatan penjualan jangka panjang sebaiknya menunggu data pilot.

---

## 20. Pertanyaan Validasi untuk Mitra

Sebelum menetapkan MVP, tim perlu menjawab pertanyaan berikut bersama CV Arba'in Jaya Mandiri:

1. Dari mana calon klien saat ini paling banyak berasal?
2. Berapa banyak lead yang masuk dalam satu minggu atau bulan?
3. Berapa waktu rata-rata yang dihabiskan untuk mencari satu calon klien?
4. Apakah perusahaan telah memiliki database prospek atau CRM?
5. Apa pertanyaan yang paling sering ditanyakan calon klien?
6. Berapa persentase lead yang biasanya berlanjut ke meeting?
7. Bagaimana perusahaan mendefinisikan lead yang layak ditangani sales?
8. Apakah jadwal konsultasi dapat dipilih melalui kalender?
9. Apakah sudah ada dokumen FAQ, katalog layanan, dan informasi komersial yang disetujui?
10. Kanal mana yang paling penting untuk dioptimalkan terlebih dahulu?
11. Apakah data historis dapat digunakan untuk mengukur baseline?
12. Siapa yang bertanggung jawab menyetujui jawaban AI dan konten pemasaran?

---

## 21. Kesimpulan

AI B2B Growth & Sales Copilot dirancang untuk membantu CV Arba'in Jaya Mandiri membangun proses akuisisi klien yang lebih terstruktur, efisien, dan terukur.

Solusi ini tidak memosisikan AI sebagai pengganti sales atau sebagai mesin pengirim pesan massal. AI bertindak sebagai asisten yang membantu menemukan peluang, menyiapkan informasi, menangani pertanyaan awal, mengidentifikasi kebutuhan calon klien, dan meneruskan prospek potensial ke konsultasi dengan tim manusia.

Tiga modul—Lead Prospecting, WhatsApp AI Sales Assistant, dan AI Marketing & GEO Content—merupakan visi pengembangan. Implementasi awal akan difokuskan pada modul dengan nilai bisnis paling tinggi setelah proses discovery dan pengukuran baseline bersama mitra.

**Prinsip keberhasilan:** bukan seberapa banyak fitur AI yang dibuat, tetapi seberapa nyata solusi menghemat waktu tim, meningkatkan kualitas prospek, dan membantu lebih banyak calon klien yang relevan mencapai tahap konsultasi.


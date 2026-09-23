-- ==============================================================================
-- SISTEM INFORMASI GEOGRAFIS (GIS) PKL SMK NEGERI 1 SONGGOM
-- SKRIP SETUP SUPABASE LENGKAP: TABEL, AUTH ADMIN, RLS & SEED DATA 32 DUDI MITRA
-- ==============================================================================
-- Petunjuk Penggunaan:
-- 1. Buka dashboard proyek Supabase Anda di https://supabase.com/dashboard
-- 2. Masuk ke menu "SQL Editor" di bilah navigasi sebelah kiri.
-- 3. Klik tombol "New query", lalu tempelkan seluruh kode SQL di bawah ini.
-- 4. Klik tombol "Run" (atau tekan Ctrl + Enter / Cmd + Enter).
-- ==============================================================================

-- 0. AKTIFKAN EXTENSION PENGACAK ID DAN ENKRIPSI PASSWORD
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 1. TABEL: public.admin (Tabel Data Akun Pengelola / Administrator)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    nama TEXT DEFAULT 'Administrator SMKN 1 Songgom',
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 2. TABEL: public.dudi_mitra (Data Master Tempat PKL & Koordinat GIS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.dudi_mitra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no INT,
    nama_dudi TEXT NOT NULL UNIQUE,
    maksimal_siswa INT DEFAULT 4,
    pimpinan TEXT,
    jenis_dudi TEXT DEFAULT 'Mandiri',
    bidang_pekerjaan TEXT,
    alamat TEXT,
    kabupaten TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    no_hp TEXT,
    jaminan TEXT DEFAULT 'Tidak Ada',
    nominal TEXT DEFAULT '-',
    deskripsi TEXT DEFAULT '',
    email TEXT DEFAULT '',
    website TEXT DEFAULT '',
    foto_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 3. TABEL: public.site_content (Pengaturan CMS Sekolah, Koordinat Peta & Visi Misi)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 4. TABEL: public.galeri (Dokumentasi Kegiatan Siswa PKL & Kunjungan)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.galeri (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    kategori TEXT DEFAULT 'Kegiatan PKL',
    tanggal TEXT,
    lokasi TEXT,
    deskripsi TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 5. TABEL: public.kontak_messages (Kotak Masuk Pesan Pengunjung & Siswa)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kontak_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    email TEXT NOT NULL,
    telepon TEXT,
    subjek TEXT,
    pesan TEXT NOT NULL,
    tanggal TEXT,
    dibaca BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
--    Memberikan akses baca publik dan akses tulis/kelola bagi sistem web
-- ==============================================================================
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Baca Admin" ON public.admin;
CREATE POLICY "Akses Baca Admin" ON public.admin FOR SELECT USING (true);
DROP POLICY IF EXISTS "Akses Kelola Admin" ON public.admin;
CREATE POLICY "Akses Kelola Admin" ON public.admin FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.dudi_mitra ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Baca Publik dudi_mitra" ON public.dudi_mitra;
CREATE POLICY "Akses Baca Publik dudi_mitra" ON public.dudi_mitra FOR SELECT USING (true);
DROP POLICY IF EXISTS "Akses Kelola dudi_mitra" ON public.dudi_mitra;
CREATE POLICY "Akses Kelola dudi_mitra" ON public.dudi_mitra FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Baca Publik site_content" ON public.site_content;
CREATE POLICY "Akses Baca Publik site_content" ON public.site_content FOR SELECT USING (true);
DROP POLICY IF EXISTS "Akses Kelola site_content" ON public.site_content;
CREATE POLICY "Akses Kelola site_content" ON public.site_content FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Baca Publik galeri" ON public.galeri;
CREATE POLICY "Akses Baca Publik galeri" ON public.galeri FOR SELECT USING (true);
DROP POLICY IF EXISTS "Akses Kelola galeri" ON public.galeri;
CREATE POLICY "Akses Kelola galeri" ON public.galeri FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.kontak_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Akses Kirim Pesan Publik" ON public.kontak_messages;
CREATE POLICY "Akses Kirim Pesan Publik" ON public.kontak_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Akses Kelola Pesan" ON public.kontak_messages;
CREATE POLICY "Akses Kelola Pesan" ON public.kontak_messages FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 7. SEED DATA SATU SAJA PADA TABEL ADMIN:
-- ==============================================================================
INSERT INTO public.admin (email, password, nama, role)
VALUES ('admin@smkn1songgom.sch.id', 'admin123', 'Administrator SMKN 1 Songgom', 'admin')
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  nama = EXCLUDED.nama,
  updated_at = now();

-- ==============================================================================
-- 8. SEED DATA: PENGATURAN SEKOLAH (public.site_content)
-- ==============================================================================
INSERT INTO public.site_content (key, content, updated_at)
VALUES (
  'school_config',
  '{
    "namaSekolah": "SMK Negeri 1 Songgom",
    "npsn": "69759288",
    "akreditasi": "B",
    "alamat": "Jl. Raya Songgom - Larangan, Desa Jatimakmur, Kec. Songgom",
    "kecamatan": "Songgom",
    "kabupaten": "Kab. Brebes",
    "provinsi": "Jawa Tengah",
    "kodePos": "52266",
    "latitude": -7.01255,
    "longitude": 109.00845,
    "telepon": "",
    "whatsapp": "",
    "email": "info@smkn1songgom.sch.id",
    "website": "https://www.smkn1songgom.sch.id",
    "tagline": "Cari Tempat PKL sesuai keinginan dengan Mudah",
    "deskripsi": "Sistem Informasi Geografis (GIS) resmi SMK Negeri 1 Songgom untuk membantu siswa dan orang tua memetakan serta menemukan Dunia Usaha & Dunia Industri (DUDI) mitra PKL yang kredibel, terverifikasi, dan dekat dengan domisili.",
    "visi": "Mewujudkan lulusan SMK Negeri 1 Songgom yang berkarakter, berkompetensi unggul, dan terserap optimal di Dunia Kerja melalui kemitraan strategis DUDI PKL yang terintegrasi berbasis GIS.",
    "misi": [
      "Memperluas jejaring kemitraan dengan DUDI berskala lokal, regional, hingga nasional.",
      "Menyediakan sistem informasi geografis tempat PKL yang transparan, mudah diakses, dan akurat.",
      "Memastikan kesesuaian kurikulum sekolah dengan kebutuhan kompetensi di tempat Praktik Kerja Lapangan.",
      "Meningkatkan mutu pendampingan, monitoring, dan evaluasi berkala bagi siswa magang di DUDI mitra."
    ],
    "kepalaSekolah": "Drs. Dihan Narso, M.Pd.",
    "ketuaBkk": "M. Dedi Safarudin, S.Kom.",
    "kaKomli": "Karyono, S.Kom."
  }',
  now()
)
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- 9. SEED DATA: DOKUMENTASI KEGIATAN PKL (public.galeri)
-- ==============================================================================
INSERT INTO public.galeri (id, judul, kategori, tanggal, lokasi, deskripsi, image_url)
VALUES
  ('gal-1', 'Penyerahan Siswa PKL Jurusan TKJ ke PT Serayu Multi Connection', 'Penyerahan Siswa', '15 Juli 2026', 'Songgom, Brebes', 'Prosesi penyerahan resmi siswa praktik kerja lapangan oleh Guru Pembimbing ke pimpinan PT Serayu Multi Connection.', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'),
  ('gal-2', 'Monitoring Berkala & Evaluasi Kinerja Siswa Magang di Era Network Center', 'Monitoring', '28 Agustus 2026', 'Jatirokeh, Songgom', 'Kunjungan rutin guru pembimbing humas untuk mengevaluasi jurnal kegiatan harian dan pencapaian kompetensi teknis.', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80'),
  ('gal-3', 'Penandatanganan MoU Kerjasama Kemitraan dengan PLN Icon Plus', 'MoU Kemitraan', '10 Mei 2026', 'Purwokerto, Banyumas', 'Sinergi penyelarasan kurikulum vokasi berbasis industri serta alokasi kuota khusus siswa berprestasi SMKN 1 Songgom.', 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80'),
  ('gal-4', 'Praktik Perakitan & Troubleshooting Komputer di Fito Komputer Slawi', 'Kegiatan PKL', '05 September 2026', 'Slawi, Kab. Tegal', 'Siswa mempraktikkan diagnosis kerusakan hardware motherboard dan instalasi sistem operasi di bawah bimbingan instruktur profesional.', 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80'),
  ('gal-5', 'Kunjungan Industri Siswa SMKN 1 Songgom ke Sentra Jaringan Telekomunikasi', 'Kunjungan Industri', '22 Februari 2026', 'Tegal - Brebes', 'Edukasi lapangan memperkenalkan infrastruktur fiber optik dan server data center modern kepada siswa tingkat X dan XI.', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'),
  ('gal-6', 'Sertifikasi Kompetensi Industri & Penutupan Masa PKL Gelombang 1', 'Kegiatan PKL', '12 September 2026', 'SMKN 1 Songgom', 'Ujian portofolio dan penyerahan sertifikat industri bagi siswa yang telah menyelesaikan masa PKL dengan predikat memuaskan.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 10. SEED DATA: 32 DATA MASTER DUDI MITRA & KOORDINAT GIS
-- ==============================================================================
INSERT INTO public.dudi_mitra (no, nama_dudi, maksimal_siswa, pimpinan, jenis_dudi, bidang_pekerjaan, alamat, kabupaten, latitude, longitude, no_hp, jaminan, nominal)
VALUES
  (1, 'ABS Komputer', 4, 'Arief Bayu S.', 'Mandiri', 'Teknisi / Mekanik,Jasa', 'Jl. Projosumarto 01 Gg. Balok Desa Sutapranan, Kec. Dukuhturi, Kab. Tegal', 'Kab. Tegal', -6.90356, 109.13615, '085226112344', 'Tidak Ada', '-'),
  (2, 'Era Network Center (ENC)', 4, 'Nasruloh', 'Mandiri', 'Jaringan,Teknisi / Mekanik', 'Jl. Kertaharja, Jatirokeh, Kec. Songgom, Kab. Brebes', 'Kab. Brebes', -6.99565, 109.03018, '087812984512', 'Tidak Ada', '-'),
  (3, 'Fito Komputer', 4, 'Fiqi silando Amd.T', 'Mandiri', 'Teknisi / Mekanik,Jasa,Penjualan', 'JL. Gajah Mada , RT.05/RW.07, Desa Kalisapu, Kec. Slawi, Kab. Tegal, Kode Pos : 52416', 'Kab. Tegal', -6.98403, 109.12689, '081390456123', 'Ada', 'Rp 100.000'),
  (4, 'Gibran Net ( PT Media Cepat Indonesia)', 4, 'SUNARYO', 'CV/PT', 'Teknisi / Mekanik,Jasa', 'Jl. Kalipasir 2 Desa Margaayu, Kec. Margasari, Kab. Tegal, Kode Pos 52463', 'Kab. Tegal', -7.09281, 108.98338, '082133445566', 'Tidak Ada', '-'),
  (5, 'Griya Komputer dan Network', 4, 'Imam Khaedar', 'Mandiri', 'Teknisi / Mekanik,Jaringan', 'Jl. Raya Pejagan - Ketanggungan Desa sutamaja, Kec. Ketanggungan, Kab. Brebes, Kode Pos 52263', 'Kab. Brebes', -6.92515, 108.89348, '085742119900', 'Tidak Ada', '-'),
  (6, 'Jet Computer', 4, 'M. Faiquttamam', 'Industri', 'Penjualan,Jasa', 'Jl. Gajah Mada, Karang Moncol, Desa Kalisapu, Kec. Slawi, Kab. Tegal, 52416', 'Kab. Tegal', -6.9878, 109.12748, '081229876543', 'Tidak Ada', '-'),
  (7, 'JNT.NET', 4, 'M.MUHLISIN', 'CV/PT', 'Jasa,Jaringan', 'Desa Dukuhdamu RT 7/RW 4, Kec. Lebaksiu, Kab. Tegal', 'Kab. Tegal', -6.99091, 109.10138, '085699887766', 'Tidak Ada', '-'),
  (8, 'Kim Komputer', 4, 'Diki Zahrudin', 'Mandiri', 'Teknisi / Mekanik,Jasa,Penjualan', 'Sutamaja No.4, Ketanggungan, Kec. Ketanggungan, Kabupaten Brebes', 'Kab. Brebes', -6.93047, 108.89298, '087788990011', 'Ada', 'Rp 50.000'),
  (9, 'MAMAS.COM', 4, 'Ade Susiyanto. S.Pd', 'Mandiri', 'Jasa,Penjualan', 'Jl. Raya Barat Larangan, Kec. Larangan, Kab. Brebes, Kode Pos 52268', 'Kab. Brebes', -7.00111, 108.94584, '081902345678', 'Tidak Ada', '-'),
  (10, 'Mulia Hati Studio', 4, 'Nanang Budi Santoso', 'Mandiri', 'Jasa,Percetakan', 'Jembayat Rt.04/Rw.06, Kec. Margasari, Kab.Tegal, Kode Pos : 52463', 'Kab. Tegal', -7.08885, 109.05265, '082322334455', 'Tidak Ada', '-'),
  (11, 'Nada Computer (NC)', 4, 'Hilman Maghfur', 'Mandiri', 'Teknisi / Mekanik', 'Jl. AMD Gg. Posyandu RT.002 RW.006 Dusun Sikancil Desa Slatri, Kec.Larangan, Kab. Brebes', 'Kab. Brebes', -6.97037, 108.94723, '085311223344', 'Tidak Ada', '-'),
  (12, 'Naza Komputer', 4, 'BAGJA BUDIONO', 'Mandiri', 'Teknisi / Mekanik,Jasa,Penjualan', 'Jl. Taman Siswa No.1, Saditan Brebes', 'Kab. Brebes', -6.87916, 109.04584, '081234998877', 'Ada', 'Rp 100.000'),
  (13, 'Percetakan 99', 2, 'Tobroni', 'Mandiri', 'Jasa,Percetakan', 'Jln.Raya Tangglog, Desa Karangsembung, Kec. Songgom, Kab. Brebes, Kode Pos : 52266', 'Kab. Brebes', -6.96785, 109.02782, '085866778899', 'Tidak Ada', '-'),
  (14, 'PLN Icon Plus Purwokerto', 4, 'KRESHNA ADITAMA', 'Industri', 'Jaringan,Teknisi / Mekanik,Jasa', 'Jl. Jend Sudirman No 805 Sokabaru Berkoh, Desa Sokabaru, Kec. Purwokerto, Kab. Banyumas, Kode Pos 53146', 'Kab. Banyumas', -7.43613, 109.26117, '0281-638700', 'Tidak Ada', '-'),
  (15, 'PT Admin Juara Network', 4, 'Abdul Anwar', 'CV/PT', 'Jasa,Jaringan', 'Jl. Suta Merta No.20, Blubuk, Kec. Dukuhturi, Kab. Tegal, Jawa Tengah, Kode Pos : 52451', 'Kab. Tegal', -6.97434, 109.09185, '081299881122', 'Tidak Ada', '-'),
  (16, 'PT Chandra Sarana Lintas Media', 4, 'Dwi Candra', 'CV/PT', 'Teknisi / Mekanik,Jasa', 'Jl. Raya Luwunggede - Bulakelor, Desa: Bulakelor, Kec Ketanggungan, Kab. Brebes, Kode Pos : 52262', 'Kab. Brebes', -6.94195, 108.91118, '085799001122', 'Tidak Ada', '-'),
  (17, 'PT Jayahana Munuara Mekanika Selaras', 4, 'Cahyadi', 'CV/PT', 'Teknisi / Mekanik,Jasa,Penjualan', 'Jl. Dukuh II, Desa Songgom Lor RT.02/RW.03, Kec. Songgom, Kab. Brebes, Kode Pos : 52266', 'Kab. Brebes', -7.02802, 108.99456, '087833445566', 'Tidak Ada', '-'),
  (18, 'PT Saka Media Komunika (Cabang 1)', 2, 'Dadi Yugiono', 'CV/PT', 'Teknisi / Mekanik,Jaringan', 'Jl. Jatimakmur Wetan, Desa Kemakmuran, Kab. Brebes, Kec. Songgom, Kode Pos : 52266', 'Kab. Brebes', -7.02888, 109.00121, '081322119988', 'Tidak Ada', '-'),
  (19, 'PT Saka Media Komunika (Cabang 2)', 2, 'Dadi Yugiono', 'CV/PT', 'Teknisi / Mekanik,Jaringan', 'Jl. Pancasakti Blok Kampung Baru No. 11 Desa Songgom Lor, Kec. Songgom, Kab. Brebes 52266', 'Kab. Brebes', -7.02888, 109.00121, '081322119989', 'Tidak Ada', '-'),
  (20, 'PT Saka Media Komunika (Cabang 3)', 2, 'Dadi Yugiyono', 'CV/PT', 'Teknisi / Mekanik,Jaringan', 'Jl. Jatimakmur Kulon, Desa Jatimakmur, Kec. Songgom, Kab. Brebes, Kode Pos : 52266', 'Kab. Brebes', -7.01506, 109.01154, '081322119990', 'Tidak Ada', '-'),
  (21, 'PT Serayu Multi Connection (Jatirokeh)', 4, 'Imam Eko Satrio', 'Industri', 'Teknisi / Mekanik,Jaringan', 'Jl. Faisol Jatirokeh, Kec. Songgom, Kab. Brebes', 'Kab. Brebes', -6.99493, 109.02278, '085290123456', 'Tidak Ada', '-'),
  (22, 'PT Serayu Multi Connection (Songgom)', 4, 'Imam Eko Satrio', 'Industri', 'Teknisi / Mekanik,Jasa', 'Jl. Pancasakti No. 14 Desa Songgom Lor, Kec. Songgom, Kab. Brebes, Kode Pos : 52266', 'Kab. Brebes', -7.03232, 108.99611, '085290123457', 'Tidak Ada', '-'),
  (23, 'Raja Komputer (RK)', 4, 'Ahmad Anis Faizal S.Kom', 'Mandiri', 'Penjualan,Teknisi / Mekanik', 'Jl. Imam Bonjol, Penjalin Banyu, Desa Siandong, Kec.Larangan, Kab. Brebes, Kode Pos : 52262', 'Kab. Brebes', -6.96409, 108.97105, '081809112233', 'Tidak Ada', '-'),
  (24, 'Republik Computer', 4, 'Adi Winarto. S.Kom', 'Mandiri', 'Penjualan,Jasa', 'Jl. Flores Baru No.1 Desa Griya Trayeman, Procot Kec. Slawi, Kab. Tegal, Kode Pos : 52414', 'Kab. Tegal', -6.96322, 109.13399, '085640223344', 'Tidak Ada', '-'),
  (25, 'Rizky Computer (RC)', 4, 'Nofan', 'Mandiri', 'Teknisi / Mekanik', 'Perumahan Griya Satria Pesona Alamanda No.7 Desa Klampis Barat, Kec. Jatibarang, Kab. Brebes, Kode Pos : 52261', 'Kab. Brebes', -6.96729, 109.03494, '087799112244', 'Tidak Ada', '-'),
  (26, 'Rizky Net', 4, 'Akhmad Sumidin', 'Mandiri', 'Jaringan,Jasa', 'Jl. Tirto Gang Pasar Larangan RT 09 RW 06 No. 28, Kec. Larangan, Kab. Brebes', 'Kab. Brebes', -7.00295, 108.94651, '081390901234', 'Tidak Ada', '-'),
  (27, 'RIZSKI COMPUTER', 4, 'Veri Riz''Qiyanto A.Md.Kom', 'Mandiri', 'Teknisi / Mekanik,Jasa,Penjualan', 'Jl. Pecikran, Pasangan - Kec.Talang, Kab.Tegal', 'Kab. Tegal', -6.93008, 109.1491, '085225667788', 'Ada', 'Rp 100.000'),
  (28, 'Sahabat Komputer', 4, 'Uki Prasetyo, S.Kom', 'Mandiri', 'Teknisi / Mekanik,Penjualan', 'Jl. Dewi Sartika, Sigambir, Kec. Brebes, Kab. Brebes', 'Kab. Brebes', -6.85797, 109.04145, '081911223344', 'Tidak Ada', '-'),
  (29, 'SH Net', 4, 'Bravo Drajat Niti Toto Wibowo', 'Mandiri', 'Jaringan,Jasa', 'Gg. Gudang Balung, Siandong, Kec. Larangan, Kab. Brebes, Jawa Tengah 52262', 'Kab. Brebes', -6.95738, 108.97292, '085811223344', 'Tidak Ada', '-'),
  (30, 'Sigy Toner & Komputer', 4, 'Totu Siswo Raharjo', 'Mandiri', 'Penjualan,Jasa', 'Jl. Rengaspendawa, Desa Rengaspendawa, Kec. Larangan, Kab. Brebes, 52262', 'Kab. Brebes', -6.95598, 108.99913, '082133889900', 'Tidak Ada', '-'),
  (31, 'SKI Computer', 4, 'Teguh Bintoro', 'Mandiri', 'Teknisi / Mekanik,Penjualan', 'Jl. Sepat No 16 Tegalsari Kota Tegal', 'Kota Tegal', -6.85841, 109.12791, '085290887766', 'Tidak Ada', '-'),
  (32, 'Smart Komputer', 4, 'Doni Aulia', 'Mandiri', 'Jasa,Penjualan', 'Jl. Professor M.Yamin, Desa Kudaile, Kec. Slawi, Kab. Tegal', 'Kab. Tegal', -6.97445, 109.13464, '081299001144', 'Tidak Ada', '-')
ON CONFLICT (nama_dudi) DO UPDATE SET
  no = EXCLUDED.no,
  maksimal_siswa = EXCLUDED.maksimal_siswa,
  pimpinan = EXCLUDED.pimpinan,
  jenis_dudi = EXCLUDED.jenis_dudi,
  bidang_pekerjaan = EXCLUDED.bidang_pekerjaan,
  alamat = EXCLUDED.alamat,
  kabupaten = EXCLUDED.kabupaten,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  no_hp = EXCLUDED.no_hp,
  jaminan = EXCLUDED.jaminan,
  nominal = EXCLUDED.nominal,
  updated_at = now();

-- ==============================================================================
-- 10. VERIFIKASI SELESAI
-- ==============================================================================
SELECT 'Setup database Supabase GIS PKL SMKN 1 Songgom selesai dengan sukses!' AS status;

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DudiMitra, SchoolConfig, GaleriItem, KontakMessage, AdminAccount } from '../types';
import { INITIAL_DUDI_LIST, INITIAL_SCHOOL_CONFIG, INITIAL_GALERI } from '../data/initialData';

const STORAGE_KEYS = {
  SUPABASE_URL: 'gis_pkl_supabase_url',
  SUPABASE_KEY: 'gis_pkl_supabase_key',
  DUDI: 'gis_pkl_dudi_data_v2',
  SCHOOL: 'gis_pkl_school_config_v2',
  GALERI: 'gis_pkl_galeri_data_v2',
  MESSAGES: 'gis_pkl_messages_data_v2',
  ADMIN_AUTH: 'gis_pkl_admin_session_v2',
  ADMINS: 'gis_pkl_admin_table_data'
};

// Check env first, then localStorage
export function getSavedSupabaseConfig(): { url: string; anonKey: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || '';

  return {
    url: localUrl || envUrl,
    anonKey: localKey || envKey
  };
}

export function saveSupabaseConfig(url: string, anonKey: string) {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, anonKey.trim());
  _supabaseInstance = null; // Reset cached instance
}

let _supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (_supabaseInstance) return _supabaseInstance;
  const { url, anonKey } = getSavedSupabaseConfig();
  if (!url || !anonKey || !url.startsWith('https://')) {
    return null;
  }
  try {
    _supabaseInstance = createClient(url, anonKey);
    return _supabaseInstance;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

// Local storage helpers
function getLocalDudi(): DudiMitra[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DUDI);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_DUDI_LIST;
}

function saveLocalDudi(list: DudiMitra[]) {
  localStorage.setItem(STORAGE_KEYS.DUDI, JSON.stringify(list));
}

function getLocalSchool(): SchoolConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHOOL);
    if (raw) {
      const cfg = JSON.parse(raw);
      // Auto-migrate to akreditasi B and remove old phone numbers
      if (cfg.akreditasi === 'A (Unggul)' || cfg.akreditasi === 'A') {
        cfg.akreditasi = 'B';
      }
      if (cfg.telepon === '(0283) 6178901') cfg.telepon = '';
      if (cfg.whatsapp === '081234567890') cfg.whatsapp = '';
      saveLocalSchool(cfg);
      return cfg;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_SCHOOL_CONFIG;
}

function saveLocalSchool(cfg: SchoolConfig) {
  localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(cfg));
}

function getLocalGaleri(): GaleriItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GALERI);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_GALERI;
}

function saveLocalGaleri(list: GaleriItem[]) {
  localStorage.setItem(STORAGE_KEYS.GALERI, JSON.stringify(list));
}

function getLocalMessages(): KontakMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return [
    {
      id: 'msg-1',
      nama: 'Budi Santoso (Wali Siswa XI TKJ 1)',
      email: 'budisantoso@gmail.com',
      telepon: '08123456789',
      subjek: 'Pertanyaan Alur Pendaftaran PKL di Era Network Center',
      pesan: 'Selamat pagi bapak/ibu koordinator BKK SMKN 1 Songgom, mohon informasi apakah untuk kuota di ENC masih tersedia 2 orang untuk siswa yang bertempat tinggal di Jatirokeh? Terima kasih.',
      tanggal: '2026-09-20 09:30',
      dibaca: false
    }
  ];
}

function saveLocalMessages(msgs: KontakMessage[]) {
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
}

// Local Admin Table Helper (Single Administrator Record)
function getLocalAdmins(): AdminAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMINS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const singleAdmin: AdminAccount[] = [
    {
      id: 'admin-1',
      email: 'admin@smkn1songgom.sch.id',
      password: 'admin123',
      nama: 'Administrator SMKN 1 Songgom',
      role: 'admin'
    }
  ];
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(singleAdmin));
  return singleAdmin;
}

function saveLocalAdmins(admins: AdminAccount[]) {
  localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
}

// Unified Service Layer that queries Supabase if available, fallback to localStorage
export const DataService = {
  // --- DUDI MITRA ---
  async getDudiList(): Promise<DudiMitra[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('dudi_mitra')
          .select('*')
          .order('no', { ascending: true });

        if (!error && data && data.length > 0) {
          // Format keys if needed
          const mapped: DudiMitra[] = data.map((d: any) => ({
            id: d.id?.toString() || `dudi-${d.no}`,
            no: Number(d.no) || 1,
            namaDudi: d.nama_dudi || d.namaDudi || '',
            maksimalSiswa: Number(d.maksimal_siswa || d.maksimalSiswa || 4),
            pimpinan: d.pimpinan || '',
            jenisDudi: d.jenis_dudi || d.jenisDudi || 'Mandiri',
            bidangPekerjaan: d.bidang_pekerjaan || d.bidangPekerjaan || '',
            alamat: d.alamat || '',
            kabupaten: d.kabupaten || '',
            latitude: Number(d.latitude || 0),
            longitude: Number(d.longitude || 0),
            noHp: d.no_hp || d.noHp || '',
            jaminan: d.jaminan || 'Tidak Ada',
            nominal: d.nominal || '-',
            deskripsi: d.deskripsi || '',
            email: d.email || '',
            website: d.website || '',
            fotoUrl: d.foto_url || d.fotoUrl || '',
            updatedAt: d.updated_at
          }));
          // Cache locally as backup
          saveLocalDudi(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase fetch failed, using local store:', err);
      }
    }
    return getLocalDudi();
  },

  async saveDudi(dudi: DudiMitra): Promise<DudiMitra> {
    const client = getSupabaseClient();
    const current = getLocalDudi();
    const existingIndex = current.findIndex(item => item.id === dudi.id);

    let updatedList: DudiMitra[];
    if (existingIndex >= 0) {
      updatedList = [...current];
      updatedList[existingIndex] = { ...dudi, updatedAt: new Date().toISOString() };
    } else {
      const newDudi = {
        ...dudi,
        id: dudi.id || `dudi-${Date.now()}`,
        no: dudi.no || current.length + 1,
        createdAt: new Date().toISOString()
      };
      updatedList = [...current, newDudi];
    }
    saveLocalDudi(updatedList);

    if (client) {
      try {
        const payload = {
          no: dudi.no,
          nama_dudi: dudi.namaDudi,
          maksimal_siswa: dudi.maksimalSiswa,
          pimpinan: dudi.pimpinan,
          jenis_dudi: dudi.jenisDudi,
          bidang_pekerjaan: dudi.bidangPekerjaan,
          alamat: dudi.alamat,
          kabupaten: dudi.kabupaten,
          latitude: dudi.latitude,
          longitude: dudi.longitude,
          no_hp: dudi.noHp,
          jaminan: dudi.jaminan,
          nominal: dudi.nominal,
          deskripsi: dudi.deskripsi || '',
          updated_at: new Date().toISOString()
        };
        await client.from('dudi_mitra').upsert(payload);
      } catch (err) {
        console.warn('Failed to upsert to Supabase:', err);
      }
    }

    return dudi;
  },

  async deleteDudi(id: string): Promise<boolean> {
    const current = getLocalDudi();
    const filtered = current.filter(item => item.id !== id);
    saveLocalDudi(filtered);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('dudi_mitra').delete().match({ id });
      } catch (err) {
        console.warn('Failed to delete in Supabase:', err);
      }
    }
    return true;
  },

  async bulkImportDudi(newItems: DudiMitra[]): Promise<number> {
    const current = getLocalDudi();
    // Overwrite or append based on name
    const map = new Map<string, DudiMitra>();
    current.forEach(item => map.set(item.namaDudi.toLowerCase().trim(), item));
    newItems.forEach((item, idx) => {
      map.set(item.namaDudi.toLowerCase().trim(), {
        ...item,
        id: item.id || `import-${Date.now()}-${idx}`,
        no: item.no || map.size + 1
      });
    });

    const merged = Array.from(map.values()).sort((a, b) => a.no - b.no);
    saveLocalDudi(merged);

    const client = getSupabaseClient();
    if (client) {
      try {
        const rows = merged.map(d => ({
          no: d.no,
          nama_dudi: d.namaDudi,
          maksimal_siswa: d.maksimalSiswa,
          pimpinan: d.pimpinan,
          jenis_dudi: d.jenisDudi,
          bidang_pekerjaan: d.bidangPekerjaan,
          alamat: d.alamat,
          kabupaten: d.kabupaten,
          latitude: d.latitude,
          longitude: d.longitude,
          no_hp: d.noHp,
          jaminan: d.jaminan,
          nominal: d.nominal
        }));
        await client.from('dudi_mitra').upsert(rows, { onConflict: 'nama_dudi' });
      } catch (err) {
        console.warn('Supabase bulk upsert warning:', err);
      }
    }

    return newItems.length;
  },

  // --- SCHOOL CONFIG (ABOUT & MAP SETTINGS) ---
  async getSchoolConfig(): Promise<SchoolConfig> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('site_content')
          .select('*')
          .eq('key', 'school_config')
          .single();

        if (!error && data?.content) {
          const cfg = JSON.parse(data.content);
          saveLocalSchool(cfg);
          return cfg;
        }
      } catch (err) {
        console.warn('Supabase site_content fetch warning:', err);
      }
    }
    return getLocalSchool();
  },

  async saveSchoolConfig(config: SchoolConfig): Promise<SchoolConfig> {
    saveLocalSchool(config);
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('site_content').upsert({
          key: 'school_config',
          content: JSON.stringify(config),
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Supabase site_content save warning:', err);
      }
    }
    return config;
  },

  // --- GALERI ---
  async getGaleri(): Promise<GaleriItem[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from('galeri').select('*');
        if (!error && data && data.length > 0) {
          const mapped: GaleriItem[] = data.map((g: any) => ({
            id: g.id?.toString() || `gal-${Date.now()}`,
            judul: g.judul || '',
            kategori: g.kategori || 'Kegiatan PKL',
            tanggal: g.tanggal || '',
            lokasi: g.lokasi || '',
            deskripsi: g.deskripsi || '',
            imageUrl: g.image_url || g.imageUrl || ''
          }));
          saveLocalGaleri(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase galeri fetch warning:', err);
      }
    }
    return getLocalGaleri();
  },

  async saveGaleri(item: GaleriItem): Promise<GaleriItem> {
    const list = getLocalGaleri();
    const idx = list.findIndex(i => i.id === item.id);
    let updated: GaleriItem[];
    if (idx >= 0) {
      updated = [...list];
      updated[idx] = item;
    } else {
      updated = [item, ...list];
    }
    saveLocalGaleri(updated);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('galeri').upsert({
          id: item.id,
          judul: item.judul,
          kategori: item.kategori,
          tanggal: item.tanggal,
          lokasi: item.lokasi,
          deskripsi: item.deskripsi,
          image_url: item.imageUrl
        });
      } catch (err) {
        console.warn('Supabase galeri upsert warning:', err);
      }
    }
    return item;
  },

  async deleteGaleri(id: string): Promise<boolean> {
    const list = getLocalGaleri();
    saveLocalGaleri(list.filter(i => i.id !== id));
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('galeri').delete().match({ id });
      } catch (err) {
        console.warn('Supabase galeri delete warning:', err);
      }
    }
    return true;
  },

  // --- MESSAGES / KONTAK ---
  async getMessages(): Promise<KontakMessage[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('kontak_messages')
          .select('*')
          .order('tanggal', { ascending: false });
        if (!error && data) {
          return data;
        }
      } catch (err) {
        console.warn('Supabase messages fetch warning:', err);
      }
    }
    return getLocalMessages();
  },

  async sendMessage(msg: Omit<KontakMessage, 'id' | 'tanggal' | 'dibaca'>): Promise<KontakMessage> {
    const fullMsg: KontakMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      tanggal: new Date().toISOString().replace('T', ' ').substring(0, 16),
      dibaca: false
    };
    const list = getLocalMessages();
    saveLocalMessages([fullMsg, ...list]);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('kontak_messages').insert({
          nama: fullMsg.nama,
          email: fullMsg.email,
          telepon: fullMsg.telepon,
          subjek: fullMsg.subjek,
          pesan: fullMsg.pesan,
          tanggal: fullMsg.tanggal,
          dibaca: false
        });
      } catch (err) {
        console.warn('Supabase insert message warning:', err);
      }
    }
    return fullMsg;
  },

  async markMessageRead(id: string): Promise<void> {
    const list = getLocalMessages().map(m => (m.id === id ? { ...m, dibaca: true } : m));
    saveLocalMessages(list);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('kontak_messages').update({ dibaca: true }).match({ id });
      } catch (err) {
        console.warn('Supabase message read warning:', err);
      }
    }
  },

  async deleteMessage(id: string): Promise<void> {
    const list = getLocalMessages().filter(m => m.id !== id);
    saveLocalMessages(list);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('kontak_messages').delete().match({ id });
      } catch (err) {
        console.warn('Supabase message delete warning:', err);
      }
    }
  },

  // --- ADMIN AUTHENTICATION DARI TABEL 'admin' ---
  async authenticateAdmin(emailInput: string, passwordInput: string): Promise<{ success: boolean; user?: AdminAccount; error?: string }> {
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanPass = (passwordInput || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Email dan kata sandi wajib diisi.' };
    }

    const client = getSupabaseClient();
    if (client) {
      try {
        // Ambil data langsung dari tabel admin di Supabase
        const { data, error } = await client
          .from('admin')
          .select('*')
          .ilike('email', cleanEmail)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          if (data.password === cleanPass) {
            const userObj: AdminAccount = {
              id: data.id?.toString() || 'admin-1',
              email: data.email,
              nama: data.nama || 'Administrator SMKN 1 Songgom',
              role: data.role || 'admin',
              createdAt: data.created_at,
              updatedAt: data.updated_at
            };
            saveLocalAdmins([userObj]);
            return { success: true, user: userObj };
          } else {
            return { success: false, error: 'Kata sandi / password salah.' };
          }
        } else if (!data) {
          return { success: false, error: 'Email tidak ditemukan di dalam tabel admin Supabase.' };
        }
      } catch (err: any) {
        console.warn('Gagal memverifikasi ke tabel admin Supabase, fallback ke data lokal:', err);
      }
    }

    // Fallback data lokal tabel admin jika Supabase belum terhubung
    const localAdmins = getLocalAdmins();
    const matched = localAdmins.find(a => a.email.toLowerCase() === cleanEmail);
    if (matched) {
      if (matched.password === cleanPass) {
        return {
          success: true,
          user: {
            id: matched.id,
            email: matched.email,
            nama: matched.nama,
            role: matched.role
          }
        };
      } else {
        return { success: false, error: 'Kata sandi / password salah.' };
      }
    }

    return { success: false, error: 'Email administrator tidak terdaftar pada tabel admin.' };
  },

  async getAdminProfile(): Promise<AdminAccount | null> {
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data } = await client.from('admin').select('id, email, nama, role, created_at, updated_at').limit(1).maybeSingle();
        if (data) return data;
      } catch (e) {}
    }
    const locals = getLocalAdmins();
    return locals[0] || null;
  },

  // Reset to initial seed data
  async resetToDefaultSeed(): Promise<void> {
    saveLocalDudi(INITIAL_DUDI_LIST);
    saveLocalSchool(INITIAL_SCHOOL_CONFIG);
    saveLocalGaleri(INITIAL_GALERI);
  }
};

// SQL Schema Generator for Supabase SQL Editor
export const SUPABASE_SCHEMA_SQL = `-- ==============================================================================
-- SISTEM INFORMASI GEOGRAFIS (GIS) PKL SMK NEGERI 1 SONGGOM
-- SKRIP SETUP SUPABASE LENGKAP: TABEL ADMIN, MASTER DUDI, CONTENT, GALERI, PESAN
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
-- 7. DATA SATU SAJA PADA TABEL ADMIN:
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
  '{"namaSekolah":"SMK Negeri 1 Songgom","npsn":"69759288","akreditasi":"B","alamat":"Jl. Raya Songgom - Larangan, Desa Jatimakmur, Kec. Songgom","kecamatan":"Songgom","kabupaten":"Kab. Brebes","provinsi":"Jawa Tengah","kodePos":"52266","latitude":-7.01255,"longitude":109.00845,"telepon":"","whatsapp":"","email":"info@smkn1songgom.sch.id","website":"https://www.smkn1songgom.sch.id","tagline":"Cari Tempat PKL sesuai keinginan dengan Mudah","deskripsi":"Sistem Informasi Geografis (GIS) resmi SMK Negeri 1 Songgom untuk membantu siswa dan orang tua memetakan serta menemukan Dunia Usaha & Dunia Industri (DUDI) mitra PKL yang kredibel, terverifikasi, dan dekat dengan domisili.","visi":"Mewujudkan lulusan SMK Negeri 1 Songgom yang berkarakter, berkompetensi unggul, dan terserap optimal di Dunia Kerja melalui kemitraan strategis DUDI PKL yang terintegrasi berbasis GIS.","misi":["Memperluas jejaring kemitraan dengan DUDI berskala lokal, regional, hingga nasional.","Menyediakan sistem informasi geografis tempat PKL yang transparan, mudah diakses, dan akurat.","Memastikan kesesuaian kurikulum sekolah dengan kebutuhan kompetensi di tempat Praktik Kerja Lapangan.","Meningkatkan mutu pendampingan, monitoring, dan evaluasi berkala bagi siswa magang di DUDI mitra."],"kepalaSekolah":"Drs. H. Mulyono, M.Pd.","ketuaBkk":"Akhmad Fauzi, S.T., M.Kom."}',
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
-- 11. VERIFIKASI SELESAI
-- ==============================================================================
SELECT 'Setup database Supabase GIS PKL SMKN 1 Songgom selesai dengan sukses!' AS status;
`;

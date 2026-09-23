import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DudiMitra, SchoolConfig, GaleriItem, KontakMessage } from '../types';
import { INITIAL_DUDI_LIST, INITIAL_SCHOOL_CONFIG, INITIAL_GALERI } from '../data/initialData';

const STORAGE_KEYS = {
  SUPABASE_URL: 'gis_pkl_supabase_url',
  SUPABASE_KEY: 'gis_pkl_supabase_key',
  DUDI: 'gis_pkl_dudi_data_v2',
  SCHOOL: 'gis_pkl_school_config_v2',
  GALERI: 'gis_pkl_galeri_data_v2',
  MESSAGES: 'gis_pkl_messages_data_v2',
  ADMIN_AUTH: 'gis_pkl_admin_session_v2'
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
    if (raw) return JSON.parse(raw);
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

  // Reset to initial seed data
  async resetToDefaultSeed(): Promise<void> {
    saveLocalDudi(INITIAL_DUDI_LIST);
    saveLocalSchool(INITIAL_SCHOOL_CONFIG);
    saveLocalGaleri(INITIAL_GALERI);
  }
};

// SQL Schema Generator for Supabase SQL Editor
export const SUPABASE_SCHEMA_SQL = `-- ============================================================
-- SQL Schema Generator: GIS PKL SMK Negeri 1 Songgom
-- Copy & Run this script in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Table: dudi_mitra
CREATE TABLE IF NOT EXISTS public.dudi_mitra (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no INT,
    nama_dudi TEXT NOT NULL UNIQUE,
    maksimal_siswa INT DEFAULT 4,
    pimpinan TEXT,
    jenis_dudi TEXT,
    bidang_pekerjaan TEXT,
    alamat TEXT,
    kabupaten TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    no_hp TEXT,
    jaminan TEXT,
    nominal TEXT,
    deskripsi TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) & Allow public reads, authenticated writes
ALTER TABLE public.dudi_mitra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read dudi_mitra" ON public.dudi_mitra FOR SELECT USING (true);
CREATE POLICY "Admin write dudi_mitra" ON public.dudi_mitra FOR ALL USING (true);

-- 2. Table: site_content (About, Koordinat Sekolah, Visi-Misi)
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT PRIMARY KEY,
    content TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admin write site_content" ON public.site_content FOR ALL USING (true);

-- 3. Table: galeri
CREATE TABLE IF NOT EXISTS public.galeri (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    kategori TEXT,
    tanggal TEXT,
    lokasi TEXT,
    deskripsi TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read galeri" ON public.galeri FOR SELECT USING (true);
CREATE POLICY "Admin write galeri" ON public.galeri FOR ALL USING (true);

-- 4. Table: kontak_messages
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
ALTER TABLE public.kontak_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert kontak_messages" ON public.kontak_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage kontak_messages" ON public.kontak_messages FOR ALL USING (true);
`;

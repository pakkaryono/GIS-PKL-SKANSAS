import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { INITIAL_DUDI_LIST, INITIAL_SCHOOL_CONFIG, INITIAL_GALERI } from './src/data/initialData';

dotenv.config();

const app = express();

// Parse port from args or env
let PORT = Number(process.env.PORT) || 3000;
const portArgIdx = process.argv.indexOf('--port');
if (portArgIdx !== -1 && process.argv[portArgIdx + 1]) {
  const p = Number(process.argv[portArgIdx + 1]);
  if (!isNaN(p) && p > 0) PORT = p;
}

const IS_PROD = process.env.NODE_ENV === 'production';
const CONFIG_FILE = path.resolve(process.cwd(), 'data-supabase-config.json');

const DEFAULT_SUPABASE_URL = 'https://bobuklypocwxfmkszvkr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvYnVrbHlwb2N3eGZta3N6dmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAxMDU4ODYsImV4cCI6MjEwNTY4MTg4Nn0.7hdDKpbhVsqU9gwnfszhrC-KJIbSUBoo9g8q6JTxelY';

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Persistent Supabase credentials helper
function getSavedConfig(): { url: string; anonKey: string } {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim() };
      }
    }
  } catch (err) {
    console.warn('Gagal membaca data-supabase-config.json:', err);
  }

  const envUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const envKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  return {
    url: (envUrl || DEFAULT_SUPABASE_URL).trim(),
    anonKey: (envKey || DEFAULT_SUPABASE_ANON_KEY).trim()
  };
}

function saveConfigToFile(url: string, anonKey: string) {
  try {
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify(
        {
          url: url.trim(),
          anonKey: anonKey.trim(),
          updatedAt: new Date().toISOString()
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (err) {
    console.error('Gagal menulis data-supabase-config.json:', err);
  }
}

let cachedClient: SupabaseClient | null = null;
function getServerSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSavedConfig();
  if (!url || !anonKey || !url.startsWith('https://')) {
    return null;
  }
  if (!cachedClient) {
    try {
      cachedClient = createClient(url, anonKey);
    } catch (e) {
      console.warn('Gagal inisialisasi Supabase di server:', e);
      return null;
    }
  }
  return cachedClient;
}

// Reset cache when config updates
function resetSupabaseClient() {
  cachedClient = null;
}

// ============================================================================
// API ROUTES FOR BACKEND SYNCHRONIZATION (LAPTOP, HP & PWA)
// ============================================================================

// 1. Get Supabase Configuration (Used by all clients: laptop, HP, PWA)
app.get('/api/config', (req: Request, res: Response) => {
  const cfg = getSavedConfig();
  res.json({
    url: cfg.url,
    anonKey: cfg.anonKey,
    isConfigured: !!(cfg.url && cfg.anonKey && cfg.url.startsWith('https://')),
    serverTime: new Date().toISOString()
  });
});

// 2. Save Supabase Configuration (Centralized: when admin saves on laptop, HP & PWA get it)
app.post('/api/config', (req: Request, res: Response) => {
  const { url, anonKey } = req.body;
  if (!url || !anonKey) {
    res.status(400).json({ error: 'URL dan anonKey Supabase wajib diisi.' });
    return;
  }

  saveConfigToFile(url, anonKey);
  resetSupabaseClient();

  res.json({
    success: true,
    message: 'Konfigurasi Supabase berhasil disimpan di server dan disinkronkan ke seluruh perangkat (HP & Laptop).',
    isConfigured: true
  });
});

// 3. Test Connection to 5 Tables: dudi_mitra, galeri, admin, kontak_messages, site_content
app.post('/api/test-connection', async (req: Request, res: Response) => {
  const testUrl = req.body.url || getSavedConfig().url;
  const testKey = req.body.anonKey || getSavedConfig().anonKey;

  if (!testUrl || !testKey) {
    res.status(400).json({
      connected: false,
      message: 'Supabase URL atau Anon Key belum dikonfigurasi.'
    });
    return;
  }

  try {
    const client = createClient(testUrl, testKey);
    const results: Record<string, { ok: boolean; count?: number; error?: string }> = {};

    // 1. dudi_mitra
    try {
      const { count, error } = await client.from('dudi_mitra').select('*', { count: 'exact', head: true });
      results.dudi_mitra = { ok: !error, count: count ?? 0, error: error?.message };
    } catch (e: any) {
      results.dudi_mitra = { ok: false, error: e.message };
    }

    // 2. galeri
    try {
      const { count, error } = await client.from('galeri').select('*', { count: 'exact', head: true });
      results.galeri = { ok: !error, count: count ?? 0, error: error?.message };
    } catch (e: any) {
      results.galeri = { ok: false, error: e.message };
    }

    // 3. admin
    try {
      const { count, error } = await client.from('admin').select('*', { count: 'exact', head: true });
      results.admin = { ok: !error, count: count ?? 0, error: error?.message };
    } catch (e: any) {
      results.admin = { ok: false, error: e.message };
    }

    // 4. kontak_messages
    try {
      const { count, error } = await client.from('kontak_messages').select('*', { count: 'exact', head: true });
      results.kontak_messages = { ok: !error, count: count ?? 0, error: error?.message };
    } catch (e: any) {
      results.kontak_messages = { ok: false, error: e.message };
    }

    // 5. site_content
    try {
      const { count, error } = await client.from('site_content').select('*', { count: 'exact', head: true });
      results.site_content = { ok: !error, count: count ?? 0, error: error?.message };
    } catch (e: any) {
      results.site_content = { ok: false, error: e.message };
    }

    const allOk = Object.values(results).every(r => r.ok);
    const anyOk = Object.values(results).some(r => r.ok);

    res.json({
      connected: anyOk,
      allTablesReady: allOk,
      tables: results,
      message: allOk
        ? 'Koneksi ke seluruh 5 tabel Supabase (dudi_mitra, galeri, admin, kontak_messages, site_content) berhasil!'
        : anyOk
        ? 'Sebagian tabel berhasil diakses. Beberapa tabel mungkin belum dibuat dengan skrip SQL.'
        : 'Gagal terhubung ke tabel Supabase. Pastikan URL dan Anon Key benar serta skrip SQL telah dijalankan.'
    });
  } catch (err: any) {
    res.status(500).json({
      connected: false,
      message: 'Kesalahan saat menguji koneksi: ' + (err.message || 'Unknown error')
    });
  }
});

// 4. Full Sync Endpoint: Returns all 5 tables in one fast call for mobile / laptop / PWA
app.get('/api/sync', async (req: Request, res: Response) => {
  const client = getServerSupabase();
  if (!client) {
    res.json({
      success: true,
      source: 'local_fallback',
      message: 'Supabase belum dikonfigurasi di server. Menggunakan data bawaan.',
      dudi: INITIAL_DUDI_LIST,
      schoolConfig: INITIAL_SCHOOL_CONFIG,
      galeri: INITIAL_GALERI,
      messages: [],
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    const [dudiRes, galeriRes, configRes, messagesRes] = await Promise.all([
      client.from('dudi_mitra').select('*').order('no', { ascending: true }),
      client.from('galeri').select('*').order('created_at', { ascending: false }),
      client.from('site_content').select('*').eq('key', 'school_config').maybeSingle(),
      client.from('kontak_messages').select('*').order('tanggal', { ascending: false })
    ]);

    let dudiData = INITIAL_DUDI_LIST;
    if (!dudiRes.error && dudiRes.data && dudiRes.data.length > 0) {
      dudiData = dudiRes.data.map((d: any) => ({
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
    }

    let galeriData = INITIAL_GALERI;
    if (!galeriRes.error && galeriRes.data && galeriRes.data.length > 0) {
      galeriData = galeriRes.data.map((g: any) => ({
        id: g.id?.toString() || `gal-${Date.now()}`,
        judul: g.judul || '',
        kategori: g.kategori || 'Kegiatan PKL',
        tanggal: g.tanggal || '',
        lokasi: g.lokasi || '',
        deskripsi: g.deskripsi || '',
        imageUrl: g.image_url || g.imageUrl || ''
      }));
    }

    let schoolData = INITIAL_SCHOOL_CONFIG;
    if (!configRes.error && configRes.data?.content) {
      try {
        schoolData = JSON.parse(configRes.data.content);
      } catch (e) {}
    }

    let messagesData = [];
    if (!messagesRes.error && messagesRes.data) {
      messagesData = messagesRes.data;
    }

    res.json({
      success: true,
      source: 'supabase',
      dudi: dudiData,
      schoolConfig: schoolData,
      galeri: galeriData,
      messages: messagesData,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('Server sync error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
      dudi: INITIAL_DUDI_LIST,
      schoolConfig: INITIAL_SCHOOL_CONFIG,
      galeri: INITIAL_GALERI,
      messages: []
    });
  }
});

// 5. Seed initial data to Supabase (helper button in Admin)
app.post('/api/seed-supabase', async (req: Request, res: Response) => {
  const client = getServerSupabase();
  if (!client) {
    res.status(400).json({ error: 'Supabase belum terhubung.' });
    return;
  }

  try {
    // Seed DUDI
    const rows = INITIAL_DUDI_LIST.map(d => ({
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

    // Seed Galeri
    const galRows = INITIAL_GALERI.map(g => ({
      id: g.id,
      judul: g.judul,
      kategori: g.kategori,
      tanggal: g.tanggal,
      lokasi: g.lokasi,
      deskripsi: g.deskripsi,
      image_url: g.imageUrl
    }));
    await client.from('galeri').upsert(galRows, { onConflict: 'id' });

    // Seed School Config
    await client.from('site_content').upsert({
      key: 'school_config',
      content: JSON.stringify(INITIAL_SCHOOL_CONFIG),
      updated_at: new Date().toISOString()
    });

    res.json({ success: true, message: 'Data awal 32 DUDI, galeri, dan profil sekolah berhasil di-seed ke Supabase!' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 5b. CRUD Endpoints to guarantee 100% synchronization with Supabase
app.delete('/api/galeri/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const client = getServerSupabase();
  if (!client) {
    res.status(500).json({ success: false, error: 'Koneksi Supabase di server belum aktif.' });
    return;
  }
  try {
    const { error } = await client.from('galeri').delete().eq('id', id);
    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true, message: 'Foto galeri berhasil dihapus dari database Supabase.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/galeri', async (req: Request, res: Response) => {
  const item = req.body;
  const client = getServerSupabase();
  if (!client) {
    res.status(500).json({ success: false, error: 'Koneksi Supabase di server belum aktif.' });
    return;
  }
  try {
    const { data, error } = await client.from('galeri').upsert({
      id: item.id || `gal-${Date.now()}`,
      judul: item.judul,
      kategori: item.kategori,
      tanggal: item.tanggal,
      lokasi: item.lokasi,
      deskripsi: item.deskripsi,
      image_url: item.imageUrl || item.image_url
    }, { onConflict: 'id' }).select();
    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true, message: 'Galeri berhasil disimpan ke Supabase.', data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/dudi/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const namaDudi = req.query.nama as string;
  const client = getServerSupabase();
  if (!client) {
    res.status(500).json({ success: false, error: 'Koneksi Supabase di server belum aktif.' });
    return;
  }
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let error;
    if (isUuid) {
      const res = await client.from('dudi_mitra').delete().eq('id', id);
      error = res.error;
    } else if (namaDudi) {
      const res = await client.from('dudi_mitra').delete().eq('nama_dudi', namaDudi);
      error = res.error;
    } else {
      const res = await client.from('dudi_mitra').delete().match({ id });
      error = res.error;
    }
    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true, message: 'Data DUDI berhasil dihapus dari Supabase.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/dudi', async (req: Request, res: Response) => {
  const dudi = req.body;
  const client = getServerSupabase();
  if (!client) {
    res.status(500).json({ success: false, error: 'Koneksi Supabase di server belum aktif.' });
    return;
  }
  try {
    const row = {
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
      email: dudi.email || '',
      website: dudi.website || '',
      foto_url: dudi.fotoUrl || '',
      updated_at: new Date().toISOString()
    };
    const { data, error } = await client.from('dudi_mitra').upsert(row, { onConflict: 'nama_dudi' }).select();
    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true, message: 'Data DUDI berhasil disimpan ke Supabase.', data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/school-config', async (req: Request, res: Response) => {
  const config = req.body;
  const client = getServerSupabase();
  if (!client) {
    res.status(500).json({ success: false, error: 'Koneksi Supabase di server belum aktif.' });
    return;
  }
  try {
    const { error } = await client.from('site_content').upsert({
      key: 'school_config',
      content: JSON.stringify(config),
      updated_at: new Date().toISOString()
    });
    if (error) {
      res.status(500).json({ success: false, error: error.message });
      return;
    }
    res.json({ success: true, message: 'Profil dan pengaturan sekolah berhasil disinkronkan ke Supabase.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Admin Authentication Route against 'admin' table
app.post('/api/admin/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanEmail || !cleanPass) {
    res.status(400).json({ success: false, error: 'Email dan kata sandi wajib diisi.' });
    return;
  }

  const client = getServerSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('admin')
        .select('*')
        .ilike('email', cleanEmail)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        if (data.password === cleanPass) {
          res.json({
            success: true,
            user: {
              id: data.id,
              email: data.email,
              nama: data.nama || 'Administrator SMKN 1 Songgom',
              role: data.role || 'admin'
            }
          });
          return;
        } else {
          res.status(401).json({ success: false, error: 'Kata sandi / password salah.' });
          return;
        }
      }
    } catch (err: any) {
      console.warn('Gagal cek admin di Supabase:', err);
    }
  }

  // Fallback default admin
  if (cleanEmail === 'admin@smkn1songgom.sch.id' && cleanPass === 'admin123') {
    res.json({
      success: true,
      user: {
        id: 'admin-1',
        email: cleanEmail,
        nama: 'Administrator SMKN 1 Songgom',
        role: 'admin'
      }
    });
    return;
  }

  res.status(401).json({ success: false, error: 'Email atau kata sandi tidak cocok.' });
});

// ============================================================================
// MOUNT VITE / STATIC SERVING
// ============================================================================

async function startServer() {
  const server = http.createServer(app);

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Fallback to transformIndexHtml for SPA navigation
    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api/')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Vite] Server running on http://0.0.0.0:${PORT} (${IS_PROD ? 'production' : 'development'})`);
  });
}

startServer();

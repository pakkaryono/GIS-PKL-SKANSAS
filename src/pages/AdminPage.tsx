import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { DudiMitra, SchoolConfig, GaleriItem, KontakMessage } from '../types';
import { DataService, getSavedSupabaseConfig, saveSupabaseConfig, SUPABASE_SCHEMA_SQL, getSupabaseClient } from '../lib/supabaseClient';
import { GooglePagination } from '../components/GooglePagination';
import { detectKabupaten, formatDistance, calculateDistance, getCategoryBadgeColor } from '../lib/geoUtils';
import {
  Building2,
  FileSpreadsheet,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  Info,
  MapPin,
  Phone,
  Image as ImageIcon,
  Copy,
  RefreshCw,
  X,
  ExternalLink,
  Mail,
  ShieldCheck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { AdminMapModal } from '../components/AdminMapModal';

interface AdminPageProps {
  dudiList: DudiMitra[];
  schoolConfig: SchoolConfig;
  galeriList: GaleriItem[];
  messagesList: KontakMessage[];
  onRefreshData: () => Promise<void>;
  onLogout: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  dudiList,
  schoolConfig,
  galeriList,
  messagesList,
  onRefreshData,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'dudi' | 'about' | 'map' | 'kontak' | 'galeri' | 'database'>('dudi');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- TAB 1: MASTER DUDI STATE ---
  const [dudiSearch, setDudiSearch] = useState('');
  const [dudiPage, setDudiPage] = useState(1);
  const [dudiPerPage, setDudiPerPage] = useState(10);
  const [dudiModalOpen, setDudiModalOpen] = useState(false);
  const [editingDudi, setEditingDudi] = useState<DudiMitra | null>(null);
  const [previewMapDudi, setPreviewMapDudi] = useState<DudiMitra | null>(null);

  // Form for New / Edit DUDI (All 12 columns from user image)
  const initialDudiForm: Partial<DudiMitra> = {
    no: dudiList.length + 1,
    namaDudi: '',
    maksimalSiswa: 4,
    pimpinan: '',
    jenisDudi: 'Mandiri',
    bidangPekerjaan: 'Teknisi / Mekanik,Jasa',
    alamat: '',
    kabupaten: 'Kab. Brebes',
    latitude: -7.0125,
    longitude: 109.0084,
    noHp: '',
    jaminan: 'Tidak Ada',
    nominal: '-',
  };
  const [dudiFormData, setDudiFormData] = useState<Partial<DudiMitra>>(initialDudiForm);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- TAB 2: ABOUT CMS STATE ---
  const [aboutForm, setAboutForm] = useState<SchoolConfig>({ ...schoolConfig });

  // --- TAB 3: MAP CMS STATE ---
  const [mapForm, setMapForm] = useState({
    latitude: schoolConfig.latitude,
    longitude: schoolConfig.longitude,
    namaSekolah: schoolConfig.namaSekolah,
    alamat: schoolConfig.alamat,
  });

  // --- TAB 4: KONTAK CMS STATE ---
  const [kontakForm, setKontakForm] = useState({
    alamat: schoolConfig.alamat,
    telepon: schoolConfig.telepon,
    whatsapp: schoolConfig.whatsapp,
    email: schoolConfig.email,
    website: schoolConfig.website,
  });

  // --- TAB 5: GALERI STATE ---
  const [galeriModalOpen, setGaleriModalOpen] = useState(false);
  const [newGaleriItem, setNewGaleriItem] = useState<Partial<GaleriItem>>({
    judul: '',
    kategori: 'Kegiatan PKL',
    tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    lokasi: 'Songgom, Brebes',
    deskripsi: '',
    imageUrl: '',
  });

  // --- TAB 6: SUPABASE DATABASE CONFIG STATE ---
  const savedSupabase = getSavedSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(savedSupabase.url);
  const [supabaseKey, setSupabaseKey] = useState(savedSupabase.anonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<'none' | 'success' | 'failed'>('none');
  const [testStatusMsg, setTestStatusMsg] = useState('');
  const [tableTestResults, setTableTestResults] = useState<Record<string, { ok: boolean; count?: number; error?: string }> | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Filtered DUDI for Admin
  const filteredDudi = useMemo(() => {
    return dudiList.filter((d) => {
      if (!dudiSearch.trim()) return true;
      const q = dudiSearch.toLowerCase();
      return (
        d.namaDudi.toLowerCase().includes(q) ||
        d.pimpinan.toLowerCase().includes(q) ||
        d.alamat.toLowerCase().includes(q) ||
        (d.bidangPekerjaan || '').toLowerCase().includes(q) ||
        (d.kabupaten || '').toLowerCase().includes(q)
      );
    });
  }, [dudiList, dudiSearch]);

  const totalDudiPages = Math.ceil(filteredDudi.length / dudiPerPage);
  const paginatedDudi = useMemo(() => {
    const start = (dudiPage - 1) * dudiPerPage;
    return filteredDudi.slice(start, start + dudiPerPage);
  }, [filteredDudi, dudiPage, dudiPerPage]);

  // --- CRUD ACTIONS: DUDI ---
  const handleOpenAddDudi = () => {
    setEditingDudi(null);
    setDudiFormData({
      ...initialDudiForm,
      no: dudiList.length + 1,
    });
    setDudiModalOpen(true);
  };

  const handleOpenEditDudi = (dudi: DudiMitra) => {
    setEditingDudi(dudi);
    setDudiFormData({ ...dudi });
    setDudiModalOpen(true);
  };

  const handleSaveDudi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dudiFormData.namaDudi || !dudiFormData.alamat) {
      alert('Nama DUDI dan Alamat wajib diisi.');
      return;
    }

    const payload: DudiMitra = {
      id: editingDudi?.id || `dudi-${Date.now()}`,
      no: Number(dudiFormData.no) || dudiList.length + 1,
      namaDudi: dudiFormData.namaDudi.trim(),
      maksimalSiswa: Number(dudiFormData.maksimalSiswa) || 4,
      pimpinan: dudiFormData.pimpinan || '',
      jenisDudi: dudiFormData.jenisDudi || 'Mandiri',
      bidangPekerjaan: dudiFormData.bidangPekerjaan || '',
      alamat: dudiFormData.alamat.trim(),
      kabupaten: dudiFormData.kabupaten || detectKabupaten(dudiFormData.alamat),
      latitude: Number(dudiFormData.latitude) || schoolConfig.latitude,
      longitude: Number(dudiFormData.longitude) || schoolConfig.longitude,
      noHp: dudiFormData.noHp || '',
      jaminan: dudiFormData.jaminan || 'Tidak Ada',
      nominal: dudiFormData.nominal || '-',
      deskripsi: dudiFormData.deskripsi || '',
    };

    await DataService.saveDudi(payload);
    await onRefreshData();
    setDudiModalOpen(false);
    showToast(editingDudi ? 'Data DUDI berhasil diperbarui!' : 'DUDI baru berhasil ditambahkan!');
  };

  const handleDeleteDudi = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus DUDI "${name}"?`)) {
      await DataService.deleteDudi(id);
      await onRefreshData();
      showToast(`DUDI "${name}" berhasil dihapus.`);
    }
  };

  // --- EXCEL IMPORT ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          alert('File Excel kosong atau format tidak sesuai.');
          return;
        }

        // Map column variations to our schema
        const importedItems: DudiMitra[] = rawRows.map((row, idx) => {
          const nama =
            row['Nama Dudi'] ||
            row['NAMA DUDI'] ||
            row['nama_dudi'] ||
            row['Nama Mitra'] ||
            `DUDI ${idx + 1}`;

          const no = Number(row['No'] || row['NO'] || idx + 1);
          const kuota = Number(row['MAKSIMAL SISWA'] || row['Maksimal Siswa'] || row['KUOTA'] || 4);
          const pimpinan = row['Pimpinan'] || row['PIMPINAN'] || row['Nama Pimpinan'] || '';
          const jenis = row['Jenis Dudi'] || row['JENIS DUDI'] || 'Mandiri';
          const bidang = row['Bidang Pekerjaan'] || row['BIDANG PEKERJAAN'] || '';
          const alamat = row['Alamat'] || row['ALAMAT'] || '';
          const lat = parseFloat(row['Latitude (Lintang)'] || row['Latitude'] || row['latitude'] || '-7.0125');
          const lng = parseFloat(row['Longitude (Bujur)'] || row['Longitude'] || row['longitude'] || '109.0084');
          const hp = row['No. Hp'] || row['NO. HP'] || row['no_hp'] || row['Telepon'] || '';
          const jaminan = row['Jaminan'] || row['JAMINAN'] || 'Tidak Ada';
          const nominal = row['Nominal'] || row['NOMINAL'] || '-';

          return {
            id: `imported-${Date.now()}-${idx}`,
            no: isNaN(no) ? idx + 1 : no,
            namaDudi: nama,
            maksimalSiswa: isNaN(kuota) ? 4 : kuota,
            pimpinan,
            jenisDudi: jenis,
            bidangPekerjaan: bidang,
            alamat,
            kabupaten: detectKabupaten(alamat),
            latitude: isNaN(lat) ? -7.0125 : lat,
            longitude: isNaN(lng) ? 109.0084 : lng,
            noHp: hp.toString(),
            jaminan: jaminan.toString(),
            nominal: nominal.toString(),
          };
        });

        await DataService.bulkImportDudi(importedItems);
        await onRefreshData();
        showToast(`Berhasil mengimpor ${importedItems.length} DUDI dari Excel!`);
      } catch (err: any) {
        alert('Gagal membaca file Excel: ' + err.message);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // --- EXCEL EXPORT (Exact image format) ---
  const handleExportExcel = () => {
    const exportData = dudiList.map((d) => ({
      No: d.no,
      'Nama Dudi': d.namaDudi,
      'MAKSIMAL SISWA': d.maksimalSiswa,
      Pimpinan: d.pimpinan,
      'Jenis Dudi': d.jenisDudi,
      'Bidang Pekerjaan': d.bidangPekerjaan,
      Alamat: d.alamat,
      'Latitude (Lintang)': d.latitude,
      'Longitude (Bujur)': d.longitude,
      'No. Hp': d.noHp || '',
      Jaminan: d.jaminan || '',
      Nominal: d.nominal || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data DUDI Mitra');
    XLSX.writeFile(workbook, `Data_Master_DUDI_SMKN1_Songgom_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('File Excel berhasil diekspor!');
  };

  // --- DOWNLOAD TEMPLATE EXCEL ---
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        No: 1,
        'Nama Dudi': 'Contoh Komputer',
        'MAKSIMAL SISWA': 4,
        Pimpinan: 'Ahmad S.',
        'Jenis Dudi': 'Mandiri',
        'Bidang Pekerjaan': 'Teknisi / Mekanik,Jasa',
        Alamat: 'Jl. Raya Songgom No. 1, Kab. Brebes',
        'Latitude (Lintang)': -7.0125,
        'Longitude (Bujur)': 109.0084,
        'No. Hp': '081234567890',
        Jaminan: 'Tidak Ada',
        Nominal: '-',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import DUDI');
    XLSX.writeFile(workbook, 'Template_Import_DUDI_SMKN1_Songgom.xlsx');
  };

  // --- SAVE ABOUT FORM ---
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.saveSchoolConfig(aboutForm);
    await onRefreshData();
    showToast('Profil & Konten About berhasil disimpan secara real-time!');
  };

  // --- SAVE MAP SETTINGS ---
  const handleSaveMap = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...schoolConfig,
      latitude: Number(mapForm.latitude),
      longitude: Number(mapForm.longitude),
      alamat: mapForm.alamat,
    };
    await DataService.saveSchoolConfig(updated);
    await onRefreshData();
    showToast('Titik koordinat pusat sekolah berhasil diperbarui!');
  };

  // --- SAVE KONTAK CMS ---
  const handleSaveKontak = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...schoolConfig,
      alamat: kontakForm.alamat,
      telepon: kontakForm.telepon,
      whatsapp: kontakForm.whatsapp,
      email: kontakForm.email,
      website: kontakForm.website,
    };
    await DataService.saveSchoolConfig(updated);
    await onRefreshData();
    showToast('Informasi Kontak Sekolah berhasil diperbarui!');
  };

  // --- GALERI ACTIONS ---
  const handleSaveGaleri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGaleriItem.judul || !newGaleriItem.imageUrl) {
      alert('Judul dan URL Foto wajib diisi.');
      return;
    }
    const item: GaleriItem = {
      id: `gal-${Date.now()}`,
      judul: newGaleriItem.judul,
      kategori: (newGaleriItem.kategori as any) || 'Kegiatan PKL',
      tanggal: newGaleriItem.tanggal || '2026',
      lokasi: newGaleriItem.lokasi || 'Brebes',
      deskripsi: newGaleriItem.deskripsi || '',
      imageUrl: newGaleriItem.imageUrl,
    };
    await DataService.saveGaleri(item);
    await onRefreshData();
    setGaleriModalOpen(false);
    setNewGaleriItem({
      judul: '',
      kategori: 'Kegiatan PKL',
      tanggal: '2026',
      lokasi: 'Brebes',
      deskripsi: '',
      imageUrl: '',
    });
    showToast('Foto dokumentasi baru berhasil ditambahkan!');
  };

  const handleDeleteGaleri = async (id: string) => {
    if (window.confirm('Hapus foto dokumentasi ini?')) {
      await DataService.deleteGaleri(id);
      await onRefreshData();
      showToast('Foto berhasil dihapus.');
    }
  };

  // --- SUPABASE ACTIONS ---
  const handleSaveSupabaseConfig = async () => {
    await saveSupabaseConfig(supabaseUrl, supabaseKey);
    showToast('Konfigurasi Supabase berhasil disimpan dan disinkronkan ke server (laptop, HP & PWA).');
    await onRefreshData();
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestStatus('none');
    setTableTestResults(null);
    setTestStatusMsg('');
    try {
      await saveSupabaseConfig(supabaseUrl, supabaseKey);
      const res = await DataService.testConnection(supabaseUrl, supabaseKey);
      if (res.connected) {
        setSupabaseTestStatus('success');
        setTableTestResults(res.tables || null);
        setTestStatusMsg(res.message || 'Koneksi ke Supabase berhasil!');
        showToast('Koneksi ke Supabase Berhasil!');
      } else {
        setSupabaseTestStatus('failed');
        setTableTestResults(res.tables || null);
        setTestStatusMsg(res.message || 'Gagal terhubung ke Supabase.');
        showToast('Gagal terhubung ke Supabase.');
      }
    } catch (e: any) {
      setSupabaseTestStatus('failed');
      setTestStatusMsg(e?.message || 'Terjadi kesalahan saat menguji koneksi.');
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSeedSupabase = async () => {
    if (!window.confirm('Kirim seluruh data awal (32 DUDI, galeri, dan profil sekolah) ke database Supabase Anda sekarang?')) {
      return;
    }
    setIsSeeding(true);
    try {
      const res = await DataService.seedSupabase();
      if (res.success) {
        showToast(res.message || 'Data awal berhasil di-seed ke Supabase!');
        await onRefreshData();
        // Re-test connection to show table counts
        await handleTestSupabase();
      } else {
        showToast(res.message || 'Gagal melakukan seed ke Supabase.');
      }
    } catch (err: any) {
      showToast('Gagal seeding: ' + (err?.message || 'Error'));
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
    showToast('Script SQL berhasil disalin ke clipboard!');
  };

  const handleResetToSeed = async () => {
    if (
      window.confirm(
        'Reset semua data DUDI ke data awal 32 baris sesuai gambar dokumen? Perubahan manual akan ditimpa.'
      )
    ) {
      await DataService.resetToDefaultSeed();
      await onRefreshData();
      showToast('Data berhasil di-reset ke 32 DUDI standar sesuai gambar.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-semibold animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header of Admin Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-md">
            ADM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Panel Kontrol & Manajemen Konten
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500">
              SMK Negeri 1 Songgom • Kelola Front End Dinamis Real-time & Terpusat
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshData}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="Refresh Data dari Database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Ulang</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition cursor-pointer"
          >
            <span>Keluar Sesi</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('dudi')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'dudi'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Master DUDI Mitra ({dudiList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'about'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Kelola About & Visi Misi</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'map'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Peta Lokasi & Koordinat</span>
        </button>

        <button
          onClick={() => setActiveTab('kontak')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'kontak'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Kontak & Pesan ({messagesList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('galeri')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'galeri'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Galeri PKL ({galeriList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'database'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Database Supabase</span>
        </button>
      </div>

      {/* --- TAB 1: MASTER DUDI MITRA --- */}
      {activeTab === 'dudi' && (
        <div className="space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <div className="relative min-w-[240px] flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari DUDI berdasarkan nama, alamat, pimpinan..."
                value={dudiSearch}
                onChange={(e) => {
                  setDudiSearch(e.target.value);
                  setDudiPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
              />
            </div>

            {/* Buttons: Add, Import, Export, Template */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleOpenAddDudi}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah DUDI</span>
              </button>

              {/* Hidden file input for Excel import */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
                title="Impor file Excel data DUDI"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Impor Excel</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition cursor-pointer"
                title="Ekspor ke Excel format resmi"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Ekspor Excel</span>
              </button>

              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-[11px] font-medium transition cursor-pointer"
                title="Unduh Template Excel Kosong"
              >
                <span>Unduh Format</span>
              </button>
            </div>
          </div>

          {/* Table Data (Matching 12 Columns from Excel image) */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">No</th>
                    <th className="py-3 px-3">Nama Dudi</th>
                    <th className="py-3 px-3 text-center">Maksimal Siswa</th>
                    <th className="py-3 px-3">Pimpinan</th>
                    <th className="py-3 px-3">Jenis Dudi</th>
                    <th className="py-3 px-3">Bidang Pekerjaan</th>
                    <th className="py-3 px-3">Alamat</th>
                    <th className="py-3 px-3">Koordinat GIS (Lat, Long)</th>
                    <th className="py-3 px-3 text-center">Lokasi Map</th>
                    <th className="py-3 px-3">No. Hp</th>
                    <th className="py-3 px-3">Kontribusi Kemitraan</th>
                    <th className="py-3 px-3">Alokasi Dana</th>
                    <th className="py-3 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedDudi.map((dudi) => {
                    const badge = getCategoryBadgeColor(dudi.bidangPekerjaan);

                    return (
                      <tr key={dudi.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 text-center font-bold text-slate-500">
                          {dudi.no}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {dudi.namaDudi}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-800">
                          <span className="px-2 py-0.5 rounded bg-slate-100">
                            {dudi.maksimalSiswa}
                          </span>
                        </td>
                        <td className="py-3 px-3">{dudi.pimpinan || '-'}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {dudi.jenisDudi || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-[180px]">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${badge.bg} ${badge.text}`}
                          >
                            {dudi.bidangPekerjaan || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-[220px] truncate" title={dudi.alamat}>
                          {dudi.alamat}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {dudi.latitude?.toFixed(4)}, {dudi.longitude?.toFixed(4)}
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setPreviewMapDudi(dudi)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                            title={`Buka Lokasi Map ${dudi.namaDudi} (${dudi.latitude}, ${dudi.longitude})`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Buka Map</span>
                          </button>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{dudi.noHp || '-'}</td>
                        <td className="py-3 px-3 text-slate-600">{dudi.jaminan || '-'}</td>
                        <td className="py-3 px-3 text-slate-600">{dudi.nominal || '-'}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEditDudi(dudi)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                              title="Edit Data DUDI"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDudi(dudi.id, dudi.namaDudi)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Hapus DUDI"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Google-Style Pagination on Backend */}
            <div className="p-4 border-t border-slate-100">
              <GooglePagination
                currentPage={dudiPage}
                totalPages={totalDudiPages}
                totalItems={filteredDudi.length}
                itemsPerPage={dudiPerPage}
                onPageChange={(page) => setDudiPage(page)}
                onItemsPerPageChange={(size) => {
                  setDudiPerPage(size);
                  setDudiPage(1);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ABOUT CMS --- */}
      {activeTab === 'about' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pengelolaan Konten Profil & Visi Misi (About)
              </h2>
              <p className="text-xs text-slate-500">
                Data yang diubah di sini akan otomatis tampil secara dinamis pada halaman About bagi semua pengunjung.
              </p>
            </div>
            <button
              onClick={handleSaveAbout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

          <form onSubmit={handleSaveAbout} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Resmi Sekolah
                </label>
                <input
                  type="text"
                  value={aboutForm.namaSekolah}
                  onChange={(e) => setAboutForm({ ...aboutForm, namaSekolah: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tagline di Header
                </label>
                <input
                  type="text"
                  value={aboutForm.tagline}
                  onChange={(e) => setAboutForm({ ...aboutForm, tagline: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deskripsi Program GIS PKL
              </label>
              <textarea
                rows={3}
                value={aboutForm.deskripsi}
                onChange={(e) => setAboutForm({ ...aboutForm, deskripsi: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Visi Program PKL
              </label>
              <textarea
                rows={2}
                value={aboutForm.visi}
                onChange={(e) => setAboutForm({ ...aboutForm, visi: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={aboutForm.kepalaSekolah}
                  onChange={(e) => setAboutForm({ ...aboutForm, kepalaSekolah: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ketua Pokja PKL TKJ
                </label>
                <input
                  type="text"
                  value={aboutForm.ketuaBkk}
                  onChange={(e) => setAboutForm({ ...aboutForm, ketuaBkk: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ka Komli TKJ
                </label>
                <input
                  type="text"
                  value={aboutForm.kaKomli || ''}
                  onChange={(e) => setAboutForm({ ...aboutForm, kaKomli: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>
          </form>
        </div>
      )}

      {/* --- TAB 3: PETA LOKASI CMS --- */}
      {activeTab === 'map' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Pengaturan Titik Pusat Koordinat Navigasi Sekolah
              </h2>
              <p className="text-xs text-slate-500">
                Semua perhitungan jarak (KM) DUDI mitra dihitung secara matematis menggunakan formula Haversine dari titik ini.
              </p>
            </div>
            <button
              onClick={handleSaveMap}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Koordinat</span>
            </button>
          </div>

          <form onSubmit={handleSaveMap} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Latitude Lintang Pusat (Contoh: -7.020388)
                </label>
                <input
                  type="number"
                  step="any"
                  value={mapForm.latitude}
                  onChange={(e) => setMapForm({ ...mapForm, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Longitude Bujur Pusat (Contoh: 108.983684)
                </label>
                <input
                  type="number"
                  step="any"
                  value={mapForm.longitude}
                  onChange={(e) => setMapForm({ ...mapForm, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Acuan Titik Pusat Navigasi
              </label>
              <input
                type="text"
                value={mapForm.alamat}
                onChange={(e) => setMapForm({ ...mapForm, alamat: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
              />
            </div>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1">
              <strong>Info GIS:</strong> Mengubah koordinat ini akan otomatis memperbarui jarak tempuh semua DUDI mitra di halaman front end secara real-time.
            </div>
          </form>
        </div>
      )}

      {/* --- TAB 4: KONTAK & PESAN CMS --- */}
      {activeTab === 'kontak' && (
        <div className="space-y-6">
          {/* Edit Kontak Sekolah */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                Informasi Kontak Sekolah (Tampil di Footer & About)
              </h2>
              <button
                onClick={handleSaveKontak}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Kontak</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website Sekolah
                </label>
                <input
                  type="text"
                  value={kontakForm.website}
                  onChange={(e) => setKontakForm({ ...kontakForm, website: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Resmi Sekolah
                </label>
                <input
                  type="email"
                  value={kontakForm.email}
                  onChange={(e) => setKontakForm({ ...kontakForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={kontakForm.whatsapp}
                  onChange={(e) => setKontakForm({ ...kontakForm, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Inbox Pesan Masuk */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pesan Masuk dari Pengunjung & DUDI Baru ({messagesList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Pesan yang dikirimkan melalui formulir pertanyaan di halaman About.
                </p>
              </div>
            </div>

            {messagesList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada pesan masuk.
              </div>
            ) : (
              <div className="space-y-3">
                {messagesList.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-2xl border transition ${
                      msg.dibaca ? 'bg-slate-50 border-slate-200' : 'bg-red-50/40 border-red-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <span className="font-bold text-slate-900 text-xs">
                          {msg.nama}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-2">
                          ({msg.email} • {msg.telepon || '-'})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {msg.tanggal}
                      </span>
                    </div>

                    <div className="font-semibold text-xs text-slate-800 mb-1">
                      Subjek: {msg.subjek || 'Tanpa Subjek'}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                      {msg.pesan}
                    </p>

                    <div className="mt-2 flex items-center justify-end gap-2 text-xs">
                      {!msg.dibaca && (
                        <button
                          onClick={async () => {
                            await DataService.markMessageRead(msg.id);
                            await onRefreshData();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-medium text-[11px] hover:bg-emerald-700 transition"
                        >
                          Tandai Dibaca
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (window.confirm('Hapus pesan ini?')) {
                            await DataService.deleteMessage(msg.id);
                            await onRefreshData();
                            showToast('Pesan dihapus.');
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-700 font-medium text-[11px] hover:bg-red-100 hover:text-red-700 transition"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 5: GALERI PKL CMS --- */}
      {activeTab === 'galeri' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kelola Galeri & Dokumentasi Kegiatan
              </h2>
              <p className="text-xs text-slate-500">
                Dokumentasi foto kunjungan industri, monitoring siswa, dan MoU kemitraan.
              </p>
            </div>

            <button
              onClick={() => setGaleriModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Foto Galeri</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galeriList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video bg-slate-100 overflow-hidden relative">
                    <img
                      src={item.imageUrl}
                      alt={item.judul}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-red-700">
                      {item.kategori}
                    </span>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <span className="text-[10px] text-slate-400">
                      {item.tanggal} • {item.lokasi}
                    </span>
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-2">
                      {item.judul}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {item.deskripsi}
                    </p>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteGaleri(item.id)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 6: DATABASE SUPABASE INTEGRATION --- */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Supabase Connection Setup */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Integrasi Database Supabase Terpusat
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sesuai instruksi: Data disimpan otomatis di Supabase dan disinkronkan secara real-time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestSupabase}
                  disabled={isTestingSupabase}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isTestingSupabase ? 'Menguji...' : 'Uji Koneksi Supabase'}</span>
                </button>
                <button
                  onClick={handleSaveSupabaseConfig}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Kunci</span>
                </button>
              </div>
            </div>

            {supabaseTestStatus === 'success' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testStatusMsg || 'Koneksi Sukses ke Database Supabase!'}</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Kunci konfigurasi telah disinkronkan ke server backend. Setiap laptop, HP (smartphone), dan aplikasi PWA yang terinstall akan secara otomatis mengambil data langsung dari tabel Supabase.
                </p>

                {tableTestResults && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-emerald-200/60">
                    {Object.entries(tableTestResults).map(([tName, tInfo]) => (
                      <div key={tName} className="p-2 rounded-xl bg-white border border-emerald-200 text-[11px]">
                        <div className="font-mono font-bold text-slate-800 truncate">{tName}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${tInfo.ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className={tInfo.ok ? 'text-emerald-700 font-medium' : 'text-red-600'}>
                            {tInfo.ok ? `${tInfo.count ?? 0} data` : 'Error'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {supabaseTestStatus === 'failed' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{testStatusMsg || 'Belum dapat terhubung ke tabel Supabase.'}</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  Pastikan URL dan Anon Key sudah benar, lalu pastikan seluruh 5 tabel (<code>admin</code>, <code>dudi_mitra</code>, <code>site_content</code>, <code>galeri</code>, <code>kontak_messages</code>) sudah dibuat dengan menjalankan skrip SQL di bawah pada menu SQL Editor di dashboard Supabase.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Supabase Anon / Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-slate-600" />
                  <span>{copiedSql ? '✓ Berhasil Disalin!' : 'Salin Script SQL Pembuat 5 Tabel'}</span>
                </button>

                <button
                  onClick={handleSeedSupabase}
                  disabled={isSeeding}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSeeding ? 'Mengirim Data...' : 'Kirim Data Awal ke Supabase'}</span>
                </button>
              </div>

              <button
                onClick={handleResetToSeed}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke 32 Data Gambar Excel</span>
              </button>
            </div>
          </div>

          {/* SQL Preview Box */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Supabase SQL Schema Script (5 Tabel: admin, dudi_mitra, site_content, galeri, kontak_messages)
              </span>
              <button
                onClick={handleCopySql}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
              >
                {copiedSql ? 'Tersalin' : 'Salin SQL'}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 p-4 bg-slate-950 rounded-2xl overflow-x-auto max-h-56 leading-relaxed">
              {SUPABASE_SCHEMA_SQL}
            </pre>
          </div>
        </div>
      )}

      {/* --- MODAL TAMBAH / EDIT DUDI --- */}
      {dudiModalOpen && (
        <div
          onClick={() => setDudiModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 my-8"
          >
            <button
              onClick={() => setDudiModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingDudi ? 'Edit Master DUDI Mitra' : 'Tambah Master DUDI Baru'}
            </h2>

            <form onSubmit={handleSaveDudi} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    No. Urut
                  </label>
                  <input
                    type="number"
                    value={dudiFormData.no}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, no: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nama DUDI / Perusahaan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: ABS Komputer"
                    value={dudiFormData.namaDudi}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, namaDudi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Maksimal Siswa (Kuota)
                  </label>
                  <input
                    type="number"
                    value={dudiFormData.maksimalSiswa}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, maksimalSiswa: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Pimpinan / Pemilik
                  </label>
                  <input
                    type="text"
                    placeholder="Nama pimpinan"
                    value={dudiFormData.pimpinan}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, pimpinan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Jenis DUDI
                  </label>
                  <select
                    value={dudiFormData.jenisDudi}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, jenisDudi: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Mandiri">Mandiri</option>
                    <option value="CV/PT">CV / PT</option>
                    <option value="Industri">Industri</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Bidang Pekerjaan (Pisahkan dengan koma jika ganda)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Teknisi / Mekanik,Jasa,Penjualan"
                  value={dudiFormData.bidangPekerjaan}
                  onChange={(e) => setDudiFormData({ ...dudiFormData, bidangPekerjaan: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Alamat Lengkap *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Alamat jalan, desa, kecamatan, kabupaten, kode pos"
                  value={dudiFormData.alamat}
                  onChange={(e) => setDudiFormData({ ...dudiFormData, alamat: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kabupaten / Kota
                  </label>
                  <select
                    value={dudiFormData.kabupaten}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, kabupaten: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Kab. Brebes">Kab. Brebes</option>
                    <option value="Kab. Tegal">Kab. Tegal</option>
                    <option value="Kota Tegal">Kota Tegal</option>
                    <option value="Kab. Banyumas">Kab. Banyumas</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Latitude (Lintang)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dudiFormData.latitude}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Longitude (Bujur)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={dudiFormData.longitude}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-3 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Pastikan koordinat akurat agar pin muncul tepat di peta GIS sekolah.</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${dudiFormData.latitude || -7.0125},${dudiFormData.longitude || 109.0084}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-300 hover:border-red-500 text-slate-700 hover:text-red-600 text-xs font-semibold transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Cek Lokasi di Google Maps</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    No. Hp / Kontak
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={dudiFormData.noHp}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, noHp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kontribusi Kemitraan
                  </label>
                  <input
                    type="text"
                    placeholder="Ada / Tidak Ada"
                    value={dudiFormData.jaminan}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, jaminan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Alokasi Dana
                  </label>
                  <input
                    type="text"
                    placeholder="-"
                    value={dudiFormData.nominal}
                    onChange={(e) => setDudiFormData({ ...dudiFormData, nominal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDudiModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Simpan DUDI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL TAMBAH FOTO GALERI --- */}
      {galeriModalOpen && (
        <div
          onClick={() => setGaleriModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6"
          >
            <button
              onClick={() => setGaleriModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Tambah Foto Dokumentasi PKL
            </h2>

            <form onSubmit={handleSaveGaleri} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Foto / Kegiatan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Monitoring Siswa di Era Network Center"
                  value={newGaleriItem.judul}
                  onChange={(e) => setNewGaleriItem({ ...newGaleriItem, judul: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={newGaleriItem.kategori}
                    onChange={(e) => setNewGaleriItem({ ...newGaleriItem, kategori: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-hidden"
                  >
                    <option value="Kegiatan PKL">Kegiatan PKL</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="MoU Kemitraan">MoU Kemitraan</option>
                    <option value="Kunjungan Industri">Kunjungan Industri</option>
                    <option value="Penyerahan Siswa">Penyerahan Siswa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="text"
                    value={newGaleriItem.tanggal}
                    onChange={(e) => setNewGaleriItem({ ...newGaleriItem, tanggal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  placeholder="Songgom / Slawi / Purwokerto"
                  value={newGaleriItem.lokasi}
                  onChange={(e) => setNewGaleriItem({ ...newGaleriItem, lokasi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL Gambar / Foto (HTTPS) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newGaleriItem.imageUrl}
                  onChange={(e) => setNewGaleriItem({ ...newGaleriItem, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Kegiatan
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat kegiatan..."
                  value={newGaleriItem.deskripsi}
                  onChange={(e) => setNewGaleriItem({ ...newGaleriItem, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGaleriModalOpen(false)}
                  className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-medium hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
                >
                  Simpan Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Map Preview Modal */}
      {previewMapDudi && (
        <AdminMapModal
          dudi={previewMapDudi}
          schoolConfig={schoolConfig}
          onClose={() => setPreviewMapDudi(null)}
        />
      )}
    </div>
  );
};

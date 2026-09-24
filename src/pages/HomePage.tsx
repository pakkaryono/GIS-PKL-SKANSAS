import React, { useState } from 'react';
import { DudiMitra, SchoolConfig, ActivePage, GaleriItem } from '../types';
import { MapComponent } from '../components/MapComponent';
import { VideoSection } from '../components/VideoSection';
import { calculateDistance, formatDistance, getCategoryBadgeColor } from '../lib/geoUtils';
import {
  Search,
  MapPin,
  Building2,
  Users,
  Compass,
  ArrowRight,
  Route,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Award,
  ChevronRight,
  ExternalLink,
  Phone,
  Image as ImageIcon,
  Calendar,
  ZoomIn,
  X
} from 'lucide-react';

interface HomePageProps {
  dudiList: DudiMitra[];
  schoolConfig: SchoolConfig;
  galeriList?: GaleriItem[];
  setActivePage: (page: ActivePage) => void;
  onSelectDudiForDetail: (dudi: DudiMitra) => void;
  onApplyHomeFilter: (kabupaten: string, radius: number, bidang: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  dudiList,
  schoolConfig,
  galeriList = [],
  setActivePage,
  onSelectDudiForDetail,
  onApplyHomeFilter,
}) => {
  const [quickSearch, setQuickSearch] = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState('');
  const [selectedRadius, setSelectedRadius] = useState<number>(0);
  const [selectedBidang, setSelectedBidang] = useState('');
  const [selectedGalleryPhoto, setSelectedGalleryPhoto] = useState<GaleriItem | null>(null);

  // Total Quota Calculation
  const totalQuota = dudiList.reduce((acc, curr) => acc + (curr.maksimalSiswa || 0), 0);
  const distinctKabupaten = Array.from(new Set(dudiList.map((d) => d.kabupaten).filter(Boolean)));

  // Calculate top nearest DUDI from SMKN 1 Songgom
  const dudiWithDistance = dudiList.map((d) => ({
    ...d,
    jarakKm: calculateDistance(
      schoolConfig.latitude,
      schoolConfig.longitude,
      d.latitude,
      d.longitude
    ),
  }));

  const nearestDudi = [...dudiWithDistance]
    .sort((a, b) => (a.jarakKm || 0) - (b.jarakKm || 0))
    .slice(0, 6);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyHomeFilter(selectedKabupaten, selectedRadius, selectedBidang);
    setActivePage('dudi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-rose-700 text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 shadow-md">
        {/* Subtle background decorative shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-8">
          {/* Media Edukasi & Pengenalan (Paling Atas di Header) */}
          <VideoSection inHero={true} />

          <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold tracking-wide uppercase border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Sistem Informasi Geografis PKL Resmi</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              {schoolConfig.tagline}
            </h1>

            <p className="text-sm sm:text-base text-red-100 max-w-2xl mx-auto leading-relaxed">
              Temukan Dunia Usaha dan Dunia Industri (DUDI) mitra terverifikasi <strong>{schoolConfig.namaSekolah}</strong> dengan navigasi akurat dari titik pusat sekolah di Kecamatan Songgom.
            </p>
          </div>

          {/* Quick Search & Filter Card (Requirement: Filter berdasarkan Kabupaten, Jarak, Bidang Pekerjaan) */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-slate-100 text-slate-800">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <Compass className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Pencarian Terarah Tempat PKL
              </h2>
              <span className="text-xs text-slate-400 hidden sm:inline">• Diukur dari Titik SMKN 1 Songgom</span>
            </div>

            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Filter 1: Kabupaten */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Kabupaten / Kota
                </label>
                <select
                  value={selectedKabupaten}
                  onChange={(e) => setSelectedKabupaten(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden bg-slate-50 cursor-pointer"
                >
                  <option value="">Semua Kabupaten</option>
                  <option value="Kab. Brebes">Kab. Brebes</option>
                  <option value="Kab. Tegal">Kab. Tegal</option>
                  <option value="Kota Tegal">Kota Tegal</option>
                  <option value="Kab. Banyumas">Kab. Banyumas</option>
                </select>
              </div>

              {/* Filter 2: Jarak dari Sekolah */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Jarak dari SMKN 1 Songgom
                </label>
                <select
                  value={selectedRadius}
                  onChange={(e) => setSelectedRadius(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden bg-slate-50 cursor-pointer"
                >
                  <option value={0}>Semua Jarak</option>
                  <option value={5}>&lt; 5 KM (Sangat Dekat)</option>
                  <option value={10}>&lt; 10 KM (Dekat)</option>
                  <option value={20}>&lt; 20 KM (Sedang)</option>
                  <option value={35}>&lt; 35 KM (Antar Kota)</option>
                </select>
              </div>

              {/* Filter 3: Bidang Pekerjaan */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Bidang Pekerjaan
                </label>
                <select
                  value={selectedBidang}
                  onChange={(e) => setSelectedBidang(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden bg-slate-50 cursor-pointer"
                >
                  <option value="">Semua Bidang</option>
                  <option value="teknisi">Teknisi / Mekanik</option>
                  <option value="jasa">Jasa & Servis</option>
                  <option value="penjualan">Penjualan Komputer</option>
                  <option value="jaringan">Jaringan / Network</option>
                  <option value="percetakan">Percetakan / Digital Printing</option>
                </select>
              </div>

              {/* Submit CTA Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>Terapkan Filter</span>
                </button>
              </div>
            </form>

            {/* Quick Badge shortcuts */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Pencarian Cepat:</span>
              <button
                onClick={() => {
                  onApplyHomeFilter('', 5, '');
                  setActivePage('dudi');
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-600 transition text-[11px] cursor-pointer"
              >
                📍 Terdekat &lt; 5 KM
              </button>
              <button
                onClick={() => {
                  onApplyHomeFilter('Kab. Brebes', 0, '');
                  setActivePage('dudi');
                }}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-600 transition text-[11px] cursor-pointer"
              >
                Kabupaten Brebes
              </button>
              <button
                onClick={() => {
                  onApplyHomeFilter('', 0, 'teknisi');
                  setActivePage('dudi');
                }}
                className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 transition text-[11px] cursor-pointer"
              >
                🔧 Teknisi / Mekanik
              </button>
              <button
                onClick={() => {
                  onApplyHomeFilter('', 0, 'jaringan');
                  setActivePage('dudi');
                }}
                className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition text-[11px] cursor-pointer"
              >
                🌐 Jaringan & Network
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {dudiList.length}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                DUDI Mitra Terverifikasi
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalQuota}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Total Kuota Siswa PKL
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {distinctKabupaten.length || 4}
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Wilayah Kabupaten / Kota
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Route className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                GIS 100%
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Geolokasi & Rute Akurat
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Pengajuan PKL Siswa (Panduan Siswa - Ditempatkan sebelum Peta Interaktif Sebaran DUDI) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
              Panduan Siswa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-1">
              Langkah Mudah Mencari & Konsultasi Tempat PKL TKJ
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Prosedur resmi pemilihan lokasi PKL bagi siswa SMK Negeri 1 Songgom melalui sistem GIS PKL.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 relative">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center mb-3 text-sm shadow-md">
                1
              </div>
              <h3 className="font-bold text-sm text-white mb-1.5">
                Cari & Filter DUDI
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Gunakan fitur pencarian berdasarkan kabupaten, bidang pekerjaan, dan radius jarak terdekat dari sekolah atau rumah Anda.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 relative">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center mb-3 text-sm shadow-md">
                2
              </div>
              <h3 className="font-bold text-sm text-white mb-1.5">
                Cek Kuota & Pahami
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Periksa ketersediaan kuota maksimal siswa pada profil DUDI mitra dan pahami bidang pekerjaan dan jarak serta kemungkinan lainnya.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 relative">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center mb-3 text-sm shadow-md">
                3
              </div>
              <h3 className="font-bold text-sm text-white mb-1.5">
                Konsultasi Pokja PKL & Ka. Komli TKJ
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Konsultasi kompetensi ke Pokja PKL & Ka. Komli TKJ SMKN 1 Songgom untuk mendapatkan rekomendasi tempat PKL.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-red-500/40 relative">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white font-extrabold flex items-center justify-center mb-3 text-sm shadow-md">
                4
              </div>
              <h3 className="font-bold text-sm text-red-400 mb-1.5">
                DILARANG Chat Langsung ke Pimpinan DUDI Mitra
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                DILARANG chat langsung ke Pimpinan DUDI Mitra sebelum masa pendaftaran PKL dibuka dan jika chat ke Pimpinan DUDI Mitra, ketik dengan baik dan sopan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive GIS Map Section Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              <MapPin className="w-4 h-4" />
              <span>Peta Interaktif Sebaran DUDI</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Visualisasi Tempat PKL Berbasis GIS
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Titik pusat koordinat navigasi berada di <strong>{schoolConfig.namaSekolah}</strong>. Marker dikelompokkan dengan warna khas untuk setiap bidang keahlian.
            </p>
          </div>

          <button
            onClick={() => {
              setActivePage('map');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition cursor-pointer self-start md:self-auto shadow-sm"
          >
            <span>Buka Peta Layar Penuh</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Embedded Map Component */}
        <MapComponent
          dudiList={dudiList}
          schoolConfig={schoolConfig}
          heightClass="h-[420px]"
          showFilters={true}
          onSelectDudi={onSelectDudiForDetail}
        />
      </section>

      {/* Nearest Recommendations DUDI Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Rekomendasi Terdekat
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              DUDI Paling Dekat dari SMKN 1 Songgom
            </h2>
          </div>

          <button
            onClick={() => {
              setActivePage('dudi');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat Semua DUDI ({dudiList.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearestDudi.map((dudi) => {
            const badgeColor = getCategoryBadgeColor(dudi.bidangPekerjaan);
            const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${schoolConfig.latitude},${schoolConfig.longitude}&destination=${dudi.latitude},${dudi.longitude}`;

            return (
              <div
                key={dudi.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border}`}
                    >
                      {dudi.jenisDudi || 'Mandiri'}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-extrabold border border-red-200">
                      <Route className="w-3 h-3" />
                      {formatDistance(dudi.jarakKm)}
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectDudiForDetail(dudi)}
                    className="font-bold text-base text-slate-900 group-hover:text-red-600 transition cursor-pointer leading-snug mb-1"
                  >
                    {dudi.namaDudi}
                  </h3>

                  <div className="text-xs text-slate-600 space-y-1 mb-3">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Pimpinan:</span>
                      <strong className="text-slate-800">{dudi.pimpinan || '-'}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Kuota Siswa:</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {dudi.maksimalSiswa} Siswa
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 pt-1 line-clamp-1">
                      <strong>Bidang:</strong> {dudi.bidangPekerjaan || '-'}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 pt-0.5">
                      <strong>Alamat:</strong> {dudi.alamat}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onSelectDudiForDetail(dudi)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer text-center"
                  >
                    Detail Lengkap
                  </button>
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1 shadow-xs"
                    title="Buka Navigasi Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Rute</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Galeri Dokumentasi PKL TKJ (Ditempatkan di bawah DUDI Paling Dekat dari SMKN 1 Songgom) */}
      {galeriList && galeriList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Dokumentasi Vokasi & Kemitraan</span>
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                Galeri Kegiatan Siswa & DUDI Mitra
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Potret kegiatan PKL siswa TKJ, penyerahan ke industri, dan monitoring berkala guru pembimbing.
              </p>
            </div>

            <button
              onClick={() => {
                setActivePage('galeri');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Lihat Semua ({galeriList.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grid Galeri: Tampilan 2 Kolom saat diakses di HP (sesuai gambar) & responsif ke tablet/desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {galeriList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedGalleryPhoto(item)}
                className="bg-white rounded-2xl sm:rounded-3xl p-2.5 sm:p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-red-200 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.target as any).src =
                          'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/95 backdrop-blur-xs text-red-700 shadow-xs border border-white/60">
                        {item.kategori}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                      <ZoomIn className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" />
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 p-1 rounded-md bg-black/50 text-white backdrop-blur-xs flex items-center justify-center sm:hidden">
                      <ZoomIn className="w-3 h-3" />
                    </div>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-red-600 transition line-clamp-2 leading-snug mt-2">
                    {item.judul}
                  </h3>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px] text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1 truncate">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.tanggal}</span>
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="flex items-center gap-1 truncate text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{item.lokasi}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-red-600">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3 h-3" />
                    <span>Perbesar</span>
                  </span>
                  <span>↗</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal: Zoom Foto di Tengah Layar */}
      {selectedGalleryPhoto && (
        <div
          onClick={() => setSelectedGalleryPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col"
          >
            <button
              onClick={() => setSelectedGalleryPhoto(null)}
              className="absolute top-3 right-3 z-20 p-2 sm:p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition shadow-md cursor-pointer"
              title="Tutup Zoom"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative bg-slate-950 flex items-center justify-center max-h-[55vh] sm:max-h-[65vh] overflow-hidden">
              <img
                src={selectedGalleryPhoto.imageUrl}
                alt={selectedGalleryPhoto.judul}
                className="w-full max-h-[55vh] sm:max-h-[65vh] object-contain"
                onError={(e) => {
                  (e.target as any).src =
                    'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80';
                }}
              />
            </div>

            <div className="p-4 sm:p-6 space-y-2 overflow-y-auto bg-white">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                  {selectedGalleryPhoto.kategori}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedGalleryPhoto.tanggal}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedGalleryPhoto.lokasi}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {selectedGalleryPhoto.judul}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                {selectedGalleryPhoto.deskripsi}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

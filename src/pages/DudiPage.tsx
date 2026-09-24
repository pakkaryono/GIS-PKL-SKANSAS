import React, { useState, useMemo } from 'react';
import { DudiMitra, SchoolConfig } from '../types';
import { GooglePagination } from '../components/GooglePagination';
import { calculateDistance, formatDistance, getCategoryBadgeColor } from '../lib/geoUtils';
import {
  Search,
  Filter,
  MapPin,
  Building2,
  Users,
  Compass,
  Route,
  ExternalLink,
  Phone,
  LayoutGrid,
  Table as TableIcon,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  X
} from 'lucide-react';

interface DudiPageProps {
  dudiList: DudiMitra[];
  schoolConfig: SchoolConfig;
  initialFilters?: {
    kabupaten: string;
    radius: number;
    bidang: string;
  };
  onSelectDudiForDetail: (dudi: DudiMitra) => void;
}

export const DudiPage: React.FC<DudiPageProps> = ({
  dudiList,
  schoolConfig,
  initialFilters,
  onSelectDudiForDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKabupaten, setSelectedKabupaten] = useState(initialFilters?.kabupaten || '');
  const [selectedRadius, setSelectedRadius] = useState<number>(initialFilters?.radius || 0);
  const [selectedBidang, setSelectedBidang] = useState(initialFilters?.bidang || '');
  const [selectedJenis, setSelectedJenis] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Compute calculated distance from SMKN 1 Songgom for each DUDI
  const dudiWithDistance = useMemo(() => {
    return dudiList.map((d) => ({
      ...d,
      jarakKm: calculateDistance(
        schoolConfig.latitude,
        schoolConfig.longitude,
        d.latitude,
        d.longitude
      ),
    }));
  }, [dudiList, schoolConfig.latitude, schoolConfig.longitude]);

  // Filter list based on criteria
  const filteredList = useMemo(() => {
    return dudiWithDistance.filter((dudi) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = dudi.namaDudi.toLowerCase().includes(q);
        const matchAddr = dudi.alamat.toLowerCase().includes(q);
        const matchPim = dudi.pimpinan.toLowerCase().includes(q);
        if (!matchName && !matchAddr && !matchPim) return false;
      }

      // 2. Kabupaten Filter
      if (selectedKabupaten && dudi.kabupaten !== selectedKabupaten) {
        return false;
      }

      // 3. Jarak / Radius Filter (diukur dari SMKN 1 Songgom)
      if (selectedRadius > 0) {
        if ((dudi.jarakKm || 0) > selectedRadius) return false;
      }

      // 4. Bidang Pekerjaan Filter
      if (selectedBidang) {
        const b = (dudi.bidangPekerjaan || '').toLowerCase();
        if (!b.includes(selectedBidang.toLowerCase())) return false;
      }

      // 5. Jenis DUDI Filter
      if (selectedJenis && dudi.jenisDudi !== selectedJenis) {
        return false;
      }

      return true;
    });
  }, [
    dudiWithDistance,
    searchQuery,
    selectedKabupaten,
    selectedRadius,
    selectedBidang,
    selectedJenis,
  ]);

  // Reset page when filters change
  const handleFilterChange = (setter: (val: any) => void, val: any) => {
    setter(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedKabupaten('');
    setSelectedRadius(0);
    setSelectedBidang('');
    setSelectedJenis('');
    setCurrentPage(1);
  };

  // Pagination Slice
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedDudi = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  const hasActiveFilters =
    searchQuery || selectedKabupaten || selectedRadius > 0 || selectedBidang || selectedJenis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Intro */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>Katalog Mitra Industri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Daftar DUDI Mitra PKL SMKN 1 Songgom
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Gunakan filter pencarian di bawah untuk menemukan tempat PKL yang relevan berdasarkan lokasi kabupaten, bidang keahlian, dan jarak tempuh dari sekolah.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Kartu</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Tabel Rinci</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Box (Kabupaten, Jarak, Bidang Pekerjaan) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Filter className="w-4 h-4 text-red-600" />
            <span>Filter Kategori Pencarian Terarah</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 1. Keyword search */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Nama DUDI / Alamat
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama dudi, pimpinan..."
                value={searchQuery}
                onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden bg-slate-50"
              />
            </div>
          </div>

          {/* 2. Filter Kabupaten */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Kabupaten / Kota
            </label>
            <select
              value={selectedKabupaten}
              onChange={(e) => handleFilterChange(setSelectedKabupaten, e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-red-500 focus:outline-hidden bg-slate-50 cursor-pointer"
            >
              <option value="">Semua Kabupaten</option>
              <option value="Kab. Brebes">Kab. Brebes</option>
              <option value="Kab. Tegal">Kab. Tegal</option>
              <option value="Kota Tegal">Kota Tegal</option>
              <option value="Kab. Banyumas">Kab. Banyumas</option>
            </select>
          </div>

          {/* 3. Filter Jarak (diukur dari sekolah) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Jarak dari SMKN 1 Songgom
            </label>
            <select
              value={selectedRadius}
              onChange={(e) => handleFilterChange(setSelectedRadius, Number(e.target.value))}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-red-500 focus:outline-hidden bg-slate-50 cursor-pointer"
            >
              <option value={0}>Semua Radius Jarak</option>
              <option value={5}>&lt; 5 KM (Sekitar Songgom)</option>
              <option value={10}>&lt; 10 KM (Songgom & Sekitarnya)</option>
              <option value={20}>&lt; 20 KM (Brebes / Slawi)</option>
              <option value={35}>&lt; 35 KM (Tegal / Margasari)</option>
              <option value={60}>&lt; 60 KM (Banyumas / Luar Kota)</option>
            </select>
          </div>

          {/* 4. Filter Bidang Pekerjaan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Bidang Pekerjaan
            </label>
            <select
              value={selectedBidang}
              onChange={(e) => handleFilterChange(setSelectedBidang, e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-red-500 focus:outline-hidden bg-slate-50 cursor-pointer"
            >
              <option value="">Semua Bidang</option>
              <option value="teknisi">Teknisi / Mekanik</option>
              <option value="jasa">Jasa & Servis</option>
              <option value="penjualan">Penjualan Komputer</option>
              <option value="jaringan">Jaringan / Network</option>
              <option value="percetakan">Percetakan</option>
            </select>
          </div>

          {/* 5. Filter Jenis DUDI */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Jenis Perusahaan
            </label>
            <select
              value={selectedJenis}
              onChange={(e) => handleFilterChange(setSelectedJenis, e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:border-red-500 focus:outline-hidden bg-slate-50 cursor-pointer"
            >
              <option value="">Semua Jenis</option>
              <option value="Mandiri">Mandiri</option>
              <option value="CV/PT">CV / PT</option>
              <option value="Industri">Industri</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tag Indicators */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
            <span className="text-slate-500">Filter Aktif:</span>
            {selectedKabupaten && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-medium">
                {selectedKabupaten}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange(setSelectedKabupaten, '')}
                />
              </span>
            )}
            {selectedRadius > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-medium">
                Maks. {selectedRadius} KM
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange(setSelectedRadius, 0)}
                />
              </span>
            )}
            {selectedBidang && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-medium">
                {selectedBidang}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange(setSelectedBidang, '')}
                />
              </span>
            )}
            {selectedJenis && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px] font-medium">
                {selectedJenis}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange(setSelectedJenis, '')}
                />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count & Notice */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div>
          Ditemukan <strong className="text-slate-900">{filteredList.length}</strong> dari{' '}
          <strong>{dudiList.length}</strong> total DUDI Mitra.
        </div>
        <div className="text-slate-500 hidden sm:inline">
          Urutan otomatis berdasarkan nomor registrasi resmi BKK
        </div>
      </div>

      {/* Main Content: Card Grid View or Table View */}
      {filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-800">
            Tidak Ada DUDI yang Sesuai dengan Kriteria
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Coba sesuaikan filter pencarian Anda, perluas radius jarak atau pilih Semua Kabupaten untuk melihat daftar lainnya.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paginatedDudi.map((dudi) => {
            const badgeColor = getCategoryBadgeColor(dudi.bidangPekerjaan);
            const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${schoolConfig.latitude},${schoolConfig.longitude}&destination=${dudi.latitude},${dudi.longitude}`;

            return (
              <div
                key={dudi.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar with Badges */}
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border}`}
                    >
                      {dudi.jenisDudi || 'Mandiri'}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-extrabold border border-red-200">
                      <Route className="w-3 h-3" />
                      {formatDistance(dudi.jarakKm)}
                    </span>
                  </div>

                  {/* Company Name */}
                  <h3
                    onClick={() => onSelectDudiForDetail(dudi)}
                    className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition cursor-pointer leading-snug line-clamp-2 mb-2"
                  >
                    {dudi.no ? `${dudi.no}. ` : ''}
                    {dudi.namaDudi}
                  </h3>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Pimpinan:</span>
                      <strong className="text-slate-800 line-clamp-1">{dudi.pimpinan || '-'}</strong>
                    </div>

                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Maks. Kuota:</span>
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

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onSelectDudiForDetail(dudi)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer text-center"
                  >
                    Detail
                  </button>
                  <a
                    href={gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1 shadow-xs"
                    title="Navigasi Google Maps dari SMKN 1 Songgom"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Rute</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-3">Nama DUDI</th>
                  <th className="py-3 px-3 text-center">Maks. Siswa</th>
                  <th className="py-3 px-3">Pimpinan</th>
                  <th className="py-3 px-3">Jenis</th>
                  <th className="py-3 px-3">Bidang Pekerjaan</th>
                  <th className="py-3 px-3">Alamat</th>
                  <th className="py-3 px-3 text-center">Jarak SMKN 1</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {paginatedDudi.map((dudi) => {
                  const badgeColor = getCategoryBadgeColor(dudi.bidangPekerjaan);
                  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${schoolConfig.latitude},${schoolConfig.longitude}&destination=${dudi.latitude},${dudi.longitude}`;

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
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor.bg} ${badgeColor.text}`}
                        >
                          {dudi.jenisDudi || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate" title={dudi.bidangPekerjaan}>
                        {dudi.bidangPekerjaan || '-'}
                      </td>
                      <td className="py-3 px-3 max-w-[220px] truncate" title={dudi.alamat}>
                        {dudi.alamat}
                      </td>
                      <td className="py-3 px-3 text-center font-extrabold text-red-600 whitespace-nowrap">
                        {formatDistance(dudi.jarakKm)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectDudiForDetail(dudi)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                          >
                            Detail
                          </button>
                          <a
                            href={gmapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                            title="Rute Maps"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Google-Style Pagination (Requested requirement) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs px-4">
        <GooglePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};

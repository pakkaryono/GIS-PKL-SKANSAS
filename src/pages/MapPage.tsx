import React, { useState } from 'react';
import { DudiMitra, SchoolConfig } from '../types';
import { MapComponent } from '../components/MapComponent';
import { calculateDistance, formatDistance, getCategoryBadgeColor } from '../lib/geoUtils';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Compass,
  Route,
  ExternalLink,
  ChevronRight,
  School,
  Building2,
  Users
} from 'lucide-react';

interface MapPageProps {
  dudiList: DudiMitra[];
  schoolConfig: SchoolConfig;
  onSelectDudiForDetail: (dudi: DudiMitra) => void;
}

export const MapPage: React.FC<MapPageProps> = ({
  dudiList,
  schoolConfig,
  onSelectDudiForDetail,
}) => {
  const [selectedDudiId, setSelectedDudiId] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKab, setSelectedKab] = useState('all');

  // Compute distances
  const dudiWithDistance = dudiList.map((d) => ({
    ...d,
    jarakKm: calculateDistance(
      schoolConfig.latitude,
      schoolConfig.longitude,
      d.latitude,
      d.longitude
    ),
  }));

  const filteredDudi = dudiWithDistance.filter((d) => {
    if (selectedKab !== 'all' && d.kabupaten !== selectedKab) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        d.namaDudi.toLowerCase().includes(q) ||
        d.alamat.toLowerCase().includes(q) ||
        d.bidangPekerjaan.toLowerCase().includes(q) ||
        d.pimpinan.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Sistem Informasi Geografis PKL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Peta Lokasi & Sebaran DUDI Mitra
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Pusat koordinat navigasi berpusat di <strong>{schoolConfig.namaSekolah}</strong> ({schoolConfig.kecamatan}, {schoolConfig.kabupaten}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <School className="w-4 h-4 text-red-600" />
            <span>Pusat: {schoolConfig.latitude.toFixed(4)}, {schoolConfig.longitude.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left GIS Map View (8 cols) */}
        <div className="lg:col-span-8">
          <MapComponent
            dudiList={dudiList}
            schoolConfig={schoolConfig}
            selectedDudiId={selectedDudiId}
            onSelectDudi={(dudi) => setSelectedDudiId(dudi.id)}
            heightClass="h-[620px]"
            showFilters={true}
          />
        </div>

        {/* Right Sidebar List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 flex flex-col h-[620px]">
          {/* Header of Sidebar */}
          <div className="pb-3 border-b border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-red-600" />
                <span>Daftar Titik Lokasi ({filteredDudi.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Urut Jarak
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari DUDI atau kota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Scrollable list of DUDIs */}
          <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
            {filteredDudi.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Tidak ada DUDI yang cocok dengan filter pencarian.
              </div>
            ) : (
              filteredDudi
                .sort((a, b) => (a.jarakKm || 0) - (b.jarakKm || 0))
                .map((dudi) => {
                  const badgeColor = getCategoryBadgeColor(dudi.bidangPekerjaan);
                  const isSelected = selectedDudiId === dudi.id;

                  return (
                    <div
                      key={dudi.id}
                      onClick={() => setSelectedDudiId(dudi.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer text-left ${
                        isSelected
                          ? 'border-red-500 bg-red-50/50 shadow-xs ring-1 ring-red-400'
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span
                          className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${badgeColor.bg} ${badgeColor.text}`}
                        >
                          {dudi.jenisDudi || 'Mandiri'}
                        </span>
                        <span className="text-xs font-extrabold text-red-600 flex items-center gap-0.5">
                          <Route className="w-3 h-3" />
                          {formatDistance(dudi.jarakKm)}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-1">
                        {dudi.namaDudi}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {dudi.alamat}
                      </p>

                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          Kuota: <strong>{dudi.maksimalSiswa} Siswa</strong>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDudiForDetail(dudi);
                          }}
                          className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Info Lengkap</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

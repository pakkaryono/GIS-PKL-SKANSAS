import React, { useState } from 'react';
import { GaleriItem } from '../types';
import { Image as ImageIcon, Calendar, MapPin, Tag, ZoomIn, X } from 'lucide-react';

interface GaleriPageProps {
  galeriList: GaleriItem[];
}

export const GaleriPage: React.FC<GaleriPageProps> = ({ galeriList }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GaleriItem | null>(null);

  const categories = ['all', 'Kegiatan PKL', 'Monitoring', 'MoU Kemitraan', 'Kunjungan Industri', 'Penyerahan Siswa'];

  const filteredGaleri = galeriList.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.kategori === activeCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>Dokumentasi Vokasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Galeri Kegiatan PKL & Kemitraan Industri
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Potret aktivitas praktik kerja lapangan siswa, kunjungan monitoring guru pembimbing, dan kerjasama DUDI mitra SMKN 1 Songgom.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Galeri Grid: 2 Kolom saat diakses di HP (sesuai gambar referensi) & responsif ke layar lebar */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredGaleri.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedPhoto(item)}
            className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={item.imageUrl}
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as any).src =
                      'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white/95 backdrop-blur-xs text-red-700 shadow-xs border border-red-100">
                    {item.kategori}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="p-2 rounded-full bg-black/40 backdrop-blur-xs">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="p-3 sm:p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Calendar className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="truncate">{item.tanggal}</span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-red-600 transition">
                  {item.judul}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>
            </div>

            <div className="px-3 pb-3 sm:px-4 sm:pb-4 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-red-600 group-hover:text-red-700">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3 h-3" />
                <span>Lihat Zoom</span>
              </span>
              <span className="text-xs">↗</span>
            </div>
          </div>
        ))}
      </div>

      {filteredGaleri.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Tidak Ada Foto Ditemukan</h3>
          <p className="text-xs text-slate-500">
            Belum ada dokumentasi untuk kategori yang dipilih.
          </p>
        </div>
      )}

      {/* Lightbox Zoom Modal: Ditengah Layar dengan backdrop blur */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border border-white/20 animate-scaleUp max-h-[90vh] flex flex-col"
          >
            {/* Close Button Floating */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition cursor-pointer shadow-lg"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Zoomed Image Container */}
            <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden max-h-[55vh] sm:max-h-[60vh]">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.judul}
                className="w-full h-full max-h-[55vh] sm:max-h-[60vh] object-contain"
              />
            </div>

            {/* Photo Details */}
            <div className="p-4 sm:p-6 space-y-3 overflow-y-auto">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                  {selectedPhoto.kategori}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {selectedPhoto.tanggal}
                </span>
                {selectedPhoto.lokasi && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedPhoto.lokasi}
                  </span>
                )}
              </div>

              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                {selectedPhoto.judul}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {selectedPhoto.deskripsi || 'Dokumentasi resmi kemitraan dan praktik kerja lapangan SMKN 1 Songgom.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

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

      {/* Galeri Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGaleri.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedPhoto(item)}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col"
          >
            <div className="relative aspect-video overflow-hidden bg-slate-100">
              <img
                src={item.imageUrl}
                alt={item.judul}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                onError={(e) => {
                  (e.target as any).src =
                    'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-red-700 shadow-xs">
                  {item.kategori}
                </span>
              </div>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                <ZoomIn className="w-8 h-8" />
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.tanggal}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.lokasi}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-red-600 transition">
                  {item.judul}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {item.deskripsi}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-red-600">
                <span>Perbesar Foto</span>
                <span>↗</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl border border-slate-200"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={selectedPhoto.imageUrl}
              alt={selectedPhoto.judul}
              className="w-full max-h-[60vh] object-cover"
            />

            <div className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                  {selectedPhoto.kategori}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedPhoto.tanggal} • {selectedPhoto.lokasi}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedPhoto.judul}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {selectedPhoto.deskripsi}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

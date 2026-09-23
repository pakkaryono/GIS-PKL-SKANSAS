import React from 'react';
import { DudiMitra, SchoolConfig } from '../types';
import { calculateDistance, formatDistance, getCategoryBadgeColor } from '../lib/geoUtils';
import {
  X,
  MapPin,
  Building2,
  Users,
  Route,
  ExternalLink,
  Phone,
  ShieldCheck,
  Coins,
  Compass,
  CheckCircle2
} from 'lucide-react';

interface DudiDetailModalProps {
  dudi: DudiMitra | null;
  schoolConfig: SchoolConfig;
  onClose: () => void;
}

export const DudiDetailModal: React.FC<DudiDetailModalProps> = ({
  dudi,
  schoolConfig,
  onClose,
}) => {
  if (!dudi) return null;

  const distanceKm = calculateDistance(
    schoolConfig.latitude,
    schoolConfig.longitude,
    dudi.latitude,
    dudi.longitude
  );

  const badgeColor = getCategoryBadgeColor(dudi.bidangPekerjaan);
  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${schoolConfig.latitude},${schoolConfig.longitude}&destination=${dudi.latitude},${dudi.longitude}`;
  const cleanPhone = (dudi.noHp || '').replace(/[^0-9]/g, '');
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}` : '';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8"
      >
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-red-800 via-red-600 to-rose-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Tutup Detail"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
              No. {dudi.no || '•'} • {dudi.jenisDudi || 'Mandiri'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-red-700 text-[11px] font-bold">
              {dudi.kabupaten || 'Kab. Brebes'}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold pr-8 leading-tight">
            {dudi.namaDudi}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-red-100">
            <span className="flex items-center gap-1">
              <Route className="w-3.5 h-3.5" />
              Jarak dari Sekolah: <strong className="text-white">{formatDistance(distanceKm)}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Kuota Siswa: <strong className="text-white">{dudi.maksimalSiswa} Orang</strong>
            </span>
          </div>
        </div>

        {/* Content Body with the 12 Column Attributes */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Pimpinan / Pemilik
              </span>
              <p className="text-sm font-bold text-slate-900">
                {dudi.pimpinan || '-'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Bidang Pekerjaan
              </span>
              <p className="text-xs font-semibold text-slate-800">
                <span
                  className={`inline-block px-2 py-0.5 rounded-md ${badgeColor.bg} ${badgeColor.text}`}
                >
                  {dudi.bidangPekerjaan || '-'}
                </span>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Jaminan Masuk PKL
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>{dudi.jaminan || 'Tidak Ada'}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Nominal / Biaya
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>{dudi.nominal || '-'}</span>
              </div>
            </div>
          </div>

          {/* Alamat & GIS Coordinates */}
          <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200/70 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
              <MapPin className="w-4 h-4 text-red-600" />
              <span>Alamat Lengkap & Geografis GIS</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {dudi.alamat}
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-red-200/60 text-[11px] font-mono text-slate-600">
              <div>
                <strong>Latitude (Lintang):</strong> {dudi.latitude || '-'}
              </div>
              <div>
                <strong>Longitude (Bujur):</strong> {dudi.longitude || '-'}
              </div>
            </div>
          </div>

          {/* Contact info */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="text-[11px] text-slate-400 block font-bold uppercase">
                  Kontak Telepon / WhatsApp
                </span>
                <span className="font-semibold text-slate-800">
                  {dudi.noHp || 'Belum dicantumkan'}
                </span>
              </div>
            </div>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <span>Chat WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2 px-4 rounded-xl border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-medium transition cursor-pointer"
          >
            Tutup
          </button>
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-2 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Panduan Rute Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
};

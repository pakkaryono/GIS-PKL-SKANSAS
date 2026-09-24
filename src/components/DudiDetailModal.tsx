import React, { useEffect } from 'react';
import { DudiMitra, SchoolConfig } from '../types';
import { calculateDistance, formatDistance, getCategoryBadgeColor } from '../lib/geoUtils';
import {
  X,
  MapPin,
  Users,
  Route,
  ExternalLink,
  ShieldCheck,
  Coins,
  Compass,
  MessageSquare
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
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}`
    : '';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-2xs animate-fadeIn"
      aria-modal="true"
      role="dialog"
    >
      {/* Compact card container - will not dominate or cover the whole screen */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-600 p-4 sm:p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Tutup Dialog"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-wrap items-center gap-1.5 mb-1.5 pr-8 text-[10px] font-bold">
            <span className="px-2 py-0.5 rounded-md bg-white/20 uppercase tracking-wide">
              No. {dudi.no || '•'} • {dudi.jenisDudi || 'Mandiri'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white text-red-700">
              {dudi.kabupaten || 'Kab. Brebes'}
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold pr-8 leading-snug">
            {dudi.namaDudi}
          </h2>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-red-100">
            <span className="flex items-center gap-1 font-medium">
              <Route className="w-3.5 h-3.5 text-white" />
              Jarak: <strong className="text-white">{formatDistance(distanceKm)}</strong>
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5 text-white" />
              Kuota: <strong className="text-white">{dudi.maksimalSiswa} Siswa</strong>
            </span>
          </div>
        </div>

        {/* Compact Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto text-xs">
          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Pimpinan
              </span>
              <p className="font-bold text-slate-900 truncate">
                {dudi.pimpinan || '-'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Bidang Pekerjaan
              </span>
              <p className="font-semibold text-slate-800">
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${badgeColor.bg} ${badgeColor.text}`}
                >
                  {dudi.bidangPekerjaan || '-'}
                </span>
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Kontribusi Kemitraan
              </span>
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                <span className="truncate">{dudi.jaminan || 'Tidak Ada'}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                Alokasi Dana
              </span>
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate">{dudi.nominal || '-'}</span>
              </div>
            </div>
          </div>

          {/* Alamat & GIS Coordinates */}
          <div className="p-3 rounded-xl bg-red-50/50 border border-red-200/60 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-red-900 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
              <span>Alamat Lengkap</span>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium text-xs">
              {dudi.alamat}
            </p>
            <div className="flex items-center gap-3 pt-1 border-t border-red-200/50 text-[11px] font-mono text-slate-600">
              <span>Lat: {dudi.latitude?.toFixed(5) || '-'}</span>
              <span>Long: {dudi.longitude?.toFixed(5) || '-'}</span>
            </div>
          </div>

          {/* Contact (if available) */}
          {dudi.noHp && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Kontak Telepon / WA
                </span>
                <span className="font-semibold text-slate-800 truncate block">
                  {dudi.noHp}
                </span>
              </div>
              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Compact Footer Actions */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200/70 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="py-1.5 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-1.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Rute Google Maps</span>
          </a>
        </div>
      </div>
    </div>
  );
};

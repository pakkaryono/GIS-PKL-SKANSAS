import React, { useState } from 'react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { Download, Smartphone, Apple, CheckCircle2, X, ExternalLink, Sparkles } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (outcome) return;
    }
    setShowGuide(true);
  };

  const handleDirectInstallInModal = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setShowGuide(false);
        return;
      }
    }
    // If inside an iframe, open in parent/new window for browser install prompt
    if (window.self !== window.top) {
      window.open(window.location.href, '_blank');
      setShowGuide(false);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 font-bold text-white shadow-sm hover:shadow-md hover:from-red-700 hover:to-rose-700 transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-1.5 text-xs'
        }`}
        title="Instal / Download Aplikasi GIS PKL ke HP Anda"
      >
        <Download className="w-3.5 h-3.5 shrink-0 animate-bounce" />
        <span className="whitespace-nowrap">Instal ke HP</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                <img
                  src="/pwa-192x192.png"
                  alt="GIS PKL"
                  className="w-10 h-10 rounded-lg object-contain"
                  onError={(e) => {
                    (e.target as any).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Instal GIS PKL ke Layar HP
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                    PWA
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  SMK Negeri 1 Songgom Brebes
                </p>
              </div>
            </div>

            {/* Direct Install CTA */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 text-xs text-red-900 mb-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-800">
                <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
                <span>Pemasangan Cepat Tanpa Play Store:</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Aplikasi ini mendukung teknologi <strong>Progressive Web App (PWA)</strong> langsung jalan seperti aplikasi native di Android & iPhone tanpa memakan memori besar.
              </p>
              <button
                onClick={handleDirectInstallInModal}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>Klik Pasang / Download Sekarang</span>
              </button>
            </div>

            {/* Platform Guides */}
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Untuk HP Android (Chrome / Edge / Samsung Internet):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 text-[11px]">
                  <li>Ketuk ikon titik tiga <strong>(⋮)</strong> di pojok kanan atas browser.</li>
                  <li>Pilih menu <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</li>
                  <li>Konfirmasi pemasangan, aplikasi GIS PKL akan langsung muncul di menu HP Anda.</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1.5">
                  <Apple className="w-4 h-4 text-slate-800 shrink-0" />
                  <span>Untuk iPhone / iPad (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 text-[11px]">
                  <li>Buka website ini menggunakan browser <strong>Safari</strong>.</li>
                  <li>Ketuk tombol <strong>Share / Bagikan</strong> (ikon kotak dengan panah atas di bagian bawah).</li>
                  <li>Gulir ke bawah dan ketuk <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
                  <li>Ketuk <strong>Tambah</strong> di pojok kanan atas.</li>
                </ol>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2 px-4 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer text-center"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { usePWAInstall } from '../lib/usePWAInstall';
import { Download, Smartphone, Apple, CheckCircle2, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 font-semibold text-white shadow-md hover:from-red-700 hover:to-rose-700 transition active:scale-95 cursor-pointer ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
        }`}
        title="Instal Aplikasi GIS PKL ke HP"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>Instal Aplikasi HP</span>
      </button>
    );
  }

  // iOS Safari flow or universal fallback button
  return (
    <>
      <button
        onClick={() => setShowGuide(true)}
        className={`flex items-center gap-2 rounded-xl border border-red-200 bg-white font-medium text-red-700 hover:bg-red-50 shadow-sm transition active:scale-95 cursor-pointer ${
          compact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-1.5 text-xs md:text-sm'
        }`}
        title="Pasang di Layar Utama HP (Android & iOS)"
      >
        <Smartphone className="w-4 h-4 text-red-600" />
        <span>Instal ke HP</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                <img src="/pwa-192x192.png" alt="GIS PKL" className="w-10 h-10 rounded-lg" onError={(e)=>{ (e.target as any).style.display = 'none'; }} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Instal GIS PKL ke Layar HP
                </h3>
                <p className="text-xs text-slate-500">
                  SMK Negeri 1 Songgom • PWA Ready
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Aplikasi ini adalah <strong>Progressive Web App (PWA)</strong>. Anda dapat menginstalnya di Android maupun iPhone tanpa perlu Google Play Store atau App Store!
            </p>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                  <Apple className="w-4 h-4 text-slate-800" />
                  <span>Untuk iPhone / iPad (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Buka website ini menggunakan browser <strong>Safari</strong>.</li>
                  <li>Ketuk tombol <strong>Share / Bagikan</strong> (ikon kotak dengan panah atas di bawah layar).</li>
                  <li>Gulir ke bawah lalu pilih <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong>.</li>
                  <li>Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas.</li>
                </ol>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>Untuk Android (Chrome / Edge):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  <li>Ketuk ikon titik tiga <strong>(⋮)</strong> di pojok kanan atas browser.</li>
                  <li>Pilih menu <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.</li>
                  <li>Konfirmasi pemasangan, ikon GIS PKL akan langsung muncul di menu HP Anda.</li>
                </ol>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition cursor-pointer text-center shadow-md"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

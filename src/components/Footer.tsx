import React from 'react';
import { SchoolConfig, ActivePage } from '../types';
import {
  MapPin,
  Globe,
  Mail,
  Phone,
  ArrowUp,
  School,
  Building2,
  ExternalLink,
  ShieldCheck,
  Heart
} from 'lucide-react';

interface FooterProps {
  schoolConfig: SchoolConfig;
  setActivePage: (page: ActivePage) => void;
}

export const Footer: React.FC<FooterProps> = ({ schoolConfig, setActivePage }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white border-t-4 border-red-600">
      {/* Top Banner Call to Action */}
      <div className="bg-gradient-to-r from-red-800 via-red-600 to-rose-700 py-8 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-200">
              SMK Bisa • SMK Hebat • Vokasi Menguatkan Indonesia
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold mt-1">
              {schoolConfig.tagline}
            </h3>
            <p className="text-sm text-red-100 max-w-2xl mt-1">
              Peta interaktif sebaran industri dan mitra kerja magang siswa SMK Negeri 1 Songgom Kabupaten Brebes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActivePage('map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-white text-red-700 font-bold text-xs sm:text-sm shadow-lg hover:bg-red-50 transition cursor-pointer active:scale-95"
            >
              Jelajahi Peta GIS
            </button>
            <button
              onClick={() => {
                setActivePage('dudi');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-red-900/60 border border-red-300/40 text-white font-semibold text-xs sm:text-sm hover:bg-red-900 transition cursor-pointer"
            >
              Daftar DUDI Mitra
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Info Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: School Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-md">
                <img
                  src="/icon.svg"
                  alt="SMKN 1 Songgom"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as any).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white">
                  {schoolConfig.namaSekolah}
                </h4>
                <p className="text-xs text-red-400 font-medium">
                  NPSN: {schoolConfig.npsn} • Akreditasi {schoolConfig.akreditasi}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pusat pendidikan vokasi unggulan di Kabupaten Brebes yang siap mencetak generasi terampil, kompeten, dan siap bersaing di dunia industri modern.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Terakreditasi A
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-[11px] text-slate-300 border border-slate-700">
                <School className="w-3.5 h-3.5 text-red-400" />
                BKK Aktif
              </span>
            </div>
          </div>

          {/* Column 2: Alamat & Kontak Resmi (Mandatory requirement) */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              Alamat Sekolah
            </h4>

            <div className="text-xs text-slate-300 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {schoolConfig.alamat}, {schoolConfig.kecamatan}, {schoolConfig.kabupaten}, {schoolConfig.provinsi} {schoolConfig.kodePos}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-red-400 shrink-0" />
                <a
                  href="https://www.smkn1songgom.sch.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-300 hover:text-white hover:underline flex items-center gap-1"
                >
                  <span>https://www.smkn1songgom.sch.id</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-red-400 shrink-0" />
                <a
                  href={`mailto:${schoolConfig.email}`}
                  className="text-red-300 hover:text-white hover:underline"
                >
                  {schoolConfig.email}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-red-400 shrink-0" />
                <span>{schoolConfig.telepon} / WA: {schoolConfig.whatsapp}</span>
              </div>
            </div>
          </div>

          {/* Column 3: Navigasi Cepat GIS */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Menu Navigasi
            </h4>

            <ul className="text-xs text-slate-300 space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActivePage('home');
                    scrollToTop();
                  }}
                  className="hover:text-red-400 transition cursor-pointer text-left"
                >
                  • Halaman Utama (Home)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('about');
                    scrollToTop();
                  }}
                  className="hover:text-red-400 transition cursor-pointer text-left"
                >
                  • Profil & Visi Misi PKL (About)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('map');
                    scrollToTop();
                  }}
                  className="hover:text-red-400 transition cursor-pointer text-left"
                >
                  • Peta GIS Interaktif Tempat PKL
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('dudi');
                    scrollToTop();
                  }}
                  className="hover:text-red-400 transition cursor-pointer text-left"
                >
                  • Katalog DUDI Mitra Terverifikasi
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('galeri');
                    scrollToTop();
                  }}
                  className="hover:text-red-400 transition cursor-pointer text-left"
                >
                  • Galeri Dokumentasi Siswa Magang
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Sebaran Industri & PWA */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Wilayah Kemitraan
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Titik lokasi DUDI mencakup Kabupaten Brebes, Kabupaten Tegal, Kota Tegal, hingga Kabupaten Banyumas yang dihitung radiusnya langsung dari titik pusat SMKN 1 Songgom.
            </p>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 space-y-1.5 text-xs text-slate-300">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>PWA Ready Mobile App</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Mendukung instalasi tanpa toko aplikasi di Android & iPhone dengan fungsi offline.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} <strong>{schoolConfig.namaSekolah}</strong>. Hak Cipta Dilindungi Undang-Undang.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <span>Kembali ke Atas</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

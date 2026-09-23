import React, { useState } from 'react';
import { SchoolConfig } from '../types';
import { DataService } from '../lib/supabaseClient';
import {
  School,
  Target,
  Award,
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  Send,
  CheckCircle2,
  BookOpen,
  Building,
  ShieldCheck
} from 'lucide-react';

interface AboutPageProps {
  schoolConfig: SchoolConfig;
}

export const AboutPage: React.FC<AboutPageProps> = ({ schoolConfig }) => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    subjek: '',
    pesan: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.email || !formData.pesan) return;

    setIsSubmitting(true);
    try {
      await DataService.sendMessage(formData);
      setSubmitSuccess(true);
      setFormData({
        nama: '',
        email: '',
        telepon: '',
        subjek: '',
        pesan: '',
      });
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-800 via-red-600 to-rose-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            <School className="w-3.5 h-3.5" />
            <span>Profil Sekolah & Program PKL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tentang GIS PKL {schoolConfig.namaSekolah}
          </h1>

          <p className="text-sm sm:text-base text-red-100 leading-relaxed">
            {schoolConfig.deskripsi}
          </p>
        </div>
      </div>

      {/* Visi & Misi Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Visi Program PKL</h2>
              <span className="text-xs text-red-600 font-semibold">SMKN 1 Songgom Brebes</span>
            </div>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed italic border-l-4 border-red-500 pl-4 py-1 bg-red-50/50 rounded-r-xl">
            "{schoolConfig.visi}"
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Misi Kemitraan DUDI</h2>
              <span className="text-xs text-rose-600 font-semibold">Tujuan Strategis Vokasi</span>
            </div>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            {schoolConfig.misi?.map((m, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Leadership & BKK Team */}
      <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200/80">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
            Pengelola Sekolah
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            Pimpinan & Koordinator PKL / BKK
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Penanggung jawab penyelarasan kurikulum industri dan penempatan siswa magang.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-md">
              <School className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {schoolConfig.kepalaSekolah}
              </h3>
              <p className="text-xs text-red-600 font-semibold">
                Kepala Sekolah SMKN 1 Songgom
              </p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Memimpin arahan strategis kerjasama dunia usaha, dunia industri, dan pengembangan mutu lulusan sekolah.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-600 to-red-500 mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-md">
              <Building className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {schoolConfig.ketuaBkk}
              </h3>
              <p className="text-xs text-red-600 font-semibold">
                Ketua BKK & Koordinator PKL
              </p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mengelola verifikasi tempat magang, penjadwalan monitoring guru, dan koordinasi dengan pimpinan DUDI mitra.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-md">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Tim Pembimbing & Humas
              </h3>
              <p className="text-xs text-slate-600 font-semibold">
                Fasilitator Lapangan Siswa
              </p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mendampingi pelaksanaan Praktik Kerja Lapangan secara berkala dan memastikan keselamatan kerja siswa (K3).
            </p>
          </div>
        </div>
      </div>

      {/* School Coordinates & Contact Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Detail Lokasi Sekolah */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Pusat Koordinat
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Lokasi SMKN 1 Songgom
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sebagai titik acuan radius navigasi tempat PKL siswa.
            </p>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>Alamat Lengkap:</strong>
                <p className="text-slate-600 mt-0.5 leading-relaxed">
                  {schoolConfig.alamat}, {schoolConfig.kecamatan}, {schoolConfig.kabupaten}, {schoolConfig.provinsi} {schoolConfig.kodePos}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-red-50/70 border border-red-200/80 space-y-1">
              <div className="font-bold text-red-800 flex items-center gap-1.5">
                <span>Koordinat Geografis GIS:</span>
              </div>
              <div className="text-[11px] text-red-700 font-mono">
                Latitude: {schoolConfig.latitude.toFixed(6)}
              </div>
              <div className="text-[11px] text-red-700 font-mono">
                Longitude: {schoolConfig.longitude.toFixed(6)}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                <a
                  href={schoolConfig.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-600 hover:underline font-semibold"
                >
                  {schoolConfig.website}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{schoolConfig.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Formulir Kontak & Pertanyaan */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="mb-6">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Hubungi Pengelola
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              Kirim Pesan / Pengajuan Kemitraan DUDI Baru
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Apakah industri Anda berminat menjadi DUDI Mitra PKL SMKN 1 Songgom? Kirim pesan langsung di bawah ini.
            </p>
          </div>

          {submitSuccess && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                Terima kasih! Pesan Anda telah berhasil terkirim ke koordinator BKK SMKN 1 Songgom.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap / Instansi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Sumber Komputer / Budi Santoso"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Aktif *
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@perusahaan.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="0812xxxxxxxx"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subjek / Topik
                </label>
                <input
                  type="text"
                  placeholder="Pengajuan Mitra PKL / Informasi Kuota"
                  value={formData.subjek}
                  onChange={(e) => setFormData({ ...formData, subjek: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Isi Pesan / Keterangan *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Tuliskan pesan, pertanyaan kuota, atau penawaran kemitraan DUDI Anda..."
                value={formData.pesan}
                onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-red-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Mengirim Pesan...' : 'Kirim Pesan Sekarang'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

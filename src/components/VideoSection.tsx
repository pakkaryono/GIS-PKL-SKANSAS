import React from 'react';
import { Play, ExternalLink, Video, Sparkles, Monitor, GraduationCap } from 'lucide-react';

interface VideoItem {
  id: string;
  youtubeId: string;
  url: string;
  badge: string;
  badgeIcon: React.ElementType;
  badgeColor: string;
  title: string;
  description: string;
  highlights: string[];
}

export const VideoSection: React.FC = () => {
  const videoList: VideoItem[] = [
    {
      id: 'video-tkj',
      youtubeId: 'pdZmMUVjn9o',
      url: 'https://youtu.be/pdZmMUVjn9o',
      badge: 'Profil Keahlian TKJ',
      badgeIcon: Monitor,
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      title: 'Video Profil Jurusan Teknik Komputer & Jaringan (TKJ)',
      description:
        'Mengenal fasilitas lab komputer, kurikulum kejuruan, dan kompetensi keahlian Teknik Komputer & Jaringan (TKJ) SMK Negeri 1 Songgom.',
      highlights: ['Infrastruktur Jaringan & Server', 'Hardware & Troubleshooting', 'Kesiapan Industri Digital']
    },
    {
      id: 'video-pkl',
      youtubeId: '13UrDM8u0OQ',
      url: 'https://www.youtube.com/watch?v=13UrDM8u0OQ',
      badge: 'Edukasi Praktik Kerja Lapangan',
      badgeIcon: GraduationCap,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      title: 'Video Seputar Praktik Kerja Lapangan (PKL) SMK',
      description:
        'Panduan lengkap persiapan mental, etika kerja profesional, budaya industri, dan tata cara pelaksanaan magang bagi siswa SMK.',
      highlights: ['Etika & Tata Tertib Industri', 'Jurnal & Laporan PKL', 'Monitoring Pembimbing']
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Video className="w-3.5 h-3.5" />
          <span>Media Edukasi & Pengenalan</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Video Profil TKJ & Seputar PKL SMK
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
          Tonton video profil resmi kompetensi keahlian TKJ SMKN 1 Songgom serta wawasan penting seputar pelaksanaan Praktik Kerja Lapangan di dunia industri.
        </p>
      </div>

      {/* Video Cards Grid - 1 column on mobile, 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {videoList.map((item) => {
          const BadgeIcon = item.badgeIcon;
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition duration-200 overflow-hidden flex flex-col"
            >
              {/* Responsive 16:9 Video Container (Designed for optimal viewing on HP & Desktop) */}
              <div className="relative w-full aspect-video bg-slate-950 overflow-hidden group">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?rel=0&modestbranding=1`}
                  title={item.title}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              {/* Video Info Body */}
              <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${item.badgeColor}`}
                    >
                      <BadgeIcon className="w-3.5 h-3.5" />
                      {item.badge}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                      title="Buka langsung di aplikasi YouTube"
                    >
                      <span>Buka di YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Highlight Tags */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  {item.highlights.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-red-500" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

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

interface VideoSectionProps {
  inHero?: boolean;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ inHero = false }) => {
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
    <section className={`w-full ${inHero ? 'mt-8 mb-4 max-w-5xl mx-auto' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'}`}>
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-5 sm:mb-7">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
            inHero
              ? 'bg-white/20 text-white backdrop-blur-xs border border-white/30'
              : 'bg-red-100 text-red-700'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>Media Edukasi & Pengenalan</span>
        </div>
        <h2
          className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${
            inHero ? 'text-white' : 'text-slate-900'
          }`}
        >
          Video Profil TKJ & Seputar PKL SMK
        </h2>
        <p
          className={`text-xs sm:text-sm mt-1.5 leading-relaxed max-w-2xl mx-auto ${
            inHero ? 'text-red-100' : 'text-slate-600'
          }`}
        >
          Tonton video profil kompetensi keahlian TKJ SMKN 1 Songgom serta wawasan penting seputar pelaksanaan Praktik Kerja Lapangan di dunia industri.
        </p>
      </div>

      {/* Video Cards Grid - 1 column on mobile (HP), 2 columns on laptop/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {videoList.map((item) => {
          const BadgeIcon = item.badgeIcon;
          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl transition duration-200 overflow-hidden flex flex-col text-slate-800 ${
                inHero ? 'shadow-xl' : 'shadow-xs'
              }`}
            >
              {/* Responsive 16:9 Video Player (Mobile & Desktop friendly) */}
              <div className="relative w-full aspect-video bg-black overflow-hidden">
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
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold border ${item.badgeColor}`}
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

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Highlight Tags */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  {item.highlights.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium"
                    >
                      <Sparkles className="w-3 h-3 text-red-500 shrink-0" />
                      <span>{tag}</span>
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

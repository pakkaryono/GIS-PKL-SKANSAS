import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DudiMitra, SchoolConfig } from '../types';
import { calculateDistance, formatDistance, getCategoryBadgeColor } from '../lib/geoUtils';
import {
  MapPin,
  X,
  ExternalLink,
  Navigation,
  Copy,
  Check,
  Building2,
  Compass
} from 'lucide-react';

interface AdminMapModalProps {
  dudi: DudiMitra | null;
  schoolConfig: SchoolConfig;
  onClose: () => void;
}

export const AdminMapModal: React.FC<AdminMapModalProps> = ({
  dudi,
  schoolConfig,
  onClose,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!dudi || !mapContainerRef.current) return;

    // Destroy existing map if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const dudiLat = Number(dudi.latitude) || schoolConfig.latitude;
    const dudiLng = Number(dudi.longitude) || schoolConfig.longitude;
    const schoolLat = Number(schoolConfig.latitude);
    const schoolLng = Number(schoolConfig.longitude);

    const map = L.map(mapContainerRef.current, {
      center: [dudiLat, dudiLng],
      zoom: 14,
      zoomControl: true,
    });

    // Tile Layer: OpenStreetMap Streets
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Custom Icon for DUDI
    const categoryColor = getCategoryBadgeColor(dudi.bidangPekerjaan);
    const dudiPinIcon = L.divIcon({
      className: 'admin-dudi-pin',
      html: `
        <div style="background-color: ${categoryColor.hex}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35); border: 2.5px solid white; cursor: pointer;">
          <svg style="width: 18px; height: 18px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
    });

    const dudiMarker = L.marker([dudiLat, dudiLng], { icon: dudiPinIcon }).addTo(map);

    // School Marker for reference
    const schoolPinIcon = L.divIcon({
      className: 'school-reference-pin',
      html: `
        <div style="background-color: #dc2626; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.3); border: 2px solid white;">
          <svg style="width: 15px; height: 15px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
          </svg>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });
    const schoolMarker = L.marker([schoolLat, schoolLng], { icon: schoolPinIcon }).addTo(map);
    schoolMarker.bindPopup(`<b>${schoolConfig.namaSekolah}</b><br/><span style="font-size:11px;">Pusat Sekolah SMK</span>`);

    // Draw connecting line between school and DUDI
    const polyline = L.polyline(
      [
        [schoolLat, schoolLng],
        [dudiLat, dudiLng],
      ],
      {
        color: '#dc2626',
        weight: 2.5,
        dashArray: '5, 8',
        opacity: 0.7,
      }
    ).addTo(map);

    const distKm = calculateDistance(schoolLat, schoolLng, dudiLat, dudiLng);

    dudiMarker.bindPopup(`
      <div style="font-family: inherit; min-width: 200px; padding: 2px;">
        <span style="font-size: 10px; font-weight: bold; color: ${categoryColor.hex}; text-transform: uppercase;">${dudi.jenisDudi || 'DUDI'}</span>
        <h4 style="margin: 2px 0 4px 0; font-size: 13px; font-weight: 800; color: #0f172a;">${dudi.namaDudi}</h4>
        <p style="margin: 0 0 4px 0; font-size: 11px; color: #475569; line-height: 1.3;">${dudi.alamat}</p>
        <div style="font-size: 10px; color: #dc2626; font-weight: 700; border-top: 1px solid #e2e8f0; padding-top: 4px;">
          Jarak: ${formatDistance(distKm)}
        </div>
      </div>
    `).openPopup();

    // Fit bounds nicely to show both school and DUDI
    const group = L.featureGroup([dudiMarker, schoolMarker, polyline]);
    map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 15 });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [dudi, schoolConfig]);

  if (!dudi) return null;

  const distKm = calculateDistance(
    schoolConfig.latitude,
    schoolConfig.longitude,
    dudi.latitude,
    dudi.longitude
  );

  const coordsString = `${dudi.latitude}, ${dudi.longitude}`;
  const gmapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${dudi.latitude},${dudi.longitude}`;
  const gmapsDirUrl = `https://www.google.com/maps/dir/?api=1&origin=${schoolConfig.latitude},${schoolConfig.longitude}&destination=${dudi.latitude},${dudi.longitude}`;

  const handleCopyCoords = () => {
    navigator.clipboard.writeText(coordsString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-2xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-600/30 text-red-400 border border-red-500/40 text-[10px] font-bold uppercase tracking-wider">
                <MapPin className="w-3 h-3" />
                Titik Koordinat Pasti GIS
              </span>
              <span className="text-slate-400 text-xs">No. {dudi.no}</span>
            </div>
            <h3 className="font-extrabold text-base sm:text-lg text-white truncate">
              {dudi.namaDudi}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto">
          {/* Info Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium block text-[10px] uppercase">
                Koordinat Lintang & Bujur
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <strong className="font-mono text-slate-800 text-xs">{coordsString}</strong>
                <button
                  type="button"
                  onClick={handleCopyCoords}
                  className="p-1 rounded-md hover:bg-slate-200 text-slate-500 transition cursor-pointer"
                  title="Salin Koordinat"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {copied && (
                  <span className="text-[10px] font-bold text-emerald-600 animate-fadeIn">
                    Tersalin!
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-500 font-medium block text-[10px] uppercase">
                Jarak Lurus dari SMKN 1 Songgom
              </span>
              <p className="mt-0.5">
                <strong className="text-red-600 font-bold text-sm">
                  {formatDistance(distKm)}
                </strong>
                <span className="text-slate-500 text-[11px] ml-1.5">
                  ({dudi.kabupaten || 'Kab. Brebes'})
                </span>
              </p>
            </div>
          </div>

          {/* Leaflet Map Display */}
          <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
            <div ref={mapContainerRef} className="w-full h-[320px] z-0" />
            <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span>
              <span>Garis merah: Arah dari SMKN 1 Songgom</span>
            </div>
          </div>

          {/* Address info */}
          <div className="p-3 bg-red-50/50 rounded-xl border border-red-200/60 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase text-red-900 block">
              Alamat DUDI
            </span>
            <p className="text-slate-700 leading-relaxed font-medium">
              {dudi.alamat}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-semibold transition cursor-pointer"
          >
            Tutup
          </button>

          <div className="flex items-center gap-2">
            <a
              href={gmapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Buka titik koordinat di Google Maps"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Titik di Google Maps</span>
            </a>

            <a
              href={gmapsDirUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Buka rute navigasi dari sekolah ke DUDI ini"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Panduan Rute</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

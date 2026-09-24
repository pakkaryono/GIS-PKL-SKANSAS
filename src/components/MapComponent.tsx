import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { DudiMitra, SchoolConfig } from '../types';
import { calculateDistance, formatDistance, getCategoryBadgeColor } from '../lib/geoUtils';
import { Navigation, MapPin, Layers, Phone, ExternalLink, School, Compass, Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';

interface MapComponentProps {
  dudiList: DudiMitra[];
  schoolConfig: SchoolConfig;
  selectedDudiId?: string;
  onSelectDudi?: (dudi: DudiMitra) => void;
  heightClass?: string;
  showFilters?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  dudiList,
  schoolConfig,
  selectedDudiId,
  onSelectDudi,
  heightClass = 'h-[600px]',
  showFilters = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeRadius, setActiveRadius] = useState<number>(0); // 0 = all
  const [mapStyle, setMapStyle] = useState<'streets' | 'light' | 'satellite'>('streets');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showRadiusCircles, setShowRadiusCircles] = useState<boolean>(true);
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false); // Collapsible open/close state

  // Filtered DUDIs for the map
  const filteredMapDudi = dudiList.filter((d) => {
    // Category filter
    if (activeCategory !== 'all') {
      const b = (d.bidangPekerjaan || '').toLowerCase();
      if (activeCategory === 'teknisi' && !b.includes('teknisi') && !b.includes('mekanik')) return false;
      if (activeCategory === 'jasa' && !b.includes('jasa')) return false;
      if (activeCategory === 'penjualan' && !b.includes('penjualan')) return false;
      if (activeCategory === 'jaringan' && !b.includes('jaringan') && !b.includes('network')) return false;
    }

    // Distance filter
    const dist = calculateDistance(
      schoolConfig.latitude,
      schoolConfig.longitude,
      d.latitude,
      d.longitude
    );
    if (activeRadius > 0 && dist > activeRadius) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = d.namaDudi.toLowerCase().includes(q);
      const matchAddr = d.alamat.toLowerCase().includes(q);
      const matchPim = d.pimpinan.toLowerCase().includes(q);
      if (!matchName && !matchAddr && !matchPim) return false;
    }

    return true;
  });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const schoolLat = schoolConfig.latitude || -7.020388215313289;
    const schoolLng = schoolConfig.longitude || 108.98368410988522;

    const map = L.map(mapContainerRef.current, {
      center: [schoolLat, schoolLng],
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Tile Layers
    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors | SMKN 1 Songgom GIS PKL',
        maxZoom: 19,
      }
    );

    const lightLayer = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; CARTO & OpenStreetMap contributors',
        maxZoom: 19,
      }
    );

    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri & Contributors',
        maxZoom: 18,
      }
    );

    if (mapStyle === 'streets') streetLayer.addTo(map);
    else if (mapStyle === 'light') lightLayer.addTo(map);
    else satelliteLayer.addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);
    circlesLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapStyle, schoolConfig.latitude, schoolConfig.longitude]);

  // Update Markers and Radius circles whenever data or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const markersGroup = markersLayerRef.current;
    const circlesGroup = circlesLayerRef.current;
    if (!markersGroup || !circlesGroup) return;

    markersGroup.clearLayers();
    circlesGroup.clearLayers();

    const schoolLat = schoolConfig.latitude || -7.020388215313289;
    const schoolLng = schoolConfig.longitude || 108.98368410988522;

    // 1. School Marker (Center Coordinate / Pusat Navigasi)
    const schoolIcon = L.divIcon({
      className: 'custom-school-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <span class="absolute w-12 h-12 bg-red-600 rounded-full animate-ping opacity-35"></span>
          <div class="relative z-10 flex items-center justify-center w-11 h-11 bg-gradient-to-tr from-red-700 to-red-500 rounded-full shadow-2xl border-3 border-white text-white">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
            </svg>
          </div>
          <div class="absolute -bottom-7 whitespace-nowrap bg-red-700 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-lg border border-red-400">
            Pusat: SMKN 1 Songgom
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -20],
    });

    const schoolMarker = L.marker([schoolLat, schoolLng], {
      icon: schoolIcon,
      zIndexOffset: 1000,
    }).addTo(markersGroup);

    schoolMarker.bindPopup(`
      <div class="p-4 max-w-[280px]">
        <div class="flex items-center gap-2 mb-2">
          <span class="p-1.5 bg-red-100 text-red-700 rounded-lg">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"/></svg>
          </span>
          <div>
            <h4 class="font-bold text-sm text-slate-900 leading-tight">${schoolConfig.namaSekolah}</h4>
            <span class="text-[10px] text-red-600 font-semibold uppercase tracking-wider">Titik Pusat Koordinat GIS</span>
          </div>
        </div>
        <p class="text-xs text-slate-600 mb-2 leading-relaxed">${schoolConfig.alamat}</p>
        <div class="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 border border-slate-200">
          <div><strong>Koordinat:</strong> ${schoolLat.toFixed(5)}, ${schoolLng.toFixed(5)}</div>
          <div><strong>Kecamatan:</strong> Songgom, Brebes</div>
        </div>
      </div>
    `);

    // 2. Radius Circles from School
    if (showRadiusCircles) {
      const radii = [
        { r: 5000, label: '5 KM', color: '#16a34a' },
        { r: 10000, label: '10 KM', color: '#f59e0b' },
        { r: 20000, label: '20 KM', color: '#dc2626' },
      ];

      radii.forEach((radiusInfo) => {
        L.circle([schoolLat, schoolLng], {
          radius: radiusInfo.r,
          color: radiusInfo.color,
          weight: 1.5,
          opacity: 0.5,
          dashArray: '5, 8',
          fillColor: radiusInfo.color,
          fillOpacity: 0.03,
        })
          .bindTooltip(`Radius ${radiusInfo.label} dari SMKN 1 Songgom`, {
            permanent: false,
            direction: 'right',
          })
          .addTo(circlesGroup);
      });
    }

    // 3. DUDI Markers
    filteredMapDudi.forEach((dudi) => {
      if (!dudi.latitude || !dudi.longitude) return;

      const dist = calculateDistance(
        schoolLat,
        schoolLng,
        dudi.latitude,
        dudi.longitude
      );
      const categoryColor = getCategoryBadgeColor(dudi.bidangPekerjaan);
      const isSelected = selectedDudiId === dudi.id;

      const dudiIcon = L.divIcon({
        className: 'custom-dudi-marker',
        html: `
          <div class="relative cursor-pointer transition-transform hover:scale-110 ${
            isSelected ? 'scale-125 z-50' : ''
          }">
            <div class="flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white text-white font-bold text-xs" style="background-color: ${
              categoryColor.hex
            }; box-shadow: 0 4px 10px ${categoryColor.hex}66;">
              ${dudi.no || '•'}
            </div>
            ${
              isSelected
                ? `<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>`
                : ''
            }
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([dudi.latitude, dudi.longitude], {
        icon: dudiIcon,
      }).addTo(markersGroup);

      // Popup with full details & Google Maps route link
      const gmapsRouteUrl = `https://www.google.com/maps/dir/?api=1&origin=${schoolLat},${schoolLng}&destination=${dudi.latitude},${dudi.longitude}`;

      const popupHtml = `
        <div class="p-2.5 w-[240px] sm:w-[260px]">
          <div class="flex items-start justify-between gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
            <div class="min-w-0 pr-1">
              <span class="inline-block px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider mb-0.5" style="background-color: ${
                categoryColor.hex
              }20; color: ${categoryColor.hex};">
                ${dudi.jenisDudi || 'DUDI Mitra'}
              </span>
              <h3 class="font-bold text-slate-900 text-xs leading-snug line-clamp-1">${dudi.namaDudi}</h3>
            </div>
            <div class="text-right shrink-0">
              <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-700 font-bold text-[10px] rounded-full border border-red-200">
                ${formatDistance(dist)}
              </span>
            </div>
          </div>

          <div class="space-y-1 text-[11px] text-slate-600 mb-2.5">
            <div class="flex items-center justify-between text-slate-700">
              <span>Pimpinan:</span>
              <strong class="text-slate-900 truncate max-w-[120px]">${dudi.pimpinan || '-'}</strong>
            </div>
            <div class="flex items-center justify-between text-slate-700">
              <span>Kuota:</span>
              <span class="px-1.5 py-0.2 bg-slate-100 rounded text-slate-900 font-bold">${
                dudi.maksimalSiswa
              } Siswa</span>
            </div>
            <div class="text-slate-500 text-[10px] line-clamp-1">
              <strong>Bidang:</strong> ${dudi.bidangPekerjaan || '-'}
            </div>
            <div class="text-slate-500 text-[10px] line-clamp-1">
              <strong>Alamat:</strong> ${dudi.alamat}
            </div>
          </div>

          <div class="flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
            <a
              href="${gmapsRouteUrl}"
              target="_blank"
              rel="noopener noreferrer"
              class="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-semibold shadow-2xs transition"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              Rute Maps
            </a>
            ${
              dudi.noHp
                ? `<a
                    href="https://wa.me/${dudi.noHp.replace(/[^0-9]/g, '')}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs border border-emerald-200 transition"
                    title="Hubungi WhatsApp"
                  >
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                  </a>`
                : ''
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectDudi) onSelectDudi(dudi);
      });

      if (isSelected) {
        marker.openPopup();
        map.flyTo([dudi.latitude, dudi.longitude], 14, { duration: 1 });
      }
    });
  }, [
    filteredMapDudi,
    selectedDudiId,
    showRadiusCircles,
    schoolConfig.latitude,
    schoolConfig.longitude,
    schoolConfig.namaSekolah,
    schoolConfig.alamat,
  ]);

  // Center on school button
  const handleRecenterSchool = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [schoolConfig.latitude, schoolConfig.longitude],
      12,
      { duration: 1 }
    );
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Top Map Action Bar */}
      {showFilters && (
        <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Quick Search */}
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari DUDI di peta (nama, alamat)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-red-500 focus:outline-hidden"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({dudiList.length})
            </button>
            <button
              onClick={() => setActiveCategory('teknisi')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeCategory === 'teknisi'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Teknisi / Mekanik
            </button>
            <button
              onClick={() => setActiveCategory('jasa')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeCategory === 'jasa'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Jasa
            </button>
            <button
              onClick={() => setActiveCategory('penjualan')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeCategory === 'penjualan'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Penjualan
            </button>
            <button
              onClick={() => setActiveCategory('jaringan')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeCategory === 'jaringan'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Jaringan / IT
            </button>
          </div>

          {/* Radius selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Jarak dari Sekolah:</span>
            <select
              value={activeRadius}
              onChange={(e) => setActiveRadius(Number(e.target.value))}
              className="py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:border-red-500 focus:outline-hidden cursor-pointer"
            >
              <option value={0}>Semua Radius</option>
              <option value={5}>Maksimal 5 KM</option>
              <option value={10}>Maksimal 10 KM</option>
              <option value={15}>Maksimal 15 KM</option>
              <option value={25}>Maksimal 25 KM</option>
              <option value={50}>Maksimal 50 KM</option>
            </select>
          </div>
        </div>
      )}

      {/* The Leaflet Container */}
      <div ref={mapContainerRef} className={`w-full ${heightClass} z-0 relative`} />

      {/* Floating Collapsible Control (Buka / Tutup agar tidak menghalangi peta) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
        {/* Toggle Button: Buka / Tutup */}
        <button
          onClick={() => setIsControlsOpen(!isControlsOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl shadow-md border transition-all cursor-pointer text-xs font-bold backdrop-blur-md ${
            isControlsOpen
              ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800'
              : 'bg-white/95 text-slate-800 border-slate-200 hover:bg-white hover:text-red-600 hover:shadow-lg'
          }`}
          title={isControlsOpen ? 'Tutup Kontrol Peta' : 'Buka Kontrol Peta (Lapisan & Radius)'}
          aria-expanded={isControlsOpen}
        >
          <Layers className="w-4 h-4 text-red-600" />
          <span>{isControlsOpen ? 'Tutup Kontrol' : 'Kontrol Peta'}</span>
          {isControlsOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Collapsible Panel - Hanya muncul jika dibuka */}
        {isControlsOpen && (
          <div className="w-48 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-2.5 flex flex-col gap-2 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Pengaturan Peta</span>
              <button
                onClick={() => setIsControlsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Tutup panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Recenter School */}
            <button
              onClick={() => {
                handleRecenterSchool();
              }}
              className="w-full p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
              title="Arahkan Peta ke SMKN 1 Songgom"
            >
              <School className="w-4 h-4 text-red-600" />
              <span>Pusat Sekolah</span>
            </button>

            {/* Map Layer Selector */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                Tipe Lapisan
              </span>
              <div className="grid grid-cols-1 gap-1">
                <button
                  onClick={() => setMapStyle('streets')}
                  className={`px-2.5 py-1.5 rounded-lg text-left font-semibold transition cursor-pointer text-xs flex items-center justify-between ${
                    mapStyle === 'streets'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Peta Jalan</span>
                  {mapStyle === 'streets' && <span className="text-[10px] font-bold">✓</span>}
                </button>
                <button
                  onClick={() => setMapStyle('light')}
                  className={`px-2.5 py-1.5 rounded-lg text-left font-semibold transition cursor-pointer text-xs flex items-center justify-between ${
                    mapStyle === 'light'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Peta Terang</span>
                  {mapStyle === 'light' && <span className="text-[10px] font-bold">✓</span>}
                </button>
                <button
                  onClick={() => setMapStyle('satellite')}
                  className={`px-2.5 py-1.5 rounded-lg text-left font-semibold transition cursor-pointer text-xs flex items-center justify-between ${
                    mapStyle === 'satellite'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>Satelit</span>
                  {mapStyle === 'satellite' && <span className="text-[10px] font-bold">✓</span>}
                </button>
              </div>
            </div>

            {/* Toggle Radius Circles */}
            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={() => setShowRadiusCircles(!showRadiusCircles)}
                className={`w-full p-2 rounded-xl text-xs font-semibold transition cursor-pointer text-center border ${
                  showRadiusCircles
                    ? 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100'
                    : 'text-slate-600 bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
                title="Tampilkan / Sembunyikan Lingkaran Radius"
              >
                {showRadiusCircles ? '○ Sembunyikan Radius' : '◉ Tampilkan Radius'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend Badge Bottom Left */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-slate-200 text-xs max-w-xs hidden sm:block">
        <div className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-red-600" />
          <span>Legenda Kategori GIS PKL</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-red-200"></span>
            <span>SMKN 1 Songgom</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-500"></span>
            <span>Teknisi / Mekanik</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600"></span>
            <span>Jasa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span>Penjualan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
            <span>Jaringan / IT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>Lainnya</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Haversine formula to compute distance in Kilometers between two lat/lng coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return 0;
  }
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(km: number | undefined): string {
  if (km === undefined || isNaN(km)) return '-';
  if (km < 1) {
    return `${Math.round(km * 1000)} meter`;
  }
  return `${km.toFixed(1)} km`;
}

// Helper to determine Kabupaten from address string if not explicitly set
export function detectKabupaten(alamat: string): string {
  const lower = alamat.toLowerCase();
  if (lower.includes('kota tegal')) return 'Kota Tegal';
  if (lower.includes('kab. tegal') || lower.includes('kabupaten tegal') || lower.includes('slawi') || lower.includes('margasa')) return 'Kab. Tegal';
  if (lower.includes('brebes') || lower.includes('songgom') || lower.includes('larangan') || lower.includes('jatibarang') || lower.includes('ketanggungan')) return 'Kab. Brebes';
  if (lower.includes('purwokerto') || lower.includes('banyumas')) return 'Kab. Banyumas';
  if (lower.includes('pemalang')) return 'Kab. Pemalang';
  if (lower.includes('cirebon')) return 'Kab. Cirebon';
  return 'Kab. Brebes';
}

// Marker color for job category as requested (e.g. orange for teknisi/mekanik)
export function getCategoryBadgeColor(bidang: string): {
  bg: string;
  text: string;
  border: string;
  markerColor: string;
  hex: string;
} {
  const b = (bidang || '').toLowerCase();

  if (b.includes('teknisi') || b.includes('mekanik')) {
    return {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-300',
      markerColor: 'orange',
      hex: '#f97316',
    };
  }
  if (b.includes('jasa')) {
    return {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      markerColor: 'blue',
      hex: '#2563eb',
    };
  }
  if (b.includes('penjualan')) {
    return {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      border: 'border-emerald-300',
      markerColor: 'green',
      hex: '#059669',
    };
  }
  if (b.includes('jaringan') || b.includes('network') || b.includes('komputer')) {
    return {
      bg: 'bg-indigo-100',
      text: 'text-indigo-800',
      border: 'border-indigo-300',
      markerColor: 'indigo',
      hex: '#6366f1',
    };
  }
  return {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    markerColor: 'red',
    hex: '#dc2626',
  };
}

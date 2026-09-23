export interface DudiMitra {
  id: string;
  no: number;
  namaDudi: string;
  maksimalSiswa: number;
  pimpinan: string;
  jenisDudi: 'Mandiri' | 'CV/PT' | 'Industri' | string;
  bidangPekerjaan: string;
  alamat: string;
  kabupaten: string;
  latitude: number;
  longitude: number;
  noHp: string;
  jaminan: string;
  nominal: string;
  deskripsi?: string;
  email?: string;
  website?: string;
  fotoUrl?: string;
  jarakKm?: number; // Calculated dynamically from school
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolConfig {
  namaSekolah: string;
  npsn: string;
  akreditasi: string;
  alamat: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  latitude: number;
  longitude: number;
  telepon: string;
  whatsapp: string;
  email: string;
  website: string;
  tagline: string;
  deskripsi: string;
  visi: string;
  misi: string[];
  kepalaSekolah: string;
  ketuaBkk: string;
}

export interface GaleriItem {
  id: string;
  judul: string;
  kategori: 'Kegiatan PKL' | 'Kunjungan Industri' | 'MoU Kemitraan' | 'Monitoring' | 'Penyerahan Siswa';
  tanggal: string;
  lokasi: string;
  deskripsi: string;
  imageUrl: string;
}

export interface KontakMessage {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  subjek: string;
  pesan: string;
  tanggal: string;
  dibaca: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  lastSynced?: string;
}

export interface AdminAccount {
  id: string;
  email: string;
  password?: string;
  nama: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ActivePage = 'home' | 'about' | 'map' | 'dudi' | 'galeri' | 'admin';

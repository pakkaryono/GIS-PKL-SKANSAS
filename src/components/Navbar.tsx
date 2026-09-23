import React, { useState } from 'react';
import { ActivePage, SchoolConfig } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import {
  MapPin,
  Home,
  Info,
  Map,
  Building2,
  Image,
  Menu,
  X,
  Lock,
  Compass,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  schoolConfig: SchoolConfig;
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  schoolConfig,
  isAdminLoggedIn,
  onOpenAdminLogin,
  onLogoutAdmin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home' as ActivePage, label: 'Home', icon: Home },
    { id: 'about' as ActivePage, label: 'About', icon: Info },
    { id: 'map' as ActivePage, label: 'Peta Lokasi', icon: Map },
    { id: 'dudi' as ActivePage, label: 'DUDI Mitra', icon: Building2 },
    { id: 'galeri' as ActivePage, label: 'Galeri', icon: Image },
  ];

  const handleNavClick = (page: ActivePage) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Notification Bar with Required Tagline & School Website */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white text-xs py-1.5 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center">
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase">
              GIS PKL
            </span>
            <span className="font-semibold tracking-wide">
              {schoolConfig.tagline || 'Cari Tempat PKL sesuai keinginan dengan Mudah'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] opacity-90">
            <span className="hidden md:inline">
              Pusat Koordinat: Kec. Songgom, Kab. Brebes
            </span>
            <a
              href="https://www.smkn1songgom.sch.id"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1 font-medium bg-white/10 px-2 py-0.5 rounded-md hover:bg-white/20 transition"
            >
              <span>smkn1songgom.sch.id</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-0.5 shadow-md shadow-red-600/20 group-hover:scale-105 transition">
              <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center p-1 text-red-600">
                <img
                  src="/icon.svg"
                  alt="Logo SMKN 1 Songgom"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as any).style.display = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none group-hover:text-red-600 transition">
                  GIS PKL
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-red-100 text-red-700 text-[10px] font-bold">
                  SMKN 1
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                SMK Negeri 1 Songgom Brebes
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-red-50 text-red-600 border border-red-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons: PWA Install + Admin Portal */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Admin Toggle / Login */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activePage === 'admin'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Panel Admin</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="px-2.5 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 transition cursor-pointer"
                  title="Logout Admin"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-300 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
                title="Login Pengelola / Admin GIS"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Login Admin</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <PWAInstallButton compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-red-600 hover:bg-slate-50 transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer text-left ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-red-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100 mt-2">
            {isAdminLoggedIn ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleNavClick('admin')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Masuk Panel Admin
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50"
                >
                  Logout Admin
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminLogin();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs font-bold"
              >
                <Lock className="w-3.5 h-3.5" />
                Login Admin / Pengelola
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

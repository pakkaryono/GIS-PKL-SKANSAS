import React from 'react';
import { ActivePage } from '../types';
import { Home, Map, Building2, Image as ImageIcon, Info, CloudCheck } from 'lucide-react';

interface MobileBottomNavProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  isBackendSynced?: boolean;
  onQuickSync?: () => void;
  isSyncing?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activePage,
  setActivePage,
  isBackendSynced = true,
  onQuickSync,
  isSyncing = false
}) => {
  const navItems = [
    { id: 'home' as ActivePage, label: 'Beranda', icon: Home },
    { id: 'dudi' as ActivePage, label: 'DUDI Mitra', icon: Building2 },
    { id: 'map' as ActivePage, label: 'Peta GIS', icon: Map },
    { id: 'galeri' as ActivePage, label: 'Galeri', icon: ImageIcon },
    { id: 'about' as ActivePage, label: 'Tentang', icon: Info },
  ];

  const handleItemClick = (page: ActivePage) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-2xl safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-1.5 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition duration-150 cursor-pointer relative ${
                isActive
                  ? 'text-red-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 bg-red-600 rounded-full animate-fadeIn" />
              )}
              <div
                className={`p-1 rounded-xl transition ${
                  isActive ? 'bg-red-50 text-red-600' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5 truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { ActivePage, DudiMitra, SchoolConfig, GaleriItem, KontakMessage } from './types';
import { DataService, getSupabaseClient } from './lib/supabaseClient';
import { INITIAL_SCHOOL_CONFIG } from './data/initialData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { MapPage } from './pages/MapPage';
import { DudiPage } from './pages/DudiPage';
import { GaleriPage } from './pages/GaleriPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginModal } from './pages/AdminLoginModal';
import { DudiDetailModal } from './components/DudiDetailModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Loader2 } from 'lucide-react';

export function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [dudiList, setDudiList] = useState<DudiMitra[]>([]);
  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(INITIAL_SCHOOL_CONFIG);
  const [galeriList, setGaleriList] = useState<GaleriItem[]>([]);
  const [messagesList, setMessagesList] = useState<KontakMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState<boolean>(false);

  // Selected DUDI Modal state
  const [selectedDudiModal, setSelectedDudiModal] = useState<DudiMitra | null>(null);

  // Filters passed from Home to DUDI page
  const [homeFilters, setHomeFilters] = useState<{
    kabupaten: string;
    radius: number;
    bidang: string;
  }>({
    kabupaten: '',
    radius: 0,
    bidang: '',
  });

  // Load all data from DataService
  const loadData = useCallback(async () => {
    try {
      const [dudi, config, galeri, messages] = await Promise.all([
        DataService.getDudiList(),
        DataService.getSchoolConfig(),
        DataService.getGaleri(),
        DataService.getMessages(),
      ]);

      setDudiList(dudi);
      setSchoolConfig(config);
      setGaleriList(galeri);
      setMessagesList(messages);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Check existing admin session
    try {
      const session = localStorage.getItem('gis_pkl_admin_session');
      if (session) {
        setIsAdminLoggedIn(true);
      }
    } catch (e) {
      // ignore
    }
  }, [loadData]);

  const handleAdminLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem('gis_pkl_admin_session');
    setIsAdminLoggedIn(false);
    if (activePage === 'admin') {
      setActivePage('home');
    }
  };

  const handleApplyHomeFilter = (kabupaten: string, radius: number, bidang: string) => {
    setHomeFilters({ kabupaten, radius, bidang });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased font-sans selection:bg-red-500 selection:text-white">
      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Main Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        schoolConfig={schoolConfig}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
        onLogoutAdmin={handleAdminLogout}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {isLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            <p className="text-xs text-slate-500 font-semibold tracking-wide">
              Memuat Sistem GIS PKL SMKN 1 Songgom...
            </p>
          </div>
        ) : (
          <>
            {activePage === 'home' && (
              <HomePage
                dudiList={dudiList}
                schoolConfig={schoolConfig}
                setActivePage={setActivePage}
                onSelectDudiForDetail={(dudi) => setSelectedDudiModal(dudi)}
                onApplyHomeFilter={handleApplyHomeFilter}
              />
            )}

            {activePage === 'about' && (
              <AboutPage schoolConfig={schoolConfig} />
            )}

            {activePage === 'map' && (
              <MapPage
                dudiList={dudiList}
                schoolConfig={schoolConfig}
                onSelectDudiForDetail={(dudi) => setSelectedDudiModal(dudi)}
              />
            )}

            {activePage === 'dudi' && (
              <DudiPage
                dudiList={dudiList}
                schoolConfig={schoolConfig}
                initialFilters={homeFilters}
                onSelectDudiForDetail={(dudi) => setSelectedDudiModal(dudi)}
              />
            )}

            {activePage === 'galeri' && (
              <GaleriPage galeriList={galeriList} />
            )}

            {activePage === 'admin' && (
              isAdminLoggedIn ? (
                <AdminPage
                  dudiList={dudiList}
                  schoolConfig={schoolConfig}
                  galeriList={galeriList}
                  messagesList={messagesList}
                  onRefreshData={loadData}
                  onLogout={handleAdminLogout}
                />
              ) : (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
                  <h3 className="font-bold text-base text-slate-900">
                    Akses Khusus Admin Pengelola
                  </h3>
                  <p className="text-xs text-slate-500">
                    Silakan masuk terlebih dahulu untuk mengakses menu manajemen data GIS PKL.
                  </p>
                  <button
                    onClick={() => setAdminLoginModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Buka Login Admin
                  </button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer schoolConfig={schoolConfig} setActivePage={setActivePage} />

      {/* Modals */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
          setActivePage('admin');
        }}
      />

      <DudiDetailModal
        dudi={selectedDudiModal}
        schoolConfig={schoolConfig}
        onClose={() => setSelectedDudiModal(null)}
      />
    </div>
  );
}

export default App;

import React from 'react';
import { RefreshCw, Database, CheckCircle2, AlertCircle } from 'lucide-react';

interface SyncStatusBadgeProps {
  isConfigured: boolean;
  isSyncing: boolean;
  lastSyncTime?: string;
  onSync: () => void;
  compact?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  isConfigured,
  isSyncing,
  lastSyncTime,
  onSync,
  compact = false
}) => {
  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Belum sinkron';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Baru saja';
    }
  };

  if (compact) {
    return (
      <button
        onClick={onSync}
        disabled={isSyncing}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
          isConfigured
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
        }`}
        title={`Sinkronisasi Backend Supabase (${isConfigured ? 'Terhubung' : 'Lokal'})`}
      >
        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-red-600' : ''}`} />
        <span className="hidden xs:inline">
          {isSyncing ? 'Menyinkronkan...' : isConfigured ? 'Supabase' : 'Lokal'}
        </span>
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-2 h-2 rounded-full ${
            isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
        />
        <Database className="w-3.5 h-3.5 text-slate-500" />
        <span className="font-semibold text-slate-800">
          {isConfigured ? 'Supabase Terhubung' : 'Mode Offline Lokal'}
        </span>
      </div>

      <span className="text-slate-300">•</span>

      <span className="text-slate-500 text-[11px]">
        Sync: {formatTime(lastSyncTime)}
      </span>

      <button
        onClick={onSync}
        disabled={isSyncing}
        className="ml-1 p-1 rounded-md text-slate-500 hover:text-red-600 hover:bg-slate-200/60 transition cursor-pointer"
        title="Sinkronkan data sekarang dari Supabase"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-red-600' : ''}`} />
      </button>
    </div>
  );
};

import React from 'react';
import { RefreshCw, Database, CloudCheck, CheckCircle2 } from 'lucide-react';

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
    if (!isoString) return 'Baru saja';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Baru saja';
    }
  };

  return (
    <button
      onClick={onSync}
      disabled={isSyncing}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition shrink-0 whitespace-nowrap cursor-pointer ${
        isConfigured
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80'
          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
      }`}
      title="Data terhubung langsung secara online ke Supabase. Klik untuk sinkronisasi ulang."
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
      <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span className="text-xs font-bold text-emerald-900">
        Online
      </span>
      {!compact && (
        <span className="hidden md:inline text-[11px] text-emerald-700 font-medium">
          • {formatTime(lastSyncTime)}
        </span>
      )}
      <RefreshCw
        className={`w-3 h-3 text-emerald-600 shrink-0 ml-0.5 ${
          isSyncing ? 'animate-spin text-red-600' : 'hover:rotate-180 transition-transform'
        }`}
      />
    </button>
  );
};

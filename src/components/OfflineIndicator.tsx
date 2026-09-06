import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-white shadow-lg border border-amber-400/40 animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
      <span>当前处于离线模式 — 系统正在使用本地缓存数据，网络恢复后将自动重连同步</span>
    </div>
  );
};

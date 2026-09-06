import React, { useState } from 'react';
import { Download, MonitorSmartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './PWAInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'outline' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'outline',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        // If user dismissed prompt or needs guide, open modal
        setModalOpen(true);
      }
    } else {
      setModalOpen(true);
    }
  };

  if (isInstalled) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 ${className}`}
          title="已作为独立APP安装，点击查看说明"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">已安装APP</span>
          <span className="sm:hidden">已安装</span>
        </button>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  if (variant === 'primary') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs cursor-pointer ${className}`}
          title="点击安装为电脑桌面软件或手机APP"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span>安装客户端</span>
        </button>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors ${className}`}
          title="安装吉吉办公到电脑与手机"
        >
          <MonitorSmartphone className="w-4 h-4 text-blue-600" />
        </button>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 shadow-2xs cursor-pointer ${className}`}
        title="安装吉吉办公为电脑桌面端或手机APP"
      >
        <MonitorSmartphone className="w-3.5 h-3.5 text-blue-600" />
        <span className="font-bold">安装APP</span>
        {isInstallable && (
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
        )}
      </button>
      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

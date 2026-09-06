import React, { useState } from 'react';
import {
  Download,
  Monitor,
  Smartphone,
  Apple,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Zap,
  WifiOff,
  Layers,
  X,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isDesktop, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>(
    isIOS ? 'ios' : isAndroid ? 'android' : 'desktop'
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleTriggerInstall = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/pwa-192x192.png" alt="吉吉办公 Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">吉吉办公 客户端安装中心</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                  电脑端 & 移动端全兼容
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1">
                支持 Windows / macOS 电脑端桌面快捷方式与 Android / iOS 手机端独立 App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-slate-700">
          {/* Current Status Banner */}
          {isInstalled ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">恭喜！当前已处于独立客户端模式运行</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  已成功作为独立 APP 安装在您的设备中，享受纯净全屏沉浸式办公体验。
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>浏览器已准备就绪，检测到原生安装支持</span>
                </div>
                <p className="text-xs text-blue-700">
                  点击下方按钮即可一键将吉吉办公打包安装至您的操作系统桌面或手机主屏。
                </p>
              </div>
              <button
                onClick={handleTriggerInstall}
                disabled={installing}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 shrink-0 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{installing ? '正在唤起...' : '立即一键安装'}</span>
              </button>
            </div>
          ) : null}

          {/* Platform Guide Tabs */}
          <div>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mb-3">
              <button
                onClick={() => setActiveTab('desktop')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'desktop'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>电脑端 (Windows / Mac)</span>
              </button>
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'android'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>安卓手机 (Android)</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'ios'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Apple className="w-4 h-4" />
                <span>苹果手机 (iPhone / iPad)</span>
              </button>
            </div>

            {/* Desktop Tab */}
            {activeTab === 'desktop' && (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Monitor className="w-4 h-4 text-blue-600" />
                  <span>电脑端安装方式（Chrome / Edge / 360极速浏览器等）</span>
                </div>
                <div className="space-y-2 text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <p>
                      <strong>方式一：快捷按钮安装</strong>。如果页面上方或本弹窗出现“立即一键安装”按钮，点击即可直接调用系统的应用安装器。
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <p>
                      <strong>方式二：地址栏图标安装</strong>。在电脑浏览器（如 Google Chrome、Microsoft Edge）打开本系统，查看浏览器<strong>顶部地址栏右侧</strong>，会显示带有“安装”或“应用可用（⊕）”的电脑图标，点击并确认“安装”。
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <p>
                      <strong>方式三：菜单栏安装</strong>。点击浏览器右上角「三个点（⋮ 或 ⋯）」菜单 ➔ 选择<strong>「应用」</strong>或<strong>「将此网站作为应用安装」</strong>。
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-500">
                  💡 <strong>安装后效果</strong>：系统将在桌面创建“吉吉办公”快捷图标，点击即以独立原生软件窗口打开，无浏览器标签栏干扰，支持固定在 Windows 任务栏或 Mac 程序坞。
                </div>
              </div>
            )}

            {/* Android Tab */}
            {activeTab === 'android' && (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>安卓手机安装步骤（Chrome / 华为 / 小米 / 浏览器）</span>
                </div>
                <div className="space-y-2 text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <p>
                      在手机浏览器（建议使用手机自带浏览器或 Chrome）中访问本平台地址。
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <p>
                      点击底部或右上角<strong>菜单（⋮ 或 三条横线）</strong> ➔ 选择<strong>「添加到主屏幕」</strong>或<strong>「安装应用」</strong>。
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <p>
                      在弹出提示中点击<strong>「添加 / 安装」</strong>，手机桌面即刻生成“吉吉办公”专属高清图标，点开即全屏沉浸使用。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Tab */}
            {activeTab === 'ios' && (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Apple className="w-4 h-4 text-slate-900" />
                  <span>苹果 iPhone / iPad 安装步骤（Safari 浏览器专用）</span>
                </div>
                <div className="space-y-2 text-slate-600 leading-relaxed">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      1
                    </span>
                    <p>
                      必须使用 iPhone 自带的 <strong>Safari 浏览器</strong> 打开当前网站地址（如果是微信中打开，请先点击右上角选择「在 Safari 中打开」）。
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      2
                    </span>
                    <p>
                      点击 Safari 底部中间的<strong>「分享按钮」</strong>（带向上箭头的方框图标 <span className="font-mono text-blue-600 font-bold">⎋ / ↑</span>）。
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      3
                    </span>
                    <p>
                      在弹出的操作面板中向上滑，找到并点击<strong>「添加到主屏幕 (Add to Home Screen)」</strong>。
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      4
                    </span>
                    <p>
                      确认名称为<strong>“吉吉办公”</strong>后，点击右上角的<strong>「添加」</strong>，即可在苹果桌面像原生应用一样使用。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick URL Share & Transfer to Mobile */}
          <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="truncate flex-1 font-mono text-[11px] text-slate-600">
              <span className="text-slate-400 font-sans mr-1">在手机打开并安装网址:</span>
              <span className="underline decoration-slate-300">{currentUrl}</span>
            </div>
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-slate-700 shrink-0 transition-colors shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">已复制网址</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>复制网址</span>
                </>
              )}
            </button>
          </div>

          {/* Core Advantages of PWA Client */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>安装为独立客户端的核心优势</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>秒速直达</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  桌面或手机主屏一键启动，无需重复打开浏览器输入网址。
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-blue-500" />
                  <span>独立窗口</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  免除地址栏干扰，如同本地桌面软件一样纯净高效办公。
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <WifiOff className="w-3.5 h-3.5 text-emerald-500" />
                  <span>离线缓存</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  弱网或无网络环境下仍可快速打开，本地日程与标讯随查随用。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            遵循现代 Progressive Web App (PWA) 国际规范构建
          </div>
          <div className="flex items-center gap-2">
            {isInstallable && !isInstalled && (
              <button
                onClick={handleTriggerInstall}
                disabled={installing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>立即安装</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition-colors"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

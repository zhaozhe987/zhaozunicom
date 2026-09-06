import React from 'react';
import { Menu, Bell, FileDown, RefreshCw, LogOut } from 'lucide-react';
import { ModuleTab } from '../types';
import { getTodayDateStr, formatDateDisplay, getWeekdayStr } from '../utils/storage';

interface HeaderProps {
  activeTab: ModuleTab;
  unreadNotificationCount: number;
  onOpenMessageCenter: () => void;
  onOpenAnnualSummary: () => void;
  healthScore?: number;
  syncStatus?: 'synced' | 'syncing' | 'offline';
  onOpenMobileSidebar?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  unreadNotificationCount,
  onOpenMessageCenter,
  onOpenAnnualSummary,
  healthScore = 85,
  syncStatus = 'synced',
  onOpenMobileSidebar,
  onLogout,
}) => {
  const tabTitles: Record<ModuleTab, string> = {
    tasks: '今日任务列表',
    memos: '工作备忘录',
    expenses: '个人记账本',
    office: '办公转换工具',
    news: '今日精选资讯',
    tenders: '今日标讯监控',
    health: '身心健康指数',
    admin: '管理控制台与权限分配',
  };

  const todayStr = getTodayDateStr();
  const dateFormatted = `${formatDateDisplay(todayStr)} ${getWeekdayStr(todayStr)}`;

  const clampedScore = Math.min(100, Math.max(0, healthScore));

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-2xs">
      {/* Left: Hamburger (mobile) + Section Title & Date badge */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="展开菜单"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
          {tabTitles[activeTab] || '工作台概览'}
        </h2>

        <span className="hidden sm:inline-flex px-2 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded uppercase tracking-tighter border border-blue-100/80 shrink-0">
          {dateFormatted}
        </span>
      </div>

      {/* Right: Health Index, Annual Review, Sync, Notification */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Health Score Mini Widget */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            今日健康指数
          </span>
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black text-green-600 leading-none">
              {clampedScore}
            </span>
            <div className="w-20 sm:w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${clampedScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sync Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
          {syncStatus === 'syncing' ? (
            <>
              <RefreshCw className="w-2.5 h-2.5 text-blue-600 animate-spin" />
              <span className="font-medium text-blue-700">同步中...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-medium">已跨端同步</span>
            </>
          )}
        </div>

        {/* Annual Review Trigger */}
        <button
          id="btn-annual-summary"
          onClick={onOpenAnnualSummary}
          title="生成并导出年度工作回顾"
          className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors font-medium"
        >
          <FileDown className="w-3.5 h-3.5 text-blue-600" />
          <span>年度回顾</span>
        </button>

        {/* Notification Bell */}
        <button
          id="btn-notification-trigger"
          onClick={onOpenMessageCenter}
          className="p-2 text-slate-400 hover:text-blue-600 relative rounded-lg hover:bg-slate-100 transition-colors"
          title="查看消息中心"
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            id="btn-header-logout"
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            title="退出登录"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

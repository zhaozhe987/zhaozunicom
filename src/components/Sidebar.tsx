import React, { useState } from 'react';
import {
  Briefcase,
  StickyNote,
  CreditCard,
  FileText,
  Radio,
  Gavel,
  HeartPulse,
  Shield,
  X,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RotateCcw,
  SlidersHorizontal,
  Check,
  UserCheck,
  ChevronDown,
  LogOut,
  Lock,
} from 'lucide-react';
import { ModuleTab, UserInfo, BrandingConfig } from '../types';
import { defaultModuleOrder } from '../utils/storage';

interface SidebarProps {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  unreadNotificationCount: number;
  user: UserInfo;
  users: UserInfo[];
  onSwitchUser: (user: UserInfo) => void;
  branding: BrandingConfig;
  moduleOrder: ModuleTab[];
  setModuleOrder: React.Dispatch<React.SetStateAction<ModuleTab[]>>;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onLogout?: () => void;
}

interface NavMeta {
  id: ModuleTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadNotificationCount,
  user,
  users,
  onSwitchUser,
  branding,
  moduleOrder,
  setModuleOrder,
  isMobileOpen = false,
  onCloseMobile,
  onLogout,
}) => {
  const [isReordering, setIsReordering] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isAdmin = user.role === 'admin';

  const navMetaMap: Record<ModuleTab, NavMeta> = {
    tasks: { id: 'tasks', label: '每日工作', icon: <Briefcase className="w-4 h-4" /> },
    memos: { id: 'memos', label: '工作备忘录', icon: <StickyNote className="w-4 h-4" /> },
    expenses: { id: 'expenses', label: '个人记账本', icon: <CreditCard className="w-4 h-4" /> },
    office: { id: 'office', label: '办公助手', icon: <FileText className="w-4 h-4" /> },
    news: { id: 'news', label: '今日推送', icon: <Radio className="w-4 h-4" />, badge: 10 },
    tenders: { id: 'tenders', label: '标讯管理', icon: <Gavel className="w-4 h-4" /> },
    health: { id: 'health', label: '健康指数', icon: <HeartPulse className="w-4 h-4" /> },
    admin: { id: 'admin', label: '管理控制台', icon: <Shield className="w-4 h-4" /> },
  };

  // Requirement: Except for administrators, no other role is allowed to view the admin management platform
  const fullOrder = moduleOrder.filter((tab) => isAdmin || tab !== 'admin');
  if (isAdmin && !fullOrder.includes('admin')) {
    fullOrder.push('admin');
  }

  const handleSelectTab = (tab: ModuleTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  // Reorder helpers
  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fullOrder.length) return;

    const newOrder = [...fullOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    setModuleOrder(newOrder);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...fullOrder];
    const [moved] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, moved);
    setDraggedIndex(index);
    setModuleOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleResetOrder = () => {
    setModuleOrder([...defaultModuleOrder, 'admin']);
  };

  const content = (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 h-full select-none">
      {/* Brand Header (Requirement 5: 吉吉办公 + Custom Logo Support) */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {branding.logoUrl ? (
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden border border-slate-700">
              <img
                src={branding.logoUrl}
                alt={branding.appName || '吉吉办公'}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
              吉
            </div>
          )}

          <div className="min-w-0">
            <h1 className="font-bold text-white text-base tracking-tight truncate flex items-center gap-1.5">
              <span>{branding.appName || '吉吉办公'}</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono border border-blue-500/30">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 truncate mt-0.5">
              {branding.slogan || '跨端多用户协同与个人效率中枢'}
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title="关闭侧边栏"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Module Navigation Area (Requirement 3: Unified List + Drag & Drop Reordering) */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          工作台板块导航
        </span>
        <button
          onClick={() => setIsReordering(!isReordering)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] transition-colors ${
            isReordering
              ? 'bg-blue-600 text-white font-bold shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="自定义调整各板块展示顺序"
        >
          {isReordering ? (
            <>
              <Check className="w-3 h-3" />
              <span>完成排序</span>
            </>
          ) : (
            <>
              <SlidersHorizontal className="w-3 h-3" />
              <span>调整顺序</span>
            </>
          )}
        </button>
      </div>

      {isReordering && (
        <div className="mx-4 my-1 p-2 rounded-lg bg-blue-950/40 border border-blue-800/50 flex items-center justify-between text-[11px] text-blue-300">
          <span>拖拽或按上下箭头即可重新排列板块</span>
          <button
            onClick={handleResetOrder}
            className="text-blue-400 hover:text-white underline flex items-center gap-0.5 text-[10px]"
            title="恢复初始默认排布"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            重置
          </button>
        </div>
      )}

      {/* Reorderable Navigation Items */}
      <nav className="flex-1 py-2 px-3 overflow-y-auto space-y-1">
        {fullOrder.map((tabId, idx) => {
          const item = navMetaMap[tabId];
          if (!item) return null;
          const isActive = activeTab === tabId;
          const isFirst = idx === 0;
          const isLast = idx === fullOrder.length - 1;

          return (
            <div
              key={tabId}
              draggable={isReordering}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`group relative flex items-center rounded-lg transition-all ${
                isReordering
                  ? 'bg-slate-800/80 border border-dashed border-slate-600 my-1 cursor-grab active:cursor-grabbing'
                  : ''
              }`}
            >
              {/* Drag handle or reordering controls */}
              {isReordering && (
                <div className="flex items-center pl-2 text-slate-400">
                  <GripVertical className="w-3.5 h-3.5 text-slate-500 mr-1" />
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={isFirst}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveItem(idx, 'up');
                      }}
                      className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                      title="上移"
                    >
                      <ArrowUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isLast}
                      onClick={(e) => {
                        e.stopPropagation();
                        moveItem(idx, 'down');
                      }}
                      className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"
                      title="下移"
                    >
                      <ArrowDown className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation button */}
              <button
                id={`sidebar-nav-${tabId}`}
                onClick={() => handleSelectTab(tabId)}
                className={`flex-1 flex items-center px-3 py-2.5 rounded-lg transition-colors gap-3 text-left ${
                  isActive
                    ? 'text-white bg-blue-600 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                  {item.icon}
                </span>
                <span className="text-xs font-medium flex-1">{item.label}</span>

                {item.id === 'admin' && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    权限
                  </span>
                )}

                {item.badge && !isActive && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Current User & Session / Account Control (Requirement: 不允许普通用户进行账号的切换) */}
      <div className="p-3.5 border-t border-slate-800 relative bg-slate-950/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white overflow-hidden border border-slate-600 shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                user.displayName.slice(0, 1)
              )}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white truncate">
                  {user.displayName}
                </p>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                    user.role === 'admin'
                      ? 'bg-blue-600 text-white font-bold'
                      : user.role === 'supervisor'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {user.role === 'admin' ? '管理员' : user.role === 'supervisor' ? '主管' : '成员'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {user.department || user.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Requirement: Only administrators are permitted to switch accounts */}
            {user.role === 'admin' && (
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="切换账号 (管理员调试专用)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

            {/* Logout Button for All Users */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="退出当前登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* User Switcher Dropdown (Admin Only) */}
        {user.role === 'admin' && showUserDropdown && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700 mb-1 flex items-center justify-between">
              <span>快速切换登录账号</span>
              <span className="text-blue-400">管理员权限</span>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1">
              {users.map((u) => {
                const isSelected = u.userId === user.userId;
                return (
                  <button
                    key={u.userId}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="truncate font-semibold">{u.displayName}</p>
                      <p className="text-[10px] opacity-75 truncate">{u.department}</p>
                    </div>
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-900/60 font-mono shrink-0">
                      {u.role === 'admin' ? '管理员' : u.role === 'supervisor' ? '主管' : '成员'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0 h-full">{content}</div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

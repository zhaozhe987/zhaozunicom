import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskModule } from './components/TaskModule';
import { MemoModule } from './components/MemoModule';
import { ExpenseModule } from './components/ExpenseModule';
import { OfficeModule } from './components/OfficeModule';
import { NewsModule } from './components/NewsModule';
import { TenderModule } from './components/TenderModule';
import { HealthModule } from './components/HealthModule';
import { AdminModule } from './components/AdminModule';
import { MessageCenterModal } from './components/MessageCenterModal';
import { AnnualSummaryModal } from './components/AnnualSummaryModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { LoginScreen } from './components/LoginScreen';

import {
  ModuleTab,
  TaskItem,
  MemoItem,
  ExpenseItem,
  OfficeJob,
  NewsItem,
  TenderItem,
  HealthRecord,
  AppNotification,
  UserInfo,
  UserGroup,
  BrandingConfig,
  GroupShareRequest,
} from './types';

import {
  loadTasks,
  saveTasks,
  loadMemos,
  saveMemos,
  loadExpenses,
  saveExpenses,
  loadOfficeJobs,
  saveOfficeJobs,
  loadNews,
  saveNews,
  loadTenders,
  saveTenders,
  loadHealthRecords,
  saveHealthRecords,
  loadNotifications,
  saveNotifications,
  loadCurrentUser,
  saveCurrentUser,
  loadUsers,
  saveUsers,
  loadGroups,
  saveGroups,
  loadBrandingConfig,
  saveBrandingConfig,
  loadShareRequests,
  saveShareRequests,
  getStoredModuleOrder,
  saveStoredModuleOrder,
  getTodayDateStr,
  getIsLoggedIn,
  setIsLoggedIn,
  logoutUser,
} from './utils/storage';

export default function App() {
  // Authentication & Mandatory Login (Requirement: 平台首次需要进行登录使用)
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(getIsLoggedIn);

  // Navigation State & Module Order (Requirement 3: Drag & Drop Custom Reordering)
  const [activeTab, setActiveTab] = useState<ModuleTab>('tasks');
  const [moduleOrder, setModuleOrder] = useState<ModuleTab[]>(getStoredModuleOrder);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Multi-account & Group Management State (Requirement 1 & 6)
  const [currentUser, setCurrentUser] = useState<UserInfo>(loadCurrentUser);
  const [users, setUsers] = useState<UserInfo[]>(loadUsers);
  const [groups, setGroups] = useState<UserGroup[]>(loadGroups);
  const [shareRequests, setShareRequests] = useState<GroupShareRequest[]>(loadShareRequests);

  // Branding Customization (Requirement 5: 吉吉办公 + Admin logo/image customization)
  const [branding, setBranding] = useState<BrandingConfig>(loadBrandingConfig);

  // Sync State indicator
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  // Domain States with LocalStorage Hydration
  const [tasks, setTasks] = useState<TaskItem[]>(loadTasks);
  const [memos, setMemos] = useState<MemoItem[]>(loadMemos);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(loadExpenses);
  const [officeJobs, setOfficeJobs] = useState<OfficeJob[]>(loadOfficeJobs);
  const [news, setNews] = useState<NewsItem[]>(loadNews);
  const [tenders, setTenders] = useState<TenderItem[]>(loadTenders);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(loadHealthRecords);
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);

  // Modals
  const [isMessageCenterOpen, setIsMessageCenterOpen] = useState(false);
  const [isAnnualSummaryOpen, setIsAnnualSummaryOpen] = useState(false);

  // Trigger sync animation when saving
  const triggerSyncAnimation = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
    }, 400);
  };

  // Sync state changes to persistence
  useEffect(() => {
    saveTasks(tasks);
    triggerSyncAnimation();
  }, [tasks]);

  useEffect(() => {
    saveMemos(memos);
    triggerSyncAnimation();
  }, [memos]);

  useEffect(() => {
    saveExpenses(expenses);
    triggerSyncAnimation();
  }, [expenses]);

  useEffect(() => {
    saveOfficeJobs(officeJobs);
    triggerSyncAnimation();
  }, [officeJobs]);

  useEffect(() => {
    saveNews(news);
    triggerSyncAnimation();
  }, [news]);

  useEffect(() => {
    saveTenders(tenders);
    triggerSyncAnimation();
  }, [tenders]);

  useEffect(() => {
    saveHealthRecords(healthRecords);
    triggerSyncAnimation();
  }, [healthRecords]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    saveUsers(users);
  }, [users]);

  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  useEffect(() => {
    saveBrandingConfig(branding);
  }, [branding]);

  useEffect(() => {
    saveShareRequests(shareRequests);
  }, [shareRequests]);

  useEffect(() => {
    saveStoredModuleOrder(moduleOrder);
  }, [moduleOrder]);

  // Helper to append a new notification
  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Switch Current User (Requirement 1 & 6: only admin can switch user)
  const handleSwitchUser = (selectedUser: UserInfo) => {
    if (currentUser.role !== 'admin') {
      alert('权限拦截：普通用户不允许进行账号切换！');
      return;
    }
    setCurrentUser(selectedUser);
    saveCurrentUser(selectedUser);
    addNotification({
      title: '账号已切换',
      content: `当前工作台操作人已切换为【${selectedUser.displayName}】(${selectedUser.department || selectedUser.role})`,
      type: 'system',
    });
  };

  // Logout Handler (Requirement: 平台首次需要进行登录使用)
  const handleLogout = () => {
    logoutUser();
    setIsLoggedInState(false);
  };

  // Forward News to Group Handler (Requirement 4)
  const handleForwardNewsToGroup = (newsItem: NewsItem, groupId: string, comment: string) => {
    const targetGroup = groups.find((g) => g.id === groupId) || groups[0];
    const groupName = targetGroup?.name || '协同工作群';

    // 1. Add notification
    addNotification({
      title: `【${groupName}】收到新闻转发`,
      content: `${currentUser.displayName} 转发了《${newsItem.title}》：${comment}`,
      type: 'news',
      actionLink: newsItem.url,
    });

    // 2. Also create a collaborative follow-up task in that group for tracking
    const today = getTodayDateStr();
    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: `[资讯协同] 跟进研判: ${newsItem.title.slice(0, 32)}...`,
      description: `来源于 ${currentUser.displayName} 转发的新闻。\n批注意见: ${comment}\n原文链接: ${newsItem.url || ''}`,
      status: 'pending',
      dueDate: today,
      createdAt: `${today} ${new Date().toLocaleTimeString().slice(0, 5)}`,
      priority: 'high',
      creatorId: currentUser.userId,
      creatorName: currentUser.displayName,
      isSharedToGroup: true,
      sharedGroupId: targetGroup?.id,
      sharedGroupName: groupName,
      logs: [
        {
          id: `log_${Date.now()}`,
          timestamp: `${today} ${new Date().toLocaleTimeString().slice(0, 5)}`,
          action: 'create',
          remark: `由 ${currentUser.displayName} 通过新闻分享自动同步至【${groupName}】`,
        },
      ],
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  // Enforce: if current non-admin user somehow is on admin tab, redirect to tasks
  useEffect(() => {
    if (activeTab === 'admin' && currentUser.role !== 'admin') {
      setActiveTab('tasks');
    }
  }, [activeTab, currentUser.role]);

  // Requirement: Mandatory initial login screen
  if (!isLoggedIn) {
    return (
      <LoginScreen
        branding={branding}
        onLoginSuccess={(authedUser) => {
          setCurrentUser(authedUser);
          setIsLoggedIn(true);
          setIsLoggedInState(true);
          addNotification({
            title: '欢迎登录系统',
            content: `你好，${authedUser.displayName}！已成功登录${branding.appName || '办公助手'}。`,
            type: 'system',
          });
        }}
      />
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const unreadNewsCount = news.filter((n) => !n.isRead).length;

  const todayStr = getTodayDateStr();
  const todayRecord = healthRecords.find((r) => r.date === todayStr);
  const currentHealthScore = todayRecord?.score ?? (healthRecords[0]?.score ?? 85);

  return (
    <div className="flex h-screen w-full bg-slate-100 text-slate-800 font-sans overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* High Density Dark Navigation Sidebar (Requirement 3, 5, 6) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadNotificationCount={unreadCount}
        unreadNewsCount={unreadNewsCount}
        user={currentUser}
        users={users}
        onSwitchUser={handleSwitchUser}
        branding={branding}
        moduleOrder={moduleOrder}
        setModuleOrder={setModuleOrder}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Area with Header and Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* High Density Light Header */}
        <Header
          activeTab={activeTab}
          unreadNotificationCount={unreadCount}
          onOpenMessageCenter={() => setIsMessageCenterOpen(true)}
          onOpenAnnualSummary={() => setIsAnnualSummaryOpen(true)}
          healthScore={currentHealthScore}
          syncStatus={syncStatus}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* Scrollable Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/90">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* Requirement 1: Tasks with Multi-Account & Group Sharing */}
            {activeTab === 'tasks' && (
              <TaskModule
                tasks={tasks}
                setTasks={setTasks}
                currentUser={currentUser}
                users={users}
                setUsers={setUsers}
                groups={groups}
                setGroups={setGroups}
                shareRequests={shareRequests}
                setShareRequests={setShareRequests}
              />
            )}

            {activeTab === 'memos' && <MemoModule memos={memos} setMemos={setMemos} />}
            {activeTab === 'expenses' && <ExpenseModule expenses={expenses} setExpenses={setExpenses} />}

            {activeTab === 'office' && (
              <OfficeModule
                officeJobs={officeJobs}
                setOfficeJobs={setOfficeJobs}
                addNotification={addNotification}
              />
            )}

            {/* Requirement 4: News with 8:00 AM Push, Jump Link & Share/Forward */}
            {activeTab === 'news' && (
              <NewsModule
                news={news}
                setNews={setNews}
                currentUser={currentUser}
                groups={groups}
                onOpenMessageCenter={() => setIsMessageCenterOpen(true)}
                onForwardNewsToGroup={handleForwardNewsToGroup}
              />
            )}

            {/* Requirement 2: Tenders with Recent (1 Week) and Historical (3 Years) Plates & External Links */}
            {activeTab === 'tenders' && <TenderModule tenders={tenders} setTenders={setTenders} />}

            {activeTab === 'health' && (
              <HealthModule
                healthRecords={healthRecords}
                setHealthRecords={setHealthRecords}
                tasks={tasks}
              />
            )}

            {/* Requirement 5 & 6: Admin Management Console (Admin Only) */}
            {activeTab === 'admin' && (
              <AdminModule
                currentUser={currentUser}
                users={users}
                setUsers={setUsers}
                groups={groups}
                setGroups={setGroups}
                branding={branding}
                setBranding={setBranding}
                shareRequests={shareRequests}
                setShareRequests={setShareRequests}
                onSwitchUser={handleSwitchUser}
              />
            )}
          </div>
        </main>

        {/* Compact Footer */}
        <footer className="bg-white border-t border-slate-200 py-2.5 px-4 sm:px-6 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-1.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{branding.appName || '办公助手'}</span>
              <span>·</span>
              <span>{branding.slogan || '跨端多用户协同与个人效率中枢'}</span>
              <span>·</span>
              <span className="text-emerald-600 font-medium">群组数据安全隔离 · 实时协同</span>
            </div>

            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              <button
                onClick={() => setIsAnnualSummaryOpen(true)}
                className="hover:text-blue-600 transition-colors"
              >
                年终总结生成
              </button>
              {currentUser.role === 'admin' && (
                <>
                  <span>·</span>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="hover:text-blue-600 text-blue-600 font-semibold transition-colors"
                  >
                    管理控制台
                  </button>
                </>
              )}
              <span>·</span>
              <span>
                当前操作人：<strong>{currentUser.displayName}</strong> ({currentUser.username})
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <MessageCenterModal
        isOpen={isMessageCenterOpen}
        onClose={() => setIsMessageCenterOpen(false)}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      <AnnualSummaryModal
        isOpen={isAnnualSummaryOpen}
        onClose={() => setIsAnnualSummaryOpen(false)}
        tasks={tasks}
        memos={memos}
        healthRecords={healthRecords}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}

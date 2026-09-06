import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  History,
  FileText,
  Download,
  AlertCircle,
  Copy,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sparkles,
  ListTodo,
  Check,
  Tag,
  ArrowUpRight,
  Users,
  Share2,
  ShieldAlert,
  Send,
  UserPlus,
  UserCheck,
  Lock,
  Unlock,
  CheckCheck,
  FolderPlus,
  ShieldCheck,
} from 'lucide-react';
import { TaskItem, TaskLog, UserInfo, UserGroup, GroupShareRequest } from '../types';
import {
  getTodayDateStr,
  formatDateDisplay,
  getWeekdayStr,
  isHolidayOrWeekend,
  generateDailyReportMd,
  generateWeeklyReportMd,
  downloadTextFile,
} from '../utils/storage';

interface TaskModuleProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  currentUser: UserInfo;
  users: UserInfo[];
  setUsers?: React.Dispatch<React.SetStateAction<UserInfo[]>>;
  groups: UserGroup[];
  setGroups?: React.Dispatch<React.SetStateAction<UserGroup[]>>;
  shareRequests: GroupShareRequest[];
  setShareRequests: React.Dispatch<React.SetStateAction<GroupShareRequest[]>>;
  onTasksChanged?: () => void;
}

export const TaskModule: React.FC<TaskModuleProps> = ({
  tasks,
  setTasks,
  currentUser,
  users,
  setUsers,
  groups,
  setGroups,
  shareRequests,
  setShareRequests,
  onTasksChanged,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateStr());

  // Check if current user has permission to create/manage groups (Admin or Supervisor with delegated permission)
  const canCreateGroup =
    currentUser.role === 'admin' ||
    (currentUser.role === 'supervisor' && currentUser.permissions?.canManageGroups !== false);

  // Supervisor Group Creation Modal state
  const [showSupervisorCreateGroupModal, setShowSupervisorCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('blue');
  const [newGroupMemberIds, setNewGroupMemberIds] = useState<string[]>([currentUser.userId]);
  const [groupCreateToast, setGroupCreateToast] = useState('');

  // Handle Supervisor Create Group
  const handleSupervisorCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: UserGroup = {
      id: `group_${Date.now().toString().slice(-6)}`,
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || `${currentUser.department || '部门'} 专项工作组`,
      color: newGroupColor,
      leaderId: currentUser.userId,
      leaderName: currentUser.displayName,
      memberIds: Array.from(new Set([...newGroupMemberIds, currentUser.userId])),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    if (setGroups) {
      setGroups((prev) => [...prev, newGroup]);
    }

    if (setUsers) {
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (newGroup.memberIds.includes(u.userId) && !u.groupList.includes(newGroup.id)) {
            return { ...u, groupList: [...u.groupList, newGroup.id] };
          }
          return u;
        })
      );
    }

    setGroupCreateToast(`项目组【${newGroupName}】已通过主管下放权限成功设立并投入协同！`);
    setTimeout(() => setGroupCreateToast(''), 3500);
    setShowSupervisorCreateGroupModal(false);
    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupMemberIds([currentUser.userId]);
  };

  // Task Filter state (Requirement 1: Multi-account & Group collaboration)
  const [activeFilterTab, setActiveFilterTab] = useState<string>('all'); // 'all' | 'mine' | 'shared' | groupId

  // Creation modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState(selectedDate);
  const [newPriority, setNewPriority] = useState<'normal' | 'high' | 'low'>('normal');
  const [isShareToGroupChecked, setIsShareToGroupChecked] = useState(false);
  const [selectedShareGroupId, setSelectedShareGroupId] = useState<string>(
    currentUser.groupList[0] || (groups[0] ? groups[0].id : '')
  );

  // Requirement 1: Apply to View Peer Tasks Modal
  const [showApplyPeerModal, setShowApplyPeerModal] = useState(false);
  const [targetPeerId, setTargetPeerId] = useState<string>('');
  const [targetPeerGroupId, setTargetPeerGroupId] = useState<string>('');
  const [applyReason, setApplyReason] = useState('');
  const [applyToast, setApplyToast] = useState(false);

  // Follow-up modal state
  const [followUpTask, setFollowUpTask] = useState<TaskItem | null>(null);
  const [followUpTargetDate, setFollowUpTargetDate] = useState<string>('');
  const [followUpNoteCustom, setFollowUpNoteCustom] = useState('');
  const [skipHolidaysAuto, setSkipHolidaysAuto] = useState(true);

  // Event Log timeline modal state
  const [historyTask, setHistoryTask] = useState<TaskItem | null>(null);

  // Daily report modal state
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [dailyReportContent, setDailyReportContent] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  // Find user's groups
  const myGroups = groups.filter((g) => currentUser.groupList.includes(g.id));

  // Find peers in the same groups
  const peerUsers = users.filter(
    (u) =>
      u.userId !== currentUser.userId &&
      u.groupList.some((gid) => currentUser.groupList.includes(gid))
  );

  // Approved share requests where currentUser is granted access
  const approvedPeerIds = shareRequests
    .filter((req) => req.fromUserId === currentUser.userId && req.status === 'approved')
    .map((req) => req.targetUserId);

  // Filter tasks for selected date AND based on group/permission rules
  const currentDayTasks = tasks.filter((t) => {
    // Date match
    if (t.dueDate !== selectedDate) return false;

    // Requirement 1 Permission Check:
    // 1. Created by current user -> visible
    const isMine = !t.creatorId || t.creatorId === currentUser.userId;
    // 2. Shared to a group that currentUser belongs to -> visible
    const isSharedToMyGroup =
      t.isSharedToGroup && t.sharedGroupId && currentUser.groupList.includes(t.sharedGroupId);
    // 3. Peer has granted permission to currentUser -> visible
    const isGrantedByPeer = t.creatorId && approvedPeerIds.includes(t.creatorId);

    // If not admin and not meeting any above, hide
    if (currentUser.role !== 'admin' && !isMine && !isSharedToMyGroup && !isGrantedByPeer) {
      return false;
    }

    // View tab filtering:
    if (activeFilterTab === 'mine') {
      return isMine;
    }
    if (activeFilterTab === 'shared') {
      return isSharedToMyGroup;
    }
    if (activeFilterTab.startsWith('group_')) {
      const gId = activeFilterTab.replace('group_', '');
      return t.sharedGroupId === gId;
    }

    return true;
  });

  const doneCount = currentDayTasks.filter((t) => t.status === 'done').length;
  const pendingCount = currentDayTasks.filter((t) => t.status === 'pending').length;
  const followUpCount = currentDayTasks.filter((t) => t.status === 'follow_up').length;
  const sharedCount = currentDayTasks.filter((t) => t.isSharedToGroup).length;

  const holidayInfo = isHolidayOrWeekend(selectedDate);

  // Date navigation handlers
  const changeDateByDays = (delta: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const newDateStr = `${y}-${m}-${day}`;
    setSelectedDate(newDateStr);
  };

  // 1. Create task with Group Sharing support
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const now = new Date();
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const targetGroup = groups.find((g) => g.id === selectedShareGroupId);

    const newTask: TaskItem = {
      id: `task_${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim(),
      status: 'pending',
      dueDate: newDueDate || selectedDate,
      createdAt: `${newDueDate || selectedDate} ${nowTimeStr}`,
      priority: newPriority,
      creatorId: currentUser.userId,
      creatorName: currentUser.displayName,
      isSharedToGroup: isShareToGroupChecked,
      sharedGroupId: isShareToGroupChecked ? selectedShareGroupId : undefined,
      sharedGroupName: isShareToGroupChecked ? targetGroup?.name : undefined,
      logs: [
        {
          id: `log_${Date.now()}`,
          timestamp: `${newDueDate || selectedDate} ${nowTimeStr}`,
          action: 'create',
          remark: isShareToGroupChecked
            ? `任务创建成功，并共享至群组 [${targetGroup?.name || '协同组'}]`
            : '个人工作任务创建成功',
        },
      ],
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');
    setNewDescription('');
    setIsShareToGroupChecked(false);
    setShowAddModal(false);
    onTasksChanged?.();
  };

  // 2. Toggle Task Status (Complete / Reopen)
  const handleToggleComplete = (task: TaskItem) => {
    const now = new Date();
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timestamp = `${selectedDate} ${nowTimeStr}`;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== task.id) return t;
        if (t.status === 'done') {
          // Reopen
          const updatedLogs: TaskLog[] = [
            ...(t.logs || []),
            {
              id: `log_${Date.now()}`,
              timestamp,
              action: 'reopen',
              remark: `${currentUser.displayName} 重新标记为待办`,
            },
          ];
          return {
            ...t,
            status: 'pending',
            completedAt: undefined,
            logs: updatedLogs,
          };
        } else {
          // Complete
          const updatedLogs: TaskLog[] = [
            ...(t.logs || []),
            {
              id: `log_${Date.now()}`,
              timestamp,
              action: 'complete',
              remark: `${currentUser.displayName} 于 ${nowTimeStr} 确认完成`,
            },
          ];
          return {
            ...t,
            status: 'done',
            completedAt: timestamp,
            logs: updatedLogs,
          };
        }
      })
    );
    onTasksChanged?.();
  };

  // Toggle quick share to group for existing task
  const handleToggleTaskSharing = (task: TaskItem) => {
    const now = new Date();
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const defaultGroup = myGroups[0] || groups[0];

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== task.id) return t;
        const newSharedState = !t.isSharedToGroup;
        const newLogs: TaskLog[] = [
          ...(t.logs || []),
          {
            id: `log_${Date.now()}`,
            timestamp: `${selectedDate} ${nowTimeStr}`,
            action: 'update',
            remark: newSharedState
              ? `${currentUser.displayName} 将待办共享至群组 [${defaultGroup?.name}]`
              : `${currentUser.displayName} 取消了群组协同共享`,
          },
        ];

        return {
          ...t,
          isSharedToGroup: newSharedState,
          sharedGroupId: newSharedState ? defaultGroup?.id : undefined,
          sharedGroupName: newSharedState ? defaultGroup?.name : undefined,
          logs: newLogs,
        };
      })
    );
    onTasksChanged?.();
  };

  // 3. Open Follow-up Modal
  const handleOpenFollowUp = (task: TaskItem) => {
    setFollowUpTask(task);
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    while (skipHolidaysAuto && (d.getDay() === 0 || d.getDay() === 6)) {
      d.setDate(d.getDate() + 1);
    }
    const nextDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setFollowUpTargetDate(nextDateStr);
    setFollowUpNoteCustom('');
  };

  // 4. Confirm Follow-up deferral
  const handleConfirmFollowUp = () => {
    if (!followUpTask || !followUpTargetDate) return;

    let finalTargetDate = followUpTargetDate;
    if (skipHolidaysAuto) {
      const check = isHolidayOrWeekend(finalTargetDate);
      if (check.isOff) {
        const d = new Date(finalTargetDate + 'T00:00:00');
        while (
          isHolidayOrWeekend(
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
          ).isOff
        ) {
          d.setDate(d.getDate() + 1);
        }
        finalTargetDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
    }

    const now = new Date();
    const nowTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timestamp = `${selectedDate} ${nowTimeStr}`;
    const followNoteText = `计划于 ${finalTargetDate} (${getWeekdayStr(finalTargetDate)}) 跟进${followUpNoteCustom ? `：${followUpNoteCustom}` : ''}`;

    const newFollowUpTaskId = `task_${Date.now()}`;
    const newChildTask: TaskItem = {
      id: newFollowUpTaskId,
      title: followUpTask.title,
      description: followUpTask.description,
      status: 'pending',
      dueDate: finalTargetDate,
      createdAt: timestamp,
      priority: followUpTask.priority,
      creatorId: followUpTask.creatorId || currentUser.userId,
      creatorName: followUpTask.creatorName || currentUser.displayName,
      isSharedToGroup: followUpTask.isSharedToGroup,
      sharedGroupId: followUpTask.sharedGroupId,
      sharedGroupName: followUpTask.sharedGroupName,
      originalTaskId: followUpTask.originalTaskId || followUpTask.id,
      followUpNote: `来源于 ${selectedDate} 任务顺延`,
      logs: [
        {
          id: `log_${Date.now()}_child`,
          timestamp,
          action: 'create',
          remark: `由原任务 [${followUpTask.id}] 顺延至此`,
        },
      ],
    };

    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id !== followUpTask.id) return t;
        const newLogs: TaskLog[] = [
          ...(t.logs || []),
          {
            id: `log_${Date.now()}_orig`,
            timestamp,
            action: 'follow_up',
            remark: followNoteText,
            targetDate: finalTargetDate,
          },
        ];
        return {
          ...t,
          status: 'follow_up' as const,
          followUpNote: followNoteText,
          followUpDate: finalTargetDate,
          logs: newLogs,
        };
      });
      return [newChildTask, ...updated];
    });

    setFollowUpTask(null);
    onTasksChanged?.();
  };

  // 5. Submit Peer Task View Application (Requirement 1)
  const handleSubmitPeerApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPeerId) return;

    const targetUser = users.find((u) => u.userId === targetPeerId);
    const targetGroup = groups.find((g) => g.id === targetPeerGroupId) || myGroups[0];

    const newReq: GroupShareRequest = {
      id: `req_${Date.now()}`,
      fromUserId: currentUser.userId,
      fromUserName: currentUser.displayName,
      targetUserId: targetPeerId,
      targetUserName: targetUser?.displayName || '同事',
      groupId: targetGroup?.id || '',
      groupName: targetGroup?.name || '协同工作群',
      status: 'approved', // Auto-approved for colleagues in same group
      createdAt: new Date().toLocaleDateString(),
      reason: applyReason.trim() || '项目协同攻坚与待办同步',
    };

    setShareRequests((prev) => [newReq, ...prev]);
    setApplyToast(true);
    setTimeout(() => {
      setApplyToast(false);
      setShowApplyPeerModal(false);
      setApplyReason('');
    }, 1500);
  };

  // 6. Generate & Open Daily Report Modal
  const handleOpenDailyReport = () => {
    const report = generateDailyReportMd(selectedDate, currentDayTasks);
    setDailyReportContent(report);
    setShowDailyReportModal(true);
    setCopiedReport(false);
  };

  // Permission check for report export
  const canExportReports =
    currentUser.role === 'admin' ||
    (currentUser.role === 'supervisor' && currentUser.permissions?.canExportReports !== false) ||
    (currentUser.role === 'member' && currentUser.permissions?.canExportReports === true);

  // 7. Export Weekly Report
  const handleExportWeeklyReport = () => {
    if (!canExportReports) {
      alert('抱歉，当前账号尚未获得部门周度协同报表导出权限，请联系部门主管或超级管理员开通！');
      return;
    }
    const report = generateWeeklyReportMd(selectedDate, tasks);
    downloadTextFile(`吉吉办公_周工作汇总_${selectedDate}.md`, report);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Date Bar & Multi-Account Group Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Left: Date Navigator */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-1.5 hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition-colors"
                title="上一日"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                  className="text-sm font-semibold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
                />
              </div>
              <button
                onClick={() => changeDateByDays(1)}
                className="p-1.5 hover:bg-white rounded-md text-slate-600 hover:text-slate-900 transition-colors"
                title="下一日"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setSelectedDate(getTodayDateStr())}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors border border-blue-200"
            >
              今日
            </button>

            {/* Date Details & Holiday API indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">
                {formatDateDisplay(selectedDate)} ({getWeekdayStr(selectedDate)})
              </span>
              {holidayInfo.isOff ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {holidayInfo.name || '节假日/周末'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  工作日
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
            {/* Requirement 1: Apply to view peer task button */}
            <button
              onClick={() => {
                setTargetPeerId(peerUsers[0]?.userId || '');
                setTargetPeerGroupId(myGroups[0]?.id || '');
                setShowApplyPeerModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg shadow-2xs transition-colors"
              title="向同组群成员申请查看或共享工作待办"
            >
              <Users className="w-3.5 h-3.5 text-indigo-600" />
              <span>申请协同/查看群成员待办</span>
            </button>

            <button
              onClick={handleOpenDailyReport}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>日报生成</span>
            </button>

            <button
              onClick={handleExportWeeklyReport}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg shadow-2xs transition-colors ${
                canExportReports
                  ? 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300'
                  : 'text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed'
              }`}
              title={canExportReports ? '导出本周工作报表 Markdown' : '未获授权 (需主管或管理员配置)'}
            >
              <Download className={`w-3.5 h-3.5 ${canExportReports ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>周汇总导出 (.md)</span>
              {!canExportReports && <Lock className="w-3 h-3 text-slate-400 ml-0.5" />}
            </button>

            {/* Supervisor Delegated Group Creation (Requirement: 设置群组的权限可以下放至部门主管) */}
            {canCreateGroup && (
              <button
                onClick={() => setShowSupervisorCreateGroupModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-colors"
                title={
                  currentUser.role === 'admin'
                    ? '管理员快速设立业务项目协同组'
                    : '部门主管下放特权：自主设立项目协同组'
                }
              >
                <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {currentUser.role === 'supervisor' ? '设立项目组(主管下放)' : '设立协同组'}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                setNewDueDate(selectedDate);
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新建任务</span>
            </button>
          </div>
        </div>

        {/* Group creation success notification toast */}
        {groupCreateToast && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              {groupCreateToast}
            </span>
            <button
              onClick={() => setGroupCreateToast('')}
              className="text-emerald-600 hover:text-emerald-800 text-xs ml-2"
            >
              关闭
            </button>
          </div>
        )}

        {/* Task KPI bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">当日总展示待办</p>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{currentDayTasks.length}</p>
          </div>
          <div className="bg-emerald-50/60 rounded-lg p-2.5 border border-emerald-100">
            <p className="text-[11px] font-medium text-emerald-700">已完成</p>
            <p className="text-lg font-bold text-emerald-800 mt-0.5">{doneCount}</p>
          </div>
          <div className="bg-blue-50/60 rounded-lg p-2.5 border border-blue-100">
            <p className="text-[11px] font-medium text-blue-700">待办推进中</p>
            <p className="text-lg font-bold text-blue-800 mt-0.5">{pendingCount}</p>
          </div>
          <div className="bg-indigo-50/60 rounded-lg p-2.5 border border-indigo-100">
            <p className="text-[11px] font-medium text-indigo-700">群组协同任务</p>
            <p className="text-lg font-bold text-indigo-800 mt-0.5">{sharedCount}</p>
          </div>
        </div>

        {/* Requirement 1: Filter Tabs for Group Sharing */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 overflow-x-auto no-scrollbar">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">视图范围:</span>
          <button
            onClick={() => setActiveFilterTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilterTab === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            全部任务
          </button>
          <button
            onClick={() => setActiveFilterTab('mine')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilterTab === 'mine'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            我的个人待办
          </button>
          <button
            onClick={() => setActiveFilterTab('shared')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilterTab === 'shared'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            群组协同共享 ({sharedCount})
          </button>

          {/* Group pills */}
          {myGroups.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveFilterTab(`group_${g.id}`)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilterTab === `group_${g.id}`
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col min-h-[380px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full shrink-0" />
            <h3 className="font-bold text-slate-800 text-sm">
              今日任务列表 ({currentDayTasks.length})
            </h3>
            <span className="text-xs text-slate-400">
              当前操作人：<strong>{currentUser.displayName}</strong> ({currentUser.role === 'admin' ? '超级管理员' : '协同成员'})
            </span>
          </div>
          <button
            onClick={() => {
              setNewDueDate(selectedDate);
              setShowAddModal(true);
            }}
            className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-xs transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建任务</span>
          </button>
        </div>

        {/* Table Column Headers */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
          <div className="col-span-1">状态</div>
          <div className="col-span-6">任务名称与协同属性</div>
          <div className="col-span-3">创建与流转信息</div>
          <div className="col-span-2 text-right">操作</div>
        </div>

        {currentDayTasks.length === 0 ? (
          <div className="p-12 text-center my-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700">该日期暂无符合条件的任务</p>
            <p className="text-xs text-slate-400 mt-1">
              点击右上角“新建任务”或在上方切换视图范围查看群组待办
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 flex-1 overflow-auto">
            {currentDayTasks.map((task) => {
              const isDone = task.status === 'done';
              const isFollowUp = task.status === 'follow_up';
              const isMyTask = !task.creatorId || task.creatorId === currentUser.userId;

              return (
                <div
                  key={task.id}
                  className="p-4 transition-colors hover:bg-blue-50/60 flex flex-col sm:grid sm:grid-cols-12 sm:items-center sm:gap-4"
                >
                  {/* Column 1: Status Checkbox Button */}
                  <div className="col-span-1 flex items-center mb-2 sm:mb-0">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-green-500 text-white shadow-2xs'
                          : isFollowUp
                          ? 'border-2 border-amber-400 cursor-pointer bg-white'
                          : 'border-2 border-slate-200 hover:border-blue-500 bg-white cursor-pointer'
                      }`}
                      title={isDone ? '标记为待办' : '标记为已完成'}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : isFollowUp ? (
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      ) : null}
                    </button>
                  </div>

                  {/* Column 2: Title & Collaboration Badges (Requirement 1) */}
                  <div className="col-span-6 min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={`font-bold text-sm ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </p>

                      {task.priority === 'high' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                          高优
                        </span>
                      )}

                      {/* Group Share Badge */}
                      {task.isSharedToGroup && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Users className="w-3 h-3 text-indigo-600" />
                          <span>协同共享 · {task.sharedGroupName || '项目组'}</span>
                        </span>
                      )}

                      {/* Creator badge */}
                      {task.creatorName && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                          发起人：{task.creatorName}
                        </span>
                      )}

                      {isDone && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          完成于 {task.completedAt?.split(' ')[1] || '今日'}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p
                        className={`text-xs mt-1 leading-relaxed ${
                          isDone ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {task.description}
                      </p>
                    )}

                    {task.followUpNote && (
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
                        <ArrowRight className="w-3 h-3 text-amber-600" />
                        <span>{task.followUpNote}</span>
                      </div>
                    )}
                  </div>

                  {/* Column 3: History & Creation info */}
                  <div className="col-span-3 text-xs text-slate-500 my-2 sm:my-0 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                      创建：{task.createdAt.split(' ')[1] || task.createdAt}
                    </span>
                    {task.logs && task.logs.length > 1 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded italic font-medium">
                        流转: {task.logs.length}条记录
                      </span>
                    )}
                  </div>

                  {/* Column 4: Actions & Quick Sharing Toggle */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {/* Share / Unshare toggle if owned by current user */}
                    {isMyTask && (
                      <button
                        onClick={() => handleToggleTaskSharing(task)}
                        className={`p-1.5 rounded-md text-xs transition-colors ${
                          task.isSharedToGroup
                            ? 'text-indigo-600 hover:bg-indigo-50 font-semibold'
                            : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
                        }`}
                        title={task.isSharedToGroup ? '点击取消群组共享' : '点击共享给同群成员'}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {!isDone && (
                      <button
                        onClick={() => handleOpenFollowUp(task)}
                        className="text-blue-600 font-bold hover:underline text-xs"
                        title="指定未来日期跟进并生成新任务"
                      >
                        待跟进
                      </button>
                    )}

                    <button
                      onClick={() => setHistoryTask(task)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="查看任务事件日志时间线"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal 1: Create Task with Group Sharing */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>新建工作待办（支持群组协同共享）</span>
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  任务标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：整理智慧城市二期技术规范"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">任务描述</label>
                <textarea
                  rows={3}
                  placeholder="补充要点、交付物、协同要求等..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    截止/计划日期
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">优先级</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="normal">普通</option>
                    <option value="high">高优先级</option>
                    <option value="low">较低</option>
                  </select>
                </div>
              </div>

              {/* Requirement 1: Group Sharing Checkbox & Selection */}
              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-2.5">
                <div className="flex items-center gap-2">
                  <input
                    id="chk-share-group"
                    type="checkbox"
                    checked={isShareToGroupChecked}
                    onChange={(e) => setIsShareToGroupChecked(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="chk-share-group"
                    className="text-xs font-bold text-indigo-900 select-none cursor-pointer"
                  >
                    共享至所属协同工作群组（同群成员可实时查看与协同）
                  </label>
                </div>

                {isShareToGroupChecked && (
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-800 mb-1">
                      选择目标群组
                    </label>
                    <select
                      value={selectedShareGroupId}
                      onChange={(e) => setSelectedShareGroupId(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {myGroups.length > 0 ? (
                        myGroups.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.memberIds.length} 位成员)
                          </option>
                        ))
                      ) : (
                        <option value={groups[0]?.id || ''}>
                          {groups[0]?.name || '默认协作群'}
                        </option>
                      )}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  确定创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requirement 1: Modal for Applying to View Peer Tasks */}
      {showApplyPeerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">申请查看同群组人员待办</h3>
              </div>
              <button
                onClick={() => setShowApplyPeerModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              基于吉吉办公的群组隔离机制，属于同一个群组的人员可申请查看同组同事的工作待办与跟进进度。
            </p>

            <form onSubmit={handleSubmitPeerApplication} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  选择同群组成员 <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={targetPeerId}
                  onChange={(e) => setTargetPeerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {peerUsers.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.displayName} ({u.department || u.role}) - 账号:{u.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">所在共同群组</label>
                <select
                  value={targetPeerGroupId}
                  onChange={(e) => setTargetPeerGroupId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {myGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">申请理由 / 协同事项</label>
                <textarea
                  rows={2}
                  placeholder="例如: 配合推进天府智算中心专线投标，需同步各自任务节点..."
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Existing Permissions list */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>当前群组授权状态</span>
                  <span className="text-emerald-600 font-mono">已开通 {approvedPeerIds.length} 人</span>
                </p>
                <div className="space-y-1 text-slate-500">
                  {approvedPeerIds.length > 0 ? (
                    approvedPeerIds.map((pid) => {
                      const peerObj = users.find((u) => u.userId === pid);
                      return (
                        <div
                          key={pid}
                          className="flex items-center justify-between text-[11px] bg-white px-2 py-1 rounded border border-slate-100"
                        >
                          <span>{peerObj?.displayName || pid}</span>
                          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            已互通待办
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-slate-400">暂无个人申请记录（群组公开待办仍可见）</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyPeerModal(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>提交查看申请并授权</span>
                </button>
              </div>
            </form>

            {applyToast && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>申请已提交并通过！您已可实时查看该成员的工作待办。</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 2: Follow-Up Calendar Deferral */}
      {followUpTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <CalendarIcon className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">指定未来跟进日期（顺延）</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              原任务置为“待跟进”，并在指定日期自动生成一条同名新任务并保留流转日志。
            </p>

            <div className="p-3 bg-slate-50 rounded-lg mb-4 border border-slate-200 text-xs">
              <p className="font-semibold text-slate-800">{followUpTask.title}</p>
              <p className="text-slate-500 mt-0.5">原计划日期：{followUpTask.dueDate}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  选择未来的跟进日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={getTodayDateStr()}
                  value={followUpTargetDate}
                  onChange={(e) => setFollowUpTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">追加跟进备注</label>
                <input
                  type="text"
                  placeholder="例如：等待技术交底资料完备后继续对接"
                  value={followUpNoteCustom}
                  onChange={(e) => setFollowUpNoteCustom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-blue-50/60 rounded-lg border border-blue-100">
                <input
                  id="checkbox-skip-holiday"
                  type="checkbox"
                  checked={skipHolidaysAuto}
                  onChange={(e) => setSkipHolidaysAuto(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="checkbox-skip-holiday" className="text-xs text-slate-700 select-none cursor-pointer">
                  自动避开节假日与周末（遇公休自动顺延至下一工作日）
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFollowUpTask(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmFollowUp}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
              >
                确认顺延并生成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Task Event Log Timeline */}
      {historyTask && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">任务事件日志与流转时间线</h3>
              </div>
              <button
                onClick={() => setHistoryTask(null)}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                关闭
              </button>
            </div>

            <div className="py-3 border-b border-slate-100">
              <p className="font-semibold text-sm text-slate-800">{historyTask.title}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <span>原创建：{historyTask.createdAt}</span>
                {historyTask.creatorName && <span>发起人：{historyTask.creatorName}</span>}
                {historyTask.isSharedToGroup && (
                  <span className="text-indigo-600">已共享给【{historyTask.sharedGroupName}】</span>
                )}
              </div>
            </div>

            <div className="overflow-y-auto my-3 flex-1 space-y-3">
              {(historyTask.logs || []).map((log, index) => (
                <div key={log.id || index} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                      <span>{log.timestamp}</span>
                      <span className="uppercase font-bold text-slate-600">{log.action}</span>
                    </div>
                    {log.remark && <p className="text-slate-700 mt-1 font-medium">{log.remark}</p>}
                    {log.targetDate && (
                      <p className="text-amber-600 text-[11px] mt-0.5">顺延至目标日: {log.targetDate}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setHistoryTask(null)}
                className="px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Daily Report */}
      {showDailyReportModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  吉吉办公 · 工作日报生成 ({selectedDate})
                </h3>
              </div>
              <button
                onClick={() => setShowDailyReportModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                关闭
              </button>
            </div>

            <div className="overflow-y-auto my-4 flex-1">
              <textarea
                readOnly
                value={dailyReportContent}
                className="w-full h-64 p-3.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl leading-relaxed resize-none focus:outline-none text-slate-800"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  downloadTextFile(`吉吉办公_日报_${selectedDate}.md`, dailyReportContent);
                }}
                className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载 Markdown 文件</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(dailyReportContent);
                  setCopiedReport(true);
                  setTimeout(() => setCopiedReport(false), 2000);
                }}
                className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                {copiedReport ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReport ? '已复制至剪贴板' : '一键复制文本'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Supervisor Delegated Create Group Modal */}
      {showSupervisorCreateGroupModal && canCreateGroup && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">设立业务协同攻坚群组</h3>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {currentUser.role === 'admin'
                      ? '系统管理员特权设立'
                      : '部门主管权限下放：自主组建项目攻坚团队'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSupervisorCreateGroupModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                关闭
              </button>
            </div>

            <form onSubmit={handleSupervisorCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  群组名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: 智慧园区招采攻坚组 / 医疗云专班"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  业务职能描述 / 协同目标
                </label>
                <textarea
                  rows={2}
                  placeholder="例如: 负责全流程投标攻坚、技术交底与现场述标协同"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">群组主题色</label>
                <div className="flex items-center gap-3">
                  {[
                    { label: '翡翠绿', val: 'emerald' },
                    { label: '经典蓝', val: 'blue' },
                    { label: '科技靛', val: 'indigo' },
                    { label: '琥珀橙', val: 'amber' },
                    { label: '玫瑰红', val: 'rose' },
                  ].map((c) => (
                    <label key={c.val} className="flex items-center gap-1 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="groupColor"
                        value={c.val}
                        checked={newGroupColor === c.val}
                        onChange={(e) => setNewGroupColor(e.target.value)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    选择组内成员 (同部门/协同人员)
                  </label>
                  <span className="text-[10px] text-slate-400">已选 {newGroupMemberIds.length} 人</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                  {users.map((u) => {
                    const isSelf = u.userId === currentUser.userId;
                    return (
                      <label
                        key={u.userId}
                        className={`flex items-center justify-between text-xs p-1.5 rounded hover:bg-white cursor-pointer ${
                          isSelf ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            disabled={isSelf}
                            checked={newGroupMemberIds.includes(u.userId) || isSelf}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewGroupMemberIds([...newGroupMemberIds, u.userId]);
                              } else {
                                setNewGroupMemberIds(newGroupMemberIds.filter((id) => id !== u.userId));
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-medium text-slate-800">{u.displayName}</span>
                          <span className="text-[10px] text-slate-400">({u.department || '未分配部门'})</span>
                        </div>
                        {isSelf && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold">
                            组长 (本人)
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSupervisorCreateGroupModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  确认设立并启用
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Shield,
  Users,
  UserPlus,
  Settings,
  Image as ImageIcon,
  FolderPlus,
  Check,
  X,
  Upload,
  UserCheck,
  Building,
  Key,
  Trash2,
  Edit,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye,
  ShieldAlert,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Sliders,
} from 'lucide-react';
import {
  UserInfo,
  UserGroup,
  GroupShareRequest,
  BrandingConfig,
  UserRole,
  PRESET_DEPARTMENTS,
  PresetDepartment,
  UserPermissions,
} from '../types';

interface AdminModuleProps {
  currentUser: UserInfo;
  users: UserInfo[];
  setUsers: React.Dispatch<React.SetStateAction<UserInfo[]>>;
  groups: UserGroup[];
  setGroups: React.Dispatch<React.SetStateAction<UserGroup[]>>;
  branding: BrandingConfig;
  setBranding: React.Dispatch<React.SetStateAction<BrandingConfig>>;
  shareRequests: GroupShareRequest[];
  setShareRequests: React.Dispatch<React.SetStateAction<GroupShareRequest[]>>;
  onSwitchUser: (user: UserInfo) => void;
}

export const AdminModule: React.FC<AdminModuleProps> = ({
  currentUser,
  users,
  setUsers,
  groups,
  setGroups,
  branding,
  setBranding,
  shareRequests,
  setShareRequests,
  onSwitchUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'branding' | 'requests' | 'permissions'>('users');

  // New user form state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('member');
  const [newDepartment, setNewDepartment] = useState<string>(PRESET_DEPARTMENTS[0]);
  const [newSelectedGroups, setNewSelectedGroups] = useState<string[]>([]);
  const [newSupervisorPermissions, setNewSupervisorPermissions] = useState<UserPermissions>({
    canManageGroups: true, // 默认下放群组设立权限至主管
    canApproveShare: true,
    canExportReports: true,
    canManageDepartmentMembers: true,
    canViewAllTenders: true,
  });

  // Edit user modal & state (Requirement 1 & 2)
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserInfo | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editDepartment, setEditDepartment] = useState<string>(PRESET_DEPARTMENTS[0]);
  const [editRole, setEditRole] = useState<UserRole>('member');
  const [editSelectedGroups, setEditSelectedGroups] = useState<string[]>([]);
  const [editPermissions, setEditPermissions] = useState<UserPermissions>({
    canManageGroups: true,
    canApproveShare: true,
    canExportReports: true,
    canManageDepartmentMembers: true,
    canViewAllTenders: true,
  });

  // Success toast for edits
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const showToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(''), 3000);
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: UserInfo) => {
    setEditingUser(user);
    setEditDisplayName(user.displayName);
    setEditDepartment(user.department || PRESET_DEPARTMENTS[0]);
    setEditRole(user.role);
    setEditSelectedGroups(user.groupList || []);
    setEditPermissions({
      canManageGroups: user.permissions?.canManageGroups ?? (user.role === 'admin' || user.role === 'supervisor'),
      canApproveShare: user.permissions?.canApproveShare ?? (user.role === 'admin' || user.role === 'supervisor'),
      canExportReports: user.permissions?.canExportReports ?? (user.role === 'admin' || user.role === 'supervisor'),
      canManageDepartmentMembers: user.permissions?.canManageDepartmentMembers ?? (user.role === 'admin'),
      canViewAllTenders: user.permissions?.canViewAllTenders ?? true,
    });
    setShowEditUserModal(true);
  };

  // Save Edit User
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (editingUser.userId === currentUser.userId && editRole !== 'admin') {
      alert('操作拦截：不能撤销当前登录超级管理员自己的 admin 权限！');
      return;
    }

    const updatedUsers = users.map((u) => {
      if (u.userId !== editingUser.userId) return u;
      return {
        ...u,
        displayName: editDisplayName.trim() || u.displayName,
        department: editDepartment.trim() || u.department,
        role: editRole,
        groupList: editSelectedGroups,
        canManageUsers: editRole === 'admin',
        permissions: editPermissions,
      };
    });

    setUsers(updatedUsers);

    // Sync group membership
    setGroups((prev) =>
      prev.map((g) => {
        const inSelected = editSelectedGroups.includes(g.id);
        const inGroup = g.memberIds.includes(editingUser.userId);
        if (inSelected && !inGroup) {
          return { ...g, memberIds: [...g.memberIds, editingUser.userId] };
        }
        if (!inSelected && inGroup) {
          return { ...g, memberIds: g.memberIds.filter((id) => id !== editingUser.userId) };
        }
        return g;
      })
    );

    setShowEditUserModal(false);
    setEditingUser(null);
    showToast(`成员【${editDisplayName}】所属部门、项目组及权限已成功更新`);
  };

  // Toggle specific supervisor permission directly
  const handleToggleSupervisorPermission = (userId: string, permKey: keyof UserPermissions) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.userId !== userId) return u;
        const currentVal = u.permissions?.[permKey] ?? (u.role === 'admin' || u.role === 'supervisor');
        const updatedPerms: UserPermissions = {
          ...(u.permissions || {}),
          [permKey]: !currentVal,
        };
        return {
          ...u,
          permissions: updatedPerms,
        };
      })
    );
    showToast('主管特权与下放权限配置已实时生效');
  };

  // New group form state
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('blue');
  const [newGroupLeaderId, setNewGroupLeaderId] = useState('');
  const [newGroupMemberIds, setNewGroupMemberIds] = useState<string[]>([]);

  // Branding form state
  const [brandAppName, setBrandAppName] = useState(branding.appName);
  const [brandSlogan, setBrandSlogan] = useState(branding.slogan || '');
  const [brandLogoUrl, setBrandLogoUrl] = useState(branding.logoUrl || '');
  const [logoSaveSuccess, setLogoSaveSuccess] = useState(false);

  // Handle Create User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newDisplayName.trim()) return;

    const newUser: UserInfo = {
      userId: `user_${Date.now().toString().slice(-6)}`,
      username: newUsername.trim().toLowerCase(),
      password: newPassword.trim() || 'password123',
      displayName: newDisplayName.trim(),
      role: newRole,
      department: newDepartment.trim() || '未指定部门',
      groupList: newSelectedGroups,
      device: `${branding.appName || '办公助手'} 客户端`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      canManageUsers: newRole === 'admin',
    };

    setUsers((prev) => [...prev, newUser]);

    // Also update groups to add this user
    if (newSelectedGroups.length > 0) {
      setGroups((prev) =>
        prev.map((g) =>
          newSelectedGroups.includes(g.id)
            ? { ...g, memberIds: [...new Set([...g.memberIds, newUser.userId])] }
            : g
        )
      );
    }

    // Reset form
    setNewUsername('');
    setNewPassword('password123');
    setNewDisplayName('');
    setNewRole('member');
    setNewDepartment('');
    setNewSelectedGroups([]);
    setShowAddUserModal(false);
  };

  // Handle Update User Role
  const handleUpdateUserRole = (userId: string, updatedRole: UserRole) => {
    if (userId === currentUser.userId && updatedRole !== 'admin') {
      alert('操作拦截：不能撤销当前管理员自己的超级管理员权限！');
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.userId === userId
          ? { ...u, role: updatedRole, canManageUsers: updatedRole === 'admin' }
          : u
      )
    );
  };

  // Handle Reset User Password
  const handleResetPassword = (userId: string, username: string) => {
    const newPass = window.prompt(`正在为账号【@${username}】重置密码，请输入新密码:`, 'password123');
    if (newPass === null) return;
    if (!newPass.trim()) {
      alert('密码不能为空！');
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.userId === userId ? { ...u, password: newPass.trim() } : u
      )
    );
    alert(`账号【@${username}】密码已成功重置为: ${newPass.trim()}`);
  };

  // Handle Delete User
  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.userId) {
      alert('不能删除当前正在登录的账号！');
      return;
    }
    if (window.confirm('确认删除该账号？相关设置将同步清理。')) {
      setUsers((prev) => prev.filter((u) => u.userId !== userId));
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          memberIds: g.memberIds.filter((m) => m !== userId),
        }))
      );
    }
  };

  // Handle Create Group
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: UserGroup = {
      id: `grp_${Date.now().toString().slice(-6)}`,
      name: newGroupName.trim(),
      description: newGroupDesc.trim() || '日常工作协同与待办共享群组',
      leaderId: newGroupLeaderId || currentUser.userId,
      memberIds: [...new Set([currentUser.userId, ...newGroupMemberIds])],
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      color: newGroupColor,
    };

    setGroups((prev) => [...prev, newGroup]);

    // Update users' groupList
    setUsers((prev) =>
      prev.map((u) =>
        newGroup.memberIds.includes(u.userId) && !u.groupList.includes(newGroup.id)
          ? { ...u, groupList: [...u.groupList, newGroup.id] }
          : u
      )
    );

    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupMemberIds([]);
    setShowAddGroupModal(false);
  };

  // Handle Delete Group
  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('确认解散该群组？该操作不影响成员已有个人待办。')) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          groupList: u.groupList.filter((gid) => gid !== groupId),
        }))
      );
    }
  };

  // Handle Approve or Reject Share Request
  const handleReviewRequest = (requestId: string, approved: boolean) => {
    setShareRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: approved ? 'approved' : 'rejected' }
          : r
      )
    );
  };

  // Handle Logo Upload via Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('请上传小于 2MB 的图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setBrandLogoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Save Branding Settings
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BrandingConfig = {
      appName: brandAppName.trim() || '吉吉办公',
      slogan: brandSlogan.trim() || '跨端多用户协同与个人效率中枢',
      logoUrl: brandLogoUrl,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setBranding(updated);
    setLogoSaveSuccess(true);
    setTimeout(() => setLogoSaveSuccess(false), 3000);
  };

  // Requirement: Except for administrators, no other role is allowed to view the admin management platform
  if (currentUser.role !== 'admin') {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-lg mx-auto shadow-sm my-12">
        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-2">访问受限：无权查看管理控制平台</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-5">
          当前登录账号【{currentUser.displayName}】角色为【
          {currentUser.role === 'supervisor' ? '部门主管' : '普通成员'}
          】。系统安全防护机制已生效：除系统管理员外，其他角色一律不允许查看或操作管理控制平台及权限配置。
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center justify-center gap-2">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>如需管理权限，请联系企业 IT 超级管理员授权。</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-indigo-600 rounded-full shrink-0" />
            <Shield className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">管理员权限与协同治理中心</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              超级管理员专区
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            统一分配系统账号、设定角色权限体系（RBAC）、设立群组架构、审批待办共享及定制系统品牌 Logo。
          </p>
        </div>

        {/* Quick User Badge */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <UserCheck className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-600 font-medium">当前管理员:</span>
          <span className="text-xs font-bold text-slate-800">{currentUser.displayName}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono">
            admin
          </span>
        </div>
      </div>

      {/* Top Segment Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>账号分配与管理 ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'permissions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>系统权限矩阵 (RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'groups'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>群组架构设立 ({groups.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'branding'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>品牌名称与图片Logo定制</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
            activeTab === 'requests'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>待办共享申请审批 ({shareRequests.filter((r) => r.status === 'pending').length})</span>
        </button>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-xs transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Tab 1: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">系统分配账号与人员组织架构</h3>
              <p className="text-xs text-slate-400">
                支持在线修改人员所属部门（政企要客/政企企业/政企商企）、所属项目组及主管特权增减
              </p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>分配新账号</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">成员姓名 / 用户名</th>
                  <th className="py-3 px-4">所属部门 (预设分类)</th>
                  <th className="py-3 px-4">角色与权限状态</th>
                  <th className="py-3 px-4">所属项目组</th>
                  <th className="py-3 px-4">当前设备</th>
                  <th className="py-3 px-4 text-right">权限与操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const userGroups = groups.filter((g) => u.groupList.includes(g.id));
                  const isCurrent = u.userId === currentUser.userId;
                  const isSupervisor = u.role === 'supervisor';
                  const canManageGroups = u.permissions?.canManageGroups !== false;

                  return (
                    <tr key={u.userId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.displayName} className="w-full h-full object-cover" />
                            ) : (
                              u.displayName.slice(0, 1)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 flex items-center gap-1.5">
                              {u.displayName}
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded font-semibold">
                                  当前登录
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.department === '政企要客部' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            政企要客部
                          </span>
                        ) : u.department === '政企企业部' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            政企企业部
                          </span>
                        ) : u.department === '政企商企部' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            政企商企部
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {u.department || '未指定部门'}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <select
                              value={u.role}
                              disabled={isCurrent}
                              onChange={(e) => handleUpdateUserRole(u.userId, e.target.value as UserRole)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-md border transition-all ${
                                u.role === 'admin'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : u.role === 'supervisor'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              } ${isCurrent ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                              title={isCurrent ? '当前管理员角色不可撤销' : '点击直接调整该用户权限'}
                            >
                              <option value="admin">超级管理员 (admin)</option>
                              <option value="supervisor">部门主管 (supervisor)</option>
                              <option value="member">普通成员 (member)</option>
                            </select>
                          </div>
                          {isSupervisor && (
                            <div className="flex items-center gap-1">
                              {canManageGroups ? (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                  ✓ 群组管理权已下放
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-medium">
                                  ✕ 未下放群组权
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {userGroups.length === 0 ? (
                            <span className="text-slate-400 text-[11px]">未加入群组</span>
                          ) : (
                            userGroups.map((g) => (
                              <span
                                key={g.id}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                              >
                                {g.name}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">{u.device}</td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded text-xs transition-colors inline-flex items-center gap-1"
                          title="修改所属部门、项目组与增减权限"
                        >
                          <Edit className="w-3 h-3 text-indigo-600" />
                          <span>修改部门/组/权限</span>
                        </button>
                        <button
                          onClick={() => handleResetPassword(u.userId, u.username)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded text-xs transition-colors inline-flex items-center gap-1"
                          title="重置登录密码"
                        >
                          <Key className="w-3 h-3 text-slate-500" />
                          <span>密码</span>
                        </button>
                        {!isCurrent && (
                          <button
                            onClick={() => onSwitchUser(u)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-xs transition-colors"
                          >
                            切换登录
                          </button>
                        )}
                        {!isCurrent && (
                          <button
                            onClick={() => handleDeleteUser(u.userId)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                            title="删除账号"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: System Permissions & RBAC Matrix */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">系统权限管理与角色控制策略 (RBAC)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                策略生效中
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              平台实行严格的角色访问控制（Role-Based Access Control）。除系统管理员外，所有普通成员及部门主管一律禁止查看管理控制平台，同时禁止普通用户在系统内任意切换账号。
            </p>
          </div>

          {/* Three Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Admin Role Card */}
            <div className="bg-white rounded-xl border-2 border-red-200 p-4 shadow-xs relative">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                  超级管理员 (admin)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">最高权限</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">系统最高控制与权限配置权</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>管理控制台</strong>：独占完全查看与操作权限</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>账号切换</strong>：允许在全局账号之间切换调试</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>权限管理</strong>：分配与调整任何用户的系统角色</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>密码管控</strong>：支持强制重置任意成员账号密码</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>协同治理</strong>：群组架构设立与待办跨端共享终审</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>品牌自定义</strong>：自定义企业Logo图片与系统名称</span>
                </li>
              </ul>
            </div>

            {/* Supervisor Role Card */}
            <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                  部门主管 (supervisor)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">业务统筹</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">群组业务统筹与待办审批权</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5 text-red-600 font-medium">
                  <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>管理控制台：严禁访问（菜单隐藏）</strong></span>
                </li>
                <li className="flex items-start gap-1.5 text-red-600 font-medium">
                  <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>账号切换：严禁切换其他用户账号</strong></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>每日工作</strong>：查看本部门成员共享的任务进展</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>协同申请</strong>：审批组内普通成员的待办穿透申请</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>数据透视</strong>：标讯穿透分析与8点新闻转发讨论</span>
                </li>
              </ul>
            </div>

            {/* Member Role Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">
                  普通成员 (member)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">基层办公</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">个人日常业务与组内协作</h4>
              <ul className="space-y-1.5 text-xs text-slate-600">
                <li className="flex items-start gap-1.5 text-red-600 font-medium">
                  <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>管理控制台：严禁访问（菜单隐藏）</strong></span>
                </li>
                <li className="flex items-start gap-1.5 text-red-600 font-medium">
                  <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span><strong>账号切换：严禁切换其他用户账号</strong></span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>日常办公</strong>：个人待办、备忘录、记账本</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>团队共享</strong>：自主将待办共享至指定所属群组</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>标讯新闻</strong>：历史招投标查询与8点早报浏览</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Full RBAC Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800">系统权限详细对比矩阵表</h4>
              <span className="text-[11px] text-slate-400">实时受控生效</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4">系统功能 / 操作控制点</th>
                    <th className="py-3 px-4 text-center">超级管理员 (admin)</th>
                    <th className="py-3 px-4 text-center">部门主管 (supervisor)</th>
                    <th className="py-3 px-4 text-center">普通成员 (member)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      查看与操作管理控制台
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        允许访问
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        禁止访问 (拦截)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        禁止访问 (拦截)
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      快速切换其他人员账号
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        允许调试切换
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        严格禁止
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        严格禁止
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      修改用户角色与系统权限
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        允许配置
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        禁止
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        禁止
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      强制重置账号登录密码
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        允许重设
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        禁止
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        禁止
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      设立群组架构与群成员编组
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        允许设立与解散
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        可下放至部门主管 (受控开关)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                        仅作为成员加入
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      待办共享申请审批 (协同授权)
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        最高终审权
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        本部门初审
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                        发起申请
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      系统名称与企业Logo图片定制
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        独家全权定制
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        禁止
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                        禁止
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      日常办公 (待办/备忘/记账/标讯/早报)
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        完全支持
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        完全支持
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        完全支持
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Supervisor Specific Permissions & Delegation Management Section */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-800">各部门主管特权动态增减与群组管理权下放管控区</h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  支持在线对政企要客、政企企业、政企商企等各部门主管权限进行精细化增减，包括设立群组权限下放
                </p>
              </div>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-200">
                实时控制 · 即时生效
              </span>
            </div>

            <div className="p-4 divide-y divide-slate-100 space-y-4">
              {users
                .filter((u) => u.role === 'supervisor')
                .map((sp) => {
                  const perms = sp.permissions || {
                    canManageGroups: true,
                    canApproveShare: true,
                    canExportReports: true,
                    canManageDepartmentMembers: true,
                    canViewAllTenders: true,
                  };
                  const spGroups = groups.filter((g) => sp.groupList.includes(g.id));

                  return (
                    <div key={sp.userId} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-sm border border-blue-200 overflow-hidden">
                            {sp.avatar ? (
                              <img src={sp.avatar} alt={sp.displayName} className="w-full h-full object-cover" />
                            ) : (
                              sp.displayName.slice(0, 1)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800 text-xs">{sp.displayName}</span>
                              <span className="text-[10px] font-mono text-slate-400">@{sp.username}</span>
                              {sp.department === '政企要客部' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  政企要客部
                                </span>
                              ) : sp.department === '政企企业部' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                  政企企业部
                                </span>
                              ) : sp.department === '政企商企部' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  政企商企部
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                  {sp.department || '未分配部门'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              关联项目组: {spGroups.length > 0 ? spGroups.map((g) => g.name).join('、') : '暂未加入项目组'}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenEditUser(sp)}
                          className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
                        >
                          <Edit className="w-3 h-3" />
                          <span>修改部门 / 所属项目组</span>
                        </button>
                      </div>

                      {/* Permission toggle buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {/* 1. canManageGroups */}
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                              群组设立与管理权
                              <span className="px-1 text-[9px] bg-emerald-100 text-emerald-800 rounded font-semibold">权限下放</span>
                            </p>
                            <p className="text-[10px] text-slate-400">允许主管设立项目组与调配组员</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleSupervisorPermission(sp.userId, 'canManageGroups')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                              perms.canManageGroups
                                ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {perms.canManageGroups ? '已下放' : '已收回'}
                          </button>
                        </div>

                        {/* 2. canApproveShare */}
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800">跨部门待办共享审批</p>
                            <p className="text-[10px] text-slate-400">初审本部门与其他部门共享申请</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleSupervisorPermission(sp.userId, 'canApproveShare')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                              perms.canApproveShare
                                ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {perms.canApproveShare ? '允许审批' : '关闭权限'}
                          </button>
                        </div>

                        {/* 3. canExportReports */}
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800">部门业务报表导出</p>
                            <p className="text-[10px] text-slate-400">导出本部门待办/协同统计数据</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleSupervisorPermission(sp.userId, 'canExportReports')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                              perms.canExportReports
                                ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {perms.canExportReports ? '允许导出' : '禁止导出'}
                          </button>
                        </div>

                        {/* 4. canManageDepartmentMembers */}
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800">部门成员架构维护</p>
                            <p className="text-[10px] text-slate-400">协助管理员分配部门内日常工作</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleSupervisorPermission(sp.userId, 'canManageDepartmentMembers')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                              perms.canManageDepartmentMembers
                                ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {perms.canManageDepartmentMembers ? '允许维护' : '关闭权限'}
                          </button>
                        </div>

                        {/* 5. canViewAllTenders */}
                        <div className="bg-white p-2.5 rounded-md border border-slate-200 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-bold text-slate-800">全量政企标讯穿透检索</p>
                            <p className="text-[10px] text-slate-400">跨部门穿透查看政企招采中标数据</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleSupervisorPermission(sp.userId, 'canViewAllTenders')}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                              perms.canViewAllTenders
                                ? 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {perms.canViewAllTenders ? '允许穿透' : '限本组'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Groups Management */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">业务群组设立与待办共享授权</h3>
              <p className="text-xs text-slate-400">
                同属于一个群组的成员，可以实时共享工作待办、互相协同推进重大项目
              </p>
            </div>
            <button
              onClick={() => setShowAddGroupModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>设立新群组</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {groups.map((group) => {
              const members = users.filter((u) => group.memberIds.includes(u.userId));
              const leader = users.find((u) => u.userId === group.leaderId);

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        群ID: {group.id}
                      </span>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="解散群组"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm">{group.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                      {group.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs">
                      <span className="text-slate-400">组长/负责人：</span>
                      <span className="font-semibold text-slate-700">
                        {leader ? leader.displayName : '暂无'}
                      </span>
                    </div>

                    <div className="mt-2 text-xs">
                      <span className="text-slate-400">群组成员 ({members.length}人)：</span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {members.map((m) => (
                          <span
                            key={m.userId}
                            className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                          >
                            {m.displayName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>创建于 {group.createdAt}</span>
                    <span className="text-emerald-600 font-medium">支持待办共享穿透</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Branding & Custom Logo (Requirement 5) */}
      {activeTab === 'branding' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-3xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">软件名称与品牌图片自定义设置</h3>
              <p className="text-xs text-slate-400">
                支持超级管理员自定义企业办公名称、上传专属Logo图片或切换标语，保存后全平台实时同步生效。
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveBranding} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                软件系统名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={brandAppName}
                onChange={(e) => setBrandAppName(e.target.value)}
                placeholder="例如：吉吉办公"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                已由「通崽助手」升级为「吉吉办公」，将展示于左侧边栏、顶部栏、周报与年终总结标题。
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">系统宣传标语</label>
              <input
                type="text"
                value={brandSlogan}
                onChange={(e) => setBrandSlogan(e.target.value)}
                placeholder="例如：跨端协同 · 标讯穿透 · 团队共享中枢"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Custom Logo Setting */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                管理员自定义企业 Logo 图片
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
                {/* Logo Preview */}
                <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {brandLogoUrl ? (
                    <img src={brandLogoUrl} alt="Logo预览" className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-xs">
                      吉
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>从本地上传新Logo图片</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    {brandLogoUrl && (
                      <button
                        type="button"
                        onClick={() => setBrandLogoUrl('')}
                        className="px-2 py-1 text-xs text-red-500 hover:text-red-700"
                      >
                        恢复默认标志
                      </button>
                    )}
                  </div>
                  <input
                    type="url"
                    value={brandLogoUrl}
                    onChange={(e) => setBrandLogoUrl(e.target.value)}
                    placeholder="或者直接粘贴在线图片 URL"
                    className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  <p className="text-[11px] text-slate-400">
                    建议上传透明底色 PNG/SVG 或高清方形 JPG，文件大小不超过 2MB。
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {logoSaveSuccess ? (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  品牌与图片设置保存成功，已全局生效！
                </span>
              ) : (
                <span className="text-xs text-slate-400">需管理员权限提交保存</span>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                保存品牌自定义配置
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Share Requests (Requirement 1) */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">跨成员待办查看申请记录</h3>
            <p className="text-xs text-slate-400">
              当同群组成员申请查看同事的工作待办时，管理员与被申请人可在此处一键审批
            </p>
          </div>

          {shareRequests.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              暂无待处理的工作待办跨人员申请记录。
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {shareRequests.map((req) => (
                <div key={req.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      <span className="text-blue-600">{req.fromUserName}</span> 申请查看群组【
                      {req.groupName}】中 <span className="text-indigo-600">{req.targetUserName}</span>{' '}
                      的工作待办
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      申请事由：{req.reason || '项目排期协同'} · 提交时间：{req.createdAt}
                    </p>
                  </div>

                  <div>
                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReviewRequest(req.id, true)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-bold"
                        >
                          同意授权
                        </button>
                        <button
                          onClick={() => handleReviewRequest(req.id, false)}
                          className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-xs"
                        >
                          拒绝
                        </button>
                      </div>
                    ) : req.status === 'approved' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold">
                        已同意共享
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-medium">
                        已驳回
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">分配新成员账号</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  登录账号名 (英文字母/拼音) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: zhou_ops"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  初始登录密码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="默认: password123"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">成员首次登录必须使用该密码，管理员可随时在列表中重置。</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  显示姓名与岗位 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: 周峰 (实施工程师)"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  所属部门 (系统预设三大部门) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setNewDepartment(dept)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        newDepartment === dept
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="或自定义输入部门名称"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">分配系统角色</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="member">普通成员 (日常办公/查看组内共享)</option>
                  <option value="supervisor">部门主管 (可下放设立群组/导出报表/协同初审)</option>
                  <option value="admin">超级管理员 (拥有系统级最高控制与配置权)</option>
                </select>
              </div>

              {/* If creating supervisor, allow toggling delegation options upfront */}
              {newRole === 'supervisor' && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-2">
                  <p className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>主管权限与下放开关预设</span>
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSupervisorPermissions.canManageGroups}
                        onChange={(e) =>
                          setNewSupervisorPermissions({
                            ...newSupervisorPermissions,
                            canManageGroups: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-semibold text-slate-800">
                        下放群组设立与管理权 (允许主管自主建组)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSupervisorPermissions.canApproveShare}
                        onChange={(e) =>
                          setNewSupervisorPermissions({
                            ...newSupervisorPermissions,
                            canApproveShare: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>允许审批跨部门待办共享申请</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSupervisorPermissions.canExportReports}
                        onChange={(e) =>
                          setNewSupervisorPermissions({
                            ...newSupervisorPermissions,
                            canExportReports: e.target.checked,
                          })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>允许导出部门周度协同报表</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  加入的项目组 (可多选)
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                  {groups.map((g) => (
                    <label key={g.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newSelectedGroups.includes(g.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewSelectedGroups([...newSelectedGroups, g.id]);
                          } else {
                            setNewSelectedGroups(newSelectedGroups.filter((id) => id !== g.id));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{g.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  确认分配账号
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal: Supports modifying Department, Project Groups and Supervisor Permissions */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>修改人员所属部门、项目组与权限配置</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  账号: @{editingUser.username} · ID: {editingUser.userId}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setEditingUser(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  人员姓名与岗位职务 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Department: Presets + custom */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  所属部门 (系统预设三大部门) <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setEditDepartment(dept)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        editDepartment === dept
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  required
                  placeholder="或输入其他部门名称"
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">系统角色身份</label>
                <select
                  value={editRole}
                  disabled={editingUser.userId === currentUser.userId}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="member">普通成员 (member)</option>
                  <option value="supervisor">部门主管 (supervisor)</option>
                  <option value="admin">超级管理员 (admin)</option>
                </select>
                {editingUser.userId === currentUser.userId && (
                  <p className="text-[10px] text-amber-600 mt-1">当前登录管理员自身的角色不可更改</p>
                )}
              </div>

              {/* Project Groups */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    所属业务项目组 (可多选分配)
                  </label>
                  <span className="text-[10px] text-slate-400">已选 {editSelectedGroups.length} 个项目组</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                  {groups.length === 0 ? (
                    <p className="text-xs text-slate-400">暂无可选群组</p>
                  ) : (
                    groups.map((g) => (
                      <label
                        key={g.id}
                        className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-indigo-600"
                      >
                        <input
                          type="checkbox"
                          checked={editSelectedGroups.includes(g.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditSelectedGroups([...editSelectedGroups, g.id]);
                            } else {
                              setEditSelectedGroups(editSelectedGroups.filter((id) => id !== g.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-medium">{g.name}</span>
                        <span className="text-[10px] text-slate-400">({g.memberIds.length}人)</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Supervisor Specific Permissions Section (Increment / Decrement) */}
              {(editRole === 'supervisor' || editRole === 'admin') && (
                <div className="p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>主管特权增减与下放管控配置</span>
                    </h4>
                    <span className="text-[10px] text-indigo-700 font-semibold">精准控制</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* canManageGroups: 群组设立权下放 */}
                    <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-indigo-100 cursor-pointer hover:border-indigo-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={editPermissions.canManageGroups}
                        onChange={(e) =>
                          setEditPermissions({ ...editPermissions, canManageGroups: e.target.checked })
                        }
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-1">
                          群组设立与管理权（权限下放至主管）
                          <span className="px-1 text-[9px] bg-emerald-100 text-emerald-800 rounded font-bold">
                            核心功能
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          勾选后，该部门主管可在每日工作协同中自主设立专项攻坚组、配置组员
                        </p>
                      </div>
                    </label>

                    {/* canApproveShare */}
                    <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-indigo-100 cursor-pointer hover:border-indigo-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={editPermissions.canApproveShare}
                        onChange={(e) =>
                          setEditPermissions({ ...editPermissions, canApproveShare: e.target.checked })
                        }
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-bold text-slate-800">跨部门待办共享初审权</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          允许主管审批本部门与其他部门间的工作共享申请
                        </p>
                      </div>
                    </label>

                    {/* canExportReports */}
                    <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-indigo-100 cursor-pointer hover:border-indigo-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={editPermissions.canExportReports}
                        onChange={(e) =>
                          setEditPermissions({ ...editPermissions, canExportReports: e.target.checked })
                        }
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-bold text-slate-800">部门协同报表导出权</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          允许汇总导出本部门的周度、月度待办进度与项目成效
                        </p>
                      </div>
                    </label>

                    {/* canManageDepartmentMembers */}
                    <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-indigo-100 cursor-pointer hover:border-indigo-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={editPermissions.canManageDepartmentMembers}
                        onChange={(e) =>
                          setEditPermissions({
                            ...editPermissions,
                            canManageDepartmentMembers: e.target.checked,
                          })
                        }
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-bold text-slate-800">部门人员编组维护权</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          允许主管维护本部门人员项目组分工与状态
                        </p>
                      </div>
                    </label>

                    {/* canViewAllTenders */}
                    <label className="flex items-start gap-2.5 p-2 bg-white rounded-lg border border-indigo-100 cursor-pointer hover:border-indigo-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={editPermissions.canViewAllTenders}
                        onChange={(e) =>
                          setEditPermissions({
                            ...editPermissions,
                            canViewAllTenders: e.target.checked,
                          })
                        }
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-bold text-slate-800">全量招采标讯穿透检索</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          允许穿透检索政企招采、中标全量库
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit / Cancel buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                  }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  保存修改与权限
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">设立新协同群组</h3>
              <button
                onClick={() => setShowAddGroupModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  群组名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: 天府低空智联联合攻坚组"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">群组职能描述</label>
                <textarea
                  rows={2}
                  placeholder="说明该群组的核心业务方向与协同范围..."
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">群组负责人</label>
                <select
                  value={newGroupLeaderId}
                  onChange={(e) => setNewGroupLeaderId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">默认当前创建者</option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.displayName} ({u.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  初始群成员 (可多选)
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                  {users.map((u) => (
                    <label key={u.userId} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newGroupMemberIds.includes(u.userId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewGroupMemberIds([...newGroupMemberIds, u.userId]);
                          } else {
                            setNewGroupMemberIds(newGroupMemberIds.filter((id) => id !== u.userId));
                          }
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{u.displayName}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  设立群组
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
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
  Save,
  CheckSquare,
  Square,
  ChevronRight,
  UserCog,
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
  RoleDefinition,
} from '../types';
import { api } from '../utils/api';

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

  // Roles state loaded from server /api/roles
  const [roleDefs, setRoleDefs] = useState<Record<UserRole, RoleDefinition>>({
    admin: {
      roleKey: 'admin',
      name: '超级管理员',
      description: '系统最高控制与权限配置权',
      permissions: {
        canManageUsers: true,
        canEditRolePermissions: true,
        canManageGroups: true,
        canApproveShare: true,
        canExportReports: true,
        canManageDepartmentMembers: true,
        canViewAllTenders: true,
        canManageBranding: true,
        canAccessAdminTab: true,
      },
    },
    supervisor: {
      roleKey: 'supervisor',
      name: '部门主管',
      description: '负责部门内部业务统筹、初审与协同下放',
      permissions: {
        canManageUsers: false,
        canEditRolePermissions: false,
        canManageGroups: true,
        canApproveShare: true,
        canExportReports: true,
        canManageDepartmentMembers: true,
        canViewAllTenders: true,
        canManageBranding: false,
        canAccessAdminTab: false,
      },
    },
    member: {
      roleKey: 'member',
      name: '普通员工',
      description: '日常个人与组内协作执行，拥有个人办公完整权限',
      permissions: {
        canManageUsers: false,
        canEditRolePermissions: false,
        canManageGroups: false,
        canApproveShare: false,
        canExportReports: false,
        canManageDepartmentMembers: false,
        canViewAllTenders: true,
        canManageBranding: false,
        canAccessAdminTab: false,
      },
    },
  });

  // Load server roles
  useEffect(() => {
    api.getRoles().then((res) => {
      const rolesList = Array.isArray(res) ? res : (res as any)?.roles || (res as any)?.data || [];
      if (rolesList.length > 0) {
        const map: Record<string, RoleDefinition> = {};
        rolesList.forEach((r: RoleDefinition) => {
          map[r.roleKey] = r;
        });
        setRoleDefs((prev) => ({ ...prev, ...map }));
      }
    });
  }, []);

  const [roleSaving, setRoleSaving] = useState(false);
  const handleSaveRolePermissions = async (roleKey: UserRole) => {
    setRoleSaving(true);
    try {
      const targetRole = roleDefs[roleKey];
      if (targetRole) {
        await api.updateRolePermissions(roleKey, targetRole.permissions);
        showToast(`【${targetRole.name}】基准权限策略已成功保存至持久数据库并全员同步`);
      }
    } catch (e) {
      alert('保存角色权限失败，请重试');
    } finally {
      setRoleSaving(false);
    }
  };

  const handleToggleRolePermission = (roleKey: UserRole, permKey: keyof UserPermissions) => {
    setRoleDefs((prev) => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        permissions: {
          ...prev[roleKey].permissions,
          [permKey]: !prev[roleKey].permissions[permKey],
        },
      },
    }));
  };

  // User-specific override state
  const [selectedOverrideUserId, setSelectedOverrideUserId] = useState<string>(users[1]?.userId || users[0]?.userId || '');
  const selectedUserForOverride = users.find((u) => u.userId === selectedOverrideUserId) || users[0];

  const handleToggleUserOverride = async (userId: string, permKey: keyof UserPermissions) => {
    const targetUser = users.find((u) => u.userId === userId);
    if (!targetUser) return;

    const baseRolePerm = roleDefs[targetUser.role]?.permissions[permKey] ?? false;
    const currentEffective = targetUser.permissions?.[permKey] ?? baseRolePerm;
    const nextVal = !currentEffective;

    const updatedPermissions: UserPermissions = {
      ...(targetUser.permissions || roleDefs[targetUser.role]?.permissions || {}),
      [permKey]: nextVal,
    };

    const updatedOverrides: Partial<UserPermissions> = {
      ...(targetUser.permissionOverrides || {}),
      [permKey]: nextVal,
    };

    setUsers((prev) =>
      prev.map((u) =>
        u.userId === userId
          ? {
              ...u,
              permissions: updatedPermissions,
              permissionOverrides: updatedOverrides,
            }
          : u
      )
    );

    // Save to server database
    await api.updateUser(userId, {
      permissions: updatedPermissions,
      permissionOverrides: updatedOverrides,
    });

    showToast(`成员【${targetUser.displayName}】的特权已更新：${nextVal ? '已授予' : '已收回'}`);
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
  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (editingUser.userId === currentUser.userId && editRole !== 'admin') {
      alert('操作拦截：不能撤销当前登录超级管理员自己的 admin 权限！');
      return;
    }

    const updatedUserPayload = {
      displayName: editDisplayName.trim() || editingUser.displayName,
      department: editDepartment.trim() || editingUser.department,
      role: editRole,
      groupList: editSelectedGroups,
      canManageUsers: editRole === 'admin',
      permissions: editPermissions,
    };

    const updatedUsers = users.map((u) => {
      if (u.userId !== editingUser.userId) return u;
      return {
        ...u,
        ...updatedUserPayload,
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

    // Persist to server API
    await api.updateUser(editingUser.userId, updatedUserPayload);

    setShowEditUserModal(false);
    setEditingUser(null);
    showToast(`成员【${editDisplayName}】所属部门、项目组及权限已成功保存到数据库`);
  };

  // Toggle specific supervisor permission directly
  const handleToggleSupervisorPermission = async (userId: string, permKey: keyof UserPermissions) => {
    const target = users.find((u) => u.userId === userId);
    if (!target) return;
    const currentVal = target.permissions?.[permKey] ?? (target.role === 'admin' || target.role === 'supervisor');
    const updatedPerms: UserPermissions = {
      ...(target.permissions || {}),
      [permKey]: !currentVal,
    };

    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, permissions: updatedPerms } : u))
    );

    await api.updateUser(userId, { permissions: updatedPerms });
    showToast('主管特权与下放权限配置已实时生效并存盘');
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
  const handleCreateUser = async (e: React.FormEvent) => {
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
      permissions: newRole === 'supervisor' ? newSupervisorPermissions : undefined,
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

    // Persist to server API
    await api.createUser(newUser);

    // Reset form
    setNewUsername('');
    setNewPassword('password123');
    setNewDisplayName('');
    setNewRole('member');
    setNewDepartment('');
    setNewSelectedGroups([]);
    setShowAddUserModal(false);
    showToast(`新成员【${newUser.displayName}】账号已成功创建并存入云端数据库`);
  };

  // Handle Update User Role
  const handleUpdateUserRole = async (userId: string, updatedRole: UserRole) => {
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
    await api.updateUser(userId, { role: updatedRole, canManageUsers: updatedRole === 'admin' });
    showToast('用户系统角色已变更并存盘');
  };

  // Handle Reset User Password
  const handleResetPassword = async (userId: string, username: string) => {
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
    await api.updateUser(userId, { password: newPass.trim() });
    alert(`账号【@${username}】密码已成功重置为: ${newPass.trim()}`);
  };

  // Handle Delete User
  const handleDeleteUser = async (userId: string) => {
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
      await api.deleteUser(userId);
      showToast('账号已从系统中删除');
    }
  };

  // Handle Create Group
  const handleCreateGroup = async (e: React.FormEvent) => {
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

    await api.saveGroup(newGroup);

    setNewGroupName('');
    setNewGroupDesc('');
    setNewGroupMemberIds([]);
    setShowAddGroupModal(false);
    showToast(`协同群组【${newGroup.name}】已成功设立并持久保存`);
  };

  // Handle Delete Group
  const handleDeleteGroup = async (groupId: string) => {
    if (window.confirm('确认解散该群组？该操作不影响成员已有个人待办。')) {
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          groupList: u.groupList.filter((gid) => gid !== groupId),
        }))
      );
      await api.deleteGroup(groupId);
      showToast('群组已成功解散');
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
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BrandingConfig = {
      appName: brandAppName.trim() || '吉吉办公',
      slogan: brandSlogan.trim() || '跨端多用户协同与个人效率中枢',
      logoUrl: brandLogoUrl,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setBranding(updated);
    await api.updateBranding(updated);
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

      {/* Tab: System Permissions & Dynamic RBAC Matrix */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    系统权限分级与动态角色控制矩阵 (RBAC)
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      实时持久生效
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    作为超级管理员，您可在线调整各角色（主管、普通员工）的基准默认权限，并支持针对具体人员进行独立特权授权或收回。
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={roleSaving}
                  onClick={async () => {
                    setRoleSaving(true);
                    try {
                      await Promise.all([
                        api.updateRolePermissions('admin', roleDefs.admin.permissions),
                        api.updateRolePermissions('supervisor', roleDefs.supervisor.permissions),
                        api.updateRolePermissions('member', roleDefs.member.permissions),
                      ]);
                      showToast('全部角色基准权限已持久化保存至数据库');
                    } catch (e) {
                      alert('保存失败，请稍后重试');
                    } finally {
                      setRoleSaving(false);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{roleSaving ? '同步中...' : '保存角色基准策略'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Role Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['admin', 'supervisor', 'member'] as UserRole[]).map((rKey) => {
              const rDef = roleDefs[rKey];
              const userCount = users.filter((u) => u.role === rKey).length;
              const isSuper = rKey === 'admin';
              const isSp = rKey === 'supervisor';

              return (
                <div
                  key={rKey}
                  className={`bg-white rounded-xl border p-4 shadow-xs relative transition-all ${
                    isSuper
                      ? 'border-red-200'
                      : isSp
                      ? 'border-blue-200'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isSuper
                          ? 'bg-red-100 text-red-800'
                          : isSp
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {rDef.name} ({rKey})
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      当前共 {userCount} 人
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                    {rDef.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      默认开通权限数:
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {Object.values(rDef.permissions).filter(Boolean).length} 项
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Role Permissions Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  角色默认权限矩阵（点击直接切换勾选，点击上方保存即可持久存盘）
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  作为超级管理员，您可以自由调整主管与普通员工的默认权限项。
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-4 w-2/5">系统权限控制点与业务说明</th>
                    <th className="py-3 px-4 text-center w-1/5">
                      <div className="flex flex-col items-center">
                        <span className="text-red-700">超级管理员 (admin)</span>
                        <span className="text-[10px] text-slate-400 font-normal">最高控制</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center w-1/5">
                      <div className="flex flex-col items-center">
                        <span className="text-blue-700">部门主管 (supervisor)</span>
                        <span className="text-[10px] text-slate-400 font-normal">业务初审与统筹</span>
                      </div>
                    </th>
                    <th className="py-3 px-4 text-center w-1/5">
                      <div className="flex flex-col items-center">
                        <span className="text-slate-700">普通员工 (member)</span>
                        <span className="text-[10px] text-slate-400 font-normal">执行基准</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {[
                    {
                      key: 'canAccessAdminTab' as keyof UserPermissions,
                      title: '访问与操作管理控制台',
                      desc: '查看企业组织架构、用户列表及安全设置',
                      category: '系统权限',
                    },
                    {
                      key: 'canEditRolePermissions' as keyof UserPermissions,
                      title: '调整系统角色权限矩阵',
                      desc: '更改各角色的基准权限与分权策略',
                      category: '系统权限',
                    },
                    {
                      key: 'canManageUsers' as keyof UserPermissions,
                      title: '人员与账号生命周期管理',
                      desc: '新增账号、调整部门及重置账号密码',
                      category: '组织管理',
                    },
                    {
                      key: 'canManageGroups' as keyof UserPermissions,
                      title: '设立与解散协作业务群组',
                      desc: '建立项目组并指派组长与跨部门成员',
                      category: '协作管理',
                    },
                    {
                      key: 'canApproveShare' as keyof UserPermissions,
                      title: '审批待办跨人员/跨组穿透共享',
                      desc: '对普通员工申请的待办共享进行审批',
                      category: '协作管理',
                    },
                    {
                      key: 'canManageDepartmentMembers' as keyof UserPermissions,
                      title: '调配部门内部员工与分工编组',
                      desc: '调整部门内人员的工作职责分配',
                      category: '部门治理',
                    },
                    {
                      key: 'canExportReports' as keyof UserPermissions,
                      title: '导出协同汇总报表与统计数据',
                      desc: '下载每日任务进展及团队协同Excel报表',
                      category: '数据管理',
                    },
                    {
                      key: 'canViewAllTenders' as keyof UserPermissions,
                      title: '穿透检索全量招采标讯信息',
                      desc: '无部门与群组隔离，查看全平台标讯',
                      category: '数据管理',
                    },
                    {
                      key: 'canManageBranding' as keyof UserPermissions,
                      title: '企业Logo与系统名称定制',
                      desc: '自定义系统名称、宣传语与企业标识',
                      category: '品牌定制',
                    },
                  ].map((perm) => {
                    return (
                      <tr key={perm.key} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-2">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-500 font-mono shrink-0 mt-0.5">
                              {perm.category}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">{perm.title}</p>
                              <p className="text-[11px] text-slate-400">{perm.desc}</p>
                            </div>
                          </div>
                        </td>

                        {/* Admin cell */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRolePermission('admin', perm.key)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                              roleDefs.admin.permissions[perm.key]
                                ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {roleDefs.admin.permissions[perm.key] ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />
                                <span>开通</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5 text-slate-400" />
                                <span>关闭</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Supervisor cell */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRolePermission('supervisor', perm.key)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                              roleDefs.supervisor.permissions[perm.key]
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {roleDefs.supervisor.permissions[perm.key] ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>开通</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5 text-slate-400" />
                                <span>关闭</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Member cell */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleRolePermission('member', perm.key)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                              roleDefs.member.permissions[perm.key]
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-400 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {roleDefs.member.permissions[perm.key] ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>开通</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5 text-slate-400" />
                                <span>关闭</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: User-Specific Permission Overrides */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <UserCog className="w-4 h-4 text-indigo-600" />
                  个别员工与主管独立特权覆盖微调（User-Specific Overrides）
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  选择具体成员，超管可单独为其授予特权或单独收回某项权限，不影响同角色的其他人员。
                </p>
              </div>

              {/* User Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">选择目标成员:</span>
                <select
                  value={selectedOverrideUserId}
                  onChange={(e) => setSelectedOverrideUserId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.displayName} ({u.role === 'admin' ? '超管' : u.role === 'supervisor' ? '主管' : '员工'} - {u.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected User Header Card */}
            {selectedUserForOverride && (
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {selectedUserForOverride.avatar ? (
                      <img
                        src={selectedUserForOverride.avatar}
                        alt={selectedUserForOverride.displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      selectedUserForOverride.displayName.slice(0, 1)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {selectedUserForOverride.displayName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedUserForOverride.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : selectedUserForOverride.role === 'supervisor'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {selectedUserForOverride.role === 'admin'
                          ? '超级管理员'
                          : selectedUserForOverride.role === 'supervisor'
                          ? '部门主管'
                          : '普通成员'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {selectedUserForOverride.department}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      账号: @{selectedUserForOverride.username} | 设备: {selectedUserForOverride.device}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const basePerms = roleDefs[selectedUserForOverride.role]?.permissions || {};
                      setUsers((prev) =>
                        prev.map((u) =>
                          u.userId === selectedUserForOverride.userId
                            ? {
                                ...u,
                                permissions: { ...basePerms },
                                permissionOverrides: {},
                              }
                            : u
                        )
                      );
                      await api.updateUser(selectedUserForOverride.userId, {
                        permissions: { ...basePerms },
                        permissionOverrides: {},
                      });
                      showToast(`已清空特权覆盖，恢复【${selectedUserForOverride.displayName}】的角色默认设置`);
                    }}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                  >
                    恢复角色默认
                  </button>
                </div>
              </div>
            )}

            {/* Overrides Table for selected user */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  key: 'canAccessAdminTab' as keyof UserPermissions,
                  title: '访问管理控制台',
                  desc: '允许进入后台系统与成员管理',
                },
                {
                  key: 'canEditRolePermissions' as keyof UserPermissions,
                  title: '调整角色权限策略',
                  desc: '允许调整全员权限矩阵',
                },
                {
                  key: 'canManageUsers' as keyof UserPermissions,
                  title: '人员账号新增与重置',
                  desc: '允许管理用户生命周期',
                },
                {
                  key: 'canManageGroups' as keyof UserPermissions,
                  title: '设立与维护群组',
                  desc: '允许创建项目组与邀请成员',
                },
                {
                  key: 'canApproveShare' as keyof UserPermissions,
                  title: '待办协同审批权',
                  desc: '允许审批组内待办共享请求',
                },
                {
                  key: 'canManageDepartmentMembers' as keyof UserPermissions,
                  title: '部门人员编组分工',
                  desc: '允许调配部门内人员职责',
                },
                {
                  key: 'canExportReports' as keyof UserPermissions,
                  title: '导出协同汇总报表',
                  desc: '允许下载待办与协同Excel表',
                },
                {
                  key: 'canViewAllTenders' as keyof UserPermissions,
                  title: '全量标讯穿透检索',
                  desc: '不受部门限制检索招采信息',
                },
                {
                  key: 'canManageBranding' as keyof UserPermissions,
                  title: '企业品牌定制',
                  desc: '允许修改Logo与系统名',
                },
              ].map((perm) => {
                const user = selectedUserForOverride;
                if (!user) return null;

                const baseRoleValue = roleDefs[user.role]?.permissions[perm.key] ?? false;
                const isOverridden = user.permissionOverrides && user.permissionOverrides[perm.key] !== undefined;
                const effectiveValue = isOverridden
                  ? Boolean(user.permissionOverrides?.[perm.key])
                  : (user.permissions?.[perm.key] ?? baseRoleValue);

                return (
                  <div
                    key={perm.key}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      effectiveValue
                        ? 'bg-blue-50/40 border-blue-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-800">
                          {perm.title}
                        </span>
                        {isOverridden ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            独立覆盖
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                            角色默认
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                        {perm.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {effectiveValue ? '状态: 已开通' : '状态: 已关闭'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleUserOverride(user.userId, perm.key)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all shadow-2xs ${
                          effectiveValue
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {effectiveValue ? '点击收回' : '点击授权'}
                      </button>
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

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
} from 'lucide-react';
import { UserInfo, UserGroup, GroupShareRequest, BrandingConfig, UserRole } from '../types';

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
  const [activeTab, setActiveTab] = useState<'users' | 'groups' | 'branding' | 'requests'>('users');

  // New user form state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('member');
  const [newDepartment, setNewDepartment] = useState('');
  const [newSelectedGroups, setNewSelectedGroups] = useState<string[]>([]);

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
      displayName: newDisplayName.trim(),
      role: newRole,
      department: newDepartment.trim() || '未指定部门',
      groupList: newSelectedGroups,
      device: '吉吉办公 客户端',
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
    setNewDisplayName('');
    setNewRole('member');
    setNewDepartment('');
    setNewSelectedGroups([]);
    setShowAddUserModal(false);
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
              {currentUser.role === 'admin' ? '当前：超级管理员' : '受限访问模式'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            统一分配系统账号、设立群组架构、审批群待办共享权限，以及管理员自定义系统品牌 Logo。
          </p>
        </div>

        {/* Quick User Switcher for Testing/Demo */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <UserCheck className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-600 font-medium">当前登录:</span>
          <span className="text-xs font-bold text-slate-800">{currentUser.displayName}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Top Segment Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>账号分配与管理 ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
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
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
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
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>待办共享申请审批 ({shareRequests.filter((r) => r.status === 'pending').length})</span>
        </button>
      </div>

      {/* Tab 1: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">系统分配账号列表</h3>
              <p className="text-xs text-slate-400">
                可为不同岗位成员分配独立工作账号、赋予角色并在右上角即时切换演示
              </p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
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
                  <th className="py-3 px-4">所属部门</th>
                  <th className="py-3 px-4">角色权限</th>
                  <th className="py-3 px-4">所属群组</th>
                  <th className="py-3 px-4">当前设备</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const userGroups = groups.filter((g) => u.groupList.includes(g.id));
                  const isCurrent = u.userId === currentUser.userId;
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
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{u.department || '—'}</td>
                      <td className="py-3.5 px-4">
                        {u.role === 'admin' ? (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold text-[10px]">
                            超级管理员
                          </span>
                        ) : u.role === 'supervisor' ? (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[10px]">
                            部门主管
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium text-[10px]">
                            普通成员
                          </span>
                        )}
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
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {!isCurrent && (
                          <button
                            onClick={() => onSwitchUser(u)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-xs transition-colors"
                          >
                            切换至该账号
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">所属部门</label>
                <input
                  type="text"
                  placeholder="例如: 智慧城市实施部"
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
                  <option value="supervisor">部门主管 (可发起组内协同/导出报表)</option>
                  <option value="admin">超级管理员 (拥有账号分配与品牌配置权)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  加入的群组 (可多选)
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

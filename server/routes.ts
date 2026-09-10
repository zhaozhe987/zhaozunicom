import { Router, Request, Response } from 'express';
import { db } from './db';
import {
  UserInfo,
  UserRole,
  UserPermissions,
  TaskItem,
  MemoItem,
  ExpenseItem,
  TenderItem,
  UserGroup,
  GroupShareRequest,
  BrandingConfig,
} from '../src/types';

export const apiRouter = Router();

// 1. Health check & DB Status
apiRouter.get('/health', (req: Request, res: Response) => {
  const snapshot = db.getSnapshot();
  res.json({
    status: 'ok',
    database: 'embedded-json-persistent',
    persistedFile: 'data/db.json',
    stats: {
      usersCount: snapshot.users.length,
      rolesCount: snapshot.roles.length,
      tasksCount: snapshot.tasks.length,
      memosCount: snapshot.memos.length,
      expensesCount: snapshot.expenses.length,
      newsCount: snapshot.news.length,
      tendersCount: snapshot.tenders.length,
      groupsCount: snapshot.groups.length,
    },
  });
});

// 2. Full Sync Snapshot - One network call to get or refresh all modules
apiRouter.get('/sync/all', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: db.getSnapshot(),
    timestamp: new Date().toISOString(),
  });
});

// 3. Auth & Profile Endpoints
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: '请输入用户名和密码' });
  }

  const user = db.findUserByUsername(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: '用户名或密码不正确' });
  }

  // Calculate effective permissions: Role default permissions merged with individual overrides
  const roles = db.getRoles();
  const roleDef = roles.find((r) => r.roleKey === user.role);
  const effectivePermissions: UserPermissions = {
    ...(roleDef?.permissions || {}),
    ...(user.permissionOverrides || {}),
  };

  const safeUser: UserInfo = {
    ...user,
    permissions: effectivePermissions,
  };

  db.addAuditLog(user.userId, user.displayName, 'LOGIN', `用户 ${user.displayName} 从设备登录`);

  res.json({
    success: true,
    user: safeUser,
    message: '登录成功',
  });
});

apiRouter.post('/auth/change-password', (req: Request, res: Response) => {
  const { userId, oldPassword, newPassword } = req.body;
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  if (user.password && user.password !== oldPassword) {
    return res.status(400).json({ success: false, message: '原密码错误' });
  }

  user.password = newPassword;
  db.saveUser(user);
  db.addAuditLog(user.userId, user.displayName, 'CHANGE_PASSWORD', `修改了登录密码`);

  res.json({ success: true, message: '密码修改成功' });
});

// 4. Role & Permission Matrix Management (Superadmin)
apiRouter.get('/roles', (req: Request, res: Response) => {
  res.json({
    success: true,
    roles: db.getRoles(),
  });
});

apiRouter.put('/roles/:roleKey', (req: Request, res: Response) => {
  const roleKey = req.params.roleKey as UserRole;
  const { permissions, operatorId, operatorName } = req.body;

  if (!permissions) {
    return res.status(400).json({ success: false, message: '缺少权限配置' });
  }

  db.updateRolePermissions(roleKey, permissions);
  db.addAuditLog(
    operatorId || 'admin_001',
    operatorName || '超级管理员',
    'UPDATE_ROLE_PERMISSIONS',
    `更新了角色 [${roleKey}] 的默认权限矩阵配置`
  );

  res.json({
    success: true,
    message: '角色权限配置已保存并同步至全系统',
    roles: db.getRoles(),
  });
});

// 5. User Management
apiRouter.get('/users', (req: Request, res: Response) => {
  const users = db.getUsers().map((u) => {
    const { password, ...safe } = u;
    return safe;
  });
  res.json({ success: true, users });
});

apiRouter.post('/users', (req: Request, res: Response) => {
  const { username, displayName, role, department, password, permissionOverrides, operatorId, operatorName } = req.body;

  if (!username || !displayName) {
    return res.status(400).json({ success: false, message: '用户名和姓名不能为空' });
  }

  if (db.findUserByUsername(username)) {
    return res.status(400).json({ success: false, message: '该用户名已存在' });
  }

  const roles = db.getRoles();
  const roleDef = roles.find((r) => r.roleKey === (role || 'member'));
  const effectivePermissions = {
    ...(roleDef?.permissions || {}),
    ...(permissionOverrides || {}),
  };

  const newUser: UserInfo = {
    userId: `usr_${Date.now()}`,
    username,
    displayName,
    role: role || 'member',
    department: department || '政企要客部',
    password: password || '123456',
    groupList: [],
    device: 'Web客户端',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    canManageUsers: role === 'admin',
    permissions: effectivePermissions,
    permissionOverrides: permissionOverrides || {},
  };

  db.saveUser(newUser);
  db.addAuditLog(
    operatorId || 'admin',
    operatorName || '超级管理员',
    'CREATE_USER',
    `创建新用户 [${displayName}] (${username}), 角色: ${role}`
  );

  const { password: _, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser, message: '用户创建成功' });
});

apiRouter.put('/users/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  const {
    displayName,
    role,
    department,
    password,
    permissionOverrides,
    groupList,
    operatorId,
    operatorName,
  } = req.body;

  if (displayName) user.displayName = displayName;
  if (role) user.role = role;
  if (department) user.department = department;
  if (password) user.password = password;
  if (groupList) user.groupList = groupList;
  if (permissionOverrides !== undefined) user.permissionOverrides = permissionOverrides;

  // Re-calculate permissions
  const roles = db.getRoles();
  const roleDef = roles.find((r) => r.roleKey === user.role);
  user.permissions = {
    ...(roleDef?.permissions || {}),
    ...(user.permissionOverrides || {}),
  };
  user.canManageUsers = !!user.permissions.canManageUsers;

  db.saveUser(user);
  db.addAuditLog(
    operatorId || 'admin',
    operatorName || '超级管理员',
    'UPDATE_USER',
    `更新了用户 [${user.displayName}] 的角色或个性化权限配置`
  );

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser, message: '用户信息及权限已更新' });
});

apiRouter.delete('/users/:userId', (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }

  if (user.role === 'admin' && user.username === 'admin') {
    return res.status(403).json({ success: false, message: '系统默认超级管理员账号不可删除' });
  }

  db.deleteUser(userId);
  res.json({ success: true, message: '用户已注销' });
});

// 6. Tasks
apiRouter.get('/tasks', (req: Request, res: Response) => {
  res.json({ success: true, tasks: db.getTasks() });
});

apiRouter.put('/tasks', (req: Request, res: Response) => {
  const { tasks } = req.body;
  if (Array.isArray(tasks)) {
    db.setCollection('tasks', tasks);
    res.json({ success: true, count: tasks.length, message: '待办任务全量同步成功' });
  } else {
    res.status(400).json({ success: false, message: '无效的任务列表格式' });
  }
});

apiRouter.post('/tasks', (req: Request, res: Response) => {
  const task: TaskItem = req.body;
  if (!task.id) task.id = `task_${Date.now()}`;
  db.saveTask(task);
  res.json({ success: true, task, message: '待办任务已保存至中央数据库' });
});

apiRouter.put('/tasks/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const existing = db.getTasks().find((t) => t.id === id);
  if (!existing) {
    return res.status(404).json({ success: false, message: '任务不存在' });
  }
  const updated: TaskItem = { ...existing, ...req.body, id };
  db.saveTask(updated);
  res.json({ success: true, task: updated, message: '待办任务已同步更新' });
});

apiRouter.delete('/tasks/:id', (req: Request, res: Response) => {
  db.deleteTask(req.params.id);
  res.json({ success: true, message: '任务已从数据库删除' });
});

// 7. Memos
apiRouter.get('/memos', (req: Request, res: Response) => {
  res.json({ success: true, memos: db.getMemos() });
});

apiRouter.put('/memos', (req: Request, res: Response) => {
  const { memos } = req.body;
  if (Array.isArray(memos)) {
    db.setCollection('memos', memos);
    res.json({ success: true, count: memos.length, message: '生活备忘全量同步成功' });
  } else {
    res.status(400).json({ success: false, message: '无效的备忘录列表格式' });
  }
});

apiRouter.post('/memos', (req: Request, res: Response) => {
  const memo: MemoItem = req.body;
  if (!memo.id) memo.id = `memo_${Date.now()}`;
  db.saveMemo(memo);
  res.json({ success: true, memo, message: '备忘录已保存' });
});

apiRouter.put('/memos/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const existing = db.getMemos().find((m) => m.id === id);
  if (!existing) {
    return res.status(404).json({ success: false, message: '备忘录不存在' });
  }
  const updated: MemoItem = { ...existing, ...req.body, id };
  db.saveMemo(updated);
  res.json({ success: true, memo: updated });
});

apiRouter.delete('/memos/:id', (req: Request, res: Response) => {
  db.deleteMemo(req.params.id);
  res.json({ success: true, message: '备忘录已删除' });
});

// 8. Expenses
apiRouter.get('/expenses', (req: Request, res: Response) => {
  res.json({ success: true, expenses: db.getExpenses() });
});

apiRouter.put('/expenses', (req: Request, res: Response) => {
  const { expenses } = req.body;
  if (Array.isArray(expenses)) {
    db.setCollection('expenses', expenses);
    res.json({ success: true, count: expenses.length, message: '支出明细全量同步成功' });
  } else {
    res.status(400).json({ success: false, message: '无效的支出列表格式' });
  }
});

apiRouter.post('/expenses', (req: Request, res: Response) => {
  const exp: ExpenseItem = req.body;
  if (!exp.id) exp.id = `exp_${Date.now()}`;
  db.saveExpense(exp);
  res.json({ success: true, expense: exp, message: '记账明细已保存至数据库' });
});

apiRouter.delete('/expenses/:id', (req: Request, res: Response) => {
  db.deleteExpense(req.params.id);
  res.json({ success: true, message: '支出记录已删除' });
});

// 9. News
apiRouter.get('/news', (req: Request, res: Response) => {
  res.json({ success: true, news: db.getNews() });
});

apiRouter.post('/news/:id/toggle-read', (req: Request, res: Response) => {
  const isRead = db.toggleNewsRead(req.params.id);
  res.json({ success: true, isRead });
});

apiRouter.post('/news/mark-all-read', (req: Request, res: Response) => {
  db.markAllNewsRead();
  res.json({ success: true, message: '全部资讯已标为已读' });
});

// 10. Tenders (Preserved full authentic data)
apiRouter.get('/tenders', (req: Request, res: Response) => {
  res.json({ success: true, tenders: db.getTenders() });
});

apiRouter.post('/tenders', (req: Request, res: Response) => {
  const tender: TenderItem = req.body;
  if (!tender.id) tender.id = `td_${Date.now()}`;
  db.saveTender(tender);
  res.json({ success: true, tender, message: '标讯已收录至数据库' });
});

apiRouter.put('/tenders/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const existing = db.getTenders().find((t) => t.id === id);
  if (!existing) {
    return res.status(404).json({ success: false, message: '标讯不存在' });
  }
  const updated: TenderItem = { ...existing, ...req.body, id };
  db.saveTender(updated);
  res.json({ success: true, tender: updated });
});

// 11. Groups
apiRouter.get('/groups', (req: Request, res: Response) => {
  res.json({ success: true, groups: db.getGroups() });
});

apiRouter.post('/groups', (req: Request, res: Response) => {
  const group: UserGroup = req.body;
  if (!group.id) group.id = `grp_${Date.now()}`;
  db.saveGroup(group);
  res.json({ success: true, group, message: '群组已创建并持久化' });
});

apiRouter.put('/groups/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const existing = db.getGroups().find((g) => g.id === id);
  if (!existing) {
    return res.status(404).json({ success: false, message: '群组不存在' });
  }
  const updated: UserGroup = { ...existing, ...req.body, id };
  db.saveGroup(updated);
  res.json({ success: true, group: updated });
});

apiRouter.delete('/groups/:id', (req: Request, res: Response) => {
  db.deleteGroup(req.params.id);
  res.json({ success: true, message: '群组已解散' });
});

// 12. Branding Config
apiRouter.get('/branding', (req: Request, res: Response) => {
  res.json({ success: true, branding: db.getCollection('branding') });
});

apiRouter.put('/branding', (req: Request, res: Response) => {
  const branding: BrandingConfig = req.body;
  db.setCollection('branding', branding);
  res.json({ success: true, branding, message: '系统品牌设置已更新' });
});

// 13. Share Requests
apiRouter.get('/share-requests', (req: Request, res: Response) => {
  res.json({ success: true, shareRequests: db.getCollection('shareRequests') || [] });
});

apiRouter.put('/share-requests', (req: Request, res: Response) => {
  const { shareRequests } = req.body;
  if (Array.isArray(shareRequests)) {
    db.setCollection('shareRequests', shareRequests);
    res.json({ success: true, count: shareRequests.length });
  } else {
    res.status(400).json({ success: false, message: '无效的共享审批请求列表格式' });
  }
});

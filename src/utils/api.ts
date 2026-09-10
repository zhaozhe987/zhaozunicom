import {
  UserInfo,
  UserRole,
  RoleDefinition,
  UserPermissions,
  TaskItem,
  MemoItem,
  ExpenseItem,
  NewsItem,
  TenderItem,
  UserGroup,
  GroupShareRequest,
  BrandingConfig,
} from '../types';

export interface SyncResponse {
  success: boolean;
  data: {
    users: UserInfo[];
    roles: RoleDefinition[];
    tasks: TaskItem[];
    memos: MemoItem[];
    expenses: ExpenseItem[];
    news: NewsItem[];
    tenders: TenderItem[];
    groups: UserGroup[];
    shareRequests: GroupShareRequest[];
    branding: BrandingConfig;
    notifications: any[];
    auditLogs: any[];
  };
  timestamp: string;
}

class ApiService {
  private isOnline = true;

  // 1. Fetch full sync snapshot from central database
  async fetchFullSync(): Promise<SyncResponse | null> {
    try {
      const res = await fetch('/api/sync/all', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SyncResponse = await res.json();
      this.isOnline = true;
      return data;
    } catch (err) {
      console.warn('[API] Could not sync from server, using local cache:', err);
      this.isOnline = false;
      return null;
    }
  }

  // 2. Health check
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      this.isOnline = data.status === 'ok';
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  getOnlineStatus() {
    return this.isOnline;
  }

  // 3. Roles & Permission Matrix API
  async getRoles(): Promise<RoleDefinition[]> {
    try {
      const res = await fetch('/api/roles');
      const data = await res.json();
      return data.roles || [];
    } catch (err) {
      console.error('getRoles failed:', err);
      return [];
    }
  }

  async updateRolePermissions(
    roleKey: UserRole,
    permissions: UserPermissions,
    operatorId?: string,
    operatorName?: string
  ): Promise<{ success: boolean; roles?: RoleDefinition[]; message?: string }> {
    try {
      const res = await fetch(`/api/roles/${roleKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions, operatorId, operatorName }),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: String(err) };
    }
  }

  // 4. Users API
  async getUsers(): Promise<UserInfo[]> {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      return data.users || [];
    } catch {
      return [];
    }
  }

  async createUser(userPayload: {
    username: string;
    displayName: string;
    role: UserRole;
    department?: string;
    password?: string;
    permissionOverrides?: Partial<UserPermissions>;
    operatorId?: string;
    operatorName?: string;
  }): Promise<{ success: boolean; user?: UserInfo; message?: string }> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: String(err) };
    }
  }

  async updateUser(
    userId: string,
    updates: Partial<UserInfo> & {
      password?: string;
      permissionOverrides?: Partial<UserPermissions>;
      operatorId?: string;
      operatorName?: string;
    }
  ): Promise<{ success: boolean; user?: UserInfo; message?: string }> {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (err) {
      return { success: false, message: String(err) };
    }
  }

  async deleteUser(userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      return await res.json();
    } catch (err) {
      return { success: false, message: String(err) };
    }
  }

  // 5. Tasks API
  async getTasks(): Promise<TaskItem[]> {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      return data.tasks || [];
    } catch {
      return [];
    }
  }

  async saveTask(task: TaskItem): Promise<boolean> {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async updateTask(id: string, updates: Partial<TaskItem>): Promise<boolean> {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async batchSaveTasks(tasks: TaskItem[]): Promise<boolean> {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }

  // 6. Memos API
  async getMemos(): Promise<MemoItem[]> {
    try {
      const res = await fetch('/api/memos');
      const data = await res.json();
      return data.memos || [];
    } catch {
      return [];
    }
  }

  async saveMemo(memo: MemoItem): Promise<boolean> {
    try {
      const res = await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memo),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async deleteMemo(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/memos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async batchSaveMemos(memos: MemoItem[]): Promise<boolean> {
    try {
      const res = await fetch('/api/memos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memos }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }

  // 7. Expenses API
  async getExpenses(): Promise<ExpenseItem[]> {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      return data.expenses || [];
    } catch {
      return [];
    }
  }

  async saveExpense(exp: ExpenseItem): Promise<boolean> {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async deleteExpense(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async batchSaveExpenses(expenses: ExpenseItem[]): Promise<boolean> {
    try {
      const res = await fetch('/api/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }

  // 8. News API
  async getNews(): Promise<NewsItem[]> {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      return data.news || [];
    } catch {
      return [];
    }
  }

  async toggleNewsRead(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/news/${id}/toggle-read`, { method: 'POST' });
      const data = await res.json();
      return data.isRead;
    } catch {
      return false;
    }
  }

  async markAllNewsRead(): Promise<boolean> {
    try {
      const res = await fetch('/api/news/mark-all-read', { method: 'POST' });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  // 9. Tenders API
  async getTenders(): Promise<TenderItem[]> {
    try {
      const res = await fetch('/api/tenders');
      const data = await res.json();
      return data.tenders || [];
    } catch {
      return [];
    }
  }

  async saveTender(tender: TenderItem): Promise<boolean> {
    try {
      const res = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tender),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async updateTender(id: string, updates: Partial<TenderItem>): Promise<boolean> {
    try {
      const res = await fetch(`/api/tenders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  // 10. Groups API
  async getGroups(): Promise<UserGroup[]> {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      return data.groups || [];
    } catch {
      return [];
    }
  }

  async saveGroup(group: UserGroup): Promise<boolean> {
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(group),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async deleteGroup(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  // 11. Branding API
  async getBranding(): Promise<BrandingConfig> {
    try {
      const res = await fetch('/api/branding');
      const data = await res.json();
      return data.branding || { appName: '办公助手' };
    } catch {
      return { appName: '办公助手' };
    }
  }

  async updateBranding(config: BrandingConfig): Promise<boolean> {
    try {
      const res = await fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  // 12. Share Requests API
  async batchSaveShareRequests(shareRequests: any[]): Promise<boolean> {
    try {
      const res = await fetch('/api/share-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareRequests }),
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }
}

export const api = new ApiService();

export type TaskStatus = 'pending' | 'done' | 'follow_up';

export interface TaskLog {
  id: string;
  timestamp: string;
  action: 'create' | 'complete' | 'reopen' | 'follow_up' | 'update';
  remark?: string;
  targetDate?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
  completedAt?: string;
  followUpNote?: string;
  followUpDate?: string;
  originalTaskId?: string; // Links back to parent task for follow-up chains
  logs: TaskLog[];
  priority?: 'low' | 'normal' | 'high';
  // Sharing & multi-user properties
  creatorId?: string;
  creatorName?: string;
  isSharedToGroup?: boolean;
  sharedGroupId?: string;
  sharedGroupName?: string;
}

export interface MemoItem {
  id: string;
  title: string;
  content: string;
  category: string; // e.g. 体检, 旅行, 购物, 个人, 工作
  reminderTime?: string;
  attachments?: {
    name: string;
    size: number;
    type: string;
    url?: string;
    dataUrl?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = '餐饮' | '交通' | '购物' | '居住' | '娱乐' | '其他';

export interface ExpenseItem {
  id: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  remark: string;
  createdAt: string;
}

export interface OfficeJob {
  id: string;
  fileName: string;
  fileSize: number;
  action: 'convert' | 'watermark_mask' | 'convert_word_manual';
  targetFormat?: 'docx' | 'xml' | 'html';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  resultBlob?: Blob;
  downloadName?: string;
  createdAt: string;
  completedAt?: string;
  watermarkBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    positionLabel?: string;
  };
}

export type NewsCategory = '人工智能' | '数据要素' | '智慧城市' | '通信';

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: NewsCategory;
  publishTime: string;
  summary: string;
  url: string;
  isRead?: boolean;
  pushDate?: string; // YYYY-MM-DD
  pushBatch?: string; // e.g. "今日 08:00 准时推送"
  sourceWebsiteName?: string;
}

export type TenderType = '招标公告' | '中标结果' | '更正公告';

export interface TenderItem {
  id: string;
  title: string;
  province: string;
  city: string;
  district?: string;
  type: TenderType;
  budget?: string;
  publishDate: string; // YYYY-MM-DD
  isHistorical?: boolean; // True if it's historical (past 3 years same period)
  historicalYear?: number; // e.g. 2023, 2024, 2025
  isFavorite: boolean;
  tags: string[];
  agency: string;
  contentSnippet: string;
  sourceUrl: string; // Direct external jump link
  sourceWebsiteName: string; // e.g. 四川省公共资源交易信息网
}

export type MoodType = 'happy' | 'good' | 'normal' | 'down' | 'speechless';

export interface HealthRecord {
  date: string; // YYYY-MM-DD
  mood: MoodType;
  sleepHours: number;
  workHours: number;
  workHoursCalculated: boolean;
  meals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  steps: number;
  exerciseNote?: string;
  score: number;
  scoreBreakdown: {
    moodScore: number;
    sleepScore: number;
    workScore: number;
    mealScore: number;
    exerciseScore: number;
  };
}

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  type: 'task' | 'office' | 'news' | 'health' | 'system' | 'share';
  timestamp: string;
  isRead: boolean;
  actionLink?: string;
  meta?: Record<string, any>;
}

export type ModuleTab = 'tasks' | 'memos' | 'expenses' | 'office' | 'news' | 'tenders' | 'health' | 'admin';
export type ActiveTab = ModuleTab;

export type UserRole = 'admin' | 'supervisor' | 'member';

export const PRESET_DEPARTMENTS = [
  '政企要客部',
  '政企企业部',
  '政企商企部',
] as const;

export type PresetDepartment = typeof PRESET_DEPARTMENTS[number];

export interface UserPermissions {
  canManageGroups?: boolean; // 允许设立与管理群组 (下放至主管)
  canApproveShare?: boolean; // 允许审批跨部门待办共享
  canExportReports?: boolean; // 允许导出部门总结与报表
  canManageDepartmentMembers?: boolean; // 允许维护本部门成员
  canViewAllTenders?: boolean; // 允许穿透检索全部标讯
}

export interface UserInfo {
  userId: string;
  username: string;
  password?: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  department?: string;
  groupList: string[]; // List of group IDs
  device: string;
  createdAt: string;
  canManageUsers?: boolean;
  permissions?: UserPermissions;
}

export interface UserGroup {
  id: string;
  name: string;
  description: string;
  leaderId?: string;
  leaderName?: string;
  memberIds: string[];
  createdAt: string;
  color?: string;
}

export interface GroupShareRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  targetUserId: string;
  targetUserName: string;
  groupId: string;
  groupName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reason?: string;
}

export interface BrandingConfig {
  appName: string;
  logoUrl?: string;
  customLogoDataUrl?: string;
  slogan?: string;
  updatedAt?: string;
}

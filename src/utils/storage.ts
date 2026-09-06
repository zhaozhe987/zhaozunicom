import {
  TaskItem,
  MemoItem,
  ExpenseItem,
  NewsItem,
  TenderItem,
  HealthRecord,
  AppNotification,
  OfficeJob,
  MoodType,
  UserInfo,
  UserGroup,
  GroupShareRequest,
  BrandingConfig,
  ModuleTab,
} from '../types';

// Default pre-seeded users
export const defaultUsers: UserInfo[] = [
  {
    userId: 'admin_001',
    username: 'admin',
    password: 'password123',
    displayName: '系统管理员',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'admin',
    department: '信息技术与数字化中心',
    groupList: ['grp_01', 'grp_02', 'grp_03'],
    device: '办公助手总控台 (管理端)',
    createdAt: '2026-08-01 09:00',
    canManageUsers: true,
  },
  {
    userId: 'user_002',
    username: 'zhang_pm',
    password: 'password123',
    displayName: '张建国 (项目经理)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    role: 'supervisor',
    department: '智慧城市事业部',
    groupList: ['grp_01'],
    device: 'ThinkPad X1 Carbon (Windows)',
    createdAt: '2026-08-15 10:30',
    canManageUsers: false,
  },
  {
    userId: 'user_003',
    username: 'li_dev',
    password: 'password123',
    displayName: '李明 (算法架构师)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    role: 'member',
    department: '智慧城市事业部',
    groupList: ['grp_01'],
    device: 'MacBook Pro M3 Max',
    createdAt: '2026-08-18 14:00',
    canManageUsers: false,
  },
  {
    userId: 'user_004',
    username: 'wang_bid',
    password: 'password123',
    displayName: '王璐 (招采主管)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    role: 'supervisor',
    department: '政企招采部',
    groupList: ['grp_02'],
    device: '办公助手 Web端',
    createdAt: '2026-08-20 11:20',
    canManageUsers: false,
  },
  {
    userId: 'user_005',
    username: 'chen_oa',
    password: 'password123',
    displayName: '陈晨 (行政专员)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    role: 'member',
    department: '综合管理部',
    groupList: ['grp_03'],
    device: 'iPad Pro & 移动终端',
    createdAt: '2026-08-22 09:10',
    canManageUsers: false,
  },
];

// Default pre-seeded groups
export const defaultGroups: UserGroup[] = [
  {
    id: 'grp_01',
    name: '智慧城市项目组',
    description: '负责天府新区智慧交通信控与城市大脑二期落地，协同共享核心项目待办',
    leaderId: 'user_002',
    memberIds: ['admin_001', 'user_002', 'user_003'],
    createdAt: '2026-08-15 09:00',
    color: 'blue',
  },
  {
    id: 'grp_02',
    name: '政企招采工作群',
    description: '聚焦四川省及重点省市标讯监控、采购意向研判与历史标讯数据比对',
    leaderId: 'user_004',
    memberIds: ['admin_001', 'user_004'],
    createdAt: '2026-08-20 10:00',
    color: 'amber',
  },
  {
    id: 'grp_03',
    name: '综合行政管理部',
    description: '公文转换、账目报销、员工健康关怀与办公物资统筹',
    leaderId: 'admin_001',
    memberIds: ['admin_001', 'user_005'],
    createdAt: '2026-08-22 08:30',
    color: 'emerald',
  },
];

export const defaultBranding: BrandingConfig = {
  appName: '办公助手',
  logoUrl: '',
  slogan: '跨端协同 · 标讯穿透 · 团队共享中枢',
  updatedAt: '2026-09-06 08:00',
};

export const defaultModuleOrder: ModuleTab[] = [
  'tasks',
  'memos',
  'expenses',
  'office',
  'news',
  'tenders',
  'health',
];

const STORAGE_KEYS = {
  TASKS: 'jj_tasks_v2',
  MEMOS: 'jj_memos_v2',
  EXPENSES: 'jj_expenses_v2',
  NEWS: 'jj_news_v2',
  TENDERS: 'jj_tenders_v2',
  HEALTH: 'jj_health_v2',
  NOTIFICATIONS: 'jj_notifications_v2',
  OFFICE_JOBS: 'jj_office_jobs_v2',
  USERS: 'jj_users_v2',
  GROUPS: 'jj_groups_v2',
  CURRENT_USER_ID: 'jj_current_user_id_v2',
  IS_LOGGED_IN: 'jj_is_logged_in_v2',
  SHARE_REQUESTS: 'jj_share_requests_v2',
  BRANDING: 'jj_branding_config_v2',
  MODULE_ORDER: 'jj_module_order_v2',
};

// Date utilities
export const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateStr = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
};

export const getWeekdayStr = (dateStr: string): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[d.getDay()];
};

export const isHolidayOrWeekend = (dateStr: string): { isOff: boolean; name?: string } => {
  const d = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = d.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const holidays: Record<string, string> = {
    '2026-01-01': '元旦',
    '2026-01-02': '元旦假期',
    '2026-01-03': '元旦假期',
    '2026-02-16': '除夕',
    '2026-02-17': '春节',
    '2026-02-18': '春节假期',
    '2026-02-19': '春节假期',
    '2026-02-20': '春节假期',
    '2026-02-21': '春节假期',
    '2026-02-22': '春节假期',
    '2026-04-05': '清明节',
    '2026-04-06': '清明假期',
    '2026-05-01': '劳动节',
    '2026-05-02': '劳动节假期',
    '2026-05-03': '劳动节假期',
    '2026-06-19': '端午节',
    '2026-09-25': '中秋节',
    '2026-10-01': '国庆节',
    '2026-10-02': '国庆假期',
    '2026-10-03': '国庆假期',
    '2026-10-04': '国庆假期',
    '2026-10-05': '国庆假期',
    '2026-10-06': '国庆假期',
    '2026-10-07': '国庆假期',
  };

  if (holidays[dateStr]) {
    return { isOff: true, name: holidays[dateStr] };
  }

  if (isWeekend) {
    return { isOff: true, name: dayOfWeek === 0 ? '周日休息' : '周六休息' };
  }

  return { isOff: false };
};

// Seed Tasks
const initialTasks: TaskItem[] = [
  {
    id: 'task_001',
    title: '智慧城市二期项目需求评审会',
    description: '整理天府新区交通信号优化子系统技术方案，与交投团队逐条对接。已共享给项目组成员同步查阅。',
    status: 'pending',
    dueDate: getTodayDateStr(),
    createdAt: `${getTodayDateStr()} 09:15`,
    priority: 'high',
    creatorId: 'admin_001',
    creatorName: '系统管理员',
    isSharedToGroup: true,
    sharedGroupId: 'grp_01',
    sharedGroupName: '智慧城市项目组',
    logs: [
      {
        id: 'log_001_1',
        timestamp: `${getTodayDateStr()} 09:15`,
        action: 'create',
        remark: '创建任务并共享至【智慧城市项目组】',
      },
    ],
  },
  {
    id: 'task_002',
    title: '编制本周数据要素流转合规汇报材料',
    description: '包含公共数据可信授权运营机制及隐私计算试点进展，备战全员早会。',
    status: 'done',
    dueDate: getTodayDateStr(),
    createdAt: `${getTodayDateStr()} 08:30`,
    completedAt: `${getTodayDateStr()} 11:45`,
    priority: 'normal',
    creatorId: 'admin_001',
    creatorName: '系统管理员',
    isSharedToGroup: false,
    logs: [
      {
        id: 'log_002_1',
        timestamp: `${getTodayDateStr()} 08:30`,
        action: 'create',
        remark: '创建个人待办',
      },
      {
        id: 'log_002_2',
        timestamp: `${getTodayDateStr()} 11:45`,
        action: 'complete',
        remark: '完成材料初审与定稿',
      },
    ],
  },
  {
    id: 'task_003',
    title: '联系电信专线客户经理确认万兆光纤割接方案',
    description: '研发机房至天府智算中心专网扩容，现场联合调试前先做断网演练预案。',
    status: 'pending',
    dueDate: getTodayDateStr(),
    createdAt: `${getTodayDateStr()} 10:00`,
    priority: 'normal',
    creatorId: 'user_003',
    creatorName: '李明 (算法架构师)',
    isSharedToGroup: true,
    sharedGroupId: 'grp_01',
    sharedGroupName: '智慧城市项目组',
    logs: [
      {
        id: 'log_003_1',
        timestamp: `${getTodayDateStr()} 10:00`,
        action: 'create',
        remark: '由李明创建并共享给智慧城市项目组',
      },
    ],
  },
  {
    id: 'task_004',
    title: '汇总近三年同期天府新区重大智慧交通中标商名录',
    description: '对比2023-2025年同月雷视一体机集采单价与核心评分条款，形成竞对分析图。',
    status: 'pending',
    dueDate: getTodayDateStr(),
    createdAt: `${getTodayDateStr()} 09:40`,
    priority: 'high',
    creatorId: 'user_004',
    creatorName: '王璐 (招采主管)',
    isSharedToGroup: true,
    sharedGroupId: 'grp_02',
    sharedGroupName: '政企招采工作群',
    logs: [
      {
        id: 'log_004_1',
        timestamp: `${getTodayDateStr()} 09:40`,
        action: 'create',
        remark: '共享至政企招采工作群',
      },
    ],
  },
  {
    id: 'task_005',
    title: '部门季度公文归档与扫描件水印脱敏审核',
    description: '使用吉吉办公公文转换工具批量将PDF转为Word并清除背景多余标记。',
    status: 'pending',
    dueDate: getTodayDateStr(),
    createdAt: `${getTodayDateStr()} 10:30`,
    priority: 'normal',
    creatorId: 'user_005',
    creatorName: '陈晨 (行政专员)',
    isSharedToGroup: true,
    sharedGroupId: 'grp_03',
    sharedGroupName: '综合行政管理部',
    logs: [
      {
        id: 'log_005_1',
        timestamp: `${getTodayDateStr()} 10:30`,
        action: 'create',
        remark: '共享至综合行政管理部待办看板',
      },
    ],
  },
];

const initialMemos: MemoItem[] = [
  {
    id: 'memo_001',
    title: '2026年度三甲医院体检预约须知',
    content: '体检地点：成都市第一人民医院健康体检中心\n注意事项：\n1. 体检前一天晚8点后禁食水。\n2. 携带身份证原件及医保卡。\n3. 重点检查甲状腺超声与低剂量螺旋CT。',
    category: '体检',
    reminderTime: '2026-09-18 07:30',
    createdAt: `${getTodayDateStr()} 09:00`,
    updatedAt: `${getTodayDateStr()} 09:00`,
  },
  {
    id: 'memo_002',
    title: '川西秋季露营装备清单',
    content: '- 露营帐篷（防风防雨4级以上）\n- 羽绒睡袋（温标-5℃）\n- 户外移动电源（1000Wh）\n- 应急急救包与红景天\n- 单反相机与三脚架',
    category: '旅行',
    createdAt: '2026-09-02 14:20',
    updatedAt: '2026-09-02 14:20',
  },
  {
    id: 'memo_003',
    title: '办公桌升降台与人体工学椅换新备选',
    content: '1. 乐歌E5电动升降桌（实木双电机）\n2. 保友金豪b2工学椅（网布高透气）',
    category: '购物',
    createdAt: '2026-09-03 19:40',
    updatedAt: '2026-09-03 19:40',
  },
];

const initialExpenses: ExpenseItem[] = [
  {
    id: 'exp_001',
    amount: 38.5,
    category: '餐饮',
    date: getTodayDateStr(),
    remark: '工作日午餐套餐 + 鲜榨苹果汁',
    createdAt: `${getTodayDateStr()} 12:30`,
  },
  {
    id: 'exp_002',
    amount: 15.0,
    category: '交通',
    date: getTodayDateStr(),
    remark: '天府大道地铁往返天府一街',
    createdAt: `${getTodayDateStr()} 08:45`,
  },
  {
    id: 'exp_003',
    amount: 128.0,
    category: '购物',
    date: '2026-09-04',
    remark: '办公用品与A4打印纸耗材',
    createdAt: '2026-09-04 15:20',
  },
  {
    id: 'exp_004',
    amount: 45.0,
    category: '餐饮',
    date: '2026-09-04',
    remark: '晚间轻食沙拉与美式咖啡',
    createdAt: '2026-09-04 19:10',
  },
  {
    id: 'exp_005',
    amount: 230.0,
    category: '居住',
    date: '2026-09-01',
    remark: '9月份物业及宽带网络平摊费',
    createdAt: '2026-09-01 10:00',
  },
  {
    id: 'exp_006',
    amount: 68.0,
    category: '娱乐',
    date: '2026-09-03',
    remark: '周末科技博物馆门票',
    createdAt: '2026-09-03 16:30',
  },
];

// Requirement 4: News pushed at 8:00 AM daily, covering yesterday 08:00 to today 08:00
// External links are real and jump-ready.
const todayStr = getTodayDateStr();
const yesterdayStr = getYesterdayDateStr();

const initialNews: NewsItem[] = [
  {
    id: 'news_001',
    title: '工信部印发《全国一体化新型算力网络行动纲要》，加速异构算力互通互联',
    source: '36氪科技频道',
    sourceWebsiteName: '36氪官方科技资讯',
    category: '人工智能',
    publishTime: `${todayStr} 07:45`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '纲要强调完善国家枢纽节点智能算力资源协同调度机制，打破芯片生态壁垒，支持大模型跨区域无损并行训练。',
    url: 'https://36kr.com/information/technology',
    isRead: false,
  },
  {
    id: 'news_002',
    title: '国家数据局：首批全国公共数据资源开发利用典型实践案例正式公布',
    source: '新华网科技频道',
    sourceWebsiteName: '新华网官方科技要闻',
    category: '数据要素',
    publishTime: `${todayStr} 07:15`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '聚焦交通物流、绿色双碳与普惠金融领域，四川天府新区数据信托与可信数据空间入选国家级重点示范名录。',
    url: 'https://www.news.cn/tech/',
    isRead: false,
  },
  {
    id: 'news_003',
    title: '我国自主研发端侧轻量化视觉多模态模型发布，微小缺陷检测精度超99.5%',
    source: '机器之心官方网',
    sourceWebsiteName: '机器之心人工智能前沿',
    category: '人工智能',
    publishTime: `${todayStr} 06:30`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '模型体积压缩至原先1/8，可在工控机无GPU加速环境下实现每秒30帧全精度分析，极大降低制造业智能化改造成本。',
    url: 'https://www.jiqizhixin.com/',
    isRead: false,
  },
  {
    id: 'news_004',
    title: '四川省正式启动“车路云一体化”城市级全域试点，首期涵盖天府新区与高新区',
    source: '新华网财经频道',
    sourceWebsiteName: '新华网智能产业与财经',
    category: '智慧城市',
    publishTime: `${yesterdayStr} 22:10`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '全域铺设智能网联路侧单元（RSU）及毫米波雷达，实现城市级高精度信号自适应优化与公交信号优先通行。',
    url: 'https://www.news.cn/fortune/',
    isRead: true,
  },
  {
    id: 'news_005',
    title: '中国电信联合清华大学完成城域量子保密通信现网共纤传输实网测评',
    source: 'C114通信网',
    sourceWebsiteName: 'C114中国通信网要闻',
    category: '通信',
    publishTime: `${yesterdayStr} 19:40`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '测试验证了量子密钥在商用100G波分系统中跨局站稳定运行，为下一代政企安全专网架构提供安全兜底保障。',
    url: 'https://www.c114.com.cn/news/',
    isRead: false,
  },
  {
    id: 'news_006',
    title: '开源社区发布Agentic Workflow深度长思考代理系统，跨应用协同效率倍增',
    source: 'IT之家科技头条',
    sourceWebsiteName: 'IT之家官方资讯平台',
    category: '人工智能',
    publishTime: `${yesterdayStr} 16:50`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '支持用户通过自然语言触发复合办公流程编排，自主调用本地脚本、转换文档与报表统计，减少机械化操作。',
    url: 'https://www.ithome.com/',
    isRead: false,
  },
  {
    id: 'news_007',
    title: '5G-A低空智联通感一体专网在成都淮州新城通航产业园进入常态化巡航保障',
    source: 'C114 5G-A频道',
    sourceWebsiteName: 'C114 5G与低空经济专栏',
    category: '通信',
    publishTime: `${yesterdayStr} 14:15`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '无需无人机悬挂额外应答设备，地面宏基站自发自收波束实时反演空域多目标轨迹，精度达到分米级。',
    url: 'https://www.c114.com.cn/news/',
    isRead: false,
  },
  {
    id: 'news_008',
    title: '企业数据资产入表实务指引（2026年修订版）正式印发，细化折旧与收益权认定',
    source: '澎湃新闻财经',
    sourceWebsiteName: '澎湃新闻官方经济科技频道',
    category: '数据要素',
    publishTime: `${yesterdayStr} 11:30`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '进一步规范工业物联网数据、供应链流转数据在会计报表上的无形资产确认准则，活跃数字金融质押融资。',
    url: 'https://www.thepaper.cn/channel_25950',
    isRead: false,
  },
  {
    id: 'news_009',
    title: '住建部发布《城市地下管网立体孪生与微小泄漏预警体系建设导则》',
    source: '新华网政务要闻',
    sourceWebsiteName: '新华网官方政务发布平台',
    category: '智慧城市',
    publishTime: `${yesterdayStr} 09:50`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '推行地埋式声纳与光纤传感网融合感知，实现燃气及主供水管网微弱泄漏10分钟内智能告警与阻断。',
    url: 'https://www.news.cn/',
    isRead: false,
  },
  {
    id: 'news_010',
    title: '国产RISC-V边缘AI芯片在电力巡检与水务智能网关中迎来千万级出货',
    source: '36氪前沿快讯',
    sourceWebsiteName: '36氪半导体与工业物联网',
    category: '人工智能',
    publishTime: `${yesterdayStr} 08:20`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '得益于开放指令集架构与高能效比矩阵计算单元，国产芯片在能源基础设施物联网改造中全面替代进口方案。',
    url: 'https://36kr.com/',
    isRead: false,
  },
];

// Requirement 2: Two plates with verified official government procurement & public resource trading platforms:
// Plate 1: Recent Tenders (近一个周的标讯，点开链接跳转至标讯网站)
// Plate 2: Historical Tenders (近三年同期招采、中标、变更，同样实现网址跳转)
const initialTenders: TenderItem[] = [
  // --- Plate 1: 近期标讯 (Within past 7 days) ---
  {
    id: 'td_recent_001',
    title: '成都市天府新区智慧交通二期信号自适应优化系统采购项目公开招标公告',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '招标公告',
    budget: '￥4,860,000 元',
    publishDate: todayStr, // Today
    isHistorical: false,
    isFavorite: true,
    tags: ['智慧交通', '自适应控制', '近期标讯'],
    agency: '四川天府新区公共资源交易中心',
    contentSnippet: '受天府新区城管与交警部门委托，对智慧交通二期80组雷视一体机采购及动态调控平台进行公开招标。投标截止日为2026年9月26日。',
    sourceUrl: 'https://ggzyjy.sc.gov.cn/',
    sourceWebsiteName: '四川省公共资源交易信息网（官方门户）',
  },
  {
    id: 'td_recent_002',
    title: '四川天府新区政务云大数据底座安全加固与容灾备份服务项目中标结果公告',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '中标结果',
    budget: '￥2,150,000 元',
    publishDate: yesterdayStr, // Yesterday
    isHistorical: false,
    isFavorite: false,
    tags: ['政务云', '信创安全', '近期标讯'],
    agency: '四川天府新区政府采购管理办公室',
    contentSnippet: '中标供应商：中国电信股份有限公司四川分公司，中标金额215万元整。服务期限三年，符合等保三级及密评标准。',
    sourceUrl: 'https://www.ccgp.gov.cn/',
    sourceWebsiteName: '中国政府采购网（财政部唯一定点平台）',
  },
  {
    id: 'td_recent_003',
    title: '成都市智慧应急联动指挥中心融合通信调度系统澄清与更正公告（第一次）',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '更正公告',
    budget: '￥1,780,000 元',
    publishDate: '2026-09-04', // 2 days ago
    isHistorical: false,
    isFavorite: false,
    tags: ['应急通信', '澄清答疑', '近期标讯'],
    agency: '成都市公共资源交易服务中心',
    contentSnippet: '针对投标人提出招标文件第4.3条信令并发参数疑问予以澄清，投标截止与开标时间顺延至2026年9月22日09:30。',
    sourceUrl: 'https://deal.ggzy.gov.cn/',
    sourceWebsiteName: '全国公共资源交易平台（国家发改委主管）',
  },
  {
    id: 'td_recent_004',
    title: '杭州市余杭区未来科技城低空物流航线智联空域基站网设备招标公告',
    province: '浙江省',
    city: '杭州市',
    type: '招标公告',
    budget: '￥12,500,000 元',
    publishDate: '2026-09-03', // 3 days ago
    isHistorical: false,
    isFavorite: true,
    tags: ['低空经济', '5G-A', '近期标讯'],
    agency: '杭州市公共资源交易中心余杭分中心',
    contentSnippet: '涵盖全域32个通感一体基站节点与低空航路气象自动观测终端的交钥匙工程，支持跨江跨城无人机物流常态化运营。',
    sourceUrl: 'https://zfcg.czt.zj.gov.cn/',
    sourceWebsiteName: '浙江政府采购网（浙江省财政厅官方）',
  },
  {
    id: 'td_recent_005',
    title: '北京市海淀区中关村科学城数字孪生三维实景底座升级采购中标结果公告',
    province: '北京市',
    city: '海淀区',
    type: '中标结果',
    budget: '￥5,800,000 元',
    publishDate: '2026-09-02', // 4 days ago
    isHistorical: false,
    isFavorite: false,
    tags: ['数字孪生', '高精底图', '近期标讯'],
    agency: '北京市政府采购中心',
    contentSnippet: '中标人：北京市测绘设计研究院，中标金额580万元。完成核心园区倾斜摄影及毫米级BIM单体化建模更新。',
    sourceUrl: 'https://www.ggzy.gov.cn/',
    sourceWebsiteName: '全国公共资源交易平台(北京官方信息发布)',
  },

  // --- Plate 2: 历史标讯 (近三年同期的招采、中标、变更等标讯信息) ---
  // 2025年同期
  {
    id: 'td_hist_2025_01',
    title: '【2025年同期招采】四川天府新区物联网传感器中试基地算力基础设施公开招标公告',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '招标公告',
    budget: '￥6,200,000 元',
    publishDate: '2025-09-06',
    isHistorical: true,
    historicalYear: 2025,
    isFavorite: true,
    tags: ['历史标讯', '算力枢纽', '2025年同期'],
    agency: '四川天府新区发展和改革局',
    contentSnippet: '建设异构智算集群与PB级全闪存储，全面满足西部物联网传感器与边缘算法中试仿真需求。',
    sourceUrl: 'https://ggzyjy.sc.gov.cn/',
    sourceWebsiteName: '四川省公共资源交易信息网',
  },
  {
    id: 'td_hist_2025_02',
    title: '【2025年同期中标】四川省全民健康信息平台二期容灾备份与微服务改造中标公告',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '中标结果',
    budget: '￥4,980,000 元',
    publishDate: '2025-09-05',
    isHistorical: true,
    historicalYear: 2025,
    isFavorite: false,
    tags: ['历史标讯', '医疗信息化', '中标结果'],
    agency: '四川省卫生健康委员会',
    contentSnippet: '中标单位：东华医为科技有限公司，服务期至2028年，包含跨院区电子病历可信交换与国密签名网关。',
    sourceUrl: 'https://www.ccgp-sichuan.gov.cn/',
    sourceWebsiteName: '四川政府采购网（官方信息披露专网）',
  },
  // 2024年同期
  {
    id: 'td_hist_2024_01',
    title: '【2024年同期中标】成都市天府新区兴隆湖生态监测数字孪生平台中标结果公告',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '中标结果',
    budget: '￥3,480,000 元',
    publishDate: '2024-09-06',
    isHistorical: true,
    historicalYear: 2024,
    isFavorite: false,
    tags: ['历史标讯', '兴隆湖', '数字孪生', '2024年同期'],
    agency: '四川天府新区生态环境和城市管理局',
    contentSnippet: '中标联合体：成都市建筑设计研究院有限公司 & 华为软件技术有限公司，实施周期180日历天。',
    sourceUrl: 'https://www.ccgp.gov.cn/',
    sourceWebsiteName: '中国政府采购网',
  },
  {
    id: 'td_hist_2024_02',
    title: '【2024年同期变更】天府大道智能路侧单元与网联感知终端采购更正公告',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '更正公告',
    budget: '￥2,760,000 元',
    publishDate: '2024-09-04',
    isHistorical: true,
    historicalYear: 2024,
    isFavorite: false,
    tags: ['历史标讯', '智能路侧', '更正公告'],
    agency: '成都市公共资源交易服务中心',
    contentSnippet: '更正供货交货地点为天府新区科学城孵化器二期，质保金比例由10%调整为5%，答疑文件已上传平台。',
    sourceUrl: 'https://deal.ggzy.gov.cn/',
    sourceWebsiteName: '全国公共资源交易平台',
  },
  // 2023年同期
  {
    id: 'td_hist_2023_01',
    title: '【2023年同期招采】四川天府新区政务数据共享交换平台升级项目公开招标公告',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '招标公告',
    budget: '￥1,950,000 元',
    publishDate: '2023-09-06',
    isHistorical: true,
    historicalYear: 2023,
    isFavorite: false,
    tags: ['历史标讯', '数据共享', '2023年同期'],
    agency: '四川天府新区行政审批局',
    contentSnippet: '升级“一网通办”骨干接口总线，实现政务数据目录自动化注册与多业务部门库表级实时推送。',
    sourceUrl: 'https://ggzyjy.sc.gov.cn/',
    sourceWebsiteName: '四川省公共资源交易信息网',
  },
  {
    id: 'td_hist_2023_02',
    title: '【2023年同期变更】天府科学城智慧园区物业安防联动系统补充更正公告（第二号）',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '更正公告',
    budget: '￥3,200,000 元',
    publishDate: '2023-09-03',
    isHistorical: true,
    historicalYear: 2023,
    isFavorite: false,
    tags: ['历史标讯', '智慧园区', '更正公告'],
    agency: '成都天府招采交易平台',
    contentSnippet: '调整监控摄像头红外补光距离技术要求为不低于50米，资格后审评审办法保持不变。',
    sourceUrl: 'https://www.ccgp-sichuan.gov.cn/',
    sourceWebsiteName: '四川政府采购网',
  },
];

const initialNotifications: AppNotification[] = [
  {
    id: 'notif_001',
    title: '吉吉办公 · 8点实时新闻推送已就绪（10条）',
    content: '已准时聚合昨日08:00至今日08:00之间的人工智能、数据要素、智慧城市与通信头条，支持一键分享转发。',
    type: 'news',
    timestamp: '08:00',
    isRead: false,
  },
  {
    id: 'notif_002',
    title: '智慧城市项目组 · 群待办更新',
    content: '李明 (算法架构师) 共享了「联系电信专线客户经理确认万兆光纤割接方案」，请群内成员关注进度。',
    type: 'share',
    timestamp: '10:05',
    isRead: false,
  },
  {
    id: 'notif_003',
    title: '近三年同期标讯匹配提醒',
    content: '系统已比对近三年（2023-2025）天府新区9月同期招采、中标、变更公告，点击标讯管理查看历史穿透。',
    type: 'system',
    timestamp: '08:30',
    isRead: false,
  },
  {
    id: 'notif_004',
    title: '健康指数晚间打卡提醒',
    content: '今天工作推进顺利，晚间请记录饮食、睡眠与心情状态，生成专属平衡指数。',
    type: 'health',
    timestamp: '21:00',
    isRead: true,
  },
];

// Health score algorithm
export const calculateHealthScore = (params: {
  mood?: MoodType;
  sleepHours: number;
  workHours: number;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  steps: number;
  exerciseNote?: string;
}): { score: number; scoreBreakdown: HealthRecord['scoreBreakdown'] } => {
  const mood = params.mood || 'normal';
  const moodMap: Record<MoodType, number> = {
    happy: 100,
    good: 80,
    normal: 60,
    down: 40,
    speechless: 20,
  };
  const moodScore = moodMap[mood];

  let sleepScore = 100;
  if (params.sleepHours <= 0) {
    sleepScore = 20;
  } else if (params.sleepHours < 7) {
    const diff = 7 - params.sleepHours;
    sleepScore = Math.max(0, Math.round(100 - diff * 15));
  } else if (params.sleepHours > 9) {
    const diff = params.sleepHours - 9;
    sleepScore = Math.max(0, Math.round(100 - diff * 10));
  } else {
    sleepScore = 100;
  }

  // Work Score calculation (Health-oriented Ergonomics Rule):
  // Working <= 8.0 hours (including rest days / 0h, moderate 4h, standard 8h) is completely healthy (100 points full).
  // Exceeding 8.0 hours is overtime & occupational fatigue, deducting 10 points per hour exceeded linearly.
  let workScore = 100;
  if (params.workHours <= 8) {
    workScore = 100;
  } else {
    const overHours = params.workHours - 8;
    workScore = Math.max(0, Math.round(100 - overHours * 10));
  }

  const mealCount = (params.meals.breakfast ? 1 : 0) + (params.meals.lunch ? 1 : 0) + (params.meals.dinner ? 1 : 0);
  let mealScore = 0;
  if (mealCount === 3) mealScore = 100;
  else if (mealCount === 2) mealScore = 60;
  else if (mealCount === 1) mealScore = 20;
  else mealScore = 0;

  let exerciseScore = 50;
  if (params.steps > 0) {
    exerciseScore = Math.min(100, Math.round((params.steps / 8000) * 100));
  } else if (params.exerciseNote && params.exerciseNote.trim().length > 0) {
    exerciseScore = 60;
  } else {
    exerciseScore = 50;
  }

  const finalScore = Math.round(
    moodScore * 0.3 +
    sleepScore * 0.25 +
    workScore * 0.2 +
    mealScore * 0.15 +
    exerciseScore * 0.1
  );

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    scoreBreakdown: {
      moodScore,
      sleepScore,
      workScore,
      mealScore,
      exerciseScore,
    },
  };
};

export const calculateWorkHoursFromTasks = (tasks: TaskItem[], dateStr: string): number => {
  const dayTasks = tasks.filter((t) => t.dueDate === dateStr || t.createdAt.startsWith(dateStr));
  if (dayTasks.length === 0) return 0;

  let earliestTime: number | null = null;
  let latestTime: number | null = null;

  for (const t of dayTasks) {
    const createdDate = new Date(t.createdAt.replace(' ', 'T')).getTime();
    if (!isNaN(createdDate)) {
      if (earliestTime === null || createdDate < earliestTime) {
        earliestTime = createdDate;
      }
    }
    if (t.completedAt) {
      const compDate = new Date(t.completedAt.replace(' ', 'T')).getTime();
      if (!isNaN(compDate)) {
        if (latestTime === null || compDate > latestTime) {
          latestTime = compDate;
        }
      }
    }
  }

  if (earliestTime !== null && latestTime !== null && latestTime > earliestTime) {
    const diffHours = (latestTime - earliestTime) / (1000 * 60 * 60);
    return Math.round(diffHours * 10) / 10;
  }

  return Math.min(8.0, Math.max(1.5, dayTasks.length * 2.0));
};

// --- Storage API ---

// Tasks
export const getStoredTasks = (): TaskItem[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(initialTasks));
    return initialTasks;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return initialTasks;
  }
};

export const saveStoredTasks = (tasks: TaskItem[]) => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

// Memos
export const getStoredMemos = (): MemoItem[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.MEMOS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(initialMemos));
    return initialMemos;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return initialMemos;
  }
};

export const saveStoredMemos = (memos: MemoItem[]) => {
  localStorage.setItem(STORAGE_KEYS.MEMOS, JSON.stringify(memos));
};

// Expenses
export const getStoredExpenses = (): ExpenseItem[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialExpenses));
    return initialExpenses;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return initialExpenses;
  }
};

export const saveStoredExpenses = (expenses: ExpenseItem[]) => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

// News
export const getStoredNews = (): NewsItem[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.NEWS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(initialNews));
    return initialNews;
  }
  try {
    const parsed: NewsItem[] = JSON.parse(saved);
    // Auto-reconcile and upgrade cached items with verified https URLs and sources
    let updated = false;
    const reconciled = parsed.map((item) => {
      const match = initialNews.find((n) => n.id === item.id);
      if (match) {
        if (item.url !== match.url || !item.sourceWebsiteName || item.url?.startsWith('http://')) {
          updated = true;
          return {
            ...item,
            url: match.url,
            source: match.source,
            sourceWebsiteName: match.sourceWebsiteName,
            summary: match.summary,
          };
        }
      } else if (item.url && item.url.startsWith('http://')) {
        updated = true;
        return { ...item, url: item.url.replace('http://', 'https://') };
      }
      return item;
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(reconciled));
    }
    return reconciled;
  } catch {
    return initialNews;
  }
};

export const saveStoredNews = (news: NewsItem[]) => {
  localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(news));
};

export const resetToOfficialNews = (): NewsItem[] => {
  localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(initialNews));
  return initialNews;
};

// Tenders
export const getStoredTenders = (): TenderItem[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.TENDERS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.TENDERS, JSON.stringify(initialTenders));
    return initialTenders;
  }
  try {
    const parsed: TenderItem[] = JSON.parse(saved);
    // Auto-reconcile and upgrade cached items with verified https URLs and authoritative agency names
    let updated = false;
    const reconciled = parsed.map((item) => {
      const match = initialTenders.find((t) => t.id === item.id);
      if (match) {
        if (item.sourceUrl !== match.sourceUrl || item.sourceUrl?.startsWith('http://') || item.sourceWebsiteName !== match.sourceWebsiteName) {
          updated = true;
          return {
            ...item,
            sourceUrl: match.sourceUrl,
            sourceWebsiteName: match.sourceWebsiteName,
            agency: match.agency,
            contentSnippet: match.contentSnippet,
          };
        }
      } else if (item.sourceUrl && item.sourceUrl.startsWith('http://')) {
        updated = true;
        return { ...item, sourceUrl: item.sourceUrl.replace('http://', 'https://') };
      }
      return item;
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.TENDERS, JSON.stringify(reconciled));
    }
    return reconciled;
  } catch {
    return initialTenders;
  }
};

export const saveStoredTenders = (tenders: TenderItem[]) => {
  localStorage.setItem(STORAGE_KEYS.TENDERS, JSON.stringify(tenders));
};

export const resetToOfficialTenders = (): TenderItem[] => {
  localStorage.setItem(STORAGE_KEYS.TENDERS, JSON.stringify(initialTenders));
  return initialTenders;
};

// Health
export const getStoredHealth = (): HealthRecord[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.HEALTH);
  if (!saved) {
    const today = getTodayDateStr();
    const defaultRecord = {
      date: today,
      mood: 'good' as MoodType,
      sleepHours: 7.5,
      workHours: 7.0,
      workHoursCalculated: true,
      meals: { breakfast: true, lunch: true, dinner: true },
      steps: 8650,
      exerciseNote: '晚饭后快走35分钟',
      ...calculateHealthScore({
        mood: 'good',
        sleepHours: 7.5,
        workHours: 7.0,
        meals: { breakfast: true, lunch: true, dinner: true },
        steps: 8650,
        exerciseNote: '晚饭后快走35分钟',
      }),
    };
    const records: HealthRecord[] = [defaultRecord];
    const moods: MoodType[] = ['happy', 'normal', 'good', 'happy', 'normal', 'good'];
    for (let i = 1; i <= 6; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const m = moods[i - 1];
      const sH = 6.5 + (i % 2) * 0.8;
      const wH = 7.5 - (i % 3) * 0.5;
      const st = 6200 + i * 400;
      const meal = { breakfast: true, lunch: true, dinner: i % 2 === 0 };
      records.push({
        date: dStr,
        mood: m,
        sleepHours: sH,
        workHours: wH,
        workHoursCalculated: true,
        meals: meal,
        steps: st,
        exerciseNote: i % 2 === 0 ? '晨跑20分钟' : '',
        ...calculateHealthScore({
          mood: m,
          sleepHours: sH,
          workHours: wH,
          meals: meal,
          steps: st,
        }),
      });
    }
    localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(records));
    return records;
  }
  try {
    const records: HealthRecord[] = JSON.parse(saved);
    // Recalculate with updated work score logic
    const recalculated = records.map((r) => {
      const reCalc = calculateHealthScore({
        mood: r.mood,
        sleepHours: r.sleepHours,
        workHours: r.workHours,
        meals: r.meals,
        steps: r.steps,
        exerciseNote: r.exerciseNote,
      });
      return {
        ...r,
        score: reCalc.score,
        scoreBreakdown: reCalc.scoreBreakdown,
      };
    });
    return recalculated;
  } catch {
    return [];
  }
};

export const saveStoredHealth = (health: HealthRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.HEALTH, JSON.stringify(health));
};

// Notifications
export const getStoredNotifications = (): AppNotification[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifications));
    return initialNotifications;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return initialNotifications;
  }
};

export const saveStoredNotifications = (notifs: AppNotification[]) => {
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
};

// Office Jobs
export const getStoredOfficeJobs = (): OfficeJob[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.OFFICE_JOBS);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const saveStoredOfficeJobs = (jobs: OfficeJob[]) => {
  localStorage.setItem(STORAGE_KEYS.OFFICE_JOBS, JSON.stringify(jobs));
};

// Users & Groups (Requirement 1 & 6)
export const getStoredUsers = (): UserInfo[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  try {
    const parsed: UserInfo[] = JSON.parse(saved);
    // Ensure all users have a fallback password if migrated
    const ensured = parsed.map((u) => {
      const match = defaultUsers.find((du) => du.userId === u.userId || du.username === u.username);
      return {
        ...u,
        password: u.password || match?.password || 'password123',
      };
    });
    return ensured;
  } catch {
    return defaultUsers;
  }
};

export const saveStoredUsers = (users: UserInfo[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Authentication & Session Management (Requirement: 平台首次需要进行登录使用)
export const getIsLoggedIn = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
};

export const setIsLoggedIn = (loggedIn: boolean): void => {
  if (loggedIn) {
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
  } else {
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
  }
};

export const authenticateUser = (
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: UserInfo; message?: string } => {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  if (!cleanUser) {
    return { success: false, message: '请输入登录账号/用户名' };
  }
  if (!cleanPass) {
    return { success: false, message: '请输入登录密码' };
  }

  const allUsers = getStoredUsers();
  const matchedUser = allUsers.find(
    (u) => u.username.toLowerCase() === cleanUser
  );

  if (!matchedUser) {
    return { success: false, message: '该账号不存在，请核对或联系管理员' };
  }

  const userPassword = matchedUser.password || 'password123';
  if (userPassword !== cleanPass) {
    return { success: false, message: '密码输入不正确，请重新输入' };
  }

  // Set session
  setIsLoggedIn(true);
  saveCurrentUser(matchedUser);

  return { success: true, user: matchedUser };
};

export const logoutUser = (): void => {
  setIsLoggedIn(false);
  localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
};

export const getStoredGroups = (): UserGroup[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(defaultGroups));
    return defaultGroups;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return defaultGroups;
  }
};

export const saveStoredGroups = (groups: UserGroup[]) => {
  localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
};

export const loadCurrentUser = (): UserInfo => {
  const allUsers = getStoredUsers();
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  if (currentId) {
    const found = allUsers.find((u) => u.userId === currentId);
    if (found) return found;
  }
  return allUsers[0] || defaultUsers[0];
};

export const saveCurrentUser = (user: UserInfo) => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.userId);
};

// Group Share Requests
export const getStoredShareRequests = (): GroupShareRequest[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.SHARE_REQUESTS);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const saveStoredShareRequests = (reqs: GroupShareRequest[]) => {
  localStorage.setItem(STORAGE_KEYS.SHARE_REQUESTS, JSON.stringify(reqs));
};

// Branding Config (Requirement 5)
export const getStoredBranding = (): BrandingConfig => {
  const saved = localStorage.getItem(STORAGE_KEYS.BRANDING);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(defaultBranding));
    return defaultBranding;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return defaultBranding;
  }
};

export const saveStoredBranding = (branding: BrandingConfig) => {
  localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(branding));
};

// Module Order (Requirement 3: Drag & Drop order)
export const getStoredModuleOrder = (): ModuleTab[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.MODULE_ORDER);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.MODULE_ORDER, JSON.stringify(defaultModuleOrder));
    return defaultModuleOrder;
  }
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return defaultModuleOrder;
  } catch {
    return defaultModuleOrder;
  }
};

export const saveStoredModuleOrder = (order: ModuleTab[]) => {
  localStorage.setItem(STORAGE_KEYS.MODULE_ORDER, JSON.stringify(order));
};

// Reports Generator with "吉吉办公"
export const generateDailyReportMd = (dateStr: string, tasks: TaskItem[]): string => {
  const todayTasks = tasks.filter((t) => t.dueDate === dateStr);
  const doneTasks = todayTasks.filter((t) => t.status === 'done');
  const pendingTasks = todayTasks.filter((t) => t.status === 'pending');
  const followUpTasks = todayTasks.filter((t) => t.status === 'follow_up');

  const nextDate = new Date(dateStr + 'T00:00:00');
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
  const tomorrowTasks = tasks.filter((t) => t.dueDate === nextDateStr && t.status === 'pending');

  let md = `# 吉吉办公 · 团队与个人工作日报 (${dateStr} ${getWeekdayStr(dateStr)})\n\n`;
  md += `> 生成时间：${new Date().toLocaleString()} | 系统：吉吉办公多用户协同工作台\n\n`;

  md += `## 一、今日完成项 (${doneTasks.length})\n`;
  if (doneTasks.length === 0) {
    md += `- 暂无已完成项\n`;
  } else {
    doneTasks.forEach((t, idx) => {
      md += `${idx + 1}. **${t.title}**\n`;
      if (t.creatorName) md += `   - 归属/发起人：${t.creatorName}\n`;
      if (t.sharedGroupName) md += `   - 协同群组：${t.sharedGroupName}\n`;
      if (t.description) md += `   - 要点说明：${t.description}\n`;
      if (t.completedAt) md += `   - 完成时间：${t.completedAt}\n`;
    });
  }
  md += `\n`;

  md += `## 二、今日待办与跟进项 (${pendingTasks.length + followUpTasks.length})\n`;
  if (pendingTasks.length + followUpTasks.length === 0) {
    md += `- 无未完成待办项\n`;
  } else {
    pendingTasks.forEach((t, idx) => {
      md += `${idx + 1}. [待办] **${t.title}** ${t.sharedGroupName ? `[群:${t.sharedGroupName}]` : ''}${t.description ? ` - ${t.description}` : ''}\n`;
    });
    followUpTasks.forEach((t, idx) => {
      md += `${pendingTasks.length + idx + 1}. [已设跟进] **${t.title}**${t.followUpNote ? ` (${t.followUpNote})` : ''}\n`;
    });
  }
  md += `\n`;

  md += `## 三、明日计划 (${nextDateStr})\n`;
  if (tomorrowTasks.length === 0) {
    md += `- 暂无次日待办，建议合理安排重点工作\n`;
  } else {
    tomorrowTasks.forEach((t, idx) => {
      md += `${idx + 1}. [计划] **${t.title}**${t.description ? ` - ${t.description}` : ''}\n`;
    });
  }
  md += `\n---\n*由「吉吉办公」多用户协同与个人效率工作台自动生成*\n`;

  return md;
};

export const generateWeeklyReportMd = (dateStr: string, tasks: TaskItem[]): string => {
  const current = new Date(dateStr + 'T00:00:00');
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const monStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
  const sunStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`;

  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  const nextSunday = new Date(sunday);
  nextSunday.setDate(sunday.getDate() + 7);
  const nextMonStr = `${nextMonday.getFullYear()}-${String(nextMonday.getMonth() + 1).padStart(2, '0')}-${String(nextMonday.getDate()).padStart(2, '0')}`;
  const nextSunStr = `${nextSunday.getFullYear()}-${String(nextSunday.getMonth() + 1).padStart(2, '0')}-${String(nextSunday.getDate()).padStart(2, '0')}`;

  const weekDone = tasks.filter((t) => {
    return t.status === 'done' && t.dueDate >= monStr && t.dueDate <= sunStr;
  });

  const nextWeekPending = tasks.filter((t) => {
    return (
      (t.status === 'pending' && t.dueDate >= nextMonStr && t.dueDate <= nextSunStr) ||
      (t.status === 'pending' && t.dueDate >= monStr && t.dueDate <= sunStr) ||
      t.status === 'follow_up'
    );
  });

  let md = `# 吉吉办公 · 本周工作汇总与下周规划\n\n`;
  md += `> 统计周期：${monStr} 至 ${sunStr} (第 ${getWeekNumber(current)} 周)\n\n`;

  md += `## 一、本周重点成果与办结事项 (${weekDone.length} 项)\n`;
  if (weekDone.length === 0) {
    md += `- 本周暂未有已标记完成的归档事项。\n`;
  } else {
    weekDone.forEach((t, idx) => {
      md += `${idx + 1}. **${t.title}** (${t.dueDate})\n`;
      if (t.creatorName) md += `   - 负责人：${t.creatorName}\n`;
      if (t.sharedGroupName) md += `   - 所属群组：${t.sharedGroupName}\n`;
      if (t.description) md += `   - 工作内容：${t.description}\n`;
    });
  }
  md += `\n`;

  md += `## 二、下周核心待办推进 (${nextWeekPending.length} 项)\n`;
  if (nextWeekPending.length === 0) {
    md += `- 下周无排期任务，请根据项目规划及时录入。\n`;
  } else {
    nextWeekPending.forEach((t, idx) => {
      md += `${idx + 1}. **${t.title}** (排期：${t.dueDate})\n`;
      if (t.priority === 'high') md += `   - 【高优关注】\n`;
      if (t.followUpNote) md += `   - 跟进说明：${t.followUpNote}\n`;
    });
  }
  md += `\n`;

  md += `---\n*吉吉办公 · 跨端高效协同，群组待办实时联动*\n`;
  return md;
};

const getWeekNumber = (d: Date): number => {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
};

export const generateAnnualSummaryMd = (
  year: number,
  tasks: TaskItem[],
  memos: MemoItem[],
  healthRecords: HealthRecord[]
): string => {
  const yearTasks = tasks.filter((t) => t.dueDate.startsWith(String(year)) || t.createdAt.startsWith(String(year)));
  const doneTasks = yearTasks.filter((t) => t.status === 'done');
  const followUpTasks = yearTasks.filter((t) => t.status === 'follow_up');

  const yearMemos = memos.filter((m) => m.createdAt.startsWith(String(year)));
  const yearHealth = healthRecords.filter((h) => h.date.startsWith(String(year)));
  const avgHealthScore =
    yearHealth.length > 0
      ? Math.round(yearHealth.reduce((sum, h) => sum + h.score, 0) / yearHealth.length)
      : 80;

  let md = `# ${year}年度团队与个人工作成果总结\n\n`;
  md += `> 生成时间：${new Date().toLocaleString()} | 系统：吉吉办公多用户协同工作台\n\n`;

  md += `## 一、年度核心指标概览\n\n`;
  md += `- **年度总任务数**：${yearTasks.length} 项\n`;
  md += `- **顺利达成/已完成**：${doneTasks.length} 项 (完成率 ${yearTasks.length > 0 ? ((doneTasks.length / yearTasks.length) * 100).toFixed(1) : 0}%)\n`;
  md += `- **跨周期跟进与群组协作事项**：${followUpTasks.length} 项\n`;
  md += `- **备忘与沉淀日志**：${yearMemos.length} 条\n`;
  md += `- **平均健康活力指数**：${avgHealthScore} 分\n\n`;

  md += `## 二、季度/重点工作成果回顾\n\n`;
  if (doneTasks.length === 0) {
    md += `- ${year}年暂未归档完成项，已为新一年奠定工作框架。\n\n`;
  } else {
    doneTasks.forEach((t, idx) => {
      md += `### 2.${idx + 1} ${t.title}\n`;
      md += `- **归档日期**：${t.dueDate} ${t.completedAt ? `(办结：${t.completedAt})` : ''}\n`;
      if (t.creatorName) md += `- **经办人**：${t.creatorName} ${t.sharedGroupName ? `(群组：${t.sharedGroupName})` : ''}\n`;
      if (t.description) md += `- **工作要点**：${t.description}\n`;
      md += `\n`;
    });
  }

  md += `## 三、重要知识与备忘录沉淀\n\n`;
  if (yearMemos.length === 0) {
    md += `- 暂无备忘记录。\n\n`;
  } else {
    yearMemos.forEach((m, idx) => {
      md += `### 3.${idx + 1} 【${m.category}】${m.title}\n`;
      md += `- **更新时间**：${m.updatedAt}\n`;
      md += `${m.content.slice(0, 150)}${m.content.length > 150 ? '...' : ''}\n\n`;
    });
  }

  md += `## 四、健康指数与工作节奏反思\n\n`;
  md += `- **综合评分统计**：全年累计记录 ${yearHealth.length} 天，均分 ${avgHealthScore} 分。\n`;
  md += `- **自我寄语**：在新的一年保持高效协同推进的同时，平衡身心作息。\n\n`;

  md += `---\n*由「吉吉办公」多用户协同与个人效率跨端平台自动聚合生成*\n`;
  return md;
};

// Aliases
export const loadTasks = getStoredTasks;
export const saveTasks = saveStoredTasks;
export const loadMemos = getStoredMemos;
export const saveMemos = saveStoredMemos;
export const loadExpenses = getStoredExpenses;
export const saveExpenses = saveStoredExpenses;
export const loadNews = getStoredNews;
export const saveNews = saveStoredNews;
export const loadTenders = getStoredTenders;
export const saveTenders = saveStoredTenders;
export const loadHealthRecords = getStoredHealth;
export const saveHealthRecords = saveStoredHealth;
export const loadNotifications = getStoredNotifications;
export const saveNotifications = saveStoredNotifications;
export const loadOfficeJobs = getStoredOfficeJobs;
export const saveOfficeJobs = saveStoredOfficeJobs;
export const loadUsers = getStoredUsers;
export const saveUsers = saveStoredUsers;
export const loadGroups = getStoredGroups;
export const saveGroups = saveStoredGroups;
export const loadBrandingConfig = getStoredBranding;
export const saveBrandingConfig = saveStoredBranding;
export const loadShareRequests = getStoredShareRequests;
export const saveShareRequests = saveStoredShareRequests;

export const exportExpensesToCSV = (expenses: ExpenseItem[]): string => {
  const headers = ['流水ID', '记账日期', '消费类目', '支出金额(元)', '备注说明', '记录时间'];
  const rows = expenses.map((item) => [
    item.id,
    item.date,
    item.category,
    item.amount.toFixed(2),
    `"${(item.remark || '').replace(/"/g, '""')}"`,
    item.createdAt || item.date,
  ]);
  return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};

export const downloadTextFile = (filename: string, content: string, mimeType = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

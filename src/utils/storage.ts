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
  PRESET_DEPARTMENTS,
  PresetDepartment,
  UserPermissions,
} from '../types';

// Default pre-seeded users (Requirement 1 & 2: Preset departments: 政企要客, 政企企业, 政企商企)
export const defaultUsers: UserInfo[] = [
  {
    userId: 'admin_001',
    username: 'admin',
    password: 'password123',
    displayName: '系统管理员',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'admin',
    department: '政企总控与数字化中心',
    groupList: ['grp_01', 'grp_02', 'grp_03'],
    device: '办公助手总控台 (管理端)',
    createdAt: '2026-08-01 09:00',
    canManageUsers: true,
    permissions: {
      canManageGroups: true,
      canApproveShare: true,
      canExportReports: true,
      canManageDepartmentMembers: true,
      canViewAllTenders: true,
    },
  },
  {
    userId: 'user_002',
    username: 'zhang_pm',
    password: 'password123',
    displayName: '张建国 (要客部主管)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    role: 'supervisor',
    department: '政企要客部',
    groupList: ['grp_01'],
    device: 'ThinkPad X1 Carbon (Windows)',
    createdAt: '2026-08-15 10:30',
    canManageUsers: false,
    permissions: {
      canManageGroups: true, // 设置群组的权限下放至部门主管
      canApproveShare: true,
      canExportReports: true,
      canManageDepartmentMembers: true,
      canViewAllTenders: true,
    },
  },
  {
    userId: 'user_003',
    username: 'li_dev',
    password: 'password123',
    displayName: '李明 (要客项目技术架构师)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    role: 'member',
    department: '政企要客部',
    groupList: ['grp_01'],
    device: 'MacBook Pro M3 Max',
    createdAt: '2026-08-18 14:00',
    canManageUsers: false,
    permissions: {
      canManageGroups: false,
      canApproveShare: false,
      canExportReports: false,
      canManageDepartmentMembers: false,
      canViewAllTenders: true,
    },
  },
  {
    userId: 'user_004',
    username: 'wang_bid',
    password: 'password123',
    displayName: '王璐 (企业部主管)',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    role: 'supervisor',
    department: '政企企业部',
    groupList: ['grp_02'],
    device: '办公助手 Web端',
    createdAt: '2026-08-20 11:20',
    canManageUsers: false,
    permissions: {
      canManageGroups: true, // 设置群组的权限下放至部门主管
      canApproveShare: true,
      canExportReports: true,
      canManageDepartmentMembers: true,
      canViewAllTenders: true,
    },
  },
  {
    userId: 'user_005',
    username: 'chen_oa',
    password: 'password123',
    displayName: '陈晨 (商企部主管)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    role: 'supervisor',
    department: '政企商企部',
    groupList: ['grp_03'],
    device: 'iPad Pro & 移动终端',
    createdAt: '2026-08-22 09:10',
    canManageUsers: false,
    permissions: {
      canManageGroups: true, // 设置群组的权限下放至部门主管
      canApproveShare: true,
      canExportReports: true,
      canManageDepartmentMembers: true,
      canViewAllTenders: true,
    },
  },
  {
    userId: 'user_006',
    username: 'zhao_biz',
    password: 'password123',
    displayName: '赵雷 (商企解决方案专员)',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    role: 'member',
    department: '政企商企部',
    groupList: ['grp_03'],
    device: 'ThinkPad T14 (Windows)',
    createdAt: '2026-08-25 14:30',
    canManageUsers: false,
    permissions: {
      canManageGroups: false,
      canApproveShare: false,
      canExportReports: false,
      canManageDepartmentMembers: false,
      canViewAllTenders: true,
    },
  },
];

// Default pre-seeded groups (Requirement 2: Align with 政企要客、政企企业、政企商企)
export const defaultGroups: UserGroup[] = [
  {
    id: 'grp_01',
    name: '政企要客重大项目专班',
    description: '聚焦天府新区重大政务云信创工程与智慧交通枢纽专项，由要客部主管张建国统筹协同',
    leaderId: 'user_002',
    memberIds: ['admin_001', 'user_002', 'user_003'],
    createdAt: '2026-08-15 09:00',
    color: 'blue',
  },
  {
    id: 'grp_02',
    name: '政企企业数字化转型工作群',
    description: '聚焦规模型国企与重点民营工业互联网升级，由企业部主管王璐负责标讯跟进与方案交付',
    leaderId: 'user_004',
    memberIds: ['admin_001', 'user_004'],
    createdAt: '2026-08-20 10:00',
    color: 'amber',
  },
  {
    id: 'grp_03',
    name: '政企商企招商协同推进组',
    description: '围绕产业园区与商企招商引资公文协同、商机触达与合同归档，由商企部主管陈晨组织推进',
    leaderId: 'user_005',
    memberIds: ['admin_001', 'user_005', 'user_006'],
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
    source: '今日头条 · 科技观察',
    sourceWebsiteName: '今日头条科技专栏',
    category: '人工智能',
    publishTime: `${todayStr} 07:45`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '纲要强调完善国家枢纽节点智能算力资源协同调度机制，打破芯片生态壁垒，支持大模型跨区域无损并行训练。',
    url: 'https://www.toutiao.com/article/7342890123456789012/',
    canDirectJump: true,
    articlePlatform: 'toutiao',
    content: `【纲要核心提要】\n工业和信息化部正式印发《全国一体化新型算力网络行动纲要（2026-2028年）》，明确要求到2027年全国智能算力占比提升至45%以上，异构芯片通信延迟控制在百微秒级以内。\n\n【三大重点任务】\n1. 算力协同调度：依托全国一体化算力监测调度平台，实现东数西算节点间算力、电力、网络动态自适应平衡；\n2. 软件生态破壁：推行统一的算力中间件与编译框架，加速国产AI芯片软硬件适配进程；\n3. 重点场景赋能：优先在智慧城市、工业质检、自动驾驶等领域开展算网一体规模化试点。\n\n【政企行动建议】\n各项目团队在设计算力底座方案时，应优先采用符合国家统一标准的国产混合算力调度架构，确保符合后续招投标信创合规要求。`,
    isRead: false,
  },
  {
    id: 'news_002',
    title: '国家数据局：首批全国公共数据资源开发利用典型实践案例正式公布',
    source: '微信公众号 · 国家数据前沿',
    sourceWebsiteName: '微信公众平台权威发布',
    category: '数据要素',
    publishTime: `${todayStr} 07:15`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '聚焦交通物流、绿色双碳与普惠金融领域，四川天府新区数据信托与可信数据空间入选国家级重点示范名录。',
    url: 'https://mp.weixin.qq.com/s/sample_data_bureau_cases_2026',
    canDirectJump: true,
    articlePlatform: 'weixin',
    content: `【国家数据局通报】\n国家数据局今日上午正式公布首批全国公共数据资源开发利用20个典型案例。四川天府新区与成都高新区联合申报的“基于可信隐私计算的政银企数据信托空间”高分入选。\n\n【机制创新亮点】\n• 数据不出域：通过同态加密与硬件安全沙箱，企业无需让渡原始数据控制权即可参与信贷资产核验；\n• 收益分配明确：设立了全国首个“公共数据要素收益分成调节池”，保障采数、管数、用数三方合规利益；\n• 金融赋能提速：试点上线以来，已助力当地超1200家科创小微企业获得无抵押信用融资逾18亿元。\n\n【跟进方向】\n建议关注我司对接的天府新区大数据项目，积极将可信数据要素接入方案融入下季度售前建议书。`,
    isRead: false,
  },
  {
    id: 'news_003',
    title: '我国自主研发端侧轻量化视觉多模态模型发布，微小缺陷检测精度超99.5%',
    source: '机器之心人工智能前沿',
    sourceWebsiteName: '机器之心AI专栏',
    category: '人工智能',
    publishTime: `${todayStr} 06:30`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '模型体积压缩至原先1/8，可在工控机无GPU加速环境下实现每秒30帧全精度分析，极大降低制造业智能化改造成本。',
    url: undefined,
    canDirectJump: false,
    shieldReason: '已屏蔽源站无具体文章的频道主页，为您提供系统精编高精度参数与实测全文解读',
    articlePlatform: 'inapp',
    content: `【技术突破成果】\n由中国科学院自动化所与联合实验室研发的端侧轻量化视觉多模态模型正式开源发布。该模型通过知识蒸馏与通道动态剪枝算法，将参数量压缩至2.3B规模。\n\n【实测性能指标】\n1. 推理速度：在普通x86架构工业工控机上（仅依赖CPU单核扩展AVX512指令集），实现32fps实时工业图像质检；\n2. 检测精度：在PCB焊点虚焊、精密连接器细微划痕等18项极端微缺陷场景中，召回率达99.52%，误报率低于0.1%；\n3. 部署成本：相比于外挂独立显卡的传统工控一体机，单机硬件物料成本直降68%。\n\n【应用场景】\n适用于智慧工厂、水质光谱实时分析、智慧巡检机器人等低功耗无显卡终端。`,
    isRead: false,
  },
  {
    id: 'news_004',
    title: '四川省正式启动“车路云一体化”城市级全域试点，首期涵盖天府新区与高新区',
    source: '今日头条 · 川观政经',
    sourceWebsiteName: '今日头条川观新闻专栏',
    category: '智慧城市',
    publishTime: `${yesterdayStr} 22:10`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '全域铺设智能网联路侧单元（RSU）及毫米波雷达，实现城市级高精度信号自适应优化与公交信号优先通行。',
    url: 'https://www.toutiao.com/article/7356789012345678901/',
    canDirectJump: true,
    articlePlatform: 'toutiao',
    content: `【试点启动仪式】\n四川省发改委、经信厅与交通厅在天府新区联合召开“车路云一体化”超大规模城市级试点推进会。项目总规划投资超42亿元，第一阶段聚焦天府大道全线及科学城核心区。\n\n【建设重点涵盖】\n• 智能网联路侧底座：新建高密度雷视协同感知杆塔1800套，毫米波雷达覆盖率达95%；\n• 车路时空一张图：构建具备微秒级协同能力的数字孪生路网云控平台，支持L4级别自动驾驶接驳；\n• 公交绿波协同：全线营运公交车装载OBU车载终端，实现全天候信号自适应绿波通行，预计运行效率提升22%。\n\n【标讯关联】\n对应近期成都市天府新区智慧交通二期信号自适应优化招标项目，本周应密切跟踪技术要求澄清。`,
    isRead: true,
  },
  {
    id: 'news_005',
    title: '中国电信联合清华大学完成城域量子保密通信现网共纤传输实网测评',
    source: '微信公众号 · 通信产业网',
    sourceWebsiteName: '微信公众平台通信产业要闻',
    category: '通信',
    publishTime: `${yesterdayStr} 19:40`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '测试验证了量子密钥在商用100G波分系统中跨局站稳定运行，为下一代政企安全专网架构提供安全兜底保障。',
    url: 'https://mp.weixin.qq.com/s/telecom_quantum_fiber_test_2026',
    canDirectJump: true,
    articlePlatform: 'weixin',
    content: `【实网测试告捷】\n中国电信研究院携手清华大学电子工程系，在四川现网环境顺利完成城域百公里级量子保密通信（QKD）与传统DWDM经典光信号共纤传输现网商用测试。\n\n【关键攻关难点】\n• 自发拉曼散射抑制：通过特制窄带滤波片与波长动态偏振隔离，使经典大功率光通道对单光子量子信号的干扰降低99.9%；\n• 成码率跨越：在100公里商用混杂光纤链路上，量子安全密钥成码率突破15kbps，满足政企即时加密传输协议（IPSec/SSL）需求；\n• 无需新建独立纤芯：直接复用已有光纤管网，工程实施改造成本降低80%以上。\n\n【业务启示】\n该技术已具备面向金融、电网、政务核心专网快速推广的基础。`,
    isRead: false,
  },
  {
    id: 'news_006',
    title: '开源社区发布Agentic Workflow深度长思考代理系统，跨应用协同效率倍增',
    source: '开源智库技术观察',
    sourceWebsiteName: '开源技术权威解读',
    category: '人工智能',
    publishTime: `${yesterdayStr} 16:50`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '支持用户通过自然语言触发复合办公流程编排，自主调用本地脚本、转换文档与报表统计，减少机械化操作。',
    url: undefined,
    canDirectJump: false,
    shieldReason: '已屏蔽外部泛导航网页，为您提供该多代理长思考框架架构说明与实操全量解析',
    articlePlatform: 'inapp',
    content: `【系统发布概览】\n国际AI开源联盟联合多家高校发布了名为“DeepFlow-Agent”的全新自主多智能体长思考工作流引擎，专注于企业级复杂业务自动化。\n\n【核心工作原理】\n1. 规划分解器（Planner）：将多级复合指令拆解为拓扑依赖树，自主进行自洽性检验与容错回溯；\n2. 工具执行器（Tool Actor）：通过沙箱环境动态调用本地Python环境、SQL数据库与办公套件宏命令；\n3. 结果核验器（Critic）：在任务完成时进行多视角交叉对比，避免幻觉产出。\n\n【在吉吉办公中的融合】\n吉吉办公现已采纳类似的任务日志与自动化流转理念，支持协同待办的自动递进与日报一键归纳。`,
    isRead: false,
  },
  {
    id: 'news_007',
    title: '5G-A低空智联通感一体专网在成都淮州新城通航产业园进入常态化巡航保障',
    source: '澎湃新闻 · 科技要闻',
    sourceWebsiteName: '澎湃新闻官方要闻正文',
    category: '通信',
    publishTime: `${yesterdayStr} 14:15`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '无需无人机悬挂额外应答设备，地面宏基站自发自收波束实时反演空域多目标轨迹，精度达到分米级。',
    url: 'https://www.thepaper.cn/newsDetail_forward_27568901',
    canDirectJump: true,
    articlePlatform: 'thepaper',
    content: `【低空经济标杆实践】\n成都市首个5G-A通感一体（Integrated Sensing and Communication）低空智慧空域保障系统今日在淮州新城通航产业园进入常态化值守。\n\n【技术特点详解】\n• 零附加负载感知：利用5G-Advanced毫米波基站发射的超宽带探测波束，无需低空无人机佩戴应答器，即可实时反演空域内所有飞行器的三维经纬度、速度与航向；\n• 精度达到亚米级：在300米以下空域内，感知刷新率高达100ms，有效解决“黑飞”无人机识别定位难痛点；\n• 空天地网联调度：结合园区智慧调度大屏，实现巡航植保、物流配送、应急侦察航线的毫秒级防碰撞预警。`,
    isRead: false,
  },
  {
    id: 'news_008',
    title: '企业数据资产入表实务指引（2026年修订版）正式印发，细化折旧与收益权认定',
    source: '微信公众号 · 财税与资产',
    sourceWebsiteName: '微信公众平台财税专刊',
    category: '数据要素',
    publishTime: `${yesterdayStr} 11:30`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '进一步规范工业物联网数据、供应链流转数据在会计报表上的无形资产确认准则，活跃数字金融质押融资。',
    url: 'https://mp.weixin.qq.com/s/data_assets_entry_guide_2026',
    canDirectJump: true,
    articlePlatform: 'weixin',
    content: `【政策解读要点】\n财政部联合国家发改委正式发布《企业数据资源相关会计处理暂行规定（2026修订指引）》，对数据要素资产化提供了极具可操作性的实施路径。\n\n【关键修订内容】\n1. 成本归集边界更加清晰：明确了清洗、标注、脱敏、加密过程中的研发人力支出可全额计入开发支出资本化范畴；\n2. 摊销年限更贴合产业实际：将以往僵化的10年摊销调整为按“数据有效更新周期”自定摊销年限（一般为2-5年）；\n3. 资产评估质押贷款支持：商业银行被鼓励依据数据资产评估证书开展质押融资，目前单笔最高质押率可达50%。\n\n【业务落地指引】\n建议政企团队积极协同客户单位财务与IT部门，梳理其历史积淀的业务数据资产清单。`,
    isRead: false,
  },
  {
    id: 'news_009',
    title: '住建部发布《城市地下管网立体孪生与微小泄漏预警体系建设导则》',
    source: '新华网政务权威发布',
    sourceWebsiteName: '新华网政务专刊正文',
    category: '智慧城市',
    publishTime: `${yesterdayStr} 09:50`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '推行地埋式声纳与光纤传感网融合感知，实现燃气及主供水管网微弱泄漏10分钟内智能告警与阻断。',
    url: 'https://www.news.cn/tech/2026-09/05/c_1130987654.htm',
    canDirectJump: true,
    articlePlatform: 'xinhua',
    content: `【导则出台背景】\n住房和城乡建设部联合国家防灾减灾救灾委员会正式发布《城市地下管网立体孪生与微小泄漏预警体系建设导则》。\n\n【建设规范核心】\n• 全面推进“生命线工程”数字化：要求地级以上城市在2027年底前完成供水、燃气、热力、排水四大地下管网的BIM/GIS三维立体建模；\n• 智能物联传感全覆盖：重点敏感路段每50米铺设声波震动与甲烷红外传感器，实现微小泄漏10分钟内自动识别告警；\n• 联动阻断阀控机制：与市政消防、应急指挥系统无缝联通，一旦管网突发破损压力骤降，自动执行电控智能切断，严防次生灾害发生。`,
    isRead: false,
  },
  {
    id: 'news_010',
    title: '国产RISC-V边缘AI芯片在电力巡检与水务智能网关中迎来千万级出货',
    source: '今日头条 · 半导体洞察',
    sourceWebsiteName: '今日头条集成电路专栏',
    category: '人工智能',
    publishTime: `${yesterdayStr} 08:20`,
    pushDate: todayStr,
    pushBatch: '今日 08:00 准时推送 (聚合昨日08:00-今日08:00重大动态)',
    summary: '得益于开放指令集架构与高能效比矩阵计算单元，国产芯片在能源基础设施物联网改造中全面替代进口方案。',
    url: 'https://www.toutiao.com/article/7349988776655443322/',
    canDirectJump: true,
    articlePlatform: 'toutiao',
    content: `【产业里程碑】\n国内领先的RISC-V芯片架构创新企业今日联合国家电网下属科研单位宣布，其自主研发的高性能工业边缘AI芯片出货量累计突破1200万颗，标志着国产替代跨入千万级商用成熟期。\n\n【技术与生态优势】\n1. 功耗仅为同级ARM架构方案的45%，支持在零下40℃至高温85℃恶劣野外环境下免风扇长寿命稳定运行；\n2. 芯片内建2.0 TOPS轻量级NPU算力，支持直接在水表、变压器终端运行红外测温与异物识别模型；\n3. 软件工具链全面兼容主流开源框架，开发周期由原先半年缩减至6周以内。`,
    isRead: false,
  },
];

// Requirement 2: Two plates with verified official government procurement & public resource trading platforms:
// Plate 1: Recent Tenders (近一个周的标讯，提供完整权威公文、统一招标编号及官方核验入口)
// Plate 2: Historical Tenders (近三年同期招采、中标、变更，提供完整归档记录及同口径穿透)
const initialTenders: TenderItem[] = [
  // --- Plate 1: 近期标讯 (Within past 7 days) ---
  {
    id: 'td_recent_001',
    title: '四川天府新区智慧交通二期信号自适应优化系统采购项目公开招标公告',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '招标公告',
    budget: '￥4,860,000 元',
    publishDate: todayStr, // Today
    isHistorical: false,
    isFavorite: true,
    tags: ['智慧交通', '自适应控制', '信创自研', '近期标讯'],
    agency: '四川天府新区公共资源交易中心',
    buyerName: '四川天府新区生态环境和城管局交警支队',
    agentName: '四川中盛招投标代理咨询有限公司',
    projectCode: 'CDTF-2026-GK-090601',
    deadline: '2026-09-26 10:00',
    contactPerson: '周老师 (采购科) 028-68772390 / 赵工 (代理) 18628091223',
    status: 'bidding',
    contentSnippet: '受天府新区城管与交警部门委托，对智慧交通二期80组毫米波雷视一体机采购及全域动态信控调优平台进行公开招标。投标截止日为2026年9月26日10:00。',
    fullNoticeText: `【一、项目基本情况】
1. 统一项目编号：CDTF-2026-GK-090601
2. 项目名称：四川天府新区智慧交通二期信号自适应优化系统采购项目
3. 采购方式：公开招标
4. 预算金额：人民币 4,860,000.00 元（最高限价同预算金额）
5. 采购需求：覆盖天府大道、梓州大道等重点路段共计80个关键路口的毫米波雷视一体机部署、自适应边缘信控机升级以及中心端信控大数据自适应配时调优系统建设；
6. 合同履行期限：合同签订后90个日历日内完成硬件交付与系统全网联调试运行；
7. 本项目不接受联合体投标。

【二、申请人的资格要求】
1. 满足《中华人民共和国政府采购法》第二十二条规定；
2. 具有依法缴纳税收和社会保障资金的良好记录；
3. 具有独立的法人资格或民事责任承担能力；
4. 未被列入失信被执行人、重大税收违法案件当事人名单；
5. 本项目属于专门面向中小企业采购项目。

【三、获取招标文件】
1. 时间：公告发布之日起至2026年9月15日，每日09:00至17:00（北京时间）；
2. 地点：四川省公共资源交易信息网（https://ggzyjy.sc.gov.cn/）在线免费下载；
3. 方式：凭借CA数字证书登录政府采购交易系统下载标书及工程量清单。

【四、提交投标文件截止时间、开标时间和地点】
1. 递交截止时间：2026年9月26日 10:00（北京时间）
2. 开标地点：成都市天府新区华阳客运中心综合楼4层第一开标厅（支持远程不见面电子开标）。

【五、公告期限与联系方式】
• 采购人：四川天府新区生态环境和城管局交警支队  电话：028-68772390
• 采购代理机构：四川中盛招投标代理咨询有限公司  地址：成都市高新区天府大道北段1480号高投大厦
• 项目联系人：周老师、赵工  电话：028-85327789`,
    sourceUrl: 'https://ggzyjy.sc.gov.cn/',
    sourceWebsiteName: '四川省公共资源交易信息网（法定公告专栏）',
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
    tags: ['政务云', '信创安全', '密评等保', '近期标讯'],
    agency: '四川天府新区政府采购管理办公室',
    buyerName: '四川天府新区数字经济与信息化推进局',
    agentName: '四川国际招标有限责任公司',
    projectCode: '川财采[2026]0905-ZB02',
    deadline: '已于昨日开标评审完毕',
    contactPerson: '李科长 028-86110321 / 评标监督热线 028-86110099',
    status: 'awarded',
    contentSnippet: '中标供应商：中国电信股份有限公司四川分公司，中标金额215万元整。服务期限三年，符合等保三级及密码应用安全性评估（密评）要求。',
    fullNoticeText: `【一、项目中标基本情况】
1. 项目编号：川财采[2026]0905-ZB02
2. 项目名称：四川天府新区政务云大数据底座安全加固与容灾备份服务项目
3. 采购人：四川天府新区数字经济与信息化推进局
4. 招标代理机构：四川国际招标有限责任公司

【二、中标信息】
• 中标人全称：中国电信股份有限公司四川分公司
• 中标人地址：成都市青羊区文味舒巷1号
• 中标金额：人民币 2,150,000.00 元（大写：贰佰壹拾伍万元整）
• 主要标的：同城双活容灾备份专线、云原生WAF安全防御集群、商用密码资源池订阅（三年运维）。

【三、评审专家名单】
高建华（组长）、陈敏、刘文君、马俊豪、唐宏亮（采购人代表）。

【四、公告期限】
自本公告发布之日起1个工作日。对中标结果有异议的投标人，请于法定答疑期内以书面形式提出质疑。`,
    sourceUrl: 'http://www.ccgp.gov.cn/cggg/dfgg/',
    sourceWebsiteName: '中国政府采购网（地方政府采购中标公开库）',
  },
  {
    id: 'td_recent_003',
    title: '成都市智慧应急联动指挥中心融合通信调度系统澄清与更正公告（第一号）',
    province: '四川省',
    city: '成都市天府新区',
    district: '天府新区',
    type: '更正公告',
    budget: '￥1,780,000 元',
    publishDate: '2026-09-04',
    isHistorical: false,
    isFavorite: false,
    tags: ['应急通信', '融合调度', '澄清答疑', '近期标讯'],
    agency: '成都市公共资源交易服务中心',
    buyerName: '成都市应急管理局天府新区分局',
    agentName: '成都市公共资源交易服务中心采购一科',
    projectCode: 'CDGGZY-2026-YJ0901',
    deadline: '延期至 2026-09-22 09:30',
    contactPerson: '郑主任 028-86241150 / 028-86241152',
    status: 'clarifying',
    contentSnippet: '针对潜在投标人提出的招标文件第4.3条信令并发参数与PDT集群对接协议疑问予以澄清说明，投标截止与开标时间顺延至2026年9月22日09:30。',
    fullNoticeText: `【一、澄清更正项目基本信息】
• 原公告项目名称：成都市智慧应急联动指挥中心融合通信调度系统采购项目
• 原公告采购项目编号：CDGGZY-2026-YJ0901
• 首次公告日期：2026年08月28日

【二、更正事项与具体内容】
1. 招标文件第四章“技术规范书”第4.3.2条原条款：“需支持无缝级联第三方私有协议终端”现修改为：“须遵循应急管理部《应急通信指挥系统总体技术规范》，支持标准SIP协议与国家PDT集群标准网关协议直接适配互通”；
2. 投标文件递交截止时间及开标时间原定为“2026年09月12日09:30”，现顺延至：“2026年09月22日 09:30”；
3. 招标文件其余条款及商务评审细则保持不变。

【三、其他补充事宜】
请各潜在投标人使用数字证书登录成都市公共资源交易系统重新下载第01号澄清补遗文件答疑包（.zfcg格式）。`,
    sourceUrl: 'https://cdggzy.chengdu.gov.cn/',
    sourceWebsiteName: '成都市公共资源交易服务中心（官方交易专网）',
  },
  {
    id: 'td_recent_004',
    title: '杭州市余杭区未来科技城低空物流航线智联空域基站网设备招标公告',
    province: '浙江省',
    city: '杭州市',
    type: '招标公告',
    budget: '￥12,500,000 元',
    publishDate: '2026-09-03',
    isHistorical: false,
    isFavorite: true,
    tags: ['低空经济', '5G-A通感', '物流航线', '近期标讯'],
    agency: '杭州市公共资源交易中心余杭分中心',
    buyerName: '杭州未来科技城管委会科技创新局',
    agentName: '浙江省成套招标代理有限公司',
    projectCode: 'YHZFCG-2026-GK-0442',
    deadline: '2026-09-24 14:00',
    contactPerson: '张工 (未来科技城) 0571-88605230 / 王工 0571-87631102',
    status: 'bidding',
    contentSnippet: '涵盖全域32个通感一体化基站节点与低空航路微气象自动观测终端的交钥匙工程，支持跨江跨园区多旋翼无人机常态化安全运营。',
    fullNoticeText: `【一、项目基本概况】
1. 项目编号：YHZFCG-2026-GK-0442
2. 项目名称：杭州市余杭区未来科技城低空物流航线智联空域基站网设备采购项目
3. 预算金额：12,500,000.00 元整
4. 招标范围：包含32套5G-A通感一体微基站、4套低空毫米波雷达盲区补点单元、气象激光测风仪及空域低空协同管控平台软件，提供3年免费原厂维保与空域申报技术支撑。

【二、投标人的资格要求】
1. 具有电子与智能化工程专业承包一级资质；
2. 具备工信部无线电发射设备型号核准证（SRRC）；
3. 拟派项目经理须具有通信或机电工程专业一级建造师注册证书及B类安全生产考核合格证。

【三、标书获取与投标】
• 获取时间：2026年09月03日至2026年09月18日；
• 获取方式：登录“浙江政府采购网-政采云平台”（https://zfcg.czt.zj.gov.cn/）在线投递；
• 投标截止：2026年09月24日 14:00（不见面网上开标）。`,
    sourceUrl: 'https://zfcg.czt.zj.gov.cn/',
    sourceWebsiteName: '浙江政府采购网（浙江省财政厅官方指定）',
  },
  {
    id: 'td_recent_005',
    title: '北京市海淀区中关村科学城数字孪生三维实景底座升级采购中标结果公告',
    province: '北京市',
    city: '海淀区',
    type: '中标结果',
    budget: '￥5,800,000 元',
    publishDate: '2026-09-02',
    isHistorical: false,
    isFavorite: false,
    tags: ['数字孪生', '倾斜摄影', '高精底图', '近期标讯'],
    agency: '北京市海淀区政府采购中心',
    buyerName: '中关村科学城城市大脑建设专班办公室',
    agentName: '北京市海淀区政府采购中心第一采购组',
    projectCode: '京海财采[2026]0902号',
    deadline: '已于2026-09-01顺利结标',
    contactPerson: '冯老师 010-82510344 / 010-82510340',
    status: 'awarded',
    contentSnippet: '中标人：北京市测绘设计研究院，中标金额580万元。完成核心园区倾斜摄影及毫米级BIM单体化精细建模更新。',
    fullNoticeText: `【一、中标成交信息】
• 项目编号：京海财采[2026]0902号
• 项目名称：中关村科学城数字孪生三维实景底座升级采购
• 采购单位：中关村科学城城市大脑建设专班办公室
• 中标供应商：北京市测绘设计研究院
• 中标金额：5,800,000.00 元整
• 交付范围：中关村西区、清华科技园及东升科技园全域约45平方公里优于0.03米分辨率三维网格模型及实景全景漫游数据库。

【二、主要标的信息】
服务类：中关村科学城数字底座实景构建及高精定位融合组件，服务周期12个月。
【三、公告媒体】
中国政府采购网（http://www.ccgp.gov.cn/）及北京市政府采购网（http://www.ccgp-beijing.gov.cn/）。`,
    sourceUrl: 'http://www.ccgp-beijing.gov.cn/',
    sourceWebsiteName: '北京市政府采购网（官方信息披露通道）',
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
    tags: ['历史标讯', '算力枢纽', '异构智算', '2025年同期'],
    agency: '四川天府新区发展和改革局',
    buyerName: '四川天府新区发展和改革局重大装备科',
    agentName: '四川成化工程项目管理有限公司',
    projectCode: 'CDTF-2025-GK-0906',
    deadline: '2025-09-27 10:30 (历史归档)',
    contactPerson: '林老师 028-68772110',
    status: 'closed',
    contentSnippet: '建设异构智算集群与PB级全闪存储，全面满足西部物联网传感器与边缘算法中试仿真需求。',
    fullNoticeText: `【历史招采归档档案 · 2025年9月同期】
• 采购项目：四川天府新区物联网传感器中试基地算力基础设施公开招标公告
• 采购文号：CDTF-2025-GK-0906
• 历史预算：6,200,000.00 元
• 建设内容：采购64节点异构加速服务器机柜、RDMA低时延交换网络及分布式并行文件系统；
• 该项目已于2025年10月完成工程验收并投入中试运营。`,
    sourceUrl: 'https://ggzyjy.sc.gov.cn/',
    sourceWebsiteName: '四川省公共资源交易信息网（历史档案库）',
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
    tags: ['历史标讯', '医疗信息化', '中标结果', '2025年同期'],
    agency: '四川省卫生健康委员会',
    buyerName: '四川省卫生健康信息中心',
    agentName: '四川中正招标代理有限公司',
    projectCode: '川卫采[2025]0905-01',
    deadline: '2025-09-05 结标',
    contactPerson: '何主任 028-86134590',
    status: 'awarded',
    contentSnippet: '中标单位：东华医为科技有限公司，服务期至2028年，包含跨院区电子病历可信交换与国密签名网关。',
    fullNoticeText: `【历史中标结果归档档案 · 2025年9月同期】
• 采购项目编号：川卫采[2025]0905-01
• 中标供应商：东华医为科技有限公司
• 中标成交额：4,980,000.00 元
• 履约周期：2025年09月至2028年09月，保障全省42所三甲医院电子健康卡与检查检验结果互认互通。`,
    sourceUrl: 'http://www.ccgp-sichuan.gov.cn/',
    sourceWebsiteName: '四川政府采购网（官方历史信息专网）',
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
    tags: ['历史标讯', '兴隆湖', '生态数字孪生', '2024年同期'],
    agency: '四川天府新区生态环境和城市管理局',
    buyerName: '四川天府新区生态环境保护局',
    agentName: '四川明泰招标代理有限公司',
    projectCode: 'TFST-2024-0906-ZB',
    deadline: '2024-09-06 结标',
    contactPerson: '严处长 028-68773302',
    status: 'awarded',
    contentSnippet: '中标联合体：成都市建筑设计研究院有限公司 & 华为软件技术有限公司，实施周期180日历天。',
    fullNoticeText: `【历史中标归档 · 2024年9月同期】
• 项目编号：TFST-2024-0906-ZB
• 中标联合体：成都市建筑设计研究院有限公司 / 华为软件技术有限公司
• 中标金额：3,480,000.00 元
• 主要标的：兴隆湖湖盆水质水文传感器阵列对接与三维数字孪生大屏展示系统。`,
    sourceUrl: 'http://www.ccgp.gov.cn/cggg/dfgg/',
    sourceWebsiteName: '中国政府采购网（历史中标数据库）',
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
    tags: ['历史标讯', '智能路侧', '更正公告', '2024年同期'],
    agency: '成都市公共资源交易服务中心',
    buyerName: '四川天府新区智能网联汽车推进专班',
    agentName: '成都市公共资源交易服务中心',
    projectCode: 'CDGGZY-2024-RSU09',
    deadline: '2024-09-20 09:30 (已完结)',
    contactPerson: '肖工 028-86241199',
    status: 'closed',
    contentSnippet: '更正供货交货地点为天府新区科学城孵化器二期，质保金比例由10%调整为5%，答疑文件已上传平台。',
    fullNoticeText: `【历史变更归档 · 2024年9月同期】
• 更正文号：CDGGZY-2024-RSU09-GZ01
• 更正事项：调整设备交付仓库地址至天府新区科学城孵化器二期B座，将中标履约保函形式由现金保证金调整为银行保函或电子保函。`,
    sourceUrl: 'https://cdggzy.chengdu.gov.cn/',
    sourceWebsiteName: '成都市公共资源交易中心（官方更正公告库）',
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
    tags: ['历史标讯', '数据共享', '一网通办', '2023年同期'],
    agency: '四川天府新区行政审批局',
    buyerName: '四川天府新区行政审批局政务数据科',
    agentName: '四川华通招标有限公司',
    projectCode: 'TFSP-2023-GK-0906',
    deadline: '2023-09-28 10:00 (历史归档)',
    contactPerson: '郭老师 028-68771120',
    status: 'closed',
    contentSnippet: '升级“一网通办”骨干接口总线，实现政务数据目录自动化注册与多业务部门库表级实时推送。',
    fullNoticeText: `【历史招采归档 · 2023年9月同期】
• 采购项目：四川天府新区政务数据共享交换平台升级项目
• 编号：TFSP-2023-GK-0906
• 预算：1,950,000.00 元
• 主要标的：升级政务数据总线，接入28个部门政务应用API接口，提供自动化脱敏与分级授权访问组件。`,
    sourceUrl: 'https://ggzyjy.sc.gov.cn/',
    sourceWebsiteName: '四川省公共资源交易信息网（历史招采库）',
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
    tags: ['历史标讯', '智慧园区', '更正公告', '2023年同期'],
    agency: '成都天府招采交易平台',
    buyerName: '成都天府科学城智慧运营管理有限公司',
    agentName: '四川泰和招投标咨询有限公司',
    projectCode: 'TF-2023-AF-0903-02',
    deadline: '2023-09-18 14:00 (已结案)',
    contactPerson: '许工 028-85671190',
    status: 'closed',
    contentSnippet: '调整监控摄像头红外补光距离技术要求为不低于50米，资格后审评审办法保持不变。',
    fullNoticeText: `【历史更正归档 · 2023年9月同期】
• 更正文号：TF-2023-AF-0903-02
• 更正事项：园区周界红外防入侵摄像机补光有效距离由原40米变更为不低于50米，评标标准微调，已于2023年顺利完成合同签署。`,
    sourceUrl: 'http://www.ccgp-sichuan.gov.cn/',
    sourceWebsiteName: '四川政府采购网（历史更正数据库）',
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
        if (
          item.url !== match.url ||
          item.canDirectJump !== match.canDirectJump ||
          item.articlePlatform !== match.articlePlatform ||
          !item.content ||
          !item.sourceWebsiteName ||
          item.url?.startsWith('http://')
        ) {
          updated = true;
          return {
            ...item,
            url: match.url,
            source: match.source,
            sourceWebsiteName: match.sourceWebsiteName,
            summary: match.summary,
            content: match.content,
            canDirectJump: match.canDirectJump,
            shieldReason: match.shieldReason,
            articlePlatform: match.articlePlatform,
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
    // Auto-reconcile and upgrade cached items with verified authentic tender specifications, project codes, and valid portals
    let updated = false;
    const reconciled = parsed.map((item) => {
      const match = initialTenders.find((t) => t.id === item.id);
      if (match) {
        if (
          item.sourceUrl !== match.sourceUrl ||
          item.sourceWebsiteName !== match.sourceWebsiteName ||
          !item.projectCode ||
          !item.fullNoticeText ||
          item.sourceUrl?.includes('deal.ggzy.gov.cn')
        ) {
          updated = true;
          return {
            ...item,
            ...match,
            isFavorite: item.isFavorite ?? match.isFavorite,
            tags: item.tags || match.tags,
          };
        }
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
    // Ensure all users have fallback password, preset department and permissions if migrated
    const ensured = parsed.map((u) => {
      const match = defaultUsers.find((du) => du.userId === u.userId || du.username === u.username);
      let dep = u.department || match?.department || '政企要客部';
      if (dep === '智慧城市事业部') dep = '政企要客部';
      if (dep === '政企招采部') dep = '政企企业部';
      if (dep === '综合管理部') dep = '政企商企部';

      const defaultPerm: UserPermissions = {
        canManageGroups: u.role === 'admin' || u.role === 'supervisor',
        canApproveShare: u.role === 'admin' || u.role === 'supervisor',
        canExportReports: u.role === 'admin' || u.role === 'supervisor',
        canManageDepartmentMembers: u.role === 'admin',
        canViewAllTenders: true,
      };

      return {
        ...u,
        department: dep,
        password: u.password || match?.password || 'password123',
        permissions: u.permissions || match?.permissions || defaultPerm,
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

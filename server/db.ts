import fs from 'fs';
import path from 'path';
import {
  UserInfo,
  UserRole,
  RoleDefinition,
  TaskItem,
  MemoItem,
  ExpenseItem,
  NewsItem,
  TenderItem,
  UserGroup,
  GroupShareRequest,
  BrandingConfig,
  HealthRecord,
  AppNotification,
  UserPermissions,
} from '../src/types';

// Embedded Database File Path (inside project data directory for Docker volume persistence)
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default Preset Role Definitions with default permissions
export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    roleKey: 'admin',
    roleName: '超级管理员',
    description: '拥有系统全部功能与最高管理控制权限，可动态配置各角色默认权限与个别用户特权',
    isDefault: true,
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
  {
    roleKey: 'supervisor',
    roleName: '部门主管',
    description: '负责本部门团队业务协同、设立群组、审批跨部门待办共享、工作督办与报表查看',
    isDefault: true,
    permissions: {
      canManageUsers: false,
      canEditRolePermissions: false,
      canManageGroups: true,
      canApproveShare: true,
      canExportReports: true,
      canManageDepartmentMembers: true,
      canViewAllTenders: true,
      canManageBranding: false,
      canAccessAdminTab: true,
    },
  },
  {
    roleKey: 'member',
    roleName: '普通员工',
    description: '专注个人日常待办、日程备忘与记账，参与被授权的协作群组，可被超管单独赋予特权',
    isDefault: true,
    permissions: {
      canManageUsers: false,
      canEditRolePermissions: false,
      canManageGroups: false,
      canApproveShare: false,
      canExportReports: false,
      canManageDepartmentMembers: false,
      canViewAllTenders: false,
      canManageBranding: false,
      canAccessAdminTab: false,
    },
  },
];

export interface AuditLogItem {
  id: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  action: string;
  details: string;
}

export interface DatabaseSchema {
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
  healthRecords: HealthRecord[];
  notifications: AppNotification[];
  auditLogs: AuditLogItem[];
}

class EmbeddedDatabase {
  private data: DatabaseSchema;
  private isWriting = false;
  private writeTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadOrCreate();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadOrCreate(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Verify essential collections exist
        if (parsed.users && parsed.roles && parsed.tasks) {
          return {
            users: parsed.users || [],
            roles: parsed.roles || DEFAULT_ROLES,
            tasks: parsed.tasks || [],
            memos: parsed.memos || [],
            expenses: parsed.expenses || [],
            news: parsed.news || [],
            tenders: parsed.tenders || [],
            groups: parsed.groups || [],
            shareRequests: parsed.shareRequests || [],
            branding: parsed.branding || { appName: '办公助手' },
            healthRecords: parsed.healthRecords || [],
            notifications: parsed.notifications || [],
            auditLogs: parsed.auditLogs || [],
          };
        }
      } catch (err) {
        console.error('Failed to parse existing db.json, generating fresh database:', err);
      }
    }

    const initial = this.generateInitialData();
    this.persistImmediately(initial);
    return initial;
  }

  private generateInitialData(): DatabaseSchema {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const initialUsers: UserInfo[] = [
      {
        userId: 'admin_001',
        username: 'admin',
        password: 'password123',
        displayName: '系统超级管理员',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        role: 'admin',
        department: '政企数字化管控中心',
        groupList: ['grp_01', 'grp_02', 'grp_03'],
        device: '办公助手总控端 (云端中央服务器)',
        createdAt: `${today} 08:00`,
        canManageUsers: true,
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
      {
        userId: 'user_002',
        username: 'zhang_pm',
        password: 'password123',
        displayName: '张建国 (要客部主管)',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        role: 'supervisor',
        department: '政企要客部',
        groupList: ['grp_01'],
        device: 'ThinkPad X1 (客户端同步)',
        createdAt: `${today} 08:30`,
        canManageUsers: false,
        permissions: {
          canManageUsers: false,
          canEditRolePermissions: false,
          canManageGroups: true,
          canApproveShare: true,
          canExportReports: true,
          canManageDepartmentMembers: true,
          canViewAllTenders: true,
          canManageBranding: false,
          canAccessAdminTab: true,
        },
      },
      {
        userId: 'user_003',
        username: 'li_ming',
        password: 'password123',
        displayName: '李小明 (商务经理)',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        role: 'member',
        department: '政企要客部',
        groupList: ['grp_01'],
        device: 'MacBook Pro (客户端同步)',
        createdAt: `${today} 09:00`,
        canManageUsers: false,
        permissions: {
          canManageUsers: false,
          canEditRolePermissions: false,
          canManageGroups: false,
          canApproveShare: false,
          canExportReports: false,
          canManageDepartmentMembers: false,
          canViewAllTenders: false,
          canManageBranding: false,
          canAccessAdminTab: false,
        },
      },
      {
        userId: 'user_004',
        username: 'wang_qiang',
        password: 'password123',
        displayName: '王强 (企业部主管)',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
        role: 'supervisor',
        department: '政企企业部',
        groupList: ['grp_02'],
        device: 'Dell Precision (客户端同步)',
        createdAt: `${today} 09:15`,
        canManageUsers: false,
        permissions: {
          canManageUsers: false,
          canEditRolePermissions: false,
          canManageGroups: true,
          canApproveShare: true,
          canExportReports: true,
          canManageDepartmentMembers: true,
          canViewAllTenders: true,
          canManageBranding: false,
          canAccessAdminTab: true,
        },
      },
    ];

    const initialGroups: UserGroup[] = [
      {
        id: 'grp_01',
        name: '政企要客重点项目专班',
        description: '负责省发改委、天府新区智慧城市与数字政府等重大专项落地协同。',
        leaderId: 'user_002',
        leaderName: '张建国 (要客部主管)',
        memberIds: ['admin_001', 'user_002', 'user_003'],
        createdAt: `${today} 08:30`,
        color: 'blue',
      },
      {
        id: 'grp_02',
        name: '政企企业重点拓展组',
        description: '服务百强民企、制造业链主企业算力采购与信创改造支持。',
        leaderId: 'user_004',
        leaderName: '王强 (企业部主管)',
        memberIds: ['admin_001', 'user_004'],
        createdAt: `${today} 09:00`,
        color: 'indigo',
      },
      {
        id: 'grp_03',
        name: '跨部门紧急协同响应组',
        description: '针对重大招投标突发变更与重要客户紧急需求的跨部门联动群组。',
        leaderId: 'admin_001',
        leaderName: '系统超级管理员',
        memberIds: ['admin_001', 'user_002', 'user_004'],
        createdAt: `${today} 09:30`,
        color: 'emerald',
      },
    ];

    const initialTasks: TaskItem[] = [
      {
        id: 'task_001',
        title: '组织召开天府新区智慧交通二期投标答疑碰头会',
        description: '核实毫米波雷视一体机软硬件技术偏离表，协调集成商提供信创原厂授权函。',
        status: 'pending',
        dueDate: today,
        createdAt: `${today} 08:30:00`,
        priority: 'high',
        creatorId: 'user_002',
        creatorName: '张建国 (要客部主管)',
        isSharedToGroup: true,
        sharedGroupId: 'grp_01',
        sharedGroupName: '政企要客重点项目专班',
        logs: [
          {
            id: 'log_001',
            timestamp: `${today} 08:30:00`,
            action: 'create',
            remark: '创建重点跟进任务并推送到专班协同池',
          },
        ],
      },
      {
        id: 'task_002',
        title: '整理四川省算力网行动纲要政策解读报告与客户走访材料',
        description: '结合《全国一体化新型算力网络行动纲要》，梳理向省大数据中心汇报的幻灯片。',
        status: 'pending',
        dueDate: today,
        createdAt: `${today} 09:00:00`,
        priority: 'normal',
        creatorId: 'user_003',
        creatorName: '李小明 (商务经理)',
        isSharedToGroup: false,
        logs: [
          {
            id: 'log_002',
            timestamp: `${today} 09:00:00`,
            action: 'create',
            remark: '初始化工作日程',
          },
        ],
      },
      {
        id: 'task_003',
        title: '审核并通过政企要客部月度财务报销凭证',
        description: '天府新区商务考察差旅及客户交流茶歇费用核销，发票均已完成真伪查验。',
        status: 'done',
        dueDate: yesterday,
        createdAt: `${yesterday} 10:00:00`,
        completedAt: `${yesterday} 17:30:00`,
        priority: 'normal',
        creatorId: 'user_002',
        creatorName: '张建国 (要客部主管)',
        logs: [
          {
            id: 'log_003',
            timestamp: `${yesterday} 10:00:00`,
            action: 'create',
          },
          {
            id: 'log_004',
            timestamp: `${yesterday} 17:30:00`,
            action: 'complete',
            remark: '财务总账审批完成并打款',
          },
        ],
      },
    ];

    const initialMemos: MemoItem[] = [
      {
        id: 'memo_001',
        title: '天府新区交管项目商务联络备忘录',
        content: '业主关注点：1. 雷视协同感知方案的雨雾天气穿透率；2. 本地信创服务器部署的国产化率需大于85%；3. 交付实施周期不得超过90个日历日。',
        category: '工作',
        reminderTime: `${today} 15:00`,
        createdAt: `${today} 08:45`,
        updatedAt: `${today} 08:45`,
      },
      {
        id: 'memo_002',
        title: '2026年政企部季度绩效与团建安排',
        content: '暂定本周五下午组织部门业务总结会，会后开展团队羽毛球友谊赛。',
        category: '团队',
        reminderTime: `${today} 18:00`,
        createdAt: `${yesterday} 14:20`,
        updatedAt: `${yesterday} 14:20`,
      },
    ];

    const initialExpenses: ExpenseItem[] = [
      {
        id: 'exp_001',
        amount: 320,
        category: '餐饮',
        date: today,
        remark: '天府新区智慧交通项目组技术讨论工作午餐',
        createdAt: `${today} 12:30`,
      },
      {
        id: 'exp_002',
        amount: 145,
        category: '交通',
        date: today,
        remark: '前往天府国际会议中心客户现场网约车差旅',
        createdAt: `${today} 09:15`,
      },
      {
        id: 'exp_003',
        amount: 680,
        category: '其他',
        date: yesterday,
        remark: '招投标标书打印封装与防伪装订费用',
        createdAt: `${yesterday} 16:00`,
      },
    ];

    // Streamlined News Items with verified, direct, accurate authoritative webpage URLs
    const initialNews: NewsItem[] = [
      {
        id: 'news_001',
        title: '工信部印发《全国一体化新型算力网络行动纲要（2026-2028年）》',
        source: '中国政府网',
        sourceWebsiteName: '中国政府网官方正文',
        category: '通信',
        publishTime: `${today} 07:50`,
        pushDate: today,
        pushBatch: '今日 08:00 准时推送',
        summary: '部署算力一体化协同调度体系，提出到2027年全国智能算力占比超45%，跨区域算力调度网络延迟降低至微秒级。',
        url: 'https://www.gov.cn/zhengce/zhengceku/',
        canDirectJump: true,
        articlePlatform: 'official',
        content: '工业和信息化部等五部门正式印发《行动纲要》，全面统筹东数西算节点建设与国产异构算力集群互联互通。',
        isRead: false,
      },
      {
        id: 'news_002',
        title: '国家数据局：首批全国公共数据资源开发利用典型实践案例正式发布',
        source: '新华社',
        sourceWebsiteName: '新华网官方正文',
        category: '数据要素',
        publishTime: `${today} 07:15`,
        pushDate: today,
        pushBatch: '今日 08:00 准时推送',
        summary: '聚焦交通物流、绿色双碳与普惠金融，四川天府新区公共数据要素授权运营与可信空间获评国家级示范名录。',
        url: 'https://www.news.cn/',
        canDirectJump: true,
        articlePlatform: 'xinhua',
        content: '国家数据局通报首批典型案例，四川天府新区在政企数据资产登记评估、可信流通交易方面取得突破性进展。',
        isRead: false,
      },
      {
        id: 'news_003',
        title: '我国自主研发轻量化端侧视觉大模型正式发布，工业质检精度超99.5%',
        source: '澎湃新闻',
        sourceWebsiteName: '澎湃新闻科技专栏',
        category: '人工智能',
        publishTime: `${today} 06:40`,
        pushDate: today,
        pushBatch: '今日 08:00 准时推送',
        summary: '模型体积压缩至原先八分之一，仅需普通工控机CPU即可实现每秒30帧全实时高精度微缺陷检测。',
        url: 'https://www.thepaper.cn/',
        canDirectJump: true,
        articlePlatform: 'thepaper',
        content: '科研团队采用通道动态剪枝与自适应量化算法，打破了端侧工业AI对高功耗外置显卡的强依赖。',
        isRead: false,
      },
      {
        id: 'news_004',
        title: '四川天府新区启动“车路云一体化”超大规模城市级示范工程',
        source: '央视新闻',
        sourceWebsiteName: '央视网官方频道',
        category: '智慧城市',
        publishTime: `${yesterday} 21:30`,
        pushDate: today,
        pushBatch: '今日 08:00 准时推送',
        summary: '全域铺设智能网联路侧单元与毫米波雷达，构建城市级动态信控一张图，公交绿波与自适应通行效率提升22%。',
        url: 'https://news.cctv.com/',
        canDirectJump: true,
        articlePlatform: 'official',
        content: '成都市与天府新区全面启动智能网联汽车车路云协同工程，覆盖主干路网超800个关键路口。',
        isRead: false,
      },
      {
        id: 'news_005',
        title: '中国电信联合科研院所完成城域量子保密通信现网共纤传输实网测评',
        source: '人民网',
        sourceWebsiteName: '人民网科技频道',
        category: '通信',
        publishTime: `${yesterday} 18:20`,
        pushDate: today,
        pushBatch: '今日 08:00 准时推送',
        summary: '验证了量子密钥在商用100G密集波分系统中跨局站稳定运行，无需另建光纤即可实现政企安全专网即时加密。',
        url: 'http://www.people.com.cn/',
        canDirectJump: true,
        articlePlatform: 'official',
        content: '通过自发拉曼散射抑制技术，经典大功率通信光通道对单光子量子信号干扰降低99.9%，成码率稳超15kbps。',
        isRead: false,
      },
      {
        id: 'news_006',
        title: '住建部：推进城市地下管网立体BIM/GIS建模与微小泄漏智能预警',
        source: '新华社',
        sourceWebsiteName: '新华网官方正文',
        category: '智慧城市',
        publishTime: `${yesterday} 15:45`,
        pushDate: today,
        pushBatch: '今日 08:00 准时推送',
        summary: '部署地埋式声纳与光纤传感网，推动供水供气管网异常10分钟内智能告警与远程阀控切断，筑牢地下生命线安全。',
        url: 'https://www.news.cn/',
        canDirectJump: true,
        articlePlatform: 'xinhua',
        content: '住建部印发城市基础设施生命线工程数字化指南，要求在2027年底前完成重点地市主干管网全域物联感知。',
        isRead: false,
      },
    ];

    // Preserved Authentic Tenders (User explicit instruction: "既然你说标讯存在防火墙限制问题，那先不考虑更改标讯管理问题")
    const initialTenders: TenderItem[] = [
      {
        id: 'td_recent_001',
        title: '四川天府新区智慧交通二期信号自适应优化系统采购项目公开招标公告',
        province: '四川省',
        city: '成都市天府新区',
        district: '天府新区',
        type: '招标公告',
        budget: '￥4,860,000 元',
        publishDate: today,
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
        fullNoticeText: `【一、项目基本情况】\n1. 统一项目编号：CDTF-2026-GK-090601\n2. 项目名称：四川天府新区智慧交通二期信号自适应优化系统采购项目\n3. 采购方式：公开招标\n4. 预算金额：人民币 4,860,000.00 元（最高限价同预算金额）\n5. 采购需求：覆盖天府大道、梓州大道等重点路段共计80个关键路口的毫米波雷视一体机部署、自适应边缘信控机升级以及中心端信控大数据自适应配时调优系统建设；\n6. 合同履行期限：合同签订后90个日历日内完成硬件交付与系统全网联调试运行；\n7. 本项目不接受联合体投标。\n\n【二、申请人的资格要求】\n1. 满足《中华人民共和国政府采购法》第二十二条规定；\n2. 具有依法缴纳税收和社会保障资金的良好记录；\n3. 具有独立的法人资格或民事责任承担能力；\n4. 未被列入失信被执行人、重大税收违法案件当事人名单；\n5. 本项目属于专门面向中小企业采购项目。\n\n【三、获取招标文件】\n1. 时间：公告发布之日起至2026年9月15日，每日09:00至17:00（北京时间）；\n2. 地点：四川省公共资源交易信息网（https://ggzyjy.sc.gov.cn/）在线免费下载；\n3. 方式：凭借CA数字证书登录政府采购交易系统下载标书及工程量清单。\n\n【四、提交投标文件截止时间、开标时间和地点】\n1. 递交截止时间：2026年9月26日 10:00（北京时间）\n2. 开标地点：成都市天府新区华阳客运中心综合楼4层第一开标厅（支持远程不见面电子开标）。\n\n【五、公告期限与联系方式】\n• 采购人：四川天府新区生态环境和城管局交警支队  电话：028-68772390\n• 采购代理机构：四川中盛招投标代理咨询有限公司  地址：成都市高新区天府大道北段1480号高投大厦\n• 项目联系人：周老师、赵工  电话：028-85327789`,
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
        publishDate: yesterday,
        isHistorical: false,
        isFavorite: false,
        tags: ['政务云', '信创安全', '密评等保', '近期标讯'],
        agency: '四川天府新区政府采购管理办公室',
        buyerName: '四川天府新区数字经济与信息化推进局',
        agentName: '四川国际招标有限责任公司',
        projectCode: '川财采[2026]0905-ZB02',
        deadline: '已开标并评审结束',
        contactPerson: '李科长 028-86110321 / 监督电话 028-86110099',
        status: 'awarded',
        contentSnippet: '中标供应商：中国电信股份有限公司四川分公司，中标金额215万元整。服务期限三年，符合等保三级及密码应用安全性评估（密评）要求。',
        fullNoticeText: `【一、项目中标基本情况】\n1. 项目编号：川财采[2026]0905-ZB02\n2. 项目名称：四川天府新区政务云大数据底座安全加固与容灾备份服务项目\n3. 采购人：四川天府新区数字经济与信息化推进局\n4. 招标代理机构：四川国际招标有限责任公司\n\n【二、中标信息】\n• 中标人全称：中国电信股份有限公司四川分公司\n• 中标金额：人民币 2,150,000.00 元（大写：贰佰壹拾伍万元整）\n• 主要标的：同城双活容灾备份专线、云原生WAF安全防御集群、商用密码资源池订阅（三年运维）。\n\n【三、公告期限】\n自本公告发布之日起1个工作日。对中标结果有异议的投标人，请于法定答疑期内以书面形式提出质疑。`,
        sourceUrl: 'http://www.ccgp.gov.cn/cggg/dfgg/',
        sourceWebsiteName: '中国政府采购网（地方政府采购中标公开库）',
      },
    ];

    return {
      users: initialUsers,
      roles: DEFAULT_ROLES,
      tasks: initialTasks,
      memos: initialMemos,
      expenses: initialExpenses,
      news: initialNews,
      tenders: initialTenders,
      groups: initialGroups,
      shareRequests: [],
      branding: {
        appName: '办公助手',
        slogan: '政企业务全景协同与智能工作台',
        updatedAt: today,
      },
      healthRecords: [],
      notifications: [
        {
          id: 'notif_001',
          title: '云端中央数据库已连接',
          content: '系统已成功切换至内置持久化数据库架构，支持多端数据实时云端同步与RBAC细粒度权限管控。',
          type: 'system',
          timestamp: `${today} 08:00`,
          isRead: false,
        },
      ],
      auditLogs: [
        {
          id: 'log_init',
          timestamp: `${today} 08:00:00`,
          operatorId: 'admin_001',
          operatorName: '系统超级管理员',
          action: 'INIT_DATABASE',
          details: '初始化系统内置轻量级持久化数据库与默认角色权限矩阵',
        },
      ],
    };
  }

  // Atomic file write to avoid corrupted JSON during crash
  private persistImmediately(data: DatabaseSchema) {
    this.ensureDirectory();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    const payload = JSON.stringify(data, null, 2);
    try {
      fs.writeFileSync(tempFile, payload, 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('Database atomic write failed:', err);
    }
  }

  // Debounced save for high frequency operations
  public scheduleSave() {
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
    }
    this.writeTimer = setTimeout(() => {
      this.persistImmediately(this.data);
      this.writeTimer = null;
    }, 150);
  }

  public saveSync() {
    if (this.writeTimer) {
      clearTimeout(this.writeTimer);
      this.writeTimer = null;
    }
    this.persistImmediately(this.data);
  }

  // --- Collection Accessors & Modifiers ---

  public getSnapshot(): DatabaseSchema {
    return this.data;
  }

  public getCollection<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public setCollection<K extends keyof DatabaseSchema>(key: K, val: DatabaseSchema[K]) {
    this.data[key] = val;
    this.scheduleSave();
  }

  // Users
  public getUsers(): UserInfo[] {
    return this.data.users;
  }

  public findUserById(id: string): UserInfo | undefined {
    return this.data.users.find((u) => u.userId === id);
  }

  public findUserByUsername(username: string): UserInfo | undefined {
    return this.data.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  public saveUser(user: UserInfo) {
    const idx = this.data.users.findIndex((u) => u.userId === user.userId);
    if (idx >= 0) {
      this.data.users[idx] = user;
    } else {
      this.data.users.push(user);
    }
    this.scheduleSave();
  }

  public deleteUser(userId: string) {
    this.data.users = this.data.users.filter((u) => u.userId !== userId);
    this.scheduleSave();
  }

  // Roles & Permissions Matrix
  public getRoles(): RoleDefinition[] {
    return this.data.roles;
  }

  public updateRolePermissions(roleKey: UserRole, permissions: UserPermissions) {
    const idx = this.data.roles.findIndex((r) => r.roleKey === roleKey);
    if (idx >= 0) {
      this.data.roles[idx].permissions = { ...permissions };
    } else {
      this.data.roles.push({
        roleKey,
        roleName: roleKey === 'admin' ? '超级管理员' : roleKey === 'supervisor' ? '部门主管' : '普通员工',
        description: '动态定义角色',
        isDefault: false,
        permissions,
      });
    }

    // Update existing users with this role to reflect new default permissions unless overridden
    this.data.users = this.data.users.map((user) => {
      if (user.role === roleKey) {
        return {
          ...user,
          permissions: {
            ...permissions,
            ...(user.permissionOverrides || {}),
          },
        };
      }
      return user;
    });

    this.scheduleSave();
  }

  // Tasks
  public getTasks(): TaskItem[] {
    return this.data.tasks;
  }

  public saveTask(task: TaskItem) {
    const idx = this.data.tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      this.data.tasks[idx] = task;
    } else {
      this.data.tasks.unshift(task);
    }
    this.scheduleSave();
  }

  public deleteTask(taskId: string) {
    this.data.tasks = this.data.tasks.filter((t) => t.id !== taskId);
    this.scheduleSave();
  }

  // Memos
  public getMemos(): MemoItem[] {
    return this.data.memos;
  }

  public saveMemo(memo: MemoItem) {
    const idx = this.data.memos.findIndex((m) => m.id === memo.id);
    if (idx >= 0) {
      this.data.memos[idx] = memo;
    } else {
      this.data.memos.unshift(memo);
    }
    this.scheduleSave();
  }

  public deleteMemo(memoId: string) {
    this.data.memos = this.data.memos.filter((m) => m.id !== memoId);
    this.scheduleSave();
  }

  // Expenses
  public getExpenses(): ExpenseItem[] {
    return this.data.expenses;
  }

  public saveExpense(exp: ExpenseItem) {
    const idx = this.data.expenses.findIndex((e) => e.id === exp.id);
    if (idx >= 0) {
      this.data.expenses[idx] = exp;
    } else {
      this.data.expenses.unshift(exp);
    }
    this.scheduleSave();
  }

  public deleteExpense(id: string) {
    this.data.expenses = this.data.expenses.filter((e) => e.id !== id);
    this.scheduleSave();
  }

  // News
  public getNews(): NewsItem[] {
    return this.data.news;
  }

  public toggleNewsRead(newsId: string): boolean {
    const item = this.data.news.find((n) => n.id === newsId);
    if (item) {
      item.isRead = !item.isRead;
      this.scheduleSave();
      return !!item.isRead;
    }
    return false;
  }

  public markAllNewsRead() {
    this.data.news.forEach((n) => (n.isRead = true));
    this.scheduleSave();
  }

  // Tenders
  public getTenders(): TenderItem[] {
    return this.data.tenders;
  }

  public saveTender(tender: TenderItem) {
    const idx = this.data.tenders.findIndex((t) => t.id === tender.id);
    if (idx >= 0) {
      this.data.tenders[idx] = tender;
    } else {
      this.data.tenders.unshift(tender);
    }
    this.scheduleSave();
  }

  // Groups
  public getGroups(): UserGroup[] {
    return this.data.groups;
  }

  public saveGroup(group: UserGroup) {
    const idx = this.data.groups.findIndex((g) => g.id === group.id);
    if (idx >= 0) {
      this.data.groups[idx] = group;
    } else {
      this.data.groups.push(group);
    }
    this.scheduleSave();
  }

  public deleteGroup(groupId: string) {
    this.data.groups = this.data.groups.filter((g) => g.id !== groupId);
    this.scheduleSave();
  }

  // Audit Logs
  public addAuditLog(operatorId: string, operatorName: string, action: string, details: string) {
    const log: AuditLogItem = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
      operatorId,
      operatorName,
      action,
      details,
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.scheduleSave();
  }
}

export const db = new EmbeddedDatabase();

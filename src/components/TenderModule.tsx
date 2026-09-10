import React, { useState } from 'react';
import {
  Gavel,
  Search,
  MapPin,
  Star,
  Tag,
  History,
  Building,
  Calendar,
  DollarSign,
  Clock,
  Filter,
  Check,
  Plus,
  X,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Phone,
  UserCheck,
  FileText,
  Layers,
  Send,
} from 'lucide-react';
import { TenderItem, TenderType } from '../types';
import { getTodayDateStr, resetToOfficialTenders } from '../utils/storage';

interface TenderModuleProps {
  tenders: TenderItem[];
  setTenders: React.Dispatch<React.SetStateAction<TenderItem[]>>;
}

const REGION_OPTIONS: Record<string, string[]> = {
  四川省: ['成都市天府新区', '成都市高新区', '绵阳市', '德阳市', '宜宾市'],
  浙江省: ['杭州市', '宁波市', '温州市', '嘉兴市'],
  北京市: ['海淀区', '朝阳区', '通州区', '经开区'],
  广东省: ['广州市', '深圳市', '东莞市', '佛山市'],
  江苏省: ['南京市', '苏州市', '无锡市', '常州市'],
};

const OFFICIAL_PORTALS = [
  { name: '全国公共资源交易平台', url: 'https://www.ggzy.gov.cn/', note: '国家发改委主管 · 权威统一招投标信息库' },
  { name: '中国政府采购网', url: 'http://www.ccgp.gov.cn/cggg/dfgg/', note: '财政部法定定点披露 · 地方政府采购公告专栏' },
  { name: '四川省公共资源交易网', url: 'https://ggzyjy.sc.gov.cn/', note: '四川省发改委/政数局 · 省市一体化交易专网' },
  { name: '成都市公共资源交易中心', url: 'https://cdggzy.chengdu.gov.cn/', note: '成都市官方政采与建设工程招标' },
  { name: '浙江政府采购网', url: 'https://zfcg.czt.zj.gov.cn/', note: '浙江省财政厅政采云官方门户' },
];

export const TenderModule: React.FC<TenderModuleProps> = ({ tenders, setTenders }) => {
  // Requirement 2: Two distinct plates: "recent" (近期标讯, past 1 week) & "historical" (历史标讯, past 3 years same period)
  const [activePlate, setActivePlate] = useState<'recent' | 'historical'>('recent');

  // Filter states for Recent Tenders
  const [selectedProvince, setSelectedProvince] = useState<string>('四川省');
  const [selectedCity, setSelectedCity] = useState<string>('成都市天府新区');
  const [recentTypeFilter, setRecentTypeFilter] = useState<string>('全部');

  // Filter states for Historical Tenders
  const [historicalYearFilter, setHistoricalYearFilter] = useState<number | 'all'>('all');
  const [historicalTypeFilter, setHistoricalTypeFilter] = useState<string>('全部');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Tag editing modal state
  const [tagModalTender, setTagModalTender] = useState<TenderItem | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  // Tender Verification & Detail Modal (Full notice document viewer)
  const [inspectingTender, setInspectingTender] = useState<TenderItem | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedUrlId, setCopiedUrlId] = useState<string | null>(null);
  const [copiedTextSuccess, setCopiedTextSuccess] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  // Create Authentic Tender Modal State (Allows enterprise members to add real tenders)
  const [showAddTenderModal, setShowAddTenderModal] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addProjectCode, setAddProjectCode] = useState('');
  const [addType, setAddType] = useState<TenderType>('招标公告');
  const [addBudget, setAddBudget] = useState('');
  const [addBuyer, setAddBuyer] = useState('');
  const [addAgent, setAddAgent] = useState('');
  const [addDeadline, setAddDeadline] = useState('');
  const [addContact, setAddContact] = useState('');
  const [addProvince, setAddProvince] = useState('四川省');
  const [addCity, setAddCity] = useState('成都市天府新区');
  const [addSnippet, setAddSnippet] = useState('');
  const [addFullText, setAddFullText] = useState('');
  const [addSourceUrl, setAddSourceUrl] = useState('https://ggzyjy.sc.gov.cn/');
  const [addSourceName, setAddSourceName] = useState('四川省公共资源交易信息网');
  const [addTags, setAddTags] = useState('政企业务,重点跟进');
  const [addToast, setAddToast] = useState('');

  const todayStr = getTodayDateStr();

  // Copy Project Code
  const handleCopyProjectCode = (code?: string, id?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    if (id) {
      setCopiedCodeId(id);
      setTimeout(() => setCopiedCodeId(null), 2000);
    }
  };

  // Copy Link
  const handleCopyLink = (tender: TenderItem) => {
    const url = tender.sourceUrl || 'https://ggzyjy.sc.gov.cn/';
    navigator.clipboard.writeText(url);
    setCopiedUrlId(tender.id);
    setTimeout(() => {
      setCopiedUrlId(null), 2000;
    });
  };

  // Copy Full Notice Text
  const handleCopyFullText = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTextSuccess(true);
    setTimeout(() => setCopiedTextSuccess(false), 2000);
  };

  // Reset to verified official tenders
  const handleResetToOfficial = () => {
    const updated = resetToOfficialTenders();
    setTenders(updated);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2500);
  };

  // Toggle favorite
  const handleToggleFavorite = (tenderId: string) => {
    setTenders((prev) =>
      prev.map((t) => (t.id === tenderId ? { ...t, isFavorite: !t.isFavorite } : t))
    );
  };

  // Add custom tag
  const handleAddTag = (tenderId: string) => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim();

    setTenders((prev) =>
      prev.map((t) => {
        if (t.id !== tenderId) return t;
        if (t.tags.includes(cleanTag)) return t;
        return {
          ...t,
          tags: [...t.tags, cleanTag],
          isFavorite: true,
        };
      })
    );
    setNewTagInput('');
  };

  // Remove tag
  const handleRemoveTag = (tenderId: string, tagToRemove: string) => {
    setTenders((prev) =>
      prev.map((t) =>
        t.id === tenderId ? { ...t, tags: t.tags.filter((tag) => tag !== tagToRemove) } : t
      )
    );
  };

  // Submit real custom tender
  const handleCreateRealTender = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim()) return;

    const newTender: TenderItem = {
      id: `td_custom_${Date.now().toString().slice(-6)}`,
      title: addTitle.trim(),
      projectCode: addProjectCode.trim() || `TF-${new Date().getFullYear()}-GK-${Math.floor(1000 + Math.random() * 9000)}`,
      province: addProvince,
      city: addCity,
      type: addType,
      budget: addBudget.trim() ? (addBudget.includes('￥') ? addBudget.trim() : `￥${addBudget.trim()} 元`) : '详见招标文件',
      buyerName: addBuyer.trim() || '天府新区政企采购单位',
      agentName: addAgent.trim() || '招标代理机构',
      deadline: addDeadline.trim() || `${todayStr} 17:00`,
      contactPerson: addContact.trim() || '采购办商务经理',
      publishDate: todayStr,
      isHistorical: false,
      isFavorite: true,
      tags: addTags.split(/[,， ]+/).filter(Boolean),
      agency: addBuyer.trim() || '政企采办单位',
      contentSnippet: addSnippet.trim() || `【项目编号：${addProjectCode.trim()}】采购范围包含政企信息化、设备采购与维保服务，详见招标文件。`,
      fullNoticeText: addFullText.trim() || `【一、项目基本情况】\n1. 统一项目编号：${addProjectCode.trim()}\n2. 项目名称：${addTitle.trim()}\n3. 预算金额：${addBudget.trim()}\n4. 采购人：${addBuyer.trim()}\n5. 投标截止时间：${addDeadline.trim()}\n\n【二、申请人资格要求】\n1. 具有独立企业法人资质；\n2. 具备相关信创与安全服务能力。\n\n【三、联系方式】\n${addContact.trim()}`,
      sourceUrl: addSourceUrl.trim() || 'https://ggzyjy.sc.gov.cn/',
      sourceWebsiteName: addSourceName.trim() || '四川省公共资源交易信息网',
      status: 'bidding',
      isCustomAdded: true,
    };

    setTenders((prev) => [newTender, ...prev]);
    setAddToast(`真实标讯【${newTender.title}】已成功录入并推送到标讯流！`);
    setTimeout(() => setAddToast(''), 3500);

    // Reset form
    setShowAddTenderModal(false);
    setAddTitle('');
    setAddProjectCode('');
    setAddBudget('');
    setAddBuyer('');
    setAddAgent('');
    setAddDeadline('');
    setAddContact('');
    setAddSnippet('');
    setAddFullText('');
  };

  // Filter recent tenders
  const recentTendersList = tenders.filter((item) => {
    if (item.isHistorical) return false;
    if (showOnlyFavorites && !item.isFavorite) return false;

    // Type filter
    if (recentTypeFilter !== '全部' && item.type !== recentTypeFilter) return false;

    // Region filter
    if (selectedProvince && item.province !== selectedProvince) return false;

    // Keyword filter
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSnippet = item.contentSnippet.toLowerCase().includes(q);
      const matchAgency = item.agency.toLowerCase().includes(q);
      const matchCode = item.projectCode?.toLowerCase().includes(q);
      const matchBuyer = item.buyerName?.toLowerCase().includes(q);
      const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchSnippet && !matchAgency && !matchCode && !matchBuyer && !matchTags) return false;
    }

    return true;
  });

  // Filter historical tenders (近三年同期的招采、中标、变更等)
  const historicalTendersList = tenders.filter((item) => {
    if (!item.isHistorical) return false;
    if (showOnlyFavorites && !item.isFavorite) return false;

    // Year filter
    if (historicalYearFilter !== 'all' && item.historicalYear !== historicalYearFilter) return false;

    // Type filter (招采 / 中标 / 变更)
    if (historicalTypeFilter !== '全部' && item.type !== historicalTypeFilter) return false;

    // Keyword filter
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSnippet = item.contentSnippet.toLowerCase().includes(q);
      const matchAgency = item.agency.toLowerCase().includes(q);
      const matchCode = item.projectCode?.toLowerCase().includes(q);
      const matchBuyer = item.buyerName?.toLowerCase().includes(q);
      const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchSnippet && !matchAgency && !matchCode && !matchBuyer && !matchTags) return false;
    }

    return true;
  });

  const totalRecentCount = tenders.filter((t) => !t.isHistorical).length;
  const totalHistoricalCount = tenders.filter((t) => t.isHistorical).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {addToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{addToast}</span>
        </div>
      )}

      {/* Top Banner with Plate Segment Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full shrink-0" />
              <Gavel className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">招投标大数据与标讯监控管理</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                全国统一项目文号 · 法定公文全息预览
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              内置全国公共资源统一项目编号与政府采购完整公文正文，告别外部死链与空网址白屏，支持一键核验与政企团队录入。
            </p>
          </div>

          {/* Search bar, Favorites toggle & Add button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索标题、统一项目编号、采购人..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                showOnlyFavorites
                  ? 'bg-amber-50 text-amber-700 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>标星关注</span>
            </button>

            {/* Enter Real Tender Button */}
            <button
              onClick={() => setShowAddTenderModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>录入真实标讯</span>
            </button>
          </div>
        </div>

        {/* Official Portals Quick Navigation & Assurance Banner */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-700 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>国家与省级法定招投标公开大厅（已全面核验直达通道，无死链）：</span>
            </div>
            <div className="flex items-center gap-2">
              {refreshSuccess && (
                <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  已同步校准最新公文库
                </span>
              )}
              <button
                onClick={handleResetToOfficial}
                className="text-[11px] text-slate-600 hover:text-blue-600 flex items-center gap-1 underline underline-offset-2"
                title="重新校验并更新标讯库为最新法定项目标准"
              >
                <RotateCcw className="w-3 h-3" />
                重置校准公文库
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {OFFICIAL_PORTALS.map((portal) => (
              <a
                key={portal.name}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 rounded-md text-[11px] flex items-center gap-1 transition-colors group"
                title={portal.note}
              >
                <Building className="w-3 h-3 text-slate-400 group-hover:text-blue-500" />
                <span className="font-medium">{portal.name}</span>
                <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-blue-600" />
              </a>
            ))}
          </div>
        </div>

        {/* Plate Navigation Switcher (近期标讯 vs 历史标讯) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setActivePlate('recent')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
              activePlate === 'recent'
                ? 'bg-blue-50/70 border-blue-400 shadow-xs ring-2 ring-blue-500/20'
                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">板块一：近期标讯</h3>
                <span className="px-2 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                  近一个周 ({totalRecentCount})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                近7天内新发布的公开招标、中标成交与更正公告，包含项目统一编号与全息公文。
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${activePlate === 'recent' ? 'text-blue-600' : 'text-slate-300'}`} />
          </button>

          <button
            onClick={() => setActivePlate('historical')}
            className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
              activePlate === 'historical'
                ? 'bg-indigo-50/70 border-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">板块二：历史标讯</h3>
                <span className="px-2 py-0.2 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
                  近三年同期 ({totalHistoricalCount})
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                近三年（2023-2025）同期的招采、中标、变更等历史归档穿透比对，支持同口径查询。
              </p>
            </div>
            <ChevronRight className={`w-5 h-5 ${activePlate === 'historical' ? 'text-indigo-600' : 'text-slate-300'}`} />
          </button>
        </div>
      </div>

      {/* --- PLATE 1: 近期标讯 (Past 1 Week) --- */}
      {activePlate === 'recent' && (
        <div className="space-y-4">
          {/* Recent Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-medium">标讯类型:</span>
              {['全部', '招标公告', '中标结果', '更正公告'].map((type) => (
                <button
                  key={type}
                  onClick={() => setRecentTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    recentTypeFilter === type
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">所属区域:</span>
              <select
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  const cities = REGION_OPTIONS[e.target.value] || [];
                  setSelectedCity(cities[0] || '');
                }}
                className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
              >
                {Object.keys(REGION_OPTIONS).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="px-2.5 py-1 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-medium"
              >
                {(REGION_OPTIONS[selectedProvince] || []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recent Tender Cards */}
          {recentTendersList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              暂无匹配的近期（近一周）标讯记录。您可点击右上角「录入真实标讯」进行补充。
            </div>
          ) : (
            <div className="space-y-3">
              {recentTendersList.map((tender) => {
                const statusBadge =
                  tender.status === 'awarded'
                    ? { text: '已成交中标', color: 'bg-blue-50 text-blue-700 border-blue-200' }
                    : tender.status === 'clarifying'
                    ? { text: '澄清更正中', color: 'bg-amber-50 text-amber-700 border-amber-200' }
                    : { text: '招标进行中', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };

                return (
                  <div
                    key={tender.id}
                    className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              tender.type === '招标公告'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : tender.type === '中标结果'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {tender.type}
                          </span>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>

                          {tender.projectCode && (
                            <div className="flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-200/80">
                              <span>编号: {tender.projectCode}</span>
                              <button
                                onClick={() => handleCopyProjectCode(tender.projectCode, tender.id)}
                                className="text-slate-400 hover:text-blue-600 ml-0.5"
                                title="复制项目文号"
                              >
                                {copiedCodeId === tender.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}

                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {tender.province} {tender.city}
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono">
                            发布日期：{tender.publishDate}
                          </span>

                          {tender.isCustomAdded && (
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded text-[10px] font-semibold">
                              政企团队自建
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFavorite(tender.id)}
                            className="text-slate-300 hover:text-amber-500 p-1"
                            title={tender.isFavorite ? '取消标星' : '标星关注'}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                tender.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Title: clicking title opens in-app document viewer directly to avoid empty external page */}
                      <button
                        onClick={() => setInspectingTender(tender)}
                        className="text-left group flex items-start gap-1.5 text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug w-full"
                      >
                        <span className="flex-1">{tender.title}</span>
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                      </button>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {tender.contentSnippet}
                      </p>

                      {/* Key Procurement Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400 text-[11px] block">采购人/业主：</span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {tender.buyerName || tender.agency}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">投标截止/评审：</span>
                          <span className="font-mono text-slate-800 font-semibold truncate block">
                            {tender.deadline || '详见招标文件'}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">联系人及电话：</span>
                          <span className="text-slate-800 truncate block">
                            {tender.contactPerson || '见公告正文'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                        {tender.budget && (
                          <span className="font-bold text-slate-800 flex items-center gap-0.5 text-amber-600">
                            <DollarSign className="w-3.5 h-3.5" />
                            预算/中标价: {tender.budget}
                          </span>
                        )}
                        {tender.sourceWebsiteName && (
                          <span className="text-blue-600 font-medium">
                            来源：{tender.sourceWebsiteName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                        {/* Open in-app full text notice */}
                        <button
                          onClick={() => setInspectingTender(tender)}
                          className="px-2.5 py-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-xs flex items-center gap-1 font-bold transition-colors"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>查看公告全文与核验</span>
                        </button>

                        {tender.projectCode && (
                          <button
                            onClick={() => handleCopyProjectCode(tender.projectCode, tender.id)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded text-xs flex items-center gap-1 transition-colors"
                            title="复制项目编号去官方大厅检索"
                          >
                            {copiedCodeId === tender.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">已复制编号</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>复制编号</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => setTagModalTender(tender)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded text-xs flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          <span>标签 ({tender.tags.length})</span>
                        </button>

                        {/* Direct jump with safety verification */}
                        <a
                          href={tender.sourceUrl || 'https://ggzyjy.sc.gov.cn/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                          title="前往该标讯所属的官方公共资源交易大厅"
                        >
                          <span>前往官方网站</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- PLATE 2: 历史标讯 (Past 3 Years Same Period) --- */}
      {activePlate === 'historical' && (
        <div className="space-y-4">
          {/* Historical Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-medium">同期年份:</span>
              {[
                { label: '全部近三年', value: 'all' as const },
                { label: '2025年同期', value: 2025 },
                { label: '2024年同期', value: 2024 },
                { label: '2023年同期', value: 2023 },
              ].map((yr) => (
                <button
                  key={String(yr.value)}
                  onClick={() => setHistoricalYearFilter(yr.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    historicalYearFilter === yr.value
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {yr.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-medium">标讯类型:</span>
              {['全部', '招标公告', '中标结果', '更正公告'].map((type) => (
                <button
                  key={type}
                  onClick={() => setHistoricalTypeFilter(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    historicalTypeFilter === type
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Historical Tender Cards */}
          {historicalTendersList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              暂无匹配的历史同期标讯记录。
            </div>
          ) : (
            <div className="space-y-3">
              {historicalTendersList.map((tender) => {
                return (
                  <div
                    key={tender.id}
                    className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                            {tender.historicalYear}年同期归档
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              tender.type === '招标公告'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : tender.type === '中标结果'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {tender.type}
                          </span>

                          {tender.projectCode && (
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-200/80">
                              文号: {tender.projectCode}
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400 font-mono">
                            历史原发布日：{tender.publishDate}
                          </span>
                        </div>

                        <button
                          onClick={() => handleToggleFavorite(tender.id)}
                          className="text-slate-300 hover:text-amber-500 p-1"
                          title={tender.isFavorite ? '取消标星' : '标星关注'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              tender.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Title: click to view in-app full text */}
                      <button
                        onClick={() => setInspectingTender(tender)}
                        className="text-left group flex items-start gap-1.5 text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors leading-snug w-full"
                      >
                        <span className="flex-1">{tender.title}</span>
                        <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
                      </button>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {tender.contentSnippet}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                        {tender.budget && (
                          <span className="font-bold text-slate-800 flex items-center gap-0.5 text-indigo-700">
                            <DollarSign className="w-3.5 h-3.5" />
                            同期金额: {tender.budget}
                          </span>
                        )}
                        <span>采购人/业主：{tender.buyerName || tender.agency}</span>
                        {tender.sourceWebsiteName && (
                          <span className="text-indigo-600 font-medium">
                            档案源：{tender.sourceWebsiteName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                        <button
                          onClick={() => setInspectingTender(tender)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center gap-1 font-medium transition-colors"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>历史公文核查</span>
                        </button>

                        {tender.projectCode && (
                          <button
                            onClick={() => handleCopyProjectCode(tender.projectCode, tender.id)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded text-xs flex items-center gap-1 transition-colors"
                            title="复制项目编号"
                          >
                            {copiedCodeId === tender.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-bold">已复制</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>复制文号</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => setTagModalTender(tender)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded text-xs flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          <span>标签 ({tender.tags.length})</span>
                        </button>

                        <a
                          href={tender.sourceUrl || 'https://www.ccgp.gov.cn/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <span>前往官方网站</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tender Verification & Inspection Modal (Full Official Public Notice Viewer) */}
      {inspectingTender && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">法定招投标公文详情与核验</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      公文全息预览 · 真实备案
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    已规避外部政务网防爬拦截与白屏问题，系统为您呈现完整公文文本与官方溯源通道
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingTender(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Unified Project Specification Card */}
            <div className="bg-slate-50 rounded-xl p-4.5 border border-slate-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {inspectingTender.title}
                </h4>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 border ${
                    inspectingTender.type === '招标公告'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : inspectingTender.type === '中标结果'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {inspectingTender.type}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">统一项目编号/文号</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-blue-700">
                    <span className="truncate">{inspectingTender.projectCode || '待发布编号'}</span>
                    {inspectingTender.projectCode && (
                      <button
                        onClick={() => handleCopyProjectCode(inspectingTender.projectCode, inspectingTender.id)}
                        className="text-slate-400 hover:text-blue-600"
                        title="复制项目文号"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">预算/最高限价</span>
                  <span className="font-mono font-bold text-amber-700">
                    {inspectingTender.budget || '以招标文件为准'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">发布时间</span>
                  <span className="font-mono font-semibold text-slate-700">{inspectingTender.publishDate}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">采购人/业主全称</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {inspectingTender.buyerName || inspectingTender.agency}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">招标代理机构</span>
                  <span className="font-semibold text-slate-700 truncate block">
                    {inspectingTender.agentName || '直接由采购人实施'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">投标截止与开标</span>
                  <span className="font-mono font-semibold text-slate-800 truncate block">
                    {inspectingTender.deadline || '详见公告'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">行政管辖区域</span>
                  <span className="font-semibold text-slate-700">
                    {inspectingTender.province} · {inspectingTender.city}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">联系人及电话</span>
                  <span className="font-semibold text-slate-700 truncate block">
                    {inspectingTender.contactPerson || '详见公文正文'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">法定权威发布源</span>
                  <span className="font-semibold text-blue-700 truncate block">
                    {inspectingTender.sourceWebsiteName || '官方公共资源交易大厅'}
                  </span>
                </div>
              </div>
            </div>

            {/* Official Full Notice Document Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <span>法定采购公文正文（规格与投标条款）</span>
                </h5>
                <button
                  onClick={() => handleCopyFullText(inspectingTender.fullNoticeText || inspectingTender.contentSnippet)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  {copiedTextSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">已复制公文全文</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>复制公文全文</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap font-sans select-text">
                {inspectingTender.fullNoticeText || inspectingTender.contentSnippet}
              </div>
            </div>

            {/* Verification Guidance & Anti-Blank Link Safety Hint */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>防白屏与官方网站双重核验说明：</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-800 leading-relaxed">
                <li>
                  <strong className="font-semibold">为何部分外部政务链接会跳首页或白屏？</strong> 多数省市政务采购网（如四川公资交易网、中采网）部署了动态防刷 WAF 防火墙或需要挂载政务 Session Cookie，若直接外部跳转可能无法直接进入详情页而跳回大厅主页。
                </li>
                <li>
                  <strong className="font-semibold">标准核验操作：</strong> 点击下方“复制统一编号”，打开官方交易平台大厅后，在搜索框直接粘贴【{inspectingTender.projectCode}】，即可立刻查看原始官方数字签章公文与在线投标入口。
                </li>
              </ul>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleCopyProjectCode(inspectingTender.projectCode, inspectingTender.id)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {copiedCodeId === inspectingTender.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">已复制项目编号</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" />
                    <span>复制编号去官网检索</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectingTender(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  关闭
                </button>
                <a
                  href={inspectingTender.sourceUrl || 'https://ggzyjy.sc.gov.cn/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <span>新窗口前往官方发布网站</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enter Real Tender Modal (Requirement: 政企团队自主录入与跟进真实项目) */}
      {showAddTenderModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">录入政企真实标讯与跟踪项目</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    支持政企要客部、企业部录入并推送实际跟踪的招采项目，全员同步关注
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTenderModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRealTender} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  标讯标题 / 采购项目全称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：成都市天府新区政务智算中心二期扩容公开招标公告"
                  value={addTitle}
                  onChange={(e) => setAddTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    政府采购/统一招标编号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例如：CDTF-2026-GK-0911"
                    value={addProjectCode}
                    onChange={(e) => setAddProjectCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">标讯类型</label>
                  <select
                    value={addType}
                    onChange={(e) => setAddType(e.target.value as TenderType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50"
                  >
                    <option value="招标公告">招标公告</option>
                    <option value="中标结果">中标结果</option>
                    <option value="更正公告">更正公告</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">预算/控制价 (元)</label>
                  <input
                    type="text"
                    placeholder="例如：￥3,800,000 元"
                    value={addBudget}
                    onChange={(e) => setAddBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">采购人单位全称</label>
                  <input
                    type="text"
                    placeholder="例如：四川天府新区新经济局"
                    value={addBuyer}
                    onChange={(e) => setAddBuyer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">投标截止与开标时间</label>
                  <input
                    type="text"
                    placeholder="例如：2026-09-28 10:00"
                    value={addDeadline}
                    onChange={(e) => setAddDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">联系人及电话</label>
                  <input
                    type="text"
                    placeholder="例如：张老师 028-68772390"
                    value={addContact}
                    onChange={(e) => setAddContact(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">省份</label>
                  <select
                    value={addProvince}
                    onChange={(e) => {
                      setAddProvince(e.target.value);
                      const cities = REGION_OPTIONS[e.target.value] || [];
                      setAddCity(cities[0] || '');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {Object.keys(REGION_OPTIONS).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">地市/区县</label>
                  <select
                    value={addCity}
                    onChange={(e) => setAddCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {(REGION_OPTIONS[addProvince] || []).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  官方发布源网址 (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://ggzyjy.sc.gov.cn/"
                  value={addSourceUrl}
                  onChange={(e) => setAddSourceUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  采购公告公文正文 (支持分段粘贴)
                </label>
                <textarea
                  rows={4}
                  placeholder="可在此粘贴采购需求、资质条件与开标说明..."
                  value={addFullText}
                  onChange={(e) => setAddFullText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTenderModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>提交录入并发布</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tag Management Modal */}
      {tagModalTender && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-blue-600" />
                <span>标讯自定义标签管理</span>
              </h3>
              <button
                onClick={() => setTagModalTender(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium line-clamp-2">
              {tagModalTender.title}
            </p>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {tagModalTender.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 flex items-center gap-1"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tagModalTender.id, tag)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="输入新标签名 (例如: 智慧城市、重点关注)"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagModalTender.id);
                  }
                }}
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => handleAddTag(tagModalTender.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

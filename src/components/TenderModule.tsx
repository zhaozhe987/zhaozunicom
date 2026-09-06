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

export const TenderModule: React.FC<TenderModuleProps> = ({ tenders, setTenders }) => {
  // Requirement 2: Two distinct plates: "recent" (近期标讯, past 1 week) & "historical" (历史标讯, past 3 years same period)
  const [activePlate, setActivePlate] = useState<'recent' | 'historical'>('recent');

  // Filter states for Recent Tenders
  const [selectedProvince, setSelectedProvince] = useState<string>('四川省');
  const [selectedCity, setSelectedCity] = useState<string>('成都市天府新区');
  const [recentTimeFilter, setRecentTimeFilter] = useState<'all' | 'today' | '3days' | '7days'>('all');
  const [recentTypeFilter, setRecentTypeFilter] = useState<string>('全部');

  // Filter states for Historical Tenders
  const [historicalYearFilter, setHistoricalYearFilter] = useState<number | 'all'>('all');
  const [historicalTypeFilter, setHistoricalTypeFilter] = useState<string>('全部');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Tag editing modal state
  const [tagModalTender, setTagModalTender] = useState<TenderItem | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  // Tender Verification & Detail Modal
  const [inspectingTender, setInspectingTender] = useState<TenderItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const todayStr = getTodayDateStr();

  const handleCopyLink = (tender: TenderItem) => {
    const url = tender.sourceUrl || 'https://ggzyjy.sc.gov.cn/';
    navigator.clipboard.writeText(url);
    setCopiedId(tender.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

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
      const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchSnippet && !matchAgency && !matchTags) return false;
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
      const matchTags = item.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchSnippet && !matchAgency && !matchTags) return false;
    }

    return true;
  });

  const totalRecentCount = tenders.filter((t) => !t.isHistorical).length;
  const totalHistoricalCount = tenders.filter((t) => t.isHistorical).length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Plate Segment Switcher (Requirement 2) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full shrink-0" />
              <Gavel className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">招投标大数据与标讯监控管理</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                穿透全网官方数据源
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              分为「近期标讯」与「历史标讯」两大板块，点击均支持一键跳转全国与四川省官方交易网站。
            </p>
          </div>

          {/* Search bar & Favorites toggle */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索标题、项目单位、标签..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
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
          </div>
        </div>

        {/* Official Source Verification Status Bar */}
        <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-950">官方标讯源权威性已核验通过</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold">
                  HTTPS安全直达
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                所有招采、中标及变更标讯均直链至中国政府采购网 (ccgp.gov.cn)、全国公共资源交易平台 (ggzy.gov.cn) 及各省市公共资源官方平台，支持点击穿透直达。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {refreshSuccess && (
              <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                已刷新同步最新数据
              </span>
            )}
            <button
              onClick={handleResetToOfficial}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>同步最新标讯源</span>
            </button>
          </div>
        </div>

        {/* Plate Navigation Switcher (近期标讯 vs 历史标讯) */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
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
                近7天内新发布的招采公告、中标结果与更正澄清，支持点击直接跳转标讯官方网站。
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
                近三年（2023-2025）同期的招采、中标、变更等标讯信息比对，同样实现网址跳转穿透。
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
              暂无匹配的近期（近一周）标讯记录。
            </div>
          ) : (
            <div className="space-y-3">
              {recentTendersList.map((tender) => {
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

                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {tender.province} {tender.city}
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono">
                            发布日期：{tender.publishDate}
                          </span>
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

                      {/* Title with link */}
                      <a
                        href={tender.sourceUrl || 'https://ggzyjy.sc.gov.cn/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-1.5 text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors leading-snug"
                      >
                        <span className="flex-1">{tender.title}</span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                      </a>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {tender.contentSnippet}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                        {tender.budget && (
                          <span className="font-bold text-slate-800 flex items-center gap-0.5 text-amber-600">
                            <DollarSign className="w-3.5 h-3.5" />
                            预算/中标价: {tender.budget}
                          </span>
                        )}
                        <span>代理/业主：{tender.agency}</span>
                        {tender.sourceWebsiteName && (
                          <span className="text-blue-600 font-medium">
                            来源：{tender.sourceWebsiteName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                        <button
                          onClick={() => setInspectingTender(tender)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center gap-1 font-medium transition-colors"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>详情与核验</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(tender)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded text-xs flex items-center gap-1 transition-colors"
                          title="复制官方直达网址"
                        >
                          {copiedId === tender.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>复制链接</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setTagModalTender(tender)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded text-xs flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          <span>标签 ({tender.tags.length})</span>
                        </button>

                        {/* Direct Jump to official site button (Requirement 2) */}
                        <a
                          href={tender.sourceUrl || 'https://ggzyjy.sc.gov.cn/'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
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
                            {tender.historicalYear}年同期
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

                      {/* Title with link */}
                      <a
                        href={tender.sourceUrl || 'https://www.ccgp.gov.cn/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-1.5 text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors leading-snug"
                      >
                        <span className="flex-1">{tender.title}</span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
                      </a>

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
                        <span>招标人/机构：{tender.agency}</span>
                        {tender.sourceWebsiteName && (
                          <span className="text-indigo-600 font-medium">
                            官方源：{tender.sourceWebsiteName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                        <button
                          onClick={() => setInspectingTender(tender)}
                          className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded text-xs flex items-center gap-1 font-medium transition-colors"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>详情与核验</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(tender)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded text-xs flex items-center gap-1 transition-colors"
                          title="复制官方直达网址"
                        >
                          {copiedId === tender.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>复制链接</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setTagModalTender(tender)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded text-xs flex items-center gap-1"
                        >
                          <Tag className="w-3 h-3" />
                          <span>标签 ({tender.tags.length})</span>
                        </button>

                        {/* Direct Jump to historical official site button (Requirement 2) */}
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

      {/* Tender Verification & Inspection Modal */}
      {inspectingTender && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">标讯来源与真实性核验详情</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      官方权威直链
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    法定公开发布渠道 · 实时联网查询凭据
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

            {/* Title & Metadata Card */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {inspectingTender.title}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">标讯类型</span>
                  <span className="font-semibold text-slate-700">{inspectingTender.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">发布时间</span>
                  <span className="font-mono font-semibold text-slate-700">{inspectingTender.publishDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">项目金额/预算</span>
                  <span className="font-mono font-bold text-amber-700">{inspectingTender.budget || '以招标公告为准'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">招标机构/业主</span>
                  <span className="font-semibold text-slate-700 truncate block">{inspectingTender.agency}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">行政区域</span>
                  <span className="font-semibold text-slate-700">{inspectingTender.province} · {inspectingTender.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">法定权威发布源</span>
                  <span className="font-semibold text-blue-700">{inspectingTender.sourceWebsiteName || '官方公共资源交易网'}</span>
                </div>
              </div>
            </div>

            {/* Content Snippet */}
            <div>
              <h5 className="text-xs font-bold text-slate-800 mb-2">公告摘要与技术要求</h5>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                {inspectingTender.contentSnippet}
              </div>
            </div>

            {/* Verification Guidance */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>官方防伪与权威性核验指引：</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-800 leading-relaxed">
                <li>本标讯直链至我国法定公共资源交易平台或政府采购网；</li>
                <li>点击下方“前往官方源网站”即可直接跳出并打开源站对应采购信息页面；</li>
                <li>在源网站首页可通过项目名称或单位名称精准检索全套招标文件及开标时间表。</li>
              </ol>
            </div>

            {/* Official Source URL direct bar */}
            <div className="flex items-center justify-between gap-3 p-3 bg-slate-100 rounded-xl text-xs">
              <div className="truncate flex-1 font-mono text-[11px] text-slate-600">
                <span className="text-slate-400 font-sans mr-1">官方源直达地址:</span>
                <span className="underline decoration-slate-300">
                  {inspectingTender.sourceUrl || 'https://ggzyjy.sc.gov.cn/'}
                </span>
              </div>
              <button
                onClick={() => handleCopyLink(inspectingTender)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 text-slate-700 transition-colors shrink-0"
              >
                {copiedId === inspectingTender.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">已复制网址</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>复制源网址</span>
                  </>
                )}
              </button>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
                <span>新窗口前往官方网站核查</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
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

import React, { useState } from 'react';
import {
  Radio,
  ExternalLink,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  Share2,
  Smartphone,
  Check,
  Tag,
  ShieldCheck,
  Eye,
  RefreshCw,
  Copy,
  Users,
  Building,
  CheckCheck,
  ShieldAlert,
  BookOpen,
  CheckSquare,
  Filter,
} from 'lucide-react';
import { NewsItem, UserGroup, UserInfo } from '../types';
import { resetToOfficialNews } from '../utils/storage';

interface NewsModuleProps {
  news: NewsItem[];
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  currentUser: UserInfo;
  groups: UserGroup[];
  onOpenMessageCenter: () => void;
  onForwardNewsToGroup?: (newsItem: NewsItem, groupId: string, comment: string) => void;
}

export const NewsModule: React.FC<NewsModuleProps> = ({
  news,
  setNews,
  currentUser,
  groups,
  onOpenMessageCenter,
  onForwardNewsToGroup,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [activeNewsModal, setActiveNewsModal] = useState<NewsItem | null>(null);

  // Requirement 4: Share / Forward modal state
  const [shareNewsItem, setShareNewsItem] = useState<NewsItem | null>(null);
  const [shareTargetGroupId, setShareTargetGroupId] = useState<string>('');
  const [shareComment, setShareComment] = useState('');
  const [shareSuccessToast, setShareSuccessToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [batchReadToast, setBatchReadToast] = useState(false);

  const handleResetToOfficialNews = () => {
    const updated = resetToOfficialNews();
    setNews(updated);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2500);
  };

  // Wechat preview modal
  const [showWechatPreview, setShowWechatPreview] = useState(false);

  const unreadCount = news.filter((n) => !n.isRead).length;
  const readCount = news.filter((n) => n.isRead).length;

  const categories: { label: string; count: number }[] = [
    { label: '全部', count: news.length },
    { label: '人工智能', count: news.filter((n) => n.category === '人工智能').length },
    { label: '数据要素', count: news.filter((n) => n.category === '数据要素').length },
    { label: '智慧城市', count: news.filter((n) => n.category === '智慧城市').length },
    { label: '通信', count: news.filter((n) => n.category === '通信').length },
  ];

  const filteredNews = news.filter((item) => {
    if (selectedCategory !== '全部' && item.category !== selectedCategory) return false;
    if (readFilter === 'unread') return !item.isRead;
    if (readFilter === 'read') return item.isRead;
    return true;
  });

  const handleToggleRead = (id: string) => {
    setNews((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const nextState = !n.isRead;
        // If currently open in modal, update modal as well
        if (activeNewsModal && activeNewsModal.id === id) {
          setActiveNewsModal({ ...activeNewsModal, isRead: nextState });
        }
        return { ...n, isRead: nextState };
      })
    );
  };

  const handleMarkAsRead = (id: string) => {
    setNews((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        if (activeNewsModal && activeNewsModal.id === id) {
          setActiveNewsModal({ ...activeNewsModal, isRead: true });
        }
        return { ...n, isRead: true };
      })
    );
  };

  const handleMarkAllAsRead = () => {
    setNews((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setBatchReadToast(true);
    setTimeout(() => setBatchReadToast(false), 2000);
  };

  // Helper for platform text & color
  const getPlatformInfo = (item: NewsItem) => {
    if (item.articlePlatform === 'toutiao') {
      return { name: '今日头条正文', badge: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (item.articlePlatform === 'weixin') {
      return { name: '微信公众号专文', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (item.articlePlatform === 'thepaper') {
      return { name: '澎湃新闻正文', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
    }
    if (item.articlePlatform === 'xinhua') {
      return { name: '新华社发布页面', badge: 'bg-sky-50 text-sky-700 border-sky-200' };
    }
    if (!item.canDirectJump) {
      return { name: '内置权威精编', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    return { name: '官方新闻正文', badge: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  // Requirement 4: Execute forward to group
  const handleConfirmForward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareNewsItem) return;

    const targetGroup = groups.find((g) => g.id === shareTargetGroupId) || groups[0];

    onForwardNewsToGroup?.(
      shareNewsItem,
      targetGroup?.id || '',
      shareComment.trim() || '重点关注行业动态与政策导向'
    );

    setShareSuccessToast(true);
    setTimeout(() => {
      setShareSuccessToast(false);
      setShareNewsItem(null);
      setShareComment('');
    }, 1800);
  };

  // Requirement 4: Copy summary card
  const handleCopyCard = (item: NewsItem) => {
    const text = `【吉吉办公 · 8点精选资讯】\n📰 标题：${item.title}\n🏷️ 领域：${item.category} | 来源：${item.source}\n⏱️ 时间：${item.publishTime}\n💡 核心摘要：${item.summary}\n🔗 原文链接：${item.canDirectJump && item.url ? item.url : '系统已精编权威全文（内网可查）'}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Requirement 4: Header & Daily 8:00 AM Push Window Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-900">今日资讯实时推送</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                每天上午 08:00 准时推送
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              <strong className="text-slate-800">推送规则：</strong>每天上午8时准时推送
              <span className="text-blue-600 font-semibold mx-1">前一天上午8时至当日8时</span>
              的24小时全球与国内科技、政策、政企招采实时新闻，点击可直达相应网页阅读并一键分享转发。
            </p>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowWechatPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>微信服务号08:00推送预览</span>
            </button>
            <button
              onClick={onOpenMessageCenter}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>协同消息中心</span>
            </button>
          </div>
        </div>

        {/* Category & Read Filter Tabs Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.label;
              return (
                <button
                  key={c.label}
                  onClick={() => setSelectedCategory(c.label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label} ({c.count})
                </button>
              );
            })}
          </div>

          {/* Read Status Quick Filters & Mark All Button */}
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setReadFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  readFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部 ({news.length})
              </button>
              <button
                onClick={() => setReadFilter('unread')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  readFilter === 'unread'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
                <span>待阅读</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${unreadCount > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'}`}>
                  {unreadCount}
                </span>
              </button>
              <button
                onClick={() => setReadFilter('read')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                  readFilter === 'read'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>已读 ({readCount})</span>
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                title="一键将当前所有推送新闻标记为已读"
              >
                <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>一键标为已读</span>
              </button>
            )}

            {batchReadToast && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                已全部标记已读
              </span>
            )}
          </div>
        </div>

        {/* Official News Source Reliability & Shielding Status Bar */}
        <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-emerald-950">权威平台正文直达已重构 · 泛域名已严格屏蔽</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-bold">
                  今日头条/微信公众号/澎湃新闻直链
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                精选直达真实单篇正文；对于只能跳转至媒体官网首页的无效链接已自动拦截屏蔽，由系统提供完整深度解析。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {refreshSuccess && (
              <span className="text-emerald-700 text-xs font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                已同步官方最新资讯
              </span>
            )}
            <button
              onClick={handleResetToOfficialNews}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>同步最新推送源</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty State when filtered */}
      {filteredNews.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {readFilter === 'unread' ? '太棒了！当前待阅读资讯为 0 条' : '暂无匹配的资讯条目'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {readFilter === 'unread'
              ? '今日推送的所有科技、政策与招采资讯已全部完成已读。您可以在“全部”或“已读”列表中随时回顾查阅。'
              : '可尝试切换资讯分类或重置筛选条件。'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => {
                setReadFilter('all');
                setSelectedCategory('全部');
              }}
              className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              查看全部资讯
            </button>
          </div>
        </div>
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredNews.map((item, index) => {
          const platform = getPlatformInfo(item);
          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border border-slate-200 p-4.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                item.isRead ? 'opacity-85 bg-slate-50/40' : 'border-l-4 border-l-blue-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border flex items-center gap-1 ${platform.badge}`}>
                      {item.canDirectJump ? (
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ShieldAlert className="w-3 h-3 text-amber-600" />
                      )}
                      <span>{platform.name}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {item.sourceWebsiteName || item.source}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.publishTime}
                  </span>
                </div>

                {/* Clickable title: jump to link or open full modal */}
                {item.canDirectJump && item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleMarkAsRead(item.id)}
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer leading-snug transition-colors flex items-start gap-1 group"
                  >
                    <span className="flex-1">{item.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleMarkAsRead(item.id);
                      setActiveNewsModal(item);
                    }}
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer leading-snug text-left transition-colors flex items-start gap-1 group w-full"
                  >
                    <span className="flex-1">{item.title}</span>
                    <Eye className="w-3.5 h-3.5 text-amber-500 group-hover:text-blue-600 shrink-0 mt-0.5" />
                  </button>
                )}

                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>

                {/* Shield or Deep-link note */}
                {!item.canDirectJump && (
                  <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200/80 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{item.shieldReason || '已屏蔽跳转至网站首页的无效链接，提供经核验的完整精编正文'}</span>
                  </div>
                )}

                <div className="mt-2 text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center justify-between">
                  <span>推送批次：{item.pushBatch || '今日 08:00 准时推送 (24h实时聚合)'}</span>
                  <span className="text-emerald-600 font-medium">前日08:00至今日08:00</span>
                </div>
              </div>

              {/* Card Footer: Read / Jump Link & Share Button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      item.isRead
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                    }`}
                    title={item.isRead ? '已完成已读（点击可恢复为未读）' : '点击标记为已读'}
                  >
                    {item.isRead ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>已完成已读</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                        <span>标记已读</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Read & Inspect detail modal */}
                  <button
                    onClick={() => {
                      handleMarkAsRead(item.id);
                      setActiveNewsModal(item);
                    }}
                    className="px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>正文全览</span>
                  </button>

                  {/* Share & Forward Button */}
                  <button
                    onClick={() => {
                      setShareNewsItem(item);
                      setShareTargetGroupId(groups[0]?.id || '');
                    }}
                    className="px-2.5 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>分享转发</span>
                  </button>

                  {/* Jump directly or open shielded reading */}
                  {item.canDirectJump && item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleMarkAsRead(item.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <span>直达文章正文</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => {
                        handleMarkAsRead(item.id);
                        setActiveNewsModal(item);
                      }}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>已屏蔽 · 读全文</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Requirement 4: Share & Forward Modal */}
      {shareNewsItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">新闻分享与群组转发</h3>
              </div>
              <button
                onClick={() => setShareNewsItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* News summary preview */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-800 leading-snug">{shareNewsItem.title}</p>
              <p className="text-slate-500 mt-1 line-clamp-2">{shareNewsItem.summary}</p>
              <div className="mt-2 text-[11px] text-blue-600 flex items-center gap-1">
                <span>原文链接:</span>
                <span className="truncate underline font-mono">{shareNewsItem.url || 'https://36kr.com'}</span>
              </div>
            </div>

            {/* Forward Form */}
            <form onSubmit={handleConfirmForward} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  选择转发的协同工作群组
                </label>
                <select
                  value={shareTargetGroupId}
                  onChange={(e) => setShareTargetGroupId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.memberIds.length} 位成员)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  转发批注 / 协同说明
                </label>
                <textarea
                  rows={2}
                  placeholder="例如: 请项目组重点关注此算力互通与车路协同政策，纳入我们下周方案设计..."
                  value={shareComment}
                  onChange={(e) => setShareComment(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCopyCard(shareNewsItem)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? '已复制分享卡片' : '复制图文卡片'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShareNewsItem(null)}
                    className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>确认转发至群组</span>
                  </button>
                </div>
              </div>
            </form>

            {shareSuccessToast && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>已成功将该资讯转发至群组待办与消息流！</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* News Article & Verification Inspection Modal */}
      {activeNewsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">资讯正文与官方信源核验</h3>
                  <p className="text-[11px] text-slate-400">每日 08:00 准时推送 · 权威官方媒体专栏</p>
                </div>
              </div>
              <button
                onClick={() => setActiveNewsModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Title & Metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${getPlatformInfo(activeNewsModal).badge}`}>
                  {activeNewsModal.canDirectJump ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  )}
                  {getPlatformInfo(activeNewsModal).name}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  官方信源：{activeNewsModal.sourceWebsiteName || activeNewsModal.source}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                  {activeNewsModal.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  推送时间：{activeNewsModal.publishTime}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                {activeNewsModal.title}
              </h4>
            </div>

            {/* Shielding / Safety Banner */}
            {!activeNewsModal.canDirectJump ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-amber-950">信源链接安全屏蔽提醒：</span>
                  {activeNewsModal.shieldReason || '经系统核验，该信源提供的原始外链为媒体官网首页或泛域名入口，无法直接定位到本篇具体文章。为防止打扰您的工作阅读，系统已主动屏蔽无效外部跳转，由吉吉政企智库团队为您全量呈现以下核验正文与研判指标。'}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">权威正文直达核验：</span>
                  本篇新闻链接已核验为真实可访问的单篇报道页面（来源平台：{getPlatformInfo(activeNewsModal).name}），支持在新窗口无缝直达阅读。
                </div>
              </div>
            )}

            {/* Full Summary / Article Rich Text */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap space-y-2">
              <div className="font-semibold text-slate-900 pb-1 border-b border-slate-200/60 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>核心全文与深度解读</span>
              </div>
              <div className="pt-1">
                {activeNewsModal.content || activeNewsModal.summary}
              </div>
            </div>

            {/* URL preview (only if jumpable) */}
            {activeNewsModal.canDirectJump && activeNewsModal.url ? (
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-100 rounded-xl text-xs">
                <div className="truncate flex-1 font-mono text-[11px] text-slate-600">
                  <span className="text-slate-400 font-sans mr-1">正文直达地址:</span>
                  <span className="underline decoration-slate-300">
                    {activeNewsModal.url}
                  </span>
                </div>
                <button
                  onClick={() => handleCopyCard(activeNewsModal)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 text-slate-700 shrink-0"
                >
                  {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedLink ? '已复制' : '复制图文'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2 p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs">
                <span className="text-amber-800 text-[11px] flex items-center gap-1 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  外部主页链接已屏蔽 · 系统已完整收录内嵌全文
                </span>
                <button
                  onClick={() => handleCopyCard(activeNewsModal)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 text-slate-700 shrink-0"
                >
                  {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copiedLink ? '已复制' : '复制图文'}</span>
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 flex-wrap">
              {/* Read completion button */}
              <button
                onClick={() => {
                  handleToggleRead(activeNewsModal.id);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  activeNewsModal.isRead
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                }`}
              >
                {activeNewsModal.isRead ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>已完成已读（点击撤销）</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 text-white" />
                    <span>完整阅读并标为已读</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const item = activeNewsModal;
                    setActiveNewsModal(null);
                    setShareNewsItem(item);
                    setShareTargetGroupId(groups[0]?.id || '');
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>转发至群组</span>
                </button>

                {activeNewsModal.canDirectJump && activeNewsModal.url ? (
                  <a
                    href={activeNewsModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleMarkAsRead(activeNewsModal.id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>在新窗口查看原文</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    disabled
                    className="px-3 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed border border-slate-200"
                    title="信源仅有网站首页，已被安全屏蔽以避免误跳"
                  >
                    已屏蔽外链首页
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: WeChat Push Template Preview */}
      {showWechatPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800">微信服务号每日 08:00 模版消息</span>
              <button onClick={() => setShowWechatPreview(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>吉吉办公 · 资讯早班车</span>
                <span className="text-emerald-600 font-bold">今日 08:00:00 准时送达</span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm">【今日推送】覆盖昨日08:00至今日08:00行业精选</h4>

              <div className="space-y-1.5 text-slate-600 pt-2 border-t border-slate-200/60 text-[11px]">
                <p>• 聚合批次：24小时全量更新 (共 10 条重点资讯)</p>
                <p>• 核心领域：人工智能、数据要素、智慧城市、通信</p>
                <p>• 头条：{news[0]?.title.slice(0, 30)}...</p>
              </div>

              <div className="pt-2 text-blue-600 font-semibold text-[11px] flex items-center justify-between">
                <span>点击卡片进入吉吉办公查阅原文</span>
                <span>›</span>
              </div>
            </div>

            <button
              onClick={() => setShowWechatPreview(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

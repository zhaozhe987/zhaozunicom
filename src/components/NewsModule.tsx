import React, { useState } from 'react';
import {
  Radio,
  ExternalLink,
  CheckCircle2,
  Clock,
  MessageSquare,
  Share2,
  Smartphone,
  Check,
  RefreshCw,
  Copy,
  Users,
  CheckCheck,
  Send,
  Sparkles,
} from 'lucide-react';
import { NewsItem, UserGroup, UserInfo } from '../types';
import { api } from '../utils/api';
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

  // Share / Forward modal state
  const [shareNewsItem, setShareNewsItem] = useState<NewsItem | null>(null);
  const [shareTargetGroupId, setShareTargetGroupId] = useState<string>('');
  const [shareComment, setShareComment] = useState('');
  const [shareSuccessToast, setShareSuccessToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [batchReadToast, setBatchReadToast] = useState(false);

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

  const handleToggleRead = async (id: string) => {
    setNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
    await api.toggleNewsRead(id);
  };

  const handleMarkAsRead = async (id: string) => {
    setNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await api.toggleNewsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setNews((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setBatchReadToast(true);
    await api.markAllNewsRead();
    setTimeout(() => setBatchReadToast(false), 2000);
  };

  const handleResetToOfficialNews = () => {
    const updated = resetToOfficialNews();
    setNews(updated);
    setRefreshSuccess(true);
    setTimeout(() => setRefreshSuccess(false), 2500);
  };

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

  const handleCopyCard = (item: NewsItem) => {
    const targetUrl = item.url || 'https://www.news.cn/';
    const text = `【吉吉办公 · 8点精选资讯】\n📰 标题：${item.title}\n🏷️ 领域：${item.category} | 来源：${item.source}\n⏱️ 时间：${item.publishTime}\n💡 核心摘要：${item.summary}\n🔗 原文精准直达链接：${targetUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Concise Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">今日资讯推送</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  08:00 准时推送
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                实时聚合近24小时前沿科技、产业政策与政企业务动态，点击即可直达权威原文完整网页。
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setShowWechatPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>微信端推送预览</span>
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

        {/* Clean Filter Tabs Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-4 pt-3.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto">
            {categories.map((c) => {
              const isSelected = selectedCategory === c.label;
              return (
                <button
                  key={c.label}
                  onClick={() => setSelectedCategory(c.label)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
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

          <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
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
                <span>待读</span>
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
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                title="一键将全部资讯标记为已读"
              >
                <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>一键已读</span>
              </button>
            )}

            {batchReadToast && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                已全部标为已读
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredNews.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {readFilter === 'unread' ? '太棒了！当前待阅读资讯为 0 条' : '暂无匹配资讯'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            今日推送的重点资讯已全部阅读完成。
          </p>
          <div className="mt-3">
            <button
              onClick={() => {
                setReadFilter('all');
                setSelectedCategory('全部');
              }}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              查看全部资讯
            </button>
          </div>
        </div>
      )}

      {/* Concise News Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredNews.map((item, index) => {
          const directUrl = item.url || 'https://www.news.cn/';
          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
                item.isRead ? 'opacity-80 bg-slate-50/50' : 'border-l-4 border-l-blue-600'
              }`}
            >
              <div>
                {/* Meta Bar */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      #{String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {item.sourceWebsiteName || item.source}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.publishTime}
                  </span>
                </div>

                {/* Direct Title Link to Complete Webpage */}
                <a
                  href={directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleMarkAsRead(item.id)}
                  className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer leading-snug transition-colors flex items-start gap-1 group block"
                  title="点击直达完整官方原文网页"
                >
                  <span className="flex-1 group-hover:underline">{item.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
                </a>

                {/* Concise Summary */}
                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                  {item.summary}
                </p>
              </div>

              {/* Card Footer: Accurate Direct Reading + Mark Read + Forward */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(item.id)}
                    className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                      item.isRead
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title={item.isRead ? '已完成已读（点击可恢复为未读）' : '点击标记为已读'}
                  >
                    {item.isRead ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>已读</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        <span>标为已读</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyCard(item)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    title="复制精要与原文链接"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setShareNewsItem(item);
                      setShareTargetGroupId(groups[0]?.id || '');
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Share2 className="w-3 h-3 text-slate-600" />
                    <span>转发到群组</span>
                  </button>

                  {/* Direct Jump Button to Original Webpage */}
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleMarkAsRead(item.id)}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                  >
                    <span>精准阅读原文</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Copy Toast */}
      {copiedLink && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>资讯摘要与直达原文链接已复制至剪贴板</span>
        </div>
      )}

      {/* Share to Group Modal */}
      {shareNewsItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">转发资讯至业务协同群组</h3>
              </div>
              <button
                onClick={() => setShareNewsItem(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmForward} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {shareNewsItem.category}
                </span>
                <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-2">
                  {shareNewsItem.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  来源：{shareNewsItem.source} · {shareNewsItem.publishTime}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  选择接收协同群组
                </label>
                {groups.length > 0 ? (
                  <select
                    value={shareTargetGroupId}
                    onChange={(e) => setShareTargetGroupId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.memberIds.length}人)
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-amber-600">暂无可用群组，请先在群组管理中创建</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  转发研判批注 (可选)
                </label>
                <textarea
                  value={shareComment}
                  onChange={(e) => setShareComment(e.target.value)}
                  placeholder="如：请项目专班重点研读该政策导向，结合天府新区项目推进准备..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShareNewsItem(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={groups.length === 0}
                  className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>确认推送到群组</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wechat Preview Modal */}
      {showWechatPreview && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-100 rounded-3xl max-w-sm w-full p-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">微信服务号 08:00 推送卡片</span>
              </div>
              <button
                onClick={() => setShowWechatPreview(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>吉吉办公官方服务号</span>
                <span>上午 08:00</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                【早报】吉吉办公 · 8点精选科技与政企业务动态
              </h3>
              <div className="space-y-2 pt-1 border-t border-slate-100">
                {news.slice(0, 4).map((item, idx) => (
                  <div key={item.id} className="text-xs flex items-start gap-1.5">
                    <span className="font-mono font-bold text-blue-600 shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-slate-700 line-clamp-1">{item.title}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                <span>阅读全文（权威原文直达）</span>
                <span>→</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <button
                onClick={() => setShowWechatPreview(false)}
                className="px-4 py-1.5 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                关闭预览
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

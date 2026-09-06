import React, { useState } from 'react';
import {
  StickyNote,
  Plus,
  Search,
  Tag,
  Paperclip,
  Clock,
  Trash2,
  Edit3,
  FileImage,
  File,
  X,
  Calendar,
  ExternalLink,
  Download,
} from 'lucide-react';
import { MemoItem } from '../types';
import { getTodayDateStr } from '../utils/storage';

interface MemoModuleProps {
  memos: MemoItem[];
  setMemos: React.Dispatch<React.SetStateAction<MemoItem[]>>;
}

export const MemoModule: React.FC<MemoModuleProps> = ({ memos, setMemos }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMemo, setEditingMemo] = useState<MemoItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('生活琐事');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [formReminder, setFormReminder] = useState('');
  const [formAttachments, setFormAttachments] = useState<
    { name: string; size: number; type: string; dataUrl?: string }[]
  >([]);

  // Pre-defined categories + dynamic ones from memos
  const existingCategories = Array.from(
    new Set(['体检', '旅行', '购物', '生活琐事', '家庭健康', ...memos.map((m) => m.category)])
  );

  // Filtered memos
  const filteredMemos = memos.filter((item) => {
    const matchCat = selectedCategory === '全部' || item.category === selectedCategory;
    const matchQuery =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleOpenCreate = () => {
    setEditingMemo(null);
    setFormTitle('');
    setFormContent('');
    setFormCategory('生活琐事');
    setCustomCategoryInput('');
    setFormReminder('');
    setFormAttachments([]);
    setShowAddModal(true);
  };

  const handleOpenEdit = (memo: MemoItem) => {
    setEditingMemo(memo);
    setFormTitle(memo.title);
    setFormContent(memo.content);
    setFormCategory(memo.category);
    setFormReminder(memo.reminderTime || '');
    setFormAttachments(memo.attachments || []);
    setShowAddModal(true);
  };

  const handleDeleteMemo = (id: string) => {
    if (window.confirm('确定删除该备忘录吗？')) {
      setMemos((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Handle local attachment selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        setFormAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (idx: number) => {
    setFormAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const finalCategory =
      formCategory === '__custom__' && customCategoryInput.trim()
        ? customCategoryInput.trim()
        : formCategory;

    const now = new Date();
    const timeStr = `${getTodayDateStr()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (editingMemo) {
      // Update
      setMemos((prev) =>
        prev.map((m) =>
          m.id === editingMemo.id
            ? {
                ...m,
                title: formTitle.trim(),
                content: formContent.trim(),
                category: finalCategory,
                reminderTime: formReminder || undefined,
                attachments: formAttachments,
                updatedAt: timeStr,
              }
            : m
        )
      );
    } else {
      // Add
      const newMemo: MemoItem = {
        id: `memo_${Date.now()}`,
        title: formTitle.trim(),
        content: formContent.trim(),
        category: finalCategory,
        reminderTime: formReminder || undefined,
        attachments: formAttachments,
        createdAt: timeStr,
        updatedAt: timeStr,
      };
      setMemos((prev) => [newMemo, ...prev]);
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-amber-500" />
              <span>生活备忘录</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              记录工作之外的体检、旅行、购物等生活琐事，支持图文附件与分类检索
            </p>
          </div>

          <button
            id="btn-create-memo"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>新建备忘</span>
          </button>
        </div>

        {/* Search and Category Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="input-memo-search"
              type="text"
              placeholder="搜索备忘标题或正文关键字..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            <button
              onClick={() => setSelectedCategory('全部')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === '全部'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部 ({memos.length})
            </button>
            {existingCategories.map((cat) => {
              const count = memos.filter((m) => m.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Memos Masonry / Grid */}
      {filteredMemos.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <StickyNote className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-700">没有找到匹配的备忘记录</p>
          <p className="text-xs text-slate-400 mt-1">可随时点击“新建备忘”记录生活琐事</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemos.map((memo) => (
            <div
              key={memo.id}
              id={`memo-card-${memo.id}`}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Tag className="w-3 h-3" />
                    {memo.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      id={`btn-edit-memo-${memo.id}`}
                      onClick={() => handleOpenEdit(memo)}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="编辑"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-delete-memo-${memo.id}`}
                      onClick={() => handleDeleteMemo(memo.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{memo.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 whitespace-pre-wrap leading-relaxed line-clamp-5">
                  {memo.content}
                </p>

                {/* Reminder badge if configured */}
                {memo.reminderTime && (
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50/70 px-2 py-1 rounded-md border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>提醒：{memo.reminderTime}</span>
                  </div>
                )}

                {/* Attachments pills */}
                {memo.attachments && memo.attachments.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                    <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      <span>附件 ({memo.attachments.length})</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {memo.attachments.map((att, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-[11px] text-slate-700 max-w-full truncate"
                        >
                          {att.type.startsWith('image') ? (
                            <FileImage className="w-3 h-3 text-blue-500 shrink-0" />
                          ) : (
                            <File className="w-3 h-3 text-slate-500 shrink-0" />
                          )}
                          <span className="truncate max-w-[120px]">{att.name}</span>
                          {att.dataUrl && (
                            <a
                              href={att.dataUrl}
                              download={att.name}
                              className="text-blue-600 hover:text-blue-800 ml-1"
                              title="下载附件"
                            >
                              <Download className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                <span>更新于 {memo.updatedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add or Edit Memo */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-amber-500" />
              <span>{editingMemo ? '编辑备忘录' : '新建备忘录'}</span>
            </h3>

            <form onSubmit={handleSaveMemo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  备忘标题 <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-memo-title"
                  type="text"
                  required
                  placeholder="例如：川西旅行出行准备"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">分类</label>
                  <select
                    id="select-memo-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value="生活琐事">生活琐事</option>
                    <option value="体检">体检</option>
                    <option value="旅行">旅行</option>
                    <option value="购物">购物</option>
                    <option value="家庭健康">家庭健康</option>
                    <option value="__custom__">+ 自定义分类...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">定时提醒（可选）</label>
                  <input
                    id="input-memo-reminder"
                    type="datetime-local"
                    value={formReminder}
                    onChange={(e) => setFormReminder(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {formCategory === '__custom__' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">输入自定义分类名称</label>
                  <input
                    type="text"
                    required
                    placeholder="如：投资研究 / 摄影灵感"
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-amber-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">正文详情</label>
                <textarea
                  id="input-memo-content"
                  rows={4}
                  placeholder="记录详细内容、清单项目或待办事宜..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              {/* Attachments upload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                    <span>上传附件（图片/文档，存储于本地沙箱）</span>
                  </label>
                </div>
                <input
                  id="input-memo-attachment"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />

                {formAttachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formAttachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-2.5 py-1 bg-slate-50 rounded-md text-xs border border-slate-200"
                      >
                        <span className="truncate max-w-[280px]">{att.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(i)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  id="btn-save-memo"
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
                >
                  保存备忘
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

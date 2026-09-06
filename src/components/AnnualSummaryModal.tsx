import React, { useState } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { TaskItem, MemoItem, HealthRecord } from '../types';
import { generateAnnualSummaryMd, downloadTextFile } from '../utils/storage';

interface AnnualSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  memos: MemoItem[];
  healthRecords: HealthRecord[];
}

export const AnnualSummaryModal: React.FC<AnnualSummaryModalProps> = ({
  isOpen,
  onClose,
  tasks,
  memos,
  healthRecords,
}) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const markdownContent = generateAnnualSummaryMd(selectedYear, tasks, memos, healthRecords);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadTextFile(`${selectedYear}年工作回顾.md`, markdownContent);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                年终总结自动生成器（《{selectedYear}年工作回顾.md》）
              </h3>
              <p className="text-[11px] text-slate-500">
                聚合当年所有任务、备忘录与健康指标，结构化生成月度/季度全景回顾报告
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between my-3 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">统计年份：</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            >
              <option value={2026}>2026 年</option>
              <option value={2025}>2025 年</option>
              <option value={2024}>2024 年</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制 Markdown' : '复制全文'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 .md 文档</span>
            </button>
          </div>
        </div>

        {/* Markdown Preview Area */}
        <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs leading-relaxed border border-slate-800 shadow-inner whitespace-pre-wrap">
          {markdownContent}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>根据《需求规格说明书第5章 自动化与数据流》标准格式渲染</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

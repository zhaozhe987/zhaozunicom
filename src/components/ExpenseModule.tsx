import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  PieChart as PieChartIcon,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Tv,
  HelpCircle,
  CalendarDays,
  Filter,
} from 'lucide-react';
import { ExpenseItem, ExpenseCategory } from '../types';
import {
  getTodayDateStr,
  exportExpensesToCSV,
  downloadTextFile,
} from '../utils/storage';

interface ExpenseModuleProps {
  expenses: ExpenseItem[];
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;
}

export const ExpenseModule: React.FC<ExpenseModuleProps> = ({ expenses, setExpenses }) => {
  const todayStr = getTodayDateStr();
  const currentYearMonth = todayStr.slice(0, 7); // YYYY-MM

  const [selectedMonth, setSelectedMonth] = useState<string>(currentYearMonth);
  const [selectedDay, setSelectedDay] = useState<string>(todayStr);
  const [viewMode, setViewMode] = useState<'overview' | 'calendar' | 'records'>('overview');

  // New expense form
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<ExpenseCategory>('餐饮');
  const [dateInput, setDateInput] = useState(todayStr);
  const [remarkInput, setRemarkInput] = useState('');

  // Category Icon & Color Mapping
  const categoryConfig: Record<
    ExpenseCategory,
    { icon: React.ReactNode; bg: string; text: string; barColor: string }
  > = {
    餐饮: {
      icon: <Utensils className="w-3.5 h-3.5" />,
      bg: 'bg-orange-50',
      text: 'text-orange-700 border-orange-200',
      barColor: 'bg-orange-500',
    },
    交通: {
      icon: <Car className="w-3.5 h-3.5" />,
      bg: 'bg-blue-50',
      text: 'text-blue-700 border-blue-200',
      barColor: 'bg-blue-500',
    },
    购物: {
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      bg: 'bg-pink-50',
      text: 'text-pink-700 border-pink-200',
      barColor: 'bg-pink-500',
    },
    居住: {
      icon: <Home className="w-3.5 h-3.5" />,
      bg: 'bg-indigo-50',
      text: 'text-indigo-700 border-indigo-200',
      barColor: 'bg-indigo-500',
    },
    娱乐: {
      icon: <Tv className="w-3.5 h-3.5" />,
      bg: 'bg-purple-50',
      text: 'text-purple-700 border-purple-200',
      barColor: 'bg-purple-500',
    },
    其他: {
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      bg: 'bg-slate-50',
      text: 'text-slate-700 border-slate-200',
      barColor: 'bg-slate-500',
    },
  };

  // Filter expenses by selected month
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const monthTotal = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);

  // Group by category for chart
  const categoryTotals: Record<ExpenseCategory, number> = {
    餐饮: 0,
    交通: 0,
    购物: 0,
    居住: 0,
    娱乐: 0,
    其他: 0,
  };

  monthlyExpenses.forEach((e) => {
    if (categoryTotals[e.category] !== undefined) {
      categoryTotals[e.category] += e.amount;
    } else {
      categoryTotals['其他'] += e.amount;
    }
  });

  // Calculate day-by-day totals for calendar
  const dayExpenseMap: Record<string, { total: number; count: number }> = {};
  monthlyExpenses.forEach((e) => {
    if (!dayExpenseMap[e.date]) {
      dayExpenseMap[e.date] = { total: 0, count: 0 };
    }
    dayExpenseMap[e.date].total += e.amount;
    dayExpenseMap[e.date].count += 1;
  });

  // Expenses for the currently clicked date
  const selectedDayExpenses = expenses.filter((e) => e.date === selectedDay);
  const selectedDayTotal = selectedDayExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Quick hand entry submit
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newRecord: ExpenseItem = {
      id: `exp_${Date.now()}`,
      amount: Math.round(parsedAmount * 100) / 100,
      category: categoryInput,
      date: dateInput || todayStr,
      remark: remarkInput.trim() || `${categoryInput}支出`,
      createdAt: `${dateInput || todayStr} ${timeStr}`,
    };

    setExpenses((prev) => [newRecord, ...prev]);
    setAmountInput('');
    setRemarkInput('');
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Export CSV
  const handleExportCSV = () => {
    const csv = exportExpensesToCSV(monthlyExpenses.length > 0 ? monthlyExpenses : expenses);
    downloadTextFile(`记账流水_${selectedMonth}.csv`, csv, 'text/csv;charset=utf-8');
  };

  // Export Monthly Markdown Report
  const handleExportMarkdown = () => {
    let md = `# 通崽助手 · 个人月度消费报表 (${selectedMonth})\n\n`;
    md += `> 导出时间：${new Date().toLocaleString()} | 统计笔数：${monthlyExpenses.length} 笔\n\n`;
    md += `## 一、本月消费概览\n`;
    md += `- **月度总支出**：￥${monthTotal.toFixed(2)} 元\n`;
    md += `- **日均支出**：￥${(monthTotal / 30).toFixed(2)} 元\n\n`;

    md += `## 二、分类占比分析\n`;
    (Object.keys(categoryTotals) as ExpenseCategory[]).forEach((cat) => {
      const amt = categoryTotals[cat];
      const pct = monthTotal > 0 ? ((amt / monthTotal) * 100).toFixed(1) : '0.0';
      md += `- **${cat}**：￥${amt.toFixed(2)} (${pct}%)\n`;
    });
    md += `\n`;

    md += `## 三、明细记录清单\n`;
    md += `| 日期 | 类别 | 金额(元) | 备注说明 |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    monthlyExpenses.forEach((e) => {
      md += `| ${e.date} | ${e.category} | ${e.amount.toFixed(2)} | ${e.remark} |\n`;
    });
    md += `\n---\n*完全手工录入，保障隐私*\n`;

    downloadTextFile(`月度消费报表_${selectedMonth}.md`, md);
  };

  // Generate calendar days for selected month
  const renderCalendarGrid = () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding before day 1
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`pad-${i}`} className="h-20 bg-slate-50/50 rounded-lg border border-transparent"></div>);
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
      const expenseData = dayExpenseMap[dayStr];
      const isSelected = selectedDay === dayStr;
      const isToday = dayStr === todayStr;

      days.push(
        <button
          key={dayStr}
          onClick={() => setSelectedDay(dayStr)}
          className={`h-20 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
            isSelected
              ? 'ring-2 ring-blue-600 bg-blue-50/40 border-blue-400'
              : isToday
              ? 'border-blue-300 bg-white'
              : 'border-slate-100 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span
              className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                isToday ? 'bg-blue-600 text-white' : 'text-slate-700'
              }`}
            >
              {d}
            </span>
            {expenseData && (
              <span className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded bg-red-50 text-red-600 border border-red-100">
                {expenseData.count}笔
              </span>
            )}
          </div>

          {expenseData ? (
            <div className="text-right">
              <span className="text-xs font-bold text-red-600 font-mono">
                -￥{expenseData.total.toFixed(0)}
              </span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-[10px] text-slate-300 font-mono">-</span>
            </div>
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Quick Manual Entry */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">记账本（纯手工录入 · 隐私优先）</h2>
          </div>
          <span className="text-xs text-slate-400">无任何第三方接口或自动抓取</span>
        </div>

        <form onSubmit={handleAddExpense} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">支出金额 (元)</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm font-bold text-slate-400">￥</span>
              <input
                id="input-expense-amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm font-bold font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">消费类别</label>
            <select
              id="select-expense-category"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="餐饮">餐饮 (午餐/咖啡/外卖)</option>
              <option value="交通">交通 (地铁/公交/打车/加油)</option>
              <option value="购物">购物 (日用品/服饰/数码)</option>
              <option value="居住">居住 (房租/水电/物业/网络)</option>
              <option value="娱乐">娱乐 (电影/聚会/旅游/运动)</option>
              <option value="其他">其他 (维修/医疗/突发)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">记账日期</label>
            <input
              id="input-expense-date"
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">详细备注说明</label>
            <input
              id="input-expense-remark"
              type="text"
              placeholder="例如：天府大道地铁充值"
              value={remarkInput}
              onChange={(e) => setRemarkInput(e.target.value)}
              className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="flex items-end">
            <button
              id="btn-submit-expense"
              type="submit"
              className="w-full py-2 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>快速记一笔</span>
            </button>
          </div>
        </form>
      </div>

      {/* Month Filter & Export Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">统计月份：</span>
            <input
              id="input-expense-month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden"
            />
          </div>

          {/* View Toggles & Exports */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('overview')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'overview' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                分类统计
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                日历视图
              </button>
              <button
                onClick={() => setViewMode('records')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  viewMode === 'records' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
                }`}
              >
                流水清单
              </button>
            </div>

            <button
              id="btn-export-expense-csv"
              onClick={handleExportCSV}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
              title="导出当前月份记账数据为 CSV 表格"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>导出 CSV</span>
            </button>
            <button
              id="btn-export-expense-md"
              onClick={handleExportMarkdown}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
              title="导出当前月份月度总结 Markdown"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>月度报表 (.md)</span>
            </button>
          </div>
        </div>

        {/* Month KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">本月总支出</p>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">￥{monthTotal.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">记账笔数</p>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">{monthlyExpenses.length} 笔</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">日均消费估算</p>
            <p className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              ￥{(monthTotal / (monthlyExpenses.length > 0 ? 30 : 1)).toFixed(1)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <p className="text-[11px] font-medium text-slate-500">最高支出分类</p>
            <p className="text-base font-bold text-slate-800 mt-1 truncate">
              {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[0] || '无'} (
              ￥{Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]?.[1]?.toFixed(0) || 0})
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Category breakdown bar charts */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-600" />
              <span>本月消费分类占比</span>
            </h3>

            <div className="space-y-4">
              {(Object.keys(categoryTotals) as ExpenseCategory[]).map((cat) => {
                const amt = categoryTotals[cat];
                const pct = monthTotal > 0 ? (amt / monthTotal) * 100 : 0;
                const conf = categoryConfig[cat];

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span className={`p-1 rounded-md ${conf.bg}`}>{conf.icon}</span>
                        {cat}
                      </span>
                      <span className="font-mono text-slate-800 font-semibold">
                        ￥{amt.toFixed(2)} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full ${conf.barColor} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick list of recent records in month */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">近期支出记录</h3>
              <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
                {monthlyExpenses.slice(0, 7).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{item.remark}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.date} · {item.category}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-red-600">-￥{item.amount.toFixed(2)}</span>
                  </div>
                ))}
                {monthlyExpenses.length === 0 && (
                  <p className="text-xs text-slate-400 py-6 text-center">本月暂无记账</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setViewMode('records')}
              className="mt-4 w-full py-2 text-center text-xs text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
            >
              查看全部流水明细 ({monthlyExpenses.length}条)
            </button>
          </div>
        </div>
      )}

      {/* Calendar View Mode */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Month Matrix */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>日历支出视图 ({selectedMonth})</span>
              </h3>
              <span className="text-xs text-slate-400">点击日期查看当日明细</span>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 mb-2">
              <span>日</span>
              <span>一</span>
              <span>二</span>
              <span>三</span>
              <span>四</span>
              <span>五</span>
              <span>六</span>
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1">{renderCalendarGrid()}</div>
          </div>

          {/* Selected Day Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">选中日期明细</p>
                <h4 className="text-base font-bold text-slate-800">{selectedDay}</h4>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">当日总计</p>
                <p className="text-base font-bold font-mono text-red-600">-￥{selectedDayTotal.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {selectedDayExpenses.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  当日无支出记录
                </div>
              ) : (
                selectedDayExpenses.map((e) => {
                  const conf = categoryConfig[e.category] || categoryConfig['其他'];
                  return (
                    <div
                      key={e.id}
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`p-1.5 rounded-md ${conf.bg}`}>{conf.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{e.remark}</p>
                          <span className="text-[10px] text-slate-400">{e.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-red-600">-￥{e.amount.toFixed(2)}</span>
                        <button
                          onClick={() => handleDeleteExpense(e.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="删除记录"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Records Table View Mode */}
      {viewMode === 'records' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm">
              消费流水列表 ({monthlyExpenses.length} 条)
            </h3>
            <span className="text-xs text-slate-400">数据永久保存于用户账户</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">记账日期</th>
                  <th className="px-4 py-2.5">分类</th>
                  <th className="px-4 py-2.5">备注说明</th>
                  <th className="px-4 py-2.5 text-right">支出金额</th>
                  <th className="px-4 py-2.5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {monthlyExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono">{item.date}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{item.remark}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-red-600">
                      -￥{item.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteExpense(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                        title="删除记录"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {monthlyExpenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      本月暂无记账数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

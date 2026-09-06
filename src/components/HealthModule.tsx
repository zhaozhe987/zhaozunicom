import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Smile,
  Meh,
  Frown,
  Laugh,
  Angry,
  Moon,
  Briefcase,
  Utensils,
  Footprints,
  Activity,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Save,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import { HealthRecord, MoodType, TaskItem } from '../types';
import {
  getTodayDateStr,
  calculateHealthScore,
  calculateWorkHoursFromTasks,
  formatDateDisplay,
  getWeekdayStr,
} from '../utils/storage';

interface HealthModuleProps {
  healthRecords: HealthRecord[];
  setHealthRecords: React.Dispatch<React.SetStateAction<HealthRecord[]>>;
  tasks: TaskItem[];
}

export const HealthModule: React.FC<HealthModuleProps> = ({
  healthRecords,
  setHealthRecords,
  tasks,
}) => {
  const todayStr = getTodayDateStr();

  // Find today's record or initialize
  const existingToday = healthRecords.find((r) => r.date === todayStr);

  const initialAutoWorkHours = calculateWorkHoursFromTasks(tasks, todayStr);

  const [mood, setMood] = useState<MoodType>(existingToday?.mood || 'good');
  const [sleepHours, setSleepHours] = useState<number>(existingToday?.sleepHours ?? 7.5);
  const [workHours, setWorkHours] = useState<number>(
    existingToday?.workHours ?? (initialAutoWorkHours > 0 ? initialAutoWorkHours : 7.0)
  );
  const [meals, setMeals] = useState<{ breakfast: boolean; lunch: boolean; dinner: boolean }>(
    existingToday?.meals || { breakfast: true, lunch: true, dinner: true }
  );
  const [steps, setSteps] = useState<number>(existingToday?.steps ?? 8500);
  const [exerciseNote, setExerciseNote] = useState<string>(existingToday?.exerciseNote || '晚间慢跑30分钟');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Re-calculate work hours if tasks change and user hasn't heavily custom overridden
  useEffect(() => {
    const autoHours = calculateWorkHoursFromTasks(tasks, todayStr);
    if (autoHours > 0 && (!existingToday || existingToday.workHoursCalculated)) {
      setWorkHours(autoHours);
    }
  }, [tasks, todayStr]);

  // Live calculated score for today
  const currentCalc = calculateHealthScore({
    mood,
    sleepHours,
    workHours,
    meals,
    steps,
    exerciseNote,
  });

  // Mood options configuration
  const moodOptions: {
    type: MoodType;
    label: string;
    score: number;
    icon: React.ReactNode;
    color: string;
    bg: string;
    border: string;
  }[] = [
    {
      type: 'happy',
      label: '开心 (100分)',
      score: 100,
      icon: <Laugh className="w-6 h-6 text-emerald-600" />,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
    },
    {
      type: 'good',
      label: '不错 (80分)',
      score: 80,
      icon: <Smile className="w-6 h-6 text-blue-600" />,
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-300',
    },
    {
      type: 'normal',
      label: '一般 (60分·默认)',
      score: 60,
      icon: <Meh className="w-6 h-6 text-amber-600" />,
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-300',
    },
    {
      type: 'down',
      label: '低落 (40分)',
      score: 40,
      icon: <Frown className="w-6 h-6 text-orange-600" />,
      color: 'text-orange-700',
      bg: 'bg-orange-50',
      border: 'border-orange-300',
    },
    {
      type: 'speechless',
      label: '无语 (20分)',
      score: 20,
      icon: <Angry className="w-6 h-6 text-rose-600" />,
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-300',
    },
  ];

  // Save current health record
  const handleSaveHealthRecord = () => {
    const updatedRecord: HealthRecord = {
      date: todayStr,
      mood,
      sleepHours,
      workHours,
      workHoursCalculated: true,
      meals,
      steps,
      exerciseNote: exerciseNote.trim(),
      score: currentCalc.score,
      scoreBreakdown: currentCalc.scoreBreakdown,
    };

    setHealthRecords((prev) => {
      const exists = prev.some((r) => r.date === todayStr);
      if (exists) {
        return prev.map((r) => (r.date === todayStr ? updatedRecord : r));
      } else {
        return [updatedRecord, ...prev];
      }
    });

    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  // Health Rating evaluation
  const getRatingBadge = (score: number) => {
    if (score >= 85) return { label: '状态极佳', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 70) return { label: '表现优良', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (score >= 55) return { label: '平稳达标', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: '急需休整', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const rating = getRatingBadge(currentCalc.score);

  // Past 7 days trends
  const pastRecordsSorted = [...healthRecords]
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(-7);

  return (
    <div className="space-y-6">
      {/* Top Banner: Score Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Hero Score Badge */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center shadow-md shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">今日健康指数</span>
              <span className="text-3xl font-extrabold font-mono mt-0.5">{currentCalc.score}</span>
              <span className="text-[10px] text-blue-100">满分 100</span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">健康综合评估</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${rating.color}`}>
                  {rating.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                依据《需求说明书3.7》标准加权算法：心情30% + 睡眠25% + 工作时长20% + 三餐打卡15% + 步数运动10%
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <span>{formatDateDisplay(todayStr)}</span>
                <span>({getWeekdayStr(todayStr)})</span>
                <span className="font-mono text-emerald-600 font-medium">每日21:00自动对齐工作日志</span>
              </div>
            </div>
          </div>

          {/* Quick Save button */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              id="btn-save-health-today"
              onClick={handleSaveHealthRecord}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {isSavedNotice ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{isSavedNotice ? '已保存记录' : '保存今日健康打卡'}</span>
            </button>
          </div>
        </div>

        {/* 5-Factor Score Breakdown Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>心情权重 (30%)</span>
              <span className="font-bold text-slate-800 font-mono">{currentCalc.scoreBreakdown.moodScore}分</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${currentCalc.scoreBreakdown.moodScore}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>睡眠权重 (25%)</span>
              <span className="font-bold text-slate-800 font-mono">{currentCalc.scoreBreakdown.sleepScore}分</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${currentCalc.scoreBreakdown.sleepScore}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>工作时长 (20%)</span>
              <span className={`font-bold font-mono ${currentCalc.scoreBreakdown.workScore === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {currentCalc.scoreBreakdown.workScore}分 {workHours <= 8 ? '(满分)' : ''}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  currentCalc.scoreBreakdown.workScore === 100 ? 'bg-emerald-500' : currentCalc.scoreBreakdown.workScore >= 70 ? 'bg-blue-500' : 'bg-rose-500'
                }`}
                style={{ width: `${currentCalc.scoreBreakdown.workScore}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>三餐规律 (15%)</span>
              <span className="font-bold text-slate-800 font-mono">{currentCalc.scoreBreakdown.mealScore}分</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${currentCalc.scoreBreakdown.mealScore}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>步数运动 (10%)</span>
              <span className="font-bold text-slate-800 font-mono">{currentCalc.scoreBreakdown.exerciseScore}分</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${currentCalc.scoreBreakdown.exerciseScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Input Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Interactive Form Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Factor 1: Mood Selection */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-emerald-600" />
                <span>1. 今日心情评价（30%权重）</span>
              </span>
              <span className="text-[11px] text-slate-400">未选择时系统默认“一般 (60分)”</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map((opt) => {
                const isSelected = mood === opt.type;
                return (
                  <button
                    key={opt.type}
                    id={`btn-mood-${opt.type}`}
                    type="button"
                    onClick={() => setMood(opt.type)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? `${opt.bg} ${opt.border} ring-2 ring-blue-500/20 shadow-xs font-bold`
                        : 'border-slate-200 hover:border-slate-300 bg-white opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="mb-1">{opt.icon}</div>
                    <span className="text-xs text-slate-800 font-medium truncate w-full text-center">
                      {opt.type === 'happy'
                        ? '开心'
                        : opt.type === 'good'
                        ? '不错'
                        : opt.type === 'normal'
                        ? '一般'
                        : opt.type === 'down'
                        ? '低落'
                        : '无语'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">{opt.score}分</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Factor 2: Sleep & Work Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sleep Input */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span>2. 睡眠时长 (25%)</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-indigo-700">{sleepHours} 小时</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">推荐7小时；不足每少1小时扣15分</p>
              <input
                id="input-sleep-hours"
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0h</span>
                <span>4h</span>
                <span className="font-bold text-indigo-600">7h (推荐)</span>
                <span>9h</span>
                <span>12h</span>
              </div>
            </div>

            {/* Work Hours Input (Linked to Tasks) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>3. 工作时长 (20%)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-blue-700">{workHours} 小时</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${workHours <= 8 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {workHours <= 8 ? '满分 100分' : `超${(workHours - 8).toFixed(1)}h 扣${Math.round((workHours - 8) * 10)}分`}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mb-2 leading-tight">
                ≤8小时身心无超负荷，得满分100分；超过8小时每超1小时线性扣10分。
              </p>
              <input
                id="input-work-hours"
                type="range"
                min="0"
                max="16"
                step="0.5"
                value={workHours}
                onChange={(e) => setWorkHours(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>0h(满分)</span>
                <span>4h</span>
                <span className="font-bold text-emerald-600">8h(满分分水岭)</span>
                <span>12h(60分)</span>
                <span className="text-rose-500">16h(20分)</span>
              </div>
            </div>
          </div>

          {/* Factor 3: Meals Checklist */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-orange-600" />
                <span>4. 三餐规律打卡 (15%权重)</span>
              </span>
              <span className="text-[11px] text-slate-400">3餐全吃满分，2餐60分，1餐20分</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'breakfast', label: '早餐按时' },
                { key: 'lunch', label: '午餐按时' },
                { key: 'dinner', label: '晚餐按时' },
              ].map((m) => {
                const checked = (meals as any)[m.key];
                return (
                  <label
                    key={m.key}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      checked ? 'bg-orange-50/70 border-orange-300 text-orange-800 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>{m.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setMeals({ ...meals, [m.key]: e.target.checked })
                      }
                      className="rounded text-orange-600 focus:ring-orange-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Factor 4: Steps & Exercise */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-purple-600" />
                <span>5. 步数与运动记录 (10%权重)</span>
              </span>
              <span className="text-[11px] text-slate-400">8000步满分；无步数有运动给60分</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">今日步数</label>
                <input
                  id="input-health-steps"
                  type="number"
                  step="100"
                  placeholder="如：8500"
                  value={steps}
                  onChange={(e) => setSteps(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">运动说明（选填）</label>
                <input
                  id="input-health-exercise"
                  type="text"
                  placeholder="如：跑步30分钟 / 瑜伽拉伸"
                  value={exerciseNote}
                  onChange={(e) => setExerciseNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 cols: Trends & History Chart */}
        <div className="lg:col-span-5 space-y-4">
          {/* Trend Chart (Last 7 Days) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>近 7 日评分趋势</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">均分: {Math.round(pastRecordsSorted.reduce((s, r) => s + r.score, 0) / (pastRecordsSorted.length || 1))}</span>
            </div>

            {/* Custom SVG / Bar Trend */}
            <div className="h-44 flex items-end justify-between gap-2 pt-4 pb-2 border-b border-slate-100">
              {pastRecordsSorted.map((item) => {
                const heightPct = Math.max(15, (item.score / 100) * 100);
                const isCurrentToday = item.date === todayStr;

                return (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono font-bold text-slate-700">
                      {item.score}
                    </span>
                    <div className="w-full bg-slate-100 rounded-t-md h-full flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isCurrentToday
                            ? 'bg-blue-600'
                            : item.score >= 80
                            ? 'bg-emerald-500'
                            : item.score >= 60
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono truncate w-full text-center">
                      {item.date.slice(5)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold text-slate-800">健康改善建议：</p>
              <div className="p-3 bg-blue-50/70 rounded-lg text-xs text-blue-900 border border-blue-200/70 space-y-1">
                {currentCalc.scoreBreakdown.sleepScore < 80 && (
                  <p>• 睡眠时长不足 7 小时，建议提前半小时放下手机，补充高质量深度睡眠。</p>
                )}
                {currentCalc.scoreBreakdown.workScore < 100 ? (
                  <p>• 今日工作时长已达 {workHours} 小时（超过8小时标准线），建议定时做眼保健操与肩颈拉伸，避免久坐与超时过劳。</p>
                ) : (
                  <p>• 今日工作时长 {workHours} 小时处于 ≤8 小时健康工时区间（100分满分），身心负荷处于健康舒适状态。</p>
                )}
                {currentCalc.scoreBreakdown.mealScore < 100 && (
                  <p>• 三餐规律性仍有提升空间，规律饮食有助于维持精力充沛。</p>
                )}
                {currentCalc.scoreBreakdown.sleepScore >= 80 && currentCalc.scoreBreakdown.workScore >= 80 && (
                  <p>• 今日作息与节奏十分平衡，继续保持良好的身心节奏！</p>
                )}
              </div>
            </div>
          </div>

          {/* Historical Log list */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-3">历史评估记录</h3>
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {healthRecords.slice(0, 5).map((r) => (
                <div key={r.date} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800">{r.date}</span>
                    <span className="text-slate-400 ml-2">睡眠 {r.sleepHours}h · 工作 {r.workHours}h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{r.score} 分</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

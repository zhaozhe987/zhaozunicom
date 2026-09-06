import React, { useState } from 'react';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Building2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { UserInfo, BrandingConfig } from '../types';
import { authenticateUser } from '../utils/storage';

interface LoginScreenProps {
  onLoginSuccess: (user: UserInfo) => void;
  branding: BrandingConfig;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, branding }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      const result = authenticateUser(username, password);
      setLoading(false);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMsg(result.message || '登录失败，请核实账号与密码');
      }
    }, 250);
  };

  const handleSelectQuickAccount = (quickUser: string, quickPass: string) => {
    setUsername(quickUser);
    setPassword(quickPass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 sm:p-6 text-slate-800">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 mb-3 border border-blue-400/30">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
            ) : (
              <Building2 className="w-7 h-7" />
            )}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {branding.appName || '办公助手'}
          </h1>
          <p className="text-xs text-blue-200/80 mt-1 font-medium">
            {branding.slogan || '跨端多用户协同与权限中枢 · 安全登录门户'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">统一身份认证与权限登入</h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
              RBAC 权限受控
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">登录认证失败：</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                登录账号 / 用户名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="请输入账号（如 admin、zhang_pm）"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>登录密码</span>
                <span className="text-[10px] text-slate-400 font-normal">默认初始密码: password123</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="请输入登录密码"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? '正在验证身份...' : '登录进入工作台'}</span>
            </button>
          </form>

          {/* Quick Demo Switcher for Evaluation */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>快速体验演示账号（点击自动填入）</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectQuickAccount('admin', 'password123')}
                className={`p-2 rounded-xl text-left border transition-all ${
                  username === 'admin'
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">系统管理员</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white font-mono">
                    admin
                  </span>
                </div>
                <p className="text-[10px] text-blue-700 mt-1 font-medium">
                  可访问管理控制台 / 权限管理
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('zhang_pm', 'password123')}
                className={`p-2 rounded-xl text-left border transition-all ${
                  username === 'zhang_pm'
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">项目经理</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                    主管
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  无控制台权限 / 禁止切换账号
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('li_dev', 'password123')}
                className={`p-2 rounded-xl text-left border transition-all ${
                  username === 'li_dev'
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">算法架构师</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                    成员
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  普通成员 / 无控制台权限
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickAccount('chen_oa', 'password123')}
                className={`p-2 rounded-xl text-left border transition-all ${
                  username === 'chen_oa'
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">行政专员</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                    成员
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  普通成员 / 无控制台权限
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-[11px] text-slate-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>严格权限保护：仅管理员可进入管理控制台，普通用户禁止随意切换账号。</span>
        </div>
      </div>
    </div>
  );
};

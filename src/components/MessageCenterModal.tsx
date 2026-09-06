import React from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Trash2,
  Radio,
  FileText,
  HeartPulse,
  Info,
  Check,
} from 'lucide-react';
import { AppNotification } from '../types';

interface MessageCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
}

export const MessageCenterModal: React.FC<MessageCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  setNotifications,
}) => {
  if (!isOpen) return null;

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleItemClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">App 消息中心</h3>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                {notifications.filter((n) => !n.isRead).length} 未读
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              全部已读
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleClearAll}
              className="text-xs text-slate-400 hover:text-red-600"
            >
              清空
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto my-3 divide-y divide-slate-100 pr-1">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-600">暂无新消息</p>
              <p className="text-[11px] text-slate-400 mt-0.5">所有资讯推送与办公任务完成通知将在此汇总</p>
            </div>
          ) : (
            notifications.map((notif) => {
              let icon = <Info className="w-4 h-4 text-blue-500" />;
              if (notif.type === 'news') icon = <Radio className="w-4 h-4 text-red-500" />;
              if (notif.type === 'office') icon = <FileText className="w-4 h-4 text-indigo-500" />;
              if (notif.type === 'health') icon = <HeartPulse className="w-4 h-4 text-emerald-500" />;

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif.id)}
                  className={`p-3 transition-colors cursor-pointer rounded-lg ${
                    notif.isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

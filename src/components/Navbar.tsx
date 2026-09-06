import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ModuleTab, UserInfo } from '../types';

export { Sidebar, Header };

interface NavbarProps {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  unreadNotificationCount: number;
  onOpenMessageCenter: () => void;
  onOpenAnnualSummary: () => void;
  user?: UserInfo;
  syncStatus?: 'synced' | 'syncing' | 'offline';
  healthScore?: number;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  return (
    <Header
      activeTab={props.activeTab}
      unreadNotificationCount={props.unreadNotificationCount}
      onOpenMessageCenter={props.onOpenMessageCenter}
      onOpenAnnualSummary={props.onOpenAnnualSummary}
      healthScore={props.healthScore}
      syncStatus={props.syncStatus}
    />
  );
};

import React from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import NotificationToastStack from '../notification/NotificationToastStack';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <NotificationToastStack />
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
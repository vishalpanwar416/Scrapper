import React from 'react';
import { Sidebar } from './Sidebar';
import { Toaster } from 'sonner';

export const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-0 overflow-auto">
        {children}
      </main>

      {/* Toast Notifications */}
      <Toaster
        theme="system"
        position="top-right"
        richColors
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { MobileNav } from '../components/MobileNav';
import { ViewType } from '../types';

interface MainLayoutProps {
  children: React.ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export function MainLayout({ children, currentView, onViewChange }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          currentView={currentView} 
          onViewChange={onViewChange}
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onCollapseToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64" onClick={(e) => e.stopPropagation()}>
            <Sidebar 
              currentView={currentView} 
              onViewChange={onViewChange}
              isOpen={sidebarOpen}
              isCollapsed={false}
              onToggle={() => setSidebarOpen(false)}
              onCollapseToggle={() => {}}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`pb-16 lg:pb-0 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav 
          currentView={currentView} 
          onViewChange={onViewChange}
          onMenuToggle={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
}
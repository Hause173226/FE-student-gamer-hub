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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          currentView={currentView} 
          onViewChange={onViewChange}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
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
              onToggle={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64 pb-16 lg:pb-0">
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
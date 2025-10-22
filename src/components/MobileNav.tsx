import React from 'react';
import { Home, Users, MessageSquare, Calendar, User, Menu } from 'lucide-react';
import clsx from 'clsx';
import { MOBILE_NAV_ITEMS } from '../constants';

interface MobileNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onMenuToggle: () => void;
}

export function MobileNav({
                            currentView,
                            onViewChange = () => {}, // <--- THÊM GIÁ TRỊ MẶC ĐỊNH
                            onMenuToggle
                          }: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-30">
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0',
                currentView === item.id
                  ? 'text-indigo-400'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={onMenuToggle}
          className="flex flex-col items-center justify-center px-3 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">Menu</span>
        </button>
      </div>
    </div>
  );
}
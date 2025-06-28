import React from 'react';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Calendar, 
  User, 
  Trophy,
  Star,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import clsx from 'clsx';
import { MENU_ITEMS } from '../constants';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ currentView, onViewChange, isOpen, onToggle }: SidebarProps) {
  return (
    <div className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 border-r border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">SGH</h1>
            <p className="text-xs text-gray-400">Student Gamer Hub</p>
          </div>
        </div>
        <button 
          onClick={onToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Profile Card */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">MN</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white">Minh Nguyễn</h3>
            <p className="text-xs text-gray-400">FPT University</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-yellow-400">Level 12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onViewChange(item.id);
                    onToggle();
                  }}
                  className={clsx(
                    'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors',
                    currentView === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Quick Stats */}
        <div className="mt-8 p-3 bg-gray-700 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">Hoạt động hôm nay</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Trận đấu</span>
              <span className="text-emerald-400 font-medium">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">XP kiếm được</span>
              <span className="text-yellow-400 font-medium">+150</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Thời gian online</span>
              <span className="text-blue-400 font-medium">4h 30m</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Cài đặt</span>
          </button>
          <button className="flex items-center justify-center px-3 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
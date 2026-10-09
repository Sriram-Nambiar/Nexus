import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Bot,
  CalendarDays,
  UploadCloud,
  X,
  GraduationCap,
} from 'lucide-react';

interface MobileNavProps {
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isDrawerOpen, onCloseDrawer }) => {
  const { isBackendLive, isMockForced, toggleForceMock } = useApp();

  const primaryBottomTabs = [
    { to: '/', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { to: '/courses', label: 'Courses', icon: <BookOpen className="w-5 h-5" /> },
    { to: '/search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { to: '/assistant', label: 'AI Study', icon: <Bot className="w-5 h-5" /> },
    { to: '/planner', label: 'Planner', icon: <CalendarDays className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-850 px-2 py-1 flex items-center justify-around safe-bottom">
        {primaryBottomTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-1.5 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`
            }
          >
            <span className="mb-0.5">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile Drawer (for Admin & Offline settings) */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseDrawer}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-zinc-950 border-r border-zinc-800 h-full flex flex-col justify-between p-5 z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-850">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-950">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-sm">NEXUS AI</span>
                </div>
                <button
                  onClick={onCloseDrawer}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <NavLink
                  to="/"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-900"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/courses"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-900"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Course Library</span>
                </NavLink>
                <NavLink
                  to="/search"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-900"
                >
                  <Search className="w-4 h-4" />
                  <span>Global Search</span>
                </NavLink>
                <NavLink
                  to="/assistant"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-900"
                >
                  <Bot className="w-4 h-4" />
                  <span>AI Study Assistant</span>
                </NavLink>
                <NavLink
                  to="/planner"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-900"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Study Planner</span>
                </NavLink>
                <NavLink
                  to="/admin/resources"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:bg-zinc-900"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Resource Manager</span>
                </NavLink>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Node Status:</span>
                {isBackendLive ? (
                  <span className="text-emerald-400 font-mono">Live Node</span>
                ) : (
                  <span className="text-amber-400 font-mono">Offline Cache</span>
                )}
              </div>
              <button
                onClick={toggleForceMock}
                className="w-full text-center py-1.5 px-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                {isMockForced ? 'Switch to Live API' : 'Simulate Offline Mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

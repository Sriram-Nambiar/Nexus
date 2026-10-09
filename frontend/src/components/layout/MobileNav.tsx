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
  Zap,
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
    { to: '/assistant', label: 'AI', icon: <Bot className="w-5 h-5" /> },
    { to: '/planner', label: 'Plan', icon: <CalendarDays className="w-5 h-5" /> },
    { to: '/search', label: 'Search', icon: <Search className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar: Neo-Brutalist #ffe17c */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ffe17c] border-t-2 border-black px-2 py-1.5 flex items-center justify-around select-none">
        {primaryBottomTabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-bold transition-all ${
                isActive
                  ? 'bg-black text-[#ffe17c] border-2 border-black shadow-hard-sm'
                  : 'text-black hover:bg-black/10'
              }`
            }
          >
            <span className="mb-0.5">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile Drawer (Admin & Offline settings) */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseDrawer}
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] bg-white border-r-2 border-black h-full flex flex-col justify-between p-6 z-10 shadow-hard-xl">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-black flex items-center justify-center border-2 border-black shadow-hard-sm">
                    <Zap className="w-5 h-5 text-[#ffe17c] fill-[#ffe17c]" />
                  </div>
                  <div>
                    <span className="font-heading text-xl font-extrabold text-black">NEXUS AI</span>
                    <div className="text-[10px] font-bold text-zinc-600 uppercase">Intranet Node</div>
                  </div>
                </div>
                <button
                  onClick={onCloseDrawer}
                  className="p-1.5 rounded-lg bg-[#f4f4f5] border-2 border-black text-black hover:bg-[#ffe17c] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                <NavLink
                  to="/"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-black font-bold text-sm bg-white hover:bg-[#ffe17c] transition-colors shadow-hard-sm"
                >
                  <LayoutDashboard className="w-4 h-4 text-black" />
                  <span>Home Landing Page</span>
                </NavLink>
                <NavLink
                  to="/courses"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-black font-bold text-sm bg-white hover:bg-[#ffe17c] transition-colors shadow-hard-sm"
                >
                  <BookOpen className="w-4 h-4 text-black" />
                  <span>Course Library & Videos</span>
                </NavLink>
                <NavLink
                  to="/assistant"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-black font-bold text-sm bg-white hover:bg-[#ffe17c] transition-colors shadow-hard-sm"
                >
                  <Bot className="w-4 h-4 text-black" />
                  <span>AI Study Assistant</span>
                </NavLink>
                <NavLink
                  to="/planner"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-black font-bold text-sm bg-white hover:bg-[#ffe17c] transition-colors shadow-hard-sm"
                >
                  <CalendarDays className="w-4 h-4 text-black" />
                  <span>Revision Planner</span>
                </NavLink>
                <NavLink
                  to="/search"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-black font-bold text-sm bg-white hover:bg-[#ffe17c] transition-colors shadow-hard-sm"
                >
                  <Search className="w-4 h-4 text-black" />
                  <span>Global Search</span>
                </NavLink>
                <NavLink
                  to="/admin/resources"
                  onClick={onCloseDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-black font-bold text-sm bg-[#ffe17c] hover:bg-black hover:text-[#ffe17c] transition-colors shadow-hard-sm"
                >
                  <UploadCloud className="w-4 h-4 text-black" />
                  <span>Resource Manager</span>
                </NavLink>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#f4f4f5] border-2 border-black text-xs space-y-3 shadow-hard-sm">
              <div className="flex items-center justify-between text-xs font-bold text-black">
                <span>Campus Node:</span>
                {isBackendLive ? (
                  <span className="text-emerald-700 font-mono">127.0.0.1:5000 Live</span>
                ) : (
                  <span className="text-amber-700 font-mono">Offline Cache</span>
                )}
              </div>
              <button
                onClick={toggleForceMock}
                className="w-full text-center py-2 px-3 rounded-lg bg-black text-white hover:bg-[#ffe17c] hover:text-black font-bold text-xs border-2 border-black transition-colors"
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

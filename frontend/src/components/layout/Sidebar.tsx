import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Search,
  Bot,
  CalendarDays,
  UploadCloud,
  Wifi,
  WifiOff,
  Server,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const { isBackendLive, isMockForced, toggleForceMock, health } = useApp();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/courses', label: 'Course Library', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/search', label: 'Global Search', icon: <Search className="w-4 h-4" /> },
    { to: '/assistant', label: 'AI Study Assistant', icon: <Bot className="w-4 h-4" /> },
    { to: '/planner', label: 'Study Planner', icon: <CalendarDays className="w-4 h-4" /> },
    { to: '/admin/resources', label: 'Resource Manager', icon: <UploadCloud className="w-4 h-4" /> },
  ];

  return (
    <aside
      className={`w-64 bg-zinc-950 border-r border-zinc-850 flex flex-col justify-between shrink-0 select-none ${className}`}
    >
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-850 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-950 shadow-md">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">NEXUS</span>
              <span className="text-xs px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 font-mono font-medium border border-purple-800/60">
                AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Offline Campus Learning</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800/90 text-white shadow-sm border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent'
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Backend & Offline Status Footer */}
      <div className="p-3.5 border-t border-zinc-850 bg-zinc-950/60 space-y-3">
        {/* Connection Status Indicator */}
        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-300 font-medium text-[11px]">Local Backend</span>
            </div>
            {isBackendLive ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                <Wifi className="w-3 h-3" /> Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/40">
                <WifiOff className="w-3 h-3" /> Offline / Cache
              </span>
            )}
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1 border-t border-zinc-800/80">
            <span>Simulate Offline</span>
            <button
              onClick={toggleForceMock}
              className="text-zinc-300 hover:text-white transition-colors"
              title="Toggle forced mock mode"
            >
              {isMockForced ? (
                <ToggleRight className="w-5 h-5 text-purple-400" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-zinc-600" />
              )}
            </button>
          </div>

          <div className="text-[10px] text-zinc-500 font-mono">
            AI Service: {health?.ai_service || 'offline_ready'}
          </div>
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context';
import { Search, Server, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isBackendLive } = useApp();

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Student Dashboard';
    if (path.startsWith('/courses/')) return 'Course Overview';
    if (path.startsWith('/courses')) return 'Course Library';
    if (path.startsWith('/search')) return 'Global Search';
    if (path.startsWith('/assistant')) return 'AI Study Assistant';
    if (path.startsWith('/planner')) return 'Study Revision Planner';
    if (path.startsWith('/admin')) return 'Resource Manager';
    return 'NEXUS AI';
  };

  return (
    <header className="h-14 border-b border-zinc-850 bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold text-zinc-200 tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut Trigger */}
        <button
          onClick={() => navigate('/search')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick search...</span>
          <kbd className="hidden lg:inline font-mono text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">
            Ctrl K
          </kbd>
        </button>

        {/* Backend Status indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
          <Server className="w-3 h-3 text-zinc-400" />
          <span className="hidden md:inline">Campus Node:</span>
          {isBackendLive ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Offline Cache
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

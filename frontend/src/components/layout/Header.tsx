import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context';
import { Zap, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const navigate = useNavigate();
  const { isBackendLive } = useApp();

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#ffe17c] border-b-2 border-black z-40 px-4 sm:px-8 flex items-center justify-between shrink-0">
      {/* Left: Mobile Toggle + Logo with a 10x10 black square icon containing a #ffe17c bolt */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg bg-black text-[#ffe17c] border-2 border-black shadow-hard-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-transform"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 bg-black flex items-center justify-center border-2 border-black shadow-hard-sm group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform">
            <Zap className="w-6 h-6 text-[#ffe17c] fill-[#ffe17c]" />
          </div>
          <div className="flex flex-col">
            <span className="font-heading text-2xl font-extrabold tracking-tighter text-black leading-none">
              NEXUS AI
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-black/75 hidden sm:inline">
              Campus Intranet OS
            </span>
          </div>
        </div>
      </div>

      {/* Center: Horizontal links in bold Satoshi */}
      <nav className="hidden lg:flex items-center gap-7 text-sm font-bold text-black">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `hover:underline underline-offset-4 decoration-2 transition-colors ${
              isActive ? 'underline font-extrabold text-black' : 'text-black/90'
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/courses"
          className={({ isActive }) =>
            `hover:underline underline-offset-4 decoration-2 transition-colors ${
              isActive ? 'underline font-extrabold text-black' : 'text-black/90'
            }`
          }
        >
          Courses
        </NavLink>
        <NavLink
          to="/assistant"
          className={({ isActive }) =>
            `hover:underline underline-offset-4 decoration-2 transition-colors ${
              isActive ? 'underline font-extrabold text-black' : 'text-black/90'
            }`
          }
        >
          AI Assistant
        </NavLink>
        <NavLink
          to="/planner"
          className={({ isActive }) =>
            `hover:underline underline-offset-4 decoration-2 transition-colors ${
              isActive ? 'underline font-extrabold text-black' : 'text-black/90'
            }`
          }
        >
          Study Planner
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `hover:underline underline-offset-4 decoration-2 transition-colors ${
              isActive ? 'underline font-extrabold text-black' : 'text-black/90'
            }`
          }
        >
          Global Search
        </NavLink>
        <NavLink
          to="/admin/resources"
          className={({ isActive }) =>
            `hover:underline underline-offset-4 decoration-2 transition-colors ${
              isActive ? 'underline font-extrabold text-black' : 'text-black/90'
            }`
          }
        >
          Resource Manager
        </NavLink>
      </nav>

      {/* Right: Status Pill & Neo-Brutalist Push Button */}
      <div className="flex items-center gap-3">
        {/* Campus Node Status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border-2 border-black text-xs font-mono font-bold text-black shadow-hard-sm">
          {isBackendLive ? (
            <span className="flex items-center gap-1.5 text-black">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse border border-black" />
              Node: 5000 Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-black">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-black" />
              Offline Cache
            </span>
          )}
        </div>

        {/* Start Free Trial button (Black background, white text, 2px border, hard shadow) */}
        <button
          onClick={() => navigate('/courses')}
          className="neo-btn-primary text-sm py-2 px-4 sm:py-2.5 sm:px-5 cursor-pointer"
        >
          Start Free Trial
        </button>
      </div>
    </header>
  );
};

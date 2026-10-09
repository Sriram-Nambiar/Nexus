import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { ResourceViewerModal } from '../resources/ResourceViewerModal';

export const AppLayout: React.FC = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#171e19] text-black font-sans antialiased flex flex-col">
      {/* Fixed Neo-Brutalist Header: h-20, #ffe17c, border-b-2 border-black */}
      <Header onToggleMobileMenu={() => setIsMobileDrawerOpen(true)} />

      {/* Main Content: offset by 80px (pt-20) for the fixed header */}
      <main className="flex-1 w-full pt-20 pb-24 lg:pb-0">
        <Outlet />
      </main>

      {/* Mobile Navigation Drawer & Bottom Bar */}
      <MobileNav
        isDrawerOpen={isMobileDrawerOpen}
        onCloseDrawer={() => setIsMobileDrawerOpen(false)}
      />

      {/* In-Browser PDF and Video Viewer Modal */}
      <ResourceViewerModal />
    </div>
  );
};

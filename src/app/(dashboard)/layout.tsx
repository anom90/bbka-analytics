'use client';

import * as React from 'react';
import AppSidebar from '@/components/common/app-sidebar';
import { DarkmodeToggle } from '@/components/common/darkmode-toggle';
import DashboardBreadcrumb from './_components/dashboard-breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, PanelLeft } from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

import { SessionCacheModal } from '@/components/common/session-cache-modal';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, toggleSidebar } = useUiStore();

  // Keyboard shortcut Ctrl+B / Cmd+B for sidebar toggle
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div className="flex min-h-screen bg-[#ffffff] dark:bg-[#0b1414] text-[#0e1a1a] dark:text-[#e8f0f0] transition-colors">
      {/* Collapsible Left Sidebar */}
      <AppSidebar />

      {/* Main Content Area (Expands to Full Width when sidebar is collapsed) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden transition-all duration-300">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-[#e2e8e8] dark:border-white/10 bg-white/95 dark:bg-[#0b1414]/95 backdrop-blur px-4 md:px-8 transition-colors">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSidebar}
              className={cn(
                'h-9 w-9 p-0 rounded-xl cursor-pointer transition-all',
                !isSidebarOpen
                  ? 'bg-[#e6f2f2] dark:bg-[#14312f] text-[#008080] dark:text-[#14a3a3] border-[#008080]/30 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
              )}
              title={isSidebarOpen ? 'Sembunyikan Sidebar (Ctrl+B)' : 'Tampilkan Sidebar (Ctrl+B)'}
            >
              <PanelLeft className="w-4 h-4" />
            </Button>

            <DashboardBreadcrumb />
          </div>

          <div className="flex items-center gap-2.5">
            <SessionCacheModal />
            <Badge
              variant="outline"
              className="hidden sm:flex items-center gap-1.5 bg-[#e6f2f2] text-[#0a6a6a] dark:bg-[#14312f] dark:text-[#7fdcdc] border-[#008080]/30 dark:border-[#14a3a3]/30 text-xs font-semibold py-1 px-2.5 rounded-full"
            >
              <GraduationCap className="size-3.5" />
              BBKA Analytics
            </Badge>
            <DarkmodeToggle />
          </div>
        </header>

        {/* Main Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

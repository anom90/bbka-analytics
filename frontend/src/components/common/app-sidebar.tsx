'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { SIDEBAR_MENU_LIST } from '@/constants/sidebar-constant';
import { Logo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { useDatasetStore } from '@/stores/dataset-store';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const { data, fileName } = useDatasetStore();
  const { isSidebarOpen, toggleSidebar } = useUiStore();

  return (
    <aside
      className={cn(
        'relative shrink-0 border-r border-[#e2e8e8] dark:border-white/10 bg-white dark:bg-[#101c1c] flex flex-col justify-between h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out select-none',
        isSidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Edge toggle button - matching bbka-course style */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={!isSidebarOpen ? 'Lebarkan sidebar (Ctrl+B)' : 'Ciutkan sidebar (Ctrl+B)'}
        aria-expanded={isSidebarOpen}
        title={!isSidebarOpen ? 'Lebarkan sidebar (Ctrl+B)' : 'Ciutkan sidebar (Ctrl+B)'}
        className="absolute top-5 -right-3 z-40 grid size-6 place-items-center rounded-full border border-[#e2e8e8] dark:border-white/15 bg-white dark:bg-[#142626] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
      >
        {!isSidebarOpen ? (
          <ChevronRight className="size-3.5" />
        ) : (
          <ChevronLeft className="size-3.5" />
        )}
      </button>

      <div className="flex flex-col h-full justify-between overflow-hidden">
        {/* Header / Brand Logo */}
        <div
          className={cn(
            'h-16 border-b border-[#e2e8e8] dark:border-white/10 flex items-center shrink-0 px-4 transition-all duration-300',
            !isSidebarOpen ? 'justify-center px-0' : 'justify-between'
          )}
        >
          <Logo compact={!isSidebarOpen} href="/data" />
        </div>

        {/* Navigation Menu List */}
        <nav
          aria-label="Navigasi Menu BBKA Analytics"
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-4 transition-all duration-300',
            !isSidebarOpen ? 'px-2' : 'px-3'
          )}
        >
          {SIDEBAR_MENU_LIST.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {/* Group Heading or Divider in Rail mode */}
              {!isSidebarOpen ? (
                gIdx > 0 && (
                  <div
                    role="separator"
                    className="mx-1 my-2.5 h-px bg-[#e2e8e8] dark:bg-white/10"
                  />
                )
              ) : (
                <h3 className="px-3 text-[10.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  {group.group}
                </h3>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.url ||
                    (item.url !== '/data' && pathname.startsWith(`${item.url}/`));

                  return (
                    <div key={item.url} className="relative group/nav-item">
                      <Link
                        href={item.url}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex h-11 items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200',
                          !isSidebarOpen ? 'justify-center px-0 w-full' : 'justify-start px-3 w-full',
                          isActive
                            ? 'bg-[#008080] text-white dark:bg-[#14a3a3] dark:text-[#04211f] font-semibold shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-[#e6f2f2] hover:text-[#0a6a6a] dark:hover:bg-[#14312f] dark:hover:text-[#7fdcdc]'
                        )}
                      >
                        <Icon
                          className={cn(
                            'size-5 shrink-0 transition-colors',
                            isActive
                              ? 'text-white dark:text-[#04211f]'
                              : 'text-zinc-400 dark:text-zinc-500 group-hover/nav-item:text-[#0a6a6a] dark:group-hover/nav-item:text-[#7fdcdc]'
                          )}
                        />
                        {isSidebarOpen && (
                          <span className="truncate whitespace-nowrap text-[13px]">{item.title}</span>
                        )}
                      </Link>

                      {/* Tooltip on Rail Mode (Collapsed) */}
                      {!isSidebarOpen && (
                        <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 hidden group-hover/nav-item:flex items-center whitespace-nowrap rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-white dark:text-zinc-900 shadow-xl ring-1 ring-black/10 transition-opacity">
                          <span>{item.title}</span>
                          {/* Caret triangle pointing left */}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer / Active Dataset Widget */}
        <div
          className={cn(
            'border-t border-[#e2e8e8] dark:border-white/10 bg-[#f1f5f5]/60 dark:bg-[#172626]/40 transition-all duration-300 shrink-0',
            !isSidebarOpen ? 'p-2 flex flex-col items-center' : 'p-3 space-y-2'
          )}
        >
          {!isSidebarOpen ? (
            <div className="relative group/footer-item w-full flex justify-center">
              <Link
                href="/data"
                className="p-2.5 rounded-xl bg-white dark:bg-[#101c1c] border border-[#e2e8e8] dark:border-white/10 text-[#008080] dark:text-[#14a3a3] hover:scale-105 transition-transform shadow-2xs flex items-center justify-center"
              >
                <Layers className="size-4.5" />
              </Link>
              {/* Tooltip for Footer Dataset */}
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 hidden group-hover/footer-item:flex flex-col whitespace-nowrap rounded-lg bg-zinc-900 dark:bg-zinc-100 px-3 py-2 text-xs text-white dark:text-zinc-900 shadow-xl ring-1 ring-black/10">
                <span className="font-semibold">{fileName || 'Belum ada dataset'}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                  {data.length > 0
                    ? `${data.length.toLocaleString()} responden aktif`
                    : 'Klik untuk memuat data'}
                </span>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100" />
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/data"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#101c1c] border border-[#e2e8e8] dark:border-white/10 shadow-2xs hover:border-[#008080]/40 transition-colors group/dataset"
              >
                <div className="p-2 bg-[#e6f2f2] dark:bg-[#14312f] rounded-lg text-[#008080] dark:text-[#14a3a3] shrink-0 group-hover/dataset:scale-105 transition-transform">
                  <Layers className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {fileName || 'Belum ada data'}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                    {data.length > 0
                      ? `${data.length.toLocaleString()} responden`
                      : 'Klik Data untuk muat'}
                  </p>
                </div>
              </Link>

              <div className="px-1 py-0.5 flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                <span>BBKA Platform</span>
                <span className="text-[#008080] dark:text-[#14a3a3] font-bold">
                  v2.0 Native
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

export default AppSidebar;

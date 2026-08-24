"use client";

import { Bell, Menu } from "lucide-react";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

export default function Header({ onMenuClick, unreadCount }: { onMenuClick: () => void; unreadCount: number }) {
  return (
    <header className="h-16 border-b border-black/[0.06] bg-white/80 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 gap-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button onClick={onMenuClick} className="lg:hidden w-9 h-9 shrink-0 flex items-center justify-center rounded-lg hover:bg-black/[0.04] text-ink-soft">
          <Menu size={19} />
        </button>
        <div className="hidden sm:block flex-1 max-w-xs">
          <SearchBar />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <UserMenu />
        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-black/[0.03] transition-colors">
          <Bell size={17} className="text-ink-soft" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-[3px] rounded-full bg-brand-500 text-white text-[9px] font-mono font-medium flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
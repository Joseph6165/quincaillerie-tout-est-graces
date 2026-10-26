"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import StockRuptureWatcher from "./StockRuptureWatcher";

export default function DashboardShell({
  children,
  badges,
  unreadCount,
}: {
  children: React.ReactNode;
  badges: Record<string, number>;
  unreadCount: number;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <StockRuptureWatcher />
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} badges={badges} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileOpen(true)} unreadCount={unreadCount} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
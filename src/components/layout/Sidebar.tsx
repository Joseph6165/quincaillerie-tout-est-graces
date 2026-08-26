"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, X } from "lucide-react";
import { useCurrentUser } from "@/context/UserContext";
import { getNavForRole } from "@/lib/roles";
import LogoutButton from "./LogoutButton";
import Image from "next/image";
export default function Sidebar({
  isOpen,
  onClose,
  badges,
}: {
  isOpen: boolean;
  onClose: () => void;
  badges: Record<string, number>;
}) {
  const { user } = useCurrentUser();
  const pathname = usePathname();
  const items = getNavForRole(user.role);

  const content = (
    <>
            <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Tout Est Grâce" width={36} height={36} className="rounded-lg shrink-0" />
          <div>
            <p className="text-sm font-semibold text-ink leading-tight">Tout Est Grâce</p>
            <p className="text-[10px] font-mono text-ink-faint">GESTION.QUINCAILLERIE</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-black/[0.04] text-ink-soft">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map((navItem) => {
          const active = pathname === navItem.href;
          const Icon = navItem.icon;
          const badgeValue = navItem.badgeKey ? badges[navItem.badgeKey] ?? 0 : 0;
          return (
            <Link key={navItem.href} href={navItem.href} onClick={onClose} className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm">
              {active && (
                <motion.div layoutId="sidebar-active" className="absolute inset-0 bg-brand-50 rounded-lg" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-brand-500 transition-all duration-200" style={{ height: active ? "60%" : 0 }} />
              <Icon size={17} className={`relative z-10 shrink-0 ${active ? "text-brand-600" : "text-ink-faint"}`} />
              <span className={`relative z-10 font-medium flex-1 ${active ? "text-brand-700" : "text-ink-soft"}`}>{navItem.label}</span>
              {badgeValue > 0 && (
                <span className="relative z-10 text-[10px] font-mono font-semibold bg-brand-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {badgeValue > 99 ? "99+" : badgeValue}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-black/[0.06] space-y-3">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white text-xs font-mono font-medium shrink-0">{user.initials}</div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-ink truncate">{user.name}</p>
            <p className="text-[10px] font-mono text-ink-faint truncate">{user.roleLabel.toUpperCase()}</p>
          </div>
        </div>
        <div className="px-1">
          <LogoutButton />
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 bg-white border-r border-black/[0.06] flex-col h-screen sticky top-0">{content}</aside>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-40 lg:hidden" />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className="fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col lg:hidden">
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
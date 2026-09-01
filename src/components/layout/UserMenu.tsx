"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, ChevronDown, Settings } from "lucide-react";
import { useCurrentUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function UserMenu() {
  const { user } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);
async function handleLogout() {
  await signOut({ redirect: false });
  router.push("/login");
  router.refresh();
}
  return (
    <div ref={ref} className="relative">
<button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">        <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white text-xs font-mono font-medium shrink-0">{user.initials}</div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-medium text-ink leading-tight">{user.name}</p>
          <p className="text-[10px] font-mono text-ink-faint">{user.roleLabel.toUpperCase()}</p>
        </div>
        <ChevronDown size={14} className={`text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 w-52 bg-white border border-black/[0.08] rounded-lg shadow-lg overflow-hidden z-30">
            {user.permissions.canManageSettings && (
              <Link href="/parametres" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft hover:bg-[#FAFAFA] transition-colors">
                <Settings size={15} />
                Paramètres
              </Link>
            )}
            <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <LogOut size={15} />
              Déconnexion
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full flex items-center gap-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg px-3 py-2.5 transition-colors"
    >
      <LogOut size={15} />
      Se déconnecter
    </button>
  );
}
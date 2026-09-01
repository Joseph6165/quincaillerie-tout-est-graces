"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg px-3 py-2.5 transition-colors"
    >
      <LogOut size={15} />
      Se déconnecter
    </button>
  );
}
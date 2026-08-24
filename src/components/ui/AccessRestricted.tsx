"use client";

import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useCurrentUser } from "@/context/UserContext";

export default function AccessRestricted() {
  const { user } = useCurrentUser();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center text-center py-24 px-6"
    >
      <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center mb-5">
        <ShieldAlert size={24} className="text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-ink mb-1.5">Accès non autorisé</h2>
      <p className="text-sm text-ink-soft max-w-sm mb-4">
        Votre rôle actuel ({user.roleLabel}) ne permet pas d'accéder à cette page.
        Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.
      </p>
      <span className="text-[10px] font-mono text-ink-faint border border-black/10 rounded px-2 py-1">
        RESTRICTION.ROLE — {user.role}
      </span>
    </motion.div>
  );
}
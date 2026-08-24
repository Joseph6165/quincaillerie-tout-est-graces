"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ROLE_LABELS } from "@/lib/roles";
import { deleteUser } from "@/app/(dashboard)/utilisateurs/actions";
import UserModal, { UserFormValues } from "./UserModal";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "VENDEUR" | "MAGASINIER";
  active: boolean;
}

export default function UtilisateursTable({ users }: { users: UserRow[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserFormValues | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(u: UserRow) {
    setEditing({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active });
    setModalOpen(true);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer le compte "${name}" ? Cette action est irréversible.`)) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteUser(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Une erreur est survenue.");
      }
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors">
          <Plus size={16} />
          Nouvel utilisateur
        </button>
      </div>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white border border-black/[0.06] rounded-xl overflow-hidden">
        {users.map((u, i) => (
          <div key={u.id} className={`flex items-center justify-between gap-3 px-5 py-3.5 text-sm hover:bg-[#FAFAFA] transition-colors ${i !== 0 ? "border-t border-black/[0.05]" : ""}`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-ink flex items-center justify-center text-white text-xs font-mono font-medium shrink-0">
                {u.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-ink font-medium truncate">{u.name}</p>
                <p className="font-mono text-[11px] text-ink-faint truncate">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-[11px] text-ink-faint hidden sm:inline">{ROLE_LABELS[u.role].toUpperCase()}</span>
              <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded ${u.active ? "bg-emerald-50 text-emerald-600" : "bg-black/[0.04] text-ink-faint"}`}>
                {u.active ? "ACTIF" : "INACTIF"}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(u)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-50 text-ink-faint hover:text-brand-600 transition-colors" title="Modifier">
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(u.id, u.name)} disabled={isPending} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-ink-faint hover:text-red-500 transition-colors" title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <UserModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  );
}
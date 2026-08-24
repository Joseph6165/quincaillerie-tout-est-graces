"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Search, Pencil, Trash2, Plus, Phone } from "lucide-react";
import { useCurrentUser } from "@/context/UserContext";
import { deleteClient } from "@/app/(dashboard)/clients/actions";
import ClientModal, { ClientFormValues } from "./ClientModal";

interface ClientRow {
  id: string;
  name: string;
  phone: string | null;
  achats: number;
  total: number;
}

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

export default function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const { user } = useCurrentUser();
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClientFormValues | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(c: ClientRow) {
    setEditing({ id: c.id, name: c.name, phone: c.phone });
    setModalOpen(true);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      await deleteClient(id);
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2.5 bg-white border border-black/[0.06] rounded-lg px-3.5 py-2.5 max-w-sm w-full sm:w-auto">
          <Search size={16} className="text-ink-faint" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un client..." className="flex-1 outline-none text-sm bg-transparent placeholder:text-ink-faint" />
        </div>
        {user.permissions.canManageClients && (
          <button onClick={openCreate} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors">
            <Plus size={16} />
            Nouveau client
          </button>
        )}
      </div>

      {/* Tableau — desktop / tablette */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="hidden md:block bg-white border border-black/[0.06] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-left">
              <th className="px-5 py-3 font-medium text-ink-soft">Client</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Contact</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Achats</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Total dépensé</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-5 py-3.5 text-ink font-medium">{c.name}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">{c.phone ?? "—"}</td>
                <td className="px-5 py-3.5 text-ink-soft">{c.achats}</td>
                <td className="px-5 py-3.5 font-mono text-xs font-medium text-ink">{formatXOF(c.total)}</td>
                <td className="px-5 py-3.5">
                  {user.permissions.canManageClients && (
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-50 text-ink-faint hover:text-brand-600 transition-colors" title="Modifier">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} disabled={isPending} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-ink-faint hover:text-red-500 transition-colors disabled:opacity-50" title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-sm text-ink-faint py-10">Aucun client ne correspond à votre recherche.</p>}
      </motion.div>

      {/* Cartes — mobile */}
      <div className="md:hidden space-y-3">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }} className="bg-white border border-black/[0.06] rounded-xl p-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-sm font-medium text-ink">{c.name}</p>
              <span className="font-mono text-xs font-medium text-ink">{formatXOF(c.total)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-soft mb-3">
              <span className="flex items-center gap-1.5">
                <Phone size={11} />
                {c.phone ?? "—"}
              </span>
              <span>{c.achats} achats</span>
            </div>
            {user.permissions.canManageClients && (
              <div className="flex gap-2 pt-2 border-t border-black/[0.05]">
                <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-ink-soft border border-black/10 rounded-lg py-2">
                  <Pencil size={12} /> Modifier
                </button>
                <button onClick={() => handleDelete(c.id, c.name)} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 border border-red-100 rounded-lg py-2">
                  <Trash2 size={12} /> Supprimer
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {user.permissions.canManageClients && <ClientModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />}
    </div>
  );
}
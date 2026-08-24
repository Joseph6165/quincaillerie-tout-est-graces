"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Plus, Phone, Truck, Pencil, Trash2 } from "lucide-react";
import { useCurrentUser } from "@/context/UserContext";
import { deleteSupplier } from "@/app/(dashboard)/fournisseurs/actions";
import SupplierModal, { SupplierFormValues } from "./SupplierModal";
import Pagination from "@/components/ui/Pagination";
interface SupplierRow {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  category: string | null;
  lastDeliveryLabel: string;
  lastDeliveryISO: string | null;
}

export default function FournisseursGrid({ suppliers }: { suppliers: SupplierRow[] }) {
  const { user } = useCurrentUser();
    const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(suppliers.length / pageSize));
  const pagedSuppliers = suppliers.slice((page - 1) * pageSize, page * pageSize);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierFormValues | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(s: SupplierRow) {
    setEditing({ id: s.id, name: s.name, contactName: s.contactName, phone: s.phone, category: s.category, lastDelivery: s.lastDeliveryISO });
    setModalOpen(true);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      await deleteSupplier(id);
    });
  }

  return (
    <div>
      {user.permissions.canManageSuppliers && (
        <div className="flex justify-end mb-4">
          <button onClick={openCreate} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors">
            <Plus size={16} />
            Nouveau fournisseur
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pagedSuppliers.map((f, i) => (
          <motion.div key={f.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.35, delay: i * 0.06 }} whileHover={{ y: -3 }} className="bg-white border border-black/[0.06] rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <Truck size={17} className="text-brand-600" />
              </div>
              {user.permissions.canManageSuppliers && (
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(f)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-brand-50 text-ink-faint hover:text-brand-600 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(f.id, f.name)} disabled={isPending} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-red-50 text-ink-faint hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            <h3 className="text-sm font-semibold text-ink mb-0.5">{f.name}</h3>
            <p className="text-xs text-ink-faint font-mono mb-3">{(f.category ?? "NON CLASSÉ").toUpperCase()}</p>
            <div className="space-y-1.5 text-xs text-ink-soft">
              <p>{f.contactName ?? "—"}</p>
              <p className="flex items-center gap-1.5">
                <Phone size={12} />
                {f.phone ?? "—"}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-black/[0.05] text-[11px] font-mono text-ink-faint">
              DERNIÈRE LIVRAISON — {f.lastDeliveryLabel}
            </div>
          </motion.div>
        ))}
        {suppliers.length === 0 && <p className="text-sm text-ink-faint col-span-full text-center py-10">Aucun fournisseur enregistré.</p>}
      </div>

      {user.permissions.canManageSuppliers && <SupplierModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />}
    </div>
  );
}
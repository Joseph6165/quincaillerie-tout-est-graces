"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createSupplier, updateSupplier } from "@/app/(dashboard)/fournisseurs/actions";

export interface SupplierFormValues {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  category: string | null;
  lastDelivery: string | null; // format YYYY-MM-DD pour l'input date
}

export default function SupplierModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: SupplierFormValues | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (editing) {
          await updateSupplier(editing.id, formData);
        } else {
          await createSupplier(formData);
        }
        onClose();
      } catch {
        setError("Une erreur est survenue. Vérifiez les champs.");
      }
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/40 z-50" />
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.25, ease: "easeOut" }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-ink">{editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/[0.04] text-ink-faint">
                  <X size={17} />
                </button>
              </div>

              <form action={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1.5">Nom de l'entreprise</label>
                  <input name="name" defaultValue={editing?.name} required placeholder="SODEQUI SARL" className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Contact</label>
                    <input name="contactName" defaultValue={editing?.contactName ?? ""} placeholder="Kokou Mensah" className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Téléphone</label>
                    <input name="phone" defaultValue={editing?.phone ?? ""} placeholder="+229 97 12 34 56" className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Catégorie</label>
                    <input name="category" defaultValue={editing?.category ?? ""} placeholder="Électricité" className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Dernière livraison</label>
                    <input name="lastDelivery" type="date" defaultValue={editing?.lastDelivery ?? ""} className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all" />
                  </div>
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 border border-black/10 text-ink-soft text-sm font-medium rounded-lg py-2.5 hover:bg-black/[0.02] transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={isPending} className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5 transition-colors">
                    {isPending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer le fournisseur"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createProduct, updateProduct } from "@/app/(dashboard)/produits/actions";

interface Category {
  id: string;
  name: string;
}

export interface ProductFormValues {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  stock: number;
  minStock: number;
  purchasePrice: number;
  sellingPrice: number;
}

export default function ProductModal({
  open,
  onClose,
  categories,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  editing: ProductFormValues | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        if (editing) {
          await updateProduct(editing.id, formData);
        } else {
          await createProduct(formData);
        }
        onClose();
      } catch {
        setError("Ce code produit existe déjà, ou une valeur est invalide.");
      }
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
<div className="bg-white rounded-xl w-full max-w-md p-5 sm:p-6 mx-4 shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-ink">
                  {editing ? "Modifier le produit" : "Nouveau produit"}
                </h2>
                <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/[0.04] text-ink-faint">
                  <X size={17} />
                </button>
              </div>

              <form action={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Code</label>
                    <input
                      name="code"
                      defaultValue={editing?.code}
                      required
                      placeholder="EX-0001"
                      className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Catégorie</label>
                    <select
                      name="categoryId"
                      defaultValue={editing?.categoryId ?? categories[0]?.id}
                      required
                      className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-soft mb-1.5">Nom du produit</label>
                  <input
                    name="name"
                    defaultValue={editing?.name}
                    required
                    placeholder="Marteau charpentier 500g"
                    className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Stock actuel</label>
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      defaultValue={editing?.stock ?? 0}
                      required
                      className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Seuil d'alerte</label>
                    <input
                      name="minStock"
                      type="number"
                      min={0}
                      defaultValue={editing?.minStock ?? 5}
                      required
                      className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Prix d'achat (XOF)</label>
                    <input
                      name="purchasePrice"
                      type="number"
                      min={0}
                      defaultValue={editing?.purchasePrice}
                      required
                      className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-soft mb-1.5">Prix de vente (XOF)</label>
                    <input
                      name="sellingPrice"
                      type="number"
                      min={0}
                      defaultValue={editing?.sellingPrice}
                      required
                      className="w-full border border-black/10 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 transition-all"
                    />
                  </div>
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 border border-black/10 text-ink-soft text-sm font-medium rounded-lg py-2.5 hover:bg-black/[0.02] transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
                  >
                    {isPending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer le produit"}
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
"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { createProduct } from "@/app/(dashboard)/produits/actions";

interface Category {
  id: string;
  name: string;
}

interface CreatedProduct {
  id: string;
  code: string;
  name: string;
  stock: number;
  sellingPrice: number;
}

export default function QuickAddProductModal({
  open,
  onClose,
  categories,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onCreated: (product: CreatedProduct) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const product = await createProduct(formData);
        onCreated(product);
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[60]" />
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4">
           <div className="bg-white rounded-xl w-full max-w-md p-5 sm:p-6 mx-4 shadow-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-ink">Nouveau produit rapide</h3>
                <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-black/[0.04] text-ink-faint">
                  <X size={15} />
                </button>
              </div>

              <form action={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input name="code" required placeholder="Code (EX-001)" className="border border-black/10 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
                  <select name="categoryId" defaultValue={categories[0]?.id} required className="border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100 bg-white">
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <input name="name" required placeholder="Nom du produit" className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
                <div className="grid grid-cols-2 gap-2">
                  <input name="stock" type="number" min={0} defaultValue={0} required placeholder="Stock" className="border border-black/10 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
                  <input name="minStock" type="number" min={0} defaultValue={5} required placeholder="Seuil alerte" className="border border-black/10 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input name="purchasePrice" type="number" min={0} required placeholder="Prix achat" className="border border-black/10 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
                  <input name="sellingPrice" type="number" min={0} required placeholder="Prix vente" className="border border-black/10 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
                </div>

                {error && <p className="text-xs text-red-500">{error}</p>}

                <button type="submit" disabled={isPending} className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-sm font-medium rounded-lg py-2.5 transition-colors">
                  {isPending ? "Création..." : "Créer et ajouter à la vente"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
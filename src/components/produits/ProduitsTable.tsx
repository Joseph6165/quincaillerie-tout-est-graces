"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import { useCurrentUser } from "@/context/UserContext";
import { getStockStatus, STOCK_STATUS_STYLES } from "@/lib/stock-alerts";
import { deleteProduct } from "@/app/(dashboard)/produits/actions";
import ProductModal, { ProductFormValues } from "./ProductModal";
import Pagination from "@/components/ui/Pagination";
import ScrollableTable from "@/components/ui/ScrollableTable";
interface ProductRow {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  category: string;
  stock: number;
  minStock: number;
  purchasePrice: number;
  sellingPrice: number;
}

interface Category {
  id: string;
  name: string;
}

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

export default function ProduitsTable({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: Category[];
}) {
  const { user } = useCurrentUser();
  const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
  const pageSize = 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductFormValues | null>(null);
  const [isPending, startTransition] = useTransition();
  const filteredAll = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.code.toLowerCase().includes(query.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredAll.length / pageSize));
  const filtered = filteredAll.slice((page - 1) * pageSize, page * pageSize);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(p: ProductRow) {
    setEditing({
      id: p.id,
      code: p.code,
      name: p.name,
      categoryId: p.categoryId,
      stock: p.stock,
      minStock: p.minStock,
      purchasePrice: p.purchasePrice,
      sellingPrice: p.sellingPrice,
    });
    setModalOpen(true);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer "${name}" ?`)) return;
    startTransition(async () => {
      await deleteProduct(id);
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2.5 bg-white border border-black/[0.06] rounded-lg px-3.5 py-2.5 max-w-sm w-full sm:w-auto">
          <Search size={16} className="text-ink-faint" />
          <input
            value={query}
           onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Rechercher "
            className="flex-1 outline-none text-sm bg-transparent placeholder:text-ink-faint"
          />
        </div>
        {user.permissions.canManageProducts && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
          >
            <Plus size={16} />
            Nouveau produit
          </button>
        )}
      </div>

           <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white border border-black/[0.06] rounded-xl overflow-hidden"
      >
        <ScrollableTable>
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-black/[0.06] text-left">
              <th className="px-5 py-3 font-mono text-[11px] text-ink-faint font-medium">CODE</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Produit</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Catégorie</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Stock</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Statut</th>
              {user.permissions.canEditPrices && (
                <th className="px-5 py-3 font-medium text-ink-soft">Prix d'achat</th>
              )}
              <th className="px-5 py-3 font-medium text-ink-soft">Prix de vente</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {filtered.map((p) => {
              const status = getStockStatus(p.stock, p.minStock);
              const style = STOCK_STATUS_STYLES[status];
              return (
                <tr key={p.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-brand-600 font-medium">{p.code}</td>
                  <td className="px-5 py-3.5 text-ink font-medium">{p.name}</td>
                  <td className="px-5 py-3.5 text-ink-soft">{p.category}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-ink">{p.stock} u</td>
                  <td className="px-5 py-3.5">
                    <span className={`font-mono text-[10px] font-medium px-2 py-0.5 rounded ${style.badge}`}>
                      {style.label}
                    </span>
                  </td>
                  {user.permissions.canEditPrices && (
                    <td className="px-5 py-3.5 font-mono text-xs text-ink-soft">{formatXOF(p.purchasePrice)}</td>
                  )}
                  <td className="px-5 py-3.5 font-mono text-xs text-ink font-medium">{formatXOF(p.sellingPrice)}</td>
                  <td className="px-5 py-3.5">
                    {user.permissions.canManageProducts && (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(p)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-50 text-ink-faint hover:text-brand-600 transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={isPending}
                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 text-ink-faint hover:text-red-500 transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-ink-faint py-10">Aucun produit ne correspond à votre recherche.</p>
        )}
                </ScrollableTable>
      </motion.div>
       <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {user.permissions.canManageProducts && (
        <ProductModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          categories={categories}
          editing={editing}
        />
      )}
    </>
  );
}
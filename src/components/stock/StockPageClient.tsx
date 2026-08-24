"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import StockMovementModal from "./StockMovementModal";

interface MovementRow {
  id: string;
  date: string;
  code: string;
  produit: string;
  qte: number;
  previousStock: number | null;
  newStock: number | null;
  fournisseur: string;
  auteur: string;
}

export default function StockPageClient({
  movements,
  products,
  suppliers,
}: {
  movements: MovementRow[];
  products: { id: string; code: string; name: string; stock: number }[];
  suppliers: { id: string; name: string; phone: string | null }[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.max(1, Math.ceil(movements.length / pageSize));
  const paged = movements.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors">
          <Plus size={16} />
          Nouvelle réception
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white border border-black/[0.06] rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/[0.06] text-left">
              <th className="px-5 py-3 font-mono text-[11px] text-ink-faint font-medium">DATE</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Fournisseur</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Produit</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Quantité initiale</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Apportée</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Quantité finale</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Auteur</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {paged.map((m) => (
              <tr key={m.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-ink-faint">{m.date}</td>
                <td className="px-5 py-3.5 text-ink font-medium">{m.fournisseur}</td>
                <td className="px-5 py-3.5">
                  <p className="text-ink">{m.produit}</p>
                  <p className="font-mono text-[11px] text-ink-faint">{m.code}</p>
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-ink-faint">{m.previousStock ?? "—"} u</td>
                <td className="px-5 py-3.5 font-mono text-xs font-medium text-emerald-600">+{m.qte} u</td>
                <td className="px-5 py-3.5 font-mono text-xs font-medium text-brand-600">{m.newStock ?? "—"} u</td>
                <td className="px-5 py-3.5 text-ink-soft">{m.auteur}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && <p className="text-center text-sm text-ink-faint py-10">Aucune réception enregistrée.</p>}
      </motion.div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <StockMovementModal open={modalOpen} onClose={() => setModalOpen(false)} products={products} suppliers={suppliers} />
    </div>
  );
}
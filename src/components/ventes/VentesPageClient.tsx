"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Plus, Receipt, FileDown } from "lucide-react";
import SaleModal from "./SaleModal";
import { getSaleReceipt } from "@/app/(dashboard)/ventes/actions";
import { downloadReceiptPDF } from "@/lib/receipt-pdf";
import Pagination from "@/components/ui/Pagination";
import ScrollableTable from "@/components/ui/ScrollableTable";
interface SaleRow {
  id: string;
  num: string;
  date: string;
  client: string;
  vendeur: string;
  articles: number;
  total: number;
}

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

export default function VentesPageClient({
  sales,
  clients,
  products,
  categories,
  currentUserName,
}: {
  sales: SaleRow[];
  clients: { id: string; name: string; phone: string | null; email: string | null }[];
  products: { id: string; code: string; name: string; stock: number; sellingPrice: number }[];
  categories: { id: string; name: string }[];
  currentUserName: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
    const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sales.length / pageSize));
  const pagedSales = sales.slice((page - 1) * pageSize, page * pageSize);

  function handlePrintReceipt(saleId: string) {
    startTransition(async () => {
      const receipt = await getSaleReceipt(saleId);
      downloadReceiptPDF(receipt);
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors">
          <Plus size={16} />
          Nouvelle vente
        </button>
      </div>

           <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="hidden md:block bg-white border border-black/[0.06] rounded-xl overflow-hidden">
        <ScrollableTable>
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-black/[0.06] text-left">
              <th className="px-5 py-3 font-mono text-[11px] text-ink-faint font-medium">N° VENTE</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Date</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Client</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Articles</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Total</th>
              <th className="px-5 py-3 font-medium text-ink-soft">Vendeur</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {pagedSales.map((s) => (
              <tr key={s.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-brand-600 font-medium">#{s.num}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-ink-faint">{s.date}</td>
                <td className="px-5 py-3.5 text-ink font-medium">{s.client}</td>
                <td className="px-5 py-3.5 text-ink-soft">{s.articles}</td>
                <td className="px-5 py-3.5 font-mono text-xs font-medium text-ink">{formatXOF(s.total)}</td>
                <td className="px-5 py-3.5 text-ink-soft">{s.vendeur}</td>
                <td className="px-5 py-3.5">
                  <button onClick={() => handlePrintReceipt(s.id)} disabled={isPending} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-brand-50 text-ink-faint hover:text-brand-600 transition-colors ml-auto" title="Télécharger le reçu">
                    <FileDown size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sales.length === 0 && <p className="text-center text-sm text-ink-faint py-10">Aucune vente enregistrée pour le moment.</p>}
        </ScrollableTable>
      </motion.div>

      <div className="md:hidden space-y-3">
        {pagedSales.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-20px" }} transition={{ duration: 0.3, delay: i * 0.05 }} className="bg-white border border-black/[0.06] rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Receipt size={14} className="text-brand-500" />
                <span className="font-mono text-xs font-medium text-brand-600">#{s.num}</span>
              </div>
              <span className="font-mono text-xs text-ink-faint">{s.date}</span>
            </div>
            <p className="text-sm font-medium text-ink mb-1">{s.client}</p>
            <div className="flex items-center justify-between text-xs text-ink-soft mb-2">
              <span>{s.articles} article{s.articles > 1 ? "s" : ""} — {s.vendeur}</span>
              <span className="font-mono font-medium text-ink">{formatXOF(s.total)}</span>
            </div>
            <button onClick={() => handlePrintReceipt(s.id)} className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-ink-soft border border-black/10 rounded-lg py-2">
              <FileDown size={12} /> Télécharger le reçu
            </button>
          </motion.div>
        ))}
      </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <SaleModal open={modalOpen} onClose={() => setModalOpen(false)} clients={clients} products={products} categories={categories} currentUserName={currentUserName} />
    </div>
  );
}
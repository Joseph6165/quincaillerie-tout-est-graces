"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileDown, FileSpreadsheet } from "lucide-react";
import Pagination from "@/components/ui/Pagination";
import { exportActivityToPDF, exportActivityToExcel, TableRow } from "@/lib/export-table";
import ScrollableTable from "@/components/ui/ScrollableTable";
export default function ActivityLogTable({ rows }: { rows: TableRow[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paged = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        <button onClick={() => exportActivityToPDF(rows)} className="flex items-center gap-2 border border-black/10 text-ink-soft text-sm font-medium rounded-lg px-3.5 py-2 hover:bg-black/[0.02] transition-colors">
          <FileDown size={15} />
          Exporter PDF
        </button>
        <button onClick={() => exportActivityToExcel(rows)} className="flex items-center gap-2 border border-black/10 text-ink-soft text-sm font-medium rounded-lg px-3.5 py-2 hover:bg-black/[0.02] transition-colors">
          <FileSpreadsheet size={15} />
          Exporter Excel
        </button>
      </div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white border border-black/[0.06] rounded-xl overflow-hidden">
        <ScrollableTable>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-ink text-left">
              <th className="px-5 py-3 font-mono text-[11px] text-white/70 font-medium">DATE</th>
              <th className="px-5 py-3 font-mono text-[11px] text-white/70 font-medium">HEURE</th>
              <th className="px-5 py-3 font-medium text-white">Utilisateur</th>
              <th className="px-5 py-3 font-medium text-white">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {paged.map((r, i) => (
              <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-ink-faint">{r.date}</td>
                <td className="px-5 py-3.5 font-mono text-xs text-ink-faint">{r.heure}</td>
                <td className="px-5 py-3.5 text-ink font-medium">{r.utilisateur}</td>
                <td className="px-5 py-3.5 text-ink-soft">{r.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && <p className="text-center text-sm text-ink-faint py-10">Aucune activité enregistrée.</p>}
        </ScrollableTable>
      </motion.div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
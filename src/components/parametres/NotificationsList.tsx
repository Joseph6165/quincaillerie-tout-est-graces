"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Bell } from "lucide-react";
import Pagination from "@/components/ui/Pagination";

interface NotificationRow {
  id: string;
  entity: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  message: string;
  time: string;
}

const TYPE_STYLES: Record<NotificationRow["type"], { icon: typeof Plus; badge: string }> = {
  CREATE: { icon: Plus, badge: "bg-emerald-50 text-emerald-600" },
  UPDATE: { icon: Pencil, badge: "bg-amber-50 text-amber-600" },
  DELETE: { icon: Trash2, badge: "bg-red-50 text-red-500" },
};

export default function NotificationsList({ notifications }: { notifications: NotificationRow[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const totalPages = Math.max(1, Math.ceil(notifications.length / pageSize));
  const paged = notifications.slice((page - 1) * pageSize, page * pageSize);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white border border-black/[0.06] rounded-xl overflow-hidden max-w-2xl">
      <div className="px-5 py-4 border-b border-black/[0.06] flex items-center gap-2">
        <Bell size={15} className="text-brand-600" />
        <h2 className="text-sm font-semibold text-ink">Notifications non consultées</h2>
      </div>

      <table className="w-full text-sm">
        <tbody className="divide-y divide-black/[0.05]">
          {paged.length === 0 && (
            <tr>
              <td className="text-center text-sm text-ink-faint py-8" colSpan={2}>
                Aucune nouvelle notification.
              </td>
            </tr>
          )}
          {paged.map((n) => {
            const style = TYPE_STYLES[n.type];
            const Icon = style.icon;
            return (
              <tr key={n.id}>
                <td className="px-5 py-3.5 align-top w-10">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${style.badge}`}>
                    <Icon size={12} />
                  </div>
                </td>
                <td className="px-2 py-3.5">
                  <p className="text-sm text-ink leading-snug">{n.message}</p>
                  <p className="text-[11px] font-mono text-ink-faint mt-0.5">{n.entity.toUpperCase()} — {n.time}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="border-t border-black/[0.06] py-3">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </motion.div>
  );
}
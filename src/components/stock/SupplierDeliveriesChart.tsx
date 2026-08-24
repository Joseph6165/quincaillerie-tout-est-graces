"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";

const COLORS = ["#F2600A", "#2563EB", "#059669", "#9333EA", "#C9490E", "#DB2777"];

export default function SupplierDeliveriesChart({
  data,
  suppliers,
}: {
  data: Record<string, string | number>[];
  suppliers: string[];
}) {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  function toggle(name: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, ease: "easeOut" }} className="bg-white border border-black/[0.06] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-ink mb-1">Livraisons par fournisseur</h2>
      <p className="text-xs text-ink-soft mb-3">Quantités reçues par mois — cliquez un fournisseur pour l'isoler</p>

      {suppliers.length === 0 ? (
        <p className="text-sm text-ink-faint py-10 text-center">Aucune réception fournisseur enregistrée pour le moment.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {suppliers.map((s, i) => (
              <button
                key={s}
                onClick={() => toggle(s)}
                className="flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-full border transition-all"
                style={{
                  borderColor: hidden.has(s) ? "#e5e5e5" : COLORS[i % COLORS.length],
                  color: hidden.has(s) ? "#9B9B9B" : COLORS[i % COLORS.length],
                  opacity: hidden.has(s) ? 0.5 : 1,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s}
              </button>
            ))}
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {suppliers
                  .filter((s) => !hidden.has(s))
                  .map((s) => (
                    <Bar key={s} dataKey={s} fill={COLORS[suppliers.indexOf(s) % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={800} />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </motion.div>
  );
}
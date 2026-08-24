"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";

const COLORS = ["#F2600A", "#FF9A52", "#C9490E", "#9C3808"];

export default function StockBySupplierChart({
  data,
  suppliers,
}: {
  data: Record<string, string | number>[];
  suppliers: string[];
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: 0.15 }} className="bg-white border border-black/[0.06] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-ink mb-4">Stock reçu par mois et par fournisseur</h2>
      {suppliers.length === 0 ? (
        <p className="text-sm text-ink-faint py-10 text-center">Aucune réception fournisseur enregistrée pour le moment.</p>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {suppliers.map((s, i) => (
                <Bar key={s} dataKey={s} stackId="stock" fill={COLORS[i % COLORS.length]} radius={i === suppliers.length - 1 ? [4, 4, 0, 0] : undefined} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
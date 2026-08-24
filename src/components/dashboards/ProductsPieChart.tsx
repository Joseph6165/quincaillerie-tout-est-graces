"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#F2600A", "#FF9A52", "#C9490E", "#9C3808", "#D95208", "#c9c9c9"];

export default function ProductsPieChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: 0.1 }} className="bg-white border border-black/[0.06] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-ink mb-4">Répartition des produits vendus</h2>
      {data.length === 0 ? (
        <p className="text-sm text-ink-faint py-10 text-center">Aucune vente enregistrée pour le moment.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            <Tooltip formatter={(v) => `${Number(v)} unités`} contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
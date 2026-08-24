"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

export default function TopProductsChart({ data }: { data: { name: string; revenue: number }[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4, delay: 0.05 }} className="bg-white border border-black/[0.06] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-ink mb-4">Chiffre d'affaires par produit</h2>
      {data.length === 0 ? (
        <p className="text-sm text-ink-faint py-10 text-center">Aucune vente enregistrée pour le moment.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9B9B9B" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "#5C5C5C" }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => formatXOF(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#C9490E" radius={[0, 6, 6, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
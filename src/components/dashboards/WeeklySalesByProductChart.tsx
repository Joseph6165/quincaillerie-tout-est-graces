"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";

const COLORS = ["#F2600A", "#2563EB", "#059669", "#C9490E", "#9333EA"];

export default function WeeklySalesByProductChart({
  data,
  productNames,
}: {
  data: Record<string, string | number>[];
  productNames: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-black/[0.06] rounded-xl p-5"
    >
      <h2 className="text-sm font-semibold text-ink mb-1">Ventes par produit, par semaine</h2>
      <p className="text-xs text-ink-soft mb-4">Quantités vendues (unités) — 4 dernières semaines</p>

      {productNames.length === 0 ? (
        <p className="text-sm text-ink-faint py-10 text-center">Aucune vente enregistrée pour le moment.</p>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip formatter={(v) => `${Number(v)} unités`} contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {productNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
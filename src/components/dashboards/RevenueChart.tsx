"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

function formatXOF(n: number) {
  return n.toLocaleString("fr-FR") + " XOF";
}

export default function RevenueChart({
  data,
  totalThisMonth,
  monthTrend,
}: {
  data: { month: string; total: number }[];
  totalThisMonth: number;
  monthTrend: number | null;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.4 }} className="bg-white border border-black/[0.06] rounded-xl p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-ink">Évolution du chiffre d'affaires</h2>
        {monthTrend !== null && (
          <span className={`flex items-center gap-1 text-xs font-mono font-medium ${monthTrend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
            {monthTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {monthTrend >= 0 ? "+" : ""}{monthTrend}% vs mois dernier
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-ink font-mono mb-4">{formatXOF(totalThisMonth)}</p>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
        <Tooltip formatter={(v) => formatXOF(Number(v))} contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }} />
            <Bar dataKey="total" fill="#F2600A" radius={[6, 6, 0, 0]} maxBarSize={44} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";

export default function StockFlowChart({ data }: { data: { week: string; entrees: number; sorties: number }[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }} className="bg-white border border-black/[0.06] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-ink mb-1">Évolution du stock</h2>
      <p className="text-xs text-ink-soft mb-4">Quantités reçues des fournisseurs vs vendues, par semaine</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEntrees" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSorties" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9B9B9B" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #eee", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="entrees" name="Reçu (fournisseurs)" stroke="#059669" fill="url(#colorEntrees)" strokeWidth={2.5} animationDuration={1000} />
            <Area type="monotone" dataKey="sorties" name="Vendu" stroke="#DC2626" fill="url(#colorSorties)" strokeWidth={2.5} animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
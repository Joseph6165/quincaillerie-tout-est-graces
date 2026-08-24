"use client";

import { motion } from "framer-motion";
import { RadialBarChart, RadialBar, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#F2600A", "#2563EB", "#059669", "#9333EA"];

export default function CategoryRadialChart({ data }: { data: { name: string; value: number }[] }) {
  const chartData = data.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5, ease: "easeOut" }} className="bg-white border border-black/[0.06] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-ink mb-1">Part du chiffre d'affaires par catégorie</h2>
      <p className="text-xs text-ink-soft mb-3">Pourcentage des ventes par famille de produits</p>

      {chartData.length === 0 ? (
        <p className="text-sm text-ink-faint py-10 text-center">Aucune vente enregistrée pour le moment.</p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-6 py-2">
          {chartData.map((d, i) => (
            <div key={d.name} className="flex flex-col items-center">
              <div className="w-24 h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart innerRadius="70%" outerRadius="100%" data={[d]} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" fill={d.fill} background={{ fill: "#f0f0f0" }} cornerRadius={20} animationDuration={900} animationBegin={i * 150} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-lg font-semibold text-ink font-mono -mt-16 mb-8">{d.value}%</p>
              <p className="text-xs text-ink-soft text-center max-w-[90px] truncate">{d.name}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

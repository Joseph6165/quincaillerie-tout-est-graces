"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tag: string;
  trend?: { value: string; positive: boolean };
  delay?: number;
}

export default function StatCard({ label, value, icon: Icon, tag, trend, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="relative bg-white border border-black/[0.06] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
    >
      <div className="absolute top-0 left-0 h-1 w-10 bg-brand-500" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 4px 100%, 0 calc(100% - 4px))" }} />
      <div className="flex items-start justify-between mb-4">
        <span className="text-[10px] font-mono font-medium tracking-wider text-ink-faint">{tag}</span>
        <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center">
          <Icon size={16} className="text-brand-600" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-ink font-mono mb-1">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-soft">{label}</p>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-mono font-medium ${trend.positive ? "text-emerald-600" : "text-red-500"}`}>
            {trend.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend.value}
          </span>
        )}
      </div>
    </motion.div>
  );
}
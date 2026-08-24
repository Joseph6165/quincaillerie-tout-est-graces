"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface Highlight {
  icon: LucideIcon;
  value: string;
  label: string;
}

export default function HighlightStats({ items }: { items: Highlight[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((h, i) => (
        <motion.div
          key={h.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
          whileHover={{ y: -3 }}
          className="flex flex-col items-center text-center bg-white border border-black/[0.06] rounded-xl py-5 px-3"
        >
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-3">
            <h.icon size={20} className="text-brand-600" />
          </div>
          <p className="text-lg font-semibold text-ink font-mono">{h.value}</p>
          <p className="text-[11px] text-ink-soft mt-0.5">{h.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
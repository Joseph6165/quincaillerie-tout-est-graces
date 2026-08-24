"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LucideIcon, ArrowRight } from "lucide-react";

export default function QuickAccessCard({
  href,
  icon: Icon,
  title,
  subtitle,
  delay = 0,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.4, delay }}>
      <Link href={href} className="group flex items-center gap-4 bg-white border border-black/[0.06] rounded-xl p-5 hover:border-brand-200 transition-colors">
        <div className="w-11 h-11 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
          <Icon size={19} className="text-brand-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-xs text-ink-soft">{subtitle}</p>
        </div>
        <ArrowRight size={16} className="text-ink-faint group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0" />
      </Link>
    </motion.div>
  );
}
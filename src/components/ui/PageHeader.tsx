"use client";

import { motion } from "framer-motion";
import BinLabel from "./BinLabel";

export default function PageHeader({
  tag,
  title,
  subtitle,
  action,
}: {
  tag: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start justify-between gap-4 mb-6 flex-wrap"
    >
      <div>
        <BinLabel className="mb-2.5">{tag}</BinLabel>
        <h1 className="text-2xl font-semibold text-ink mb-1">{title}</h1>
        <p className="text-sm text-ink-soft">{subtitle}</p>
      </div>
      {action}
    </motion.div>
  );
}
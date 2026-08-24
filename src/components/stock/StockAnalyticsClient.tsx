"use client";

import { motion } from "framer-motion";
import SupplierDeliveriesChart from "./SupplierDeliveriesChart";
import StockFlowChart from "./StockFlowChart";

export default function StockAnalyticsClient({
  supplierData,
  suppliers,
  flowData,
}: {
  supplierData: Record<string, string | number>[];
  suppliers: string[];
  flowData: { week: string; entrees: number; sorties: number }[];
}) {
  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }} className="space-y-5">
      <StockFlowChart data={flowData} />
      <SupplierDeliveriesChart data={supplierData} suppliers={suppliers} />
    </motion.div>
  );
}
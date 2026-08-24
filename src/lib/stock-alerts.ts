export type StockStatus = "critique" | "surveiller" | "ok";

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= minStock) return "critique";
  if (stock <= minStock * 2) return "surveiller";
  return "ok";
}

export const STOCK_STATUS_STYLES: Record<StockStatus, { label: string; badge: string }> = {
  critique: { label: "RUPTURE IMMINENTE", badge: "bg-red-50 text-red-600" },
  surveiller: { label: "À SURVEILLER", badge: "bg-amber-50 text-amber-600" },
  ok: { label: "OK", badge: "bg-emerald-50 text-emerald-600" },
};
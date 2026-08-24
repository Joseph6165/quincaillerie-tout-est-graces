"use client";

import { buildReceiptDoc } from "./receipt-pdf-core";
export type { ReceiptData, ReceiptItem } from "./receipt-pdf-core";
import type { ReceiptData } from "./receipt-pdf-core";

export function downloadReceiptPDF(data: ReceiptData) {
  const doc = buildReceiptDoc(data);
  doc.save(`facture-${data.number}.pdf`);
}
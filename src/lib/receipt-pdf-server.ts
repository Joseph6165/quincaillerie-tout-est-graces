import { buildReceiptDoc } from "./receipt-pdf-core";
import type { ReceiptData } from "./receipt-pdf-core";

export function generateReceiptPDFBuffer(data: ReceiptData): Buffer {
  const doc = buildReceiptDoc(data);
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
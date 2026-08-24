import jsPDF from "jspdf";
import { COMPANY } from "./company";
import { numberToFrenchWords } from "./number-to-words";

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface ReceiptData {
  number: string;
  date: string;
  client: string;
  vendeur: string;
  items: ReceiptItem[];
  total: number;
}

function formatAmount(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function buildReceiptDoc(data: ReceiptData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  const pageWidth = 148;
  const pageHeight = 210;
  const marginX = 10;
  let y = 0;

  // Bordure extérieure de la page
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

  // Bandeau d'en-tête
  const headerHeight = 32;
  doc.setFillColor(242, 96, 10);
  doc.rect(5, 5, pageWidth - 10, headerHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(COMPANY.name, pageWidth / 2, 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(COMPANY.tagline, pageWidth / 2, 24, { align: "center", maxWidth: pageWidth - marginX * 2 - 6 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`Tel : ${COMPANY.phone}`, pageWidth / 2, 32, { align: "center" });

  doc.setTextColor(0, 0, 0);
  y = headerHeight + 17;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${COMPANY.city}, le ${data.date}`, pageWidth - marginX, y, { align: "right" });
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("FACTURE", marginX, y);
  doc.setTextColor(200, 40, 30);
  doc.text(`N. ${data.number}`, marginX + 32, y);
  doc.setTextColor(0, 0, 0);
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Client : ${data.client}`, marginX, y);
  y += 8;

  // Tableau — le nombre de lignes correspond exactement au nombre de produits
  const tableLeft = marginX;
  const tableRight = pageWidth - marginX;
  const colBounds = [tableLeft, tableLeft + 18, tableLeft + 78, tableLeft + 103, tableRight];
  const colCenters = [0, 1, 2, 3].map((i) => (colBounds[i] + colBounds[i + 1]) / 2);
  const rowHeight = 8;
  const tableTop = y;

  // En-tête du tableau — fond sombre, séparé nettement des lignes de produits
  doc.setFillColor(26, 26, 26);
  doc.rect(tableLeft, tableTop, tableRight - tableLeft, rowHeight, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Qte", colCenters[0], tableTop + 5.5, { align: "center" });
  doc.text("Designation", colCenters[1], tableTop + 5.5, { align: "center" });
  doc.text("P. Unit", colCenters[2], tableTop + 5.5, { align: "center" });
  doc.text("Montant", colCenters[3], tableTop + 5.5, { align: "center" });
  doc.setTextColor(0, 0, 0);

  // Ligne de séparation plus épaisse entre l'en-tête et les produits
  doc.setLineWidth(0.5);
  doc.line(tableLeft, tableTop + rowHeight, tableRight, tableTop + rowHeight);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  let rowY = tableTop + rowHeight;

  data.items.forEach((item) => {
    const montant = item.quantity * item.unitPrice;
    doc.text(String(item.quantity), colCenters[0], rowY + 5.5, { align: "center" });
    doc.text(item.name.slice(0, 26), colCenters[1], rowY + 5.5, { align: "center" });
    doc.text(formatAmount(item.unitPrice), colCenters[2], rowY + 5.5, { align: "center" });
    doc.text(formatAmount(montant), colCenters[3], rowY + 5.5, { align: "center" });
    rowY += rowHeight;
  });

  const tableBottom = tableTop + rowHeight * (1 + data.items.length);

  doc.setLineWidth(0.3);
  doc.rect(tableLeft, tableTop, tableRight - tableLeft, tableBottom - tableTop);
  colBounds.slice(1, -1).forEach((x) => doc.line(x, tableTop, x, tableBottom));
  for (let i = 1; i < data.items.length; i++) {
    const lineY = tableTop + rowHeight * (i + 1);
    doc.line(tableLeft, lineY, tableRight, lineY);
  }

  y = tableBottom + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("TOTAL", colCenters[2], y, { align: "center" });
  doc.text(`${formatAmount(data.total)} FCFA`, colCenters[3], y, { align: "center" });
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Arrete la presente facture a la somme de :", marginX, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const wrapped = doc.splitTextToSize(numberToFrenchWords(data.total).toUpperCase(), tableRight - marginX);
  doc.text(wrapped, marginX, y);
  y += wrapped.length * 5 + 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Vendeur : ${data.vendeur}`, marginX, y);
  doc.text(COMPANY.director, tableRight - 26, y);

  return doc;
}
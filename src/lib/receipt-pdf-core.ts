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

const PAGE_WIDTH = 148;
const PAGE_HEIGHT = 210;
const MARGIN_X = 10;
const TABLE_LEFT = MARGIN_X;
const TABLE_RIGHT = PAGE_WIDTH - MARGIN_X;
const COL_BOUNDS = [TABLE_LEFT, TABLE_LEFT + 14, TABLE_LEFT + 74, TABLE_LEFT + 101, TABLE_RIGHT];
const COL_CENTERS = [0, 1, 2, 3].map((i) => (COL_BOUNDS[i] + COL_BOUNDS[i + 1]) / 2);
const ROW_LINE_HEIGHT = 4.2;
const ROW_PADDING = 3.6;
const FOOTER_RESERVE = 62;

function drawPageFrame(doc: jsPDF) {
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.rect(5, 5, PAGE_WIDTH - 10, PAGE_HEIGHT - 10);
}

function drawTableHeader(doc: jsPDF, top: number): number {
  const h = 8;
  doc.setFillColor(26, 26, 26);
  doc.rect(TABLE_LEFT, top, TABLE_RIGHT - TABLE_LEFT, h, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  ["Qte", "Designation", "P. Unit", "Montant"].forEach((label, i) => {
    doc.text(label, COL_CENTERS[i], top + 5.5, { align: "center" });
  });
  doc.setTextColor(0, 0, 0);
  return top + h;
}

export function buildReceiptDoc(data: ReceiptData): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  let y = 0;

  drawPageFrame(doc);

  // Bandeau d'en-tête
  const headerHeight = 32;
  doc.setFillColor(242, 96, 10);
  doc.rect(5, 5, PAGE_WIDTH - 10, headerHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(COMPANY.name, PAGE_WIDTH / 2, 18, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(COMPANY.tagline, PAGE_WIDTH / 2, 24, { align: "center", maxWidth: PAGE_WIDTH - MARGIN_X * 2 - 6 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`Tel : ${COMPANY.phone}`, PAGE_WIDTH / 2, 32, { align: "center" });

  doc.setTextColor(0, 0, 0);
  y = headerHeight + 14;

  // Bloc facture : numéro à gauche, date et lieu à droite
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("FACTURE", MARGIN_X, y);
  doc.setTextColor(200, 40, 30);
  doc.text(`N. ${data.number}`, MARGIN_X + 32, y);
  doc.setTextColor(0, 0, 0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${COMPANY.city}, le ${data.date}`, TABLE_RIGHT, y, { align: "right" });
  y += 6;

  // Encadré client
  doc.setFillColor(248, 248, 248);
  doc.setDrawColor(225, 225, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN_X, y, TABLE_RIGHT - TABLE_LEFT, 9, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Client :", MARGIN_X + 3, y + 5.8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(data.client.slice(0, 48), MARGIN_X + 18, y + 5.8);
  y += 14;

  // Tableau — les désignations longues passent à la ligne, une nouvelle page est ajoutée si besoin
  let tableTop = y;
  let rowY = drawTableHeader(doc, tableTop);
  doc.setLineWidth(0.5);
  doc.setDrawColor(26, 26, 26);
  doc.line(TABLE_LEFT, rowY, TABLE_RIGHT, rowY);
  doc.setDrawColor(200, 200, 200);

  const closeTable = (bottom: number) => {
    doc.setLineWidth(0.3);
    doc.setDrawColor(150, 150, 150);
    doc.rect(TABLE_LEFT, tableTop, TABLE_RIGHT - TABLE_LEFT, bottom - tableTop);
    COL_BOUNDS.slice(1, -1).forEach((x) => doc.line(x, tableTop, x, bottom));
  };

  data.items.forEach((item, index) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const lines: string[] = doc.splitTextToSize(item.name, COL_BOUNDS[2] - COL_BOUNDS[1] - 4);
    const rowHeight = lines.length * ROW_LINE_HEIGHT + ROW_PADDING;

    if (rowY + rowHeight > PAGE_HEIGHT - 20) {
      closeTable(rowY);
      doc.addPage();
      drawPageFrame(doc);
      tableTop = 15;
      rowY = drawTableHeader(doc, tableTop);
    }

    if (index % 2 === 1) {
      doc.setFillColor(250, 245, 240);
      doc.rect(TABLE_LEFT, rowY, TABLE_RIGHT - TABLE_LEFT, rowHeight, "F");
    }

    const textY = rowY + ROW_PADDING / 2 + 3;
    doc.setTextColor(0, 0, 0);
    doc.text(String(item.quantity), COL_CENTERS[0], textY, { align: "center" });
    doc.text(lines, COL_CENTERS[1], textY, { align: "center" });
    doc.text(formatAmount(item.unitPrice), COL_CENTERS[2], textY, { align: "center" });
    doc.text(formatAmount(item.quantity * item.unitPrice), COL_CENTERS[3], textY, { align: "center" });

    rowY += rowHeight;
    doc.setLineWidth(0.15);
    doc.setDrawColor(210, 210, 210);
    doc.line(TABLE_LEFT, rowY, TABLE_RIGHT, rowY);
  });

  closeTable(rowY);

  // Pied de facture : s'il ne reste pas assez de place, il passe sur une nouvelle page
  if (rowY + FOOTER_RESERVE - 20 > PAGE_HEIGHT - 10) {
    doc.addPage();
    drawPageFrame(doc);
    rowY = 15;
  }
  y = rowY + 8;

  // Total mis en évidence
  const totalBoxX = COL_BOUNDS[2] - 12;
  doc.setFillColor(242, 96, 10);
  doc.roundedRect(totalBoxX, y - 5.5, TABLE_RIGHT - totalBoxX, 9, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("TOTAL", totalBoxX + 4, y + 0.5);
  doc.text(`${formatAmount(data.total)} FCFA`, TABLE_RIGHT - 3, y + 0.5, { align: "right" });
  doc.setTextColor(0, 0, 0);
  y += 11;

  const nbArticles = data.items.reduce((sum, i) => sum + i.quantity, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 110, 110);
  doc.text(`${data.items.length} produit(s) - ${nbArticles} article(s)`, TABLE_RIGHT, y, { align: "right" });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(8.5);
  doc.text("Arrete la presente facture a la somme de :", MARGIN_X, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const wrapped = doc.splitTextToSize(numberToFrenchWords(data.total).toUpperCase(), TABLE_RIGHT - MARGIN_X);
  doc.text(wrapped, MARGIN_X, y);
  y += wrapped.length * 4.5 + 8;

  // Signatures
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Vendeur : ${data.vendeur}`, MARGIN_X, y);
  doc.text(COMPANY.director, TABLE_RIGHT, y, { align: "right" });
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.2);
  doc.line(MARGIN_X, y + 14, MARGIN_X + 40, y + 14);
  doc.line(TABLE_RIGHT - 40, y + 14, TABLE_RIGHT, y + 14);

  // Mention de remerciement sur chaque page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text("Merci de votre confiance - A bientot chez " + COMPANY.name, PAGE_WIDTH / 2, PAGE_HEIGHT - 9, { align: "center" });
    if (pages > 1) doc.text(`Page ${p}/${pages}`, TABLE_RIGHT, PAGE_HEIGHT - 9, { align: "right" });
  }
  doc.setTextColor(0, 0, 0);

  return doc;
}

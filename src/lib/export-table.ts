"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface TableRow {
  date: string;
  heure: string;
  utilisateur: string;
  action: string;
}

export function exportActivityToPDF(rows: TableRow[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Journal des activités — Tout Est Grâce", 14, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Généré le ${new Date().toLocaleString("fr-FR")}`, 14, 21);

  autoTable(doc, {
    startY: 26,
    head: [["Date", "Heure", "Utilisateur", "Action"]],
    body: rows.map((r) => [r.date, r.heure, r.utilisateur, r.action]),
    headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 9 },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  doc.save(`journal-activites-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportActivityToExcel(rows: TableRow[]) {
  const worksheet = XLSX.utils.json_to_sheet(
    rows.map((r) => ({ Date: r.date, Heure: r.heure, Utilisateur: r.utilisateur, Action: r.action }))
  );
  worksheet["!cols"] = [{ wch: 12 }, { wch: 8 }, { wch: 22 }, { wch: 70 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Activités");
  XLSX.writeFile(workbook, `journal-activites-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
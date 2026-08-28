import { jsPDF } from "jspdf";
import { getBriefingSpec, type Briefing } from "./briefings";

function formatDate(dateString: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateBriefingPdf(briefing: Briefing): void {
  const spec = getBriefingSpec(briefing.service);
  const landscape = Boolean(spec.columns);
  const doc = new jsPDF({ orientation: landscape ? "landscape" : "portrait" });
  const margin = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let y = 46;

  const drawHeader = () => {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 36, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${spec.label} Service — Briefing`, margin, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(formatDate(briefing.values["date"] || briefing.date), margin, 24);
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 18) {
      doc.addPage();
      drawHeader();
      y = 46;
    }
  };

  drawHeader();

  for (const section of spec.sections) {
    const filled = section.fields.filter((f) => (briefing.values[f.name] ?? "").trim() !== "");
    if (filled.length === 0) continue;

    ensureSpace(16);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin, y);
    y += 3;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    for (const field of filled) {
      const value = (briefing.values[field.name] ?? "").trim();
      doc.setFontSize(10);
      const labelLines = doc.splitTextToSize(`${field.label}:`, contentWidth);
      const valueLines = doc.splitTextToSize(value, contentWidth);
      ensureSpace((labelLines.length + valueLines.length) * 5 + 4);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(labelLines, margin, y);
      y += labelLines.length * 5;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(valueLines, margin + 2, y);
      y += valueLines.length * 5 + 3;
    }
    y += 5;
  }

  const columns = spec.columns ?? [];
  const rows = briefing.rows.filter((row) => columns.some((c) => (row[c.name] ?? "").trim() !== ""));

  if (columns.length > 0 && rows.length > 0) {
    ensureSpace(24);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Flights Prevision", margin, y);
    y += 6;

    const colWidth = contentWidth / columns.length;
    const rowHeight = 8;

    const drawTableHeader = () => {
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      columns.forEach((col, i) => {
        doc.text(col.label, margin + i * colWidth + 1.5, y + 5.5, { maxWidth: colWidth - 3 });
      });
      y += rowHeight;
    };

    drawTableHeader();

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    for (const row of rows) {
      if (y + rowHeight > pageHeight - 18) {
        doc.addPage();
        drawHeader();
        y = 46;
        drawTableHeader();
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
      }
      doc.setDrawColor(226, 232, 240);
      doc.rect(margin, y, contentWidth, rowHeight);
      doc.setFontSize(8);
      columns.forEach((col, i) => {
        const text = (row[col.name] ?? "").trim();
        if (text) {
          doc.text(text, margin + i * colWidth + 1.5, y + 5.5, { maxWidth: colWidth - 3 });
        }
        if (i > 0) doc.line(margin + i * colWidth, y, margin + i * colWidth, y + rowHeight);
      });
      y += rowHeight;
    }
    y += 6;
  }

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    const footerY = pageHeight - 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated on ${new Date().toLocaleString("en-US")}`, margin, footerY);
    doc.text(`Page ${page} / ${totalPages}`, pageWidth - margin, footerY, { align: "right" });
  }

  doc.save(
    `${briefing.service}-briefing-${briefing.values["date"] || briefing.date || "draft"}.pdf`
  );
}

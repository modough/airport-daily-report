import { jsPDF } from "jspdf";
import { getBriefingSpec, type Briefing } from "./briefings";
import type { FieldSpec } from "./services";

const COLORS = {
  primary: [30, 58, 95] as [number, number, number],
  primaryLight: [59, 130, 246] as [number, number, number],
  secondary: [100, 116, 139] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
};

function formatDate(dateString: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function loadImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawBox(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor?: [number, number, number],
  strokeColor?: [number, number, number],
  lineWidth = 0.5,
  rounded = false,
  radius = 2
) {
  doc.setLineWidth(lineWidth);
  if (fillColor) doc.setFillColor(...fillColor);
  if (strokeColor) doc.setDrawColor(...strokeColor);

  const style = fillColor && strokeColor ? "DF" : fillColor ? "F" : "S";

  if (rounded && typeof (doc as any).roundedRect === "function") {
    (doc as any).roundedRect(x, y, w, h, radius, radius, style);
  } else {
    doc.rect(x, y, w, h, style);
  }
}

function addPageIfNeeded(doc: jsPDF, y: number, requiredSpace = 20): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + requiredSpace > pageHeight - 28) {
    doc.addPage();
    return 24;
  }
  return y;
}

function addSectionTitle(doc: jsPDF, title: string, margin: number, y: number): number {
  y = addPageIfNeeded(doc, y, 22);

  doc.setFillColor(...COLORS.primary);
  doc.rect(margin, y, 3, 14, "F");

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, margin + 8, y + 10);

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 16, doc.internal.pageSize.getWidth() - margin, y + 16);

  return y + 22;
}

function formatFieldValue(field: FieldSpec, rawValue: string): string {
  const value = rawValue.trim();
  if (!value) return "";

  if (field.type === "checkbox") {
    return value === "true" || value.toLowerCase() === "yes" || value.toLowerCase() === "oui" ? "OUI" : "NON";
  }

  if (field.type === "date") {
    return formatDate(value);
  }

  if (field.type === "number") {
    const num = Number(value);
    if (!Number.isNaN(num)) return num.toLocaleString("fr-FR");
    return value;
  }

  return value;
}

function addFieldsRow(
  doc: jsPDF,
  fields: { label: string; value: string }[],
  margin: number,
  y: number,
  contentWidth: number
): number {
  if (fields.length === 0) return y;

  y = addPageIfNeeded(doc, y, 20);

  const colWidth = contentWidth / 2 - 4;
  let currentY = y;
  let leftHeight = 0;

  fields.forEach((field, index) => {
    const isLeft = index % 2 === 0;
    const x = isLeft ? margin : margin + colWidth + 8;

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.muted);
    doc.text(field.label.toUpperCase(), x, currentY);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);

    const lines = doc.splitTextToSize(field.value, colWidth);
    doc.text(lines, x, currentY + 5);

    const lineHeight = Math.max(lines.length * 4.5, 6);

    if (isLeft) {
      leftHeight = lineHeight + 6;
    } else {
      currentY += Math.max(leftHeight, lineHeight + 6);
      leftHeight = 0;
    }
  });

  if (fields.length % 2 !== 0) {
    currentY += leftHeight;
  }

  return currentY;
}

function addTextBlock(
  doc: jsPDF,
  label: string,
  value: string | undefined,
  margin: number,
  y: number,
  contentWidth: number
): number {
  if (!value?.trim()) return y;

  y = addPageIfNeeded(doc, y, 30);

  const labelWidth = doc.getTextWidth(label) + 10;
  drawBox(doc, margin, y - 5, labelWidth, 10, COLORS.bg, undefined, 0);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.secondary);
  doc.text(label.toUpperCase(), margin + 5, y + 1);

  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  const lines = doc.splitTextToSize(value.trim(), contentWidth - 8);
  doc.text(lines, margin + 4, y);

  return y + lines.length * 4.8 + 8;
}

function addStatusBadge(
  doc: jsPDF,
  label: string,
  status: "success" | "warning" | "danger" | "neutral",
  x: number,
  y: number
): number {
  const colors = {
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    neutral: COLORS.secondary,
  };

  const color = colors[status];
  const textWidth = doc.getTextWidth(label) + 14;
  const badgeHeight = 12;

  drawBox(doc, x, y - badgeHeight + 4, textWidth, badgeHeight, color, undefined, 0, true, 2);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text(label.toUpperCase(), x + 7, y - 1);

  return x + textWidth + 6;
}

export async function generateBriefingPdf(briefing: Briefing): Promise<void> {
  const spec = getBriefingSpec(briefing.service);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  const pageHeight = doc.internal.pageSize.getHeight();

  const headerHeight = 38;
  let y = 0;

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, headerHeight, "F");
  doc.setFillColor(...COLORS.primaryLight);
  doc.rect(0, headerHeight - 1.5, pageWidth, 1.5, "F");

  const logoUrl = new URL("../assets/xcr_airport.webp", import.meta.url).href;
  const logoDataUrl = await loadImageDataUrl(logoUrl);
  const logoWidth = 22;

  if (logoDataUrl) {
    try {
      const props = doc.getImageProperties(logoDataUrl as any);
      const logoHeight = (props.height / props.width) * logoWidth;
      doc.setFillColor(...COLORS.white);
      doc.circle(margin + logoWidth / 2, headerHeight / 2, logoWidth / 2 + 5, "F");
      doc.addImage(logoDataUrl as any, margin, headerHeight / 2 - logoHeight / 2, logoWidth, logoHeight);
    } catch {
      // ignore
    }
  }

  const titleX = margin + logoWidth + 10;
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("BRIEFING", titleX, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Service ${spec.label}`, titleX, 24);
  doc.text(formatDate(briefing.values["date"] || briefing.date), titleX, 30);

  const rightX = pageWidth - margin;
  if (briefing.values["briefingTime"]) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Heure ${briefing.values["briefingTime"]}`, rightX, 16, { align: "right" });
  }

  const supervisor = briefing.values["supervisorName"] || briefing.values["agentName"];
  if (supervisor) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Superviseur : ${supervisor}`, rightX, 24, { align: "right" });
  }

  y = headerHeight + 14;

  for (const section of spec.sections) {
    const filledFields = section.fields.filter((field) => {
      const value = briefing.values[field.name];
      return value !== undefined && value !== null && String(value).trim() !== "";
    });

    if (filledFields.length === 0) continue;

    y = addSectionTitle(doc, section.title, margin, y);

    const shortFields: { label: string; value: string }[] = [];
    const longFields: { label: string; value: string }[] = [];

    for (const field of filledFields) {
      const formatted = formatFieldValue(field, String(briefing.values[field.name] ?? ""));
      if (!formatted) continue;

      const entry = { label: field.label, value: formatted };
      if (field.type === "textarea" || formatted.length > 60) {
        longFields.push(entry);
      } else {
        shortFields.push(entry);
      }
    }

    if (shortFields.length > 0) {
      y = addFieldsRow(doc, shortFields, margin, y, contentWidth);
    }

    for (const field of longFields) {
      y = addTextBlock(doc, field.label, field.value, margin, y, contentWidth);
    }

    y += 4;
  }

  const columns = spec.columns ?? [];
  const tomorrowColumns = spec.tomorrowColumns ?? [];
  const rows = briefing.rows.filter((row) => columns.some((col) => (row[col.name] ?? "").trim() !== ""));

  if (columns.length > 0 && rows.length > 0) {
    y = addPageIfNeeded(doc, y, 26);
    y = addSectionTitle(doc, "Prévision des vols", margin, y);

    const colWidth = contentWidth / columns.length;
    const rowHeight = 8;

    const drawHeader = () => {
      doc.setFillColor(...COLORS.bg);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.text);
      columns.forEach((col, index) => {
        doc.text(col.label, margin + index * colWidth + 1.5, y + 5.5, { maxWidth: colWidth - 3 });
      });
      y += rowHeight;
    };

    drawHeader();

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);

    for (const row of rows) {
      if (y + rowHeight > pageHeight - 18) {
        doc.addPage();
        y = 24;
        drawHeader();
      }

      doc.setDrawColor(...COLORS.border);
      doc.rect(margin, y, contentWidth, rowHeight);
      doc.setFontSize(7.5);
      columns.forEach((col, index) => {
        const text = (row[col.name] ?? "").trim();
        if (text) {
          doc.text(text, margin + index * colWidth + 1.5, y + 5.5, { maxWidth: colWidth - 3 });
        }
        if (index > 0) doc.line(margin + index * colWidth, y, margin + index * colWidth, y + rowHeight);
      });
      y += rowHeight;
    }

    y += 6;
  }
  if (tomorrowColumns.length > 0 && rows.length > 0) {
    y = addPageIfNeeded(doc, y, 26);
    y = addSectionTitle(doc, "Prévision des vols demain", margin, y);
    const colWidth = contentWidth / columns.length;
    const rowHeight = 8;

    const drawHeader = () => {
      doc.setFillColor(...COLORS.bg);
      doc.rect(margin, y, contentWidth, rowHeight, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.text);
      columns.forEach((col, index) => {
        doc.text(col.label, margin + index * colWidth + 1.5, y + 5.5, { maxWidth: colWidth - 3 });
      });
      y += rowHeight;
    };

    drawHeader();

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.text);

    for (const row of rows) {
      if (y + rowHeight > pageHeight - 18) {
        doc.addPage();
        y = 24;
        drawHeader();
      }

      doc.setDrawColor(...COLORS.border);
      doc.rect(margin, y, contentWidth, rowHeight);
      doc.setFontSize(7.5);
      columns.forEach((col, index) => {
        const text = (row[col.name] ?? "").trim();
        if (text) {
          doc.text(text, margin + index * colWidth + 1.5, y + 5.5, { maxWidth: colWidth - 3 });
        }
        if (index > 0) doc.line(margin + index * colWidth, y, margin + index * colWidth, y + rowHeight);
      });
      y += rowHeight;
    }

    y += 6;
  }

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);
    const footerY = pageHeight - 10;
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text("Briefing — XCR-Airport", margin, footerY);

    const genDate = new Date().toLocaleDateString("fr-FR");
    doc.text(`${genDate}`, pageWidth / 2, footerY, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(`Page ${page} / ${totalPages}`, pageWidth - margin, footerY, { align: "right" });
  }

  const dateStr = briefing.values["date"] || briefing.date || "draft";
  const fileName = `${briefing.service}-briefing-${dateStr}.pdf`;
  doc.save(fileName);
}

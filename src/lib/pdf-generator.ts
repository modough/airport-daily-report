import { jsPDF } from "jspdf";
import type { DailyReport } from "./reports";
import { getService } from "./services";
import type { FieldSpec, FieldType } from "./services";

// ─── COLOR PALETTE ───
const COLORS = {
  primary: [30, 58, 95] as [number, number, number],
  primaryLight: [59, 130, 246] as [number, number, number],
  secondary: [100, 116, 139] as [number, number, number],
  muted: [148, 163, 184] as [number, number, number],
  text: [15, 23, 42] as [number, number, number],
  textLight: [71, 85, 105] as [number, number, number],
  bg: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
};

// ─── FRENCH TRANSLATIONS ───
const FIELD_LABELS: Record<string, string> = {
  // Flight Information
  date: "Date",
  startTime: "Heure de début",
  endTime: "Heure de fin",
  flightNumber: "Numéro de vol",
  destination: "Destination",
  registration: "Immatriculation",
  paxArrival: "Passagers à l'arrivée",
  paxDeparture: "Passagers au départ",

  // Timings & Delays
  schedArrival: "Heure d'arrivée prévue",
  actualArrival: "Heure d'arrivée réelle",
  disembarkEnd: "Fin du débarquement",
  boardingEnd: "Fin de l'embarquement",
  schedDeparture: "Heure de départ prévue",
  actualDeparture: "Heure de départ réelle",
  takeOffTime: "Heure de décollage",
  delayCode: "Code retard",
  delayReason: "Motif du retard",

  // Sign-off
  completedBy: "Agents ayant complété le formulaire",
  supervisorName: "Superviseur de vol",
  todayAgents: "Nombre d'agents du jour",
  interimAgents: "Nombre d'agents intérimaires",

  // Passenger — Agents
  ticketingAgent: "Agent billetterie",
  webCheckAgent: "Agent Web Check",
  checkinAgents: "Agents check-in",
  parkingBagClaimInfoAgent: "Agent parking / bagages / information",
  boardingAgents: "Agents embarquement",

  // Passenger — Check-in
  checkinSummary: "Résumé du check-in",
  baggagesChecked: "Bagages enregistrés",
  numberOfPayments: "Nombre de paiements",
  amount: "Montant",

  // Passenger — Boarding & Arrival
  boardingSummary: "Résumé de l'embarquement",
  arrivalSummary: "Résumé de l'arrivée",

  // Service Summaries / Operations
  parkingSummary: "Résumé parking",
  bagClaimSummary: "Résumé livraison des bagages",
  lostFoundSummary: "Résumé Lost & Found / Objets trouvés",
  technicalIssueSummary: "Résumé des problèmes techniques",
  cleaningSummary: "Résumé du nettoyage",
  safetySecurityIncidents: "Incidents de sûreté et de sécurité",
  specificDirectives: "Directives spécifiques",

  // Traffic — Load Control
  loadsheetSummary: "Résumé loadsheet",
  weightBalanceSummary: "Résumé poids et balance",
  cargoLoadKg: "Charge cargo (kg)",
  baggageLoadKg: "Charge bagages (kg)",
  fuelFigures: "Chiffres carburant",

  // Traffic — Documentation
  documentationSummary: "Résumé documentation",
  crewBriefingSummary: "Résumé briefing équipage",
  messagesSent: "Messages envoyés (MVT, LDM, PSM...)",

  // Ramp — Team
  rampAgents: "Agents ramp",
  loadingTeam: "Équipe de chargement",
  gseUsed: "GSE utilisés",
  gseIssues: "Problèmes GSE / équipement inutilisable",

  // Ramp — Aircraft Handling
  loadingSummary: "Résumé chargement",
  unloadingSummary: "Résumé déchargement",
  pushbackSummary: "Résumé pushback / remorquage",
  fuelingSummary: "Résumé ravitaillement",
  waterLavatorySummary: "Résumé eau & toilettes",

  // Ramp — Incidents
  aircraftDamageReport: "Rapport dommages avion / équipement",

  // Cargo — Handling
  cargoAgents: "Agents cargo",
  piecesIn: "Colis reçus (arrivée)",
  weightInKg: "Poids arrivée (kg)",
  piecesOut: "Colis expédiés (départ)",
  weightOutKg: "Poids départ (kg)",
  mailSummary: "Résumé courrier",
  uldSummary: "Résumé ULD",

  // Cargo — Special
  dangerousGoodsSummary: "Résumé marchandises dangereuses",
  perishablesSummary: "Résumé périssables / cargo spécial",
  warehouseSummary: "Résumé entrepôt",
  discrepanciesSummary: "Résumé écarts / dommages",
};

const SECTION_TITLES: Record<string, string> = {
  "Flight Information": "Informations générales",
  "Agents on Duty": "Agents affectés",
  "Check-in": "Check-in",
  "Boarding & Arrival": "Embarquement & Arrivée",
  "Timings & Delays": "Horaires & Retards",
  "Service Summaries": "Résumés des opérations",
  "Sign-off": "Personnel",
  "Load Control": "Contrôle de charge",
  "Documentation & Coordination": "Documentation & Coordination",
  "Incidents & Directives": "Sûreté, sécurité et directives",
  "Ramp Team": "Équipe ramp",
  "Aircraft Handling": "Manutention avion",
  "Cargo Handling": "Manutention cargo",
  "Special Cargo & Warehouse": "Cargo spécial & Entrepôt",
};

function getFieldLabel(field: FieldSpec): string {
  return FIELD_LABELS[field.name] || field.label;
}

function getSectionTitle(title: string): string {
  return SECTION_TITLES[title] || title;
}

// ─── HELPERS ───

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

function formatDate(dateString: string): string {
  if (!dateString) return "—";
  const parts = dateString.split("-");
  if (parts.length === 3) {
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (![y, m, d].some(isNaN)) {
      return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }
  return dateString;
}

function formatFieldValue(field: FieldSpec, rawValue: string): string {
  const value = rawValue.trim();
  if (!value) return "";

  switch (field.type) {
    case "date":
      return formatDate(value);
    case "number": {
      const num = Number(value);
      if (!Number.isNaN(num)) {
        return num.toLocaleString("fr-FR");
      }
      return value;
    }
    case "text": {
      const isAmount =
        field.name === "amount" ||
        field.label.toLowerCase().includes("amount");
      if (isAmount) {
        const normalized = value.replace(/\s/g, "").replace(",", ".");
        const num = Number(normalized);
        if (!Number.isNaN(num)) {
          return `${num.toFixed(2).replace(".", ",")} €`;
        }
      }
      return value;
    }
    default:
      return value;
  }
}

function isLongField(type: FieldType): boolean {
  return type === "textarea";
}

// ─── SAFE BOX DRAWER ───
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

// ─── LAYOUT HELPERS ───

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

interface FieldDef {
  label: string;
  value: string;
}

function addFieldsRow(
  doc: jsPDF,
  fields: FieldDef[],
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

function addField(
  doc: jsPDF,
  label: string,
  value: unknown,
  margin: number,
  y: number,
  contentWidth: number
): number {
  if (value === undefined || value === null || value === "" || value === "—") return y;

  y = addPageIfNeeded(doc, y, 14);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.muted);
  doc.text(label.toUpperCase(), margin, y);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);

  const text = String(value);
  const lines = doc.splitTextToSize(text, contentWidth);
  doc.text(lines, margin, y + 5);

  return y + Math.max(lines.length * 4.5, 6) + 4;
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

// ─── MAIN BUILDER ───

export async function buildReportPdfBlob(
  report: DailyReport
): Promise<{ blob: Blob; filename: string }> {
  const service = getService(report.service);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;

  let y = 0;

  // ═══════════════════════════════════════
  // HEADER BAND
  // ═══════════════════════════════════════
  const headerHeight = 38;

  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, headerHeight, "F");

  doc.setFillColor(...COLORS.primaryLight);
  doc.rect(0, headerHeight - 1.5, pageWidth, 1.5, "F");

  // Logo
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

  // Title block
  const titleX = margin + logoWidth + 10;
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("RAPPORT DE VOL", titleX, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(report.values["date"] || report.date), titleX, 24);

  // Flight info — right aligned
  const rightX = pageWidth - margin;
  const flightNumber = report.values["flightNumber"];
  if (flightNumber) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Vol ${flightNumber}`, rightX, 16, { align: "right" });
  }

  const destination = report.values["destination"];
  if (destination) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Destination : ${destination}`, rightX, 24, { align: "right" });
  }

  // Status badge
  const delayCode = report.values["delayCode"];
  const delayReason = report.values["delayReason"];
  if (delayCode || delayReason) {
    addStatusBadge(doc, "RETARD", "warning", rightX - 45, 32);
  } else if (report.values["actualDeparture"] && report.values["schedDeparture"]) {
    addStatusBadge(doc, "À L'HEURE", "success", rightX - 50, 32);
  }

  y = headerHeight + 14;

  // ═══════════════════════════════════════
  // DYNAMIC SECTIONS
  // ═══════════════════════════════════════
  for (const section of service.sections) {
    const filledFields = section.fields.filter((f) => {
      const raw = report.values[f.name];
      return raw !== undefined && raw !== null && String(raw).trim() !== "";
    });

    if (filledFields.length === 0) continue;

    const delayFields = filledFields.filter(
      (f) => f.name === "delayCode" || f.name === "delayReason"
    );
    const safetyField = filledFields.find((f) => f.name === "safetySecurityIncidents");
    const normalFields = filledFields.filter(
      (f) => f.name !== "delayCode" && f.name !== "delayReason"
    );

    y = addSectionTitle(doc, getSectionTitle(section.title), margin, y);

    // ── Normal fields ──
    const shortFields: FieldDef[] = [];
    const longFields: FieldDef[] = [];

    for (const field of normalFields) {
      const formatted = formatFieldValue(field, String(report.values[field.name]));
      if (isLongField(field.type) || formatted.length > 60 || formatted.includes("\n")) {
        longFields.push({ label: getFieldLabel(field), value: formatted });
      } else {
        shortFields.push({ label: getFieldLabel(field), value: formatted });
      }
    }

    if (shortFields.length > 0) {
      y = addFieldsRow(doc, shortFields, margin, y, contentWidth);
    }

    // Safety alert banner
    if (safetyField) {
      drawBox(doc, margin, y, contentWidth, 20, [254, 242, 242], [239, 68, 68], 0.5, true, 2);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.danger);
      doc.text("! INCIDENTS SIGNALÉS", margin + 6, y + 7);
      y += 14;
    }

    for (const field of longFields) {
      y = addTextBlock(doc, field.label, field.value, margin, y, contentWidth);
    }

    // ── Delay card ──
    if (delayFields.length > 0) {
      const cardHeight = delayFields.some((f) => f.name === "delayReason") ? 36 : 18;
      drawBox(
        doc,
        margin,
        y,
        contentWidth,
        cardHeight,
        [255, 251, 235],
        [245, 158, 11],
        0.5,
        true,
        2
      );

      y += 6;
      const delayCodeField = delayFields.find((f) => f.name === "delayCode");
      const delayReasonField = delayFields.find((f) => f.name === "delayReason");

      if (delayCodeField) {
        y = addField(
          doc,
          getFieldLabel(delayCodeField),
          formatFieldValue(delayCodeField, String(report.values["delayCode"])),
          margin + 4,
          y,
          contentWidth - 8
        );
      }

      if (delayReasonField) {
        y = addTextBlock(
          doc,
          getFieldLabel(delayReasonField),
          formatFieldValue(delayReasonField, String(report.values["delayReason"])),
          margin + 4,
          y,
          contentWidth - 8
        );
      }

      y += 4;
    }

    y += 5;
  }

  // ═══════════════════════════════════════
  // FOOTER (every page)
  // ═══════════════════════════════════════
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    const footerY = doc.internal.pageSize.getHeight() - 10;

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 6, pageWidth - margin, footerY - 6);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.muted);
    doc.text("Remise de poste — XCR-Airport", margin, footerY);

    const genDate = new Date().toLocaleDateString("fr-FR");
    doc.text(`Généré le ${genDate}`, pageWidth / 2, footerY, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text(`Page ${page} / ${totalPages}`, pageWidth - margin, footerY, { align: "right" });
  }

  // ═══════════════════════════════════════
  // OUTPUT
  // ═══════════════════════════════════════
  const dateStr = report.values["date"] || report.date || "draft";
  const filename = `remise-de-poste-service-${report.service}-${dateStr}.pdf`;

  const blob = doc.output("blob");
  return { blob, filename };
}

export async function generateReportPdf(report: DailyReport): Promise<void> {
  const { blob, filename } = await buildReportPdfBlob(report);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
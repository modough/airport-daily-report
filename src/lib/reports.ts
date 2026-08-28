import { getService, type ServiceKey } from "./services";

export type ReportValues = Record<string, string>;

export type DailyReport = {
  id: string;
  service: ServiceKey;
  date: string;
  values: ReportValues;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "station-daily-reports";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllReports(): DailyReport[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DailyReport[]) : [];
  } catch {
    return [];
  }
}

export function getReports(service: ServiceKey): DailyReport[] {
  return getAllReports().filter((r) => r.service === service);
}

export function saveReport(report: DailyReport): void {
  if (typeof window === "undefined") return;
  const reports = getAllReports();
  const index = reports.findIndex((r) => r.id === report.id);
  if (index >= 0) {
    reports[index] = report;
  } else {
    reports.unshift(report);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function deleteReport(id: string): void {
  if (typeof window === "undefined") return;
  const reports = getAllReports().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function getReportById(id: string): DailyReport | undefined {
  return getAllReports().find((r) => r.id === id);
}

export function createEmptyReport(service: ServiceKey): DailyReport {
  const now = new Date().toISOString();
  const today = now.split("T")[0]!;
  const values: ReportValues = {};
  for (const section of getService(service).sections) {
    for (const field of section.fields) {
      values[field.name] = field.name === "date" ? today : "";
    }
  }
  return {
    id: generateId(),
    service,
    date: today,
    values,
    createdAt: now,
    updatedAt: now,
  };
}

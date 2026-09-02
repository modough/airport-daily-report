import { useState } from "react";
import { format, parseISO } from "date-fns";
import { FileText, Trash2, Calendar, Plane, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getReports, deleteReport, type DailyReport } from "@/lib/reports";
import { deleteBriefing, getBriefings, type Briefing } from "@/lib/briefings";
import type { ServiceKey } from "@/lib/services";
import { buildReportPdfBlob } from "@/lib/pdf-generator";
import { generateBriefingPdf } from "@/lib/briefing-pdf";

type ReportHistoryProps = {
  service: ServiceKey;
  selectedId?: string | undefined;
  onSelect: (id: string) => void;
  refreshKey?: number | undefined;
};

export function ReportHistory({ service, selectedId, onSelect, refreshKey }: ReportHistoryProps) {
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const reports = getReports(service);
  const briefings = service === "passenger" || service === "traffic" ? getBriefings(service) : [];

  void refreshKey;

  const handleDelete = (id: string) => {
    if (briefings.some((briefing) => briefing.id === id)) deleteBriefing(id);
    else deleteReport(id);
    setDeleteTarget(null);
  };

  return (
    <Card className=" bg-card ">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight uppercase">Historique des documents</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)] min-h-[300px]">
          <div className="space-y-2 px-6 pb-6">
            {reports.length === 0 && briefings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucun rapport enregistré pour ce service.
                </p>
              </div>
            ) : (
              <>
                {reports.map((report) => (
                  <HistoryItem
                    key={report.id}
                    report={report}
                    isSelected={report.id === selectedId}
                    onSelect={() => onSelect(report.id)}
                    onDelete={() => setDeleteTarget(report.id)}
                    deleting={deleteTarget === report.id}
                    onConfirmDelete={() => handleDelete(report.id)}
                    onCancelDelete={() => setDeleteTarget(null)}
                  />
                ))}
                {briefings.map((briefing) => (
                  <BriefingHistoryItem
                    key={briefing.id}
                    briefing={briefing}
                    isSelected={briefing.id === selectedId}
                    onSelect={() => onSelect(briefing.id)}
                    onDelete={() => setDeleteTarget(briefing.id)}
                    deleting={deleteTarget === briefing.id}
                    onConfirmDelete={() => handleDelete(briefing.id)}
                    onCancelDelete={() => setDeleteTarget(null)}
                  />
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function HistoryItem({
  report,
  isSelected,
  onSelect,
  onDelete,
  deleting,
  onConfirmDelete,
  onCancelDelete,
}: {
  report: DailyReport;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  deleting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const rawDate = report.values["date"] || report.date;
  const date = parseISO(rawDate);
  const displayDate = Number.isNaN(date.getTime()) ? rawDate : format(date, "MMM d, yyyy");
  const flight = report.values["flightNumber"];
  const destination = report.values["destination"];

  return (
    <div
      className={`group rounded-lg border p-4 transition-colors ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border bg-background hover:bg-accent/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <button onClick={onSelect} className="flex-1 text-left" type="button">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{displayDate}</span>
          </div>
          <h4 className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Plane className="h-3.5 w-3.5 text-muted-foreground" />
            {flight || "No flight number"}
            {destination ? ` → ${destination}` : ""}
          </h4>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {report.values["supervisorName"] || report.values["completedBy"] || "No agent recorded"}
          </p>
        </button>
        <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => void (async () => {
              const { blob } = await buildReportPdfBlob(report);
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
            })()}
            title="Aperçu PDF"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
          </Button>
          <AlertDialog open={deleting} onOpenChange={(open) => !open && onCancelDelete()}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onDelete}
                title="Delete report"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Voulez-vous supprimer ce rapport ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le rapport sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={onCancelDelete}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onConfirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function BriefingHistoryItem({
  briefing,
  isSelected,
  onSelect,
  onDelete,
  deleting,
  onConfirmDelete,
  onCancelDelete,
}: {
  briefing: Briefing;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  deleting: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const rawDate = briefing.values["date"] || briefing.date;
  const date = parseISO(rawDate);
  const displayDate = Number.isNaN(date.getTime()) ? rawDate : format(date, "MMM d, yyyy");
  const supervisor = briefing.values["supervisorName"] || "No supervisor recorded";
  const briefingTime = briefing.values["briefingTime"];
  const flight = briefing.values["flightNumber"];
  const flightCount = briefing.rows.filter((row) =>
    Object.values(row).some((value) => value.trim() !== "")
  ).length;

  return (
    <div className={`group rounded-lg border p-4 transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-border bg-background hover:bg-accent/50"}`}>
      <div className="flex items-start justify-between gap-2">
        <button onClick={onSelect} className="flex-1 text-left" type="button">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase text-primary">Briefing</span>
            <Calendar className="ml-1 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{displayDate}</span>
            {briefingTime ? (
              <>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-sm font-medium text-foreground">{briefingTime}</span>
              </>
            ) : null}
          </div>
          <h4 className="mt-1 text-sm font-semibold text-foreground">
            {flight ? `Vol ${flight}` : briefing.service === "traffic" ? `${flightCount} vol(s)` : "Briefing passage"}
          </h4>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{supervisor}</p>
        </button>
        <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => generateBriefingPdf(briefing)}
            title="Générer le PDF"
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
          </Button>
          <AlertDialog open={deleting} onOpenChange={(open) => !open && onCancelDelete()}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete} title="Delete briefing">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Voulez-vous supprimer ce briefing ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Le briefing sera définitivement supprimé.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={onCancelDelete}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

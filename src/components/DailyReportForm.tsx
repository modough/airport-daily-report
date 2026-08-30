import { useEffect, useMemo, useState } from "react";
import { Save, FileText, Space } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createEmptyReport,
  getReportById,
  saveReport,
  type DailyReport,
  type ReportValues,
} from "@/lib/reports";
import { getService, type ServiceKey } from "@/lib/services";
import { generateReportPdf, buildReportPdfBlob } from "@/lib/pdf-generator";

type DailyReportFormProps = {
  service: ServiceKey;
  selectedId?: string | undefined;
  onSaved?: ((report: DailyReport) => void) | undefined;
};

export function DailyReportForm({ service, selectedId, onSaved }: DailyReportFormProps) {
  const spec = useMemo(() => getService(service), [service]);

  const initialReport = useMemo<DailyReport>(() => {
    if (selectedId) {
      const existing = getReportById(selectedId);
      if (existing) return existing;
    }
    return createEmptyReport(service);
  }, [selectedId, service]);

  const [values, setValues] = useState<ReportValues>(initialReport.values);

  useEffect(() => {
    setValues(initialReport.values);
  }, [initialReport]);

  const setField = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const buildReport = (): DailyReport => {
    const now = new Date().toISOString();
    return {
      id: initialReport.id,
      service,
      date: values["date"] || initialReport.date,
      values,
      createdAt: initialReport.createdAt || now,
      updatedAt: now,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const report = buildReport();
    saveReport(report);
    onSaved?.(report);
  };

  return (
    <Card className="bg-card border-none">
      <CardHeader className="pb-4 bg-[rgb(30,58,95))] text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold tracking-tight uppercase">
          {selectedId ? "Modifier" : ""} remise de poste service {spec.label}
        </CardTitle>
        <p className="text-sm text-white">{spec.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {spec.sections.map((section) => (
            <section key={section.title} className="space-y-4 border-l-[3px] border-[rgb(59,130,246)] pl-4">
              <h3 className=" pb-2 text-sm font-bold uppercase tracking-wide text-[#1E3A5F]">
                {section.title}
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div
                    key={field.name}
                    className={`space-y-2 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}
                  >
                    <Label htmlFor={`${service}-${field.name}`} className="text-muted-foreground">
                      {field.label}
                    </Label>

                    {field.type === "textarea" ? (
                      <Textarea
                        id={`${service}-${field.name}`}
                        rows={3}
                        value={values[field.name] ?? ""}
                        onChange={(e) => setField(field.name, e.target.value)}
                        className="resize-none bg-background"
                      />
                    ) : (
                      <Input
                        id={`${service}-${field.name}`}
                        type={field.type}
                        value={values[field.name] ?? ""}
                        onChange={(e) => setField(field.name, e.target.value)}
                        className="bg-background"
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button type="submit" className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Enregistrer le rapport
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                const { blob } = await buildReportPdfBlob(buildReport());
                const url = URL.createObjectURL(blob);
                window.open(url, "_blank");
              }}
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              Aperçu PDF
            </Button>

            <Button
              type="button"
              variant="red"
              onClick={() => void generateReportPdf(buildReport())}
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              Générer le PDF
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

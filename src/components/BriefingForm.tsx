import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createEmptyBriefing,
  getBriefingSpec,
  saveBriefing,
  type Briefing,
  type BriefingServiceKey,
} from "@/lib/briefings";
import { buildBriefingPdfBlob, generateBriefingPdf } from "@/lib/briefing-pdf";
import {
  chefManoeuvreList,
  flightTypeOptions,
  parkingList,
  passengerAgents,
  pisteEnServiceList,
  pisteEtatList,
  prmList,
  RFFSList,
  trafficAgents,
} from "@/lib/services";
import { MultiSelect } from "./ui/multi-select";
import { Badge } from "./ui/badge";

export function BriefingForm({
  service,
  onSaved,
}: {
  service: BriefingServiceKey;
  onSaved?: () => void;
}) {
  const spec = useMemo(() => getBriefingSpec(service), [service]);
  const initial = useMemo(() => createEmptyBriefing(service), [service]);

  const [values, setValues] = useState(initial.values);
  const [rows, setRows] = useState(initial.rows);
  const [tomorrowRows, setTomorrowRows] = useState(initial.tomorrowRows ?? []);

  useEffect(() => {
    setValues(initial.values);
    setRows(initial.rows);
    setTomorrowRows(initial.tomorrowRows ?? []);
  }, [initial]);

  const setField = (name: string, value: string) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const setCell = (index: number, name: string, value: string) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [name]: value } : row)));

  const setTomorrowCell = (index: number, name: string, value: string) =>
    setTomorrowRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [name]: value } : row)),
    );

  const build = (): Briefing => {
    const now = new Date().toISOString();
    return {
      ...initial,
      date: values["date"] || initial.date,
      values,
      rows,
      tomorrowRows,
      updatedAt: new Date(now),
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveBriefing(build());
    onSaved?.();
    toast.success("Briefing saved successfully");
  };

  const columns = spec.columns ?? [];
  const tomorrowColumns = spec.tomorrowColumns ?? [];

  const agentsList = spec.key === "traffic" ? trafficAgents : passengerAgents;
  const totalBags = spec.sections
    .flatMap((section) => section.fields)
    .filter(
      (field) =>
        field.type === "number" &&
        ["wclb", "wcbd", "golf", "bg23", "wcmp", "bbg", "cbag", "bike"].includes(field.name),
    )
    .reduce((total, field) => {
      const value = Number(values[field.name] ?? 0);
      return total + (Number.isFinite(value) ? value : 0);
    }, 0);

  return (
    <Card className="min-w-0 border-none bg-card">
      <CardHeader className="pb-4 bg-[rgb(30,58,95))] text-white rounded-t-lg">
        <CardTitle className="text-lg font-semibold tracking-tight uppercase">
          Briefing Service {spec.label}
        </CardTitle>
        <p className="text-sm text-white">{spec.description}</p>
      </CardHeader>
      <CardContent className="min-w-0 space-y-6 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {spec.sections.map((section) => (
            <section
              key={section.title}
              className="space-y-4 border-l-[3px] border-[rgb(59,130,246)] pl-4"
            >
              <h3 className="pb-2 text-sm font-bold text-[#1E3A5F] uppercase tracking-wide">
                {section.title}
              </h3>
              <div className="grid gap-4 sm:grid-cols-4">
                {section.fields.map((field) => {
                  const fieldValue = values?.[field.name] ?? "";
                  return (
                    <div
                      key={field.name}
                      className={`space-y-2 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}
                    >
                      {field.type === "checkbox" ? (
                        <div className="flex items-center gap-3  bg-background px-3 py-2">
                          <input
                            id={`briefing-${service}-${field.name}`}
                            type="checkbox"
                            checked={fieldValue === "true"}
                            onChange={(e) =>
                              setField(field.name, e.target.checked ? "true" : "false")
                            }
                            className="h-4 w-4 accent-primary"
                          />
                          <Label
                            htmlFor={`briefing-${service}-${field.name}`}
                            className="text-muted-foreground"
                          >
                            {field.label}
                          </Label>
                        </div>
                      ) : field.type === "badge" ? (
                        <div className="flex items-center gap-3  bg-background px-3 py-2">
                          <Label
                            htmlFor={`briefing-${service}-${field.name}`}
                            className="text-muted-foreground"
                          >
                            {field.label}
                          </Label>
                          <Badge className="px-6 py-2">{totalBags}</Badge>
                        </div>
                      ) : field.type === "select" ? (
                        <>
                          <Label
                            htmlFor={`briefing-${service}-${field.name}`}
                            className="text-muted-foreground"
                          >
                            {field.label}
                          </Label>

                          <Select
                            value={fieldValue}
                            onValueChange={(value) => setField(field.name, value)}
                          >
                            <SelectTrigger
                              id={`briefing-${service}-${field.name}`}
                              className="bg-background"
                            >
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>

                            <SelectContent>
                              {field.name === "pisteNumber"
                                ? pisteEnServiceList.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))
                                : field.name === "chefManoeuvre"
                                  ? chefManoeuvreList.map((option) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    ))
                                  : field.name === "pisteEtat"
                                    ? pisteEtatList.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))
                                    : field.name === "rffsNiveau"
                                      ? RFFSList.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))
                                      : field.name === "supervisorName"
                                        ? trafficAgents.map((option) => (
                                            <SelectItem key={option} value={option}>
                                              {option}
                                            </SelectItem>
                                          ))
                                        : agentsList.map((option) => (
                                            <SelectItem key={option} value={option}>
                                              {option}
                                            </SelectItem>
                                          ))}
                            </SelectContent>
                          </Select>
                        </>
                      ) : (
                        <>
                          <Label
                            htmlFor={`briefing-${service}-${field.name}`}
                            className="text-muted-foreground"
                          >
                            {field.label}
                          </Label>
                          {field.type === "textarea" ? (
                            <Textarea
                              id={`briefing-${service}-${field.name}`}
                              rows={3}
                              value={fieldValue}
                              onChange={(e) => setField(field.name, e.target.value)}
                              className="resize-none bg-background uppercase"
                              placeholder={field.placeholder ?? ""}
                            />
                          ) : field.type === "select-multi" ? (
                            <MultiSelect
                              value={
                                values[field.name] ? fieldValue.split(",").map((v) => v.trim()) : []
                              }
                              onValueChange={(value) => setField(field.name, value.join(", "))}
                              options={
                                field.name === "checkinCounters" || field.name === "boardingGate"
                                  ? ["1", "2", "3", "4", "5", "6"].map((counter) => ({
                                      value: counter,
                                      label: counter,
                                    }))
                                  : field.name === "checkinAgents" ||
                                      field.name === "boardingAgents" ||
                                      field.name === "ticketingAgent" ||
                                      field.name === "arrivalAgents"
                                    ? passengerAgents.map((agent) => ({
                                        value: agent,
                                        label: agent,
                                      }))
                                    : trafficAgents.map((agent) => ({
                                        value: agent,
                                        label: agent,
                                      }))
                              }
                              placeholder="Sélectionner agents..."
                            />
                          ) : (
                            <Input
                              id={`briefing-${service}-${field.name}`}
                              type={field.type}
                              value={fieldValue}
                              onChange={(e) => setField(field.name, e.target.value)}
                              className="bg-background"
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          {columns.length > 0 && (
            <section className="min-w-0 space-y-4 border-l-[3px] border-[rgb(59,130,246)] pl-4">
              {spec.key === "traffic" ? (
                <h3 className="pb-2 text-sm font-bold uppercase tracking-wide text-[#1E3A5F]">
                  Prévision des vols - Aujourd'hui
                </h3>
              ) : (
                <h3 className="pb-2 text-sm font-bold uppercase tracking-wide text-[#1E3A5F]">
                  Prévision des Passagers - PMR
                </h3>
              )}
              <div className="min-w-0 max-w-full overflow-x-scroll rounded-lg border border-border">
                <table className="min-w-[1200px] border-collapse text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.name}
                          className="whitespace-nowrap border-b border-border px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {col.label}
                        </th>
                      ))}
                      <th className="w-12 border-b border-border" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        {columns.map((col) => (
                          <td key={col.name} className="min-w-[110px] p-1">
                            {col.type === "select" ? (
                              <Select
                                value={row[col.name] ?? ""}
                                onValueChange={(value) => setCell(index, col.name, value)}
                              >
                                <SelectTrigger
                                  aria-label={`${col.label} ligne ${index + 1}`}
                                  className="h-9 w-full bg-background text-sm"
                                >
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                  {col.name === "prmType"
                                    ? prmList.map((prm) => (
                                        <SelectItem key={prm} value={prm}>
                                          {prm}
                                        </SelectItem>
                                      ))
                                    : col.name === "parking"
                                      ? parkingList.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))
                                      : flightTypeOptions.map((option) => (
                                          <SelectItem key={option} value={option}>
                                            {option}
                                          </SelectItem>
                                        ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type={col.type}
                                aria-label={`${col.label} ligne ${index + 1}`}
                                value={row[col.name] ?? ""}
                                onChange={(e) => setCell(index, col.name, e.target.value)}
                                className="h-9 w-full bg-background text-sm"
                              />
                            )}
                          </td>
                        ))}
                        <td className="w-12 p-1 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Supprimer la ligne ${index + 1}`}
                            onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setRows((prev) => [
                    ...prev,
                    Object.fromEntries(columns.map((col) => [col.name, ""])),
                  ])
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </section>
          )}

          {tomorrowColumns.length > 0 && (
            <section className="min-w-0 space-y-4 border-l-[3px] border-[rgb(59,130,246)] pl-4">
              <h3 className="pb-2 text-sm font-bold uppercase tracking-wide text-[#1E3A5F]">
                Prévision des vols - Demain
              </h3>
              <div className="min-w-0 max-w-full overflow-x-scroll rounded-lg border border-border">
                <table className="min-w-[1200px] border-collapse text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      {tomorrowColumns.map((col) => (
                        <th
                          key={col.name}
                          className="whitespace-nowrap border-b border-border px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {col.label}
                        </th>
                      ))}
                      <th className="w-12 border-b border-border" />
                    </tr>
                  </thead>
                  <tbody>
                    {tomorrowRows.map((row, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        {tomorrowColumns.map((col) => (
                          <td key={col.name} className="min-w-[110px] p-1">
                            {col.type === "select" ? (
                              <Select
                                value={row[col.name] ?? ""}
                                onValueChange={(value) => setTomorrowCell(index, col.name, value)}
                              >
                                <SelectTrigger
                                  aria-label={`${col.label} ligne ${index + 1}`}
                                  className="h-9 w-full bg-background text-sm"
                                >
                                  <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                  {col.name === "parking"
                                    ? parkingList.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))
                                    : flightTypeOptions.map((option) => (
                                        <SelectItem key={option} value={option}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type={col.type}
                                aria-label={`${col.label} ligne ${index + 1}`}
                                value={row[col.name] ?? ""}
                                onChange={(e) => setTomorrowCell(index, col.name, e.target.value)}
                                className="h-9 w-full bg-background text-sm"
                              />
                            )}
                          </td>
                        ))}
                        <td className="w-12 p-1 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Supprimer la ligne ${index + 1}`}
                            onClick={() =>
                              setTomorrowRows((prev) => prev.filter((_, i) => i !== index))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setTomorrowRows((prev) => [
                    ...prev,
                    Object.fromEntries(tomorrowColumns.map((col) => [col.name, ""])),
                  ])
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </section>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button type="submit" className="flex-1">
              <Save className="mr-2 h-4 w-4" />
              Enregistrer le briefing
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={async () => {
                const { blob } = await buildBriefingPdfBlob(build());
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
              onClick={() => generateBriefingPdf(build())}
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

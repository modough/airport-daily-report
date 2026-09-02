import { useState } from "react";
import bgImage from "@/assets/xcr-motif-couleur.svg";
import { toast } from "sonner";
import { BriefingForm } from "@/components/BriefingForm";
import { DailyReportForm } from "@/components/DailyReportForm";
import { ReportHistory } from "@/components/ReportHistory";
import type { BriefingServiceKey } from "@/lib/briefings";
import { type ServiceKey } from "@/lib/services";
import Header from "./Header";
import { Button } from "./ui/button";

const BRIEFING_SERVICES: ServiceKey[] = ["passenger", "traffic"];

export function ServicePage({ service }: { service: ServiceKey }) {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState<"report" | "briefing">("report");
  const hasBriefing = BRIEFING_SERVICES.includes(service);

  const handleSaved = () => {
    setRefreshKey((k) => k + 1);
    toast.success("Rapport enregistré avec succès !");
  };

  return (
    <div
      className="relative min-h-screen overflow-x-clip bg-repeat"
      style={{ backgroundColor: "rgb(30,58,95)", backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-white/30" />

      <div className="relative z-10">
        <Header service={service} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ">
          {hasBriefing && (
            <div className="mb-6 inline-flex rounded-lg border border-border bg-card p-1">
              
              <Button
                size="sm"
                variant={tab === "briefing" ? "default" : "ghost"}
                onClick={() => setTab("briefing")}
              >
                Briefing
              </Button>
              <Button
                size="sm"
                variant={tab === "report" ? "default" : "ghost"}
                onClick={() => setTab("report")}
              >
                Remise de poste
              </Button>
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            {hasBriefing && tab === "briefing" ? (
              <BriefingForm service={service as BriefingServiceKey} onSaved={() => setRefreshKey((k) => k + 1)} />
            ) : (
              <DailyReportForm service={service} selectedId={selectedId} onSaved={handleSaved} />
            )}
            <div className="sticky top-24 self-start ">
              <ReportHistory
                service={service}
                selectedId={selectedId}
                onSelect={setSelectedId}
                refreshKey={refreshKey}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

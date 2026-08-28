import { createFileRoute } from "@tanstack/react-router";

import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/traffic")({
  component: TrafficPage,
  head: () => ({
    meta: [
      { title: "Traffic Service Daily Report" },
      {
        name: "description",
        content:
          "Track aircraft handling, GSE, loading and pushback activity and export the traffic service daily report as PDF.",
      },
      { property: "og:title", content: "Traffic Service Daily Report" },
      {
        property: "og:description",
        content:
          "Track aircraft handling, GSE, loading and pushback activity and export the traffic service daily report as PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function TrafficPage() {
  return <ServicePage service="traffic" />;
}

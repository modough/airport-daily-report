import { createFileRoute } from "@tanstack/react-router";

import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/ramp")({
  component: RampPage,
  head: () => ({
    meta: [
      { title: "Ramp Service Daily Report" },
      {
        name: "description",
        content:
          "Track aircraft handling, GSE, loading and pushback activity and export the ramp service daily report as PDF.",
      },
      { property: "og:title", content: "Ramp Service Daily Report" },
      {
        property: "og:description",
        content:
          "Track aircraft handling, GSE, loading and pushback activity and export the ramp service daily report as PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function RampPage() {
  return <ServicePage service="ramp" />;
}

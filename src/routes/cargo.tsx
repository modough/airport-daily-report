import { createFileRoute } from "@tanstack/react-router";

import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/cargo")({
  component: CargoPage,
  head: () => ({
    meta: [
      { title: "Cargo Service Daily Report" },
      {
        name: "description",
        content:
          "Record freight, mail, dangerous goods and warehouse activity and export the cargo service daily report as PDF.",
      },
      { property: "og:title", content: "Cargo Service Daily Report" },
      {
        property: "og:description",
        content:
          "Record freight, mail, dangerous goods and warehouse activity and export the cargo service daily report as PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function CargoPage() {
  return <ServicePage service="cargo" />;
}


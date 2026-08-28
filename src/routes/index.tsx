import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/Header";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Daily Report Generator" },
      {
        name: "description",
        content:
          "Generate daily PDF reports from a simple form. Save entries locally and export professional PDFs in seconds.",
      },
      { property: "og:title", content: "Passenger Service Daily Report" },
      {
        property: "og:description",
        content:
          "Generate daily PDF reports from a simple form. Save entries locally and export professional PDFs in seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  return <ServicePage service="passenger" />;
}

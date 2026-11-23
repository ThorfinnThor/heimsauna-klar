import { HomePage } from "../_components/HomePage";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Select Your Sauna Startseite",
  description: "Über 500 Saunen und Infrarotkabinen für zu Hause: nach Platz, Stromanschluss und Budget filtern und Preise der Händler vergleichen.",
  path: "/de/",
});

export default function Page() {
  return <HomePage />;
}

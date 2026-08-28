import { HomePage } from "./_components/HomePage";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Welche Sauna passt zu deinem Zuhause?",
  description: "Finde den passenden Heimsauna-Typ anhand von Platz, Stromanschluss, Budget und Nutzung — verständlich und unabhängig.",
  path: "/de/",
});

export default function Page() {
  return <HomePage />;
}

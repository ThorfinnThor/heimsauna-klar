import type { Metadata } from "next";
import { HomePage } from "../_components/HomePage";

export const metadata: Metadata = {
  title: "Welche Sauna passt zu deinem Zuhause?",
  description:
    "Finde den passenden Heimsauna-Typ anhand von Platz, Stromanschluss, Budget und Nutzung — verständlich und unabhängig.",
  alternates: { canonical: "/de/" },
};

export default function Page() {
  return <HomePage />;
}

import type { Metadata } from "next";
import { HomePage } from "./_components/HomePage";

export const metadata: Metadata = {
  alternates: { canonical: "/de/" },
};

export default function Page() {
  return <HomePage />;
}

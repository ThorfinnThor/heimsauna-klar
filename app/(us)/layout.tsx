import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Select Your Sauna — independent US sauna planning",
    template: "%s | Select Your Sauna",
  },
  description: "Independent product research and planning information for home saunas in the United States.",
  creator: "Schayan Yousefian",
  publisher: "SeitenHafen361",
  robots: { index: false, follow: false },
};

export default function UsRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body>{children}</body>
    </html>
  );
}

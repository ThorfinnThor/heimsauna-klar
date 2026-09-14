import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/app/_components/SiteChrome";
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
  icons: {
    icon: [
      { url: "/brand/sauna-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/sauna-48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/sauna-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  robots: { index: false, follow: true },
};

export default function UsRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteHeader market="US" />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <SiteFooter market="US" />
      </body>
    </html>
  );
}

import { Inter, Orbitron } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron", weight: ["500", "700", "900"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning className={`${orbitron.variable} ${inter.variable}`}>
      <head>
        <title>Tornei Lega del Razzo</title>
        <meta name="description" content="Tracker interattivo del tabellone dei Tornei Lega del Razzo." />
        <meta name="theme-color" content="#070a14" />
      </head>
      <body suppressHydrationWarning className="min-h-dvh font-sans text-slate-100 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}

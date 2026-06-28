import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TalentLens AI — Beyond Keywords. Beyond Resumes.",
  description:
    "AI-powered hiring copilot that semantically matches candidates, explains every decision, and helps recruiters hire better. Reduce bias. Discover hidden talent.",
  keywords: ["AI hiring", "semantic matching", "resume screening", "ATS", "talent acquisition"],
  openGraph: {
    title: "TalentLens AI",
    description: "Beyond Keywords. Beyond Resumes. Hiring Intelligence.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

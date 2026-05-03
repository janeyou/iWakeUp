import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopNav } from "@/components/TopNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Radar, what AI agents shipped overnight",
  description:
    "A live timeline of releases, changelog drops, and announcements from the AI agents you actually use. Updated daily at 5am PT. I wake up, there is another AI update.",
  keywords: ["AI Radar", "AI agents", "Claude", "Cursor", "agentic AI", "release tracker", "iWakeUp"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Light by default; the theme toggle adds `dark` to flip.
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TopNav />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

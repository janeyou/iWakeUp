import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TopNav } from "@/components/TopNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Radar, i wake up, there is another AI update",
  description:
    "A daily public tracker of what the AI agents shipped while you slept. Updated every morning at 5am PT.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Dark by default. The theme toggle adds `light` to flip; nothing else opts in.
    // suppressHydrationWarning silences next-themes' first-paint class diff.
    <html
      lang="en"
      className={`dark ${inter.variable} ${mono.variable} ${display.variable}`}
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

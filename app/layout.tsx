import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SermonGraphic Builder",
  description: "Create cinematic sermon graphics with concept-first AI generation."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

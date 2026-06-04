import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SermonGraphic Builder",
  description: "Create premium sermon graphics with concept-first AI backgrounds and controlled typography."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

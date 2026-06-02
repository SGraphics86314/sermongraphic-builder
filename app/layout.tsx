import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SermonGraphic Builder",
  description: "Generate sermon graphics, church flyers, and stage visuals."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

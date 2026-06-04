import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SermonGraphic Builder",
  description: "Create concept-driven church-ready sermon graphics."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

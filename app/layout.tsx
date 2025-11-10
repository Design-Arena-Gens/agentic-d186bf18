import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Go To Market AI Agent",
  description:
    "Agentic workspace that crafts go-to-market plans, positioning, messaging, and launch motions for AI products.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

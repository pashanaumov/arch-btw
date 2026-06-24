import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "arch-btw",
  description: "System design interview practice",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

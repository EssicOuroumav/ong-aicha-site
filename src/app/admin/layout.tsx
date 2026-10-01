import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = { title: "Administration | ONG AICHA", robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={body.variable}>
      <body className="min-h-screen bg-stone-50">{children}</body>
    </html>
  );
}

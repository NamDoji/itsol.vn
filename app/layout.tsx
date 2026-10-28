import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ITSOL – Talents Trusted Partner",
    template: "%s | ITSOL"
  },
  description:
    "ITSOL helps enterprises scale IT teams, build software products, and adopt AI-powered digital transformation. Since 2009 · 250+ engineers · 10 Sao Khuê Awards.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
  openGraph: {
    title: "ITSOL – Talents Trusted Partner",
    description: "IT Staffing, Software Outsourcing, ODC, Product Development and AI Solutions from Vietnam.",
    type: "website",
    images: [{ url: "/brand/itsol-logo.png" }]
  },
  twitter: { card: "summary_large_image" },
  keywords: ["IT staffing", "software outsourcing", "ODC Vietnam", "IT resource leasing", "software development Vietnam"]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

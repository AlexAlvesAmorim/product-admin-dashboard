import type { Metadata } from "next";
import "./globals.css";

// No next/font/google here on purpose: downloading webfonts at dev/build time
// couples the dashboard to Google Fonts availability. System stack is enough.
export const metadata: Metadata = {
  title: "Product Admin Dashboard",
  description: "Admin dashboard to manage products (Next.js + Axios + DummyJSON)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Footer } from "@/components/footer";
import { themeInitScript } from "@/lib/theme-script";

export const metadata: Metadata = {
  title: "memorynote.io — design system",
  description:
    "The design system of memorynote.io: tokens, base styles, and the core components.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Sets data-theme before first paint, so no wrong mode is shown. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <div className="wrap">
          <Footer />
        </div>
      </body>
    </html>
  );
}

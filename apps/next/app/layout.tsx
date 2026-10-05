import "./globals.css";
import type { ReactNode } from "react";
import { cn } from "cn";
import { configure } from "reclassify";

configure({ cx: cn });

export const metadata = {
  description: "Next.js example for reclassify",
  title: "reclassify Next.js example",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

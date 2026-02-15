import type { Metadata } from "next";
import { Space_Grotesk, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"]
});

const bodyFont = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "WebMCP Studio",
  description: "A clean tutorial + playground UI for integrating WebMCP into websites."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${headingFont.variable} ${bodyFont.variable}`}>{children}</body>
    </html>
  );
}

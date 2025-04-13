import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PageTransition from "../components/PageTransition";
import { Suspense } from "react";

const inter = Inter(
  {
    subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tariff AI",
  description: "Tariff AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
       
        <Suspense fallback={<></>}>
          {children}
        </Suspense>

      </body>
    </html>
  );
}

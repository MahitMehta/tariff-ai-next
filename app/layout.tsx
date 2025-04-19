import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import BottomBar from "../components/BottomBar";
import "./globals.css";

const inter = Inter(
  {
    subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PoliStock AI",
  description: "PoliStock AI",
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
          <div className="hidden sm:block">
            <BottomBar />
          </div>
        </Suspense>

      </body>
    </html>
  );
}

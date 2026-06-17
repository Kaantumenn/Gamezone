import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PS Cafe - Yönetim Paneli",
  description: "PlayStation Cafe yönetim dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full overflow-hidden bg-[#05050a] text-white">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

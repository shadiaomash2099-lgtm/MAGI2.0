import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAGI 2.0",
  description: "MAGI System — 三贤人 AI 辩论系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="bg-[#0a0a0a]">
      <body className="font-eva antialiased w-full h-full overflow-hidden">
        {children}
      </body>
    </html>
  );
}

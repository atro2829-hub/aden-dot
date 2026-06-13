import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aden Dot | عدن دوت - Social Platform",
  description: "منصة عدن دوت الاجتماعية - Aden Dot Social Platform. Share posts, images, videos and connect with people around the world.",
  keywords: ["Aden Dot", "عدن دوت", "Social Media", "Community", "Posts", "Chat", "QTBM DEV"],
  authors: [{ name: "QTBM DEV" }],
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: '#1A1F36', color: '#FFFFFF' }}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

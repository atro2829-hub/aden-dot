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
    apple: "/icon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Aden Dot | عدن دوت",
    description: "منصة عدن دوت الاجتماعية",
    images: ["/icon.png"],
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aden Dot",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

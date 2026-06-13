import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/* ------------------------------------------------------------------
   Viewport configuration — covers notch / safe-area on iOS
   ------------------------------------------------------------------ */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0F0F" },
  ],
};

/* ------------------------------------------------------------------
   App metadata
   ------------------------------------------------------------------ */
export const metadata: Metadata = {
  title: "Aden Dot | عدن دوت - Social Platform",
  description:
    "منصة عدن دوت الاجتماعية - Aden Dot Social Platform. Share posts, images, videos and connect with people around the world.",
  keywords: [
    "Aden Dot",
    "عدن دوت",
    "Social Media",
    "Community",
    "Posts",
    "Chat",
    "QTBM DEV",
  ],
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
  formatDetection: {
    telephone: false,
  },
};

/* ------------------------------------------------------------------
   Root Layout — RTL-first, with dir attribute for LTR/RTL switching
   ------------------------------------------------------------------ */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Apple mobile web app meta tags (supplementary) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Prevent automatic phone number detection */}
        <meta name="format-detection" content="telephone=no" />
        {/* Theme color fallback for non-Chromium browsers */}
        <meta name="theme-color" content="#0F0F0F" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}

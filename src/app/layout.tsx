import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/mac-text-optimization.css";
import { NotificationProvider } from "@/components/ui/Notification";
import { UnifiedTemplateProvider } from "@/contexts/UnifiedTemplateContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loan Officer Platform",
  description: "Professional loan management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NotificationProvider>
          <UnifiedTemplateProvider>
            {children}
          </UnifiedTemplateProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from "@/components/ui/Notification";
import { UnifiedTemplateProvider } from "@/contexts/UnifiedTemplateContext";

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
        className="antialiased"
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

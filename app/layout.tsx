import type { Metadata, Viewport } from "next";
import { Playfair_Display, Libre_Baskerville } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { DarkModeProvider } from "@/components/DarkModeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import { InstallPrompt } from "@/components/InstallPrompt";
import Script from "next/script";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Two Souls on the Road",
  description: "A living book of our journeys — Ива & Мео",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Two Souls",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#4A2F6B",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${libreBaskerville.variable} antialiased`}
      >
        <DarkModeProvider>
          <AuthProvider>
            <NotificationProvider>
              <div className="min-h-screen paper-texture">
                {children}
              </div>
              <BottomNav />
              <InstallPrompt />
            </NotificationProvider>
          </AuthProvider>
        </DarkModeProvider>

        <Script id="sales-widget-config" strategy="beforeInteractive">
          {`window.SalesWidgetConfig = {
            tenantId: "f47d08b4-b80e-47b1-8242-3572761c9d11",
            apiUrl: "https://construction-widget-production.up.railway.app"
          };`}
        </Script>
        <Script
          src="https://construction-widget-production.up.railway.app/widget.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

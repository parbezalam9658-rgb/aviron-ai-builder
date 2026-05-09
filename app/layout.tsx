import type { Metadata } from "next";
import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers/auth-provider";
import PwaRegister from "./components/pwa-register";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aviron AI Builder",
  description: "Premium AI website generation platform",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/aviron-icon.svg",
    apple: "/icons/aviron-icon.svg",
  },
  appleWebApp: {
    capable: true,
    title: "Aviron AI",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
        <PwaRegister />
      </body>
    </html>
  );
}

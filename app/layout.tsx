import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { BackgroundAnimation } from "@/components/ui/background-animation";
import { LanguageSelector } from "@/components/ui/language-selector";
import { LanguageProvider } from "@/components/providers/language-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { Toaster } from "@/components/ui/sonner"


const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "DARLINK.tn",
  description: "Authentic stays. Unforgettable memories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased`}
      >
        <LanguageProvider>
          <UserProvider>
            <BackgroundAnimation />
            <LanguageSelector />
            {children}
            <Toaster />
          </UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

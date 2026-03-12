import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SafeArea } from "./components/SafeArea";
import { WalletGate } from "./components/WalletGate";
import { appConfig } from "../app.config";
import { Providers } from "./providers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: appConfig.app.name,
    description: appConfig.app.description,
    openGraph: {
      title: appConfig.seo.ogTitle,
      description: appConfig.seo.ogDescription,
      images: [appConfig.seo.ogImageUrl],
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html lang="en">
        <body className={inter.variable}>
          <SafeArea>
            <WalletGate>{children}</WalletGate>
          </SafeArea>
        </body>
      </html>
    </Providers>
  );
}

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { LoadingProvider } from '../components/LoadingProvider';
import "./globals.css";

// Using Inter as the closest approximation to Neue Haas Grotesk
const neueHaasGrotesk = Inter({
  variable: "--font-neue-haas",
  subsets: ["latin"],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "MockOffer - AI-Powered Mock Coding Interviews",
  description: "Practice coding interviews with AI-powered feedback and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${neueHaasGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased luxury-noir-theme`}
        >
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

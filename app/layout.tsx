import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { LoadingProvider } from '../components/LoadingProvider';
import "./globals.css";

const sans = Inter({
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mockoffer.live';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MockOffer: Practice coding interviews like they're real",
    template: "%s · MockOffer",
  },
  description:
    "AI-powered mock coding interviews that challenge your problem solving, analyze your code, and show you exactly how to improve.",
  applicationName: "MockOffer",
  keywords: [
    "coding interview practice",
    "mock interview",
    "AI interviewer",
    "technical interview prep",
    "data structures and algorithms",
    "LeetCode alternative",
  ],
  authors: [{ name: "MockOffer" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "MockOffer",
    title: "MockOffer: Practice coding interviews like they're real",
    description:
      "AI-powered mock coding interviews that challenge your problem solving, analyze your code, and show you exactly how to improve.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MockOffer: Practice coding interviews like they're real",
    description:
      "AI-powered mock coding interviews with an honest, on-pattern debrief.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#08090a",
  colorScheme: "dark",
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
          className={`${sans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        >
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

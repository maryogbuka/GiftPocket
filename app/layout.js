


import { SessionProvider } from "next-auth/react";
import { Providers } from "./providers";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: "Gift Pocket",
    template: "%s | Gift Pocket"
  },
  description: "Your personal gift management tool - Never forget a special occasion again",
  keywords: ["gifts", "reminders", "occasions", "birthdays", "anniversaries"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  publisher: "Your Name",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yourdomain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Gift Pocket",
    description: "Your personal gift management tool",
    url: 'https://yourdomain.com',
    siteName: 'Gift Pocket',
    images: [
      {
        url: '/og-image.jpg', // Add an OG image
        width: 1200,
        height: 630,
        alt: 'Gift Pocket - Manage your gifts smarter',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Gift Pocket",
    description: "Your personal gift management tool",
    images: ['/twitter-image.jpg'], // Add Twitter image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};




export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
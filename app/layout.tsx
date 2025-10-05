import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Suspense } from "react"
import ExamPopupWrapper from "@/components/exam-popup-wrapper"
import { SkipLinks } from "@/components/skip-links"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "Global Security Practitioners Alliance - Professional Security Certification",
    template: "%s | GSPA"
  },
  description: "Elevate your security expertise with globally recognized certifications in Cybersecurity, Network Security, and Digital Forensics. Join 5,000+ professionals worldwide.",
  keywords: ["security certification", "cybersecurity", "network security", "digital forensics", "professional certification", "security training"],
  authors: [{ name: "Global Security Practitioners Alliance" }],
  creator: "Global Security Practitioners Alliance",
  publisher: "Global Security Practitioners Alliance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://gspa.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gspa.org',
    title: 'Global Security Practitioners Alliance - Professional Security Certification',
    description: 'Elevate your security expertise with globally recognized certifications in Cybersecurity, Network Security, and Digital Forensics.',
    siteName: 'Global Security Practitioners Alliance',
    images: [
      {
        url: '/Global-Security-Practitioners-Alliance.png',
        width: 1200,
        height: 630,
        alt: 'GSPA Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Security Practitioners Alliance - Professional Security Certification',
    description: 'Elevate your security expertise with globally recognized certifications in Cybersecurity, Network Security, and Digital Forensics.',
    images: ['/Global-Security-Practitioners-Alliance.png'],
    creator: '@gspa_org',
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
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'education',
  generator: "v0.app",
  manifest: "/manifest.json",
  other: {
    "msapplication-config": "/browserconfig.xml",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <SkipLinks />
          <Suspense fallback={null}>
            <ExamPopupWrapper>
              {children}
            </ExamPopupWrapper>
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}

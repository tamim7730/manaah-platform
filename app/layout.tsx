import type React from "react"
import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo",
  display: "swap",
})

export const metadata: Metadata = {
  title: "منصة مناعة - إدارة ورصد الأمراض الوبائية",
  description: "نظام متطور لرصد وإدارة الأمراض الوبائية في المملكة العربية السعودية",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased">
        {children}
        <Toaster 
          position="top-left" 
          dir="rtl"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-cairo)',
            },
          }}
        />
      </body>
    </html>
  )
}

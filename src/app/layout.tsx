import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shel - Find & Book Verified Hostels & PGs",
  description: "Shel Search helps you discover premium, verified student & professional paying guest accommodations with real-time bed vacancies across India.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#090d16] text-slate-100 min-h-screen selection:bg-emerald-500 selection:text-black`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

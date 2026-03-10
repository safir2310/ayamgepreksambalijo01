import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ayam Geprek Sambal Ijo - Pedasnya Bikin Nagih!",
  description: "Aplikasi pemesanan Ayam Geprek terbaik dengan berbagai pilihan menu sambal dan paket hemat. Pesan online sekarang!",
  keywords: ["Ayam Geprek", "Sambal Ijo", "Makanan Pedas", "Food Delivery", "Pidie", "Aceh"],
  authors: [{ name: "Ayam Geprek Sambal Ijo" }],
  openGraph: {
    title: "Ayam Geprek Sambal Ijo",
    description: "Pedasnya Bikin Nagih! Pesan Ayam Geprek favoritmu sekarang.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}

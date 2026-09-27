import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sanayi Servis Pro | Oto Servis & Yedek Parça Stok Takip Sistemi',
  description: 'Sanayi dükkanları ve oto tamirhaneleri için araç takip, iş emri ve parça stok yönetim platformu.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full bg-slate-900 text-slate-100 antialiased">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}

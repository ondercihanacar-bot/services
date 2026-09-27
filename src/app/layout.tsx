import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SERVICES | Servis Takip Otomasyonu',
  description: 'Araç takip, iş emri ve parça stok yönetim otomasyon platformu.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full bg-[#f4f7fb] text-slate-900 antialiased">
      <body className={`${inter.className} min-h-screen bg-[#f4f7fb] text-slate-900 selection:bg-cyan-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}

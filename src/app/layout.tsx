import type { Metadata } from 'next';
import { Abhaya_Libre, Noto_Sans_Sinhala } from 'next/font/google';
import { AppShell } from '@/components/shell/AppShell';
import './globals.css';

const noto = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  variable: '--font-noto-sinhala',
  display: 'swap',
});

const abhaya = Abhaya_Libre({
  subsets: ['sinhala'],
  weight: ['400', '700'],
  variable: '--font-abhaya',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'චිත්ත දර්ශකය',
  description: 'සිත් 89 හා චෛතසික, කෘත්‍ය, පටිච්චසමුප්පාද, පුද්ගල හා භූමි සම්බන්ධතා',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="si">
      <body className={`${noto.variable} ${abhaya.variable} antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

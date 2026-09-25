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
  weight: ['500', '700', '800'],
  variable: '--font-abhaya',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'පරමාර්ථ ධර්ම', template: '%s · පරමාර්ථ ධර්ම' },
  applicationName: 'පරමාර්ථ ධර්ම',
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

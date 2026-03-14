import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SiteNavigation } from '@/site/navigation/SiteNavigation';

export const metadata: Metadata = {
  title: 'Q4Trader Research Platforms',
  description: 'Unified access point for Q4Trader and QuantLab research platforms.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-frame">
          <SiteNavigation />
          {children}
        </div>
      </body>
    </html>
  );
}

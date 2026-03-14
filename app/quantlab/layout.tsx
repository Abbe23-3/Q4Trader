import type { ReactNode } from 'react';
import '@/apps/quantlab/frontend/styles/quantlab.css';

export default function QuantLabLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="quantlab-theme">{children}</div>;
}

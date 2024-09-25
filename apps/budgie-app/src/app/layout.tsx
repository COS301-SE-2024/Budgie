import './globals.css';
import { Providers } from './providers';
import { Metadata } from 'next';
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff', // Adjust this to match your app's theme color
};

export const metadata: Metadata = {
  title: 'Budgie',
  description: 'Budgie financial app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className="bg-BudgieWhite w-screen h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

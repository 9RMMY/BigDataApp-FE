import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../styles/globals.css';
import GNB from './components/GNB';

export const metadata: Metadata = {
  title: 'BigDataApp',
  description: 'K리그 데이터 분석 대시보드',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode; 
}) {
  return (
    <html lang="ko">
      <body className="bg-gray-100 font-sans text-gray-900 antialiased">
        <GNB />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import ConditionalHeader from '@/components/ConditionalHeader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RoofChains - Your Premier Real Estate Platform',
  description: 'Find your perfect property with RoofChains. Browse verified listings, connect with trusted real estate agencies, and discover your dream home.',
  keywords: 'real estate, property listings, real estate agencies, property search',
  authors: [{ name: 'RoofChains Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <ConditionalHeader />
          <main className="pt-16 sm:pt-20">
            {children}
          </main>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <script src="https://helpdroidx-frontend.vercel.app/widget-secure.js?config=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdTbHVnIjoibXktd29ya3NwYWNlLW9yZy0xNzU4NzIyNjcxMTk1IiwiZG9tYWluIjoicm9vZmNoYWlucy5jb20iLCJhcGlLZXlJZCI6ImNtZzZoNmk4YTAwMDFzMmUwdGd4OTMwZ2oiLCJwZXJtaXNzaW9ucyI6WyJwdWJsaWMtY2hhdCJdLCJleHBpcmVzIjoxNzYxODI1MzcxNTIzLCJ2ZXJzaW9uIjoiMS4wIiwidG9rZW5JZCI6IjQwYzM2NzM0LTFiOWMtNDYzMy04MGM4LWE5ZWIyMzRkOWZhOSIsImlhdCI6MTc1OTIzMzM3NCwiZXhwIjoxNzYxODI1Mzc0LCJhdWQiOiJoZWxwZHJvaWR4LWNsaWVudCIsImlzcyI6ImhlbHBkcm9pZHgtd2lkZ2V0IiwianRpIjoiNDBjMzY3MzQtMWI5Yy00NjMzLTgwYzgtYTllYjIzNGQ5ZmE5In0.YfdZMLsmHoYQr6Ik5jPGnz7zKfPgZw56m2tRa_yjK1k"></script>
      </body>
    </html>
  );
}

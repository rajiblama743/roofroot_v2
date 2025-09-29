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
        <script src="https://helpdroidx-frontend.vercel.app/widget-secure.js?config=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdTbHVnIjoibXktd29ya3NwYWNlLW9yZy0xNzU4NzIyNjcxMTk1IiwiZG9tYWluIjoicm9vZmNoYWlucy5jb20iLCJhcGlLZXlJZCI6ImNtZzU3dXA3MzAwMDFyYW96ZjlkemNmZ20iLCJwZXJtaXNzaW9ucyI6WyJwdWJsaWMtY2hhdCJdLCJleHBpcmVzIjoxNzYxNzUyMTUzNDIxLCJ2ZXJzaW9uIjoiMS4wIiwidG9rZW5JZCI6IjViNGUzNjc1LTZkODctNGY0My04NzFjLTQzMDdhMjYxYTQ0YiIsImlhdCI6MTc1OTE2MDE1NSwiZXhwIjoxNzYxNzUyMTU1LCJhdWQiOiJoZWxwZHJvaWR4LWNsaWVudCIsImlzcyI6ImhlbHBkcm9pZHgtd2lkZ2V0IiwianRpIjoiNWI0ZTM2NzUtNmQ4Ny00ZjQzLTg3MWMtNDMwN2EyNjFhNDRiIn0.mvSrV7-MAFExCCsvknF3e2kl26_DZoS1JV0gKnU9Ang"></script>
      </body>
    </html>
  );
}

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
        <script src="https://helpdroidx-frontend.vercel.app/widget-secure.js?config=f627542f-35a3-4cef-b912-8bc59a43ff85"></script>
      </body>
    </html>
  );
}

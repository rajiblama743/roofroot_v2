import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoofRoot - Real Estate Platform",
  description: "Your Real Estate Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

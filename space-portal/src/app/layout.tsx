import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from 'next-auth/react';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-black">
      <body className={`${inter.className} min-h-screen bg-black text-white`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

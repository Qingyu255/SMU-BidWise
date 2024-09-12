import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/sidebar/sidebar";
import TopBar from "@/components/TopBar";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "SMU BidWise",
  description: "SMU BidWise, a one stop platform for SMU students to plan for BOSS bidding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100vh]`}>
          <Sidebar />
          <main className='sm:ml-[290px] mx-5'>
            <TopBar/>
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}

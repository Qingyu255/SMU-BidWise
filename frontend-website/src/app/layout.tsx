import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/sidebar/sidebar";
import TopBar from "@/components/TopBar";
import { ThemeProvider } from "@/components/theme-provider";
import { TimetableProvider } from "../components/timetableProvider"; // Import your context provider
import { Toaster } from "@/components/ui/toaster";

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
  description: "SMU BidWise, a one-stop platform for SMU students to plan for BOSS bidding.",
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TimetableProvider> {/* Wrap your context provider here */}
              <Sidebar />
              <main className='sm:ml-[290px] mx-5'>
                <TopBar />
                {children}
              </main>
              <Toaster />
            </TimetableProvider> {/* Close context provider */}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

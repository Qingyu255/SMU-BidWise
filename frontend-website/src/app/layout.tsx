import type { Metadata } from "next";
import {
  ClerkProvider
} from '@clerk/nextjs';
import localFont from "next/font/local";
import "./globals.css";
import { Sidebar } from "@/components/sidebar/sidebar";
import TopBar from "@/components/TopBar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TimetableProvider } from "../components/providers/timetableProvider"; // Import your context provider
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

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
  description: "SMU BidWise, a one-stop platform for SMU students to plan their courses for BOSS bidding. View Bid Price analytics, the latest course information and senior roadmaps now!",
  icons: {
    icon: "/logo.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          unsafe_disableDevelopmentModeWarnings: true, // temporary (currently clerk is still on dev mode - this is just a UI change)
        },
      }}
    >
      <html lang="en">
        <head>
          {/* <!-- Google tag (gtag.js) --> */}
          <Script async src="https://www.googletagmanager.com/gtag/js?id=G-9XMVG71FGW"></Script>
          <Script id="google-analytics">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-9XMVG71FGW');
            `}
          </Script>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-[100vh]`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TimetableProvider> {/* Wrap your context provider here */}
              <Sidebar />
              <main className='lg:ml-[290px] mx-5'>
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

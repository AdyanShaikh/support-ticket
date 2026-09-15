import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { RoleProvider } from "@/context/RoleContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Support CRM System",
  description:
    "Enterprise-grade Customer Support Ticketing CRM built with Next.js, FastAPI, PostgreSQL, and AI Ticket Assistant.",
};

const themeScript = `
  try {
    const savedTheme = localStorage.getItem('support_crm_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8F9FA] dark:bg-[#14151A] text-[#1C1E24] dark:text-[#F0F2F5] selection:bg-[#343746] selection:text-white font-sans antialiased transition-colors duration-200">
        <ThemeProvider>
          <RoleProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>
            <Footer />
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

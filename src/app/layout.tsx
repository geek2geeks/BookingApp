import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from "./components/navigation";
import { ThemeSwitcher } from "./components/theme-switcher";
import { Providers } from "./providers";
import "./globals.css";
import { cn } from "./lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MBA7060 Presentation Booking",
  description: "Book your MBA7060 presentation slot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        inter.className,
        "h-full bg-gray-50 dark:bg-gray-900",
        "text-gray-900 dark:text-gray-100"
      )} suppressHydrationWarning>
        <Providers>
          <div className="min-h-full">
            <Navigation />
            
            <main>
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>

            <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto">
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} MBA7060 Presentation Booking System by Pedro
                  </p>
                  <ThemeSwitcher />
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
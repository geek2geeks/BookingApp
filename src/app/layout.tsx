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
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-center gap-8">
                    {/* Next.js */}
                    <a 
                      href="https://nextjs.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="flex flex-col items-center transform transition-transform group-hover:scale-110">
                        <img 
                          src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png" 
                          alt="Next.js" 
                          className="h-8 w-8 dark:invert"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-blue-500 dark:group-hover:text-blue-400">Framework</span>
                      </div>
                    </a>

                    {/* TypeScript */}
                    <a 
                      href="https://www.typescriptlang.org" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="flex flex-col items-center transform transition-transform group-hover:scale-110">
                        <img 
                          src="https://raw.githubusercontent.com/remojansen/logo.ts/master/ts.png" 
                          alt="TypeScript" 
                          className="h-8 w-8"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-blue-500 dark:group-hover:text-blue-400">Type Safety</span>
                      </div>
                    </a>

                    {/* Tailwind CSS */}
                    <a 
                      href="https://tailwindcss.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="flex flex-col items-center transform transition-transform group-hover:scale-110">
                        <img 
                          src="https://tailwindcss.com/_next/static/media/tailwindcss-mark.3c5441fc7a190fb1800d4a5c7f07ba4b1345a9c8.svg" 
                          alt="Tailwind CSS" 
                          className="h-8 w-8"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-blue-500 dark:group-hover:text-blue-400">Styling</span>
                      </div>
                    </a>

                    {/* Zustand */}
                    <a 
                      href="https://github.com/pmndrs/zustand" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="flex flex-col items-center transform transition-transform group-hover:scale-110">
                        <img 
                          src="https://raw.githubusercontent.com/pmndrs/zustand/main/bear.jpg" 
                          alt="Zustand" 
                          className="h-8 w-8 rounded-full"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-blue-500 dark:group-hover:text-blue-400">State Management</span>
                      </div>
                    </a>

                    {/* React Hook Form */}
                    <a 
                      href="https://react-hook-form.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="flex flex-col items-center transform transition-transform group-hover:scale-110">
                        <img 
                          src="https://avatars.githubusercontent.com/u/53986236?s=200&v=4" 
                          alt="React Hook Form" 
                          className="h-8 w-8"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 group-hover:text-blue-500 dark:group-hover:text-blue-400">Form Handling</span>
                      </div>
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>© {new Date().getFullYear()} MBA7060 Presentation Booking System</p>
                      <p className="mt-1">
                        Designed by{' '}
                        <a 
                          href="https://instagram.com/pedro_egr" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                          @pedro_egr
                        </a>
                      </p>
                    </div>
                    <ThemeSwitcher />
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
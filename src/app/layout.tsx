import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TeleDrive",
  description: "Personal Cloud Storage via Telegram",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex h-screen overflow-hidden transition-colors duration-200`}>
        <ThemeProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 m-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-200">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}

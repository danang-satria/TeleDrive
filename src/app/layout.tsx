import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import GlobalUploadOverlay from "@/components/GlobalUploadOverlay";
import TopBar from "@/components/TopBar";

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
      <body className={`${inter.className} text-slate-900 dark:text-slate-100 overflow-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex flex-col h-screen w-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-200">
            <GlobalUploadOverlay />
            <TopBar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-y-auto bg-white dark:bg-[#1a1c1e] m-4 mt-0 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-200 relative">
                {children}
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

"use client";
import Sidebar from "@/components/Sidebar";
import GlobalUploadOverlay from "@/components/GlobalUploadOverlay";
import TopBar from "@/components/TopBar";
import CreateFolderModal from "@/components/CreateFolderModal";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/share');

  if (isAuthPage) {
    return <main className="flex-1 w-full h-full overflow-y-auto">{children}</main>;
  }

  return (
    <>
      <GlobalUploadOverlay />
      <CreateFolderModal />
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#1a1c1e] m-4 mt-0 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col transition-colors duration-200 relative">
          {children}
        </main>
      </div>
    </>
  );
}

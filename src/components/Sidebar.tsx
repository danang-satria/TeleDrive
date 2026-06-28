"use client";
import { Cloud, HardDrive, Clock, Trash, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
      isActive 
        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" 
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;
  };

  return (
    <div className="w-64 h-full bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col">
      <div className="flex items-center gap-2 px-2 py-4 mb-6">
        <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-500" />
        <span className="text-xl font-semibold text-slate-800 dark:text-slate-100">TeleDrive</span>
      </div>
      
      <nav className="flex-1 space-y-1">
        <Link href="/" className={getLinkClass("/")}>
          <HardDrive className="w-5 h-5" />
          My Drive
        </Link>
        <Link href="/recent" className={getLinkClass("/recent")}>
          <Clock className="w-5 h-5" />
          Recent
        </Link>
        <Link href="/trash" className={getLinkClass("/trash")}>
          <Trash className="w-5 h-5" />
          Trash
        </Link>
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <Link href="/settings" className={getLinkClass("/settings")}>
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </div>
  );
}

"use client";
import { Cloud, Search, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function TopBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || "";
  const [search, setSearch] = useState(initialSearch);

  // Sync search state with URL but with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (search) {
        params.set("q", search);
      } else {
        params.delete("q");
      }
      
      // Update URL without a full page refresh
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
      window.history.replaceState({}, '', newUrl);
      
      // We manually dispatch a popstate event so the page can react to it if needed
      // Or better, Next.js handles navigation. To trigger Next.js router gently:
      router.replace(newUrl, { scroll: false });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search, router]);

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-slate-100 dark:bg-slate-950 shrink-0">
      <div className="flex items-center gap-2 w-64 shrink-0">
        <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-500" />
        <span className="text-xl font-semibold text-slate-800 dark:text-slate-100">TeleDrive</span>
      </div>

      <div className="flex-1 max-w-2xl px-4">
        <div className="relative group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-slate-700 dark:group-focus-within:text-slate-300 transition-colors" />
          <input 
            type="text" 
            placeholder="Search in TeleDrive"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border-none bg-slate-200/70 hover:bg-slate-200 dark:bg-slate-900 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-end w-64 shrink-0">
        <button className="p-2 rounded-full bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

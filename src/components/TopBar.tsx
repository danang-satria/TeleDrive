import { Cloud, Search, User, LogOut, Settings as SettingsIcon, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function TopBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || "";
  const [search, setSearch] = useState(initialSearch);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setShowProfileMenu(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

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
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-transparent shrink-0">
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

      <div className="flex items-center justify-end w-64 shrink-0 relative">
        <button 
          onClick={(e) => { e.stopPropagation(); setShowProfileMenu(!showProfileMenu); }}
          className="p-2 rounded-full bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          <User className="w-5 h-5" />
        </button>

        {showProfileMenu && (
          <div className="absolute top-[60px] right-2 w-[340px] bg-slate-100 dark:bg-[#212327] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 flex flex-col items-center">
            
            <div className="w-full flex justify-between items-center mb-4">
              <div className="w-8" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">admin@teledrive.com</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowProfileMenu(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-3 text-blue-700 dark:text-blue-400">
              <span className="text-3xl font-medium tracking-wide">AD</span>
            </div>
            
            <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100 mb-4">
              Hi, Admin!
            </h2>
            
            <button 
              onClick={() => { setShowProfileMenu(false); router.push('/settings'); }}
              className="px-6 py-2 rounded-full border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors mb-4"
            >
              Manage your TeleDrive
            </button>
            
            <div className="w-full bg-white dark:bg-[#1a1c1e] rounded-2xl p-4 mb-2 flex items-center justify-between shadow-sm">
               <div className="flex items-center gap-3">
                 <Cloud className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Unlimited Telegram Drive</span>
               </div>
            </div>

            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full bg-white dark:bg-[#1a1c1e] rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm hover:bg-slate-50 dark:hover:bg-[#28292c] transition-colors"
            >
               <div className="flex items-center gap-3">
                 <LogOut className="w-5 h-5 text-red-500" />
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Sign out</span>
               </div>
            </button>
            
            <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1 mb-2">
              <a href="/privacy" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

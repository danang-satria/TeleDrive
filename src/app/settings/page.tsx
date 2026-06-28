"use client";
import { useState } from "react";
import { HardDrive, ShieldCheck, Database, RefreshCcw, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSyncResult(`Successfully synced ${data.count} new files from Telegram.`);
      } else {
        setSyncResult("Failed to sync.");
      }
    } catch (e) {
      setSyncResult("An error occurred during sync.");
    }
    setIsSyncing(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8 flex-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
      </div>

      <div className="space-y-6">
        
        {/* Appearance Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <Sun className="w-6 h-6 dark:hidden" />
              <Moon className="w-6 h-6 hidden dark:block" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Appearance</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Customize the look of TeleDrive</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Theme</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button 
                  onClick={() => setTheme("light")}
                  className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'light' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button 
                  onClick={() => setTheme("dark")}
                  className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
                <button 
                  onClick={() => setTheme("system")}
                  className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'system' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  <Monitor className="w-4 h-4" /> System
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Telegram Sync</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Import files from your Telegram Channel</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              If you have uploaded files directly to your Telegram Private Channel, you can sync them to TeleDrive. 
              This will pull the latest 100 media messages and add them to your drive.
            </p>
            
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync from Telegram"}
            </button>

            {syncResult && (
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-2">
                {syncResult}
              </p>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-slate-400" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Storage Limit</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">Unlimited</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Provided by Telegram</p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-5 h-5 text-slate-400" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Max File Size</h3>
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">2.0 GB</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Per individual file</p>
          </div>
        </div>

      </div>
    </div>
  );
}

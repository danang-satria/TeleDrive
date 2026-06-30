import Link from "next/link";
import { ArrowRight, Cloud, Lock, Zap, Smartphone, HardDrive, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-500/20 via-purple-500/10 to-transparent blur-3xl -z-10 rounded-full opacity-50 transform -translate-y-1/2"></div>
      
      {/* Navbar */}
      <header className="w-full px-6 py-6 lg:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            TeleDrive
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            Log In
          </Link>
          <Link 
            href="/drive" 
            className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-full hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center px-4 pt-20 pb-32 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium text-sm mb-8 border border-blue-200 dark:border-blue-800/50 backdrop-blur-sm animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          v0.1 Beta is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mb-8 leading-tight animate-fade-in-up animation-delay-100">
          Unlimited Cloud Storage.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">Zero Cost.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-12 animate-fade-in-up animation-delay-200">
          Turn your Telegram account into a powerful, secure, and limitless personal cloud drive. 
          Upload, manage, and stream files of any size seamlessly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-300">
          <Link 
            href="/drive" 
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
          >
            Go to My Drive <ArrowRight className="w-5 h-5" />
          </Link>
          <a 
            href="https://github.com/danang-satria/TeleDrive" 
            target="_blank"
            className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 flex items-center justify-center"
          >
            View on GitHub
          </a>
        </div>

        {/* Bento Grid Features */}
        <div className="mt-32 max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 px-4 animate-fade-in-up animation-delay-400">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-left hover:border-blue-500/50 transition-colors">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Infinite Capacity</h3>
            <p className="text-slate-600 dark:text-slate-400">Store terabytes of data without worrying about subscription fees. Your space is practically limitless.</p>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-left hover:border-purple-500/50 transition-colors">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2GB Bypass</h3>
            <p className="text-slate-600 dark:text-slate-400">Our chunking algorithm gracefully bypasses Telegram's native file limit, allowing massive file uploads.</p>
          </div>

          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-left hover:border-indigo-500/50 transition-colors">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Secure & Private</h3>
            <p className="text-slate-600 dark:text-slate-400">Backed by Telegram's MTProto encryption. Your files remain yours, safely stored in your Saved Messages.</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm z-10 border-t border-slate-200 dark:border-slate-800/50">
        &copy; {new Date().getFullYear()} TeleDrive. Built by Danang Satria.
      </footer>
    </div>
  );
}

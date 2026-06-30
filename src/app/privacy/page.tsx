import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#1a1c1e] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dasbor
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Privacy Policy (Kebijakan Privasi)</h1>
        
        <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">1. Penyimpanan Data</h2>
            <p>
              TeleDrive adalah aplikasi antarmuka pihak ketiga yang berjalan secara lokal (self-hosted). Semua file yang Anda unggah melalui TeleDrive langsung dikirim dan disimpan secara eksklusif di server resmi <strong>Telegram</strong> menggunakan akun Telegram Anda sendiri (melalui Saved Messages atau Channel pribadi).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">2. Data yang Dikumpulkan</h2>
            <p>
              Kami tidak mengumpulkan, menjual, atau mentransfer data pribadi Anda ke server pihak ketiga mana pun. Kredensial login Anda (seperti Email, Password, dan Telegram String Session) hanya disimpan secara aman di dalam perangkat atau server lokal tempat Anda menjalankan aplikasi TeleDrive ini.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">3. Akses Telegram</h2>
            <p>
              Aplikasi ini memerlukan akses ke akun Telegram Anda melalui API (String Session) semata-mata untuk mengelola (mengunggah, mengunduh, dan menghapus) file yang Anda kehendaki. Kami sangat menyarankan agar Anda merahasiakan String Session Anda untuk mencegah akses tidak sah.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

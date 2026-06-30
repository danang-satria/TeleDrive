import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-12">
      <div className="max-w-3xl mx-auto bg-white dark:bg-[#1a1c1e] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dasbor
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Terms of Service (Syarat & Ketentuan)</h1>
        
        <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">1. Penggunaan Aplikasi</h2>
            <p>
              Dengan menggunakan TeleDrive, Anda menyetujui bahwa aplikasi ini adalah perangkat lunak sumber terbuka (open-source) yang disediakan &quot;sebagaimana adanya&quot; (as is) tanpa garansi bentuk apa pun.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">2. Kepatuhan Terhadap Aturan Telegram</h2>
            <p>
              Karena TeleDrive mengandalkan infrastruktur Telegram untuk penyimpanan data, Anda wajib mematuhi seluruh <a href="https://telegram.org/tos" target="_blank" className="text-blue-500 hover:underline">Ketentuan Layanan Telegram</a>. Segala bentuk pelanggaran terhadap ketentuan Telegram (seperti mengunggah konten ilegal) yang mengakibatkan pemblokiran atau penghapusan akun Anda berada di luar tanggung jawab kami.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">3. Tanggung Jawab Kehilangan Data</h2>
            <p>
              TeleDrive bertindak sebagai perantara (jembatan) antara Anda dan Telegram. Kami tidak bertanggung jawab atas hilangnya data, file rusak, atau tidak berfungsinya sistem akibat pembaruan API dari pihak Telegram atau kesalahan konfigurasi server mandiri Anda.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

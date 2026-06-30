"use client";

import { useState, useEffect } from "react";
import { Settings, Save, AlertCircle, KeyRound, Phone, Key, ShieldCheck, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [sessionString, setSessionString] = useState("");
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);
  const [checkingSession, setCheckingSession] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Generator states
  const [genStatus, setGenStatus] = useState('idle');
  const [genError, setGenError] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetch("/api/settings/session")
      .then(res => res.json())
      .then(data => {
        if (data.sessionString) setSessionString(data.sessionString);
      });

    fetch("/api/settings/check-session")
      .then(res => {
        setSessionValid(res.ok);
        setCheckingSession(false);
      })
      .catch(() => {
        setSessionValid(false);
        setCheckingSession(false);
      });
  }, []);

  useEffect(() => {
    let interval: any;
    if (['starting', 'waiting_code', 'waiting_password', 'processing'].includes(genStatus)) {
      interval = setInterval(() => {
        fetch("/api/settings/generate", {
          method: "POST",
          body: JSON.stringify({ action: 'status' })
        }).then(r => r.json()).then(d => {
          if (d.status !== genStatus && d.status) {
            setGenStatus(d.status);
            if (d.error) setGenError(d.error);
            if (d.status === 'authenticated') {
              window.location.reload();
            }
          }
        }).catch(() => {});
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [genStatus]);

  const handleStartGenerate = async () => {
    if (!phone) return;
    setGenStatus('starting');
    setGenError('');
    await fetch("/api/settings/generate", {
      method: "POST",
      body: JSON.stringify({ action: 'start', phone })
    });
  };

  const handleSubmitCode = async () => {
    if (!code) return;
    setGenStatus('processing');
    await fetch("/api/settings/generate", {
      method: "POST",
      body: JSON.stringify({ action: 'submit_code', code })
    });
  };

  const handleSubmitPassword = async () => {
    if (!password) return;
    setGenStatus('processing');
    await fetch("/api/settings/generate", {
      method: "POST",
      body: JSON.stringify({ action: 'submit_password', password })
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    
    try {
      const res = await fetch("/api/settings/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionString })
      });
      
      if (res.ok) {
        setStatus({ type: 'success', message: 'Sesi Telegram berhasil disimpan!' });
        setIsEditing(false);
        setSessionValid(true);
      } else {
        setStatus({ type: 'error', message: 'Gagal menyimpan sesi Telegram.' });
      }
    } catch (e) {
      setStatus({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    }
    setLoading(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto w-full space-y-6 flex-1 flex flex-col h-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Settings className="w-6 h-6 text-slate-400" />
              Pengaturan Sistem
            </h1>
          </div>

          <div className="bg-white/40 dark:bg-slate-900/40 p-6 rounded-3xl">
            <h2 className="text-lg font-semibold mb-2">Sesi Telegram (String Session)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Masukkan Telegram String Session yang valid. Sesi ini akan disimpan secara lokal di SQLite dan digunakan sebagai prioritas utama melebihi nilai di .env.
            </p>

            {status.message && (
              <div className={`p-4 rounded-xl mb-6 flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{status.message}</span>
              </div>
            )}

            {!isEditing && sessionValid && !checkingSession ? (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-slate-50/50 dark:bg-[#1f1f1f]/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-10 border border-slate-200 dark:border-slate-700">
                     <div className="flex flex-col items-center gap-2 text-green-600 dark:text-green-500 bg-white/90 dark:bg-slate-800/90 p-4 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/30">
                       <ShieldCheck className="w-8 h-8" />
                       <span className="font-medium text-sm">Sesi Terkunci & Valid</span>
                     </div>
                  </div>
                  <textarea
                    value={sessionString}
                    readOnly
                    className="w-full h-32 px-4 py-3 bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm font-mono break-all opacity-50"
                  />
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors font-medium"
                >
                  <Key className="w-4 h-4" />
                  Ubah Sesi Manual
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={sessionString}
                  onChange={(e) => setSessionString(e.target.value)}
                  placeholder="1BJWap1sBu..."
                  className="w-full h-32 px-4 py-3 bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono break-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading || !sessionString.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors font-medium"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? "Menyimpan..." : "Simpan Sesi"}
                  </button>
                  {sessionValid && (
                    <button
                      onClick={() => { setIsEditing(false); setStatus({ type: '', message: '' }); }}
                      className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors font-medium"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {!sessionValid && !checkingSession && (
            <div className="mt-6 bg-blue-500/10 dark:bg-blue-900/20 p-6 rounded-3xl">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <KeyRound className="w-5 h-5" /> Buat Sesi Baru Otomatis
              </h2>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-6">
                Sesi Telegram Anda saat ini sudah kadaluarsa atau belum diatur. Anda dapat membuat sesi baru langsung dari sini tanpa perlu menggunakan script terminal.
              </p>

              {genError && (
                <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{genError}</span>
                </div>
              )}

              <div className="space-y-4">
                {['idle', 'error', 'starting'].includes(genStatus) && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Nomor Telepon (ex: +62812...)"
                        disabled={genStatus === 'starting'}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1f1f1f] border border-blue-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={handleStartGenerate}
                      disabled={!phone || genStatus === 'starting'}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors font-medium flex items-center gap-2"
                    >
                      {genStatus === 'starting' && <Loader2 className="w-4 h-4 animate-spin" />}
                      Minta Kode
                    </button>
                  </div>
                )}

                {genStatus === 'waiting_code' && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <ShieldCheck className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Masukkan Kode dari Telegram"
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1f1f1f] border border-blue-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={handleSubmitCode}
                      disabled={!code}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors font-medium"
                    >
                      Verifikasi
                    </button>
                  </div>
                )}

                {genStatus === 'waiting_password' && (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Key className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password 2FA"
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1f1f1f] border border-blue-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={handleSubmitPassword}
                      disabled={!password}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-colors font-medium"
                    >
                      Verifikasi
                    </button>
                  </div>
                )}

                {genStatus === 'processing' && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Memproses...
                  </div>
                )}
              </div>
            </div>
          )}
    </div>
  );
}

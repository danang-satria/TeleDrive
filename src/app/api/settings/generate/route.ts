import { NextResponse } from "next/server";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { prisma } from "@/lib/db";

// Gunakan global variable untuk mempertahankan instance di memory (terutama saat hot-reload di dev)
const globalAny = global as any;
if (!globalAny.telegramAuthState) {
  globalAny.telegramAuthState = {
    client: null,
    status: 'idle',
    errorMessage: '',
    resolveCode: undefined,
    resolvePassword: undefined,
  };
}
const authState = globalAny.telegramAuthState;

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'status') {
      return NextResponse.json({
        status: authState.status,
        error: authState.errorMessage
      });
    }

    if (action === 'start') {
      if (!body.phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
      
      if (authState.client) {
        try { await authState.client.disconnect(); } catch (e) {}
      }
      
      authState.client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 1 });
      authState.status = 'starting';
      authState.errorMessage = '';
      authState.resolveCode = undefined;
      authState.resolvePassword = undefined;

      // Jalankan proses otentikasi di latar belakang
      authState.client.start({
        phoneNumber: async () => body.phone,
        phoneCode: async () => {
          authState.status = 'waiting_code';
          return new Promise<string>((resolve) => {
            authState.resolveCode = (code: string) => {
              resolve(code);
              authState.resolveCode = undefined;
            };
          });
        },
        password: async () => {
          authState.status = 'waiting_password';
          return new Promise<string>((resolve) => {
            authState.resolvePassword = (password: string) => {
              resolve(password);
              authState.resolvePassword = undefined;
            };
          });
        },
        onError: (err: any) => {
          authState.status = 'error';
          authState.errorMessage = err.message || "Otentikasi gagal";
        }
      }).then(async () => {
        if (authState.status !== 'error') {
          const sessionStr = authState.client.session.save();
          // Simpan ke SQLite
          await prisma.appConfig.upsert({
            where: { key: "TELEGRAM_SESSION" },
            update: { value: sessionStr },
            create: { key: "TELEGRAM_SESSION", value: sessionStr }
          });
          authState.status = 'authenticated';
          await authState.client.disconnect(); // Disconnect generator client, main app will spawn a new one
        }
      }).catch((err: any) => {
        authState.status = 'error';
        authState.errorMessage = err.message;
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'submit_code') {
      if (authState.resolveCode) {
        authState.status = 'processing';
        authState.resolveCode(body.code);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Tidak ada permintaan kode yang tertunda" }, { status: 400 });
    }

    if (action === 'submit_password') {
      if (authState.resolvePassword) {
        authState.status = 'processing';
        authState.resolvePassword(body.password);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: "Tidak ada permintaan password yang tertunda" }, { status: 400 });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

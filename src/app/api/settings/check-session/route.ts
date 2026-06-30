import { NextResponse } from "next/server";
import { getTelegramClient } from "@/lib/telegram";

export async function GET() {
  try {
    const client = await getTelegramClient();
    const me = await client.getMe();
    return NextResponse.json({ valid: true, username: me.username });
  } catch (error: any) {
    if (error.name === "TelegramSessionExpired") {
      return NextResponse.json({ valid: false, error: "TelegramSessionExpired" }, { status: 401 });
    }
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}

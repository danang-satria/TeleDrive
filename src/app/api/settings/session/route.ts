import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { resetTelegramClient } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const { sessionString } = await req.json();

    if (!sessionString) {
      return NextResponse.json({ error: "Session string required" }, { status: 400 });
    }

    await prisma.appConfig.upsert({
      where: { key: "TELEGRAM_SESSION" },
      update: { value: sessionString },
      create: { key: "TELEGRAM_SESSION", value: sessionString }
    });

    resetTelegramClient();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const config = await prisma.appConfig.findUnique({ where: { key: "TELEGRAM_SESSION" } });
    return NextResponse.json({ sessionString: config?.value || "" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTelegramClient } from "@/lib/telegram";

export async function POST() {
  try {
    const client = await getTelegramClient();
    let channelId: any = process.env.TELEGRAM_CHANNEL_ID || "me";
    if (typeof channelId === "string" && channelId !== "me" && !isNaN(Number(channelId))) {
      channelId = BigInt(channelId);
    }

    const messages = await client.getMessages(channelId, { limit: 100 });
    let syncedCount = 0;

    for (const msg of messages) {
      if (msg.media) {
        const exists = await prisma.file.findUnique({
          where: { telegramMessageId: msg.id }
        });

        if (!exists) {
          let name = msg.file?.name || msg.message || "Unknown File";
          if (!msg.file?.name) {
            if (msg.photo) name = `photo_${msg.id}.jpg`;
            else if (msg.video) name = `video_${msg.id}.mp4`;
          }
          
          const size = msg.file?.size || 0;
          const mimeType = msg.file?.mimeType || "application/octet-stream";
          
          await prisma.file.create({
            data: {
              name,
              size: Number(size),
              mimeType,
              telegramMessageId: msg.id,
              createdAt: new Date(msg.date * 1000)
            }
          });
          syncedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, count: syncedCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

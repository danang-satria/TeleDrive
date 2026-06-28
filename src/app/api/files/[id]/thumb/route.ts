import { NextResponse } from "next/server";
import { getTelegramClient } from "@/lib/telegram";
import { prisma } from "@/lib/db";
import { Api } from "telegram";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const file = await prisma.file.findUnique({
      where: { id: params.id }
    });

    if (!file || file.isDeleted) {
      return new NextResponse("File not found", { status: 404 });
    }

    // Only process images and videos for thumbnails
    if (!file.mimeType.startsWith("image/") && !file.mimeType.startsWith("video/")) {
      return new NextResponse("Not an image or video", { status: 400 });
    }

    const client = await getTelegramClient();
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    
    const messages = await client.getMessages(channelId, { ids: file.telegramMessageId });
    if (!messages.length) return new NextResponse("File not found on Telegram", { status: 404 });
    
    const message = messages[0];
    
    // Download thumbnail (thumb: 0 usually gets the smallest/default thumbnail)
    const buffer = await client.downloadMedia(message, { thumb: 0 });
    
    if (!buffer) {
      // If no thumbnail available, fallback to main file download if it's small, or just return 404
      return new NextResponse("Thumbnail not available", { status: 404 });
    }
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400"
      }
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

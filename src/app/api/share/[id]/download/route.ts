import { NextResponse } from "next/server";
import { getTelegramClient } from "@/lib/telegram";
import { prisma } from "@/lib/db";
import { Api } from "telegram";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const link = await prisma.sharedLink.findUnique({
      where: { id: params.id },
      include: { file: true }
    });

    if (!link || link.file.isDeleted) {
      return new NextResponse("File not found", { status: 404 });
    }

    const client = await getTelegramClient();
    const channelId = process.env.TELEGRAM_CHANNEL_ID;
    
    // We get the message
    const messages = await client.getMessages(channelId, { ids: link.file.telegramMessageId });
    if (!messages.length) return new NextResponse("File not found on Telegram", { status: 404 });
    
    const message = messages[0];
    const media = message.media as Api.MessageMediaDocument;
    
    // Download the file stream
    const buffer = await client.downloadMedia(message, {});
    if (!buffer) return new NextResponse("Failed to download", { status: 500 });
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${link.file.name}"`,
        "Content-Type": link.file.mimeType || "application/octet-stream",
        "Content-Length": link.file.size.toString(),
      }
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

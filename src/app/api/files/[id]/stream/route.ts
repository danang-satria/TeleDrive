import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTelegramClient } from "@/lib/telegram";

export const maxDuration = 300;

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const file = await prisma.file.findUnique({
      where: { id: params.id },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const rangeHeader = req.headers.get("range");
    if (!rangeHeader) {
      return new NextResponse("Requires Range header", { status: 416 });
    }

    const client = await getTelegramClient();
    if (!client) {
      return new NextResponse("Telegram client unavailable", { status: 503 });
    }

    const messages = await client.getMessages(process.env.TELEGRAM_CHANNEL_ID!, {
      ids: [file.telegramMessageId],
    });

    if (!messages.length || !messages[0].media) {
      return new NextResponse("Media not found in Telegram", { status: 404 });
    }

    const fileSize = file.size;
    const parts = rangeHeader.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;

    const stream = client.iterDownload({
      file: messages[0].media,
      offset: start,
      limit: chunkSize,
      requestSize: 1024 * 512, // 512KB chunks
    });

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new NextResponse(readable, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": file.mimeType,
      },
    });
  } catch (error) {
    console.error("Stream Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getTelegramClient } from "@/lib/telegram";
import bigInt from "big-integer";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const client = await getTelegramClient();
    let channelId: any = process.env.TELEGRAM_CHANNEL_ID || "me";
    if (typeof channelId === "string" && channelId !== "me" && !isNaN(Number(channelId))) {
      channelId = BigInt(channelId);
    }

    const messages = await client.getMessages(channelId, { ids: [file.telegramMessageId] });
    if (messages.length === 0 || !messages[0].media) {
      return new NextResponse("Message or media not found", { status: 404 });
    }

    const message = messages[0];
    
    const range = req.headers.get("range");
    let offset = 0;
    let limit = file.size;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      offset = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.size - 1;
      limit = (end - offset) + 1;
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of client.iterDownload({ 
            file: message.media, 
            offset: bigInt(offset), 
            limit,
            requestSize: 1024 * 1024 // 1MB chunks
          })) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      }
    });

    const headers = new Headers();
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Type", file.mimeType || "application/octet-stream");

    const searchParams = new URL(req.url).searchParams;
    const isView = searchParams.get("view") === "true";
    if (!isView) {
      headers.set("Content-Disposition", `attachment; filename="${file.name}"`);
    } else {
      headers.set("Content-Disposition", `inline; filename="${file.name}"`);
    }

    if (range) {
      headers.set("Content-Range", `bytes ${offset}-${offset + limit - 1}/${file.size}`);
      headers.set("Content-Length", limit.toString());
      return new NextResponse(stream, { status: 206, headers });
    } else {
      headers.set("Content-Length", file.size.toString());
      return new NextResponse(stream, { status: 200, headers });
    }

  } catch (error) {
    console.error(error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return new NextResponse("Not Found", { status: 404 });

    await prisma.file.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error deleting file", { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return new NextResponse("Not Found", { status: 404 });

    await prisma.file.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error restoring file", { status: 500 });
  }
}

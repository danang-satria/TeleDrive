import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getTelegramClient } from "@/lib/telegram";
import archiver from "archiver";
import { Readable } from "stream";

async function getFilesRecursive(folderId: string, currentPath = "") {
  let result: { file: any, path: string }[] = [];
  
  const files = await prisma.file.findMany({ where: { folderId, isDeleted: false } });
  for (const f of files) {
    result.push({ file: f, path: currentPath + f.name });
  }

  const subFolders = await prisma.folder.findMany({ where: { parentId: folderId } });
  for (const sf of subFolders) {
    const subFiles = await getFilesRecursive(sf.id, currentPath + sf.name + "/");
    result = result.concat(subFiles);
  }

  return result;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const folder = await prisma.folder.findUnique({ where: { id } });
    if (!folder) return new NextResponse("Folder not found", { status: 404 });

    const allFiles = await getFilesRecursive(id, "");
    
    if (allFiles.length === 0) {
      return new NextResponse("Folder is empty", { status: 400 });
    }

    const archive = archiver('zip', { zlib: { level: 1 } });
    
    const stream = new ReadableStream({
      start(controller) {
        archive.on('data', chunk => controller.enqueue(chunk));
        archive.on('end', () => controller.close());
        archive.on('error', err => controller.error(err));
        
        (async () => {
          try {
            const client = await getTelegramClient();
            let channelId: any = process.env.TELEGRAM_CHANNEL_ID || "me";
            if (typeof channelId === "string" && channelId !== "me" && !isNaN(Number(channelId))) {
              channelId = BigInt(channelId);
            }

            for (const item of allFiles) {
              const messages = await client.getMessages(channelId, { ids: [item.file.telegramMessageId] });
              if (messages.length && messages[0].media) {
                const message = messages[0];
                const readable = Readable.from(client.iterDownload({
                  file: message.media,
                  requestSize: 1024 * 1024
                }));
                archive.append(readable, { name: item.path });
              }
            }
            archive.finalize();
          } catch (err) {
            console.error("ZIP Generation Error:", err);
            archive.abort();
          }
        })();
      }
    });

    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    headers.set("Content-Disposition", `attachment; filename="${folder.name}.zip"`);

    return new NextResponse(stream, { status: 200, headers });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

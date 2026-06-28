import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadToTelegram } from "@/lib/telegram";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const originalName = formData.get("fileName") as string;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const uploadId = formData.get("uploadId") as string;
    const mimeType = formData.get("mimeType") as string;
    const folderId = formData.get("folderId") as string;

    if (!file || !originalName || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tempDir = path.join(os.tmpdir(), "teledrive_uploads");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filePath = path.join(tempDir, `${uploadId}_${originalName}`);
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Append the chunk to the file
    fs.appendFileSync(filePath, buffer);

    if (chunkIndex === totalChunks - 1) {
      // Final chunk received, upload to Telegram
      const messageId = await uploadToTelegram(filePath, originalName);
      
      const stat = fs.statSync(filePath);
      const savedFile = await prisma.file.create({
        data: {
          name: originalName,
          size: stat.size,
          mimeType: mimeType || file.type || "application/octet-stream",
          telegramMessageId: messageId,
          folderId: folderId && folderId !== 'root' ? folderId : null
        }
      });

      // Cleanup
      fs.unlinkSync(filePath);

      return NextResponse.json({ success: true, file: savedFile });
    }

    return NextResponse.json({ success: true, chunkIndex });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

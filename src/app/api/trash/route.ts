import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFromTelegram } from "@/lib/telegram";

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredFiles = await prisma.file.findMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: thirtyDaysAgo }
      }
    });

    if (expiredFiles.length > 0) {
      await Promise.allSettled(expiredFiles.map(f => deleteFromTelegram(f.telegramMessageId)));
      await prisma.file.deleteMany({
        where: { id: { in: expiredFiles.map(f => f.id) } }
      });
    }

    const files = await prisma.file.findMany({
      where: { isDeleted: true },
      orderBy: { deletedAt: "desc" },
    });
    return NextResponse.json(files);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch trash" }, { status: 500 });
  }
}

export async function DELETE() {
  // Empty trash
  try {
    const files = await prisma.file.findMany({ where: { isDeleted: true } });
    
    // Delete from telegram in parallel (with limit to avoid rate limits ideally, but for personal use it's fine)
    await Promise.allSettled(files.map(f => deleteFromTelegram(f.telegramMessageId)));
    
    await prisma.file.deleteMany({ where: { isDeleted: true } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to empty trash" }, { status: 500 });
  }
}

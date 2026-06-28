import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deleteFromTelegram } from "@/lib/telegram";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Restore file
  try {
    const { id } = await params;
    await prisma.file.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to restore" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Hard delete
  try {
    const { id } = await params;
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await deleteFromTelegram(file.telegramMessageId);
    await prisma.file.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

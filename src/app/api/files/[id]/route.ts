import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { downloadFromTelegram, deleteFromTelegram } from "@/lib/telegram";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(req.url);
    const { id } = await params;
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const buffer = await downloadFromTelegram(file.telegramMessageId);
    
    const disposition = searchParams.get("view") === "true" ? "inline" : "attachment";

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(file.name)}"`,
        "Content-Type": file.mimeType,
        "Content-Length": file.size.toString(),
      },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error downloading file", { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.file.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

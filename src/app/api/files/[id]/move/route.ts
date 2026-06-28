import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const folderId = body.folderId === "root" ? null : body.folderId;
    
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return new NextResponse("Not Found", { status: 404 });

    await prisma.file.update({
      where: { id },
      data: { folderId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error moving file", { status: 500 });
  }
}

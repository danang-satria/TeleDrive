import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Soft delete all files inside this folder
    await prisma.file.updateMany({
      where: { folderId: id },
      data: { isDeleted: true, deletedAt: new Date() }
    });

    // Delete the folder itself
    await prisma.folder.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete folder error:", error);
    return new NextResponse("Error deleting folder", { status: 500 });
  }
}

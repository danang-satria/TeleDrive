import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, fileIds, folderId } = body;

    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return new NextResponse("No files provided", { status: 400 });
    }

    if (action === "move") {
      const targetFolderId = folderId === "root" ? null : folderId;
      
      await prisma.file.updateMany({
        where: { id: { in: fileIds } },
        data: { folderId: targetFolderId }
      });

      return NextResponse.json({ success: true, count: fileIds.length });
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("Batch operation error:", error);
    return new NextResponse("Error processing batch operation", { status: 500 });
  }
}

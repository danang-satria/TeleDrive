import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, folderIds, targetFolderId } = body;

    if (!folderIds || !Array.isArray(folderIds) || folderIds.length === 0) {
      return new NextResponse("No folders provided", { status: 400 });
    }

    if (action === "move") {
      const parentId = targetFolderId === "root" ? null : targetFolderId;
      
      // Prevent a folder from being moved into itself or moving root (not possible by ID but just in case)
      if (folderIds.includes(parentId)) {
         return new NextResponse("Cannot move a folder into itself", { status: 400 });
      }

      await prisma.folder.updateMany({
        where: { id: { in: folderIds } },
        data: { parentId }
      });

      return NextResponse.json({ success: true, count: folderIds.length });
    }

    return new NextResponse("Invalid action", { status: 400 });
  } catch (error) {
    console.error("Batch folder operation error:", error);
    return new NextResponse("Error processing batch operation", { status: 500 });
  }
}

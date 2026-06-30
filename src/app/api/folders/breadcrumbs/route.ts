import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");
    
    if (!folderId || folderId === "root") {
      return NextResponse.json([]);
    }

    const breadcrumbs = [];
    let currentId = folderId;

    // limit to 20 to prevent infinite loops in case of corrupt hierarchical data
    for (let i = 0; i < 20; i++) {
      if (!currentId) break;
      const folder = await prisma.folder.findUnique({ where: { id: currentId } });
      if (!folder) break;
      
      breadcrumbs.unshift({ id: folder.id, name: folder.name });
      if (!folder.parentId) break;
      currentId = folder.parentId;
    }
    
    return NextResponse.json(breadcrumbs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch breadcrumbs" }, { status: 500 });
  }
}

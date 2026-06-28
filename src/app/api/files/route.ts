import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const recent = searchParams.get("recent") === "true";
    const type = searchParams.get("type");
    const folderId = searchParams.get("folderId");
    
    let where: any = { 
      isDeleted: false,
      name: { contains: q }
    };

    if (type === "image") where.mimeType = { startsWith: "image/" };
    if (type === "video") where.mimeType = { startsWith: "video/" };
    if (type === "document") {
      where.mimeType = {
        not: { startsWith: "image/" },
        AND: { mimeType: { not: { startsWith: "video/" } } }
      };
    }

    if (recent) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      where.createdAt = { gte: sevenDaysAgo };
    } else if (folderId !== null && !q && !type) {
      // Only filter by folder if not searching, filtering, or viewing recent
      where.folderId = folderId === "root" ? null : folderId;
    }
    
    const files = await prisma.file.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(files);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

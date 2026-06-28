import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get("parentId") || null;
    
    const folders = await prisma.folder.findMany({ 
      where: { parentId },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(folders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, parentId } = await req.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const folder = await prisma.folder.create({ 
      data: { 
        name, 
        parentId: parentId || null 
      } 
    });
    
    return NextResponse.json(folder);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

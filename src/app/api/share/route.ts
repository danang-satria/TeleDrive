import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileId, folderId } = body;

    if (!fileId && !folderId) {
      return new NextResponse("ID required", { status: 400 });
    }
    
    // Check if already shared
    let link = await prisma.sharedLink.findFirst({ 
      where: fileId ? { fileId } : { folderId } 
    });
    
    if (!link) {
      // Generate 6 character random string (Base62)
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let shortId = '';
      for (let i = 0; i < 6; i++) {
        shortId += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      link = await prisma.sharedLink.create({
        data: { 
          id: shortId,
          ...(fileId ? { fileId } : { folderId })
        }
      });
    }

    return NextResponse.json({ success: true, url: `/share/${link.id}` });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate link" }, { status: 500 });
  }
}

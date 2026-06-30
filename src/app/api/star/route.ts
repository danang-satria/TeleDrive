import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  try {
    const session = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, type, isStarred } = await req.json();

    if (!id || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (type === "file") {
      await prisma.file.update({
        where: { id },
        data: { isStarred }
      });
    } else if (type === "folder") {
      await prisma.folder.update({
        where: { id },
        data: { isStarred }
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, isStarred });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update star status" }, { status: 500 });
  }
}

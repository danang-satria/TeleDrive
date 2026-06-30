import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const link = await prisma.sharedLink.findUnique({
      where: { id: params.id },
      include: { file: true, folder: true }
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch link data" }, { status: 500 });
  }
}

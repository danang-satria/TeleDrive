import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const agg = await prisma.file.aggregate({
      _sum: { size: true },
      _count: { id: true },
      where: { isDeleted: false }
    });

    return NextResponse.json({
      totalSize: agg._sum.size || 0,
      totalFiles: agg._count.id || 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

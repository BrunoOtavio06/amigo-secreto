import { NextRequest, NextResponse } from "next/server";
import { getDrawing } from "@/lib/storage-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ drawingId: string }> }
) {
  try {
    const { drawingId } = await params;

    if (!drawingId) {
      return NextResponse.json(
        { error: "drawingId parameter required" },
        { status: 400 }
      );
    }

    const drawing = await getDrawing(drawingId);

    if (!drawing) {
      return NextResponse.json(
        { error: "Drawing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ drawingId, ...drawing });
  } catch (error) {
    console.error("Error retrieving drawing:", error);
    return NextResponse.json(
      { error: "Failed to retrieve drawing" },
      { status: 500 }
    );
  }
}

